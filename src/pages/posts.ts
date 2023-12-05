import { LitElement, html, css, unsafeCSS } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement, query } from 'lit/decorators.js';

import PageStyles from  '../styles/page.css';
import * as markdown from  '../utils/markdown.js';

import '../components/feed-view';

@customElement('page-posts')
export class PagePosts extends LitElement {
  static styles = [
    unsafeCSS(PageStyles),
    markdown.styles,
    css`
      :host > section {
        padding: 0;
      }

      feed-view::part(posts) {
        padding: 2em;
      }

      @media(max-width: 500px) {
        feed-view::part(posts) {
          padding: 0;
        }
        feed-view::part(markdown) {
          padding-right: 1.25em;
        }
      }
    `
  ]

  @query('#feed_view', true)
  feedView;

  constructor() {
    super();
    window.addEventListener('post-published', e => {
      this.feedView.processPost(e.detail.record);
    })
    this.initialize();
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
