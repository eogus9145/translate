import Reactm, { useState, useEffect } from 'react';
import { StateProvider, useStateValue } from '../StateContext.js';

import TranslateHtmlResult from './TranslateHtmlResult.js';

import '../css/codeEditor.css';

import saveSvg from '../svg/content/save.svg';
import checkSvg from '../svg/content/check.svg';
import checkWhiteSvg from '../svg/content/check_white.svg';
import findSvg from '../svg/content/find.svg';

const CodeEditor = () => {
    const { state, dispatch } = useStateValue();

    const [item, setItem] = useState(() => {
        if(state.properties.lastOpenIdx.length == 0) return null;
        else return state.openList.find(v => (v.idx == state.properties.lastOpenIdx[state.properties.lastOpenIdx.length - 1]));
    });
    const [htmlCode, setHtmlCode] = useState(item !== null ? item.content : '');
    const [translateResult, setTranslateResult] = useState(item !== null ? item.result : '');

    const [currentTab, setCurrentTab] = useState('code');
    const [currentSnbTab, setCurrentSnbTab] = useState('target');
    const [row, setRow] = useState(null);
    const [col, setCol] = useState(null);
    const [targetList, setTargetList] = useState([]);
    const [tooltipMsg, setTooltipMsg] = useState('');

    const handleInput = async (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const textarea = e.target;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const tabSpace = '    ';
            await setHtmlCode(textarea.value.substring(0, start) + tabSpace + textarea.value.substring(end));
            textarea.selectionStart = start + tabSpace.length;
            textarea.selectionEnd = start + tabSpace.length;
        }
    }

    const textareaInput = async () => {
        let textarea = document.querySelector("#codeEditorTextInput");
        let {resultRow, resultCol} = getCursorPosition(textarea);
        await selectionSave(textarea);
        setRow(resultRow);
        setCol(resultCol);
    }

    const selectionSave = async (textarea) => {
        const selectionInfo = {
            start: textarea.selectionStart,
            end: textarea.selectionEnd,
            selectedText: textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)  // 선택된 텍스트
        };
        let newList = [...state.openList];
        let target = newList.find((v,i) => v.idx == item.idx);
        target.selection = selectionInfo;
        await dispatch({type:'setOpenList', payload:newList});
    }

    const getCursorPosition = (textarea) => {
        const cursorPosition = textarea.selectionStart;
        const textBeforeCursor = textarea.value.substring(0, cursorPosition);
        const lineNumber = textBeforeCursor.split("\n").length;
        const lastLineIndex = textBeforeCursor.lastIndexOf("\n");
        const columnNumber = cursorPosition - lastLineIndex;
        return { resultRow: lineNumber, resultCol: columnNumber };
    }

    const targetFind = async (html) => {
        if(!html) return;
        let {cd, msg, list} = await window.electron.targetFind(html);
        if(cd == '0000') {
            setTargetList(list);
        } else {
            window.alertMsg(dispatch, msg);
            setTargetList([]);
        }
    }

    const selectTarget = async (targetIdx) => {
        let openList = [...state.openList];
        let openTarget = openList.find((v,i) => v.idx == item.idx);
        let transTargetList = [...openTarget.transTarget];
        let target = targetList[targetIdx];
        if(transTargetList.map(v => v.idx).includes(targetIdx)) {
            transTargetList = transTargetList.filter(v => v.idx !== targetIdx)
        } else {
            transTargetList.push(target);
        }
        openTarget.transTarget = transTargetList;
        await dispatch({type:'setOpenList', payload:openList});
    }

    const selectAllTarget = () => {
        let openList = [...state.openList];
        let openTarget = openList.find(v => v.idx == item.idx);
        let newTransTarget = [...targetList];
        openTarget.transTarget = newTransTarget;
        dispatch({type:'setOpenList', payload:openList});
    }

    const deSelectAllTarget = () => {
        let openList = [...state.openList];
        let openTarget = openList.find(v => v.idx == item.idx);
        let newTransTarget = [];
        openTarget.transTarget = newTransTarget;
        dispatch({type:'setOpenList', payload:openList});
    }

    const selectApi = (apiIdx) => {
        let newList = [...state.openList];
        let target = newList.find((v,i) => v.idx == item.idx);
        target.api = apiIdx + "";
        dispatch({type:'setOpenList', payload:newList});
    }

    const selectPreset = (presetIdx) => {
        let newList = [...state.openList];
        let target = newList.find((v,i) => v.idx == item.idx);
        target.preset = presetIdx + "";
        dispatch({type:'setOpenList', payload:newList});
    }

    const submitMouseEnter = () => {
        let msg = "";
        if(item.content !== htmlCode) msg = '저장 후 번역을 시작해주세요';
        else if(item.transTarget.length == 0) msg = '번역대상을 선택해 주세요';
        else if(!item.api) msg = 'API를 설정해주세요';
        else if(!item.preset) msg = '언어를 설정해주세요';
        setTooltipMsg(msg);
    }

    const submitMouseLeave = () => {
        setTooltipMsg('');
    }

    const htmlCodeChange = async (val) => {
        let newList = [...state.openList];
        let target = newList.find((v,i) => v.idx == item.idx);
        target.content = val;
        dispatch({type:'setOpenList', payload:newList});
        targetFind(val);
        setHtmlCode(val);
    }

    const save = () => {
        dispatch({type:'setIsCodeSave', payload: true});
    }

    const translateStart = async () => {
        await dispatch({type:'setIsLoading', payload:true});
        let {cd, msg, data} = await window.electron.translateHtml(item);
        
        if(cd == '0000') {
            let newList = [...state.openList];
            let target = newList.find((v,i) => v.idx == item.idx);
            target.result = data;
            dispatch({type:'setOpenList', payload:newList});
            setTranslateResult(data);
            setCurrentTab('result');
        } else {
            window.alertMsg(dispatch, msg);
            return;
        }
    }

    useEffect(()=>{
        const fetchData = async () => {
            if(state.openList.length > 0 && state.openList.filter(v => v.isShow == true).length > 0) {
                let newIdx = state.properties.lastOpenIdx[state.properties.lastOpenIdx.length - 1];
                let newItem = state.openList.find(v => v.idx == newIdx);
                await setItem(newItem);
                await setHtmlCode(newItem.content);
                let textarea = document.querySelector("#codeEditorTextInput");
                /* 뭔진 몰라도 에러나서 일단 주석
                textarea.focus();
                if(newItem.selection) {
                    textarea.setSelectionRange(newItem.selection.start, newItem.selection.end);
                }
                */
                setRow('');
                setCol('');
            }
        }
        fetchData();
    },[state.properties]);

    useEffect(()=>{
        let newItem = state.openList.find(v => v.idx == state.properties.lastOpenIdx[state.properties.lastOpenIdx.length - 1]) || null;
        setItem(newItem);
    },[state.openList]);

    useEffect(()=>{
        const fetchData = async () => {
            if(item) {
                targetFind(item.content);
                setTranslateResult(item.result);
            }
        }
        fetchData();
    },[item])

    if(item && item.isShow) {
        return(
            <div id="codeEditorMain">
                <div id="codeEditor" className='editor'>
                    <div className='menu'>
                        <div className='tabMenu'>
                            <div className='editorTab'>
                                <button className={currentTab == 'code' ? 'editorTabItem active' : 'editorTabItem'} onClick={() => {setCurrentTab('code')}}>코드편집</button>
                                <button className={currentTab == 'result' ? 'editorTabItem active' : 'editorTabItem'} onClick={() => {setCurrentTab('result')}}>번역결과</button>
                            </div>
                            <div className='optionMenu'>
                                <button className='optionItem' onClick={() => {dispatch({type:"setIsCodeLoad", payload: true})}}>코드 불러오기</button>
                            </div>
                        </div>
                        <div className='optionMenu'>
                            <button onClick={() => save()}>저장</button>
                        </div>
                    </div>
                    <div className='textWrapper'>
                        <div className={currentTab == 'code' ? 'codeEditorText' : 'codeEditorText hidden'}>
                            <textarea id="codeEditorTextInput" className='scrollElement dark' spellCheck={false} value={htmlCode} onChange={(e) => {htmlCodeChange(e.target.value)}}
                                onKeyUp={()=>{textareaInput()}} onClick={()=>{textareaInput()}} onKeyDown={(e) => {handleInput(e)}}
                            ></textarea>
                            <div className='lineInfo'>
                                <span>줄</span>&nbsp;<span>{row}</span>,&nbsp;
                                <span>열</span><span>{col}</span>
                            </div>
                        </div>
                        <div className={currentTab == 'result' ? 'codeEditorText result' : 'codeEditorText result hidden'}>
                            <TranslateHtmlResult result={translateResult} setResult={setTranslateResult} workName={item.name}/>
                        </div>
                    </div>
                </div>
                <div className='snb'>
                    <div className='snbMenu'>
                        <div className='snbTabMenu'>
                            <div className='snbTab'>
                                <button className={currentSnbTab == 'target' ? 'snbTabItem active' : 'snbTabItem'} onClick={() => {setCurrentSnbTab('target')}}>번역대상</button>
                                <button className={currentSnbTab == 'api' ? 'snbTabItem active' : 'snbTabItem'} onClick={() => {setCurrentSnbTab('api')}}>API설정</button>
                                <button className={currentSnbTab == 'lang' ? 'snbTabItem active' : 'snbTabItem'} onClick={() => {setCurrentSnbTab('lang')}}>언어설정</button>
                            </div>
                        </div>
                    </div>
                    <div className='snbWrapper'>
                        <div className='snbContent'>
                        
                            <div className={currentSnbTab == 'target' ? 'snbTarget' : 'snbTarget hidden'}>
                                <div className='targenFindBtn'>
                                    번역가능 텍스트 추출
                                </div>
                                <div className='targetList'>
                                    <div className='title'>
                                        <span>번역가능한 텍스트 목록</span>
                                        <div className='targetAllSelect'>
                                            <button className='targetAllSelectBtn' disabled={targetList.length > 0 ? false : true} onClick={() => selectAllTarget()}>전체선택</button>
                                            <button className='targetAllSelectBtn' disabled={targetList.length > 0 ? false : true} onClick={() => deSelectAllTarget()}>선택해제</button>
                                        </div>
                                    </div>
                                    <div className='list scrollElement dark'>
                                        {targetList.map((item2, idx2)=>(
                                            <div className={item.transTarget.map(v => v.idx).includes(item2.idx) ? 'listItem target active' : 'listItem target'} 
                                            key={idx2} onClick={() => {selectTarget(item2.idx)}} data-idx={idx2} >
                                                <div className='listItemText'>{item2.text}</div>
                                                <div className='listItemLine'>줄 {item2.line}, 열 {item2.column}</div>
                                                {item.transTarget.map(v => v.idx).includes(item2.idx) &&
                                                    <div className='listCheck' style={{backgroundImage:'url(' + checkWhiteSvg + ')', backgroundPosition:'center', backgroundSize:'cover'}}></div>
                                                }
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        
                        
                            <div className={currentSnbTab == 'api' ? 'snbApi' : 'snbApi hidden'}>
                            {state.apiList.map((item2, index2) => (
                                <div className={item.api == item2.idx ? 'apiItem api active' : 'apiItem api'} key={index2} data-idx={index2} onClick={() => {selectApi(item2.idx)}}>
                                    <div className='title'>
                                        <span>{item2.name}</span>
                                    </div>
                                    <div className='content'>
                                        <span>{item2.desc ? item2.desc : '설명 없음'}</span>
                                    </div>
                                    {item.api == item2.idx && <div className='apiCheck' style={{backgroundImage:'url(' + checkWhiteSvg + ')', backgroundPosition:'center', backgroundSize:'cover'}}></div>}
                                </div>
                            ))}
                            </div>
                        

                            <div className={currentSnbTab == 'lang' ? 'snbLang' : 'snbLang hidden'}>
                                <div className='preset scrollElement dark'>
                                {state.presetList.map((item2, index2) => (
                                    <div className={item.preset == item2.idx ? 'apiItem lang active' : 'apiItem lang'} data-idx={index2} key={index2} onClick={() => {selectPreset(item2.idx)}}>
                                        <div className='title'>
                                            <span>{item2.name}</span>
                                        </div>
                                        <div className='content'>
                                            <span>{item2.desc ? item2.desc : '설명 없음'}</span>
                                        </div>
                                        {item.preset == item2.idx && <div className='apiCheck' style={{backgroundImage:'url(' + checkWhiteSvg + ')', backgroundPosition:'center', backgroundSize:'cover'}}></div>}
                                    </div>
                                ))}
                                </div>
                            </div>
                        
                        </div>
                    </div>
                    <div onMouseEnter={() => {submitMouseEnter()}} onMouseLeave={() => {submitMouseLeave()}}>
                        <button className='snbSubmit' disabled={(item.content == htmlCode && item.transTarget && item.transTarget.length > 0 && item.api && item.preset) ? false : true}
                            onClick={() => {translateStart()}}
                        >
                            <span>번역시작</span>
                            <div className='tooltip'>
                                <div className='tooltipMsg'>{tooltipMsg}</div>
                                <div className='tooltipArrow'></div>
                            </div>
                        </button>
                    </div>
                </div>
    
            </div>
        );
    } else {
        return (
            <div id="codeEditorNoData">
                <span>저장된 작업 또는 새 작업을 열어주세요</span>
            </div>
        );
    }
}

export default CodeEditor;