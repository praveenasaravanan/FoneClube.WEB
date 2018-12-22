(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('MassChargingController', MassChargingController);

    MassChargingController.inject = ['$scope', 'FoneclubeService', 'PagarmeService', '$q', 'UtilsService', '$timeout'];

    function MassChargingController($scope, FoneclubeService, PagarmeService, $q, UtilsService, $timeout) {
        
        var vm = this;
        var prefixoMoetario = 'R$';
        vm.viewName = "Cobrança em massa";
 
        vm.plans = [];
        vm.year = new Date().getFullYear();
        vm.month = new Date().getMonth();
        vm.onSearchMassCharging = onSearchMassCharging;
        vm.loading = false;
        vm.onClickCobrar = onClickCobrar;
        vm.onChangeCheckboxSoma = onChangeCheckboxSoma;
        vm.onChangeCheckboxLastPayment = onChangeCheckboxLastPayment;
        vm.paymentMethod = [
            { id:'boleto', description: 'Boleto' },
            { id:'cartao', description: 'Cartão de Crédito' }
        ]
        

        function onSearchMassCharging(){

            vm.loading = true;
            FoneclubeService.getMassChargingData(vm.month,vm.year).then(function (result) {
                vm.lista = result;
                console.log(result)
                vm.lista.forEach(customer => {
                    
                    if(!customer.Charged)
                        customer.infoMessage = 'Cliente não cobrado no mês vingente definido.';

                    if(customer.LastCharge)
                    {
                        customer.lastPayment = true;
                        onChangeCheckboxLastPayment(customer)
                    }
                        
                    customer.defaultCharging = true;
                });
                vm.loading = false;
            }).catch(function(error){
                alert('Aviso: o watcher pegou uma exceção, por favor, tire um print para companhamento: mcc5')
            })
        }

        function onClickCobrar(customer){

            var valorTotalCobrar = customer.chargingAmmount;
            valorTotalCobrar = parseInt(valorTotalCobrar.replace('.','').replace(prefixoMoetario, ''))
            
            if(!validationCharge(customer))
                return;

            if(!customer.requesting)
            {
                console.log('onClickCobrar')
                console.log(customer.boletoComment)
                console.log(customer.emailComment)
                console.log(customer.foneclubeComment)
                console.log(valorTotalCobrar)
                console.log(customer.typeCharging)
                console.log(customer.defaultCharging)

                if(customer.typeCharging == "boleto")
                {
                    console.log('cobrar boleto')
                }

                if(customer.typeCharging == "cartao")
                {
                    console.log('cobrar cartao')
                }

                // faz cobranca
                customer.requesting = false;
            }

            customer.requesting = true;

            

            
        }

        function validationCharge(customer){
            if(customer.typeCharging == undefined )
            {
                alert('Escolha um tipo de cobrança');
                return false;
            }

            if(customer.chargingAmmount == undefined )
            {
                alert('Escolha um valor de cobrança');
                return false;
            }

            if(customer.chargingAmmount < 100)
            {
                alert('Escolha um valor válido de cobrança');
                return false;
            }

            return true;
        }

        function onChangeCheckboxSoma(customer){
            console.log(`onChangeCheckboxSoma ` + customer.soma);

            customer.lastPayment = false;

            if(customer.soma && customer.TotalAmountCustomer > 0)
            {
                customer.chargingAmmount = prefixoMoetario + (customer.TotalAmountCustomer / 100);

                if(customer.chargingAmmount.split('.').length == 2){
                    customer.chargingAmmount += '0'
                }

                if(customer.chargingAmmount.split('.').length == 1){
                    customer.chargingAmmount += '.00'
                }
            }
                
            if(!customer.soma)    
                customer.chargingAmmount =  prefixoMoetario + '0.00';

        }

        function onChangeCheckboxLastPayment(customer){
            console.log(`onChangeCheckboxLastPayment`)
            customer.soma = false

            debugger
            if(customer.lastPayment && customer.LastCharge.Amount > 0)
            {
                customer.chargingAmmount = prefixoMoetario + (customer.LastCharge.Amount / 100);

                if(customer.chargingAmmount.split('.').length == 2){
                    customer.chargingAmmount += '0'
                }

                if(customer.chargingAmmount.split('.').length == 1){
                    customer.chargingAmmount += '.00'
                }

                customer.boletoComment = customer.LastCharge.CommentBoleto
                customer.emailComment = customer.LastCharge.CommentEmail
                customer.foneclubeComment = customer.LastCharge.CommentFoneclube

                var cartao = 1
                var boleto = 2;

                if(customer.LastCharge.ChargeType == boleto)
                {
                    customer.typeCharging = 'boleto'
                }
                if(customer.LastCharge.ChargeType == cartao)
                {
                    customer.typeCharging = 'cartao'
                }
            }
                
            if(!customer.lastPayment)    
                customer.chargingAmmount =  prefixoMoetario + '0.00';

        }

    }
})();