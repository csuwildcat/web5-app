import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, query } from 'lit/decorators.js';


import { Editor, Viewer } from 'bytemd'
import gfm from '@bytemd/plugin-gfm'
import breaks from '@bytemd/plugin-breaks'
import gemoji from '@bytemd/plugin-gemoji'
import mermaid from '@bytemd/plugin-mermaid'
import highlight from '@bytemd/plugin-highlight'

import EditorStyles from 'bytemd/dist/index.css';
import EditorHighlightStyles from 'highlight.js/styles/default.css'

const plugins = [
  gfm(),
  breaks(),
  gemoji(),
  mermaid(),
  highlight()
]

import { DOM } from '../utils/helpers.js';
import './global.js'

export interface PostEditor {
  post?: any
  data?: any
  editor: Editor
  codemirror: any
}

@customElement('post-editor')
export class PostEditor extends LitElement {
  static styles = [
    unsafeCSS(EditorStyles),
    unsafeCSS(EditorHighlightStyles),
    css`

      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        background: #000;
        transition: opacity 0.3s ease, z-index 0.3s ease;
        opacity: 0;
        z-index: -1;
      }

      :host([open]) {
        opacity: 1;
        z-index: 1;
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

      #editor {
        display: flex;
        flex: 1;
        overflow: hidden;
      }

      #editor > * {
        flex: 1;
        height: auto;
      }

      /* #close_button::part(base) {
        color: white;
        text-shadow: 0 1px 1px rgba(0,0,0,0.5);
      } */

      /* #editor_panels {
        height: 100%;
        width: 100%;
        background: #000;
      }



      #code_editor::part(base) {
        height: 100%;
      }

      #preview {
        padding: 1.5em;
        background: #000;
      } */

    `
  ]

  constructor(id) {
    super();
    this.postId = id;
  }

  async firstUpdated() {
    const editorElement = this.renderRoot.querySelector('#editor');
    this.editor = new Editor({
      target: editorElement,
      props: {
        value: '',
        plugins,
      },
      previewDebounce: 50
    })

    this.codemirror = this.renderRoot.querySelector('.CodeMirror').CodeMirror;



    editorElement.addEventListener('input', e => {
      // console.log(this.codemirror.getValue());
      this.editor.$set({ value: this.codemirror.getValue() })
    })

    // this.editor.$on('change', (e) => {
    //   console.log(e)
    //   this.editor.$set({ value: e.detail.value })
    // })
    if (this.postId) this.loadPost(this.postId);
  }

  async loadPost(id){
    // this.postId = id;
    // this.post = await datastore.getPost(id);
    // this.data = await this.post.data.json();
    this.editor.setValue('test')//this.data.markdown);
  }

  savePost = DOM.throttle(() => {
    if (!this.post || !this.editor) return;
    console.log('save');
    return this.post.update({
      data: Object.assign(this.data, {
        markdown: this.editor.getValue()
      })
    })
  }, 2000)

  open(){
    this.setAttribute('open', '')
  }

  close(){
    this.removeAttribute('open')
  }

  render() {
    return html`
      <header id="header">
        <sl-button-group>
          <sl-button id="close_button" variant="danger" size="small" @click="${e => this.close()}">
            <sl-icon slot="prefix" name="x-circle"></sl-icon>Close
          </sl-button>
        </sl-button-group>
      </header>
      <div id="editor"></div>
    `;
  }
}











import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, query } from 'lit/decorators.js';

import { createWysimark } from "@wysimark/standalone"

import { DOM } from '../utils/helpers.js';
import './global.js'

export interface PostEditor {
  post?: any
  data?: any
  editor: Editor
  codemirror: any
}

@customElement('post-editor')
export class PostEditor extends LitElement {
  static styles = [
    //unsafeCSS(EditorStyles),
    css`

      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        background: #000;
        transition: opacity 0.3s ease, z-index 0.3s ease;
        opacity: 0;
        z-index: -1;
      }

      :host([open]) {
        opacity: 1;
        z-index: 1;
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

      #editor {
        display: flex;
        flex: 1;
      }

      #editor > * {
        width: 100%;
        background: #fff;
        border: none;
        border-radius: 0;
        outline: none;

      }

    `
  ]

  constructor(id) {
    super();
    this.postId = id;
  }

  #cloneStyles(nodes){
    nodes.forEach(node => {
      if (node?.getAttribute?.('data-emotion')) {
        this.shadowRoot.appendChild(node.cloneNode(true));
      }
    });
  }

  async firstUpdated() {
    const editorElement = this.renderRoot.querySelector('#editor');

    this.styleObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          this.#cloneStyles(mutation.addedNodes)
        }
      })
    })

    this.styleObserver.observe(document.head, {
      attributes: true,
      childList: true,
      subtree: false,
      attributeFilter: ['data-emotion']
    });

    this.editor = createWysimark(editorElement, {
      placeholder: 'Add content to your new post - markdown supported'
      initialMarkdown: "# Hello World",
    })

    this.#cloneStyles(document.head.querySelectorAll('[data-emotion]'));

    if (this.postId) this.loadPost(this.postId);
  }

  async loadPost(id){
    // this.postId = id;
    // this.post = await datastore.getPost(id);
    // this.data = await this.post.data.json();
    this.editor.setValue('test')//this.data.markdown);
  }

  savePost = DOM.throttle(() => {
    if (!this.post || !this.editor) return;
    console.log('save');
    return this.post.update({
      data: Object.assign(this.data, {
        markdown: this.editor.getValue()
      })
    })
  }, 100)

  open(){
    this.setAttribute('open', '')
  }

  close(){
    this.removeAttribute('open')
  }

  render() {
    return html`
      <header id="header">
        <sl-button-group>
          <sl-button id="close_button" variant="danger" size="small" @click="${e => this.close()}">
            <sl-icon slot="prefix" name="x-circle"></sl-icon>Close
          </sl-button>
        </sl-button-group>
      </header>
      <div id="editor"></div>
    `;
  }
}

/* TOAST EDITOR */

import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, query } from 'lit/decorators.js';

import Editor from '@toast-ui/editor';
import EditorStyles from '@toast-ui/editor/dist/toastui-editor.css';
import EditorDarkStyles from '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import Prism from 'prismjs';
import PrismStyles from 'prismjs/themes/prism.css';
import PrismSyntaxStyles from '../styles/prism-syntax-theme.css';
import HighlightPluginStyles from '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css';
import HighlightPlugin from '@toast-ui/editor-plugin-code-syntax-highlight';


import { DOM } from '../utils/helpers.js';
import './global.js'

export interface PostEditor {
  post?: any
  data?: any
  editor: Editor
  codemirror: any
}

@customElement('post-editor')
export class PostEditor extends LitElement {
  static styles = [
    unsafeCSS(EditorStyles),
    unsafeCSS(EditorDarkStyles),
    unsafeCSS(PrismStyles),
    unsafeCSS(PrismSyntaxStyles),
    unsafeCSS(HighlightPluginStyles),
    css`

      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        background: #000;
        transition: opacity 0.3s ease, z-index 0.3s ease;
        opacity: 0;
        z-index: -1;
      }

      :host([open]) {
        opacity: 1;
        z-index: 1;
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

      #editor {
        display: flex;
        flex: 1;
      }

      #editor > * {
        width: 100%;
        background: none;
        border: none;
        border-radius: 0;
        outline: none;

      }

      #editor .toastui-editor-defaultUI-toolbar {
        padding: 0 2px;
        border-radius: 0;
      }

      #editor .toastui-editor-toolbar-item-wrapper {
        height: auto;
        margin: 0;
      }

      #editor .token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string {
        background: none;
      }

    `
  ]

  constructor(id) {
    super();
    this.postId = id;
  }

  async firstUpdated() {
    const editorElement = this.renderRoot.querySelector('#editor');

    this.editor = new Editor({
      el: editorElement,
      //height: '500px',
      theme: 'dark',
      initialEditType: 'markdown',
      previewStyle: 'vertical',
      previewHighlight: false,
      usageStatistics: false,
      plugins: [[ HighlightPlugin, { highlighter: Prism }]],
      toolbarItems: [
        ['heading', 'bold', 'italic', 'strike'],
        ['hr', 'quote'],
        ['ul', 'ol', 'task', 'indent', 'outdent'],
        ['table', 'image', 'link'],
        ['code', 'codeblock'],
        [{
          el: (() => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'toastui-editor-toolbar-icons toastui-editor-toolbar-icons';
            button.innerHTML = `
              <sl-button variant="danger" size="small">
                <sl-icon name="x-circle" label="Settings"></sl-icon> Close
              </sl-button>
              `;
            button.style.backgroundImage = 'none';
            button.addEventListener('click', e => this.close())
            return button;
          })(),
          name: 'test',
          tooltip: 'Testing'
        }]
      ]
    });

    if (this.postId) this.loadPost(this.postId);
  }

  async loadPost(id){
    // this.postId = id;
    // this.post = await datastore.getPost(id);
    // this.data = await this.post.data.json();
    this.editor.setValue('test')//this.data.markdown);
  }

  savePost = DOM.throttle(() => {
    if (!this.post || !this.editor) return;
    console.log('save');
    return this.post.update({
      data: Object.assign(this.data, {
        markdown: this.editor.getValue()
      })
    })
  }, 100)

  open(){
    this.setAttribute('open', '')
  }

  close(){
    this.removeAttribute('open')
  }

  render() {
    return html`
      <!-- <header id="header">
        <sl-button-group>
          <sl-button id="close_button" variant="danger" size="small" @click="${e => this.close()}">
            <sl-icon slot="prefix" name="x-circle"></sl-icon>Close
          </sl-button>
        </sl-button-group>
      </header> -->
      <div id="editor"></div>
    `;
  }
}
