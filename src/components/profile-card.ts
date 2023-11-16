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
      relfect: true
    }
  };


  constructor() {
    super();
  }

  set did(uri){
    console.log(uri);
    datastore.getAvatar({ from: uri }).then(({ record }) => {
      console.log()
      if (this.did === uri) {
        this.avatarRecord = record;

      }
    })
  }

  async follow(did){

  }

  async unfollow(did){

  }

  render() {
    return html`
      <w5-img id="profile_image" src="${ this.did }" fallback="person"></w5-img>
    `;
  }
}
