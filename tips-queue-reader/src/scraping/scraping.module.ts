import { Module } from '@nestjs/common';
import { ScraperService } from './newspaper/services/scraper.service';
import { GenericScraperService } from './newspaper/scrapers/generic.scraper';
import { FolhaScrapper } from './newspaper/scrapers/folha.scraper';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  providers: [
    ScraperService,
    GenericScraperService, // Serviço genérico de scraping, gerencia instâncias do Puppeteer
    FolhaScrapper, // Scraper específico para o New York Times
  ],
  exports: [ScraperService], // Exporta o ScraperService para uso em outros módulos
  imports: [DatabaseModule],
})
export class ScrapingModule {}
