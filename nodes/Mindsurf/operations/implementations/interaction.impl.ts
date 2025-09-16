import { IExecuteFunctions } from 'n8n-workflow';
import { Page } from 'playwright';

export async function executeInteractionOperation(
  this: IExecuteFunctions,
  page: Page,
  operation: string,
  itemIndex: number,
): Promise<any> {
  switch (operation) {
    case 'click':
    case 'dblclick':
    case 'rightClick': {
      const selector = this.getNodeParameter('interactionSelector', itemIndex) as string;
      const clickOptions = this.getNodeParameter('clickOptions', itemIndex, {}) as any;
      
      const options: any = {
        button: clickOptions.button || 'left',
        clickCount: operation === 'dblclick' ? 2 : (clickOptions.clickCount || 1),
        delay: clickOptions.delay || 0,
        force: clickOptions.force || false,
        noWaitAfter: clickOptions.noWaitAfter || false,
        trial: clickOptions.trial || false,
        timeout: clickOptions.timeout || 30000,
      };

      if (clickOptions.position) {
        try {
          options.position = typeof clickOptions.position === 'string'
            ? JSON.parse(clickOptions.position)
            : clickOptions.position;
        } catch (error) {
          throw new Error('Invalid position format. Must be valid JSON.');
        }
      }

      if (clickOptions.modifiers && clickOptions.modifiers.length > 0) {
        options.modifiers = clickOptions.modifiers;
      }

      // Error handling settings
      const errorHandling = clickOptions.errorHandling || 'throw';
      const checkVisibility = clickOptions.checkVisibility !== false; // default true
      const checkClickable = clickOptions.checkClickable !== false; // default true
      const waitBeforeClick = clickOptions.waitBeforeClick || 0;
      const retryCount = clickOptions.retryCount || 3;

      // Wait before click if specified
      if (waitBeforeClick > 0) {
        await page.waitForTimeout(waitBeforeClick);
      }

      // Pre-click checks
      if (!options.force && (checkVisibility || checkClickable)) {
        try {
          // Check if element exists
          const element = await page.$(selector);
          if (!element) {
            if (errorHandling === 'soft') {
              return {
                action: operation,
                selector,
                success: false,
                error: 'Element not found',
                elementFound: false,
              };
            } else {
              throw new Error(`Element not found: ${selector}`);
            }
          }

          // Check visibility
          if (checkVisibility) {
            const isVisible = await page.isVisible(selector);
            if (!isVisible) {
              if (errorHandling === 'soft') {
                return {
                  action: operation,
                  selector,
                  success: false,
                  error: 'Element not visible',
                  elementFound: true,
                  visible: false,
                };
              } else if (errorHandling === 'retry') {
                // Try scrolling to element
                await page.evaluate((sel) => {
                  // @ts-ignore - This runs in browser context
                  const elem = document.querySelector(sel);
                  if (elem) {
                    elem.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                  }
                }, selector);
                await page.waitForTimeout(500);
              } else {
                throw new Error(`Element not visible: ${selector}`);
              }
            }
          }

          // Check if element is clickable (not disabled, not covered by other elements)
          if (checkClickable) {
            const isClickable = await page.evaluate((sel) => {
              // @ts-ignore - This runs in browser context
              const elem = document.querySelector(sel) as any;
              if (!elem) return false;
              
              // Check if disabled
              if (elem.disabled || elem.getAttribute('aria-disabled') === 'true') {
                return false;
              }
              
              // Check if element is in viewport and not covered
              const rect = elem.getBoundingClientRect();
              const x = rect.left + rect.width / 2;
              const y = rect.top + rect.height / 2;
              // @ts-ignore - This runs in browser context
              const topElement = document.elementFromPoint(x, y);
              
              // Check if the element at point is our element or its child
              return elem.contains(topElement);
            }, selector);

            if (!isClickable) {
              if (errorHandling === 'soft') {
                return {
                  action: operation,
                  selector,
                  success: false,
                  error: 'Element not clickable (may be disabled or covered)',
                  elementFound: true,
                  visible: true,
                  clickable: false,
                };
              } else if (errorHandling !== 'retry') {
                throw new Error(`Element not clickable: ${selector}`);
              }
            }
          }
        } catch (checkError: any) {
          if (errorHandling === 'soft') {
            return {
              action: operation,
              selector,
              success: false,
              error: checkError.message,
            };
          } else if (errorHandling !== 'retry') {
            throw checkError;
          }
        }
      }

      // Perform the click action with retry logic
      let lastError: any = null;
      const maxRetries = errorHandling === 'retry' ? retryCount : 1;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          if (operation === 'rightClick') {
            await page.click(selector, { ...options, button: 'right' });
          } else {
            await page.click(selector, options);
          }
          
          return {
            action: operation,
            selector,
            success: true,
            attempts: attempt,
          };
        } catch (error: any) {
          lastError = error;
          
          if (errorHandling === 'soft') {
            return {
              action: operation,
              selector,
              success: false,
              error: error.message,
              attempts: attempt,
            };
          } else if (errorHandling === 'retry' && attempt < maxRetries) {
            // Wait before retry
            await page.waitForTimeout(1000 * attempt); // Progressive backoff
            
            // Try different strategies
            if (attempt === 2 && !options.force) {
              // Second attempt: try with force
              options.force = true;
            } else if (attempt === 3) {
              // Third attempt: try with JavaScript click
              try {
                await page.evaluate((sel) => {
                  // @ts-ignore - This runs in browser context
                  const elem = document.querySelector(sel) as any;
                  if (elem) {
                    elem.click();
                  } else {
                    throw new Error('Element not found for JavaScript click');
                  }
                }, selector);
                
                return {
                  action: operation,
                  selector,
                  success: true,
                  attempts: attempt,
                  method: 'javascript',
                };
              } catch (jsError) {
                // JavaScript click also failed, continue to throw error
              }
            }
          } else {
            throw error;
          }
        }
      }
      
      // All retries failed
      if (lastError) {
        if (errorHandling === 'soft' || errorHandling === 'retry') {
          return {
            action: operation,
            selector,
            success: false,
            error: lastError.message,
            attempts: maxRetries,
          };
        } else {
          throw lastError;
        }
      }

      return {
        action: operation,
        selector,
        success: true,
      };
    }

    case 'type': {
      const selector = this.getNodeParameter('interactionSelector', itemIndex) as string;
      const text = this.getNodeParameter('text', itemIndex) as string;
      const typeOptions = this.getNodeParameter('typeOptions', itemIndex, {}) as any;
      
      const options: any = {
        delay: typeOptions.delay || 0,
        noWaitAfter: typeOptions.noWaitAfter || false,
        timeout: typeOptions.timeout || 30000,
      };

      await page.type(selector, text, options);

      // Press key after typing if specified
      const pressKeyAfter = typeOptions.pressKeyAfter || 'none';
      if (pressKeyAfter !== 'none') {
        await page.press(selector, pressKeyAfter);
      }

      return {
        action: 'type',
        selector,
        textLength: text.length,
        keyPressed: pressKeyAfter !== 'none' ? pressKeyAfter : undefined,
        success: true,
      };
    }

    case 'fill': {
      const selector = this.getNodeParameter('interactionSelector', itemIndex) as string;
      const text = this.getNodeParameter('text', itemIndex) as string;
      
      await page.fill(selector, text, {
        timeout: 30000,
        noWaitAfter: false,
      });

      return {
        action: 'fill',
        selector,
        value: text,
        success: true,
      };
    }

    case 'clear': {
      const selector = this.getNodeParameter('interactionSelector', itemIndex) as string;
      
      await page.fill(selector, '', {
        timeout: 30000,
      });

      return {
        action: 'clear',
        selector,
        success: true,
      };
    }

    case 'select': {
      const selector = this.getNodeParameter('interactionSelector', itemIndex) as string;
      const selectValue = this.getNodeParameter('selectValue', itemIndex) as string;
      
      // Split comma-separated values for multiple selection
      const values = selectValue.split(',').map(v => v.trim());
      
      const selectedValues = await page.selectOption(selector, values, {
        timeout: 30000,
      });

      return {
        action: 'select',
        selector,
        selectedValues,
        success: true,
      };
    }

    case 'check': {
      const selector = this.getNodeParameter('interactionSelector', itemIndex) as string;
      const checkState = this.getNodeParameter('checkState', itemIndex) as string;
      
      if (checkState === 'check') {
        await page.check(selector, {
          timeout: 30000,
        });
      } else {
        await page.uncheck(selector, {
          timeout: 30000,
        });
      }

      return {
        action: checkState,
        selector,
        success: true,
      };
    }

    case 'hover': {
      const selector = this.getNodeParameter('interactionSelector', itemIndex) as string;
      
      await page.hover(selector, {
        timeout: 30000,
      });

      return {
        action: 'hover',
        selector,
        success: true,
      };
    }

    case 'focus': {
      const selector = this.getNodeParameter('interactionSelector', itemIndex) as string;
      
      await page.focus(selector, {
        timeout: 30000,
      });

      return {
        action: 'focus',
        selector,
        success: true,
      };
    }

    case 'press': {
      const key = this.getNodeParameter('key', itemIndex) as string;
      
      await page.keyboard.press(key);

      return {
        action: 'press',
        key,
        success: true,
      };
    }

    case 'upload': {
      const selector = this.getNodeParameter('interactionSelector', itemIndex) as string;
      const filePath = this.getNodeParameter('filePath', itemIndex) as string;
      
      // Handle file upload
      const fileInput = await page.$(selector);
      if (!fileInput) {
        throw new Error(`File input not found: ${selector}`);
      }

      await fileInput.setInputFiles(filePath);

      return {
        action: 'upload',
        selector,
        filePath,
        success: true,
      };
    }

    case 'dragAndDrop': {
      const sourceSelector = this.getNodeParameter('sourceSelector', itemIndex) as string;
      const targetSelector = this.getNodeParameter('targetSelector', itemIndex) as string;
      
      await page.dragAndDrop(sourceSelector, targetSelector);

      return {
        action: 'dragAndDrop',
        source: sourceSelector,
        target: targetSelector,
        success: true,
      };
    }

    case 'scroll': {
      const scrollDirection = this.getNodeParameter('scrollDirection', itemIndex) as string;
      
      if (scrollDirection === 'toElement') {
        const scrollTarget = this.getNodeParameter('scrollTarget', itemIndex) as string;
        await page.locator(scrollTarget).scrollIntoViewIfNeeded();
        
        return {
          action: 'scroll',
          direction: 'toElement',
          target: scrollTarget,
          success: true,
        };
      } else {
        const scrollDistance = this.getNodeParameter('scrollDistance', itemIndex, 100) as number;
        
        let scrollX = 0;
        let scrollY = 0;
        
        switch (scrollDirection) {
          case 'down':
            scrollY = scrollDistance;
            break;
          case 'up':
            scrollY = -scrollDistance;
            break;
          case 'left':
            scrollX = -scrollDistance;
            break;
          case 'right':
            scrollX = scrollDistance;
            break;
        }
        
        await page.mouse.wheel(scrollX, scrollY);
        
        return {
          action: 'scroll',
          direction: scrollDirection,
          distance: scrollDistance,
          success: true,
        };
      }
    }

    case 'tap': {
      const selector = this.getNodeParameter('interactionSelector', itemIndex) as string;
      
      await page.tap(selector, {
        timeout: 30000,
      });

      return {
        action: 'tap',
        selector,
        success: true,
      };
    }

    case 'swipe': {
      const swipeDirection = this.getNodeParameter('swipeDirection', itemIndex) as string;
      const swipeDistance = this.getNodeParameter('swipeDistance', itemIndex, 100) as number;
      
      // Get viewport size for swipe calculation
      const viewport = page.viewportSize();
      if (!viewport) {
        throw new Error('Viewport size not available');
      }
      
      const centerX = viewport.width / 2;
      const centerY = viewport.height / 2;
      
      let startX = centerX;
      let startY = centerY;
      let endX = centerX;
      let endY = centerY;
      
      switch (swipeDirection) {
        case 'up':
          startY = centerY + swipeDistance / 2;
          endY = centerY - swipeDistance / 2;
          break;
        case 'down':
          startY = centerY - swipeDistance / 2;
          endY = centerY + swipeDistance / 2;
          break;
        case 'left':
          startX = centerX + swipeDistance / 2;
          endX = centerX - swipeDistance / 2;
          break;
        case 'right':
          startX = centerX - swipeDistance / 2;
          endX = centerX + swipeDistance / 2;
          break;
      }
      
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, endY, { steps: 10 });
      await page.mouse.up();
      
      return {
        action: 'swipe',
        direction: swipeDirection,
        distance: swipeDistance,
        success: true,
      };
    }

    default:
      throw new Error(`Unknown interaction operation: ${operation}`);
  }
}