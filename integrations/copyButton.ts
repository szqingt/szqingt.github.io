import type { AstroIntegration } from "astro"

function getCopyButton(val: string) {
  return `<div class="copy-button-wrapper" aria-live="polite">
  <button class="copy-button" title="复制到剪贴板" value="${encodeURIComponent(val)}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true">
      <path d="M7.5 18.98q-.63 0-1.06-.44T6 17.48v-14q0-.63.44-1.07t1.06-.44h11q.63 0 1.06.44T20 3.47v14q0 .63-.44 1.07t-1.06.44Zm0-1.5h11v-14h-11v14Zm-3 4.5q-.63 0-1.06-.44T3 20.48V6.15q0-.33.21-.54.21-.21.54-.21.33 0 .54.21.21.21.21.54v14.32h11.1q.33 0 .54.22.21.21.21.53 0 .33-.21.54-.22.22-.54.22Zm3-18.5v14-14Z"></path>
    </svg></button>
  <p class="copy-button-tooltip">复制成功！</p>
  </div>`
}

function customerHtmlHandle(code: any, html: string, theme: string) {
  const titleReg = /(?:\s|^)title\s*=\s*(["'])(.*?)(?<!\\)\1/
  const match = (code.meta || '').match(titleReg)
  const [_, __, titleValue] = Array.from(match || [])
  const copyBtnHtml = getCopyButton(code.value)
  return `<figure class="${theme}-code-container ${titleValue ? 'has-title' : ''}">
      ${titleValue ? '<figcaption class="header"><span class="tite">${titleValue}</span></figcaption>' : ''}${html}${copyBtnHtml}
    </figure>`
}

const style = `
.vitesse-dark-code-container,
.vitesse-light-code-container {
  position: relative;
}

@media (hover: hover) {
  .vitesse-dark-code-container .copy-button,
  .vitesse-light-code-container .copy-button {
    opacity: 0;
  }
}

.vitesse-dark-code-container:hover .copy-button,
.vitesse-light-code-container:hover .copy-button {
  opacity: 1;
}


.vitesse-dark-code-container .copy-button-wrapper,
.vitesse-light-code-container .copy-button-wrapper {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  flex-direction: row-reverse;
}

.vitesse-dark-code-container .copy-button-wrapper .copy-button-tooltip,
.vitesse-light-code-container .copy-button-wrapper .copy-button-tooltip {
  display: none;
  margin: 0;
  position: relative;
  align-self: center;
  background-color: #6b7280;
  color: var(--c-text-secondary);
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.3rem;
}

.vitesse-dark-code-container .copy-button-wrapper .copy-button-tooltip::after,
.vitesse-light-code-container .copy-button-wrapper .copy-button-tooltip::after {
  content: '';
  position: absolute;
  inset-inline-end: calc(-2 * 0.32rem);
  border: 0.35rem solid transparent;
  border-inline-start-color: #6b7280;
  transform: translateY(50%);
}

.vitesse-dark-code-container .copy-button-wrapper .copy-button-tooltip.copy-button-tooltip-visible,
.vitesse-light-code-container .copy-button-wrapper .copy-button-tooltip.copy-button-tooltip-visible {
  display: block;
}
`

// form astro https://github.com/withastro/docs/blob/main/src/components/CodeSnippet/CodeSnippet.astro
const injectScriptRaw = `
(function init() {
  const styleEl = document.createElement('style');
  styleEl.innerText = \`${style}\`;
  document.head.appendChild(styleEl);
  const buttons = document.querySelectorAll('button.copy-button');
  let copyTimeout
  buttons.forEach((button) => {
    button.addEventListener('click', async () => {
      const codeText = decodeURIComponent(button.value);
      try {
        clearTimeout(copyTimeout);
        await navigator.clipboard.writeText(codeText);
        button.nextElementSibling.classList.add('copy-button-tooltip-visible');
        copyTimeout = setTimeout(() => {
          button.nextElementSibling.classList.remove('copy-button-tooltip-visible');
        }, 3000);
      } catch (err) {
        clearTimeout(copyTimeout);
        console.error('copy err:', err);
      }
    });
  });
})()
`



function markdownCodeCopy(): AstroIntegration {

  return {
    name: 'shiki-code-copy',
    hooks: {
      "astro:config:setup"({ injectScript, updateConfig, config }) {
        const [shikiPlugin] = config.markdown.remarkPlugins.splice(0, 1)
        const newShikiPligin = [
          // @ts-expect-error need more robust
          shikiPlugin[0],
          {
            // @ts-expect-error need more robust
            ...shikiPlugin[1],
            customerHtmlHandle
          }
        ]
        updateConfig({
          markdown: {
            remarkPlugins: [
              newShikiPligin
            ],
          }
        })
        injectScript('page', injectScriptRaw)
      }
    }
  }
}

export default markdownCodeCopy