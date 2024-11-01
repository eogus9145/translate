import React, { useEffect, useState } from 'react';
import { StateProvider, useStateValue, dateFormat, loadData } from '../StateContext.js';

import '../css/snb.css';
import addSvg from '../svg/menu/add.svg';
import delSvg from '../svg/menu/del.svg';

const Snb = () => {
    const { state, dispatch } = useStateValue();
    
    const handleSort = async (idx) => {
        let wasActive = state.currentSort.idx == idx;
        let newArr = state.sortOption;
        let item = newArr[idx];
        if(wasActive) {
            item.direction = item.direction == 'up' ? 'down' : 'up';
            newArr[idx] = item;
            dispatch({ type: 'setSortOption', payload : newArr });
        }
        dispatch({ type: 'setCurrentSort', payload : item });
    }

    const listSort = () => {
        let data = state.projectList;
        let sortType = state.currentSort.idx;
        let sortDirection = state.currentSort.direction;
        if(sortType == 0) {
            if(sortDirection == 'up') data.sort((a,b) => new Date(a.reg_date) - new Date(b.reg_date));
            else if (sortDirection == 'down') data.sort((a,b) => new Date(b.reg_date) - new Date(a.reg_date));
        } else if(sortType == 1) {
            if(sortDirection == 'up') data.sort((a,b) => new Date(a.last_modify_date) - new Date(b.last_modify_date));
            else if (sortDirection == 'down') data.sort((a,b) => new Date(b.last_modify_date) - new Date(a.last_modify_date));
        } else if(sortType == 2) {
            if(sortDirection == 'up') data.sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));
            else if (sortDirection == 'down') data.sort((a, b) => b.name.localeCompare(a.name, 'ko-KR'));
        }    
        dispatch({ type: 'setProjectList', payload: data });
    }
    
    const addProject = async () => {
        // json에 프로젝트 추가하는 로직
        let name = state.addProjectName;
        if(!name || name.trim().length == 0 ) {
            alert("프로젝트 이름을 입력해주세요");
            return;
        } else {
            let {cd, msg, list} = await window.electron.addProject(name);
            alert(msg);
            if(cd == '0000') {
                dispatch({type : 'setAddProjectName', payload: ''});
                dispatch({ type: 'setProjectList', payload: list });
            }
        }
    }

    const deleteProject = async (idx) => {
        if(window.confirm(`'정말 삭제하시겠습니까?\n프로젝트 내 모든 파일이 삭제됩니다.\n삭제하면 되돌릴 수 없습니다!`)){
            let {cd, msg, list} = await window.electron.delProject(idx);
            alert(msg);
            dispatch({ type: 'setProjectList', payload: list });
        };
    }

    useEffect(() => {
        listSort();
    }, [state.currentSort.idx, state.currentSort.direction, state.projectList])
    

    return(
        <div id="snb" className={state.isSnbView ? '' : 'hidden'}>
            <div id="snbTitle">
                <span id="snbTitleText">{state.targetSnbText}</span>
                <div id="snbSubmenu">
                    <button id="projectAddBtn" className={state.targetSnb == 'project' ? '' : 'hidden'} onClick={() => dispatch({ type: 'setIsProjectAdd', payload: state.isProjectAdd ? false : true })}>
                        <img src={addSvg} className="hoverBright" alt="프로젝트 추가"/>
                    </button>
                </div>
            </div>
            <div id="snbContent" className="scrollElement">

                <div id="project" className={state.targetSnb == 'project' ? 'snbItem' : 'snbItem hidden'}>
                    <div id="projectAdd" className={state.isProjectAdd ? '' : 'hidden'}>
                        <span>
                            프로젝트 추가
                        </span>
                        <div id="projectAddDiv">
                            <input type="text" spellCheck={false} id="projectAddNameInput" placeholder="프로젝트명을 입력하세요" value={state.addProjectName} onChange={(e) => dispatch({ type: 'setAddProjectName', payload: e.target.value })}/>
                            <button id="projectAddButton" onClick={() => addProject()}>추가</button>
                        </div>
                    </div>
                    <div id="projectSort">
                        <span>
                            정렬방식
                        </span>
                        <div>
                            {state.sortOption.map((item, index) => (
                                <button key={index} className={state.currentSort.idx == item.idx ? 'sortBtn active' : 'sortBtn'} onClick={() => handleSort(item.idx)}>
                                    <span>{item.name}</span>
                                    <span>{item.direction == 'up' ? '↑' : '↓'}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <ul className="projectList">
                        {state.projectList.map((item, index) => (
                            <li key={index} className='projectItem'>
                                <button className='viewBtn'>
                                    <p className='viewBtnName'>{item.name}</p>
                                    <p className='viewBtnRegDate'>{dateFormat(item.reg_date)}</p>
                                    <p className='viewBtnModDate'>{dateFormat(item.last_modify_date)}</p>
                                </button>
                                <button className='delBtn' onClick={() => deleteProject(item.idx)}>
                                    <img src={delSvg}/>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div id="translate" className="snbItem hidden">
                                        
                </div>

                <div id="setting" className="snbItem hidden">
                    
                </div>

                <div id="guide" className="snbItem hidden">
                    
                </div>

            </div>
        </div>
    );
}

export default Snb;