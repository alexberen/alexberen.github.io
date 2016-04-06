$(document).ready(function() {
	// integrate Firebase
	var firebase = new Firebase('https://taskstodo.firebaseio.com');

	// Caching global variables
	var $addTaskForm = $('#addTaskForm');

	// Setting name to display in title
	function setUserName() {
		var $userName = $('#userName');
		var title = prompt("What's your name?") + "'s TasksToDo";
		$userName.text(title);
	}

	// Creating tasks
	$addTaskForm.submit(function(e) {
		e.preventDefault(e);

		// Variables in this function's scope
		var $taskName = $('#taskName'),
			$taskDescription = $('#taskDescription');
			$taskCategory = $('#taskCategory');

		// Create 'task' object in Firebase
		firebase.child('task').push({
			taskName: $taskName.val(),
			taskDescription: $taskDescription.val(),
			taskCategory: $taskCategory.val()
		})
	})

	setUserName();
})