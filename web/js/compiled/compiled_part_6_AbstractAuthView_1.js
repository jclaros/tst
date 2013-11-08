/**
 * Class that handles abstract function for register and login views
 *
 * @amed
 */
window.themingStore.views.AbstractAuthView = window.themingStore.views.AbstractView.extend({

  /**
   * Holds a flag that says the show function if a message is already
   * being displayed.
   */
  globalErrorBeingShown: false,

  /**
   * Holds a flag that says the edited field is correct
   * based on the properly validation. see verifyValueCorrectnessInLine()
   */
  isFieldValidWhileTyping: false,

  /**
   * Holds a string that indicates the last action in the form
   * that wa performed to trigger the Back icon button event.
   */
  lastAction: '',

  /**
   * Overrides the parent constructor
   */
  initialize: function () {
    window.themingStore.views.AbstractView.prototype.initialize.call(this);
  },

  /**
   * @author Jonathan Claros <jonathan.claros@syscrunch.com>
   * creates a base request to send to backend
   * @param url
   * @param type
   * @param data
   * @param successf
   * @param errorf
   * @private
   */
  _reqCreator: function (url, type, data, successf, errorf) {
    $.ajax({
      url: url,
      data: data,
      type: type,
      success: successf,
      error: errorf
    });
  },
  /**
   * @author Jonathan Claros <jonathan.claros@syscrunch.com>
   * function called to check if the user exists
   * @param email
   * @returns {boolean}
   * @private
   */
  _userexists: function (email) {
    var self = this;
    var resp = false;
    $.ajax({
      url: Routing.generate("sc_demo_security_rest_get_email_check"),
      type: "GET",
      async: false,
      xhrFields: {
        "Accept": "application/json"
      },
      data: {'_email': email},
      success: function (data, textStatus, jqXHR) {
        if (data.response != false) {
          resp = true;
        }
      }
    });

    return resp;
  },
  /**
   * @author Jonathan Claros <jonathan.claros@syscrunch.com>
   * checks if user is in session and redirect him to the appropriate location
   */
  checkLoggedUser: function () {
    if (window.themingStore.currentUser) {
      if (window.themingStore.currentUser.get('is_publisher')) {
        window.themingStore.currentRouter.navigate('dashboard');
      }
      else {
        window.themingStore.currentRouter.navigate('browse');
      }

    }
  },
  /**
   * @author Jonathan Claros <jonathan.claros@syscrunch.com>
   *   method to react to gp error on load
   */
  listenErrorsGPlusError: function () {
    var self = this;
    window.onerror = function (msg, url, linenumber) {
      if ("Error: Permission denied to access object" == msg) {
        Cookies.setCookie(self.gpluscookieerror,
          JSON.stringify({ authenticated: true }), 1);
        window.location.reload(true);
      }
    };
  },
  /**
   *  Shows an error message above the main form.
   *
   *  @param msg string The message that will be shown inside the error container
   *  @param el Object a jQuery object to be used as the element where the message
   *  will be put after.
   *  @param timeout int The value in milliseconds that the message lasts being shown.
   */
  showGlobalError: function (msg, timeout, el) {

    if (!this.globalErrorBeingShown) {
      this.globalErrorBeingShown = true;
      if (typeof el == 'undefined') {
        el = $('.logo-ts');
      }

      var errorImg = $('<img>');
      errorImg.attr('src', '/bundles/syscrunchstore/images/log_warning.png')
        .attr('alt', '!')
        .attr('Error');

      var errorMessage = $('<div></div>');
      errorMessage.addClass('message')
        .append(errorImg)
        .append(msg);

      var errorContainer = $('<div></div>');
      errorContainer.addClass('error_container')
        .append(errorMessage);

      // Append message after the main element
      el.after(errorContainer);

      var self = this;
      var _callB = function () {
        errorContainer.remove();
        self.globalErrorBeingShown = false;
      };

      if (typeof timeout == 'undefined') {
        timeout = 3000;
      }
      setTimeout(_callB, timeout);
    }
  },

  /**
   * Makes a transition by showing the sign in form after
   * hiding the form-cont.
   *
   * @param transitionHideTime int The time in milliseconds to hide the first form.
   * @param transitionShowTime int The time in milliseconds to hide the second form.
   * @param secondForm string The jQuery selector of the form to be displayed.
   * @param firstForm string The jQuery selector of the form to be hiden.
   */
  showSecondForm: function (transitionHideTime, transitionShowTime, secondForm, firstForm) {
    if (typeof transitionHideTime == 'undefined') {
      transitionHideTime = 1000;
    }
    if (typeof transitionShowTime == 'undefined') {
      transitionShowTime = 1000;
    }

    if (typeof secondForm == 'undefined') {
      secondForm = '.sign_in_form_container';
    }
    if (typeof firstForm == 'undefined') {
      firstForm = '.form-cont';
    }

    $(firstForm).animate({height: "hide"}, transitionHideTime, "easeOutQuad");
    $(secondForm).animate({height: "show"}, transitionShowTime, "easeOutQuad");
  },

  /**
   *
   *
   * @param transitionHideTime
   * @param transitionShowTime
   * @param secondForm
   * @param firstForm
   */
  showFirstForm: function (transitionHideTime, transitionShowTime, secondForm, firstForm) {
    if (typeof transitionHideTime == 'undefined') {
      transitionHideTime = 1000;
    }
    if (typeof transitionShowTime == 'undefined') {
      transitionShowTime = 1000;
    }

    if (typeof secondForm == 'undefined') {
      secondForm = '.sign_in_form_container';
    }
    if (typeof firstForm == 'undefined') {
      firstForm = '.form-cont';
    }

    $(firstForm).animate({height: "show"}, transitionHideTime, "easeOutQuad");
    $(secondForm).animate({height: "hide"}, transitionShowTime, "easeOutQuad");
  },

  /**
   * Captures the typing event in the field based on the selector
   * given as parameter, and verifies if it is valid according to a
   * validation rule defined by the type. If type is not defined, it takes
   * from the type attribute of the field.
   *
   * @param selector string jQuery string selector
   * @param type string
   */
  verifyValueCorrectnessInLine: function (selector, type) {
    var self = this;

    if (typeof type == 'undefined') {
      type = $(this).attr('type');
    }

    switch (type) {
      case 'email':
        self.validateEmailOnKeyUp(selector);
        break;

      case 'password':
        self.passwordValidation(selector);
        break;

      default:
        throw 'Provide a validation rule first!';
    }
  },

  validateEmailOnKeyUp: function (selector) {
    var self = this;
    $(selector).on('keyup', function (event) {
      var keyCode = event.keyCode;

      var textValue = $(this).val();

      var isValid = false;
      if (!(/[^\s]+/.test(textValue))) {
        isValid = false;
      }
      else {
        var emailPattern = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
        if (textValue.match(emailPattern) != null) {
          isValid = true;
        }
      }
      $('#verify_icon').remove();
      var errImg = $('<img>').attr('style', 'position: relative;top: -78%;left: 55%;width: 15%;')
        .attr('id', 'verify_icon');
      if (!isValid) {
        errImg.attr('src', '/bundles/syscrunchstore/images/log_error.png');
        self.isFieldValidWhileTyping = false;
      }
      else {
        errImg.attr('src', '/bundles/syscrunchstore/images/log_ok.png');
        self.isFieldValidWhileTyping = true;
      }
      $(this).after(errImg);
    });
  },

  passwordValidation: function (selector) {
    var passwordField = $(selector);
    var passwordConfirm = $('#conf_password');
    var self = this;


    // EMPTY FIELD
    var errImg = $('<img>').attr('style', 'position: relative;top: -78%;left: 55%;width: 15%;')
      .attr('id', 'verify_icon');
    errImg.attr('src', '/bundles/syscrunchstore/images/log_error.png');
    passwordField.after(errImg);

    $(selector + ', #conf_password').on('keyup', function (event) {

      var text1 = passwordField.val();
      var text2 = passwordConfirm.val();

      var isValid = true;
      if (!(/[^\s]+/.test(text1)) && !(/[^\s]+/.test(text2)))
      {
        isValid = false;
        self.isFieldValidWhileTyping = false;
        var errImg = $('<img>').attr('style', 'position: relative;top: -78%;left: 55%;width: 15%;')
          .attr('id', 'verify_icon');
        errImg.attr('src', '/bundles/syscrunchstore/images/log_error.png');
        $(this).after(errImg);
      }
      else
      {
        $('#verify_icon').remove();

        if (text1 !== text2)
        {
          var divBubble = $('<div></div>').attr('style', 'position: relative;top: -30px;left: 244px;').
            attr('id', 'verify_icon');
          var errImg = $('<img>')
            .attr('src', '/bundles/syscrunchstore/images/log_left_bubble_2.png').attr('style', ' width: 15px; float: left;')
            .attr('align', 'top');
          divBubble.append(errImg);

          var divMsgBubble = $('<div></div>')
            .attr('style',
              'background-color: #FFFFFF; width: auto; height: 25px;float: left;font-size: 14px;line-height: 24px;border-top-right-radius: 9px;border-bottom-right-radius: 9px;padding-right: 6px;')
            .text('Passwords do not match');
          divBubble.append(divMsgBubble);

          var divClear = $('<div class="clear"></div>');
          divBubble.append(divClear);

          passwordField.after(divBubble);
          self.isFieldValidWhileTyping = false;

        }
        else
        {
          $('#verify_icon').remove();
          self.isFieldValidWhileTyping = true;
        }
      }
    });
  },

  /**
   * Handles the Back icon button in the pages.
   *
   * @param event
   */
  makeBackRedirection: function (event){
    var self = this;
    $('.back_container').unbind("click").bind("click", function(event){
      if (self.lastAction == '')
      {
        window.themingStore.currentRouter.navigate('browse');
      }
      else
      {
        var action = self.lastAction;
        switch (action)
        {
          case 'twitter': self.showFirstForm(500, 500, '.sign_in_twitter_form_container'); break;
          case 'email_form': self.showFirstForm(); break;
        }
      }

      self.lastAction = '';
    });


  }
});
