import { Controller } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';
import { GetEditorialsAndArticlesUseCase } from '../use-cases/get-editorials-use-case.service';

@Controller('folha-de-sp')
export class FolhaDeSpController {
  private readonly logger = new Logger(FolhaDeSpController.name);

  constructor(
    private readonly getEditorialsAndArticlesUseCase: GetEditorialsAndArticlesUseCase,
  ) {
    this.handleScheduledScraping();
  }

  // Agendando o scraping para rodar diariamente às 3:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleScheduledScraping() {
    this.logger.log('Executando scraping agendado às 3:00 AM...');
    try {
      await this.getEditorialsAndArticlesUseCase.execute();
      this.logger.log('Scraping concluído com sucesso!');
    } catch (error) {
      this.logger.error('Erro ao executar scraping agendado:', error);
    }
  }
}
