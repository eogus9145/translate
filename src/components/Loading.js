import Reactm, { useState, useEffect } from 'react';
import { StateProvider, useStateValue } from '../StateContext.js';

import '../css/loading.css';

const Loading = () => {

    const { state, dispatch } = useStateValue();

    const setProgress = (percent) => {
        const circle = document.querySelector('.progress-ring__circle');
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference;
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    window.electron.translateProgress(async (event, obj) => {
        setProgress(obj.percent);
        await dispatch({type:'setLoadingPercent', payload:obj.percent});
        await dispatch({type:'setLoadingMsg', payload:obj.msg});
        if(obj.percent == 100) {
            setTimeout(async ()=>{
                await dispatch({type:'setIsLoading', payload:false});
            }, 500);
        }
    });

    useEffect(()=>{
        setProgress(0);
    },[])

    return(
        <div id="loadingContainer">
            <div className='content'>
                <div className='loadingBar'>
                    <svg width="300" height="300">
                        <circle class="progress-ring__circle" cx="150" cy="150" r="120"></circle>
                    </svg>
                    <div className='loadingPercent'>
                        {state.loadingPercent}%
                    </div>
                </div>
                <div className='loadingMsg'>
                    {state.loadingMsg}
                </div>
            </div>
        </div>
    );
}

export default Loading;