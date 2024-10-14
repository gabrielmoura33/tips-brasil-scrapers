import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { NewspaperRepository } from './repositories/newspapper.repository';
import { Newspaper, NewspaperSchema } from './schemas/newspaper.schema';
import { Editorial, EditorialSchema } from './schemas/editorial.schema';
import { Articles, ArticlesSchema } from './schemas/articles.schema';
import { ArticlesRepository } from './repositories/articles.repository';
import { EditorialRepository } from './repositories/editorials.repository';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    MongooseModule.forFeature([
      { name: Articles.name, schema: ArticlesSchema },
      { name: Newspaper.name, schema: NewspaperSchema },
      { name: Editorial.name, schema: EditorialSchema },
    ]),
  ],
  providers: [ArticlesRepository, NewspaperRepository, EditorialRepository],
  exports: [ArticlesRepository, NewspaperRepository, EditorialRepository],
})
export class DatabaseModule {}
