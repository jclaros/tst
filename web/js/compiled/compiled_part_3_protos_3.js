/**
 * Capitalize method for strings
 * @returns String
 */
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

/**
 * gets the day of the year of a Date object
 * @returns integer
 */
Date.prototype.getDOY = function() {
  var onejan = new Date(this.getFullYear(),0,1);
  return Math.ceil((this - onejan) / 86400000);
}

/**
 * gets the closest sunday before the date on a Date object
 * @returns Date 
 */
Date.prototype.getSunday = function() {
  d = new Date(this);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

/**
 * rewinds a week a date returning a new object
 * @returns Date 
 */
Date.prototype.rewWeek = function() {
  d = new Date(this);
  d.setDate(d.getDate() - 7);
  return d;
}

/**
 * fasts forward a week a date returning a new object
 * @returns Date 
 */
Date.prototype.ffwWeek = function() {
  d = new Date(this);
  d.setDate(d.getDate() + 7);
  return d;
}

/**
 * gets a day name followed by the month and date to display in the cells
 * @returns String 
 */
Date.prototype.getDayValue = function() {
  var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames[this.getDay()] + ' ' + (this.getMonth() + 1) 
  + ' / ' + this.getDate();
}

/**
 * gets the date formated as the us standarts
 * @returns String 
 */
Date.prototype.getUsDate = function() {
  return (this.getMonth() + 1) + ' / ' + this.getDate() + ' / ' 
  + this.getFullYear();
}

/**
 * Gets the next day of a Date object
 * @returns Date
 */
Date.prototype.nextDay = function() {
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
$.fn.serializeObject = function()
{
  var o = {};
  var a = this.serializeArray();
  $.each(a, function() {
    if (o[this.name]) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    } else {
      o[this.name] = this.value || '';
    }
  });
  return o;
};

Cookies = new function () {};
Cookies.setCookie = function (c_name,value,exdays) {
  var exdate=new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
  document.cookie=c_name + "=" + c_value;
}

Cookies.getCookie = function (c_name) {
  var i,x,y,ARRcookies=document.cookie.split(";");
  for (i=0;i<ARRcookies.length;i++)
  {
    x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
    y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
    x=x.replace(/^\s+|\s+$/g,"");
    if (x==c_name)
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
function debug_backtrace(returnValue)
{
  try
  {
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
(function() {
  var a = false,
    b = /xyz/.test(function() {
      xyz
    }) ? /\b_super\b/ : /.*/;
  this.Class = function() {};
  Class.extend = function(g) {
    var f = this.prototype;
    a = true;
    var e = new this();
    a = false;
    for (var d in g) {
      e[d] = typeof g[d] == "function" && typeof f[d] == "function" && b.test(g[d]) ? (function(h, i) {
        return function() {
          var k = this._super;
          this._super = f[h];
          var j = i.apply(this, arguments);
          this._super = k;
          return j
        }
      })(d, g[d]) : g[d]
    }

    function c() {
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

  function createSlideshow(item)
  {
    var $item     = $(item);

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