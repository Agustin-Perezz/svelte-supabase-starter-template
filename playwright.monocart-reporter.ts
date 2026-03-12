import type { ReporterDescription } from '@playwright/test';
import type {
  CoverageReportOptions,
  MonocartReporterOptions
} from 'monocart-reporter';

const coverageOptions: CoverageReportOptions = {
  outputDir: './coverage/e2e',
  reports: [
    ['v8', { outputFile: 'v8/index.html' }],
    ['lcov', { outputFile: 'lcov/code-coverage.lcov.info' }],
    ['cobertura', { outputFile: 'cobertura/code-coverage.cobertura.xml' }],
    ['console-summary']
  ],
  sourceFilter: (sourcePath) => {
    if (sourcePath.includes('node_modules')) return false;
    if (sourcePath.includes('@vite')) return false;
    if (sourcePath.includes('@sveltejs')) return false;
    if (sourcePath.includes('svelte/internal')) return false;
    return sourcePath.includes('/src/');
  }
};

const monocartOptions: MonocartReporterOptions = {
  name: 'Playwright E2E Code Coverage Report',
  outputFile: './coverage/e2e/monocart-report.html',
  coverage: coverageOptions
};

export const monocartReporter: ReporterDescription = [
  'monocart-reporter',
  monocartOptions
];
