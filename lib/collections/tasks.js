Tasks = new Mongo.Collection('tasks');

TasksSchema = new SimpleSchema({
  projectId: {
    type: String
  },
  name: {
    type: String
  },
  order: {
    type: Number
  },
  done: {
    type: Boolean
  },
  notes: {
    type: String,
    optional: true
  }
});

Tasks.attachSchema(TasksSchema);

Tasks.allow({
  update: function() {
    return true;
  }
});

Meteor.methods({
  taskDelete: function(taskId, projectId) {
    var currentOrder = Tasks.findOne(taskId).order;

    Tasks.remove(taskId, function() {

      // callback after delete to move all order after the deleted up by 1
      var query = {projectId: projectId, order: {$gt: currentOrder}};
      var operator = {$inc: {order: -1}};
      var condition = {multi: true};
      Tasks.update(query, operator, condition);
    });
  }
});

















