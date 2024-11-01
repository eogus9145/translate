const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const cheerio = require("cheerio");

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 1400,
        height: 800,
        minWidth: 1400,
        minHeight: 800,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // preload 설정
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false, // Node 통합 비활성화
        },
    });

    win.loadURL('http://localhost:3000');
}

//개발자도구 열기 (개발시에만 사용할것)
ipcMain.on('toggle-dev-tools', () => {
    if (win) {
        win.webContents.toggleDevTools();
    }
});

// 최소화
ipcMain.on('minimize-window', (event) => {
    win.minimize();
});

//최대화
ipcMain.on('maximize-window', (event) => {
    if (win.isMaximized()) {
        win.restore();
    } else {
        win.maximize();
    }
});

// 닫기
ipcMain.on('close-window', (event) => {
    win.close();
});

// 최대화 여부
ipcMain.on('check-window-maximized', (event) => {
    const isMaximized = win.isMaximized();
    event.sender.send('window-maximized-response', isMaximized);
});

// json파일 불러오기
ipcMain.handle('fetchData',  async (event, type) => {
    try {
        let jsonStr = fs.readFileSync(path.join(__dirname, 'src', 'json', type + '.json'));
        let jsonObj = JSON.parse(jsonStr); 
        return jsonObj;
    } catch(err) {
        console.error(type + '.json : failed to load');
    }
});

// json파일 전체 덮어씆기
ipcMain.handle('writeData',  async (event, obj) => {
    try {
        let type = obj.type;
        let filePath = path.join(__dirname, 'src', 'json', type + '.json')
        let content = obj.content;
        let jsonStr = JSON.stringify(content, null, 2);
        fs.writeFileSync(filePath, jsonStr);
        return { cd: '0000', msg : '저장 되었습니다' };
    } catch(err) {
        console.log(type + '.json : failed to load');
        return { cd: '9999', msg : '저장에 실패하였습니다' };
    }
});

// json 파일을 읽은 다음 파싱해서 특정 부분만 추가
ipcMain.handle('insertData', async (event, obj) => {
    try {
        let fileName = obj.type;
        let content = obj.content;
        let filePath = path.join(__dirname, 'src', 'json', fileName + '.json');
        let jsonStr = fs.readFileSync(filePath);
        let arr = JSON.parse(jsonStr);
        let insertIdx = parseInt(Math.max(...arr.map(item => item.idx))) + 1;
        content.idx = insertIdx;
        arr.push(content);
        let resultStr = JSON.stringify(arr, null, 2);
        fs.writeFileSync(filePath, resultStr);
        return { cd: '0000', msg : '추가 되었습니다'};
    } catch(err) {
        console.log(type + '.json : failed to load');
        return { cd: '9999', msg : '추가에 실패하였습니다' };
    }
});

// json 파일을 읽은 다음 파싱해서 특정 부분만 수정
ipcMain.handle('updateData', async (event, obj) => {
    try {
        let fileName = obj.type;
        let content = obj.content;
        let idx = content.idx;
        let filePath = path.join(__dirname, 'src', 'json', fileName + '.json');
        let jsonStr = fs.readFileSync(filePath);
        let arr = JSON.parse(jsonStr);
        let newArr = arr.map((v,i) => { 
            if(v.idx == idx) v = content;
            return v;
        });
        let resultStr = JSON.stringify(newArr, null, 2);
        fs.writeFileSync(filePath, resultStr);
        return { cd: '0000', msg : '수정 되었습니다', data : newArr };
    } catch(err) {
        console.log(type + '.json : failed to load');
        return { cd: '9999', msg : '수정에 실패하였습니다', data : arr };
    }
});

// json 파일을 읽은 다음 파싱해서 특정 부분만 삭제
ipcMain.handle('deleteData', async (event, obj) => {
    try {
        let fileName = obj.type;
        let idx = obj.idx;
        let filePath = path.join(__dirname, 'src', 'json', fileName + '.json');
        let jsonStr = fs.readFileSync(filePath);
        let arr = JSON.parse(jsonStr);
        let newArr = arr.filter(v => v.idx !== idx);
        let resultStr = JSON.stringify(newArr, null, 2);
        fs.writeFileSync(filePath, resultStr);
        return { cd: '0000', msg : '삭제 되었습니다', data : newArr };
    } catch(err) {
        console.log(type + '.json : failed to load');
        return { cd: '9999', msg : '삭제에 실패하였습니다', data : arr };
    }
});

// 빈 프로젝트 추가
ipcMain.handle('addProject',  async (event, value) => {
    try {
        let jsonStr = fs.readFileSync(path.join(__dirname, 'src', 'json', 'project.json'));
        let jsonObj = JSON.parse(jsonStr);
        const lastObj = jsonObj.reduce((max, obj) => (obj.idx > max.idx ? obj : max), jsonObj[0]);
        const lastIdx = parseInt(lastObj.idx) + 1;
        jsonObj.push(
            {
                idx : lastIdx,
                name : value,
                reg_date : new Date(),
                last_modify_date : new Date(),
                files : []
            }
        );

        fs.writeFileSync(path.join(__dirname, 'src', 'json', 'project.json'), JSON.stringify(jsonObj, null ,2));
        return { cd : '0000', msg: '프로젝트가 추가되었습니다', list : jsonObj };
    } catch(err) {
        console.log('failed to add project');
        return { cd : '9999', msg: '프로젝트 추가에 실패하였습니다.', list : null };
    }
});

//프로젝트 삭제
ipcMain.handle('delProject',  async (event, idx) => {
    try {
        let jsonStr = fs.readFileSync(path.join(__dirname, 'src', 'json', 'project.json'));
        let jsonObj = JSON.parse(jsonStr);
        let newObj = jsonObj.filter(v => v.idx !== idx);
        fs.writeFileSync(path.join(__dirname, 'src', 'json', 'project.json'), JSON.stringify(newObj, null ,2));
        return { cd : '0000', msg: '삭제되었습니다', list : newObj };
    } catch(err) {
        console.log('failed to add project');
        return { cd : '9999', msg: '삭제에 실패하였습니다.', list : null };
    }
});

//실시간번역
ipcMain.handle('translateNow', async (event, obj) => {
    let sl = obj.sl;
    let tl = obj.tl;
    let q = obj.q;
    try {
        const response = await fetch(`https://translate.google.com/m?sl=${sl}&tl=${tl}&q=${encodeURIComponent(q)}`);
        const html = await response.text();
        const $ = cheerio.load(html);
        const result = $(".result-container").text();
        return { cd: '0000', text: result }
    } catch (error) {
        return { cd: '9999', text: '번역에 실패하였습니다.' }
    }
});

// html열기
ipcMain.handle('openHtml', async (event) => {
    try {
        
        const { x, y, width, height } = win.getBounds();
        const dialogWidth = 600;
        const dialogHeight = 400;
        const dialogX = x + (width / 2) - (dialogWidth / 2);
        const dialogY = y + (height / 2) - (dialogHeight / 2);

        const result = await dialog.showOpenDialog(win, {
            properties: ['openFile'],
            modal: true,
            x: dialogX,
            y: dialogY,
            width: dialogWidth,
            height: dialogHeight,
            filters: [ { name: 'HTML Files', extensions: ['html'] } ]
        });

        let fileContent = fs.readFileSync(result.filePaths[0], 'utf-8');

        const $ = cheerio.load(fileContent);

        let allText = [];

        $('*:not(style):not(script)').contents().each(function() {
            if (this.type === 'text') {
                if($(this).text().trim().length > 0) {
                    allText.push($(this).text().trim());
                    const wrappedText = `%%${$(this).text().trim()}%%`;
                    $(this).replaceWith(wrappedText);
                }
            }
        });


        if (!result.canceled) return {html : $.html(), textNodes : allText};

    } catch(err) {
        console.error("html파일 여는 중 에러발생 : ", err);
    }
});

// url 열기
ipcMain.handle('openUrl', async (event, url) => {

});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

function formatHtml(html) {
    return html
        .replace(/</g, '\n<') // 각 태그 앞에 줄바꿈 추가
        .replace(/>\s*</g, '>\n<') // 태그 사이에 줄바꿈 추가
        .replace(/>(\s*?)/g, '>\n    ') // 태그가 끝나고 줄바꿈 및 들여쓰기 추가
        .trim(); // 불필요한 공백 제거
}