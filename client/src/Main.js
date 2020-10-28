import React, { useEffect, useState } from 'react'

const Main = () => {
	// const [response, setResponse] = useState('')
	const [post, setPost] = useState('')
	const [responseToPost, setResponseToPost] = useState('')
	const [error, setError] = useState('')

	useEffect(() => {
		callApi('/api/hello')
		.then(res => console.log(res.express))
      	.catch(err => console.log(err))
	}, [])

	const callApi = async (url) => {
	    const response = await fetch(url);
	    console.log('RESPONSE????', response)
	    const body = await response.json();
	    if (response.status !== 200) throw Error(body.message);
	    console.log('BODY', body)
	    return body;
	  };

	const handleSubmit = async e => {
	    e.preventDefault();
		callApi('/api/login')
			.then(res => console.log(res))
	      	.catch(err => console.log(err))
	    
	    // return body;
	    // const response = await fetch('/api/login', {
	    //   method: 'POST',
	    //   headers: {
	    //     'Content-Type': 'application/json',
	    //   },
	    // });
	    // const body = await response.text();
	  };

	 return (
	 	<div>
	        <form onSubmit={handleSubmit}>
	          <p>
	            <strong>Welcome! Login to view patient info</strong>
	          </p>
	      
	          <button type="submit">LOGIN</button>
	        </form>
        <p>{responseToPost}</p>
	 	</div>
	 )
}


export default Main
