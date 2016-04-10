$(document).ready(function() {
	// integrate Firebase
	var firebase = new Firebase('https://taskstodo.firebaseio.com');

	// Caching global variables
	var $addTaskForm = $('#addTaskForm'),
		$userName = $('#userName'),
		$inProgressTasks = $('#inProgressTasks'),
		$completedTasks = $('#completedTasks'),
		$loggedInView = $('#loggedInView'),
		$loggingIn = $('#loggingIn'),
		$logInButton = $('#logInButton'),
		$logOut = $('#logOut'),
		$showCompletedChevron = $('#showCompletedChevron'),
		$createNewTask = $('#createNewTask'),
		$addTaskFormModal = $('#addTaskFormModal'),
		$formContent = $addTaskFormModal.detach(),
		$deleteTaskConfirmationModal = $('#deleteTaskConfirmationModal'),
		$deleteConfirmationContent = $deleteTaskConfirmationModal.detach(),
		$editTaskModal = $('#editTaskModal'),
		$editTaskContent = $editTaskModal.detach(),
		$editTaskForm = $('#editTaskForm')
		authData = firebase.getAuth();

	// Handlebars variables
	var source = $('#tasktodo').html(),
		template = Handlebars.compile(source),
		sourceCompleted = $('#taskdone').html(),
		templateCompleted = Handlebars.compile(sourceCompleted);

	// Hide the logged in vew and complated tasks and check if user is logged in.
	// If yes, hides login screen and shows logged in view
	$loggedInView.hide();
	$completedTasks.hide();
	
	function isAuthenicated() {
		if(authData) {
			var uid = authData.uid;

			$loggedInView.show();
			$userName.text(authData.google.displayName);
			$loggingIn.hide();
			getInProgressTasks();
		}
		return uid;
	}
	isAuthenicated();

	// Event Listener for logging in with Google
	$logInButton.on('click', function(e) {
		e.preventDefault();

		firebase.authWithOAuthPopup('google', function(error, authData) {
			if (error) {
				console.log("Login Failed!", error);
			} else {
				// console.log("Authenticated successfully with payload:", authData);

				// Stores user in Firebase if they're new
				var uid = authData.uid,
					doesUserExist = firebase.child('users').child(uid).child('task');
				firebase.onAuth(function(authData) {
					if (doesUserExist == null) {
						firebase.child('users').child(authData.uid).set({
							name: authData.google.displayName
						});
					}
				});
				$loggedInView.show();
				$userName.text(authData.google.displayName);
				$loggingIn.hide();
				getInProgressTasks();

				return uid;
			}
		});
	})

	// Event Listener for logging out
	$logOut.on('click', function(e) {
		e.preventDefault();

		$loggedInView.hide();
		$loggingIn.show();
		$inProgressTasks.empty();
		$completedTasks.empty();
		firebase.unauth();
	})

	// Getting in progress tasks
	function getInProgressTasks() {
		$inProgressTasks.empty();

		var uid = firebase.getAuth().uid;

		firebase.child('users').child(uid).child('task').on('value', function(snapshot) {
			snapshot.forEach(function(childSnapshot) {
				var childData = childSnapshot.val();

				if(childData.status == 'In Progress') {
					var context = {
						taskName: childData.taskName,
						taskCategory: childData.taskCategory,
						taskDescription: childData.taskDescription,
						taskID: childData.taskID
					};
					var html = template(context);
					$inProgressTasks.append(html);
				}			
			})
		})
	}

	// Getting completed tasks
	function getCompletedTasks() {
		$completedTasks.empty();

		var uid = firebase.getAuth().uid;

		firebase.child('users').child(uid).child('task').on('value', function(snapshot) {
			snapshot.forEach(function(childSnapshot) {
				var childData = childSnapshot.val();

				if(childData.status == 'Complete') {
					var context = {
						completedName: childData.taskName,
						completedCategory: childData.taskCategory,
						completedDescription: childData.taskDescription,
						taskID: childData.taskID
					};
					var html = templateCompleted(context);
					$completedTasks.append(html);
				}
			})
		})
	}

	// Event listener for showing/hiding completed tasks
	$showCompletedChevron.on('click', function(e) {

		if($showCompletedChevron.hasClass('fa-rotate-90')) {
			$showCompletedChevron.toggleClass('fa-rotate-90');
			$completedTasks.hide();
							
		} else {
			$showCompletedChevron.toggleClass('fa-rotate-90');
			getCompletedTasks();
			$completedTasks.show();
		}

	})

	// Modal Setup
	var modal = (function() {
		var $window = $(window),
			$modal = $('<div class="modal"></div>'),
			$content = $('<div class="modal-content"></div>'),
			$close = $('<button role="button" class="modal-close">X</button>');
			
		$modal.append($content, $close);

		$close.on('click', function(e) {
			e.preventDefault();

			modal.close();
		})

		return {
			center: function() {
				var top = Math.max($window.height() - $modal.outerHeight(), 0) / 2,
					left = Math.max($window.width() - $modal.outerWidth(), 0) / 2;
				$modal.css({
					top: top + $window.scrollTop(),
					left: left + $window.scrollLeft()
				});
			},
			open: function(settings) {
				$content.empty().append(settings.content);
				$modal.css({
					width: settings.width || 'auto',
					height: settings.height || 'auto'
				}).appendTo('body');

				modal.center();
				$(window).on('resize', modal.center);
			},
			close: function() {
				$content.empty();
				$modal.detach();
				$(window).off('resize', modal.center);
			}
		};
	}());

	// Initializing Modal for adding new tasks
	$('#createNewTask').on('click', function(e) {
		modal.open({
			content: $formContent
		});
	});
	
	// Creating tasks
	$addTaskForm.submit(function(e) {
		e.preventDefault(e);

		// Variables in this function's scope
		var $taskName = $('#taskName'),
			$taskDescription = $('#taskDescription'),
			$taskCategory = $('#taskCategory'),
			uid = firebase.getAuth().uid,
			taskRef = firebase.child('users').child(uid).child('task');

		// Requiring a title
		if($taskName.val('')) {
			alert('You must give this task a name');
		} else {
			// Checking for empty category
			var checkTaskCategory;
			if($taskCategory.val('')) {
				checkTaskCategory = 'uncategorized'
			} else {
				checkTaskCategory = $taskCategory.val()
			}

			// Create 'task' object in Firebase
			var newTaskRef = taskRef.push({
				status: 'In Progress',
				taskName: $taskName.val(),
				taskDescription: $taskDescription.val(),
				taskCategory: checkTaskCategory
			});
			var taskID = newTaskRef.key();
			newTaskRef.update({
				taskID: taskID
			});

			// get in progress tasks
			getInProgressTasks();
			
			// clear form fields and close modal
			$taskName.val('').blur();
			$taskDescription.val('');
			$taskCategory.val('').blur();
			modal.close();			
		}
	})

	// Event listener for completing tasks
	$inProgressTasks.on('click', 'button.completeTask', function(e) {
		var uid = firebase.getAuth().uid,
			thisTaskID = $(this).data('id'),
			thisTaskRef = firebase.child('users').child(uid).child('task');
		
		thisTaskRef.child(thisTaskID).update({
			status: 'Complete'
		});

		getInProgressTasks();

		if($showCompletedChevron.hasClass('fa-rotate-90')) {
			getCompletedTasks();
		}
	})

	// Event listener for seting completed tasks back to in progress
	$completedTasks.on('click', 'button', function(e) {
		var uid = firebase.getAuth().uid,
			thisTaskID = $(this).data('completion'),
			thisTaskRef = firebase.child('users').child(uid).child('task');
		
		thisTaskRef.child(thisTaskID).update({
			status: 'In Progress'
		});

		getInProgressTasks();
		getCompletedTasks();
	})

	//Event listeners for deleting tasks
	$completedTasks.on('click', 'a', function(e) {
		e.preventDefault();

		var uid = firebase.getAuth().uid,
			thisTaskID = $(this).data('deletion'),
			thisTaskRef = firebase.child('users').child(uid).child('task');

		deleteTasks(thisTaskID, thisTaskRef);
	});

	$inProgressTasks.on('click', 'a', function(e) {
		e.preventDefault();

		var uid = firebase.getAuth().uid,
			thisTaskID = $(this).data('deletion'),
			thisTaskRef = firebase.child('users').child(uid).child('task');

		deleteTasks(thisTaskID, thisTaskRef);
	});

	// Delete tasks function
	function deleteTasks(thisTaskID, thisTaskRef) {
		modal.open({
			content: $deleteConfirmationContent
		})

		$('#deleteTask').on('click', function(e) {
			thisTaskRef.child(thisTaskID).remove();
			getInProgressTasks();
			getCompletedTasks();
			modal.close();
		})

		$('#keepTask').on('click', function(e) {
			modal.close();
		})
	}

	// Initialilzing modal for editing in progress tasks
	$inProgressTasks.on('click', 'button.editTask', function(e) {
		modal.open({
			content: $editTaskContent
		})

		var $newName = $('#newName'),
			$newDescription = $('#newDescription'),
			$newCategory = $('#newCategory'),
			$editTaskForm = $('#editTaskForm'),
			uid = firebase.getAuth().uid,
			thisTaskID = $(this).data('edit'),
			thisTaskRef = firebase.child('users').child(uid).child('task');

		var test = thisTaskRef.child(thisTaskID).once('value', function(snapshot) {
			$newName.attr('value', snapshot.val().taskName);
			$newDescription.text(snapshot.val().taskDescription);
			$newCategory.attr('value', snapshot.val().taskCategory);
		})

		// Event listener for submission
		$editTaskForm.on('submit', function(e) {
			e.preventDefault();

			// Requiring a name
			if($newName.val() == '') {
				alert('You must give this task a name');
			} else {
				// Taking care of empty category
				var checkTaskCategory;
				if($newCategory.val('')) {
					checkTaskCategory = 'uncategorized'
				} else {
					checkTaskCategory = $taskCategory.val()
				}

				// Updating this task
				thisTaskRef.child(thisTaskID).update({
					taskName: $newName.val(),
					taskDescription: $newDescription.val(),
					taskCategory: $newCategory.val()
				})

				// get in progress tasks
				getInProgressTasks();
				
				//close modal
				modal.close();
			}
		})
	})
})