(function() {
'use strict';

    angular
        .module('foneClub')
        .service('FlowManagerService', FlowManagerService);

    FlowManagerService.inject = ['LocationService', 'FireBaseManagerUtil', '$window', 'localStorageService', '$rootScope', '$templateCache', 'UtilsService'];
    function FlowManagerService(LocationService, FireBaseManagerUtil, $window, localStorageService, $rootScope, $templateCache, UtilsService) {

        this.changeLoginView = changeLoginView;
        this.changeHomeView = changeHomeView;
        this.changeCheckoutView = changeCheckoutView;
        this.changeEdicaoView = changeEdicaoView;
        this.changeCustomersView = changeCustomersView;
        this.changeOrdemServicoView = changeOrdemServicoView;
        this.changeListCustomer = changeListCustomer;
        this.changeCadastro = changeCadastro;
        this.changeMassChargingView = changeMassChargingView;
        this.changeStatusChargingView = changeStatusChargingView;
        this.changeAllPhoneLinesView = changeAllPhoneLinesView;
        this.changeTemplateEdit = changeTemplateEdit;
        this.changeEstoqueView = changeEstoqueView;
        this.changeAllPhonesView = changeAllPhonesView;
        this.changePlanEditView = changePlanEditView;
        this.changeReportComissionsView = changeReportComissionsView;
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
            
            // $templateCache.put("lib/ng-table/pager.html",'<div class="ng-cloak ng-table-pager" ng-if=params.data.length> <div ng-if=params.settings().counts.length class="ng-table-counts btn-group pull-right"> <button ng-repeat="count in params.settings().counts" type=button ng-class="{\'active\':params.count() == count}" ng-click=params.count(count) class="btn btn-default"> <span ng-bind=count></span> </button> </div> <ul ng-if=pages.length class="pagination ng-table-pagination"> <li ng-class="{\'disabled\': !page.active && !page.current, \'active\': page.current}" ng-repeat="page in pages" ng-switch=page.type> <a ng-switch-when=prev ng-click=params.page(page.number) href="">&laquo;</a> <a ng-switch-when=first ng-click=params.page(page.number) href=""><span ng-bind=page.number></span></a> <a ng-switch-when=page ng-click=params.page(page.number) href=""><span ng-bind=page.number></span></a> <a ng-switch-when=more ng-click=params.page(page.number) href="">&#8230;</a> <a ng-switch-when=last ng-click=params.page(page.number) href=""><span ng-bind=page.number></span></a> <a ng-switch-when=next ng-click=params.page(page.number) href="">&raquo;</a> </li> </ul> </div> ');
            // $templateCache.put("lib/ng-table/header.html","<ng-table-group-row></ng-table-group-row> <ng-table-sorter-row></ng-table-sorter-row> <ng-table-filter-row></ng-table-filter-row> ");
            
            LocationService.change('tabs.customers');
            $rootScope.$broadcast('changeMenuItem', 'customers');
            // $window.location.reload();
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

        function changeMassChargingView(param) {
            LocationService.change('tabs.mass-charging', param);
            $rootScope.$broadcast('changeMenuItem', 'mass-charging');
        }

        function changeStatusChargingView(param){
            console.log('changeStatusChargingView')
            LocationService.change('tabs.status-charging', param);
            $rootScope.$broadcast('changeMenuItem', 'status-charging');
        }

        function changeAllPhoneLinesView(param){
            LocationService.change('tabs.allphone-lines', param);
            $rootScope.$broadcast('changeMenuItem', 'allphone-lines');
        }

        function changeTemplateEdit(param){
            LocationService.change('tabs.template-edit', param);
            $rootScope.$broadcast('changeMenuItem', 'template-edit');
        }

        function changeEstoqueView(param){
            LocationService.change('tabs.estoque', param);
            $rootScope.$broadcast('changeMenuItem', 'estoque');
        }

        function changePlanEditView(param){
            LocationService.change('tabs.plan-edition', param);
            $rootScope.$broadcast('changeMenuItem', 'plan-edition');
        }

        function changeAllPhonesView(param){
            LocationService.change('tabs.all-phones', param);
            $rootScope.$broadcast('changeMenuItem', 'all-phones'); 
        }

        function changeReportComissionsView(param){
            LocationService.change('tabs.report-comissions', param);
            $rootScope.$broadcast('changeMenuItem', 'report-comissions'); 
        }
        
        function goBack() {
            $window.history.back();
        }
    }
})();