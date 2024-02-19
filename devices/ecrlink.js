var spawn               = require('child_process').spawn;

// MISC FUNCTIONS
function lpad(str, total, pad)
{
	str = '' + str;
	var left = '';
	var i = 0;
	while(i < total) { left += pad; i++; };
	return (left + str).substring(str.length);	
}
var config = {};
var io = {};
var ECRLINK = ECRLINK || {};

ECRLINK.options = {
	ipaddr 		: '192.168.8.245',
	port 		: '80',
	timeout 	: '45'
};

ECRLINK.init = function(cf, clientio)
{
	config = cf;
	io = clientio;
};

/**
 * Sends response message back to POS.
 * @param res
 * @param statusCode
 * @param statusMsg
 * @param contentType
 * @param body
 */
ECRLINK.sendResponse = function(res, statusCode, statusMsg, contentType, body) {
	try
	{
		res.writeHead(statusCode, statusMsg, { 'Content-Type': contentType });
	}
	catch(e)
	{
		console.log("Cannot send ECRLINK Response: " + e);
	}
	finally
	{
		res.end(body);
		res.end();
	}
};

ECRLINK.processECR = function(req, res)
{
	// CONSTRUCT MESSAGE
	var reqMsg = '';
	var respObj = null;

	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth() + 1;

	var yyyy = today.getFullYear();
	if(dd < 10) dd = '0' + dd; 
	if(mm < 10) mm = '0' + mm;
	var dtime = '' + yyyy + mm + dd;

	console.log('PROCESS ECR REQ:');

	req.on('data', function(data) 
	{
		var reqData = JSON.parse(data);
		console.log(reqData);
		switch(reqData.transactionType.toLowerCase())
		{
			case 'inquiry': // TOTAL LENGTH 19 char
				reqMsg += '02'; 			// 2 char
				reqMsg += lpad(reqData.posId, 5, '0'); 	// 5 char
				reqMsg += reqData.transactionId.substr(-4);		// 4 char
				reqMsg += dtime;			// 8 char
				break;
			case 'sale': case 'zepro': // TOTAL LENGTH 31 char
				reqMsg += '03'; 			// 2 char
				reqMsg += lpad(reqData.transactionAmount, 12, '0');	// 12 char
				reqMsg += lpad(reqData.posId, 5, '0'); 	// 5 char
				reqMsg += reqData.transactionId.substr(-4);		// 4 char
				reqMsg += dtime;			// 8 char
				break;
			case 'void': // TOTAL LENGTH 17 char
				reqMsg += '04'; 				// 2 char
				reqMsg += lpad(reqData.traceNumber, 6, '0');	// 6 char
				reqMsg += lpad(reqData.posId, 5, '0'); 		// 5 char
				reqMsg += reqData.transactionId.substr(-4);			// 4 char
				break;
		}

		// SPAWN FOR MESSAGE PROCESSING
		console.log('ECRLINK REQUEST MESSAGE: ' + reqMsg);
	        //var ecrlink    = spawn('./ecrdriver', ['192.168.8.145','80','45','0300000001000001234123220130521']);
		var connString = config.device.edc.split(':');
		console.log('ECRLINK CONN STRING: ' + JSON.stringify(connString));
	        var ecrlink    = spawn('./ecrdriver', [connString[0], connString[1], '45', reqMsg]);
	        ecrlink.stdout.on('data', function(data)
        	{
			// EDC RESPONSE PROCESSING
			var output = ('' + data).trim();
		
			if(output == '99')
			{
       	 			//res.writeHead('400', 'Bad Request', { 'Content-Type': 'application/json;charset=UTF-8' }, JSON.stringify(respObj));
				//res.end();
				respObj = {'returnCode' : '99'};
				io.sockets.emit('EFTData', respObj);
				console.log('ECRLINK Failed to process request');
				return false;
			}
		
			var cmdType = output.substring(2,4);
			console.log('ECRLINK RESP: ' + output);
			switch(cmdType)
			{
				case '02':
					respObj = 
					{
						'type'		: 'INQUIRY',
						'posNumber'	: output.substring(4,9),
						'transactionId'	: output.substring(9,13),
						'terminalId'	: output.substring(13,21),
						'merchantId'	: output.substring(21,36),
						'cardNum'	: output.substring(36)
					}
					break;
				case '03':
					respObj = 
					{
						'type'			: 'SALE',
						'posId'			: output.substring(4,9),
						'transactionId'		: output.substring(9,13),
						'terminalId'		: output.substring(13,21),
						'merchantId'		: output.substring(21,36),
						'transactionType'	: output.substring(36,38),
						'transactionDate'	: output.substring(38,46),
						'transactionTime'	: output.substring(46,52),
						'cardNum'		: output.substring(52,68),
						'cardHolder'		: output.substring(68,98),
						'bankId'		: output.substring(98,100),
						'cardType'		: output.substring(100,102),
						'stan'			: output.substring(102,108),
						'traceNum'		: output.substring(108,114),
						'approvalCode'		: output.substring(114,120),
						'referenceCode'		: output.substring(120,132),
						'transactionAmount'	: output.substring(132,144),
						'cardFlag'		: output.substring(144,145),
						'withdrawalType'	: output.substring(145,147),
						'withdrawalAmount'	: output.substring(147,159),
						'addlPaymentType'	: output.substring(159,161),
						'addlPaymentAmount'	: output.substring(161,173),
						'planNo'		: output.substring(173,185),
						'period'		: output.substring(185,197),
						'batchNum'		: output.substring(197)
					}
					break;
				case '04':
					respObj = 
					{
						'type'			: 'VOID',
						'posId'			: output.substring(4,9),
						'transactionId'		: output.substring(9,13),
						'terminalId'		: output.substring(13,21),
						'merchantId'		: output.substring(21,36),
						'transactionType'	: output.substring(36,38),
						'transactionDate'	: output.substring(38,46),
						'transactionTime'	: output.substring(46,52),
						'cardNum'		: output.substring(52,68),
						'cardHolder'		: output.substring(68,98),
						'bankId'		: output.substring(98,100),
						'cardType'		: output.substring(100,102),
						'stan'			: output.substring(102,108),
						'traceNum'		: output.substring(108,114),
						'approvalCode'		: output.substring(114,120),
						'referenceCode'		: output.substring(120,132),
						'transactionAmount'	: output.substring(132,144),
						'cardFlag'		: output.substring(144,145),
						'withdrawalType'	: output.substring(145,147),
						'withdrawalAmount'	: output.substring(147,159),
						'addlPaymentType'	: output.substring(159,161),
						'addlPaymentAmount'	: output.substring(161,173),
						'planNo'		: output.substring(173,185),
						'period'		: output.substring(185,197),
						'batchNum'		: output.substring(197)
					}
					break;
			}
	
			respObj['returnCode'] = '00';	
			// SEND RESPONSE
			io.sockets.emit('EFTData', respObj);
			return true;
       	 	});

 	        ecrlink.stderr.on('data', function(data)
		{
       	 		//res.writeHead('400', 'Bad Request', { 'Content-Type': 'application/json;charset=UTF-8' }, JSON.stringify(respObj));
			//res.end();
	        	console.log('ECRLINK Driver Process Error: ' + data);
			respObj = {'returnCode': '99'};
			io.sockets.emit('EFTData', respObj);
			return false;
       		});

	        ecrlink.on('exit', function(data)
		{
	        	console.log('ECRLINK Driver Process Done');
		});
       	 	
	});
	res.writeHead('200', 'OK', { 'Content-Type': 'application/json;charset=UTF-8' });
	res.end();
};

/*exports.paymentGateway = function(req, res)
{
	req.on('data', function(data) 
	{
		//write/push data to edc terminal.

		ECRLINK. function(err, results) 
		{
			if(err)
			{
				console.log(messages.TRANSMISSION_ERROR);
				console.log(err);
				ECRLINK.sendResponse(res, 400, 'Bad Request', 'application/json;charset=UTF-8'
						, JSON.stringify({msg:messages.TRANSMISSION_ERROR}));
				return false;
			} 
			else if (results)
			{
				console.log(messages.TRANSMISSION_SUCCESS);
				ECRLINK.sendResponse(res, 200, 'OK', 'application/json;charset=UTF-8'
						, JSON.stringify({msg: messages.TRANSMISSION_SUCCESS}));
				return true;
			} else {
				res.end();
			}
		});
		return true;
	});
};*/

exports.processECR = ECRLINK.processECR;
exports.init = ECRLINK.init;
