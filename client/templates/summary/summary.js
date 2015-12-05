var getNewDate = function(e) {
  var field = $(e.target);

  var apm = field.val().substring(15,17);
  var date = field.val().substring(0,2);
  var month = field.val().substring(3,5) - 1;
  var year = '20' + field.val().substring(6,8);
  var hour = field.val().substring(9,11);
  var minute = field.val().substring(12,14);

  if (apm === "PM" && hour != '12') {
    hour = Number(hour) + 12;
  }

  return new Date(year, month, date, hour, minute, 0, 0);
};

Template.Summary.events({

  // -------- UPDATES ---------- //
  'change .interval-start': function(e) {

    var currentIntervalId = $(e.target).data('interval_id');
    var newDate = getNewDate(e);

    var operator = {$set: {start: newDate}};
    var endTime = Intervals.findOne(currentIntervalId).end;

    if (newDate == 'Invalid Date') {
      alert('Time not correctly formatted. Please enter time with this format:' +
          ' 18/02/2015 09:31 PM');
    } else if (newDate > endTime) {
      alert('start time cannot be greater than endtime');
    } else {
      Intervals.update(currentIntervalId, operator);
    }
  },


  'change .interval-end': function(e) {

    var intervalId = $(e.target).data('interval_id');
    var newDate = getNewDate(e);

    var operator = {$set: {end: newDate}};

    if (newDate == 'Invalid Date') {
      alert('Time not correctly formatted. Please enter time with this format:' +
          ' 18/02/2015 09:31 PM');
    } else {
      Intervals.update(intervalId, operator)
    }
  },


  // -------- DELETE ----------- //
  'click .delete-interval': function(e) {
    var intervalId = $(e.target).data('interval_id');

    if(confirm('Are you Sure')) {
      Intervals.remove(intervalId);
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
  },

  'click #overall': function(e) {
    e.preventDefault();

    Session.set('currentProjectId', null);
    $(e.target).addClass('active');
  },

  'click .goToProject': function(e) {
    e.preventDefault();
    var projectId = $(e.target).data('project_id');
    Session.set('currentProjectId', projectId)
  },

  'change #date-range-filter': function(e) {
    var range = $(e.target).val();
    var setSessionRange = function(from, to, range) {
      Session.set('from', from);
      Session.set('to', to);
      Session.set('range', range)
    };

    switch (range) {
      case 'all':
        setSessionRange(null, null, 'all');
        break;
      case 'today':
        setSessionRange(new Date().setHours(0), null, 'today');
        break;
      case 'this-month':
        setSessionRange(new Date().setDate(1), null, 'this-month');
        break;
      case 'last-7':
        setSessionRange(new Date().setDate(new Date().getDate() - 7), null, 'last-7');
        break;
      case 'last-30':
        setSessionRange(new Date().setDate(new Date().getDate() - 30), null, 'last-30');
        break;
      case 'specify':
        Session.set('range', 'specify');
        break;
    }
  },

  'click #date-filter': function(e) {

    var fromField = $('#date-picker-from');
    var toField = $('#date-picker-to');

    var assignDate = function(field, type) {
      var month = Number(field.val().substring(0,2)) -1;
      var date = Number(field.val().substring(3,5));
      var year = Number(field.val().substring(6,10));

      if (type === 'to')
        date = date + 1;

      return new Date(year, month, date);
    };

    Session.set('from', assignDate(fromField).getTime());
    if (toField.val()) {
      Session.set('to', assignDate(toField, 'to').getTime());
    } else {
      Session.set('to', null)
    }
  },

  'click .show-intervals': function(e) {
    var taskId = $(e.target).data('task_id');
    var intervalsDiv = $('#intervals-for-' + taskId);

    intervalsDiv.toggle('fast');
  }

});


Template.Summary.helpers({

  taskIntervals: function(taskId) {
    var from = Session.get('from');
    var to = Session.get('to');
    var query = {taskId: taskId, end: {$exists: true}};

    if (from && !to) {
      query = _.extend(query, {
        end: {$gt: new Date(from)}
      });
    } else if (to && from) {
      query = _.extend(query, {
        end: {$in: [new Date(from), new Date(to)]}
      });
    }
    var projection = {sort: {start: -1}};

    return Intervals.find(query, projection);
  },

  intervalDuration: function() {
    return Helper.msToTime(this.end - this.start);
  },

  humanDateTime: function(time) {
    return moment(time).format('DD/MM/YY hh:mm A')
  },

  overallActive: function() {
    var currentProjectId = Session.get('currentProjectId');

    return currentProjectId ? '' : 'active'
  },

  overallTotalTime: function() {
    var totalTime = 0;

    var projectsCursor = Projects.find({userId: Meteor.userId(), archived: false});

    projectsCursor.forEach(function(project) {
      var tasksCursor = Tasks.find({projectId: project._id});

      tasksCursor.forEach(function(task) {
        totalTime += Helper.taskTotalTime(task._id)
      });

    });

    return Helper.msToTime(totalTime);
  },

  rangeSelected: function(range) {
    return range === Session.get('range') ? 'selected' : ''
  },

  isSpecify: function() {
    return Session.get('range') === 'specify' ? 'block' : 'none';
  }

});


Template.Summary.onRendered(function() {
  $('.input-daterange').datepicker();
});














