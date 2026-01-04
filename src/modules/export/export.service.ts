import { Injectable, NotFoundException } from '@nestjs/common';
import { CvService } from '../cv/cv.service';
import { ExportCvDto } from './dto/export-cv.dto';

@Injectable()
export class ExportService {
    constructor(private readonly cvService: CvService) { }

    async exportCv(userId: string, exportDto: ExportCvDto) {
        const cvs = await this.cvService.findAll(userId);
        const cv = cvs.find((c) => c.id === exportDto.cvId);

        if (!cv) {
            throw new NotFoundException('CV not found');
        }

        // MOCK EXPORT LOGIC
        // In reality, use libraries like 'pdfkit' or 'docx'
        return {
            filename: `cv-${cv.id}.${exportDto.format}`,
            fileUrl: `https://mock-storage.com/${userId}/cv/${cv.id}.${exportDto.format}`,
            format: exportDto.format,
        };
    }
}
