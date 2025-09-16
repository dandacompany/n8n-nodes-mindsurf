import { IExecuteFunctions } from 'n8n-workflow';
import { Page } from 'playwright';

export async function executeNavigationOperation(
  this: IExecuteFunctions,
  page: Page,
  operation: string,
  itemIndex: number,
): Promise<any> {
  switch (operation) {
    case 'goto': {
      const url = this.getNodeParameter('url', itemIndex) as string;
      const waitUntil = this.getNodeParameter('waitUntil', itemIndex, 'load') as
        | 'load'
        | 'domcontentloaded'
        | 'networkidle'
        | 'commit';
      const timeout = this.getNodeParameter('navigationTimeout', itemIndex, 30000) as number;

      const response = await page.goto(url, {
        waitUntil,
        timeout,
      });

      return {
        url: page.url(),
        status: response?.status() || null,
        statusText: response?.statusText() || null,
        ok: response?.ok() || false,
        headers: response?.headers() || {},
      };
    }

    case 'back': {
      const timeout = this.getNodeParameter('navigationTimeout', itemIndex, 30000) as number;
      
      const response = await page.goBack({
        timeout,
        waitUntil: 'load',
      });

      return {
        url: page.url(),
        status: response?.status() || null,
        navigated: response !== null,
      };
    }

    case 'forward': {
      const timeout = this.getNodeParameter('navigationTimeout', itemIndex, 30000) as number;
      
      const response = await page.goForward({
        timeout,
        waitUntil: 'load',
      });

      return {
        url: page.url(),
        status: response?.status() || null,
        navigated: response !== null,
      };
    }

    case 'reload': {
      const waitUntil = this.getNodeParameter('waitUntil', itemIndex, 'load') as
        | 'load'
        | 'domcontentloaded'
        | 'networkidle'
        | 'commit';
      const timeout = this.getNodeParameter('navigationTimeout', itemIndex, 30000) as number;

      const response = await page.reload({
        waitUntil,
        timeout,
      });

      return {
        url: page.url(),
        status: response?.status() || null,
        reloaded: true,
      };
    }

    case 'waitForNavigation': {
      const waitUntil = this.getNodeParameter('waitUntil', itemIndex, 'load') as
        | 'load'
        | 'domcontentloaded'
        | 'networkidle'
        | 'commit';
      const timeout = this.getNodeParameter('navigationTimeout', itemIndex, 30000) as number;

      const response = await page.waitForNavigation({
        waitUntil,
        timeout,
      });

      return {
        url: page.url(),
        status: response?.status() || null,
        navigated: true,
      };
    }

    default:
      throw new Error(`Unknown navigation operation: ${operation}`);
  }
}