/**
 * Exist Global Inc.
 * mperez@exist.com
 */
var serialport = require('serialport');
var scanner = require("./scanner.js");
var edc = require("./edc.js");
var printer = require("./printer.js");
var cashDrawer = require ("./cashDrawer.js");
//var config = require(".././config/config.js");
var config = {};
var constants = require(".././possapp.proxy.constants.js");
var router = require('../router.js');

//checks if proxy is running on development.
//config = config.getConnection();

var DeviceFactory = DeviceFactory || {};

DeviceFactory.disconnectedDevices = [];

/**
 * Initializes devices used on pos.
 * @param terminalConf - configuration table
 * @param app - app server
 * @param clientIo - io listener
 */
DeviceFactory.initDevices = function(cf, terminalConf, app, clientIo){
	console.log('init devices...');
	config = cf;
	this.connectDevices(terminalConf);
	this.addDeviceListener(clientIo);
	this.addDeviceRequests(app, terminalConf);
};

/**
 * Connect to all devices initialized.
 * @param terminalConf - configuration
 */
DeviceFactory.connectDevices = function(terminalConf){
	for(var dev in config.device){
		var path = config.device[dev];
		console.log(dev + ': ' + path);
		if(dev.search('scanner') != -1){
			scanner.connect(path);
		} else if(dev.toLowerCase() === 'printer'){
			printer.connect(config, path, terminalConf);
		} else if(dev.toLowerCase() === 'edc'){
			edc.connect(config, path);
		} else {
			console.log('no such device recognized.');
		}
	}
};

/**
 * Connect Device that was disconnected
 * @param devInfo
 */
DeviceFactory.connectDevice = function(devInfo){
	if(devInfo.type === 'scanner'){
		scanner.connect(devInfo.path);
	} else if(devInfo.type === 'printer'){
		printer.connect(config, devInfo.path);
	} else if(devInfo.type === 'edc'){
		edc.connect(config, devInfo.path);
	} else if(devInfo.type === 'drawer'){
		cashDrawer.connect(config, devInfo.path);
	} else {
		console.log('no such device recognized.');
	}
};

/**
 * Proxy app server requests from pos.
 * Device Related
 * @param proxyapp
 */
DeviceFactory.addDeviceRequests = function(proxyapp, terminalConf){
	if(terminalConf && terminalConf.terminalModel && terminalConf.terminalModel === 'IBM'){
		// open drawer
		proxyapp.get('/openDrawer'			, router.ibmOpenDrawer);
		// check drawer status
		proxyapp.get('/checkDrawerStatus'	, router.ibmCheckDrawerStatus);
	} else {
		// open drawer
		proxyapp.get('/openDrawer'			, router.openDrawer);
		// check drawer status
		proxyapp.get('/checkDrawerStatus'	, router.checkDrawerStatus);
	}
	// Print receipt
	proxyapp.post('/printReceipt'		, router.printReceipt);
	// Print document
	proxyapp.post('/printDocument'		, router.printDocument);
	// Edc payment
	proxyapp.post('/eftOnline'			, router.paymentGateway);
	proxyapp.post('/eftOnlineKartuku'               , router.processECR);
};

/**
 * Add event handlers for devices
 * @param io - io web event
 */
DeviceFactory.addDeviceListener = function(io){
	scanner.scanBarcode(io);
	edc.getEdcResponse(io);
	router.ecrinit(config, io);
    printer.addPrinterListeners(io);
};

/**
 * Reconnect device when dc.
 * @param devInfo - device info eg. path, type etc.
 */
DeviceFactory.reconnectDevice = function(devInfo){
	DeviceFactory.disconnectedDevices.push(devInfo);
	setTimeout(function(){
		console.log(devInfo.path);
		DeviceFactory.connectDevice(devInfo);
	}, 10000);
};

/**
 * Error listener on devices.
 */
serialport.on('error', function (err){
	console.log(err);
});

module.exports = DeviceFactory;
