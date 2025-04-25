/**
 * Jest polyfills for Node.js environment
 * These polyfills are needed for browser APIs used in tests
 */

// Polyfill for TextEncoder/TextDecoder
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock URL and URLSearchParams if needed
import { URL, URLSearchParams } from 'url';
global.URL = URL;
global.URLSearchParams = URLSearchParams;

// Mock other browser APIs
global.Request = class Request {};
global.Response = class Response {
  constructor() {
    this.headers = new Map();
    this.status = 200;
  }
};
global.Headers = class Headers {
  constructor() {
    this._headers = {};
  }
  get(key) {
    return this._headers[key.toLowerCase()];
  }
  set(key, value) {
    this._headers[key.toLowerCase()] = value;
  }
  append(key, value) {
    this._headers[key.toLowerCase()] = value;
  }
  has(key) {
    return key.toLowerCase() in this._headers;
  }
  delete(key) {
    delete this._headers[key.toLowerCase()];
  }
  entries() {
    return Object.entries(this._headers);
  }
};

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200,
    headers: new global.Headers(),
  })
);

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};
