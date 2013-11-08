
/**
 * Class that handles the register view
 */
window.themingStore.views.ThanksSignupView = window.themingStore.views.AbstractView.extend({
  $el: $('body'),

  events: {
    'click #fb_link': 'goToTSFacebook',
    'click #tw_link': 'goToTSTwitter',
    'click #li_link': 'goToTSLinkedIn',
    'click #gp_link': 'goToTSGooglePlus',
    'click #em_link': 'goToTSEmail',
    'click #go_to_store': 'goToStore'
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
    this.loadTemplate('thanks_signup', false, function ()
    {
      self.$el.addClass('login');
      self.$el.html(self.renderTemplate('#thanksPage'));
    });
  },

  goToTSFacebook: function (event){
    window.open('http://www.facebook.com', '_blank');
  },

  goToTSTwitter: function (event){
    window.open('https://twitter.com/ThemingStore', '_blank');
  },

  goToTSLinkedIn: function (event){
    //window.open('https://twitter.com/ThemingStore', '_blank');
  },

  goToTSGooglePlus: function (event){
    //window.open('https://twitter.com/ThemingStore', '_blank');
  },

  goToTSEmail: function (event){
    //window.open('https://twitter.com/ThemingStore', '_blank');
    window.location.href = "mailto:support@themingsto.re";
  },

  goToStore: function (event){
    event.preventDefault();

    window.themingStore.currentRouter.navigate('browse');
  }
});