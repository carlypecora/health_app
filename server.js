const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const LOGIN_URL = "https://api.1up.health/user-management/v1/user/auth-code";
const ACCESS_TOKEN_URL = "https://api.1up.health/fhir/oauth2/token";
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
		ACCESS_CODE = json.code
        res.send(json.success);
	})
	.catch(err => console.log(err))
});

app.get('/api/access_token', (req, res) => {
  const body = JSON.stringify({
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET,
    "code": ACCESS_CODE,
    "grant_type": "authorization_code"
})
  const headers = {
  	"Accept": "application/json",
    "Content-Type": "application/json"
  }
  fetch(ACCESS_TOKEN_URL, { method: 'POST', headers, body })
    .then((response) => {
      return response.json()
	})
	.then((json) => {
		ACCESS_TOKEN = json.access_token
        res.send({ success: true });
	})
	.catch(err => console.log(err))
})

app.get('/api/patient_data', (req, res) => {
  const headers = {
  	"Accept": "*/*",
  	"Authorization": `Bearer ${ACCESS_TOKEN}`
  }
  fetch(PATIENT_EVERYTHING_QUERY_URL, { method: 'GET', headers })
	  .then((response) => {
	      return response.json()
		})
		.then((json) => {
	        res.send(json);
		})
		.catch(err => console.log(err))
});

app.post('/api/next_page', (req, res) => {
	 const headers = {
	  	"Accept": "*/*",
	  	"Authorization": `Bearer ${ACCESS_TOKEN}`
	  }
		  fetch(new URL('?' + req.body.nextLinkUrlParams, PATIENT_EVERYTHING_QUERY_URL), { method: 'GET', headers })
		  .then((response) => {
		      return response.json()
			})
			.then((json) => {
				console.log('JSON', json)
		        res.send(json);
			})
			.catch(err => console.log(err))
});

app.listen(port, () => console.log(`Listening on port ${port}`));