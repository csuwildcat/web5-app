import { LitElement, html, css, unsafeCSS, nothing  } from 'lit';
import { customElement, query, property } from 'lit/decorators.js';

import ScrollStyles from '../styles/scroll.js'
import { DOM, notify } from '../utils/helpers.js';

import PageStyles from  '../styles/page.css';
import { DOM } from '../utils/helpers.js';
import './global.js'

import '../components/profile-card'
import '../components/markdown-content'

export interface PostEditor {
  record?: any
  editor: Editor
  codemirror: any
}

@customElement('post-view')
export class PostView extends LitElement {
  static styles = [
    unsafeCSS(PageStyles),
    ScrollStyles({ theme: 'light' }),
    css`

      :host {
        --modal-width: calc(100% - var(--sl-spacing-4x-large));
        --modal-height: calc(100% - var(--sl-spacing-4x-large));
        --modal-border-radius: 0.25rem;
        display: block;
      }

      #skeleton header {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
      }

      #skeleton header sl-skeleton:last-child {
        flex: 0 0 auto;
        width: 30%;
      }

      #skeleton sl-skeleton {
        margin-bottom: 1rem;
      }

      #skeleton sl-skeleton:nth-child(1) {
        float: left;
        width: 3rem;
        height: 3rem;
        margin-right: 1rem;
        vertical-align: middle;
      }

      #skeleton sl-skeleton:nth-child(3) {
        width: 95%;
      }

      #skeleton sl-skeleton:nth-child(4) {
        width: 80%;
      }

      #header {
        position: sticky;
        top: 0;
        height: 3.5rem;
        margin: 0 0 1rem;
        padding: 0 0.75rem;
        background: rgb(24 24 24 / 80%);;
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        z-index: 1;
      }

      #header profile-card {
        position: sticky;
        top: 0;
        height: fit-content;
        margin: 0 1em 0 0;
        padding: 0 1em 0 0;
      }

      #header profile-card::part(image) {

      }

      #header profile-card::part(name) {

      }

      #header time {
        text-wrap: nowrap;
      }

      .date {
        display: flex;
        flex-direction: column;
        font-size: 80%;
        color: #999;
      }

      #actions {
        position: sticky;
        top: 4.25rem;
        min-width: 3.8rem;
        height: fit-content;
      }

      #actions sl-icon-button {
        margin: 0 0 0.5em;
        font-size: 1.25em;
      }

      #actions sl-icon-button.follow_button {
        margin-right: -0.3rem;
      }

      markdown-content {
        max-width: 700px;
      }
    `
  ]

  static properties = {
    post: {
      type: Object
    }
  };

  @query('#modal_unpublish_confirm', true)
  confirmModal;

  constructor() {
    super();
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

  parseDate(utc = ''){
    const date = new Date(utc);
    const formatted = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
    let hours = date.getUTCHours();
    let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
    let minutes = date.getUTCMinutes();
        minutes = minutes < 10 ? '0' + minutes : minutes;
    return {
      date,
      formatted,
      time: `${hours}:${minutes} ${ampm}`
    }
  }

  render() {
    if (!this.post) {
      return html`
      <div id="skeleton">
        <header>
          <sl-skeleton></sl-skeleton>
          <sl-skeleton></sl-skeleton>
        </header>
        <sl-skeleton></sl-skeleton>
        <sl-skeleton></sl-skeleton>
        <sl-skeleton></sl-skeleton>
      </div>
    `;
    }

    let lastDate;
    const date = this.parseDate(this.post.datePublished);
    return html`

      <header id="header" part="header" flex="center-y">
        <profile-card id="author_profile_card" did="${this.post.author}" minimal
          @pointerenter="${ e => DOM.fireEvent(document, 'profile-card-popup', {
            detail: {
              did: this.post.author,
              anchor: e.currentTarget
            }
          })}">
          <time class="date" slot="subtitle">${date.formatted} ${date.time}</time>
        </profile-card>
      </header>

      <div flex>
        <nav id="actions" part="actions" flex="center-x column">
          ${ this.post.author !== userDID ? html`<sl-icon-button class="follow_button" name="person-plus" label="Follow"></sl-icon-button>` : nothing }
          <sl-icon-button name="bookmark" label="Bookmark"></sl-icon-button>
        </nav>
        <markdown-content part="markdown" .data=${this.post.json.markdown}></markdown-content>
      </div>

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
    `;
  }
}
