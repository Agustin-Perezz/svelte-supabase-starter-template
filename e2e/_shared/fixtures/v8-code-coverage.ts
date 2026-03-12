import type { Page } from '@playwright/test';
import { addCoverageReport, TestInfo } from 'monocart-reporter';

export async function collectV8Coverage(
  page: Page,
  testInfo: TestInfo,
  options: { enableJsCoverage?: boolean; enableCssCoverage?: boolean } = {}
): Promise<void> {
  const { enableJsCoverage = true, enableCssCoverage = true } = options;

  if (enableJsCoverage) {
    await page.coverage.startJSCoverage({
      resetOnNavigation: false
    });
  }

  if (enableCssCoverage) {
    await page.coverage.startCSSCoverage({
      resetOnNavigation: false
    });
  }
}

export async function stopV8CoverageAndReport(
  page: Page,
  testInfo: TestInfo,
  options: { enableJsCoverage?: boolean; enableCssCoverage?: boolean } = {}
): Promise<void> {
  const { enableJsCoverage = true, enableCssCoverage = true } = options;

  const coverageList: (
    | Awaited<ReturnType<typeof page.coverage.stopJSCoverage>>[number]
    | Awaited<ReturnType<typeof page.coverage.stopCSSCoverage>>[number]
  )[] = [];

  if (enableJsCoverage) {
    const jsCoverage = await page.coverage.stopJSCoverage();
    coverageList.push(...jsCoverage);
  }

  if (enableCssCoverage) {
    const cssCoverage = await page.coverage.stopCSSCoverage();
    coverageList.push(...cssCoverage);
  }

  if (coverageList.length > 0) {
    await addCoverageReport(coverageList, testInfo);
  }
}
