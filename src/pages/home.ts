import { LitElement, html, css, unsafeCSS } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import '../components/global.js'
import PageStyles from  '../styles/page.css';
import * as follows from '../utils/follows';

@customElement('page-home')
export class PageHome extends LitElement {

  constructor() {
    super();
    //follows.initialize().then(() => this.getLatestPosts())
  }

  static styles = [
    unsafeCSS(PageStyles),
    css`

    `
  ]

  getPostsAfter(){
    console.log(follows.entries);
  }

  getPostsBefore(){
    console.log(follows.entries);
  }

  render() {
    return html`

    `;
  }
}
