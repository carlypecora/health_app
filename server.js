const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const LOGIN_URL = "https://api.1up.health/user-management/v1/user/auth-code";
const GET_ACCESS_TOKEN_URL = "https://api.1up.health/fhir/oauth2/token";
const GET_PATIENT_INFO_URL = "https://api.1up.health/fhir/dstu2/patient";
const PATIENT_EVERYTHING_QUERY_URL = "https://api.1up.health/fhir/dstu2/Patient/e467f71f186f/$everything"
const CLIENT_ID = "adc1dad4ad214d7d9976701218da5294";
const CLIENT_SECRET = "HWGIynRWdcwPkq3Ht14YZhymqNcsCbh4";
const APP_USER_ID = "carlys_health_app";
const PATIENT_ID = "e467f71f186f";

let ACCESS_CODE;
let ACCESS_TOKEN;

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.get('/api/login', (req, res) => {
  const body = JSON.stringify({
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET,
    "app_user_id": APP_USER_ID
})
  const headers = {
  	"Accept": "application/json",
    "Content-Type": "application/json"
  }
  fetch(LOGIN_URL, { method: 'POST', headers, body })
    .then((response) => {
      return response.json()
	})
	.then((json) => {
		console.log('JSON', json)
		ACCESS_CODE = json.code
        res.send(json.success);
	})
	.catch(err => console.log(err))
});


// const url ='https://example.com';
// const headers = {
//   "Content-Type": "application/json",
//   "client_id": "1001125",
//   "client_secret": "876JHG76UKFJYGVHf867rFUTFGHCJ8JHV"
// }
// const data = {
//   "name": "Wade Wilson",
//   "occupation": "Murderer",
//   "age": "30 (forever)"
// }

// fetch(url, { method: 'POST', headers: headers, body: data})
//   .then((res) => {
//      return res.json()
// })
// .then((json) => {
//    // Do something with the returned data.
//   console.log(json);
  
// });

app.listen(port, () => console.log(`Listening on port ${port}`));