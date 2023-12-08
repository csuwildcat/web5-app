import { LitElement, html, css, unsafeCSS } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement, query, property } from 'lit/decorators.js';

import { DOM, notify } from '../utils/helpers.js';

import PageStyles from  '../styles/page.css';
import '../components/post-editor';
import '../components/markdown-content'

@customElement('page-drafts')
export class PageDrafts extends LitElement {
  static styles = [
    unsafeCSS(PageStyles),
    css`

      :host {
        padding: 0 0 2em !important;
      }

      #posts {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 2em;
        max-width: 1000px;
        margin: 0 auto 2em;
      }

      #posts > sl-card {
        width: 100%;
        margin: 0 auto;
      }

      #posts sl-card h3 {
        margin: 0;
      }

      sl-card::part(body) {
        position: relative;
        max-height: 15em;
        overflow: hidden;
      }

      sl-card::part(body)::after {
        content: "";
        display: block;
        position: absolute;
        top: 15em;
        width: 100%;
        box-shadow: rgb(36, 36, 40) 0px 0px 2em 3em;
      }

      sl-card .markdown-body {
        font-size: 0.7em;
        background: none;
      }

      sl-card::part(footer) {
        padding: var(--sl-spacing-small);
        background: rgba(0, 0, 0, 0.25);
        border-radius: 0 0 var(--sl-border-radius-medium) var(--sl-border-radius-medium);
      }

      sl-card div[slot="footer"] {
        display: flex;
      }

      sl-card sl-button::part(base) {
        border: none;
      }

      sl-card sl-button:not(:first-child) {
        margin-left: 1em;
      }

      sl-card sl-button:last-child {
        margin-left: auto;
      }

    `
  ]

  @query('#modal-publish-confirm')
  confirmModal

  constructor() {
    super();
    this.drafts = new Set();
    window.addEventListener('close-editor', e => {
      if (this.drafts.has(e.detail.record)) {
        this.processPost(e.detail.record);
      }
    })
    this.initialize();
  }

  async initialize(){
    const records = await datastore.getPosts();
    await Promise.all(records.map(post => this.processPost(post, false)))
    this.requestUpdate()
  }

  async processPost(post, render){
    if (!post.published) {
      post.json = await post?.data?.json() || {};
      this.drafts.add(post);
      if (render !== false) this.requestUpdate();
    }
  }

  async firstUpdated(){

  }

  async createPost(openEditor){
    try {
      const record = await datastore.createPost({
        data: {
          markdown: `# New Post

1. Make
2. it
3. count
`
        }
      });
      this.processPost(record);
      this.requestUpdate();
      if (openEditor) this.openEditor(record);
    }
    catch(e) {
      notify.error('There was an error in creating your post')
    }
  }

  confirmPublish(post){
    this.unconfirmedPost = post;
    this.confirmModal.show()
  }

  async publishPost(){
    const data = await this.unconfirmedPost?.data?.json();
    if (!data) {
      notify.error(`This post has no content.`);
      return;
    }
    try {
      await this.unconfirmedPost.update({
        data: data,
        published: true
      });

      const {status} = await this.unconfirmedPost.send(userDID);

      console.log(status);

      this.drafts.delete(this.unconfirmedPost);

      DOM.fireEvent(this, 'post-published', {
        composed: true,
        detail: {
          record: this.unconfirmedPost
        }
      })

      this.requestUpdate();
    }
    catch(e){
      console.log(e);
      notify.error(`There was a problem publishing this post.`);
    }
    this.confirmModal.hide()
  }

  async deletePost(post){
    try {
      await post.delete();
      this.drafts.delete(post);
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

    return html`
      <header id="view_header">
        <sl-button-group id="view_actions">
          <sl-button variant="primary" size="small" @click="${e => this.createPost(true)}">
            <sl-icon slot="prefix" name="plus-lg"></sl-icon>
            Create Draft
          </sl-button>
        </sl-button-group>
      </header>
      <section>
        <div id="posts">${
          Array.from(this.drafts, post => {
            return html`
              <sl-card class="card-overview">
                <!-- <img
                  slot="image"
                  src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
                /> -->
                <markdown-content part="markdown" .data=${post.json.markdown}></markdown-content>
                <!-- <small>Created: ${new Date(post.dateCreated).toLocaleDateString()}</small> -->

                <div slot="footer">
                  <sl-button variant="success" size="small" outline @click="${e => this.openEditor(post)}">
                    <sl-icon slot="prefix" name="pencil"></sl-icon>
                    Edit
                  </sl-button>
                  <sl-button variant="primary" size="small" outline @click="${e => this.confirmPublish(post)}">
                    <sl-icon slot="prefix" name="send"></sl-icon>
                    Publish
                  </sl-button>
                  <sl-button class="delete-button" variant="danger" size="small" outline @click="${e => this.deletePost(post)}">
                    <sl-icon slot="prefix" name="x-lg"></sl-icon>
                    Delete
                  </sl-button>
                </div>
              </sl-card>
            `
        })}
        <div default-content="firstrun clickable" @click="${e => this.createPost(true)}">
          <sl-icon name="file-earmark-plus"></sl-icon>
          Click here to create a draft
        </div>
      </div>
      </section>
      <sl-dialog id="modal-publish-confirm" class="dialog-deny-close" no-header @sl-hide="${ e => this.unconfirmedPost = null }">
        Are you sure you want to publish?
        <sl-button slot="footer" variant="success" @click="${e => this.publishPost()}">Confirm</sl-button>
        <sl-button slot="footer" variant="danger" @click="${e => this.confirmModal.hide() }">Cancel</sl-button>
      </sl-dialog>
    `;
  }
}
