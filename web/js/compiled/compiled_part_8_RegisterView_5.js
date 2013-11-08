/**
 * Class that handles the register view
 */
window.themingStore.views.RegisterView = window.themingStore.views.AbstractView.extend({
    $el: $('body'),

  /**
   * scope
   */
  events         : {
    'submit #registerForm': 'registerFormSubmit'
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
      self.$el.html(self.renderTemplate('#registerPage'));
    });
  },

  registerFormSubmit: function (event){
    console.log(event);
    var self = this;
    var name = $('#user_name').val();
    var username = $('#user_username').val();
    var email = $('#user_email').val();
    var password = $('#user_password').val();
    var city = $('#user_city').val();
    var country = $('#user_country').val();
    var user = new window.themingStore.models.UserModel();
    user.set({
      name    : name,
      username: username,
      email   : email,
      password: password,
      city    : city,
      country :country
    });

    user.emailRegister();
  }
});