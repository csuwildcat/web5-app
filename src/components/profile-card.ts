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
        max-width: 600px;
        cursor: default;
      }

        :host([minimal]) {
          align-items: center
        }

        :host([minimal]) h3 {
          font-weight: normal;
        }

        :host([vertical]) {
          flex-direction: column;
        }

      slot[name="start"]:not(:slotted) {
        display: none;
      }

      w5-img {
        margin: 0 1rem 0 0;
        border: 2px solid rgba(200, 200, 230, 0.5);
        border-radius: 0.2rem;
      }

        :host([vertical]) w5-img {
          --size: 5rem;
          margin: 0 0 0.5rem;
        }

        :host([minimal]) w5-img {
          --size: 2.25rem;
          border-width: 1px;
        }

        :host([minimal]) w5-img::part(fallback) {
          font-size: 1.5rem;
        }




      #content {
        flex: 1;
        position: relative;
        margin: 0 1em 0 0;
      }

      :host([loading]) :is(h3, p, sl-button) {
        opacity: 0;
      }

      :is(h3, p, sl-button) {
        transition: opacity 0.5s ease;
      }

      h3 {
        margin: -0.1em 0 0;
        font-size: 110%;
        text-wrap: nowrap;
      }

      p {
        margin: 0.3em 0 0;
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

      slot[name="content-bottom"] {
        margin: 0.5em 0 0;
      }

      sl-skeleton:nth-of-type(1) {
        width: 40%;
        min-width: 7em;
        margin: 0 0 0.2rem;
      }

        :host([vertical]) sl-skeleton:nth-of-type(1) {
          width: 100%;
        }

      sl-skeleton:nth-of-type(2) {
        width: 100%;
        margin: 1em 0 0.4em;
      }

      sl-skeleton:nth-of-type(3) {
        width: 95%;
        margin: 0 0 0.4em;
      }

      sl-skeleton:nth-of-type(4) {
        width: 80%;
        margin: 0 0 0.4em;
      }

      :host([minimal]) sl-skeleton:first-child ~ sl-skeleton {
        display: none;
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
    minimal: {
      type: Boolean,
      reflect: true
    },
    vertical: {
      type: Boolean,
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

  static instances = new Set();

  constructor() {
    super();
  }

  connectedCallback(){
    super.connectedCallback();
    ProfileCard.instances.add(this);
  }

  disconnectedCallback(){
    super.disconnectedCallback();
    ProfileCard.instances.delete(this)
  }

  set did(did){
    if (this._did === did) return;
    this._did = did;
    this.loading = true;
    Promise.all([
      datastore.readAvatar(did).then(async record => {
        this.avatarDataUri = record.cache.uri || undefined;
      }),
      datastore.getSocial({ from: did }).then(async record => {
        this.socialData = await record.cache.json || {};
      })
    ]).then(() => {
      if (this._did === did) this.requestUpdate();
      this.loading = false;
    }).catch(e => {
      console.log(e);
      this.loading = false;
    })
  }

  get did(){
    return this._did;
  }

  set following(val){
    const state = !!val;
    this._following = state;
    if (state === false && this.removeUnfollowed) this.remove();
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
    notify.success(state ? 'Follow added' : 'Follow removed');
  }

  render() {
    return html`
      <slot name="start"></slot>
      <w5-img part="image" src="${ ifDefined(this.avatarDataUri) }" fallback="person"></w5-img>
      <div id="content">
        <h3 part="name">${this?.socialData?.displayName || 'Anon'}</h3>
        <slot name="subtitle"></slot>
        ${ !this.minimal && this?.socialData?.bio ? html`<p>${this.socialData.bio}</p>` : nothing }
        <div id="content_skeleton">
          <sl-skeleton effect="sheen"></sl-skeleton>
          <sl-skeleton effect="sheen"></sl-skeleton>
          <sl-skeleton effect="sheen"></sl-skeleton>
          <sl-skeleton effect="sheen"></sl-skeleton>
        </div>
        <slot name="content-bottom"></slot>
      </div>
      <slot name="after-content"></slot>
      <div>
        ${
          this.followButton ?
            html`<sl-button id="follow_button" size="small" variant="${this.following ? 'default' : 'primary' }" @click="${e => this.toggleFollow()}">${this.following ? 'Unfollow' : 'Follow' }</sl-button>` :
            nothing
        }
      </div>
      <slot name="end"></slot>
    `;
  }
}
