---
title: Web Component 改造 Astro 链接预览
createDate: Mon May 29 2023 23:13:36 GMT+0800 (中国标准时间)
pubDate: Mon Jun 05 2023 00:21:34 GMT+0800 (China Standard Time)
tags: ['Web Component', 'Astro']
description: 使用 Web Component 改造 Astro 链接预览
draft: false
---

## 为啥
在 Astro 中使用 mdx 就能使用 astro 之类的组件了，但是我希望在普通的 markdown 内容内也能正常使用链接预览！为此我想了几种方式。第一种就是将我的 markdown 格式的改成 mdx 格式使用，第二种就是在编译 markdown 的时候将其注入，第三种就是将链接预览改造成 Web Component 的方式使用！这里我选择了最后一种方式，其实主要是想试一试 Web Component 。

## 具体实现
打算先编写一个 Web Component 组件，然后类似 astro 一样将其预编译出来。在 astro 的 hooks 有个 `astro:config:setup` 它提供了能够注入 script 的能力，只需要将编译后的内容注入，那么页面就获得了这个 Web componet 组件的能力了 
### 编写组件
整体实现预览链接组件代码比较简单，没什么好多说的！在 Astro 中可以通过指令来决定水和（Hydration）的时机，查看了具体实现的方式也不复杂，在链接预览组件中我觉得它的优先级并不是那么高，所以也可以实现同样的功能以此提升页面性能。具体渲染时机的代码如下

```ts

// ...
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
// ...

```

具体的组件代码
```ts

// ...
const rawTemplate = `
<style>
  .fancy-link-wrap {
    position: relative;
  }
  .fancy-link-wrap .fancy-link:hover +.popover-container{
    display: block;
  }
  .fancy-link-wrap .popover-container img {
    margin: 0;
  }
  .popover-container {
    display: none;
    text-align: center;
    position: absolute;
    right: 50%;
    width: 25rem;
    height: 15.5rem;
    padding: 0.5rem;
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
    width: 100%;
    height: 100%;
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

// ...

```

### 整合到 Astro

实现完成组件的逻辑后就需要先将这部分内容进行预编译，我这里使用的是 tsup 因为简单配置少。这里有个问题就是因为在 Astro 中可以设置生成预览链接的图片路径，那么我们预先生成的代码要如何感知这个配置的路径呢！我这里比较暴力直接对预先生成的代码通过特殊的编制进行替换。具体代码如下

```ts
function getInjectScript(outPath: string) {
  let content = readFileSync(resolve(new URL(".", import.meta.url).pathname, "./injectScript.prebuilt.js"), {
    encoding: "utf-8"
  })
  
  // replace path
  content = content.replace('__previewPath', `'/${outPath}'`)
  return content
}
function FancyLink(options?: Options): AstroIntegration {

  const { outPath = '__fancyLinkPreview' } = options || {}

  return {
    name: 'fancy-link',
    hooks: {
      "astro:config:setup"({ injectScript }) {
        const content = getInjectScript(outPath)
        injectScript('head-inline', content)
      },
      async "astro:build:done"({ dir, pages }) {
        const captureLinks = getCaptureLinks(dir, pages)
        const _outPath = resolve(dir.pathname, outPath)
        for (const { href } of captureLinks) {
          await capture(_outPath, href)
        }
      }
    }
  }
}
```


### 问题

#### 样式控制
凡事都有两面性，Shadow DOM 带来的隔离免受污染之苦。但是当外部想控制 Shadow DOM 的内的样式就不像之前那么方便了，Web Component 既然是标准当然也想到这个问题了，也提供了方法来控制内部的样式。常见的有几个方式

1. 通过 css variable，因为它能够穿透到 Shadow DOM 内部去
2. 直接外部传入，具体就是外部传入具体的 css 然后组件那监听属性动态设置
3. `::part` 它能够选择 Shadow DOM 中 `part` 属性的元素

我这里选择第三中来做的，主要因为第一种太麻烦了如果需要设置比较复杂的样式十分痛苦，第二种虽然能够比较自由的修改但是使用上并不方便样式直接写在属性上也不优雅。第三种也有些问题就是<fancy-link href="https://caniuse.com/?search=%3A%3Apart">兼容性</fancy-link>问题，对于个人使用来说我是可以接受这点的。

#### dark 支持

目前许多站点都实现了 dark 模式，我希望能够根据我页面目前的模式来确定如何展示我预览链接的模式。首先在生成预览图的时候同时生成 dark 、 light 两天图片，在没有使用 Web Component 的时候我可在外部通过我的 class 来控制如何显示，现在没办法了因为 Shadow DOM 的隔离性。通过新增一个 mode 属性标志当前的模式，监听该属性进行判断需要显示的图片模式。


## 更多

目前也还有一些其他问题需要优化的

1. dev模式问题  
需要实现在dev模式下如何预览
2. 预览图失败的 fallback
