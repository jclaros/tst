/**
 * Class that defines a collection of products
 */
window.themingStore.collections.CategoryCollection = window.themingStore.collections.AbstractCollection.extend({
  /**
   * backbone model to represent with the collection
   */
  model: window.themingStore.models.CategoryModel,

  // do not use url, it is generated using the type
  /**
   * The type of content to get from drupal service layer, this value helps create the url
   */
  type: 'category',

  url: Routing.generate('api_category_list')
});