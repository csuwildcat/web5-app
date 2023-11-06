import { LitElement, html, css, unsafeCSS } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import '../components/global.js'
import PageStyles from  '../styles/page.css';

@customElement('page-home')
export class PageHome extends LitElement {

  constructor() {
    super();
  }

  static styles = [
    unsafeCSS(PageStyles),
    css`

    `
  ]

  render() {
    return html`

    `;
  }
}
