const { app, BrowserWindow, dialog } = require("electron");

let mainWindow = null;

app.on("ready", () => {
  mainWindow = new BrowserWindow({ show: false });
  mainWindow.loadFile(__dirname + "/index.html");

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    mainWindow.webContents.openDevTools();
    getFileFromUser();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});

function getFileFromUser() {
  const files = dialog.showOpenDialog({
    properties: ["openFile"]
  });

  if (files) {
    console.log(files);
  }
}
