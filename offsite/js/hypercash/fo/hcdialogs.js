//Hypercash pop-up dialog declarations

$("#returnInfo-dialog").dialog({
	width : 400,
	height : 300,
	resizable : false,
	draggable : false,
	modal : true,
	autoOpen : false,
	closeOnEscape : false,
	dialogClass : "no-close",
	open : function(event, ui) {
		$("#returnNoteTxnNoError").empty();
		$("#returnNoteTxnNoInput").val("");
	},
	buttons : {
		Cancel : function() {
			clearInputDisplay();
			saleTx.type = CONSTANTS.TX_TYPES.SALE.name;
			displayTransactionType('');
			$(this).dialog("close");
		},
		OK : function() {
			var thisDialog = $(this);
			var txnNo = $("#returnNoteTxnNoInput").val();
			var errorMessage = null;

			if (!txnNo) {
				errorMessage = 'ENTRY REQUIRED';
			} else if (txnNo.length == 10) {
				txnNo = configuration.storeCode + txnNo;
				$("#returnNoteTxnNoInput").val(txnNo);
			} else if (txnNo.length != 17) {
				/* Blocked setting of error message when tx no length is less 15
				errorMessage = 'INVALID TRANSACTION NO.';
				*/
			}

			if (!errorMessage) {
				$.ajax({
					url : posWebContextPath + "/cashier/returnNote/" + txnNo + "/"+profCust.customerNumber,
					type : "GET",
					async : false,
					success : function(returnNote) {
						if (!jQuery.isEmptyObject(returnNote) && !returnNote.error) {
							profCust.returnNote = returnNote;
							saleTx.returnNoteNo = returnNote.returnNoteNumber;
							saleTx.baseTransactionId = txnNo;
							$("#returnNoteTxnNoInput").val('');
							thisDialog.dialog("close");
						}
						else {
							$("#returnNoteTxnNoError").html(returnNote.error);
						}
					},
					error : function(jqXHR, status, error) {
						thisDialog.dialog("close");
						showMsgDialog(getMsgValue('return_note_print_internal_server_error'), "error");
					},
				});
			} else {
				$("#returnNoteTxnNoError").empty();
				$("#returnNoteTxnNoError").append(errorMessage);
			}
		}
	}
});

$("#returnNoteTxnNoInput").keyboard({
    display: numberDisplay2,
    layout: 'custom',
    customLayout: customNumberLayout2,
    maxLength : 17,
    change : function(e, keyboard, el){
    	$("#invReprintTxnNoError").empty();
    }
});

$("#refundInfo-dialog").dialog({
	width : 400,
	height : 300,
	resizable : false,
	draggable : false,
	modal : true,
	autoOpen : false,
	closeOnEscape : false,
	dialogClass : "no-close",
	open : function(event, ui) {
		$("#refundTxnNoError").empty();
		$("#refundTxnNoInput").val("");
	},
	buttons : {
		Cancel : function() {
			clearInputDisplay();
			saleTx.type = CONSTANTS.TX_TYPES.SALE.name;
			displayTransactionType('');
			$(this).dialog("close");
		},
		OK : function() {
			var thisDialog = $(this);
			var txnNo = $("#refundTxnNoInput").val();
			var errorMessage = null;

			if (!txnNo) {
				errorMessage = 'ENTRY REQUIRED';
			} else if (txnNo.length == 10) {
				txnNo = configuration.storeCode + txnNo;
				$("#refundTxnNoInput").val(txnNo);
			} else if (txnNo.length != 17) {
				/* Blocked setting of error message when tx no length is less 15
				errorMessage = 'INVALID TRANSACTION NO.';
				*/
			}

			if(!errorMessage){
				$.ajax({
					url : posWebContextPath + "/cashier/getRefundableTx/" + txnNo + "/"+profCust.customerNumber,
					type : "GET",
					async : false,
					success : function(posTxn) {
						if (!jQuery.isEmptyObject(posTxn) && !posTxn.error) {
							saleTx.baseTransactionId = txnNo;
							$("#refundTxnNoInput").val('');
							thisDialog.dialog("close");
						}
						else {
							$("#refundTxnNoError").html(posTxn.error);
						}
					},
					error : function(jqXHR, status, error) {
						thisDialog.dialog("close");
						showMsgDialog(getMsgValue('salestx_notfound_internal_server_error'), "error");
					},
				});
			}else{
				$("#refundTxnNoError").empty();
				$("#refundTxnNoError").append(errorMessage);
			}
		}
	}
});

$("#refundTxnNoInput").keyboard({
    display: numberDisplay2,
    layout: 'custom',
    customLayout: customNumberLayout2,
    maxLength : 17,
    change : function(e, keyboard, el){
    	$("#invReprintTxnNoError").empty();
    }
});

$("#invReprintTxnNoInput").keyboard({
    display: numberDisplay2,
    layout: 'custom',
    customLayout: customNumberLayout2,
    maxLength : 17,
    change : function(e, keyboard, el){
    	$("#invReprintTxnNoError").empty();
    }
});

$("#invReprintTxnNoInput").change(function() {
	resetReprintInvoiceDialog();

	var txnId = $("#invReprintTxnNoInput").val();

	if (txnId.length == 0) {
		return;
	} else if (txnId.length == 10) {
		txnId = configuration.storeCode + txnId;
		$("#invReprintTxnNoInput").val(txnId);
	} else 	if (txnId.length != 17) {
		$("#invReprintTxnNoError").text("INVALID TRANSACTION NO.");
		return;
	}

	Hypercash.ajax.findTaxInvoiceByTxnId(txnId, function(data) {
        if (data && data.error) {
          	$("#invReprintTxnNoError").text(data.error);
        } else {
          	Hypercash.drawer.renderTaxInvoiceToReprintSearchResult($("#reprintTaxInvoiceResult > tbody"), data);

          	$("#reprintTaxInvoiceResult").show();
		  	$("input:radio[name=reprintSearchTransactionNumber]:first").attr('checked', true);
        }
	}, function(jqXHR, status, error) {
		$("#invReprintTxnNoError").text(getMsgValue('tax_invoice_not_found_internal_server_error'));
	});
});

/*
 * Sets the data to be supplied to tax invoice.
 * @params seqNum - tax invoice sequence numbers.
 * @params statusCode - status code of the txn.
 */
function setInvoiceDetails(seqNum, statusCode) {
	if(profCust == null){
		profCust = {};
	}
	profCust.printInvoice = true;
	saleTx.taxInvoice = {
			invoiceNumber : seqNum,
			statusCode : statusCode,
			customerNumber : profCust.customerNumber,
			businessName : profCust.businessName,
			customerName : profCust.customerName,
			customerPhone : profCust.customerPhone,
			taxId : profCust.taxId,
			taxName : profCust.taxName,
			taxAddress : profCust.taxAddress,
			ktpId : profCust.ktpId,
			txnCode : profCust.txnCode,
			issuerId : saleTx.userName,
			dateIssued : new Date(),
			memberType : profCust.memberType
	};
}

$("#taxInvoiceSignatory-dialog").dialog({
	width : 410,
	height : 250,
	resizable : false,
	draggable : false,
	modal : true,
	autoOpen : false,
	closeOnEscape : false,
	dialogClass : "no-close",
	open : function(event, ui) {
		var thisDialog = $(this);
		$.ajax({
			url : posWebContextPath + "/cashier/taxInvoiceSignatories",
			type : "GET",
			async : false,
			dataType : "json",
			contentType : 'application/json',
			accept: 'application/json;charset=UTF-8',
			success : function(employees) {
				var lastSignatoryId = Hypercash.service.getLastSignatoryId();
				var select = $("#signatoryMgr");
                select.children().remove();
                if (employees) {
                    $(employees).each(function(index, item) {
                    	var fullName = item.givenName ? item.givenName : '';
                        fullName += item.middleName ? (' ' + item.middleName) : '';
                    	fullName += item.lastName ? (' ' + item.lastName) : '';
                        select.append($("<option>").val(item.id).text(fullName));
                        
                        if (lastSignatoryId.trim() == "" && item.userProfile == CONSTANTS.USER_PROFILE.CASHIER_HEAD) {
                        	lastSignatoryId = item.id;
                        }
                    });
                    
                    select.val(lastSignatoryId);
                }
			},
			error : function(jqXHR, status, error) {
				//TODO handle this properly. Should the user be asked if he wants to proceed without invoice printout? If not, then execute Cancel sale.
				profCust.printInvoice = false;
				delete saleTx.taxInvoice; //TODO
				thisDialog.dialog("close");
				showMsgDialog(getMsgValue('tax_invoice_print_internal_server_error'), "error");
			},
		});
	},
	buttons : {
		OK : function() {
				signatoryId = $("#signatoryMgr").val();
				signatoryFullName = $('#signatoryMgr option:selected').text();
				if(signatoryFullName) {
					var thisDialog = $(this);
					var statusCode = $(this).data("statusCode");
					$.ajax({
						url : posWebContextPath + "/hypercash/hypercashsequence/taxInvoiceNumber/" + statusCode + '/' + profCust.txnCode,
						type : "GET",
						async : false,
						success : function(invoiceNumber) {
							uilog('DBUG','response: ' + JSON.stringify(invoiceNumber));
							profCust.printInvoice = true;
							setInvoiceDetails(invoiceNumber.seqNum, statusCode);
							saleTx.taxInvoice.signatoryId = signatoryId;
							saleTx.taxInvoice.signatoryFullName = signatoryFullName;
							Hypercash.lastSignatoryId = signatoryId;
							
							if (invoiceNumber.error) {
								uilog("DBUG", invoiceNumber.error);
								var errorInvoiceNumber = '';
								if(invoiceNumber.error == 'invoice_sequence_max_reached_warning'){
									errorInvoiceNumber = getMsgValue(invoiceNumber.error).format(invoiceNumber.totalAvailable);
								} else if (invoiceNumber.error == 'no_available_tax_invoice_seq'){
									errorInvoiceNumber = getMsgValue(invoiceNumber.error);
									isTaxInvSeqAvailable = false;
								}
								
								showMsgDialog(errorInvoiceNumber, "warning", function(){
									//Disable profCustomer button and change its css class to 'disabled-button-menu' class
									if(invoiceNumber.totalAvailable == '0'){
									    $("#proCustomer").attr('class','disabled-button-menu').attr('disabled', true);
									}
									setInvoiceDetails(invoiceNumber.seqNum, statusCode);
								});
							}
							
							thisDialog.dialog("close");
						},
						error : function(jqXHR, status, error) {
							//TODO handle this properly. Should the user be asked if he wants to proceed without invoice printout? If not, then execute Cancel sale.
							thisDialog.dialog("close");
							showMsgDialog(getMsgValue('tax_invoice_print_internal_server_error'), "error");
						},
					});
					
					$(this).dialog("close");
				}
		}
	}
});

$("#taxInvoiceReprint-dialog").dialog({
	width : 685,
	height : 350,
	resizable : false,
	draggable : false,
	modal : true,
	autoOpen : false,
	closeOnEscape : false,
	dialogClass : "no-close",
	open : function(event, ui) {
		//$('#reprintTaxInvoiceList').click();
		$("#invReprintTxnNoInput").val("");
		resetReprintInvoiceDialog();

		//Hypercash.ajax.getTaxInvoiceToday($('#hypercashTaxInvoiceTodayTBody'),Hypercash.drawer.renderTaxInvoiceTodayList);
	},
	buttons : {
		"Cancel": function(event, ui) {
			$("#invReprintTxnNoInput").val("");
			resetReprintInvoiceDialog();
			
			$(this).dialog("close");
		},
		"Print" : performReprint
	},
	close: function(event, ui) {
		Hypercash.printInBigPrinter = null; //set to default
	}
});

$("#crmOffline-dialog").dialog({
	width: 410,
	height: 300,
	resizable: false,
	draggable: false,
	modal: true,
	autoOpen: false,
	closeOnEscape: false,
	dialogClass: "no-close",
	open: function(event, ui) {
		$("#crmMemberTypes").removeAttr("disabled");
		var accountId = $(this).data("accountId");

		$("#crmCustomerNumber").val(accountId);

		if (accountId == getConfigValue('HC_NON_MEMBER_DEF_CARDNO')) {
			$("#crmMemberTypes").val("INDIVIDUAL")
								.attr("disabled", "disabled");
		} else {
			//TODO: Remove NONMEMBER option from crmMemberTypes
		}
	},
	buttons: {
		Cancel: function() {
			$(this).dialog("close");
		},
		OK: function() {
			var accountId = $(this).data("accountId");
			CRMAccountModule.Hypercash.toggleCrmOfflineMode = true;

			//ask for supervisor intervention if not NONMEMBER id
			if (accountId != getConfigValue('HC_NON_MEMBER_DEF_CARDNO')) {				
				$("#authentication-form").removeData(AUTH_DATA_KEYS)
										 .data('roles', ['ROLE_SUPERVISOR'])
										 .dialog("option", "title", "Supervisor Authentication")
										 .dialog("open");
			} else {
				CRMAccountModule.Hypercash.postCRMOfflineModeFunction();
			}			
		}
	}
});

$('input[name=reprintSearchType]').change(function(){
	var reprintInputType = $(this).val();
	switch (reprintInputType) {
		case 'reprintTaxInvoiceTransactionId':
			$('#hypercashTaxInvoiceTodayContainer').hide();
			$('#hypercashReprintTransactionNumberContainer').show();
			break;
		case 'reprintTaxInvoiceList':
			$('#hypercashReprintTransactionNumberContainer').hide();
			$('#hypercashTaxInvoiceTodayContainer').show();
			break;
		default:
			$('#hypercashReprintTransactionNumberContainer').show();
			break;
			
	}
});

/*
 * Triggers the reprinting of the tax invoice.
 */
function performReprint() {
	var txnNo = $("#invReprintTxnNoInput").val();
	var cbTxnNo = $('input[name=reprintSearchTransactionNumber]:checked').val();
	var errorMessage = null;

	if (txnNo.length == 0) {
		errorMessage = "TRANSACTION NO. IS REQUIRED";
	} else if (!cbTxnNo) {
		return;
	}

	if (!errorMessage) {
		var defer = $.Deferred();
		$("#hcChoosePrinter-dialog").data('defer', defer)
									.dialog("open");

		/*
		 * JQuery Deffered, used for chaining callbacks
		 * @author http://api.jquery.com/jQuery.Deferred/
		 */
		defer.promise().done(function() {
			if (Hypercash.printInBigPrinter) { //prints in Epson printer
				Hypercash.ajax.printTaxInvoice(cbTxnNo, function(taxInvoice) {
					if (!jQuery.isEmptyObject(taxInvoice) && !taxInvoice.error) {
						$("#invReprintTxnNoInput").val("");
						$("#taxInvoiceReprint-dialog").dialog("close");
					} else {
						$("#invReprintTxnNoError").empty();
						$("#invReprintTxnNoError").append(taxInvoice.error);
					}
				}, function(jqXHR, status, error) {
					$("#taxInvoiceReprint-dialog").dialog("close");
					showMsgDialog(getMsgValue('tax_invoice_print_internal_server_error'), "error");
				});
			} else { //prints in thermal printer
				var txn = findTxnByTxnId(cbTxnNo);

				if (txn) {
					reprintReceiptDetails(txn, 0);
					$("#taxInvoiceReprint-dialog").dialog("close");
				} else {
					showMsgDialog(getMsgValue('tax_invoice_print_internal_server_error'), "error");
				}
			}			
		});
	} else {
		$("#invReprintTxnNoError").empty();
		$("#invReprintTxnNoError").append(errorMessage);
	}
}

/*
 * Returns the reprint pop-up dialog to default state.
 */
function resetReprintInvoiceDialog() {
	//$("#invReprintTxnNoInput").val("");
	$("#invReprintTxnNoError").empty();
	$("#reprintTaxInvoiceResult > tbody").html("");
	$("#reprintTaxInvoiceResult").hide();
}

$('#txtNonMemberCustomerName').keyboard({
	display: completeDisplay,
	layout: 'custom',
	customLayout: customCompleteLayout
});

$("#nonMemberInfo-dialog").dialog({
	width: 400,
	height: 300,
	resizable: false,
	draggable: false,
	modal: true,
	autoOpen: false,
	closeOnEscape: false,
	dialogClass: "no-close",
	open: function(event, ui) {
		resetNonMemberInfoDialog();
	},
	buttons: {
		Cancel: function(event, ui) {
			$(this).dialog("close");
		},
		OK: function() {
			var txtCustName = $("#txtNonMemberCustomerName").val();

			if (txtCustName.trim() != "") {
				profCust.customerName = txtCustName;

				// global function from cashier.js
				renderCustomerInfo(profCust.customerName, profCust.customerNumber);	

				resetNonMemberInfoDialog();
				$(this).dialog("close");
			} else {
				$("#nonMemberInfoError").text("Please enter customer information.");
			}
		}
	}
});

/*
 * Returns the non-member info pop-up dialog to default state.
 */
function resetNonMemberInfoDialog() {
	$("#txtNonMemberCustomerName").val("");
	$("#nonMemberInfoError").text("");
}

$("#hcChoosePrinter-dialog").dialog({
	width: 410,
	height: 200,
	resizable: false,
	draggable: false,
	modal: true,
	autoOpen: false,
	closeOnEscape: false,
	dialogClass: "no-close",
	open: function(event, ui) {
		$("#hcChoosePrinterContainer").html(getMsgValue("hypercash_choose_printer"));
	},
	buttons: {
		"Small Printer": function() {
			Hypercash.printInBigPrinter = false;
			$("#hcChoosePrinter-dialog").dialog("close");
		},
		"Big Printer": function() {
			Hypercash.printInBigPrinter = true;
			$("#hcChoosePrinter-dialog").dialog("close");
		}
	},
	close: function(event, ui) {
		var currDefer = $(this).data('defer');

		if (currDefer) {
			currDefer.resolve();
			$(this).data('defer', null);
		}
	}
});
