/**
 * Class that handles the register view
 */
window.themingStore.views.RegisterView = window.themingStore.views.AbstractAuthView.extend({
  $el: $('body'),

  /**
   * Holds the Facebook uid to attach it to the user
   * who is attempting to register.
   */
  fbUid: '',

  /**
   * Holds the Facebook access token to attach it to the user
   * who is attempting to register.
   */
  fbAccessToken: '',

  /**
   * Holds the Twitter id to attach it to the user
   * who is attempting to register.
   */
  twId: '',

  /**
   * Holds the Twitter token to attach it to the user
   * who is attempting to register.
   */
  twToken: '',

  /**
   * Holds the Twitter token secret to attach it to the user
   * who is attempting to register.
   */
  twTokenSecret: '',

  /**
   * holds the url where the request must be pointed
   */
  baseThirdPartyAuthUrl: window.themingStore.restPath + "user/login_third",

  /**
   * Hols a flag the defines whether to fire the google plus authentication callback.
   */
  allow_gplus_trigger_authorize: false,

  /**
   * Flag that holds a boolean which indicates the form to sign up with Twitter
   * is ready to send. It is not ready when other social network buttons are being
   * displayed.
   */
  signUpTwitterReady: false,

  /**
   * Flag that holds a boolean which indicates the form to sign up with Email
   * is ready to send. It is not ready when other social network buttons are being
   * displayed.
   */
  signUpEmailReady: false,

  /**
   * scope
   */
  events         : {
    'submit #registerForm': 'registerFormSubmit',
    /*'click .back_container': 'goBack',*/
    'click .gray-button': 'displayEmailRegisterForm',
    'click #sign_up_email': 'sendEmailRegistrationForm',
    'click #sign_up_twitter': 'sendTwitterRegistrationForm'
  },

  initialize: function (){
    // basic listener
    _.bindAll(
      this,
      "performCallb",
      "_listenerFacebookConnected",
      "index",
      "_bindFBRegisterButton",
      "_listenerTwitter"
    );

  },

  /**
   * Renders the register layout.
   */
  index: function (){
    // if there is a user in session redirect him to the browse page
    if (window.themingStore.currentUser)
    {
      window.themingStore.currentRouter.navigate('browse');
    }

    var self = this;
    this.loadTemplate('register', false, function ()
    {
      self.$el.addClass('login');
      var googleClientId = window.themingStore.SfConfig.google_clientid;
      var dataView = {'google_clientid': googleClientId};
      self.$el.html(self.renderTemplate('#registerPage', dataView));

      $('.signup-sug').unbind("click").bind("click", function(){
          window.themingStore.currentRouter.navigate("login");
      });
      $('.signup').unbind("click").bind("click", function(){
          window.themingStore.currentRouter.navigate("login");
      });
      self._listenerFacebookConnected();
      self._listenerTwitter();

      FB = null;
      window._is_initialized = false;
      $.getScript('//connect.facebook.net/en_US/all.js', function(){
        $(document).trigger("fbloaded");
      });

      // Twitter register step 2
      var $cookie = Cookies.getCookie("tw_second_step");
      if($cookie)
      {
        // logged via twitter proceed with the authentication
        self._proceedTwAuth();
      }

      // Google+ registration
      callBfunction = self.signInPlusOne;

      // Button go Back
      self.makeBackRedirection();
    });
  },

  goBack: function (event){
    window.history.back();
  },

  displayEmailRegisterForm: function (event){
    event.preventDefault();

    var isValid = this.validateForm();
    if (isValid)
    {
      if (!this.signUpEmailReady)
      {
        this.hideAllButEmailReg();
        this.signUpEmailReady = true;
      }
    }
  },

  hideAllButEmailReg: function (){
    this.showSecondForm(500, 500);
    this.verifyValueCorrectnessInLine('#email_field', 'email');
    this.lastAction = 'email_form';
  },

  /**
   * Makes the ajax form sent.
   *
   * @param event
   */
  sendEmailRegistrationForm: function (event){

    var self = this;
    // parent attribute.
    if (this.isFieldValidWhileTyping)
    {
      var email = $('#email_field').val();
      var isDuplicated = false;
      // validate duplicated email
      $.ajax({
        url: Routing.generate('syscrunch_store_user_validate_email_duplicated'),
        async: false,
        dataType: 'json',
        type: 'POST',
        data: {
          email: email
        },
        success: function (data){
          if (data.code == 200)
          {
            if (data.status)
            {
              self.showGlobalError(email + ' already exists. Try another one.', 6000);
              isDuplicated = true;
            }
          }
          else
          {
            self.showGlobalError('Server error. Please try again.');
            isDuplicated = true;
          }
        }
      });

      if (!isDuplicated)
      {
        var userType = $('#user_type').val();
        window.location.href = Routing.generate("syscrunch_store_user_register", {"email": email, "user_type": userType});
      }
      else
      {
        return false;
      }
    }
    else
    {
      return false;
    }
  },

  /**
   * method to perform redirections once the user is logged
   */
  baseRedirectOnceIfLogged: function(){
    // user found
    if (window.themingStore.currentUser.get('is_publisher'))
    {
      window.themingStore.currentRouter.navigate('dashboard');
    }
    else
    {
      window.themingStore.currentRouter.navigate('browse');
    }
  },

  /**
   * bind button once the fb api has been loaded
   * @param uid
   * @param accessToken
   */
  performCallb: function(uid, accessToken){
    var _this = this;
    // the user is logged in and has authenticated the
    // app, and response.authResponse supplies
    // the user's ID, a valid access token, a signed
    // request, and the time the access token
    // and signed request each expire
    _this._authThirdPartyType = "fb";
    FB.api('/me', function(response) {
      var _data = JSON.stringify({
        "uid": uid,
        "accessToken": accessToken,
        "email": response.email,
        "type":"fb"
      });
      $('.blue-button').unbind('click').bind('click', function(evt){
        evt.preventDefault();
        evt.stopPropagation();
        // proceed with the athentitcation via FB
        self._reqCreator(self.baseThirdPartyAuthUrl, _data, function(resp){
          // user should be logged
        }, function(error){
          // authentication errors
        });
      });
    });
  },


  /**
   * Fills out the current register form with data
   * retrieved from Facebook API.
   *
   * @param data
   * @param uid
   * @param accessToken
   * @private
   */
  _sendFBDataToRegister: function (data, uid, accessToken){
    var self = this;
    // Facebook uid
    this.fbUid = uid;

    // Facebook Access Token
    this.fbAccessToken = accessToken;

    // City and Country
    var fbUserCity = '';
    var fbUserCountry = '';
    if (data.location)
    {
      if (data.location.name)
      {
        var fbUserLocation = data.location.name.split(',');
        if (fbUserLocation.length > 1)
        {
          fbUserCity = fbUserLocation[0].replace(/^\s+|\s+$/g, '');  // trim to city string
          fbUserCountry = fbUserLocation[1].replace(/^\s+|\s+$/g, '');  // trim to country string
        }
      }
    }

    var name = data.name;
    var username = data.username;
    var email = data.email;
    var userType = $('#user_type').val();
    var is_publisher = false;
    if (userType == 2 || userType == 3)
    {
      is_publisher = true;
    }
    var user = new window.themingStore.models.UserModel();
    user.set({
      name        : name,
      username    : username,
      email       : email,
      is_publisher: is_publisher,
      city        : fbUserCity,
      country     : fbUserCountry,
      fbUid       : self.fbUid,         // Facebook ui
      fbAccTk     : self.fbAccessToken  // Facebook token
    });

    var options = {};
    options.success = this.baseRedirectOnceIfLogged;
    user.doFacebookRegistration(options);
  },

  /**
   * Verifies if all basic data is set before attempting the
   * registration.
   *
   * @returns {boolean} true if all data is set, false otherwise.
   */
  validateForm: function (){
    // email and role validation
    if ($('#user_type').val() == 0)  // no role choosen
    {
      this.showGlobalError('Please choose a Role first.');
      return false;
    }

    return true;
  },

  /**
   * bind register button to create a call and open a new window and all that stuff
   * @private
   */
  _bindFBRegisterButton: function () {
    var _this = this;
    $('.blue-button').unbind('click').bind('click', function(evt){
      evt.stopPropagation();
      evt.preventDefault();

      var isFormValid = _this.validateForm();
      if (!isFormValid)
      {
        return false;
      }

      FB.login(function(response) {
        if (response.authResponse) {

          FB.api('/me', function(res) {
            var uid = response.authResponse.userID;
            var accessToken = response.authResponse.accessToken;
            _this._sendFBDataToRegister(res, uid, accessToken);
          });

        } else {
          //user hit cancel button
          _this.showGlobalError("You just canceled your fb register or not fully authorize the app", 5000);
//          console.log('User cancelled login or did not fully authorize.');

        }
//        console.groupEnd();

      }, {
        scope: 'publish_stream,email,user_about_me'
      });
    });

  },

  /**
   * basic FB connected function
   * @private
   */
  _listenerFacebookConnected: function(){
    var _this = this;
    $(document).unbind("fbloaded").bind("fbloaded", function(){

      if(!window._is_initialized){
        FB.init({
          appId: window.themingStore.fb_id,
          channelUrl: Routing.generate("sys_crunch_store_initial", {}, true) + "channel.html",
          status     : true,
          cookie     : true,
          xfbml      : true
        });
      }
      window._is_initialized = true;


      FB.getLoginStatus(function(response){

        if (response.status === 'connected') {
          // the user is logged in and has authenticated the
          // app, and response.authResponse supplies
          // the user's ID, a valid access token, a signed
          // request, and the time the access token
          // and signed request each expire
          var uid = response.authResponse.userID;
          var accessToken = response.authResponse.accessToken;
          _this._authThirdPartyType = "fb";
          FB.api('/me', function(response) {
            var _data = {
              "uid": uid,
              "accessToken": accessToken,
              "email": response.email,
              "type":"fb"
            };

            $('.blue-button').unbind('click').bind('click', function(evt){
              evt.stopPropagation();
              evt.preventDefault();

              _this._sendFBDataToRegister(response, uid, accessToken);

              return false;
            });
          });

        } else if (response.status === 'not_authorized') {
          // the user is logged in to Facebook,
          // but has not authenticated your app
          _this._bindFBRegisterButton();
        } else {
          // the user isn't logged in to Facebook.
          _this._bindFBRegisterButton();
        }
      });

      return false;
    });
  },

   /**
   * Prepare to trigger validation, and submitting this
   * form, all validation is fired.
   */
  bindTwitterEmailValidation: function (){

     if ($('#email').val() != '')
     {
       return true;
     }

     this.showGlobalError('Enter a valid email please.');
     return false;
  },

  /**
   *
   * @private
   */
  _listenerTwitter: function(){
    var _this = this;
    $('a.button.cyan-button').die('click').live('click', function(evt){
      evt.preventDefault();
      evt.stopPropagation();
      // Validating email
      var isValid = _this.validateForm();
      if (!isValid)
      {
        /// alrt
        // _this.showError('Due to the twitter api data hadling and security issues <br /> you have to provide your email address associated with your twitter account');
        // $('#user_email').css('border-color', 'red');
        // var callb = function(){$('.message').remove();};
        // setTimeout(callb, 7000);
        return false;
      }
      else
      {
        if (!_this.signUpTwitterReady)
        {
          _this.hideAllButTwitter();
          _this.signUpTwitterReady = true;
        }
      }

    });
  },

  hideAllButTwitter: function (){
    this.showSecondForm(500, 500, '.sign_in_twitter_form_container');
    this.verifyValueCorrectnessInLine('#email_tw_field', 'email');
    this.lastAction = 'twitter';
  },

  /**
   * Makes the ajax form sent.
   *
   * @param event
   */
  sendTwitterRegistrationForm: function (event){

    var self = this;
    // parent attribute.
    if (this.isFieldValidWhileTyping)
    {
      var email = $('#email_tw_field').val();
      var isDuplicated = false;
      // validate duplicated email
      $.ajax({
        url: Routing.generate('syscrunch_store_user_validate_email_duplicated'),
        async: false,
        dataType: 'json',
        type: 'POST',
        data: {
          email: email
        },
        success: function (data){
          if (data.code == 200)
          {
            if (data.status)
            {
              self.showGlobalError(email + ' already exists. Try another one.', 6000);
              isDuplicated = true;
            }
          }
          else
          {
            self.showGlobalError('Server error. Please try again.');
            isDuplicated = true;
          }
        }
      });

      if (!isDuplicated)
      {
        var userType = $('#user_type').val();
        window.location.href = Routing.generate("syscrunch_store_twitter_base_register", {"email": email, "user_type": userType});
      }
      else
      {
        return false;
      }
    }
    else
    {
      return false;
    }
  },

  /**
   * this method validates the email passed
   * @param emailval
   * @returns {boolean}
   */
  validateEmail: function(emailval){
    var re = false;
    if(emailval.length > 1){
      re = true;
    }

    return re;
  },

  /**
   * basic method to proceed with the auth via twitter if the user has currently been authenticated via tw
   * @private
   */
  _proceedTwAuth: function(){
    var _data = JSON.parse(Cookies.getCookie("tw_second_step"));
    _data.type = "tw";
    var self = this;
    // check if user exists
    var user_e = self._userexists(_data.email);

    if(user_e)
    {
      self._reqCreator(Routing.generate("sc_demo_security_rest_post_third_party_auth"), "post", _data, function(resp){
        // user should be logged

        if(resp.response == 307)
        {
          // redirect
          self._cleanTemporalCookies();
          var _path = decodeURIComponent(resp.path);
          var _msg = resp.msg;
          var _callb = function(){
            window.location.reload(true);
          };

          if(_msg)
          {
            setTimeout(_callb, 5000);
            self.showInfo(_msg);
          }
          else
          {
            _callb();
          }

        }else if(resp.response == 200){
          var authtimestamp = +new Date;
          // save all passed data
          Cookies.setCookie(self.cookieName,
            JSON.stringify({
              usernamemail: resp.user.username,
              password: "",
              wsse: resp.wsse,
              auth_timestamp: authtimestamp,
              attri: resp.user,
              fb: false,
              tw: resp.tw,
              baseoptions: {}}), 1);

          var user = new window.themingStore.models.UserModel();
          if(user.isAuthenticated()){
            self.baseRedirectOnceIfLogged();
          }
        }
      }, function(error){
        // authentication errors not very common but it's possible

      });
    }
    else
    {
      // Fill out register form with data retrieved from Twitter authentication
      var twData = {};
      twData.email = _data.email;
      twData.name = _data.full_response.name;
      twData.username = _data.username;
      twData.twToken = _data.token;
      twData.twTokenSectret = _data.token_secret;
      twData.twId = _data.tw_id;

      self._fillFormWithTWData(twData);


      // bind subsequent request to fill the register form
      self._bindSubsequentTrigger("twsubsequent", function(){
        _data.buyer = $('#buyer').is(':checked');
        _data.publisher = $('#publisher').is(':checked');


        self._reqCreator(Routing.generate("sc_demo_security_rest_post_third_party_auth"), "post", _data, function(resp){

          // user should be logged
          if(resp.response == 307){
            // redirect
            self._cleanTemporalCookies();
            var _path = decodeURIComponent(resp.path);
            var _msg = resp.msg;
            var _callb = function(){
              window.location.reload(true);
            };

            if(_msg){
              setTimeout(_callb, 5000);
              self.showInfo(_msg);
            }else{
              _callb();
            }

          }else if(resp.response == 200){
            var authtimestamp = +new Date;
            // save all passed data
            Cookies.setCookie(self.cookieName,
              JSON.stringify({
                usernamemail: resp.user.username,
                password: "",
                wsse: resp.wsse,
                auth_timestamp: authtimestamp,
                attri: resp.user,
                fb: false,
                tw: resp.tw,
                baseoptions: {}}), 1);

            var user = new window.themingStore.models.UserModel();
            if(user.isAuthenticated()){
              self.baseRedirectOnceIfLogged();
            }
          }
        }, function(error){
          // authentication errors not very common but it's possible

        });
      });
      // proceed with the authentication via FB
      //self._baseRegisterUp();

    }
  },

  /**
   * creates a base request to send to backend
   * @param url
   * @param type
   * @param data
   * @param successf
   * @param errorf
   * @private
   */
  _reqCreator: function (url, type, data, successf, errorf){
    $.ajax({
      url: url,
      data: data,
      type: type,
      success: successf,
      error: errorf
    });
  },

  /**
   * function called to check if the user exists
   * @param email
   * @returns {boolean}
   * @private
   */
  _userexists: function(email){
    var self = this;
    var resp = false;
    $.ajax({
      url: Routing.generate("sc_demo_security_rest_get_email_check"),
      type: "GET",
      async: false,
      xhrFields:{
        "Accept": "application/json"
      },
      data: {'_email':email},
      success: function(data, textStatus, jqXHR){
        if(data.response != false){
          resp = true;
        }
      }
    });

    return resp;
  },

  /**
   * meta - bind document as a bridge of comunication
   * @param name
   * @param callb
   * @private
   */
  _bindSubsequentTrigger: function(name, callb){
    var self = this;
    if(typeof callb == "function"){
      $(document).unbind(name).bind(name, function(){
        callb.apply(self);
      });
    }
  },

  /**
   * Fills out the current register form with data
   * retrieved from Facebook API.
   *
   * @param data
   * @param uid
   * @param accessToken
   * @private
   */
  _fillFormWithTWData: function (data){

    // Twitter token
    this.twToken = data.twToken;

    // Twitter Access Token
    this.twTokenSecret = data.twTokenSectret;

    // Twitter id
    this.twId = data.twId;

    // Name
    $('#user_name').val(data.name.replace(/\+/g, " "));

    // Username
    $('#user_username').val(data.username);

    // Email
    $('#user_email').val(data.email);
  },

  /**
   *
   *
   * @param authResult
   */
  signInPlusOne: function(authResult){
    var self = window.themingStore.currentView;

    var gpCallBack = function (authResult){
      if(authResult['code'])
      {
        authResult.user_type = $('#user_type').val();
        $.ajax({
          type: 'POST',
          url: Routing.generate("syscrunch_store_user_gplus_register"),
          success: function(result) {
            if(result.response == 200)
            {
              var user = new window.themingStore.models.UserModel();
              var authOptions = {};
              authOptions.success = self.baseRedirectOnceIfLogged;
              user.gpAttemptAuthentication(result, authOptions);
              return false;
            }
            else
            if(result.response == 308)
            {

              console.log('SERVER ERROR');

            }else if(result.response == 307){
              self._cleanTemporalCookies();
              var _path = decodeURIComponent(resp.path);
              var _msg = resp.msg;
              var _callb = function(){
                window.location.reload(true);
              };

              if(_msg){
                setTimeout(_callb, 5000);
                self.showInfo(_msg);
              }else{
                _callb();
              }
            }
          },
          data: authResult
        });

      }
      else if (authResult['error'])
      {
        self.showGlobalError("Your google plus authentication could not be finished you have to accept the application "+
          "and accept the authomatic login", 6000);
      }
    };

    if (self.allow_gplus_trigger_authorize)
    {
      gpCallBack(authResult);
    }
    else
    {
      $('#signinButton').unbind('click').bind('click', function (event){
        var isFormValid = self.validateForm();
        if (!isFormValid)
        {
          self.allow_gplus_trigger_authorize = false;
          return false;
        }
        else
        {
          self.allow_gplus_trigger_authorize = true;
          gpCallBack(authResult);
        }
      });
    }
  },

  /**
   * this method cleand temporal cookies
   * fb/tw
   */
  _cleanTemporalCookies: function(callb){
    docCookies.removeItem("tw_second_step", "/");
    if(callb){
      callb();
    }
  },

  fillFormWithGPData: function (authResult){

  }
});