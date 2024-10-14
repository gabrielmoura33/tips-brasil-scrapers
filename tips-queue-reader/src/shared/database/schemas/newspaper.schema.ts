import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose'; // Use Types para ObjectId

export type NewspaperDocument = Newspaper & Document;

@Schema()
export class Newspaper {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  active: boolean;

  @Prop({ required: true })
  baseURL: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Editorial' }] })
  editorials: Types.ObjectId[];
}

export const NewspaperSchema = SchemaFactory.createForClass(Newspaper);
