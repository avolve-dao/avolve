/**
 * Jest polyfills for Node.js environment
 * These polyfills are needed for browser APIs used in tests
 */

// Polyfill for TextEncoder/TextDecoder
const util = require('util');
global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;

// Mock URL and URLSearchParams if needed
const url = require('url');
global.URL = url.URL;
global.URLSearchParams = url.URLSearchParams;

// Mock Web APIs required by undici
class MessageChannel {
  constructor() {
    this.port1 = new MessagePort();
    this.port2 = new MessagePort();
  }
}

class MessagePort {
  constructor() {
    this.onmessage = null;
    this.onmessageerror = null;
  }
  
  postMessage(message) {
    if (this.onmessage) {
      this.onmessage({ data: message });
    }
  }
  
  start() {}
  close() {}
  
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
}

global.MessagePort = MessagePort;
global.MessageChannel = MessageChannel;
global.MessageEvent = class MessageEvent {};
global.ErrorEvent = class ErrorEvent {};
global.Event = class Event {};
global.EventTarget = class EventTarget {};
global.DOMException = class DOMException extends Error {};
global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));

// Mock ReadableStream
global.ReadableStream = class ReadableStream {
  constructor() {}
  getReader() {
    return {
      read: () => Promise.resolve({ done: true, value: undefined }),
      releaseLock: () => {},
    };
  }
};

// Mock WritableStream
global.WritableStream = class WritableStream {
  constructor() {}
  getWriter() {
    return {
      write: () => Promise.resolve(),
      close: () => Promise.resolve(),
      abort: () => Promise.resolve(),
      releaseLock: () => {},
    };
  }
};

// Mock TransformStream
global.TransformStream = class TransformStream {
  constructor() {
    this.readable = new global.ReadableStream();
    this.writable = new global.WritableStream();
  }
};

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

// Setup global jest object for ESM modules
global.jest = jest;
