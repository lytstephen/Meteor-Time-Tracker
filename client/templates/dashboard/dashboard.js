var Dashboard = {};

Dashboard.addProject = function(projectTextField) {
  var projectName = projectTextField.val();

  var doc = {
    userId: Meteor.userId(),
    name: projectName,
    archived: false
  };

  Projects.insert(doc);
  projectTextField.val('');
};

Dashboard.addTask = function(taskTextField) {
  var taskName = taskTextField.val();
  var projectId = Session.get('currentProjectId');
  var numTasksInProject = Tasks.find({projectId: projectId}).count();

  if (projectId) {
    var doc = {
      projectId: projectId,
      name: taskName,
      order: numTasksInProject + 1,
      done: false
    };

    Tasks.insert(doc);
    taskTextField.val('');
  }
};

Dashboard.findTaskCurrentInterval = function(taskId) {
  var query = { taskId: taskId, end: {$exists: false} };
  return Intervals.findOne(query);
};

// ------------------------------------------------------------------------------------

Template.Dashboard.events({

  // -------- CREATE -------- //
  'click #add-project': function(e) {
    var projectTextField = $('#add-project-text');
    Dashboard.addProject(projectTextField);
  },

  'click #add-task': function(e) {
    var taskTextField = $('#add-task-text');
    Dashboard.addTask(taskTextField);
  },

  'keypress input': function(e) {
    // if enter is pressed on an input field
    if (e.which === 13) {
      var fieldId = $(e.target).attr('id');

      // add project
      if (fieldId === 'add-project-text') {
        var projectTextField = $('#add-project-text');
        Dashboard.addProject(projectTextField);

        // add task
      } else if (fieldId === 'add-task-text') {
        var taskTextField = $('#add-task-text');
        Dashboard.addTask(taskTextField)
      }
    }
  },

  'click .start-button': function(e) {
    var currentTaskId = $(e.target).data('task_id');
    var currentInterval = Dashboard.findTaskCurrentInterval(currentTaskId);

    // check if it's tracking anything at all
    var currentlyTracking = Intervals.findOne({end: {$exists: false}});
    if (currentlyTracking && currentlyTracking.taskId !== currentTaskId) {
      alert('You can only track one task at a time. Please end the current task before starting another.')

    } else {
      // if there is no current interval, it's a start on the time
      if (!currentInterval) {
        var doc = {
          taskId: currentTaskId,
          start: new Date
        };

        Intervals.insert(doc);
      } else {

        // if there's already a current interval, it's a end on that interval
        var operator = {$set: {end: new Date}};
        Intervals.update(currentInterval._id, operator)
      }
    }
  },


  // -------- UPDATE -------- //
  'change #project-name': function(e) {
    var newName = $(e.target).val();
    var currentProjectId = Session.get('currentProjectId');
    var operator = {$set: {name: newName}};

    Projects.update(currentProjectId, operator);
  },

  'change .task-name': function(e) {
    var newName = $(e.target).val();
    var currentTaskId = $(e.target).data('task_id');
    var operator = {$set: {name: newName}};

    Tasks.update(currentTaskId, operator);
  },

  'click #archive-project': function(e) {
    var currentProjectId = Session.get('currentProjectId');
    var currentlyArchived = Projects.findOne(currentProjectId).archived;
    var operator;

    if (!currentlyArchived) {
      operator = {$set: {archived: true}};
    } else {
      operator = {$set: {archived: false}};
    }

    Projects.update(currentProjectId, operator);
  },

  'click .done-task': function(e) {
    var currentTaskId = $(e.target).data('task_id');
    var currentlyDone = Tasks.findOne(currentTaskId).done;

    if (!currentlyDone) {
      Tasks.update(currentTaskId, {$set: {done: true}});
    } else {
      Tasks.update(currentTaskId, {$set: {done: false}});
    }
  },

  'click .task-up': function(e) {
    var currentProjectId = Session.get('currentProjectId');
    var currentTaskId = $(e.target).data('task_id');
    var currentOrder = Tasks.findOne(currentTaskId).order;

    if (currentOrder > 1) {
      var aboveTaskId = Tasks.findOne({projectId: currentProjectId, order: currentOrder - 1})._id;
      Tasks.update(currentTaskId, {$inc: {order: -1}});
      Tasks.update(aboveTaskId, {$inc: {order: 1}});
    }
  },

  'click .task-down': function(e) {
    var currentProjectId = Session.get('currentProjectId');
    var currentTaskId = $(e.target).data('task_id');
    var currentOrder = Tasks.findOne(currentTaskId).order;
    var belowTask = Tasks.findOne({projectId: currentProjectId, order: currentOrder + 1});

    if (belowTask) {
      Tasks.update(currentTaskId, {$inc: {order: 1}});
      Tasks.update(belowTask._id, {$inc: {order: -1}});
    }
  },

  'change .task-note-text': function(e) {
    var textArea = $(e.target);
    var text = textArea.val();
    var currentTaskId = textArea.data('task_id');

    Tasks.update(currentTaskId, {$set: {notes: text}});
  },


  // -------- DELETE -------- //

  'click #delete-project': function(e) {
    var currentProjectId = Session.get('currentProjectId');

    if (confirm("Are you sure you want to delete this project?")) {
      Projects.remove(currentProjectId, function() {
        Session.set('currentProjectId', null);
      });
    }
  },

  'click .delete-task': function(e) {
    var currentTaskId = $(e.target).data('task_id');
    var currentProjectId = Session.get('currentProjectId');

    if (confirm('Are you Sure?')) {
      Meteor.call('taskDelete', currentTaskId, currentProjectId);
    }
  },


  // -------- FUNCTIONS -------- //
  'click .project-nav': function(e) {
    e.preventDefault();

    var currentProjectId = $(e.target).data('project_id');

    Session.set('currentProjectId', currentProjectId);
  },

  'click #show-archived': function(e) {
    var currentlyShowing = Session.get('showingArchived');
    var showIcon = $('.show-icon');
    var archivedProjects = $('.archived-projects');

    var hideArchive = function() {
      showIcon.addClass('fa-plus-circle');
      showIcon.removeClass('fa-minus-circle');
      archivedProjects.hide('fast');
      Session.set('showingArchived', false);
    };
    var showArchive = function() {
      showIcon.removeClass('fa-plus-circle');
      showIcon.addClass('fa-minus-circle');
      archivedProjects.show('fast');
      Session.set('showingArchived', true);
    };

    if (currentlyShowing) {
      hideArchive();
    } else {
      showArchive();
    }
  }

});

// ------------------------------------------------------------------------------------

Template.Dashboard.helpers({

  taskDone: function(_id) {
    var currentlyDone = Tasks.findOne(_id).done;
    return currentlyDone ? 'task-done' : '';
  },

  doneVerb: function(_id) {
    var currentlyDone = Tasks.findOne(_id).done;
    return currentlyDone ? 'Not Done' : 'Done';
  },

  doneStyle: function(_id) {
    var currentlyDone = Tasks.findOne(_id).done;
    return currentlyDone ? 'default' : 'success';
  },

  startDisabled: function(_id) {
    var currentlyDone = Tasks.findOne(_id).done;
    return currentlyDone ? 'disabled' : '';
  }

});

// ------------------------------------------------------------------------------------

Template.Dashboard.onCreated(function() {
  Session.set('from', null);
  Session.set('to', null);
  Session.set('range', 'all');

  console.log(Session.get('from'), Session.get('to'), Session.get('range'));
});