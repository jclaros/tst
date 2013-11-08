window.themingStore.models.AbstractModel = Backbone.Model.extend({
  /**
   * rest url to push or post the product
   * @final
   */
  url: function ()
  {
    alert(window.themingStore.restPath);
    // FIXME: remove this when it's functional
    return window.themingStore.restPath;

    /**
     * function that helps create the complete url to push an update to an object
     * @param identifier
     */
    var checkId = (function (identifier)
    {
      if (this.get(identifier))
      {
        return '/' + this.get(identifier) + '.json';
      }
      return '';
    }).bind(this);

    // actual code begins here
    this._checkType();
    var basePath = window.themingStore.restPath;
    if (basePath[basePath.length - 1] != '/')
    {
      basePath += '/';
    }
    if (this.type == 'user')
    {
      basePath += 'user';
      basePath += checkId('uid');
    }
    else if (this.type == 'file')
    {
      basePath += 'file';
      basePath += checkId('fid');
    }
    else if (this.type == 'taxonomy')
    {
      basePath += 'taxonomy_term';
      basePath += checkId('tid');
    }
    else
    {
      basePath += 'node';
      basePath += checkId('nid');
    }

    return basePath;
  },

  /**
   * This method overrides the get functionality providing a getter that can
   * work using drupal regionalized data
   */
  get: function (key, defaultValue) {
    // if no default value was specified assume null
    if (!defaultValue) defaultValue = null;
    // get the value from the object using the parent's method
    var value = Backbone.Model.prototype.get.call(this, key);
    // check if the value is internationalized
    if (typeof value == 'object')
    {
      if (value[this.get('language')])
      {
        return value[this.get('language')];
      }
    }
    // if we got any value not internationalized, return it
    if (value)
    {
      return value;
    }
    // no value found, return the default
    return defaultValue;
  },

  /**
   * override of the save option, to handle the product type
   */
  save: function (data, options)
  {
    this._checkType();
    data.type = this.type;
    // call the parent's save
    Backbone.Model.prototype.save.call(this, data, options);
  },

  /**
   * fetches information from the rest layer
   * rest
   * @param options object with options of the fetch
   * @final
   */
  fetch: function (options)
  {
    Backbone.Model.prototype.fetch.call(this, options);
    this.id = true;
  },

  /**
   * checks if the type is set in the class
   * @private
   */
  _checkType: function () {
    if (!this.type)
    {
      throw new Error('Need the type of model to proceed')
    }
  }
});