Template.Navbar.helpers({
  isActive: function(link) {
    var currentPath = Router.current().route.path(this).toString();
    return (link == currentPath ? ' active' : '');
  }
});