/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ChannelWrapper, connect } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private channel: ChannelWrapper;

  constructor(@Inject('RABBITMQ_SERVICE') private readonly client) {}

  static createClient(url: string) {
    const connection = connect([url]);
    return connection.createChannel({
      json: true,
      setup: (channel: ConfirmChannel) => Promise.resolve(),
    });
  }

  async onModuleInit() {
    this.channel = this.client;
  }

  async send(queue: string, message: any) {
    await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  }
}
