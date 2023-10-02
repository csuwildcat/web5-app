import { LitElement, html, css, unsafeCSS } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement } from 'lit/decorators.js';

import MarkdownStyles from  '../styles/markdown-docs.css';

@customElement('page-docs')
export class PageDocs extends LitElement {
  static styles = [
    unsafeCSS(MarkdownStyles),
    css`

      :host > * {
        max-width: var(--content-max-width);
      }

      :host > section {
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      :host([state="active"]) {
        z-index: 1;
      }

      :host([state="active"]) > section {
        opacity: 1;
      }
    `
  ]

  static properties = {
    docsHTML: { type: String },
  };

  constructor() {
    super();
    this.docsHTML = '';
    fetch('/docs.html')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((text) => {
        this.docsHTML = text.split('<h2>Project Resources</h2>')[0];
        this.requestUpdate();
      })
      .catch((error) => {
        this.docsHTML = '<p>Error loading docs file</p>';
        this.requestUpdate();
        console.error('Fetch Error: ', error);
      });
  }

  async firstUpdated() {
    console.log('This is the docs page');
  }

  async onPageEnter(){
    console.log('Docs page is showing');
  }

  async onPageLeave(){
    console.log('Docs page is hiding');
  }

  render() {
    return html`<div class="markdown-body">${unsafeHTML(this.docsHTML)}</div>`;
  }
}
