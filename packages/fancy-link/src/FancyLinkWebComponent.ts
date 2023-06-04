// Note that this file is prebuilt to FancyLinkWebComponent.prebuilt.js
import { previewFileName } from './utils'

// Fancy Link
type Directive = (
  cb: Function,
  options: DirectiveOptions,
  el: HTMLElement
) => void;

type DirectiveOptions = {
  name: string;
  /**
   * The attribute value prov ided
   */
  value: string;
};


const mediaDirective: Directive = (load, options) => {
  const cb = async () => {
    const hydrate = await load();
    await hydrate();
  };

  if (options.value) {
    const mql = matchMedia(options.value);
    if (mql.matches) {
      cb();
    } else {
      mql.addEventListener('change', cb, { once: true });
    }
  }
};

const visibleDirective: Directive = (cb, _options, el) => {

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      io.disconnect();
      cb();
      break;
    }
  });

  io.observe(el)
};

const loadDirective: Directive = async (cb) => {
  cb()
};

const idleDirective: Directive = (cb) => {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(cb);
  } else {
    setTimeout(cb, 200);
  }
};

type DirectiveKeys = 'load' | 'idle' | 'visible' | 'media';

type FancyLinkActions = Record<DirectiveKeys, Directive>

const DirectiveActions: FancyLinkActions = {
  load: loadDirective,
  idle: idleDirective,
  visible: visibleDirective,
  media: mediaDirective
}

type PopupPosition = 'up' | 'down'



const rawTemplate = `
  <style>
  
    .fancy-link-wrap {
      position: relative;
    }
    .fancy-link-wrap .fancy-link:hover +.popover-container{
      display: block;
    }
    .popover-container {
      display: none;
      text-align: center;
      position: absolute;
      right: 50%;
      width: 24rem;
      height: 15rem;
      border-radius: 0.5rem;
      transform: translateX(50%);
      background-color: #474747fc;
      border: 1px solid #585858fc;
    }

    .popover-container.up {
      bottom: 1.5rem;
    }
    .popover-container.down {
      top: 1.5rem;
    }

    .popover-container .preview-img {
      margin: 0;
      width: 100%;
      height: 100%;
      border-radius: 0.5rem;
    }
  </style>
  <span class="fancy-link-wrap">
    <a part="link" class="fancy-link" target="_blank" rel="noopener"><slot /></a>
    <span class="popover-container up">
      <img loading="lazy" class="preview-img" alt="link preview" />
    </span>
  </span>
`

class FancyLink extends HTMLElement {
  renderTiming: DirectiveKeys = 'visible'
  mode: string = 'light'
  popupPosition: PopupPosition = 'up'
  href: string = ''
  previewPath: string = './'
  popoverContainer: HTMLDivElement | null = null
  previewImgEl: HTMLImageElement | null = null
  anchorEl: HTMLAnchorElement | null = null
  static get observedAttributes() {
    return ['mode', 'position', 'href']
  }
  // 属性变化调用
  attributeChangedCallback() {
    this.updateAttr()
    this.render()
  }

  constructor() {
    super();
    const timing = this.getAttribute('render-timing')
    timing && (this.renderTiming = timing as DirectiveKeys)
  }

  connectedCallback() {
    const action = DirectiveActions[this.renderTiming]
    action && action(() => this.init(), {
      name: '',
      value: ''
    }, this)
  }

  init() {
    const tempEl = document.createElement('template')
    tempEl.innerHTML = rawTemplate;
    const dom = tempEl.content.cloneNode(true);
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(dom);
    this.previewImgEl = shadowRoot.querySelector<HTMLImageElement>('.preview-img')
    this.anchorEl = shadowRoot.querySelector<HTMLAnchorElement>('.fancy-link')
    this.popoverContainer = shadowRoot.querySelector<HTMLDivElement>('.popover-container')
    this.updateAttr()
    this.render()
  }

  updateAttr() {
    this.href = this.getAttribute('href') ?? this.href
    this.mode = this.getAttribute('mode') ?? this.mode
    this.popupPosition = this.getAttribute('position') as PopupPosition ?? this.popupPosition
  }

  render() {
    this.anchorEl?.setAttribute('href', this.href)
    const isDark = this.mode === 'dark'
    const previewSrc = `${this.previewPath}/${previewFileName(this.href, isDark)}.png`
    this.previewImgEl?.setAttribute('src', previewSrc)
    this.popoverContainer?.classList.remove('up', 'down')
    this.popoverContainer?.classList.add(this.popupPosition)
  }
}

export default FancyLink
