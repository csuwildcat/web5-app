
const natives = {
  deepSet(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const lastObj = keys.reduce((o, key) => o[key] = o[key] || {}, obj);
    lastObj[lastKey] = value;
  }
}

var DOM = {
  ready: new Promise(resolve => {
    document.addEventListener('DOMContentLoaded', e => {
      document.documentElement.setAttribute('ready', '');
      resolve(e)
    });
  }),
  query: s => document.querySelector(s),
  queryAll: s => document.querySelectorAll(s),
  skipFrame: fn => new Promise(resolve => requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (fn) fn();
      resolve();
    })
  })),
  wait: ms => new Promise(resolve => setTimeout(() => resolve(), ms)),
  fireEvent(node, type, options = {}){
    return node.dispatchEvent(new CustomEvent(type, Object.assign({
      bubbles: true
    }, options)))
  },
  addEventDelegate(type, selector, fn, options = {}){
    let listener = e => {
      let match = e.target.closest(selector);
      if (match) fn(e, match);
    }
    (options.container || document).addEventListener(type, listener, options);
    return listener;
  },
  removeEventDelegate(type, listener, options = {}){
    (options.container || document).removeEventListener(type, listener);
  },
  throttle(fn, delay) {
    let last = 0;
    let timeout;
    return function(...args) {
      return new Promise(resolve => {
        const now = Date.now();
        const diff = now - last;
        clearTimeout(timeout);
        if (diff >= delay || last === 0) {
          resolve(fn(...args));
          last = now;
        }
        else {
          timeout = setTimeout(() => {
            resolve(fn(...args));
            last = Date.now();
          }, delay - diff);
        }
      })
    };
  }
}

const notify = {
  info (message, options = {}){
    const alert = Object.assign(document.createElement('sl-alert'), {
      variant: 'primary',
      duration: 3000,
      closable: true,
      innerHTML: `
        <sl-icon name="${options.icon || 'info-circle'}" slot="icon"></sl-icon>
        ${document.createTextNode(message).textContent}
      `
    }, options);
    return document.body.appendChild(alert).toast();
  },
  success(message, options = {}){
    notify.info(message, Object.assign({
      variant: 'success'
    }, options))
  },
  warning(message, options = {}){
    notify.info(message, Object.assign({
      variant: 'warning'
    }, options))
  },
  error(message, options = {}){
    notify.info(message, Object.assign({
      variant: 'danger'
    }, options))
  }
}

const pressedElements = [];
document.addEventListener('pointerdown', e => {
  const path = e.composedPath();
  path[0].setAttribute('pressed', '');
  pressedElements.push(path[0]);
}, { passive: true, capture: true });

window.addEventListener('pointerup', e => {
  pressedElements.forEach(node => node.removeAttribute('pressed'));
  pressedElements.length = 0;
}, { passive: true, capture: true });

globalThis.DOM = DOM;

export { DOM, notify, natives };
