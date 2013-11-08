// create the router
$(document).ready(function ()
{
  window.themingStore.currentRouter = new window.themingStore.routers.DefaultRouter();
  window.themingStore.autenticationMethod='full';
  Backbone.history.start();
});
