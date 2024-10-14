import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EditorialDocument = Editorial & Document;

@Schema()
export class Editorial {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Newspaper', required: true })
  newspaperId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  link: string;

  @Prop()
  lastScrapedAt: Date;
}

export const EditorialSchema = SchemaFactory.createForClass(Editorial);
