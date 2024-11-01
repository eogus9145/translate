import React, { useEffect, useState } from 'react';
import { StateProvider, useStateValue, dateFormat, loadData } from '../StateContext.js';

import '../css/snb.css';
import addSvg from '../svg/menu/add.svg';
import delSvg from '../svg/menu/del.svg';

const Snb = () => {
    const { state, dispatch } = useStateValue();

    return(
        <div id="snb">
            <div id="snbTitle">
                <span id="snbTitleText">HTML번역</span>
            </div>
            <div id="snbContent" className="scrollElement">

            </div>
        </div>
    );
}

export default Snb;