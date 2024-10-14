# TIPS-queue-reader: Serviço para Escuta e Scraping de Notícias

O **TIPS-queue-reader** é um novo serviço criado para processar mensagens de uma fila do RabbitMQ. Este serviço é responsável por escutar os links dos artigos enviados pela fila do **TIPS-queue-updater**, realizar o scraping do conteúdo da notícia e armazenar as informações coletadas no banco de dados MongoDB. O projeto será estruturado utilizando **NestJS**, seguindo a mesma arquitetura modular e as boas práticas do projeto **TIPS-queue-updater**.

## Estrutura do Projeto

```
tips-queue-reader/
├── src/
│   ├── controllers/
│   │   └── articles.controller.ts
│   ├── scrappers/
│   │   └── article.scraper.ts
│   ├── services/
│   │   └── rabbitmq.listener.service.ts
│   ├── repositories/
│   │   └── articles.repository.ts
│   ├── schemas/
│   │   └── article.schema.ts
│   ├── app.module.ts
│   └── main.ts
├── .env
├── package.json
└── README.md
```

## Componentes do Projeto

### 1. RabbitMQ Listener Service

Este serviço é responsável por se conectar à fila do RabbitMQ e processar cada mensagem recebida. Cada mensagem conterá o link do artigo que deve ser processado. O serviço utilizará o **amqp-connection-manager** para gerenciar a conexão com a fila.

**rabbitmq.listener.service.ts**:

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { connect, ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { ArticleScraper } from '../scrappers/article.scraper';
import { ArticlesRepository } from '../repositories/articles.repository';

@Injectable()
export class RabbitMQListenerService implements OnModuleInit {
  private channel: ChannelWrapper;

  constructor(
    private readonly articleScraper: ArticleScraper,
    private readonly articlesRepository: ArticlesRepository,
  ) {}

  async onModuleInit() {
    const connection = connect([process.env.RABBITMQ_URL]);
    this.channel = connection.createChannel({
      json: true,
      setup: (channel: ConfirmChannel) => channel.assertQueue('articles-queue'),
    });

    this.channel.consume('articles-queue', async (message) => {
      if (message) {
        const articleData = JSON.parse(message.content.toString());
        await this.processArticle(articleData);
        this.channel.ack(message);
      }
    });
  }

  private async processArticle(articleData: any) {
    try {
      const scrapedContent = await this.articleScraper.scrape(articleData.link);
      await this.articlesRepository.create({ ...articleData, content: scrapedContent });
    } catch (error) {
      console.error('Erro ao processar artigo:', error);
    }
  }
}
```

### 2. Article Scraper

Este componente é responsável por realizar o scraping do conteúdo da notícia com base no link recebido. Utiliza o **Puppeteer** para navegar e extrair o conteúdo da página.

**article.scraper.ts**:

```typescript
import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class ArticleScraper {
  public async scrape(link: string): Promise<string> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(link, { waitUntil: 'networkidle2' });

    const content = await page.evaluate(() => {
      return document.querySelector('article')?.innerText || 'Conteúdo não encontrado';
    });

    await browser.close();
    return content;
  }
}
```

### 3. Articles Repository

O repositório é responsável por interagir com o MongoDB para armazenar os artigos processados.

**articles.repository.ts**:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from '../schemas/article.schema';

@Injectable()
export class ArticlesRepository {
  constructor(@InjectModel(Article.name) private readonly articleModel: Model<ArticleDocument>) {}

  async create(articleData: any): Promise<Article> {
    const article = new this.articleModel(articleData);
    return article.save();
  }
}
```

### 4. Article Schema

Define a estrutura do documento de artigo a ser armazenado no MongoDB.

**article.schema.ts**:

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ArticleDocument = Article & Document;

@Schema()
export class Article {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  link: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  publishedAt?: Date;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
```

### 5. App Module

Configura todos os módulos do projeto, incluindo a conexão com o MongoDB e o RabbitMQListenerService.

**app.module.ts**:

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from './schemas/article.schema';
import { ArticlesRepository } from './repositories/articles.repository';
import { RabbitMQListenerService } from './services/rabbitmq.listener.service';
import { ArticleScraper } from './scrappers/article.scraper';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
  ],
  providers: [RabbitMQListenerService, ArticleScraper, ArticlesRepository],
})
export class AppModule {}
```

### 6. Main File

Arquivo de inicialização do projeto.

**main.ts**:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

## Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto e defina as variáveis de ambiente necessárias:

```env
RABBITMQ_URL=amqp://user:password@localhost:5672
MONGODB_URI=mongodb://localhost:27017/tipsdb
```

## Como Executar

1. Instale as dependências do projeto:

```bash
npm install
```

2. Inicie o serviço:

```bash
npm run start
```

O serviço ficará escutando a fila do RabbitMQ e processará os links de artigos conforme as mensagens forem recebidas.

## Considerações Finais

O **TIPS-queue-reader** complementa o **TIPS-queue-updater** realizando o scraping detalhado dos artigos com base nos links recebidos. A arquitetura modular do **NestJS** proporciona uma solução escalável e de fácil manutenção, garantindo que os dados sejam processados e armazenados de maneira eficiente.

