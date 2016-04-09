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
		authData = firebase.getAuth();

	// Handlebars variables
	var source = $('#tasktodo').html(),
		template = Handlebars.compile(source),
		sourceCompleted = $('#taskdone').html(),
		templateCompleted = Handlebars.compile(sourceCompleted);

	// Hide the logged in vew and check if user is logged in.
	// If yes, hides login screen and shows logged in view
	$loggedInView.hide();
	
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
				firebase.onAuth(function(authData) {
					if (authData == null) {
						firebase.child('users').child(authData.uid).set({
							name: authData.google.displayName,
							email: authData.google.email
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
						completedDescription: childData.taskDescription
					};
					var html = templateCompleted(context);
					$completedTasks.append(html);
				}
			});
		});
	}
	
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
		
		// clear form fields
		$taskName.val('').blur();
		$taskDescription.val('');
		$taskCategory.val('').blur();
	})

	// Event listener for completing tasks
	$inProgressTasks.on('click', 'button', function(e) {
		var uid = firebase.getAuth().uid,
			thisTaskID = $(this).data('id'),
			thisTaskRef = firebase.child('users').child(uid).child('task');
		thisTaskRef.child(thisTaskID).update({
			status: 'Complete'
		})
		// sortTasks();
	})

	// Event listener for seting completed tasks back to in progress
	$completedTasks.on('click', 'button', function(e) {
		var uid = firebase.getAuth().uid,
			thisTaskID = $(this).data('id'),
			thisTaskRef = firebase.child('users').child(uid).child('task');
		thisTaskRef.child(thisTaskID).update({
			status: 'In Progress'
		})
		// sortTasks();
	})
















})