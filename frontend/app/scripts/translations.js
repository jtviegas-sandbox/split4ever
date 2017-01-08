/**
 * Created by joaovieg on 08/01/17.
 */
'use strict';

angular.module('frontendApp').config(['$translateProvider', function ($translateProvider) {

  $translateProvider.translations('en', {
    'SELECT_MODEL':'select model'
    , 'SELECT_CATEGORY':'select category'
    , 'MODEL':'model'
    , 'CATEGORY':'category'
    , 'NOTES':'notes'
    , 'VIEW':'view'
    , 'CALL':'call'
    , 'FOOTER_SUBTITLE1': 'classic VW parts: sale and purchase'
    , 'FOOTER_SUBTITLE2': 'used | old stock | new old stock | reworked'
    , 'IMAGES':'images'
    , 'REMOVE':'remove'
    , 'NAME':'name'
    , 'PROVIDE_PART_NAME':'provide a part name...'
    , 'PRICE':'price'
    , 'NEW_PART':'new part'
    , 'HELLO':'hello'

  })
    .translations('pt', {
      'SELECT_MODEL':'seleccione o modelo'
      , 'SELECT_CATEGORY':'seleccione a categoria'
      , 'MODEL':'modelo'
      , 'CATEGORY':'categoria'
      , 'NOTES':'notas'
      , 'VIEW':'ver'
      , 'CALL':'telefone'
      , 'FOOTER_SUBTITLE1': 'peças clássicas VW: venda e compra'
      , 'FOOTER_SUBTITLE2': 'usadas | old stock | new old stock | recondicionadas'
      , 'IMAGES':'imagens'
      , 'REMOVE':'remover'
      , 'NAME':'nome'
      , 'PROVIDE_PART_NAME':'dê um nome á peça...'
      , 'PRICE':'preço'
      , 'NEW_PART':'nova peça'
      , 'HELLO':'Olá'
  });

  $translateProvider.preferredLanguage('pt');

}]);
