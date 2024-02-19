/**
 * Exist Global Inc.
 * @Author mperez@exist.com
 */
var constants = require("../possapp.proxy.constants");
var messages = require('../possapp.proxy.messages');
var fs = require('fs');
var shell = require('shelljs');

var CashDrawer = CashDrawer || {};

CashDrawer.ibm = {};

CashDrawer.ibm.openDrawer = function(req, res){
	try{
		console.log('Opening cash drawer.');
		//sends the OPEN command to a specific file.
		shell.echo(constants.DEVICE.IBM.DRAWER_OPEN_COMMAND).to(constants.DEVICE.IBM.DRAWER_COMMAND_INPUT_FILE);
		res.send({
			isExecuted	: true,
			message		: "Opening cash drawer."
		});
	} catch (err){
		console.log(err);
		res.send("Failed to open cash drawer.");
	}
};

CashDrawer.ibm.checkDrawerStatus = function(req, res){
    try{
        console.log('Checking drawer status.');
        fs.readFile(constants.DEVICE.IBM.DRAWER_STATUS_OUTPUT_FILE, function (err, data) {
        	var isDrawerClose = true;
	        if (err){
	        		console.log(err);
	                throw err;
	        }
	        if(data.readUInt8(0) === 49){
	        	//if value is 1; drawer is open
	        	isDrawerClose = false;
	        	CashDrawer.sendResponse(res, 200, 'OK', 'application/json;charset=UTF-8'
        			, JSON.stringify({isClose : isDrawerClose, success: true, msg:messages.DEVICE.IBM.DRAWER_STATUS_CHECK_SUCCESS}));
	        } else if(data.readUInt8(0) === 48){
	        	//if value is 1; drawer is close
	        	isDrawerClose = true;
	        	CashDrawer.sendResponse(res, 200, 'OK', 'application/json;charset=UTF-8'
        			, JSON.stringify({isClose : isDrawerClose, success: true, msg:messages.DEVICE.IBM.DRAWER_STATUS_CHECK_SUCCESS}));
	        } else {
	        	//Value should always be 0/1
	        	throw err;
	        }
        });
    } catch (err){
    	console.log(err);
    	CashDrawer.sendResponse(res, 400, 'Bad Request', 'application/json;charset=UTF-8'
    		, JSON.stringify({isClose : true, success: false, msg:messages.IBM.DRAWER_STATUS_CHECK_ERROR}));
    }
};

/**
 * Sends response message back to POS.
 * @param res
 * @param statusCode
 * @param statusMsg
 * @param contentType
 * @param body
 */
CashDrawer.sendResponse = function(res, statusCode, statusMsg, contentType, body) {
	res.writeHead(statusCode, statusMsg, { 'Content-Type': contentType });
	res.end(body);
};

exports.openDrawer = CashDrawer.ibm.openDrawer;
exports.checkDrawerStatus = CashDrawer.ibm.checkDrawerStatus;