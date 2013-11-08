/**
 * Class that handles the products
 * @type {*}
 */
window.themingStore.models.ShoppingItemModel = Backbone.Model.extend({
  defaults: {
    'id'    : 0,
    'price' : 0,
    'name'  : '',
    'amount': 1,
    'type'  : null
  },
  /**
   * The validation method to be executed before a save
   * @param  {object} attrs   The attributes of the model
   * @param  {object} options
   * @return {string|null} if something is returned the save is stopped
   */
  validate: function(attrs, options) {
    if (attrs.id == 0) {
      return "The id is needed to proceed";
    }
  }
});