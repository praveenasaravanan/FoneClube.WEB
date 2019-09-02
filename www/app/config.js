(function () {

  'use strict';

  angular.module('foneClub')
    .config(masterConfiguration);

  function masterConfiguration($urlRouterProvider,$ionicConfigProvider,$provide, $stateProvider, $locationProvider){

      configRouteProvider($ionicConfigProvider, $locationProvider)

      var rota = window.location.href;
      // debugger

      $stateProvider.state('master', {
        url: '/',
        templateUrl: 'modules/login/login.html',
        controller: 'LoginController as vm'
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
        cache: false,
        url: "/customers",
        params : {previous: rota},
        views: {
          'menu-tab': {
            templateUrl: "modules/customers/customers.html",
            controller: 'CustomersController as vm'
          }
        }
      })
      .state('tabs.status-charging', {
        url: "/status-charging",
        views: {
          'menu-tab': {
            templateUrl: "modules/status-charging/status-charging.html",
            controller: 'StatusChargingController as vm' 
          }
        }
      })
      .state('tabs.customers-new', {
        url: "/customers-new",
        views: {
          'menu-tab': {
            templateUrl: "modules/customers/new/customers-new.html",
            controller: 'CustomersControllerNew as vm'
          }
        }
      })
      .state('tabs.edicao', {
        url: "/edicao", 
        views: {      
          'menu-tab': {
            templateUrl: "modules/customers/edicao/edicao.html",
            controller: 'EdicaoController as vm'
          }
        },
        params: {data: null}
      })
      .state('tabs.ordemservico', {
        url: "/ordemservico",       
        templateUrl: "modules/customers/ordem-servico/ordemservico.html",
        controller: 'OrdemServico as vm',
        params: { data: null }      
      })
      .state('tabs.mass-charging', {
        url: "/mass-charging",
        views: {
          'menu-tab': {
            templateUrl: "modules/mass-charging/mass-charging.html",
            controller: 'MassChargingController as vm'
          }
        }
      })
      .state('tabs.allphone-lines',{
        url: "/allphone-lines",
        views: {
          'menu-tab': {
            templateUrl: "modules/allphonelines/allphonelines.html",
            controller: 'AllPhoneLinesController as vm'
          }
        }
      })
      .state('tabs.template-edit', {
        url: "/template-edit",
        views: {
          'menu-tab': {
            templateUrl: 'modules/template-edit/template-edit.html',
            controller: 'TemplateEditController as vm'
          }
        }
      })
      .state('tabs.all-phones', {
        url: "/allPhones",
        views: {
          'menu-tab': {
            templateUrl: 'modules/all-phones/all-phones.html',
            controller: 'AllPhonesController as vm'
          }
        }
        })
        .state('tabs.estoque', {
          url: "/estoque",
          views: {
            'menu-tab': {
              templateUrl: 'modules/estoque/estoque.html',
              controller: 'EstoqueController as vm'
            }
          }
        })
        .state('tabs.plan-edition', {
          url: "/plan-edition",
          views: {
            'menu-tab': {
              templateUrl: 'modules/plan-edition/plan-edition.html',
              controller: 'PlanEditionController as vm'
            }
          }
        })
        .state('tabs.report-comissions', {
          url: "/report-comissions",
          views: {
            'menu-tab': {
              templateUrl: 'modules/report-comissions/report-comissions.html',
              controller: 'ReportComissionController as vm'
            }
          }
        })
        .state('tabs.all-phones-new', {
          url: "/allPhoneNew",
          views: {
            'menu-tab': {
              templateUrl: 'modules/all-phones-new/all-phones-new.html',
              controller: 'AllPhoneNewController as vm'
            }
          }
        })
      // .state('tabs.estoque', {
      //   url: "/estoque",
      //   views: {
      //     'menu-tab': {
      //       templateUrl: 'modules/estoque/estoque.html',
      //       controller: 'EstoqueController as vm'
      //     }
      //   }
      // })

      
      $urlRouterProvider.otherwise('/');
      configErrorHandler($provide);
  }

  function configRouteProvider($ionicConfigProvider, $locationProvider){
      $ionicConfigProvider.views.maxCache(0);
      $ionicConfigProvider.tabs.position('bottom');

      // $locationProvider.html5Mode(true).hashPrefix('!');

      // $locationProvider.html5Mode({
      //   enabled: true,
      //   requireBase: false
      // });
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
