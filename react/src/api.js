const baseURL = "http://localhost:3001/";
const headers = new Headers();
var cookie;

headers.set('Content-Type', 'application/json');

const reqConf = {
    headers: headers,
    credentials: 'include',
};

// Handle response with non-200 status by returning a Promise that rejects,
// with reason: array of one or more error strings suitable for display.
function createErrorPromise(response) {
   console.log('creating error promise');
   if (response.status < 500) {
      console.log('not a server error');
      return response.json()
       .then(errorList => Promise.reject(errorList.length ? errorList.map(
          err => errorTranslate(err.tag)
          + (err.params ? err.params.join(', ') : '')
       ) : ["Unknown error"]));
   }
   else
      return Promise.reject(["Unknown Error"]);
}

function fetchWrapper(url, req) {
   return fetch(url, req)
    .catch((error) => Promise.reject(['Server Connect Error']))
    .then((res) => res.ok ? res : createErrorPromise(res));
}

// Helper functions for the comon request types

/**
 * make a post request
 * @param {string} endpoint
 * @param {Object} body
 * @returns {Promise}
 */
export function post(endpoint, body) {
    return fetchWrapper(baseURL + endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
        ...reqConf
    });
}

/**
 * make a put request
 * @param {string} endpoint
 * @param {Object} body
 * @returns {Promise}
 */
export function put(endpoint, body) {
    return fetchWrapper(baseURL + endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
        ...reqConf
    })
}

/**
 * make a get request
 * @param {string} endpoint
 * @returns {Promise}
 */
export function get(endpoint) {
    return fetchWrapper(baseURL + endpoint, {
        method: 'GET',
        ...reqConf
    })
}

export function del(endpoint) {
    return fetchWrapper(baseURL + endpoint, {
        method: 'DELETE',
        ...reqConf
    })
}

// Functions for performing the api requests

/**
 * Sign a user into the service, returns the user data
 * @param {{user: string, password: string}} cred
 */
export function signIn(cred) {
   console.log("API signin with " + cred);
   return post("Ssns", cred)
      .then((response) => {
         let location = response.headers.get("Location").split('/');

         cookie = location[location.length - 1];
         console.log("Got session " + cookie);
         return get("Ssns/" + cookie)
      })
      .then(response => response.json())
      .then(rsp => get('Prss/' + rsp.prsId))
      .then(userResponse => userResponse.json())
      .then(rsp => rsp[0]);
}

/**
 * @returns {Promise} result of the sign out request
 */
export function signOut() {
    return del("Ssns/" + cookie);
}

/**
 * Register a user
 * @param {Object} user
 * @returns {Promise}
 */
export function register(user) {
    return post("Prss", user)
    .then(res => {
       return res.ok ? null : createErrorPromise(res);
   })
}

/**
 * @returns {Promise} json parsed data
 */
export function getCnvs() {
    return get("Cnvs").then((res) => res.json())
}

export function putCnv(id, body) {
    return put(`Cnvs/${id}`, body)
}

export function delCnv(id) {
    return del(`Cnvs/${id}`)
}

export function postCnv(body) {
   return post('Cnvs', body)
    .then((response) => {
       let location = response.headers.get("Location").split('/');
       let id = location[location.length - 1];

       return get('Cnvs/' + id);
    })
    .then((response) => response.json());
}

export function postMsg(cnvId, body) {
   return post(`Cnvs/${cnvId}/Msgs`, body)
    .then((res) => {
       let location = res.headers.get('Location').split('/');
       let id = location[location.length - 1];

       return get(`Msgs/${id}`)
    })
    .then((res) => res.json());
}

export function getMsgs(cnvId) {
   return get(`Cnvs/${cnvId}/Msgs`).then((res) => res.json());
}

const errMap = {
    en: {
        missingField: 'Field missing from request: ',
        badValue: 'Field has bad value: ',
        notFound: 'Entity not present in DB',
        badLogin: 'Email/password combination invalid',
        dupEmail: 'Email duplicates an existing email',
        noTerms: 'Acceptance of terms is required',
        forbiddenRole: 'Role specified is not permitted.',
        noOldPwd: 'Change of password requires an old password',
        oldPwdMismatch: 'Old password that was provided is incorrect.',
        dupTitle: 'Conversation title duplicates an existing one',
        dupEnrollment: 'Duplicate enrollment',
        forbiddenField: 'Field in body not allowed.',
        queryFailed: 'Query failed (server problem).',
        serverError: 'Server Connect Error'
    },
    es: {
        missingField: '[ES] Field missing from request: ',
        badValue: '[ES] Field has bad value: ',
        notFound: '[ES] Entity not present in DB',
        badLogin: '[ES] Email/password combination invalid',
        dupEmail: '[ES] Email duplicates an existing email',
        noTerms: '[ES] Acceptance of terms is required',
        forbiddenRole: '[ES] Role specified is not permitted.',
        noOldPwd: '[ES] Change of password requires an old password',
        oldPwdMismatch: '[ES] Old password that was provided is incorrect.',
        dupTitle: '[ES] Conversation title duplicates an existing one',
        dupEnrollment: '[ES] Duplicate enrollment',
        forbiddenField: '[ES] Field in body not allowed.',
        queryFailed: '[ES] Query failed (server problem).',
        serverError: '[ES] Server Connect Error'
    },
    swe: {
        missingField: 'Ett fält saknas: ',
        badValue: 'Fält har dåligt värde: ',
        notFound: 'Entitet saknas i DB',
        badLogin: 'Email/lösenord kombination ogilltig',
        dupEmail: 'Email duplicerar en existerande email',
        noTerms: 'Villkoren måste accepteras',
        forbiddenRole: 'Angiven roll förjuden',
        noOldPwd: 'Tidiagre lösenord krav för att updatera lösenordet',
        oldPwdMismatch: 'Tidigare lösenord felaktigt',
        dupTitle: 'Konversationstitel duplicerar tidigare existerande titel',
        dupEnrollment: 'Duplicerad inskrivning',
        forbiddenField: 'Förbjudet fält i meddelandekroppen',
        queryFailed: 'Förfrågan misslyckades (server problem).',
        serverError: '[SWE] Server Connect Error'
    }
}

/**
 * TODO perhaps should return a Promise to conform with the
 * rest of the api functions
 *
 * @param {string} errTag
 * @param {string} lang
 */
export function errorTranslate(errTag, lang = 'en') {
    return errMap[lang][errTag] || 'Unknown Error!';
}
