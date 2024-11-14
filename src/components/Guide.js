import Reactm, { useState, useEffect } from 'react';
import { StateProvider, useStateValue } from '../StateContext.js';

import RemoveValue from './RemoveValue.js';

import '../css/guide.css';

import closeSvg from '../svg/content/close.svg';

const LanguageCode = ({setIsLangCode}) => {
    const { state, dispatch } = useStateValue();

    const [keyword, setKeyword] = useState('');

    const langCodeSearch = (value) => {
        setKeyword(value);

        let list = [...state.langList];
        let target = list.find(v => value.trim().length !== 0 && v.ko.includes(value));
        let listEl = document.querySelector("#languageCodeModal > .content > .body > .list");
        document.querySelectorAll("#languageCodeModal > .content > .body > .list > .selectLangItem").forEach((v,i) => {
            v.classList.remove("searchTarget");
        })
        if(target) {
            let targetEl = document.querySelector("#languageCodeModal > .content > .body > .list > .selectLangItem[data-code='" + target.code + "']");
            targetEl.classList.add("searchTarget");
            listEl.scrollTop = targetEl.offsetTop - 12;
        } else {
            listEl.scrollTop = 0;
        }
    }

    const selectItem = async (item) => {
        console.log(item);
        await navigator.clipboard.writeText(item.code);
    }

    return (
        <div id="languageCodeModal">
            <div className='content'>
                <div className='header'>
                    <span>언어코드</span>
                    <button onClick={() => {setIsLangCode(false);}}>
                        <img src={closeSvg} />
                    </button>
                </div>
                <div className='body'>
                    <div className='search'>
                        <input type="text" id="langCodeSearchInput" spellCheck={false} placeholder='찾으시는 국가명을 입력하세요' value={keyword} onChange={(e)=>{langCodeSearch(e.target.value)}} />
                        <RemoveValue iconSize="sm" position="center" targetId="langCodeSearchInput"/>
                        <div className='copyInfo'>클릭하면 언어코드가 복사됩니다</div>
                    </div>
                    <div className='list scrollElement dark'>
                        {state.langList.map((item, index) => (
                            <div key={index} className='selectLangItem' data-code={item.code} onClick={(e)=>{selectItem(item)}}>
                                <div className='name'>
                                    <strong>{item.ko}</strong>
                                    <span className='native'>{" (" + item.native + ")"}</span>
                                </div>
                                <div className='code'>
                                    <span>{item.code}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const Guide = () => {

    const { state, dispatch } = useStateValue();

    const [isLangCode, setIsLangCode] = useState(false);

    return(
        <div id="guideContainer">
            {isLangCode && <LanguageCode setIsLangCode={setIsLangCode} />}
            <div className='header'>
                <div>사용자 가이드</div>
                <button onClick={() => {setIsLangCode(true);}}>언어코드 보기</button>
            </div>
            <div className='content'>
                <div className='item'>
                    <div className='title'>
                        설정
                    </div>
                    <div className='text'>
                        <div className='line'>
                            <div>1.</div>
                            <div>
                                <strong>API 설정</strong><br/>
                                번역 작업에 사용할 API의 설명과 API-KEY를 수정할 수 있습니다<br/>
                                구글 무료번역을 제외한 나머지 API들을 사용하시려면 해당 API의 API키가 필요합니다. 회원가입 후 API키를 부여 받아 주세요.<br/>
                                <a href="https://www.deepl.com/ko/signup?cta=checkout" target="_blank">Deepl 회원가입</a>&nbsp;&nbsp;<br/>
                            </div>
                        </div>
                        <div className='line'>
                            <div>2.</div>
                            <div>
                                <strong>언어 프리셋 설정</strong><br/>
                                HTML코드를 번역 할때 사용할 언어를 미리 저장해 놓습니다.<br/>
                                <span style={{color:'var(--bg-li-item)'}}>※ HTML번역 시에 꼭 필요합니다</span><br/>
                                자유롭게 프리셋 추가, 수정, 삭제가 가능하며 1개의 기준언어, 1개 이상의 번역언어 설정이 가능합니다.<br/>
                                <span className='example'>
                                    기준언어 : <u>번역할</u> 텍스트의 언어<br/>
                                    번역언어 : <u>번역하고자</u> 하는 언어<br/>
                                </span><br/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='item'>
                    <div className='title'>
                        HTML 번역
                    </div>
                    <div className='text'>
                        <div className='line'>
                            <div>1.</div>
                            <div>
                                좌측 서브메뉴 상단에 <strong>새 작업 열기</strong>를 누르시면 HTML코드 입력 창이 열립니다.<br/>
                                이미 저장하신 작업이 있다면 좌측 서브메뉴 하단 <strong>저장된 작업 열기</strong>에서 작업을 열 수 있습니다.
                            </div>
                        </div>
                        <div className='line'>
                            <div>2.</div>
                            <div>
                                다른 작업으로 전환을 원할 경우 <strong>저장된 작업 열기</strong> 또는 <strong>상단 탭 메뉴</strong>에서 원하는 작업을 선택합니다.<br/>
                            </div>
                        </div>
                        <div className='line'>
                            <div>3.</div>
                            <div>
                                상단 탭 메뉴의 X버튼을 누르면 창이 닫힙니다. 단 저장되지 않은 작업의 경우나 내용이 변경된 경우 닫기 의사를 물어보는 경고창이 발생합니다<br/>
                                <span style={{color:'var(--bg-li-item)'}}>※ 경고창에서 확인을 누르면 저장하지 않고 창을 닫습니다.</span>
                            </div>
                        </div>
                        <div className='line'>
                            <div>4.</div>
                            <div>
                                <strong>코드 불러오기</strong> 버튼을 누르면 사용자로컬의 html파일을 불러오거나 URL을 통해 HTML코드를 불러올 수 있습니다.<br/>
                                <span style={{color:'var(--bg-li-item)'}}>※ 우측 상단 복사하기 아이콘을 누르면 불러온 HTML코드가 클립보드에 복사됩니다.</span><br/>
                            </div>
                        </div>
                        <div className='line'>
                            <div>5.</div>
                            <div>
                                <strong>코드 편집</strong> 탭에서 HTML코드를 입력하면 번역이 가능한 텍스트를 자동 추출하여 우측 서브메뉴 <strong>번역대상</strong>에 출력합니다.<br/>
                                사용자는 <strong>번역가능한 텍스트 목록</strong>에서 원하는 텍스트를 체크하여 선택할 수 있습니다.<br/>
                                <span style={{color:'var(--bg-li-item)'}}>※ 입력한 코드가 정상적인 HTML 포맷이 아닐 시 번역 가능한 텍스트 추출이 어렵습니다.</span><br/>
                                <span style={{color:'var(--bg-li-item)'}}>※ 코드입력창에서 현재 커서의 줄과 열은 하단에 표시됩니다.</span><br/>
                                <span style={{color:'var(--bg-li-item)'}}>※ 번역대상 체크시 대상 텍스트가 HTML코드 어디에 위치하는지 알려줍니다.</span>
                            </div>
                        </div>
                        <div className='line'>
                            <div>6.</div>
                            <div>
                                우측 서브메뉴 <strong>API설정</strong>에서 번역 작업에 사용할 API를 선택합니다. 기본값으로 구글 무료 번역이 선택되어 있습니다.<br/>
                                <span style={{color:'var(--bg-li-item)'}}>※ 현재 버전 기준 구글 무료 번역만 사용 가능합니다.</span>
                            </div>
                        </div>
                        <div className='line'>
                            <div>7.</div>
                            <div>
                                우측 서브메뉴 <strong>언어설정</strong>에서 설정메뉴에서 만들어 둔 언어프리셋을 선택합니다.<br/>
                                <span style={{color:'var(--bg-li-item)'}}>※ HTML번역은 언어프리셋이 필수입니다.</span>
                            </div>
                        </div>
                        <div className='line'>
                            <div>8.</div>
                            <div>
                            <strong>번역대상</strong>, <strong>API설정</strong>, <strong>언어설정</strong>을 모두 완료 하시면 우측 서브메뉴 하단에 <strong>번역시작</strong> 버튼이 활성화 됩니다.<br/>
                            <strong>번역시작</strong> 버튼을 눌러 HTML파일 번역을 시작합니다.<br/>
                                <span style={{color:'var(--bg-li-item)'}}>※ 번역시작 버튼 비활성화시 마우스를 올려보면 비활성화 된 이유를 알려줍니다.</span>
                            </div>
                        </div>
                        <div className='line'>
                            <div>9.</div>
                            <div>
                                번역이 완료되면 코드편집 탭에서 <strong>번역결과</strong> 탭으로 이동 후 번역 결과를 보여줍니다.<br/>
                                번역 결과를 살펴보면 기존 HTML코드를 수정하여 번역대상으로 지정한 텍스트를 커스텀 태그로 감싼뒤 <strong>fetchLang</strong> 함수를 추가합니다.<br/>
                                사용자는 fetchLang 함수를 통해 번역대상으로 지정한 텍스트를 다양한 언어(선택한 프리셋의 번역언어 중 하나)로 변환시킬 수 있습니다.<br/>
                                <strong>
                                    <span style={{color:'var(--bg-li-item)'}}>※ fetchLang 함수 사용법 {'>> fetchLang(언어코드, 콜백함수);'}</span><br/>
                                </strong>
                                <span style={{color:'var(--bg-li-item)'}}>※ 언어코드는 가이드 우측 상단에 <strong>언어코드</strong> 버튼을 눌러 확인 가능합니다.</span><br/>
                                <span style={{color:'var(--bg-li-item)'}}>※ 스크립트는 BODY 태그 최하단에 추가 됩니다. 물론 수정은 자유</span>
                            </div>
                        </div>
                        <div className='line'>
                            <div>10.</div>
                            <div>
                                번역 결과를 확인하고 작업을 <strong>저장</strong>합니다.<br/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='item'>
                    <div className='title'>
                        실시간 번역
                    </div>
                    <div className='text'>
                        <div className='line'>
                            <div>1.</div>
                            <div>좌측 상단에서 <strong>기준 언어를 선택</strong>해주세요.</div>
                        </div>
                        <div className='line'>
                            <div>2.</div>
                            <div>우측 상단에서 <strong>번역 언어를 선택</strong>해주세요.</div>
                        </div>
                        <div className='line'>
                            <div>3.</div>
                            <div>좌측 하단에 번역을 원하시는 <strong>텍스트를 입력</strong>해주세요.</div>
                        </div>
                        <div className='line'>
                            <div>4.</div>
                            <div>입력 후 1초이내에 우측 하단에 번역 <strong>결과가 표시</strong> 됩니다.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Guide;