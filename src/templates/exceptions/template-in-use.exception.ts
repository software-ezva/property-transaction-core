export class TemplateInUseException extends Error {
  public readonly templateId: string;
  public readonly usageContext: string;

  constructor(templateId: string, usageContext: string) {
    super('Template cannot be deleted because it is currently in use');
    this.name = 'TemplateInUseException';
    this.templateId = templateId;
    this.usageContext = usageContext;
  }
}
