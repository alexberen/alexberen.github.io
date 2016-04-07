$(document).ready(function() {
	// integrate Firebase
	var firebase = new Firebase('https://taskstodo.firebaseio.com');

	// Caching global variables
	var $addTaskForm = $('#addTaskForm');

	// Setting name to display in title

	// Sorting tasks and using handlebars to generate html
	function sortTasks() {
		firebase.child('task').once('value', function(snapshot) {
			snapshot.forEach(function(childSnapshot) {
				var key = childSnapshot.key();
				console.log(key);
				var childData = childSnapshot.val();
				console.log(childData.status);
			});
		});
	}
	sortTasks();

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
					$taskContainer = $('<div data-id="' + key + '" class="taskContainer"><h3 class="taskName">' + task.taskName + '</h3><p class="taskCategory">' + task.taskCategory + '</p><p class="taskDescription">' + task.taskDescription + '</p></div>');

				$taskContainer.append($completeButton);

				// Completing tasks
				$completeButton.on('click', function(e) {
					var taskID = $taskContainer.data('id'),
						taskReference = firebase.child('task').child(taskID);

					taskReference.update({
						status: 'Complete'
					})

				})

				$taskContainer.appendTo($inProgressTasks);

				firebase.orderByChild('status').on('value', function(results) {
					
				})

			}
		})

	}

	// functions to call when the document is ready
	// generateInProgressHTML();
})