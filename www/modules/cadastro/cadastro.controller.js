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
        'FlowManagerService'
        ];

    function CadastroController($scope,PagarmeService, $ionicPopup, HubDevService, FoneclubeService, $ionicLoading, FileListUtil, MainUtils, $q, $cordovaCamera, $cordovaFile, $timeout, MainComponents, $ionicModal, $interval, FlowManagerService) {
        var vm = this;
        vm.viewName = 'Cadastro Foneclube';

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
        vm.personalDDD = '';
        vm.personalNumber = '';
        vm.phoneNumbersView =[
            {
                'DDD': '',
                'Number': '',
                'plan': '',
                'IsFoneclube': true,
                'Portability': false,
                'Nickname': ''
            }
        ]

        vm.onTapSearchDocument = onTapSearchDocument;
        vm.onTapSendDocument = onTapSendDocument;

        vm.onTapSearchAddress = onTapSearchAddress;
        vm.onTapSendAddress = onTapSendAddress;

        vm.onTapSendPersonalData = onTapSendPersonalData;

        vm.onTapPhotoSelfie = onTapPhotoSelfie;
        vm.onTapPhotoFront = onTapPhotoFront;
        vm.onTapPhotoVerse = onTapPhotoVerse;

        vm.onTapNewPhoneNumber = onTapNewPhoneNumber;
        vm.onTapRemoveNewNumber = onTapRemoveNewNumber;

        vm.onTapCancel = onTapCancel;

        init();

        function init(){
            vm.buscar = true;
            vm.enviar = false;
            etapaDocumento();

            vm.allOperatorOptions = MainUtils.operatorOptions();
            console.log(vm.allOperatorOptions)

            FoneclubeService.getPlans().then(function(result){
                console.log(result)
                vm.plans = result;
                //post realizado com sucesso
            })
            .catch(function(error){
                console.log(error.statusText); // mensagem de erro para tela, caso precise
            });


           FoneclubeService.getOperators().then(function(result){
                vm.operators = result;
                //post realizado com sucesso
            })
            .catch(function(error){
                console.log(error.statusText); // mensagem de erro para tela, caso precise
            });

            $ionicModal.fromTemplateUrl('templates/modal.html', {
                scope: $scope
            }).then(function(modal) {
                vm.modal = modal;
            });
        }

        function onTapSearchDocument(){
            console.log('onTapSearchDocument ' + vm.birthdate.length)
            var dia = vm.birthdate.split('/')[0];
            var mes = vm.birthdate.split('/')[1];
            console.log(dia)
            console.log(mes)
            var patternValidaData =/^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/;
            var dadosInvalidos = parseInt(dia) > 31 || parseInt(mes) > 12 || parseInt(mes) == 0 || parseInt(dia) == 0;

            if(!patternValidaData.test(vm.birthdate) || dadosInvalidos){
                MainComponents.alert({mensagem:'Data de nascimento Inválida'});
                return;
            }

            MainComponents.showLoader('Tentando preencher dados...');
            var cpf = vm.cpf.replace(/[-.,]/g , '');
            console.log(cpf)
            console.log(vm.birthdate)

            HubDevService.validaCPF(cpf,vm.birthdate)
                .then(function(result){
                   if(result.status){
                       console.log(result);
                       vm.name = result.result.nome_da_pf;
                   }
                   MainComponents.hideLoader();
                   etapaDocumentoFaseNome();
                },
            function(error){
                etapaDocumentoFaseNome();
                MainComponents.hideLoader()
            });
        }

        function onTapSendDocument(){
            var cpf = vm.cpf.replace(/[-.,]/g , '');
            console.log(cpf);
            console.log(vm.birthdate);
            console.log(vm.name);

            var personCheckout = {
                    'DocumentNumber': cpf,
                    'Name': vm.name,
                    'Born': vm.birthdate
                };


            FoneclubeService.postBasePerson(personCheckout).then(function(result){
                console.log(result);
                if(result)
                {
                    etapaEndereco();
                    MainComponents.alert({titulo:'Andamento',mensagem:'Documento enviado, agora preencha os dados de Endereço.'});
                }

                //post realizado com sucesso
            })
            .catch(function(error){
                console.log('catch error');
                console.log(error);
                console.log(error.statusText); // mensagem de erro para tela, caso precise
                MainComponents.alert({mensagem:error.statusText});
            });

        }

        function onTapSearchAddress(){
            console.log('onTapSearchAddress')
            var cep = vm.zipcode.replace(/[-.]/g , '');

            MainComponents.showLoader('Tentando preencher dados...');

            HubDevService.validaCEP(cep)
            .then(function(result){
                try{
                    vm.street = result.info.logradouro;
                    vm.neighborhood = result.info.bairro;
                    vm.city = result.info.cidade;
                    vm.uf = result.info.uf;
                }
                catch(erro){

                }

                MainComponents.hideLoader();
                etapaEnderecoFaseOutrosCampos();
                console.log(result);

            },
            function(error){
                MainComponents.hideLoader();
                etapaEnderecoFaseOutrosCampos();
            });
        }

        function onTapSendAddress(){

            var cpf = vm.cpf.replace(/[-.,]/g , '');

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

            FoneclubeService.postUpdatePersonAdress(personCheckout).then(function(result){
                console.log(result);
                if(result)
                {
                    etapaDadosPessoais();
                    MainComponents.alert({titulo:'Andamento',mensagem:'Endereço enviado, agora preencha os dados pessoais.'});
                }

                //post realizado com sucesso
            })
            .catch(function(error){
                console.log('catch error');
                console.log(error);
                console.log(error.statusText); // mensagem de erro para tela, caso precise
                MainComponents.alert({mensagem:error.statusText});
            });

            console.log(personCheckout)
        }

        function onTapSendPersonalData(){
            console.log('onTapSendPersonalData');
            debugger;
            var cpf = vm.cpf.replace(/[-.,]/g , '');
            var personalPhone = vm.personalNumber.replace('-', '').replace(' ', '');

            var personCheckout = {
                    'DocumentNumber': cpf,
                    'Email': vm.email,
                    'Images': [selfiePhotoName, frontPhotoName, versePhotoName]
                };

            if(vm.personalDDD && personalPhone)
            {
                personCheckout['Phones'] = [
                    {
                        'DDD': vm.personalDDD,
                        'Number': personalPhone
                    }
                ];
            }

                /**var selfiePhotoName = '';
                var frontPhotoName = '';
                var versePhotoName = ''; */
                console.log(personCheckout)

            FoneclubeService.postUpdatePerson(personCheckout).then(function(result){
                console.log(result);
                if(result)
                {
                    etapaComplementar();
                    MainComponents.alert({titulo:'Andamento',mensagem:'Dados pessoais enviados, agora preencha os dados Foneclube.'});
                }

                //post realizado com sucesso
            })
            .catch(function(error){
                console.log('catch error');
                console.log(error);
                MainComponents.alert({mensagem:error.statusText});
            });

        }


        function etapaEnderecoFaseOutrosCampos(){
            vm.etapaOutrosCampos = true;
            vm.etapaBuscarCEP = false;
        }

        function etapaDocumentoFaseNome(){
            vm.buscar = false;
            vm.enviar = true;
            vm.showName = true;
        }

        function etapaDocumento(){
            limpaEtapas();
            vm.etapaDocumento = true;
        }

        function etapaEndereco(){
            limpaEtapas();
            vm.etapaBuscarCEP = true;
            vm.etapaEndereco = true;
        }

        function etapaDadosPessoais(){
            limpaEtapas();
            vm.etapaDadosPessoais = true;
        }

        function etapaComplementar(){
            limpaEtapas();
            vm.etapaComplementar = true;
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
            catch(error){

            }

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

            if(photos.length > 0)
            {
                var lastItemIndex = photos[photos.length - 1];
                uploadImagePath(lastItemIndex).then(function(result){
                    if(result)
                        continueListUpload(vm.fotos);

                });
            }
            else
            {
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
            console.log('onTapSendFoneclubeData');
            //var cpf = '32250616035'; //remover ============
            var cpf = vm.cpf.replace(/[-.,]/g , '');
            var contactParent = clearPhoneNumber(vm.contactParent);
            var plans = [];
            var phones = [];
            debugger;

            vm.phoneNumbersView.forEach(function (element, index, array) {

                //tlvz isso vai morrer parte de planos solta ( estou avaliando, cardozo)
                plans.push( {
                    'IdPlanOption': element.plan,
                    'IdContact': clearPhoneNumber(element.DDD).toString().concat(clearPhoneNumber(element.Number).toString())
                });

                if(clearPhoneNumber(element.DDD).toString() != '' || clearPhoneNumber(element.DDD).toString() == undefined
                || clearPhoneNumber(element.Number).toString() != '' || clearPhoneNumber(element.Number).toString() != undefined)
                {
                    phones.push({
                        'DDD': clearPhoneNumber(element.DDD),
                        'Number': clearPhoneNumber(element.Number),
                        'Portability': element.Portability, ///descomentar quando ajustar API
                        'IsFoneclube': true,
                        'NickName': element.NickName,  //descomentar quando ajustar API
                        'IdPlanOption': element.plan
                    });
                }

            });

            var personCheckout = {
                    'DocumentNumber': cpf,
                    'NickName': 'Mock para nao quebrar tela', //remover quando ajustar API
                    'Email': vm.email,
                    'NameContactParent': vm.whoinvite,
                    'IdContactParent': contactParent,
                    // 'IdPlanOption': 1, //remover quando ajustar API <- está mockado
                    /*'Plans': plans,*/ //descomentar quando ajustar API
                    'IdCurrentOperator': vm.operator,
                    'Phones': phones
            };

            FoneclubeService.postUpdatePerson(personCheckout).then(function(result){
                console.log(result);
                if(result)
                {
                    //conclusão do form, volta pra main
                    MainComponents.alert({titulo:'Cadastro Realizado',mensagem:'Todos dados pessoais enviados, cadastro Foneclube feito com sucesso. Você foi redirecionado para a home.'});
                    FlowManagerService.changeHomeView();
                }

                //post realizado com sucesso
            })
            .catch(function(error){
                console.log('catch error');
                console.log(error);
                MainComponents.alert({mensagem:error.statusText});
            });
            console.log(personCheckout);

        }

        //adiciona telefone do array que é exibido na view
        function onTapNewPhoneNumber() {
            vm.phoneNumbersView.push(
                {
                    'Portabilidade': false,
                    'OperadoraAntiga': '',
                    'Nickname': '',
                    'DDD': '',
                    'Number': '',
                    'plan': '',
                    'IsFoneclube': true
                }
            );
        }
        //remove telefone do array que é exibido na view
        function onTapRemoveNewNumber(position){
            vm.phoneNumbersView.splice(position, 1);
        }

        //monta checkout da etapa etapaComplementar
        function buildCheckoutLastFase(array) {
            return { };
        }

        //remove () - < > do numero de telefone
        function clearPhoneNumber(number) {
            return number ? number.replace('-', '').replace(' ', '').replace('(', '').replace(')', '') : ' ';
        }

        function onTapCancel(){
            vm.modal.hide();
        }
        /////////////////////////////////////
        /////////////////////////////////////
    }
})();