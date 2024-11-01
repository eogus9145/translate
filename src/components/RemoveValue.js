import Reactm, { useState, useEffect } from 'react';
import { StateProvider, useStateValue } from '../StateContext.js';

import '../css/removeValue.css';

import closeImg from '../svg/titlebar/close.svg';

const RemoveValue = ({ iconSize, position, targetId, dispatchType }) => {

    const { state, dispatch } = useStateValue();

    const [top, setTop] = useState(0);
    const [left, setLeft] = useState(0);
    const [size, setSize] = useState(iconSize == 'sm' ? 10 : (iconSize == 'md' ? 20 : (iconSize == 'lg' ? '30' : '20')));

    const handleRemove = (targetId, dispatchType) => {
        if(dispatchType) {
            dispatch({type:dispatchType, payload: ''});
        } else {
            document.querySelector("#" + targetId).value = "";
        }
    }

    useEffect(()=>{
        let target = document.querySelector("#" + targetId);
        switch(position) {
            case 'start' : 
                setTop(target.offsetTop + (size / 2));
            break;
            case 'center' : 
                setTop(target.offsetTop + ((target.offsetHeight - size) / 2));
            break;
            case 'end' : 
                setTop(target.offsetTop + ((target.offsetHeight - size) / 2));
            break;
            }
        setLeft((target.offsetLeft + target.offsetWidth - size) - (size / 2));

    }, []);

    return(
        <div calss="removeValue" 
            style={
                {
                    position:'absolute', 
                    top:top, 
                    left:left, 
                    width:size + 'px', 
                    height:size + 'px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: 0,
                    backgroundImage: 'url(' + closeImg + ')',
                    backgroundPosition: 'center',
                    backgroundSize: size + "px, " + size + "px",
                }
            }
            onClick={() => {handleRemove(targetId, dispatchType ? dispatchType : null)}}
        >
        </div>
    );
}

export default RemoveValue;