import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';

import PageStyles from  '../styles/page.css';
@customElement('page-settings')
export class PageSettings extends LitElement {
  static styles = [
    unsafeCSS(PageStyles),
    css`

      form {
        max-width: 600px;
      }

      sl-input, sl-textarea {
        margin: 0 0 1em;
      }

      .label-on-left {
        --label-width: 7rem;
        --gap-width: 1rem;
      }

      .label-on-left + .label-on-left {
        margin-top: var(--sl-spacing-medium);
      }

      .label-on-left::part(form-control) {
        display: grid;
        grid: auto / var(--label-width) 1fr;
        gap: var(--sl-spacing-3x-small) var(--gap-width);
        align-items: center;
      }

      .label-on-left::part(form-control-label) {
        text-align: right;
      }

      .label-on-left::part(form-control-help-text) {
        grid-column-start: 2;
      }
    `
  ]

  constructor() {
    super();
    this.initialize();
  }

  async initialize(){
    this.socialRecord = await datastore.getSocial() || await datastore.createSocial();
    console.log(this.socialRecord);
    this.socialData = await this.socialRecord?.data?.json?.() || {};
  }

  saveSocialInfo(){

  }

  render() {
    return html`
      <section>

        <form id="profile_form">

          <h2>Profile Info</h2>
          <sl-input label="Display Name" help-text="A public name visible to everyone"></sl-input>
          <sl-textarea label="Bio" help-text="Tell people a little about yourself" maxlength="280" rows="4" resize="none"></sl-textarea>

          <h3>Social Accounts</h3>
          <sl-input label="X (Twitter)" class="label-on-left"></sl-input>
          <sl-input label="Instagram" class="label-on-left"></sl-input>
          <sl-input label="Facebook" class="label-on-left"></sl-input>
        </form>

      </section>
    `;
  }
}
