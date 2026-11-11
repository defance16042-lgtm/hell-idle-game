const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronSave', {
  isElectron: true,
  read: () => ipcRenderer.sendSync('save-read'),
  write: store => ipcRenderer.sendSync('save-write', store),
  path: () => ipcRenderer.sendSync('save-path'),
  chooseDirectory: () => ipcRenderer.sendSync('save-choose-directory')
});
