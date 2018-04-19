export default function Errs(state = [], action) {
   console.log("Errs reducing action " + action.type);
   switch(action.type) {
   case 'LOGIN_ERR':
   case 'LOGOUT_ERR':
   case 'POST_CNVS_ERR':
   case 'GET_CNV_ERR':
   case 'EDIT_CNV_ERR':
   case 'DELETE_CNV_ERR':
   case 'POST_MSG_ERR':
   case 'GET_MSGS_ERR':
   case 'REGISTER_ERR':
      return state.concat(action.details);
   case 'CLEAR_ERRS':
      return [];
   default:
      return state;
   }
}
