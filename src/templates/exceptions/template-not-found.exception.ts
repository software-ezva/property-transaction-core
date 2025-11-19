export class TemplateNotFoundException extends Error {
  public readonly templateId: string;

  constructor(templateId: string) {
    super('Workflow template not found');
    this.name = 'TemplateNotFoundException';
    this.templateId = templateId;
  }
}
