import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

import * as fs from 'fs';
import * as path from 'path';
import { NewspaperRepository } from '../../repositories/newspapper.repository';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly newsPapperRepository: NewspaperRepository) {}

  async onModuleInit() {
    await this.seedProducts();
  }

  private async seedProducts() {
    try {
      const filePath = path.join(__dirname, '../../seed/newspapers.json');
      const fileData = fs.readFileSync(filePath, 'utf8');
      const newspapers = JSON.parse(fileData);

      for (const newspaper of newspapers) {
        const existing_newspaper = await this.newsPapperRepository.findByCode(
          newspaper.code,
        );

        if (!existing_newspaper) {
          await this.newsPapperRepository.create(newspaper);
          this.logger.log(
            `Newspaper '${newspaper.name}' added to the database.`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error seeding products:', error.message);
    }
  }
}
