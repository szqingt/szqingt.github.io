
let themeMode = localStorage.getItem('color-scheme') || 'auto'

export function getPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function getThemeClassWithMode(mode: string) {
  const prefersDark = getPrefersDark()
  return mode === 'auto' ? prefersDark ? 'dark' : 'light' : mode
}

export function toggleTheme(cb?: Function) {
  const prefersDark = getPrefersDark()

  function setMode(mode: string) {
    document.documentElement.classList.remove(getThemeClassWithMode(themeMode))
    themeMode = mode
    document.documentElement.classList.add(getThemeClassWithMode(themeMode))
    localStorage.setItem('color-scheme', themeMode)
    cb && cb(themeMode)
  }

  // 系统推荐黑暗 当前是不是light
  if (prefersDark && themeMode !== 'light') {
    setMode('light')
    return
  }
  //  当前是light 当前不是dark
  if (!prefersDark && themeMode !== 'dark') {
    setMode('dark')
    return
  }
  setMode('auto')
}

export function getThemeMode() {
  return themeMode
}

export {
  themeMode
}