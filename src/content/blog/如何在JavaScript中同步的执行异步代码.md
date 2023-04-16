---
title: '如何在 JavaScript 中同步的执行异步代码'
pubDate: '2023-04-15'
description: '通常JavaScript是一个单线程的程序，为了解决遇到同步代码导致的阻塞。JavaScript将任务分为同步任务、异步任务来解决阻塞问题。那么问题来了，我们有办法在同步任务中执行异步任务吗？'
tags: ['JavaScript', 'Atomics', 'Worker', '技术']
draft: false
---
通常 JavaScript 是一个单线程的程序，为了解决遇到同步代码导致的阻塞。JavaScript 将任务分为同步任务、异步任务来解决阻塞问题。  

那么问题来了，我们有办法在同步任务中执行异步任务吗？可能大部分人都会直接想到说 `async` 和 `await` 就可以啊，那它真的是可以吗？

## `async` 和 `await`
其实`async` 和 `await` 主要是提供了一种更简单的方法来处理基于异步 Promise 的代码。但是它只是使得我们能够编写像同步代码一样的异步函数，本质上还是异步的！比如下面的代码，使用过 `async` 和 `await` 的应该比较容易知道 log 输出的并不是1、2、3、4而是 1、2、4、3。这也印证了执行并不是同步的，只是编写的时候是感觉是同步！
```ts
function sleep(ms: number) {
  return new Promise(res => {
    setTimeout(() => {
      res('sleep done')
    }, ms)
  })
}

async function test() {
  console.log(2)
  await sleep()
  console.log(3)
}

console.log(1)
test()
console.log(4)
```
## 为什么要同步执行异步代码
明明 JavaScript 就是为了解决阻塞才这么做的，我为什么要强行这么用呢？主要是因为这个 Blog 从 Hexo 换成 Astro来编写了，为了更好的阅读体验，我在新写的 Blog 我这里实现了 Dark Mode 。 但是发现没法在切换 Mode 的时候将语法高亮也切换成不同的主题。  

通过了解我发现可以自己编写插件来完成！在编写插件的时候发现 `Shiki` 初始化获取高亮的方法是返回的一个 `Promise` 但是 `remarkPlugins` 是以同步的方式执行的。这就是我为什么想要找到一种方式以同步的方式执行异步代码的原因！
```ts
// remarkPlugin 代码🌰
import { getHighlighter } from 'shiki'

export function shikiRemarkPlugin() {
  // 问题就是这的  getHighlighter 是返回的 Promise
  const highlighter = getHighlighter({
    theme: 'nord'
  })
  return function (tree, file) {
    // 遍历 tree 取到其中的 code 节点
    // 将其用 shiki highlighter.codeToHtml 转换成带主题的 html 代码
    // 然后将节点的 value 更新即可
  }
}

```

## Atomics

带着问题我发现了一个库[synckit](https://github.com/un-ts/synckit)，库的整体代码量并不大，大致看了一遍发现实现的关键 API 是个 `Atomics.wait()` 、 `Atomics.notify()`。

### 什么是 Atomics

根据 MDN 描述 [Atomics](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Atomics) 对象提供了一组静态方法对 SharedArrayBuffer 和 ArrayBuffer 对象进行原子操作。

什么是原子操作？后端应该比较常听说。原子操作是一种不可分割的操作，同一时刻只有一个操作在进行，保证读取或者获取数据的时候是正确的。  

为啥需要原子操作？在多线程、并发、锁等场景都需要原子操作来保证一致性和完整性，比如多个线程同时读写同一块内存上的数据，线程1将这块内存的值加1、线程2将这块内存的值减1。如过没有原子操作那么这个内存块的值操作之后将会是什么将无法预测

### `Atomics.wait()` 和 `Atomics.notify()`

静态方法`Atomics.wait()`，它可以在 Int32Array 数组中给定位置的值没有发生变化、仍然是给定的值时进程将会睡眠，直到被唤醒或超时。该方法返回一个字符串，值为"ok", "not-equal", 或 "timed-out" 之一。

静态方法`Atomics.notify()`，它就是用来唤醒等待队列中休眠的代理.

```ts
function sleep(n) {
  const status = Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n * 1000);
  console.log('Atomics.wait:', status)
}
console.log(1)
sleep(5)
console.log(2) // 5秒后输出
```

## 实现在同步代码中执行异步逻辑
结合前面的 Api， 我们这里参照 [synckit](https://github.com/un-ts/synckit) 自己实现一个简单的在同步进程执行异步方法的逻辑。

```ts
// example sync-util.mjs
import {
  MessageChannel,
  Worker,
  receiveMessageOnPort,
  workerData,
  parentPort,
} from 'node:worker_threads'

// 创建需要异步执行的 代码文件， 返回执行函数
export function createSyncFn(path) {
  // 初始化一个 MessageChannel 用于线程通信
  const { port1: mainPort, port2: workerPort } = new MessageChannel()
  const worker = new Worker(path, {
    workerData: {
      workerPort
    },
    transferList: [workerPort],
  })
  // 将worker类似挂起
  worker.unref();

  // 返回 执行方法
  return (...args) => {
    const sharedBuffer = new SharedArrayBuffer(4)
    const sharedBufferView = new Int32Array(sharedBuffer)

    // 向worker 发送消息 将 参数 和 共享的数据发送
    worker.postMessage({
      args,
      sharedBuffer
    })

    // 等待共享变动通知
    const status = Atomics.wait(sharedBufferView, 0, 0)

    if (!['ok', 'not-equal'].includes(status)) {
      throw new Error('Internal error: Atomics.wait() failed: ' + status)
    }

    // 收到 woker 发来的消息
    const { message } = receiveMessageOnPort(mainPort)

    return message
  }
}

// 在异步代码中调用 fn 为要执行方法
export function runWoker(fn) {
  const { workerPort } = workerData

  try {
    // 等待接收 主线程的消息
    parentPort.on('message', async ({args, sharedBuffer}) => {
      // 收到消息
      const sharedBufferView = new Int32Array(sharedBuffer)

      // 执行异步方法
      const res = await fn(...args)

      // 将异步的结果发送给主线程
      workerPort.postMessage(res)
      // 更改共享数据
      Atomics.add(sharedBufferView, 0, 1)
      // 通知共享数据发生更改
      Atomics.notify(sharedBufferView, 0)
    })
  } catch (e) {
    console.log(e);
  }
}

```

### 使用example
通过一个简单的异步方法测试暂停指定时间。可以看到 `index.mjs` 中 test time 耗时在 5 秒之上。
```ts
// index.mjs 
import { createSyncFn } from './sync.mjs'

const run = createSyncFn('./async-fn.mjs')

console.time('test time')
console.log('start')

const res = run(2000)
console.log('sync res: ', res)

const res2 = run(3000)
console.log('sync res2: ', res2)

console.log('end')
console.timeEnd('test time')

```

```ts
// async-fn.mjs
import { runWoker } from "./sync.mjs";

function sleep(ms) {
  return new Promise((res) => {
    setTimeout(() => res('sleep done:' + ms), ms)
  })
}

runWoker(async (...args) => {
  return sleep(...args)
})
```

## 实现 `remark-shiki-plugin` 插件

有了前面的内容，要实现我们的插件逻辑就比较简单了。我们只需要按照前面逻辑实现就可以，只需要将要用到 Shiki 的地方都放到 Worker 执行就可以了，插件最终代码可以在 [remark-shiki-plugin](https://github.com/szqingt/remark-shiki-plugin) 看到！