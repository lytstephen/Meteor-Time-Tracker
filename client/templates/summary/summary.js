Template.Summary.events({

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


Template.Summary.helpers({

  taskIntervals: function(taskId) {
    var query = {taskId: taskId};
    var projection = {sort: {start: -1}};

    return Intervals.find(query, projection);
  },

  humanDateTime: function(time) {
    return moment(time).format('DD/MM/YY hh:mm:ss A')
  }

});


Template.Summary.onRendered(function() {
  this.$('.datetimepicker').datetimepicker();
});














