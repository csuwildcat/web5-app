import { LitElement, html, css, unsafeCSS, nothing } from 'lit';
import { customElement, query, property } from 'lit/decorators.js';

import { DOM, notify, natives } from '../utils/helpers.js';

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
        --label-width: 5.5rem;
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

  @query('#profile_form', true)
  profileForm;

  @property()
  socialData = {
    displayName: '',
    bio: '',
    apps: {}
  }


  constructor() {
    super();
    this.initialize();
  }

  async initialize(){
    this.socialRecord = await datastore.getSocial() || await datastore.createSocial(this.socialData);
    this.socialData = await this.socialRecord?.data?.json?.() || this.socialData;
    this.requestUpdate();
    DOM.skipFrame(() => {
      this.profileForm.toggleAttribute('loading');
      DOM.skipFrame(() => this.profileForm.removeAttribute('loading'));
    });
  }

  async saveSocialInfo(e){
    const formData = new FormData(this.profileForm);
    for (const entry of formData.entries()) {
      natives.deepSet(this.socialData, entry[0], entry[1] || undefined);
    }
    try {
      await this.socialRecord.update({ data: this.socialData })
      notify.success('Your profile info was saved')
    }
    catch(e) {
      notify.error('There was a problem saving your profile info')
    }
  }

  render() {
    console.log(this.loaded);
    return html`
      <section>

        <form id="profile_form" loading @sl-change="${e => this.saveSocialInfo(e)}">

          <h2>Profile Info</h2>
          <sl-input name="displayName" value="${this.socialData.displayName}" label="Display Name" help-text="A public name visible to everyone"></sl-input>
          <sl-textarea name="bio" value="${this.socialData.bio}" label="Bio" help-text="Tell people a little about yourself" maxlength="280" rows="4" resize="none"></sl-textarea>

          <h3>Social Accounts</h3>
          <sl-input name="apps.x" value="${this.socialData.apps.x}" label="X (Twitter)" class="label-on-left"></sl-input>
          <sl-input name="apps.instagram" value="${this.socialData.apps.instagram}" label="Instagram" class="label-on-left"></sl-input>
          <sl-input name="apps.facebook" value="${this.socialData.apps.facebook}" label="Facebook" class="label-on-left"></sl-input>
          <sl-input name="apps.github" value="${this.socialData.apps.github}" label="GitHub" class="label-on-left"></sl-input>
          <sl-input name="apps.tidal" value="${this.socialData.apps.tidal}" label="Tidal" class="label-on-left"></sl-input>
          <sl-input name="apps.linkedin" value="${this.socialData.apps.linkedin}" label="LinkedIn" class="label-on-left"></sl-input>
        </form>

      </section>
    `;
  }
}
