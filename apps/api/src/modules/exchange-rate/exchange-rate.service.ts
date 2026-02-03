import {
  Injectable,
  Logger,
  Inject,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class ExchangeRateService implements OnModuleInit {
  private readonly logger = new Logger(ExchangeRateService.name);
  private readonly baseCurrency = 'USD'; // Standard base for cross-rates
  private readonly supportedCurrencies = [
    'NGN',
    'USD',
    'EUR',
    'GBP',
    'CAD',
    'AED',
    'SAR',
  ];

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async onModuleInit() {
    await this.updateRates();
  }

  @Cron(CronExpression.EVERY_2ND_HOUR)
  async handleCron() {
    this.logger.log('Starting scheduled exchange rate update');
    await this.updateRates();
  }

  /**
   * Fetches latest rates from provider and updates database & cache
   */
  async updateRates() {
    const providers = [
      this.fetchFromOpenExchangeRates.bind(this),
      this.fetchFromExchangeRateApi.bind(this),
    ];

    let success = false;
    for (const fetcher of providers) {
      try {
        const { rates, provider } = await fetcher();
        if (rates && Object.keys(rates).length > 0) {
          await this.processRates(rates, provider);
          success = true;
          break;
        }
      } catch (error) {
        this.logger.warn(`Provider failed: ${error.message}`);
        continue;
      }
    }

    if (!success) {
      this.logger.error('All exchange rate providers failed');
    }
  }

  private async fetchFromExchangeRateApi() {
    const apiKey = this.configService.get<string>('fx.exchangeRate.apiKey');
    if (!apiKey) throw new Error('EXCHANGE_RATE_API_KEY missing');

    const baseUrl = this.configService.get<string>('fx.exchangeRate.baseUrl');
    const response = await axios.get(
      `${baseUrl}/${apiKey}/latest/${this.baseCurrency}`,
    );

    if (response.data.result !== 'success') {
      throw new Error(`API error: ${response.data['error-type']}`);
    }

    return {
      rates: response.data.conversion_rates,
      provider: 'ExchangeRate-API',
    };
  }

  private async fetchFromOpenExchangeRates() {
    const apiKey = this.configService.get<string>('fx.openExchange.appId');
    if (!apiKey) throw new Error('OPEN_EXCHANGE_RATES_APP_ID missing');

    const baseUrl = this.configService.get<string>('fx.openExchange.baseUrl');
    const response = await axios.get(
      `${baseUrl}/latest.json?app_id=${apiKey}&base=${this.baseCurrency}`,
    );

    if (!response.data || !response.data.rates) {
      throw new Error('Invalid response from Open Exchange Rates');
    }

    return {
      rates: response.data.rates,
      provider: 'Open Exchange Rates',
    };
  }

  private async processRates(rates: any, provider: string) {
    for (const currency of this.supportedCurrencies) {
      if (rates[currency]) {
        const rateValue = new Prisma.Decimal(rates[currency]);

        // Update current rates
        await this.prisma.exchangeRate.upsert({
          where: { from_to: { from: this.baseCurrency, to: currency } },
          update: {
            rate: rateValue,
            provider,
          },
          create: {
            from: this.baseCurrency,
            to: currency,
            rate: rateValue,
            provider,
          },
        });

        // Log history
        await this.prisma.exchangeRateHistory.create({
          data: {
            from: this.baseCurrency,
            to: currency,
            rate: rateValue,
            provider,
          },
        });

        // Cache the rate (TTL 1 hour)
        await this.cacheManager.set(
          `rate:${this.baseCurrency}:${currency}`,
          rateValue.toNumber(),
          3600000,
        );
      }
    }
    this.logger.log(`Exchange rates updated successfully via ${provider}`);
  }

  /**
   * Converts an amount from one currency to another
   */
  async convert(
    amount: number | Prisma.Decimal,
    from: string,
    to: string,
  ): Promise<number> {
    if (from === to)
      return typeof amount === 'number' ? amount : amount.toNumber();

    const rate = await this.getRate(from, to);
    const result = new Prisma.Decimal(amount.toString()).mul(rate);

    // Financial rounding (2 decimal places for most currencies)
    return result.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP).toNumber();
  }

  /**
   * Gets exchange rate between two currencies (uses USD as base if needed)
   */
  private async getRate(from: string, to: string): Promise<number> {
    if (from === to) return 1;

    // 1. Check direct rate from USD base
    if (from === this.baseCurrency) {
      return this.fetchRateFromDbOrCache(this.baseCurrency, to);
    }

    // 2. If converting TO USD base
    if (to === this.baseCurrency) {
      const rateToUsd = await this.fetchRateFromDbOrCache(
        this.baseCurrency,
        from,
      );
      return 1 / rateToUsd;
    }

    // 3. Cross-currency conversion (From -> USD -> To)
    const rateFromUsdToBase = await this.fetchRateFromDbOrCache(
      this.baseCurrency,
      from,
    );
    const rateFromUsdToTarget = await this.fetchRateFromDbOrCache(
      this.baseCurrency,
      to,
    );

    return rateFromUsdToTarget / rateFromUsdToBase;
  }

  private async fetchRateFromDbOrCache(
    from: string,
    to: string,
  ): Promise<number> {
    const cacheKey = `rate:${from}:${to}`;
    const cachedRate = await this.cacheManager.get<number>(cacheKey);
    if (cachedRate) return cachedRate;

    const dbRate = await this.prisma.exchangeRate.findUnique({
      where: { from_to: { from, to } },
    });

    if (!dbRate) {
      this.logger.error(`Exchange rate not found: ${from} to ${to}`);
      throw new InternalServerErrorException(
        `Exchange rate for ${to} is unavailable`,
      );
    }

    const rateValue = dbRate.rate.toNumber();
    await this.cacheManager.set(cacheKey, rateValue, 3600000);
    return rateValue;
  }
}
