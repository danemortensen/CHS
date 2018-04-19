export default function Cnvs(state = [], action) {
   let updated = [];

   console.log('Cnvs reducing action ' + action.type);
   switch (action.type) {
      case 'NEW_CNVS':
         return state.concat(action.Cnvs);
      case 'GET_ALL':
         return action.Cnvs.sort(function(a, b) {
            let dateA = a.lastMessage;
            let dateB = b.lastMessage;

            if (dateA < dateB) {
               return 1;
            }
            else if (dateB < dateA) {
               return -1;
            }
            else {
               return 0;
            }
         });
      case 'UPDATE_CNV':
         updated = state.filter((cnv) => {
            if (cnv.id === action.id) {
               cnv['title'] = action.title;
            }
            return cnv;
         });
         return updated;
      case 'DELETE_CNV':
         updated = state.filter((cnv) => cnv.id !== action.id);
         return updated;
      case 'SIGN_OUT':
         return [];
      default:
         return state;
   }
}
