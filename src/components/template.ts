import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, query, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

@customElement('some-element')
export class SomeElement extends LitElement {
  static styles = [
    css`

      :host {

      }
    `
  ]

  static properties = {
    foo: { type: String },
  };

  constructor() {
    super();
  }

  async firstUpdated() {
    console.log('first update');
  }

  render() {
    return html`<div>testing 1, 2, 3</div>`;
  }
}
