(function() {
'use strict';

    angular
        .module('foneClub')
        .service('FlowManagerService', FlowManagerService);

    FlowManagerService.inject = ['LocationService', 'FireBaseManagerUtil'];
    function FlowManagerService(LocationService, FireBaseManagerUtil) {

        this.changeLoginView = changeLoginView;
        this.changeHomeView = changeHomeView;
        this.changeCheckoutView = changeCheckoutView;
        this.changeEdicaoView = changeEdicaoView;
        this.changeCustomers = changeCustomers;

        function changeLoginView(){
            LocationService.change('login');
        }

        function changeCheckoutView(){
            LocationService.change('tabs.checkout-view');
        }

        function changeHomeView(){
            LocationService.change('tabs.home');
        }
        
        function changeEdicaoView(param) {
            LocationService.change('edicao', param);
        }
        
        function changeCustomers(){
            LocationService.change('tabs.customers');
        }
    }
})();