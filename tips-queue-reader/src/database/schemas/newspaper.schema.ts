import { Schema } from 'mongoose';

export const NewspaperSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  title: { type: String, required: true },
  baseURL: { type: String, required: true },
});
