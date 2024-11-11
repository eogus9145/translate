import Reactm, { useState, useEffect } from 'react';
import { StateProvider, useStateValue, loadData } from '../StateContext.js';

import RemoveValue from './RemoveValue.js';

import '../css/setting.css';

import editSvg from '../svg/content/edit.svg';
import delSvg from '../svg/content/del.svg';
import closeSvg from '../svg/content/close.svg';

const Modal = ({ type, idx, onClose }) => {

    const { state, dispatch } = useStateValue();

    let typeStr = type == 'api' ? `번역 API ${idx !== null ? '수정' : '추가'}` : `언어 프리셋 ${idx !== null ? '수정' : '추가'}`;

    const insertApi = async () => {
        let obj = { 
            type : 'api', 
            content : {
                idx : null,
                name : state.settingModalName,
                desc : state.settingModalDesc,
                apiKey : state.settingModalApiKey
            }
        };
        let { cd, msg } = await window.electron.insertData(obj);
        window.alertMsg(dispatch, msg);        
        if(cd == '0000') {
            let list = await loadData(type);
            dispatch({type:'setApiList', payload: list});
            onClose();
        }
        
    }

    const updateApi = async () => {
        let obj = { 
            type : 'api', 
            content : {
                idx : idx,
                name : state.settingModalName,
                desc : state.settingModalDesc,
                apiKey : state.settingModalApiKey
            }
        };
        let { cd, msg } = await window.electron.updateData(obj);
        window.alertMsg(dispatch, msg);
        if(cd == '0000') {
            let list = await loadData(type);
            dispatch({type:'setApiList', payload: list});
            onClose();
        }
    }

    const insertPreset = async () => {
        let obj = { 
            type : 'preset', 
            content : {
                idx : null,
                name : state.settingModalName,
                desc : state.settingModalDesc,
                from : state.settingModalFrom,
                to : state.settingModalTo
            }
        };
        let { cd, msg } = await window.electron.insertData(obj);
        window.alertMsg(dispatch, msg);
        if(cd == '0000') {
            let list = await loadData('preset');
            dispatch({type:'setPresetList', payload: list});
            onClose();
        }
    }

    const updatePreset = async () => {
        let obj = { 
            type : 'preset', 
            content : {
                idx : idx,
                name : state.settingModalName,
                desc : state.settingModalDesc,
                from : state.settingModalFrom,
                to : state.settingModalTo
            }
        };
        let { cd, msg } = await window.electron.updateData(obj);
        window.alertMsg(dispatch, msg);
        if(cd == '0000') {
            let list = await loadData(type);
            dispatch({type:'setPresetList', payload: list});
            onClose();
        }
    }

    const modalSubmit = async () => {

        if(!state.settingModalName) {
            window.alertMsg(dispatch, "이름을 입력해주세요");
            document.querySelector("#settingModalName").focus();
            return;
        }

        if(type == 'api') {
            if(idx !== null) updateApi();
            else insertApi();
        } else if(type == 'preset') {
            if(idx !== null) updatePreset();
            else insertPreset();
        }
    }

    const handleSearchLang = (type, value) => {
        let target = null;
        let list = null;
        if(type == 'from') {
            list = document.querySelectorAll('.presetToItem.from');
            for(let i=0; i<list.length; i++) {
                if(list[i].getAttribute("data-name").includes(value)) {
                    target = list[i];
                    break;
                }
            }
        } else if(type == 'to') {
            list = document.querySelectorAll('.presetToItem.to');
            for(let i=0; i<list.length; i++) {
                if(list[i].getAttribute("data-name").includes(value)) {
                    target = list[i];
                    break;
                }
            }
        }
        list.forEach((v) => v.classList.remove("search"));
        if(target && value.length > 0) {
            target.classList.add("search");
            let top = target.offsetTop;
            target.parentNode.scrollTop = top;
        }
    }

    const handleSelect = (type, code) => {
        let target = document.querySelector('.presetToItem.' + type + '[data-code="' + code + '"]');
        if(type == 'from') {
            let targetObj = state.langList.find(v => v.code == code);
            dispatch({type: 'setSettingModalFrom', payload : targetObj});
            dispatch({type: 'setSettingModalTo', payload: []});
        } else if(type == 'to') {
            let isExist = state.settingModalTo.some(v => v.code == code);
            let oldList = [...state.settingModalTo];
            let newList;
            console.log("to! : ", isExist, oldList);
            if(isExist) {
                newList = oldList.filter(v => v.code !== code);
            } else {
                let targetObj = state.langList.find(v => v.code == code);
                newList = oldList;
                newList.push(targetObj);
                newList.sort((a,b) => a.ko.localeCompare(b.ko, 'ko-KR'));
            }
            dispatch({type: 'setSettingModalTo', payload: newList});
        }
    }

    const handleSelectAll = () => {
        if(state.langList.length == state.settingModalTo.length) {
            dispatch({type: 'setSettingModalTo', payload: []});
        } else {
            dispatch({type: 'setSettingModalTo', payload: [...state.langList]});
        }
    }

    useEffect(() => {
        if(type == 'api') {
            if(idx !== null) {            
                let list = [...state.apiList];
                let original = list.find(v => v.idx == idx);
                dispatch({type: 'setSettingModalName', payload:original.name});
                dispatch({type: 'setSettingModalDesc', payload:original.desc});
                dispatch({type: 'setSettingModalApiKey', payload:original.apiKey});
            }
        } else if(type == 'preset') {
            if(idx !== null) {
                let list = [...state.presetList];
                let original = list.find(v => v.idx == idx);
                dispatch({type: 'setSettingModalName', payload:original.name});
                dispatch({type: 'setSettingModalDesc', payload:original.desc});
                dispatch({type: 'setSettingModalFrom', payload:original.from});
                dispatch({type: 'setSettingModalTo', payload:original.to});
            }
        }
    }, []);

    return (
        <div className="settingModal">
            <div className="settingModalContent">
                <div className='title'>
                    <span className='typeStr'>{typeStr}</span>
                    <button onClick={onClose}>
                        <img src={closeSvg} />
                    </button>
                </div>
                <div className='content'>
                        <table>
                            <tbody>
                                <tr>
                                    <th>이름</th>
                                    <td>
                                        <input 
                                            type="text" id="settingModalName" spellCheck={false} readOnly={type == 'api'} value={state.settingModalName} 
                                            style={type == 'api' ? {opacity : 0.7} : {opacity : 1}}
                                            onChange={(e) => dispatch({type:'setSettingModalName', payload:e.target.value}) } 
                                        />
                                        {type == 'preset' &&
                                            <RemoveValue iconSize="sm" position="center" targetId="settingModalName" dispatchType="setSettingModalName"/>
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <th>설명</th>
                                    <td>
                                        <input type="text" id="settingModalDesc" spellCheck={false} value={state.settingModalDesc} onChange={(e) => dispatch({type:'setSettingModalDesc', payload:e.target.value}) }/>
                                        <RemoveValue iconSize="sm" position="center" targetId="settingModalDesc" dispatchType="setSettingModalDesc"/>
                                    </td>
                                </tr>
                                <tr className={type == 'api' ? (idx == 0 ? 'hidden' : '') : 'hidden'}>
                                    <th>API키</th>
                                    <td>
                                        <input type="text" id="settingModalApiKey" spellCheck={false} value={state.settingModalApiKey} onChange={(e) => dispatch({type:'setSettingModalApiKey', payload:e.target.value}) }/>
                                        <RemoveValue iconSize="sm" position="center" targetId="settingModalApiKey" dispatchType="setSettingModalApiKey"/>
                                    </td>
                                </tr>
                                <tr className={type == 'preset' ? '' : 'hidden'}>
                                    <th>기준 언어</th>
                                    <td className='langList'>
                                        <div className='settingModalLangControl'>
                                            <div>
                                                <input type="text" id="settingModalToSearch" placeholder='국가명을 검색하세요' onChange={(e) => handleSearchLang('from', e.target.value)} />
                                            </div>
                                            <span className='currentFromTextSpan'>
                                                현재 선택된 언어 :&nbsp;
                                                <span className='currentFromText'>{state.settingModalFrom.ko ? state.settingModalFrom.ko : '없음'}</span>
                                            </span>
                                        </div>
                                        <div className='settingModalFrom scrollElement dark'>
                                            {state.langList.map((item, index) => {
                                                return (
                                                    <div key={index} className={state.settingModalFrom.code == item.code ? 'presetToItem from active' : 'presetToItem from'} data-name={item.ko} data-code={item.code} onClick={() => handleSelect('from', item.code)}>
                                                        {item.ko}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </td>
                                </tr>
                                <tr className={type == 'preset' ? '' : 'hidden'}>
                                    <th>번역 대상</th>
                                    <td className='langList'>
                                        <div className='settingModalLangControl'>
                                            <div>
                                                <input type="text" id="settingModalToSearch" placeholder='국가명을 검색하세요' onChange={(e) => handleSearchLang('to', e.target.value)} />
                                                <button onClick={() => handleSelectAll()}>{state.langList.length == state.settingModalTo.length ? '전체해제' : '전체선택'}</button>
                                            </div>
                                            <span className='settingModalToLengthSpan'>선택된 갯수 : <span className='settingModalToLength'>{state.settingModalTo.length}</span></span>
                                        </div>
                                        <div className='settingModalTo scrollElement dark'>
                                            {state.langList.filter(v => v.code !== state.settingModalFrom.code).map((item, index) => (
                                                <div key={index} className={state.settingModalTo.some(v => v.code == item.code) ? 'presetToItem to active' : 'presetToItem to'} data-name={item.ko} data-code={item.code} onClick={() => handleSelect('to', item.code)}>
                                                    {item.ko}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div>
                            <button className='settingModalSubmitBtn' onClick={() => {modalSubmit()}}>
                                저장
                            </button>
                        </div>
                </div>
            </div>
        </div>
    )
}

const Setting = () => {

    const { state, dispatch } = useStateValue();

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [modalIdx, setModalIdx] = useState(null);

    const addApi = () => {
        setModalType('api');
        setShowModal(true);
    }

    const addPreset = () => {
        setModalType('preset');
        setShowModal(true);
    }

    const updateApi = (idx) => {
        setModalType('api');
        setModalIdx(idx);
        setShowModal(true);
    }

    const updatePreset = (idx) => {
        setModalType('preset');
        setModalIdx(idx);
        setShowModal(true);
    }

    const closeModal = () => {
        dispatch({type: 'setSettingModalName', payload: ''});
        dispatch({type: 'setSettingModalDesc', payload: ''});
        dispatch({type: 'setSettingModalApiKey', payload: ''});
        dispatch({type: 'setSettingModalFrom', payload: {}});
        dispatch({type: 'setSettingModalTo', payload: []});
        setModalType('');
        setModalIdx(null);
        setShowModal(false);
    }

    const handleDelete = async (type, idx) => {
        window.confirmMsg(dispatch, "정말 삭제하시겠습니까?", async () => {
            let dispatchType = type == 'api' ? 'setApiList' : 'setPresetList';
            let { cd, msg } = await window.electron.deleteData({type : type, idx : idx});
            window.alertMsg(dispatch, msg);
            if(cd == '0000') {
                let list = await loadData(type);
                dispatch({type:dispatchType, payload: list});
            }
        })
    }

    return(
        <div id="settingMain">

                {showModal && <Modal type={modalType} idx={modalIdx} onClose={closeModal} />}
            <div id="settingContent">

                <div className='settingItem'>
                    <div className='title'>
                        <span>API 설정</span>
                        {/* <button className='addBtn' onClick={()=>addApi()}>추가</button> */}
                    </div>
                    <div className='content'>

                        {state.apiList.map((item, index) => (
                            <div className='apiItem' key={index}>
                                <div className='title'>
                                    <span>{item.name} {item.desc && '(' + item.desc + ')'}</span>
                                    <div className='btnDiv'>
                                        <button className={item.idx > 0 ? 'btn' : 'btn disabled'} onClick={() => {
                                            if(item.idx > 0) updateApi(item.idx);
                                        }}>
                                            <img src={editSvg}/>
                                        </button>
                                        <button className={item.idx > 0 ? 'btn' : 'btn disabled'} onClick={() => {
                                            if(item.idx > 0) handleDelete('api', item.idx);
                                        }}>
                                            <img src={delSvg}/>
                                        </button>
                                    </div>
                                </div>
                                <div className='content'>
                                    {item.apiKey == 'none' ? 
                                        <div className='apiKey disabled'>
                                            <span className='apiKeySpan'>API-KEY</span>
                                            <div className='apiKeyInput'>
                                                <span className='text'>{item.name + '은 API-KEY가 필요 없습니다.'}</span>
                                            </div>
                                        </div>
                                        :
                                        <div className='apiKey'>
                                            <span className='apiKeySpan'>API-KEY</span>
                                            <div className='apiKeyInput'>
                                                <span className='text'>{state.apiList.find(v => v.idx == item.idx).apiKey}</span>
                                            </div>
                                        </div>                                    
                                    }
                                </div>
                            </div>
                        ))}
                        
                    </div>
                </div>

                <div className='settingItem'>
                    <div className='title'>
                        <span>번역 대상 언어 프리셋</span>
                        <div>
                            <button className='addBtn' onClick={()=>addPreset()}>추가</button>
                        </div>
                    </div>
                    <div className='content scrollElement dark'>

                    {state.presetList.map((item, index) => (
                            <div className='apiItem' key={index}>
                                <div className='title'>
                                    <span>{item.name} {item.desc && '(' + item.desc + ')'}</span>
                                    <div className='btnDiv'>
                                        <button className='btn'>
                                            <img src={editSvg} onClick={() => updatePreset(item.idx)}/>
                                        </button>
                                        <button className='btn' onClick={() => handleDelete('preset', item.idx)}>
                                            <img src={delSvg}/>
                                        </button>
                                    </div>
                                </div>
                                <div className='content'>

                                    <div className='apiKey'>
                                        <span className='apiKeySpan'>기준 언어</span>
                                        <div className='apiKeyInput'>
                                            <span className='text'>{item.from.ko}</span>
                                        </div>
                                    </div>

                                    <div className='apiKey multiple'>
                                        <span className='apiKeySpan'>번역 대상</span>
                                        <div className='apiKeyInput'>
                                            <div className='langList scrollElement dark'>
                                            {item.to.map((item2, index2) => (
                                                <div className='presetToItem' key={index2} data-code={item2.code} >{item2.ko}</div>
                                            ))}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}

                    </div>
                </div>
                
            </div>

        </div>
    );
}

export default Setting;