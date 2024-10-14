
# Documentação do Serviço de Scraping: TIPS-queue-updater

O **TIPS-queue-updater** é um serviço de scraping desenvolvido para coletar editoriais e artigos de jornais específicos, processar os dados e enfileirá-los para processamento posterior utilizando o RabbitMQ. Este serviço foi construído utilizando o **NestJS**, aproveitando recursos como injeção de dependências, agendamento de tarefas e integração com bancos de dados MongoDB.

## Índice

- [Introdução](#introdução)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Arquitetura](#arquitetura)
  - [Scraper](#scraper)
  - [Use Case](#use-case)
  - [Repositórios](#repositórios)
  - [Serviço de Mensageria (RabbitMQ)](#serviço-de-mensageria-rabbitmq)
  - [Agendamento de Tarefas](#agendamento-de-tarefas)
- [Como Executar](#como-executar)
- [Componentes Principais](#componentes-principais)
  - [FolhaEditorialScraper](#folhaeditorialscraper)
  - [GetEditorialsAndArticlesUseCase](#geteditorialsandarticlesusecase)
  - [Repositórios](#repositórios-1)
  - [RabbitMQService](#rabbitmqservice)
  - [Controller com Agendamento](#controller-com-agendamento)
- [Considerações Finais](#considerações-finais)

## Introdução

O **TIPS-queue-updater** foi desenvolvido para automatizar a coleta de informações de editoriais e artigos de jornais, processar esses dados e enfileirá-los para processamento posterior. Utiliza tecnologias como **NestJS**, **Puppeteer**, **RabbitMQ** e **MongoDB**.

## Instalação

Certifique-se de ter o Node.js e o npm instalados em sua máquina.

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/tips-queue-updater.git

# Navegue até o diretório do projeto
cd tips-queue-updater

# Instale as dependências
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto e configure as variáveis de ambiente necessárias:

```env
# Exemplo de conteúdo do .env
RABBITMQ_URL=amqp://user:password@localhost:5672
MONGODB_URI=mongodb://localhost:27017/tipsdb
```

## Arquitetura

### Scraper

O scraper é responsável por navegar em sites de jornais, extrair links de editoriais e artigos, e retornar os dados processados.

### Use Case

O `GetEditorialsAndArticlesUseCase` orquestra o processo de scraping, enfileiramento e atualização dos dados no banco de dados.

### Repositórios

Os repositórios são responsáveis por interagir com o MongoDB, realizando operações de CRUD nos modelos `Newspaper`, `Editorial` e `Article`.

### Serviço de Mensageria (RabbitMQ)

O `RabbitMQService` gerencia a conexão e o envio de mensagens para o RabbitMQ, permitindo que os artigos sejam enfileirados para processamento posterior.

### Agendamento de Tarefas

Utilizando o `@nestjs/schedule`, o serviço é capaz de agendar tarefas para executar o scraping em horários definidos.

## Como Executar

Após instalar as dependências e configurar as variáveis de ambiente:

```bash
# Inicie o serviço
npm run start
```

O serviço executará o scraping conforme agendado ou conforme acionado via controller.

## Componentes Principais

### FolhaEditorialScraper

Este scraper extrai links de editoriais e artigos do site de um jornal específico.

```typescript
import { Injectable } from '@nestjs/common';
import { Page } from 'puppeteer';
import { IScraper } from 'src/common/interfaces/scraper.interface';
import * as crypto from 'crypto';
import { htmlToText } from 'html-to-text';

@Injectable()
export class FolhaEditorialScraper implements IScraper {
  public async scrape(page: Page, link: string): Promise<ScrapeResult> {
    console.log('[INICIANDO O SCRAPING]');

    // Navega para o link fornecido
    await page.goto(link, {
      waitUntil: 'networkidle2',
    });

    // ... lógica de scraping ...

    return result;
  }
}
```

### GetEditorialsAndArticlesUseCase

Este caso de uso coordena o processo de scraping, atualização do banco de dados e enfileiramento de mensagens.

```typescript
@Injectable()
export class GetEditorialsAndArticlesUseCase implements OnModuleDestroy {
  // ... propriedades e construtor ...

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

  // ... outros métodos ...
}
```

### Repositórios

#### NewspaperRepository

Gerencia operações relacionadas ao modelo `Newspaper`.

```typescript
@Injectable()
export class NewspapersRepository {
  // ... propriedades e construtor ...

  async create(newspaperData: any): Promise<NewspaperDocument> {
    // ... lógica para criar um jornal com editoriais ...
  }

  // ... outros métodos ...
}
```

#### EditorialsRepository

Gerencia operações relacionadas ao modelo `Editorial`.

```typescript
@Injectable()
export class EditorialsRepository {
  // ... propriedades e construtor ...

  async findByNewspaperCode(newspaperCode: string): Promise<Editorial[]> {
    // ... lógica para encontrar editoriais por código de jornal ...
  }

  async addEditorialToNewspaper(newspaperCode: string, editorialData: any): Promise<NewspaperDocument> {
    // ... lógica para adicionar um editorial a um jornal existente ...
  }

  // ... outros métodos ...
}
```

### RabbitMQService

Gerencia a conexão e o envio de mensagens ao RabbitMQ.

```typescript
@Injectable()
export class RabbitMQService implements OnModuleInit {
  private channel: ChannelWrapper;

  constructor(@Inject('RABBITMQ_SERVICE') private readonly client) {}

  static createClient(url: string) {
    const connection = connect([url]);
    return connection.createChannel({
      json: true,
      setup: (channel: ConfirmChannel) => Promise.resolve(),
    });
  }

  async onModuleInit() {
    this.channel = this.client;
  }

  async send(queue: string, message: any) {
    await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  }
}
```

### Controller com Agendamento

O controller utiliza o `@nestjs/schedule` para agendar a execução do scraping.

```typescript
import { Controller } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GetEditorialsAndArticlesUseCase } from '../use-cases/get-editorials-and-articles.use-case';
import { Logger } from '@nestjs/common';

@Controller('folha-de-sp')
export class FolhaDeSpController {
  private readonly logger = new Logger(FolhaDeSpController.name);

  constructor(
    private readonly getEditorialsAndArticlesUseCase: GetEditorialsAndArticlesUseCase,
  ) {}

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
```

## Considerações Finais

O **TIPS-queue-updater** é uma solução robusta para a coleta e processamento de dados de jornais. A utilização do NestJS proporciona uma estrutura modular e escalável, facilitando a manutenção e expansão do serviço.

**Nota**: Certifique-se de configurar corretamente as conexões com o MongoDB e o RabbitMQ, e ajuste os parâmetros de acordo com o ambiente de execução (desenvolvimento, homologação, produção).

**Contato**: Para dúvidas ou contribuições, entre em contato com o mantenedor do projeto.
