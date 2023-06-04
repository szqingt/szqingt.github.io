export const isValidUrl = (urlString: string = '') => {
  try {
    return Boolean(new URL(urlString));
  }
  catch (e) {
    return false;
  }
}

export function simpleHash(str: string) {
  let hash = 0;
  if (str.length == 0) {
    return hash.toString(16);
  }
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export function previewFileName(href: string, dark: boolean = false) {
  const darkPrefix = 'dark:'
  return simpleHash(dark ? darkPrefix + href : href)
}