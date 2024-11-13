import Reactm, { useState, useEffect, useRef } from 'react';
import { StateProvider, useStateValue, dateFormat, loadData } from '../StateContext.js';

import CodeEditor from './CodeEditor.js';
import HtmlEditor from './HtmlEditor.js';
import UrlEditor from './UrlEditor.js';

import '../css/html.css';

import logoSvg from '../svg/titlebar/logo.svg';
import codeSvg from '../svg/content/code.svg';
import fileSvg from '../svg/content/file.svg'; 
import urlSvg from '../svg/content/url.svg';
import closeSvg from '../svg/content/close.svg';
import copySvg from '../svg/content/copy.svg';

const SaveModal = ({}) => {
    const { state, dispatch } = useStateValue();

    const [newItem, setNewItem] = useState(state.openList[state.properties.lastOpenIdx[state.properties.lastOpenIdx.length - 1]]);
    const [saveName, setSaveName] = useState(newItem.name);

    const nameSave = async () => {
        let newList = [...state.openList];

        //null 체크
        if(!newItem.name || newItem.name.trim().length == 0) {
            window.alertMsg(dispatch, '작업명을 입력해 주세요.');
            return;
        }

        //이름 중복검사
        let isExistName = newList.some(v => (v.idx !== newItem.idx) && (v.name == newItem.name));
        if(isExistName) {
            window.alertMsg(dispatch, '중복된 작업명이 존재합니다. 다시 입력해주세요');
            return;
        }

        let target = {...newItem};
        target.name = target.name.trim();
        target.isSave = true;
        target.saveDate = new Date();
        
        let obj = { 
            type : 'openList', 
            content : target
        };
        let { cd, msg, data } = await window.electron.updateData(obj);
        if(cd == '0000') {
            await dispatch({type:'setOpenList', payload:data});
            await dispatch({type:'setIsCodeSave', payload:false});
        } else {
            window.alertMsg(dispatch, msg);
        }

    }

    return(
        <div className='modal'>
            <div className='saveModalContent'>
                <div>
                    작업 저장하기
                </div>
                <div>
                    <div>작업명</div>
                    <input type="text" spellCheck={false} value={newItem.name} onChange={(e) => {setNewItem(prev => ({ ...prev, name: e.target.value }))}} placeholder='저장하실 작업명을 입력해주세요' />
                </div>
                <div>
                    <button onClick={()=> {nameSave()}}>저장</button>
                    <button onClick={()=>{dispatch({type:'setIsCodeSave', payload:false})}}>취소</button>
                </div>
            </div>
        </div>
    );
}

const LoadModal = () => {
    const { state, dispatch } = useStateValue();

    const [htmlCode, setHtmlCode] = useState();
    const [url, setUrl] = useState("");

    const modalClose = () => {
        dispatch({type:"setIsCodeLoad", payload: false});
    }

    const handleSelect = async (type) => {
        const result = type == 'html' ? await window.electron.openHtml() : await window.electron.openUrl(url);
        const { cd, msg, html } = result;
        cd == '0000' ? setHtmlCode(html) : window.alertMsg(dispatch, msg);
    };

    const htmlCopy = async () => {
        if(htmlCode) {
            try {
                await navigator.clipboard.writeText(htmlCode);
                window.alertMsg(dispatch, 'HTML이 복사되었습니다.');
            } catch(err) {
                window.alertMsg(dispatch, 'HTML 복사에 실패하였습니다.');
            }
        } else {
            window.alertMsg(dispatch, '복사할 내용이 없습니다.');
        }
    }

    return(
        <div className='modal'>
            <div className='modalContent'>
                <div className='modalHeader'>
                    <div className='modalMenu'>
                        <button className='html' onClick={() => {handleSelect('html')}}>HTML 파일 불러오기</button>
                        <input type="text" value={url} onChange={(e) => {setUrl(e.target.value)}} placeholder='URL을 입력해 주세요.'></input>
                        <button className='url' onClick={() => {handleSelect('url')}}>URL 불러오기</button>
                    </div>
                    <div className='modalSubmit'>
                        <button className='copy' onClick={() => {htmlCopy()}}>
                            <img src={copySvg} style={{marginBottom: "-4px"}} />
                        </button>
                        <button className='close' onClick={() => {modalClose()}}>
                            <img src={closeSvg} style={{marginBottom: "-4px"}} />
                        </button>
                    </div>
                </div>
                <div className='modalBody'>
                    <div className='loadResult scrollElement dark'>
                        {htmlCode ? 
                            <pre>{htmlCode}</pre>
                            :
                            <div className='noData'>HTML파일 또는 URL을 불러와 주세요</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

const Html = () => {

    const { state, dispatch } = useStateValue();

    const selectTab = async (item) => {
        let selectIdx = item.idx;
        let properties = {...state.properties};
        properties.lastOpenIdx = properties.lastOpenIdx.filter(v => v !== selectIdx);
        properties.lastOpenIdx.push(selectIdx);
        await dispatch({type:'setProperties', payload: properties});
        let writeParam = {
            type : "properties",
            content : properties
        }
        let { cd, msg, data } = await window.electron.writeData(writeParam);
    }

    const closeTab = async (item) => {
        let selectIdx = item.idx;
        let openListArr = await loadData("openList");
        let openTarget = openListArr.find(v => v.idx == selectIdx);
        let getIsChange = () => {
            let sameValue = openTarget.content == document.querySelector("#codeEditorTextInput").value;
            let sameApi = openTarget.api == document.querySelector(".apiItem.api.active").getAttribute("data-idx");
            let samePreset = openTarget.preset == document.querySelector(".apiItem.lang.active").getAttribute("data-idx");
            let sameResult = true;
            if(document.querySelector("#translateResultTextArea")) sameResult = openTarget.result == document.querySelector("#translateResultTextArea").value;

            let targetEls = document.querySelectorAll(".listItem.active");
            let activeTargets = [];
            targetEls.forEach((v,i) => {
                let idx = v.getAttribute("data-idx");
                activeTargets.push(idx);
            });
            let itemTargetIdxArr = [...openTarget.transTarget].map(v => v.idx);
            let sameTarget = true;
            if(itemTargetIdxArr.length !== activeTargets.length) {
                sameTarget = false;
            } else {
                itemTargetIdxArr.sort((a,b) => parseInt(a) - parseInt(b));
                activeTargets.sort((a,b) => parseInt(a) - parseInt(b));

                for(let i=0; i<activeTargets.length; i++) {
                    if(parseInt(itemTargetIdxArr[i]) !== parseInt(activeTargets[i])) {
                        sameTarget = false;
                        break;
                    }
                }
            }
            return sameValue && sameApi && samePreset && sameTarget && sameResult;
        };
        let isChange = getIsChange();


        if(!item.isSave || !isChange) {
            window.confirmMsg(dispatch, "저장되지 않은 내용은 사라집니다.<br>작업을 닫으시겠습니까?", async () => {
                if(!item.isSave) {
                    let deleteParam = {
                        type : "openList",
                        idx : openTarget.idx
                    }
                    let {cd, msg, data} = await window.electron.deleteData(deleteParam);
                    dispatch({type:'setOpenList', payload: data});
                    let properties = {...state.properties};
                    properties.lastOpenIdx = properties.lastOpenIdx.filter(v => v !== openTarget.idx);
                    let writeParam = {
                        type : "properties",
                        content : properties
                    }
                    await window.electron.writeData(writeParam);
                    dispatch({type:'setProperties', payload: properties});
                } else {
                    let curOpenList = [...state.openList];
                    let curOpenTarget = curOpenList.find(v => v.idx == selectIdx);
                    curOpenTarget.isShow = false;
                    let originList = await loadData("openList");
                    let originTarget = originList.find(v => v.idx == selectIdx);
                    originTarget.isShow = false;
                    let obj = { 
                        type : 'openList', 
                        content : originTarget
                    };
                    let { cd, msg, data } = await window.electron.updateData(obj);
                    await dispatch({type:'setOpenList', payload: curOpenList});
                    let properties = {...state.properties};
                    properties.lastOpenIdx = properties.lastOpenIdx.filter(v => v !== openTarget.idx);
                    let writeParam = {
                        type : "properties",
                        content : properties
                    }
                    await window.electron.writeData(writeParam);
                    await dispatch({type:'setProperties', payload: properties});
                }
            });
        } else {
            let curOpenList = [...state.openList];
            let curOpenTarget = curOpenList.find(v => v.idx == selectIdx);
            curOpenTarget.isShow = false;
            let obj = { 
                type : 'openList', 
                content : item
            };
            let { cd, msg, data } = await window.electron.updateData(obj);
            await dispatch({type:'setOpenList', payload: curOpenList});

            let properties = {...state.properties};
            properties.lastOpenIdx = properties.lastOpenIdx.filter(v => v !== openTarget.idx);
            let writeParam = {
                type : "properties",
                content : properties
            }
            await window.electron.writeData(writeParam);
            await dispatch({type:'setProperties', payload: properties});
        }
    }

    const openCode = async (work) => {

        if(work) {

            let list = [...state.openList];

            let target = list.find(v => v.idx == work.idx);
            if(target.isShow) {
                selectTab(work);
            } else {
                //json에서 idx에 해당하는 객체만 가져와서 state를  update, json도 isShow는 update
                let originList = await loadData("openList");
                let originTarget = originList.find(v => v.idx == work.idx);
                originTarget.isShow = true;
                let param = { 
                    type : 'openList', 
                    content : originTarget
                };
                let { cd, msg, data } = await window.electron.updateData(param);
                let newTarget = data.find(v => v.idx == work.idx);
                let oldList = [...state.openList];
                let fixedList = oldList.map((v,i) => {
                    if(v.idx == newTarget.idx) {
                        v = newTarget;
                    }
                    return v;
                });
                console.log("fixedList : ", fixedList);
                await dispatch({type:'setOpenList', payload: fixedList});
                
                let obj = {...state.properties};
                if(obj.lastOpenIdx.includes(work.idx)) {
                    obj.lastOpenIdx = obj.lastOpenIdx.filter(v => v.idx !== work.idx);
                }
                obj.lastOpenIdx.push(work.idx);
                let writeParam2 = { 
                    type : 'properties', 
                    content : obj
                };
                let {cd2, msg2, data2} = await window.electron.writeData(writeParam2);
                await dispatch({type:'setProperties', payload: obj});

                console.log("state.openList : ", state.openList);
            }
        } else {
            let arr = [...state.openList];
            let idx = (state.openList.length > 0) ? Math.max(...state.openList.map(item => item.idx)) + 1 : 0;
            let openItem = {
                idx : idx,
                type : 'code',
                name : '',
                content : '',
                isSave : false,
                saveDate : null,
                transTarget : [],
                api : "0",
                preset : "0",
                result : "",
                selection : {},
                isShow : true
            }
            arr.push(openItem);
            let writeParam = { 
                type : 'openList', 
                content : arr
            };
            await window.electron.writeData(writeParam);        
            let properties = {...state.properties};
            properties.lastOpenIdx.push(idx);        
            let writeParam2 = {
                type : "properties",
                content : properties
            }
            await window.electron.writeData(writeParam2);
            await dispatch({type:'setOpenList', payload:arr});
            await dispatch({type:'setProperties', payload: properties});
        }
    }

    const workLoad = (item) => {
        openCode(item);
    }

    return(
        <div id="htmlMain">
            <div id="htmlExplorer">
                <div id="htmlExplorerTitle">
                    <span className="text">HTML번역</span>
                    {/* <button className="button">
                        <img src={closeSvg} />
                    </button> */}
                </div>
                <div className="openDiv new">
                    <div className='openBtnDiv'>
                        <button className='openBtn' onClick={() => openCode()}>새 작업 열기</button>
                    </div>
                </div>
                <div className='openDiv save'>
                    <div className='title'>
                        저장된 작업 열기
                    </div>
                    <div className='list'>
                        {state.openList.filter(v => v.isSave == true).length == 0 ?
                            <div>
                                저장된 작업이 없습니다.
                            </div>
                            :
                            state.openList.filter(v => v.isSave == true).map((item, index)=>(
                                <div className={state.properties.lastOpenIdx[state.properties.lastOpenIdx.length - 1] == item.idx ? 'saveItem active' : 'saveItem'} key={index} onClick={()=>{workLoad(item)}}>
                                    <div className='saveName'>작업명 : {item.name}</div>
                                    <div className='saveDate'>최근 저장일 : {dateFormat(item.saveDate)}</div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            <div id="htmlContent">
                {state.isCodeSave && <SaveModal/>}
                {state.isCodeLoad && <LoadModal/>}
                <div id="htmlTab">
                    {state.openList.map((item, index) => {
                        if(item.isShow) {
                            return (
                                <div key={index}
                                    className={state.properties.lastOpenIdx[state.properties.lastOpenIdx.length - 1] == item.idx ? "tabItem active" : "tabItem"}
                                    onClick={(e) => {selectTab(item)}}
                                    draggable={true}
                                >
                                    <span className='icon'>
                                    {item.type == 'start' ? <img src={logoSvg}/> : <img src={fileSvg}/>}
                                    </span>
                                    <span className='name'>
                                        {item.name ? item.name : '저장되지 않은 작업'}
                                    </span>
                                    <button className='close' onClick={() => {closeTab(item)}}>
                                        <img className='closeSvg' src={closeSvg}/>
                                    </button>
                                </div>
                            )
                        }
                    })}
                </div>
                <div id='htmlContentDiv'>
                    <CodeEditor/>
                </div>
            </div>

        </div>
    );
}

export default Html;