import { JSDOM } from 'jsdom';

const { window } = new JSDOM('<!doctype html><html><body></body></html>');

const g = (global as any);
g.window = window;
g.document = window.document;
g.navigator = window.navigator;
g.HTMLElement = (window as any).HTMLElement;
