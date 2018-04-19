import * as api from '../api';

export function signIn(credentials, cb) {
   console.log("signIn action creator");
   return (dispatch, prevState) => {
      api.signIn(credentials)
       .then((userInfo) => dispatch({ user: userInfo, type: "SIGN_IN" }))
       .then(() => {if (cb) cb();})
       .catch((error) => {
          dispatch({type: 'LOGIN_ERR', details: error});
       });
      // setTimeout(() => dispatch({user: credentials, type: "SIGN_IN"}), 2000);
   };
}

export function register(data, cb) {
   console.log("register action creator");
   return (dispatch, prevState) => {
      api.register(data)
       .then(() => {if (cb) cb();})
       .catch(error => {
          console.log("Registration error" + error);
          dispatch({type: 'REGISTER_ERR', details: error});
       });
   };
}


export function signOut(cb) {
   return (dispatch, prevState) => {
      api.signOut()
       .then(() => dispatch({ type: 'SIGN_OUT' }))
       .then(() => {if (cb) cb();})
       .catch((err) => {
          console.log("Sign out error!");
          dispatch({type: "LOGOUT_ERR", err});
       });
   };
}

export function postError(type, details, cb) {
   return (dispatch, prevState) => {
      dispatch({type, details});
      if (cb)
         cb();
   };
}

export function clearErrors(cb) {
   return (dispatch, prevState) => {
      dispatch({type: "CLEAR_ERRS"});
      if (cb)
         cb();
   };
}

export function postCnvs(body, cb) {
   console.log('POST CONVERSATION action creator');
   return (dispatch, prevState) => {
      api.postCnv(body)
       .then((Cnvs) => dispatch({
          type: 'NEW_CNVS',
          Cnvs: Cnvs
       }))
       .then(() => {if (cb) cb();})
       .catch((error) => {
          console.log('Error posting conversation');
          dispatch({ type: 'POST_CNVS_ERR', details: error });
       });
   }
}

export function getCnvs(cb) {
   return (dispatch, prevState) => {
      api.getCnvs()
       .then((Cnvs) => dispatch({ type: 'GET_ALL', Cnvs: Cnvs }))
       .then(() => {if (cb) cb();})
       .catch((error) => {
          console.log('Error getting conversations');
          dispatch({ type: 'GET_CNV_ERR', details: error });
       });
   };
}

export function editCnv(id, body, cb) {
   return (dispatch, prevState) => {
      api.putCnv(id, body)
       .then((Cnv) => dispatch({
          type: 'UPDATE_CNV',
          id: id,
          title: body.title
       }))
       .then(() => {if (cb) cb();})
       .catch((error) => {
          console.log('Error editing conversation');
          dispatch({ type: 'EDIT_CNV_ERR', details: error });
       });
   }
}

export function deleteCnv(id, cb) {
   return (dispatch, prevState) => {
      api.delCnv(id)
       .then((Cnv) => dispatch({
          type: 'DELETE_CNV',
          id: id
       }))
       .then(() => {if (cb) cb();})
       .catch((error) => {
          console.log('Error deleting conversation');
          dispatch({ type: 'DELETE_CNV_ERR', details: error });
       });
   }
}

export function postMsg(cnvId, body, cb) {
   console.log('creating action for POST MSG');
   return (dispatch, prevState) => {
      api.postMsg(cnvId, body)
       .then((Msgs) => {
          console.log('dispatching for ' + JSON.stringify(Msgs));
          dispatch({
             type: 'NEW_MSG',
             Msgs: Msgs
          });
       })
       .then(() => {
          console.log('checking for callback');
          if (cb) cb();
       })
       .catch((error) => {
          console.log('Error posting message' + error);
          dispatch({ type: 'POST_MSG_ERR', details: error });
       });
   }
}

export function getMsgs(cnvId, cb) {
   console.log('creating action for GET MSGS');
   return (dispatch, prevState) => {
      api.getMsgs(cnvId)
       .then((Msgs) => dispatch({
          type: 'GET_MSGS',
          Msgs: Msgs
       }))
       .then(() => {
          if (cb) cb();
       })
       .catch((error) => {
          console.log('Error getting messages');
          dispatch({ type: 'GET_MSGS_ERR', details: error });
       });
   }
}