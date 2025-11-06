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

if (typeof File !== "undefined" && !("text" in File.prototype) && "arrayBuffer" in File.prototype) {
  // Polyfill File#text using arrayBuffer for environments lacking the API (e.g. jsdom < 20)
  // @ts-expect-error augmenting File prototype for tests
  File.prototype.text = async function text() {
    const buffer = await this.arrayBuffer();
    return new TextDecoder().decode(buffer);
  };
}
