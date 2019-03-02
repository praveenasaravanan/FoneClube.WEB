(function() {

    'use strict';

    angular.module('foneClub').service('UtilsService', UtilsService);

    UtilsService.inject = ['$q'];

    function UtilsService($q) {
        return {
            clearDocumentNumber: _clearDocumentNumber,
            clearDocumentNumber: _clearDocumentNumber,
            getContactPhoneFromPhones: _getContactPhoneFromPhones,
            getRouteData: getRouteData,
            getPreviousRouteData: getPreviousRouteData,
            setRouteData:setRouteData,
            getDocumentNumerWithMask: _getDocumentNumerWithMask,
            getPhoneNumberFromStringToJson: _getPhoneNumberFromStringToJson,
            clearPhoneNumber: _clearPhoneNumber,
            sendImageToUpload: _sendImageToUpload
        }

        
        function getRouteData(){
            return this.data
        }

        function getPreviousRouteData(){
            return this.previousRoute
        }

        function setRouteData(param){
            this.previousRoute = this.data;
            this.data = param
        }
        
        function _clearDocumentNumber(documentNumber){
            return documentNumber.replace(/[-.]/g, '').replace('/','');
        }
        
        function _getContactPhoneFromPhones(phones) {
            var contacts = phones.filter(function (element) {
                return !element.IsFoneclube;
            });
            return contacts;
        }
        
        function _getDocumentNumerWithMask(documentNumber) {
            return documentNumber.substr(0, 3) + '.' + documentNumber.substr(3, 3) + '.' + documentNumber.substr(6, 3) + '-' + documentNumber.substr(9)
        }

        function _getPhoneNumberFromStringToJson(param) {
            var number = {
                DDD: _clearPhoneNumber(param).substring(0, 2),
                Number: _clearPhoneNumber(param).substring(2)
            }
            return number;
        }

        function _clearPhoneNumber(number) {
            return number ? number.replace('-', '').replace(' ', '').replace('(', '').replace(')', '') : '';
        }

        function _sendImageToUpload(imageSelf, imageFrente, imageVerso) {
            var q = $q.defer();
            var toUpload = [];
            if (imageSelf) toUpload.push({img: imageSelf, tipo: 1});
            if (imageFrente) toUpload.push({img: imageFrente, tipo: 2});
            if (imageVerso) toUpload.push({img: imageVerso, tipo: 3});
            if (toUpload.length == 0) {
                q.resolve();
            }
            var promises = toUpload.map(function(image) {
                return uploadImage(image);
            });
            $q.all(promises).then(function (result){
                console.log(result);
                q.resolve(result);
            }, function (result){
                console.log(result);
                q.reject(result);
            });
            return q.promise;
        }

        function uploadImage(imagem) {
            var q = $q.defer();
            var holdId = imagem.tipo;
            function isInvalidName(str){
                return /\s/.test(str);
            }
            if(isInvalidName(imagem.img.name)){
                q.reject("Não foi possivel enviar sua imagem, por favor envie uma imagem sem espaço no nome do arquivo");
                return q.promise;
            }
            var imageUploader = new ImageUploader();
            imageUploader.push(imagem.img)
            .then((data) => {
                data.tipo = holdId;
                q.resolve(data);
            })
            .catch((err) => {
                q.reject('Não foi possível enviar imagens');
            });
            return q.promise;
        }

    }
})();