$.ready(isRedirectedURI());

function isRedirectedURI() {
	var uriHash = window.location.hash;
	var $signInView = $('#sign-in-view');
	var $resultsView = $('#results-view');
	var $imagesDiv = $('.images');

	if(uriHash.length > 0) {
		$signInView.hide();
		$resultsView.show();

		var accessToken = uriHash.replace('#access_token=', '');

		var instagramEndpoint = 'https://api.instagram.com/v1/tags/search?q=doctorwho&access_token=' + accessToken + 'scope=public_content';

			$.ajax({
				url: instagramEndpoint,
				method: 'GET',
				dataType: 'jsonp',
				success: function(response) {
					console.log(response);
					var data = response.data;
					console.log(data);

					// data.forEach(function(photo){
					// 	var url = photo.images.thumbnail.url;
					// 	var $imageEl = $('<img src="' + url + '" />');

					// 	$imagesDiv.append($imageEl);
					// })
				}
			})

	} else {
		$signInView.show();
		$resultsView.hide();
	}
}


// navigator.geolocation.getCurrentPosition(function(position){
// 	var lat = position.coords.latitude;
// 	var long = position.coords.longitude;
// });