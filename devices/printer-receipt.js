var printer = null;

const PAPER_FULL_CUT = '\x1b\x69';
const PAPER_PART_CUT = '\x1b\x6d';

var receiptHeader = null;
var receiptDetails = null;
var receiptBody = null

var printCounter = 0;

exports.printReceipt = function printReceipt(txData, escPosPrinter) {
    if (printer !== escPosPrinter) {
        printer = escPosPrinter
    }
    var printStatus = "Print Started.";
    printCounter = 0;
    console.log('poss-printer. received request for printing ');
    try {
        var hasFreeParking = !!txData['freeParking'];
        var hasFooter = !!txData['footer'];
        var isReceiptEnd = hasFooter || hasFreeParking;

        // Header
        if (txData['header']) {
            printReceiptHeader(txData);
        }

        if (txData['title']) {
            printReceiptTitle(txData);
        }

        // BODY
        // Tx Sale Detail
        if (txData['txDetail']) {
            printReceiptDetails(txData);
        }

        // Tx items
        if (txData['body']) {
            printReceiptData(txData);
        }

        // Tx Summary Details
        if (txData['summary']) {
            printReceiptSummary(txData);
        }

        // TopUp Info Details
        if (txData['topUpInfo']) {
            printReceiptTopUpInfo(txData);
        }

        // Indosmart Info Details
        if (txData['indosmartInfo']) {
            printReceiptIndosmartInfo(txData);
        }

        // MCash Info Details
        if (txData['mCashInfo']) {
            printReceiptMCashInfo(txData);
        }

        // Alterra Info Details
        if (txData['alterraInfo']) {
            printReceiptAlterraInfo(txData);
        }

        /* Contains the following which shouldn't be
         * MIDDLE aligned(as opposed to 'footer' section):
         *
         *
         * ..etcetera
         * QUANTITY PURCHASED
         *          VOIDED
         *          CANCELLED
         *          RETURNED
         *          REFUNDED
         * TABLE NUMBER (Optional for Hot Spice)
         * TOTAL DIRECT DISC
         */
        if (txData['footerSummary']) {
            printReceiptFooterSummary(txData, hasFreeParking);
        }

        // Footer
        if (txData['footer'] && !txData['footerSummary']) {
            printReceiptFooter(txData, hasFreeParking);
        }

        // Mkt Info
        if (txData['mktInfo'] && !txData['footerSummary']) {
            printReceiptMktInfo(txData, hasFreeParking);
        }

        //free parking
        if (txData['freeParking'] && !txData['footerSummary']) {
            printReceiptFreeParking(txData);
        }

        //eft online printing
        if (txData['eftOnline'] && !txData['footerSummary']) {
            printReceiptEftOnline(txData);
        }

        return printStatus;
    } catch (err) {
        console.log(err.message);
        console.log("Unable to print receipt");
        printStatus = "Unable to print receipt;";
        return printStatus;
    }
}

function printReceiptHeader(txData) {
    // Prints currency and prints separator for receipt body
    for (var h in txData.header) {
        printer.printCentered(txData.header[h]);
    }
    receiptHeader = txData.header;
}

function printReceiptTitle(txData) {
    for (var t in txData.title) {
        printer.printCentered(txData.title[t]);
    }
}

function printReceiptDetails(txData) {
    for (var td in txData.txDetail) {
        var currTxDetail = txData.txDetail[td];
        printer.printCentered('******************************************');
        for (var tdItem in currTxDetail) {
            printer.printCentered(currTxDetail[tdItem]);
        }
        printer.printCentered('******************************************');
    }
    receiptDetails = txData.txDetail;
}

function printReceiptData(txData) {
    for (var item in txData.body) {
        for (var i in txData.body[item]) {
            printer.printLine(txData.body[item][i]);
        }
    }
    receiptBody = txData.body;
}

function printReceiptSummary(txData) {
    for (var item in txData.summary) {
        printer.printLine(txData.summary[item]);
    }
}

function printReceiptAlterraInfo(txData) {
    for (var item in txData.alterraInfo) {
        printer.printLine(txData.alterraInfo[item]);
    }
}

function printReceiptMCashInfo(txData) {
    for (var item in txData.mCashInfo) {
        printer.printLine(txData.mCashInfo[item]);
    }
}

function printReceiptIndosmartInfo(txData) {
    for (var item in txData.indosmartInfo) {
        printer.printLine(txData.indosmartInfo[item]);
    }
}

function printReceiptTopUpInfo(txData) {
    for (var item in txData.topUpInfo) {
        printer.printLine(txData.topUpInfo[item]);
    }
}

function printItem(pos, val) {
    if (pos == 'centered')
        printer.printCentered(val);
    if (pos == 'left')
        printer.printLine(val);
}

/*
 * Print receipt summary footer
 * Create delay on the printing
 */
function printReceiptFooterSummary(txData, hasFreeParking) {
    var footerSummaryInterval;
    var x = 0,
        timeout = 0;
    footerSummaryInterval = setInterval(function() {
        for (var i in txData.footerSummary[x]) {
            if (i == 'position') {
                printItem(txData.footerSummary[x][i], txData.footerSummary[x].val);
            }
        }
        x++;
        timeout += 300;
        if (x === (txData.footerSummary).length) {
            clearInterval(footerSummaryInterval);
            setTimeout(function() {
                continuePrintingReceipt(txData, hasFreeParking);
            }, timeout / 2);
        }
    }, 300);
}

function continuePrintingReceipt(txData, hasFreeParking) {
    if (txData['footer']) {
        printReceiptFooter(txData, hasFreeParking);
    }

    // Mkt Info
    if (txData['mktInfo']) {
        printReceiptMktInfo(txData, hasFreeParking);
    }

    //free parking
    if (txData['freeParking']) {
        printReceiptFreeParking(txData);
    }

    //eft online printing
    if (txData['eftOnline']) {
        printReceiptEftOnline(txData);
    }

    if (txData['isInstallmentTransaction']) {
        printCounter++;
        if (printCounter == 1) {

            var lineCount = 0;
            for (var i in txData) {
                if (i != 'isInstallmentTransaction') {
                    lineCount += txData[i].length;
                }
            }

            txData.header = txData['isInstallmentTransaction']['header'];
            txData.title = new Array("DUPLICATE RECEIPT");
            txData.txDetail = txData['isInstallmentTransaction']['txDetail'];
            txData.body = txData['isInstallmentTransaction']['body'];
            txData.summary = txData['isInstallmentTransaction']['summary'];
            txData.footerSummary = txData['isInstallmentTransaction']['footerSummary'];
            txData.footer = txData['isInstallmentTransaction']['footer'];
            txData.freeParking = null;
            //			printReceipt(txData);

            var printDelay = 700 + (lineCount * 140);
            setTimeout(function() {
                printReceipt(txData);
            }, printDelay);
        }
    }
}


function printReceiptFooter(txData, hasFreeParking) {
    for (var f in txData.footer) {
        printer.printCentered(txData.footer[f]);
    }

    // if(hasFreeParking){
    // 	printer.printCentered('\n');
    // } else {
    // 	paperFullCut(5);
    // }
}

function printReceiptMktInfo(txData, hasFreeParking) {
    console.log("printing mktInfo:" + txData.mktInfo);

    for (var f in txData.mktInfo) {
        printer.printCentered(txData.mktInfo[f]);
    }

    if (hasFreeParking) {
        printer.printCentered('\n');
    } else {
        paperFullCut(5);
    }
}

function printReceiptFreeParking(txData) {
    var counter = 0;
    for (var i in txData.freeParking) {
        if (counter == 8)
            printer.printCommand(PAPER_PART_CUT);
        printer.printCentered(txData.freeParking[i]);
        counter++;
    }
    paperFullCut(4);
}

function printReceiptEftOnline(txData) {
    printer.printCommand(PAPER_FULL_CUT);
    for (var ctr = 0; ctr < (txData.eftOnline).length; ctr++) {
        for (var i in txData.eftOnline[ctr]) {
            if (i == 'position') {
                printItem(txData.eftOnline[ctr][i], txData.eftOnline[ctr].val);
            }
        }
    }

}

function paperFullCut(linesBeforeCut) {
    for (var i = 0; i < linesBeforeCut; i++) {
        printer.printCentered('\n');
    }
    printer.printCommand(PAPER_FULL_CUT);
}