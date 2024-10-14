import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ArticlesDocument = Articles & Document;

@Schema()
export class Articles {
  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true })
  title: string;

  @Prop({ type: [String], required: true })
  sources: string[];

  @Prop({ type: [String], required: true })
  urls: string[];

  @Prop({ required: true })
  text: string;

  @Prop({ default: false })
  scientistOrEngineerMentioned: boolean;

  @Prop({ default: '' })
  researchInstitutionMentioned: string;

  @Prop({ default: '' })
  scientificJournal: string;

  @Prop({ default: '' })
  scientificDisciplineMentioned: string;

  @Prop({ default: false })
  researchOrInnovationReference: boolean;

  @Prop({ default: false })
  discoveryOrInnovationMentioned: boolean;

  @Prop({ default: 0 })
  C2_1: number;

  @Prop({ default: 0 })
  C2_2: number;

  @Prop({ default: 0 })
  C2_3: number;

  @Prop({ default: 0 })
  C2_4: number;

  @Prop({ default: 0 })
  C2_5: number;

  @Prop({ default: 0 })
  C2_6: number;
}

export const ArticlesSchema = SchemaFactory.createForClass(Articles);
