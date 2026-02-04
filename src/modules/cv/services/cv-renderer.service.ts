import { Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';
import { CvContent } from '../interfaces/cv.interface';

@Injectable()
export class CvRendererService {
  /**
   * Render HTML CV based on content and template
   */
  render(content: CvContent, templateName: string = 'modern'): string {
    const templateFn = this.getTemplate(templateName);
    return templateFn(content);
  }

  private getTemplate(name: string): HandlebarsTemplateDelegate {
    // Simple inline templates for now. In real apps, load from files.
    let source = '';

    switch (name) {
      case 'creative':
        source = this.creativeTemplate();
        break;
      case 'professional':
        source = this.professionalTemplate();
        break;
      case 'modern':
      default:
        source = this.modernTemplate();
        break;
    }

    return handlebars.compile(source);
  }

  // --- Templates (Simplified for brevity) ---

  private modernTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 20px; }
    h1 { margin: 0; color: #1e3a8a; }
    .contact { font-size: 0.9em; color: #666; margin-top: 5px; }
    h2 { color: #3b82f6; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-top: 30px; text-transform: uppercase; font-size: 1.1em; }
    .job { margin-bottom: 20px; }
    .job-header { display: flex; justify-content: space-between; font-weight: bold; }
    .company { color: #1f2937; }
    .date { color: #6b7280; font-size: 0.9em; }
    ul { padding-left: 20px; margin-top: 5px; }
    li { margin-bottom: 5px; }
    .skills { display: flex; flex-wrap: wrap; gap: 10px; }
    .skill { background: #eff6ff; color: #1e40af; pxadding: 4px 8px; border-radius: 4px; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{personalInfo.fullName}}</h1>
    <div class="contact">
      {{personalInfo.email}} | {{personalInfo.phone}}
      {{#if personalInfo.linkedin}} | {{personalInfo.linkedin}}{{/if}}
      {{#if personalInfo.portfolio}} | {{personalInfo.portfolio}}{{/if}}
    </div>
  </div>

  <div class="summary">
    <h2>Professional Summary</h2>
    <p>{{summary}}</p>
  </div>

  <div class="experience">
    <h2>Experience</h2>
    {{#each experience}}
    <div class="job">
      <div class="job-header">
        <span class="role">{{position}}</span>
        <span class="date">{{startDate}} - {{endDate}}</span>
      </div>
      <div class="company">{{company}}</div>
      <ul>
        {{#each achievements}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
    </div>
    {{/each}}
  </div>

  <div class="education">
    <h2>Education</h2>
    {{#each education}}
    <div class="job">
      <div class="job-header">
        <span class="role">{{degree}}</span>
        <span class="date">{{startDate}} - {{endDate}}</span>
      </div>
      <div class="company">{{school}}</div>
    </div>
    {{/each}}
  </div>

  <div class="skills-section">
    <h2>Skills</h2>
    <div class="skills">
      {{#each skills}}
      <span class="skill">{{this}}</span>
      {{/each}}
    </div>
  </div>
</body>
</html>
    `;
  }

  private professionalTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Georgia', serif; line-height: 1.5; color: #000; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
    h1 { margin: 0; text-transform: uppercase; font-size: 24px; }
    .contact { font-size: 0.9em; margin-top: 5px; }
    h2 { text-transform: uppercase; font-size: 14px; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-top: 25px; }
    .job { margin-bottom: 15px; }
    .job-header { font-weight: bold; }
    .date { float: right; }
    ul { margin-top: 5px; padding-left: 18px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{personalInfo.fullName}}</h1>
    <div class="contact">
      {{personalInfo.email}} • {{personalInfo.phone}}
      {{#if personalInfo.linkedin}} • {{personalInfo.linkedin}}{{/if}}
    </div>
  </div>

  <h2>Summary</h2>
  <p>{{summary}}</p>

  <h2>Experience</h2>
  {{#each experience}}
  <div class="job">
    <div class="job-header">
      {{company}} - {{position}}
      <span class="date">{{startDate}} - {{endDate}}</span>
    </div>
    <ul>
      {{#each achievements}}
      <li>{{this}}</li>
      {{/each}}
    </ul>
  </div>
  {{/each}}

  <h2>Education</h2>
  {{#each education}}
  <div class="job">
    <div class="job-header">
      {{school}} - {{degree}}
      <span class="date">{{startDate}} - {{endDate}}</span>
    </div>
  </div>
  {{/each}}

  <h2>Skills</h2>
  <p>{{#each skills}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}</p>
</body>
</html>
    `;
  }

  private creativeTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Futura', 'Trebuchet MS', sans-serif; line-height: 1.6; color: #444; max-width: 800px; margin: 0 auto; display: flex; }
    .sidebar { width: 30%; background: #2d3748; color: white; padding: 20px; height: 100vh; }
    .main { width: 70%; padding: 20px; }
    h1 { margin: 0; font-size: 2em; line-height: 1.1; }
    .contact { font-size: 0.8em; margin-top: 20px; }
    .contact div { margin-bottom: 5px; }
    h2 { color: #2d3748; text-transform: uppercase; letter-spacing: 1px; font-size: 1.2em; border-bottom: 2px solid #ecc94b; display: inline-block; margin-top: 30px; }
    .sidebar h2 { color: #ecc94b; border-bottom: none; margin-top: 0; }
    .job { margin-bottom: 20px; }
    .job-title { font-weight: bold; font-size: 1.1em; color: #2d3748; }
    .company { color: #718096; font-style: italic; }
  </style>
</head>
<body>
  <div class="sidebar">
    <h1>{{personalInfo.fullName}}</h1>
    
    <div class="contact">
      <div>{{personalInfo.phone}}</div>
      <div>{{personalInfo.email}}</div>
      {{#if personalInfo.linkedin}}<div>{{personalInfo.linkedin}}</div>{{/if}}
      {{#if personalInfo.portfolio}}<div>{{personalInfo.portfolio}}</div>{{/if}}
    </div>

    <div style="margin-top: 40px;">
      <h2>Skills</h2>
      <ul style="padding-left: 15px; margin-top: 10px;">
        {{#each skills}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
    </div>
  </div>

  <div class="main">
    <div class="summary">
      <h2>Profile</h2>
      <p>{{summary}}</p>
    </div>

    <div class="experience">
      <h2>Experience</h2>
      {{#each experience}}
      <div class="job">
        <div class="job-title">{{position}}</div>
        <div class="company">{{company}} | {{startDate}} - {{endDate}}</div>
        <ul>
          {{#each achievements}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
      </div>
      {{/each}}
    </div>

    <div class="education">
      <h2>Education</h2>
      {{#each education}}
      <div class="job">
        <div class="job-title">{{degree}}</div>
        <div class="company">{{school}} | {{startDate}} - {{endDate}}</div>
      </div>
      {{/each}}
    </div>
  </div>
</body>
</html>
    `;
  }
}
