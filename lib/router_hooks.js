var requireLogin = function() {
  if (!Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      Router.go('/sign-in');
      alert('You must be logged in before posting');
    }
  } else {
    this.next();
  }
};

//Router.onBeforeAction(requireLogin, {only: 'XXX'});
