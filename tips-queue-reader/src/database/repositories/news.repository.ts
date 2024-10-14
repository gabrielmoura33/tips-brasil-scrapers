// src/scraping/newspaper/repositories/news.repository.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News } from '../models/news.module';

@Injectable()
export class NewsRepository {
  private readonly logger = new Logger(NewsRepository.name);

  constructor(
    @InjectModel('News') private readonly newsModel: Model<typeof News>,
  ) {}

  // Método para criar um novo documento de notícia
  async create(newsData: any): Promise<any> {
    try {
      const news = new this.newsModel(newsData);
      return await news.save();
    } catch (error) {
      this.logger.error('Erro ao salvar dados no MongoDB:', error);
      throw error;
    }
  }

  // Método para buscar todas as notícias
  async findAll(): Promise<any[]> {
    try {
      return await this.newsModel.find().exec();
    } catch (error) {
      this.logger.error('Erro ao buscar dados no MongoDB:', error);
      throw error;
    }
  }

  // Método para buscar uma notícia por ID
  async findById(id: string): Promise<any> {
    try {
      return await this.newsModel.findById(id).exec();
    } catch (error) {
      this.logger.error('Erro ao buscar notícia por ID no MongoDB:', error);
      throw error;
    }
  }

  // Outros métodos de interação com o banco de dados podem ser adicionados aqui
}
