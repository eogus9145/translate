import Reactm, { useState, useEffect } from 'react';
import { StateProvider, useStateValue } from '../StateContext.js';

import '../css/translateHtmlResult.css';

const TranslateHtmlResult = ({result, setResult, workName}) => {

    const { state, dispatch } = useStateValue();

    return(
        <div id="translateHtmlResultMain" className=''>
            <div className='resultContent'>
                <div className='resultHeader'>
                    <div className='title'>
                        <span className='workName'>'{workName}'</span>
                        <span>의 번역 결과</span>
                    </div>
                    <div className='buttonDiv'>
                        <button className='save'>파일로 저장</button>
                        <button className='copy'>클립보드 복사</button>
                    </div>
                </div>
                <div className='resultBody'>
                    {result ? 
                        <textarea id="translateResultTextArea" className='resultTextarea scrollElement dark' value={result} onChange={(e) => {setResult(e.target.value)}}></textarea>
                        :
                        <div className='noData'>번역 된 결과가 없습니다</div>
                    }
                </div>
            </div>
        </div>
    );
}

export default TranslateHtmlResult;