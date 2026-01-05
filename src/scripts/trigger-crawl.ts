
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { JobCrawlerService } from '../modules/job-crawler/job-crawler.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const crawlerService = app.get(JobCrawlerService);

    const url = 'https://www.topcv.vn/brand/galaxydebt/tuyen-dung/tong-dai-vien-thu-hoi-no-cham-soc-khach-hang-thu-viec-100-luong-cung-thu-nhap-tu-15-30-trieu-nghi-co-dinh-chu-nhat-j1769353.html?ta_source=BoxAttractiveJob_LinkDetail';

    console.log('Triggering crawl for:', url);
    await crawlerService.crawlSpecificUrl(url);
    console.log('Done');

    await app.close();
}
bootstrap();
