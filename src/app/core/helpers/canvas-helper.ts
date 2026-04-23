export function getRendererPreference(): 'webgl' | 'canvas' {
  const ua = navigator.userAgent.toLowerCase();
  const isFirefoxDesktop = ua.includes('firefox') && !ua.includes('android');

  return isFirefoxDesktop ? 'canvas' : 'webgl';
}
