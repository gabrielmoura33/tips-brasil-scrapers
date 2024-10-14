import { Page } from 'puppeteer';

export interface IScraper {
  /**
   * Método de scraping para extrair dados de uma página da web.
   * @param page - Instância de uma página do Puppeteer para realizar o scraping.
   * @returns Uma Promise que resolve para um objeto contendo os dados extraídos.
   */
  scrape(page: Page, url: string): Promise<any>;
}
