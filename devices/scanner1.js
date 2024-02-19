/**
 * Serial Port Barcode Scanner Listener
 * Set barcode scanner configuration to RS232 default settings.
 */
var http = require('http');
var fs = require('fs');
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var config = require(".././config/config.js");

//checks if proxy is running at test mode.
config = config.getConnection();
//device port
var devicePath = config.device.scanner;
console.log("scanner:"+devicePath);

//raw data buffer
var myParser = function(emitter, buffer) {
	emitter.emit("data", buffer);
};

//create instance of serial device
var serial_port = new SerialPort(devicePath, {
	parser:myParser
});

//listener when barcode scanner is trigger
exports.scan_barcode = function(io) {
	serial_port.on("open", function () {
		console.log('scanner is ready.');
		var barcode = [];//create barcode array
		serial_port.on('data', function (data) {
			for(var ctr=0; ctr<data.length;ctr++){
				//add each numeric raw data to barcode array
				if(data[ctr]>=48 && data[ctr]<=57){
					barcode.push(data[ctr]);
				}
				//emit barcode when raw data is carriage return.
				if(data[ctr] == 13){
					var buf = new Buffer(barcode);
					console.log(buf.toString('ascii'));
					io.sockets.emit('scanBarcode', buf.toString('ascii'));
					barcode = [];//reset barcode to empty array.
				}
			}
		});
	});
};
