import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Cluster } from 'puppeteer-cluster';
import { FolhaEditorialScraper } from '../scrappers/folha-editorial.scraper';
import { EditorialRepository } from 'src/shared/database/repositories/editorials.repository';
import { Editorial } from 'src/shared/database/schemas/editorial.schema';
import { RabbitMQService } from 'src/shared/messaging/services/rabbitmq.service';
import { ArticlesRepository } from 'src/shared/database/repositories/articles.repository';
import { FOLHA_DE_SP_CODE } from '../types';

@Injectable()
export class GetEditorialsAndArticlesUseCase implements OnModuleDestroy {
  private cluster: Cluster;
  private readonly logger = new Logger(GetEditorialsAndArticlesUseCase.name);

  constructor(
    private readonly folhaEditorialScraper: FolhaEditorialScraper,
    private readonly editorialsRepository: EditorialRepository,
    private readonly articlesRepository: ArticlesRepository,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  public async execute() {
    try {
      await this.initCluster();
      await this.scrapeEditorials();
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
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    // Configuração da tarefa de scraping no cluster
    this.cluster.task(
      async ({ page, data: editorial }: { page: any; data: Editorial }) => {
        try {
          // Usa o link do editorial para realizar o scraping
          const scrapeResult = await this.folhaEditorialScraper.scrape(
            page,
            editorial.link,
          );

          console.log(scrapeResult);

          // Salva os artigos na fila do RabbitMQ usando o RabbitMQService
          await this.sendArticlesToQueue(scrapeResult.articles);

          // Atualiza o editorial no banco de dados, se necessário
          await this.updateEditorial(editorial);

          this.logger.log(
            `Scraping completo para o editorial: ${editorial.title}`,
          );
        } catch (error) {
          this.logger.error(
            `Erro no scraping do editorial ${editorial.title}:`,
            error,
          );
        }
      },
    );
  }

  private async scrapeEditorials() {
    this.logger.log('Buscando editoriais no banco de dados...');
    const editorials =
      await this.editorialsRepository.findByNewspaperCode(FOLHA_DE_SP_CODE);

    this.logger.log(
      `Encontrados ${editorials.length} editoriais. Enfileirando tarefas de scraping...`,
    );
    for (const editorial of editorials) {
      this.cluster.queue(editorial);
    }
  }

  // Método para enviar artigos para a fila do RabbitMQ usando o RabbitMQService
  private async sendArticlesToQueue(articles: any[]) {
    for (const article of articles) {
      // await this.rabbitMQService.send('articles-queue', article); // Usando o RabbitMQService para enviar para a fila
      this.logger.log(`Artigo enfileirado: ${article.title}`);
    }
  }

  // Método para atualizar o editorial no banco de dados
  private async updateEditorial(editorial: Editorial) {
    editorial.lastScrapedAt = new Date();

    await this.editorialsRepository.update(editorial._id.toString(), editorial);
    this.logger.log(`Editorial atualizado: ${editorial.title}`);
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
