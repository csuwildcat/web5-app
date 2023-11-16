import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, query } from 'lit/decorators.js';

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

  constructor() {
    super();
  }

  async searchDid (did){
    did = did || this.searchInput?.value?.trim();

    console.log(await datastore.getProtocol(protocols.profile.uri, { from: did }))
    console.log('searchDid', did)
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
    `;
  }
}
