(function () {
    
        'use strict';
    
        angular
            .module('foneClub')
            .factory('DialogFactory', DialogFactory);
    
        DialogFactory.$inject = ['ngDialog', '$q'];
    
        function DialogFactory(ngDialog, $q) {

            function _dialogConfirm(param) {                
                var defer = $q.defer();
                if(param.titulo == undefined || !param.titulo) {
                    param.titulo = 'Confirmação';
                }
                if(param.btn1 == undefined || !param.btn1) {
                    param.btn1 = 'Cancelar';
                }
                if(param.btn2 == undefined || !param.btn2) {
                    param.btn2 = 'Ok';
                }
                ngDialog.openConfirm({
                    template:'<div class="mensagens-dialog"><div class="mensagem-content"><div class="title-mensagem">'+
                    '<span>' + param.titulo +'</span><hr></div>' +
                    '<div class="corpo-mensagem">'+ param.mensagem +'</div>' +
                    '<div class="footer">' +                    
                    '<button type="button" class="btnCancelar" ng-click="closeThisDialog(0)"> '+ param.btn1 + ' </button>' +
                    '<button type="button" id="openConfirm-btn-confirm" class="btnConfirmar" ng-enter-all="confirm(1)" ng-click="confirm(1)"> ' + param.btn2 + ' </button></div></div></div>',
                    plain: true,
                    className: 'mensagens-dialog',
                    closeByDocument: false,
                    closeByEscape: false                    
                }).then(function(param) {
                    defer.resolve(param);
                }, function(param) {
                    defer.resolve(param);
                })
                return defer.promise;
            }

            function _showMessageDialog(param) {
                var defer = $q.defer();
                if(param.titulo == undefined || !param.titulo) {
                    param.titulo = 'Aviso';
                }
                ngDialog.open({
                    template: '<div class="mensagens-dialog"><div class="mensagem-content"><div class="title-mensagem">'+
                    '<span>' + param.titulo +'</span><hr></div>' +
                    '<div class="corpo-mensagem">'+ param.mensagem +'</div>' +
                    '<div class="footer">' +
                    '<button type="button" class="btnOk" ng-enter-all="closeThisDialog(0)" ng-click="closeThisDialog(0)">Ok' +
                    '</button></div></div></div>',
                    plain: true,
                    className: 'mensagens-dialog',
                    closeByDocument: false,
                    closeByEscape: false
                })
                return defer.promise;
            }

            function _showAlertDialog(param) {
                debugger;
                var defer = $q.defer();
                if(param.titulo == undefined || !param.titulo) {
                    param.titulo = 'Aviso';
                }
                ngDialog.open({
                    template: '<div class="mensagens-dialog"><div class="mensagem-content"><div class="title-mensagem">'+
                    '<span>' + param.titulo +'</span><hr></div>' +
                    '<div class="corpo-mensagem">'+ param.message +'</div>' +
                    '<div class="footer">' +
                    '<button type="button" class="btnOk" ng-enter-all="closeThisDialog(0)" ng-click="closeThisDialog(0)">Ok' +
                    '</button></div></div></div>',
                    plain: true,
                    className: 'mensagens-dialog',
                    closeByDocument: false,
                    closeByEscape: false
                })
                return defer.promise;
            }
            
            function _showLoader(mensagem) {                               
                return ngDialog.open({
                    template: '<div class="mensagens-dialog"><div class="show-loader">'+                    
                    '<span>'+ mensagem +'</span></div></div>',
                    plain: true,
                    className: 'mensagens-dialog',
                    closeByDocument: false,
                    closeByEscape: false
                })                
            }

            function _showMessageConfirm(param) {
                var defer = $q.defer();
                if(param.titulo == undefined || !param.titulo) {
                    param.titulo = 'Aviso';
                }
                ngDialog.openConfirm({
                    template:'<div class="mensagens-dialog"><div class="mensagem-content"><div class="title-mensagem">'+
                    '<span>' + param.titulo +'</span><hr></div>' +
                    '<div class="corpo-mensagem">'+ param.mensagem +'</div>' +
                    '<div class="footer">' +                    
                    '<button type="button" class="btnOk" ng-enter-all="confirm(1)" ng-click="confirm(1)"> Ok </button></div></div></div>',
                    plain: true,
                    className: 'mensagens-dialog',
                    closeByDocument: false,
                    closeByEscape: false
                }).then(function(param) {
                    defer.resolve(param);
                }, function(param) {
                    defer.resolve(param);
                })
                return defer.promise;
            }

            function _showTemplate(template) {
                return ngDialog.open({                    
                    template: template,   
                    className: 'show-template',                        
                    closeByDocument: true,
                    closeByEscape: true,
                    showClose: false                    
                })
            }

            return {
                dialogConfirm: _dialogConfirm,
                showMessageDialog: _showMessageDialog,
                showMessageConfirm: _showMessageConfirm,
                showLoader: _showLoader,
                showTemplate: _showTemplate,
                showAlertDialog:_showAlertDialog
            }
    
        }
    
    })();
    