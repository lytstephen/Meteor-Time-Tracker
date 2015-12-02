Template.Dashboard.events({

  // -------- CREATE -------- //
  'click #add-project': function(e) {
    var projectTextField = $('#add-project-text');
    var projectName = projectTextField.val();

    var doc = {
      userId: Meteor.userId(),
      name: projectName,
      archived: false
    };

    Projects.insert(doc);
    projectTextField.val('');
  },

  'click #add-task': function(e) {
    var taskTextField = $('#add-task-text');
    var taskName = taskTextField.val();
    var numTasks = Tasks.find().count();
    var projectId = Session.get('currentProjectId');

    if (projectId) {
      var doc = {
        projectId: projectId,
        name: taskName,
        order: numTasks + 1
      };

      Tasks.insert(doc);
      taskTextField.val('');

    } else {
      alert('Please select a project first');
    }
  },


  // -------- NAVIGATION -------- //
  'click .project-nav': function(e) {
    e.preventDefault();

    var currentProjectId = $(e.target).data('id');

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
    var currentTaskId = $(e.target).data('task');
    var operator = {$set: {name: newName}};

    Tasks.update(currentTaskId, operator);
  },

  'click #archive-project': function(e) {
    var currentProjectId = Session.get('currentProjectId');
    var currentlyArchived = Projects.findOne(currentProjectId).archived;

    var operator = {$set: {archived: true}};
    //if (currentlyArchived) {
    //  operator = {$set: {archived: 1}};
    //}

    Projects.update(currentProjectId, operator);
  },

  'click .task-up': function(e) {
    var currentTaskId = $(e.target).data('task');
    var currentOrder = Tasks.findOne(currentTaskId).order;

    if (currentOrder > 1) {
      var aboveTaskId = Tasks.findOne({order: currentOrder - 1})._id;
      Tasks.update(currentTaskId, {$inc: {order: -1}});
      Tasks.update(aboveTaskId, {$inc: {order: 1}});
    }
  },

  'click .task-down': function(e) {
    var currentTaskId = $(e.target).data('task');
    var currentOrder = Tasks.findOne(currentTaskId).order;
    var belowTask = Tasks.findOne({order: currentOrder + 1});

    if (belowTask) {
      Tasks.update(currentTaskId, {$inc: {order: 1}});
      Tasks.update(belowTask._id, {$inc: {order: -1}});
    }
  },


  // -------- DELETE -------- //

  'click #delete-project': function(e) {
    var currentProjectId = Session.get('currentProjectId');

    if (confirm("Are you sure you want to delete this project?")) {
      Projects.remove(currentProjectId, function() {
        currentProjectId = Projects.findOne({archived: false}, {sort: {updatedAt: -1}});
        Session.set('currentProjectId', currentProjectId);
      });
    }
  }

});

Template.Dashboard.helpers({

  projects: function() {
    return Projects.find({archived: false}, {sort: {updatedAt: -1}});
  },

  // get current project data from clicking side nav, which set session. Default to newest on initial load.
  currentProject: function() {
    var currentProjectId = Session.get('currentProjectId');

    if (currentProjectId) {
      return Projects.findOne(currentProjectId);
    } else {
      currentProjectId = Projects.findOne({archived: false}, {sort: {updatedAt: -1}});
      Session.set('currentProjectId', currentProjectId)
    }

  },

  activeProject: function() {
    var currentProjectId = Session.get('currentProjectId');
    return currentProjectId === this._id ? 'active' : '';
  },

  archivedProjects: function() {
    return Projects.find({archived: true}, {sort: {updatedAt: -1}});
  },

  showArchivedText: function() {
    return Session.get('showingArchived') ? 'Hide Archived Projects' : 'Show Archived Projects'
  },

  tasks: function() {
    var currentProjectId = Session.get('currentProjectId');
    return Tasks.find({projectId: currentProjectId}, {sort: {order: 1}});
  }

});