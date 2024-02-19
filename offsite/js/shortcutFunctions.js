var cashierFnList = [
	"13 - AVAIL. COMMANDS RPT.",
	"400 - PRINT HEADER ON RCPT",
	"300 - PRINT OFFLINE TRANSACTIONS REPORT",
	"555 - Check POSS Ver",
	"600 - RETURN TO SALE MODE",
	"601 - SET RETURN MODE",
	"401 - PRINT TRAILER ON RCPT",
	"801 - INQUIRY MARKETING VOUCHER" // INHOUSE VOUCHER 2017-04-13
];


var informationCashierFnList = [
	"13 - AVAIL. COMMANDS RPT.",
	"400 - PRINT HEADER ON RCPT",
	"300 - PRINT OFFLINE TRANSACTIONS REPORT",
	"555 - Check POSS Ver",
	"600 - RETURN TO SALE MODE",
	"601 -SET RETURN MODE",
	"401 - PRINT TRAILER ON RCPT",
	"801 - INQUIRY MARKETING VOUCHER" // INHOUSE VOUCHER 2017-04-13
];

var cashierSupervisorFnList = [
	"13 - AVAIL. COMMANDS RPT.",
	"300 - PRINT OFFLINE TRANSACTIONS REPORT",
	"503 - TEST MACRO 3 - skip",
	"44 - SWITCH ONLINE - skip",
	"100 - TERMINAL X REPORT",
	"102 - ACCOUNTABILITY RPT",
	"103 - CASHIER X REPORT",
	"108 - CASHIER DEPTSTORE REPORT",
	"105 - MEDIA FLASH REPORT",
	"200 - FORCE SIGN OFF",
	"444 - TOGGLE TILL ON/OFF",
	"445 - TOGGLE REDUCED PRINT",
	"45 - CLIENT STATUS REPORT",
	"510 - Open Cash Drawer",
	"522 - Do Not Check Online",
	"555 - Check POSS Ver",
	"600 - RETURN TO SALE MODE",
	"601 - SET RETURN MODE",
	"700 - Training Mode",
	"7003 - NO SALE",
	"7006 - PICK UP",
	"800 - SET/UNSET REKEY MODE",
	"900 - LOAD ALL DDB FILES",
	"901 - LOAD NEW DDB FILE",
];

var cashierManagerFnList = [
	"13 - AVAIL. COMMANDS RPT.",
	"300 - PRINT OFFLINE TRANSACTIONS REPORT",
	"700 - Training Mode",
	"500 - TEST MACRO 1",
	"522 - Do Not Check Online",
	"503 - TEST MACRO 3",
	"555 - Check POSS Ver",
	"600 - RETURN TO SALE MODE",
	"44 - SWITCH ONLINE",
	"601 - SET RETURN MODE",
	"100 - TERMINAL X REPORT",
	"961 - Reset PIN Sign off",
	"101 - TERMINAL Z REPORT",
	"45 - CLIENT STATUS REPORT",
	"102 - ACCOUNTABILITY RPT",
	"444 - TOGGLE TILL ON/OFF",
	"103 - CASHIER X REPORT",
	"108 - CASHIER DEPTSTORE REPORT",
	"104 - CASHIER Z REPORTS",
	"800 - SET/UNSET REKEY MODE",
	"105 - MEDIA FLASH REPORT",
	"200 - FORCE SIGN OFF",
	"900 - LOAD ALL DDB FILES",
	"901 - LOAD NEW DDB FILE",
	"445 - TOGGLE REDUCED PRINT",
	"999 - SHUTDOWN POS",
	"510 - Open Cash Drawer",
	"7003 - NO SALE",
	"7006 - PICK UP"
];

// import { updateDataProductUPC } from 'poss\proxyserver.js';
// const proxyServer = require('poss\proxyserver.js')
var forceSignOffFlag = false;
var isTrainingModeOn = false;
var fn103 = false;

var cashierReport = {
		DEFAULT : "DEFAULT",
		BILL_PAYMENT : "BILL_PAYMENT"
}

function executeShortcutFunction(fnNum) {
	// TODO : execute function specific to role only, for the meantime just
	// allow it(User-Role implementation not yet finished)

	if (fnNum === "13")
		showFunctionList();
	else if (fnNum === "103")
		executeCashierXReport(cashierReport.DEFAULT);
	else if (fnNum === "104")
		executeCashierXReport(cashierReport.BILL_PAYMENT);
	else if (fnNum === "108")
		executeCashierDeptstoreReport(cashierReport.DEFAULT);
	else if (fnNum === "151")
		executeForceShutdown();
	else if (fnNum === "200")
		authenticateForceSignOff();
	else if (fnNum === "300")
		printOfflineTransactionsReport();
	else if (fnNum === "400")
		printRcptHeaderOnReceipt();
	else if (fnNum === "401")
		printRcptTrailerOnReceipt();
	else if (fnNum === "555")
		showProjectVersion();
	else if (fnNum === "666")
		showTerminalConf();
	// else if (fnNum === "999")
	// 	updateDataProductUPC();
	else if (fnNum === "700")
		isValidForTrainingMode() ? activateTrainingMode(fnNum) : showTrainingModeNotAllowedMsg();
	else if (fnNum === "800")
		isValidForTrainingMode() ? activateTrainingMode(fnNum) : showTrainingModeNotAllowedMsg();
	else if (fnNum === "801") // INHOUSE VOUCHER 2017-04-13
	{
		$('#depstore-voucher-dialog').data('mode', 'inquiry').dialog('open');
		$("#function-dialog").dialog("close");
	} // INHOUSE VOUCHER 2017-04-13
	else
		dispalyFuncSearchResult("NOT YET IMPLEMENTED.");
}

function dispalyFuncSearchResult(display) {
	$("#function-dialog #functionResultSpan").empty();
	$("#function-dialog #functionResultSpan").html(display);
	$("#function-dialog #functionResultDiv").show();
	$("#function-dialog #functionSearchDiv").hide();
}

/*************************************
 * SHORTCUT FUNCTIONS START
 *************************************/
function showFunctionList() {
	var sb = new StringBuilder("");

	// TODO : check first the role of the user before assinging list of functions.
	cashierFnList.forEach(function(key) {
		sb.append(key);
		sb.append("<br/>");
	});

	dispalyFuncSearchResult(sb.toString());
}

function executeCashierXReport(reportType){
	fn103 = true;
	
	var authenticationDeferred = $.Deferred();
	$("#authentication-form").removeData(AUTH_DATA_KEYS)
							 .data('roles', ['ROLE_SUPERVISOR'])
							 .data('defer', authenticationDeferred)
							 .dialog("option", "title", "Supervisor Authentication")
							 .dialog("open");

	authenticationDeferred.done(function() {
		printCashierXReport(reportType);
	});
}

function printCashierXReport(reportType) {
	var cashierXReportData = $.ajax({
		url : posWebContextPath + "/cashier/getCashierXReportData/" + reportType + "/" + loggedInUsername,
		type : "GET",
		async : false,
		error : function(jqXHR, status, error) {
			$("#function-dialog").dialog("close");
			if(error == 'SERVER_OFFLINE') {
				showMsgDialog('SERVER OFFLINE', "error");
			} else {
				showMsgDialog('Error: ' + error, "error");
			}
		}
	}).responseText;

	if(cashierXReportData) {
			printReceipt({
				summary : createCashierXReport(JSON.parse(cashierXReportData)),
				footer : setReceiptFooter(saleTx),
				mktInfo   : setReceiptMarketingPromoInfo (saleTx),
				isQueued : true
			});

			$("#function-dialog").dialog("close");
	}
}

function executeCashierDeptstoreReport(reportType){
	fn108 = true;
	
	var authenticationDeferred = $.Deferred();
	$("#authentication-form").removeData(AUTH_DATA_KEYS)
			.data('roles', ['ROLE_SUPERVISOR'])
			.data('defer', authenticationDeferred)
			.dialog("option", "title", "Supervisor Authentication")
			.dialog("open");

	authenticationDeferred.done(function() {
		$("#depstore-class-dialog").dialog('open');
	});
}

function printCashierDepstoreReport(reportType) {
	var cashierDepstoreReportData = $.ajax({
		url : posWebContextPath + "/cashier/getCashierDeptstoreReportData/" + reportType + "/" + loggedInUsername,
		type : "GET",
		async : false,
		error : function(jqXHR, status, error) {
			$("#function-dialog").dialog("close");
			if(error == 'SERVER_OFFLINE') {
				showMsgDialog('SERVER OFFLINE', "error");
			} else {
				showMsgDialog('Error: ' + error, "error");
			}
		}
	}).responseText;

	if(cashierDepstoreReportData) {
			printReceipt({
				summary : createCashierDepstoreReport(JSON.parse(cashierDepstoreReportData)),
				footer : setReceiptFooter(saleTx),
				mktInfo   : setReceiptMarketingPromoInfo (saleTx)
			});

			$("#function-dialog").dialog("close");
	}
}

function authenticateForceSignOff() {
	if (connectionOnline) {
		forceSignOffFlag = true;
		var defer = $.Deferred();
		$("#function-dialog").dialog("close");
		$("#authentication-form").removeData(AUTH_DATA_KEYS)
								 .data  ('roles', ['ROLE_SUPERVISOR', 'ROLE_CASHIER_CANCELLATION'])
								 .data  ('defer', defer)
								 .dialog("open");
		/*
		 * JQuery Deffered, used for chaining callbacks
		 * @author http://api.jquery.com/jQuery.Deferred/
		 */
		defer.promise()
			 .done(function(){
			/*
			 * Display items in customer page
			 *
			 * Displays the "NEXT CASHIER PLEASE"
			 * Triggered by 2nd argument.
			 */
			changeCustomerActiveScreen(
					CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.NEXT_CASHIER
		    );
		});
	} else {
		$("#function-dialog").dialog("close");
		showMsgDialog(getMsgValue("pos_warning_offline_force_sign_off_not_allowed"),"warning");
	}
}

function executeForceSignOff(supervisorInterventionData) {
	$.ajax({
		url      : posWebContextPath + "/sys/forceSignOff/" + configuration.macAddress,
		type     : "POST",
		async    : false,
		dataType : "json",
		contentType : "application/json",
		data     : JSON.stringify(supervisorInterventionData),
		success  : function(response) {
			forceSignOffFlag = false;
			location.href = posWebContextPath + "/resources/j_spring_security_logout";
			//sign-off open Cashier Drawer
			DrawerModule.openDrawerOnLogout();

		},
		error : function(jqXHR, status, error) {
			showMsgDialog('Error: ' + error,"error");
		}
	});
}

// function updateDataProductUPC() {
//     fs.exists(txtDir + '/UPC_PRODUCT.DAT',
//     function(exists) {
//         if (exists) {
//             console.log("Attempting to get Product Updates");
//             var productUpd = fs.readFileSync(txtDir + '/UPC_PRODUCT.DAT').toString().split("\n");
//             var productIdToUpdate = productUpd[9];
//             var indexProducttoUpdate = productList.findIndex(prodArr[1] === productIdToUpdate);
//                 if (indexProducttoUpdate !== -1) {
//                     productList[indexProducttoUpdate] = productUpd;
//                 }
//         }
//     }
//   );
// }

function printRcptHeaderOnReceipt() {
	printReceipt({
		header: setReceiptHeader(),
		footer: setReceiptFooter(),
		mktInfo   : setReceiptMarketingPromoInfo (saleTx)
	});
	$("#function-dialog").dialog("close");
}

function printRcptTrailerOnReceipt() {
	var footer = new Array();
	footer.push(new PrintBlock(RECEIPT_POS_CENTERED, getConfigValue('RECEIPT_CARREFOUR_WEBSITE')));
	footer.push(new PrintBlock(RECEIPT_POS_CENTERED, getConfigValue('RECEIPT_CARREFOUR_FACEBOOK')));
	footer.push(new PrintBlock(RECEIPT_POS_CENTERED, getConfigValue('RECEIPT_CARREFOUR_TWITTER')));
	printReceipt({ footer: footer });
	$("#function-dialog").dialog("close");
}

function showProjectVersion() {
	var output = "Version : " + appBuildVersion;
	dispalyFuncSearchResult(output);
}

function authenticateTrainingMode() {
	$("#function-dialog").dialog("close");
	$("#authentication-form").removeData(AUTH_DATA_KEYS)
							 .data('roles', ['ROLE_SUPERVISOR'])
							 .data('trainingMode', true)
							 .dialog("open");
}

function activateTrainingMode(fnNum){

	if(fnNum === "700"){
		isTrainingModeOn ? showMsgDialog(getMsgValue("pos_cashier_training_mode_already_on_msg"),"warning") : authenticateTrainingMode();
	}else if(fnNum === "800"){
		isTrainingModeOn ? authenticateTrainingMode() : showMsgDialog(getMsgValue("pos_cashier_training_mode_not_on_msg"),"warning");
	}
}

function showTrainingModeNotAllowedMsg(){
	showMsgDialog(getMsgValue("pos_cashier_training_mode_not_allowed"),"warning");
}

function isValidForTrainingMode(){

	if(saleTx && ((saleTx.orderItems.length > 0 && saleTx.type == CONSTANTS.TX_TYPES.SALE.name) ||
			saleTx.type != CONSTANTS.TX_TYPES.SALE.name ||
			toggleRecallSale || togglePostVoid)){
		return false;
	}else{
		return true;
	}
}

// function updateDataProductUPC(){
// 	var deferred = $.ajax({
// 		url : 'http://localhost:8089/updateDataProductUPC',
// 		type : 'GET',
// 		dataType : "json",
// 		async : false
// 	});

// 	deferred.done(function(){
// 		// Show success message
// 		showMsgDialog(getMsgValue('pos_warning_print_offline_transaction_successful'), "info");
// 	});
// }

function printOfflineTransactionsReport(){
	var deferred = $.ajax({
		url : 'http://localhost:8089/printOfflineTransactionsReport',
		type : 'GET',
		dataType : "json",
		async : false
	});

	deferred.done(function(){
		// Show success message
		showMsgDialog(getMsgValue('pos_warning_print_offline_transaction_successful'), "info");
	});
	deferred.fail(function(){
		// Show error message
		showMsgDialog(getMsgValue('pos_error_print_offline_transaction'), "error");
	});
	deferred.always(function(){
		// Close function dialog box regardless of operation result
		$("#function-dialog").dialog("close");
	});
}

function executeForceShutdown(){
	if (hasScannedItem(saleTx)) {
		showKeyNotAllowedMsg();
	} else {
		var defer = $.Deferred();
		$("#authentication-form").removeData(AUTH_DATA_KEYS)
								 .data  ('roles', ['ROLE_SUPERVISOR'])
								 .data  ('interventionType',
										 CONSTANTS.TX_TYPES.FORCE_SHUTDOWN.name)
								 .data  ('defer',
										 defer)
								 .dialog("open");
		/*
		* JQuery Deffered, used for chaining callbacks
		* @author http://api.jquery.com/jQuery.Deferred/
		*/
		defer.promise()
			 .done(function(supervisorInterventionData){
			// Shutting down
            $.ajax({
				url : proxyUrl + "/forcePOSShutdown",
				type : "GET",
				async : false,
				success : function(
						response) {
					if (response.error) {
						showMsgDialog("Error shutting down POS Terminal.\n" + response.error, "error");
					}
				},
				error : function(jqXHR, status, error) {
					showMsgDialog(error, "error");
				}
			});
		});
	}
}

function showTerminalConf() {
	var newConfiguration = getSysConfig();
	
	configuration.properties = newConfiguration;
	
	dispalyFuncSearchResult(null);
	$("#function-dialog #functionResultTeks").html('<span id="functionSearchMsg" class="error-message">Data Configuration Success Update</span>');
}

function getSysConfig(){

	var respNewConfig = configuration.properties;

    $.ajax({
        url: posWebContextPath + "/cashier/getSysConfig/",
        type: "POST",
        async: false,
        dataType: "json",
        data : JSON.stringify({
            "macAddress": configuration.macAddress
        }),
        success: function(response) {
            if (response.properties) {
                respNewConfig = response.properties;
				updateSysConfig(response.properties);
            }
        }
    });
    return respNewConfig;
}

function JSONstringifyOrder(obj, space)
{
    var allKeys = [];
    var seen = {};
    JSON.stringify(obj, function (key, value) {
        if (!(key in seen)) {
            allKeys.push(key);
            seen[key] = null;
        }
        return value;
    });
    allKeys.sort();
    return JSON.stringify(obj, allKeys, space);
}

function updateSysConfig(data) {
    var isHTTPStatusOK = false;
    // do hit agent
    var data = $.ajax({
        url: "/updateSysConfig",
        type: "POST",
        async: false,
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify(data),
        success: function(data, status) {
            isHTTPStatusOK = true;
        },
        error: function(jqXHR, status, error) {
            console.log('[updateSysConfig] failed to call proxyserver.js - updateSysConfig');
        },
    }).responseText;

    if (isHTTPStatusOK) return JSON.parse(data);
    else return null;
}

/*************************************
 * SHORTCUT FUNCTIONS END
 *************************************/
