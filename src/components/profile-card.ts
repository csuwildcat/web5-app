import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, query } from 'lit/decorators.js';

import { DOM, notify } from '../utils/helpers.js';
import './global.js'

import '../components/w5-img'

@customElement('profile-card')
export class ProfileCard extends LitElement {
  static styles = [
    css`

      :host {

      }

    `
  ]

  static properties = {
    did: {
      type: String,
      reflect: true
    }
  };


  constructor() {
    super();
  }

  set did(did){
    console.log(this.did);
    Promise.all([
      datastore.getAvatar({ from: did }).then(async ({ record }) => {
        const blob = record.data.blob();
        this.avatarDataUri = blob ? URL.createObjectURL(blob) : undefined;
        console.log(this.avatarDataUri);
      }),
      datastore.getSocial({ from: did }).then(async ({ record }) => {
        this.socialData = record.data.json() || {};
        console.log(this.socialData);
      })
    ]).then(() => {
      if (this.did === did) this.requestUpdate()
    })
  }

  async follow(did){

  }

  async unfollow(did){

  }

  render() {
    return html`
      <w5-img id="profile_image" src="${ ifDefined(this.avatarDataUri) }" fallback="person"></w5-img>
    `;
  }
}
