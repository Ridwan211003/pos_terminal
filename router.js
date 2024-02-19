var fs = require("fs");
var printer = require("./devices/printer");
var edc = require("./devices/edc");
var ecr = require("./devices/ecrlink");
var drawer = require("./devices/cashDrawer");
var printer = require("./devices/printer");
var hypercash = require("./service/hypercash");
var report = require("./service/report");

// redirects to /index.html; index.html is used for testing device
exports.home = function(req, res) {
	console.log(__dirname + '/index.html');
    fs.readFile(__dirname + '/index.html', 'utf8', function(err, text){
        res.send(text);
    });
};

//Open Cash Drawer
exports.openDrawer = printer.openDrawer;
exports.ibmOpenDrawer = drawer.openDrawer;

//Check Printer Status;
exports.checkDrawerStatus = printer.checkDrawerStatus;
exports.ibmCheckDrawerStatus = drawer.checkDrawerStatus;

//Print Receipt
exports.printReceipt = printer.printReceipt;

//Print Document
exports.printDocument = printer.printDocument;

//Payment Gateway (EFT Online)
exports.paymentGateway = edc.paymentGateway;

//ECRLINK Gateway
exports.ecrinit = ecr.init;
exports.processECR = ecr.processECR;

// Print Hypercash Docs (Tax Invoice, Return Note)
exports.printHypercashDoc = hypercash.printDoc;

// Prints Report documents (Offline transactions report, etc.)
exports.printReportDoc = report.print_doc;
