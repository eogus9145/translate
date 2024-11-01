import Reactm, { useState, useEffect } from 'react';
import { StateProvider, useStateValue } from '../StateContext.js';

import '../css/common.css';

const Alert = () => {

    const { state, dispatch } = useStateValue();

    return(
        <div className="alert">
            <div className='alertContent'>
                <div className='msg'>
                    {state.alertMsg}
                </div>
                <div className='submit'>
                    <button className='submitBtn' onClick={async () => {
                        dispatch({type:'setIsAlertMsg', payload:false});
                        dispatch({type:'setAlertMsg', payload:''});
                        if(state.alertCallback) {
                            await state.alertCallback();
                        }
                        dispatch({type:'setAlertCallback', payload:null});

                    }}>
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Alert;