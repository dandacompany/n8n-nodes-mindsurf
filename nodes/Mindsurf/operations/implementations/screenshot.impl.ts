import { IExecuteFunctions } from 'n8n-workflow';
import { Page } from 'playwright';

export async function executeScreenshotOperation(
  this: IExecuteFunctions,
  page: Page,
  operation: string,
  itemIndex: number,
): Promise<any> {
  const dataPropertyName = this.getNodeParameter('dataPropertyName', itemIndex, 'data') as string;

  switch (operation) {
    case 'screenshot': {
      const options = this.getNodeParameter('screenshotOptions', itemIndex, {}) as any;
      
      // Prepare screenshot options
      const screenshotOptions: any = {
        fullPage: options.fullPage || false,
        type: options.type || 'png',
        omitBackground: options.omitBackground || false,
      };

      if (options.quality && options.type === 'jpeg') {
        screenshotOptions.quality = options.quality;
      }

      if (options.clip) {
        try {
          screenshotOptions.clip = typeof options.clip === 'string' 
            ? JSON.parse(options.clip) 
            : options.clip;
        } catch (error) {
          throw new Error('Invalid clip region format. Must be valid JSON.');
        }
      }

      if (options.animations) {
        screenshotOptions.animations = options.animations;
      }

      if (options.caret) {
        screenshotOptions.caret = options.caret;
      }

      if (options.scale) {
        screenshotOptions.scale = options.scale;
      }

      // Take screenshot
      const screenshotBuffer = await page.screenshot(screenshotOptions);

      // Return binary data
      const binaryData = await this.helpers.prepareBinaryData(
        screenshotBuffer,
        `screenshot.${options.type || 'png'}`,
        `image/${options.type || 'png'}`,
      );

      return {
        binary: {
          [dataPropertyName]: binaryData,
        },
        json: {
          url: page.url(),
          fullPage: screenshotOptions.fullPage,
          type: screenshotOptions.type,
        },
      };
    }

    case 'elementScreenshot': {
      const selector = this.getNodeParameter('screenshotSelector', itemIndex) as string;
      const options = this.getNodeParameter('screenshotOptions', itemIndex, {}) as any;
      
      // Wait for element to be visible
      await page.waitForSelector(selector, { state: 'visible', timeout: 30000 });
      
      // Prepare screenshot options
      const screenshotOptions: any = {
        type: options.type || 'png',
        omitBackground: options.omitBackground || false,
      };

      if (options.quality && options.type === 'jpeg') {
        screenshotOptions.quality = options.quality;
      }

      if (options.animations) {
        screenshotOptions.animations = options.animations;
      }

      if (options.caret) {
        screenshotOptions.caret = options.caret;
      }

      if (options.scale) {
        screenshotOptions.scale = options.scale;
      }

      // Take element screenshot
      const element = await page.$(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }

      const screenshotBuffer = await element.screenshot(screenshotOptions);

      // Return binary data
      const binaryData = await this.helpers.prepareBinaryData(
        screenshotBuffer,
        `element-screenshot.${options.type || 'png'}`,
        `image/${options.type || 'png'}`,
      );

      return {
        binary: {
          [dataPropertyName]: binaryData,
        },
        json: {
          url: page.url(),
          selector,
          type: screenshotOptions.type,
        },
      };
    }

    case 'pdf': {
      const options = this.getNodeParameter('pdfOptions', itemIndex, {}) as any;
      
      // Check if browser supports PDF (only Chromium)
      const browserName = page.context().browser()?.browserType().name();
      if (browserName !== 'chromium') {
        throw new Error('PDF generation is only supported in Chromium browser');
      }

      // Prepare PDF options
      const pdfOptions: any = {
        scale: options.scale || 1,
        displayHeaderFooter: options.displayHeaderFooter || false,
        printBackground: options.printBackground || false,
        landscape: options.landscape || false,
        preferCSSPageSize: options.preferCSSPageSize || false,
        outline: options.outline || false,
        tagged: options.tagged || false,
      };

      if (options.headerTemplate) {
        pdfOptions.headerTemplate = options.headerTemplate;
      }

      if (options.footerTemplate) {
        pdfOptions.footerTemplate = options.footerTemplate;
      }

      if (options.pageRanges) {
        pdfOptions.pageRanges = options.pageRanges;
      }

      if (options.format) {
        pdfOptions.format = options.format;
      } else if (options.width || options.height) {
        pdfOptions.width = options.width;
        pdfOptions.height = options.height;
      }

      if (options.margin) {
        try {
          pdfOptions.margin = typeof options.margin === 'string' 
            ? JSON.parse(options.margin) 
            : options.margin;
        } catch (error) {
          throw new Error('Invalid margin format. Must be valid JSON.');
        }
      }

      // Generate PDF
      const pdfBuffer = await page.pdf(pdfOptions);

      // Return binary data
      const binaryData = await this.helpers.prepareBinaryData(
        pdfBuffer,
        'document.pdf',
        'application/pdf',
      );

      return {
        binary: {
          [dataPropertyName]: binaryData,
        },
        json: {
          url: page.url(),
          pageCount: null, // Could be calculated if needed
          landscape: pdfOptions.landscape,
          format: pdfOptions.format,
        },
      };
    }

    default:
      throw new Error(`Unknown screenshot operation: ${operation}`);
  }
}