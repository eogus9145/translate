import Reactm, { useState, useEffect } from 'react';
import { StateProvider, useStateValue } from '../StateContext.js';

import '../css/htmlTranslate.css';

const HtmlTranslate = () => {

    const { state, dispatch } = useStateValue();

    return(
        <div id="htmlTranslateModal">
            <div id="htmlTranslateModalContent">
                <div id="htmlTranslateModalTitle">번역 준비</div>
                <div id="htmlTranslateModalList">

                    <div className='htmlTransModalSettingItem'>
                        <div className='title'>
                            번역 API
                        </div>
                        <div className='content api'>

                        </div>
                    </div>

                    <div className='htmlTransModalSettingItem'>
                        <div className='title'>
                            번역 대상 언어
                        </div>
                        <div className='content lang'>

                        </div>
                    </div>

                    <div className='htmlTransModalSettingItem'>
                        <div className='title'>
                            커스텀 태그 아이디
                        </div>
                        <div className='content tagId'>

                        </div>
                    </div>

                </div>
            </div>
            <div id="htmlTranslateModalSetting">
                <div id="htmlTranslateModalSettingTitle">설정</div>
                <div id="htmlTranslateModalSettingContent">

                    <div className='htmlTransModalSettingItem'>
                        <div className='title'>
                            번역 API
                        </div>
                        <div className='content'>
                            {state.apiList.map((item, index) => (
                                <label key={index}>
                                    <span>
                                        <input type='radio' name='transApi' checked={item.idx==0 && true}/> {item.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className='htmlTransModalSettingItem'>
                        <div className='title'>
                            번역 대상 언어
                        </div>
                        <div className='content'>
                            <label>
                                <span>
                                    <input type='radio' name='langSelect' checked={true} /> 프리셋 선택
                                </span>
                            </label>
                            <label>
                                <span>
                                    <input type='radio' name='langSelect'/> 직접선택
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className='htmlTransModalSettingItem'>
                        <div className='title'>
                            커스텀 태그 아이디
                        </div>
                        <div className='content'>
                            <label>
                                <span>
                                    <input type='radio' name='tagName' checked={true} /> 기본값(인덱스)
                                </span>
                            </label>
                            <label>
                                <span>
                                    <input type='radio' name='tagName'/> 직접선택
                                </span>
                            </label>
                        </div>
                    </div>

                </div>
                <div id="htmlTranslateModalSettingBtnDiv">
                    <button id="settingPrevBtn">
                        이전으로
                    </button>
                    <button id="settingNextBtn">
                        번역시작
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HtmlTranslate;