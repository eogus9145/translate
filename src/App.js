import React, { useState, useEffect } from 'react';

import './css/app.css';
import './css/common.css';

import Titlebar from './components/Titlebar.js';
import Content from './components/Content.js';
import { StateProvider } from './StateContext.js';

const App = () => {
  return (
    <div id="container">
      <StateProvider>
        <Titlebar/>
        <Content/>
      </StateProvider>
    </div>
  );
}

export default App;
