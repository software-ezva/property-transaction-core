export class TemplateNotFoundException extends Error {
  constructor(templateId: string) {
    super(`Workflow template not found with ID: ${templateId}`);
    this.name = 'TemplateNotFoundException';
  }
}
