import Reactm, { useState, useEffect } from 'react';
import { StateProvider, useStateValue } from '../StateContext.js';

import '../css/common.css';

const Confirm = () => {

    const { state, dispatch } = useStateValue();

    return(
        <div className="alert">
            <div className='alertContent'>
                <div className='msg'>
                    {state.confirmMsg}
                </div>
                <div className='submit'>
                    <button className='submitBtn' onClick={async () => {
                        dispatch({type:'setConfirmMsg', payload:''});
                        dispatch({type:'setIsConfirmMsg', payload:false});
                        await state.confirmCallback();
                    }}>
                        확인
                    </button>
                    <button className='cancelBtn' onClick={() => {
                        dispatch({type:'setConfirmMsg', payload:''});
                        dispatch({type:'setConfirmCallback', payload:null});
                        dispatch({type:'setIsConfirmMsg', payload:false});
                    }}>
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Confirm;