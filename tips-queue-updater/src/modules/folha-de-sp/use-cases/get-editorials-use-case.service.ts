import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Cluster } from 'puppeteer-cluster';
import { FolhaEditorialScraper } from '../scrappers/folha-editorial.scraper';
import { EditorialRepository } from 'src/shared/database/repositories/editorials.repository';
import { Editorial } from 'src/shared/database/schemas/editorial.schema';
import { RabbitMQService } from 'src/shared/messaging/services/rabbitmq.service';
import { FOLHA_DE_SP_CODE } from '../types';
import { Types } from 'mongoose';
import { getDateDaysAgo } from 'src/shared/utils/getDaysAgo';

@Injectable()
export class GetEditorialsAndArticlesUseCase implements OnModuleDestroy {
  private cluster: Cluster;
  private readonly logger = new Logger(GetEditorialsAndArticlesUseCase.name);

  constructor(
    private readonly folhaEditorialScraper: FolhaEditorialScraper,
    private readonly editorialRepository: EditorialRepository,
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

          // Adiciona novos editoriais ao banco de dados
          // await this.addEditorialsIfNotExist(
          //   scrapeResult.editorials,
          //   editorial.newspaperId,
          // );

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
    const editorials = await this.editorialRepository.findByNewspaperCode(
      FOLHA_DE_SP_CODE,
      getDateDaysAgo(1),
    );

    // Remover slice e adicionar concorrencia de acordo com o permitido pelo jornal para evitar banimento do IP
    this.logger.log(
      `Encontrados ${editorials.slice(0, 1).length} editoriais. Enfileirando tarefas de scraping...`,
    );

    // Remover slice e adicionar concorrencia de acordo com o permitido pelo jornal para evitar banimento do IP
    for (const editorial of editorials.slice(0, 1)) {
      this.cluster.queue(editorial);
    }
  }

  private async addEditorialsIfNotExist(
    editorialsData: any[],
    newspaperId: Types.ObjectId,
  ) {
    for (const editorialData of editorialsData) {
      const existingEditorial = await this.editorialRepository.findById(
        editorialData.id,
      );
      if (!existingEditorial) {
        const newEditorial = new Editorial();
        newEditorial.uuid = editorialData.id;
        newEditorial.title = editorialData.title;
        newEditorial.link = editorialData.link;
        newEditorial.newspaperId = newspaperId;

        await this.editorialRepository.create(newEditorial);
        this.logger.log(
          `Editorial adicionado ao banco de dados: ${newEditorial.title}`,
        );
      } else {
        this.logger.log(
          `Editorial já existe no banco de dados: ${existingEditorial.title}`,
        );
      }
    }
  }

  // Método para enviar artigos para a fila do RabbitMQ usando o RabbitMQService
  private async sendArticlesToQueue(articles: any[]) {
    for (const article of articles) {
      await this.rabbitMQService.send('articles-queue', article); // Usando o RabbitMQService para enviar para a fila
      this.logger.log(`Artigo enfileirado: ${article.title}`);
    }
  }

  // Método para atualizar o editorial no banco de dados
  private async updateEditorial(editorial: Editorial) {
    editorial.lastScrapedAt = new Date();

    await this.editorialRepository.update(editorial._id.toString(), editorial);
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
