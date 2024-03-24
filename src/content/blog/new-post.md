---
title: Immer 实现核心逻辑
createDate: Sat Oct 07 2023 13:41:20 GMT+0800 (中国标准时间)
pubDate: Sat Oct 07 2023 13:41:20 GMT+0800 (中国标准时间)
tags: ['Immer', 'immutable', '前端']
description:  Immer 是如何实现的
draft: true
---

1. 什么是 Immer
2. immutable 有什么有用处
3. 如何使用 Immer
4. Immer 是如何做的
5. 结尾

优点

Immutability with normal JavaScript objects and arrays. No new APIs to learn!
Strongly typed, no string based paths selectors etc.
Structural sharing out of the box
Object freezing out of the box
Deep updates are a breeze
Boilerplate reduction. Less noise, more concise code.
Small: bundled and minified: 2KB.
Read further to see all these benefits explained.

什么是 immutable

在前端开发中，"immutable" 通常指的是一种数据结构或编程模式，其中数据一旦创建就不能被修改。这意味着如果你需要对数据进行更改，必须创建一个新的数据副本，而不是直接修改原始数据。这种不可变性的概念在前端开发中有许多用途，以下是一些常见的情况和用途：

1. **状态管理**：在前端应用程序中，特别是使用一些库或框架（例如React、Redux、VueX）的情况下，将应用程序的状态保存为不可变数据结构可以更容易地管理状态变化。这样可以确保状态的变化是可追踪的，从而更容易调试和测试。

2. **性能优化**：不可变数据结构可以帮助提高性能，因为在进行数据比较时，可以通过简单地比较引用而不是深层次的对象来快速确定数据是否发生了更改。这可以用于避免不必要的渲染和重新计算。

3. **并发性**：在多线程或并发环境中，不可变数据可以避免竞态条件和数据冲突，因为数据不会被多个线程同时修改。

4. **时间旅行调试**：使用不可变数据结构可以更轻松地实现时间旅行调试功能，因为您可以保存应用程序状态的历史记录，并轻松还原到以前的状态。

5. **函数式编程**：不可变性是函数式编程范例的关键部分，它鼓励将函数视为纯函数，不会修改传入的参数，而是返回新的值。

在JavaScript中，可以使用一些工具库（例如Immutable.js）或者ES6的特性（例如不可变数组方法如`map()`、`filter()`、`concat()`等）来实现不可变性。这些技术可以帮助您更轻松地处理前端应用程序中的数据，并提高代码的可维护性和性能。