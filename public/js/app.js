(function () {
  const desktop = document.querySelector('#desktop');
  const manager = new WindowManager(desktop, document.querySelector('#running-apps'), document.querySelector('#recycle-bin'));
  manager.register(document.querySelector('#downloader-window'), { title: 'YouTube Downloader', defaultPosition: { left: 180, top: 85 }, defaultSize: { width: 640, height: 390 } });

  document.querySelectorAll('[data-open-window]').forEach((icon) => {
    let clickTimer;
    icon.addEventListener('click', () => { clearTimeout(clickTimer); clickTimer = setTimeout(() => icon.classList.add('selected'), 220); });
    icon.addEventListener('dblclick', () => { clearTimeout(clickTimer); icon.classList.add('selected'); manager.open(icon.dataset.openWindow); });
  });

  document.querySelectorAll('[data-external-url]').forEach((shortcut) => shortcut.addEventListener('dblclick', () => window.open(shortcut.dataset.externalUrl, '_blank', 'noopener')));
  document.querySelector('#start-button').addEventListener('click', () => document.querySelector('#start-button').classList.toggle('active'));

  const clock = document.querySelector('#clock');
  function updateClock() { const now = new Date(); clock.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); clock.dateTime = now.toISOString(); }
  updateClock(); setInterval(updateClock, 30000);

  const form = document.querySelector('#download-form'); const button = document.querySelector('#download-button'); const status = document.querySelector('#status'); const progressPanel = document.querySelector('#progress-panel'); const progressHelp = document.querySelector('#progress-help'); const format = document.querySelector('#format');
  format.addEventListener('change', () => { button.textContent = `Download ${format.value.toUpperCase()}`; });
  form.addEventListener('submit', () => { button.disabled = true; button.textContent = `Preparing ${format.value.toUpperCase()}...`; progressPanel.hidden = false; status.textContent = 'Your download is being prepared...'; progressHelp.textContent = 'If other downloads are ahead of yours, you are in the queue.'; });

}());
