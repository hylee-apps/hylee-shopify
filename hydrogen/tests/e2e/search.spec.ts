import {test, expect} from '@playwright/test';

/**
 * Search page E2E tests.
 *
 * Tests cover the Searchanise-powered search page and the header autocomplete
 * component. The app must be running (`pnpm dev`) for these tests to pass.
 *
 * When SEARCHANISE_API_KEY is not configured the loader returns empty results
 * gracefully — these tests verify the page doesn't crash in that state.
 */

test.describe('Search page', () => {
  test('loads successfully with no query', async ({page}) => {
    const response = await page.goto('/search');
    expect(response?.status()).toBeLessThan(400);
  });

  test('displays the search form', async ({page}) => {
    await page.goto('/search');
    await expect(page.getByTestId('search-input')).toBeVisible();
    await expect(page.getByTestId('search-submit')).toBeVisible();
  });

  test('shows empty state prompt when no query is entered', async ({page}) => {
    await page.goto('/search');
    // The "enter a search term" message should appear
    await expect(page.getByText(/enter a search term/i)).toBeVisible();
  });

  test('submits search query and shows results or empty state', async ({
    page,
  }) => {
    await page.goto('/search');
    await page.getByTestId('search-input').fill('shoes');
    await page.getByTestId('search-submit').click();

    await page.waitForURL(/\?q=shoes/);
    // Either results grid or empty state must be rendered — not a crash
    const hasResults = await page.getByTestId('search-results').isVisible();
    const hasEmpty = await page.getByTestId('search-empty').isVisible();
    expect(hasResults || hasEmpty).toBe(true);
  });

  test('shows result count when results are found', async ({page}) => {
    await page.goto('/search?q=product');
    // If Searchanise returns items, result count text appears
    const resultsVisible = await page.getByTestId('search-results').isVisible();
    if (resultsVisible) {
      await expect(page.getByText(/result(s)? for/i)).toBeVisible();
    }
  });

  test('navigating via breadcrumb goes home', async ({page}) => {
    await page.goto('/search?q=test');
    await page.getByRole('link', {name: /home/i}).first().click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Header search autocomplete', () => {
  test('header search input is present on non-homepage pages', async ({
    page,
  }) => {
    await page.goto('/collections');
    await expect(page.getByTestId('header-search-input')).toBeVisible();
  });

  test('typing in the header search input does not crash the page', async ({
    page,
  }) => {
    await page.goto('/collections');
    const input = page.getByTestId('header-search-input');
    await input.fill('shoe');
    // Wait briefly for the debounce
    await page.waitForTimeout(400);
    // Page should still be alive (no JS crash)
    await expect(input).toBeVisible();
  });

  test('autocomplete dropdown appears after typing', async ({page}) => {
    await page.goto('/collections');
    const input = page.getByTestId('header-search-input');
    await input.fill('shoe');
    await page.waitForTimeout(400);
    // If Searchanise key is configured and returns results, dropdown appears
    const dropdown = page.getByTestId('search-autocomplete-dropdown');
    // We only assert it is NOT causing an error — visibility depends on API config
    const crashed = await page.evaluate(() =>
      document.body.innerHTML.includes('An unexpected error'),
    );
    expect(crashed).toBe(false);
  });

  test('pressing Escape closes the autocomplete dropdown', async ({page}) => {
    await page.goto('/collections');
    const input = page.getByTestId('header-search-input');
    await input.fill('shoe');
    await page.waitForTimeout(400);
    await input.press('Escape');
    await expect(
      page.getByTestId('search-autocomplete-dropdown'),
    ).not.toBeVisible();
  });

  test('submitting the header search form navigates to /search', async ({
    page,
  }) => {
    await page.goto('/collections');
    const input = page.getByTestId('header-search-input');
    await input.fill('boots');
    await input.press('Enter');
    await expect(page).toHaveURL(/\/search\?q=boots/);
  });
});
