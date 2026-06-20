import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock IndexedDB for jsdom test environment
const idbRequest = (result: unknown) => {
  const req: Record<string, unknown> = {
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
    result,
    _onsuccess: null,
    _onerror: null,
    _onupgradeneeded: null,
  };
  Object.defineProperty(req, "onsuccess", {
    set(fn: (() => void) | null) {
      req._onsuccess = fn;
      if (fn) queueMicrotask(() => fn());
    },
    get() { return req._onsuccess ?? null; },
  });
  Object.defineProperty(req, "onerror", {
    set(fn: (() => void) | null) {
      req._onerror = fn;
    },
    get() { return req._onerror ?? null; },
  });
  Object.defineProperty(req, "onupgradeneeded", {
    set(fn: (() => void) | null) {
      req._onupgradeneeded = fn;
    },
    get() { return req._onupgradeneeded ?? null; },
  });
  return req;
};

const objectStoreMock = {
  put: vi.fn(() => {
    const req = idbRequest(undefined);
    queueMicrotask(() => {
      if (typeof req._onsuccess === "function") req._onsuccess();
    });
    return req;
  }),
  get: vi.fn(() => idbRequest(undefined)),
  delete: vi.fn(() => {
    const req = idbRequest(undefined);
    queueMicrotask(() => {
      if (typeof req._onsuccess === "function") req._onsuccess();
    });
    return req;
  }),
};

const transactionMock: Record<string, unknown> = {
  objectStore: vi.fn(() => objectStoreMock),
  oncomplete: null,
  onerror: null,
  _oncomplete: null,
};

Object.defineProperty(transactionMock, "oncomplete", {
  set(fn: (() => void) | null) {
    transactionMock._oncomplete = fn;
    if (fn) queueMicrotask(() => fn());
  },
  get() { return transactionMock._oncomplete ?? null; },
});

const dbMock = {
  createObjectStore: vi.fn(),
  transaction: vi.fn(() => transactionMock),
};

const indexedDBMock = {
  open: vi.fn(() => idbRequest(dbMock)),
};

if (typeof globalThis.indexedDB === "undefined") {
  Object.defineProperty(globalThis, "indexedDB", { value: indexedDBMock, writable: true });
}
