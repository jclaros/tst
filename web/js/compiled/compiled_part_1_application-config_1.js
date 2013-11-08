var baseUrl = window.location.pathname.split('/')
                                      .slice(0, window.location.pathname.split('/').length - 1)
                                      .join('/') + '/';

/**
 * @namespace this object holds all the code regarding the store
 */
window.themingStore = {
  'views'        : {},
  'connector'    : null,
  'models'       : {},
  'managers'     : {},
  'collections'  : {},
  'routers'      : {},
  'currentView'  : null,
  'currentRouter': null,
  'currentUser'  : null,
  'logic'        : {},
  'cart'         : null,
  'mediator'       : {}
};

//    window.themingStore.restPath            = '<?php echo Configuration::$REST_PATH ?>';
//    window.themingStore.loginCheck          = '<?php echo Configuration::$REST_PATH ?>user/login.json';
//    window.themingStore.authenticationToken = '<?php echo Configuration::$BASE_DRUPAL_APPLICATION ?>services/session/token';
//    window.themingStore.baseAppLocation     = '<?php echo Configuration::$BASE_URL?>/';
//    window.themingStore.baseDrupApp         = '<?php echo Configuration::$BASE_DRUPAL_APPLICATION ?>/';
