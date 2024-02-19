/**********************
 * Settle All
 **********************/
var EFTSettleAllTransaction = function(params){
	for(var prop in params){
		this[prop] =  params[prop];
	}
};

EFTSettleAllTransaction.prototype.createRequestMessageToEdc = function(){
	uilog("DBUG","createRequestMessageToEdc() -- execute");
	var requestType = CONSTANTS.EFT.MSG_TYPE.REQUEST;
	var transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE[this.transactionType].desc;
	var requestMessageStrBuffer = "";

	this.requestParams = getEftMessageParamsByRequestAndTransactionType(requestType, transactionType);
	this.requestValues = getEftRequestValuesByTransactionType(this);

	var requestMessageArrMap = mapRequestValuesToEftRequestMessageParam(this.requestParams, this.requestValues, EFT.settlementAll);

	if(this.vendor.toLowerCase() == CONSTANTS.EFT.VENDOR.WIRECARD.name.toLowerCase()){
		requestMessageStrBuffer = stringifyRequestMessageFromWirecard(requestMessageArrMap);
	} else if (eftConfigObj.vendorName.toLowerCase() == CONSTANTS.EFT.VENDOR.KARTUKU.name.toLowerCase()){
		//TODO: kartuku and other vendor functions can start here to create req message.
	}

	return requestMessageStrBuffer;
};

EFTSettleAllTransaction.prototype.parseResponseMessageFromEdc = function(rawMsg){
	uilog("DBUG","parseResponseMessageFromEdc() -- execute");
	var requestType = CONSTANTS.EFT.MSG_TYPE.RESPONSE;
	var transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE[this.transactionType].desc;

	this.responseParams = getEftMessageParamsByRequestAndTransactionType(requestType, transactionType, true);

	if(this.vendor.toLowerCase() == CONSTANTS.EFT.VENDOR.WIRECARD.name.toLowerCase()) {
		this.responseValues = buildResponseMessageFromWirecard(rawMsg);
		var returnCode = isResponseMessageReturnCodeOnly(this.responseValues);
		if(returnCode){
			processReturnCodeFromWirecard(returnCode);
		} else {
			EFT.processSettlementAll(this.responseParams, this.responseValues);
		}
	}
};

/***************************
 * Settlement All
 ***************************/
EFT.processSettlementAll = function parseResponseFromSettlementAll(responseParams, responseValues){
	uilog("DBUG","processSettlementAll() -- execute");
    try{
        //map response data to EFT.settlementAll
        mapResponseMessageToObjectModel(responseParams, responseValues, EFT.settlementAll);

        EFT.settledHostCount 	= 0;
        EFT.unsettledHostCount 	= parseInt(EFT.settlementAll.hostTotal) || 0;
        EFT.hostTypeList 		= EFT.settlementAll.hostList.split(";");

        if(EFT.unsettledHostCount > 0){
            EFT.requestSettlementByHost(EFT.hostTypeList[EFT.settledHostCount]);
        }else if(EFT.unsettledHostCount == 0){
            showMsgDialog(getMsgValue("eft_msg_err_no_host_to_settle"), "warning");
            clearEFT(true);
        }
    } catch (err){
        uilog("DBUG", getMsgValue("eft_msg_err_no_host_to_settle"));
        clearEFT(true);
    }
};

/**
 * Settles transactions of edc by host if number of host > 0.
 *
 */
EFT.requestSettlementByHost = function(hostType){
	var persistSettledTxn = true;
	if(EFT.unsettledHostCount > 0){
		persistSettledTxn = false;
		EFT.settleByData();
	}

	if(persistSettledTxn){
		EFT.saveSettlement();
	}
};

/**
 * Saves settled host/data
 */
EFT.saveSettlement = function saveSettlement(){
	var settledTransactionList = EFT.settledTransactionList.getInstance().getSettledTransactionList();
	if(settledTransactionList && settledTransactionList.length > 0){
		$.ajax({
			url : posWebContextPath + "/eft/saveEftSettlementReport",
			type : "POST",
			async: false,
			dataType: "json",
			contentType : "application/json",
			data: JSON.stringify(EFT.convertSettlementReportToDTO(settledTransactionList)),
			success : function(isSuccess) {
				if(isSuccess){
					//print
					printReceipt({
						header : setReceiptHeader(saleTx),
						eftSettlementAll : setReceiptEftSettlementAll(settledTransactionList),
                        isQueued : true
					});
					showMsgDialog(getMsgValue("eft_msg_info_settlement_completed"), "info", clearEFT(true));
				}
			},
			error : function(jqXHR, status, error) {
				showMsgDialog("Settlement .", "info", clearEFT(true));
			}
		});
	}
};

EFT.convertSettlementReportToDTO = function(settledTransactionList){
	uilog("DBUG","convertSettlementReportToDTO() -- execute");
	var eftTransactionReport = {
			transactionType 					: CONSTANTS.EFT.REPORT_TRANSACTION_TYPE.SETTLEMENT,
			eftTransactionSummaryReports 		: [],
			eftTransactionSettlementReports 	: [],
			eftTransactionDetailReports 		: [],
			eftTransactionDetailTotalReports 	: []
	};

	//adds common fields to summary report to parent dto
	for(var prop in eftOnlineObj.requestValues){
		eftTransactionReport[prop] = settledTransactionList[0][prop];
	}

	//removes common fields from summary report to chile dto
	for(var ctr = 0 ; ctr < settledTransactionList.length; ctr ++){
		for(var prop in eftOnlineObj.requestValues){
			delete settledTransactionList[ctr][prop];
		}
	}
	eftTransactionReport.eftTransactionSettlementReports = settledTransactionList;
	return eftTransactionReport;
};

/*******************
 * Settle Data
 *******************/
var EFTSettleDataTransaction = function(params){
	for(var prop in params){
		this[prop] =  params[prop];
	}
};

EFTSettleDataTransaction.prototype.createRequestMessageToEdc = function(){
	uilog("DBUG","createRequestMessageToEdc() -- execute");
	var requestType = CONSTANTS.EFT.MSG_TYPE.REQUEST;
	var transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE[this.transactionType].desc;
	var requestMessageStrBuffer = "";

	this.requestParams = getEftMessageParamsByRequestAndTransactionType(requestType, transactionType);
	this.requestValues = getEftRequestValuesByTransactionType(this);

	var requestMessageArrMap = mapRequestValuesToEftRequestMessageParam(this.requestParams, this.requestValues, EFT.settlementDataModel);

	if(this.vendor.toLowerCase() == CONSTANTS.EFT.VENDOR.WIRECARD.name.toLowerCase()){
		requestMessageStrBuffer = stringifyRequestMessageFromWirecard(requestMessageArrMap);
	} else if (eftConfigObj.vendorName.toLowerCase() == CONSTANTS.EFT.VENDOR.KARTUKU.name.toLowerCase()){
		//TODO: kartuku and other vendor functions can start here to create req message.
	}

	return requestMessageStrBuffer;
};

EFTSettleDataTransaction.prototype.parseResponseMessageFromEdc = function(rawMsg){
	uilog("DBUG","parseResponseMessageFromEdc() -- execute");
	var requestType = CONSTANTS.EFT.MSG_TYPE.RESPONSE;
	var transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE[this.transactionType].desc;

	this.responseParams = getEftMessageParamsByRequestAndTransactionType(requestType, transactionType, true);

	if(this.vendor.toLowerCase() == CONSTANTS.EFT.VENDOR.WIRECARD.name.toLowerCase()) {
		this.responseValues = buildResponseMessageFromWirecard(rawMsg);
		var returnCode = isResponseMessageReturnCodeOnly(this.responseValues);
		if(returnCode){
			processReturnCodeFromWirecard(returnCode);
		} else {
			EFT.processSettlementData(this.responseParams, this.responseValues);
		}
	}
};

/************************************
 * Settlement Data Reponse Process
 ************************************/
EFT.settleByData = function settleByData(){

	eftTransactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SETTLEMENT_DATA.name;
	var params = {
		bank 				: configuration.banks[CONSTANTS.EFT.BANK.BANK_MEGA.name],
		onlineFlag			: CONSTANTS.EFT.STATUS.ONLINE,
		transactionType 	: eftTransactionType,
		vendor 				: eftVendor
	};

	EFT.processEFTOnlineTransaction(params);
};

EFT.processSettlementData = function(responseParams, responseValues){
	uilog("DBUG","EFT.processSettlementData() -- executed");

	//maps response data to EFT.settlementDataModel
	mapResponseMessageToObjectModel(responseParams, responseValues, EFT.settlementDataModel);

	//parse card data
	if(EFT.settlementDataModel.hasOwnProperty(CONSTANTS.EFT.MSG_PARAM.HOST_TYPE.property)
			&& EFT.settlementDataModel.hasOwnProperty(CONSTANTS.EFT.MSG_PARAM.CARD_DATA.property)){
		var cardData = EFT.parseCardDataParam(EFT.settlementDataModel[CONSTANTS.EFT.MSG_PARAM.HOST_TYPE.property]
			, EFT.settlementDataModel[CONSTANTS.EFT.MSG_PARAM.CARD_DATA.property]);
		EFT.settlementDataModel.updateSettlementDataModel(cardData);
		delete EFT.settlementDataModel[CONSTANTS.EFT.MSG_PARAM.CARD_DATA.property];
	}

	//parse grand total
	if(EFT.settlementDataModel.hasOwnProperty(CONSTANTS.EFT.MSG_PARAM.GRAND_TOTAL_DATA.property)){
		var grandTotal = EFT.parseGrandTotalDataParam(EFT.settlementDataModel.hostType
			, EFT.settlementDataModel[CONSTANTS.EFT.MSG_PARAM.GRAND_TOTAL_DATA.property]);
		EFT.settlementDataModel.updateSettlementDataModel(grandTotal);
		delete EFT.settlementDataModel[CONSTANTS.EFT.MSG_PARAM.GRAND_TOTAL_DATA.property];
	}

	//parse grand total
	if(EFT.settlementDataModel.hasOwnProperty(CONSTANTS.EFT.MSG_PARAM.GRAND_TOTAL_DATA.property)){
		var grandTotal = EFT.parseGrandTotalDataParam(EFT.settlementDataModel.hostType
			, EFT.settlementDataModel[CONSTANTS.EFT.MSG_PARAM.GRAND_TOTAL_DATA.property]);
		EFT.settlementDataModel.updateSettlementDataModel(grandTotal);
		delete EFT.settlementDataModel[CONSTANTS.EFT.MSG_PARAM.GRAND_TOTAL_DATA.property];
	}

	//format settlement data
	EFT.formatSettlementData();

	//Executes next action.
	// if ETX = 0; means settled host is still not finish. Will settle next data.
	// if ETX = 1; means settled host is done. Will settle next host.
	if(CONSTANTS.EFT.END_OF_TRANSMISSION.CONTINUE === parseInt(EFT.settlementDataModel.etx))/*Calls Settle Data*/{
		EFT.settledTransactionList.getInstance().addSettledTransaction(cloneObject(EFT.settlementDataModel));
		EFT.settleByData();
	} else if (CONSTANTS.EFT.END_OF_TRANSMISSION.END === parseInt(EFT.settlementDataModel.etx)){
		EFT.settledHostCount ++;
		EFT.unsettledHostCount --;
		//adds the settled data to the list
		EFT.settledTransactionList.getInstance().addSettledTransaction(cloneObject(EFT.settlementDataModel));
		//settle next Host
		EFT.requestSettlementByHost(EFT.hostTypeList[EFT.settledHostCount]);
	}
};

EFT.formatSettlementData = function (){
	if(EFT.settlementDataModel){
		EFT.settlementDataModel.transactionDate 		= $.datepicker.formatDate('dd/mm/yy', new Date());
		EFT.settlementDataModel.transactionTime 		= EFT.formatTime(EFT.settlementDataModel.transactionTime);
		EFT.settlementDataModel.hostType				= EFT.getHostTypeDesc(EFT.settlementDataModel.hostType);
		EFT.settlementDataModel.cashierId				= loggedInUsername;
		EFT.settlementDataModel.storeCode				= removeLeadingZeroes(EFT.settlementDataModel.storeCode);
		//sets posId equal to pos number
		EFT.settlementDataModel.posId 					= configuration.terminalNum === undefined ? null : configuration.terminalNum;
	}
}
