// Library/modules declarations
var printer = require('../devices/printer.js');
var configuration;
var moment = require('moment');
var array = require('array-extended');

// Constant values
const REPORT_DATE_FORMAT='YYYY-MM-DD HH:mm:ss';
const TRANSACTION_DATE_FORMAT='YYYY-MM-DD';

/**
 * @param res result object from proxyserver
 * @param type indicates the report type. Used call the method associated with the specific report type
 * @param data contains raw data from either database resource or request body
 * 
 * 
 */  
exports.print_doc = function(res, type, data){
	if(!configuration){
		configuration = global.configuration_poss;
	}
	console.log("type = " + type);
	switch (type){
		case 'OFFLINE_TRANSACTIONS':
			processOfflineTransactionsData(res, data);
			break;
		default : 
			console.log('Unknown report type');
			break;
	}
}

/**
 * 
 * @param res result object passed from print_doc to this method
 * @param offlineTransactions raw data to be used for processing
 * 
 * This method processes the raw data and converts it to format usable to the printer module.
 * This method passes a JSON with 'header' containing header details and
 * body which contains data to be printed in report
 */
function processOfflineTransactionsData(res, offlineTransactions){
	var offlineTransactionsToPrint = new Array();
	offlineTransactions.forEach(function(data){
		// Check if data is transaction
		if(data.value.type){
			var dataToPush = {
				transactionId : data.value.transactionId,
				transactionDate : moment(data.value.transactionDate).format(TRANSACTION_DATE_FORMAT),
				totalPayment: getTotalPayment(data),
				baseTransactionId : data.value.baseTransactionId
			};
			
			if(offlineTransactionsToPrint[data.value.type]){
				offlineTransactionsToPrint[data.value.type].push(dataToPush);
			} else {
				offlineTransactionsToPrint[data.value.type] = new Array();
				offlineTransactionsToPrint[data.value.type].push(dataToPush);
			}			
		} 
		// if data.value.type is undefined, it is not a transaction data. Could be feedback or top
		else {
			console.log('This data is not included in report');
		}

	});
	var reportToPrint = {
		header : [
		          '******************************************',
		          'Offline Transactions Report',
		          'Terminal No: ' + configuration.terminalCode,
		          'Store Code: ' + configuration.storeCode,
		          moment().format(REPORT_DATE_FORMAT),
		          '******************************************'
		],
		body: offlineTransactionsToPrint,
		footer: [
			'******************************************',
			'End of Offline Transactions Report',
			'******************************************',
		]
	};
	printer.print_report('OFFLINE_TRANSACTIONS', reportToPrint, res);
}


function numberWithCommas(x) {
	return (x ? Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","):"0");
}

function getTotalPayment(data){
	var totalPayments = 0;
	switch(data.value.type){
		// FOR Return and Refund transaction types, total payments must be negative
		case 'RETURN':
		case 'REFUND':
			totalPayments = array(array.pluck(data.value.payments, "amountPaid")).sum().value();
			return numberWithCommas((totalPayments + Math.abs(data.value.roundingAmount) +  Math.abs(data.value.cpnIntAmount)) * -1) 
		// For voided (i.e., Post sale void) transactions, we compute the total payment from supervisor intervention object
		case 'VOID':
			var voidAmount = 0;
			data.value.supervisorInterventions.forEach(function(intervention){
				if(intervention.interventionType === "POST SALE VOID"){
					// Use absolute values of rounding amount and cpm amount avoid miscalculation because of inconsistent negative sign of values
					voidAmount += (intervention.amount - Math.abs(data.value.roundingAmount) - Math.abs(data.value.cpnIntAmount));
				}
			});
			return numberWithCommas(voidAmount);
		// For sale and other transaction types, total payments should be positive
		case 'SALE':
			totalPayments = array(array.pluck(data.value.payments, "amountPaid")).sum().value();
			return numberWithCommas(totalPayments + Math.abs(data.value.roundingAmount) +  Math.abs(data.value.cpnIntAmount)) 
		default : 
			if(data.value.payments){
				totalPayments = array(array.pluck(data.value.payments, "amountPaid")).sum().value();
				return numberWithCommas(totalPayments + Math.abs(data.value.roundingAmount) +  Math.abs(data.value.cpnIntAmount)) 
			}
			else 
				return '0;'
	}
}