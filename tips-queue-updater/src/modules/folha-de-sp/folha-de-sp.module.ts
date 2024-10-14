import { Module } from '@nestjs/common';
import { FolhaDeSpController } from './controllers/folha-de-sp.controller';
import { GetEditorialsAndArticlesUseCase } from './use-cases/get-editorials-use-case.service';
import { DatabaseModule } from 'src/shared/database/database.module';
import { MessagingModule } from 'src/shared/messaging/messaging.module';
import { FolhaEditorialScraper } from './scrappers/folha-editorial.scraper';

@Module({
  providers: [GetEditorialsAndArticlesUseCase, FolhaEditorialScraper],
  controllers: [FolhaDeSpController],
  imports: [DatabaseModule, MessagingModule],
})
export class FolhaDeSpModule {}
