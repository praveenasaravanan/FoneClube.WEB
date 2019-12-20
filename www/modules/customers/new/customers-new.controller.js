
angular.module('foneClub').controller('CustomersControllerNew', CustomersControllerNew);

//CustomersControllerNew.inject = ['localStorageService']

function CustomersControllerNew($interval, FoneclubeService, PagarmeService, FlowManagerService, $filter, ViewModelUtilsService, localStorageService) {

	var vm = this;
	var CARTAO = 1;
	var BOLETO = 2;
	var updateGrid = false;

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
	vm.excludeFlag = false;
	vm.loading = false;
	vm.excludeFather = false;
	vm.excludeAddress = false;
	vm.excludeWhatsappUsers = false;
	vm.includeWhatsappUsers = false;
	vm.includeStatusGreen = false;
	vm.includeStatusYellow = false;
	vm.includeStatusRed = false;
	vm.includeStatusGray = false;
	vm.includeStatusNan = false;
	vm.filterTextInAllCols = false;
	vm.filterTextInNameOnly = false;
	vm.searchText = "";
	vm.customerDataSource;
	vm.customerViewModel;
	// vm.customerGridOptions;

	vm.filterClients = filterClients;
	vm.onTapSwitchActivate = onTapSwitchActivate;
	vm.onTapCustomer = onTapCustomer;
	vm.onTapCustomerEdit = onTapCustomerEdit;
	vm.onTapMessage = onTapMessage;
	vm.onTapFlag = onTapFlag;
	vm.onTapComment = onTapComment;
	vm.onTapBoletoPayment = onTapBoletoPayment;
	vm.onTapBoleto = onTapBoleto;
	vm.onTapDebito = onTapDebito;
	vm.onDeleteCustomer = onDeleteCustomer;
	vm.onPageLoad = onPageLoad;
	vm.exportToExcel = exportToExcel;
	vm.filterText = filterText;
	vm.refreshPage = refreshPage;
	vm.gridOptions = {
		columnDefs: setColumnDefs(),
		rowData: [],
		defaultColDef: {
			sortable: true,
			filter: true,
			resizable: true,
			// supressMenuHide: true,
		},
		rowHeight: 50,
		angularCompileRows: true,
		onGridReady: function () {
			if (updateGrid) {
				//vm.gridOptions.api.setRowData(vm.customers);
				bindAgGrid(vm.customers);
				updateGrid = false;
			}
		},
		autoSizeColumns: true
	};
	vm.gridHeight = $(window).height() - 150;

	vm.resultText = "";

	//BEGIN: New Functions
	//BEGIN: AG-Grid
	function setColumnDefs() {
		var columnDefs = [
			{ hide: true, field: 'CustomerId' },
			{ hide: true, field: 'TipoLink' },
			{ hide: true, field: 'StatusId' },
			{ hide: true, field: 'Status2' },
			{ hide: true, field: 'Acao' },
			{ hide: true, field: 'AcaoBool' },
			{ hide: true, field: 'customerSelectedCharge' },
			{ hide: true, field: 'customerChargeId' },

			// payment color
			{
				headerName: 'Payment Status',
				field: 'PaymentStatusColor',
				width: 80,
				cellRenderer: function (params) {
					return "<div class='payment-status-color'><span style='background-color:" + params.value + "' title='" + params.value + "'></span></div>";
				},
				filter: false
			},
			// whatsApp
			{
				headerName: '',
				field: 'WhatsappImage',
				width: 60,
				cellRenderer: function (params) {
					if (params.value == '../../content/img/message-red.png') {
						return "<a ng-click='vm.onTapMessage(" + params.node.data.CustomerId + ")' title='UnRegistered'><img class='imgWhatsapp link' src=" + params.value + " /></a>";
					} else {
						return "<a ng-click='vm.onTapMessage(" + params.node.data.CustomerId + ")' title='Registered'><img class='imgWhatsapp link' src=" + params.value + " /></a>";
					}

				},
				filter: false
			},
			// customer name
			{
				headerName: 'Name',
				field: 'CustomerName',
				width: 200,
				cellRenderer: function (params) {
					return "<a ng-click='vm.onTapCustomerEdit(" + params.node.data.CustomerId + ")' class='black-link'>" + params.value + "</a>";
				},
				filter: true,
				filterParams: {
					filterOptions: [
						{
							displayKey: 'containString',
							displayName: 'Contains String',
							test: function (filterValue, cellValue) {
								return checkContains(RemoveAccents(cellValue).toLowerCase(), RemoveAccents(filterValue).toLowerCase());
							}
						},
					],
					suppressAndOrCondition: true
				}
			},
			// buttons
			{
				headerName: '',
				field: '',
				width: 280,
				cellRenderer: function (params) {
					var cellHtml = "";
					var customer = findCustomerById(params.node.data.CustomerId);
					cellHtml += '<button title=' + (!customer.Desativo ? 'Desativar cliente' : 'Ativar cliente') +
						' class="btn ' + (!customer.Desativo ? 'btn-info"' : '"') +
						' ng-click="vm.onTapSwitchActivate(' + params.node.data.CustomerId + ', ' + params.node.id + ')">' +
						(!customer.Desativo ? 'on' : 'off') + '</button>';

					if (customer.PendingFlagInteraction) {
						cellHtml += '&nbsp;<button title="Cliente com flag pendente!" class="btn btn-warning"><i>&#9873;</i></button>';
					}
					if (customer.Orphan) {
						cellHtml += '&nbsp;<button title="Cliente com problema no cadastro!" class="btn btn-warning"><i class="glyphicon glyphicon-exclamation-sign"></i></button>';
					}

					cellHtml += '&nbsp;<button ng-click="vm.onTapCustomer(' + params.node.data.CustomerId + ')" title="Financeiro" class="btn btn-primary"><i class="glyphicon glyphicon-usd" aria-hidden="true"></i></button>';
					cellHtml += '&nbsp;<button ng-click="vm.onTapFlag(' + params.node.data.CustomerId + ')" title="Criar Flag" class="btn btn-primary btn-flag">⚐<i aria-hidden="true"></i></button>';
					cellHtml += '&nbsp;<button ng-click="vm.onTapComment(' + params.node.data.CustomerId + ')" title="Service Order" class="btn btn-primary"><i class="glyphicon glyphicon-list-alt" aria-hidden="true"></i></button>';
					/*
					cellHtml += '&nbsp;<button ng-click="vm.onTapBoletoPayment(' + params.node.data.CustomerId + ')" title="Boleto" class="btn btn-primary"><i class="glyphicon glyphicon-retweet"></i></button>';
					cellHtml += '&nbsp;<button ng-click="vm.onTapCustomer(' + params.node.data.CustomerId + ')" title="Credit Card" class="btn btn-primary"><i class="glyphicon glyphicon-credit-card"></i></button>';
					cellHtml += '&nbsp;<button class="btn btn-primary" ng-click="vm.onTapBoleto(' + params.node.data.CustomerId + ')" title="boleto"><img src="./content/img/Boleto.png" width="15px" height="15px" /></button>';
					cellHtml += '&nbsp;<button class="btn btn-primary" ng-click="vm.onTapDebito(' + params.node.data.CustomerId + ')" title="Debit card"><img src="./content/img/debito.png" width="15px" height="15px" /></button>';
					*/
					cellHtml += '&nbsp;<button title="Soft delete" class="btn btn-primary" ng-click="vm.onDeleteCustomer(' + params.node.data.CustomerId + ', ' + params.node.id + ')"><i class="glyphicon glyphicon-remove-circle uncheckcircle"></i></button>';
					return cellHtml;
				},
				filter: false
			},
			// Ultima Cob
			{
				headerName: 'Ultima Cob.',
				field: 'Dias',
				width: 80,
				cellRenderer: function (params) {
					if (params.value == -1) {
						return '<div>Nan</div>'
					} else {
						return '<div>' + params.value + '</div>';
					}

				},
				filterParams: {
					filterOptions: [
						{
							displayKey: 'largerThan',
							displayName: 'Larger than',
							test: function (filterValue, cellValue) {
								return parseInt(cellValue) > parseInt(filterValue);
							}
						},
						{
							displayKey: 'smallerThan',
							displayName: 'Smaller than',
							test: function (filterValue, cellValue) {
								return parseInt(cellValue) < parseInt(filterValue);
							}
						},
						'equals',
						'notEqual'
					]
				}
			},
			// Ultima cobranca
			{
				headerName: 'Ultima Cobrança',
				field: 'UltimaCob',
				width: 100,
				cellRenderer: function (params) {
					return renderDate(params.value);
				},
				filter: 'agDateColumnFilter',
				filterParams: {
					filterOptions: [
						{
							displayKey: 'olderThan',
							displayName: 'After than',
							test: function (filterValue, cellValue) {
								var origin = new Date(cellValue);
								return origin < filterValue;
							}
						},
						{
							displayKey: 'youngerThan',
							displayName: 'Before than',
							test: function (filterValue, cellValue) {
								var origin = new Date(cellValue);
								return filterValue < origin;
							}
						},
						{
							displayKey: 'specifics',
							displayName: 'Specific date',
							test: function (filterValue, cellValue) {
								var origin = new Date(cellValue);
								return filterValue == cellValue;
							}
						}]
				}
			},
			// Ult Cob R$
			{
				headerName: 'Ult. Cob. R$',
				field: 'RCobrado',
				width: 100,
				cellRenderer: function (params) {
					return params.value ? (Math.round(params.value * 100) / 100).toFixed(2) : '';
				},
				filterParams: {
					filterOptions: [
						{
							displayKey: 'largerThan',
							displayName: 'Larger than',
							test: function (filterValue, cellValue) {
								return parseInt(cellValue) > parseInt(filterValue);
							}
						},
						{
							displayKey: 'smallerThan',
							displayName: 'Smaller than',
							test: function (filterValue, cellValue) {
								return parseInt(cellValue) < parseInt(filterValue);
							}
						},
						'equals',
						'notEqual'
					]
				}
			},
			// Status Cob   (Select Filter)            
			{
				headerName: 'Status Cob.',
				field: 'Status2',
				width: 100,
				filter: false
			},
			// Tip (Select Filter)
			{
				headerName: 'Tipo',
				field: 'Tipo',
				width: 100,
				cellRenderer: function (params) {
					if (params.value != 'BOLETO') {
						return "<label>" + params.value + "</label>";
					} else {
						return "<a href=" + params.node.data.TipoLink + " target='_blank'>" + params.value + "</a>";
					}
				},
				filter: false
			},
			// Vecimento
			{
				headerName: 'Vencimento',
				field: 'Vencimento',
				width: 100,
				cellRenderer: function (params) {
					return renderDate(params.value);
				},
				filter: 'agDateColumnFilter',
				filterParams: {
					filterOptions: [
						{
							displayKey: 'olderThan',
							displayName: 'After than',
							test: function (filterValue, cellValue) {
								var origin = new Date(cellValue);
								return origin < filterValue;
							}
						},
						{
							displayKey: 'youngerThan',
							displayName: 'Before than',
							test: function (filterValue, cellValue) {
								var origin = new Date(cellValue);
								return filterValue < origin;
							}
						},
						{
							displayKey: 'specifics',
							displayName: 'Specific date',
							test: function (filterValue, cellValue) {
								var origin = new Date(cellValue);
								return filterValue == cellValue;
							}
						}]
				}
			},
			// Vigencia
			{
				headerName: 'Vigencia',
				field: 'Vigencia',
				width: 100,
				cellRenderer: function (params) {
					return renderDate(params.value);
				},
				filter: 'agDateColumnFilter',
				filterParams: {
					filterOptions: [
						{
							displayKey: 'olderThan',
							displayName: 'After than',
							test: function (filterValue, cellValue) {
								var origin = new Date(cellValue);
								return origin < filterValue;
							}
						},
						{
							displayKey: 'youngerThan',
							displayName: 'Before than',
							test: function (filterValue, cellValue) {
								var origin = new Date(cellValue);
								return filterValue < origin;
							}
						},
						{
							displayKey: 'specifics',
							displayName: 'Specific date',
							test: function (filterValue, cellValue) {
								var origin = new Date(cellValue);
								return filterValue == cellValue;
							}
						}]
				}
			},
			// Ult Pag Dias
			{
				headerName: 'Ult. Pag. Dias',
				field: 'Dias2',
				width: 100,
				cellRenderer: function (params) {
					if (params.value == 0) {
						return "<div>-</div>";
					} else {
						return "<div>" + params.value + "</div>";
					}
				},
				filterParams: {
					filterOptions: [
						{
							displayKey: 'largerThan',
							displayName: 'Larger than',
							test: function (filterValue, cellValue) {
								return parseInt(cellValue) > parseInt(filterValue);
							}
						},
						{
							displayKey: 'smallerThan',
							displayName: 'Smaller than',
							test: function (filterValue, cellValue) {
								return parseInt(cellValue) < parseInt(filterValue);
							}
						},
						'equals',
						'notEqual'
					]
				}
			},
			// Ult Pag Data
			{
				headerName: 'Ult. Pag Data',
				field: 'Ultimopag',
				width: 100,
				cellRenderer: function (params) {
					return renderDate(params.value);
				},
				filter: 'agDateColumnFilter',
				filterParams: {
					filterOptions: [
						{
							displayKey: 'olderThan',
							displayName: 'After than',
							test: function (filterValue, cellValue) {
								var origin = new Date(cellValue);
								return origin < filterValue;
							}
						},
						{
							displayKey: 'youngerThan',
							displayName: 'Before than',
							test: function (filterValue, cellValue) {
								var origin = new Date(cellValue);
								return filterValue < origin;
							}
						},
						{
							displayKey: 'specifics',
							displayName: 'Specific date',
							test: function (filterValue, cellValue) {
								var origin = new Date(cellValue);
								return filterValue == cellValue;
							}
						}]
				}

			},
			// Ult Pag R$
			{
				headerName: 'Ult. Pag R$',
				field: 'RPago',
				width: 100,
				cellRenderer: function (params) {
					return params.value ? (Math.round(params.value * 100) / 100).toFixed(2) : '';
				},
				filterParams: {
					filterOptions: [
						{
							displayKey: 'largerThan',
							displayName: 'Larger than',
							test: function (filterValue, cellValue) {
								return parseInt(cellValue) > parseInt(filterValue);
							}
						},
						{
							displayKey: 'smallerThan',
							displayName: 'Smaller than',
							test: function (filterValue, cellValue) {
								return parseInt(cellValue) < parseInt(filterValue);
							}
						},
						'equals',
						'notEqual'
					]
				}
			}
		];

		return columnDefs;
	}

	function bindAgGrid(data) {
		var rowData = convertToViewModel(data);
		if (vm.gridOptions.api) {
			vm.gridOptions.api.setRowData(rowData);
		} else {
			updateGrid = true;
		}

		vm.loading = false;
	}

	function filterClients() {
		vm.loading = true;
		filterClientsData();
	}
	function filterText() {
		if (vm.searchText) {
			filterClientsData();
		}
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

					(vm.excludeProblema ? !data.fullData.Orphan : true) &&
					(vm.excludeFlag ? !data.fullData.PendingFlagInteraction : true) &&
					(vm.excludeFather ? !data.fullData.NameParent : true) &&
					(vm.excludeAddress ? !data.fullData.Adresses.length : true) &&

					((!vm.excludeWhatsappUsers && !vm.includeWhatsappUsers) ||
						(vm.excludeWhatsappUsers ? (!data.fullData.WClient || !data.fullData.WClient.IsRegisteredWithChat2Desk) : false) ||
						(vm.includeWhatsappUsers ? (data.fullData.WClient && data.fullData.WClient.IsRegisteredWithChat2Desk) : false)) &&

					((!vm.includeStatusGreen && !vm.includeStatusYellow && !vm.includeStatusRed && !vm.includeStatusGray && !vm.includeStatusNan) ||
						(vm.includeStatusGreen ? filterStatusColor(data, "green") : false) ||
						(vm.includeStatusYellow ? filterStatusColor(data, "yellow") : false) ||
						(vm.includeStatusRed ? filterStatusColor(data, "red") : false) ||
						(vm.includeStatusGray ? filterStatusColor(data, "grey") : false) ||
						(vm.includeStatusNan ? filterStatusColor(data, "nan") : false)));
			}
			else {
				return false;
			}
		});
		vm.resultText = filteredData.length + " of " + vm.customers.length + " items";
		bindAgGrid(filteredData);
		vm.loading = false;
	}

	function filterByText(data) {
		if (vm.searchText) {
			vm.searchText = vm.searchText.toLowerCase();

			if (vm.filterTextInAllCols && !vm.filterTextInNameOnly) {
				return data.Id.toString().toLowerCase().indexOf(vm.searchText) > -1 ||
					data.Name.toLowerCase().indexOf(vm.searchText) > -1 ||
					data.Email.toLowerCase().indexOf(vm.searchText) > -1 ||
					(data.fullData.DocumentNumber ? data.fullData.DocumentNumber.toLowerCase().indexOf(vm.searchText) > -1 : false) ||
					//(data.NickName ? data.NickName.toLowerCase().indexOf(vm.searchText) > -1 : false) ||
					(data.fullData.Born ? data.fullData.Born.toLowerCase().indexOf(vm.searchText) > -1 : false) ||
					(data.fullData.IdPagarme ? data.fullData.IdPagarme.toString().indexOf(vm.searchText) > -1 : false) ||
					matchPhone(data.Phones, vm.searchText) ||
					(data.fullData.NameParent ? data.fullData.NameParent.toLowerCase().indexOf(vm.searchText) > -1 : false);
			} else {
				return checkContains(RemoveAccents(data.Name.toLowerCase()), RemoveAccents(vm.searchText));
				//return data.Name.toLowerCase().indexOf(vm.searchText) > -1;
			}
		} else {
			return true;
		}
	}

	function filterStatusColor(data, color) {
		if (color != "nan") {
			return (data.ChargeAndServiceOrderHistory &&
				data.ChargeAndServiceOrderHistory.Charges &&
				data.ChargeAndServiceOrderHistory.Charges.PaymentStatusColor == color)
		} else {
			return (data.ChargeAndServiceOrderHistory &&
				data.ChargeAndServiceOrderHistory.Charges == null)
		}

	}

	function excludeAllFilters() {
		return !vm.includeActive
			&& !vm.includeInActive
			&& !vm.excludeProblema
			&& !vm.excludeFlag
			&& !vm.excludeFather
			&& !vm.excludeAddress
			&& !vm.excludeWhatsappUsers
			&& !vm.includeWhatsappUsers
			&& !vm.includeStatusGreen
			&& !vm.includeStatusYellow
			&& !vm.includeStatusRed
			&& !vm.includeStatusGray
			&& !vm.includeStatusNan
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

	function onTapSwitchActivate(id, nodeId) {
		var c = findCustomerById(id);
		var oldValue = angular.copy(c.Desativo);

		var customer = {
			Id: c.Id,
			Desativo: !c.Desativo
		};

		var confirmMessage = `
        <span class="text-center">
          Tem certeza que deseja ${c.Desativo ? 'ativar' : 'desativar'} esse cliente?
        </span>
      `;

		// TODO: confirm dialog
		ViewModelUtilsService.showConfirmDialog('Atenção!', confirmMessage).then(function (
			confirm
		) {
			if (confirm) {
				c.Desativo = customer.Desativo;

				FoneclubeService.postPersonAtivity(customer).then(function (result) {
					if (!result) {
						customer.Desativo = oldValue;
					} else {
						// update ag-grid
						let row = vm.gridOptions.api.getRowNode(nodeId);
						var index = vm.customers.indexOf(vm.customers.filter(v => v.Id == id)[0]);
						if (index >= 0) {
							vm.customers[index].Desativo = c.Desativo;
							var res = vm.gridOptions.api.redrawRows({ rowNodes: [row] });
						}
					}
				});
			}
		});
	}

	function onTapCustomerEdit(id) {
		var customer = findCustomerById(id);
		FlowManagerService.changeEdicaoView(customer);
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
	function onTapBoleto(id) {
		var customer = findCustomerById(id);
		ViewModelUtilsService.showModalBoleto(customer);
	}
	function onTapDebito(id) {
		var customer = findCustomerById(id);
		ViewModelUtilsService.showModalDebito(customer);
	}
	function onTapCustomer(id, index) {
		var customer = findCustomerById(id);
		ViewModelUtilsService.showModalCustomer(customer, index);
	}
	function onDeleteCustomer(id, nodeId) {
		var r = confirm('Deseja fazer um soft delete nesse cliente?');
		if (r == true) {
			var customer = findCustomerById(id);//// 
			FoneclubeService.postSoftDeleteCustomer(customer).then(function (result) {
				if (result) {
					alert('Cliente deletado');
					var index = vm.customers.indexOf(vm.customers.filter(v => v.Id == id)[0]);
					if (index >= 0) {
						vm.customers.splice(index, 1);
						var row = vm.gridOptions.api.getRowNode(nodeId);
						vm.gridOptions.api.updateRowData({ remove: [row.data] });
					}
				}
			});
		} else {
		}
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
			var Vigencia = customer.boletoExpires;
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
				Vencimento = charge.TransactionLastUpdate

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

			if (UltimaCob != undefined && UltimaCob != null && UltimaCob != '') { Dias = diffDays(UltimaCob); }

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
				'Dias': (Dias == 0 && UltimaCob == '') ? -1 : Dias,
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
				'RPago': RPago,
				'Vigencia': Vigencia
			});
		}

		vm.customerViewModel = customerDataList;
		return customerDataList;
	}

	function onPageLoad() {
		var customers = localStorageService.get('customers');
		if (customers == undefined || customers == null || customers == 'none') {
			loadCustomers();
		} else {
			vm.customers = JSON.parse(customers);
			handleData(vm.customers);
			bindAgGrid(vm.customers);
		}
	}

	function loadCustomers() {
		vm.loading = true;
		vm.totalReceivedReady = false;
		hasUpdate = false;
		var ativos = vm.somenteAtivos ? 1 : 0;

		getAllCustomers(function (data) {
			FoneclubeService.getStatusCharging(vm.month, vm.year, ativos).then(function (result) {
				//vm.customers = result;
				vm.customers = [];
				for (var i in result) {
					let c = result[i];
					const customer = data.find(d => d.Id == c.Id);
					if (customer && !customer.SoftDelete) {
						c.fullData = customer;
						// if(customer.Desativo == undefined) {
						//     vm.customers[i].fullData.Desativo = false;
						// }
						c.allChargingsCanceled = false;

						for (var o in c.ChargingValidity) {
							c.ChargingValidity[o].display = true;
						}
						vm.customers.push(c);
					} else {
						//c.fullData = {};
					}
				}
				handleData(vm.customers);
				//var gridData = vm.customers;
				//initDataProperties(gridData);
				bindAgGrid(vm.customers);
				var str = JSON.stringify(vm.customers);
				localStorageService.set('customers', str);
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
			//var customersSemSoftDelete = [];
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
					customers[i] = customer;
					//customersSemSoftDelete.push(customer);
				} else {
				}
			}

			callback(customers);
		});
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
	function refreshPage() {
		localStorageService.set('customers', 'none');
		location.reload();
	}

	function renderDate(value) {
		if (value != '' && value && value != '-') {
			var str = new Date(value);
			str = str.toLocaleDateString('en-us', { month: 'short', day: '2-digit', year: 'numeric' });
			return '<div>' + str + '</div>';
		}
		return '<div></div>';
	}

	function RemoveAccents(strAccents) {
		var strAccents = strAccents.split('');
		var strAccentsOut = new Array();
		var strAccentsLen = strAccents.length;
		var accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
		var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
		for (var y = 0; y < strAccentsLen; y++) {
			if (accents.indexOf(strAccents[y]) != -1) {
				strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
			} else
				strAccentsOut[y] = strAccents[y];
		}
		strAccentsOut = strAccentsOut.join('');
		return strAccentsOut;
	}

	function checkContains(strOrigin, strSearch) {
		if (strSearch.indexOf(" ") > -1) {
			var val = strSearch.split(" ");
			const res = true;
			for (var i in val) {
				if (strOrigin.indexOf(val[i]) == -1) {
					return false;
				}
			}
			return res;
		} else {
			return strOrigin.indexOf(strSearch) > -1;
		}
	}
};


StatusChargingController.$inject = ['$interval', 'FoneclubeService', 'PagarmeService', 'FlowManagerService', '$filter', 'ViewModelUtilsService']; 
