import React, { useState, useEffect } from 'react';
import { StateProvider, useStateValue , loadData} from '../StateContext.js';

import '../css/content.css';
import Gnb from './Gnb.js';
import Main from './Main.js';

const Content = () => {

    const { state, dispatch } = useStateValue();
    
    useEffect(()=>{
        const fetchData = async () => {
            // let project = await loadData('project');
            // dispatch({ type: 'setProjectList', payload: project });
            let properties = await loadData('properties');
            dispatch({ type: 'setProperties', payload: properties });
            let langList = await loadData('language');
            dispatch({ type: 'setLangList', payload: langList });
            let apiList = await loadData('api');
            dispatch({ type: 'setApiList', payload: apiList });
            let presetList = await loadData('preset');
            dispatch({ type: 'setPresetList', payload: presetList });
            let openList = await loadData("openList");
            dispatch({ type: 'setOpenList', payload: openList });
        }
        fetchData();
    },[]);

    return(
        <div id="content">
            <Gnb/>
            <Main/>
        </div>
    );
}

export default Content;