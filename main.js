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
        return { cd: '0000', msg : '저장 되었습니다', data : content };
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

        if(result.canceled) {
            return {cd: '0000', msg: '파일선택 도중 취소함', html : null};
        } else {
            let fileContent = fs.readFileSync(result.filePaths[0], 'utf-8');
            return {cd: '0000', msg: '', html : fileContent};
        }
    } catch(err) {
        console.error("html파일 여는 중 에러발생 : ", err);
        return {cd: '9999', msg: '파일을 불러오는 중 에러발생', html : null};
    }
});

// url 열기
ipcMain.handle('openUrl', async (event, url) => {
    try{
        const response = await fetch(url);
        const html = await response.text();
        return {cd: '0000', msg: '', html : html};
    } catch(err) {
        return {cd: '9999', msg: '입력하신 URL을 불러오지 못했습니다.', html : null};
    }
});

// html에서 번역 가능한 텍스트 찾기
ipcMain.handle('targetFind', async (event, html) => {
    try{
        const $ = cheerio.load(html);

        let allText = [];
        let idx = 0;
        $('*:not(style):not(script)').contents().each(function() {
            if (this.type === 'text') {
                const text = $(this).text().trim();
                
                if (text.length > 0) {
                    let obj = {};
                    obj.idx = idx++;
                    obj.text = text;    
                    let wrappedText = '{%' + text + '%}';
                    $(this).replaceWith(wrappedText);

                    //cheerio에서 래핑하는게 아니라 html에서 래핑해야됨....

                    allText.push(obj);

                }
            }
        });

        let fixedHtml = $.html();
        fixedHtml = fixedHtml.replace(/(<html[^>]*>)/g, '\n$1\n');
        let foundLines = [];
        for(let i=0; i<allText.length; i++) {
            let placeholder = '{%' + allText[i].text + '%}'
            let result = findPosition(fixedHtml, placeholder, foundLines);
            foundLines = result.foundLines;
            let position = result.position;
            allText[i].line = position.line;
            allText[i].column = position.column;
        }

        return {cd: '0000', msg: '', list : allText};
    } catch(err) {
        console.error(err);
        return {cd: '9999', msg: '번역가능한 대상을 찾지 못했습니다.', list : []};
    }
});

const findPosition = (html, targetText, foundLines) => {
    let lines = html.split('\n');
    let position = {};
    for(let i=0; i<lines.length; i++) {
        if(foundLines.includes(i)) {
            
        } else {
            let column = lines[i].indexOf(targetText);
            if(column !== -1) {
                foundLines.push(i);
                position.line = i + 1;
                position.column = column + 1;
                break;
            }
        }
    }

    return {foundLines, position};

}

// html 번역
ipcMain.handle('translateHtml', async (event, item) => {
    try{
    
        win.webContents.send("translateProgress", {percent : 0, msg : 'HTML코드를 분석중입니다'});

        // 코드 원문
        let html = item.content;
        
        // 번역대상
        let targetList = item.transTarget;
        let targetIdxList = targetList.map(v => v.idx);

        //api 정보 얻기
        let apiIdx = item.api;
        let apiJson = fs.readFileSync(path.join(__dirname, 'src', 'json', 'api.json'), 'utf-8');
        let apiObj = JSON.parse(apiJson);
        apiObj = apiObj.find(v => v.idx == apiIdx);

        //언어 프리셋 정보 얻기
        let presetIdx = item.preset;
        let presetJson = fs.readFileSync(path.join(__dirname, 'src', 'json', 'preset.json'), 'utf-8');
        let presetObj = JSON.parse(presetJson);
        presetObj = presetObj.find(v => v.idx == presetIdx);

        // 코드 파싱
        const $ = cheerio.load(html);
        
        let allText = [];
        let textIdx = 0;
        let tagIdx = 0;
        let langPack = {};
        let defaultLang = {}
        
        //기준언어 추출 및 번역대상에 태그 입히기
        $('*:not(style):not(script)').contents().each(function() {
            if (this.type === 'text') {
                if($(this).text().trim().length > 0) {
                    allText.push($(this).text().trim());
                    if(targetIdxList.includes(textIdx)) {
                        let wrappedText = "";
                        if($(this).closest('title').length > 0) {
                           let title = $(this).closest('title');
                           title.attr("data-idx", tagIdx);
                        } else {
                            wrappedText = `<TransTag data-idx=${tagIdx}>${$(this).text().trim()}</TransTag>`;
                            $(this).replaceWith(wrappedText);
                        }
                        defaultLang[tagIdx] = $(this).text().trim();
                        tagIdx++;
                    }
                    textIdx++;
                }
            }
        });
        langPack[presetObj.from.code] = defaultLang;

        //기준언어를 바탕으로 번역작업
        let percentPeriod = 100 / (presetObj.to.length + 2);
        let percent = 0;
        if(apiIdx == 0) {
            for(let i=0; i<presetObj.to.length; i++) {
                let code = presetObj.to[i].code;
                let countryName = presetObj.to[i].ko;
                percent = percent + percentPeriod;
                win.webContents.send("translateProgress", {percent : percent, msg : countryName + '로 번역 중입니다'});
                let langItem = {};
                let arr = Object.entries(defaultLang);
                for(let j=0; j<arr.length; j++) {
                    let tagName = arr[j][0];
                    let defaultValue = arr[j][1];
                    let response = await fetch(`https://translate.google.com/m?sl=${presetObj.from.code}&tl=${code}&q=${encodeURIComponent(defaultValue)}`);
                    let fetchHtml = await response.text();
                    let $2 = cheerio.load(fetchHtml);
                    let transText = $2(".result-container").text();
                    langItem[tagName] = transText;
                }
                langPack[code] = langItem;
            }
        } else {
            return {cd: '1000', msg: `<${apiObj.name}>는(은) 아직 준비중입니다.`, data : null};
        }
        
        $('body').append(getResultScript(JSON.stringify(langPack, null, 2)));
        win.webContents.send("translateProgress", {percent : 100, msg : '번역이 완료되었습니다'});
        return {cd: '0000', msg: '', data : $.html()};
        //return {cd: '0000', msg: '', data : JSON.stringify(langPack, null, 2)};
    } catch(err) {
        console.error("html번역 에러 : ", err);
        return {cd: '9999', msg: 'html번역 도중 에러가 발생하였습니다 .', data : null};
    }
});

const getResultScript = (langPackStr) => {
    
    return `
    <script>
    const langPack = ${langPackStr};
    const fetchLang = (country = 'ko', callback) => {
        let title = document.querySelector("title");
        if(title.getAttribute("data-idx")) {
            let titleId = title.getAttribute("data-idx");
            title.textContent = langPack[country][titleId];
        }
        let all = document.querySelectorAll("TransTag");
        all.forEach((v,i) => {
            let id = v.getAttribute("data-idx");
            let value = langPack[country][id];
            v.innerHTML = value;
        });
        if(callback) callback();
    }
    </script>
    `;
}

// 번역결과 html파일로 저장
ipcMain.handle('saveToHtml', async (event, obj) => {
    let defaultName = obj.defaultName;
    let html = obj.html;
    try {
        const file = await dialog.showSaveDialog(win, {
            title: '번역결과 파일로 저장',
            defaultPath: path.join(app.getPath('documents'), defaultName + '.html'),
            filters: [{ name: 'HTML Files', extensions: ['html'] }],
            modal: true
        });

        if (!file.canceled && file.filePath) {
            fs.writeFileSync(file.filePath, html, 'utf8');
            return {cd : '0000', msg : '파일이 저장되었습니다'};
        } else {
            return {cd : '1000', msg : '파일이 저장이 취소되었습니다'};
        }
    } catch (err) {
        console.error(err);
        return {cd : '9999', msg : '파일을 저장하는 중에 에러가 발생하였습니다'};
    }
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