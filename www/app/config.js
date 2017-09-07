(function () {

  'use strict';

  angular.module('foneClub')
    .config(masterConfiguration);

  function masterConfiguration($urlRouterProvider,$ionicConfigProvider,$provide, $stateProvider){

      configRouteProvider($ionicConfigProvider)

      $stateProvider.state('master', {
        url: '/',
        templateUrl: 'index.html',
        controller: 'MasterController as vm'
      })
      .state('login', {
        url: '/login',
        templateUrl: 'modules/login/login.html',
        controller: 'LoginController as vm'
      })
      .state('tabs', {
        url: "/tab",
        abstract: true,
        templateUrl: "modules/menu-tabs/menu-tabs.html",
        controller:"MenuController as vm"
      })
      .state('tabs.checkout-view', {
        url: "/checkout-view",
        views: {
          'menu-tab': {
            templateUrl: "modules/checkout/checkout.html",
            controller: 'CheckoutController as vm'
          }
        }
      })
      .state('tabs.home', {
        url: "/home",
        views: {
          'menu-tab': {
            templateUrl: "modules/home/home.html",
            controller: 'HomeController as vm'
          }
        }
      })
      .state('tabs.cadastro', {
        url: "/cadastro",
        views: {
          'menu-tab': {
            templateUrl: "modules/cadastro/cadastro.html",
            controller: 'CadastroController as vm'
          }
        }
      })
      .state('tabs.list-customer', {
        url: "/list-customer",
        views: {
          'menu-tab': {
            templateUrl: "modules/lista-customer/lista-customer.html",
            controller: 'CustomerListController as vm'
          }
        }
      })
      .state('tabs.customers', {
        url: "/customers",
        views: {
          'menu-tab': {
            templateUrl: "modules/customers/customers.html",
            controller: 'CustomersController as vm'
          }
        }
      })
      .state('edicao', {
        url: "/edicao",       
        templateUrl: "modules/customers/edicao/edicao.html",
        controller: 'EdicaoController as vm',
        params: { data: null }      
      })
      .state('ordemservico', {
        url: "/ordemservico",       
        templateUrl: "modules/customers/ordem-servico/ordemservico.html",
        controller: 'OrdemServico as vm',
        params: { data: null }      
      })

      $urlRouterProvider.otherwise('/');
      configErrorHandler($provide);
  }

  function configRouteProvider($ionicConfigProvider){
      $ionicConfigProvider.views.maxCache(0);
      $ionicConfigProvider.tabs.position('bottom');
      //$ionicConfigProvider.views.transition('android');
  }

  function configErrorHandler($provide){
    $provide.decorator("$exceptionHandler", function($delegate) {
        return function(exception, cause) {
          $delegate(exception, cause);
          //alert(exception.name + ' - ' + exception.message);
        };
      });
  }


})();
