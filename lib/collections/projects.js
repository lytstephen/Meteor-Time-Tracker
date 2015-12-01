Projects = new Mongo.Collection('projects');

ProjectSchema = new SimpleSchema({
  userId: {
    type: String
  },
  name: {
    type: String
  },
  archived: {
    type: Boolean,
    autoValue: function() {
      return false;
    }
  },
  order: {
    type: Number
  }
});

Projects.attachSchema(ProjectSchema);