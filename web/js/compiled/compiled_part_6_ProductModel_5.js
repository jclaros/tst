/**
 * Class that handles the products
 * @type {*}
 */
window.themingStore.models.ProductModel = window.themingStore.models.AbstractModel.extend({
  defaults: {
      'template[title]': 'dsa'
  },
  /**
   * the type of the model, required for save operations
   */
  type: 'template'
});