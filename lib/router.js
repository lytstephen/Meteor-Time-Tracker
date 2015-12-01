Router.configure({
  layoutTemplate: 'Layout',
  loadingTemplate: 'Loading',
  notFoundTemplate: 'NotFound'
});

Router.route('/', {
  name: 'Home'
});

Router.route('dashboard', {
  name: 'Dashboard',
  data: function() {
    return Projects.find({userId: this.userId});
  }
});