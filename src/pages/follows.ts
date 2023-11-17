import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import * as protocols from '../utils/protocols';
import PageStyles from  '../styles/page.css';

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

    `
  ]

  @query('#search_input', true)
  searchInput;

  @query('#results', true)
  results;

  @query('#modal_profile', true)
  profileModal;

  constructor() {
    super();
  }

  async searchDid (did){
    did = (did || this.searchInput?.value)?.trim();
    if (this.profileModalDid === did) return;
    this.profileModalDid = did;
    console.log('searchDid', did === 'did:ion:EiDsTsvdrm9flbEZFG5cvtf9RqBkM2HNQlx-LtFLvyIyGQ:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkd24tc2lnIiwicHVibGljS2V5SndrIjp7ImNydiI6IkVkMjU1MTkiLCJrdHkiOiJPS1AiLCJ4IjoiV3lQTlluVUctZURpNU1ZNWZQVlJwQUVFc1pNX2xGWlRDcXdSdlRPaUl0WSJ9LCJwdXJwb3NlcyI6WyJhdXRoZW50aWNhdGlvbiJdLCJ0eXBlIjoiSnNvbldlYktleTIwMjAifSx7ImlkIjoiZHduLWVuYyIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJMNkppUVU5WmdSOXFoNVRVbkYteC03dnRjMEM1MnNKX1pOZEphdHVSMVZjIiwieSI6IkRyMVBreVphMmo4Y3M2OTVHcGhPb3JlQTEyZnpRMl9HWGwyNVNWWWxLdEUifSwicHVycG9zZXMiOlsia2V5QWdyZWVtZW50Il0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7ImVuY3J5cHRpb25LZXlzIjpbIiNkd24tZW5jIl0sIm5vZGVzIjpbImh0dHBzOi8vZHduLnRiZGRldi5vcmcvZHduMyIsImh0dHBzOi8vZHduLnRiZGRldi5vcmcvZHduMiJdLCJzaWduaW5nS2V5cyI6WyIjZHduLXNpZyJdfSwidHlwZSI6IkRlY2VudHJhbGl6ZWRXZWJOb2RlIn1dfX1dLCJ1cGRhdGVDb21taXRtZW50IjoiRWlDem5JSVN3dEVlZTJCZWN5SWpiWUV2TmluVWptck1yZExMYWQwUmhQeTd1ZyJ9LCJzdWZmaXhEYXRhIjp7ImRlbHRhSGFzaCI6IkVpRFdqUGw2UVBIamFvZnRxX2MyLUZaNF9oSUV1dUtZU2lHdUFvSGlxX2tNYVEiLCJyZWNvdmVyeUNvbW1pdG1lbnQiOiJFaUFqbXFKR2ZRU2xMWS1HWURSQnpoVWtDUHltQTRuTS1KV0ZydGJ5MFJIeE13In19');
    Promise.all([
      datastore.getAvatar({ from: did }).then(async record => {
        const blob = await record.data.blob();
        this.profileModalAvatarUri = blob ? URL.createObjectURL(blob) : undefined;
        console.log(this.profileModalAvatarUri);
      }),
      datastore.getSocial({ from: did }).then(async record => {
        this.profileModalSocialData = await record.data.json() || {};
        console.log(this.profileModalSocialData);
      })
    ]).then(() => {
      if (this.profileModalDid === did) this.requestUpdate()
    })
    this.profileModal.show();
  }

  async searchFollows (query){
    query = query || this.searchInput?.value?.trim();
    console.log('searchFollows', query)
  }

  render() {
    return html`
      <header id="view_header">
        <div id="view_actions">
          <sl-input id="search_input" placeholder="Search your follows or enter a DID" size="small" @sl-change="${e => {
            if (this.searchInput?.value?.match(/^did:/)) this.searchDid()
            else this.searchFollows()
          }}"></sl-input>
          <sl-button variant="primary" size="small" @click="${e => console.log(e)}">
            <sl-icon slot="prefix" name="search"></sl-icon>
            Search
          </sl-button>
        </div>
      </header>
      <section>
        <div id="results"></div>
      </section>
      <sl-dialog id="modal_profile">
        <w5-img id="modal_profile_image" src="${ifDefined(this.profileModalAvatarUri)}" fallback="person"></w5-img>
        <sl-button slot="footer" variant="success" @click="">Confirm</sl-button>
        <sl-button slot="footer" variant="danger" @click="">Cancel</sl-button>
      </sl-dialog>
    `;
  }
}
