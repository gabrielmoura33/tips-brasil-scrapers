import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Editorial, EditorialDocument } from '../schemas/editorial.schema';
import { Newspaper, NewspaperDocument } from '../schemas/newspaper.schema';

@Injectable()
export class EditorialRepository {
  private readonly logger = new Logger(EditorialRepository.name);

  constructor(
    @InjectModel(Editorial.name)
    private editorialModel: Model<EditorialDocument>,
    @InjectModel(Newspaper.name)
    private readonly newspaperModel: Model<NewspaperDocument>,
  ) {}

  async create(createEditorialDto: Partial<Editorial>): Promise<Editorial> {
    const newEditorial = new this.editorialModel(createEditorialDto);
    return newEditorial.save();
  }

  async findById(id: string): Promise<Editorial | null> {
    return this.editorialModel
      .findOne({
        uuid: id,
      })
      .exec();
  }

  async findAll(): Promise<Editorial[]> {
    return this.editorialModel.find().exec();
  }

  async findByNewspaperId(newspaperId: string): Promise<Editorial[]> {
    return this.editorialModel.find({ newspaperId }).exec();
  }

  async findByNewspaperCode(
    newspaperCode: string,
    cutoffDate?: Date,
  ): Promise<Editorial[]> {
    try {
      const newspaper = await this.newspaperModel
        .findOne({ code: newspaperCode })
        .exec();
      if (!newspaper) {
        throw new Error(`Jornal com o código ${newspaperCode} não encontrado.`);
      }

      // Define a data de corte, se não for passada utiliza o dia anterior
      const effectiveCutoffDate =
        cutoffDate || new Date(new Date().setDate(new Date().getDate() - 1));

      // Busca editoriais com newspaperId e lastScrapedAt menor que a data de corte
      const editorials = await this.editorialModel
        .find({
          newspaperId: newspaper._id,
          lastScrapedAt: { $lt: effectiveCutoffDate },
        })
        .exec();

      return editorials;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar editoriais para o jornal com código ${newspaperCode}:`,
        error,
      );
      throw error;
    }
  }

  async update(
    id: string,
    updateEditorialDto: Partial<Editorial>,
  ): Promise<Editorial | null> {
    return this.editorialModel
      .findByIdAndUpdate(id, updateEditorialDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Editorial | null> {
    return this.editorialModel.findByIdAndDelete(id).exec();
  }
}
