---
title: '如何在Astro中实现多种语法高亮模式'
pubDate: '2023-04-15'
description: ''
tags: ['Astro', 'Shiki', '技术']
draft: true
---

明明 JavaScript 就是为了解决阻塞才这么做的，我为什么要强行这么用呢？主要是因为这个 Blog 从 Hexo 换成 Astro来编写了，在新写的 Blog 我这里实现了 Dark Mode 使阅读的体验更好。  

但是我发现个问题，我的整体页面我都能自己通过`CSS variables`控制切换，唯独 markdown 里面的代码块的语法高亮我没法控制。根据文档 Astro 是通过 [Shiki](https://github.com/shikijs/shiki) 来实现语法高亮的， Astro 也提供了一些配置，让我们切换不同的主题的语法高亮方式！嗯不错！但是我想实现的是明和暗分别用不同的主题，有没有方式能实现呢？  

Astro 推荐我们阅读 [Shiki文档](https://github.com/shikijs/shiki/blob/main/docs/themes.md#loading-theme)，我在文档中发现给了我们两种方式实现
### Use the "css-variables" theme.
简单来说就是提供一些 css 的变量，我我们自己根据不同的 mode 切换的时候去将对应的变量应用为你想要的即可。但是这样有个问题
```css
<style>
  :root {
    --shiki-color-text: #EEEEEE;
    --shiki-color-background: #333333;
    --shiki-token-constant: #660000;
    --shiki-token-string: #770000;
    --shiki-token-comment: #880000;
    --shiki-token-keyword: #990000;
    --shiki-token-parameter: #AA0000;
    --shiki-token-function: #BB0000;
    --shiki-token-string-expression: #CC0000;
    --shiki-token-punctuation: #DD0000;
    --shiki-token-link: #EE0000;
  }
</style>
```


### Generate two Shiki code blocks, one for each theme.
