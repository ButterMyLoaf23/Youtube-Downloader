const form = document.querySelector('#download-form');
const button = document.querySelector('#download-button');
const status = document.querySelector('#status');
const progressPanel = document.querySelector('#progress-panel');
const progressHelp = document.querySelector('#progress-help');
const format = document.querySelector('#format');
const windowBar = document.querySelector('.window-bar');
const windowPanel = document.querySelector('main');

let dragState = null;

windowBar.addEventListener('pointerdown', (event) => {
  const bounds = windowPanel.getBoundingClientRect();

  // Convert the initially centered panel into a freely positioned window.
  windowPanel.style.position = 'fixed';
  windowPanel.style.left = `${bounds.left}px`;
  windowPanel.style.top = `${bounds.top}px`;
  windowPanel.style.margin = '0';
  windowPanel.style.zIndex = '10';

  dragState = {
    offsetX: event.clientX - bounds.left,
    offsetY: event.clientY - bounds.top
  };
  windowBar.setPointerCapture(event.pointerId);
});

windowBar.addEventListener('pointermove', (event) => {
  if (!dragState) return;

  const maxLeft = Math.max(0, window.innerWidth - windowPanel.offsetWidth);
  const maxTop = Math.max(0, window.innerHeight - windowPanel.offsetHeight);
  const left = Math.min(Math.max(0, event.clientX - dragState.offsetX), maxLeft);
  const top = Math.min(Math.max(0, event.clientY - dragState.offsetY), maxTop);

  windowPanel.style.left = `${left}px`;
  windowPanel.style.top = `${top}px`;
});

function stopDragging(event) {
  dragState = null;
  if (event && windowBar.hasPointerCapture(event.pointerId)) {
    windowBar.releasePointerCapture(event.pointerId);
  }
}

windowBar.addEventListener('pointerup', stopDragging);
windowBar.addEventListener('pointercancel', stopDragging);

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
