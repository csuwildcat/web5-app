import { LitElement, css, html, unsafeCSS } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import '../components/global.js'

@customElement('page-home')
export class PageHome extends LitElement {

  constructor() {
    super();
  }

  static get styles() {
    return [
      css`

      :host > * {
        max-width: var(--content-max-width);
      }

    `];
  }

  async firstUpdated() {
    console.log('This is your home page');
  }

  async onPageEnter(){
    console.log('Home page is showing');
  }

  async onPageLeave(){
    console.log('Home page is hiding');
  }

  render() {
    return html`
      <h2>Introduction</h2>
      <p>
        This is a barebones template for building a <strong>Decentralized Web App (DWA)</strong>. To understand what a DWA is, it helps to know what they are built on top of: the standard <strong>Progressive Web App (PWA)</strong> model supported by all major Web browsers. PWAs are web apps that provide users with an experience rivaling native apps by leveraging new capabilities that enable them to be installed like a native app and have the same look and behavior of native apps. This is a helpful primer to learn about PWAs and the power they give to app developers: <a href="https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Introduction">Introduction to PWAs</a>
      </p>
      <p>
        <strong>Decentralized Web Apps (DWAs)</strong> are PWAs that ate their Wheaties. DWAs upgrade the Web with a core set of decentralized identity, trust, and data storage/exchange capabilities that include:
      </p>
      <ul>
        <li><strong>Decentralized Identifiers (DIDs)</strong> - a standard for identifiers (think: user handles) that you own and control, not some company or domain registrar.</li>
        <li><strong>Verifiable Credentials (VCs)</strong> - a standard mechanism for creating signed statements you can independently verify, to help form trust and reputation between people and businesses.</li>
        <li><strong>Decentralized Web Nodes (DWeb Nodes)</strong> - an emerging standard for personal data storage and exchange that allows your DWA to store data with the user.</li>
      </ul>

      <h2>Tech used in this template:</h2>

      <ul>
        <li>
          <a href="https://www.typescriptlang.org/" target="_blank">TypeScript</a>
        </li>

        <li>
          <a href="https://lit.dev" target="_blank">Lit (app framework)</a>
        </li>

        <li>
          <a href="https://shoelace.style/" target="_blank">Shoelace (components)</a>
        </li>

        <li>
          <a href="https://vaadin.com/docs/latest/components" target="_blank">Vaadin (components)</a>
        </li>

        <li>
          <a href="https://developer.tbd.website/docs/web5/" target="_blank">Web5 (SDK)</a>
        </li>
      </ul>
    `;
  }
}
