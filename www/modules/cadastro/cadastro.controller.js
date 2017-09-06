(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('CadastroController', CadastroController);

    CadastroController.inject = [
        '$scope',
        'PagarmeService',
        '$ionicPopup',
        'HubDevService',
        'FoneclubeService',
        '$ionicLoading',
        'FileListUtil',
        'MainUtils',
        '$q',
        '$cordovaCamera',
        '$cordovaFile',
        '$timeout',
        'MainComponents',
        '$ionicModal',
        '$interval',
        'FlowManagerService',
        'ViewModelUtilsService',
        '$ionicScrollDelegate',
        'UtilsService'
    ];

    function CadastroController(
        $scope,PagarmeService, 
         $ionicPopup, 
         HubDevService, 
         FoneclubeService,
         $ionicLoading, 
         FileListUtil,
         MainUtils, 
         $q, 
         $cordovaCamera, 
         $cordovaFile, 
         $timeout, 
         MainComponents, 
         $ionicModal,
         $interval,
         FlowManagerService, 
         ViewModelUtilsService,
         $ionicScrollDelegate,
         UtilsService
    ) {
            
        var vm = this;
        vm.viewName = 'Cadastro Foneclube';
        vm.requesting = false;

        vm.cpf = '';
        vm.birthdate = '';
        vm.zipcode = '';
        vm.street = '';
        vm.complement = '';
        vm.street_number = '';
        vm.neighborhood = '';
        vm.city = '';
        vm.uf = '';
        vm.email = '';
        vm.personalNumber = '';
        vm.phoneNumbersView =[ ];
        onTapNewPhoneNumber();

        vm.onTapSearchDocument = onTapSearchDocument;
        vm.onTapSendDocument = onTapSendDocument;

        vm.validarCEP = validarCEP;
        vm.onTapSendAddress = onTapSendAddress;

        vm.onTapSendPersonalData = onTapSendPersonalData;

        vm.onTapPhotoSelfie = onTapPhotoSelfie;
        vm.onTapPhotoFront = onTapPhotoFront;
        vm.onTapPhotoVerse = onTapPhotoVerse;

        vm.onTapNewPhoneNumber = onTapNewPhoneNumber;
        vm.onTapRemoveNewNumber = onTapRemoveNewNumber;
        vm.setPlansList = setPlansList;
        vm.changePhoneNumber = changePhoneNumber;
        vm.getContactParentName = getContactParentName;
        vm.showAddNewPhone = showAddNewPhone;
        
        vm.enter = enter;
        vm.onTapCancel = onTapCancel;

        init();

        function init(){
            vm.hasCPF = false;
            etapaDocumento();
            vm.allOperatorOptions = MainUtils.operatorOptions();
            FoneclubeService.getPlans().then(function(result){
                console.log(result)
                vm.plans = result;
                vm.selectedPlansList = [];
            })
            .catch(function(error){
                console.log(error.statusText);
            });
           FoneclubeService.getOperators().then(function(result){
                vm.operators = result;
            })
            .catch(function(error){
                console.log(error.statusText);
            });
            $ionicModal.fromTemplateUrl('templates/modal.html', {
                scope: $scope
            }).then(function(modal) {
                vm.modal = modal;
            });
        }

        function onTapSearchDocument(){
            vm.requesting = true;
            MainComponents.showLoader('Tentando preencher dados...');
            
            var cpf = UtilsService.clearDocumentNumber(vm.cpf);
            FoneclubeService.getCustomerByCPF(cpf).then(function(existentClient){
                if (existentClient.Id == 0) {
                    HubDevService.validaCPF(cpf).then(function(result){
                        if(result.status){
                           vm.name = result.nome;
                        }
                        etapaDocumentoFaseNome();
                    }, function(error){
                        etapaDocumentoFaseNome();
                    });
                } else {
                    MainComponents.hideLoader();
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Cliente já cadastrado',
                        template: 'Deseja acrescentar novas linhas a este CPF?',
                        buttons: [
                            {   text: 'Não' },
                            {   text: '<b>Sim</b>',
                                type: 'button-positive',
                                onTap: function(e) {
                                    return true;
                                }
                            }
                        ]
                    });
                    confirmPopup.then(function(res) {
                        if(res) {
                            FlowManagerService.changeEdicaoView(existentClient);
                        } else {
                            FlowManagerService.changeHomeView();
                        }
                    });
                }
            }, function (result) {
                FlowManagerService.changeHomeView();
            }).catch(function (error) {
                FlowManagerService.changeHomeView();
            });
        }

        function onTapSendDocument(){
            vm.requesting = true;
            var dia = vm.birthdate.split('/')[0];
            var mes = vm.birthdate.split('/')[1];
            var regexBirthday =/^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/;
            var dadosInvalidos = parseInt(dia) > 31 || parseInt(mes) > 12 || parseInt(mes) == 0 || parseInt(dia) == 0;
            if(!regexBirthday.test(vm.birthdate) || dadosInvalidos){
                MainComponents.alert({mensagem:'Data de nascimento Inválida'});
                vm.requesting = false;
                return;
            }
            var personCheckout = {
                'DocumentNumber': UtilsService.clearDocumentNumber(vm.cpf),
                'Name': vm.name,
                'Born': vm.birthdate,
                'Email': vm.email
            };
            if(vm.personalNumber.length >= 14) {
                personCheckout['Phones'] = [
                    {
                        'DDD': getNumberJson(vm.personalNumber).DDD,
                        'Number': getNumberJson(vm.personalNumber).Number,
                        'IdOperator': vm.operator,
                        'IsFoneclube': null
                    }
                ];
            }
            FoneclubeService.postBasePerson(personCheckout).then(function(result){
                if(result) {
                    etapaEndereco();
                    MainComponents.alert({titulo:'Andamento',mensagem:'Documento enviado, agora preencha os dados de Endereço.'});
                }
            }).catch(function(error){
                console.log('catch error');
                console.log(error);
                console.log(error.statusText);
                vm.requesting = false;
                MainComponents.alert({mensagem:error.statusText});
            });
        }
            
        function getNumberJson(param) {
            var number = {
                DDD: clearPhoneNumber(param).substring(0, 2),
                Number: clearPhoneNumber(param).substring(2)
            }
            return number;
        }

        function validarCEP() {
            if (vm.zipcode.length < 9) return;
            
            MainComponents.showLoader('Tentando preencher dados...');
            HubDevService.validaCEP(vm.zipcode.replace(/[-.]/g , '')).then(function(result){
                if (!result.erro) {
                    vm.street = result.logradouro;
                    vm.neighborhood = result.bairro;
                    vm.city = result.localidade;
                    vm.uf = result.uf;
                } else {
                    MainComponents.alert({mensagem: "CEP incorreto."});
                }
                MainComponents.hideLoader();
            }, function(error){
                MainComponents.hideLoader();
            });
        }

        function onTapSendAddress() {
            vm.requesting = true;
            var cpf = UtilsService.clearDocumentNumber(vm.cpf);

            var personCheckout = {
                'DocumentNumber': cpf,
                'Adresses': [
                    {
                        'Street': vm.street,
                        'Complement': vm.complement,
                        'StreetNumber': vm.street_number,
                        'Neighborhood': vm.neighborhood,
                        'City': vm.city,
                        'State': vm.uf,
                        'Cep': vm.zipcode
                    }
                ]
            };
            
            //Remove os atributos falsy
            if (personCheckout.Adresses[0].Complement == '' || !personCheckout.Adresses[0].Complement) {
                delete personCheckout.Adresses[0].Complement;
            }

            FoneclubeService.postUpdatePersonAdress(personCheckout).then(function(result){
                if(result) {
                    etapaDadosPessoais();
                    MainComponents.alert({titulo:'Andamento',mensagem:'Endereço enviado, agora preencha os dados pessoais.'});
                }
            })
            .catch(function(error){
                console.log('catch error');
                console.log(error);
                console.log(error.statusText); // mensagem de erro para tela, caso precise
                MainComponents.alert({mensagem:error.statusText});
                vm.requesting = false;
            });

            console.log(personCheckout)
        }

        function onTapSendPersonalData(){
            vm.requesting = true;
            var cpf = UtilsService.clearDocumentNumber(vm.cpf);
            var personCheckout = {
                'DocumentNumber': cpf,
                'Images': [selfiePhotoName, frontPhotoName, versePhotoName]
            };
            
            //Remove os atributos falsy
            for(var i = personCheckout.Images.length - 1; i >= 0; i--) {
                if(personCheckout.Images[i] == "" || !personCheckout.Images[i]) {
                    personCheckout.Images.splice(i, 1);
                }
            } 
            if (personCheckout.Images.length == 0) {
                delete personCheckout.Images
            }

            /**var selfiePhotoName = '';
            var frontPhotoName = '';
            var versePhotoName = ''; */
            console.log(personCheckout);
            FoneclubeService.postUpdatePerson(personCheckout).then(function(result){
                console.log(result);
                if(result) {
                    etapaComplementar();
                    MainComponents.alert({titulo:'Andamento',mensagem:'Dados pessoais enviados, agora preencha os dados Foneclube.'});
                }
                //post realizado com sucesso
            })
            .catch(function(error){
                console.log('catch error');
                console.log(error);
                MainComponents.alert({mensagem:error.statusText});
                vm.requesting = false;
            });
        }

        function etapaDocumentoFaseNome(){
            vm.hasCPF = true;
            vm.requesting = false;
            MainComponents.hideLoader();
        }

        function etapaDocumento(){
            limpaEtapas();
            resizeScroll();
            $ionicScrollDelegate.scrollTop(true);
            vm.etapaDocumento = true;
        }

        function etapaEndereco(){
            limpaEtapas();
            vm.etapaBuscarCEP = true;
            vm.etapaEndereco = true;
            resizeScroll();
            $ionicScrollDelegate.scrollTop(true);
            vm.requesting = false;
        }

        function etapaDadosPessoais(){
            limpaEtapas();
            vm.etapaDadosPessoais = true;
            resizeScroll();
            $ionicScrollDelegate.scrollTop(true);
            vm.requesting = false;
        }

        function etapaComplementar(){
            limpaEtapas();
            vm.etapaComplementar = true;
            resizeScroll();
            $ionicScrollDelegate.scrollTop(true);
            vm.requesting = false;
        }

        function limpaEtapas(){
            vm.etapaDocumento = false;
            vm.etapaEndereco = false;
            vm.etapaDadosPessoais = false;
            vm.etapaComplementar = false;
        }

        /////////////////////////
        /////FOTOS FASE
        //MOVER PRA CONSTATNS
        var PHOTO_SELFIE = 1;
        var PHOTO_FRONT = 2;
        var PHOTO_VERSE = 3;
        var interval;
        vm.currentPhoto;

        function onTapPhotoSelfie(){
            console.log('onTapPhotoSelfie');
            if(!vm.selfieSended)
                launchModal(PHOTO_SELFIE);
        }

        function onTapPhotoFront(){
            console.log('onTapPhotoFront');
            if(!vm.frontSended)
                launchModal(PHOTO_FRONT);
        }

        function onTapPhotoVerse(){
            console.log('onTapPhotoVerse');
            if(!vm.verseSended)
                launchModal(PHOTO_VERSE);
                //deseja trocar imagem?
        }

        function launchModal(photoType){
            console.log('launchModal ' + photoType);
            vm.currentPhoto = photoType;
            //limpa seleção de arquivo em variável local e em variável global
            vm.hasFileSelected = false;
            FileListUtil.set(undefined);
            vm.hasPhotoCaptured = false;
            vm.modal.show();
            validadeFile();

        }

        function validadeFile(){
            try{
                $interval.cancel(interval);
            }
            catch(error){ }
            interval = $interval(function() {
                //console.log('say hello');
                //console.log(FileListUtil.get())
                if(FileListUtil.get())
                {
                    vm.hasFileSelected = true;
                }
            }, 500);
        }

        vm.onTapPhotoGalley = onTapPhotoGalley;
        vm.onTapPhotoCamera = onTapPhotoCamera;
        function onTapPhotoGalley(){
            console.log('onTapPhotoGalley');
            //não precisu file upload abre direto do DOM
        }
        function onTapPhotoCamera(){
            console.log('onTapPhotoCamera');
            //startCameraPhoto(); não precisa file upload abre direto do DOM
        }

        ////PHOTO PROCCESS
        /////////////////////////////////////
        /////////////////////////////////////

        ///GALERIA
        var personCheckout = {};
        personCheckout.Images = [];
        var selfiePhotoName = '';
        var frontPhotoName = '';
        var versePhotoName = '';
        var listaImagens = [];
        var cameraPhotoName;
        vm.fotos = [];
        vm.images = []
        vm.onTapSendImage = onTapSendImage;
        function uploadIdentidadeGaleria(){
            console.log('uploadIdentidadeGaleria')
            var file = FileListUtil.get();
            if(!file)
             return;
            uploadFile(file).then(function(result){
                console.log('result')
                console.log(result.filename);
                setImageReleaseView(result);
                //https://s3-sa-east-1.amazonaws.com/fone-clube-bucket/lsUbxLxh-IMG_20170420_162617843.jpg
            });

        }

        function setImageReleaseView(result){
            switch(vm.currentPhoto) {
                    case PHOTO_SELFIE:
                        console.log('PHOTO_SELFIE');
                        vm.selfieSended = true;
                        vm.showSelfiePhoto = true;
                        selfiePhotoName = result.filename;
                        vm.selfiePhotoURL = 'https://s3-sa-east-1.amazonaws.com/fone-clube-bucket/' + selfiePhotoName;
                        vm.modal.hide();
                        //code
                        break;

                    case PHOTO_FRONT:
                        console.log('PHOTO_FRONT');
                        vm.frontSended = true;
                        vm.showFrontPhoto = true;
                        frontPhotoName = result.filename;
                        vm.frontPhotoURL = 'https://s3-sa-east-1.amazonaws.com/fone-clube-bucket/' + frontPhotoName;
                        vm.modal.hide();
                        //code
                        break;

                    case PHOTO_VERSE:
                        console.log('PHOTO_VERSE');
                        versePhotoName = result.filename;
                        vm.verseSended = true;
                        vm.showVersePhoto = true;
                        vm.versePhotoURL = 'https://s3-sa-east-1.amazonaws.com/fone-clube-bucket/' + versePhotoName;
                        vm.modal.hide();
                        //code
                        break;
                }
        }

        function isInvalidName(str){
            return /\s/.test(str);
        }


        function uploadFile(file){
            console.log('-- uploadFile galeria')
            var q = $q.defer();
            console.log(file);

            if(isInvalidName(file.name)){
                vm.file = null;
                vm.msg = "Não foi possivel enviar sua imagem, por favor envie uma imagem sem espaço no nome do arquivo"
                q.reject();
                return q.promise;
            }
            MainComponents.showLoader('Enviando...');
            var imageUploader = new ImageUploader();
            imageUploader.push(file)
            .then((data) => {
                console.debug('Upload complete. Data:', data);
                // MainComponents.alert({mensagem:'Imagem enviada com sucesso'});
                MainComponents.hideLoader();
                 q.resolve(data);
            })
            .catch((err) => {
                console.error(err);
                MainComponents.alert({mensagem:'Não foi possível enviar imagens'});
                MainComponents.hideLoader();
                q.reject(error);
            });
            return q.promise;
        }

        function onTapSendImage(){
            vm.msg = "";
            console.log('onTapSendImage ');
            if(vm.hasPhotoCaptured)
                startListUpload(vm.fotos);
            if(vm.hasFileSelected)
                uploadIdentidadeGaleria();
        }

        /////////////////////////////////////
        ///foto de camera
        //extrair
        function startCameraPhoto() {
            console.log('fotoIdentidadeCamera')
            // 2
            var options = {
                destinationType : Camera.DestinationType.FILE_URI,
                sourceType : Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
                allowEdit : false,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
            };

            // 3
            $cordovaCamera.getPicture(options).then(function(imageData) {
                console.log('cordovaCamera.getPicture')
                console.log(imageData)
                // 4
                onImageSuccess(imageData);

                function onImageSuccess(fileURI) {
                    createFileEntry(fileURI);
                }
                function createFileEntry(fileURI) {
                    window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
                }
                // 5
                function copyFile(fileEntry) {
                    var newName = MainUtils.guid() + '.jpg'; //todo fazer tratamento pra nome jpg /png
                    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
                        fileEntry.copyTo(
                            fileSystem2,
                            newName,
                            onCopySuccess,
                            fail
                        );
                    },
                    fail);
                }

                // 6
                function onCopySuccess(entry) {
                    console.log('onCopySuccess ' );
                    console.log(entry);
                    console.log(entry.nativeURL);
                    var listName = entry.nativeURL.split('/');
                    vm.fotos.push(entry.nativeURL);
                    listaImagens.push(listName[listName.length - 1]);
                    $scope.$apply(function () {
                        vm.images.push(entry.nativeURL);
                    });
                    vm.hasPhotoCaptured = true;
                    //startListUpload(vm.fotos);
                }

                function fail(error) {
                    console.log("fail: " + error.code);
                }

                function makeid() {
                    var text = "";
                    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                    for (var i=0; i < 5; i++) {
                        text += possible.charAt(Math.floor(Math.random() * possible.length));
                    }
                    return text;
                }

            }, function(err) {
                console.log(err);
            });
        }

        function startListUpload(photos){
            MainComponents.showLoader('Enviando...');
            if(photos.length > 0) {
                var lastItemIndex = photos[photos.length - 1];
                uploadImagePath(lastItemIndex).then(function(result){
                    if(result)
                        continueListUpload(vm.fotos);
                });
            } else {
                MainComponents.hideLoader();
                //MainComponents.alert({mensagem:'Imagem enviada com sucesso'});
                console.log(listaImagens)
                //conclusão de foto auqi
                setImageReleaseView(cameraPhotoName)
            }
        }

        function continueListUpload(photos){
            photos.pop();
            startListUpload(vm.fotos);
        }

        function uploadImagePath(path){
            var q = $q.defer();
            var guidName = MainUtils.guid();
            MainUtils.pathToDataURI(path, function(dataUri) {
                var blob = MainUtils.dataURIToBlob(dataUri);
                blob.name = guidName.concat('.jpg');
                MainUtils.uploadFile(blob).then(function(result){
                    console.log(' MainUtils.uploadFile(blob)')
                    console.log(result)
                    personCheckout.Images.push(blob.name);
                    setImageReleaseView(result);
                    q.resolve(true);
                }).catch(function(result){
                    q.resolve(false);
                });
            });
            return q.promise;
        }


        /////////////////////////////////////
        /////////////////////////////////////

        vm.onTapSendFoneclubeData = onTapSendFoneclubeData;
        function onTapSendFoneclubeData(){
            vm.requesting = true;
            MainComponents.showLoader('Enviando dados...');
            var cpf = UtilsService.clearDocumentNumber(vm.cpf);
            var phones = [];
            var totalPriceValidade = 0;
            
            for (var number in vm.phoneNumbersView) {
                if(!vm.phoneNumbersView[number].Nickname || vm.phoneNumbersView[number].Nickname == '') {
                    MainComponents.alert({titulo:'Linha ' + (number + 1), mensagem:'Nickname é um campo obrigario'});
                    vm.requesting = false;
                    MainComponents.hideLoader();
                    return;
                }
                if(vm.phoneNumbersView[number].IdPlanOption == '') {
                    MainComponents.alert({titulo:'Linha ' + (number + 1), mensagem:'A escolha do plano é obrigatória.'});
                    vm.requesting = false;
                    MainComponents.hideLoader();
                    return;
                } else {
                    vm.plans.find(function (element, index, array) {
                        if (element.Id == vm.phoneNumbersView[number].IdPlanOption) {
                            totalPriceValidade = totalPriceValidade + element.Value / 100;
                        }
                    });
                }
            }
            if (vm.singlePrice) {
                var price = parseFloat(vm.singlePrice) / 100;
                if (price > totalPriceValidade) {
                    MainComponents.alert({mensagem:'Preço único não pode ser maior do que o preço de todos os planos somados.'});
                    vm.requesting = false;
                    MainComponents.hideLoader();
                    return
                }
                
            }

            vm.phoneNumbersView.forEach(function (element, index, array) {
                phones.push({
                    'DDD': getNumberJson(element.NovoFormatoNumero).DDD,
                    'Number': getNumberJson(element.NovoFormatoNumero).Number,
                    'Portability': element.Portability,
                    'IsFoneclube': true,
                    'Nickname': element.Nickname,
                    'IdPlanOption': element.IdPlanOption
                });
            });

            var personCheckout = {
                'DocumentNumber': cpf,  
                'NameContactParent': vm.whoinvite,
                'IdParent': vm.IdParent, //se passar um que não existe api não guarda indicação, atualmente não retornamos erro, validar com cliente, cardozo
                'IdContactParent': vm.IdParent, //se passar um que não existe api não guarda indicação, atualmente não retornamos erro, validar com cliente, cardozo
                'Phones': phones,
                'SinglePrice': vm.singlePrice,
                'DescriptionSinglePrice': vm.descriptionSinglePrice
            };
            
            //Remove os atributos falsy
            /*for (var key in personCheckout) {
                if (!personCheckout[key]) {
                    delete personCheckout[key];
                }
                if (personCheckout[key] && personCheckout[key].constructor === Array) {
                    for (var i in personCheckout[key]) {
                        for (var x in personCheckout[key][i]) {
                            if (!personCheckout[key][i][x]) {
                                delete personCheckout[key][i][x];
                            }
                        }
                    }    
                }
            }*/
            
            var arrayFiltered = personCheckout.Phones.filter(function (number){
                return number.IsFoneclube == true && number.DDD.length == 2 && number.Number.length >= 8;
            });
            if (personCheckout.IdParent == 0) {
                delete personCheckout.IdParent;
            }
            if (arrayFiltered.length == 0) {
                FoneclubeService.postUpdatePerson(personCheckout)
                        .then(postUpdatePersonSucess)
                        .catch(postUpdatePersonError);
            } else {
                validadeNumbers(arrayFiltered).then(function(result) {
                    var right = true;
                    for (var item in result) {
                        if (result[item].DocumentNumber && result[item].DocumentNumber != UtilsService.clearDocumentNumber(vm.cpf)) {
                            showAlert('Aviso', 'Você não pode cadastrar o mesmo telefone para dois clientes.');
                            right = false;
                            vm.requesting = false;
                            MainComponents.hideLoader();
                        }
                    }
                    for(var x in arrayFiltered) {
                        //nao deixa add o mesmo numero duas vezes para o mesmo cliente;
                        var twiceNumber = arrayFiltered.filter(function (element, index, array) {
                            return element.DDD == arrayFiltered[x].DDD && element.Number == arrayFiltered[x].Number;
                        });
                        if (twiceNumber.length > 1) {
                            showAlert('Aviso', 'Você não pode cadastrar o mesmo telefone duas vezes para o cliente.');
                            right = false;
                            vm.requesting = false;
                            MainComponents.hideLoader();
                            break;
                        }
                    }
                    if (right) {
                        FoneclubeService.postUpdatePerson(personCheckout)
                            .then(postUpdatePersonSucess)
                            .catch(postUpdatePersonError);
                    }
                });
            }
            
            function postUpdatePersonSucess(result) {
                MainComponents.hideLoader();
                if(result) {
                    FlowManagerService.changeHomeView();
                    var params = {
                        title: 'Cadastro Realizado',
                        template: 'Todos dados pessoais enviados, cadastro Foneclube feito com sucesso.',
                        buttons: [
                          {
                            text: 'Ir para Home',
                            type: 'button-positive',
                            onTap: function(e) {

                            }
                          },
                          {
                            text: 'Realizar Cobrança',
                            type: 'button-positive',
                            onTap: function(e) {
                                console.log('Realizar cobrança.');
                                FoneclubeService.getCustomerByCPF(UtilsService.clearDocumentNumber(vm.cpf)).then(function(result){
                                    if(vm.singlePrice) {
                                        result.CacheIn = vm.singlePrice;
                                        ViewModelUtilsService.showModalCustomer(result);
                                    } else {
                                        FoneclubeService.getCustomerPlans(UtilsService.clearDocumentNumber(vm.cpf)).then(function(customerPlans){
                                            var valueTotal = 0;
                                            if(customerPlans.length > 0) {
                                                for(var i=0; i<customerPlans.length;i++){
                                                    valueTotal = valueTotal + customerPlans[i].Value;
                                                }
                                            }
                                            result.CacheIn = valueTotal;
                                            ViewModelUtilsService.showModalCustomer(result);
                                        });
                                    }
                                });
                            }
                          }
                        ]
                    }
                    MainComponents.show(params);
                }
            }
            
            function postUpdatePersonError(error) {
                vm.requesting = false;
                MainComponents.hideLoader();
                MainComponents.alert({mensagem:error.statusText});
            }
        }
        
        function validadeNumbers(numbers){
            var promises = numbers.map(function(number) {
                return FoneclubeService.getCustomerByPhoneNumber({
                    ddd: clearPhoneNumber(number.DDD),
                    numero: clearPhoneNumber(number.Number)
                });
            });
            return $q.all(promises);
        }
        
        function setPlansList(operadora) {
            vm.selectedPlansList = [];
            for (var item in vm.plans) {
                if (operadora == 1 && vm.plans[item].Description.endsWith('VIVO')) {
                    vm.selectedPlansList.push(vm.plans[item]);
                } else if (operadora == 2 && vm.plans[item].Description.endsWith('CLARO')){
                    vm.selectedPlansList.push(vm.plans[item]);
                }
            }
        }
            
        //adiciona telefone do array que é exibido na view
        function onTapNewPhoneNumber() {
            vm.phoneNumbersView.push(
                {
                    'Id': null,
                    'DDD': '',
                    'Number': '',
                    'IsFoneclube': true,
                    'IdOperator': 0,
                    'Portability': false,
                    'NickName': '',
                    'IdPlanOption': 0,
                    'Inative': false,
                    'Delete': false,
                    'NovoFormatoNumero': '',
                    'operadora': '1',
                    'key': Math.random()
                }
            );
        }
        //remove telefone do array que é exibido na view
        function onTapRemoveNewNumber(position){
            var confirmPopup = $ionicPopup.confirm( {
                title: 'Excluir Número',
                template: 'Deseja realmente remover este número?',
                buttons: [
                    {   text: 'Não' },
                    {   text: '<b>Sim</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            return true;
                        }
                    }
                ]
            });
            confirmPopup.then(function(res) {
                if(res) {
                    vm.phoneNumbersView.splice(position, 1);
                }
            });
        }

        //remove () - < > do numero de telefone
        function clearPhoneNumber(number) {
            return number ? number.replace('-', '').replace(' ', '').replace('(', '').replace(')', '') : '';
        }
        
        function changePhoneNumber(position) {
            if (vm.phoneNumbersView[position].NovoFormatoNumero.length < 14) {
                return
            }
            var param = {
                ddd: getNumberJson(vm.phoneNumbersView[position].NovoFormatoNumero).DDD,
                numero: getNumberJson(vm.phoneNumbersView[position].NovoFormatoNumero).Number
            }
                //nao deixa add o mesmo numero duas vezes para o mesmo cliente;
                var twiceNumber = vm.phoneNumbersView.filter(function (element, index, array) {
                    return element.NovoFormatoNumero == vm.phoneNumbersView[position].NovoFormatoNumero;
                });
                if (twiceNumber.length > 1) {
                    showAlert('Aviso', 'Você não pode cadastrar o mesmo telefone duas vezes para o mesmo cliente.');
                    return;
                }
            FoneclubeService.getCustomerByPhoneNumber(param).then(function(res) {
                if (res.DocumentNumber && res.DocumentNumber != UtilsService.clearDocumentNumber(vm.cpf)) {
                    showAlert('Aviso', 'Este telefone já pertence a um cliente.');
                }
            });
        }
        
        function getContactParentName() {
            if (vm.phoneContactParent.length < 13) { 
                vm.IdParent = "";
                return 
            }
            var param = {
                ddd: clearPhoneNumber(vm.phoneContactParent).substring(0, 2),
                numero: clearPhoneNumber(vm.phoneContactParent).substring(2)
            }
            FoneclubeService.getCustomerByPhoneNumber(param).then(function(result) {
                vm.IdParent = result.Id;
                vm.whoinvite = result.Name;
            })
        }

        function onTapCancel(){
            vm.modal.hide();
        }
        
        function enter() {
            if (vm.etapaEndereco) {
                etapaDadosPessoais();
            } else if (vm.etapaDadosPessoais) {
                etapaComplementar();
            } else if (vm.etapaComplementar) {
                var params = {
                    title: 'Pular Fase',
                    template: 'Deseja realmente pular esta fase?',
                    buttons: [
                      {
                        text: 'Não',
                        type: 'button-positive',
                        onTap: function(e) {

                        }
                      },
                      {
                        text: 'Sim',
                        type: 'button-positive',
                        onTap: function(e) {
                            FlowManagerService.changeHomeView();
                            var params = {
                                title: 'Cadastro Realizado',
                                template: 'Todos dados pessoais enviados, cadastro Foneclube feito com sucesso.',
                                buttons: [
                                  {
                                    text: 'Ir para Home',
                                    type: 'button-positive',
                                    onTap: function(e) {

                                    }
                                  },
                                  {
                                    text: 'Visualizar Cadastro',
                                    type: 'button-positive',
                                    onTap: function(e) {
                                        FoneclubeService.getCustomerByCPF(UtilsService.clearDocumentNumber(vm.cpf)).then(function(result){
                                            ViewModelUtilsService.showModalCustomer(result);
                                        });
                                    }
                                  }
                                ]
                            }
                            MainComponents.show(params);
                        }
                      }
                    ]
                }
                MainComponents.show(params);
            }
        }
        
        function showAddNewPhone() {
            function filterPhones(number){
                return number.IsFoneclube == true;
            }
            return personCheckout.Phones.filter(filterPhones);
        }
            
        function resizeScroll() {
            $ionicScrollDelegate.resize();
        }
        //ToDo => colocar em uma service, ou utils
        function showAlert(title, message){
            return $ionicPopup.alert({
                title: title,
                template: message
            });
        }
        /////////////////////////////////////
        /////////////////////////////////////
    }
})();