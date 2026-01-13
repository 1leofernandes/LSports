export const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://lsports-bufv.onrender.com';

export function getTenant(): string {
  // Primeiro tenta extrair do path
  const parts = window.location.pathname.split('/').filter(Boolean);
  const tenantFromPath = parts.length > 0 ? parts[0] : null;
  
  // Se achou no path, salva em localStorage e retorna
  if (tenantFromPath) {
    localStorage.setItem('tenant', tenantFromPath);
    return tenantFromPath;
  }
  
  // Caso contrário, tenta localStorage
  const tenantFromStorage = localStorage.getItem('tenant');
  return tenantFromStorage || '';
}

export function ensureCss(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

export function showToast(message: string, type: 'info' | 'error' | 'success' = 'info') {
  // Prefer Toastify if available
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).Toastify) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Toastify({ text: message, duration: 3000, close: true }).showToast();
    return;
  }

  // Fallback to alert
  // eslint-disable-next-line no-alert
  alert(message);
}
