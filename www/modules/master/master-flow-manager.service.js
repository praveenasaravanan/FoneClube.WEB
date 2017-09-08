(function() {
'use strict';

    angular
        .module('foneClub')
        .service('FlowManagerService', FlowManagerService);

    FlowManagerService.inject = ['LocationService', 'FireBaseManagerUtil', '$window', 'localStorageService'];
    function FlowManagerService(LocationService, FireBaseManagerUtil, $window, localStorageService) {

        this.changeLoginView = changeLoginView;
        this.changeHomeView = changeHomeView;
        this.changeCheckoutView = changeCheckoutView;
        this.changeEdicaoView = changeEdicaoView;
        this.changeCustomersView = changeCustomersView;
        this.changeOrdemServicoView = changeOrdemServicoView;
        this.goBack = goBack;

        function changeLoginView(){
            LocationService.change('login');
        }

        function changeCheckoutView(){
            LocationService.change('tabs.checkout-view');
        }

        function changeHomeView(){
            localStorageService.set('menuItemActive', 'home');
            LocationService.change('tabs.home');
        }
        
        function changeEdicaoView(param) {
            LocationService.change('edicao', param);
        }
        
        function changeCustomersView(){
            LocationService.change('tabs.customers');
        }
        
        function changeOrdemServicoView(param){
            LocationService.change('ordemservico', param);
        }
        
        function goBack() {
            $window.history.back();
        }
    }
})();