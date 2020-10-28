import React, { useEffect, useState } from 'react'

const Main = () => {
	const [error, setError] = useState('')
	const [loggedIn, setLoggedIn] = useState(false)
	const [loadingText, setLoadingText] = useState(null)

	useEffect(() => {
		callApi('/api/hello')
			.then(res => console.log(res.express))
	  		.catch(err => setError(err))
	}, [])

	const callApi = async (url) => {
	    const response = await fetch(url);
	    const body = await response.json();
	    if (response.status !== 200) throw Error(body.message);
	    return body;
	  };

	const handleLoginSubmit = async e => {
	    e.preventDefault();
		callApi('/api/login')
			.then(res => {
				if (!res) {
					setError(true)
					return
				}
				setLoggedIn(true)
			})
	      	.catch(err => setError(err))
	  };

	  const handlePatientSubmit = async e => {
	  	e.preventDefault();
	  	setLoadingText('Please wait, loading access token')
	  	callApi('/api/access_token')
	  		.then(res => {
	  			setLoadingText('Access Token retrieved. Loading Patient Data')
	  			getPatientData()
	  		})
	  		.catch(err => setError(err))
	  }

	  const getPatientData = async () => {
	  	callApi('/api/patient_data')
	  		.then(res => console.log('RES!!!', res))
	  		.catch(err => setError(err))
	  }

	 return (
	 	<div>
	 		{error ? <h2>An error has occurred. Please try again later.</h2> : null}
	        {loggedIn ? 
	        	<form onSubmit={handlePatientSubmit}>
	        	  <strong>You are logged in. Please click to view patient info for Wilma Smart</strong> 
	        	  <button type="submit">View Patient info</button>
	        	</form>
	        	:
		        <form onSubmit={handleLoginSubmit}>
		          <p>
		            <strong>Welcome! Login to view patient info</strong>
		          </p>
		      
		          <button type="submit">LOGIN</button>
		        </form>
		    }
        <p>{loadingText}</p>
	 	</div>
	 )
}


export default Main
