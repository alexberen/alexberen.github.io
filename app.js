// var source   = $('#post').html(),
// 		template = Handlebars.compile(source),
		var $subreddit = $('#subreddit');
// 		$content = $('#content'),
// 		$filterButtons = $('#filterButtons'),
// 		$100 = $('#100'),
// 		$200 = $('#200'),
// 		$300 = $('#300'),
// 		cachedData;

// $filterButtons.hide();

$subreddit.on('keyup', function(e) {
	if(e.keyCode === 13) {
		// $content.empty();

		var redditEndpoint = 'https://api.imgflip.com/get_memes';

		$.ajax({
			url: redditEndpoint,
			method: 'GET',
			dataType: 'json',
			success: function(response) {
				console.log(response.data);

				// printResults(0);
			}
		})
		// $filterButtons.show();
	}
})

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









