import Reactm, { useState, useEffect } from 'react';
import { StateProvider, useStateValue } from '../StateContext.js';

import '../css/codeEditor.css';

import saveSvg from '../svg/content/save.svg';
import checkSvg from '../svg/content/check.svg';
import checkWhiteSvg from '../svg/content/check_white.svg';
import findSvg from '../svg/content/find.svg';

const CodeEditor = ({ item }) => {

    const { state, dispatch } = useStateValue();

    const [workName, setWorkName] = useState('');
    const [currentTab, setCurrentTab] = useState('code');
    const [currentSnbTab, setCurrentSnbTab] = useState('target');
    const [row, setRow] = useState(null);
    const [col, setCol] = useState(null);
    const [targetList, setTargetList] = useState([]);

    const handleInput = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const textarea = e.target;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const tabSpace = '    ';
            textarea.value = textarea.value.substring(0, start) + tabSpace + textarea.value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + tabSpace.length;
        }
    }

    const saveCode = () => {
        let text = document.querySelector("#codeEditorTextInput").textContent;
        let obj = {
            name : workName,
            content : {
                text : text
            }
        }
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

    const textareaInput = () => {
        let {resultRow, resultCol} = getCursorPosition(document.querySelector("#codeEditorTextInput"));
        setRow(resultRow);
        setCol(resultCol);
    }

    const getCursorPosition = (textarea) => {
        const cursorPosition = textarea.selectionStart;
        const textBeforeCursor = textarea.value.substring(0, cursorPosition);
        const lineNumber = textBeforeCursor.split("\n").length;
        const lastLineIndex = textBeforeCursor.lastIndexOf("\n");
        const columnNumber = cursorPosition - lastLineIndex;
        return { resultRow: lineNumber, resultCol: columnNumber };
    }

    const targetFind = async () => {
        let html = document.querySelector("#codeEditorTextInput").value;
        let {cd, msg, list} = await window.electron.targetFind(html);
        if(cd == '0000') {
            setTargetList(list);
        } else {
            window.alertMsg(dispatch, msg);
            setTargetList([]);
        }
    }

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
                        <button>저장</button>
                    </div>
                </div>
                <div className='textWrapper'>
                    <div className={currentTab == 'code' ? 'codeEditorText' : 'codeEditorText hidden'}>
                        <textarea id="codeEditorTextInput" className='scrollElement dark' spellCheck={false} defaultValue={item.content} 
                            onKeyUp={()=>{textareaInput()}} onClick={()=>{textareaInput()}} onKeyDown={(e) => {handleInput(e)}}
                        ></textarea>
                        <div className='lineInfo'>
                            <span>줄</span>&nbsp;<span>{row}</span>,&nbsp;
                            <span>열</span><span>{col}</span>
                        </div>
                    </div>
                    <div className={currentTab == 'result' ? 'codeEditorText' : 'codeEditorText hidden'}>
                        {item.result}
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
                        {currentSnbTab == 'target' && 
                            <div className='snbTarget'>
                                <button className='targenFindBtn' onClick={() => {targetFind()}}>
                                    번역가능 텍스트 추출
                                </button>
                                <div className='targetList'>
                                    <div className='title'>
                                        번역가능한 텍스트 목록
                                    </div>
                                    <div className='list scrollElement dark'>
                                        {targetList.map((item2, idx2)=>(
                                            <div className='listItem'>
                                                <div className='listItemText'>{item2}</div>
                                                <div className='listItemLine'>n번째 줄 n열</div>
                                                <div className='listCheck' style={{backgroundImage:'url(' + checkWhiteSvg + ')', backgroundPosition:'center', backgroundSize:'cover'}}></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        }
                        {currentSnbTab == 'api' && 
                            <div className='snbApi'>
                            {state.apiList.map((item2, index2) => (
                                <div className={item.api == item2.idx ? 'apiItem active' : 'apiItem'} key={index2} onClick={() => {selectApi(item2.idx)}}>
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
                        }
                        {currentSnbTab == 'lang' && 
                            <div className='snbLang'>
                                <div className='preset scrollElement dark'>
                                {state.presetList.map((item2, index2) => (
                                    <div className={item.preset == item2.idx ? 'apiItem active' : 'apiItem'} key={index2} onClick={() => {selectPreset(item2.idx)}}>
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
                        }
                    </div>
                </div>
                <button className='snbSubmit' disabled={(item.transTarget.length > 0 && item.api && item.lang.from && item.lang.to.length > 0) ? false : true}>번역시작</button>
            </div>

        </div>
    );
}

export default CodeEditor;