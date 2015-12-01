Template.Dashboard.events({

  'click #add-project': function(e) {
    var projectName = $('#add-project-text').val();
    var numProjects = Projects.find().count();

    var doc = {
      userId: Meteor.userId(),
      name: projectName,
      archived: false
    };

    Projects.insert(doc);
  },

  'click .project-nav': function(e) {
    e.preventDefault();

    var currentProjectId = $(e.target).data('id');

    Session.set('currentProjectId', currentProjectId);
  },

  'click .show-archived': function(e) {
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

  'change #project-name': function(e) {
    var newName = $(e.target).val();
    var currentProjectId = Session.get('currentProjectId');
    var operator = {$set: {name: newName}};

    Projects.update(currentProjectId, operator);
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
  }

});