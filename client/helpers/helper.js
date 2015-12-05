Helper = {};

Helper.msToTime = function(duration) {
  var milliseconds = parseInt((duration % 1000) / 100)
      , seconds = parseInt((duration / 1000) % 60)
      , minutes = parseInt((duration / (1000 * 60)) % 60)
      , hours = parseInt((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds;
};

Helper.taskTotalTime = function(taskId) {
  var query = {taskId: taskId};
  var cursor = Intervals.find(query);
  var totalTime = 0;

  var from = Session.get('from');
  var to = Session.get('to');

  var calcInterval = function(interval) {
    if (interval.end) {
      totalTime += interval.end.getTime() - interval.start.getTime();
    } else {
      totalTime += TimeSync.serverTime() - interval.start.getTime();
    }
  };

  cursor.forEach(function(interval) {

    // has from and to
    if (from && interval.end > from && to && interval.end > to) {
      calcInterval(interval);

      // has from no to
    } else if (from && interval.end > from && !to) {
      calcInterval(interval);

      // has no time range
    } else if (!from && !to) {
      calcInterval(interval);
    }

  });

  return totalTime;
};

Helper.findTaskCurrentInterval = function(taskId) {
  var query = { taskId: taskId, end: {$exists: false} };
  return Intervals.findOne(query);
};

//-------------------------------------------------------------------

Template.registerHelper('activeProject', function() {
  var currentProjectId = Session.get('currentProjectId');
  return currentProjectId === this._id ? 'active' : '';
});

Template.registerHelper('projects', function() {
  var query = {userId: Meteor.userId(), archived: false};
  var projection = {sort: {updatedAt: -1}};
  return Projects.find(query, projection);
});

Template.registerHelper('showArchivedText', function() {
  return Session.get('showingArchived') ? 'Hide Archived Projects' : 'Show Archived Projects';
});

Template.registerHelper('archivedProjects', function() {
  var query = {userId: Meteor.userId(), archived: true};
  var projection = {sort: {updatedAt: -1}};
  return Projects.find(query, projection);
});

Template.registerHelper('tasks', function() {
  var currentProjectId = Session.get('currentProjectId');
  return Tasks.find({projectId: currentProjectId}, {sort: {done: 1, order: 1}});
});

Template.registerHelper('taskTotalTimeText', function(taskId, from, to) {
  var totalTime = Helper.taskTotalTime(taskId, from, to);
  return Helper.msToTime(totalTime);
});

// get current project data from clicking side nav, which set session. Default to newest on initial load.
Template.registerHelper('currentProject', function() {
  var currentProjectId = Session.get('currentProjectId');

  if (currentProjectId) {
    return Projects.findOne(currentProjectId);
  } else {
    return null;
  }
});

Template.registerHelper('archiveVerb', function() {
  var currentProjectId = Session.get('currentProjectId');
  var currentlyArchived = Projects.findOne(currentProjectId).archived;

  return currentlyArchived ? 'Unarchive' : 'Archive';
});

Template.registerHelper('projectTotalTime', function(projectId) {
  var currentProjectId = projectId || Session.get('currentProjectId');

  var cursor = Tasks.find({projectId: currentProjectId});
  var totalTime = 0;

  cursor.forEach(function (task) {
    totalTime += Helper.taskTotalTime(task._id);
  });

  return Helper.msToTime(totalTime);
});

Template.registerHelper('currentlyTrackingOnTask', function(taskId) {
  return Helper.findTaskCurrentInterval(taskId)
});
