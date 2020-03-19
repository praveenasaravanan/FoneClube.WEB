angular
  .module('foneClub')
  .controller('AllPhoneNewController', AllPhoneNewController);

AllPhoneNewController.$inject = ['$scope', 'FoneclubeService', 'localStorageService', 'MainUtils', 'notify'];

function AllPhoneNewController($scope, FoneclubeService, localStorageService, MainUtils, notify) {

  // local variables
  let updateMainGrid = false;
  let updateServiceGrid = false;
  let updateAssignGrid = false;

  var vm = this;

  vm.loading = false;
  vm.visible_details = true;
  // edit phone = 0,  new phone = 1, select phone = 2
  vm.phoneMode = 1;

  // select options
  // customer list
  vm.customers = [];
  // selected customer
  vm.customer = {
    Id: -1,
    Name: "",
    DocumentNumber: "",
    Email: "",
    NickName: "",
    Parent: ""
  };
  // selected phone
  vm.phone = {
    CompletePhone: ""
  };
  // unassigned phone list
  vm.freePhones = [];
  // available services
  vm.services = [];
  // avaiable plans
  vm.plans = [];
  // available operators
  vm.operators = [];

  // local variable
  vm.selectedPersonPhoneId = -1;
  vm.selectedNodeId = -1;
  vm.selectedPhoneNumber = "";

  // personal information
  vm.detail_phone = '';
  vm.detail_email = '';
  vm.detail_cpf = '';
  vm.detail_nomePai = '';
  vm.detail_atualize = '';
  vm.detail_cep = '';
  vm.detail_rua = '';
  vm.detail_numero = '';
  vm.detail_complemento = '';
  vm.detail_bairro = '';
  vm.detail_cidade = '';
  vm.detail_estado = '';

  vm.total_linhas = 0;

  // main grid
  vm.grdMainOption = {
    columnDefs: [
      // Linha em Uso
      {
        headerName: 'Linha em Uso',
        field: 'UsoLinha',
        width: 100,
        minWidth: 100,
        cellRenderer: function (params) {
          if (params.value) {
            return "<button class='btn btn-success btn-xs'>sim</button>";
          } else {
            return "<button class='btn btn-warning btn-xs'>não</button>";
          }
        },
        filterParams: {
          filterOptions: [
            'empty',
            {
              displayKey: 'UsoLinhaSim',
              displayName: 'sim',
              test: function (filterValue, cellValue) {
                return (cellValue == 'sim' || cellValue == 1);
              },
              hideFilterInput: true
            },
            {
              displayKey: 'UsoLinhaNao',
              displayName: 'não',
              test: function (filterValue, cellValue) {
                return (cellValue == 'não' || cellValue == 0);
              },
              hideFilterInput: true
            }
          ],
          applyButton: true,
          clearButton: true,
          resetButton: true,
        }
      },
      // Operadora Divergente
      {
        headerName: 'Operadora Divergente',
        field: 'DisplayOperator',
        width: 110,
        minWidth: 110,
        cellRenderer: function (params) {
          if (params.node.data.OperatorId == 1) {
            return "<button class='btn btn-success btn-xs'>A</button>";
          } else {
            return "<button class='btn btn-danger btn-xs'>E</button>";
          }
        },
        filterParams: {
          filterOptions: [
            'empty',
            {
              displayKey: 'OperadoraA',
              displayName: 'A',
              test: function (filtervalue, cellValue) {
                return (cellValue == 'a');
              },
              hideFilterInput: true
            },
            {
              displayKey: 'OperadoraE',
              displayName: 'E',
              test: function (filtervalue, cellValue) {
                return (cellValue == 'e');
              },
              hideFilterInput: true
            }
          ],
          applyButton: true,
          clearButton: true,
          resetButton: true,
        }
      },
      // Plano Operadora 3
      {
        headerName: 'Plano Operadora 3',
        field: 'DisplayPlanoOperador',
        width: 150,
      },
      // Telefone
      {
        headerName: 'Telefone',
        field: 'DisplayPhone',
        cellRenderer: function (params) {
          if (params.value) {
            return "<div>" + params.value + "</div>";
          } else {
            return "<div>" + params.node.data.CompletePhone + "</div>";
          }
        },
        width: 100,
      },
      // CCID
      {
        headerName: 'CCID',
        field: 'CCID',
        width: 100
      },
      // Cod. Cliente
      {
        headerName: 'Cod. Cliente',
        field: 'CodigoCliente',
        width: 100
      },
      // Razao Social
      {
        headerName: 'Razao Social',
        field: 'RazaoSocial',
        width: 100
      },
      // Cliente 2
      {
        headerName: 'Cliente 2',
        field: 'PersonName',
        width: 200,
        cellRenderer: function (params) {
          const personPhoneId = params.node.data.PersonPhoneId;
          if (personPhoneId == 0) {
            return "<button class='btn btn-success btn-xs' ng-click='assignCustomer(" + personPhoneId + ", " + params.node.data.CompletePhone + ", " + params.node.id + ")'><i class='fa fa-plus'></i></button>";
          } else {
            return "<div><a ng-click='showCustomerDetail(" + personPhoneId + ")'>" + params.value + "</a></div>";
          }
        },
      },
      // Servico da linha
      {
        headerName: 'Servico da linha',
        field: 'PhoneServices',
        width: 300,
        cellRenderer: function (params) {
          const personPhoneId = params.node.data.PersonPhoneId;
          let html = "<ul>";
          if (params.value != undefined) {
            for (let i = 0; i < params.value.length; i++) {
              const item = params.value[i];
              const serviceName = item.ServiceName;
              const serviceId = item.ServiceId;
              html += "<li class='phone-services'>"
              html += "<button class='btn btn-info btn-xs' ng-click='removeService(" + serviceId + "," + personPhoneId + "," + params.node.id + ")'>";
              html += serviceName;
              html += "<i class='fa fa-times'></i></button></li>";
            }
          }
          html += "<li class='phone-services'><button class='btn btn-success btn-xs' ng-click='addNewService(" + personPhoneId + "," + params.node.id + ")'>";
          html += "<i class= 'fa fa-plus'></i></button></li>";
          html += "</ul>";
          return html;
        }
      },
      // Ativa
      {
        headerName: 'Ativa',
        field: 'IsActive',
        width: 70,
        cellRenderer: function (params) {
          const personPhoneId = params.node.data.PersonPhoneId;
          if (params.value) {
            return "<button ng-click='showActivateConfirm(" + personPhoneId + ", " + params.node.id + ", true)' class='btn btn-success btn-xs'>On</button>";
          } else {
            return "<button ng-click='showActivateConfirm(" + personPhoneId + ", " + params.node.id + ", false)' class='btn btn-danger btn-xs'>Off</button>";
          }
        },
        filterParams: {
          filterOptions: [
            'empty',
            {
              displayKey: 'AtivaOn',
              displayName: 'On',
              test: function (filterValue, cellValue) {
                return (cellValue == 'true' || cellValue == true);
              },
              hideFilterInput: true
            },
            {
              displayKey: 'AtivaOff',
              displayName: 'Off',
              test: function (filterValue, cellValue) {
                return (cellValue == 'false' || cellValue == false);
              },
              hideFilterInput: true
            }
          ],
          applyButton: true,
          clearButton: true,
          resetButton: true,
        }
      },
      // Plano Fc
      {
        headerName: 'Plano Fc',
        field: 'PlanDescription',
        width: 100,

      },
      // Preco Fc
      {
        headerName: 'Preco Fc',
        field: 'CalculatePlanCost',
        width: 100,
        filter: 'agNumberColumnFilter'
      },
      // Preco VIP
      {
        headerName: 'Preco VIP',
        field: 'CalculateAmoutPrecoVip',
        width: 100,
        filter: 'agNumberColumnFilter'
      },
      // Apelido
      {
        headerName: 'Apelido',
        field: 'NickName',
        width: 200
      }
    ],
    rowData: [],
    defaultColDef: {
      filter: true,
      sortable: true,
      resizable: true,
      autoHeight: true,
      filterParams: {
        applyButton: true,
        clearButton: true,
        resetButton: true,
      }
    },
    angularCompileRows: true,
    onGridReady: function () {
      if (updateMainGrid) {
        bindMainGrid(vm.grdMainSrc);
        updateMainGrid = false;
      }
      vm.grdMainOption.api.sizeColumnsToFit();
    },
    autoSizeColumns: true,
    rowHeight: 40
  }
  vm.grdMainSrc = [];
  vm.grdHeight = $(window).height() - 200;

  // service grid
  vm.grdServiceOption = {
    columnDefs: [
      {
        headerName: 'Service',
        field: 'ServiceName',
        width: 200
      },
      {
        headerName: 'Active Date',
        field: 'ActiveDate',
        width: 200
      }
    ],
    rowData: [],
    defaultColDef: {
      filter: false,
      sortable: true,
      resizable: true,
      autoHeight: true
    },
    angularCompileRows: true,
    onGridReady: function () {
      if (updateServiceGrid) {
        bindServiceGrid(vm.grdServiceSrc);
        updateServiceGrid = false;
      }
      vm.grdServiceOption.api.sizeColumnsToFit();
    },
    autoSizeColumns: true,
  };
  vm.grdServiceSrc = [];

  // assign modal grid
  vm.grdAssignOption = {
    columnDefs: [
      {
        headerName: '-',
        field: 'Id',
        width: 50,
        cellRenderer: function (params) {
          return "<button ng-click='assignPhoneToCustomer(" + params.value + ")' class='btn btn-info btn-xs'><i class='fa fa-plus'></i></button>";
        }
      },
      {
        headerName: 'Name',
        field: 'Name',
        width: 100,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Nick Name',
        field: 'NickName',
        width: 150
      },
      {
        headerName: 'Document Number',
        field: 'DocumentNumber',
        width: 120,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Email',
        field: 'Email',
        width: 120
      }
    ],
    rowData: [],
    defaultColDef: {
      filter: false,
      sortable: true,
      resizable: true,
      autoHeight: true,
      autoSizeColumns: true,
    },
    angularCompileRows: true,
    onGridReady: function () {
      if (updateAssignGrid) {
        bindAssignGrid(vm.customers);
        updateAssignGrid = false;
      }
      vm.grdAssignOption.api.sizeColumnsToFit();
    },

  };

  // initial function
  $scope.initPageLoad = async function () {
    try {
      vm.loading = true;

      // loading customer
      var customers = localStorageService.get('customers');
      if (customers == undefined || customers == null || customers == 'none') {
        await FoneclubeService.getAllCustomers(false)
          .then(function (result) {
            vm.customers = result;
          })
          .catch(function (error) {
            vm.customers = [];
          });

        localStorageService.set('customers', JSON.stringify(vm.customers));

      } else {
        vm.customers = JSON.parse(customers);
      }
      bindCustomerFilterDropdown();

      // loading phones
      const phoneData = localStorageService.get('phoneData');
      if (phoneData == undefined || phoneData == null || phoneData == 'none' || phoneData.length == 0) {
        await FoneclubeService.getAllPhones()
          .then(function (result) {
            vm.grdMainSrc = result;
          })
          .catch(function (error) {
            vm.grdMainSrc = [];
          });
        localStorageService.set('phoneData', JSON.stringify(vm.grdMainSrc));
      } else {
        vm.grdMainSrc = JSON.parse(phoneData);
      }
      vm.freePhones = vm.grdMainSrc.filter(x => x.PersonId == 0);
      // console.log(vm.freePhones);
      bindFreePhoneDropdown(vm.freePhones);
      bindMainGrid(vm.grdMainSrc);

      // load services
      await FoneclubeService.getServices()
        .then(function (result) {
          // load dropdown
          vm.services = result;
        })
        .catch(function (error) {
          console.log('load services error');
          vm.services = [];
        });

      bindServiceDropdown(vm.services);

      // load plans
      await FoneclubeService.getPlanOptios()
        .then(function (result) {
          if (result) {
            vm.plans = result;
          }
        })
        .catch(function (error) {
          vm.plans = [];
        });
      bindPlanDropdown(vm.plans);

      // load operators
      await FoneclubeService.getOperators()
        .then(function (result) {
          if (result) {
            vm.operators = result;
          }
        })
        .catch(function (error) {

        });
      bindOperatorDropdown(vm.operators);

      // modal dismiss
      $("#edit_modal").on('hidden.bs.modal', function () {
        const Id = $("#customer-filter").val();
        if (Id == "-1" || Id == -1) {
          resetCustomer();
        }
      });

      $("#service_modal").on('hidden.bs.modal', function () {
        // redraw main grid
        redrawGrid(vm.selectedNodeId);
      });


    } catch (error) {
      // console.log(error);
      showMessage('Something went wrong', false);
    }
    vm.loading = false;
    console.log('loading false');
  }

  // trigger on reload whole page
  $scope.refreshPage = function () {
    localStorageService.set('phoneCustomers', 'none');
    localStorageService.set('phoneData', 'none');
    location.reload();
  }

  // trigger on show/hide detail at the top
  $scope.showHideDetails = function () {
    vm.visible_details = !vm.visible_details;
    if (vm.visible_details) {
      vm.grdHeight = $(window).height() - 200;
    } else {
      vm.grdHeight = $(window).height() - 70;
    }
  }

  // Activate / deactivate phone number
  // Confirm dialog
  // trigger on click Ativa on/off
  $scope.showActivateConfirm = function (personPhoneId, nodeId, activate) {
    if (personPhoneId <= 0) {
      showMessage('Phone is not connected to the customer', false);
    } else {
      vm.selectedPersonPhoneId = personPhoneId;
      vm.selectedNodeId = nodeId;
      if (activate) {
        $("#deactivate_confirm_modal").show();
      } else {
        $("#activate_confirm_modal").show();
      }
    }
  }

  // activate/deactivate phone number
  $scope.activatePhone = async function (activate) {
    if (vm.selectedPersonPhoneId > 0 && vm.selectedNodeId > 0) {
      // activate phone number
      // console.log(vm.selectedPersonPhoneId, vm.selectedNodeId);
      await FoneclubeService.postUpdatePhoneActivate({ personPhoneId: vm.selectedPersonPhoneId, activate: activate })
        .then(result => {
          // console.log(result);
          if (result) {
            var phone = vm.grdMainSrc.find(x => x.PersonPhoneId == vm.selectedPersonPhoneId);
            if (phone) {
              phone.IsActive = activate;
              // update grid
              if (activate) {
                showMessage("Phone is successfully activated", true);
              } else {
                showMessage("Phone is successfully deactivated", true);
              }
            }
          } else {
            showMessage("Something went wrong with activation", false);
            console.log('false');
          }
        })
        .catch(error => {
          console.log(error);
          showMessage("Something went wrong with activation", false);
        });
      // refresh grid
    }
    this.cancelActivate();

  }

  // cancel activation
  $scope.cancelActivate = function () {
    vm.selectedPersonPhoneId = -1;
    vm.selectedNodeId = -1;
    $("#activate_confirm_modal").hide();
    $("#deactivate_confirm_modal").hide();
  }

  // trigger on alert message [ok]
  $scope.hideMessageModal = function () {
    $("#edit_modal").hide();
  }

  // add/remove service
  // show dialog
  $scope.addNewService = function (personPhoneId, nodeId) {
    if (personPhoneId <= 0) {
      showMessage('Phhone is not connected with customer', false);
    } else {
      vm.selectedPersonPhoneId = personPhoneId;
      vm.selectedNodeId = nodeId;

      var phone = vm.grdMainSrc.find(x => x.PersonPhoneId == personPhoneId);

      if (phone && phone.PhoneServices && phone.PhoneServices.length > 0) {
        vm.grdServiceSrc = phone.PhoneServices;
      } else {
        vm.grdServiceSrc = [];
      }

      bindServiceGrid(vm.grdServiceSrc);

      $("#service_modal").modal("show");

    }
  }

  // add new service
  $scope.addService = function () {
    const serviceID = $("#phoneServices").val();
    if (serviceID != -1) {
      const params = {
        Id: vm.selectedPersonPhoneId,
        Servicos: [
          {
            Id: serviceID
          }
        ]
      };

      FoneclubeService.postInsertServiceActive(params)
        .then(function (result) {
          // update grid
          if (result) {
            const service = vm.services.find(x => x.Id == serviceID);
            const dt = new Date();
            vm.grdServiceSrc.push({
              ServiceId: serviceID,
              ServiceName: service.Descricao,
              PersonPhoneId: vm.selectedPersonPhoneId,
              ActiveDate: dt.toISOString()
            });
            bindServiceGrid(vm.grdServiceSrc);
            const index = vm.grdMainSrc.findIndex(x => x.PersonPhoneId == vm.selectedPersonPhoneId);
            vm.grdMainSrc[index].PhoneServices = vm.grdServiceSrc;
          }
        })
        .catch(function (error) {
          // error case
          // console.log(error);
          showMessage('Something went wrong on adding service', false);
        });
    } else {
      // console.log("no service selected");
      showMessage('Please select the service', false);
    }
  }

  // remove service
  $scope.removeService = function (serviceId, personPhoneId, nodeId) {
    // console.log(serviceId, personPhoneId, nodeId);
    // show confirm dialog
    const params = {
      Id: personPhoneId,
      Servicos: [
        {
          Id: serviceId
        }
      ]
    };

    FoneclubeService.postIsertServiceDeactive(params)
      .then(function (result) {
        if (result) {
          showMessage('Service is successfully removed', true);
          const index = vm.grdMainSrc.findIndex(x => x.PersonPhoneId == personPhoneId);
          const service_index = vm.grdMainSrc[index].PhoneServices.findIndex(x => x.ServiceId == serviceId);
          if (service_index >= 0) {
            vm.grdMainSrc[index].PhoneServices.splice(service_index, 1);
            redrawGrid(nodeId);
          }
        } else {
          showMessage('Something went wrong in remove service', false);
        }
      })
      .catch(function (error) {
        showMessage('Something went wrong in remove service', false);
      });
  }

  // assign customer to phone
  // trigger on empty client clicked
  $scope.assignCustomer = function (personPhoneId, completePhone, nodeId) {
    vm.selectedPersonPhoneId = personPhoneId;
    vm.selectedNodeId = nodeId;
    // vm.selectedPhoneNumber = completePhone;
    vm.phone = vm.grdMainSrc.find(x => x.CompletePhone == completePhone);

    bindAssignGrid(vm.customers);
    $("#assign_modal").modal("show");
    if (vm.grdAssignOption.api) {
      vm.grdAssignOption.api.sizeColumnsToFit();
    }
  }

  // assign phone to customer
  $scope.assignPhoneToCustomer = function (PersonId) {
    const operatorId = $("#assign_operator").val();
    const planId = $("#assign_plan").val();
    const preco = $("#assign_preco").val() || 0;
    const apelido = $("#assign_apelido").val() || "";

    const dd = vm.phone.CompletePhone.substring(0, 2);
    const number = vm.phone.CompletePhone.substring(2);


    if (planId != -1 && operatorId != -1) {
      // assign phone to customer
      const param = {
        PersonId: PersonId,
        PlanId: planId,
        OperatorId: operatorId,
        DDNumber: dd,
        PhoneNumber: number,
        NickName: apelido,
        IsActive: true,
        IsPhoneClube: true,
        IsPrecoVip: false,
        AmountPrecoVip: preco
      }

      if (preco != 0) {
        param.IsPrecoVip = true;
      }

      FoneclubeService.postPhoneInsert(param)
        .then(function (result) {
          if (result) {
            showMessage('Phone is successfully assigned', true);
          }
        })
        .catch(function (error) {
          // console.log("error");
          showMessage('Failed in assign number', false);
        });

    } else {
      // show message for select Plan and Operator
      showMessage('Please select Plan or Operator', false);
    }
  }

  // add new phone to the customer
  // show add new phone dialog
  $scope.addNewPhone = function () {
    if (vm.customer.Id != -1 || vm.customers.Id == "-1") {
      vm.phoneMode = 1;
      $("#edit_title").html("Add Phone");

      $("#edit_preco").val("");
      $("#edit_apelido").val("");

      var operatorList = $("#edit_operator").data("kendoDropDownList");
      operatorList.value(-1);
      var planList = $("#edit_plan").data("kendoDropDownList");
      planList.value(-1);


      $("#edit_modal").modal("show");
    }
  }

  // update phone inforamtion
  $scope.savePhoneInfo = function () {
    const operatorId = $("#edit_operator").val();
    const planId = $("#edit_plan").val();
    const preco = $("#edit_preco").val() || 0;
    const apelido = $("#edit_apelido").val() || "";

    if (operatorId == -1 || planId == -1) {
      showMessage('Select Plan and Operator', true);
      return;
    }

    let phoneNumber = $("#edit_phone_list").val();
    const dd = phoneNumber.substring(0, 2);
    const number = phoneNumber.substring(2);

    const param = {
      PersonId: vm.customer.Id,
      PlanId: planId,
      OperatorId: operatorId,
      DDNumber: dd,
      PhoneNumber: number,
      NickName: apelido,
      IsActive: true,
      IsPhoneClube: true,
      IsPrecoVip: false,
      AmountPrecoVip: preco
    }

    if (preco != 0) {
      param.IsPrecoVip = true;
    }

    if (vm.phoneMode == 0) {
      // update phone info
      FoneclubeService.postUpdatePlanFoneclube(param)
        .then(result => {
          if (result) {
            showMessage('Phone is successfully updated', true);
          } else {
            showMessage('Something went wrong with update Phone', false);
          }
        })
        .catch(error => {
          showMessage('Something went wrong with update Phone', false);
        });

    } else {
      // create assign info

      FoneclubeService.postPhoneInsert(param)
        .then(result => {
          if (result) {
            // console.log("success");
            showMessage('Phone is successfully added to the customer', true);
            this.refreshPage();
          } else {
            showMessage('Something went wrong with adding number', false);
            console.log('insert false');
          }
        })
        .catch(error => {
          console.log(error);
          showMessage('Something went wrong with adding number', false);
        });
    }

    $("#edit_modal").modal("hide");
  }

  // functions in grid
  $scope.showCustomerDetail = function (personPhoneId) {
    const phone = vm.grdMainSrc.find(x => x.PersonPhoneId == personPhoneId);
    if (phone) {
      vm.phone = phone;
      const customer = vm.customers.find(x => x.Id == phone.PersonId);
      if (customer) {
        vm.customer = customer;
      } else {
        resetCustomer();
      }
    }
    vm.phoneMode = 0;
    $("#edit_title").html("Edit Phone");
    $("#edit_phone_input").val(vm.phone.CompletePhone);
    $("#edit_preco").val(vm.phone.CalculatePlanCost);
    $("#edit_apelido").val(vm.phone.NickName);

    var operatorList = $("#edit_operator").data("kendoDropDownList");
    operatorList.value(vm.phone.OperatorId);
    var planList = $("#edit_plan").data("kendoDropDownList");
    planList.value(vm.phone.PlanId);

    $("#edit_modal").modal("show");
  }

  // click to copy text
  $scope.copyToClip = function (str) {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showMessage('Text is copied', true);
  }

  // refresh total linhas
  $scope.refreshTotalLinhas = async function () {
    if (vm.customer.Id != -1) {
      vm.total_linhas = await FoneclubeService.getTotalLinhas(vm.customer.Id)
        .then(function (result) {
          //vm.total_linhas = result;
          return result;
        })
        .catch(function (error) {
          // vm.total_linhas = 0;
          return 0;
        });
    }
  }

  // update preco unico
  $scope.updatePrecoUnico = function () {
    if (vm.customer.Id != -1) {
      const v = $("#preco_unico").val();
      if (v != '') {
        const params = {
          Id: vm.customer.Id,
          SinglePrice: v,
        }
        FoneclubeService.postUpdatePhonePrice(params)
          .then(function (result) {
            // console.log(result);
            showMessage('Successfully update the Preco Unico', true);
          })
          .catch(function (error) {
            showMessage('Something went wrong with update Preco', false);
          });
      }
    }
  }


  // inner funciton
  // bind main grid
  function bindMainGrid(data) {
    if (vm.grdMainOption.api) {
      vm.grdMainOption.api.setRowData(data);
    } else {
      updateMainGrid = true;
    }
  }

  // bind service grid
  function bindServiceGrid(data) {
    if (vm.grdServiceOption.api) {
      vm.grdServiceOption.api.setRowData(data);
    } else {
      updateServiceGrid = true;
    }
  }

  function bindCustomerFilterDropdown() {
    var el = $('#customer-filter');
    if (el) {
      el.kendoDropDownList({
        index: 0,
        optionLabel: { Name: 'All', Id: -1 },
        dataTextField: 'Name',
        dataValueField: 'Id',
        dataSource: vm.customers,
        filter: true,
        filtering: function (ev) {
          const filterValue = ev.filter !== undefined ? ev.filter.value : "";
          ev.preventDefault();

          this.dataSource.filter({
            logic: 'or',
            filters: [
              {
                field: 'Name',
                operator: function (item, value) {
                  return MainUtils.checkContains(item, value);
                },
                value: filterValue
              },
              {
                field: 'Email',
                operator: function (item, value) {
                  return MainUtils.checkContains(item, value);
                },
                value: filterValue
              },
              {
                field: 'NickName',
                operator: function (item, value) {
                  return MainUtils.checkContains(item, value);
                },
                value: filterValue
              }
            ]
          });
        },
        change: onChangeCustomer
      });
    }
  }

  function bindServiceDropdown(data) {
    $("#phoneServices").kendoDropDownList({
      optionLabel: { Descricao: "Choose service", Id: -1 },
      dataTextField: "Descricao",
      dataValueField: "Id",
      dataSource: data
    });
  }

  function bindPlanDropdown(data) {
    $("#assign_plan").kendoDropDownList({
      optionLabel: { Description: "Choose plan", Id: -1 },
      dataTextField: "Description",
      dataValueField: "Id",
      dataSource: data
    });

    $("#edit_plan").kendoDropDownList({
      optionLabel: { Description: "Choose plan", Id: -1 },
      dataTextField: "Description",
      dataValueField: "Id",
      dataSource: data
    });
  }

  function bindFreePhoneDropdown(data) {
    $("#edit_phone_list").kendoDropDownList({
      optionLabel: { CompletePhone: "New Phone" },
      dataTextField: "CompletePhone",
      dataValueField: "CompletePhone",
      dataSource: data,
      filter: true,
      change: function () {
        const ID = $("#edit_phone_list").val();
        if (ID == "New Phone") {
          vm.phoneMode = 1;
        } else {
          vm.phoneMode = 2;
        }
        $scope.$apply();
      }
    });
  }

  function bindOperatorDropdown(data) {
    $("#assign_operator").kendoDropDownList({
      optionLabel: { Name: "Choose operator", Id: -1 },
      dataTextField: "Name",
      dataValueField: "Id",
      dataSource: data
    });

    $("#edit_operator").kendoDropDownList({
      optionLabel: { Name: "Choose operator", Id: -1 },
      dataTextField: "Name",
      dataValueField: "Id",
      dataSource: data
    });
  }

  function bindAssignGrid(data) {
    if (vm.grdAssignOption.api) {
      vm.grdAssignOption.api.setRowData(data);
    } else {
      updateAssignGrid = true;
    }
  }

  // select name from top list
  // trigger when 
  function onChangeCustomer() {
    const Id = $("#customer-filter").val();
    if (Id == "-1") {
      bindMainGrid(vm.grdMainSrc);
    } else {
      const data = vm.grdMainSrc.filter(x => x.PersonId == Id);
      bindMainGrid(data);
    }
    bindDetails(Id);
  }
  // show details
  async function bindDetails(ID) {
    if (ID == "-1") {
      vm.detail_phone = '';
      vm.detail_email = '';
      vm.detail_cpf = '';
      vm.detail_nomePai = '';
      vm.detail_atualize = '';
      vm.detail_cep = '';
      vm.detail_rua = '';
      vm.detail_numero = '';
      vm.detail_complemento = '';
      vm.detail_bairro = '';
      vm.detail_cidade = '';
      vm.detail_estado = '';
      resetCustomer();
    } else {
      const customer = vm.customers.find(x => x.Id == ID);
      if (customer) {
        let data = customer;
        if (customer.fullData) {
          data = customer.fullData;
        }
        if (customer.phone) {
          vm.detail_phone = MainUtils.toDisplayPhoneNumber(customer.phone);
        } else if (customer.Phones && customer.Phones.length > 0) {
          const phone = customer.Phones.find(x => x.IsFoneclube == false);
          if (phone) {
            vm.detail_phone = MainUtils.toDisplayPhoneNumber(phone.DDD + phone.Number);
          }
        } else {
          vm.detail_phone = "";
        }

        vm.customer = data;
        await $scope.refreshTotalLinhas();
        $("#preco_unico").val('');


        const address = data.Adresses != null && data.Adresses.length > 0 ? data.Adresses[0] : null;
        vm.detail_email = customer.Email;
        vm.detail_cpf = '';
        vm.detail_nomePai = data.Pai != null ? data.Pai.Name : '';
        vm.detail_atualize = '';
        vm.detail_cep = address != null ? address.Cep : '';
        vm.detail_rua = address != null ? address.Street : '';
        vm.detail_numero = address != null ? address.StreetNumber : '';
        vm.detail_complemento = address != null ? address.Complement : '';
        vm.detail_bairro = address != null ? address.Neighborhood : '';
        vm.detail_cidade = address != null ? address.City : '';
        vm.detail_estado = address != null ? address.State : '';

        $scope.$apply();
      } else {
        // in case for customer not found
      }

    }
  }

  function resetCustomer() {
    vm.customer = {
      Id: -1,
      Name: "",
      DocumentNumber: "",
      Email: "",
      NickName: "",
      Parent: ""
    }
    vm.total_linhas = 0;
    $("#preco_unico").val('');
  }

  function showMessage(message, success) {
    if (success) {
      notify({
        message: message,
        duration: 3000,
        position: 'right',
        classes: 'alert-success'
      });
    } else {
      notify({
        message: message,
        duration: 3000,
        position: 'right',
        classes: 'alert-danger'
      });
    }
  }

  function redrawGrid(rowIndex) {
    var row = vm.grdMainOption.api.getDisplayedRowAtIndex(rowIndex);
    var rows = [];
    rows.push(row);

    vm.grdMainOption.api.redrawRows({ rowNodes: rows });
    vm.grdMainOption.api.resetRowHeights();
  }
};