const { contextBridge, ipcRenderer } = require('electron');

// 렌더러 프로세스에서 사용할 수 있는 API 정의
contextBridge.exposeInMainWorld('electron', {
    minimize: () => ipcRenderer.send('minimize-window'),
    maximize: () => ipcRenderer.send('maximize-window'),
    close: () => ipcRenderer.send('close-window'),
    sendMaximizedStateRequest: () => ipcRenderer.send('check-window-maximized'),
    onMaximizedStateResponse: (callback) => ipcRenderer.on('window-maximized-response', (event, isMaximized) => callback(isMaximized)),

    fetchData: (type) => ipcRenderer.invoke('fetchData', type),
    writeData: (obj) => ipcRenderer.invoke('writeData', obj),

    insertData: (obj) => ipcRenderer.invoke('insertData', obj),
    updateData: (obj) => ipcRenderer.invoke('updateData', obj),
    deleteData: (obj) => ipcRenderer.invoke('deleteData', obj),

    addProject: (value) => ipcRenderer.invoke('addProject', value),
    delProject: (idx) => ipcRenderer.invoke('delProject', idx),

    translateNow: (obj) => ipcRenderer.invoke('translateNow', obj),

    openHtml: () => ipcRenderer.invoke('openHtml'),
    openUrl: (url) => ipcRenderer.invoke('openUrl', url),

    //개발 단계에서만...
    toggleDevTools: () => ipcRenderer.send('toggle-dev-tools'),
});