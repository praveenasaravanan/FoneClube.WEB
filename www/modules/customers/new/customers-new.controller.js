angular.module('foneClub').controller('CustomersControllerNew', CustomersControllerNew);

function CustomersControllerNew($interval, FoneclubeService, PagarmeService, FlowManagerService, $filter, ViewModelUtilsService) {

    var vm = this;
    var CARTAO = 1;
    var BOLETO = 2;

    vm.month = new Date().getMonth() + 1;
    vm.year = new Date().getFullYear();
    vm.diffDays = diffDays;
    vm.statusType = {
        COBRADO: 1,
        NAO_COBRADO: 2,
        PAGO: 3,
        REFUNDED: 4,
        VENCIDO: 5
    };
    vm.PagamentosType = {
        BOLETO: 1,
        CARTAO: 2
    };
    vm.AtivoType = {
        ATIVA: 2,
        CANCELADA: 1
    }
    vm.tiposStatus = [
        { id: "", title: "" },
        { id: 1, title: 'COBRADO' },
        { id: 2, title: 'NÃO COBRADO' },
        { id: 3, title: 'PAGO' },
        { id: 4, title: 'REFUNDED' },
        { id: 5, title: 'VENCIDO' }
    ];
    vm.tiposPagamento = [
        { id: "", title: "" },
        { id: 1, title: 'BOLETO' },
        { id: 2, title: 'CARTÃO' }
    ];
    vm.tipoAtiva = [
        { id: "", title: "" },
        { id: 1, title: 'CANCELADA' },
        { id: 2, title: 'ATIVA' }
    ]
    vm.tipoAcao = [
        { id: "", title: "" },
        { id: 1, title: 'A' },
        { id: 2, title: 'C' }
    ]
    vm.includeActive = false;
    vm.includeInActive = false;
    vm.excludeProblema = false;
    vm.loading = false;
    vm.excludeFather = false;
    vm.excludeAddress = false;
    vm.excludeWhatsappUsers = false;
    vm.includeWhatsappUsers = false;
    vm.includeStatusGreen = false;
    vm.includeStatusYellow = false;
    vm.includeStatusRed = false;
    vm.filterTextInAllCols = false;
    vm.searchText = "";
    vm.customerDataSource;
    vm.customerViewModel;
    vm.customerGridOptions;

    vm.filterClients = filterClients;
    vm.onTapCustomer = onTapCustomer;
    vm.onTapCustomerEdit = onTapCustomerEdit;
    vm.onTapMessage = onTapMessage;
    vm.onTapFlag = onTapFlag;
    vm.onTapComment = onTapComment;
    vm.onTapBoletoPayment = onTapBoletoPayment;
    vm.onDeleteCustomer = onDeleteCustomer;
    vm.onPageLoad = onPageLoad;
    vm.exportToExcel = exportToExcel;
    vm.testLoading = testLoading;

    //BEGIN: New Functions
    function testLoading() { }
    function filterClients() {
        vm.loading = true;
        filterClientsData();
    }
    function filterClientsData() {
        vm.loading = true;
        var filteredData = $filter('filter')(vm.customers, function (data) {
            if (data.fullData) {
                return ((excludeAllFilters()) ||
                    (filterByText(data)) &&
                    ((!vm.includeActive && !vm.includeInActive) ||
                        (vm.includeActive ? data.fullData.Desativo == false : false) ||
                        (vm.includeInActive ? data.fullData.Desativo == true : false)) &&

                    (vm.excludeFather ? !data.fullData.NameParent : true) &&
                    (vm.excludeAddress ? !data.fullData.Adresses.length : true) &&

                    ((!vm.excludeWhatsappUsers && !vm.includeWhatsappUsers) ||
                        (vm.excludeWhatsappUsers ? (!data.fullData.WClient || !data.fullData.WClient.IsRegisteredWithChat2Desk) : false) ||
                        (vm.includeWhatsappUsers ? (data.fullData.WClient && data.fullData.WClient.IsRegisteredWithChat2Desk) : false)) &&

                    ((!vm.includeStatusGreen && !vm.includeStatusYellow && !vm.includeStatusRed) ||
                        (vm.includeStatusGreen ? filterStatusColor(data, "green") : false) ||
                        (vm.includeStatusYellow ? filterStatusColor(data, "yellow") : false) ||
                        (vm.includeStatusRed ? filterStatusColor(data, "red") : false))
                );
            }
            else {
                return false;
            }
        });
        refreshGrid(filteredData);
        vm.loading = false;
    }

    function filterByText(data) {
        if (vm.searchText) {
            vm.searchText = vm.searchText.toLowerCase();

            if (vm.filterTextInAllCols) {
                return data.Id.toString().toLowerCase().indexOf(vm.searchText) > -1 ||
                    data.Name.toLowerCase().indexOf(vm.searchText) > -1 ||
                    data.Email.toLowerCase().indexOf(vm.searchText) > -1 ||
                    matchPhone(data.Phones, vm.searchText);
            } else {
                return data.Name.toLowerCase().indexOf(vm.searchText) > -1;
            }
        } else {
            return true;
        }
    }

    function filterStatusColor(data, color) {
        return (data.ChargeAndServiceOrderHistory &&
            data.ChargeAndServiceOrderHistory.Charges &&
            data.ChargeAndServiceOrderHistory.Charges.PaymentStatusColor == color)
    }

    function excludeAllFilters() {
        return !vm.includeActive
            && !vm.includeInActive
            && !vm.excludeFather
            && !vm.excludeAddress
            && !vm.excludeWhatsappUsers
            && !vm.includeWhatsappUsers
            && !vm.includeStatusGreen
            && !vm.includeStatusYellow
            && !vm.includeStatusRed
            && !vm.searchText;
    }

    function matchPhone(phones, numberToCompare) {
        numberToCompare = numberToCompare.replace(/[!#$%&'()*+,-./:;?@[\\\]_`{|}~' 'éá]/g, '');
        if (phones && phones.length > 0) {
            if (phones[0] == null) {
                return false;
            } else {
                var phone = $filter('filter')(phones, function (data) {
                    return (data.Number ? ("55" + data.DDD + data.Number.toString()).indexOf(numberToCompare) > -1 : false);
                });

                return phone.length > 0;
            }
        }

        return false;
    }

    function onTapCustomerEdit(id) {
        var customer = findCustomerById(id);
        FlowManagerService.changeEdicaoView(customer.fullData);
    }
    function onTapMessage(id) {
        var customer = findCustomerById(id);
        ViewModelUtilsService.showModalWhatsapp(customer);
    }
    function onTapFlag(id) {
        var customer = findCustomerById(id);
        ViewModelUtilsService.showModalFlag(customer);
    }
    function onTapComment(id) {
        var customer = findCustomerById(id);
        ViewModelUtilsService.showModalComment(customer);
    }
    function onTapBoletoPayment(id) {
        var customer = findCustomerById(id);
        ViewModelUtilsService.showModalBoletoPayment(customer);
    }
    function onTapCustomer(id, index) {
        var customer = findCustomerById(id);
        ViewModelUtilsService.showModalCustomer(customer, index);
    }
    function onDeleteCustomer(id) {
        var r = confirm('Deseja fazer um soft delete nesse cliente?');
        if (r == true) {
            var customer = findCustomerById(id);//// 
            FoneclubeService.postSoftDeleteCustomer(customer).then(function (result) {
                if (result) {
                    alert('Cliente deletado');
                    var index = vm.customers.indexOf(vm.customers.filter(v => v.Id == id)[0]);
                    if (index >= 0) {
                        vm.customers.splice(index, 1);
                        refreshGrid(vm.customers);
                    }
                }
            });
        } else {
        }
    }

    function refreshGrid(data) {
        var customerData = convertToViewModel(data);
        var totalRecords = customerData.length + 10;
        vm.customerDataSource = new kendo.data.DataSource({
            data: customerData,
            pageSize: totalRecords,
            schema: {
                model: {
                    fields: {
                        Dias: { type: "number" },
                        AcaoBool: { type: "boolean" },
                    }
                }
            },
        });
    }
    //END: New Functions

    function convertToViewModel(sourceData) {
        var customerDataList = [];

        for (var i = 0; i < sourceData.length; i++) {
            var customer = sourceData[i];
            var RCobrado = customer.ammoutIntFormat;
            var customerSelectedCharge = '';
            var Tipo = '';
            var TipoLink = '';
            var Acao = '';
            var AcaoBool = false;
            var Vencimento = '-'
            var Vigencia=customer.boletoExpires;
            var Ultimopag = customer.LastPaidDate;
            var Dias2 = diffDays(customer.LastPaidDate);
            var RPago = 0;
            var CustomerName = customer.Name;
            var Status2 = '';
            var customerChargeId = '';
            var UltimaCob = '';
            var Dias = 0;
            var Status = '';//customer.descricaoStatus;
            var PaymentStatusColor = '';
            var WhatsappImage = '../../content/img/message-red.png';

            if (isNaN(Dias2)) {
                Dias2 = 0;
            }
            ///////////////
            if (customer.fullData.WClient && customer.fullData.WClient.IsRegisteredWithChat2Desk) {
                if (customer.fullData.WClient.ProfilePicUrl) {
                    WhatsappImage = customer.fullData.WClient.ProfilePicUrl;
                }
                else {
                    WhatsappImage = '../../content/img/message-green.png';
                }
            }

            if (customer.ChargeAndServiceOrderHistory && customer.ChargeAndServiceOrderHistory.Charges) {
                var charge = customer.ChargeAndServiceOrderHistory.Charges;
                RPago = charge.Ammount;

                var dataCobranca = charge.CreationDate;
                var dataConvertida = new Date(dataCobranca).toISOString().split('T')[0].replace('-', '/').replace('-', '/');
                var mes = dataConvertida.substring(5, 7);
                var ano = dataConvertida.substring(0, 4);

                customer.chargingDate = charge.CreationDate;
                customer.chargingDateDiffDays = diffDays(dataConvertida);
                Status = charge.PaymentStatusDescription;
                Vencimento=charge.TransactionLastUpdate

                //BEGIN: Set status color                
                var charges = customer.ChargeAndServiceOrderHistory.Charges;
                charges.descriptionType = charges.PaymentType == CARTAO ? 'Cartão de crédito' : 'Boleto';
                if (charges.BoletoExpires) {
                    var expiryDate = new Date(charges.ExpireDate);
                    var expiryDateAfter3 = new Date(charges.ExpireDate);
                    expiryDateAfter3.setDate(expiryDateAfter3.getDate() + 3);

                    var currentDate = new Date();
                    if (charges.PaymentStatusDescription == "Paid") {
                        PaymentStatusColor = "green";
                    }
                    else if (charges.descriptionType == "Boleto" && charges.PaymentStatusDescription == "WaitingPayment" && currentDate <= expiryDate) {
                        PaymentStatusColor = "green";
                    }
                    else if (charges.descriptionType == "Boleto" && charges.PaymentStatusDescription == "WaitingPayment" && currentDate < expiryDateAfter3) {
                        PaymentStatusColor = "yellow";
                    }
                    else if (charges.descriptionType == "Boleto" && charges.PaymentStatusDescription == "WaitingPayment" && currentDate > expiryDateAfter3) {
                        PaymentStatusColor = "red";
                    }
                    else {
                        PaymentStatusColor = "grey";
                    }

                } else {
                    if (charges.PaymentStatusDescription == "Paid") {
                        PaymentStatusColor = "green";
                    }
                    else {
                        PaymentStatusColor = "grey";
                    }
                }

                charges.PaymentStatusColor = PaymentStatusColor;
                //END
            }

            var selecionado = new Date(vm.year.toString() + '/' + vm.month.toString()).toISOString().split('T')[0].replace('-', '/').replace('-', '/');
            var mesSelecionado = selecionado.substring(5, 7);
            var anoSelecionado = selecionado.substring(0, 4);

            if (mesSelecionado == mes && anoSelecionado == ano) {
                customer.dataIgual = true;
            }
            customer.LastPaidDateDiffDays = diffDays(customer.LastPaidDate);
            UltimaCob = customer.chargingDate ? customer.chargingDate : "";
            ///////////////

            // if (customer.descricaoStatus == '2') { Status = 'NÃO COBRADO'; }
            // if (customer.descricaoStatus == '3') { Status = 'PAGO' };
            // if (customer.descricaoStatus == '4') { Status = 'REFUNDED' };
            // if (customer.descricaoStatus == '5') { Status = 'VENCIDO' };

            if (customer.ChargingValidity != undefined) {

                var lastChargingRec = (customer.ChargingValidity.length - 1);
                var customerChargingInfo = customer.ChargingValidity[lastChargingRec];

                customerSelectedCharge = customerChargingInfo;
                customerChargeId = customerChargingInfo.Id;
                if (customerChargingInfo.CreateDate != null && customerChargingInfo.CreateDate != undefined) {
                    //UltimaCob = customerChargingInfo.CreateDate;
                }



                Status2 = customerChargingInfo.Canceled ? 'Cancelada' : 'Ativa'

                if (customerChargingInfo.PaymentType == 1) {
                    Tipo = 'CARTÃO';
                }
                else {
                    Tipo = 'BOLETO'
                    TipoLink = customerChargingInfo.BoletoLink;
                }
                if (customerChargingInfo.Canceled) {
                    Acao = 'A';
                    AcaoBool = true;
                }
                if (!customerChargingInfo.Canceled) {
                    Acao = 'C';
                }
            }

            if (UltimaCob != undefined && UltimaCob != null) { Dias = diffDays(UltimaCob); }

            if (customer.Name == 'Rodrigo Cardozo Pinto') {
                //debugger;

            }
            if (RPago) {
                RPago = parseFloat(RPago / 100);//.toString().replace('.', ',');
            }

            customerDataList.push({
                'PaymentStatusColor': PaymentStatusColor,
                'WhatsappImage': WhatsappImage,
                'CustomerName': CustomerName,
                'CustomerId': customer.Id,
                'UltimaCob': UltimaCob,
                'Dias': Dias,
                'RCobrado': RCobrado,
                'Tipo': Tipo,
                'TipoLink': TipoLink,
                'Status': Status,
                'StatusId': customer.descricaoStatus,
                'Status2': Status2,
                'Acao': Acao,
                'AcaoBool': AcaoBool,
                'customerSelectedCharge': customerSelectedCharge,
                'customerChargeId': customerChargeId,
                'Vencimento': Vencimento,
                'Ultimopag': Ultimopag,
                'Dias2': Dias2,
                'RPago': RPago
            });
        }

        vm.customerViewModel = customerDataList;
        return customerDataList;
    }

    function onPageLoad() {
        loadCustomers();
    }

    function loadCustomers() {
        vm.loading = true;
        vm.totalReceivedReady = false;
        hasUpdate = false;
        var ativos = vm.somenteAtivos ? 1 : 0;
        getAllCustomers(function (data) {
            FoneclubeService.getStatusCharging(vm.month, vm.year, ativos).then(function (result) {

                vm.customers = result;
                for (var i in vm.customers) {
                    for (var customer in data) {
                        if (data[customer].Id == vm.customers[i].Id) {
                            vm.customers[i].fullData = data[customer];
                        }
                    }

                    vm.customers[i].allChargingsCanceled = false;

                    for (var o in vm.customers[i].ChargingValidity) {
                        vm.customers[i].ChargingValidity[o].display = true;
                    }
                }
                handleData(vm.customers);
                var gridData = vm.customers;
                initDataProperties(gridData);
            });
        });
    }

    function exportToExcel() {
        $('.k-grid-excel').trigger("click")
    }

    function findCustomerById(id) {
        for (var customer in vm.customers) {
            if (vm.customers[customer].Id == id) {
                return vm.customers[customer].fullData;
            }
        }
    }

    function getAllCustomers(callback) {
        FoneclubeService.getAllCustomers(false).then(function (result) {
            var customers = result.map(function (user) {
                user.Phones = user.Phones.map(function (phone) {
                    if (phone) {
                        phone.phoneFull = phone.DDD.concat(phone.Number);
                    }
                    return phone;
                });
                return user;
            });
            var customersSemSoftDelete = [];
            for (var i in customers) {
                var customer = customers[i];
                if (!customer.SoftDelete) {
                    customer.PhoneDDDParent = null;
                    customer.PhoneNumberParent = null;
                    for (var i in customer.Phones) {
                        if (customer.Phones[i]) {
                            if (!customer.Phones[i].IsFoneclube) {
                                customer.Phones.splice(i, 1);
                            }
                        }
                    }

                    customersSemSoftDelete.push(customer);
                }
            }

            callback(customers);
        });
    }


    function initDataProperties(customerDatasource) {
        var customerData = convertToViewModel(customerDatasource);
        var totalRecords = customerData.length + 10;
        var pageHeight = $(window).height() - 150;

        vm.customerDataSource = new kendo.data.DataSource({
            data: customerData,
            pageSize: totalRecords,
            schema: {
                model: {
                    fields: {
                        Dias: { type: "number" },
                        AcaoBool: { type: "boolean" },
                    }
                }
            },
        });
        vm.customerGridOptions = {
            dataSource: vm.customerDataSource,
            height: pageHeight,
            toolbar: ["excel"],
            excel: {
                allPages: true,
                fileName: "Customer Report.xlsx",
                template: "<a class='k-button k-button-icontext' onclick='customCommand();' href='\\#'></span>Cutom Command</a>"
            },
            sortable: true,
            scrollable: true,
            pageable: {
                refresh: true,
                alwaysVisible: false

            },
            reorderable: true,
            resizable: true,

            filterable: {
                mode: "row",
                extra: false,
                operators: {
                    string: {
                        contains: "Contains",
                        startswith: "Starts with",
                        eq: "Is equal to",
                        neq: "Is not equal to"
                    },
                    number: {
                        eq: "Equal to",
                        neq: "Not equal to",
                        gte: "Greater Than",
                        lte: "Less Than"
                    }
                }
            },
            columns: [
                {
                    field: "PaymentStatusColor",
                    title: "Payment Status",
                    width: "120px",
                    headerTemplate: "<div class='break-word'>Payment Status<div>",
                    template: "<div class='payment-status-color'><span style='background-color:#:PaymentStatusColor#'></span></div>",
                    filterable: {
                        cell: {
                            showOperators: false,
                            template: function (args) {
                                args.element.kendoDropDownList({
                                    dataTextField: "text",
                                    dataValueField: "text",
                                    dataSource: new kendo.data.DataSource({ data: [{ text: 'Red' }, { text: 'Yellow' }, { text: 'Green' }] }),
                                    index: 0,
                                    optionLabel: { text: "", value: "" },
                                    valuePrimitive: true
                                })
                            }
                        }
                    }
                },
                {
                    field: "WhatsappImage",
                    title: "Payment Status",
                    width: "50px",
                    headerTemplate: "<img src='../../content/img/message-red.png' />",
                    template: "<div><img ng-click='vm.onTapMessage(#:CustomerId#)' class='imgWhatsapp link' src='#:WhatsappImage#' /></div>",
                    filterable: false
                },
                {
                    field: "CustomerName", title: "Name",
                    width: "200px",
                    headerTemplate: "<div class='break-word'>Name<div>",
                    template: '<a ng-click="vm.onTapCustomerEdit(#:CustomerId#)" class="link">#:CustomerName#</a>',
                    filterable: {
                        cell: {
                            operator: "contains",
                            template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); },
                        }
                    }
                },

                {
                    field: "", headerTemplate: '',
                    width: "50px",
                    template: '<button ng-click="vm.onTapCustomer(#:CustomerId#)" title="Service Order" class="btn btn-primary"><i class="glyphicon glyphicon-usd" aria-hidden="true"></i></button>',
                },
                {
                    field: "", headerTemplate: '',
                    width: "50px",
                    template: "<button ng-click='vm.onTapFlag(#:CustomerId#)' title='Flag' class='btn btn-primary btn-flag'>⚐<i aria-hidden='true'></i></button>",
                },
                {
                    field: "", headerTemplate: '',
                    width: "50px",
                    template: '<button ng-click="vm.onTapComment(#:CustomerId#)" title="Service Order" class="btn btn-primary"><i class="glyphicon glyphicon-list-alt" aria-hidden="true"></i></button>',
                },
                {
                    field: "", headerTemplate: '',
                    width: "50px",
                    template: '<button ng-click="vm.onTapBoletoPayment(#:CustomerId#)" title="Boleto" class="btn btn-primary"><i class="glyphicon glyphicon-retweet"></i></button>',
                },
                {
                    field: "", headerTemplate: '',
                    width: "50px",
                    template: '<button ng-click="vm.onTapCustomer(#:CustomerId#)" title="Credit Card" class="btn btn-primary"><i class="glyphicon glyphicon-credit-card"></i></button>',
                },
                {
                    field: "", headerTemplate: '',
                    width: "50px",
                    template: '<button title="Soft delete" class="btn btn-primary" ng-click="vm.onDeleteCustomer(#:CustomerId#)"><i class="glyphicon glyphicon-remove-circle uncheckcircle"></i></button>',
                    filterable: false
                },
                {
                    field: "Dias", title: "Ultima Cob.", width: "150px"
                    , headerTemplate: "<div class='break-word'>Ultima Cob.<div>",
                    template: "<div class='text-center'>#:Dias#<div>",
                    filterable: {
                        cell: {
                            operator: "gte",
                            template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); },
                        }
                    }
                },
                {
                    field: "UltimaCob",
                    width: "130px",
                    headerTemplate: "<div class='break-word'>Ultima Cobrança<div>",
                    template: "<div>#=kendo.toString(kendo.parseDate(UltimaCob, 'yyyy-MM-dd'), 'dd MMM, yyyy')#</div>",
                    filterable: {
                        cell: {
                            showOperators: false, operator: "contains",
                            template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); },
                        }
                    }
                },
                {
                    field: "RCobrado", title: "Ult. Cob. Valor R$", width: "150px",
                    headerTemplate: "<div class='break-word'>Ult. Cob. Valor<br> R$<div>",
                    filterable: {
                        cell: {
                            operator: "gte",
                            template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); },
                        }
                    }
                },
                {
                    field: "Status",
                    title: "Status Cob.",
                    width: "140px",
                    headerTemplate: "<div class='break-word'>Status Cob.<div>",
                    filterable: {
                        cell: {
                            showOperators: false,
                            template: function (args) {
                                args.element.kendoDropDownList({
                                    dataTextField: "text",
                                    dataValueField: "text",
                                    dataSource: new kendo.data.DataSource({ data: [{ text: 'Paid' }, { text: 'WaitingPayment' }, { text: 'Refunded' }] }),
                                    index: 0,
                                    optionLabel: { text: "", value: "" },
                                    valuePrimitive: true
                                })
                            }
                        }
                    }
                },
                {
                    field: "Tipo", title: "Tipo", width: "110px"
                    , headerTemplate: "<div class='break-word'>Tipo<div>"
                    , template: " #if( Tipo != 'BOLETO') {#   <label>#:Tipo#</label>  #} else{#  <a href='#:TipoLink#' target='_blank'>#:Tipo#</a> #}# "
                    , filterable: {
                        cell: {
                            showOperators: false,
                            template: function (args) {
                                args.element.kendoDropDownList({
                                    dataTextField: "text",
                                    dataValueField: "text",
                                    dataSource: new kendo.data.DataSource({ data: [{ text: 'BOLETO' }, { text: 'CARTÃO' }] }),
                                    index: 0,
                                    optionLabel: { text: "", value: "" },
                                    valuePrimitive: true
                                })
                            }
                        }
                    }
                },
                {
                    field: "Vencimento",
                    title: "Vencimento",
                    width: "110px",
                    headerTemplate: "<div class='break-word'>Vencimento<div>",
                    template: "#if( Vencimento != '-') {# <div>#=kendo.toString(kendo.parseDate(Vencimento, 'yyyy-MM-dd'), 'dd MMM, yyyy')#</div>#}#",
                    filterable: {
                        cell: {
                            showOperators: false, operator: "contains",
                            template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); },
                        }
                    }
                },
                {
                    field: "Vigencia",
                    title: "Vigencia",
                    width: "150px",
                    headerTemplate: "<div class='break-word'>Vigencia<div>",
                },
                {
                    field: "Dias2", title: "Ult. Pag. Dias", width: "150px", headerTemplate: "<div class='break-word'>Ult. Pag. Dias<div>"
                    , template: " #if( Dias2 == 0 ) {# <div>-</div> #} else{#  <div>#:Dias2#</div>  #}# "
                    , filterable: {
                        cell: {
                            operator: "gte",
                            template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); },
                        }
                    }
                },
                {
                    field: "Ultimopag",
                    title: "Ult. Pag Data",
                    width: "110px",
                    headerTemplate: "<div class='break-word'>Ult. Pag Data<div>",
                    filterable: {
                        cell: {
                            showOperators: false, operator: "contains",
                            template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); },
                        }
                    }
                },
                {
                    field: "RPago", 
                    title: "Ult. Pag R$", 
                    width: "150px",
                    headerTemplate: "<div class='break-word'>Ult. Pag R$<div>",
                    filterable: {
                        cell: {
                            operator: "gte",
                            template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); },
                        }
                    }
                },
            ]
        }
        vm.loading = false;
    }


    function handleData(customers) {
        vm.callbackCount = 0;
        vm.totalBoletoCharges = 0;
        vm.totalReceived = 0;
        vm.totalCharged = 0;
        vm.totalCustomers = customers.length;
        vm.totalCustomersCharged = customers.filter(v => v.Charged == true).length;
        vm.totalCustomersNotCharged = customers.filter(v => v.Charged == false).length;

        try {
            vm.totalBoletoCharges = customers[0].TotalBoletoCharges;
        }
        catch (erro) {
            //sem clientes
        }

        for (var index in customers) {

            var customer = customers[index];
            if (customer.Name == '1 Antonia Maria da Silva Barboza') {

            }
            try {
                customer.phone = customer.Phones[0].DDD + customer.Phones[0].Number;
                var operadora = customer.Phones[0].IdOperator == 1 ? 'Claro' : 'Vivo'
                customer.phoneDetail = operadora + ' - ' + customer.Phones[0].PlanDescription;
            }
            catch (erro) { }

            if (customer.Charged) {
                customer.statusType = vm.statusType.CARREGANDO;
                customer.registerPayd = false;
                for (var i in customer.ChargingValidity) {
                    var charge = customer.ChargingValidity[i];
                    try {
                        customer.ChargingValidity[i].BoletoExpires = new Date(customer.ChargingValidity[i].BoletoExpires).toISOString().split('T')[0].replace('-', '/').replace('-', '/');
                        customer.boletoExpires = customer.ChargingValidity[i].BoletoExpires;
                    }
                    catch (erro) { }

                    if (charge.PaymentType == 1 && charge.StatusDescription != 'Refunded') {
                        customer.ChargingValidity[i].StatusDescription = 'PAGO';
                        customer.descricaoStatus = vm.statusType.PAGO;
                        customer.descricaoTipo = vm.PagamentosType.CARTAO;
                        customer.ammoutIntPaid = parseFloat(customer.ChargingValidity[i].Ammount / 100);
                        customer.ammoutPaidFormat = customer.ammoutIntPaid.toString().replace('.', ',');
                    }

                    if (charge.PaymentType == 2 && charge.BoletoId != 0) {
                        customer.descricaoTipo = vm.PagamentosType.BOLETO;
                        PagarmeService.getStatusBoletoRecursivo(charge.BoletoId, customer, vm, index, i).then(function (result) {
                            if (!result.length) {
                                return;
                            }
                            //result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].descricaoTipo = vm.PagamentosType.BOLETO;
                            result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].StatusDescription = 'INVÁLIDO'



                            if (result[0].status == "waiting_payment") {
                                result[0].vm.customers[result[0].indexCustomer].ammoutIntPaid = 0;
                                result[0].vm.customers[result[0].indexCustomer].descricaoStatus = 'PENDENTE';
                                result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].StatusDescription = 'PENDENTE'
                                if (!result[0].elemento.registerPayd) {
                                    result[0].elemento.status = result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].StatusDescription;
                                }

                                if (!result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].Expired) {
                                    result[0].vm.customers[result[0].indexCustomer].descricaoStatus = vm.statusType.COBRADO;
                                } else {
                                    result[0].vm.customers[result[0].indexCustomer].descricaoStatus = vm.statusType.VENCIDO;
                                }
                            }
                            else if (result[0].status == "paid") {
                                result[0].vm.customers[result[0].indexCustomer].ammoutIntPaid = parseFloat(result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].Ammount / 100);
                                result[0].vm.customers[result[0].indexCustomer].descricaoStatus = vm.statusType.PAGO;
                                result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].StatusDescription = 'PAGO'
                                try {

                                }
                                catch (erro) { }

                                result[0].elemento.registerPayd = true;
                                result[0].elemento.status = charge.StatusDescription;
                                result[0].vm.totalRecebidoBoleto += parseInt(result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].Ammount, 10)
                                result[0].vm.totalReceived += parseInt(result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].Ammount, 10)
                            }
                            else {
                                // ;
                            }
                            charge.StatusDescription = result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].StatusDescription;

                            result[0].vm.callbackCount++;

                            if (result[0].vm.callbackCount == result[0].vm.totalBoletoCharges) {
                                result[0].vm.totalReceived = parseFloat(result[0].vm.totalReceived / 100).toString().replace('.', ',');
                                vm.totalReceivedReady = true;
                            }
                        })
                    }

                    if (charge.PaymentType == 1 && charge.StatusDescription == 'Refunded') {
                        customer.descricaoStatus = vm.statusType.REFUNDED;
                        customer.ChargingValidity[i].StatusDescription = 'REFUNDED'
                    }

                    if (charge.BoletoId == 0 && charge.PaymentType == 2) {
                        if (vm.customers[index].ChargingValidity[i].StatusDescription == 'CARREGANDO') {
                            vm.customers[index].ChargingValidity[i].StatusDescription = 'INVÁLIDO';
                            customer.descricaoStatus = 'INVÁLIDO';
                        }

                    }
                }

                vm.totalCharged += parseInt(customer.ChargingValidity[0].Ammount);

                if (customer.ChargingValidity[0].Payd == true) {
                    vm.totalReceived += parseInt(customer.ChargingValidity[0].Ammount)
                }

                customer.ammout = parseFloat(parseInt(customer.ChargingValidity[0].Ammount) / 100);
                customer.ammoutFormat = customer.ammout.toString().replace('.', ',');
                customer.descricaoCharge = charge.Canceled ? vm.AtivoType.CANCELADA : vm.AtivoType.ATIVA;
                customer.descricaoAcao = charge.Canceled ? vm.AtivoType.CANCELADA : vm.AtivoType.ATIVA;
                customer.ammoutInt = parseFloat(customer.ammout);
                customer.ammoutIntFormat = customer.ammoutInt;//.toString().replace('.', ',');
            }
            else {
                customer.status = 'NÃO COBRADO';
                customer.descricaoStatus = vm.statusType.NAO_COBRADO;
                customer.ammoutInt = 0;
                customer.ammoutIntPaid = 0;
            }
        }
        vm.totalCharged = parseFloat(vm.totalCharged / 100).toString().replace('.', ',');

    }

    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds            
    var secondDate = new Date();

    function diffDays(date) {
        var firstDate = new Date(date);
        return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
    }




    vm.onDesativarBoleto = onDesativarBoleto;
    vm.onAtivarBoleto = onAtivarBoleto;

    function onDesativarBoleto(chargeId) {
        DialogFactory.dialogConfirm({ mensagem: 'Tem certeza que seja cancelar essa cobrança?' })
            .then(function (value) {
                if (value) {
                    FoneclubeService.postChargingUpdate(chargeId, true)
                        .then(function (value) {
                            if (value) {
                                charge.Canceled = true;
                            }
                        })
                }
            })
    }

    function onAtivarBoleto(chargeId) {
        DialogFactory.dialogConfirm({ mensagem: 'Tem certeza que seja ativar essa cobrança?' })
            .then(function (value) {
                if (value) {
                    FoneclubeService.postChargingUpdate(chargeId, false)
                        .then(function (value) {
                            if (value) {
                                charge.Canceled = false;
                            }
                        })
                }
            })
    }
};


StatusChargingController.$inject = ['$interval', 'FoneclubeService', 'PagarmeService', 'FlowManagerService', '$filter', 'ViewModelUtilsService']; 
