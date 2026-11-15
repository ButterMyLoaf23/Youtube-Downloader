(function () {
  class WindowManager {
    constructor(desktop, taskbar, recycleBin) { this.desktop = desktop; this.taskbar = taskbar; this.recycleBin = recycleBin; this.windows = new Map(); this.nextZIndex = 20; this.dragState = null; }

    register(element, options = {}) {
      const state = { element, title: options.title || 'Application', defaultPosition: options.defaultPosition || { left: 180, top: 90 }, defaultSize: options.defaultSize || { width: 640, height: null }, minimized: false, maximized: false, previousRect: null, taskbarButton: null };
      this.windows.set(element.id, state);
      this.bindWindow(state);
      this.createTaskbarButton(state);
      return state;
    }

    bindWindow(state) {
      const { element } = state;
      element.addEventListener('pointerdown', () => this.focus(state));
      element.querySelector('[data-window-drag-handle]').addEventListener('pointerdown', (event) => this.startDrag(event, state));
      element.querySelectorAll('[data-window-action]').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); this.handleAction(state, button.dataset.windowAction); }));
    }

    createTaskbarButton(state) {
      const button = document.createElement('button');
      button.className = 'taskbar-app'; button.type = 'button'; button.textContent = state.title; button.hidden = true;
      button.addEventListener('click', () => state.minimized ? this.restore(state) : this.focus(state));
      this.taskbar.append(button); state.taskbarButton = button;
    }

    open(id) {
      const state = this.windows.get(id); if (!state) return;
      if (state.minimized) return this.restore(state);
      if (state.element.hidden) { state.element.hidden = false; this.setDefaultGeometry(state); }
      this.focus(state);
    }

    setDefaultGeometry(state) {
      const rect = this.desktop.getBoundingClientRect(); const width = Math.min(state.defaultSize.width, rect.width - 20); const height = state.defaultSize.height || Math.min(430, rect.height - 80);
      state.element.style.width = `${Math.max(320, width)}px`; state.element.style.height = `${Math.max(260, height)}px`;
      state.element.style.left = `${Math.max(8, Math.min(state.defaultPosition.left, rect.width - width - 8))}px`; state.element.style.top = `${Math.max(8, Math.min(state.defaultPosition.top, rect.height - height - 48))}px`;
    }

    focus(state) {
      if (state.element.hidden) return;
      state.element.style.zIndex = ++this.nextZIndex; state.taskbarButton.hidden = false;
      this.windows.forEach((other) => other.taskbarButton.classList.toggle('active', other === state && !state.minimized));
    }

    handleAction(state, action) { if (action === 'minimize') this.minimize(state); if (action === 'maximize') state.maximized ? this.restore(state) : this.maximize(state); if (action === 'close') this.close(state); }
    minimize(state) { state.minimized = true; state.element.hidden = true; state.taskbarButton.hidden = false; state.taskbarButton.classList.remove('active'); }

    maximize(state) {
      const rect = state.element.getBoundingClientRect(); const desktopRect = this.desktop.getBoundingClientRect();
      state.previousRect = { left: rect.left - desktopRect.left, top: rect.top - desktopRect.top, width: rect.width, height: rect.height }; state.maximized = true; state.element.classList.add('maximized');
      Object.assign(state.element.style, { left: '0px', top: '0px', width: '100%', height: 'calc(100% - 34px)' }); this.focus(state);
    }

    restore(state) {
      state.minimized = false; state.element.hidden = false;
      if (state.maximized && state.previousRect) { state.maximized = false; state.element.classList.remove('maximized'); Object.assign(state.element.style, { left: `${state.previousRect.left}px`, top: `${state.previousRect.top}px`, width: `${state.previousRect.width}px`, height: `${state.previousRect.height}px` }); }
      else if (!state.element.style.width) this.setDefaultGeometry(state);
      this.focus(state);
    }

    close(state) { state.element.hidden = true; state.minimized = false; state.maximized = false; state.previousRect = null; state.taskbarButton.hidden = true; state.taskbarButton.classList.remove('active'); state.element.classList.remove('maximized'); }

    startDrag(event, state) {
      if (event.target.closest('button') || state.element.classList.contains('maximized')) return;
      this.focus(state); const elementRect = state.element.getBoundingClientRect(); const desktopRect = this.desktop.getBoundingClientRect();
      this.dragState = { state, offsetX: event.clientX - elementRect.left, offsetY: event.clientY - elementRect.top, desktopRect };
      event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.addEventListener('pointermove', this.onDrag); event.currentTarget.addEventListener('pointerup', this.stopDrag, { once: true }); event.currentTarget.addEventListener('pointercancel', this.stopDrag, { once: true });
    }

    onDrag = (event) => {
      if (!this.dragState) return; const { state, offsetX, offsetY, desktopRect } = this.dragState; const maxLeft = Math.max(0, desktopRect.width - state.element.offsetWidth); const maxTop = Math.max(0, desktopRect.height - state.element.offsetHeight - 34);
      state.element.style.left = `${Math.min(Math.max(0, event.clientX - desktopRect.left - offsetX), maxLeft)}px`; state.element.style.top = `${Math.min(Math.max(0, event.clientY - desktopRect.top - offsetY), maxTop)}px`;
      this.recycleBin.classList.toggle('drop-target', this.isOverRecycleBin(event.clientX, event.clientY));
    };

    stopDrag = (event) => { if (!this.dragState) return; const { state } = this.dragState; const overRecycleBin = this.isOverRecycleBin(event.clientX, event.clientY); this.recycleBin.classList.remove('drop-target'); this.dragState = null; event.currentTarget.removeEventListener('pointermove', this.onDrag); if (overRecycleBin) this.close(state); };
    isOverRecycleBin(x, y) { const rect = this.recycleBin.getBoundingClientRect(); return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom; }
  }
  window.WindowManager = WindowManager;
}());
