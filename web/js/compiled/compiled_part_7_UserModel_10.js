/**
 * This class handles the users
 * @type {*}
 */
window.themingStore.models.UserModel = window.themingStore.models.AbstractModel.extend({
  /**
   * The name to store the user session cookie
   */
  cookieName       : 'ts_user',
  /**
   * username or email used to be authenticated
   */
  _usernamemail: "",
  /**
   * passwd
   */
  _password: "",
  /**
   * timestamp
   */
  _auth_timestamp: "",
  /**
   * wsse token
   */
  _wsse:  "",
  /**
   * authenticated token ?
   */
  _token_valid     : false,
  /**
   * fb information to authenticate
   */
  _fb: false,
  /**
   * tw information to authenticate
   */
  _tw: false,
  /*
   * gp information to authenticate
   */
  _gp : false,

  /**
   * retry count, weird but it only authenticated when it's the second time
   */
  _retry_count: 1,
  /**
   * token could be anon or authenticated depends on the previous flag
   */
  _csrf_token : "",
  /**
   * the base url for the rest layer
   */
  urlRoot     : window.themingStore.restPath + 'user',
  /**
   *  base options container to perform a clean request
   */
  _baseoptions: {},

  "csrftoken_retriever": window.themingStore.baseAppLocation+"services/session/token",

  "auth_get_sesion": window.themingStore.restPath + "user/login",

  "auth_username_retriever": window.themingStore.baseAppLocation+"retrieveun.php",
  /**
   * constructor
   */
  initialize  : function ()
  {
      _.bindAll(this,
        "authenticate",
        "isAuthenticated",
        "getHeaders",
        "_secondStep"
      );
    // listen to changes to password
    this.on('change:password', this.passwordChangeListener);
  },
  /**
   * This method checks if the user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: function(){
    // get the cookie that stores the session
    var cookie = Cookies.getCookie(this.cookieName);
    if(cookie)
    {
      cookie = JSON.parse(cookie);
      if (cookie)
      {
//        this._usernamemail = cookie.usernamemail;
//        this._password = cookie.password;
//        this._wsse = cookie.wsse;
//        this._auth_timestamp = cookie.auth_timestamp;
//        this.attributes = cookie.attri;
//        var current_time = +new Date;
//        // check number of minutes
//        if(parseInt(((current_time - this._auth_timestamp) / 60000)) > 30){
//
//        }
//        this._token_valid = true;
//        window.themingStore.currentUser = this;
        this._usernamemail = cookie.usernamemail;
        this._password = cookie.password;
        this._wsse = cookie.wsse;
        this._auth_timestamp = cookie.auth_timestamp;
        this.attributes = cookie.attri;
        this._fb = cookie.fb;
        this._tw = cookie.tw;
        if(cookie.gp){
          this._gp = cookie.gp;
        }
        var current_time = +new Date;
        // check number of minutes
        if(((current_time - this._auth_timestamp) / 60000) > 30){
          // regenerate token

        }
        this._token_valid = true;
        window.themingStore.currentUser = this;
        return true;
      }
    }
    return false;

    return _this._token_valid &&
      _this._session_name.length > 0 &&
      _this._session_id.length > 0;
  },
  /**
   * This method returns the headers needed to perform request to the
   * @returns {{Cookie: string, X-CSRF-Token: *}}
   */
  getHeaders : function(){
    var _this = this;

    var _headers = {
      'X-WSSE':_this._wsse
    };

    return _headers;
  },

  /**
   * public function to authenticate a user
   */
  authenticate      : function (options)
  {
    if (!options)
    {
      options = {};
    }
    var self = this;
    // store the values to set the cookie if the auth succeeds
    var email = this.get('email');
    var password = this.get('password');

    // create the options with data, success and error callbacks
    options.data = {
       _username   : email,
       _password: password
    };
    options.type = "POST";
    options.dataType = "JSON";
    options.contentType = "application/json; charset=utf-8";


    self._secondStep(options);

    return;
  },
    /**
     * this method continues the process of authentication once ievedthe username has being retr
     * @private
     */
  _secondStep: function(options){
      // a back up of the object
      var self = this;
      $.ajax({
        url: Routing.generate("sc_demo_security_rest_post_token_create"),
        type: "POST",
        dataType: "json",
        data: options.data,
        cache: false,
        headers:{
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        error: function(jqXHR, textStatus, errorThrown){
          options.renderizedView._showError("Wrong User or Password");
          if(options.callB){
            options.callB();
          }
        },
        success: function (resp)
        {
          self._auth_timestamp = +new Date;
          self._wsse = resp.wsse;
          self.attributes = resp.user;

          Cookies.setCookie(self.cookieName,
          JSON.stringify({
            usernamemail: options.data._username,
            password: options.data._password,
            wsse: self._wsse,
            auth_timestamp: self._auth_timestamp,
            attri: resp.user,
            fb: false,
            gplus: false,
            tw: false}), 1);
          self._token_valid = true;
          window.themingStore.currentUser = self;
          if(typeof options.success == "function"){
            options.success();
          }
          return;
        }
      });
  },
  /**
   * Method to end the session
   * @param callback
   */
  endSession        : function (callback)
  {
    window.themingStore.currentUser = null;
    Cookies.setCookie(this.cookieName, '', -1);
console.log(this.cookieName);
    docCookies.removeItem(this.cookieName, "/");
    if (callback)
    {
      callback();
    }
  },

  /**
   * called when the password is changed, encrypts the password using base64
   * @param model
   */
  passwordChangeListener: function (model)
  {
    // access the attributes directly to avoid the infinite loop call
    model.attributes.password = model.get('password');
  },

  /**
   * this method checks if there is a user in the session
   */
  checkUserInSession: function ()
  {
    var cookie = Cookies.getCookie(this.cookieName);
    if(cookie){
      cookie = JSON.parse(cookie);
      if (cookie)
      {
        this._usernamemail = cookie.usernamemail;
        this._password = cookie.password;
        this._wsse = cookie.wsse;
        this._auth_timestamp = cookie.auth_timestamp;
        this.attributes = cookie.attri;
        this._fb = cookie.fb;
        this._tw = cookie.tw;
        var current_time = +new Date;
        // check number of minutes
        if(((current_time - this._auth_timestamp) / 60000) > 30){
          // regenerate token

        }
        this._token_valid = true;
        window.themingStore.currentUser = this;

        //this._retrieveData(cookie.baseoptions);
        return true;
      }
      return false;
    }
    return false;
  },

  /**
   * Sends the register form to backend in order to persist
   * the new user.
   *
   * @returns {boolean} true if succeed, false in other case.
   */
  doRegister: function (){
    var self = this;
    var successOnRegister = false;

    var registerUrl = Routing.generate("syscrunch_store_user_register");

    $.ajax({
      url     : registerUrl,
      type    : "POST",
      dataType: "json",
      async   : false,
      data    : {
        parameters: JSON.stringify(this),
        user_type : $('#user_type').val()
      },
      error   : function (error){
        console.log(error);
      },
      success : function (data){
        successOnRegister = true;
      }
    });

    return successOnRegister;

  },

  /**
   * Registers a new User with Facebook data retrieved from
   * the API. In case the user is already registered, the authentication
   * is triggered.
   *
   * @param options Object
   * @returns {boolean}
   */
  doFacebookRegistration: function (options){
    var successOnRegister = false;
    var self = this;
    var registerUrl = Routing.generate("syscrunch_store_user_facebook_register");

    $.ajax({
      url     : registerUrl,
      type    : "POST",
      dataType: "json",
      async   : false,
      data    : {
        parameters: JSON.stringify(self),
        user_type : $('#user_type').val()
      },
      error   : function (error){
        console.log(error);
      },
      success : function (data){

        if (data.response == 200)
        {
          self.facebookAttemptAuthentication(data, options);
        }
        else
        {
          if (data.response == 500)
          {
            if (data.status == 'duplicated')
            {
              self.facebookAttemptAuthentication(data, options);
            }
            else
            {
              $('#ser_error_message').html('Our Server returned an error...Please try again');
              $('.reg-cont-message').css('display', 'block');
            }
          }

        }
      }
    });

    return successOnRegister;
  },

  /**
   * After the registration with Facebook data, and
   * authentication must be triggered.
   *
   * @param data Object
   * @param options Object
   */
  facebookAttemptAuthentication: function (data, options){
    var self = this;
    var authtimestamp = +new Date;
    Cookies.setCookie(self.cookieName,
      JSON.stringify({
        usernamemail: data.user.username,
        password: "",
        wsse: data.wsse,
        auth_timestamp: authtimestamp,
        attri: data.user,
        fb: {"token":self.fbAccTk, "uid": self.fbUid},
        tw: false,
        baseoptions: {}}), 1);

    if (self.isAuthenticated())
    {
      if (options.success)
      {
        options.success();
      }
    }
    else
    {
      $('#ser_error_message').html('Our Server returned an error...Please try again');
      $('.reg-cont-message').css('display', 'block');
    }
  },

  /**
   * Registers a new User with Google Plus data retrieved from
   * the API. In case the user is already registered, the authentication
   * is triggered.
   *
   * @param options Object
   * @returns {boolean}
   */
  doGooglePlusRegistration: function (options){
    var successOnRegister = false;
    var self = this;
    var registerUrl = Routing.generate("syscrunch_store_user_facebook_register");

    $.ajax({
      url     : registerUrl,
      type    : "POST",
      dataType: "json",
      async   : false,
      data    : {
        parameters: JSON.stringify(self),
        user_type : $('#user_type').val()
      },
      error   : function (error){
        console.log(error);
      },
      success : function (data){

        if (data.response == 200)
        {
          self.facebookAttemptAuthentication(data, options);
        }
        else
        {
          if (data.response == 500)
          {
            if (data.status == 'duplicated')
            {
              self.facebookAttemptAuthentication(data, options);
            }
            else
            {
              $('#ser_error_message').html('Our Server returned an error...Please try again');
              $('.reg-cont-message').css('display', 'block');
            }
          }

        }
      }
    });

    return successOnRegister;
  },

  gpAttemptAuthentication: function (result, options){
    var self = this;
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

    if(this.isAuthenticated())
    {
      options.success();
    }
  },

  twitterRegister: function (){

  }
});


window.userTmp = new window.themingStore.models.UserModel();
