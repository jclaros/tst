window.themingStore.views.AbstractView = Backbone.View.extend({

  baseTemplatesDir: 'live_template',

  /**
   * object to store the sub views of the main view
   */
  subviews: {},

  /**
   * a set of actions to be added to any view that extends this class
   */
  defaultActions: {
    'click .message': 'dismissMessage'
  },

  /**
   * holds the message template pre-compiled to add speed
   */
  messageTemplate: null,

  /**
   * constructor method, if overriden remember to call it
   * <code>
   * window.themingStore.views.AbstractView.prototype.initialize.call(this);
   * </code>
   */
  initialize: function () {
    // update the events in the view to contain the ones in this class too
    if (!this['events'])
    {
      this.events = {};
    }
    this.events = _.extend(this.events, this.defaultActions);
  },

  /**
   * method called when the user clicks a message, this is to dismiss it
   */
  dismissMessage: function (event) {
    // get the element who fired the click
    var $message = $(event.target);
    // check if the element is the message itself, if not get it
    if (!$message.hasClass('message'))
    {
      $message = $message.parents('.message');
    }
    // remove the message
    $message.remove();
  },

  /**
   * Renders a template based on a selector
   * @param selector a jquery selector
   * @param data
   * @param settings
   * @returns {*}
   */
  renderTemplate: function (selector, data, settings)
  {
    if (!selector)
    {
      throw 'a selector is needed !';
    }
    var $element = $(selector);
    if (!$element.length)
    {
      throw 'the selector ' + selector + ' did not match anything';
    }

    return _.template($element.text(), data, settings);
  },

  /**
   * This method loads a template asynchronously the dom to avoid
   * @param string url the path to the template to be loaded, the .view is added automatically
   * @param string name the name to give to the template in the dom, this name must be unique, optional, false can be
   * passed
   * @param function callback function to be executed when the template loads
   */
  loadTemplate: function (url, name, callback)
  {
    // create a name if we don't have one
    $('.extra').remove();
    if (!name)
    {
      name = url.replace(/\//g, '_');
    }
    if ($('#' + name).length)
    {
      // there is already an element with that name loaded, execute the callback
      if (callback)
      {
        callback();
      }
      return;
    }

    // try to get the element from the storage, first test if we have storage
    if (isStorageEnabled())
    {
      // storage is enabled, look for the unique name
      if (localStorage[name])
      {
        // name found, add the template
        addTemplateDataToPage(name, localStorage[name]);
        // perform the callback if it's defined
        if (callback) callback();
        return;
      }
    }

    // storage found nothing, perform the call to the template
    $.ajax({
      async   : true,
      cache   : true,
      dataType: 'html',
      url     : baseUrl + this.baseTemplatesDir + '/' + url + '.html',
      error   : function ()
      {
        console.error('There was a problem getting ' + url);
      },
      success : function (data)
      {
        // we got the template, let's add it to the cache if we can
        if (isStorageEnabled())
        {
          localStorage[name] = data;
        }
        // now add the elements to the page
        addTemplateDataToPage(name, data);
        // perform the callback if we can
        if (callback) callback();
      }
    });

    function addTemplateDataToPage(name, data)
    {
      var template;
      if (data.match(/^\<script/))
      {
        template = data + '<script id="' + name + '"></script>';
      }
      else
      {
        template = $('<script/>')
          .attr('id', name)
          .attr('type', 'text/html')
          .text(data);
      }
      $('head').append(template);
    }

    function isStorageEnabled()
    {
      return false;
      return (typeof Storage !== 'undefined');
    }
  },

  /**
   * loads several templates at once, when all are loaded executes the callback if it
   * was available
   * @deprecated
   * @param object options, accepts
   * * templates as array or object with the list of templates
   * * ready as callback function
   * <code>
   * this.loadTemplates({ templates: ['login'] });
   * this.loadTemplates({ templates: {login : 'login'}, ready: function () {} });
   * </code>
   */
  loadTemplates: function (options)
  {
    if (!options.templates)
    {
      // check that we have enough information
      console.error('I need an object containing templates !');
      return;
    }
    // declare the variables
    var template,
      size = this.getSize(options.templates);

    // now call the templates
    for (template in options.templates)
    {
      var name = template;
      // if the name is a number, we were given an array, create a name from
      // the template filename
      if (template.match(/^\d$/))
      {
        name = options.templates[template].replace(/[^0-9a-zA-Z]/g, '_');
      }
      // request the template
      this.loadTemplate(options.templates[template], name, function ()
      {
        // here is the callback for each template, decrease the counter
        size--;
        if (!size)
        {
          // if the size reached 0 we are done loading the templates :)
          // call the callback if it's available
          if (options.ready && typeof options.ready == 'function')
          {
            options.ready();
          }
        }
      });
    }
  },

  /**
   * Used internally to load the models or collections, executes a callback if it was
   * successfull or not
   * @deprecated
   */
  fetchModels: function (options)
  {
    if (!options.models)
    {
      // check that we have enough information
      console.error('I need an object containing the models !');
      return;
    }
    // declare the variables
    var model,
      size = this.getSize(options.models),
      callback = function ()
      {
        size--;
        if (!size)
        {
          // if the size reached 0 we are done loading the templates :)
          // call the callback if it's available
          if (options.ready && typeof options.ready == 'function')
          {
            options.ready();
          }
        }
      };

    // now fetch the models
    for (model in options.models)
    {
      var fetchOptions = options.models[model].fetchOptions;

      if (!fetchOptions)
      {
        fetchOptions = {};
      }

      fetchOptions.success = callback;
      fetchOptions.error = callback;

      options.models[model].fetch(fetchOptions);
    }
  },

  /**
   * this method displays a message with an optional icon, make sure the base elements does not get updated by any
   * call after this one
   * @param message string
   * @param icon string
   * @returns jQuery the message created
   */
  showMessage: function (message, icon)
  {
    var self = this;
    ensureMessageTemplate();

    // create the message element
    var $message = $(this.messageTemplate({message: message, icon: icon}));
    // append it to the body
    $('body').append($message);
    // remove the hidden class, this is meant to trigger any possible css animation
    $message.removeClass('transparent');

    return $message;

    /**
     * this method makes sure that the messageTemplate class variable is set
     */
    function ensureMessageTemplate()
    {
      if (!self.messageTemplate)
      {
        self.messageTemplate = _.template($('#message').html());
      }
    }
  },

  /**
   * method used to display a message with the info icon
   * @param message
   */
  showInfo: function (message) {
    this.showMessage(message, 'info');
  },

  /**
   * method used to display a message with the warning icon
   * @param message
   */
  showWarning: function (message) {
    this.showMessage(message, 'warning');
  },

  /**
   * method used to display a message with the error icon
   * @param message
   */
  showError: function (message) {
    this.showMessage(message, 'error');
  },

  /**
   * returns the size of an object
   */
  getSize: function (object)
  {
    var size = object.lenght;
    if (!size)
    {
      size = 0;
      for (var variable in object)
      {
        size++;
      }
    }
    return size;
  },

  /**
   * loads several templates at once, and fetches several objects, when all are loaded
   * executes the callback if it is available
   * @param object options, accepts
   * * templates as array or object with the list of templates
   * * models as an array or object with a list of objects to be filled
   * * ready as callback function when all is loaded
   * * templatesReady as callback function when the templates are loaded
   * * modelsReady as callback when the models are loaded
   * <code>
   * this.loadTemplates({ templates: ['login'] });
   * this.loadTemplates({ templates: {login : 'login'}, ready: function () {} });
   * </code>
   */
  loadAndFetch: function (options)
  {
    // set the counter to 0
    var callbackCounter = 0;
    // if we got no callback function define a dummy one
    if (!options.ready)
    {
      options.ready = function ()
      {
      };
    }
    if (!options.templatesReady)
    {
      options.templatesReady = function ()
      {
      };
    }
    if (!options.modelsReady)
    {
      options.modelsReady = function ()
      {
      };
    }

    if (options.templates)
    {
      // we have templates, call them
      // increase the callback counter to perform the sync with the models
      callbackCounter++;
      // load the templates
      this.loadTemplates({
        templates: options.templates,
        ready    : function ()
        {
          options.templatesReady();
          // once the templates are ready decrement the counter
          callbackCounter--;
          if (!callbackCounter)
          {
            // if the counter got to 0 execute the callback
            options.ready();
          }
        }
      });
    }

    if (options.models)
    {
      // we have models
      callbackCounter++;
      // load the templates
      this.fetchModels({
        models: options.models,
        ready : function ()
        {
          options.modelsReady();
          // once the templates are ready decrement the counter
          callbackCounter--;
          if (!callbackCounter)
          {
            // if the counter got to 0 execute the callback
            options.ready();
          }
        }
      });
    }
  }
});
