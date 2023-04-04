let themeMode = localStorage.getItem('color-scheme') || 'auto';

function toggleTheme() {
  document.documentElement.classList.toggle('dark')

  function setMode(mode: string) {
    themeMode = mode
    localStorage.setItem('color-scheme', themeMode);
  }

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
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