import { LitElement, html, css, unsafeCSS, nothing } from 'lit';
import { customElement, query, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

@customElement('w5-img')
export class W5Image extends LitElement {
  static styles = [
    css`

      :host {
        --size: 6rem;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        width: var(--size);
        height: var(--size);
        flex-shrink: 0;
      }

      #image {
        display: block;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        border: none;
        opacity: 0;
        transition: opacity 0.5s ease;
      }

      #image[loaded] {
        opacity: 1;
      }

      [part="fallback"] {
        position: absolute;
        top: 50%;
        left: 50%;
        margin: 0;
        padding: 0;
        font-size: 3rem;
        z-index: -1;
        transform: translate(-50%, -50%);
      }
    `
  ]

  static properties = {
    src: {
      type: String,
      relfect: true
    },
    fallback: {
      type: String,
      relfect: true
    }
  };

  @query('#image', true)
  image

  set src(val){
    this._src = val;
    this.removeAttribute('loaded');
    if (this.image) {
      this.image.removeAttribute('loaded');
      this.image.src = val;
    }
  }

  get src(){
    return this._src;
  }

  loaded(){
    this.setAttribute('loaded', '')
    this?.image.setAttribute('loaded', '')
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <img id="image" part="image" src="${ ifDefined(this.src) }" @load="${e => this.loaded() }"/>
      ${ this?.fallback?.match(/^[a-zA-Z0-9]+:/) ? html`<img part="fallback" src="${this.fallback}">` : html`<sl-icon part="fallback" name="${this.fallback || 'image'}"></sl-icon>` }
    `;
  }
}
