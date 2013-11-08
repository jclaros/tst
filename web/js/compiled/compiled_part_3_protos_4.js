/**
 * Capitalize method for strings
 * @returns String
 */
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

/**
 * gets the day of the year of a Date object
 * @returns integer
 */
Date.prototype.getDOY = function () {
  var onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((this - onejan) / 86400000);
}

/**
 * gets the closest sunday before the date on a Date object
 * @returns Date
 */
Date.prototype.getSunday = function () {
  d = new Date(this);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

/**
 * rewinds a week a date returning a new object
 * @returns Date
 */
Date.prototype.rewWeek = function () {
  d = new Date(this);
  d.setDate(d.getDate() - 7);
  return d;
}

/**
 * fasts forward a week a date returning a new object
 * @returns Date
 */
Date.prototype.ffwWeek = function () {
  d = new Date(this);
  d.setDate(d.getDate() + 7);
  return d;
}

/**
 * gets a day name followed by the month and date to display in the cells
 * @returns String
 */
Date.prototype.getDayValue = function () {
  var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames[this.getDay()] + ' ' + (this.getMonth() + 1)
           + ' / ' + this.getDate();
}

/**
 * gets the date formated as the us standarts
 * @returns String
 */
Date.prototype.getUsDate = function () {
  return (this.getMonth() + 1) + ' / ' + this.getDate() + ' / '
    + this.getFullYear();
}

/**
 * Gets the next day of a Date object
 * @returns Date
 */
Date.prototype.nextDay = function () {
  d = new Date(this);
  d.setDate(d.getDate() + 1);
  return d;
}

/**
 * Gets the key day that is a string representation concatenating the full year
 * and the day of the year
 * ex: 2011-245
 * @returns String
 */
Date.prototype.getKeyDay = function () {
  return this.getFullYear() + '-' + this.getDOY();
}

/**
 * Adds a method to serialize a form into a json object
 */
$.fn.serializeObject = function ()
{
  var o = {};
  var a = this.serializeArray();
  $.each(a, function () {
    if (o[this.name]) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    }
    else {
      o[this.name] = this.value || '';
    }
  });
  return o;
};

Cookies = new function () {};
Cookies.setCookie = function (c_name, value, exdays) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
  document.cookie = c_name + "=" + c_value;
}

Cookies.getCookie = function (c_name) {
  var i, x, y, ARRcookies = document.cookie.split(";");
  for (i = 0; i < ARRcookies.length; i++)
  {
    x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
    y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
    x = x.replace(/^\s+|\s+$/g, "");
    if (x == c_name)
    {
      return unescape(y);
    }
  }
}

/**
 * Funcion to help debug the javascript call stacks by simulating an exception
 * @param returnValue boolean
 * @returns {*}
 */
function debug_backtrace (returnValue)
{
  try {
    var i = null;
    i.something();
  }
  catch (error)
  {
    if (error.stack)
    {
      if (returnValue)
      {
        return error.stack;
      }
      console.log(error.stack);
      return;
    }
    console.error('Cannot backtrace in this environment, check your browser documentation');
    return null;
  }
}

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function () {
  var a = false,
    b = /xyz/.test(function () {
      xyz
    }) ? /\b_super\b/ : /.*/;
  this.Class = function () {};
  Class.extend = function (g) {
    var f = this.prototype;
    a = true;
    var e = new this();
    a = false;
    for (var d in g) {
      e[d] = typeof g[d] == "function" && typeof f[d] == "function" && b.test(g[d]) ? (function (h, i) {
        return function () {
          var k = this._super;
          this._super = f[h];
          var j = i.apply(this, arguments);
          this._super = k;
          return j
        }
      })(d, g[d]) : g[d]
    }

    function c () {
      if (!a && this.init) {
        this.init.apply(this, arguments)
      }
    }

    c.prototype = e;
    c.prototype.constructor = c;
    c.extend = arguments.callee;
    return c
  }
})();

jQuery.fn.sysCrunchMultiSelect = function (params) {
  var defaults = {
  };

  var options = $.extend({}, defaults, params);

  $(this).each(function (i, item) {
    createSlideshow(item);
  });

  function createSlideshow (item)
  {
    var $item = $(item);

    if ($item.attr('data-dropdown'))
    {
      return;
    }
    $item.attr('data-dropdown', 'true');

    $item.hide();
    var itemValue = $item.val();

    if ($elements.length)
    {
      $elements.first().addClass(options.visibleClass);
    }
    if ($elements.length > 1)
    {
      addArrows($item);
      showHideArrow(index);
      delegateClicks();
    }
  }
};

if (!window.classes)
{
  window.classes = {};
}
/**
 * this class provides a semaphore behavior, use the _call to call functions that need to be in wait, multiple inherit
 * this class
 * @type {window.classes.readySemaphore}
 */
window.classes['readySemaphore'] = Class.extend({
  /**
   * the flag that determines if the semaphore is set to stop or go
   * @private
   */
  _ready       : false,
  /**
   * This flag is meant to tell if the watcher is on place listening the previous flag
   * @private
   */
  _watched     : false,
  /**
   * An array that holds all the calls made before the semaphore is ready
   * @private
   */
  _queue       : [],
  /**
   * performs a call to a callable arriving as a function or an object
   * @param {function|object} callable
   * @private
   */
  _call        : function (callable) {
    if (this._ready)
    {
      // the class is ready, perform the call to the method
      switch (typeof callable)
      {
        case 'function':
          callable.apply(this);
          break;
        case 'object':
          var functionToCall = callable['function'] ? callable['function'] : (function () {});
          var context = callable['context'] ? callable['context'] : this;
          var argumentsArray = callable['arguments'] ? callable['arguments'] : [];
          functionToCall.apply(context, argumentsArray);
          break;
        default :
          // do nothing
          break;
      }
    }
    else {
      if (!this._watched)
      {
        // the flag is not being watched, place the watcher
        this._watched = true;
        // declare a closure, this is to maintain the ready in memory while avoiding the death lock of the setter
        (function () {
          // the private new variable that receives the previous value of the _ready variable
          var ready = this._ready;
          // remove the _ready property from the object
          delete(this['_ready'])
          // define the new property using a getter and a setter
          Object.defineProperty(this, '_ready', {
            set: function (value) {
              ready = value;
              this._dequeueCalls();
            },
            get: function () {
              return ready;
            }
          });
        }).bind(this)();
      }
      // the class is not ready, enqueue the calls
      switch (typeof callable)
      {
        case 'function':
          this._queue.push({
            'function' : callable,
            'context'  : this,
            'arguments': []
          });
          break;
        case 'object':
          var functionToCall = callable['function'] ? callable['function'] : (function () {});
          var context = callable['context'] ? callable['context'] : this;
          var argumentsArray = callable['arguments'] ? callable['arguments'] : [];
          this._queue.push({
            'function' : functionToCall,
            'context'  : context,
            'arguments': argumentsArray
          });
          break;
        default :
          // do nothing
          break;
      }
    }
  },
  /**
   * Executes the queue of methods waiting if the object is ready
   * @param {string} id the name of the element
   * @param oldVal the old value
   * @param newVal the new value
   * @private
   */
  _dequeueCalls: function () {
    _.each(this._queue, (function (callable) {
      this._call(callable);
    }).bind(this));
  }
});

// namespace for methods
if (!window.functions)
{
  window.functions = {};
}
/**
 * Extends an object inhereting it's properties into the context
 * @param {object} context the living object that will receive the definition
 * @param {string} definitionToInherit a string containing the definition that will be inhereted by the context
 */
window.functions['multipleInherit'] = function (context, definitionToInherit) {
  var definition = null;
  // create a living object
  eval('definition = new ' + definitionToInherit + '();');
  // if the object was created clone it into the context
  if (definition)
  {
    for (var key in definition)
    {
      if (!context[key])
      {
        context[key] = definition[key];
      }
    };
    // free the memory
    delete definition;
  }
  else
  {
    console.warn('The definition "' + definitionToInherit + '" was not found.');
  }
}