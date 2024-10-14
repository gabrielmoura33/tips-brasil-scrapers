import { Module } from '@nestjs/common';
import { DatabaseModule } from './shared/database/database.module';
import { MessagingModule } from './shared/messaging/messaging.module';
import { ConfigModule } from '@nestjs/config';
import { FolhaDeSpModule } from './modules/folha-de-sp/folha-de-sp.module';

@Module({
  imports: [
    DatabaseModule,
    MessagingModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FolhaDeSpModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
