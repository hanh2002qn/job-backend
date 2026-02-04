import { Injectable, Logger } from '@nestjs/common';
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Use stealth plugin
chromium.use(StealthPlugin());

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  /**
   * Generate PDF from HTML content
   */
  async generatePdf(html: string): Promise<Buffer> {
    this.logger.log('Generating PDF...');
    const browser = await chromium.launch({ headless: true });

    try {
      const page = await browser.newPage();

      // Set content
      await page.setContent(html, { waitUntil: 'networkidle' });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0px',
          bottom: '0px',
          left: '0px',
          right: '0px',
        },
      });

      this.logger.log(`PDF generated (${pdfBuffer.length} bytes)`);
      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Failed to generate PDF', error);
      throw error;
    } finally {
      await browser.close();
    }
  }
}
