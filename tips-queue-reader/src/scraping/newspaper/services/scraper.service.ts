import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Cluster } from 'puppeteer-cluster';
import { FolhaScrapper } from '../scrapers/folha.scraper';
import { NewsRepository } from 'src/database/repositories/news.repository';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ScraperService implements OnModuleDestroy {
  private cluster: Cluster;
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    private readonly folhaScraper: FolhaScrapper,
    private readonly newsRepository: NewsRepository,
  ) {
    console.log('ScraperService constructor');
    this.handleCron();
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM) // Define a tarefa cron para rodar diariamente às 4h da manhã
  public async handleCron() {
    this.logger.log('Iniciando o scraping diário dos jornais...');
    await this.initAndExecuteScraping();
  }

  private async initAndExecuteScraping() {
    try {
      await this.initCluster();
      await this.scrapeNewspapers();
    } catch (error) {
      this.logger.error('Erro durante o processo de scraping:', error);
    } finally {
      await this.closeCluster();
    }
  }

  private async initCluster() {
    this.cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 5,
      puppeteerOptions: {
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    // Configuração da tarefa de scraping no cluster
    this.cluster.task(async ({ page, data: scraper }) => {
      const data = await scraper.scrape(page);
      await this.saveData(data);
    });
  }

  private async scrapeNewspapers() {
    this.logger.log('Enfileirando tarefas de scraping...');
    this.cluster.queue(this.folhaScraper);
  }

  // Método para salvar dados usando o repositório de notícias
  private async saveData(data: any) {
    try {
      await this.newsRepository.create(data);
      this.logger.log(`Dados salvos com sucesso para: ${data.title}`);
    } catch (error) {
      this.logger.error(
        'Erro ao salvar dados no repositório de notícias:',
        error,
      );
    }
  }

  // Fechar o cluster após completar as tarefas
  private async closeCluster() {
    if (this.cluster) {
      await this.cluster.idle();
      await this.cluster.close();
      this.logger.log('Cluster fechado com sucesso.');
    }
  }

  onModuleDestroy() {
    this.closeCluster();
  }
}
