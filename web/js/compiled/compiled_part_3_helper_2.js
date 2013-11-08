window.themingStore.helper = new (
  function ()
  {
    /**
     * this method is meant to be used as aid adding dynamic content passed optionally to some sub-templates and not on
     * another ones, for example the menu at the bottom of the title
     * @param string
     * @returns string
     */
    this.renderContent = function (data, defaultValue)
    {
      // create a default value to output
      if (!defaultValue)
      {
        defaultValue = '';
      }
      // get the context of arguments
      var context = arguments.callee.caller.arguments[0];
      // check if the context has the required variable
      if (context[data])
      {
        return context[data];
      }
      // return the default if the function did not end earlier
      return defaultValue;
    };

    /**
     * renders a partial content
     * @param selector string
     * @param data object
     * @returns string
     */
    this.renderPartial = function (selector, data)
    {
      if (!selector)
      {
        throw "The function needs a name to render";
      }
      if (!data)
      {
        data = {};
      }
      /*for (var i in data)
      {
        var $object = $(data[i]);
        if ($object.length)
        {
          data[i] = _.template($object.html(), data);
        }
      }*/
      var $content = $(selector);
      if (!$content.length)
      {
        console.error('no content found with the selector ' + selector);
      }
      return _.template($content.html(), data);
    };

    return this;
  }
  )();