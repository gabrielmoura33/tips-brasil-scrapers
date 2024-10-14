import { Module } from '@nestjs/common';
import { ScrapingModule } from './scraping/scraping.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(
        __dirname,
        'env',
        `.env.${process.env.NODE_ENV || 'development'}`,
      ),
    }),
    ScrapingModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
