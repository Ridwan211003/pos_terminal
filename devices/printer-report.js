var printer = null;

const PAPER_FULL_CUT='\x1b\x69';
const PAPER_PART_CUT='\x1b\x6d';

/**
*	Function used to print reports of different type
*
*	@param reportToPrint contains data to be printed
*	@param type indicates the report type. Used to pick body printer for different type of reports
*	@param res response object to be used when sending back printer operation status
*/
exports.printReport = function printReport(reportToPrint, type, res, escPosPrinter){
	if(!printer){
		printer = escPosPrinter;
	}

	try {

		if(reportToPrint.header){
			printReportHeader(reportToPrint.header);
		}
			
		if(reportToPrint.body){
			if(type === 'OFFLINE_TRANSACTIONS')
				printOfflineTransactionsReportBody(type, reportToPrint.body)
		}
		if(reportToPrint.footer){
			printReportFooter(reportToPrint.footer);	
		}
		cutPrinterBottom();
		res.writeHead('200', 'OK', { 'Content-Type': 'application/json;charset=UTF-8' });
		res.end(null);
	} catch (err) {
		console.log(err.message);
		console.log("Unable to print receipt");
		res.writeHead('500', 'PRINT_REPORT_ERROR', { 'Content-Type': 'application/json;charset=UTF-8' });
		res.end(JSON.stringify({ status: 'Error encountered while printing report\n' + err.message}));
	}
}

/**
*	Generic function used to print report header
*	@param headerArray contains strings to be printed at separate lines each
*/
function printReportHeader(headerArray){
	// Prints currency and prints separator for receipt body
	headerArray.forEach(function(data){
		printer.printCentered(data);
	});
}


/**
*	Generic function used to print report footer
*	@param footerArray	array of Strings to be printed in footer section
*/
function printReportFooter(footerArray){
	// Prints footer
	footerArray.forEach(function(data){
		printer.printCentered(data);
	});
}

function printOfflineTransactionsReportBody(type, offlineTxns){
	// Get each key of offlineTxns data
	// Each key corresponds to one transaction type (e.g., SALE, VOID, RETURN, etc.)
	Object.keys(offlineTxns).forEach(function(key){
		// Print key as label
		printer.printLine(key);
		// For each data under the same key, print transactionId, transactionDate and totalPayment
		offlineTxns[key].forEach(function(data){
			printer.printLine(data.transactionId + '  ' + data.transactionDate + '  ' + data.totalPayment);
			if(data.baseTransactionId){
				printer.printCentered('Base Transaction: ' + data.baseTransactionId);
			}
		});
		printer.printCentered('\n');	
	});
}


function cutPrinterBottom() {
	printer.printCentered('\n');
	printer.printCentered('\n');
	printer.printCentered('\n');
	printer.printCentered('\n');
	printer.printCentered('\n');
	printer.printCommand(PAPER_FULL_CUT);
}

/**
*	This function will implement logging of reports either to console or to a specified journal
**/
exports.printReportTest = function printReportTest(){
	console.log('TODO: implement logging here for historical data');
}