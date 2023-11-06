import { LitElement, html, css, unsafeCSS, nothing  } from 'lit';
import { customElement, query, property } from 'lit/decorators.js';

import * as markdown from  '../utils/markdown.js';

import ScrollStyles from '../styles/scroll.js'
import examples from '../utils/example-markdown.js'
import { DOM, notify } from '../utils/helpers.js';

import PageStyles from  '../styles/page.css';
import { DOM } from '../utils/helpers.js';
import './global.js'

const timeOfDayMap = {
  sunrise: 'brightness-alt-high',
  day: 'brightness-high',
  sunset: 'brightness-alt-low',
  night: 'moon'
}

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

      .post {
        display: flex;
      }

      .date {
        display: flex;
        margin-right: 3em;
        text-align: center;
      }

      .date sl-icon {
        font-size: 1.6em;
        margin: 0 0.25em 0 0;
        padding: 0.25em;
        border-radius: 100%;
        border: 2px solid rgba(255,255,255,0.25)
      }

        .date sl-icon[segment="sunrise"] {
          color: yellow;
          background: rgb(105 171 231);
        }

        .date sl-icon[segment="day"] {
          color: yellow;
          background: #0087ff;
        }

        .date sl-icon[segment="sunset"] {
          color: rgb(223 101 0);
          background: rgb(255 213 118);
        }

        .date sl-icon[segment="night"] {
          background: #0a007d;
        }

      .date .formatted {

      }

      .post .markdown-body {
        flex: 1;
        background: none;
      }

      .markdown-body {
        max-width: 600px;
        font-family: unset;
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

  parseDate(utc = ''){
    const date = new Date(utc);
    const formatted = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
    let hours = date.getUTCHours();
    let segment;

    if (hours >= 5 && hours < 8) {
      segment = 'sunrise';
    }
    else if (hours >= 8 && hours < 18) {
      segment = 'day';
    }
    else if (hours >= 18 && hours < 20) {
      segment = 'sunset';
    }
    else {
      segment = 'night';
    }

    let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
    let minutes = date.getUTCMinutes();
        minutes = minutes < 10 ? '0' + minutes : minutes;


    return {
      date,
      segment,
      formatted,
      time: `${hours}:${minutes} ${ampm}`
    }
  }

  render() {
    let lastDate;
    return html`
      <div id="posts" placehold>${
        Array.from(this.posts || [], post => {
          const date = this.parseDate(post.datePublished);
          if (date.formatted === lastDate) return nothing;
          lastDate = date.formatted;
          let segment = 'night';
          return html`
            <div class="post">

              <div class="date">
                <sl-icon segment="${segment}" name="${timeOfDayMap[segment]}"></sl-icon>
                <div>
                  <div class="formatted">${date.formatted}</div>
                  <div class="time">${date.time}</div>
                </div>
              </div>

                <!-- <img
                  slot="image"
                  src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
                /> -->

                ${markdown.render(post.json.markdown)}


                ${
                  // this.ownDid
                  false ?
                    html`
                      <div slot="footer">
                        <sl-button variant="success" size="small" outline @click="${e => this.openEditor(post)}">
                          <sl-icon slot="prefix" name="pencil"></sl-icon>
                          Edit
                        </sl-button>
                        <sl-button variant="primary" size="small" outline @click="${e => this.confirmUnpublish(post)}">
                          <sl-icon slot="prefix" name="send"></sl-icon>
                          Unpublish
                        </sl-button>
                        <sl-button class="delete-button" variant="danger" size="small" outline @click="${e => this.deletePost(post)}">
                          <sl-icon slot="prefix" name="x-lg"></sl-icon>
                          Delete
                        </sl-button>
                      </div>
                    ` : nothing
                }
            </div>
          `
      })}
      <div placeholder="firstrun clickable" @click="${e => globalThis.router.navigateTo('/drafts')}">
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
