import { Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';

@Injectable()
export class CoverLetterRendererService {
  /**
   * Render HTML Cover Letter based on content and template
   */
  render(content: string, templateName: string = 'modern'): string {
    const templateFn = this.getTemplate(templateName);
    return templateFn({ content });
  }

  /**
   * Get list of available templates
   */
  getAvailableTemplates() {
    return [{ id: 'modern', name: 'Modern', type: 'free' }];
  }

  private getTemplate(name: string): HandlebarsTemplateDelegate {
    let source = '';

    switch (name) {
      case 'modern':
      default:
        source = this.modernTemplate();
        break;
    }

    return handlebars.compile(source);
  }

  private modernTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: 'Helvetica', 'Arial', sans-serif; 
      line-height: 1.6; 
      color: #333; 
      max-width: 800px; 
      margin: 40px auto; 
      padding: 20px; 
      white-space: pre-wrap; 
    }
    .content {
      font-size: 11pt;
      color: #1a1a1a;
    }
  </style>
</head>
<body>
  <div class="content">
{{{content}}}
  </div>
</body>
</html>
    `;
  }
}
