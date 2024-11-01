import Reactm, { useState, useEffect, useRef } from 'react';
import { StateProvider, useStateValue, removeValue } from '../StateContext.js';

import '../css/translate.css';

import syncSvg from '../svg/content/sync.svg';
import copySvg from '../svg/content/copy.svg';

import RemoveValue from './RemoveValue.js';

const Translate = () => {

    const { state, dispatch } = useStateValue();
    const [fromSelect, setFromSelect] = useState(false);
    const [toSelect, setToSelect] = useState(false);
    const scrollRef = useRef(null);

    const handleSelect = async (type, code, ko) => {
        if(type == 'from') {
            await dispatch({type: 'setCurrentTransFrom', payload: code});
            await dispatch({type: 'setCurrentTransFromText', payload: ko});
            if(state.currentTransFrom !== code) {
                dispatch({type: 'setTranslateNowInput', payload: ''});
                dispatch({type: 'setTranslateNowResult', payload: ''});
            }
        } else if(type == 'to') {
            dispatch({type: 'setCurrentTransTo', payload: code});
            dispatch({type: 'setCurrentTransToText', payload: ko});
            if(state.translateNowInput.trim().length > 0) {
                let obj = { sl : type == 'from'? code : state.currentTransFrom, tl : type == 'from' ? state.currentTransTo : code, q : state.translateNowInput }
                let result = await window.electron.translateNow(obj);
                dispatch({type: 'setTranslateNowResult', payload: result.text});
            }
        }
    }
    
    const handleInput = (type, value) => {
        let list = state.langList;
        let filter = list.filter(v => v.ko.includes(value))[0];
        if(filter) {
            let code = filter.code;
            let ko = filter.ko;
            if(type == 'from') {
                dispatch({type: 'setCurrentTransFrom', payload: code});
                dispatch({type: 'setCurrentTransFromText', payload: ko});
            } else if(type == 'to') {
                dispatch({type: 'setCurrentTransTo', payload: code});
                dispatch({type: 'setCurrentTransToText', payload: ko});
            }
        } else {
            if(type == 'from') {
                dispatch({type: 'setCurrentTransFrom', payload: 'ko'});
                dispatch({type: 'setCurrentTransFromText', payload: '한국어'});
            } else if(type == 'to') {
                dispatch({type: 'setCurrentTransTo', payload: 'en'});
                dispatch({type: 'setCurrentTransToText', payload: '영어'});
            }
        }
        
        type == 'from' ? setFromSelect(true) : setToSelect(true);
    }

    const handleTextarea = async (value) => {
        dispatch({type: 'setTranslateNowInput', payload: value});
        let obj = {
            sl : state.currentTransFrom,
            tl : state.currentTransTo,
            q : value
        }
        let result = await window.electron.translateNow(obj);
        dispatch({type: 'setTranslateNowResult', payload: result.text});
        
    }

    useEffect(()=>{
        let container = document.querySelector(".selectLangListContainer.from");
        let item = container.querySelector(".selectLangItem.active");
        container.scrollTop = item.offsetTop - 4;
    },[fromSelect]);

    useEffect(()=>{
        let container = document.querySelector(".selectLangListContainer.to");
        let item = container.querySelector(".selectLangItem.active");
        container.scrollTop = item.offsetTop - 4;
    },[toSelect]);

    return(
        <div id="translateMain">
            <div>
                <div id="translateContentLeft">
                    <div className='selectLang'>
                        <div className='selectLangText'>
                            <input type="text" id="currentTransFromKeyword" placeholder="번역할 언어를 검색하세요" spellCheck={false} onChange={(e) => handleInput('from', e.target.value)}/>
                            <RemoveValue iconSize="sm" position="center" targetId="currentTransFromKeyword"/>
                            <span>선택된 언어 : {state.currentTransFromText}</span>
                        </div>
                        <div className='selectLangList'>
                            <div ref={scrollRef} className='selectLangListContainer from scrollElement dark'>
                            {state.langList.map((item, index) => (
                                <div key={index} className={state.currentTransFrom == item.code ? 'selectLangItem active' : 'selectLangItem'} onClick={() => handleSelect('from', item.code, item.ko)}>
                                    {item.ko}
                                </div>
                            ))}
                            </div>
                        </div>
                    </div>
                    <textarea id="translateNowInput" className='scrollElement dark' spellCheck={false} placeholder="번역하실 문장 또는 단어를 입력하세요"
                        value={state.translateNowInput} onInput={(e)=>{handleTextarea(e.target.value)}}
                    ></textarea>
                    <RemoveValue iconSize="md" position="start" targetId="translateNowInput" dispatchType="setTranslateNowInput"/>
                </div>

                <div id="translateContentSpace">
                </div>

                <div id="translateContentRight">
                    <div className='selectLang'>
                        <div className='selectLangText'>
                            <input type="text" placeholder="번역할 언어를 검색하세요" spellCheck={false} onChange={(e) => handleInput('to', e.target.value)}/>
                            <span>선택된 언어 : {state.currentTransToText}</span>
                        </div>
                        <div className='selectLangList'>
                            <div className='selectLangListContainer to scrollElement dark'>
                            {state.langList.map((item, index) => (
                                <div key={index} className={state.currentTransTo == item.code ? 'selectLangItem active' : 'selectLangItem'} onClick={() => handleSelect('to', item.code, item.ko)}>
                                    {item.ko}
                                </div>
                            ))}
                            </div>
                        </div>
                    </div>
                    <div className='transResult scrollElement dark'>
                        {state.translateNowResult}
                    </div>
                </div>
                <img src={syncSvg}/>
            </div>
        </div>
    );
}

export default Translate;