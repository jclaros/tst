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
   * filter container cookie name
   */
  filter_cookie: 'filters_theming',
  /**
   * filter manager
   */
  currentFilterManager: {},
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
   * filtered collection
   */
  filteredCollection: false,

  /**
   * this variable tells the class if the products are usable
   */
  productsReady: false,
  /**
   * basic bind of elements
   */
  basicNavigationBind: function(){
    var self = this;
    $('.basic_cart').unbind('click').bind("click", function(event){
        window.themingStore.currentRouter.navigate("cart");
    });
    $('.login').unbind('click').bind("click", function(event){
        window.themingStore.currentRouter.navigate("login");
    });
    $('.signup').unbind('click').bind("click", function(event){
        window.themingStore.currentRouter.navigate("register");
    });
    $('.pwrfilters_indicator').unbind('click').bind('click',function(event){
      event.preventDefault();
      event.stopPropagation();
      $('.filter_pane').animate({width: "show"}, 100, "easeOutQuad", function(){
        // hide some
        $('.pwrfilters_indicator').hide();
        $('.paginator_filtered').hide();

        $('.start_here').hide();
        $('.cat_buttons').hide();
        $('.breadcrumb_container').show();
        $('.cat_buttons_power_filters').show();



        $('.button_return').unbind('click').bind('click', function(event){
          $('.filter_pane').animate({width: "hide"}, 100, "easeOutQuad", function(){
            // show element again
            $('.pwrfilters_indicator').show();
            $('.paginator_filtered').show();


            $('.breadcrumb_container').hide();
            $('.cat_buttons_power_filters').hide();
            $('.start_here').show();
            $('.cat_buttons').show();

          });
        });
      });
    });
  },
  basicFilterManagement: function(){
    this.currentFilterManager.setData(this.filter_cookie);
    this.currentFilterManager.processBindElements();

    // listen to changes by the mediator

    window.themingStore.mediator.subscribe("notification:basicAlert", this.showErrorBubled, this);
    window.themingStore.mediator.subscribe("notification:processing", this.showProcessingAlert, this);
    window.themingStore.mediator.subscribe("notification:templates:refresh", this.refreshTemplates, this);
    window.themingStore.mediator.subscribe("notification:templates:inline_filter", this.filterTemplates, this);
    window.themingStore.mediator.subscribe("notification:templates:reset_collection_master", this.filterTemplates, this);
    window.themingStore.mediator.subscribe("notification:templates:new_elements_arrived", this.filterTemplates, this);
  },
  filterTemplates: function(){
    var self = this;
    var currentCollection = self.products;
    var basequery = "";
    var _r = this.currentFilterManager.hasFirstFilterBarElements();
    if(this.currentFilterManager.hasFirstFilterBarElements()){
      basequery = this.currentFilterManager.getFirstFilterBarElements();
      currentCollection = currentCollection.byTitleDescription(basequery);
    }
    // Power filters
    if (this.currentFilterManager.hasPowerFiltersApplied())
    {
      currentCollection = currentCollection.byPowerFiltersApplied(this.currentFilterManager.getPowerFilters());
    }

    self.filteredCollection = currentCollection;
    self.renderFiltered();
  },
  showErrorBubled: function(message){
    this.showMessage(message, 'error');
  },
  showProcessingAlert: function(_basicObj){
    if(_basicObj.flag){
      //alert('processing');
    }else{
      //hide alert
      //alert('hide alert');
    }
  },
  /**
   * bind click on products
   */
  bindElements: function () {
    $('.products-container').on('click', 'article .thumbnail', function(event){
      var $container = $(this).parent();

    });
  },
  /**
   * Called upon initialization (constructor ?)
   */
  initialize: function ()
  {
    _.bindAll(
      this,
      "basicNavigationBind",
      "showErrorBubled",
      "filterTemplates",
      "renderFiltered",
      "showProcessingAlert",
      "refreshTemplates",
      "renderProducts",
      "basicFilterManagement"
    );

    this.currentFilterManager = new window.themingStore.managers.BrowseFilterManagerView();
    var self = this;
    $(window).scroll(function (event){self.windowScroll(event, self)});
    this.loadTemplate('browse', false, function ()
    {
      self.$el.removeClass('login');
      self.render();
      self.basicNavigationBind();
      self.basicFilterManagement();
      // get the position of the stalker after the rendering process
      self.baseStalkerScroll = 100;

      // get the products to display
      self.products = new window.themingStore.collections.ProductCollection();
      $('.products-container').html('');
      self.bindElements();
      self.products.reset();
      self.products.fetch({
        chunkArrival: function ()
        {
          self.renderProducts();
        },
        lastChunkArrival: function ()
        {
          self.productsReady = true;
        }
      });
    });
    window.themingStore.views.AbstractView.prototype.initialize.call(this);

  },
  /**
   *
   */
  refreshTemplates: function(){
    var self = this;
    var _filters = self.currentFilterManager.getCurrentFilter();
    $('.products-container').html('');
    self.products.reset();
    self.products.fetch({
      data:_filters,
      chunkArrival: function ()
      {
        self.renderProducts();
      },
      lastChunkArrival: function ()
      {
        self.productsReady = true;
      }
    });
  },
  /**
   * renders the default view, this loads the main layout
   */
  render: function ()
  {
    var categories = this.currentFilterManager.getCategories();
    var browsers = this.currentFilterManager.getBrowsers();

    this.$el.html(this.renderTemplate('#browsePage', {'categories': categories,
      'browsers': browsers}
    ));
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

    var _showedElements = $('article.product').map(function () {
      return parseInt($(this).attr('class').replace("product template_", ""));
    }).get();

    var template = $('#browseProduct').text();
    var products = '';
    var counter = 0;
    var product = '';
    var indx = '';
    for (var i in this.filteredCollection.models)
    {
      product = '';
      product = this.filteredCollection.models[i];
      indx = product.get('id');
      if(_showedElements.indexOf(indx) === -1){
        products += _.template(template, product.attributes);
        counter++;
      }

      if(counter % 10 == 0){
        counter = 0;
        $('.products-container').append(products);
        products = '';
      }
    }
    if(products.length > 0){
      $('.products-container').append(products);
      products = '';
    }
    _showedElements = false;

    self.filterTemplates();
    return;
  },
  /**
   * renders the filtered products that arrived from the rest field
   */
  renderFiltered: function ()
  {
    var self = this;
    // avoid this ....
    $('.products-container article').hide();

    for (var i in this.filteredCollection.models)
    {
      var product = this.filteredCollection.models[i];
      var index = product.get('id');
      $('.template_'+index).show();
    }
  },

  /**
   * fired when the window scrolls, handles the stalker classes
   * @param event
   * @param context
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
