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

exports.getFileFromUser = targetWindow => {
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

  function openFile(targetWindow, file) {
    const content = fs.readFileSync(file).toString();
    targetWindow.webContents.send("file-opened", file, content);
  }
};

exports.createWindow = () => {
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
};
