import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import * as protocols from '../utils/protocols';
import PageStyles from  '../styles/page.css';

import { DOM, notify, natives } from '../utils/helpers.js';
import '../components/profile-card'

@customElement('page-follows')
export class PageFollows extends LitElement {
  static styles = [
    unsafeCSS(PageStyles),
    css`

    #view_actions {
      display: flex;
      align-items: center;
    }

    #view_actions sl-input {
      flex: 1;
      margin: 0 0.5em 0 0;
    }

    #search_input {
      max-width: 500px;
    }

    #modal_profile_image {
      --size: 7em;
      border: 2px solid rgba(200, 200, 230, 0.5);
      border-radius: 8px;
    }

    #modal_profile p {
      margin: 0 0 0 1em;
    }

    `
  ]

  @query('#search_input', true)
  searchInput;

  @query('#results', true)
  results;

  @query('#modal_profile', true)
  profileModal;

  @query('#modal_profile_card', true)
  profileCard;

  constructor() {
    super();
    this.follows = new Set();
    this.fetchFollows();
  }

  search(value){
    if (value?.match(/^did:/)) this.searchDid()
    else this.searchFollows()
  }

  async searchDid (did){
    did = (did || this.searchInput?.value)?.trim();
    if (this.profileModalDid === did) {
      if (!this.profileModal.open) this.profileModal.show()
    }
    else {
      this.profileModalDid = did;
      this.profileCard.did = did;
      const record = await datastore.queryFollows({ recipient: did, latestRecord: true })
      if (this.profileModalDid === did) {
        this.profileModalExistingFollow = record?.isDeleted === false;
        this.requestUpdate()
      }
      this.profileModal.show();
    }
  }

  async fetchFollows(cursor){
    const records = await datastore.queryFollows()
    records.forEach(record => record.isDeleted || this.follows.add(record.recipient))
    this.requestUpdate();
  }

  async searchFollows (query){
    query = query || this.searchInput?.value?.trim();
    console.log('searchFollows', query)
  }

  async toggleFollow (did, follow){
    await datastore.toggleFollow(did, follow);
    if (did === this.profileModalDid) {
      this.profileModalExistingFollow = follow;
      this.requestUpdate();
    }
    DOM.fireEvent(document, 'follow-change', {
      composed: true,
      detail: {
        did: did,
        following: follow
      }
    });
    this.profileModal.hide();
  }

  render() {
    return html`
      <header id="view_header">
        <div id="view_actions">
          <sl-input id="search_input" placeholder="Search your follows or enter a DID" size="small" autocomplete="on"></sl-input>
          <sl-button variant="primary" size="small" @click="${e => {
            this.search(this.searchInput.value)
          }}">
            <sl-icon slot="prefix" name="search"></sl-icon>
            Search
          </sl-button>
        </div>
      </header>
      <section>
        <div id="results">${
          Array.from(this.follows).map(did => html`<profile-card did="${did}" remove-unfollowed follow-button following></profile-card>`)
        }</div>
      </section>
      <sl-dialog id="modal_profile" no-header>
        <profile-card id="modal_profile_card"></profile-card>
        <sl-button slot="footer" variant="success" @click="${e => this.toggleFollow(this.profileModalDid, !this.profileModalExistingFollow)}">${ this.profileModalExistingFollow ? 'Unfollow' : 'Follow' }</sl-button>
        <sl-button slot="footer" variant="danger" @click="${e => this.profileModal.hide()}">Close</sl-button>
      </sl-dialog>
    `;
  }
}
