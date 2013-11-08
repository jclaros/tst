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
      '':_this._session_name+"="+ _this._session_id,
      'X-CSRF-Token':_this._csrf_token
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
          if(self._retry_count < 4){
            self._retry_count++;
            self._secondStep(options);
          }else{
            console.log('error in the authentication');
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
            tw: false,
            baseoptions: options}), 1);
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

  emailRegister: function (){
    var self = this;

    var registerUrl = Routing.generate("syscrunch_store_email_register");

    $.ajax({
      url     : registerUrl,
      type    : "POST",
      dataType: "json",
      data    : {
        parameters: JSON.stringify(this),
        user_type : $('#user_type').val()
      },
      error   : function (error){
        console.log(error);
      },
      success : function (data){
        console.log(data);
      }
    });

  },

  facebookRegister: function (){

  },

  twitterRegister: function (){

  }
});


window.userTmp = new window.themingStore.models.UserModel();
