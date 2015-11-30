var requireLogin = function() {
  if (!Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      Router.go('/');
    }
  } else {
    this.next();
  }
};

var requireLoggedOut = function() {
  if (Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      Router.go('Dashboard');
    }
  } else {
    this.next();
  }
};

Router.onBeforeAction(requireLoggedOut, {only: 'Home'});
Router.onBeforeAction(requireLogin, {only: 'Dashboard'});
