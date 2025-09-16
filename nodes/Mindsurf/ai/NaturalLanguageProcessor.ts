import { IExecuteFunctions } from 'n8n-workflow';
import { Page } from 'playwright';

export interface NLCommand {
  action: string;
  target?: string;
  value?: string;
  options?: Record<string, any>;
}

export interface NLProcessorConfig {
  systemPrompt?: string;
  model?: string;
  temperature?: number;
}

export class NaturalLanguageProcessor {
  private commandDefinitions: Record<string, any>;

  constructor(config: NLProcessorConfig = {}) {
    this.commandDefinitions = this.getCommandDefinitions();
  }

  private getCommandDefinitions(): Record<string, any> {
    return {
      navigate: {
        description: 'Navigate to a URL',
        params: { target: 'URL to navigate to (required)' },
        examples: ['{ "action": "navigate", "target": "https://google.com" }']
      },
      click: {
        description: 'Click on an element',
        params: { target: 'CSS selector or text selector (required)' },
        examples: ['{ "action": "click", "target": "#submit-button" }', '{ "action": "click", "target": "button:has-text(\'Login\')" }']
      },
      type: {
        description: 'Type text into an input field',
        params: { 
          target: 'CSS selector of input field (required)',
          value: 'Text to type (required)'
        },
        examples: ['{ "action": "type", "target": "input[name=\'search\']", "value": "hello world" }']
      },
      fill: {
        description: 'Fill an input field (clears existing content first)',
        params: { 
          target: 'CSS selector of input field (required)',
          value: 'Text to fill (required)'
        },
        examples: ['{ "action": "fill", "target": "#email", "value": "user@example.com" }']
      },
      screenshot: {
        description: 'Take a screenshot',
        params: { 
          options: {
            fullPage: 'Capture full page (optional, boolean)',
            type: 'Image format: png or jpeg (optional)'
          }
        },
        examples: ['{ "action": "screenshot" }', '{ "action": "screenshot", "options": { "fullPage": true, "type": "png" } }']
      },
      scroll: {
        description: 'Scroll the page',
        params: { 
          options: {
            direction: 'Direction: up, down, left, right (optional)',
            amount: 'Pixels to scroll (optional, number)'
          }
        },
        examples: ['{ "action": "scroll", "options": { "direction": "down", "amount": 500 } }']
      },
      wait: {
        description: 'Wait for an element or timeout',
        params: { 
          target: 'CSS selector to wait for OR timeout in milliseconds',
          options: {
            state: 'Element state: visible, hidden, attached, detached (optional)'
          }
        },
        examples: ['{ "action": "wait", "target": ".results", "options": { "state": "visible" } }', '{ "action": "wait", "target": "3000" }']
      },
      hover: {
        description: 'Hover over an element',
        params: { target: 'CSS selector (required)' },
        examples: ['{ "action": "hover", "target": ".dropdown-trigger" }']
      },
      select: {
        description: 'Select option from dropdown',
        params: { 
          target: 'CSS selector of select element (required)',
          value: 'Option value or label to select (required)'
        },
        examples: ['{ "action": "select", "target": "#country", "value": "USA" }']
      },
      check: {
        description: 'Check a checkbox',
        params: { target: 'CSS selector of checkbox (required)' },
        examples: ['{ "action": "check", "target": "#agree-terms" }']
      },
      uncheck: {
        description: 'Uncheck a checkbox',
        params: { target: 'CSS selector of checkbox (required)' },
        examples: ['{ "action": "uncheck", "target": "#newsletter" }']
      },
      press: {
        description: 'Press a keyboard key',
        params: { 
          target: 'CSS selector of element (required)',
          value: 'Key to press: Enter, Tab, Escape, ArrowDown, etc. (required)'
        },
        examples: ['{ "action": "press", "target": "input", "value": "Enter" }']
      },
      doubleClick: {
        description: 'Double click on an element',
        params: { target: 'CSS selector (required)' },
        examples: ['{ "action": "doubleClick", "target": ".file-item" }']
      },
      rightClick: {
        description: 'Right click on an element',
        params: { target: 'CSS selector (required)' },
        examples: ['{ "action": "rightClick", "target": ".context-menu-target" }']
      },
      extract: {
        description: 'Extract data from the page',
        params: { 
          target: 'CSS selector (required)',
          options: {
            attribute: 'Attribute to extract (optional, default: text content)',
            all: 'Extract from all matching elements (optional, default: false)',
            includeText: 'Include text content when extracting attributes (optional, default: false)',
            limit: 'Maximum number of elements to extract when all=true (optional, default: 100)'
          }
        },
        examples: [
          '{ "action": "extract", "target": "h1" }',
          '{ "action": "extract", "target": "a", "options": { "attribute": "href" } }',
          '{ "action": "extract", "target": ".item", "options": { "all": true } }',
          '{ "action": "extract", "target": "a.link", "options": { "attribute": "href", "all": true, "includeText": true } }'
        ]
      },
      evaluate: {
        description: 'Execute JavaScript code in the page',
        params: { value: 'JavaScript code to execute (required)' },
        examples: ['{ "action": "evaluate", "value": "document.title" }']
      },
      focus: {
        description: 'Focus on an element',
        params: { target: 'CSS selector (required)' },
        examples: ['{ "action": "focus", "target": "input[type=\'text\']" }']
      },
      dragAndDrop: {
        description: 'Drag element and drop on another',
        params: { 
          target: 'CSS selector of element to drag (required)',
          value: 'CSS selector of drop target (required)'
        },
        examples: ['{ "action": "dragAndDrop", "target": ".draggable", "value": ".drop-zone" }']
      },
      upload: {
        description: 'Upload a file',
        params: { 
          target: 'CSS selector of file input (required)',
          value: 'File path to upload (required)'
        },
        examples: ['{ "action": "upload", "target": "input[type=\'file\']", "value": "/path/to/file.pdf" }']
      }
    };
  }

  private getDefaultSystemPrompt(): string {
    const actions = Object.entries(this.commandDefinitions)
      .map(([action, def]) => {
        const params = Object.entries(def.params)
          .map(([key, desc]) => {
            if (typeof desc === 'object' && desc !== null) {
              // For options, show them inline
              const opts = Object.keys(desc).join('/');
              return `${key}[${opts}]`;
            } else {
              return key;
            }
          })
          .join(', ');
        return `- ${action}: ${def.description} (${params || 'no parameters'})`;
      })
      .join('\n');

    const examples = Object.entries(this.commandDefinitions)
      .slice(0, 8) // Show first 8 examples to keep prompt concise
      .map(([action, def]) => def.examples[0])
      .join('\n');

    return `You are a browser automation assistant. Convert natural language commands into structured JSON browser actions.

AVAILABLE ACTIONS:
${actions}

OUTPUT FORMAT:
Return a JSON object with the following structure:
{ "action": "action_name", "target": "selector", "value": "text_or_value", "options": {} }

Note: Only include the fields required for each action. Most actions only need "action" and "target".

SELECTOR FORMATS:
- CSS: "#id", ".class", "tag", "[attribute='value']"
- Text: "button:has-text('Click me')", "text='Exact text'"
- XPath: "//div[@class='example']"

EXAMPLES:
${examples}

IMPORTANT RULES:
1. Always return valid JSON
2. Use appropriate selectors based on page context
3. For navigation, ensure URLs include protocol (http:// or https://)
4. For typing/filling, include both target and value
5. Match the exact action names (case-sensitive)`;
  }

  /**
   * Get command documentation for external use
   */
  public getCommandDocumentation(): string {
    const docs = Object.entries(this.commandDefinitions)
      .map(([action, def]) => {
        const params = Object.entries(def.params)
          .map(([key, desc]) => {
            if (typeof desc === 'object' && desc !== null) {
              // Handle nested options
              const options = Object.entries(desc)
                .map(([optKey, optDesc]) => `    - ${optKey}: ${optDesc}`)
                .join('\n');
              return `  - ${key}:\n${options}`;
            } else {
              return `  - ${key}: ${desc}`;
            }
          })
          .join('\n');
        const examples = def.examples
          .map((ex: string) => `  ${ex}`)
          .join('\n');
        
        return `${action.toUpperCase()}:
Description: ${def.description}
Parameters:
${params}
Examples:
${examples}`;
      })
      .join('\n\n');

    return `MINDSURF BROWSER AUTOMATION COMMANDS
=====================================

${docs}

GENERAL STRUCTURE:
{
  "action": "action_name",  // Required
  "target": "selector",      // Required for most actions
  "value": "text_or_value",  // Required for type, fill, select, etc.
  "options": {}              // Optional parameters
}`;
  }

  /**
   * Parse natural language command into structured format
   * This method is designed to be called with LLM response
   */
  parseCommand(llmResponse: string): NLCommand {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(llmResponse);
      return this.validateCommand(parsed);
    } catch (error) {
      // If not valid JSON, try to extract JSON from the response
      const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return this.validateCommand(parsed);
        } catch (innerError) {
          throw new Error(`Failed to parse LLM response: ${llmResponse}`);
        }
      }
      throw new Error(`Invalid LLM response format: ${llmResponse}`);
    }
  }

  /**
   * Validate and normalize command structure
   */
  private validateCommand(command: any): NLCommand {
    if (!command.action) {
      throw new Error('Command must have an action');
    }

    const validActions = [
      'navigate', 'click', 'type', 'screenshot', 'scroll',
      'wait', 'extract', 'evaluate', 'hover', 'select',
      'check', 'uncheck', 'focus', 'press', 'doubleClick',
      'rightClick', 'dragAndDrop', 'upload', 'download'
    ];

    if (!validActions.includes(command.action)) {
      throw new Error(`Invalid action: ${command.action}`);
    }

    return {
      action: command.action,
      target: command.target,
      value: command.value,
      options: command.options || {}
    };
  }

  /**
   * Execute parsed command on the page
   */
  async executeCommand(
    page: Page,
    command: NLCommand,
    context: IExecuteFunctions,
    itemIndex: number
  ): Promise<any> {
    switch (command.action) {
      case 'navigate':
        if (!command.target) throw new Error('Navigate requires a target URL');
        await page.goto(command.target);
        return { action: 'navigate', url: command.target, success: true };

      case 'click':
        if (!command.target) throw new Error('Click requires a target selector');
        await page.click(command.target);
        return { action: 'click', selector: command.target, success: true };

      case 'type':
        if (!command.target || !command.value) {
          throw new Error('Type requires target selector and value');
        }
        await page.fill(command.target, command.value);
        return { action: 'type', selector: command.target, value: command.value, success: true };

      case 'screenshot':
        const screenshotOptions: any = {
          fullPage: command.options?.fullPage || false,
          type: command.options?.type || 'png'
        };
        const screenshot = await page.screenshot(screenshotOptions);
        const binaryData = await context.helpers.prepareBinaryData(
          screenshot,
          `screenshot.${screenshotOptions.type}`,
          `image/${screenshotOptions.type}`
        );
        return {
          action: 'screenshot',
          binary: binaryData,
          success: true
        };

      case 'scroll':
        const direction = command.options?.direction || 'down';
        const amount = command.options?.amount || 100;
        await page.evaluate(`
          const dir = '${direction}';
          const amt = ${amount};
          if (dir === 'down') window.scrollBy(0, amt);
          else if (dir === 'up') window.scrollBy(0, -amt);
          else if (dir === 'right') window.scrollBy(amt, 0);
          else if (dir === 'left') window.scrollBy(-amt, 0);
        `);
        return { action: 'scroll', direction, amount, success: true };

      case 'wait':
        if (command.target) {
          if (typeof command.target === 'number' || !isNaN(Number(command.target))) {
            await page.waitForTimeout(Number(command.target));
            return { action: 'wait', timeout: Number(command.target), success: true };
          } else {
            const state = command.options?.state || 'visible';
            await page.waitForSelector(command.target, { state: state as any });
            return { action: 'wait', selector: command.target, state, success: true };
          }
        }
        throw new Error('Wait requires a target (selector or timeout)');

      case 'extract':
        if (!command.target) throw new Error('Extract requires a target selector');
        const attribute = command.options?.attribute;
        const extractAll = command.options?.all === true; // Default to false (single element)
        const includeText = command.options?.includeText || false;
        const limit = command.options?.limit || 100; // Max elements to extract when all=true
        
        let extracted;
        
        if (extractAll) {
          // Extract from all matching elements
          extracted = await page.$$eval(command.target, (elements, opts) => {
            const results = elements.slice(0, opts.limit).map(el => {
              const data: any = {};
              
              if (opts.attribute) {
                data[opts.attribute] = el.getAttribute(opts.attribute);
              } else {
                data.text = el.textContent?.trim();
              }
              
              if (opts.includeText && opts.attribute) {
                data.text = el.textContent?.trim();
              }
              
              // Add selector info if element has id or unique class
              if (el.id) {
                data.selector = `#${el.id}`;
              }
              
              return data;
            });
            
            return results;
          }, { attribute, includeText, limit });
        } else {
          // Extract from first matching element only
          if (attribute) {
            extracted = await page.getAttribute(command.target, attribute);
          } else {
            extracted = await page.textContent(command.target);
          }
          
          // If includeText is true for single element
          if (includeText && attribute) {
            const text = await page.textContent(command.target);
            extracted = {
              [attribute]: extracted,
              text: text
            };
          }
        }
        
        // For single results, return the value directly
        if (!extractAll) {
          if (attribute) {
            // When extracting an attribute with includeText
            if (includeText && typeof extracted === 'object') {
              return {
                action: 'extract',
                selector: command.target,
                attribute,
                ...extracted,
                success: true
              };
            }
            // Just the attribute value
            return {
              action: 'extract',
              selector: command.target,
              attribute,
              value: extracted,
              success: true
            };
          } else {
            // Just text content
            return {
              action: 'extract',
              selector: command.target,
              text: extracted,
              success: true
            };
          }
        }
        
        // For multiple results, keep the data array
        return { 
          action: 'extract', 
          selector: command.target, 
          data: extracted, 
          count: Array.isArray(extracted) ? extracted.length : 1,
          extractAll: extractAll,
          success: true 
        };

      case 'evaluate':
        if (!command.value) throw new Error('Evaluate requires JavaScript code');
        const result = await page.evaluate(command.value);
        return { action: 'evaluate', result, success: true };

      case 'hover':
        if (!command.target) throw new Error('Hover requires a target selector');
        await page.hover(command.target);
        return { action: 'hover', selector: command.target, success: true };

      case 'select':
        if (!command.target || !command.value) {
          throw new Error('Select requires target selector and value');
        }
        await page.selectOption(command.target, command.value);
        return { action: 'select', selector: command.target, value: command.value, success: true };

      case 'check':
        if (!command.target) throw new Error('Check requires a target selector');
        await page.check(command.target);
        return { action: 'check', selector: command.target, success: true };

      case 'uncheck':
        if (!command.target) throw new Error('Uncheck requires a target selector');
        await page.uncheck(command.target);
        return { action: 'uncheck', selector: command.target, success: true };

      case 'focus':
        if (!command.target) throw new Error('Focus requires a target selector');
        await page.focus(command.target);
        return { action: 'focus', selector: command.target, success: true };

      case 'press':
        if (!command.target || !command.value) {
          throw new Error('Press requires target selector and key');
        }
        await page.press(command.target, command.value);
        return { action: 'press', selector: command.target, key: command.value, success: true };

      case 'doubleClick':
        if (!command.target) throw new Error('Double click requires a target selector');
        await page.dblclick(command.target);
        return { action: 'doubleClick', selector: command.target, success: true };

      case 'rightClick':
        if (!command.target) throw new Error('Right click requires a target selector');
        await page.click(command.target, { button: 'right' });
        return { action: 'rightClick', selector: command.target, success: true };

      case 'dragAndDrop':
        if (!command.target || !command.value) {
          throw new Error('Drag and drop requires source and target selectors');
        }
        await page.dragAndDrop(command.target, command.value);
        return { action: 'dragAndDrop', from: command.target, to: command.value, success: true };

      case 'upload':
        if (!command.target || !command.value) {
          throw new Error('Upload requires target selector and file path');
        }
        await page.setInputFiles(command.target, command.value);
        return { action: 'upload', selector: command.target, file: command.value, success: true };

      case 'download':
        // This would need special handling for downloads
        return { action: 'download', message: 'Download handling requires special setup', success: false };

      default:
        throw new Error(`Unsupported action: ${command.action}`);
    }
  }

  /**
   * Build prompt for LLM
   */
  buildPrompt(userCommand: string, context?: string, includeCommands: boolean = true): string {
    let prompt = '';
    
    // Use system prompt or build one with commands
    if (includeCommands) {
      prompt = this.getDefaultSystemPrompt() + '\n\n';
    } else {
      // Minimal prompt without command details
      prompt = `You are a browser automation assistant. Convert natural language commands into structured JSON browser actions.\n\n`;
    }
    
    if (context) {
      prompt += `CURRENT PAGE CONTEXT:\n${context}\n\n`;
    }
    
    prompt += `USER COMMAND: "${userCommand}"\n\n`;
    prompt += 'Please convert the user command to a JSON command following the format and rules above:';
    
    return prompt;
  }

  /**
   * Extract page context for better understanding
   */
  async extractPageContext(page: Page): Promise<string> {
    const context = await page.evaluate(() => {
      // Helper function to check if element is visible
      const isVisible = (elem: any) => {
        if (!elem) return false;
        // @ts-ignore - This runs in browser context
        const style = window.getComputedStyle(elem);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               elem.offsetParent !== null;
      };

      // Helper function to get selector for element
      const getSelector = (elem: any) => {
        if (elem.id) return `#${elem.id}`;
        if (elem.className && typeof elem.className === 'string') {
          const classes = elem.className.trim().split(/\s+/).join('.');
          if (classes) return `.${classes}`;
        }
        return elem.tagName.toLowerCase();
      };

      // Helper function to get element attributes
      const getAttributes = (elem: any) => {
        const attrs: any = {};
        for (const attr of elem.attributes || []) {
          if (['id', 'class', 'name', 'type', 'placeholder', 'value', 'href', 'src', 'alt', 'title', 'role', 'aria-label'].includes(attr.name)) {
            attrs[attr.name] = attr.value;
          }
        }
        return attrs;
      };

      // Basic page info
      // @ts-ignore - This runs in browser context
      const title = document.title;
      // @ts-ignore - This runs in browser context
      const url = window.location.href;
      // @ts-ignore - This runs in browser context
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

      // Navigation elements (menus, nav bars)
      // @ts-ignore - This runs in browser context
      const navigation = Array.from(document.querySelectorAll('nav, [role="navigation"], .nav, .navbar, .menu'))
        .filter(isVisible)
        .slice(0, 3)
        .map((nav: any) => ({
          selector: getSelector(nav),
          links: Array.from(nav.querySelectorAll('a'))
            .filter(isVisible)
            .slice(0, 10)
            .map((a: any) => ({
              text: a.textContent?.trim(),
              href: a.href,
              selector: getSelector(a)
            }))
            .filter((l: any) => l.text)
        }));

      // Headings with hierarchy
      // @ts-ignore - This runs in browser context
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'))
        .filter(isVisible)
        .slice(0, 10)
        .map((h: any) => ({
          level: parseInt(h.tagName.substring(1)),
          text: h.textContent?.trim(),
          selector: getSelector(h)
        }))
        .filter((h: any) => h.text);

      // Interactive elements with more details
      // @ts-ignore - This runs in browser context
      const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], [role="button"], .btn'))
        .filter(isVisible)
        .slice(0, 15)
        .map((b: any) => ({
          text: b.textContent?.trim() || b.value || b.getAttribute('aria-label') || '',
          selector: getSelector(b),
          type: b.type || 'button',
          disabled: b.disabled,
          attributes: getAttributes(b)
        }))
        .filter((b: any) => b.text || b.attributes['aria-label']);

      // Forms and their fields
      // @ts-ignore - This runs in browser context
      const forms = Array.from(document.querySelectorAll('form'))
        .filter(isVisible)
        .slice(0, 3)
        .map((form: any) => ({
          selector: getSelector(form),
          name: form.name || form.id || '',
          action: form.action,
          method: form.method,
          fields: Array.from(form.querySelectorAll('input, textarea, select'))
            .filter(isVisible)
            .slice(0, 20)
            .map((field: any) => ({
              type: field.tagName.toLowerCase() === 'select' ? 'select' : field.type,
              name: field.name,
              id: field.id,
              selector: getSelector(field),
              placeholder: field.placeholder,
              required: field.required,
              value: field.type === 'password' ? '[hidden]' : field.value,
              label: field.labels?.[0]?.textContent?.trim() || '',
              options: field.tagName.toLowerCase() === 'select' 
                ? Array.from(field.options || []).map((opt: any) => ({
                    value: opt.value,
                    text: opt.text
                  }))
                : undefined
            }))
            .filter((f: any) => f.name || f.id)
        }));

      // All input fields (including those not in forms)
      // @ts-ignore - This runs in browser context
      const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea, select'))
        .filter(isVisible)
        .filter((i: any) => !forms.some((f: any) => f.fields.some((field: any) => field.id === i.id || field.name === i.name)))
        .slice(0, 10)
        .map((i: any) => ({
          type: i.tagName.toLowerCase() === 'select' ? 'select' : i.type,
          name: i.name,
          id: i.id,
          selector: getSelector(i),
          placeholder: i.placeholder,
          required: i.required,
          value: i.type === 'password' ? '[hidden]' : i.value,
          label: i.labels?.[0]?.textContent?.trim() || ''
        }))
        .filter((i: any) => i.name || i.id);

      // Links with categorization
      // @ts-ignore - This runs in browser context
      const links = Array.from(document.querySelectorAll('a'))
        .filter(isVisible)
        .slice(0, 20)
        .map((a: any) => ({
          text: a.textContent?.trim(),
          href: a.href,
          selector: getSelector(a),
          // @ts-ignore - This runs in browser context
          isExternal: a.hostname !== window.location.hostname,
          hasImage: a.querySelector('img') !== null,
          attributes: getAttributes(a)
        }))
        .filter((l: any) => l.text && l.href && !l.href.startsWith('javascript:'));

      // Images with context
      // @ts-ignore - This runs in browser context
      const images = Array.from(document.querySelectorAll('img'))
        .filter(isVisible)
        .slice(0, 10)
        .map((img: any) => ({
          src: img.src,
          alt: img.alt,
          selector: getSelector(img),
          width: img.width,
          height: img.height,
          isLogo: img.className?.includes('logo') || img.id?.includes('logo') || img.alt?.toLowerCase().includes('logo')
        }))
        .filter((img: any) => img.src);

      // Tables
      // @ts-ignore - This runs in browser context
      const tables = Array.from(document.querySelectorAll('table'))
        .filter(isVisible)
        .slice(0, 3)
        .map((table: any) => ({
          selector: getSelector(table),
          headers: Array.from(table.querySelectorAll('th'))
            .slice(0, 10)
            .map((th: any) => th.textContent?.trim())
            .filter(Boolean),
          rowCount: table.querySelectorAll('tr').length,
          columnCount: table.querySelector('tr')?.querySelectorAll('td, th').length || 0
        }));

      // Lists
      // @ts-ignore - This runs in browser context
      const lists = Array.from(document.querySelectorAll('ul, ol'))
        .filter(isVisible)
        .filter((list: any) => list.children.length > 0)
        .slice(0, 5)
        .map((list: any) => ({
          selector: getSelector(list),
          type: list.tagName.toLowerCase(),
          itemCount: list.children.length,
          items: Array.from(list.children)
            .slice(0, 5)
            .map((li: any) => li.textContent?.trim())
            .filter(Boolean)
        }));

      // Main content area detection
      // @ts-ignore - This runs in browser context
      const mainContent = document.querySelector('main, [role="main"], #main, .main, #content, .content, article');
      const mainContentInfo = mainContent && isVisible(mainContent) ? {
        selector: getSelector(mainContent),
        text: mainContent.textContent?.trim().substring(0, 500) + '...'
      } : null;

      // Page state indicators
      // @ts-ignore - This runs in browser context
      const modals = Array.from(document.querySelectorAll('.modal, [role="dialog"], .popup, .overlay'))
        .filter(isVisible)
        .map((modal: any) => ({
          selector: getSelector(modal),
          isOpen: true
        }));

      // Error messages
      // @ts-ignore - This runs in browser context  
      const errors = Array.from(document.querySelectorAll('.error, .alert-danger, [role="alert"], .validation-error'))
        .filter(isVisible)
        .map((error: any) => ({
          text: error.textContent?.trim(),
          selector: getSelector(error)
        }))
        .filter((e: any) => e.text);

      // Success messages
      // @ts-ignore - This runs in browser context
      const successes = Array.from(document.querySelectorAll('.success, .alert-success, .notification'))
        .filter(isVisible)
        .map((success: any) => ({
          text: success.textContent?.trim(),
          selector: getSelector(success)
        }))
        .filter((s: any) => s.text);

      return {
        // Basic info
        title,
        url,
        description,
        
        // Structure
        navigation,
        headings,
        mainContent: mainContentInfo,
        
        // Interactive elements
        forms,
        inputs,
        buttons,
        links,
        
        // Media
        images,
        
        // Data
        tables,
        lists,
        
        // State
        modals,
        errors,
        successes,
        
        // Summary
        summary: {
          formCount: forms.length,
          inputCount: inputs.length + forms.reduce((acc: number, f: any) => acc + f.fields.length, 0),
          buttonCount: buttons.length,
          linkCount: links.length,
          imageCount: images.length,
          tableCount: tables.length,
          hasNavigation: navigation.length > 0,
          hasErrors: errors.length > 0,
          hasModal: modals.length > 0
        }
      };
    });

    return JSON.stringify(context, null, 2);
  }
}