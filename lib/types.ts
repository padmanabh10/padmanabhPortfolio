export interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverUrl: string;
  tags: string[];
  category: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  tags: string[];
  readTime: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
