// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Report, reporterFactory } from 'accessibility-insights-report';
import { AxeResults } from 'axe-core';
import { AxePuppeteer } from 'axe-puppeteer';
import { Page } from 'puppeteer';

export interface ScanResult {
    axeResults: AxeResults;
    report?: Report;
}

export class PageScanner {
    public constructor(private readonly page: Page, private readonly reporter = reporterFactory()) {}

    public async scan(): Promise<ScanResult> {
        const axePuppeteer: AxePuppeteer = new AxePuppeteer(this.page);
        const axeResults = await axePuppeteer.analyze();

        const report = this.createReport(axeResults, this.page.url(), await this.page.title());

        return {
            axeResults,
            report,
        };
    }

    private createReport(axeResults: AxeResults, url: string, title: string): Report {
        return this.reporter.fromAxeResult({
            results: axeResults,
            serviceName: 'Accessibility Insights CLI',
            description: `Automated report for accessibility scan of url ${url}`,
            scanContext: {
                pageTitle: title,
            },
        });
    }
}