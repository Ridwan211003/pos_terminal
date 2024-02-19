/**
 * Created by mperez@exist.com
 * Exist Global Inc.
 */
var environment = process.argv;
var Q = require('q');

var escpos = require('.././escpos/node-escpos');
var EscPosPrinter = escpos.EscPosPrinter;
//var config = require(".././config/config.js").getConnection();
var config = {};
var ejournal = require('../service/ejournal-logger.js');

//Printer Code Commands
var DRAWER_OPEN_STATUS = 0;
var DRAWER_CLOSE_STATUS = 1;
var DRAWER_CONNECTION_OFFSET = 3;
var DRAWER_ON_LINE = 0;
var DRAWER_STATUS_OFFSET = 2;
//var DRAWER_1_OPEN_CMD = "\x1b\x70\x00\x05\x05";
var DRAWER_1_OPEN_CMD = "\x1b\x70\x30\x40\x50";
var DRAWER_STATUS_CMD = "\x10\x04\x01";
var PAPER_FULL_CUT = '\x1b\x69';
var PAPER_PART_CUT = '\x1b\x6d';

var RECEIPT_FONT_DEFAULT_THERMAL = '\x1b\x21\x00';
var RECEIPT_FONT_DEFAULT_THERMAL_SMALL = '';


var RECEIPT_FONT_DEFAULT_NON_THERMAL = '\x1b\x21\x01';
var RECEIPT_FONT_BOLD = '\x1b\x21\x08';

//Messages
var DRAWER_OPEN = "Drawer is open.";
var DRAWER_CLOSE = "Drawer is close.";
var DRAWER_STATUS_CHECK_ERROR = "Unable to check drawer status.";
var DRAWER_STATUS_CHECK_SUCCESS = "Identified drawer status.";

//printer
var printer;
var printerUtil;
var printerQueue;

//printing status
var isPrinting = false;

/**
 * Connects
 * @param path
 */
function connect(cf, path, terminalConf) {
    console.log('Printer is ready.');
    console.log("Printer Port: " + path);
    printer = new EscPosPrinter(path);
    config = cf;

    if (config.device.printerType) {
        switch (config.device.printerType.toUpperCase()) {
            case 'HP':
                printer.setNewLineMode(false);
                RECEIPT_FONT_DEFAULT_THERMAL_SMALL = '\x1b\x33\x32\x1b\x16\x01\x1b\x4d\x01';
                break;
            default:
                printer.setNewLineMode(true);
                RECEIPT_FONT_DEFAULT_THERMAL_SMALL = '\x1b\x33\x30\x1b\x4d\x01';
        }
    } else {
        printer.setNewLineMode(true);
        RECEIPT_FONT_DEFAULT_THERMAL_SMALL = '\x1b\x33\x30\x1b\x4d\x01';
    }

    printerUtil = require('../service/printing/printer-util');
    printerQueue = require('../service/printing/printer-queue').init(config, terminalConf);
}

/**
 * Calls function to print receipt.
 * @param req
 *      the request - print request from client with post data
 * @param res
 *      the response - to be sent back to client;
 */
exports.printReceipt = function(req, res) {
    console.log('Printing Receipt.');
    var printStatus = "";
    var buffer = "";
    req.on('data', function(data) {
        try {
            buffer += data;
        } catch (err) {
            console.log(err);
        }
    });

    req.on('end', function() {
        try {
            //cloning
            var extend = require('util')._extend;

            // print order
            printCounter = 0;
            printTestCounter = 0;
            var parsedData = JSON.parse(buffer);

            //ejournal logging and server logging
            var parsedDataClone = extend({}, parsedData);
            ejournal.log_ejournal(parsedDataClone);

            //print receipt w/o printer status check; not queued; for short receipts
            if (!parsedData.logOnly && !parsedData.isQueued) {
                printStatus = printReceipt(parsedData);

            } //print receipt w/ printer status check; queued; for long receipts
            else if (!parsedData.logOnly && parsedData.isQueued) {
                isPrinting = true;
                printStatus = printerQueue.printReceiptQueued(parsedData);
            }
            // else if (parsedData.logOnly){
            // if (parsedData.printTo != "P"){
            // 	isPrinting = false;
            // 	sendPrintingStatus(false);
            // }

        } catch (err) {
            console.log(err);
            printStatus = "Failed to print receipt."
        }
    });

    req.on('error', function(e) {
        console.log(e);
    });
    res.send(printStatus);
};

/**
 * Calls function to print document.
 * @param req
 *      the request - print request from client with post data
 * @param res
 *      the response - to be sent back to client;
 */
exports.printDocument = function(req, res) {
    console.log('Printing Document.');
    var printStatus = "";
    req.on('data', function(data) {
        printStatus = printDocument(JSON.parse(data));
        printDocumentTest(JSON.parse(data));
    });
    res.send(printStatus);
};

/**
 * Calls function to print report.
 * @param type
 *    Type of transaction
 * @param reportToPrint
 *    contains data to be printed
 * @param res
 *    response object to be used when sending back printer operation status
 */
exports.print_report = function(type, reportToPrint, res) {
    switch (type) {
        case 'OFFLINE_TRANSACTIONS':
            printReport(reportToPrint, type, res);
            printReportTest(reportToPrint);
    }
};

/**
 *	Function used to print reports of different type
 *
 *	@param reportToPrint contains data to be printed
 *	@param type indicates the report type. Used to pick body printer for different type of reports
 *	@param res response object to be used when sending back printer operation status
 */
function printReport(reportToPrint, type, res) {
    try {
        if (reportToPrint.header) {
            printReportHeader(reportToPrint.header);
        }

        if (reportToPrint.body) {
            if (type === 'OFFLINE_TRANSACTIONS')
                printOfflineTransactionsReportBody(type, reportToPrint.body);
        }
        // No footer implementation yet. Add if needed
        if (reportToPrint.footer) {
            printReportFooter(reportToPrint.footer);
        }
        cutPrinterBottom();
        res.writeHead('200', 'OK', { 'Content-Type': 'application/json;charset=UTF-8' });
        res.end(null);
    } catch (err) {
        console.log(err.message);
        console.log("Unable to print receipt");
        res.writeHead('500', 'PRINT_REPORT_ERROR', { 'Content-Type': 'application/json;charset=UTF-8' });
        res.end(JSON.stringify({ status: 'Error encountered while printing report\n' + err.message }));
    }
}

/**
 *	Generic function used to print report header
 *	@param headerArray contains strings to be printed at separate lines each
 */
function printReportHeader(headerArray) {
    // Prints header containing date, pos terminal number, store code, etc.
    headerArray.forEach(function(data) {
        printer.printCentered(data);
    });
}

/**
 *	Generic function used to print report footer
 *	@param footerArray	array of Strings to be printed in footer section
 */
function printReportFooter(footerArray) {
    // Prints footer
    footerArray.forEach(function(data) {
        printer.printCentered(data);
    });
}

/**
 * Get each key of offlineTxns data
 * @param type
 *      Type of transaction
 * @param offlineTxns
 *      All offline transactions saved in terminal
 */
function printOfflineTransactionsReportBody(type, offlineTxns) {
    // Get each key of offlineTxns data
    // Each key corresponds to one transaction type (e.g., SALE, VOID, RETURN, etc.)
    Object.keys(offlineTxns).forEach(function(key) {
        // Print key as label
        printer.printLine(key);
        // For each data under the same key, print transactionId, transactionDate and totalPayment
        offlineTxns[key].forEach(function(data) {
            printer.printLine(data.transactionId + '  ' + data.transactionDate + '  ' + data.totalPayment);
            if (data.baseTransactionId) {
                printer.printCentered('Base Transaction: ' + data.baseTransactionId);
            }
        });
        printer.printCentered('\n');
    });
}

/**
 * Add space and cutting of receipt
 */
function cutPrinterBottom() {
    printer.printCentered('\n');
    printer.printCentered('\n');
    printer.printCentered('\n');
    printer.printCentered('\n');
    printer.printCentered('\n');
    printer.printCommand(PAPER_FULL_CUT);
}

/**
 * Log print report test is executed
 */
function printReportTest() {
    console.log('TODO: implement logging here for historical data');
}

/**
 * Calls function to open drawer.
 * @param req
 *      request from client to trigger open drawer.
 * @param res
 *      response that is sent back to client after trigger request.
 */
exports.openDrawer = function(req, res) {
    console.log('Opening Drawer.');
    printer.printCommand(DRAWER_1_OPEN_CMD);
    res.send({
        isExecuted: true,
        message: "Opening cash drawer..."
    });
};

/**
 * Calls function to check the status of drawer (open/close).
 * When printer is connected/online, it will detect the
 * status of the drawer as always close.
 * @param req
 *      request from client to check printer status.
 * @param res
 *      response that is sent back to client after trigger request.
 */
exports.checkDrawerStatus = function(req, res) {
    console.log('Checking Drawer Status.');

    var isDrawerClose = true;
    var isOnline = false;

    // escpos command to check printer status
    printer.checkStatus(DRAWER_STATUS_CMD);

    // reads status of printer
    printer.once('readStatus', function(data) {
        /*// read raw data and convert raw data to binary
        var binaryCode = decimalToBinary(new Buffer(data).readUInt8(0));
        // log returned data of printer
        console.log("Printer Status:" +binaryCode);*/

        var buffer = new Buffer(data);
        console.log(data);
        // read raw data as int value
        buffer = buffer.readUInt8(0);
        // convert raw data to binary
        var binaryCode = decimalToBinary(buffer);
        // log returned data of printer
        console.log("Printer Status:" + binaryCode);

        //offset 3 determines if printer/drawer is online
        if (binaryCode[DRAWER_CONNECTION_OFFSET] == DRAWER_ON_LINE) {
            isOnline = true;
            if (binaryCode[DRAWER_STATUS_OFFSET] == DRAWER_OPEN_STATUS) {
                console.log(DRAWER_OPEN);
                isDrawerClose = false;
            } else if (binaryCode[DRAWER_STATUS_OFFSET] == DRAWER_CLOSE_STATUS) {
                console.log(DRAWER_CLOSE);
                isDrawerClose = true;
            }
        }
    });

    // set timeout to wait for printer response;
    setTimeout(function() {
        if (isOnline) {
            sendResponse(res, 200, 'OK', 'application/json;charset=UTF-8', JSON.stringify({ isClose: isDrawerClose, success: true, msg: DRAWER_STATUS_CHECK_SUCCESS }));
        } else {
            sendResponse(res, 400, 'Bad Request', 'application/json;charset=UTF-8', JSON.stringify({ isClose: true, success: false, msg: DRAWER_STATUS_CHECK_ERROR }));
        }
    }, 200);
};

/**
 * Sends response message back to POS.
 * @param res
 * @param statusCode
 * @param statusMsg
 * @param contentType
 * @param body
 */
function sendResponse(res, statusCode, statusMsg, contentType, body) {
    res.writeHead(statusCode, statusMsg, { 'Content-Type': contentType });
    res.end(body);
}

/**
 * Sends response message back to POS.
 * @param res
 * @param statusCode
 * @param statusMsg
 * @param contentType
 * @param body
 */
function sendResponse(res, statusCode, statusMsg, contentType, body) {
    res.writeHead(statusCode, statusMsg, { 'Content-Type': contentType });
    res.end(body);
}


/**
 * Convert raw data to binary
 * @param d - data
 * @returns {Array}
 */
decimalToBinary = function(d) {
    var bits = 8;
    var b = [];
    for (var i = 0; i < bits; i++) {
        b.push(d % 2);
        d = Math.floor(d / 2);
    }
    return b;
};

/**
 * Prints receipt transaction.
 * @param txData
 *      - transaction details
 * @returns {string}
 *      - returns status of printing if success or fail if an error occurs.
 */
function printReceipt(txData) {
    var printStatus = "Print Started.";
    try {
        if (txData.printTo == "P") {
            // Header
            if (txData.header) {
                printReceiptHeader(txData.header);
            }

            if (txData.title) {
                printReceiptTitle(txData.title);
            }

            // BODY
            // Tx Sale Detail
            if (txData.txDetail) {
                printReceiptDetails(txData.txDetail);
            }

            // Tx items
            if (txData.body) {
                printReceiptData(txData.body);
            }

            // Tx Summary Details
            if (txData.summary) {
                printReceiptSummary(txData.summary);
            }

            // TopUp Info Details
            if (txData.topUpInfo) {
                printReceiptTopUpInfo(txData.topUpInfo);
            }

            // Indosmart Info Details
            if (txData.indosmartInfo) {
                printReceiptIndosmartInfo(txData.indosmartInfo);
            }

            // MCash Info Details
            if (txData.mCashInfo) {
                printReceiptMCashInfo(txData.mCashInfo);
            }

            // Alterra Info Details
            if (txData.alterraInfo) {
                printReceiptAlterraInfo(txData.alterraInfo);
            }

            //footer summary details
            if (txData.footerSummary) {
                printReceiptFooterSummary(txData.footerSummary);
            }
            //footer receipt details
            if (txData.footer) {
                printReceiptFooter(txData);
            }
        }

        //mktInfo receipt details
        if (txData.mktInfo) {
            printReceiptMktInfo(txData);
        }

        //free parking details
        if (txData.freeParking) {
            printFreeParking(txData.freeParking);
        }

        //balloon game details
        if (txData.balloonGame) {
            printReceiptBalloonGame(txData.balloonGame);
        }

        if (txData.printTo == "P") {
            //eft online printing
            if (txData.eftOnline) {
                printReceiptEftOnline(txData);
            }

            //installment details
            if (txData.isInstallmentTransaction) {
                txData.header = txData['isInstallmentTransaction']['header'];
                txData.title = new Array("DUPLICATE RECEIPT");
                txData.txDetail = txData['isInstallmentTransaction']['txDetail'];
                txData.body = txData['isInstallmentTransaction']['body'];
                txData.summary = txData['isInstallmentTransaction']['summary'];
                txData.topUpInfo = txData['isInstallmentTransaction']['topUpInfo'];
                txData.indosmartInfo = txData['isInstallmentTransaction']['indosmartInfo'];
                txData.mCashInfo = txData['isInstallmentTransaction']['mCashInfo'];
                txData.alterraInfo = txData['isInstallmentTransaction']['alterraInfo'];
                txData.footerSummary = txData['isInstallmentTransaction']['footerSummary'];
                txData.footer = txData['isInstallmentTransaction']['footer'];
                txData.isInstallmentTransaction = null;
                printReceipt(txData);
            }

            //EFT Settlement Report
            if (txData.eftSettlementAll) {
                printEftReports(txData.eftSettlementAll);
            }

            //EFT Transaction Summary Report
            if (txData.eftTransactionSummaryData) {
                printEftReports(txData.eftTransactionSummaryData);
            }

            //EFT Detail Transactions Report
            if (txData.eftDetailTransactionReport) {
                printEftReports(txData.eftDetailTransactionReport);
            }
        }
        return printStatus;
    } catch (err) {
        console.log(err.message);
        console.log("Unable to print receipt");
        printStatus = "Unable to print receipt;";
        return printStatus;
    }
}

/**
 * Print receipt header
 * @param data
 *      - header data
 */
function printReceiptHeader(data) {
    // RESET TO DEFAULT FONT
    if (config.isThermal)
        printer.printCommand(RECEIPT_FONT_DEFAULT_THERMAL + RECEIPT_FONT_DEFAULT_THERMAL_SMALL);

    for (var item in data) {
        printItem(data[item]);
    }
}

/**
 * Print Receipt Title.
 * @param data
 *      - Receipt Title
 */
function printReceiptTitle(data) {
    for (var item in data) {
        printItem(data[item]);
    }
}

/**
 * Print Receipt Details.
 * @param data
 *    - item scanned details line by line such as discount, price and quantity.
 */
function printReceiptDetails(data) {
    for (var item in data) {
        printItem(data[item]);
    }
}

/**
 * Prints transaction data
 * @param data
 *      - product details from post sale void
 *      - topup items
 */
function printReceiptData(data) {
    for (var item in data) {
        printItem(data[item]);
    }
}

/**
 * Print Receipt Summary
 * @param data
 */
function printReceiptSummary(data) {
    for (var item in data) {
        printItem(data[item]);
    }
}

/**
 * Print top up details
 * @param data
 */
function printReceiptTopUpInfo(data) {
    for (var item in data) {
        printItem(data[item]);
    }
}

/**
 * Print indosmart details
 * @param data
 */
function printReceiptIndosmartInfo(data) {
    for (var item in data) {
        printItem(data[item]);
    }
}

/**
 * Print mCash details
 * @param data
 */
function printReceiptMCashInfo(data) {
    for (var item in data) {
        printItem(data[item]);
    }
}

/**
 * Print alterra details
 * @param data
 */
function printReceiptAlterraInfo(data) {
    for (var item in data) {
        printItem(data[item]);
    }
}

/**
 * Prints all receipt parts from footer summary to the last data of receipt
 * Contains the following which shouldn't be
 * MIDDLE aligned(as opposed to 'footer' section):
 * ..etcetera
 * QUANTITY PURCHASED
 *          VOIDED
 *          CANCELLED
 *          RETURNED
 *          REFUNDED
 * TOTAL DIRECT DISC
 * @param txData
 *  - payment data details
 */
function printReceiptFooterSummary(data) {
    for (var item in data) {
        printItem(data[item]);
    }
}

/**
 * Print Receipt Footer
 * @param data
 */
function printReceiptFooter(data) {
    // add line spaces and cut command at the end of the receipt.
    //partial cut if free parking is available
    if (!data.mktInfo)
        if (data.freeParking)
            data.footer = data.footer.concat(printerUtil.cutPaperReceipt(config.isThermal, PAPER_PART_CUT));
        else
            data.footer = data.footer.concat(printerUtil.cutPaperReceipt(config.isThermal));

    for (var f in data.footer) {
        printItem(data.footer[f]);
    }
}

/**
 * Print Receipt mktInfo
 * @param data
 */
function printReceiptMktInfo(data) {
    console.log("printing mktInfo  printerJS:" + data.mktInfo);
    // add line spaces and cut command at the end of the receipt.
    //partial cut if free parking is available
    if (data.freeParking)
        data.mktInfo = data.mktInfo.concat(printerUtil.cutPaperReceipt(config.isThermal, PAPER_PART_CUT));
    else
        data.mktInfo = data.mktInfo.concat(printerUtil.cutPaperReceipt(config.isThermal));

    for (var f in data.mktInfo) {
        printItem(data.mktInfo[f]);
    }
}

/**
 * Print free parking
 * @param data
 */
function printFreeParking(data) {
    data = data.concat(printerUtil.cutPaperReceipt(config.isThermal, PAPER_FULL_CUT));
    // add line spaces and cut command at the end of the receipt.
    for (var item in data) {
        printItem(data[item]);
    }
}


/**
 * Print balloon game
 * @param data
 */
function printReceiptBalloonGame(data) {
    data = data.concat(printerUtil.cutPaperReceipt(config.isThermal, PAPER_FULL_CUT));
    // add line spaces and cut command at the end of the receipt.
    for (var item in data) {
        printItem(data[item]);
    }
}

/**
 * Print Eft online
 * @param data
 */
function printReceiptEftOnline(data) {
    data = data.concat(printerUtil.cutPaperReceipt(config.isThermal, PAPER_FULL_CUT));
    // add line spaces and cut command at the end of the receipt.
    for (var item in data) {
        printItem(data[item]);
    }
}

/**
 * Print Eft Report data
 * @param data
 */
function printEftReports(data) {
    // add line spaces and cut command at the end of the receipt.
    data = data.concat(printerUtil.cutPaperReceipt(config.isThermal, PAPER_FULL_CUT));
    for (var item in data) {
        printItem(data[item]);
    }
}

/**
 * Accepts item obj:
 * item : {
 *      position - centered, justified
 *      val - value to print/ print code to execute
 *      isCommand - flag if it is a special function of printer instead of printing
 * }
 * @param item
 */
function printItem(item) {
    /*if (config.isThermal && item && item.position != 'command')
    	printer.printCommand(RECEIPT_FONT_DEFAULT_THERMAL_SMALL);*/

    if (item && typeof item === "string") {
        printer.printCentered(item);
    } else if (item && (item.isCommand || item.position == 'command')) {
        if (config.isThermal || (!(config.isThermal) && item.val != RECEIPT_FONT_BOLD)) { //for non-thermal, do not execute BOLD printing
            printer.printCommand(getValueToPrint(item.val));
        }
    } else if (item && item.position == 'centered' && item.val) {
        printer.printCentered(getValueToPrint(item.val));
    } else if (item && item.position == 'left' && item.val) {
        printer.printLine(getValueToPrint(item.val));
    }
}

function getValueToPrint(val) {

    if (val == 'defaultFont') {
        val = (config.isThermal) ? RECEIPT_FONT_DEFAULT_THERMAL + RECEIPT_FONT_DEFAULT_THERMAL_SMALL : RECEIPT_FONT_DEFAULT_NON_THERMAL;
        return val;
    }

    if (val.thermal) {
        val = (config.isThermal) ? val.thermal : val.nonThermal
    }

    return val + ((config.isThermal) ? RECEIPT_FONT_DEFAULT_THERMAL_SMALL : '');
}


//Print on document
function printDocument(txData) {
    var printStatus = "Print document Started.";
    try {
        //turn on the document printing
        printer.printCommand("\x1b\x63\x30\x04");
        printer.printLine("\n");
        printer.printLine("\n");
        printer.printLine("\n");
        printer.printLine("\n");
        for (var i in txData) {
            printer.printLine("   " + txData[i]);;
        }
        //turn off doc print mode and switch to 2-sheet mode
        printer.printCommand("\x0c");
    } catch (err) {
        console.log("Unable to print document");
        console.log(err.message);
        printStatus = "Unable to print document;";
        return printStatus;
    }
}

function printDocumentTest(txData) {
    var printStatus = "Document Printed.";
    try {
        console.log("\n");
        console.log("\n");
        console.log("\n");
        console.log("\n");
        console.log(txData[i]);
        for (var i in txData) {}
    } catch (err) {
        console.log("Unable to print document");
        console.log(err.message);
        printStatus = "Unable to print document;";
        return printStatus;
    }
}

/**
 * Printer Event Listeners
 * @param io
 */
function addPrinterListeners(io) {
    //add custom
    console.log("--- Add Printer Listeners ---");
    printer.on('printingStatus', function(status) {
        if (status != null) {
            io.sockets.emit('printingStatus', status);
        }
    });
}

function sendPrintingStatus(status) {
    isPrinting = status;
    printer.emit('printingStatus', isPrinting);
}

exports.sendPrintingStatus = sendPrintingStatus;
exports.addPrinterListeners = addPrinterListeners;
exports.printItem = printItem;
exports.connect = connect;