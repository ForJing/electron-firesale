const { app, BrowserWindow, dialog } = require("electron");
const fs = require("fs");

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
  const files = dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      { name: "Text Files", extensions: ["txt"] },
      { name: "Markdown Files", extensions: ["md", "markdown"] }
    ]
  });

  if (!files) {
    return;
  }

  const file = files[0];
  const content = fs.readFileSync(file).toString();
  console.log(content);
}
