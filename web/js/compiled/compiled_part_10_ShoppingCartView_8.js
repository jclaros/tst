/**
 * Class that handles the default view
 */
window.themingStore.views.ShoppingCartView = window.themingStore.views.AbstractView.extend({
  /**
   * Master element
   */
  el: $('body'),
  /**
   * The element that contains the message of the items in the cart
   */
  _cartMessage: '.in_cart',
  /**
   * events bound to the view
   */
  events               : {
    'click .basic_cart': 'cartRedirect'
  },
  /**
   * The collection that holds all items that can be subject to a tax fee
   * @type {window.themingStore.collections.ShoppingItemCollection}
   */
  _taxableCollection   : null,
  /**
   * Another collection that holds all items that cannot be taxed by a fee
   * @type {window.themingStore.collections.ShoppingItemCollection}
   */
  _nonTaxableCollection: null,
  /**
   * The item that will be used to calculate the tax
   * @type {window.themingStore.models.ShoppingItemModel}
   */
  _taxItem             : null,
  /**
   * The constructor of the class, initializes the collections
   */
  initialize           : function () {
    // inherit the semaphore methods
    window.functions.multipleInherit(this, 'window.classes.readySemaphore');

    // initialize the collections and model
    this._taxableCollection = new window.themingStore.collections.ShoppingItemCollection();
    this._nonTaxableCollection = new window.themingStore.collections.ShoppingItemCollection();
    this._taxItem = new window.themingStore.models.ShoppingItemModel();

    // bind the listener to redraw the bar on each page
    $(document).on('routeUpdated', this.routeUpdated.bind(this));
    // listen to dom updates on the body too
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var observer = new MutationObserver(this.routeUpdated.bind(this));
    var element = $('body')[0];
    observer.observe(element, {
      subtree: true,
      attributes: true
    });

    // preload the template, update the semaphore
    this.loadAndFetch({
      'templates': ['cart'],
      'ready'    : (function () {
        this._ready = true;
      }).bind(this)
    });
  },
  /**
   * The method called when a route is updated, this renders the top bar if it's needed
   */
  routeUpdated         : function () {
    this.render();
  },
  /**
   * renders the default view, this loads the main layout
   */
  render               : function () {
    this._call((function(){
      if ($(this._cartMessage).length)
      {
        $(this._cartMessage).html(this.getMessage());
        if (this._hasItems())
        {
          this.renderTemplate('#cartBar')
        }
      }
    }).bind(this));
  },
  /**
   * gets a message to be displayed on the cart counter
   * @returns {string}
   */
  getMessage: function () {
    var count = this.getCount();
    return count + (count == 1 ? ' item' : ' items');
  },
  /**
   * Adds an item to the taxable collection, a set of parameters can arrive and the object will be created with the
   * options needed
   * @param {object} item The item to add, if not a {window.themingStore.models.ShoppingItemModel} one will be created
   * @config {integer} [id]     The id of the item
   * @config {float}   [price]  The price of the item
   * @config {string}  [name]   Name of the product
   * @config {integer} [amount] How many items are being purchased
   * @config {string}  [type]   Optional type of the item
   */
  addTaxableItem       : function (item) {
    if (!item instanceof window.themingStore.models.ShoppingItemModel) {
      item = this._getItemObject(item);
    }
    this._taxableCollection.add(item);
  },
  /**
   * Adds an item to the taxable collection, a set of parameters can arrive and the object will be created with the
   * options needed
   * @param {object} item The item to add, if not a {window.themingStore.models.ShoppingItemModel} one will be created
   * @config {integer} [id]     The id of the item
   * @config {float}   [price]  The price of the item
   * @config {string}  [name]   Name of the product
   * @config {integer} [amount] How many items are being purchased
   * @config {string}  [type]   Optional type of the item
   */
  addNonTaxableItem    : function (item) {
    if (!item instanceof window.themingStore.models.ShoppingItemModel) {
      item = this._getItemObject(item);
    }
    this._nonTaxableCollection.add(item);
  },
  /**
   * gets the number of items in the cart, only the template are returned here
   * @returns {integer}
   */
  getCount: function () {
    return this._taxableCollection.length;
  },
  cartRedirect: function () {
    console.log('dsa');
  },
  /**
   * Creates an item object using the arriving data in the object
   * @param  {object} item The object to use as reference to create the item
   * @config {integer} [id]     The id of the item
   * @config {float}   [price]  The price of the item
   * @config {string}  [name]   Name of the product
   * @config {integer} [amount] How many items are being purchased
   * @config {string}  [type]   Optional type of the item
   * @return {window.themingStore.models.ShoppingItemModel} The item that can be added to the collection
   */
  _getItemObject       : function (item) {
    var object = new window.themingStore.models.ShoppingItemModel();
    object.set(item);
    return object;
  },
  /**
   * Returns a boolean telling if the cart has items or not
   * @returns {boolean}
   * @private
   */
  _hasItems: function () {
    return (this._nonTaxableCollection.length && this._taxableCollection.length);
  }
});
