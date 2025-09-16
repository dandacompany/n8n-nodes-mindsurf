import { IExecuteFunctions } from 'n8n-workflow';
import { Page } from 'playwright';

export async function executeEvaluateOperation(
  this: IExecuteFunctions,
  page: Page,
  operation: string,
  itemIndex: number,
): Promise<any> {
  switch (operation) {
    case 'evaluate': {
      const code = this.getNodeParameter('code', itemIndex) as string;
      const evaluateArgs = this.getNodeParameter('evaluateArgs', itemIndex, '') as string;
      const polling = this.getNodeParameter('polling', itemIndex, 'none') as string;
      const timeout = this.getNodeParameter('evaluateTimeout', itemIndex, 30000) as number;
      
      let args: any[] = [];
      if (evaluateArgs) {
        try {
          args = typeof evaluateArgs === 'string' ? JSON.parse(evaluateArgs) : evaluateArgs;
        } catch (error) {
          throw new Error('Invalid arguments format. Must be valid JSON array.');
        }
      }

      let result;
      if (polling !== 'none') {
        // Wait for function with polling
        const options: any = { timeout };
        
        if (polling === 'interval') {
          const pollingInterval = this.getNodeParameter('pollingInterval', itemIndex, 100) as number;
          options.polling = pollingInterval;
        } else {
          options.polling = polling;
        }
        
        // Pass code as string to be evaluated
        result = await page.waitForFunction(code as any, options, ...args);
        result = await result.jsonValue();
      } else {
        // Direct evaluation - pass code as string
        result = await page.evaluate(code as any, ...args);
      }

      return {
        result,
        success: true,
      };
    }

    case 'evaluateHandle': {
      const code = this.getNodeParameter('code', itemIndex) as string;
      const evaluateArgs = this.getNodeParameter('evaluateArgs', itemIndex, '') as string;
      
      let args: any[] = [];
      if (evaluateArgs) {
        try {
          args = typeof evaluateArgs === 'string' ? JSON.parse(evaluateArgs) : evaluateArgs;
        } catch (error) {
          throw new Error('Invalid arguments format. Must be valid JSON array.');
        }
      }

      // Get handle to result - pass code as string
      const handle = await page.evaluateHandle(code as any, ...args);
      const result = await handle.jsonValue();
      await handle.dispose();

      return {
        result,
        success: true,
      };
    }

    case 'getText': {
      const selector = this.getNodeParameter('evaluateSelector', itemIndex) as string;
      const timeout = this.getNodeParameter('evaluateTimeout', itemIndex, 30000) as number;
      const extractOptions = this.getNodeParameter('extractOptions', itemIndex, {}) as any;
      const extractAll = extractOptions.all || false;
      const limit = extractOptions.limit || 100;
      const includeSelector = extractOptions.includeSelector || false;
      
      // Wait for element
      await page.waitForSelector(selector, { state: 'attached', timeout });
      
      let result;
      
      if (extractAll) {
        // Extract text from all matching elements
        result = await page.$$eval(selector, (elements, opts) => {
          return elements.slice(0, opts.limit).map(el => {
            const data: any = {
              text: el.textContent?.trim() || ''
            };
            if (opts.includeSelector && el.id) {
              data.selector = `#${el.id}`;
            }
            return data;
          });
        }, { limit, includeSelector });
      } else {
        // Extract from first element only
        const text = await page.textContent(selector);
        result = text;
      }

      // For single results, return the value directly
      if (!extractAll && typeof result === 'string') {
        return {
          text: result,
          selector,
          success: true,
        };
      }
      
      return {
        data: result,
        selector,
        count: Array.isArray(result) ? result.length : 1,
        extractAll,
        success: true,
      };
    }

    case 'getAttribute': {
      const selector = this.getNodeParameter('evaluateSelector', itemIndex) as string;
      const attributeName = this.getNodeParameter('attributeName', itemIndex) as string;
      const timeout = this.getNodeParameter('evaluateTimeout', itemIndex, 30000) as number;
      const extractOptions = this.getNodeParameter('extractOptions', itemIndex, {}) as any;
      const extractAll = extractOptions.all || false;
      const limit = extractOptions.limit || 100;
      const includeSelector = extractOptions.includeSelector || false;
      
      // Wait for element
      await page.waitForSelector(selector, { state: 'attached', timeout });
      
      let result;
      
      if (extractAll) {
        // Extract attribute from all matching elements
        result = await page.$$eval(selector, (elements, opts) => {
          return elements.slice(0, opts.limit).map(el => {
            const data: any = {
              [opts.attributeName]: el.getAttribute(opts.attributeName)
            };
            if (opts.includeSelector && el.id) {
              data.selector = `#${el.id}`;
            }
            return data;
          });
        }, { limit, includeSelector, attributeName });
      } else {
        // Extract from first element only
        const value = await page.getAttribute(selector, attributeName);
        result = value;
      }

      // For single results, return the value directly
      if (!extractAll) {
        return {
          attribute: attributeName,
          value: result,
          selector,
          success: true,
        };
      }
      
      return {
        attribute: attributeName,
        data: result,
        selector,
        count: Array.isArray(result) ? result.length : 1,
        extractAll,
        success: true,
      };
    }

    case 'getProperty': {
      const selector = this.getNodeParameter('evaluateSelector', itemIndex) as string;
      const propertyName = this.getNodeParameter('propertyName', itemIndex) as string;
      const timeout = this.getNodeParameter('evaluateTimeout', itemIndex, 30000) as number;
      const extractOptions = this.getNodeParameter('extractOptions', itemIndex, {}) as any;
      const extractAll = extractOptions.all || false;
      const limit = extractOptions.limit || 100;
      const includeSelector = extractOptions.includeSelector || false;
      
      // Wait for element
      await page.waitForSelector(selector, { state: 'attached', timeout });
      
      let result;
      
      if (extractAll) {
        // Extract property from all matching elements
        const elements = await page.$$(selector);
        result = await Promise.all(
          elements.slice(0, limit).map(async (element, index) => {
            const property = await element.getProperty(propertyName);
            const value = await property.jsonValue();
            const data: any = {
              [propertyName]: value
            };
            if (includeSelector) {
              const id = await element.evaluate(el => el.id);
              if (id) data.selector = `#${id}`;
            }
            return data;
          })
        );
      } else {
        // Extract from first element only
        const element = await page.$(selector);
        if (!element) {
          throw new Error(`Element not found: ${selector}`);
        }
        const property = await element.getProperty(propertyName);
        result = await property.jsonValue();
      }

      // For single results, return the value directly
      if (!extractAll) {
        return {
          property: propertyName,
          value: result,
          selector,
          success: true,
        };
      }
      
      return {
        property: propertyName,
        data: result,
        selector,
        count: Array.isArray(result) ? result.length : 1,
        extractAll,
        success: true,
      };
    }

    case 'getElement': {
      const selector = this.getNodeParameter('evaluateSelector', itemIndex) as string;
      const timeout = this.getNodeParameter('evaluateTimeout', itemIndex, 30000) as number;
      const extractOptions = this.getNodeParameter('extractOptions', itemIndex, {}) as any;
      const extractAll = extractOptions.all || false;
      const limit = extractOptions.limit || 100;
      const includeSelector = extractOptions.includeSelector || false;
      const selectorStrategy = extractOptions.selectorStrategy || 'attributes';
      
      // Wait for element
      await page.waitForSelector(selector, { state: 'attached', timeout });
      
      let result;
      
      if (extractAll) {
        // Get details for all matching elements
        result = await page.$$eval(selector, (elements, opts) => {
          return elements.slice(0, opts.limit).map(el => {
            // Get full selector path with improved algorithm
            const getSelectorPath = (element: any): string => {
              const path: string[] = [];
              let current = element;
              
              while (current && current.nodeType === 1) { // 1 = ELEMENT_NODE
                let selector = current.tagName.toLowerCase();
                
                if (current.id) {
                  selector = '#' + current.id;
                  path.unshift(selector);
                  // ID is unique, we can stop here for minimal strategy
                  if (opts.selectorStrategy === 'minimal') {
                    break;
                  }
                  // For other strategies, continue to show full path
                  if (opts.selectorStrategy !== 'full') {
                    break;
                  }
                } else {
                  // Strategy: attributes first
                  if (opts.selectorStrategy === 'attributes' || opts.selectorStrategy === 'minimal') {
                    // Try to use unique attributes first
                    let uniqueSelector = selector;
                    let isUnique = false;
                    
                    // Check for name attribute
                    if (current.hasAttribute('name')) {
                      const nameAttr = current.getAttribute('name');
                      uniqueSelector = `${selector}[name="${nameAttr}"]`;
                      // Check if this selector is unique among siblings
                      if (current.parentElement) {
                        const matches = Array.from(current.parentElement.querySelectorAll(uniqueSelector));
                        isUnique = matches.length === 1 && matches[0] === current;
                      } else {
                        isUnique = true;
                      }
                    }
                    
                    // If not unique, try data attributes
                    if (!isUnique) {
                      for (const attr of current.attributes) {
                        if (attr.name.startsWith('data-')) {
                          uniqueSelector = `${selector}[${attr.name}="${attr.value}"]`;
                          if (current.parentElement) {
                            const matches = Array.from(current.parentElement.querySelectorAll(uniqueSelector));
                            if (matches.length === 1 && matches[0] === current) {
                              isUnique = true;
                              break;
                            }
                          }
                        }
                      }
                    }
                    
                    // If not unique, try aria-label
                    if (!isUnique && current.hasAttribute('aria-label')) {
                      const ariaLabel = current.getAttribute('aria-label');
                      uniqueSelector = `${selector}[aria-label="${ariaLabel}"]`;
                      if (current.parentElement) {
                        const matches = Array.from(current.parentElement.querySelectorAll(uniqueSelector));
                        isUnique = matches.length === 1 && matches[0] === current;
                      }
                    }
                    
                    // If not unique, try type attribute (for inputs)
                    if (!isUnique && current.hasAttribute('type')) {
                      const typeAttr = current.getAttribute('type');
                      uniqueSelector = `${selector}[type="${typeAttr}"]`;
                      if (current.parentElement) {
                        const matches = Array.from(current.parentElement.querySelectorAll(uniqueSelector));
                        isUnique = matches.length === 1 && matches[0] === current;
                      }
                    }
                    
                    // If unique with attributes, use that
                    if (isUnique) {
                      selector = uniqueSelector;
                    } else {
                      // Add class if exists
                      if (current.className && typeof current.className === 'string') {
                        const classes = current.className.trim().split(/\s+/).filter((c: string) => c);
                        if (classes.length > 0) {
                          selector += '.' + classes.join('.');
                        }
                      }
                      
                      // Check if this selector is unique among siblings
                      if (current.parentElement) {
                        const siblings = Array.from(current.parentElement.children).filter(
                          (child: any) => {
                            // Build same selector for sibling
                            let sibSelector = child.tagName.toLowerCase();
                            if (child.className && typeof child.className === 'string') {
                              const sibClasses = child.className.trim().split(/\s+/).filter((c: string) => c);
                              if (sibClasses.length > 0) {
                                sibSelector += '.' + sibClasses.join('.');
                              }
                            }
                            return sibSelector === selector;
                          }
                        );
                        
                        // Only add nth-child if there are duplicates
                        if (siblings.length > 1) {
                          const index = siblings.indexOf(current) + 1;
                          selector += `:nth-child(${index})`;
                        }
                      }
                    }
                  } else {
                    // Full path strategy - always include classes and nth-child
                    if (current.className && typeof current.className === 'string') {
                      const classes = current.className.trim().split(/\s+/).filter((c: string) => c);
                      if (classes.length > 0) {
                        selector += '.' + classes.join('.');
                      }
                    }
                    
                    // Add nth-child if there are siblings of same type
                    const parent = current.parentElement;
                    if (parent) {
                      const siblings = Array.from(parent.children).filter(
                        (child: any) => child.tagName === current.tagName
                      );
                      if (siblings.length > 1) {
                        const index = siblings.indexOf(current) + 1;
                        selector += `:nth-child(${index})`;
                      }
                    }
                  }
                  
                  path.unshift(selector);
                }
                current = current.parentElement;
              }
              
              return path.join(' > ');
            };
            
            const data: any = {
              tagName: el.tagName.toLowerCase(),
              outerHTML: el.outerHTML,
              innerHTML: el.innerHTML,
              textContent: el.textContent?.trim() || '',
              selectorPath: getSelectorPath(el),
              attributes: {} as any
            };
            
            // Get all attributes
            for (const attr of el.attributes) {
              data.attributes[attr.name] = attr.value;
            }
            
            // Get computed styles (common ones)
            // @ts-ignore - This runs in browser context
            const styles = window.getComputedStyle(el);
            data.computedStyles = {
              display: styles.display,
              visibility: styles.visibility,
              position: styles.position,
              width: styles.width,
              height: styles.height,
              color: styles.color,
              backgroundColor: styles.backgroundColor,
              fontSize: styles.fontSize,
              fontWeight: styles.fontWeight
            };
            
            // Get bounding rect
            const rect = el.getBoundingClientRect();
            data.boundingRect = {
              top: rect.top,
              left: rect.left,
              bottom: rect.bottom,
              right: rect.right,
              width: rect.width,
              height: rect.height
            };
            
            if (opts.includeSelector && el.id) {
              data.selector = `#${el.id}`;
            }
            
            return data;
          });
        }, { limit, includeSelector, selectorStrategy });
      } else {
        // Get details for first element only
        result = await page.$eval(selector, (el, opts) => {
          // Get full selector path with improved algorithm
          const getSelectorPath = (element: any): string => {
            const path: string[] = [];
            let current = element;
            
            while (current && current.nodeType === 1) { // 1 = ELEMENT_NODE
              let selector = current.tagName.toLowerCase();
              
              if (current.id) {
                selector = '#' + current.id;
                path.unshift(selector);
                // ID is unique, we can stop here for minimal strategy
                if (opts.selectorStrategy === 'minimal') {
                  break;
                }
                // For other strategies, continue to show full path
                if (opts.selectorStrategy !== 'full') {
                  break;
                }
              } else {
                // Strategy: attributes first
                if (opts.selectorStrategy === 'attributes' || opts.selectorStrategy === 'minimal') {
                  // Try to use unique attributes first
                  let uniqueSelector = selector;
                  let isUnique = false;
                  
                  // Check for name attribute
                  if (current.hasAttribute('name')) {
                    const nameAttr = current.getAttribute('name');
                    uniqueSelector = `${selector}[name="${nameAttr}"]`;
                    // Check if this selector is unique among siblings
                    if (current.parentElement) {
                      const matches = Array.from(current.parentElement.querySelectorAll(uniqueSelector));
                      isUnique = matches.length === 1 && matches[0] === current;
                    } else {
                      isUnique = true;
                    }
                  }
                  
                  // If not unique, try data attributes
                  if (!isUnique) {
                    for (const attr of current.attributes) {
                      if (attr.name.startsWith('data-')) {
                        uniqueSelector = `${selector}[${attr.name}="${attr.value}"]`;
                        if (current.parentElement) {
                          const matches = Array.from(current.parentElement.querySelectorAll(uniqueSelector));
                          if (matches.length === 1 && matches[0] === current) {
                            isUnique = true;
                            break;
                          }
                        }
                      }
                    }
                  }
                  
                  // If not unique, try aria-label
                  if (!isUnique && current.hasAttribute('aria-label')) {
                    const ariaLabel = current.getAttribute('aria-label');
                    uniqueSelector = `${selector}[aria-label="${ariaLabel}"]`;
                    if (current.parentElement) {
                      const matches = Array.from(current.parentElement.querySelectorAll(uniqueSelector));
                      isUnique = matches.length === 1 && matches[0] === current;
                    }
                  }
                  
                  // If not unique, try type attribute (for inputs)
                  if (!isUnique && current.hasAttribute('type')) {
                    const typeAttr = current.getAttribute('type');
                    uniqueSelector = `${selector}[type="${typeAttr}"]`;
                    if (current.parentElement) {
                      const matches = Array.from(current.parentElement.querySelectorAll(uniqueSelector));
                      isUnique = matches.length === 1 && matches[0] === current;
                    }
                  }
                  
                  // If unique with attributes, use that
                  if (isUnique) {
                    selector = uniqueSelector;
                  } else {
                    // Add class if exists
                    if (current.className && typeof current.className === 'string') {
                      const classes = current.className.trim().split(/\s+/).filter((c: string) => c);
                      if (classes.length > 0) {
                        selector += '.' + classes.join('.');
                      }
                    }
                    
                    // Check if this selector is unique among siblings
                    if (current.parentElement) {
                      const siblings = Array.from(current.parentElement.children).filter(
                        (child: any) => {
                          // Build same selector for sibling
                          let sibSelector = child.tagName.toLowerCase();
                          if (child.className && typeof child.className === 'string') {
                            const sibClasses = child.className.trim().split(/\s+/).filter((c: string) => c);
                            if (sibClasses.length > 0) {
                              sibSelector += '.' + sibClasses.join('.');
                            }
                          }
                          return sibSelector === selector;
                        }
                      );
                      
                      // Only add nth-child if there are duplicates
                      if (siblings.length > 1) {
                        const index = siblings.indexOf(current) + 1;
                        selector += `:nth-child(${index})`;
                      }
                    }
                  }
                } else {
                  // Full path strategy - always include classes and nth-child
                  if (current.className && typeof current.className === 'string') {
                    const classes = current.className.trim().split(/\s+/).filter((c: string) => c);
                    if (classes.length > 0) {
                      selector += '.' + classes.join('.');
                    }
                  }
                  
                  // Add nth-child if there are siblings of same type
                  const parent = current.parentElement;
                  if (parent) {
                    const siblings = Array.from(parent.children).filter(
                      (child: any) => child.tagName === current.tagName
                    );
                    if (siblings.length > 1) {
                      const index = siblings.indexOf(current) + 1;
                      selector += `:nth-child(${index})`;
                    }
                  }
                }
                
                path.unshift(selector);
              }
              current = current.parentElement;
            }
            
            return path.join(' > ');
          };
          
          const data: any = {
            tagName: el.tagName.toLowerCase(),
            outerHTML: el.outerHTML,
            innerHTML: el.innerHTML,
            textContent: el.textContent?.trim() || '',
            selectorPath: getSelectorPath(el),
            attributes: {} as any
          };
          
          // Get all attributes
          for (const attr of el.attributes) {
            data.attributes[attr.name] = attr.value;
          }
          
          // Get computed styles
          // @ts-ignore - This runs in browser context
          const styles = window.getComputedStyle(el);
          data.computedStyles = {
            display: styles.display,
            visibility: styles.visibility,
            position: styles.position,
            width: styles.width,
            height: styles.height,
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight
          };
          
          // Get bounding rect
          const rect = el.getBoundingClientRect();
          data.boundingRect = {
            top: rect.top,
            left: rect.left,
            bottom: rect.bottom,
            right: rect.right,
            width: rect.width,
            height: rect.height
          };
          
          return data;
        }, { selectorStrategy });
      }

      // For single results, return the element details directly
      if (!extractAll) {
        return {
          ...result,
          selector,
          success: true,
        };
      }
      
      return {
        data: result,
        selector,
        count: Array.isArray(result) ? result.length : 1,
        extractAll,
        success: true,
      };
    }

    case 'getContent': {
      const content = await page.content();

      return {
        content,
        length: content.length,
        success: true,
      };
    }

    case 'getUrl': {
      const url = page.url();

      return {
        url,
        success: true,
      };
    }

    case 'getTitle': {
      const title = await page.title();

      return {
        title,
        success: true,
      };
    }

    case 'count': {
      const selector = this.getNodeParameter('evaluateSelector', itemIndex) as string;
      
      const count = await page.locator(selector).count();

      return {
        count,
        selector,
        success: true,
      };
    }

    case 'exists': {
      const selector = this.getNodeParameter('evaluateSelector', itemIndex) as string;
      const timeout = this.getNodeParameter('evaluateTimeout', itemIndex, 30000) as number;
      
      let exists = false;
      try {
        await page.waitForSelector(selector, { state: 'attached', timeout: Math.min(timeout, 5000) });
        exists = true;
      } catch (error) {
        exists = false;
      }

      return {
        exists,
        selector,
        success: true,
      };
    }

    case 'isVisible': {
      const selector = this.getNodeParameter('evaluateSelector', itemIndex) as string;
      const extractOptions = this.getNodeParameter('extractOptions', itemIndex, {}) as any;
      const extractAll = extractOptions.all || false;
      const limit = extractOptions.limit || 100;
      const includeSelector = extractOptions.includeSelector || false;
      
      let result;
      
      if (extractAll) {
        // Check visibility for all matching elements
        result = await page.$$eval(selector, (elements, opts) => {
          return elements.slice(0, opts.limit).map(el => {
            // @ts-ignore - This runs in browser context
            const style = window.getComputedStyle(el);
            const isVisible = style.display !== 'none' && 
                            style.visibility !== 'hidden' && 
                            style.opacity !== '0' &&
                            el.offsetParent !== null;
            const data: any = {
              visible: isVisible
            };
            if (opts.includeSelector && el.id) {
              data.selector = `#${el.id}`;
            }
            return data;
          });
        }, { limit, includeSelector });
      } else {
        // Check first element only
        const isVisible = await page.isVisible(selector);
        result = isVisible;
      }

      // For single results, return the boolean value directly
      if (!extractAll) {
        return {
          visible: result,
          selector,
          success: true,
        };
      }
      
      return {
        data: result,
        selector,
        count: Array.isArray(result) ? result.length : 1,
        extractAll,
        success: true,
      };
    }

    case 'isEnabled': {
      const selector = this.getNodeParameter('evaluateSelector', itemIndex) as string;
      const extractOptions = this.getNodeParameter('extractOptions', itemIndex, {}) as any;
      const extractAll = extractOptions.all || false;
      const limit = extractOptions.limit || 100;
      const includeSelector = extractOptions.includeSelector || false;
      
      let result;
      
      if (extractAll) {
        // Check enabled state for all matching elements
        result = await page.$$eval(selector, (elements, opts) => {
          return elements.slice(0, opts.limit).map(el => {
            const isEnabled = !(el as any).disabled;
            const data: any = {
              enabled: isEnabled
            };
            if (opts.includeSelector && el.id) {
              data.selector = `#${el.id}`;
            }
            return data;
          });
        }, { limit, includeSelector });
      } else {
        // Check first element only
        const isEnabled = await page.isEnabled(selector);
        result = isEnabled;
      }

      // For single results, return the boolean value directly
      if (!extractAll) {
        return {
          enabled: result,
          selector,
          success: true,
        };
      }
      
      return {
        data: result,
        selector,
        count: Array.isArray(result) ? result.length : 1,
        extractAll,
        success: true,
      };
    }

    case 'isChecked': {
      const selector = this.getNodeParameter('evaluateSelector', itemIndex) as string;
      const extractOptions = this.getNodeParameter('extractOptions', itemIndex, {}) as any;
      const extractAll = extractOptions.all || false;
      const limit = extractOptions.limit || 100;
      const includeSelector = extractOptions.includeSelector || false;
      
      let result;
      
      if (extractAll) {
        // Check checked state for all matching elements
        result = await page.$$eval(selector, (elements, opts) => {
          return elements.slice(0, opts.limit).map(el => {
            const isChecked = (el as any).checked || false;
            const data: any = {
              checked: isChecked
            };
            if (opts.includeSelector && el.id) {
              data.selector = `#${el.id}`;
            }
            return data;
          });
        }, { limit, includeSelector });
      } else {
        // Check first element only
        const isChecked = await page.isChecked(selector);
        result = isChecked;
      }

      // For single results, return the boolean value directly
      if (!extractAll) {
        return {
          checked: result,
          selector,
          success: true,
        };
      }
      
      return {
        data: result,
        selector,
        count: Array.isArray(result) ? result.length : 1,
        extractAll,
        success: true,
      };
    }

    default:
      throw new Error(`Unknown evaluate operation: ${operation}`);
  }
}