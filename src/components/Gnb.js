import React, { useEffect, useState } from 'react';
import { StateProvider, useStateValue } from '../StateContext.js';

import '../css/gnb.css';
import htmlSvg from '../svg/menu/html.svg';
import translateSvg from '../svg/menu/translate.svg';
import settingSvg from '../svg/menu/setting.svg';
import guideSvg from '../svg/menu/guide.svg';

const Gnb = () => {

    const { state, dispatch } = useStateValue();

    const mouseenter = (target) => {
        let alt = target.alt;
        target = target.closest('li');
        let top = target.offsetTop + ((target.offsetHeight - 28) / 2);
        dispatch({ type: 'setIsDescView', payload : true });
        dispatch({ type: 'setDescText', payload : alt });
        dispatch({ type: 'setDescTop', payload : top + "px" });
    }

    const mouseleave = (target) => {
        dispatch({ type: 'setIsDescView', payload : false });
    }

    // snb사용시...
    // const gnbClick = (target) => {
    //     if(target.tagName.toLowerCase() == 'img') target = target.closest('li');
    //     let targetId = target.getAttribute("data-target_id");
    //     let targetText = target.querySelector("img").alt;
    //     if(!targetId) {
    //         dispatch({ type: 'setCurrentMain', payload: target.getAttribute("data-main_id")});
    //     } else {
    //         dispatch({ type: 'setIsSnbView', payload: (state.targetSnb == targetId) && state.isSnbView ? false : true });
    //         dispatch({ type: 'setTargetSnb', payload: targetId});
    //         dispatch({ type: 'setTargetSnbText', payload: targetText});
    //     }
    // }

    const gnbClick = async (target) => {
        if(target.tagName.toLowerCase() == 'img') target = target.closest('li');
        let mainId = target.getAttribute("data-main_id");
        // if(mainId == 'html') {
        //     dispatch({ type: 'setIsSnbView', payload: (state.targetSnb == mainId) && state.isSnbView ? false : true });
        //     dispatch({ type: 'setTargetSnb', payload: mainId});
        // } else {
        // }
        dispatch({ type: 'setCurrentMain', payload: target.getAttribute("data-main_id")});
    }

    return(
        <ul id="menu">
            <li className={state.currentMain == 'translate' ? 'menuLi active' : 'menuLi'} data-main_id="translate" onClick={(e) => gnbClick(e.target)}>
                <img src={translateSvg} alt="실시간번역" className="menuIcon" onMouseEnter={(e) => mouseenter(e.target)} onMouseLeave={(e) => mouseleave(e.target)}/>
            </li>
            <li className={state.currentMain == 'html' ? 'menuLi active' : 'menuLi'} data-main_id="html" onClick={(e) => gnbClick(e.target)}>
                <img src={htmlSvg} alt="HTML번역" className="menuIcon" onMouseEnter={(e) => mouseenter(e.target)} onMouseLeave={(e) => mouseleave(e.target)}/>
            </li>
            <li className={state.currentMain == 'setting' ? 'menuLi active' : 'menuLi'} data-main_id="setting" onClick={(e) => gnbClick(e.target)}>
                <img src={settingSvg} alt="설정" className="menuIcon" onMouseEnter={(e) => mouseenter(e.target)} onMouseLeave={(e) => mouseleave(e.target)}/>
            </li>
            {/* <li className={state.currentMain == 'guide' ? 'menuLi active' : 'menuLi'} data-main_id="guide" onClick={(e) => gnbClick(e.target)}>
                <img src={guideSvg} alt="사용자 가이드" className="menuIcon" onMouseEnter={(e) => mouseenter(e.target)} onMouseLeave={(e) => mouseleave(e.target)}/>
            </li> */}
            <div id="menuDesc" className={state.isDescView ? '' : 'hidden'} style={{height: '28px', top:state.descTop, left: '60px'}}>
                <span id="menuDescText">{state.descText}</span>
                <div id="menuDescTailBorder">
                    <div id="menuDescTail"></div>                    
                </div>
            </div>
        </ul>
    );
}

export default Gnb;