import { Schema } from 'mongoose';

export const NewsSchema = new Schema({
  uuid: { type: String, required: true },
  title: { type: String, required: true },
  sources: { type: [String], required: true },
  urls: { type: [String], required: true },
  text: { type: String, required: true },
  scientistOrEngineerMentioned: { type: Boolean, default: false },
  researchInstitutionMentioned: { type: String, default: '' },
  scientificJournal: { type: String, default: '' },
  scientificDisciplineMentioned: { type: String, default: '' },
  researchOrInnovationReference: { type: Boolean, default: false },
  discoveryOrInnovationMentioned: { type: Boolean, default: false },
  C2_1: { type: Number, default: 0 },
  C2_2: { type: Number, default: 0 },
  C2_3: { type: Number, default: 0 },
  C2_4: { type: Number, default: 0 },
  C2_5: { type: Number, default: 0 },
  C2_6: { type: Number, default: 0 },
});
