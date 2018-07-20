(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('TemplateEditController', TemplateEditController);
    
      TemplateEditController.inject = ['FlowManagerService', 'FoneclubeService', 'PagarmeService'];
      function TemplateEditController(FlowManagerService, FoneclubeService, PagarmeService) {
            var vm = this;
            vm.onClickTemplate = onClickTemplate;
            vm.onClickConfirmChange = onClickConfirmChange;
            console.log('-- TemplateEditController --')

            FoneclubeService.getTemplates().then(function (result) {
                vm.templates = result;
                
            });


            function onClickTemplate(template){
                console.log(template)

                vm.currentTemplate = template
                
            }

            function onClickConfirmChange(){
                console.log('onClickConfirmChange')
            }
    
        }
    })();
    