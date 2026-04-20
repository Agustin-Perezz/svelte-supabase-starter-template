import { expect, test } from './_shared/app-fixtures';

test('books page loads', async ({ page }) => {
  await page.goto('/books');
  await expect(page.getByRole('heading', { name: 'Books' })).toBeVisible();
});
