/**
 * Class that defines a collection of products
 */
window.themingStore.collections.ShoppingItemCollection = Backbone.Collection.extend({
  /**
   * backbone model to represent with the collection
   */
  model: window.themingStore.models.ShoppingItemModel
});