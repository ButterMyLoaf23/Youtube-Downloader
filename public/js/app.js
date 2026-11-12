const form = document.querySelector('#download-form');
const button = document.querySelector('#download-button');
const status = document.querySelector('#status');
const progressPanel = document.querySelector('#progress-panel');
const progressHelp = document.querySelector('#progress-help');
const format = document.querySelector('#format');

format.addEventListener('change', () => {
  button.textContent = `Download ${format.value.toUpperCase()}`;
});

form.addEventListener('submit', () => {
  button.disabled = true;
  button.textContent = `Preparing ${format.value.toUpperCase()}...`;
  progressPanel.hidden = false;
  status.textContent = 'Your download is being prepared...';
  progressHelp.textContent = 'If other downloads are ahead of yours, you are in the queue.';
});
