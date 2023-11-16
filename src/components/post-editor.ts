import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, query } from 'lit/decorators.js';

import { Editor } from 'bytemd'
import * as markdown from  '../utils/markdown.js';

import ScrollStyles from '../styles/scroll.js'
import examples from '../utils/example-markdown.js'
import { DOM, notify } from '../utils/helpers.js';
import './global.js'

export interface PostEditor {
  record?: any
  editor: Editor
  codemirror: any
}

@customElement('post-editor')
export class PostEditor extends LitElement {
  static styles = [
    markdown.styles,
    ScrollStyles({ theme: 'light' }),
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

      #modal {
        --footer-spacing: var(--sl-spacing-medium);
      }

      #modal::part(panel) {
        height: 100%;
        width: var(--modal-width);
        max-height: var(--modal-height);
        max-width: 1200px;
        border-radius: var(--modal-border-radius);
      }

      #modal::part(body) {
        display: flex;
        padding: 0;
        z-index: 1;
      }

      #editor {
        display: flex;
        flex: 1;
        width: 100%;
        overflow: hidden;
      }

      #editor > * {
        flex: 1;
        height: auto;
      }

      #editor {
        border-radius: var(--modal-border-radius) var(--modal-border-radius) 0 0;
      }

      #editor .bytemd-toolbar {
        padding: 0.6em 0.4em;
      }

      #editor .bytemd-toolbar-right > div:is(:first-child, :last-child)  {
        display: none;
      }

      #editor .bytemd-body {
        height: calc(100% - 69px);
      }

      #editor .bytemd-preview {
        background-color: #0d1117;
      }

      #editor .CodeMirror {
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      #editor .markdown-body {
        background: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      #modal[open="complete"] #editor .CodeMirror,
      #modal[open="complete"] #editor .markdown-body {
        opacity: 1;
      }

    `
  ]

  constructor() {
    super();
  }

  @query('#modal', true)
  modal;

  async firstUpdated() {

    const editorElement = this.renderRoot.querySelector('#editor');
    this.editor = new Editor({
      target: editorElement,
      props: {
        value: examples.full,
        plugins: markdown.plugins,
      },
      previewDebounce: 10
    })

    this.codemirror = this.renderRoot.querySelector('.CodeMirror').CodeMirror;

    editorElement.addEventListener('keydown', e => {
      this.content = this.codemirror.getValue()
    })
    editorElement.addEventListener('keyup', e => {
      this.content = this.codemirror.getValue()
    })
  }

  get content(){
    return this.codemirror.getValue()
  }

  set content(markdown){
    this.editor.$set({ value: markdown || '' })
  }

  async #getRecordContent(){
    return (await this.record.data.json()).markdown
  }

  async open(record){
    if (!this?.record?.id || this.record.id !== (record.id || record)) {
      this.record = typeof record === 'string' ? await datastore.getPost(record) : record;
      this.content = await this.#getRecordContent();
    }
    this.modal.show();
  }

  close(){
    DOM.fireEvent(this, 'close-editor', {
      composed: true,
      detail: {
        record: this.record
      }
    })
    this.modal.hide();
  }

  async save(close){
    const currentContent = this.content;
    if (currentContent && currentContent === await this.#getRecordContent()) {
      if (close) this.close();
      return;
    }
    try {
      await this.record.update({
        data: {
          markdown: currentContent
        }
      })
      if (close) this.close();
      console.log('save complete')
    }
    catch (e){
      console.log('save error:', e)
      notify.error('Post could not be saved. An error occurred')
    }
  }

  trottledSave = DOM.throttle(this.save, 2000)

  #onAfterShow(){
    this.codemirror.refresh();
    this.modal.setAttribute('open', 'complete');
  }

  render() {
    return html`
      <sl-dialog id="modal" part="modal" class="dialog-overview" no-header @sl-after-show="${e => this.#onAfterShow()}">
        <div id="editor" part="editor"></div>
        <sl-button slot="footer" variant="danger" @click="${e => this.close()}">Delete</sl-button>
        <sl-button slot="footer" variant="primary" @click="${async e => this.save(true) }">Save & Close</sl-button>
      </sl-dialog>
    `;
  }
}
