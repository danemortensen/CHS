import { combineReducers } from 'redux';
// import { routerReducer } from 'react-router-redux';

import Prss from './Prss';
import Errs from './Errs';
import Cnvs from './Cnvs';
import Msgs from './Msgs';

const rootReducer = combineReducers({Prss, Errs, Cnvs, Msgs});

export default rootReducer;
