import Reactm, { useState, useEffect } from 'react';
import { StateProvider, useStateValue } from '../StateContext.js';

import '../css/urlEditor.css';

const UrlEditor = ({ item }) => {

    const { state, dispatch } = useStateValue();

    return(
        <div id="urlEditor" className='editor'>
            url 에디터
        </div>
    );
}

export default UrlEditor;