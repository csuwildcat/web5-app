import { LitElement, html, css, unsafeCSS, nothing  } from 'lit';
import { customElement, query, property } from 'lit/decorators.js';

import * as markdown from  '../utils/markdown.js';

import PageStyles from  '../styles/page.css';
import { DOM } from '../utils/helpers.js';
import './global.js'

@customElement('markdown-content')
export class MarkdownContent extends LitElement {
  static styles = [
    unsafeCSS(PageStyles),
    markdown.styles,
    css`
      :host {
        display: block;
        width: 100%;
        background: none;
      }

      :host > :first-child {
        margin-top: 0;
      }
    `
  ]

  static properties = {
    data: {
      type: Object
    }
  };

  constructor() {
    super();
  }

  // createRenderRoot() {
  //   return this;
  // }

  render() {
    if (this.data) {
      const content = markdown.render(this.data);
      this.shadowRoot.innerHTML = '';
      this.shadowRoot.appendChild(content);
    }
  }
}
