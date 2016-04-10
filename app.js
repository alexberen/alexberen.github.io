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
		$changeUserNameModal = $('#changeUserNameModal'),
		$changeUserNameContent = $changeUserNameModal.detach(),
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
			$loggedInView.show();
			$userName.text(authData.google.displayName);
			$loggingIn.hide();
			sortTasks();
		}
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
				var uid = firebase.getAuth().uid,
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
				sortTasks();
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

	// Sorting tasks and using handlebars to generate html
	function sortTasks() {
		$inProgressTasks.empty();
		$completedTasks.empty();

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
				} else {
					var context = {
						completedName: childData.taskName,
						completedCategory: childData.taskCategory,
						completedDescription: childData.taskDescription,
						taskID: childData.taskID
					};
					var html = templateCompleted(context);
					$completedTasks.append(html);
				}
			});
		});
	}

	// Event listener for showing/hiding completed tasks
	$showCompletedChevron.on('click', function(e) {

		if($showCompletedChevron.hasClass('fa-rotate-90')) {
			$showCompletedChevron.toggleClass('fa-rotate-90');
			$completedTasks.hide();
							
		} else {
			$showCompletedChevron.toggleClass('fa-rotate-90');
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
			$taskDescription = $('#taskDescription');
			$taskCategory = $('#taskCategory'),
			uid = firebase.getAuth().uid,
			taskRef = firebase.child('users').child(uid).child('task');

		// Create 'task' object in Firebase
		var newTaskRef = taskRef.push({
			status: 'In Progress',
			taskName: $taskName.val(),
			taskDescription: $taskDescription.val(),
			taskCategory: $taskCategory.val()
		});
		var taskID = newTaskRef.key();
		newTaskRef.update({
			taskID: taskID
		});

		// sort tasks
		sortTasks();
		
		// clear form fields and close modal
		$taskName.val('').blur();
		$taskDescription.val('');
		$taskCategory.val('').blur();
		modal.close();
	})

	// Event listener for completing tasks
	$inProgressTasks.on('click', 'button', function(e) {
		var uid = firebase.getAuth().uid,
			thisTaskID = $(this).data('id'),
			thisTaskRef = firebase.child('users').child(uid).child('task');
		thisTaskRef.child(thisTaskID).update({
			status: 'Complete'
		});
		sortTasks();
	})

	// Event listener for seting completed tasks back to in progress
	$completedTasks.on('click', 'button', function(e) {
		var uid = firebase.getAuth().uid,
			thisTaskID = $(this).data('completion'),
			thisTaskRef = firebase.child('users').child(uid).child('task');
		thisTaskRef.child(thisTaskID).update({
			status: 'In Progress'
		});
		sortTasks();
	})

	//Event listeners for deleting tasks
	$completedTasks.on('click', 'a', function(e) {
		e.preventDefault();

		modal.open({
			content: $deleteConfirmationContent
		})

		var uid = firebase.getAuth().uid,
			thisTaskID = $(this).data('deletion'),
			thisTaskRef = firebase.child('users').child(uid).child('task');

		$('#deleteTask').on('click', function(e) {
			console.log(this);
			thisTaskRef.child(thisTaskID).remove();
			modal.close();
			sortTasks();
		})

		$('#keepTask').on('click', function(e) {
			modal.close();
		})
	});

	$inProgressTasks.on('click', 'a', function(e) {
		e.preventDefault();

		modal.open({
			content: $deleteConfirmationContent
		})

		var uid = firebase.getAuth().uid,
			thisTaskID = $(this).data('deletion'),
			thisTaskRef = firebase.child('users').child(uid).child('task');

		$('#deleteTask').on('click', function(e) {
			console.log(this);
			thisTaskRef.child(thisTaskID).remove();
			modal.close();
			sortTasks();
		})

		$('#keepTask').on('click', function(e) {
			modal.close();
		})
	});

	// Chaning user name
	$userName.on('click', function(e) {
		modal.open({
			content: $changeUserNameContent
		})
		var $newUserName = $('newUserName');
		$newUserName.on('keypress', function(e) {
			if(e.which == 13) {
				console.log('You pressed enter', $newUserName.val());	
			}
		})
	})
		// console.log('Before update: ', $newUserName.val());
		// var uid = firebase.getAuth().uid;
		
		// firebase.child('users').child(uid).update({
		// 	name: $newUserName.val()
		// })
		// console.log('After update: ', $newUserName.val());
		// $userName.text($newUserName.val());
		// modal.close();
})