/**
 * Exist Global Inc.
 * @Author mperez@exist.com
 * Module
 * Serial and Usb Implementation
 * Serial implementation using RS232 configuration.
 * USB implementation using keyboard input configuration.
 */
var http = require('http');
var fs = require('fs');
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;

//var deviceFactory = require('./deviceFactory');
var constants = require(".././possapp.proxy.constants.js");
var messages = require('.././possapp.proxy.messages.js');

var Scanner = Scanner || {};
Scanner.serialports = [];
/**
 * Connect Device
 */
Scanner.connect = function(path){
	var isSerial = false;

	if(path.search("/dev/ttyS") != -1 || path.search("/dev/pts/") != -1){
		isSerial = true;
	}

	//creates serial port instance of scanner
	var sp = new SerialPort(path, {
		parser: Scanner.parser
	});

	//Open event listener when instance is created.
	sp.on('open', function(){
		console.log(messages.SCANNER.INIT_SCANNER_MSG);
	});

	//add to list for multiple
	Scanner.serialports.push(new Scanner.serialPortObj(sp,
		new Scanner.options(isSerial)
	));
};

/**
 * Raw data buffer
 */
//var myParser = function(emitter, buffer) {
Scanner.parser = function(emitter, buffer){
	emitter.emit("data", buffer);
};

/**
* Get device path from list of ports available in the pos terminal
*/
Scanner.serialPortObj = function(serialport, options){
	this.options = options;
	this.serialport = serialport;
};

/**
* Options/Additional attributes to be used by devices.
*/
Scanner.options = function options(serial){
	this.isSerial = serial;
};

Scanner.scanBarcode = function(io) {
	var barcode = [];
	for(var spo in Scanner.serialports){
		//Data Event Listener
		if(Scanner.serialports[spo].options.isSerial){
			Scanner.serialports[spo].serialport.on('data', function(data){
				Scanner.comBarcodeReader(io, barcode, data);
			});
		} else {
			Scanner.serialports[spo].serialport.on('data', function(data){
				Scanner.usbBarcodeReader(io, barcode, data);
			});
		}

		//Error Event Listener
		Scanner.serialports[spo].serialport.on('error', function(err){
			var devInfo = {};
			devInfo.type = "scanner";
			devInfo.path = Scanner.serialports[spo].serialport.path;

			if(err && err.code === 'ENODEV'){
				devInfo.code = err.code;
				devInfo.message = messages.MSG_PROP_DEV_NOT_AVAILABLE;
	        	console.log(messages.SCANNER.DEV_NOT_AVAILABLE);
	        	io.sockets.emit('scanBarcodeErr', devInfo);
	        	//reconnect
	        	//var deviceFactory = require('./deviceFactory');
	        	//deviceFactory.reconnectDevice(devInfo);
	        }
	        //Add other possible error codes encountered
	        else {
	        	devInfo.code = 'UNPARSED';
	        	devInfo.message = messages.MSG_PROP_INVALID_BARCODE_SCANNED;
	        	devInfo.log(messages.SCANNER.UNPARSABLE_BARCODE_MSG + err);
	        	io.sockets.emit('scanBarcodeErr', devInfo);
	        }
		});
	}
};

/**
 * Serial COM --> RS-232 Standard Implementation
 */
Scanner.comBarcodeReader = function (io, barcode, data){
	try{
		for(var ctr=0; ctr < data.length; ctr++){
			//add each numeric raw data to barcode array
			if(data[ctr]>=constants.SCANNER.ASCII_CODE_OF_ZERO && data[ctr]<= constants.SCANNER.ASCII_CODE_OF_NINE){
				barcode.push(data[ctr]);
			}
			//emit barcode when raw data is carriage return.
			if(data[ctr] == constants.SCANNER.COM_TERMINATOR){
				var buf = new Buffer(barcode);
				console.log(buf.toString('ascii'));
				io.sockets.emit('scanBarcode', buf.toString('ascii'));
				barcode.length = 0;//reset barcode to empty array.
			}
		}
	} catch(err){
		console.log(messages.SCANNER.UNPARSABLE_BARCODE_MSG + err);
		io.sockets.emit('scanBarcodeErr', messages.SCANNER.MSG_PROP_INVALID_BARCODE_SCANNED);
	}
};

/**
 * USB  --> Keyboard Implementation
 */
Scanner.usbBarcodeReader = function(io, barcode, data) {
	try{
		// event type = 1 --> represents key press
		if(data.readUInt32LE(constants.SCANNER.EVENT_TYPE_INDEX) === constants.SCANNER.EVENT_TYPE_VAL){
			// offsetScannedValue represents the scanned int value;
			var intCode = data.readUInt16LE(constants.SCANNER.BARCODE_INDEX);
			// usb terminator code that determines end of barcode scanned.
			if(intCode != constants.SCANNER.USB_TERMINATOR){
				barcode.push(this.mapKeyCodeValue(intCode));
			}

			if(intCode === constants.SCANNER.USB_TERMINATOR){
				console.log(barcode.join(''));
					io.sockets.emit('scanBarcode', barcode.join(''));
				barcode.length = 0;//reset barcode to empty array.
			}
		}
	} catch(err){
		console.log("error on usb scanner:" + err);
	}
};

/************************
 * USB Logic Functions
 ************************/
/**
 * Key value pair of raw data value map to correct barcode value
 */
Scanner.keys = {};
Scanner.keys["11"]  = '0';
Scanner.keys["10"]  = '9';
Scanner.keys["9"]   = '8';
Scanner.keys["8"]   = '7';
Scanner.keys["7"]   = '6';
Scanner.keys["6"]   = '5';
Scanner.keys["5"]   = '4';
Scanner.keys["4"]   = '3';
Scanner.keys["3"]   = '2';
Scanner.keys["2"]   = '1';
Scanner.keys["1"]   = '0';

/**
 * Changes the raw data to the correct int utf-8 value.
 */
Scanner.mapKeyCodeValue = function(d) {
	if(this.keys.hasOwnProperty(d)){
		return this.keys[d];
	} else {
		return "";
	}
};

exports.scanBarcode = Scanner.scanBarcode;
exports.connect = Scanner.connect;