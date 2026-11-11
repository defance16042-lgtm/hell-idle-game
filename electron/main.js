const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_STORE = { version: 1, characters: {}, sharedWarehouse: null, storage: {} };
let mainWindow;

function locationFile() {
  return path.join(app.getPath('userData'), 'save-location.json');
}

function defaultSaveFile() {
  return path.join(app.getPath('userData'), 'save.json');
}

function readSelectedDirectory() {
  try {
    const value = JSON.parse(fs.readFileSync(locationFile(), 'utf8'));
    if (value && typeof value.directory === 'string' && value.directory.trim()) return value.directory;
  } catch (_) {}
  return '';
}

function saveSelectedDirectory(directory) {
  fs.mkdirSync(app.getPath('userData'), { recursive: true });
  fs.writeFileSync(locationFile(), JSON.stringify({ directory }, null, 2), 'utf8');
}

function saveFilePath() {
  const directory = readSelectedDirectory();
  return directory ? path.join(directory, 'save.json') : defaultSaveFile();
}

function readStore() {
  try {
    const file = saveFilePath();
    if (!fs.existsSync(file)) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return { ...DEFAULT_STORE, ...parsed };
  } catch (error) {
    console.error('讀取 save.json 失敗:', error);
    return { ...DEFAULT_STORE };
  }
}

function writeStore(store) {
  try {
    const file = saveFilePath();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const temporary = `${file}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(store ?? DEFAULT_STORE), 'utf8');
    fs.renameSync(temporary, file);
    return { ok: true, path: file };
  } catch (error) {
    console.error('寫入 save.json 失敗:', error);
    return { ok: false, error: error.message, path: saveFilePath() };
  }
}

function chooseSaveDirectory() {
  const result = dialog.showOpenDialogSync(mainWindow, {
    title: '選擇遊戲存檔資料夾',
    properties: ['openDirectory', 'createDirectory']
  });
  if (!result || !result[0]) return { canceled: true };

  const directory = result[0];
  const oldFile = saveFilePath();
  const newFile = path.join(directory, 'save.json');
  try {
    fs.mkdirSync(directory, { recursive: true });
    if (oldFile !== newFile && fs.existsSync(oldFile) && !fs.existsSync(newFile)) {
      fs.copyFileSync(oldFile, newFile);
    }
    saveSelectedDirectory(directory);
    return { ok: true, canceled: false, directory, path: newFile };
  } catch (error) {
    return { ok: false, canceled: false, error: error.message, path: newFile };
  }
}

function registerSaveIpc() {
  ipcMain.on('save-read', event => { event.returnValue = readStore(); });
  ipcMain.on('save-write', (event, store) => { event.returnValue = writeStore(store); });
  ipcMain.on('save-path', event => { event.returnValue = saveFilePath(); });
  ipcMain.on('save-choose-directory', event => { event.returnValue = chooseSaveDirectory(); });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#120a0a',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));
}

function checkForUpdates() {
  if (!app.isPackaged) return;
  autoUpdater.checkForUpdatesAndNotify().catch(error => {
    console.warn('檢查遊戲更新失敗:', error.message);
  });
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      buttons: ['立即重新啟動', '稍後再說'],
      defaultId: 0,
      cancelId: 1,
      title: '遊戲更新完成',
      message: '新版本已下載完成，要現在重新啟動並安裝嗎？'
    }).then(result => {
      if (result.response === 0) autoUpdater.quitAndInstall();
    });
  });
}

app.whenReady().then(() => {
  registerSaveIpc();
  createWindow();
  checkForUpdates();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
