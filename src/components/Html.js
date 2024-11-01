import Reactm, { useState, useEffect, useRef } from 'react';
import { StateProvider, useStateValue } from '../StateContext.js';

import CodeEditor from './CodeEditor.js';
import HtmlEditor from './HtmlEditor.js';
import UrlEditor from './UrlEditor.js';

import '../css/html.css';

import logoSvg from '../svg/titlebar/logo.svg';
import codeSvg from '../svg/content/code.svg';
import fileSvg from '../svg/content/file.svg';
import urlSvg from '../svg/content/url.svg';
import closeSvg from '../svg/content/close.svg';

const Html = () => {

    const { state, dispatch } = useStateValue();

    const selectTab = async (target, item) => {

        if(target.classList.contains("close") || target.classList.contains("closeSvg")) return;

        let selectIdx = item.idx;
        let properties = {...state.properties};
        properties.lastOpenIdx = properties.lastOpenIdx.filter(v => v !== selectIdx);
        properties.lastOpenIdx.push(selectIdx);
        dispatch({type:'setProperties', payload: properties});
        let writeParam = {
            type : "properties",
            content : properties
        }
        await window.electron.writeData(writeParam);

    }

    const closeTab = async (item) => {
        let selectIdx = item.idx;

        let openList = [...state.openList];
        openList = openList.filter(v => v.idx !== selectIdx);
        dispatch({type:'setOpenList', payload:openList});
        let deleteParam = {
            type : "openList",
            idx : selectIdx
        }
        await window.electron.deleteData(deleteParam);

        // 삭제 후에 idx 재정렬

        let properties = {...state.properties};
        properties.lastOpenIdx = properties.lastOpenIdx.filter(v => v !== selectIdx);
        dispatch({type:'setProperties', payload: properties});
        let writeParam = {
            type : "properties",
            content : properties
        }
        await window.electron.writeData(writeParam);
    }

    const openCode = async () => {
        let content = {}
        openNewTab('code', content);
    }

    const openFile = () => {
        let content = {}
        openNewTab('html', content);
    }

    const openUrl = () => {
        let content = {}
        openNewTab('url', content);
    }

    const openNewTab = async (type, content) => {
        let str = type == 'code' ? "코드" : (type == 'html' ? 'HTML파일' : (type == 'url' ? 'URL' : (type == 'start' ? 'start' : '')));
        let arr = [...state.openList];
        let idx;
        if(state.openList.length > 0) {
            idx = Math.max(...state.openList.map(item => item.idx)) + 1;
        } else {
            idx = 0;
        }
        let openItem = {
            idx : idx,
            type : type,
            name : type == 'start' ? '시작' : `새 작업(${str})`,
            content : content
        }
        arr.push(openItem);
        dispatch({type:'setOpenList', payload:arr});

        let writeParam = { 
            type : 'openList', 
            content : arr
        };
        await window.electron.writeData(writeParam);

        let properties = {...state.properties};
        properties.lastOpenIdx.push(idx);
        dispatch({type:'setProperties', payload: properties});

        let writeParam2 = {
            type : "properties",
            content : properties
        }
        await window.electron.writeData(writeParam2);
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
                    <div className='title'>
                        새 작업 열기
                    </div>
                    <div className='openBtnDiv'>
                        <button className='openBtn' onClick={() => openCode()}>HTML코드 입력</button>
                        <button className='openBtn' onClick={() => openFile()}>HTML파일 열기</button>
                        <button className='openBtn' onClick={() => openUrl()}>URL 열기</button>
                    </div>
                </div>
                <div className='openDiv save'>
                    <div className='title'>
                        저장된 작업 열기
                    </div>
                    <div className='list'>
                        {state.saveList.length == 0 && 
                            <div>
                                저장된 작업이 없습니다.
                            </div>
                        }
                    </div>
                </div>
            </div>

            <div id="htmlContent">
                <div id="htmlTab">
                    {state.openList.map((item, index) => (
                        <div key={index}
                            className={state.properties.lastOpenIdx[state.properties.lastOpenIdx.length - 1] == item.idx ? "tabItem active" : "tabItem"}
                            onClick={(e) => {selectTab(e.target, item)}}
                            draggable={true}
                        >
                            <span className='icon'>
                            {item.type == 'start' && <img src={logoSvg}/>}
                            {item.type == 'code' && <img src={codeSvg}/>}
                            {item.type == 'html' && <img src={fileSvg}/>}
                            {item.type == 'url' && <img src={urlSvg}/>}
                            </span>
                            <span className='name'>
                                {item.name}
                            </span>
                            <button className='close' onClick={() => {closeTab(item)}}>
                                <img className='closeSvg' src={closeSvg}/>
                            </button>
                        </div>
                    ))}
                </div>
                <div id='htmlContentDiv'>
                {(() => {
                    const item = state.openList.find(
                        item => item.idx === state.properties.lastOpenIdx.slice(-1)[0]
                    );

                    if (item) {
                        switch(item.type) {
                            case 'start':
                                return <div id="htmlStartContent">{item.content.text}</div>;
                            case 'code':
                                return <CodeEditor item={item} />;
                            case 'html':
                                return <HtmlEditor item={item} />;
                            case 'url':
                                return <UrlEditor item={item} />;
                            default:
                                return null;
                        }
                    }
                    return null;
                })()}
                </div>
            </div>

        </div>
    );
}

export default Html;