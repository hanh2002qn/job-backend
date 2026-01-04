export interface JobCrawler {
    crawl(): Promise<any[]>;
}
