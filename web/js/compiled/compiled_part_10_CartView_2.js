/**
 * Class that handles the default view
 */
window.themingStore.views.CartView = window.themingStore.views.AbstractView.extend({
  /**
   * Master element
   */
  el: $('body'),
  /**
   * Main action, shows the cart contents
   */
  index: function () {
    // preload the template, update the semaphore
    this.loadAndFetch({
      'templates': ['cart'],
      'ready'    : (function () {
        this._renderIndex();
      }).bind(this)
    });
  },
  /**
   * this method renders the index template
   * @private
   */
  _renderIndex: function () {
    this.$el.addClass('cart').html(this.renderTemplate('#cartIndex'))
  }
});