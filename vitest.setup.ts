import "@testing-library/jest-dom";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== "undefined" && !("ResizeObserver" in window)) {
  // @ts-expect-error jsdom lacks ResizeObserver; provide minimal stub for tests
  window.ResizeObserver = ResizeObserverStub;
}
