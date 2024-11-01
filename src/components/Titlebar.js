import React from 'react';

import '../css/titlebar.css';
import minImg from '../svg/titlebar/minimize.svg';
import maxImg from '../svg/titlebar/maximize.svg';
import restoreImg from '../svg/titlebar/resotre.svg';
import closeImg from '../svg/titlebar/close.svg';
import logoImg from '../svg/titlebar/logo.svg';

const Titlebar = () => {

  const minimize = () => {
    window.electron.minimize();
  }

  const maximize = () => {
    window.electron.maximize();
    window.electron.sendMaximizedStateRequest();
  }

  const winClose = () => {
    window.electron.close();
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
