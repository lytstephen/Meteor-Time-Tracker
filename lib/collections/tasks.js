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
  notes: {
    type: String,
    optional: true
  }
});

Tasks.attachSchema(TasksSchema);