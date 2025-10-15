// AI Service Types
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GenerateResponseOptions {
  conversationHistory: AIMessage[];
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateResponseResult {
  content: string;
  tokensUsed?: number;
  model?: string;
}

// Repository Types
export interface MessageProps {
  id?: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt?: Date;
}

// Note Types
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INoteRepository {
  create(note: Omit<Note, 'id'>): Promise<Note>;
  findById(id: string): Promise<Note | null>;
  findByUserId(userId: string): Promise<Note[]>;
  update(id: string, note: Partial<Note>): Promise<Note | null>;
  delete(id: string): Promise<boolean>;
}

// Transaction Types
export interface Money {
  amount: number;
  currency: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: Money;
  description: string;
  category?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransactionRepository {
  create(transaction: Omit<Transaction, 'id'>): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByUserId(userId: string): Promise<Transaction[]>;
  findByDateRange(userId: string, range: DateRange): Promise<Transaction[]>;
  update(id: string, transaction: Partial<Transaction>): Promise<Transaction | null>;
  delete(id: string): Promise<boolean>;
}

// User Types
export interface Email {
  value: string;
  isValid(): boolean;
}

export interface User {
  id: string;
  email: Email;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRepository {
  create(user: Omit<User, 'id'>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, user: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}

// Vector Store Types
export interface VectorDocument {
  id: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, any>;
}

export interface SearchResult {
  document: VectorDocument;
  similarity: number;
}

export interface IVectorStore {
  upsert(documents: VectorDocument[]): Promise<void>;
  search(embedding: number[], limit?: number, filter?: Record<string, any>): Promise<SearchResult[]>;
  delete(ids: string[]): Promise<void>;
}

// Embedding Service Types
export interface EmbeddingResult {
  embedding: number[];
  dimension: number;
}

export interface IEmbeddingService {
  generateEmbedding(text: string): Promise<EmbeddingResult>;
  generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]>;
}