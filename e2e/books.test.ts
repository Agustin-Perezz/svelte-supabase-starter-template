import { expect, test } from './_shared/app-fixtures';

test('supawright creates and cleans up a book record', async ({
  supawright
}) => {
  const book = await supawright.create('books', {
    title: 'The Pragmatic Programmer',
    author: 'David Thomas'
  });

  expect(book.id).toBeDefined();
  expect(book.title).toBe('The Pragmatic Programmer');
  expect(book.author).toBe('David Thomas');
  expect(book.created_at).toBeDefined();

  const { data } = await supawright
    .supabase('public')
    .from('books')
    .select()
    .eq('id', book.id)
    .single();

  expect(data).not.toBeNull();
  expect(data!.title).toBe('The Pragmatic Programmer');
});

test('supawright auto-generates missing fields', async ({ supawright }) => {
  const book = await supawright.create('books', {
    title: 'Test Book'
  });

  expect(book.title).toBe('Test Book');
  expect(book.author).toBeDefined();
  expect(book.author.length).toBeGreaterThan(0);
});
