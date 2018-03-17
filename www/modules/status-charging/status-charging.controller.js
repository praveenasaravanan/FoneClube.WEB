(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('StatusChargingController', StatusChargingController);
    
        StatusChargingController.inject = ['FlowManagerService', 'MainUtils', 'FoneclubeService', 'PagarmeService'];
        function StatusChargingController(FlowManagerService, MainUtils, FoneclubeService, PagarmeService) {
            var vm = this;
            console.log('--- StatusChargingController --- ' );
            vm.totalCharged = '...';
            vm.totalReceived = '...';
            vm.searchStatusCharging = searchStatusCharging;
            vm.formatAmmout = formatAmmout
            var totalRecebidoBoleto = 0;

            function searchStatusCharging(){
                // console.log('searchStatusCharging')
                // console.log( vm.month + ' ' + vm.year);

                FoneclubeService.getStatusCharging(vm.month,vm.year).then(function (result) {
                    console.log('getStatusCharging')
                    console.log(result)
                    vm.customers = result;
                    handleData(vm.customers)
                })
            }

            function handleData(customers){
                
                vm.callbackCount = 0;
                vm.totalBoletoCharges = 0;
                vm.totalReceived = 0;
                vm.totalCharged = 0;
                vm.totalCustomers = customers.length;
                vm.totalCustomersCharged = customers.filter(v => v.Charged == true).length;
                vm.totalCustomersNotCharged = customers.filter(v => v.Charged == false).length;

                try{
                    vm.totalBoletoCharges = customers[0].TotalBoletoCharges;
                }
                catch(erro)
                {
                    //sem clientes
                }

                for (var index in customers) {
                    var customer = customers[index];
                        

                    // console.log(customer.Name)
                    try{
                        customer.phone = customer.Phones[0].DDD  + customer.Phones[0].Number;
                        var operadora = customer.Phones[0].IdOperator == 1 ? 'Claro': 'Vivo'
                        customer.phoneDetail = operadora + ' - ' + customer.Phones[0].PlanDescription;
                    }
                    catch(erro){}

                    if(customer.Charged)
                    {
                        customer.status = customer.ChargingValidity[0].PaymentType == 1 ? 'PAGO' : 'CARREGANDO';

                        
                            customer.registerPayd = false;

                            for(var i in customer.ChargingValidity)
                            {
                                var charge = customer.ChargingValidity[i];
                                
                                if(charge.PaymentType == 2)
                                {
                                    
                                    PagarmeService.getStatusBoletoRecursivo(charge.BoletoId, customer, vm, index, i).then(function (result) {
                                        
                                        // debugger;
                                        if(result[0].status == "waiting_payment")
                                        {
                                            charge.StatusDescription = 'PENDENTE';

                                            // debugger;
                                            result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].StatusDescription = 'PENDENTE'

                                            if(!result[0].elemento.registerPayd){
                                                result[0].elemento.status = charge.StatusDescription;
                                            }
                                        }
                                        else if(result[0].status == "paid"){
                                            
                                            charge.StatusDescription = 'PAGO';
                                            result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].StatusDescription = 'PAGO'
                                            try{
                                                
                                            }
                                            catch(erro){}
                                            

                                            result[0].elemento.registerPayd = true;
                                            result[0].elemento.status = charge.StatusDescription;
                                            debugger
                                            console.log('Adicionando ' + parseInt(result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].Ammount,10))
                                            console.log('Adicionando ' + totalRecebidoBoleto)
                                            totalRecebidoBoleto += parseInt(result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].Ammount,10)
                                            result[0].vm.totalReceived += parseInt(result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].Ammount,10)
                                        }
                                        else{
                                            // debugger;
                                        }

                                        result[0].vm.callbackCount++;

                                        if(result[0].vm.callbackCount == result[0].vm.totalBoletoCharges)
                                        {
                                            console.log('Completou todos boletos');
                                            result[0].vm.totalReceived = parseFloat(result[0].vm.totalReceived / 100).toString().replace('.',',');
                                        }
        
                                    })
                                }
                            }
                            
                        vm.totalCharged += parseInt(customer.ChargingValidity[0].Ammount);

                        if(customer.ChargingValidity[0].Payd == true)
                        {
                            vm.totalReceived += parseInt(customer.ChargingValidity[0].Ammount)
                        }

                        customer.ammout = parseFloat(parseInt(customer.ChargingValidity[0].Ammount) / 100).toString().replace('.',',')
                        
                    }    
                    else  
                    {
                        customer.status = 'NÃO COBRADO'; 
                    }
                         
                }
                
                vm.totalCharged = parseFloat(vm.totalCharged / 100).toString().replace('.',',');
                // vm.totalReceived = parseFloat(vm.totalReceived / 100).toString().replace('.',',');

            }

            function formatAmmout(value){
                return  parseFloat(parseInt(value) / 100).toString().replace('.',',')
            }
            
            
            
            ////////
            //MainUtils.setAgent('Cardozo');
            //FlowManagerService.changeHomeView();
            ////////
    
        }
    
    })();