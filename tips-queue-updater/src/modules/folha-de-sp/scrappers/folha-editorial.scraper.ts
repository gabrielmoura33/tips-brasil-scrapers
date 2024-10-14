import { Injectable, Logger } from '@nestjs/common';
import { Page } from 'puppeteer';
import { IScraper } from 'src/shared/interfaces/scraper.interface';
import * as crypto from 'crypto';
import { htmlToText } from 'html-to-text';
import { Article, CategorizedLinks } from 'src/shared/interfaces/newspappers';

@Injectable()
export class FolhaEditorialScraper implements IScraper {
  private readonly logger = new Logger(FolhaEditorialScraper.name);

  private readonly uri = 'www1.folha.uol.com.br';

  public async scrape(page: Page, url: string): Promise<CategorizedLinks> {
    this.logger.log('[INICIANDO O SCRAPING] URL: ' + url);

    // Navega para a página inicial do site
    await page.goto(url, {
      waitUntil: 'networkidle2',
    });

    // Extrai os links de matérias da página
    const articles = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links
        .map((link) => ({
          href: link.href,
          innerHTML: link.innerHTML,
        }))
        .filter((link) => link.href.includes('www1.folha.uol.com.br')); // Filtra links do próprio site
    });

    // Função para normalizar URLs removendo a barra final, se houver
    const normalizeUrl = (url: string) => {
      return url.endsWith('/') ? url.slice(0, -1) : url;
    };

    // Processa os artigos extraídos
    const processedArticles = articles.map((article) => {
      // Normaliza o link removendo a barra final, se existir
      const normalizedLink = normalizeUrl(article.href);
      // Gera o identificador com base no link usando MD5
      const id = crypto.createHash('md5').update(normalizedLink).digest('hex');
      // Converte o innerHTML para texto
      const title = htmlToText(article.innerHTML, { wordwrap: false }).trim();
      return {
        id,
        title,
        link: normalizedLink, // Usa o link normalizado
      };
    });

    // Remove duplicatas com base no link normalizado
    const uniqueArticlesMap = new Map<string, any>();
    processedArticles.forEach((article) => {
      if (!uniqueArticlesMap.has(article.link)) {
        uniqueArticlesMap.set(article.link, article);
      }
    });
    const uniqueArticles = Array.from(uniqueArticlesMap.values());

    // Categoriza os links entre editoriais e artigos
    const categorized = {
      editorials: [] as Article[],
      articles: [] as Article[],
    };

    uniqueArticles.forEach((article) => {
      const link = article.link;
      const url = new URL(link);
      const pathSegments = url.pathname.split('/').filter((segment) => segment);

      // Se houver mais de 4 segmentos e o link terminar com .shtml ou .ghtml, é um artigo
      if (
        (pathSegments.length > 4 && link.endsWith('.shtml')) ||
        (pathSegments.length > 4 && link.endsWith('.ghtml'))
      ) {
        categorized.articles.push(article);
      } else {
        categorized.editorials.push(article);
      }
    });

    // Retorna os editoriais e notícias
    return categorized;
  }
}
