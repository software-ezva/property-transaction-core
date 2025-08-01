export class TemplateInUseException extends Error {
  constructor(templateId: string, usageContext: string) {
    super(
      `Template ${templateId} cannot be deleted because it is in use: ${usageContext}`,
    );
    this.name = 'TemplateInUseException';
  }
}
