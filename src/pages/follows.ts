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

  async firstUpdated() {
    console.log('Follow page updated');
  }

  async onPageEnter(){
    console.log('Follow page is showing');
  }

  async onPageLeave(){
    console.log('Follow page is hiding');
  }

  render() {
    return html`
      <section style="height: 1900px">
        List of follows you are following.
      </section>
    `;
  }
}
