/*********************************************
 * EFT Detail Transaction Init Transaction
 ********************************************/
var EFTDetailTransactionReport = function(params){
	for(var prop in params){
		this[prop] =  params[prop];
	}
};

/**
 * Request
 */
EFTDetailTransactionReport.prototype.createRequestMessageToEdc = function(){
	uilog("DBUG","createRequestMessageToEdc() -- execute");
	var requestType = CONSTANTS.EFT.MSG_TYPE.REQUEST;
	var transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE[this.transactionType].desc;
	var requestMessageStrBuffer = "";

	this.requestParams = getEftMessageParamsByRequestAndTransactionType(requestType, transactionType);
	this.requestValues = getEftRequestValuesByTransactionType(this);

	var requestMessageArrMap = mapRequestValuesToEftRequestMessageParam(this.requestParams, this.requestValues, EFT.detailTransactionReport);

	if(this.vendor.toLowerCase() == CONSTANTS.EFT.VENDOR.WIRECARD.name.toLowerCase()){
		requestMessageStrBuffer = stringifyRequestMessageFromWirecard(requestMessageArrMap);
	} else if (eftConfigObj.vendorName.toLowerCase() == CONSTANTS.EFT.VENDOR.KARTUKU.name.toLowerCase()){
		//KARTUKU and other banks
	}

	return requestMessageStrBuffer;
};

/**
 * Response
 */
EFTDetailTransactionReport.prototype.parseResponseMessageFromEdc = function(rawMsg){
	uilog("DBUG","parseResponseMessageFromEdc() -- execute");
	var requestType = CONSTANTS.EFT.MSG_TYPE.RESPONSE;
	var transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE[this.transactionType].desc;

	this.responseParams = getEftMessageParamsByRequestAndTransactionType(requestType, transactionType);

	if(this.vendor.toLowerCase() == CONSTANTS.EFT.VENDOR.WIRECARD.name.toLowerCase()) {
		this.responseValues = buildResponseMessageFromWirecard(rawMsg);
		var returnCode = isResponseMessageReturnCodeOnly(this.responseValues);
		if(returnCode){
			processReturnCodeFromWirecard(returnCode);
		} else {
			EFT.processDetailTransactionReport(this.responseParams, this.responseValues);
		}
	}
};

/*********************************************
 * EFT Detail Transaction Detail Report
 **********************************************/
var EFTDetailTransactionDataReport = function(params){
	for(var prop in params){
		this[prop] =  params[prop];
	}
};

/**
 * Request
 */
EFTDetailTransactionDataReport.prototype.createRequestMessageToEdc = function(){
	uilog("DBUG","createRequestMessageToEdc() -- execute");
	var requestType = CONSTANTS.EFT.MSG_TYPE.REQUEST;
	var transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE[this.transactionType].desc;
	var requestMessageStrBuffer = "";

	this.requestParams = getEftMessageParamsByRequestAndTransactionType(requestType, transactionType);
	this.requestValues = getEftRequestValuesByTransactionType(this);

	var requestMessageArrMap = mapRequestValuesToEftRequestMessageParam(this.requestParams, this.requestValues,  EFT.detailTransactionDataReport);

	if(this.vendor.toLowerCase() == CONSTANTS.EFT.VENDOR.WIRECARD.name.toLowerCase()){
		requestMessageStrBuffer = stringifyRequestMessageFromWirecard(requestMessageArrMap);
	} else if (eftConfigObj.vendorName.toLowerCase() == CONSTANTS.EFT.VENDOR.KARTUKU.name.toLowerCase()){
		//KARTUKU and other banks
	}

	return requestMessageStrBuffer;
};

/**
 * Response
 */
EFTDetailTransactionDataReport.prototype.parseResponseMessageFromEdc = function(rawMsg){
	uilog("DBUG","parseResponseMessageFromEdc() -- execute");
	var requestType = CONSTANTS.EFT.MSG_TYPE.RESPONSE;
	var transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE[this.transactionType].desc;

	this.responseParams = getEftMessageParamsByRequestAndTransactionType(requestType, transactionType);

	if(this.vendor.toLowerCase() == CONSTANTS.EFT.VENDOR.WIRECARD.name.toLowerCase()) {
		this.responseValues = buildResponseMessageFromWirecard(rawMsg);
		var returnCode = isResponseMessageReturnCodeOnly(this.responseValues);
		if(returnCode){
			processReturnCodeFromWirecard(returnCode);
		} else {
			EFT.processDetailTransactionDataReport(this.responseParams, this.responseValues);
		}
	}
};

/*********************************************
 * EFT Detail Transaction Detail Report Total
 *********************************************/
var EFTDetailTransactionTotalReport = function(params){
	for(var prop in params){
		this[prop] =  params[prop];
	}
};

/**
 * Request
 */
EFTDetailTransactionTotalReport.prototype.createRequestMessageToEdc = function(){
	uilog("DBUG","createRequestMessageToEdc() -- execute");
	var requestType = CONSTANTS.EFT.MSG_TYPE.REQUEST;
	var transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE[this.transactionType].desc;
	var requestMessageStrBuffer = "";

	this.requestParams = getEftMessageParamsByRequestAndTransactionType(requestType, transactionType);
	this.requestValues = getEftRequestValuesByTransactionType(this);

	var requestMessageArrMap = mapRequestValuesToEftRequestMessageParam(this.requestParams, this.requestValues, EFT.detailTransactionTotalReport);

	if(this.vendor.toLowerCase() == CONSTANTS.EFT.VENDOR.WIRECARD.name.toLowerCase()){
		requestMessageStrBuffer = stringifyRequestMessageFromWirecard(requestMessageArrMap);
	} else if (eftConfigObj.vendorName.toLowerCase() == CONSTANTS.EFT.VENDOR.KARTUKU.name.toLowerCase()){
		//KARTUKU and other banks
	}

	return requestMessageStrBuffer;
};

/**
 * Response
 */
EFTDetailTransactionTotalReport.prototype.parseResponseMessageFromEdc = function(rawMsg){
	uilog("DBUG","parseResponseMessageFromEdc() -- execute");
	var requestType = CONSTANTS.EFT.MSG_TYPE.RESPONSE;
	var transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE[this.transactionType].desc;
	uilog("DBUG","@requestType: "+ requestType);
	uilog("DBUG","@transactionType" + transactionType);
	this.responseParams = getEftMessageParamsByRequestAndTransactionType(requestType, transactionType);

	if(this.vendor.toLowerCase() == CONSTANTS.EFT.VENDOR.WIRECARD.name.toLowerCase()) {
		this.responseValues = buildResponseMessageFromWirecard(rawMsg);
		var returnCode = isResponseMessageReturnCodeOnly(this.responseValues);
		if(returnCode){
			processReturnCodeFromWirecard(returnCode);
		} else {
			EFT.processDetailTransactionCardTotalReport(this.responseParams, this.responseValues);
		}
	}
};


/***************************************
 * Print Detail Transaction  - Start
 ***************************************/
EFT.processDetailTransactionReport = function(responseParams, responseMessages){
	uilog("DBUG","EFT.processDetailTransactionReport() -- execute");

	//map response messages to model
	mapResponseMessageToObjectModel(responseParams, responseMessages, EFT.detailTransactionReport);

	EFT.settledHostCount 		= 0;
	EFT.unsettledHostCount		= parseInt(EFT.detailTransactionReport.hostTotal) || 0;

	if(EFT.unsettledHostCount > 0){
		//create intance of detail transaction report list array
		EFT.detailTransactionReportHostList.getInstance();
		EFT.requestDetailTransactionReportByHost();
	}else if(EFT.unsettledHostCount == 0){
		showMsgDialog(getMsgValue("eft_msg_err_no_host_to_report"), "warning");
		clearEFT(true);
	}
};

EFT.requestDetailTransactionReportByHost = function(){
	var persistDetailReport = true;
	if(EFT.unsettledHostCount > 0){
		persistDetailReport = false;
		//create detail transaction data & total list
		EFT.detailTransactionDataReportList = [];
		EFT.detailTransactionTotalReportList = [];
		EFT.requestDetailTransactionDataReport();
	}

	if(persistDetailReport){
		EFT.saveDetailTransactionReport();
	}
};

EFT.saveDetailTransactionReport = function(){
	uilog("DBUG","saveDetailTransactionReport() -- execute");
	var detailTransactionReportList =  EFT.detailTransactionReportHostList.getInstance().getDetailTransactionReportHostList();

	if(detailTransactionReportList && detailTransactionReportList.length > 0){
		$.ajax({
			url : posWebContextPath + "/eft/saveEftTransactionDetailReport",
			type : "POST",
			async: false,
			dataType: "json",
			contentType : "application/json",
			data: JSON.stringify(EFT.convertDetailReportToDTO(detailTransactionReportList)),
			success : function(isSuccess) {
				if(isSuccess){
					//print
					printReceipt({
						header : setReceiptHeader(saleTx),
						eftDetailTransactionReport : setReceiptEftDetailTransactionReport(detailTransactionReportList),
                        isQueued : true
					});
					showMsgDialog("Eft detail report is succesfully saved.", "info", clearEFT(true));
				}
			},
			error : function(jqXHR, status, error) {
				showMsgDialog("Error on saving transaction detail report.", "error", clearEFT(true));
			}
		});
	}
};

EFT.convertDetailReportToDTO = function(txnDetailReportList){
	uilog("DBUG","convertDetailReportToDTO() -- execute");

	var detailDataRpts = txnDetailReportList[0].detailTransactionDataReportList[0];

	var eftTransactionReport = {
		transactionType 					: CONSTANTS.EFT.REPORT_TRANSACTION_TYPE.DETAIL_REPORT,
		eftTransactionSummaryReports 		: [],
		eftTransactionSettlementReports 	: [],
		eftTransactionDetailReports 		: [],
		eftTransactionDetailTotalReports 	: []
	};

	//adds common fields to summary report to parent dto
	for(var prop in eftOnlineObj.requestValues){
		eftTransactionReport[prop] = detailDataRpts[prop];
	}

	for(var ctr = 0; ctr < txnDetailReportList.length; ctr++){
		var detailTxnDataReportList = txnDetailReportList[ctr].detailTransactionDataReportList;
		var detailTxnTotalReportList = txnDetailReportList[ctr].detailTransactionTotalReportList;

		//removes common fields from detail report to child dto
		for(var ctr1 = 0 ; ctr1 < detailTxnDataReportList.length; ctr1 ++){
			for(var prop in eftOnlineObj.requestValues){
				delete detailTxnDataReportList[ctr1][prop];
			}
		}

		//removes common fields from detail total report to child dto
		for(var ctr2 = 0 ; ctr2 < detailTxnTotalReportList.length; ctr2 ++){
			for(var prop in eftOnlineObj.requestValues){
				delete detailTxnTotalReportList[ctr2][prop];
			}
		}

		eftTransactionReport.eftTransactionDetailReports = eftTransactionReport.eftTransactionDetailReports.concat(detailTxnDataReportList);
		eftTransactionReport.eftTransactionDetailTotalReports = eftTransactionReport.eftTransactionDetailTotalReports.concat(detailTxnTotalReportList);
	}

	return eftTransactionReport;
};

/**
 * Request detail transaction data report
 */
EFT.requestDetailTransactionDataReport = function(){
	eftTransactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN_BY_HOST.name;

	var eftParams = {
			bank			: configuration.banks[CONSTANTS.EFT.BANK.BANK_MEGA.name],
			onlineFlag		: CONSTANTS.EFT.STATUS.ONLINE,
			transactionType : eftTransactionType,
			vendor 			: eftVendor
	};

	EFT.processEFTOnlineTransaction(eftParams);
	$("#eft-processing-dialog").dialog("open");
};

EFT.processDetailTransactionDataReport = function(responseParams, responseMessages){
	uilog("DBUG","EFT.processDetailTransactionDataReport() -- execute");
	uilog("DBUG","@@Detail Transaction Report Txn Data: "+ JSON.stringify(responseMessages));
	var detailData, detailTotal;

	//map response messages to model
	mapResponseMessageToObjectModel(responseParams, responseMessages, EFT.detailTransactionDataReport);

	//parse detail data
	if(EFT.detailTransactionDataReport.hasOwnProperty(CONSTANTS.EFT.MSG_PARAM.DETAIL_DATA.property)){
		detailData = EFT.parseDetailDataParam(EFT.detailTransactionDataReport[CONSTANTS.EFT.MSG_PARAM.DETAIL_DATA.property]);
		EFT.detailTransactionDataReport.updateDetailTransactionDataReportModel(detailData);
		delete EFT.detailTransactionDataReport[CONSTANTS.EFT.MSG_PARAM.DETAIL_DATA.property];
	}

	//parse detail total
	if(EFT.detailTransactionDataReport.hasOwnProperty(CONSTANTS.EFT.MSG_PARAM.DETAIL_TOTAL.property)){
		detailTotal = EFT.parseDetailTotalParam(EFT.detailTransactionDataReport[CONSTANTS.EFT.MSG_PARAM.DETAIL_TOTAL.property]);
		EFT.detailTransactionDataReport.updateDetailTransactionDataReportModel(detailTotal);
		delete EFT.detailTransactionDataReport[CONSTANTS.EFT.MSG_PARAM.DETAIL_TOTAL.property];
	}

	//format data
	EFT.formatDetailTransactionDataReport();

	//add the data to detailTransactionDataReportList
	EFT.detailTransactionDataReportList.push(cloneObject(EFT.detailTransactionDataReport));

	if(CONSTANTS.EFT.END_OF_TRANSMISSION.END === parseInt(EFT.detailTransactionDataReport.etx)){
		//Request next detail transaction total report
		EFT.requestDetailTransactionTotalReport();
	} else {
		//Request next detail transaction detail report
		EFT.requestDetailTransactionDataReport();
	}
};

//Formats detail transaction date report data to be more readable.
EFT.formatDetailTransactionDataReport = function (){
	if(EFT.detailTransactionDataReport){
		EFT.detailTransactionDataReport.transactionDate 		= $.datepicker.formatDate('dd/mm/yy', new Date());
		EFT.detailTransactionDataReport.transactionTime 		= EFT.formatTime(EFT.detailTransactionDataReport.transactionTime);
		EFT.detailTransactionDataReport.hostType				= EFT.getHostTypeDesc(EFT.detailTransactionDataReport.hostType);
		EFT.detailTransactionDataReport.expDate					= EFT.detailTransactionDataReport.expDate.substr(0,2) + "/" + EFT.detailTransactionDataReport.expDate.substr(2,2);
		EFT.detailTransactionDataReport.cashierId				= loggedInUsername;
		EFT.detailTransactionDataReport.storeCode				= removeLeadingZeroes(EFT.detailTransactionDataReport.storeCode);
		//sets posId equal to pos number
		EFT.detailTransactionDataReport.posId 					= configuration.terminalNum === undefined ? null : configuration.terminalNum;
	}
};

EFT.requestDetailTransactionTotalReport = function (){
	uilog("DBUG","EFT.requestDetailTransactionTotalReport() -- execute");
	eftTransactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN_BY_CARD.name;

	var eftParams = {
		bank			: configuration.banks[CONSTANTS.EFT.BANK.BANK_MEGA.name],
		onlineFlag		: CONSTANTS.EFT.STATUS.ONLINE,
		transactionType : eftTransactionType,
		vendor 			: eftVendor
	};

	EFT.processEFTOnlineTransaction(eftParams);
	$("#eft-processing-dialog").dialog("open");
};

EFT.processDetailTransactionCardTotalReport = function(responseParams, responseValues){
	uilog("DBUG","EFT.processDetailTransactionCardTotalReport() -- execute");
	var cardTypeData, cardTypeTotal;

	//map response messages to model
	mapResponseMessageToObjectModel(responseParams, responseValues, EFT.detailTransactionTotalReport);

	//parse detail data
	if(EFT.detailTransactionTotalReport.hasOwnProperty(CONSTANTS.EFT.MSG_PARAM.CARD_TYPE_DATA.property)){
		cardTypeData = EFT.parseCardTypeDataParam(EFT.detailTransactionTotalReport[CONSTANTS.EFT.MSG_PARAM.CARD_TYPE_DATA.property]);
		EFT.detailTransactionTotalReport.updateDetailTransactionTotalReportModel(cardTypeData);
		delete EFT.detailTransactionTotalReport[CONSTANTS.EFT.MSG_PARAM.CARD_TYPE_DATA.property];
	}

	//parse detail total
	if(EFT.detailTransactionTotalReport.hasOwnProperty(CONSTANTS.EFT.MSG_PARAM.CARD_TYPE_TOTAL.property)){
		cardTypeTotal = EFT.parseCardTypeTotalParam(EFT.detailTransactionTotalReport[CONSTANTS.EFT.MSG_PARAM.CARD_TYPE_TOTAL.property]);
		EFT.detailTransactionTotalReport.updateDetailTransactionTotalReportModel(cardTypeTotal);
		delete EFT.detailTransactionTotalReport[CONSTANTS.EFT.MSG_PARAM.CARD_TYPE_TOTAL.property];
	}

	//format data
	EFT.formatDetailTransactionTotalReport();

	//add the data to detailTransactionDataReportList
	EFT.detailTransactionTotalReportList.push(cloneObject(EFT.detailTransactionTotalReport));

	if(CONSTANTS.EFT.END_OF_TRANSMISSION.END === parseInt(EFT.detailTransactionTotalReport.etx)){

		var detailTxnReportList = EFT.detailTransactionReportHostList.getInstance();
		detailTxnReportList.addDetailTransactionReportHostList({
			detailTransactionDataReportList: cloneObject(EFT.detailTransactionDataReportList),
			detailTransactionTotalReportList: cloneObject(EFT.detailTransactionTotalReportList)
		});

		EFT.settledHostCount ++;
		EFT.unsettledHostCount --;

		EFT.requestDetailTransactionReportByHost();
	} else {
		//get next detail transaction data
		EFT.requestDetailTransactionTotalReport();
	}
};

//Formats transaction summary report data to be more readable
EFT.formatDetailTransactionTotalReport = function (){
	if(EFT.detailTransactionTotalReport){
		EFT.detailTransactionTotalReport.transactionDate 		= $.datepicker.formatDate('dd/mm/yy', new Date());
		EFT.detailTransactionTotalReport.transactionTime 		= EFT.formatTime(EFT.detailTransactionTotalReport.transactionTime);
		EFT.detailTransactionTotalReport.hostType				= EFT.getHostTypeDesc(EFT.detailTransactionTotalReport.hostType);
		EFT.detailTransactionTotalReport.cashierId				= loggedInUsername;
		EFT.detailTransactionTotalReport.storeCode				= removeLeadingZeroes(EFT.detailTransactionTotalReport.storeCode);
		//sets posId equal to pos number
		EFT.detailTransactionTotalReport.posId 					= configuration.terminalNum === undefined ? null : configuration.terminalNum;
	}
};


/**
 * Wirecard Specs:
 * Parse Detail Data and assign it to each property.
 */
EFT.parseDetailDataParam = function(propertyValue){
	var detailData = {};
	var detailDataArr = propertyValue.split(";");
	for(var ctr = 0; ctr < detailDataArr.length; ctr ++){
		if(ctr == 0){
			detailData[CONSTANTS.EFT.DETAIL_DATA_PROPERTIES.CARD_NAME] = detailDataArr[ctr];
		} else if(ctr == 1){
			detailData[CONSTANTS.EFT.DETAIL_DATA_PROPERTIES.CARD_NUM] = detailDataArr[ctr];
		} else if(ctr == 2){
			detailData[CONSTANTS.EFT.DETAIL_DATA_PROPERTIES.EXP_DATE] = detailDataArr[ctr];
		} else if(ctr == 3){
			detailData[CONSTANTS.EFT.DETAIL_DATA_PROPERTIES.INVOICE_NUM] = detailDataArr[ctr];
		} else if(ctr == 4){
			detailData[CONSTANTS.EFT.DETAIL_DATA_PROPERTIES.TRANSACTION] = detailDataArr[ctr];
		} else if(ctr == 5){
			detailData[CONSTANTS.EFT.DETAIL_DATA_PROPERTIES.AMOUNT] = Number(detailDataArr[ctr]) || 0;
		} else if(ctr == 6){
			detailData[CONSTANTS.EFT.DETAIL_DATA_PROPERTIES.APPROVAL_CODE] = detailDataArr[ctr];
		}
	}
	return detailData;
};

/**
 * Wirecard Specs:
 * Parse Detail Total and assign it to each property.
 */
EFT.parseDetailTotalParam = function(propertyValue){
	var detailTotal = {};
	var detailTotalArr = propertyValue.split(";");
	for(var ctr = 0; ctr < detailTotalArr.length; ctr ++){
		if(ctr == 0){
			detailTotal[CONSTANTS.EFT.DETAIL_TOTAL_PROPERTIES.SALE_COUNT] = Number(detailTotalArr[ctr]) || 0;
		} else if(ctr == 1){
			detailTotal[CONSTANTS.EFT.DETAIL_TOTAL_PROPERTIES.SALE_TOTAL] = Number(detailTotalArr[ctr]) || 0;
		} else if(ctr == 2){
			detailTotal[CONSTANTS.EFT.DETAIL_TOTAL_PROPERTIES.TIP_COUNT] = Number(detailTotalArr[ctr]) || 0;
		} else if(ctr == 3){
			detailTotal[CONSTANTS.EFT.DETAIL_TOTAL_PROPERTIES.TIP_TOTAL] = Number(detailTotalArr[ctr]) || 0;
		} else if(ctr == 4){
			detailTotal[CONSTANTS.EFT.DETAIL_TOTAL_PROPERTIES.REFUND_COUNT] = Number(detailTotalArr[ctr]) || 0;
		} else if(ctr == 5){
			detailTotal[CONSTANTS.EFT.DETAIL_TOTAL_PROPERTIES.REFUND_TOTAL] = Number(detailTotalArr[ctr]) || 0;
		} else if(ctr == 6){
			detailTotal[CONSTANTS.EFT.DETAIL_TOTAL_PROPERTIES.TOTAL_COUNT] = Number(detailTotalArr[ctr]) || 0;
		} else if(ctr == 7){
			detailTotal[CONSTANTS.EFT.DETAIL_TOTAL_PROPERTIES.TOTAL] = Number(detailTotalArr[ctr]) || 0;
		}
	}
	return detailTotal;
};

/**
 * Wirecard Specs:
 * Parse Card Type Data and assign it to each property.
 */
EFT.parseCardTypeDataParam = function(propertyValue){
	var cardTypeData = {};
	var cardTypeDataArr = propertyValue.split(";");
	for(var ctr = 0; ctr < cardTypeDataArr.length; ctr ++){
		if(ctr == 0){
			cardTypeData[CONSTANTS.EFT.CARD_TYPE_DATA_PROPERTIES.CARD_TYPE_NAME] = cardTypeDataArr[ctr];
		} else if(ctr == 1){
			cardTypeData[CONSTANTS.EFT.CARD_TYPE_DATA_PROPERTIES.CARD_TYPE_COUNT] = Number(cardTypeDataArr[ctr]) || 0;
		} else if(ctr == 2){
			cardTypeData[CONSTANTS.EFT.CARD_TYPE_DATA_PROPERTIES.CARD_TYPE_AMOUNT] = Number(cardTypeDataArr[ctr]) || 0;
		}
	}
	return cardTypeData;
};

/**
 * Wirecard Specs:
 * Parse Card Type Total and assign it to each property.
 */
EFT.parseCardTypeTotalParam = function(propertyValue){
	var cardTypeTotal = {};
	var cardTypeTotalArr = propertyValue.split(";");
	for(var ctr = 0; ctr < cardTypeTotalArr.length; ctr ++){
		if(ctr == 0){
			cardTypeTotal[CONSTANTS.EFT.CARD_TYPE_TOTAL_PROPERTIES.CARD_TYPE_TOTAL_COUNT] = Number(cardTypeTotalArr[ctr]) || 0;
		} else if(ctr == 1){
			cardTypeTotal[CONSTANTS.EFT.CARD_TYPE_TOTAL_PROPERTIES.CARD_TYPE_TOTAL_AMOUNT] = Number(cardTypeTotalArr[ctr]) || 0;
		}
	}
	return cardTypeTotal;
};
