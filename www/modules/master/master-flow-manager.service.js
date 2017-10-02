(function() {
'use strict';

    angular
        .module('foneClub')
        .service('FlowManagerService', FlowManagerService);

    FlowManagerService.inject = ['LocationService', 'FireBaseManagerUtil', '$window', 'localStorageService', '$rootScope'];
    function FlowManagerService(LocationService, FireBaseManagerUtil, $window, localStorageService, $rootScope) {

        this.changeLoginView = changeLoginView;
        this.changeHomeView = changeHomeView;
        this.changeCheckoutView = changeCheckoutView;
        this.changeEdicaoView = changeEdicaoView;
        this.changeCustomersView = changeCustomersView;
        this.changeOrdemServicoView = changeOrdemServicoView;
        this.changeListCustomer = changeListCustomer;
        this.changeCadastro = changeCadastro;
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
            $rootScope.$broadcast('changeMenuItem', 'home');
        }
        
        function changeEdicaoView(param) {
            LocationService.change('tabs.edicao', param);
        }
        
        function changeCustomersView(){
            LocationService.change('tabs.customers');
            $rootScope.$broadcast('changeMenuItem', 'customers');
        }
        
        function changeOrdemServicoView(param){
            LocationService.change('tabs.ordemservico', param);
        }

        function changeListCustomer(param) {
            LocationService.change('tabs.list-customer', param);
            $rootScope.$broadcast('changeMenuItem', 'list-customer');
        }

        function changeCadastro(param) {
            LocationService.change('tabs.cadastro', param);
            $rootScope.$broadcast('changeMenuItem', 'cadastro');
        }
        
        function goBack() {
            $window.history.back();
        }
    }
})();