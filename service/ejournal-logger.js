var winston = require('winston');
var fs = require('fs');
var path = require('path');
//var config = require('../config/config.js');
var config;
var constants = require('../possapp.proxy.constants');

var configuration;
var logger;
var printTestCounter = 0;

// 20150804 - LUCKY - Modify to write on ej per transaction id
function getLogger(transactionid) {
    if (!configuration) configuration = global.configuration_poss;

    config = global.configuration_poss['config'];
    var dirPath = '/equnix/resources/';
    var donePath = configuration.properties['EJOURNAL_DIR_DONE'];
    //if(!dirPath)   dirPath = __dirname + '/ejournal/';

    console.log('ejournal dirPath = ' + dirPath);

    /*if(!fs.existsSync(dirPath)) 
    {
		createDirRecursive(dirPath);
        createDirRecursive(dirPath + "/.done");
	}*/

    //creates a flat file to put the path directory where the ejournal is saved
    /*if(!fs.existsSync(constants.CONFIG.EJOURNAL_SETTINGS_DIR)) 
        createDirRecursive(constants.CONFIG.EJOURNAL_SETTINGS_DIR);

    //reads existing ejournal settings and
    fs.readFile(constants.CONFIG.EJOURNAL_SETTINGS_FILE, 
        function(err, data)
        {
            if (err)
            {
                console.log("Error: " + err);
                writeEjournalDirectory(constants.CONFIG.EJOURNAL_SETTINGS_FILE, dirPath);
            } 
            else 
            {
               console.log("dirPath: " +data);
               if (data != dirPath)
                   writeEjournalDirectory(constants.CONFIG.EJOURNAL_SETTINGS_FILE, dirPath);
           }
        }
    );*/

    if (!logger) {
        logger = new(winston.Logger)({
            transports: [
                new winston.transports.File({
                    name: 'poss-ejournal-transaction',
                    //datePattern : '.yyyy-MM-dd',
                    //filename : dirPath + 'ejx_' + global.configuration_poss.storeCode + '_' + global.configuration_poss.terminalCode,
                    filename: dirPath + 'ej_log',
                    timestamp: false,
                    json: false
                })
            ]
        });
    }

    return logger;
}

exports.log_ejournal = function(txData) {
    logger = getLogger(txData.trxid);
    printTestCounter = 0;
    printTest(txData);
}

function createDirRecursive(dirPath) {
    //Call the standard fs.mkdir
    fs.mkdir(dirPath, function(error) {
        //When it fail in this way, do the custom steps
        if (error && error.errno === 34) {
            //Create all the parents recursively
            createDirRecursive(path.dirname(dirPath));
            //And then the directory
            createDirRecursive(dirPath);
        }
        //Manually run the callback since we used our own callback to do all these
    });
};


function printTest(txData) {
    var printStatus = "Receipt Printed.";
    try {
        var hasFreeParking = !!txData['freeParking'];
        var hasMLC = !!txData['mlc']; // CR MLC
        var hasBalloonGame = !!txData['balloonGame'];
        var hasFooter = !!txData['footer'];
        var isReceiptEnd = hasFooter || hasFreeParking || hasBalloonGame || hasMLC // CR MLC;

        // Header
        if (txData.header) {
            for (var h in txData.header) {
                logTextToConsoleAndEjounrnalLogger(txData.header[h]);
            }
        }

        if (txData.title) {
            for (var t in txData.title) {
                logTextToConsoleAndEjounrnalLogger(txData.title[t]);
            }
        }

        // BODY
        // Tx Sale Details
        if (txData.txDetail) {
            for (var item in txData.txDetail) {
                logTextToConsoleAndEjounrnalLogger(txData.txDetail[item]);
            }
        }

        // Tx items
        if (txData.body) {
            for (var item in txData.body) {
                logTextToConsoleAndEjounrnalLogger(txData.body[item]);
            }
        }

        // Tx Summary Details
        if (txData.summary) {
            for (var item in txData.summary) {
                logTextToConsoleAndEjounrnalLogger(txData.summary[item]);
            }
        }

        // TopUp Info Details
        if (txData.topUpInfo) {
            for (var item in txData.topUpInfo) {
                logTextToConsoleAndEjounrnalLogger(txData.topUpInfo[item]);
            }
        }

        // Indosmart Info Details
        if (txData.indosmartInfo) {
            for (var item in txData.indosmartInfo) {
                logTextToConsoleAndEjounrnalLogger(txData.indosmartInfo[item]);
            }
        }

        // MCash Info Details
        if (txData.mCashInfo) {
            for (var item in txData.mCashInfo) {
                logTextToConsoleAndEjounrnalLogger(txData.mCashInfo[item]);
            }
        }

        // Alterra Info Details
        if (txData.alterraInfo) {
            for (var item in txData.alterraInfo) {
                logTextToConsoleAndEjounrnalLogger(txData.alterraInfo[item]);
            }
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

        if (txData.footerSummary) {
            //console.log(JSON.stringify(txData.footerSummary));
            for (var item in txData.footerSummary) {
                logTextToConsoleAndEjounrnalLogger(txData.footerSummary[item]);
            }
        }

        if (txData.footer) {
            for (var item in txData.footer) {
                logTextToConsoleAndEjounrnalLogger(txData.footer[item]);
            }
            logSpaceReceiptPaperCut();
        }

        if (txData.mktInfo) {
            for (var item in txData.mktInfo) {
                logTextToConsoleAndEjounrnalLogger(txData.mktInfo[item]);
            }
            logSpaceReceiptPaperCut();
        }

        //freeParking and balloonGame
        if (hasFreeParking && hasBalloonGame) {
            receiptHelper(txData['freeParking']);
            receiptHelper(txData['balloonGame']);
            logSpaceReceiptPaperCut();
        } else if (hasFreeParking && !hasBalloonGame) {
            receiptHelper(txData['freeParking']);
            logSpaceReceiptPaperCut();
        } else if (!hasFreeParking && hasBalloonGame) {
            receiptHelper(txData['balloonGame']);
            logSpaceReceiptPaperCut();
        }

        // CR MLC
        if (hasMLC) {
            receiptHelper(txData['mlc']);
            logSpaceReceiptPaperCut();
        }
        // CR MLC
        /*if(txData.freeParking){
            for ( var item in txData.freeParking) {
                logTextToConsoleAndEjounrnalLogger(txData.footer[item]);
            }
            logSpaceReceiptPaperCut();
        }

        if (txData.balloonGame){
            if(hasFreeParking){
                logTextToConsoleAndEjounrnalLogger({val: "\n"});
            }
            for (var item in txData.baloonGame) {
                logTextToConsoleAndEjounrnalLogger(txData.baloonGame[item]);
            }
        }*/

        //eft online printing
        if (txData.eftOnline) {
            for (var item in txData.eftOnline) {
                logTextToConsoleAndEjounrnalLogger(txData.eftOnline[item]);
            }
            logSpaceReceiptPaperCut();
        }

        if (txData.eftSettlementAll) {
            for (var i in txData.eftSettlementAll) {
                logTextToConsoleAndEjounrnalLogger(txData.eftSettlementAll[i]);
            }
            logSpaceReceiptPaperCut();
        }

        if (txData.eftTransactionSummaryData) {
            for (var i in txData.eftTransactionSummaryData) {
                logTextToConsoleAndEjounrnalLogger(txData.eftTransactionSummaryData[i]);
                logSpaceReceiptPaperCut();
            }
        }

        if (txData.eftDetailTransactionReport) {
            for (var i in txData.eftDetailTransactionReport) {
                logTextToConsoleAndEjounrnalLogger(txData.eftDetailTransactionReport[i]);
                logSpaceReceiptPaperCut();
            }
        }

        if (txData['isInstallmentTransaction']) {
            printTestCounter++;
            if (printTestCounter == 1) {
                txData.header = txData['isInstallmentTransaction']['header'];
                txData.title = new Array("DUPLICATE RECEIPT");
                txData.txDetail = txData['isInstallmentTransaction']['txDetail'];
                txData.body = txData['isInstallmentTransaction']['body'];
                txData.summary = txData['isInstallmentTransaction']['summary'];
                txData.topUpInfo = txData['isInstallmentTransaction']['topUpInfo'];
                txData.footerSummary = txData['isInstallmentTransaction']['footerSummary'];
                txData.footer = txData['isInstallmentTransaction']['footer'];
                printTest(txData);
            }
        }

        return printStatus;
    } catch (err) {
        logTextToConsoleAndEjounrnalLogger("Unable to print receipt");
        logTextToConsoleAndEjounrnalLogger(err.message);
        printStatus = "Unable to print receipt;";
        return printStatus;
    }
}

function logSpaceReceiptPaperCut() {
    if (config.isThermal) {
        for (var ctr = 0; ctr < 2; ctr++) {
            logTextToConsoleAndEjounrnalLogger(" ");
        }
    } else {
        for (var ctr = 0; ctr < 4; ctr++) {
            logTextToConsoleAndEjounrnalLogger(" ");
        }
    }
    logTextToConsoleAndEjounrnalLogger("PAPER_FULL_CUT");
}

// 20150902 - LUCKY - Modify the logger.info, because the sent information is
// ["1X 4,900","OISHI CRACKER 70GR              4,900  *"]
function logTextToConsoleAndEjounrnalLogger(text) {
    if (typeof(text) == "string") {
        console.log(text);
        logger.info(text);
    } else if (text.position == 'command') {
        //do nothing
    } else {
        //console.log(text);
        console.log((text.val && text.val.thermal) ? text.val.thermal : text.val);
        logger.info((text.val && text.val.thermal) ? text.val.thermal : text.val);
        //logger.info(text);
    }
}

function receiptHelper(txArray) {
    var counter = 0;
    var receiptLength = txArray.length;
    for (var i in txArray) {
        if (counter == (receiptLength - 1))
            logTextToConsoleAndEjounrnalLogger('PAPER_PART_CUT');
        logTextToConsoleAndEjounrnalLogger(txArray[i]);
        counter++;
    }
}

function writeEjournalDirectory(f, data) {
    try {
        fs.writeFileSync(f, data);
    } catch (err) {
        console.log(err);
    }
}