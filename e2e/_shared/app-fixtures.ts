import { test as base, expect, mergeTests } from '@playwright/test';

import { supaTest } from './fixtures/supawright';
import {
  collectV8Coverage,
  stopV8CoverageAndReport
} from './fixtures/v8-code-coverage';

const coverageTest = base.extend({
  page: async ({ page }, use, testInfo) => {
    const isChromium = testInfo.project.name === 'chromium';
    const enableJsCoverage = true;
    const enableCssCoverage = true;

    if (isChromium) {
      await collectV8Coverage(page, testInfo, {
        enableJsCoverage,
        enableCssCoverage
      });
    }

    await use(page);

    if (isChromium) {
      await stopV8CoverageAndReport(page, testInfo, {
        enableJsCoverage,
        enableCssCoverage
      });
    }
  }
});

const test = mergeTests(coverageTest, supaTest);

export { test, expect };
