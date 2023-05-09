---
title: Astro Islands 解析
createDate: Mon Apr 17 2023 21:59:30 GMT+0800 (中国标准时间)
pubDate: Wed May 10 2023 00:32:33 GMT+0800 (China Standard Time)
tags: ['Astro', '技术']
description: Astro 群岛是什么，Astro 中如何进行 Hydration 的
draft: false
---

## Astro 群岛（Astro Islands）
> Astro 群岛指的是静态 HTML 中的交互性的 UI 组件。一个页面上可以有多个岛屿，并且每个岛屿都被独立呈现。你可以将它们想象成在一片由静态（不可交互）的 HTML 页面中的动态岛屿。

Astro 对于群岛的说明，可以看出主要就是可以动态交互的 UI 组件就称为群岛！

### 为什么要群岛
群岛是为了解决什么问题呢？目前大部分的 SSR、SSG 应用都是服务端返回整个页面的 HTML ，然后注入一段 JS 脚本进行事件绑定数据初始化等操作才能进入交互（也就是经常说的注水 Hydration<sup><a href="#ref1">1</a></sup>）。那这种方式有什么问题呢？  

对于比较简单的也没还是比较能接受的，当页面的内容越来越多交互越来越多，那么返回的js会越来越大要执行的脚本也越来越复杂。这导致了一个问题页面的可交互的时间（ TTI ）会越来越长。

### Astro 群岛怎么解决的这个问题

通常我们的页面不会全都是需要交互的内容，那么对于不需要交互的部分我们就不需要参与到 Hydration 到过程！仅仅对需要交互的部分进行 Hydation 。Astro 就是通过这种局部（partial）或说是选择性的注水（selective hydration）来缩短注水的时间！

Astro 默认生成不含 JavaScript 脚本的页面！当我们使用 Vue、React、Svelte 等框架的时候，Astro 会将其渲染为 HTML ，其脚本部分则会根据设置在不同的时机在进行注水！

## 具体实现

了解 Astro 中这部具体的实现方式，不可避免的需要先了解它的基本语法是如何解析的，然后遇到需要有交互部分又是如何解析的，最后到浏览器执行和进行注水又是如何进行的！

### Astro 模版解析

Astro 文件将组件中的脚本代部分放在栅栏（---）里面， 栅栏下面写于 JSX 类似的模板语法！这部分是如何进行解析的呢？

Astro 本身是基于 Vite 进行打包构建的，Astro 文件的解析是 `vite-plugin-astro` 插件来完成的！在插件内部通过 transform 钩子处理编译代码。Astro 的 [编译器](https://github.com/withastro/compiler) 是通过 Go 编写打包成 wasm 执行，它主要功能是将 Astro 解析为合法的 ts 并生成 sourcemap！
```ts title="packages/astro/src/core/compile/compile.ts" mark={16-28}
...
export async function compile({
	astroConfig,
	viteConfig,
	filename,
	source,
}: CompileProps): Promise<CompileResult> {
	const cssDeps = new Set<string>();
	const cssTransformErrors: AstroError[] = [];
	let transformResult: TransformResult;

	try {
		// Transform from `.astro` to valid `.ts`
		// use `sourcemap: "both"` so that sourcemap is included in the code
		// result passed to esbuild, but also available in the catch handler.
		transformResult = await transform(source, {
			filename,
			normalizedFilename: normalizeFilename(filename, astroConfig.root),
			sourcemap: 'both',
			internalURL: 'astro/server/index.js',
			astroGlobalArgs: JSON.stringify(astroConfig.site),
			resultScopedSlot: true,
			preprocessStyle: createStylePreprocessor({
				filename,
				viteConfig,
				cssDeps,
				cssTransformErrors,
			}),
			async resolvePath(specifier) {
				return resolvePath(specifier, filename);
			},
		});
	} catch (err: any) {
		...
	}

	handleCompileResultErrors(transformResult, cssTransformErrors);

	return {
		...transformResult,
		cssDeps,
		source,
	};
}
...
```

比如 ` example.astro` 这个 astro 组件
```astro title="example.astro"
---
const str: string = 'hello world!';
---

<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
		<meta name="viewport" content="width=device-width" />
		<meta name="generator" content={Astro.generator} />
		<title>Astro</title>
	</head>
	<body>
		<h1>{str}</h1>
	</body>
</html>

```

通过 Astro 编译器将，再通过 Vite 的 `transformWithEsbuild` 也就是 esbuild 编译符合 esm 的内容。最终生成内容：

```ts
import {
  Fragment,
  render as $$render,
  createAstro as $$createAstro,
  createComponent as $$createComponent,
  renderComponent as $$renderComponent,
  renderHead as $$renderHead,
  maybeRenderHead as $$maybeRenderHead,
  unescapeHTML as $$unescapeHTML,
  renderSlot as $$renderSlot,
  mergeSlots as $$mergeSlots,
  addAttribute as $$addAttribute,
  spreadAttributes as $$spreadAttributes,
  defineStyleVars as $$defineStyleVars,
  defineScriptVars as $$defineScriptVars,
} from "astro/server/index.js";

const $$Astro = $$createAstro();
const Astro = $$Astro;
const $$Index = $$createComponent(async ($$result, $$props, $$slots) => {
  const Astro = $$result.createAstro($$Astro, $$props, $$slots);
  Astro.self = $$Index;

  const str: string = "hello world!";

  return $$render`<html lang="en">
        <head>
                <meta charset="utf-8">
                <link rel="icon" type="image/svg+xml" href="/favicon.svg">
                <meta name="viewport" content="width=device-width">
                <meta name="generator"${$$addAttribute(
                  Astro.generator,
                  "content"
                )}>
                <title>Astro</title>
        ${$$renderHead($$result)}</head>
        <body>
                <h1>${str}</h1>
        </body>
</html>`;
}, "/workspaces/astro/examples/minimal/src/pages/index.astro");
export default $$Index;

//# sourceMappingURL=...
```

最后通过 server runtime 的 `renderPage` 生成一个流，

```ts title="packages/astro/src/runtime/server/render/page.ts"
export async function renderPage(
	result: SSRResult,
	componentFactory: AstroComponentFactory | NonAstroPageComponent,
	props: any,
	children: any,
	streaming: boolean,
	route?: RouteData | undefined
): Promise<Response> {
	...
	// Mark if this page component contains a <head> within its tree. If it does
	// We avoid implicit head injection entirely.
	result._metadata.headInTree =
		result.componentMetadata.get(componentFactory.moduleId!)?.containsHead ?? false;
	const factoryReturnValue = await componentFactory(result, props, children);
  // componentFactory 就是前面编译生成出的内容

  if (isRenderTemplateResult(factoryReturnValue) || factoryIsHeadAndContent) {
		// Wait for head content to be buffered up
		await bufferHeadContent(result);
		const templateResult = factoryIsHeadAndContent
			? factoryReturnValue.content
			: factoryReturnValue;

		let iterable = renderAstroTemplateResult(templateResult);
		let init = result.response;
		let headers = new Headers(init.headers);
		let body: BodyInit;

		if (streaming) {
			body = new ReadableStream({
				start(controller) {
					async function read() {
						let i = 0;
						try {
							for await (const chunk of iterable) {
								if (isHTMLString(chunk)) {
									if (i === 0) {
										if (!/<!doctype html/i.test(String(chunk))) {
											controller.enqueue(encoder.encode('<!DOCTYPE html>\n'));
										}
									}
								}

								const bytes = chunkToByteArray(result, chunk);
								controller.enqueue(bytes);
								i++;
							}
							controller.close();
						} catch (e) {
							// We don't have a lot of information downstream, and upstream we can't catch the error properly
							// So let's add the location here
							if (AstroError.is(e) && !e.loc) {
								e.setLocation({
									file: route?.component,
								});
							}

							controller.error(e);
						}
					}
					read();
				},
			});
		} else {
			body = await iterableToHTMLBytes(result, iterable);
			headers.set('Content-Length', body.byteLength.toString());
		}

		let response = createResponse(body, { ...init, headers });
		return response;
	}
  ...

	return factoryReturnValue;
}
```
最终转换成一个完整的 HTML 页面。
```html title="output.html"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <meta name="viewport" content="width=device-width">
    <meta name="generator" content="Astro v2.3.0">
    <title>Astro</title>
  </head>
  <body>
    <h1>hello world!</h1>
  </body>
</html>
```

### island 组件如何解析

在 Astro 可以通过客户端指令（`cliend:*`）将组件将组件变成一个 island 组件。

下面中引用了一个 Vue 的组件，通过 `client:visible` 将告诉 Astro 该组件将会在页面中可见的时候进行 Hydration
```astro title="example.astro" mark={27}
---
// Component Imports
import Counter from '../components/Counter.vue';
---

<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width" />
		<meta name="generator" content={Astro.generator} />
		<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
		<style>
			html,
			body {
				font-family: system-ui;
				margin: 0;
			}
			body {
				padding: 2rem;
			}
		</style>
	</head>
	<body>
		<main>

			<h1>Hello, Vue!!</h1>
			<Counter client:visible />
		</main>
	</body>
</html>

```
上面编译后将生成的内容
```ts title="output.js" mark={31-38}
import {
  render as $$render,
  createAstro as $$createAstro,
  createComponent as $$createComponent,
  renderComponent as $$renderComponent,
  renderHead as $$renderHead,
  addAttribute as $$addAttribute,
} from "astro/server/index.js";
import Counter from "../components/Counter.vue";
import "/workspaces/astro/examples/framework-vue/src/pages/index.astro?astro&type=style&index=0&lang.css";
const $$Astro = $$createAstro();
const Astro = $$Astro;
const $$Index = $$createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return $$render`<html lang="en" class="astro-J7PV25F6">
        <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width">
                <meta name="generator"${$$addAttribute(
                  Astro2.generator,
                  "content"
                )}>
                <link rel="icon" type="image/svg+xml" href="/favicon.svg">

        ${$$renderHead($$result)}</head>
        <body class="astro-J7PV25F6">
                <main class="astro-J7PV25F6">

                        <h1 class="astro-J7PV25F6">Hello, Vue!!</h1>
                        ${$$renderComponent($$result, "Counter", Counter, {
                          "client:visible": true,
                          "client:component-hydration": "visible",
                          "client:component-path":
                            "/workspaces/astro/examples/framework-vue/src/components/Counter.vue",
                          "client:component-export": "default",
                          class: "astro-J7PV25F6",
                        })}
                </main>
        </body></html>`;
}, "/workspaces/astro/examples/framework-vue/src/pages/index.astro");
export default $$Index;

```

其中的 `renderComponent` 方法， Astro 会判断需要渲染的 Component 是否是一个框架的组件是否需要进行 Hydration，对于需要的，会先找到该框架对应 ssr 渲染器渲染对应的 HTML，这时还会给客户端响应页面HTML时注入一段辅助Javascript片段，这会根据使用的指令不同注入不同的片段。主要是在定义 `astro-island` web component 实现指定时机进行以及加载处理 Hydration 相关逻辑 （`/workspaces/astro/packages/astro/src/runtime/server/astro-island.ts`）。最后生成 `<astro-island ... />。 最终生成的内容就会是：

```html title="index.html"
<!DOCTYPE html>
<html lang="en" class="astro-J7PV25F6">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <meta name="generator" content="Astro v2.3.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    <link rel="stylesheet" href="/_astro/index.b53c9f8b.css" />
  </head>
  <body class="astro-J7PV25F6">
    <main class="astro-J7PV25F6">
      <h1 class="astro-J7PV25F6">Hello, Vue!!</h1>
      <style>
        astro-island,
        astro-slot {
          display: contents;
        }
      </style>
      <script>
        (self.Astro = self.Astro || {}).visible = (
          getHydrateCallback,
          _opts,
          root
        ) => {
          const cb = async () => {
            let hydrate = await getHydrateCallback();
            await hydrate();
          };
          let io = new IntersectionObserver((entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              io.disconnect();
              cb();
              break;
            }
          });
          for (let i = 0; i < root.children.length; i++) {
            const child = root.children[i];
            io.observe(child);
          }
        };
        window.dispatchEvent(new Event("astro:visible"));
        var _a;
        {
          const propTypes = {
            0: (value) => value,
            1: (value) => JSON.parse(value, reviver),
            2: (value) => new RegExp(value),
            3: (value) => new Date(value),
            4: (value) => new Map(JSON.parse(value, reviver)),
            5: (value) => new Set(JSON.parse(value, reviver)),
            6: (value) => BigInt(value),
            7: (value) => new URL(value),
            8: (value) => new Uint8Array(JSON.parse(value)),
            9: (value) => new Uint16Array(JSON.parse(value)),
            10: (value) => new Uint32Array(JSON.parse(value)),
          };
          const reviver = (propKey, raw) => {
            if (propKey === "" || !Array.isArray(raw)) return raw;
            const [type, value] = raw;
            return type in propTypes ? propTypes[type](value) : void 0;
          };
          if (!customElements.get("astro-island")) {
            customElements.define(
              "astro-island",
              ((_a = class extends HTMLElement {
                constructor() {
                  super(...arguments);
                  this.hydrate = () => {
                    if (
                      !this.hydrator ||
                      (this.parentElement &&
                        this.parentElement.closest("astro-island[ssr]"))
                    ) {
                      return;
                    }
                    const slotted = this.querySelectorAll("astro-slot");
                    const slots = {};
                    const templates = this.querySelectorAll(
                      "template[data-astro-template]"
                    );
                    for (const template of templates) {
                      const closest = template.closest(this.tagName);
                      if (!closest || !closest.isSameNode(this)) continue;
                      slots[
                        template.getAttribute("data-astro-template") ||
                          "default"
                      ] = template.innerHTML;
                      template.remove();
                    }
                    for (const slot of slotted) {
                      const closest = slot.closest(this.tagName);
                      if (!closest || !closest.isSameNode(this)) continue;
                      slots[slot.getAttribute("name") || "default"] =
                        slot.innerHTML;
                    }
                    const props = this.hasAttribute("props")
                      ? JSON.parse(this.getAttribute("props"), reviver)
                      : {};
                    this.hydrator(this)(this.Component, props, slots, {
                      client: this.getAttribute("client"),
                    });
                    this.removeAttribute("ssr");
                    window.removeEventListener("astro:hydrate", this.hydrate);
                    window.dispatchEvent(new CustomEvent("astro:hydrate"));
                  };
                }
                connectedCallback() {
                  if (!this.hasAttribute("await-children") || this.firstChild) {
                    this.childrenConnectedCallback();
                  } else {
                    new MutationObserver((_, mo) => {
                      mo.disconnect();
                      this.childrenConnectedCallback();
                    }).observe(this, { childList: true });
                  }
                }
                async childrenConnectedCallback() {
                  window.addEventListener("astro:hydrate", this.hydrate);
                  let beforeHydrationUrl = this.getAttribute(
                    "before-hydration-url"
                  );
                  if (beforeHydrationUrl) {
                    await import(beforeHydrationUrl);
                  }
                  this.start();
                }
                start() {
                  const opts = JSON.parse(this.getAttribute("opts"));
                  const directive = this.getAttribute("client");
                  if (Astro[directive] === void 0) {
                    window.addEventListener(
                      `astro:${directive}`,
                      () => this.start(),
                      { once: true }
                    );
                    return;
                  }
                  Astro[directive](
                    async () => {
                      const rendererUrl = this.getAttribute("renderer-url");
                      const [componentModule, { default: hydrator }] =
                        await Promise.all([
                          import(this.getAttribute("component-url")),
                          rendererUrl ? import(rendererUrl) : () => () => {},
                        ]);
                      const componentExport =
                        this.getAttribute("component-export") || "default";
                      if (!componentExport.includes(".")) {
                        this.Component = componentModule[componentExport];
                      } else {
                        this.Component = componentModule;
                        for (const part of componentExport.split(".")) {
                          this.Component = this.Component[part];
                        }
                      }
                      this.hydrator = hydrator;
                      return this.hydrate;
                    },
                    opts,
                    this
                  );
                }
                attributeChangedCallback() {
                  if (this.hydrator) this.hydrate();
                }
              }),
              (_a.observedAttributes = ["props"]),
              _a)
            );
          }
        }
      </script>
      <astro-island
        uid="Z2i4A0d"
        component-url="/_astro/Counter.079cc75b.js"
        component-export="default"
        renderer-url="/_astro/client.572469c0.js"
        props='{"class":[0,"astro-J7PV25F6"]}'
        ssr=""
        client="visible"
        before-hydration-url="/_astro/astro_scripts/before-hydration.js.090f1243.js"
        opts='{"name":"Counter","value":true}'
        await-children=""
        ><!--[-->
        <div class="counter">
          <button>-</button>
          <pre>0</pre>
          <button>+</button>
        </div>
        <div class="counter-message"><!--[--><!--]--></div>
        <!--]--></astro-island
      >
    </main>
  </body>
</html>
```

### 浏览器如何加载

根据我们在组件上加的 `cliend:*` 不同属性表示该组件注水的时机，目前 Astro 提供的客户端指令以及代表的时间节点如下：
1. `client:load` 表示在页面加载阶段

2. `client:idle` 表示页面完成了初始加载，并触发 requestIdleCallback（如不支持使用的 setTimeout 200ms）事件

3. `client:visible` 表示组件进入用户的视口

4. `client:media` 满足指定的媒体查询 [matchMedia api](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/matchMedia)

5. `client:only` 跳过 HTML 服务端渲染，只在客户端进行渲染

比如前面 `Counter` 使用的是 `client:visible` 指令，当该组件进入视口就会去加载该组件需要的脚本然后进行 Hydration。

