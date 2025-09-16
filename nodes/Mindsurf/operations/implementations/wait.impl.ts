import { IExecuteFunctions } from 'n8n-workflow';
import { Page } from 'playwright';

export async function executeWaitOperation(
  this: IExecuteFunctions,
  page: Page,
  operation: string,
  itemIndex: number,
): Promise<any> {
  switch (operation) {
    case 'waitForSelector': {
      const selector = this.getNodeParameter('waitSelector', itemIndex) as string;
      const state = this.getNodeParameter('waitState', itemIndex, 'visible') as 
        'attached' | 'detached' | 'visible' | 'hidden';
      const timeout = this.getNodeParameter('waitTimeout', itemIndex, 30000) as number;
      const strict = this.getNodeParameter('strict', itemIndex, false) as boolean;
      
      const element = await page.waitForSelector(selector, {
        state,
        timeout,
        strict,
      });

      return {
        selector,
        state,
        found: element !== null,
        success: true,
      };
    }

    case 'waitForLoadState': {
      const loadState = this.getNodeParameter('loadState', itemIndex, 'load') as 
        'load' | 'domcontentloaded' | 'networkidle';
      const timeout = this.getNodeParameter('waitTimeout', itemIndex, 30000) as number;
      
      await page.waitForLoadState(loadState, { timeout });

      return {
        loadState,
        url: page.url(),
        success: true,
      };
    }

    case 'waitForFunction': {
      const functionCode = this.getNodeParameter('waitFunction', itemIndex) as string;
      const polling = this.getNodeParameter('waitPolling', itemIndex, 'raf') as string;
      const timeout = this.getNodeParameter('waitTimeout', itemIndex, 30000) as number;
      
      const options: any = { timeout };
      
      if (polling === 'interval') {
        const pollingInterval = this.getNodeParameter('waitPollingInterval', itemIndex, 100) as number;
        options.polling = pollingInterval;
      } else {
        options.polling = polling;
      }
      
      // Pass function code as string to be evaluated
      const result = await page.waitForFunction(functionCode as any, options);
      const value = await result.jsonValue();

      return {
        result: value,
        success: true,
      };
    }

    case 'waitForTimeout': {
      const delay = this.getNodeParameter('delay', itemIndex, 1000) as number;
      
      await page.waitForTimeout(delay);

      return {
        waited: delay,
        success: true,
      };
    }

    case 'waitForRequest': {
      const urlPattern = this.getNodeParameter('urlPattern', itemIndex, '') as string;
      const predicateFunction = this.getNodeParameter('predicateFunction', itemIndex, '') as string;
      const timeout = this.getNodeParameter('waitTimeout', itemIndex, 30000) as number;
      
      let predicate: any;
      
      if (predicateFunction) {
        // Use custom predicate function
        predicate = new Function('request', predicateFunction);
      } else if (urlPattern) {
        // Use URL pattern
        predicate = (request: any) => {
          const url = request.url();
          // Support glob patterns
          if (urlPattern.includes('*')) {
            const regex = new RegExp(urlPattern.replace(/\*/g, '.*'));
            return regex.test(url);
          }
          return url.includes(urlPattern);
        };
      } else {
        throw new Error('Either URL pattern or predicate function is required');
      }
      
      const request = await page.waitForRequest(predicate, { timeout });

      return {
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        success: true,
      };
    }

    case 'waitForResponse': {
      const urlPattern = this.getNodeParameter('urlPattern', itemIndex, '') as string;
      const predicateFunction = this.getNodeParameter('predicateFunction', itemIndex, '') as string;
      const timeout = this.getNodeParameter('waitTimeout', itemIndex, 30000) as number;
      
      let predicate: any;
      
      if (predicateFunction) {
        // Use custom predicate function
        predicate = new Function('response', predicateFunction);
      } else if (urlPattern) {
        // Use URL pattern
        predicate = (response: any) => {
          const url = response.url();
          // Support glob patterns
          if (urlPattern.includes('*')) {
            const regex = new RegExp(urlPattern.replace(/\*/g, '.*'));
            return regex.test(url);
          }
          return url.includes(urlPattern);
        };
      } else {
        throw new Error('Either URL pattern or predicate function is required');
      }
      
      const response = await page.waitForResponse(predicate, { timeout });

      return {
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        success: true,
      };
    }

    case 'waitForEvent': {
      const eventName = this.getNodeParameter('eventName', itemIndex, 'load') as string;
      const timeout = this.getNodeParameter('waitTimeout', itemIndex, 30000) as number;
      
      const eventPromise = page.waitForEvent(eventName as any, { timeout });
      const event = await eventPromise;

      return {
        event: eventName,
        data: event,
        success: true,
      };
    }

    case 'waitForFileChooser': {
      const timeout = this.getNodeParameter('waitTimeout', itemIndex, 30000) as number;
      
      const fileChooser = await page.waitForEvent('filechooser', { timeout });

      return {
        isMultiple: fileChooser.isMultiple(),
        success: true,
      };
    }

    case 'waitForPopup': {
      const timeout = this.getNodeParameter('waitTimeout', itemIndex, 30000) as number;
      
      const popup = await page.waitForEvent('popup', { timeout });
      
      // Wait for popup to load
      await popup.waitForLoadState('domcontentloaded');

      return {
        url: popup.url(),
        title: await popup.title(),
        success: true,
      };
    }

    case 'waitForDownload': {
      const timeout = this.getNodeParameter('waitTimeout', itemIndex, 30000) as number;
      
      const download = await page.waitForEvent('download', { timeout });
      
      // Get download info
      const suggestedFilename = download.suggestedFilename();
      const url = download.url();

      return {
        filename: suggestedFilename,
        url,
        success: true,
      };
    }

    default:
      throw new Error(`Unknown wait operation: ${operation}`);
  }
}