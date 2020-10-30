const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

// constants
const LOGIN_URL = "https://api.1up.health/user-management/v1/user/auth-code";
const ACCESS_TOKEN_URL = "https://api.1up.health/fhir/oauth2/token";
const GET_PATIENT_INFO_URL = "https://api.1up.health/fhir/dstu2/patient";
const PATIENT_EVERYTHING_QUERY_URL = "https://api.1up.health/fhir/dstu2/Patient/e467f71f186f/$everything"
const CLIENT_ID = "adc1dad4ad214d7d9976701218da5294";
const CLIENT_SECRET = "HWGIynRWdcwPkq3Ht14YZhymqNcsCbh4";
const APP_USER_ID = "carlys_health_app";
const PATIENT_ID = "e467f71f186f";

// retrieved upon login
let ACCESS_CODE;
let ACCESS_TOKEN;
let ENTRY_TOTAL;

// counters to track the number of entries to be skipped
let NEXT_COUNTER = 0;
let BACK_COUNTER = 0;

const updateCounters = (action) => {
	// track the number of entries to skip, starting at 0
	// the back counter should always skip 10 fewer entries than the current page displays.
	// if the action is 'next', the next counter has already been incremented, so the back counter will be trailing behind by 20 entries.

	// for example, if a user clicks 'next' on page 3 of all the entries, the current NEXT_COUNTER value would be 30.
	// first that value is incremented to 40, then we do checks to be sure the counter stays within a reasonable range.
	// the back counter is dependent on the next counter; the BACK_COUNTER then trails 10 behind the NEXT_COUNTER, so the BACK_COUNTER is at 30 .

	// so, if the next time the user clicks 'back', the BACK_COUNTER will be at 30, and the FRONT_COUNTER at 40. 
	// the checks are performed, and the NEXT_COUNTER is decremented last, to 30.
	// this is because if the user clicks 'back' again, the NEXT_COUNTER will remain at 30, and the BACK_COUNTER will decrement to 20.

	// if the user clicks next, we want to skip the 10 previous entries
	if (action == 'next') {
		NEXT_COUNTER += 10
	}

	// check to ensure the next counter does not fall below zero
	if (NEXT_COUNTER < 0) {
		NEXT_COUNTER = 0
	}

	// ensure next counter does not exceed the total number of entries 
	if (NEXT_COUNTER > (Math.floor(ENTRY_TOTAL / 10) * 10)) {
		NEXT_COUNTER = 200
	}

	// back_counter is dependent on the next counter
	if (NEXT_COUNTER <= 10) {
		BACK_COUNTER = 0
	} else {
		BACK_COUNTER = NEXT_COUNTER - 10
	}

	// if the user clicks back, decrement the next_counter
	if (action == "back" && NEXT_COUNTER != 0) {
		NEXT_COUNTER -= 10
	}
}

const getUrlWithQueryParams = (action) => {
	// build url based on next number of entries to skip
	let apiUrl = '?_skip=';
	let queryParams;
	updateCounters(action)
	if (action == 'next') {
		NEXT_COUNTER ? queryParams = NEXT_COUNTER.toString() : queryParams = ''
	} else {
		BACK_COUNTER ? queryParams = BACK_COUNTER.toString() : queryParams = ''
	}
	return queryParams ? new URL(apiUrl + queryParams, PATIENT_EVERYTHING_QUERY_URL) : PATIENT_EVERYTHING_QUERY_URL
}

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.get('/api/login', (req, res) => {
  // retrieve the access code
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
  // retrieve the access token
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
  // retrieve the patient data
  const headers = {
  	"Accept": "*/*",
  	"Authorization": `Bearer ${ACCESS_TOKEN}`
  }
  fetch(PATIENT_EVERYTHING_QUERY_URL, { method: 'GET', headers })
	  .then((response) => {
	      return response.json()
		})
		.then((json) => {
			ENTRY_TOTAL = json.total
	        res.send(json);
		})
		.catch(err => console.log(err))
});

app.post('/api/next_page', (req, res) => {
	// retrieve patient data on next or previous page
	 const headers = {
	  	"Accept": "*/*",
	  	"Authorization": `Bearer ${ACCESS_TOKEN}`
	  }
	  const url = getUrlWithQueryParams(req.body.action)
		  fetch(url, { method: 'GET', headers })
		  .then((response) => {
		      return response.json()
			})
			.then((json) => {
		        res.send(json);
			})
			.catch(err => console.log(err))
});

app.listen(port, () => console.log(`Listening on port ${port}`));