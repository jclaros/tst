
/**
 * Class that handles the password confirmation view
 */
window.themingStore.views.PasswordConfirmView = window.themingStore.views.AbstractAuthView.extend({
  $el: $('body'),

  events: {
    'click #sign_up_email': 'submitForm'
  },

  initialize: function (){
    // basic listener


  },

  /**
   * Renders the Thanks for signing up layout.
   */
  index: function (){

    // if there is a user in session redirect him to the browse page
    if (window.themingStore.currentUser)
    {
      window.themingStore.currentRouter.navigate('browse');
    }

    var self = this;
    this.loadTemplate('password_confirm', false, function ()
    {
      self.$el.addClass('login');
      var action = Routing.generate('save_password_confirmation');
      userToken = Cookies.getCookie("user_req_token")
      var data = {'action': action, 'user_token': userToken};
      self.$el.html(self.renderTemplate('#passwordPage', data));

      self.verifyValueCorrectnessInLine('#password', 'password');
    });
  },

  submitForm: function (event){
    if (this.isFieldValidWhileTyping)
    {
      $(event.currentTarget).parents('form').first().submit();
    }
  }
});