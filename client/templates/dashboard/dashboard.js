Template.Dashboard.events({

  'click #add-project': function(e) {
    var projectName = $('#add-project-text').val();
    var numProjects = Projects.find().count();

    var doc = {
      userId: Meteor.userId(),
      name: projectName
    };

    Projects.insert(doc);
  },

  'click .project-nav': function(e) {
    e.preventDefault();

    var currentProjectId = $(e.target).data('id');

    Session.set('currentProjectId', currentProjectId);
  },

  'change #project-name': function(e) {
    var newName = $(e.target).val();
    var currentProjectId = Session.get('currentProjectId');
    var operator = {$set: {name: newName}};

    Projects.update(currentProjectId, operator);
  }

});

Template.Dashboard.helpers({

  projects: function() {
    return Projects.find({archived: false}, {sort: {createdAt: -1}});
  },

  currentProject: function() {
    var currentProjectId = Session.get('currentProjectId');

    if (currentProjectId) {
      return Projects.findOne(currentProjectId);
    } else {
      return Projects.findOne({order: 1});
    }

  }

});