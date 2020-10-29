import React, { useEffect, useState } from 'react'

const Main = () => {
	const [error, setError] = useState('')
	const [loggedIn, setLoggedIn] = useState(false)
	const [loadingText, setLoadingText] = useState('')
	const [patientData, setPatientData] = useState(null)
	const [nextLinkUrlParams, setNextLinkUrlParams] = useState('')

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
	    setLoadingText('Please wait, logging in')
		callApi('/api/login')
			.then(res => {
				setLoadingText('')
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
	  		.then(res => {
	  			setLoadingText('')
	  			console.log('FIRST RESPONSE', res)
	  			setPatientData(res)
	  			getNextLink(res)
	  		})
	  		.catch(err => setError(err))
	  }

	  const handleNext = async (e) => {
 	    e.preventDefault();
 	    const response = await fetch('/api/next_page', {
 	      method: 'POST',
 	      headers: {
 	        'Content-Type': 'application/json',
 	      },
 	      body: JSON.stringify({ nextLinkUrlParams }),
 	    });
 	    const body = await response.text();
 	    const patientData = JSON.parse(body)
 	    console.log('PATIENT', patientData)
 	    setPatientData(patientData)
 	    getNextLink(patientData)
	  }

	  const renderPatientData = (data) => {
	  	return data.entry.map((info, index) => {

	  		return (
	  			<div key={index}>
	  				<h2>*******************************</h2>
	  				<div dangerouslySetInnerHTML={{__html: info.resource.text.div}} />
	  			</div>
	  		)
	  	})
	  }

	  const getNextLink = (data) => {
	  	let nextLink = ''
	  	if (data.link) {
	  		nextLink = data.link.find(info => info.relation === "next")
	  	}
	  	if (nextLink) {
	  		setNextLinkUrlParams(nextLink.url.split('?')[1])
	  	} else {
	  		setNextLinkUrlParams('')
	  	}

	  }

	 return (
	 	<div>
	 		{error ? 
	 			<h2>
	 				An error has occurred. Please try again later.
	 			</h2> 
	 			: 
	 			null
	 		}
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
        	{patientData && (
        		<div>
        			{renderPatientData(patientData)}
        			<button>back</button>
        			{nextLinkUrlParams ? <button onClick={handleNext}>next</button> : null}
        		</div>
        		)}
	 	</div>
	 )
}


export default Main
