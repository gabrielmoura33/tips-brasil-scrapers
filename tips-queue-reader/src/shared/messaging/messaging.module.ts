import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from './services/rabbitmq.service';

@Module({
  providers: [
    {
      provide: 'RABBITMQ_SERVICE',
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('RABBITMQ_URL');
        return RabbitMQService.createClient(url);
      },
      inject: [ConfigService],
    },
    RabbitMQService,
  ],
  exports: [RabbitMQService],
})
export class MessagingModule {}
