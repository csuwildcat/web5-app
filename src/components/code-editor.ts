import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, Ref, ref } from "lit/directives/ref.js";

// -- Monaco Editor Imports --
import * as monaco from "monaco-editor";
import styles from "monaco-editor/min/vs/editor/editor.main.css";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
// import markdownWorker from "monaco-editor/esm/vs/language/markdown/markdown.worker?worker";

// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    // if (label === "markdown") {
    //   return new markdownWorker();
    // }
    return new editorWorker();
  },
};

@customElement("code-editor")
export class CodeEditor extends LitElement {
  private container: Ref<HTMLElement> = createRef();
  editor?: monaco.editor.IStandaloneCodeEditor;
  @property({ type: Boolean, attribute: "readonly" }) readOnly?: boolean;
  @property() theme?: string;
  @property() language?: string;
  @property() code?: string;
  @property({ type: Boolean, attribute: "no-margin" }) noMargin: boolean;

  static styles = css`
    :host {
      --editor-width: 100%;
      --editor-height: 100vh;
    }
    main {
      width: var(--editor-width);
      height: var(--editor-height);
    }
  `;

  render() {
    return html`
      <style>
        ${styles}
      </style>
      <main part="base" ${ref(this.container)}></main>
    `;
  }

  private getFile() {
    if (this.children.length > 0) return this.children[0];
    return null;
  }

  private getCode() {
    if (this.code) return this.code;
    const file = this.getFile();
    if (!file) return;
    return file.innerHTML.trim();
  }

  private getLang() {
    if (this.language) return this.language;
    const file = this.getFile();
    if (!file) return;
    const type = file.getAttribute("type")!;
    return type.split("/").pop()!;
  }

  private getTheme() {
    if (this.theme) return this.theme;
    if (this.isDark()) return "vs-dark";
    return "vs-light";
  }

  private isDark() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }

  setValue(value: string) {
    this.editor!.setValue(value);
  }

  getValue() {
    const value = this.editor!.getValue();
    return value;
  }

  setReadOnly(value: boolean) {
    this.readOnly = value;
    this.setOptions({ readOnly: value });
  }

  setOptions(value: monaco.editor.IStandaloneEditorConstructionOptions) {
    this.editor!.updateOptions(value);
  }

  firstUpdated() {
    let editorOptions = {
      value: this.getCode(),
      language: this.getLang(),
      theme: this.getTheme(),
      lineNumbers: this.lineNumbers,
      glyphMargin: this.lineNumbers === 'off' ? false : true,
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 0,
      automaticLayout: true,
      readOnly: this.readOnly ?? false,
      wordWrap: 'on',
      minimap: {
        enabled: false
      }
    };
    if (this.noMargin) {
      editorOptions = Object.assign(editorOptions, {
        lineNumbers: 'off',
        folding: false,
        glyphMargin: false,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 0
      })
    }
    this.editor = monaco.editor.create(this.container.value!, editorOptions);
    this.editor.getModel()!.onDidChangeContent(() => {
      this.dispatchEvent(new CustomEvent("change", {
        detail: {
          editor: this.editor
        }
      }));
    });
    matchMedia("(prefers-color-scheme: dark)")
    addEventListener("change", () => {
      monaco.editor.setTheme(this.getTheme());
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "code-editor": CodeEditor;
  }
}