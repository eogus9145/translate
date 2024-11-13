import Reactm, { useState, useEffect } from 'react';
import { StateProvider, useStateValue } from '../StateContext.js';

import '../css/guide.css';

const Guide = () => {

    const { state, dispatch } = useStateValue();

    return(
        <div id="guideContainer">
            <div className='content'>
                <div className='item setting'>
                    <div className='title'>설정</div>
                    <div className='text'>
                        <p>1. API 설정</p>
                        <p></p>
                        <p>2. 언어 프리셋 설정</p>
                    </div>
                </div>
                <div className='item transHtml'>
                    <div className='title'>HTML번역</div>
                </div>
                <div className='item transNow'>
                    <div className='title'>실시간번역</div>
                </div>
            </div>
        </div>
    );
}

export default Guide;