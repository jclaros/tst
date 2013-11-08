// create the router
$(document).ready(function ()
{
  window.themingStore.cart                = new window.themingStore.views.ShoppingCartView();
  window.themingStore.currentRouter       = new window.themingStore.routers.DefaultRouter();
  window.themingStore.autenticationMethod ='full';
  window.themingStore.mediator = new Mediator();
  Backbone.history.start();
});
