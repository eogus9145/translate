import Reactm, { useState, useEffect } from 'react';
import { StateProvider, useStateValue } from '../StateContext.js';

import '../css/guide.css';

const Guide = () => {

    const { state, dispatch } = useStateValue();

    return(
        <div id="guideMain" className='mainContent'>
            가이드 메인
        </div>
    );
}

export default Guide;