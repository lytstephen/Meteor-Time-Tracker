AccountsTemplates.configure({
  defaultLayout: 'Layout',
  onLogoutHook: function() {
    Router.go('/');
  },

  texts: {
    title: {
      signUp: ""
    }
  }

});

AccountsTemplates.configureRoute('signIn', {
  redirect: function(){
    var user = Meteor.user();
    if (user)
      Router.go('Dashboard');
  }
});