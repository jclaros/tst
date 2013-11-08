/**
 * Class that handles the dashboard rendering and callbacks
 */
window.themingStore.views.DashboardView = window.themingStore.views.AbstractView.extend({
  events         : {
  },
  /**
   * Title of the page
   */
  title          : 'ThemingSto.re - Dashboard',
  /**
   * The main action called when displaying the login page
   */
  index          : function ()
  {
    // if there is a user in session redirect him to the browse page
    if (!window.themingStore.currentUser)
    {
      window.themingStore.currentRouter.navigate('browse');
    }

    var self = this;
    this.loadTemplate('dashboard', false, function ()
    {
      self.$el.html(self.renderTemplate('#dashboardPage'))
    });
  }
});