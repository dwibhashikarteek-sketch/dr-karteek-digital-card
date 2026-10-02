(() => {
  'use strict';
  const links = window.EMPIRE_ACADEMY_LINKS || {};
  const labels = {registration:'Register for Training ›',assessment:'Open Final MCQ ›',contact:'Contact Academy about my certificate',verification:'Verify a Certificate ›'};
  function approvedUrl(key, value) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password) return null;
      if (/^video[1-8]$/.test(key)) {
        const youtube = ['www.youtube.com','youtube.com','m.youtube.com'].includes(url.hostname);
        const validId = /^[A-Za-z0-9_-]{11}$/;
        if (youtube && url.pathname === '/watch' && validId.test(url.searchParams.get('v') || '')) return url.href;
        if (url.hostname === 'youtu.be' && validId.test(url.pathname.slice(1))) return url.href;
        return null;
      }
      if (['registration','assessment'].includes(key)) {
        if (url.hostname === 'forms.gle' && url.pathname.length > 1) return url.href;
        if (url.hostname === 'docs.google.com' && url.pathname.startsWith('/forms/') && url.pathname.endsWith('/viewform')) return url.href;
        return null;
      }
      return url.href;
    } catch { return null; }
  }
  document.querySelectorAll('[data-academy-link]').forEach(button => {
    const key = button.dataset.academyLink;
    const href = approvedUrl(key, links[key]);
    if (!href) return;
    button.href = href;
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
    button.removeAttribute('aria-disabled');
    button.textContent = labels[key] || 'Watch module video ↗';
  });
  const storageKey = 'empire-academy-personal-study-v1';
  const boxes = [...document.querySelectorAll('[data-study-module]')];
  const note = document.getElementById('checklist-note');
  let storageAvailable = true;
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const checked = new Set(Array.isArray(stored) ? stored.filter(n => Number.isInteger(n) && n >= 1 && n <= 8) : []);
    boxes.forEach(box => { box.checked = checked.has(Number(box.dataset.studyModule)); });
  } catch { storageAvailable = false; }
  function render() {
    const checked = boxes.filter(box => box.checked).map(box => Number(box.dataset.studyModule));
    document.getElementById('progress-percent').textContent = `${Math.round(checked.length / 8 * 100)}%`;
    document.getElementById('progress-count').textContent = `${checked.length} of 8 marked as studied`;
    const progress = document.getElementById('study-progress');
    progress.value = checked.length;
    progress.setAttribute('aria-label', `${checked.length} of 8 personally marked as studied`);
    return checked;
  }
  function save() {
    const checked = render();
    try { localStorage.setItem(storageKey,JSON.stringify(checked)); storageAvailable = true; }
    catch { storageAvailable = false; }
    if (!storageAvailable) note.textContent = 'Checklist storage is unavailable. Ticks last only while this page stays open and do not count as official completion.';
  }
  boxes.forEach(box => box.addEventListener('change',save));
  document.getElementById('reset-checklist').addEventListener('click',() => { boxes.forEach(box => box.checked = false); save(); });
  render();
  if (!storageAvailable) note.textContent = 'Saved checklist could not be loaded. Ticks are personal reminders and do not count as official completion.';
})();
