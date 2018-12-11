(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('StatusChargingController', StatusChargingController);
    
        StatusChargingController.inject = ['FlowManagerService', 'MainUtils', 'FoneclubeService', 'PagarmeService', '$interval', 'DialogFactory', 'NgTableParams', 'ngTableDefaults'];
        function StatusChargingController(FlowManagerService, MainUtils, FoneclubeService, PagarmeService, $interval, DialogFactory, NgTableParams, ngTableDefaults) {
   
            var vm = this;
            console.log('--- StatusChargingController --- ' );

            vm.month = new Date().getMonth() + 1;
            vm.year = new Date().getFullYear();
            vm.totalCharged = '...';
            vm.totalReceived = '...';
            vm.searchStatusCharging = searchStatusCharging;
            vm.formatAmmout = formatAmmout
            vm.onTapUpdatePagarme = onTapUpdatePagarme;
            vm.onDesativarBoleto = onDesativarBoleto;
            vm.onAtivarBoleto = onAtivarBoleto;
            vm.changeFilter = changeFilter
            
            var totalRecebidoBoleto = 0;
            var interval;
            var hasUpdate = false;

            vm.loading = false;
            vm.loadingMessage = 'Carregando...';

            var carregandoPagarme = false;
            vm.mensagemPagarme = 'Refresh DB'
            vm.changeSelect = changeSelect
            vm.diffDays = diffDays;
            vm.customers = [];

            vm.statusType = {
                NAO_COBRADO: 1,
                PAGO: 2,
                COBRADO: 3,
                CARREGANDO: 4,
                VENCIDO: 5,
                REFUNDED: 6
            };

            vm.PagamentosType = {
                CARTAO: 1,
                BOLETO: 2
            };

            vm.AtivoType = {
                ATIVA: 1,
                CANCELADA: 2
            }

            vm.tiposStatus = [
                {id: "", title: ""},
                {id: 1, title: 'NÃO COBRADO'},
                {id: 2, title: 'PAGO'},
                {id: 3, title: 'COBRADO'},
                {id: 4, title: 'CARREGANDO'},
                {id: 5, title: 'VENCIDO'},
                {id: 6, title: 'COBRADO'},
            ];

            vm.tiposPagamento = [
                {id: "", title: ""},
                {id: 1, title: 'CARTÃO'},
                {id: 2, title: 'BOLETO'}
            ];

            vm.tipoAtiva = [
                {id: "", title: ""},
                {id: 1, title: 'Ativa'},
                {id: 2, title: 'Cancelada'}
            ]

            function changeSelect(param){
                console.log('Change select' + param)
                console.log(param)
            }


            function onTapUpdatePagarme(){
                ;
                console.log('teste');
                // getUpdatePagarme
                if(!carregandoPagarme)
                {
                    carregandoPagarme = true;
                    vm.mensagemPagarme = 'Aguarde...';
                    FoneclubeService.getUpdatePagarme().then(function (result) {
                        console.log('result ' + result)
                        if(result)
                         alert('Lista pagarme atualizada, por favor recarregue a página sem cache.')
                        else
                            alert('Lista pagarme não atualizada')


                        carregandoPagarme = false; 
                        vm.mensagemPagarme = 'Refresh DB'
                    });
                }
                
            }

            function searchStatusCharging(){
                // console.log('searchStatusCharging')
                // console.log( vm.month + ' ' + vm.year);
                vm.loading = true;
                vm.totalReceivedReady = false;
                hasUpdate = false;
                interval = $interval(checkFullLoad, 5000);

                var ativos = vm.somenteAtivos ? 1 : 0;

                FoneclubeService.getStatusCharging(vm.month,vm.year, ativos).then(function (result) {
                    console.log('getStatusCharging')
                    console.log(result)
                    vm.customers = result;
                    changeFilter(false);
                    for(var i in vm.customers)
                    {
                        vm.customers[i].allChargingsCanceled = false;

                        for(var o in vm.customers[i].ChargingValidity)
                        {
                            vm.customers[i].ChargingValidity[o].display = true;
                        }
                    }

                    handleData(vm.customers);
                    loadPaymentHistory();
                })
            }

            function checkFullLoad(){
                // console.log('------------------------ ' + allStatusLoaded())
                if(!hasUpdate) {
                    updateTable();
                    vm.loading = false;
                    hasUpdate = true;
                }

                if(allStatusLoaded())
                {
                    $interval.cancel(interval);
                    
                    
                    if(!vm.totalReceivedReady){
                        vm.totalReceived = parseFloat(vm.totalReceived / 100).toString().replace('.',',');
                        vm.totalReceivedReady = true;
                    }
                }
                
            }

            function updateTable() {
                vm.tableParams = createUsingFullOptions(vm.customers);
                vm.tableParams.reload();
            }

            function allStatusLoaded(){
                ;
                for (var index in vm.customers) {
                    
                    for(var i in vm.customers[index].ChargingValidity)
                    {
                        // console.log(vm.customers[index].ChargingValidity[i].StatusDescription)
                        if( vm.customers[index].ChargingValidity[i].StatusDescription == 'CARREGANDO')
                        {
                            return false;
                        }
                        
                    }
                    
                }

                return true;
            }

            function handleData(customers){
                
                // .toISOString().split('T')[0].replace('-','/').replace('-','/');

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
                        
                    try{
                        customer.phone = customer.Phones[0].DDD  + customer.Phones[0].Number;
                        var operadora = customer.Phones[0].IdOperator == 1 ? 'Claro': 'Vivo'
                        customer.phoneDetail = operadora + ' - ' + customer.Phones[0].PlanDescription;
                    }
                    catch(erro){}

                    if(customer.Charged)
                    {
                        customer.statusType = vm.statusType.CARREGANDO;
                            customer.registerPayd = false;
                            for(var i in customer.ChargingValidity)
                            {
                                var charge = customer.ChargingValidity[i];

                                try
                                {
                                    customer.ChargingValidity[i].BoletoExpires = new Date(customer.ChargingValidity[i].BoletoExpires).toISOString().split('T')[0].replace('-','/').replace('-','/');
                                    customer.BoletoExpires = customer.ChargingValidity[i].BoletoExpires;
                                }
                                catch(erro){}

                                if(charge.PaymentType == 1 && charge.StatusDescription != 'Refunded')
                                {
                                    customer.ChargingValidity[i].StatusDescription = 'PAGO';
                                    customer.statusType = vm.statusType.PAGO;
                                }

                                if(charge.PaymentType == 2 && charge.BoletoId != 0)
                                {
                                    PagarmeService.getStatusBoletoRecursivo(charge.BoletoId, customer, vm, index, i).then(function (result) {
                                        
                                        // if(result[0].vm.customers[result[0].indexCustomer].Name == 'Antonia Maria da Silva Barboza')
                                        //     debugger
                                        result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].StatusDescription = 'INVÁLIDO'

                                        

                                        if(result[0].status == "waiting_payment")
                                        {
                                            result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].StatusDescription = 'PENDENTE'
                                            customer.statusType = vm.statusType.COBRADO;
                                            
                                            if(!result[0].elemento.registerPayd){
                                                result[0].elemento.status = result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].StatusDescription;
                                            }
                                        }
                                        else if(result[0].status == "paid" ){
                                            
                                            // charge.StatusDescription = 'PAGO';
                                            result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].StatusDescription = 'PAGO';
                                            customer.statusType = vm.statusType.PAGO;
                                            try{
                                                
                                            }
                                            catch(erro){}
                                            

                                            result[0].elemento.registerPayd = true;
                                            result[0].elemento.status = charge.StatusDescription;
                                            // 
                                            console.log('Adicionando ' + parseInt(result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].Ammount,10))
                                            console.log('Adicionando ' + totalRecebidoBoleto)
                                            totalRecebidoBoleto += parseInt(result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].Ammount,10)
                                            result[0].vm.totalReceived += parseInt(result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].Ammount,10)
                                        }
                                        else{
                                            // ;
                                        }

                                        result[0].vm.callbackCount++;

                                        if(result[0].vm.callbackCount == result[0].vm.totalBoletoCharges)
                                        {
                                            console.log('Completou todos boletos');
                                            result[0].vm.totalReceived = parseFloat(result[0].vm.totalReceived / 100).toString().replace('.',',');
                                            vm.totalReceivedReady = true;
                                        }
        
                                    })
                                }

                                if(charge.PaymentType == 1 && charge.StatusDescription == 'Refunded')
                                {
                                    customer.ChargingValidity[i].StatusDescription = 'REFUNDED';
                                    customer.statusType = vm.statusType.REFUNDED;
                                }
                                
                                if(charge.BoletoId == 0 && charge.PaymentType == 2){
                                    if(vm.customers[index].ChargingValidity[i].StatusDescription == 'CARREGANDO')
                                    {
                                        vm.customers[index].ChargingValidity[i].StatusDescription = 'INVÁLIDO';
                                    }
                                    
                                }
                            }
                            
                        vm.totalCharged += parseInt(customer.ChargingValidity[0].Ammount);

                        if(customer.ChargingValidity[0].Payd == true)
                        {
                            vm.totalReceived += parseInt(customer.ChargingValidity[0].Ammount)
                        }

                        customer.ammout = parseFloat(parseInt(customer.ChargingValidity[0].Ammount) / 100).toString().replace('.',',')
                        
                        if(customer.ChargingValidity[0].PaymentType == 1)
                        {
                            customer.statusPayment = vm.PagamentosType.CARTAO;
                        }
                        else
                        {
                            customer.statusPayment = vm.PagamentosType.BOLETO;
                        }

                        if(!customer.ChargingValidity[0].Canceled)
                        {
                            customer.statusAtiva = vm.AtivoType.ATIVA;
                        } 
                        else
                        {
                            customer.statusAtiva = vm.AtivoType.CANCELADA;
                        }

                        if(customer.ChargingValidity[0].Expired && customer.ChargingValidity[0].PaymentType == 2)
                        {
                            customer.statusType = vm.statusType.VENCIDO;
                        }
                    }    
                    else  
                    {
                        customer.status = 'NÃO COBRADO'; 
                        customer.statusType = vm.statusType.NAO_COBRADO;
                    }     
                }

                
                vm.totalCharged = parseFloat(vm.totalCharged / 100).toString().replace('.',',');
                // vm.totalReceived = parseFloat(vm.totalReceived / 100).toString().replace('.',',');

            }

            function loadPaymentHistory(){
                for (var index in vm.customers) {
                   
                    FoneclubeService.getChargeAndServiceOrderHistoryDinamic(vm.customers[index].Id, index).then(function (result) {
                        console.log('FoneclubeService.getChargeAndServiceOrderHistoryDinamic');
                        // console.log(result);
                        if(result.length == 0){
                            //zerado
                            
                            
                        }
                        else{

                            // TODO TEMPORARIO
                            var dataCobranca;
                            try{
                                
                                // dataCobranca = result[0].Charges.PaymentDate.substring(0,10).replace('-','/').replace('-','/');
                                dataCobranca = result[0].Charges.CreationDate;
                            }
                            catch(erro){
                                
                                // dataCobranca = result[0].CreatedDate.substring(0,10).replace('-','/').replace('-','/')
                                dataCobranca = result[0].CreatedDate
                            }
                            
                            var dataConvertida = new Date(dataCobranca).toISOString().split('T')[0].replace('-','/').replace('-','/');
                            var mes = dataConvertida.substring(5,7);
                            var ano = dataConvertida.substring(0,4);
                            console.log('-------------------')
                            console.log(mes)
                            console.log(ano)

                            var selecionado = new Date( vm.year.toString() + '/' + vm.month.toString()).toISOString().split('T')[0].replace('-','/').replace('-','/');
                            var mesSelecionado = selecionado.substring(5,7);
                            var anoSelecionado = selecionado.substring(0,4);

                            if(mesSelecionado == mes && anoSelecionado == ano)
                            {    
                                vm.customers[result.indexLista].dataIgual = true;
                            }

                            vm.customers[result.indexLista].chargingDate = dataConvertida; 
                            vm.customers[result.indexLista].chargingDateDiffDays = diffDays(dataConvertida);
                            vm.customers[result.indexLista].LastPaidDateDiffDays = diffDays(vm.customers[result.indexLista].LastPaidDate);
                        }
                    });
                }
                for (var index in vm.customers) {
                    if(vm.customers[index].chargingDate == undefined || vm.customers[index].chargingDate == null){
                        vm.customers[index].chargingDate = new Date('2000/01/01').toISOString().split('T')[0].replace('-','/').replace('-','/');
                        vm.customers[index].chargingDateDiffDays = diffDays(vm.customers[index].chargingDate);
                    }
                }

            }

            function formatAmmout(value){
                return  parseFloat(parseInt(value) / 100).toString().replace('.',',')
            }

            var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds            
            var secondDate = new Date();

            function diffDays(date)
            {
                var firstDate = new Date(date);
                return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
            } 

            function onDesativarBoleto(charge){
                DialogFactory.dialogConfirm({ mensagem: 'Tem certeza que seja cancelar essa cobrança?' })
                .then(function (value) {
                    if(value)
                    {
                        console.log(charge.Id);
                        FoneclubeService.postChargingUpdate(charge.Id, true)
                        .then(function (value) {
                            console.log(value)
                            if(value)
                            {
                                charge.Canceled = true;
                            }
                        })
                    }
                })
            }

            function onAtivarBoleto(charge){
                DialogFactory.dialogConfirm({ mensagem: 'Tem certeza que seja ativar essa cobrança?' })
                .then(function (value) {
                    if(value)
                    {
                        console.log(charge.Id);
                        FoneclubeService.postChargingUpdate(charge.Id, false)
                        .then(function (value) {
                            console.log(value)
                            if(value)
                            {
                                charge.Canceled = false;
                            }
                        })
                    }
                })
            }

            function changeFilter(reload){
                var elmnt = document.getElementById("table");
                elmnt.scrollTop = 0;
                for(var i in vm.customers)
                {
                    //console.log(vm.customers[i])
                    // if(vm.customers[i].Name == '11 Vera Lúcia Barreto Seixas')
                    vm.customers[i].display = true; 

                    if(vm.cobrancaAtiva)
                    {
                        if(vm.customers[i].statusAtiva == 2)
                            vm.customers[i].display = false;
                        else
                            vm.customers[i].display = true; 
                    }
                    if(vm.clienteAtivo)
                    {
                        if(vm.customers[i].Desativo)
                            vm.customers[i].display = false;
                        else
                            vm.customers[i].display = true; 
                    }
                }

                if(reload)
                {
                    vm.tableParams = createUsingFullOptions(vm.customers);
                    vm.tableParams.reload();
                }
            }

            function createUsingFullOptions(lista) {
                // var data = angular.copy(lista);
                // for(var i in data) {
                //     if(vm.customers[i].Name == 'Marco Aurélio Bento Ribeiro'){
                //         debugger;
                //     }
                //     if(!data[i].display) {
                //         data.splice(i, 1);
                //     }
                // }

                debugger;
                var filtered = lista.filter(function (item) {
                    return item.display;
                });

                var initialParams = {
                  count: 500 // initial page size
                };
                var initialSettings = {
                  // page size buttons (right set of buttons in demo)
                  counts: [50,100,500, 1000],
                  // determines the pager buttons (left set of buttons in demo)
                  paginationMaxBlocks: 10,
                  paginationMinBlocks: 1,
                  dataset: filtered
                };
                return new NgTableParams(initialParams, initialSettings);
    
            }
        }
    
    })();