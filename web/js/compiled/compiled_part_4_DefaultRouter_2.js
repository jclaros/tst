window.themingStore.routers.DefaultRouter = Backbone.Router.extend({
  /**
   * this flag is to allow the router to delay actions when loading resources
   */
  routerReady: true,

  /**
   * this array contains the queue of calls delayed when the router is not ready
   */
  queueCalls: [],

  /**
   * routes available
   */
  routes      : {
    "login" : "login",
    'logout': 'logout',

    'dashboard': 'dashboard',

    'product/*path': 'product',

    'cart'      : 'cart',
    'cart/*path': 'cart',

    'campaigns/:param1/:param2/:param3': 'campaigns',

    "register": "registerUser",

    "thanks" : 'thanksSignup',

    "confirm-password": "passwordConfirmation",

    "*browse": "defaultRoute"
  },
    /**
     * This method loads a view, if the view is already created just calls to the action, triggers "viewChanged" when the
     * view is updated, also triggers "routeUpdated"
     * event when the action is completed
     * @param {string} page the name of the view, the name will be capitalized and the word view will be appended
     * @param {string} [action="index"] the action to call, if this is empty defaults to "index"
     * @param {object} [parameters={}] an object to be passed to the constructor of the view
     * @param additional arguments are passed to the action method
     */
  loadView  : function (page, action, parameters)
  {
    // no parameters arrived, create an empty object
    if (!parameters)
    {
      parameters = {};
    }
    // set the body as the element
    parameters.el = 'body';
    // get the class name and get the definition
    var className = page.capitalize();
    var classDefinition = window.themingStore.views[className + 'View'];
    // if the class is not defined stop the process
    if (!classDefinition)
    {
      var message = 'The class definition is missing for ' + className + 'View';
      throw message;
      alert(message);
    }
    // update the current view only if it's necessary
    if (!(
      window.themingStore.currentView
        instanceof classDefinition
      ))
    {
      $('*').unbind('scroll').unbind('click').unbind('change').unbind('submit');
      delete window.themingStore.currentView;
      window.themingStore.currentView = new classDefinition(parameters);
      // trigger the custom event to let know the application the view has changed
      $(document).trigger("viewChanged", window.themingStore.currentView);
      // when changing pages try to update the title
      if (window.themingStore.currentView.title)
      {
        $(document).attr('title', classDefinition.title);
      }
    }
    // create the array of new arguments to perform a dynamic call if it's needed
    var newArguments = new Array();
    // if there is no action assume index is being called
    if (!action)
    {
      action = 'index';
    }
    else // there is an action, treat the possible path arriving to send as new arguments
    {
      var segments = action.split('/');
      action = segments[0] ? segments[0] : 'index';
      // add each additional segment as part of the arguments for the action method
      for (var i = 1; i < segments.length; i++)
      {
        newArguments.push(segments[i]);
      }
    }
    // if the method does no exist skip totally
    if (window.themingStore.currentView[action])
    {
      // create an array of parameters with the extra parameters to pass to the action
      if (arguments.length > 3)
      {

        for (var i = 3; i < arguments.length; i++)
        {
          newArguments.push(arguments[i]);
        }
      }
      // at this point newArguments contains only the "extra" arguments passed to the method, invoke the method in the
      // class context with the extra arguments
      this.safeCall(window.themingStore.currentView[action], window.themingStore.currentView, newArguments);
    }
    else
    {
      $(document).trigger('routeUpdated');
    }
  },
  /**
   * "correct" way to redirect the browser to a new page, use this instead of the hash directly, this is to add
   * functionality here if needed for all redirections
   * @param page
   */
  navigate  : function (page)
  {
    window.location.hash = '/' + page;
  },
  /**
   * this method checks if the user has a session active
   */
  checkLogin: function ()
  {
    var user = new window.themingStore.models.UserModel();
    if (user.isAuthenticated())
    {
      window.themingStore.currentUser = user;
      return true;
    }
    window.themingStore.currentUser = null;
    return false;
  },
  /**
   * constructor, just in case
   */
  initialize: function ()
  {
    var self = this;
    var loader = new window.themingStore.views.AbstractView();
    this.routerReady = false;
    loader.loadTemplate('common', false, function ()
    {
      callQueuedMethods();
      self.routerReady = true;
    }, true);
    self.queueCalls.push(this.checkLogin());

    /**
     * this private method loops trough the array of queued methods calling them one by one
     */
    function callQueuedMethods()
    {
      // loop trough the queue, the length gets updated on each shift call
      while (self.queueCalls.length)
      {
        // get the call updating the array
        var call = self.queueCalls.shift();
        switch (typeof call)
        {
          case 'function':
            call.apply(self);
            break;
          case 'object':
            var functionToCall = call['function'];
            var context = call['context'];
            var argumentsArray = call['argumentsArray'];
            if (functionToCall)
            {
              self.performCall(functionToCall, context, argumentsArray);
            }
            else
            {
              console.error('The function is not available');
            }
            break;
          default :
            // do nothing
            break;
        }
      }
      $(document).trigger('routeUpdated');
    }
  },

  /**
   * this methods performs a call making sure the method has all it needs
   * @param functionToCall
   * @param context
   * @param argumentsArray
   */
  performCall: function (functionToCall, context, argumentsArray)
  {
    // make sure we have everything
    if (!context)
    {
      context = this;
    }
    if (!argumentsArray)
    {
      argumentsArray = [];
    }
    functionToCall.apply(context, argumentsArray);
    $(document).trigger('routeUpdated');
  },

  /**
   * this method performs a safe call ensuring the router is ready, if not it adds the call to the queque to be executed
   * when everything is safe
   * @param functionToCall
   */
  safeCall    : function (functionToCall, context, argumentsArray)
  {

    if (this.routerReady)
    {
      // if the router is ready call the method directly
      this.performCall(functionToCall, context, argumentsArray);
    }
    else
    {
      // if not, add the method to the queue storing all information in an object
      this.queueCalls.push(
        {
          'function'      : functionToCall,
          'context'       : context,
          'argumentsArray': argumentsArray
        }
      );
    }
  },
  /**
   * method invoked to display the login page
   */
  login       : function ()
  {
    this.loadView('login');
  },
  /**
   * method invoked to logout from the system
   */
  logout      : function ()
  {
    this.loadView('login', 'logout');
  },
  /**
   * renders the dashboard
   */
  dashboard   : function ()
  {
    this.loadView('dashboard');
  },
  /**
   * called for the crud of a single product
   */
  product     : function (path)
  {
    this.loadView('product', path)
  },
  /**
   * method called to draw the cart and it's inner pages
   * @param {string} [path]
   */
  cart: function (path)
  {
    this.loadView('cart', path);
  },
  /**
   * default route to be called, browse
   */
  defaultRoute: function ()
  {
    this.navigate('browse');
    this.loadView('browse', 'logout');
  },

  /**
   * method invoked to display the register page
   */
  registerUser    : function ()
  {
    this.loadView('register');
  },

  thanksSignup: function (){
    this.loadView('thanksSignup');
  },

  passwordConfirmation: function (){
    this.loadView('PasswordConfirm');
  }
});
