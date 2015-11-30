AccountsTemplates.configure({
  defaultLayout: 'Layout',
  onLogoutHook: function() {
    Router.go('/');
  }
});

AccountsTemplates.configureRoute('signIn', {
//  redirect: function(){
//    var user = Meteor.user();
//    if (user)
//      Router.go('XXX');
//  }
});