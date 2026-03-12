import { test as base, expect } from '@playwright/test';

import {
  collectV8Coverage,
  stopV8CoverageAndReport
} from './fixtures/v8-code-coverage';

const enableJsCoverage = true;
const enableCssCoverage = true;

const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    const isChromium = testInfo.project.name === 'chromium';

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

export { test, expect };
