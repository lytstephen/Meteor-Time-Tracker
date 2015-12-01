Projects = new Mongo.Collection('projects');

ProjectSchema = new SimpleSchema({
  userId: {
    type: String
  },
  name: {
    type: String
  },
  archived: {
    type: Boolean
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      return new Date;
    }
  }
});

Projects.attachSchema(ProjectSchema);