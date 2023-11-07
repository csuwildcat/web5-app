import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';

import PageStyles from  '../styles/page.css';

@customElement('page-follows')
export class PageFollows extends LitElement {
  static styles = [
    unsafeCSS(PageStyles),
    css`

    `
  ]

  constructor() {
    super();
  }

  render() {
    return html`
      <section>
        List of follows you are following.
      </section>
    `;
  }
}
