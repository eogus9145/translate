import React, { createContext, useReducer, useContext } from 'react';

const initialState = {

  // 숫자 state
  descTop : 0,

  // 문자 state
  targetSnb : '',
  descText : '',
  addProjectName : '',
  currentMain : 'html',
  currentMenu : '',
  currentTransFrom : 'ko',
  currentTransFromText : '한국어',
  currentTransTo : 'en',
  currentTransToText : '영어',
  translateNowInput : '',
  translateNowResult : '',
  currentHtml : '',
  settingModalName : '',
  settingModalDesc : '',
  settingModalApiKey : '',
  alertMsg : '',
  confirmMsg : '',

  
  // 배열 state
  sortOption : [{ idx: 0, name: '생성일', direction: 'up' }, { idx: 1, name: '수정일', direction: 'up' }, { idx: 2, name: '이름순', direction: 'up' }],
  projectList : [],
  langList : [],
  apiList : [],
  presetList : [],
  currentHtmlTextNodes : [],
  selectedText : [],
  settingModalTo : [],
  saveList : [],
  openList : [],
  

  // 객체 state
  properties : {},
  currentSort: {
    idx: 0,
    name: '생성일',
    direction: 'up'
  },
  settingModalFrom : {},

  // boolean state
  isSnbView : false,
  isDescView : false,
  isProjectAdd : false,
  isSelectComplete : false,
  isAlertMsg: false,
  isConfirmMsg: false,

  //함수
  alertCallback : null,
  confirmCallback : null,

}

const StateContext = createContext();

const stateReducer = (state, action) => {

  //action 정의
  switch(action.type) {

    // 숫자
    case 'setDescTop' : return { ...state, descTop: action.payload };

    //문자
    case 'setTargetSnb' : return { ...state, targetSnb: action.payload };
    case 'setDescText' : return { ...state, descText: action.payload };
    case 'setAddProjectName' : return { ...state, addProjectName: action.payload };
    case 'setCurrentMain' : return { ...state, currentMain: action.payload };
    case 'setCurrentTransFrom' : return { ...state, currentTransFrom: action.payload };
    case 'setCurrentTransTo' : return { ...state, currentTransTo: action.payload };
    case 'setCurrentTransFromText' : return { ...state, currentTransFromText: action.payload };
    case 'setCurrentTransToText' : return { ...state, currentTransToText: action.payload };
    case 'setTranslateNowInput' : return { ...state, translateNowInput: action.payload };
    case 'setTranslateNowResult' : return { ...state, translateNowResult: action.payload };
    case 'setCurrentHtml' : return { ...state, currentHtml: action.payload };
    case 'setSettingModalName' : return { ...state, settingModalName: action.payload };
    case 'setSettingModalDesc' : return { ...state, settingModalDesc: action.payload };
    case 'setSettingModalApiKey' : return { ...state, settingModalApiKey: action.payload };
    case 'setAlertMsg' : return { ...state, alertMsg: action.payload };
    case 'setConfirmMsg' : return { ...state, confirmMsg: action.payload };

    //배열
    case 'setSortOption' : return { ...state, sortOption: action.payload };
    case 'setProjectList' : return { ...state, projectList: action.payload };
    case 'setLangList' : return { ...state, langList: action.payload };
    case 'setApiList' : return { ...state, apiList: action.payload };
    case 'setPresetList' : return { ...state, presetList: action.payload };
    case 'setCurrentHtmlTextNodes' : return { ...state, currentHtmlTextNodes: action.payload };
    case 'setSelectedText' : return { ...state, selectedText: action.payload };
    case 'setSettingModalTo' : return { ...state, settingModalTo: action.payload };
    case 'setSaveList' : return { ...state, saveList: action.payload };
    case 'setOpenList' : return { ...state, openList: action.payload };

    //객체
    case 'setProperties' : return { ...state, properties: action.payload };
    case 'setCurrentSort' : return { ...state, currentSort: action.payload };
    case 'setSettingModalFrom' : return { ...state, settingModalFrom: action.payload };

    //boolean
    case 'setIsSnbView' : return { ...state, isSnbView: action.payload };
    case 'setIsDescView' : return { ...state, isDescView: action.payload };
    case 'setIsProjectAdd' : return { ...state, isProjectAdd: action.payload };
    case 'setIsSelectComplete' : return { ...state, isSelectComplete: action.payload };
    case 'setIsAlertMsg' : return { ...state, isAlertMsg: action.payload };
    case 'setIsConfirmMsg' : return { ...state, isConfirmMsg: action.payload };
    
    //함수
    case 'setAlertCallback' : return { ...state, alertCallback: action.payload };
    case 'setConfirmCallback' : return { ...state, confirmCallback: action.payload };

    default: return state;


  }

}

export const StateProvider = ({children}) => {
  const [state, dispatch] = useReducer(stateReducer, initialState);
  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
}


// 전역적으로 사용할 함수 정의
export const dateFormat = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const loadData = async (type) => {
  let data = await window.electron.fetchData(type);
  return data;
}

export const useStateValue = () => useContext(StateContext);

window.alertMsg = (dispatch, msg, callback) => {
  dispatch({type: 'setAlertMsg', payload:msg});
  dispatch({type: 'setIsAlertMsg', payload:true});
  if(callback) dispatch({type: 'setAlertCallback', payload:callback});
}

window.confirmMsg = (dispatch, msg, callback) => {
  dispatch({type: 'setConfirmMsg', payload:msg});
  dispatch({type: 'setConfirmCallback', payload:callback});
  dispatch({type: 'setIsConfirmMsg', payload:true});
}