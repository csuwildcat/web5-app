import { css, unsafeCSS } from 'lit';

export default (options = {}) => {
  const selector = options.selector || '';
  const theme = options.theme === 'light' ? {
    track: 'transparent',
    background: '#969696'
  } : {
    track: 'rgb(40, 40, 40)',
    background: 'rgba(255, 255, 255, 0.25)'
  }
  return css`${unsafeCSS(`
    /* For Webkit-based browsers (Chrome, Safari) */
    ${selector}::-webkit-scrollbar {
      width: 10px;
    }

    ${selector}::-webkit-scrollbar-track {
      background: 2px solid ${theme.track};
    }

    ${selector}::-webkit-scrollbar-thumb {
      border-radius: 6px;
      border: 2px solid ${theme.track};
      background-color: ${theme.background};
      background-clip: content-box;
    }

    /* For Firefox (version 64 and later) */
    ${selector} {
      scrollbar-width: thin;
      scrollbar-color: ${theme.background} ${theme.track};
    }

    /* For Edge */
    ${selector}::-ms-scrollbar {
      width: 10px;
    }

    ${selector}::-ms-scrollbar-track {
      background: ${theme.track};
    }

    ${selector}::-ms-scrollbar-thumb {
      border-radius: 6px;
      border: 2px solid ${theme.track};
      background-color: ${theme.background};
      background-clip: content-box;
    }
  `)}`
}
