let proxies = [];
export function produce(state, producer) {
  const previousProxies = proxies
    proxies = []
    try {
        // create proxy for root
        const rootClone = createProxy(undefined, baseState)
        // execute the thunk
        producer.call(rootClone, rootClone)
        // and finalize the modified proxy
        const res = finalize(rootClone)
        // revoke all proxies
        return res
    } finally {
        proxies = previousProxies
    }
}

function createProxy(parentState, state) {
  if ()
}