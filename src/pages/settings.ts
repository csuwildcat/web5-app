import { LitElement, html, css, unsafeCSS, nothing } from 'lit';
import { customElement, query, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import { DOM, notify, natives } from '../utils/helpers.js';
import '../components/w5-img'

import PageStyles from  '../styles/page.css';
@customElement('page-settings')
export class PageSettings extends LitElement {
  static styles = [
    unsafeCSS(PageStyles),
    css`

      form {
        max-width: 600px;
      }

      form > :first-child {
        margin-top: 0;
      }

      #profile_image_container {
        display: inline-block;
        margin-bottom: 1.4em;
        cursor: pointer;
      }

      #profile_image {
        width: 7em;
        height: 7em;
        border: 2px dashed rgba(200, 200, 230, 0.5);
        border-radius: 6px;
      }

      #profile_image[loaded] {
        border-style: solid;
      }

      #profile_image::part(fallback) {
        font-size: 3em;
      }

      #profile_image_container small {
        display: block;
        margin: 0.7em 0 0;
        font-size: 0.65em;
        color: rgba(200, 200, 230, 0.5);
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

  @query('#profile_image_input', true)
  avatarInput;

  static properties = {
    socialData: {
      type: Object
    }
  }

  socialRecord: any;
  avatarDataUri: any;
  avatarRecord: any;

  constructor() {
    super();
    this.initialize();
    this.socialData = {
      displayName: '',
      bio: '',
      apps: {}
    }
  }

  async initialize(){
    this.socialRecord = await datastore.getSocial() || await datastore.createSocial({ data: this.socialData });
    this.socialData = await this.socialRecord.cache.json || this.socialData;
    console.log(this.socialRecord);

    await this.setAvatar(null, false);
    this.requestUpdate();
    DOM.skipFrame(() => {
      this.profileForm.toggleAttribute('loading');
      DOM.skipFrame(() => this.profileForm.removeAttribute('loading'));
    });
  }

  async setAvatar(file, update){
    let blob = file ? new Blob([file], { type: file.type }) : undefined;
    try {
      this.avatarRecord = this.avatarRecord || await datastore.getAvatar();
      if (blob) {
        if (this.avatarRecord) await this.avatarRecord.delete();
        this.avatarRecord = await datastore.createAvatar({ data: blob });
        const { status } = await this.avatarRecord.send(userDID);
        console.log(status);
      }
      else if (this.avatarRecord) {
        blob = await this.avatarRecord.data.blob();
      }
    }
    catch(e) {
      console.log(e);
    }
    this.avatarDataUri = blob ? URL.createObjectURL(blob) : undefined;
    console.log(this.avatarDataUri);
    if (update !== false) this.requestUpdate();
  }

  handleFileChange(e){
    this.setAvatar(this.avatarInput.files[0]);
  }

  async saveSocialInfo(e){
    const formData = new FormData(this.profileForm);
    for (const entry of formData.entries()) {
      natives.deepSet(this.socialData, entry[0], entry[1] || undefined);
    }
    try {
      await this.socialRecord.update({ data: this.socialData });
      const { status } = await this.socialRecord.send(userDID)
      console.log('send', status, this.socialRecord);

      notify.success('Your profile info was saved')
    }
    catch(e) {
      notify.error('There was a problem saving your profile info')
    }
  }


  render() {
    return html`
      <section>

        <form id="profile_form" loading @sl-change="${e => this.saveSocialInfo(e)}" @submit="${e => e.preventDefault()}">

          <h2>Profile Info</h2>

          <div id="profile_image_container" @click="${e => console.log(e.currentTarget.lastElementChild.click())}">
            <w5-img id="profile_image" src="${ifDefined(this.avatarDataUri)}" fallback="person"></w5-img>
            <small>(click to change image)</small>
            <input id="profile_image_input" type="file" accept="image/png, image/jpeg, image/gif" style="display: none"  @change="${this.handleFileChange}" />
          </div>

          <sl-input name="displayName" value="${this.socialData.displayName}" label="Display Name" help-text="A public name visible to everyone"></sl-input>
          <sl-textarea name="bio" value="${this.socialData.bio}" label="Bio" help-text="Tell people a little about yourself" maxlength="280" rows="4" resize="none"></sl-textarea>

          <h3>Social Accounts</h3>
          <sl-input label="X (Twitter)" name="apps.x" value="${this.socialData.apps.x}" class="label-on-left"></sl-input>
          <sl-input label="Instagram" name="apps.instagram" value="${this.socialData.apps.instagram}" class="label-on-left"></sl-input>
          <sl-input label="Facebook" name="apps.facebook" value="${this.socialData.apps.facebook}" class="label-on-left"></sl-input>
          <sl-input label="GitHub" name="apps.github" value="${this.socialData.apps.github}" class="label-on-left"></sl-input>
          <sl-input label="Tidal" name="apps.tidal" value="${this.socialData.apps.tidal}" class="label-on-left"></sl-input>
          <sl-input label="LinkedIn" name="apps.linkedin" value="${this.socialData.apps.linkedin}" class="label-on-left"></sl-input>
        </form>

      </section>
    `;
  }
}
