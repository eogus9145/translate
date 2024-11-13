import React from 'react';
import { StateProvider, useStateValue, dateFormat } from '../StateContext.js';

import '../css/titlebar.css';
import minImg from '../svg/titlebar/minimize.svg';
import maxImg from '../svg/titlebar/maximize.svg';
import restoreImg from '../svg/titlebar/resotre.svg';
import closeImg from '../svg/titlebar/close.svg';
import logoImg from '../svg/titlebar/logo.svg';

const Titlebar = () => {

  const { state, dispatch } = useStateValue();

  const minimize = () => {
    window.electron.minimize();
  }

  const maximize = () => {
    window.electron.maximize();
    window.electron.sendMaximizedStateRequest();
  }

  const winClose = async () => {
    let isNoSaveIsExist = state.openList.some(v => v.isSave == false);
    if(isNoSaveIsExist) {
      window.confirmMsg(dispatch, "저장되지 않은 내용은 사라집니다.<br>프로그램을 종료하시겠습니까?", async () => {
        let newList = [...state.openList];
        newList = newList.filter(v => v.isSave == true);
        let writeParam = {
          type : "openList",
          content : newList
        }
        await window.electron.writeData(writeParam);

        let newProp = {...state.properties};
        let vaildArr = newList.map(v => v.idx);
        newProp.lastOpenIdx = newProp.lastOpenIdx.filter(v => vaildArr.includes(v));
        let writeParam2 = {
          type : "properties",
          content : newProp
        }
        await window.electron.writeData(writeParam2);
        window.electron.close();
      });
    } else {
      window.electron.close();
    }
  }

  window.addEventListener('resize', () => {
    window.electron.sendMaximizedStateRequest();
  });

  window.electron.onMaximizedStateResponse((isMaximized) => {
    if (isMaximized) {
        document.getElementById('titleMaxIcon').classList.add("hidden");
        document.getElementById('titleRestoreIcon').classList.remove('hidden');
    } else {
        document.getElementById('titleMaxIcon').classList.remove("hidden");
        document.getElementById('titleRestoreIcon').classList.add('hidden');
    }
  });

  return (
    <div id="title-bar">
      <div id="title">
        <img src={logoImg} width={16} />
        <span>언어번역기</span>
      </div>
      <div id="window-controls">
        <button id="minimize-btn" onClick={minimize}>
          <img src={minImg} />
        </button>
        <button id="maximize-btn" onClick={maximize}>
          <img src={maxImg} id="titleMaxIcon" />
          <img src={restoreImg} id="titleRestoreIcon" className="hidden" />
        </button>
        <button id="close-btn" onClick={winClose}>
          <img src={closeImg} />
        </button>
      </div>
    </div>
  );
}

export default Titlebar;
