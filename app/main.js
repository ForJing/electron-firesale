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

exports.createWindow = title => {
  let newWindow = new BrowserWindow({ show: false, title });

  newWindow.loadFile(__dirname + "/index.html");

  newWindow.webContents.openDevTools();

  newWindow.once("ready-to-show", () => {
    newWindow.show();
  });

  newWindow.on("closed", () => {
    windows.delete(newWindow);
    newWindow = null;
  });
};
