// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Apify from 'apify';
import * as cheerio from 'cheerio';
import { CloudApifyFactory, CrawlerFactory } from './crawler-factory';
import { ClassicPageProcessorFactory, PageProcessorFactory } from './page-processor-factory';
import * as utilities from './utilities';

export interface CrawlerRunOptions {
    baseUrl: string;
    existingUrls?: string[];
    discoveryPatterns?: string[];
}

export class CrawlerEngine {
    public constructor(
        private readonly crawlerFactory: CrawlerFactory = new CloudApifyFactory(),
        private readonly pageProcessorFactory: PageProcessorFactory = new ClassicPageProcessorFactory(),
    ) {}

    public async start(crawlerRunOptions: CrawlerRunOptions): Promise<void> {
        const requestList = await this.crawlerFactory.createRequestList(crawlerRunOptions.existingUrls);
        const requestQueue = await this.crawlerFactory.createRequestQueue(crawlerRunOptions.baseUrl);
        const pageProcessor = this.pageProcessorFactory.createPageProcessor({
            baseUrl: crawlerRunOptions.baseUrl,
            requestQueue: utilities.toApifyInstance(requestQueue),
            discoveryPatterns: crawlerRunOptions.discoveryPatterns,
        });

        Apify.main(async () => {
            const crawler = new Apify.PuppeteerCrawler({
                requestList,
                requestQueue: utilities.toApifyInstance(requestQueue),
                handlePageFunction: pageProcessor.pageProcessor,
                handleFailedRequestFunction: pageProcessor.pageErrorProcessor,
            });

            await crawler.run();
        });
    }
}