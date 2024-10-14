import { model } from 'mongoose';
import { NewsSchema } from '../schemas/news.schema';

export const News = model('News', NewsSchema);
