import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NewsSchema } from './schemas/news.schema';
import { ConfigService } from '@nestjs/config';
import { NewsRepository } from './repositories/news.repository';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    MongooseModule.forFeature([{ name: 'News', schema: NewsSchema }]),
  ],
  providers: [NewsRepository],
  exports: [NewsRepository],
})
export class DatabaseModule {
  constructor(private readonly configService: ConfigService) {
    console.log(this.configService.get<string>('MONGODB_URI'));
  }
}
