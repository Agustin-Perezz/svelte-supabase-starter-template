import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const books = pgTable('books', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow()
});

export type BookRow = typeof books.$inferSelect;
export type BookRowInsert = typeof books.$inferInsert;
