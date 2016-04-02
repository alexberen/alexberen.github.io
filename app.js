$(document).ready(function() {
 	// Logging into Facebook

	// This is called with the results from from FB.getLoginStatus().
 	function statusChangeCallback(response) {
		console.log('statusChangeCallback');
		console.log(response);

		if (response.status === 'connected') {
			// Logged into your app and Facebook.
			testAPI();
			} else if (response.status === 'not_authorized') {
				// The person is logged into Facebook, but not DW News.
				document.getElementById('status').innerHTML = 'Please log ' + 'into this app.';
			} else {
				// The person is not logged into Facebook, so we're not sure if
				// they are logged into DW News or not.
				document.getElementById('status').innerHTML = 'Please log ' + 'into Facebook.';
			}
	}

	// This function is called when someone finishes with the Login Button.
	function checkLoginState() {
		FB.getLoginStatus(function(response) {
			statusChangeCallback(response);
		});
	}

	window.fbAsyncInit = function() {
		FB.init({
			appId      : '{1044352888957826}',
			cookie     : true,  // enable cookies to allow the server to access 
								// the session
			xfbml      : true,  // parse social plugins on this page
			version    : 'v2.5' // use graph api version 2.5
		});

		// Call FB.getLoginStatus(). Get the state of the person visiting DW News and can return one of three states to
		// the callback.

		FB.getLoginStatus(function(response) {
			statusChangeCallback(response);
		});
	};

	// Load the SDK asynchronously
	(function(d, s, id) {
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) return;
		js = d.createElement(s); js.id = id;
		js.src = "//connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));

	// Here we run a very simple test of the Graph API after login is
	// successful. See statusChangeCallback() for when this call is made.
	function testAPI() {
		console.log('Welcome!  Fetching your information.... ');
		FB.api('/me', function(response) {
			console.log('Successful login for: ' + response.name);
			document.getElementById('status').innerHTML = 'Thanks for logging in, ' + response.name + '!';
		});
	}
})

// $subreddit.on('keyup', function(e) {
// 	if(e.keyCode === 13) {
// 		// $content.empty();

// 		var redditEndpoint = 'https://api.imgflip.com/get_memes';

// 		$.ajax({
// 			url: redditEndpoint,
// 			method: 'GET',
// 			dataType: 'json',
// 			success: function(response) {
// 				console.log(response.data);
// 			}
// 		})
// 	}
// })

// function printResults(score) {
// 	var karma = score;

// 	cachedData.children.forEach(function(post, karma){
// 		if(parseInt(post.data.score) > karma) {
// 			var title = post.data.title,
// 					url = post.data.url,
// 					author = post.data.author,
// 					score = post.data.score;
			
// 			var context = {title: title, url: url, author: author, score: score};
			
// 			var html = template(context);
			
// 			$content.append(html);
// 		}
// 	})
// }

// $100.on('click', function(e) {
// 	e.preventDefault();

// 	printResults(100);
// })

// $200.on('click', function(e) {
// 	e.preventDefault();

// 	printResults(200);
// })

// $300.on('click', function(e) {
// 	e.preventDefault();

// 	printResults(300);
// })









