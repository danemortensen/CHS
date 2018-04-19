import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
// import react router
import { BrowserRouter } from 'react-router-dom';

// Our own components
import { App } from './components/index';

// Register service worker
import registerServiceWorker from './registerServiceWorker';
// Import global styles accross entire application
import 'bootstrap/dist/css/bootstrap.css'; // Bootstrap
// import 'bootstrap/dist/css/bootstrap-theme.css';
import './index.css'; // Our own main stylesheet

import store from './store';

const router = (
   <Provider store={store}>
      <BrowserRouter>
         <App/>
      </BrowserRouter>
   </Provider>
)

ReactDOM.render(router, document.getElementById('root'));
registerServiceWorker();
