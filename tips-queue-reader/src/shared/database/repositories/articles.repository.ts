// src/scraping/Articlespaper/repositories/Articles.repository.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Articles } from '../schemas/articles.schema';

@Injectable()
export class ArticlesRepository {
  private readonly logger = new Logger(ArticlesRepository.name);

  constructor(
    @InjectModel('Articles')
    private readonly articlesModel: Model<typeof Articles>,
  ) {}

  // Método para criar um novo documento de notícia
  async create(articlesData: any): Promise<any> {
    try {
      const articles = new this.articlesModel(articlesData);
      return await articles.save();
    } catch (error) {
      this.logger.error('Erro ao salvar dados no MongoDB:', error);
      throw error;
    }
  }

  // Método para buscar todas as notícias
  async findAll(): Promise<any[]> {
    try {
      return await this.articlesModel.find().exec();
    } catch (error) {
      this.logger.error('Erro ao buscar dados no MongoDB:', error);
      throw error;
    }
  }

  // Método para buscar uma notícia por ID
  async findById(id: string): Promise<any> {
    try {
      return await this.articlesModel.findById(id).exec();
    } catch (error) {
      this.logger.error('Erro ao buscar notícia por ID no MongoDB:', error);
      throw error;
    }
  }
}
