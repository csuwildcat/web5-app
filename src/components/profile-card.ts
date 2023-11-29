import { LitElement, html, css, unsafeCSS, nothing } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import { DOM, notify } from '../utils/helpers.js';
import './global.js'

import '../components/w5-img'

@customElement('profile-card')
export class ProfileCard extends LitElement {
  static styles = [
    css`

      :host {
        display: flex;
        gap: 1rem;
        max-width: 600px;
      }

      w5-img {
        border: 2px solid rgba(200, 200, 230, 0.5);
        border-radius: 0.2em;
      }

      #content {
        flex: 1;
        position: relative;
      }

      :host([loading]) :is(h3, p, sl-button) {
        opacity: 0;
      }

      :is(h3, p, sl-button) {
        transition: opacity 0.5s ease;
      }

      h3 {
        margin: 0 0 0.5em 0;
      }

      p {
        margin: 0;
      }

      #content_skeleton {
        display: none;
        position: absolute;
        top: 0px;
        left: 0px;
        height: 100%;
        width: 100%;
      }

      :host([loading]) #content_skeleton {
        display: block;
      }

      sl-skeleton:nth-of-type(1) {
        width: 40%;
        margin: 0 0 1em;
      }
      sl-skeleton:nth-of-type(2) {
        width: 100%;
        margin: 0 0 0.4em;
      }

      sl-skeleton:nth-of-type(3) {
        width: 95%;
        margin: 0 0 0.4em;
      }

      sl-skeleton:nth-of-type(4) {
        width: 80%;
        margin: 0 0 0.4em;
      }
    `
  ]

  static properties = {
    loading: {
      type: Boolean,
      reflect: true
    },
    did: {
      type: String,
      reflect: true
    },
    following: {
      type: Boolean,
      reflect: true
    },
    followButton: {
      type: Boolean,
      reflect: true,
      attribute: 'follow-button'
    },
    removeUnfollowed: {
      type: Boolean,
      reflect: true,
      attribute: 'remove-unfollowed'
    }
  };

  static instances = [];

  constructor() {
    super();
  }

  connectedCallback(){
    super.connectedCallback();
    ProfileCard.instances.push(this);
  }

  disconnectedCallback(){
    super.disconnectedCallback();
    const index = ProfileCard.instances.indexOf(this)
    ProfileCard.instances.splice(index, 1);
  }

  set did(did){
    this.loading = true;
    Promise.all([
      datastore.readAvatar(did, 'uri').then(async uri => {
        this.avatarDataUri = uri || undefined;
      }),
      datastore.getSocial({ from: did }).then(async record => {
        this.socialData = await record.data.json() || {};
      })
    ]).then(() => {
      if (this.getAttribute('did') === did) this.requestUpdate();
      this.loading = false;
    }).catch(e => {
      this.loading = false;
    })
  }

  get did(){
    return this.getAttribute('did');
  }

  set following(val){
    const state = !!val;
    this._following = state;
    if (!state && this.removeUnfollowed) this.remove();
  }

  get following(){
    return this._following;
  }

  async toggleFollow(){
    const did = this.did;
    const state = !this.following;
    await datastore.toggleFollow(did, state);
    if (did === this.did) {
      this.following = state;
    }

    DOM.fireEvent(document, 'follow-change', {
      composed: true,
      detail: {
        did: did,
        following: state
      }
    });
  }

  render() {
    return html`
      <w5-img src="${ ifDefined(this.avatarDataUri) }" fallback="person"></w5-img>
      <div id="content">
        <h3>${this?.socialData?.displayName || 'Anon'}</h3>
        <p>${this?.socialData?.bio || ''}</p>
        <div id="content_skeleton">
          <sl-skeleton effect="sheen"></sl-skeleton>
          <sl-skeleton effect="sheen"></sl-skeleton>
          <sl-skeleton effect="sheen"></sl-skeleton>
          <sl-skeleton effect="sheen"></sl-skeleton>
        </div>
      </div>
      ${
        this.followButton ?
          html`<sl-button id="follow_button" variant="${this.following ? 'default' : 'primary' }" @click="${e => this.toggleFollow()}">${this.following ? 'Unfollow' : 'Follow' }</sl-button>` :
          nothing
      }
    `;
  }
}
