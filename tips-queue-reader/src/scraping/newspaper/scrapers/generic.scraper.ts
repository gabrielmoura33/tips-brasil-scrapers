// src/scraping/newspaper/scrapers/generic.scraper.ts

import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';

@Injectable()
export class GenericScraperService {
  private readonly logger = new Logger(GenericScraperService.name);
  private browser: Browser;

  constructor() {
    this.initBrowser();
  }

  // Inicializa o navegador Puppeteer
  private async initBrowser() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Configuração para segurança e performance
    });
  }

  // Método utilitário para abrir uma nova página
  public async newPage(): Promise<Page> {
    return this.browser.newPage();
  }

  // Método genérico para executar um scraping passado como parâmetro
  public async executeScrape(scraper: {
    scrape: (page: Page) => Promise<any>;
  }): Promise<any> {
    const page = await this.newPage();
    try {
      this.logger.log('Iniciando o processo de scraping...');
      const data = await scraper.scrape(page);
      return data;
    } catch (error) {
      this.logger.error('Erro durante o scraping:', error);
    } finally {
      await page.close();
    }
  }

  // Método para fechar o navegador
  public async closeBrowser() {
    await this.browser.close();
  }
}
