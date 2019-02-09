(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('MassChargingController', MassChargingController);

    MassChargingController.inject = ['$scope', 'FoneclubeService', 'PagarmeService', '$q', 'UtilsService', '$timeout', 'MainUtils'];

    function MassChargingController($scope, FoneclubeService, PagarmeService, $q, UtilsService, $timeout, MainUtils) {
        
        var vm = this;
        var prefixoMoetario = 'R$';
        const cartao = 1;
        const boleto = 2;
        vm.viewName = "Cobrança em massa";
 
        vm.plans = [];
        vm.year = new Date().getFullYear();
        vm.month = new Date().getMonth() + 1;
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
                        onChangeCheckboxLastPayment(customer, false)
                    }
                        
                    customer.defaultCharging = true;
                    customer.enviarEmail = true;
                });
                vm.loading = false;
            }).catch(function(error){
                alert('Aviso: o watcher pegou uma exceção, por favor, tire um print para companhamento: mcc5')
            })
        }


        function onClickCobrar(customer){

            // debugger
            setMessageInfo(customer, "Iniciando cobrança, validando campos preenchidos")
            var valorTotalCobrar = customer.chargingAmmount;
            valorTotalCobrar = parseInt(valorTotalCobrar.replace('.','').replace(prefixoMoetario, ''))
            
            if(customer.typeCharging == 'boleto'){
                customer.idTypeCharging = boleto
            }
            else{
                customer.idTypeCharging = cartao
            }

            if(!validationCharge(customer))
                return;

            if(!customer.requesting)
            {

                var customerSend = {
                    Id: customer.Id,
                    Charging:{
                        Comment:customer.foneclubeComment,
                        CommentEmail:customer.emailComment,
                        CommentBoleto: customer.boletoComment, 
                        Ammount: valorTotalCobrar,
                        CollectorName: MainUtils.getAgent(),
                        PaymentType: customer.idTypeCharging,
                        AnoVingencia:vm.year,
                        MesVingencia: vm.month,
                        TransactionId: null
                    }
                }

                setMessageInfo(customer, "Iniciando envio de transação, aguarde, esperando retorno do gateway de pagamento")
                FoneclubeService.postGeraCobrancaIntegrada(customerSend).then(function (result) {
                    
                    if(result.StatusPaid){
                        setMessageInfo(customer, "Transação efetuada concluindo processo")
                    }
                    else{
                        setMessageInfo(customer, result.DescriptionMessage);
                        customer.requesting = false;
                        return
                    }
                    
                    // debugger
                    if(customer.typeCharging == "boleto")
                    {
                        if(customer.enviarEmail)
                        {
                            if(result.StatusPaid){

                                // debugger
                                var emailObject = {
                                    To: customer.Email,
                                    TargetName : customer.Name,
                                    TargetTextBlue: result.LinkBoleto,
                                    DiscountPrice: customer.chargingAmmount.replace('R$','').replace('.',','),
                                    TargetSecondaryText : customer.emailComment,
                                    TemplateType : 2
                                }
                                
                                FoneclubeService.postSendEmail(emailObject).then(function(result){
                                    console.log('FoneclubeService.postHistoryPayment');
                                    console.log(result);

                                    customer.requesting = false;

                                    if(result){
                                        customer.Charged = true
                                    } 
                                    else{
                                        setMessageInfo(customer, "Cliente cobrado, histórico salvo, mas email não enviado, importante.")
                                    }
                                })
                                .catch(function(error){
                                    console.log('catch error');
                                    console.log(error);
                                    customer.requesting = false;
                                    setMessageInfo(customer, "Cliente cobrado, histórico salvo, mas email não enviado, importante.")
                                });
                                
                            }
                                
                        }
                        else{
                            console.log('Cobrado sem email concluído')
                            customer.requesting = false;
                            customer.Charged = true
                        }
                    }
    
                    if(customer.typeCharging == "cartao")
                    {
                        console.log('cobrado cartao, enviar email');

                        var emailObject = {
                            'To': customer.Email, 
                            'TargetName' : customer.Name,
                            'TargetTextBlue' : customer.chargingAmmount.replace('R$','').replace('.',','),
                            // 'CustomerComment':vm.customerComment,
                            'TargetSecondaryText' : customer.emailComment,
                            'TemplateType' : 1
                        }

                        FoneclubeService.postSendEmail(emailObject).then(function(result){
                            console.log('FoneclubeService.postHistoryPayment');
                            console.log(result);
                            // debugger
                            customer.requesting = false;

                            if(result){
                                customer.Charged = true
                            } 
                            else{
                                setMessageInfo(customer, "Cliente cobrado, histórico salvo, mas email não enviado, importante.")
                            }
                                
                        })
                        .catch(function(error){
                            console.log('catch error');
                            console.log(error);
                            customer.requesting = false;
                            setMessageInfo(customer, "Cliente cobrado, histórico salvo, mas email não enviado, importante.")
                        });
                    }

                    
                })  
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

            // if(!customer.soma)    
            customer.chargingAmmount =  prefixoMoetario + '0.00';

            if(customer.soma && customer.TotalAmountCustomer > 0)
            {
                customer.chargingAmmount = prefixoMoetario + (customer.TotalAmountCustomer / 100).toFixed(2);
                
            }
                
        }

        function onChangeCheckboxLastPayment(customer, ajusteCampoMonetario){
            console.log(`onChangeCheckboxLastPayment`)
            customer.soma = false

            // if(!customer.lastPayment)    
            customer.chargingAmmount =  prefixoMoetario + '0.00';

            if(customer.lastPayment && customer.LastCharge.Amount > 0)
            {
                customer.chargingAmmount = prefixoMoetario + (customer.LastCharge.Amount / 100).toFixed(2);
                
                customer.boletoComment = customer.LastCharge.CommentBoleto
                customer.emailComment = customer.LastCharge.CommentEmail
                customer.foneclubeComment = customer.LastCharge.CommentFoneclube

                if(customer.LastCharge.ChargeType == boleto)
                {
                    customer.typeCharging = 'boleto'
                    customer.idTypeCharging = boleto
                }
                if(customer.LastCharge.ChargeType == cartao)
                {
                    customer.typeCharging = 'cartao'
                    customer.idTypeCharging = cartao
                }
            }
                
            

        }

        function enviaEmailBoleto(customer){
            var emailObject = {
                'To': existentCustomer.email, //existentCustomer.email
                'TargetName' : existentCustomer.name,
                'TargetTextBlue': resultCapture.boleto_url,
                'TargetSecondaryText' : vm.commentBoleto,
                'TemplateType' : 2
            }

            FoneclubeService.postSendEmail(emailObject).then(function(result){
                console.log(result);
            })
            .catch(function(error){
                console.log('catch error');
                console.log(error);
            });
        }

        function enviaEmailCartao(customer){
            var emailObject = {
                'To': vm.existentCustomer.email, //vm.existentCustomer
                'TargetName' : vm.existentCustomer.name,
                'TargetTextBlue' : $filter('currency')(vm.amount / 100, ""),
                // 'CustomerComment':vm.customerComment,
                'TargetSecondaryText' : vm.customerComment,
                'TemplateType' : 1
            }

            FoneclubeService.postSendEmail(emailObject).then(function(result){
                console.log(result);
            })
            .catch(function(error){
                console.log('catch error');
                console.log(error);
            });
        }

        function setMessageInfo(customer, message){
            customer.infoMessage = message;
            customer.Charged = false;
        }

    }
})();