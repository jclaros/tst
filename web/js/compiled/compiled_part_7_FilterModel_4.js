/**
 * theming-store-symfony
 * Owner: Jonathan Claros <jonathan.claros@syscrunch.com>
 * Date: 8/30/13
 * Time: 11:47 AM
 */
window.themingStore.models.FilterModel = window.themingStore.models.AbstractModel.extend({
  defaults: {
    'elements'          : [],
    'master_type'       : "all",
    'base_query'        : false,
    'power_filters'     : {}
  },
  masterType: false,
  /**
   * the type of the model, required for save operations
   */
  type: 'filter',
  initialize: function(){
    _.bindAll(
      this,
      "setMasterType",
      "setMasterQuery"
    );
    return this;
  },
  setMasterType: function(_mastertype){
    this.set('master_type', _mastertype);
  },
  setMasterQuery: function(_dat){
    this.set('base_query', _dat);
  },

  /**
   * Appends a new power filter to the respective type
   * of filter. If it not exists it will be created.
   *
   * @author Amed Ibañez Andrade <amed.ibanez@syscrunch.com>
   * @param type
   * @param newFilter
   */
  addPowerFilter: function (type, newFilter){

    var currentFilters = this.get('power_filters');

    if (currentFilters[type] == void 0)
    {
      currentFilters[type] = [];
    }

    currentFilters[type].push(newFilter);
    this.set('power_filters', currentFilters);
  },

  /**
   * Removes the selected filter when it is not selected anymore.
   * The type also is removed if there is no more filter selected
   * for that type/category.
   *
   * @author Amed Ibañez Andrade <amed.ibanez@syscrunch.com>
   * @param type
   * @param newFilter
   */
  removePowerFilter: function (type, newFilter){
    var currentFilters = this.get('power_filters');
    if (currentFilters[type] != void 0)
    {
      var indexFound = currentFilters[type].indexOf(newFilter);
      if (indexFound != -1)
      {
        currentFilters[type].splice(indexFound, 1);
      }
    }

    if (currentFilters[type].length == 0)
    {
      delete currentFilters[type];
    }

    this.set('power_filters', currentFilters);
  }
});
