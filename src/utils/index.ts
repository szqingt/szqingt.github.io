let themeMode = localStorage.getItem('color-scheme') || 'auto'

function toggleTheme() {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

  function setMode(mode: string) {
    document.documentElement.classList.remove(themeMode === 'auto' ? prefersDark ? 'dark' : 'light' : themeMode)
    themeMode = mode
    document.documentElement.classList.add(themeMode === 'auto' ? prefersDark ? 'dark' : 'light' : themeMode)
    localStorage.setItem('color-scheme', themeMode)
  }

  // 系统推荐黑暗 当前是不是light
  if (prefersDark && themeMode !== 'light') {
    setMode('light')
    return
  }
  //  当前是light 当前不是dark
  if(!prefersDark && themeMode !== 'dark') {
    setMode('dark')
    return
  }
  setMode('auto')
}

export {
  themeMode,
  toggleTheme
}