import { Injectable } from '@nestjs/common';
import { Page } from 'puppeteer';
import { IScraper } from 'src/common/interfaces/scraper.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FolhaScrapper implements IScraper {
  public async scrape(page: Page): Promise<any> {
    console.log('[INITIANTING SCRAPPING PROVIDER]');

    await page.goto('https://www.nytimes.com/', {
      waitUntil: 'networkidle2',
    });

    const uuid = uuidv4();

    const data = await page.evaluate((uuid) => {
      const title =
        document.querySelector('h1')?.textContent || 'Título não encontrado';
      const text =
        document.querySelector('article')?.textContent ||
        'Texto não encontrado';

      return {
        uuid,
        title,
        sources: ['NYTimes'],
        urls: ['https://www.nytimes.com/'],
        text,
        scientistOrEngineerMentioned:
          text.includes('cientista') || text.includes('engenheiro'),
        researchInstitutionMentioned: text.includes('NASA') ? 'NASA' : '',
        scientificJournal: '',
        scientificDisciplineMentioned: '',
        researchOrInnovationReference: false,
        discoveryOrInnovationMentioned: false,
        C2_1: 1,
        C2_2: 1,
        C2_3: 0,
        C2_4: 1,
        C2_5: 1,
        C2_6: 1,
      };
    }, uuid);

    return data;
  }
}
