/**
 * theming-store-symfony
 * @author Jonathan Claros <jonathan.claros@syscrunch.com>
 * Date: 8/29/13
 * Time: 5:41 PM
 */
window.themingStore.managers.BrowseFilterManagerView = window.themingStore.views.AbstractView.extend({
  /**
  * param to be set up by the view calling this manager
   */
  cookie_name: "",
  /**
   * the filter applied to the collection
   */
  filterApplied: false,
  /**
   * flag to know how many times a filter has been applied
   */
  filterStack: 0,
  /**
   * All possible category filters to apply.
   */
  'filter_categories' : ['featured', 'template_type', 'wordpress', 'published_date', 'category', 'browser', 'layout_type',
    'price_range', 'minimum_score', 'minimum_sales', 'minimum_views', 'minimum_shares', 'with_tags'],

  /**
   * Called upon initialization (constructor ?)
   */
  initialize: function (){
    this.filterApplied = new window.themingStore.models.FilterModel();

    /*
     * HERE ALL DATA ELEMENTS FROM BACKEND TO RENDER FILTER UI
     */
    // Categories
    this.categories = new window.themingStore.collections.CategoryCollection();
    this.categories.fetch({async: false});
    // Browsers
    this.browsers = new window.themingStore.collections.BrowserCollection();
    this.browsers.fetch({async: false});

    _.bindAll(
      this,
      "processBindElements",
      "changeMasterType",
      "hasFirstFilterBarElements",
      "getFirstFilterBarElements",
      "getCurrentFilter",
      "setData"
    );
    return this;
  },
  setData: function(_cookie_name){
    this.cookie_name = _cookie_name;
  },
  changeMasterType: function (){
    switch (this.filterApplied.get("master_type")){
      case 'wp':
        $('#template_type').val(1);
        //show wp compat selectors
        $('.wp_compat_selector').show();

        break;
      case 'ht':
        $('#template_type').val(2);
        $('.wp_compat_selector').hide();

        break;
      default:
        $('#template_type').val(3);
        $('.wp_compat_selector').hide();
        break;
    }
  },
  processBindElements: function(){
    var self = this;

    //bind actions

    window.themingStore.mediator.subscribe("notification:filters:master_type_change", this.changeMasterType, this);

    // current listeners
    $('.cat_buttons_container').on("click", 'li', function(event){
      // change filter content cause the main filter has been triggered
      if($(this).hasClass('wp_master_filter')){
        self.filterApplied.setMasterType('wp');
      }else if($(this).hasClass('html5_master_filter')){
        self.filterApplied.setMasterType('ht');
      }else if($(this).hasClass('ec_master_filter')){
        self.filterApplied.setMasterType('ec');
      }
      window.themingStore.mediator.publish("notification:filters:master_type_change");
      window.themingStore.mediator.publish("notification:templates:refresh");
    });

    $('.cat_buttons_power_filters div').on("click", 'a', function(event){

      // change filter content cause the main filter has been triggered
      if($(this).hasClass('wp_master_filter')){
        self.filterApplied.setMasterType('wp');
      }else if($(this).hasClass('html5_master_filter')){
        self.filterApplied.setMasterType('ht');
      }else if($(this).hasClass('ec_master_filter')){
        self.filterApplied.setMasterType('ec');
      }
      window.themingStore.mediator.publish("notification:filters:master_type_change");
      window.themingStore.mediator.publish("notification:templates:refresh");
    });

    $(".sear_bar input").keydown(function(event){
      var code = (event.keyCode ? event.keyCode : event.which);
      var _resp = false;
      switch (code){

        case 13:
          event.stopPropagation();
          event.preventDefault();
          var _query = $(this).val();
          _query = $.trim(_query);
          if(_query.length > 0){
            self.filterApplied.set('base_query',_query);
            // execute inine filter
            window.themingStore.mediator.publish("notification:processing", {"flag":true});
            window.themingStore.mediator.publish("notification:templates:inline_filter");
          }else{
           _resp = true;
            self.filterApplied.set('base_query',false);
            window.themingStore.mediator.publish("notification:templates:reset_collection_master");
          }
          break;
        default:
          _resp = true;
          break;
      }
      return _resp;
    });

    // Power filters
    $('.filter-target').unbind('click').bind('click', function (event){
      var filterSelected = $(event.currentTarget);
      var filter_type = $(this).attr('filter_type');
      var filter_val = filterSelected.find('.filter-id').val();

      if (!filterSelected.find('.checked_element').hasClass('on'))
      {
        self.filterApplied.addPowerFilter(filter_type, filter_val);
        filterSelected.find('.checked_element').addClass('on');
      }
      else
      {
        self.filterApplied.removePowerFilter(filter_type, filter_val);
        filterSelected.find('.checked_element').removeClass('on');
      }
      window.themingStore.mediator.publish("notification:processing", {"flag":true});
      window.themingStore.mediator.publish("notification:templates:inline_filter");
    });

  },
  loadTemplate: function (url, name, callback)
  {
    return;
  },
  getCurrentFilter: function(){
    return this.filterApplied.attributes;
  },
  getFirstFilterBarElements: function(){
    return this.filterApplied.get('base_query');
  },
  hasFirstFilterBarElements: function(){
    return (this.getFirstFilterBarElements() && this.getFirstFilterBarElements().length > 0)? true : false;
  },

  hasPowerFiltersApplied: function (){
    var isThereAtLeastOne = false;
    for (var key in this.filterApplied.get('power_filters'))
    {
      isThereAtLeastOne = true;
      break;
    }
    return isThereAtLeastOne;
  },

  getFilterCategories: function (){
    return this.filter_categories;
  },

  /**
   * Retrieves a Backbone collection of Category entities
   *
   * @returns {*}
   */
  getCategories: function (){
    return this.categories;
  },

  getPowerFilters: function (){
    return this.filterApplied.get('power_filters');
  },

  /**
   * Retrieves a Backbone collection of Browser entities
   *
   * @returns {*}
   */
  getBrowsers: function (){
    return this.browsers;
  }
});