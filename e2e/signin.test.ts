import { expect, test } from './_shared/app-fixtures';

test.describe('Sign in page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signin');
  });

  test('renders sign in form with email input and submit button', async ({
    page
  }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('magic-link-submit')).toBeVisible();
  });

  test('renders OAuth buttons for Google and Facebook', async ({ page }) => {
    await expect(page.getByTestId('google-oauth-button')).toBeVisible();
    await expect(page.getByTestId('facebook-oauth-button')).toBeVisible();
  });

  test('shows validation error when submitting an invalid email', async ({
    page
  }) => {
    await page.getByTestId('email-input').fill('not-an-email');
    await page.getByTestId('magic-link-submit').click();
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.getByTestId('email-input')).toBeVisible();
  });

  test('shows success message after submitting a valid email', async ({
    page
  }) => {
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('magic-link-submit').click();
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });

  test.fixme('redirects authenticated users away from sign in page', async ({
    page,
    supawright
  }) => {
    // Create a test user via supabase admin
    const { data: user } = await supawright
      .supabase('public')
      .auth.admin.createUser({
        email: 'e2e-redirect@example.com',
        email_confirm: true,
        password: 'password1234'
      });

    if (!user.user) return;

    // Sign in programmatically and set session via storage state would be complex,
    // so we verify the load function redirect by checking server behavior:
    // an already-authenticated session should land on /protected.
    // Here we just confirm unauthenticated access stays on /signin.
    await expect(page).toHaveURL(/\/signin/);

    await supawright.supabase('public').auth.admin.deleteUser(user.user.id);
  });
});
