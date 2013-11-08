/**
 * abstract class with logic that several collections share
 */
//window.themingStore.collections.AbstractCollection = Backbone.Collection.extend({
window.themingStore.collections.AbstractCollection = Backbone.Collection.extend({
  /**
   * Searches the rest layer for matches to the input arriving inside the params object
   * @param {Object} params object with parameters for the function
   * * term
   * * ready
   * @this {window.themingStore.collections.CityGeoCollection}
   */
  search: function (params) {
    this.fetch({
      processData: true,
      data   : {name: params.term + '%'},
      success: this._createParser(params),
      error  : this._createParser(params)
    });
  },

  /**
   * method that creates the url based on the type
   * @final
   */
  url: function () {
    if (!this.type)
    {
      throw new Error('Define the type of the collection before proceeding');
    }
    var url = this.model.get('url');

    return url;
  },

  /**
   * This method is meant to treat collections of enumerators that should only
   * be fetched once
   * @param  {object} options the object with options to use the fetch
   */
  fetchOnce: function (options) {
    // perform the regular fetch if we have not retrieved the models or the
    // option forceFetch is set to true
    if (!this.models || options['forceFetch'])
    {
      return this.fetch(options);
    }
    // execute the callback if it's defined
    if (options['success']) options.success();
  },

  /**
   * Creates a function to parse the search results when the search is complete
   * @param {Object} params object with parameters for the function
   * * term
   * * ready
   * @return {function}
   * @this {window.themingStore.collections.CityGeoCollection}
   * @private
   */
  _createParser: function (params) {
    return function (collection) {
      if (_.size(collection))
      {
        var elements = new Array();
        _.each(collection.models, function (element) {
          if (element.get('name'))
          {
            elements.push({
              label: element.get('name'),
              value: element.get('id')
            });
          }
        });
        params.ready(elements);
      }
      else
      {
        params.ready([]);
      }
    };
  }
});