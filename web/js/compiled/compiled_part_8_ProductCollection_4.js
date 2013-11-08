/**
 * Class that defines a collection of products
 */
window.themingStore.collections.ProductCollection = window.themingStore.collections.AbstractCollection.extend({
  /**
   * backbone model to represent with the collection
   */
  model: window.themingStore.models.ProductModel,

  // do not use url, it is generated using the type
  /**
   * The type of content to get from drupal service layer, this value helps create the url
   */
  type: 'template',

  url: Routing.generate('api_template_list'),

  byTitleDescription: function(_basic_query){
    var filtered = this.filter(function(product){
      return ((product.get('title') && product.get('title').indexOf(_basic_query) !== -1) || (product.get('description') && product.get('description').indexOf(_basic_query) !== -1));
    });
    return new window.themingStore.collections.ProductCollection(filtered);
  },

  /**
   * Applies the detailed filters from the left menu.
   *
   * @author Amed Ibañez Andrade <amed.ibanez@syscrunch.com>
   * @returns {window.themingStore.collections.ProductCollection}
   */
  byPowerFiltersApplied: function (powerFilters){

    var partialFiltered = [];
    for (var f in powerFilters)
    {
      switch (f)
      {
        case 'category':
          partialFiltered = partialFiltered.concat(this.byCategory(powerFilters[f]));
          break;
        case 'browser' :
          partialFiltered = partialFiltered.concat(this.byBrowser(powerFilters[f]));
          break;
      }
    }

    if (partialFiltered.length == 0)
    {
      window.themingStore.mediator.publish("notification:templates:reset_collection_master");
    }
    else
    {
      return new window.themingStore.collections.ProductCollection(partialFiltered);
    }
  },

  /**
   * Filters all templates/products by the selected categories from Power Filters.
   *
   * @author Amed Ibañez Andrade <amed.ibanez@syscrunch.com>
   * @param categoryIds
   * @returns {Array}
   */
  byCategory: function (categoryIds){
    var filtered = [];
    for (var c = 0; c < categoryIds.length; c++) // Iterates all categories selected from UI.
    {
      this.filter(function(product){
        if (product.get('category')[0] != void 0)
        {
          if (product.get('category')[0].id == categoryIds[c])  // Matching the associated category id for this template/product
          {
            filtered.push(product);
          }
        }
      });
    }

    return filtered;
  },

  /**
   * Filters all templates/products by the selected browsers from Power Filters.
   *
   * @author Amed Ibañez Andrade <amed.ibanez@syscrunch.com>
   * @param browserIds
   * @returns {Array}
   */
  byBrowser: function (browserIds){
    var filtered = [];
    for (var c = 0; c < browserIds.length; c++) // Iterates all browsers selected from UI.
    {
      this.filter(function(product){
        if (product.get('browser')[0] != void 0)
        {
          if (product.get('browser')[0].id == browserIds[c])  // Matching the associated browser id for this template/product
          {
            filtered.push(product);
          }
        }
      });
    }

    return filtered;
  }
});