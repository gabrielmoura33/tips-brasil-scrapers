export interface Article {
  id: string;
  title: string;
  link: string;
}

export interface CategorizedLinks {
  editorials: Article[];
  articles: Article[];
}

export interface ScrapeResult {
  count: number;
  categorized: CategorizedLinks;
}
