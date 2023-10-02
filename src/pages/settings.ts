import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('page-settings')
export class PageSettings extends LitElement {
  static styles = [
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

  constructor() {
    super();
  }

  async firstUpdated() {
    console.log('This is your settings page');
  }

  async onPageEnter(){
    console.log('Settings page is showing');
  }

  async onPageLeave(){
    console.log('Settings page is hiding');
  }

  render() {
    return html`
      <section style="height: 1900px">
        If you need a settings page, put it here.
      </section>
    `;
  }
}
