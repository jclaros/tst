/**
 * Class that defines a collection of products
 */
window.themingStore.collections.UserCollection = window.themingStore.collections.AbstractCollection.extend({
  /**
   * backbone model to represent with the collection
   */
  model: window.themingStore.models.UserModel,

  /**
   * define the type of collection as user to communicate with drupal
   */
  type: 'user',

  /**
   * a function to get a user to authenticate him
   * @param options
   */
  fetchAuthentication: function (options)
  {
    var backupRoot = this.urlRoot;
    this.url = window.themingStore.restPath + 'user/' + options.uid + '.json';
    this.fetch(options);
  }
});