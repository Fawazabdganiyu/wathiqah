import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionInput } from './dto/create-transaction.input';
import { AddWitnessInput } from './dto/add-witness.input';
import { UpdateTransactionInput } from './dto/update-transaction.input';
import {
  AssetCategory,
  WitnessStatus,
  Prisma,
  Witness,
} from '../../generated/prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { hashToken } from '../../common/utils/crypto.utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import ms, { type StringValue } from 'ms';
import { WitnessInviteInput } from '../witnesses/dto/witness-invite.input';
import { NotificationService } from '../notifications/notification.service';
import { splitName } from '../../common/utils/string.utils';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly notificationService: NotificationService,
  ) {}

  private async processWitnesses(
    transactionId: string,
    witnessUserIds: string[] | undefined,
    witnessInvites: WitnessInviteInput[] | undefined,
    prisma: Prisma.TransactionClient,
  ) {
    // Handle existing users as witnesses
    if (witnessUserIds && witnessUserIds.length > 0) {
      const witnesses = await prisma.witness.createManyAndReturn({
        data: witnessUserIds.map((witnessUserId) => ({
          transactionId,
          userId: witnessUserId,
          status: WitnessStatus.PENDING,
        })),
        skipDuplicates: true,
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
        },
      });

      for (const witness of witnesses) {
        const rawToken = uuidv4();
        const hashedToken = hashToken(rawToken);

        await this.cacheManager.set(
          `invite:${hashedToken}`,
          witness.id,
          ms(
            this.configService.getOrThrow<string>(
              'auth.inviteTokenExpiry',
            ) as StringValue,
          ),
        );

        await this.notificationService.sendTransactionWitnessInvite(
          witness.user.email,
          witness.user.firstName,
          rawToken,
          witness.user.phoneNumber,
        );
      }
    }

    // Handle new user invites
    if (witnessInvites && witnessInvites.length > 0) {
      for (const invite of witnessInvites) {
        // Check if user already exists by email
        let user = await prisma.user.findUnique({
          where: { email: invite.email },
        });

        // If not, create a placeholder user
        if (!user) {
          const { firstName, lastName } = splitName(invite.name);
          user = await prisma.user.create({
            data: {
              email: invite.email,
              firstName,
              lastName,
              phoneNumber: invite.phoneNumber,
              passwordHash: null, // Indicates invited user
            },
          });
        }

        // Check if witness record already exists
        const existingWitness = await prisma.witness.findUnique({
          where: {
            transactionId_userId: {
              transactionId,
              userId: user.id,
            },
          },
        });

        let witness: Witness = undefined;
        if (!existingWitness) {
          // Create witness record WITHOUT invite token first (we'll store it in Redis)
          witness = await prisma.witness.create({
            data: {
              transactionId,
              userId: user.id,
              status: WitnessStatus.PENDING,
            },
          });
        } else if (
          existingWitness &&
          existingWitness.status === WitnessStatus.PENDING
        ) {
          // Check if we have a valid phone number from the User record if not in invite
          // We need to retrieve the existing token or create a new one if it expired.
          // Since we don't easily have the token if it's hashed in Redis,
          // simplest for re-invite is to generate a new token.
        }
        // Generate secure token and hash it
        const rawToken = uuidv4();
        const hashedToken = hashToken(rawToken);

        // Store in Redis: `invite:{hashedToken}` -> `witnessId`
        // TTL: 7 days (604800000 ms) by default
        await this.cacheManager.set(
          `invite:${hashedToken}`,
          witness.id || existingWitness.id,
          ms(
            this.configService.getOrThrow<string>(
              'auth.inviteTokenExpiry',
            ) as StringValue,
          ),
        );

        const targetPhoneNumber = invite.phoneNumber || user.phoneNumber;
        const targetEmail = invite.email || user.email;
        const { firstName } = splitName(invite.name);
        const targetName = firstName || user.firstName;

        await this.notificationService.sendTransactionWitnessInvite(
          targetEmail,
          targetName,
          rawToken,
          targetPhoneNumber,
        );

        await this.notificationService.sendTransactionWitnessInvite(
          targetEmail,
          targetName,
          rawToken,
          targetPhoneNumber,
        );
      }
    }
  }

  async create(createTransactionInput: CreateTransactionInput, userId: string) {
    const {
      category,
      amount,
      itemName,
      quantity,
      witnessUserIds,
      witnessInvites,
      ...rest
    } = createTransactionInput;

    // Validation logic for category
    if (category === AssetCategory.FUNDS && !amount) {
      throw new BadRequestException(
        'Amount is required for financial transactions',
      );
    }

    if (category === AssetCategory.ITEM && !itemName) {
      throw new BadRequestException(
        'Item name is required for physical item tracking',
      );
    }

    // Start a transaction to ensure all witness records are created or nothing is
    const transaction = await this.prisma.$transaction(async (prisma) => {
      const transaction = await prisma.transaction.create({
        data: {
          category,
          amount,
          itemName,
          quantity: category === AssetCategory.ITEM ? quantity : null,
          createdById: userId,
          ...rest,
        },
      });

      await this.processWitnesses(
        transaction.id,
        witnessUserIds,
        witnessInvites,
        prisma,
      );

      return transaction;
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await this.notificationService.sendTransactionCreatedEmail(
        user.email,
        user.firstName,
      );
    }

    return transaction;
  }

  async addWitness(addWitnessInput: AddWitnessInput, userId: string) {
    const { transactionId, witnessUserIds, witnessInvites } = addWitnessInput;

    const transaction = await this.findOne(transactionId, userId);

    return this.prisma.$transaction(async (prisma) => {
      await this.processWitnesses(
        transaction.id,
        witnessUserIds,
        witnessInvites,
        prisma,
      );

      // Return updated transaction with witnesses
      return prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          witnesses: {
            include: {
              user: true,
            },
          },
        },
      });
    });
  }

  async findAll(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [
          { createdById: userId },
          // (Future) Transactions where user is a contact or witness
        ],
      },
      include: {
        contact: true,
        witnesses: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        witnesses: true,
        history: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    if (transaction.createdById !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this transaction',
      );
    }

    return transaction;
  }

  async update(
    id: string,
    updateTransactionInput: UpdateTransactionInput,
    userId: string,
  ) {
    const transaction = await this.findOne(id, userId);

    // Create audit log entry
    const previousState = {
      category: transaction.category,
      amount: transaction.amount,
      itemName: transaction.itemName,
      quantity: transaction.quantity,
      type: transaction.type,
      date: transaction.date,
      description: transaction.description,
      contactId: transaction.contactId,
    };

    // Business Rule: Check if any witness has acknowledged
    const hasAcknowledgedWitness = transaction.witnesses.some(
      (w) => w.status === WitnessStatus.ACKNOWLEDGED,
    );

    if (hasAcknowledgedWitness) {
      // Logic for post-acknowledgement update:
      // Mark witnesses as MODIFIED instead of PENDING to indicate an update occurred
      await this.prisma.witness.updateMany({
        where: { transactionId: id },
        data: {
          status: WitnessStatus.MODIFIED,
          acknowledgedAt: null,
        },
      });
    }

    const {
      category,
      amount,
      itemName,
      quantity,
      witnessUserIds, // Destructure to exclude from rest
      witnessInvites, // Destructure to exclude from rest
      ...rest
    } = updateTransactionInput;

    // Re-validate category constraints if they are being updated
    if (category === AssetCategory.FUNDS && !amount && !transaction.amount) {
      // Note: This check is simplified; ideally check if 'amount' is in input OR exists in DB.
      // For PartialType, undefined means "do not update".
    }

    // Determine what actually changed for the history log
    const changes: any = {};
    if (category && category !== transaction.category)
      changes.category = category;
    if (amount && Number(amount) !== Number(transaction.amount))
      changes.amount = amount;
    if (itemName && itemName !== transaction.itemName)
      changes.itemName = itemName;
    if (quantity && quantity !== transaction.quantity)
      changes.quantity = quantity;
    if (rest.description && rest.description !== transaction.description)
      changes.description = rest.description;
    if (
      rest.date &&
      new Date(rest.date).getTime() !== new Date(transaction.date).getTime()
    )
      changes.date = rest.date;
    if (rest.type && rest.type !== transaction.type) changes.type = rest.type;
    if (rest.contactId && rest.contactId !== transaction.contactId)
      changes.contactId = rest.contactId;

    // Perform update and create history record in a transaction
    const [updatedTransaction] = await this.prisma.$transaction([
      this.prisma.transaction.update({
        where: { id },
        data: {
          ...(category && { category }),
          ...(amount && { amount }),
          ...(itemName && { itemName }),
          ...(quantity && { quantity }),
          ...rest,
        },
      }),
      this.prisma.transactionHistory.create({
        data: {
          transactionId: id,
          userId,
          changeType: hasAcknowledgedWitness ? 'UPDATE_POST_ACK' : 'UPDATE',
          previousState: previousState as any,
          newState: changes,
        },
      }),
    ]);

    return updatedTransaction;
  }
}
