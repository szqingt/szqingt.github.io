---
title: ES6的标记模板字符串Tagged template
createDate: Sat Apr 22 2023 21:49:11 GMT+0800 (中国标准时间)
pubDate: Sat Apr 22 2023 21:49:11 GMT+0800 (中国标准时间)
tags: ['技术', 'JavaScript']
description: 什么是标记模板字符串Tagged template，如何使用标记模板字符串Tagged template，它的使用场景是什么。
draft: false
---

## 起因
前不久在写一些 shell 脚本为了寻求一些更简单的解决方式的时候发现了 Google 开源的[zx](https://github.com/google/zx) 。最近在研究 Astro 的 Hydration 的实现，查看 Astro 的源码的时候。我同时看到一种新的模版字符串使用方法。

```js
// zx中可以用 `$` 后面跟上一个模板字符串
#!/usr/bin/env zx

await $`cat package.json | grep name`

```

```js
// 下面是 Astro 语法编译之后生成的代码 同样的可以看到 `$$render`后面跟了一个模板字符串
const $$Astro = $$createAstro();
const Astro = $$Astro;
const $$Index = $$createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return $$render`<html lang="en" class="astro-J7PV25F6"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="generator"${$$addAttribute(
    Astro2.generator,
    "content"
  )}><link rel="icon" type="image/svg+xml" href="/favicon.svg">${$$renderHead(
    $$result
  )}</head><body class="astro-J7PV25F6"><main class="astro-J7PV25F6"><h1 class="astro-J7PV25F6">Hello, Vue!!</h1>${$$renderComponent(
    $$result,
    "Counter",
    Counter,
    {
      "client:visible": true,
      "client:component-hydration": "visible",
      "client:component-path":
        "/workspaces/astro/examples/framework-vue/src/components/Counter.vue",
      "client:component-export": "default",
      class: "astro-J7PV25F6",
    }
  )}</main></body></html>`;
}, "/workspaces/astro/examples/framework-vue/src/pages/index.astro");
```

## 模板字符串
在2077年的今天，前端同学们应该没有人不知道模版字符串了吧。在刀耕火种的年代我们要写一些换行、拼接之类的简直叫一个  困难！ES6的新特性模版字符串（Template literals）将我们拉回文明社会！但是你真的使用过模版字符串的全部能力了吗？
```js
// 模板字符串常规用法
const name = '张三'
const message = `
  hello world!
  I'm ${name}
`
```

## 标记模板字符串
这是一种模板字符串更高级的形式，它允许你使用函数的方式解析模板字面量。标记函数的第一个参数包含模板字符串中所有的普通字符串文本数组，其余的参数是模板字符串中所有的表达式的值。我们可以用标记函数对这些参数执行任何操作，并返回被操作过的字符串。标记模板字符串这种方式让我们对模版字符串有更加强大更加的灵活的控制方式！  

比如在模板字符串中会将表达式[强制转换为字符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String#%E5%AD%97%E7%AC%A6%E4%B8%B2%E5%BC%BA%E5%88%B6%E8%BD%AC%E6%8D%A2)。比如`undefind`就会转换成字符串的 undefined , `null`也是如此转换为字符串的 null 等等。那我们就可以实现一个标记函数来控制模板字符串按照我们想要的方式输出！
```js
// 实现 undefined、null 类型不输出任何值！
function formatString(strings, ...values) {
  return strings.reduce((pre, cur, i) => {
    const value = values[i]
    if (value === undefined || value === null) {
      return pre + cur
    }
    return pre + value + cur
  })
}
`hello ${undefined}, I'm ${null}` // "hello undefined, I'm null"
formatString`hello ${undefined}, I'm ${null}` // "hello , I'm "
```

## 总之

总之，标记模板字符串是一种非常强大和灵活的字符串处理方式，比如动态生成 HTML 或其他文本格式、数据格式化等。它可以使代码更加灵活、易读和可重用，是一种处理复杂字符串的不错选择。
