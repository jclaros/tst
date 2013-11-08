/**
 * Class that handles the login view
 */
window.themingStore.views.LoginView = window.themingStore.views.AbstractAuthView.extend({
  /**
   * Master element
   */
  el: $('body'),
  /**
   * scope
   */
  events: {
    'submit #loginForm': 'loginFormSubmit'
  },
  /**
   * shared cookie with user model
   */
  cookieName: "ts_user",
  /**
  *
  */
  gpluscookieerror: "refresh_gplus",
  /**
  *
  */
  cookie_register: "authenticated",
  /**
   * Title of the page
   */
  title          : 'ThemingSto.re - Login',
  /**
   * holds the reference fi the auth is via twitter or fb
   */
  _authThirdPartyType: "",
  /**
  * in process of registration
  */
  _registrating: false,
  /**
  *
  */
  _proceed_auth_gplus: false,
  /**
   * holds the url where the request must be pointed
   */
  baseThirdPartyAuthUrl: window.themingStore.restPath + "user/login_third",
  /**
  *
  */
  auth_username_retriever: window.themingStore.baseDrupApp+"retrieveun.php",
  /**
   * Basic constructor of the login part
   */
  initialize: function(){
    // basic listener
    _.bindAll(
      this,
      "_listenerFacebookConnected",
      "index",
      "performCallb",
      "_listenErrorsGPlusError",
      "_listenerByMail",
      "_bindFBLoginButton",
      "_validateForm",
      "_listenerTwitter"
    );
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
        window.location.href = Routing.generate("syscrunch_store_twitter_login");
      });
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
   * bind login button to create a call and open a new window and all that stuff
   * @private
   */
  _bindFBLoginButton: function () {
    var _this = this;
    $('.blue-button').unbind('click').bind('click', function(evt){
      evt.stopPropagation();
      evt.preventDefault();
      FB.login(function(response) {
        if (response.authResponse) {

          FB.api('/me', function(res) {


            var _data = {
              "uid": response.authResponse.userID,
              "accessToken": response.authResponse.accessToken,
              "email": res.email,
              "type":"fb"
            };

            var user_e = _this._userexists(_data.email);

            if(user_e){
                _this._reqCreator(Routing.generate("sc_demo_security_rest_post_third_party_auth"), "post", _data, function(resp){
                  var authtimestamp = +new Date;
                  // user should be logged
                  if(resp.response == 200){
                    // save all passed data
                    Cookies.setCookie(_this.cookieName,
                      JSON.stringify({
                        usernamemail: resp.user.username,
                        password: "",
                        wsse: resp.wsse,
                        auth_timestamp: authtimestamp,
                        attri: resp.user,
                        fb: {"token":_data.accessToken, "uid": _data.uid},
                        tw: false,
                        gp: false,
                        baseoptions: _data}), 1);

                    var user = new window.themingStore.models.UserModel();
                    var r = user.isAuthenticated();
                    if(r){
                      _this.baseRedirectOnceIfLogged();
                    }
                  }
                }, function(error){
                  // authentication errors not very common but it's possible

                });
              }
              else{

              // proceed with register
              // save notification
              var _callb = function(){
                window.themingStore.currentRouter.navigate("register");
              };
              Cookies.setCookie(_this.cookie_register,
                JSON.stringify({
                  'fb': _data
                }), 1);

              setTimeout(_callb, 3000);
              _this.showInfo("You are not registered in the ThemingSto.re, please fill the form to get access to the ThemingStore");

              }

            
          });

        } else {
          //user hit cancel button
          _this.showError("You just canceled your fb login or not fully authorize the app");
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
              // check if user exists
              var user_e = _this._userexists(_data.email);

              if(user_e){
                _this._reqCreator(Routing.generate("sc_demo_security_rest_post_third_party_auth"), "post", _data, function(resp){
                    var authtimestamp = +new Date;
                    // user should be logged
                    if(resp.response == 200){
                      // save all passed data
                      Cookies.setCookie(_this.cookieName,
                        JSON.stringify({
                          usernamemail: resp.user.username,
                          password: "",
                          wsse: resp.wsse,
                          auth_timestamp: authtimestamp,
                          attri: resp.user,
                          fb: {"token":_data.accessToken, "uid": _data.uid},
                          tw: false,
                          baseoptions: _data}), 1);

                      var user = new window.themingStore.models.UserModel();
                      var r = user.isAuthenticated();
                      if(r){
                        _this.baseRedirectOnceIfLogged();
                      }
                    }
                  }, function(error){
                    // authentication errors not very common but it's possible

                  });
              }else{
                // proceed with register
                // save notification
                var _callb = function(){
                  window.themingStore.currentRouter.navigate("register");
                };
                Cookies.setCookie(_this.cookie_register,
                  JSON.stringify({
                    'fb': _data
                  }), 1);

                setTimeout(_callb, 3000);
                _this.showInfo("You are not registered in the ThemingSto.re, please fill the form to get access to the ThemingStore");
              }

              return false;
            });
          });

        } else if (response.status === 'not_authorized') {
          // the user is logged in to Facebook,
          // but has not authenticated your app
          _this._bindFBLoginButton();
        } else {
          // the user isn't logged in to Facebook.
          _this._bindFBLoginButton();
        }
      });

      return false;
    });
  },
  _listenErrorsGPlusError: function(){
      var self = this;
      window.onerror = function(msg, url, linenumber){
        if("Error: Permission denied to access object" == msg){
          Cookies.setCookie(self.gpluscookieerror,
              JSON.stringify({ authenticated: true }), 1);
          window.location.reload(true);
        }
      };
  },
  /**
  * binds elements to 
  */
  _listenerByMail: function(){
    var self = this;
    $('.gray-button').unbind('click').bind('click', function(event){
      event.preventDefault();
      event.stopPropagation();
      self.showSecondForm(500, 500);

      self.lastAction = 'email_form';

      $('.rememberme').unbind("click").bind("click", function(event){
        $('.checkbox').toggleClass('selected');
      });

      $('.forgot').unbind("click").bind("click", function(event){
        event.preventDefault();
        event.stopPropagation();
        // navigate
        console.log("navigate to forgot dude");
      });
      $('.username_email').focusin(function() {
        $('.username_email').find('.verificator').addClass('error').addClass("hidden");
        $('.password').find('.verificator').addClass('error').addClass("hidden");
      });
      $('.button_log_in').unbind("click").bind("click", function(event){
          if($(this).find(".icon").hasClass("disabled")){
            // proceed
            $(this).find(".icon").removeClass("disabled");
            self._validateForm();
          }
      });


    });
  },
  _showError: function(msg){
    this.showGlobalError(msg);
  },
  _validateForm: function(){
    $('.username_email').find('.verificator').addClass('error').addClass("hidden");
    $('.password').find('.verificator').addClass('error').addClass("hidden");
    var self = this;
    var _mail = $("#username").val();
    var _password = $("#password").val();
    var val = self.validateEmail(_mail);
    if(val == false && _password.length < 1){
      self._showError("Please fill the fields");
      $('.password').find('.verificator').removeClass('ok').addClass('error').removeClass("hidden");
      $('.username_email').find('.verificator').removeClass('ok').addClass('error').removeClass("hidden");
      $(".icon").addClass("disabled");
      return;
    }
    if(_password.length < 1){
      self._showError("Please fill password field");
      $('.password').find('.verificator').removeClass('ok').addClass('error').removeClass("hidden");
      $(".icon").addClass("disabled");
      return;      
    }
    if(val){
      // check email exists
      var user_e = self._userexists(_mail);
      if(user_e){
        var _callb = function(){
          $(".icon").addClass("disabled");
        };
        self.loginFormSubmit(null, _callb);
      }else{
        self._showError("Email or name not found, please sign up first.");
        $('.username_email').find('.verificator').addClass('error').removeClass("hidden");
        $(".icon").addClass("disabled");
      }
    }else{

      self._showError("Not valid username / email");
      $('.username_email').find('.verificator').addClass('error').removeClass("hidden");
      $(".icon").addClass("disabled");
    }
  },
  /**
   * The main action called when displaying the login page
   */
  index: function ()
  {
    // if there is a user in session redirect him to the browse page

    var self = this;
    self.checkLoggedUser();
    this.loadTemplate('login', false, function ()
    {
      self.$el.addClass('login');
      var googleClientId = window.themingStore.SfConfig.google_clientid;
      var dataView = {'google_clientid': googleClientId};
      self.$el.html(self.renderTemplate('#loginPage', dataView));

      $('.signup-sug').unbind("click").bind("click", function(){
          window.themingStore.currentRouter.navigate("register");
      });
      $('.signup').unbind("click").bind("click", function(){
          window.themingStore.currentRouter.navigate("register");
      });
      // relocate func
      self._listenerFacebookConnected();
      self._listenErrorsGPlusError();
      self._listenerTwitter();
      self._listenerByMail();
      $('.blue-button').bind('click', function(evt){
        evt.preventDefault();
        evt.stopPropagation();
        return false;
      });

      FB = null;
      window._is_initialized = false;
      $.getScript('//connect.facebook.net/en_US/all.js', function(){
        $(document).trigger("fbloaded");
      });

      $.getScript('//connect.facebook.net/en_US/all.js', function(){
        $(document).trigger("fbloaded");
      });

      $.getScript('https://apis.google.com/js/client:plusone.js', function(){
        // loaded
      });

      callBfunction = self.signInPlusOne;
      var $cookiegplus = Cookies.getCookie(self.gpluscookieerror);
      if($cookiegplus){
        var _base= JSON.parse($cookiegplus);
        if(_base.authenticated){
          self._proceed_auth_gplus = true;
          docCookies.removeItem(self.gpluscookieerror);
        }
      }

      var $cookie = Cookies.getCookie("tw_second_step");
      if($cookie){
        // logged via twitter proceed with the authentication
       self._proceedTwAuth();
      }
      var $cookiemsg = Cookies.getCookie("ts_flash_msg_info");
      if($cookiemsg){
        docCookies.removeItem("ts_flash_msg_info", "/");
        
        // logged via twitter proceed with the authentication
        var _base = JSON.parse($cookiemsg);
        var _mssg = _base.msg_info.replace(/\+/g, ' ');
        
        self.showInfo(_mssg);
        var callb = function(){$('.message').remove();};
        setTimeout(callb, 5000);
      }  
      self._gprefresher(false);

      // Button go Back
      self.makeBackRedirection();
    });
  },
  _gprefresher: function(_callb){
    var self = window.themingStore.currentView;
    $('.gplus').unbind("click").bind("click",function(event){

      self._proceed_auth_gplus = true;
      if(_callb){
        _callb();
      }
    });
  },
  signInPlusOne: function(authResult){
    var self = window.themingStore.currentView;
    if(authResult['code']) {
        // authenticate
        var _callb = function(){
          $.ajax({
            type: 'POST',
            url: Routing.generate("syscrunch_store_googleplus_base"),
            success: function(result) {
              if(result.response == 200){
                // authenticate
                var authtimestamp = +new Date;
                // save all passed data
                Cookies.setCookie(self.cookieName,
                  JSON.stringify({
                    usernamemail: result.attri.username,
                    password: "",
                    wsse: result.wsse,
                    auth_timestamp: authtimestamp,
                    attri: result.attri,
                    fb: result.fb,
                    tw: result.tw,
                    gp: result.gp,
                    baseoptions: {}}), 1);

                var user = new window.themingStore.models.UserModel();
                if(user.isAuthenticated()){
                  self.baseRedirectOnceIfLogged();
                }
              }else if(result.response == 308){
                // proceed with register
                // save notification
                var _callb = function(){
                  window.themingStore.currentRouter.navigate("register");
                };
                Cookies.setCookie(self.cookie_register,
                  JSON.stringify({
                      'gplus': result.gp
                    }), 1);

                setTimeout(_callb, 3000);
                self.showInfo("You are not registered in the ThemingSto.re, please fill the form to get access to the ThemingStore");

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
        };

      try
      {
        self._gprefresher(_callb);
        if(self._proceed_auth_gplus){
          _callb();
        }
      }
      catch (e){

      }
        //$('#signinButton').attr('style', 'display:none');

    }else if (authResult['error']){
//      self.showError("Your google plus authentication could not be finished you have to accept the application "+
//        "and accept the authomatic login");
    }
    return;
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
      
    if(user_e){
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
    }else{
      // bind subsequent request
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
      self._baseRegisterUp();
      
    }
  },
  /**
   * this method cleans temporal cookies
   * fb/tw
   */
  _cleanTemporalCookies: function(callb){
    docCookies.removeItem("tw_second_step", "/");
    if(callb){
      callb();
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
   * Method called to end the session
   */
  logout: function (){
    window.themingStore.currentUser.endSession(function () {
      window.themingStore.currentRouter.navigate('browse');
    });
  },
  /**
  * basic method used to show the registration third party option
  */
  _baseRegisterUp: function(){
      $('.base_container').animate({height: "hide"}, 1000, "easeOutQuad");
      $('.third_container').animate({height: "show"}, 1000, "easeOutQuad");
  },
  /**
  * basic method to hide the registration of third party option
  */
  _baseRegisterDown: function(){
      $('.base_container').animate({height: "show"}, 1000, "easeOutQuad");
      $('.third_container').animate({height: "hide"}, 1000, "easeOutQuad");
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
   * called when the login form is being submitted
   * @param event
   */
  loginFormSubmit: function (event, callb)
  {

    var self = this;
    var email = $('#username').val();
    var password = $('#password').val();
    var user = new window.themingStore.models.UserModel();
    user.set({
      email   : email,
      password: password
    });
    user.authenticate({
      callB: callb,
      renderizedView: self,
      statusCode: {
        404: function ()
        {
          self._showError('no user found');
          if(callb){
            // callb first then redirect
            callb();
          }
        },
        500: function ()
        {
          self._showError('server error');
          if(callb){
            // callb first then redirect
            callb();
          }
        }
      },
      success   : function (response)
      {
        if(callb){
          // callb first then redirect
          callb();
        }
        // user found
        if (window.themingStore.currentUser.get('is_publisher'))
        {
          window.themingStore.currentRouter.navigate('dashboard');
        }
        else
        {
          window.themingStore.currentRouter.navigate('browse');
        }
      }
    });
    return false;
  }
});