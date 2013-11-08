/**
 * function that wraps the sync function of backbone to inject the username and
 * password if needed
 */
window.themingStore.connector = (function ()
{
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read'  : 'GET'
  };
  // Helper function to get a value from a Backbone object as a property
  // or as a function.
  var getValue = function (object, prop)
  {
    if (!(object && object[prop]))
    {
      return null;
    }
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
  };
  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function ()
  {
    throw new Error('A "url" property or function must be specified');
  };
  // public function serves as a gateway for the sync code
  this.sync = function (method, model, options, error)
  {
    if (window.themingStore.currentUser)
    {
      if (!options.headers)
      {
        options.headers = {};
      }
      if (window.themingStore.currentUser.isAuthenticated())
      {
        var _headers = window.themingStore.currentUser.getHeaders();
        for(var prop in _headers){
          options.headers[prop] = _headers[prop];
        }
      }
    }
    executeSync(method, model, options, error);
  };
  // the actual sync code
  var executeSync = function (method, model, options, error)
  {
    var type = methodMap[method];

    // Default options, unless specified._createReq: function(url, type, data, successf, errorf)
    options || (options = {});

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url)
    {
      params.url = getValue(model, 'url') || urlError();
    }

    params.model = model;

    // set the default methods to handle the chunks arrival
    params.firstChunkArrival = getValue(model, 'firstChunkArrival') || function ()
    {
    };
    params.chunkArrival = getValue(model, 'chunkArrival') || function ()
    {
    };
    params.lastChunkArrival = getValue(model, 'lastChunkArrival') || function ()
    {
    };

    // Ensure that we have the appropriate request data.
    if (!options.data && model && (method == 'create' || method == 'update'))
    {
      params.contentType = 'application/json';
      params.data = JSON.stringify(model.toJSON());
    }
    // Process data on all get requests, disable for all other ones
    if (params.type !== 'GET')
    {
      params.processData = false;
    }
    else
    {
      params.processData = true;
    }

    // store the success callback to fire it when all the chunks have arrived
    params.successFunction = options.success ? options.success : function ()
    {
    };
    options.success = handleChunks;

    // Make the request, allowing the user to override any Ajax options.
    return $.ajax(_.extend(params, options));
  };

  // handles the data arriving as chunks
  var handleChunks = function (resp, status, xhr)
  {
    if (resp.page)
    {
      var collection = this.model;
      var options    = this;
      if (collection && collection['add'])
      {
        collection.add(collection.parse(resp.results, xhr), options);
        window.themingStore.mediator.publish("notification:templates:new_elements_arrived");
      }
      // invoke the new callbacks to handle the first, last and any chunk
      if (resp.page == 1)
      {
        this.firstChunkArrival(resp, status, xhr);
      }
      this.chunkArrival(resp, status, xhr);
      if(resp.links.next){
        this.url = resp.links.next.href;
        this.model.update = true;
        this.successFunction = function (resp, status, xhr){
          if (collection && collection['add'])
          {
            collection.add(collection.parse(resp.results, xhr), options);
            window.themingStore.mediator.publish("notification:templates:new_elements_arrived");
          }
        };
        $.ajax(this);
      }else{
        this.lastChunkArrival(resp, status, xhr);
      }
    }else{
      // error in sync process
      this.successFunction(resp, status, xhr);
      this.lastChunkArrival(resp, status, xhr);
    }
  };
  return this;
})();

(function ()
{
  Backbone.sync = function (method, model, options, error)
  {
    window.themingStore.connector.sync(method, model, options, error);
  };
})();