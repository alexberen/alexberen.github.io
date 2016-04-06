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

		// calling function to generation HTML for in progress tasks
		generateInProgressHTML();
	})

	// Generating HTML for in progress tasks
	function generateInProgressHTML() {
		firebase.child('task').on('value', function(results) {
			var $inProgressTasks = ('#inProgressTasks'),
				values = results.val();

			// $inProgressTasks.empty();

			for(var key in values) {
				var task = values[key],
					$taskContainer = $('<div class="taskContainer"><h3 class="taskName">' + task.taskName + '</h3><p class="taskCategory">' + task.taskCategory + '</p><p class="taskDescription">' + task.taskDescription + '</p><button id="completeTaskButton">Complete Task</button</div>');

			$taskContainer.append($inProgressTasks);

			}
		})
	}

	setUserName();
	generateInProgressHTML();
})