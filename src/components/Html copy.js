import Reactm, { useState, useEffect, useRef } from 'react';
import { StateProvider, useStateValue } from '../StateContext.js';

import '../css/html.css';
import HtmlTranslate from './HtmlTranslate.js';

const Html = () => {

    const { state, dispatch } = useStateValue();

    const parts = state.currentHtml.split(/%%/g);
    let textIdx = 0;

    const selectText = (item) => {
        let idx = item.getAttribute("data-idx");
        let arr = state.selectedText;
        let isExist = arr.some(v => v.idx == idx);
        if(isExist) {
            cancelText(idx);
        } else {
            let target = state.currentHtmlTextNodes[idx];
            let obj = {
                idx : idx,
                text : target,
                lineStart : item.offsetTop + (item.offsetHeight / 2)
            }
            let arr = [...state.selectedText];
            arr.push(obj);
            arr.sort((a,b) => a.idx - b.idx);
            dispatch({type:'setSelectedText', payload: arr});
        }
    }

    const cancelText = (idx) => {
        let arr = [...state.selectedText];
        arr = arr.filter(v => v.idx !== idx);
        dispatch({type:'setSelectedText', payload: arr});
    }

    const handleItem = (item) => {
        let animationTime = 600;
        let target = document.querySelector(".htmlTextNode[data-idx='" + item.idx + "']");
        target.style.animation = `shake ${animationTime / 1000}s`;
        target.focus();
        setTimeout(()=>{
            target.style.animation = 'none';
        }, animationTime);
    }

    const selectComplete = () => {
        if(state.selectedText.length == 0) {
            window.alertMsg(dispatch, "번역할 텍스트를 선택 후 완료해주세요", () => {
                dispatch({type: 'setIsSelectComplete', payload:false});
            });
            return;
        } else {
            dispatch({type: 'setIsSelectComplete', payload:true});
            return;
        }
    }

    useEffect(()=>{
        dispatch({type:'setSelectedText', payload:[]});
    }, [state.currentHtml])

    return(
        <div id="htmlMain">
            <div id="htmlContainer">
                <div id="htmlTitle">번역하실 텍스트를 선택 해주세요</div>
                <div id="htmlContent" className='scrollElement'>
                    <pre id='htmlPre'>
                        {parts.map((item, index) => {
                            if(index % 2 === 1) {
                                let idx = textIdx++;
                                return <button key={index} className={state.selectedText.some(v => v.idx == idx) ? 'htmlTextNode active' : 'htmlTextNode'} data-idx={idx} onClick={(e) => selectText(e.target)}>{item}</button>;
                            } else {
                                return item;
                            }
                        })}
                    </pre>
                </div>
            </div>
            <div id="textNodes">
                <div id="textNodesTitle">
                    번역할 텍스트 목록
                </div>
                <div id="textNodesList" className='scrollElement dark'>
                    {state.selectedText.length == 0 && 
                        <div id="noSelectText">
                            선택된 텍스트가 없습니다.
                        </div>
                    }
                    {state.selectedText.map((item, index) => (
                        <div key={index} className='textNodesItem' onClick={() => handleItem(item)}>
                            <span>
                                <span className='textNodesIndex'>{parseInt(item.idx) + 1}</span>
                                <span className='textNodesStr'>{item.text}</span>
                            </span>
                        </div>
                    ))}
                </div>
                <button id="selectTextNextBtn" onClick={() => selectComplete()}>
                    선택완료
                </button>
            </div>
            {state.isSelectComplete && 
                <HtmlTranslate />
            }
        </div>
    );
}

export default Html;