import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newspaper, NewspaperDocument } from '../schemas/newspaper.schema';
import { Editorial } from '../schemas/editorial.schema';

@Injectable()
export class NewspaperRepository {
  private readonly logger = new Logger(NewspaperRepository.name);

  constructor(
    @InjectModel('Newspaper')
    private readonly newspaperModel: Model<typeof Newspaper>,

    @InjectModel('Editorial')
    private readonly editorialModel: Model<typeof Editorial>,
  ) {}

  async create(newspaperData: any): Promise<any> {
    try {
      const newspaper = new this.newspaperModel({
        name: newspaperData.name,
        code: newspaperData.code,
        title: newspaperData.title,
        active: newspaperData.active,
        baseURL: newspaperData.baseURL,
      });
      const savedNewspaper = (await newspaper.save()) as any;

      const editorialIds = [];
      if (newspaperData.editorials && newspaperData.editorials.length > 0) {
        for (const editorialData of newspaperData.editorials) {
          const editorial = new this.editorialModel({
            ...editorialData,
            newspaperId: savedNewspaper._id,
          });
          const savedEditorial = await editorial.save();
          editorialIds.push(savedEditorial._id);
        }
      }

      savedNewspaper.editorials = editorialIds;
      await savedNewspaper.save(); // Salva o jornal atualizado

      return savedNewspaper;
    } catch (error) {
      this.logger.error(
        'Erro ao salvar dados do jornal e editoriais no MongoDB:',
        error,
      );
      throw error;
    }
  }

  // Método para buscar todos os jornais
  async findAll(): Promise<any[]> {
    try {
      return await this.newspaperModel.find().exec();
    } catch (error) {
      this.logger.error('Erro ao buscar dados dos jornais no MongoDB:', error);
      throw error;
    }
  }

  async findByCode(code: string): Promise<any> {
    try {
      return await this.newspaperModel.findOne({ code }).exec();
    } catch (error) {
      this.logger.error('Erro ao buscar jornal por código no MongoDB:', error);
      throw error;
    }
  }

  // Método para buscar um jornal por ID
  async findById(id: string): Promise<any> {
    try {
      return await this.newspaperModel.findById(id).exec();
    } catch (error) {
      this.logger.error('Erro ao buscar jornal por ID no MongoDB:', error);
      throw error;
    }
  }

  // Método para atualizar um jornal
  async update(id: string, newspaperData: any): Promise<any> {
    try {
      return await this.newspaperModel
        .findByIdAndUpdate(id, newspaperData, { new: true })
        .exec();
    } catch (error) {
      this.logger.error('Erro ao atualizar jornal no MongoDB:', error);
      throw error;
    }
  }

  // Método para deletar um jornal
  async delete(id: string): Promise<any> {
    try {
      return await this.newspaperModel.findByIdAndDelete(id).exec();
    } catch (error) {
      this.logger.error('Erro ao deletar jornal no MongoDB:', error);
      throw error;
    }
  }

  async addEditorialToNewspaper(
    newspaperCode: string,
    editorialData: any,
  ): Promise<NewspaperDocument> {
    try {
      const newspaper = (await this.newspaperModel
        .findOne({ code: newspaperCode })
        .exec()) as any;
      if (!newspaper) {
        throw new Error(`Jornal com o código ${newspaperCode} não encontrado.`);
      }

      const editorial = new this.editorialModel({
        ...editorialData,
        newspaperId: newspaper._id,
      });
      const savedEditorial = (await editorial.save()) as any;

      newspaper.editorials.push(savedEditorial._id);

      await newspaper.save();

      this.logger.log(
        `Editorial ${savedEditorial.title} associado ao jornal ${newspaper.name}`,
      );

      return newspaper;
    } catch (error) {
      this.logger.error(
        `Erro ao associar editorial ao jornal com código ${newspaperCode}:`,
        error,
      );
      throw error;
    }
  }
}
