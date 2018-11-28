const {app, BrowserWindow} = require('electron')
  
  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  let win
  
  function createWindow () {
    // 创建浏览器窗口。
    win = new BrowserWindow({width: 800, height: 600})
  
    // 然后加载应用的 index.html。
    win.loadFile('demo.html')
  
    // // 打开开发者工具
    win.webContents.openDevTools()
  
    // 当 window 被关闭，这个事件会被触发。
    win.on('closed', () => {
      win = null
    })
  }
  
  // Electron 会在初始化后并准备
  // 创建浏览器窗口时，调用这个函数。
  // 部分 API 在 ready 事件触发后才能使用。
  app.on('ready', createWindow)
  
  // 当全部窗口关闭时退出。
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', () => {
    if (win === null) {
      createWindow()
    }
  })
  