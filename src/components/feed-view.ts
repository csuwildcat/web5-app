import { LitElement, html, css, unsafeCSS, nothing  } from 'lit';
import { customElement, query, property } from 'lit/decorators.js';

import * as markdown from  '../utils/markdown.js';

import ScrollStyles from '../styles/scroll.js'
import examples from '../utils/example-markdown.js'
import { DOM, notify } from '../utils/helpers.js';

import PageStyles from  '../styles/page.css';
import { DOM } from '../utils/helpers.js';
import './global.js'

import '../components/post-view'

export interface PostEditor {
  record?: any
  editor: Editor
  codemirror: any
}

@customElement('feed-view')
export class FeedView extends LitElement {
  static styles = [
    unsafeCSS(PageStyles),
    ScrollStyles({ theme: 'light' }),
    markdown.styles,
    css`

      :host {
        --modal-width: calc(100% - var(--sl-spacing-4x-large));
        --modal-height: calc(100% - var(--sl-spacing-4x-large));
        --modal-border-radius: 0.25rem;
        display: block;
      }

      :host > header {
        position: sticky;
        padding: 0.4em;
        background: var(--header-bar);
      }

      :host > header sl-button-group {
        display: flex;
        justify-content: flex-end;
      }

      post-view {
        margin: 0 0 2em;
        padding: 0 0 2em;
        border-bottom: 1px solid rgba(255,255,255,0.05);
      }

      .date {
        display: flex;
        flex-direction: column;
        text-align: center;
      }

    `
  ]

  @property({ type: String }) did;

  @query('#modal_unpublish_confirm', true)
  confirmModal;

  constructor() {
    super();
    window.addEventListener('published-post', e => {
      this.processPost(e.detail.record);
    })
  }

  async requestUpdate(name, oldVal, newVal) {
    if (name === 'did' && oldVal !== newVal && (this.did || '').match('^did:')) {
      await this.loadDid(newVal);
    }
    else {
      super.requestUpdate(name, oldVal, newVal);
    }
  }

  async loadDid(){
    const options = { sort: 'publishedDescending' }
    this.posts = new Set();
    await datastore.ready;
    if (this.did === datastore.did) this.ownDid = true;
    else {
      this.ownDid = false;
      options.from = this.did;
    }
    const records = await datastore.getPosts(options);
    await Promise.all(records.map(post => this.processPost(post, false)))
    this.requestUpdate();
  }

  async processPost(post, render){
    if (post.published) {
      post.json = await post?.data?.json() || {};
      this.posts.add(post);
      if (render !== false) this.requestUpdate();
    }
  }

  confirmUnpublish(post){
    this.unconfirmedPost = post;
    this.confirmModal.show()
  }

  async unpublishPost(){
    const data = await this.unconfirmedPost?.data?.json();
    if (!data) {
      notify.error(`This post has no content.`);
      return;
    }
    try {
      await this.unconfirmedPost.update({
        data: data,
        message: {
          published: false
        }
      });

      this.posts.delete(this.unconfirmedPost);

      DOM.fireEvent(this, 'post-published', {
        composed: true,
        detail: {
          record: this.unconfirmedPost
        }
      })

      this.requestUpdate();
    }
    catch(e){
      notify.error(`There was a problem publishing this post.`);
    }
    this.confirmModal.hide()
  }

  async deletePost(post){
    try {
      await post.delete();
      this.posts.delete(post);
      this.requestUpdate();
      notify.success(`Your post was deleted.`);
    }
    catch(e){
      notify.error(`There was a problem deleting this post.`);
    }
  }

  openEditor(record){
    DOM.fireEvent(this, 'open-editor', {
      composed: true,
      detail: {
        record: record
      }
    })
  }

  render() {
    let lastDate;
    return html`
      <div id="posts" part="posts" placehold>${
        Array.from(this.posts || [], post => {
          // if (date.formatted === lastDate) return nothing;
          // lastDate = date.formatted;
          return html`<post-view part="post" exportparts="markdown" .post=${post}></post-view>`
        })}
        <div default-content="firstrun clickable" @click="${e => globalThis.router.navigateTo('/drafts')}">
          <sl-icon name="file-earmark-plus"></sl-icon>
          You haven't published any posts. Click here to switch to the drafts area, where you can create or publish one.
        </div>
      </div>
      <sl-dialog id="modal_unpublish_confirm" class="dialog-deny-close" no-header @sl-hide="${ e => this.unconfirmedPost = null }">
        Are you sure you want to publish?
        <sl-button slot="footer" variant="success" @click="${e => this.unpublishPost()}">Confirm</sl-button>
        <sl-button slot="footer" variant="danger" @click="${e => this.confirmModal.hide() }">Cancel</sl-button>
      </sl-dialog>
    `;
  }
}
