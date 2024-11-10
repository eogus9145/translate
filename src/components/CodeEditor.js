import Reactm, { useState, useEffect } from 'react';
import { StateProvider, useStateValue } from '../StateContext.js';

import '../css/codeEditor.css';

import saveSvg from '../svg/content/save.svg';

const CodeEditor = ({ item }) => {

    const { state, dispatch } = useStateValue();

    const [workName, setWorkName] = useState('');

    const handleInput = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            console.log("tab");
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const tabNode = document.createElement("span");
            tabNode.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;";
            range.insertNode(tabNode);
            range.setStartAfter(tabNode);
            range.setEndAfter(tabNode);
            selection.removeAllRanges();
            selection.addRange(range);
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

    return(
        <div id="codeEditor" className='editor'>
            <div className='menu'>
                <div className='tabMenu'>
                    <div className='editorTab'>
                        <button className='editorTabItem active'>코드편집</button>
                        <button className='editorTabItem'>번역결과</button>
                    </div>
                    <div className='optionMenu'>
                        <button className='optionItem'>코드 불러오기</button>
                    </div>
                </div>
                <div className='subMenu'>
                        <button>
                            저장
                        </button>
                        <button>
                            번역대상
                        </button>
                        <button>
                            API설정
                        </button>
                        <button>
                            언어설정
                        </button>
                </div>
            </div>
            <div className='textWrapper'>
                <div className='text scrollElement' id="codeEditorText">
                    <div id="codeEditorTextInput" contentEditable={true} spellCheck={false} onKeyDown={(e) => handleInput(e)}>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default CodeEditor;