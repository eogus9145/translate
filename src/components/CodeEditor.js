import Reactm, { useState, useEffect } from 'react';
import { StateProvider, useStateValue } from '../StateContext.js';

import '../css/codeEditor.css';

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
                <div className='inputGroup'>
                    <input type="text" placeholder='저장하실 작업명을 입력하세요' value={workName} onChange={(e) => setWorkName(e.target.value) }  />
                    <button className='searchBtn' onClick={() => saveCode()}>작업 저장</button>
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