/**
 * Serial Device EDC Terminal Interface
 * RS232 Serial Configuration.
 */
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var messages   = require('.././possapp.proxy.messages.js');
//var config = require(".././config/config.js");
var config = {};

var EDC = EDC || {};

EDC.serialPort;
EDC.dataArray = [];
EDC.ctr = 0;
EDC.options = {
	parser 		: serialport.parsers.raw,
	baudrate 	: 38400,
	databits 	: 8,
	parity 		: 'none',
	stopbits 	: 1,
};

EDC.connect = function(cf, path){
	config = cf;
	EDC.serialPort = new SerialPort(path,  {
		parser		: EDC.options.parser,
		baudrate 	: EDC.options.baudrate,
		databits 	: EDC.options.databits,
		parity 		: EDC.options.parity,
		stopbits	: EDC.options.stopbits
	}, false);

	EDC.serialPort.open(function (err) {
		if(err)
			console.log(err);
	});

	//open serial port connection
	EDC.serialPort.on("open", function() {
		console.log(messages.INIT_EDC_MSG);
	});
};

/**
 * Sends response message back to POS.
 * @param res
 * @param statusCode
 * @param statusMsg
 * @param contentType
 * @param body
 */
EDC.sendResponse = function(res, statusCode, statusMsg, contentType, body) {
	try
	{
		res.writeHead(statusCode, statusMsg, { 'Content-Type': contentType });
	}
	catch(e)
	{
		console.log("Cannot send EDC Response: " + e);
	}
	finally
	{
		res.end(body);
		res.end();
	}
};

/**
 * Pass data to buffer obj; this manipulates data to specific (hex, utf8 etc.)streams.
 * See nodejs documentation for buffer obj.
 * @param data - data to place in buffer object
 * @param type - type of encoding; hex, utf8, utf16le;
 * @returns {Buffer}
 */
EDC.toBuffer = function(data, type){
	console.log("EDC Request Data: "+ data);
	return new Buffer(data, type);
};

/**
 * Function to emit data from edc to pos.
 */
EDC.emitEftData = function(io){
	//set delay to emit data that is collected from bulk data
	setTimeout(function(){
		console.log("EDC Response Data: " + toHexString(EDC.dataArray));
		EDC.ctr = 0;
		io.sockets.emit('EFTData', EDC.dataArray);
		EDC.dataArray = [];
	}, 2000);
};

/**
 * Process request from eft online function and
 * sends response back to pos.
 */
exports.paymentGateway = function(req, res){
	req.on('data', function(data) {
		//write/push data to edc terminal.

		//EDC.sendResponse(res, 200, 'OK', 'application/json;charset=UTF-8', JSON.stringify({msg: messages.TRANSMISSION_SUCCESS}));
		//return true;

		EDC.serialPort.write(EDC.toBuffer(JSON.parse(data), 'hex'), function(err, results) {
			if(err){
				console.log(messages.TRANSMISSION_ERROR);
				console.log(err);
				EDC.sendResponse(res, 400, 'Bad Request', 'application/json;charset=UTF-8'
						, JSON.stringify({msg:messages.TRANSMISSION_ERROR}));
				return false;
			} else if (results){
				console.log(messages.TRANSMISSION_SUCCESS);
				EDC.sendResponse(res, 200, 'OK', 'application/json;charset=UTF-8'
						, JSON.stringify({msg: messages.TRANSMISSION_SUCCESS}));
				return true;
			} else {
				res.end();
			}
		});
		return true;
	});
};

/**
 * Function to get response message from bank.
 * @param io - websocket obj
 */
exports.getEdcResponse = function(io){
	//listener that reads data from serial port
	EDC.serialPort.on('data', function(data) {
		//push each data to array
		for(var i = 0; i < data.length; i ++){
			EDC.dataArray.push(data[i]);
		}
		// trap message that is sent separately
		if(EDC.ctr === 0){
			// emit data function
			EDC.emitEftData(io);
			EDC.ctr++;
		}
	});
};

function toHexString(msgArr){
	msgHex ="", charHex ="";
	for(var i=0; i < msgArr.length; i++){
		charHex = msgArr[i].toString(16);
		charHex = ("00" + charHex).substring(0 + charHex.length, 2 + charHex.length);
		msgHex += charHex;
	}
	return msgHex;
}

exports.connect = EDC.connect;
