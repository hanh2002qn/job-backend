import { Injectable } from '@nestjs/common';
import { CvService } from '../cv/cv.service';
import { ExportCvDto, ExportFormat } from './dto/export-cv.dto';
import { PdfService } from '../cv/services/pdf.service';
import { CvRendererService } from '../cv/services/cv-renderer.service';
import { TrackerService } from '../tracker/tracker.service';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import type { CvContent } from '../cv/interfaces/cv.interface';

interface CvForExport {
  id: string;
  content: CvContent;
  template: string;
}

@Injectable()
export class ExportService {
  constructor(
    private readonly cvService: CvService,
    private readonly pdfService: PdfService,
    private readonly cvRendererService: CvRendererService,
    private readonly trackerService: TrackerService,
  ) {}

  async exportCv(userId: string, exportDto: ExportCvDto) {
    const cv = await this.cvService.findOne(userId, exportDto.cvId);

    if (exportDto.format === ExportFormat.PDF) {
      const html = this.cvRendererService.render(cv.content, cv.template);
      const buffer = await this.pdfService.generatePdf(html);
      return {
        buffer,
        filename: `cv-${cv.id}.pdf`,
        contentType: 'application/pdf',
      };
    } else {
      const buffer = await this.generateDocx(cv);
      return {
        buffer,
        filename: `cv-${cv.id}.docx`,
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
    }
  }

  async exportTrackerCsv(userId: string) {
    const trackers = await this.trackerService.findAll(userId);

    const headers = ['Company', 'Title', 'Status', 'Applied At', 'Notes'];
    const rows = trackers.map((t) => [
      t.job?.company || t.manualCompany || '',
      t.job?.title || t.manualTitle || '',
      t.status,
      t.appliedAt ? t.appliedAt.toISOString() : '',
      (t.notes || '').replace(/"/g, '""'), // Escape quotes
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return {
      buffer: Buffer.from(csvContent),
      filename: `job-tracker-${userId}.csv`,
      contentType: 'text/csv',
    };
  }

  private async generateDocx(cv: CvForExport): Promise<Buffer> {
    const content = cv.content;
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: content.personalInfo?.fullName ?? '',
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun(
                  `${content.personalInfo?.email ?? ''} | ${content.personalInfo?.phone ?? ''}`,
                ),
              ],
            }),
            new Paragraph({
              text: 'Professional Summary',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400 },
            }),
            new Paragraph({
              text: content.summary ?? '',
            }),
            // Experience
            new Paragraph({
              text: 'Experience',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400 },
            }),
            ...(content.experience ?? []).flatMap((exp) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${exp.role ?? exp.title ?? ''} at ${exp.company ?? ''}`,
                    bold: true,
                  }),
                  new TextRun({
                    text: ` (${exp.startDate ?? ''} - ${exp.endDate ?? ''})`,
                    italics: true,
                  }),
                ],
              }),
              ...(exp.achievements ?? []).map(
                (a: string) =>
                  new Paragraph({
                    text: a,
                    bullet: { level: 0 },
                  }),
              ),
            ]),
            // Skills
            new Paragraph({
              text: 'Skills',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400 },
            }),
            new Paragraph({
              text: (content.skills ?? []).join(', '),
            }),
          ],
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }
}
