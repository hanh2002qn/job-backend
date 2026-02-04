import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { ConfigModule } from '@nestjs/config';
import { EmailPreference } from './entities/email-preference.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([EmailPreference]), ConfigModule],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
