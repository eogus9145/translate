import Reactm, { useState, useEffect } from 'react';
import { StateProvider, useStateValue } from '../StateContext.js';

import Loading from './Loading.js';

import '../css/main.css';

import Html from './Html.js';
import Translate from './Translate.js';
import Setting from './Setting.js';
import Guide from './Guide.js';

import Alert from './Alert.js';
import Confirm from './Confirm.js';

const Main = () => {

    const { state, dispatch } = useStateValue();

    return(
        <div id="main">
            <div className='mainContent'>
                { state.currentMain == 'translate' && <Translate/>}
                { state.currentMain == 'html' && <Html/>}
                { state.currentMain == 'setting' && <Setting/>}
                {/* { state.currentMain == 'guide' && <Guide/>} */}
                { state.isAlertMsg && <Alert/> }
                { state.isConfirmMsg && <Confirm/> }
                {state.isLoading && <Loading />}
            </div>
        </div>
    );
}

export default Main;