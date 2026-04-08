import { expect, test } from './_shared/app-fixtures';

test('books page shows seeded books', async ({ page, supawright }) => {
  await supawright.create('books', {
    title: 'The Pragmatic Programmer',
    author: 'David Thomas'
  });

  await page.goto('/books');

  await expect(page.getByText('The Pragmatic Programmer')).toBeVisible();
  await expect(page.getByText('David Thomas')).toBeVisible();
});

test('can create a book from the UI', async ({ page, supawright: _ }) => {
  await page.goto('/books');

  await page.getByPlaceholder('Title').fill('E2E Created Book');
  await page.getByPlaceholder('Author').fill('Test Author');
  await page.getByRole('button', { name: 'Add' }).click();

  await expect(
    page.getByRole('listitem').filter({ hasText: 'E2E Created Book' })
  ).toBeVisible();
});

test('can delete a book from the UI', async ({ page, supawright }) => {
  await supawright.create('books', {
    title: 'Book to Delete',
    author: 'Some Author'
  });

  await page.goto('/books');

  const row = page.getByRole('listitem').filter({ hasText: 'Book to Delete' });
  await expect(row).toBeVisible();

  await row.getByRole('button', { name: 'Delete' }).click();

  await expect(row).not.toBeVisible();
});
