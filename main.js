const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess = null;

function startNextServer() {
  // Runs your built Next.js standalone server
  const serverPath = path.join(__dirname, '.next/standalone/server.js');
  
  serverProcess = spawn('node', [serverPath], {
    env: { ...process.env, PORT: '3000', HOSTNAME: '127.0.0.1' },
    stdio: 'inherit'
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#030712',
    icon: path.join(__dirname, 'public/icon.png'), // Optional app icon
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Remove default menu bar for a clean desktop app look
  mainWindow.setMenuBarVisibility(false);

  // Load your local Next.js server
  const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  mainWindow.loadURL('http://localhost:3000');
} else {
  mainWindow.loadURL('http://127.0.0.1:3000');
}

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startNextServer();

  // Wait a couple of seconds for the server to spin up before opening the window
  setTimeout(createWindow, 2000);
});

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});