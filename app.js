$(document).ready(function() {
	// integrate Firebase
	var firebase = new Firebase('https://taskstodo.firebaseio.com');

	// Caching global variables
	var $addTaskForm = $('#addTaskForm');

	// Setting name to display in title
	function setUserName() {
		var $userName = $('#userName');
		var title = prompt("What's your name?") + "'s TasksToDo";
		$userName.html(title);
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
			status: 'In Progress',
			taskName: $taskName.val(),
			taskDescription: $taskDescription.val(),
			taskCategory: $taskCategory.val()
		})

		// calling function to generation HTML for in progress tasks
		generateInProgressHTML();
		
		// clear form fields
		$taskName.val('');
		$taskDescription.val('');
		$taskCategory.val('');
	})

	// Generating HTML for in progress tasks
	function generateInProgressHTML() {
		firebase.child('task').on('value', function(results) {
			var $inProgressTasks = $('#inProgressTasks'),
				$completedTasks = $('#completedTasks'),
				values = results.val();

			$inProgressTasks.empty();

			for(var key in values) {
				var task = values[key],
					$completeButton = $('<button class="completeTaskButton">Complete Task</button>'),
					$taskContainer = $('<div data-id="' + key + '" class="taskContainer"><h3 class="taskName">' + task.taskName + '</h3><p class="taskCategory">' + task.taskCategory + '</p><p class="taskDescription">' + task.taskDescription + '</p></div>'),
					taskID = $(this).data('id'),
					taskReference = firebase.child('task').child(taskID);

				$taskContainer.append($completeButton);

				// Completing tasks
				$completeButton.on('click', function(e) {

					// var taskID = $(this).data('id'),
					// 	taskReference = firebase.child('task').child(taskID);

					// taskReference.update({
					// 	status: 'Complete'
					// })
					console.log("you clicked da button");

					// generateInProgressHTML();

				})

				$taskContainer.appendTo($inProgressTasks);

			}

		})

	}

	// functions to call when the document is ready
	setUserName();
	generateInProgressHTML();
})