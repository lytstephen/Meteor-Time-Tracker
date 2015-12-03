Intervals = new Mongo.Collection('intervals');

IntervalsSchema = new SimpleSchema({
  taskId: {
    type: String
  },
  start: {
    type: Date
  },
  end: {
    type: Date,
    optional: true
  }
});

Intervals.attachSchema(IntervalsSchema);