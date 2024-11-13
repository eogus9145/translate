import React, { useState, useEffect } from 'react';
import { StateProvider, useStateValue , loadData} from '../StateContext.js';

import '../css/content.css';
import Gnb from './Gnb.js';
import Main from './Main.js';

const Content = () => {

    const { state, dispatch } = useStateValue();
    const [isComplete, setIsComplete] = useState(false);
    useEffect(()=>{
        const fetchData = async () => {
            try{
                let properties = await loadData('properties');
                await dispatch({ type: 'setProperties', payload: properties });
                let langList = await loadData('language');
                await dispatch({ type: 'setLangList', payload: langList });
                let apiList = await loadData('api');
                await dispatch({ type: 'setApiList', payload: apiList });
                let presetList = await loadData('preset');
                await dispatch({ type: 'setPresetList', payload: presetList });
                let openList = await loadData("openList");
                await dispatch({ type: 'setOpenList', payload: openList });
            } catch(err) {
                console.log(err);
            } finally {
                setIsComplete(true);
            }
        }
        fetchData();
    },[dispatch]);

    if(isComplete) {
        return(
            <div id="content">
                <Gnb/>
                <Main/>
            </div>
        );
    }

}

export default Content;