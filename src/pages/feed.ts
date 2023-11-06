import { LitElement, html, css, unsafeCSS } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement, query } from 'lit/decorators.js';

import PageStyles from  '../styles/page.css';
import * as markdown from  '../utils/markdown.js';

import '../components/feed-view';

@customElement('page-feed')
export class PageFeed extends LitElement {
  static styles = [
    unsafeCSS(PageStyles),
    markdown.styles,
    css`

    `
  ]

  @query('#feed_view', true)
  feedView;

  constructor() {
    super();
    this.posts = new Set();
    window.addEventListener('post-published', e => {
      this.feedView.processPost(e.detail.record);
    })
  }

  async initialize(){
    await datastore.ready;
    this.feedView.did = datastore.did;
  }

  render() {
    return html`
      <section>
        <feed-view id="feed_view"></feed-view>
      </section>
    `;
  }
}
