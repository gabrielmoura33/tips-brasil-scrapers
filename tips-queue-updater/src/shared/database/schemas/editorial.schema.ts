import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EditorialDocument = Editorial & Document;

// Função para definir o valor padrão de lastScrapedAt como a data de hoje - 1 dia
const getYesterdayDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date;
};

@Schema()
export class Editorial {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Newspaper', required: true })
  newspaperId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  uuid: string;

  @Prop({ required: true })
  link: string;

  @Prop({ default: getYesterdayDate })
  lastScrapedAt: Date;
}

export const EditorialSchema = SchemaFactory.createForClass(Editorial);
