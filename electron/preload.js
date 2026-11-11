const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronSave', {
  isElectron: true,
  getVersion: () => ipcRenderer.sendSync('app-version'),
  read: () => ipcRenderer.sendSync('save-read'),
  write: store => ipcRenderer.sendSync('save-write', store),
  path: () => ipcRenderer.sendSync('save-path'),
  chooseDirectory: () => ipcRenderer.sendSync('save-choose-directory'),
  updateCheck: () => ipcRenderer.invoke('update-check'),
  onUpdateStatus: callback => ipcRenderer.on('update-status', (_event, status) => callback(status))
});
