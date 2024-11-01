import Reactm, { useState, useEffect } from 'react';
import { StateProvider, useStateValue } from '../StateContext.js';

import '../css/htmlEditor.css';

const HtmlEditor = ({ item }) => {

    const { state, dispatch } = useStateValue();

    return(
        <div id="htmlEditor" className='editor'>
            html 에디터
        </div>
    );
}

export default HtmlEditor;