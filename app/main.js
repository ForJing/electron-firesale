const { app, BrowserWindow, dialog } = require("electron");
const fs = require("fs");

const windows = new Set();

let mainWindow = null;

app.on("ready", () => {
  mainWindow = new BrowserWindow({ show: false, title: "main win title" });
  mainWindow.loadFile(__dirname + "/index.html");

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    mainWindow.webContents.openDevTools();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});

app.on("window-all-closed", () => {
  if (process.platform === "darwin") {
    return false;
  }
  app.quit();
});

app.on("activate", (event, hasVisibleWindows) => {
  if (!hasVisibleWindows) {
    createWindow();
  }
});

function getFileFromUser(targetWindow) {
  const files = dialog.showOpenDialog(targetWindow, {
    properties: ["openFile"],
    filters: [
      { name: "Markdown Files", extensions: ["md", "markdown"] },
      { name: "Text Files", extensions: ["txt"] }
    ]
  });

  if (files) {
    openFile(targetWindow, files[0]);
  }
}

function openFile(targetWindow, file) {
  const content = fs.readFileSync(file).toString();
  app.addRecentDocument(file);
  targetWindow.setRepresentedFilename(file);
  targetWindow.webContents.send("file-opened", file, content);
}

function createWindow() {
  let x, y;

  const currentWindow = BrowserWindow.getFocusedWindow();

  if (currentWindow) {
    const [currentWindowX, currentWindowY] = currentWindow.getPosition();

    x = currentWindowX + 10;
    y = currentWindowY + 10;
  }

  let newWindow = new BrowserWindow({ show: false, x, y });

  newWindow.loadFile(__dirname + "/index.html");

  newWindow.webContents.openDevTools();

  newWindow.once("ready-to-show", () => {
    newWindow.show();
  });

  newWindow.on("closed", () => {
    windows.delete(newWindow);
    newWindow = null;
  });

  windows.add(newWindow);
  return newWindow;
}

app.on("will-finish-launching", () => {
  app.on("open-file", (event, file) => {
    const win = createWindow();
    win.once("ready-to-show", () => {
      openFile(win, file);
    });
  });
});

function saveHtml(targetWindow, content) {
  const file = dialog.showSaveDialog(targetWindow, {
    title: "Save Html",
    defaultPath: app.getPath("documents"),
    filters: [{ name: "HTML Files", extensions: ["html", "htm"] }]
  });

  if (!file) return;
  fs.writeFileSync(file, content);
}

function saveMarkdown(targetWindow, file, content) {
  if (!file) {
    file = dialog.showSaveDialog(targetWindow, {
      title: "Save Markdown",
      defaultPath: app.getPath("documents"),
      filters: [{ name: "Markdown Files", extensions: ["md", "markdown"] }]
    });
  }

  if (!file) return;
  fs.writeFileSync(file, content);
  openFile(targetWindow, file);
}

exports.createWindow = createWindow;
exports.saveHtml = saveHtml;
exports.getFileFromUser = getFileFromUser;
exports.saveMarkdown = saveMarkdown;
