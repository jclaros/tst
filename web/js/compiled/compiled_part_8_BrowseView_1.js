/**
 * Class that handles the default view
 */
window.themingStore.views.BrowseView = window.themingStore.views.AbstractView.extend({
  /**
   * Master element
   */
  el: $('body'),

  /**
   * events bound to the view
   */
  events: {
    'click .filter': 'filterClicked'
  },

  /**
   * the filter applied to the collection
   */
  filterApplied: null,

  /**
   * flag to know how many times a filter has been applied
   */
  filterStack: 0,

  /**
   * Title of the page
   */
  title: 'ThemingSto.re - Browse Templates',

  /**
   * value of the stalker position on the screen
   */
  baseStalkerScroll: 0,

  /**
   * the products to display
   */
  products: null,

  /**
   * this variable tells the class if the products are usable
   */
  productsReady: false,

  /**
   * Called upon initialization (constructor ?)
   */
  initialize: function ()
  {
    var self = this;
    $(window).scroll(function (event){self.windowScroll(event, self)});
    this.loadTemplate('browse', false, function ()
    {

      $("<link/>", {
        class: "extra",
        rel: "stylesheet",
        type: "text/css",
        href: "/css/compiled/browse.css"
      }).appendTo("head");
      
      self.render();
      // get the position of the stalker after the rendering process
      self.baseStalkerScroll = 100;

      // get the products to display
      self.products = new window.themingStore.collections.ProductCollection();
      self.products.fetch({
        lastChunkArrival: function ()
        {
          self.renderProducts();
        }
      });



    });
    window.themingStore.views.AbstractView.prototype.initialize.call(this);
  },

  /**
   * renders the default view, this loads the main layout
   */
  render: function ()
  {
    this.$el.html(this.renderTemplate('#browsePage'));
  },

  /**
   * hander when the user clicks any filter
   */
  filterClicked: function (event){
    /**
     * this private method extracts the filter from the classes of the object
     * @param classes
     * @return string | null
     */
    var extractFilterClass = function (classes) {
      classes = classes.split(' ');
      for (var i = 0; i < classes.length; i++)
      {
        if (classes[i].match(/f\-[a-z]{2,}/))
        {
          return classes[i].replace(/^f\-/, '');
        }
      }
      return null;
    };

    if (this.productsReady)
    {
      // only proceed if we have the products loaded
      var $filter = $(event.target);
      var classes = $filter.attr('class');
      var filter = extractFilterClass(classes);
      if (filter)
      {
        if (this.filterApplied == filter && this.filterStack == 1)
        {
          this.filterStack = 2;
          this.products.comparator = function(product) {
            return -product.get(filter);
          };
        }
        else
        {
          this.filterApplied = filter;
          this.filterStack = 1;
          this.products.comparator = function(product) {
            return product.get(filter);
          };
        }
        this.products.sort();
        this.renderProducts();
      }
    }

    return false;
  },

  /**
   * renders the products that arrived from the rest field
   */
  renderProducts: function ()
  {
    var self = this;
    var $container = $('.products-container').html('');
    var template = $('#browseProduct').text();
    var products = '';
    // console.group("products");
    var counter = 0;
    for (var i in this.products.models)
    {
      var product = this.products.models[i];
        console.log(product);
      products += _.template(template, product.attributes);
      counter++;
      //if(counter > 3){ break;}
    }
    // console.groupEnd();
    $('.products-container').html(products);
    this.productsReady = true;
     
  },

  /**
   * fired when the window scrolls, handles the stalker classes
   * @param event
   */
  windowScroll: function (event, context)
  {
    if ($(window).scrollTop() > context.baseStalkerScroll)
    {
      $('.stalker').addClass('detached');
    }
    else
    {
      $('.stalker').removeClass('detached');
    }
  }

});
