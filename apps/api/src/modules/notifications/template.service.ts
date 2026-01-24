import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);
  private readonly templateCache = new Map<
    string,
    HandlebarsTemplateDelegate
  >();
  private readonly templateDir = path.join(
    process.cwd(),
    'src/modules/notifications/templates',
  );

  constructor() {
    this.logger.log(`Template directory: ${this.templateDir}`);
    this.registerPartials();
  }

  private registerPartials() {
    try {
      const layoutPath = path.join(this.templateDir, 'email', 'layout.html');
      if (fs.existsSync(layoutPath)) {
        const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
        handlebars.registerPartial('layout', layoutContent);
        this.logger.log('Registered email layout partial');
      }
    } catch (error) {
      this.logger.warn('Failed to register email layout partial', error);
    }
  }

  getTemplate(
    name: string,
    type: 'email' | 'sms',
    format: 'html' | 'txt' = 'html',
  ): HandlebarsTemplateDelegate {
    const templateKey = `${type}/${name}.${format}`;

    // Return cached template if available (in production)
    if (
      process.env.NODE_ENV === 'production' &&
      this.templateCache.has(templateKey)
    ) {
      return this.templateCache.get(templateKey)!;
    }

    try {
      const filePath = path.join(this.templateDir, type, `${name}.${format}`);
      const templateContent = fs.readFileSync(filePath, 'utf-8');
      const compiledTemplate = handlebars.compile(templateContent);

      if (process.env.NODE_ENV === 'production') {
        this.templateCache.set(templateKey, compiledTemplate);
      }

      return compiledTemplate;
    } catch (error) {
      this.logger.error(`Error loading template: ${templateKey}`, error);
      throw new Error(`Template not found: ${templateKey}`);
    }
  }

  render(
    name: string,
    type: 'email' | 'sms',
    data: Record<string, any>,
    format: 'html' | 'txt' = 'html',
  ): string {
    const template = this.getTemplate(name, type, format);
    return template(data);
  }
}
