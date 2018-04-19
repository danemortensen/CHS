export default function Msgs(state=[], action) {
	console.log('Msgs reducing action ' + action.type);
	switch (action.type) {
		case 'NEW_MSG':
			console.log('STATE FROM REDUCER ' + JSON.stringify(state));
			console.log('action.Msgs: ' + JSON.stringify(action.Msgs));
			return state.concat(action.Msgs);
		case 'GET_MSGS':
			return action.Msgs;
		default:
			return state;
	}
}