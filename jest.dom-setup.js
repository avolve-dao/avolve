/**
 * Setup file for JSDOM environment in Jest tests
 * This file ensures that JSDOM is properly configured for component tests
 */

// Mock document implementation for JSDOM
if (typeof document === 'undefined') {
  const jsdom = require('jsdom');
  const { JSDOM } = jsdom;
  
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost:3000',
    referrer: 'http://localhost:3000',
    contentType: 'text/html',
    includeNodeLocations: true,
    storageQuota: 10000000,
    pretendToBeVisual: true,
  });
  
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = {
    userAgent: 'node.js',
    language: 'en-US',
  };
  
  // Mock window location
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000',
      hostname: 'localhost',
      port: '3000',
      pathname: '/',
      search: '',
      hash: '',
    },
    writable: true,
  });
  
  // Mock localStorage and sessionStorage
  global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  
  global.sessionStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  
  // Mock window.matchMedia
  global.matchMedia = jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
  
  // Mock window.scrollTo
  global.scrollTo = jest.fn();
  
  // Mock window.getComputedStyle
  global.getComputedStyle = jest.fn();
  
  // Add any other browser APIs that your tests might need
  global.HTMLElement.prototype.scrollIntoView = jest.fn();
  global.HTMLElement.prototype.getBoundingClientRect = jest.fn(() => ({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    x: 0,
    y: 0,
    toJSON: () => {},
  }));
}
