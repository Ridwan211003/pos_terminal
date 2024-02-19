
/**
 * EFT Transaction Summary Report Obj
 */
var EFTTransactionSummaryReport = function(params){
	for(var prop in params){
		this[prop] =  params[prop];
	}
};

EFTTransactionSummaryReport.prototype.createRequestMessageToEdc = function(){
	uilog("DBUG","createRequestMessageToEdc() -- execute");
	var requestType = CONSTANTS.EFT.MSG_TYPE.REQUEST;
	var transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE[this.transactionType].desc;
	var requestMessageStrBuffer = "";

	this.requestParams = getEftMessageParamsByRequestAndTransactionType(requestType, transactionType);
	this.requestValues = getEftRequestValuesByTransactionType(this);

	var requestMessageArrMap = mapRequestValuesToEftRequestMessageParam(this.requestParams, this.requestValues, EFT.transactionSummaryDataModel);

	if(this.vendor.toLowerCase() == CONSTANTS.EFT.VENDOR.WIRECARD.name.toLowerCase()){
		requestMessageStrBuffer = stringifyRequestMessageFromWirecard(requestMessageArrMap);
	} else if (eftConfigObj.vendorName.toLowerCase() == CONSTANTS.EFT.VENDOR.KARTUKU.name.toLowerCase()){
		//TODO: kartuku and other vendor functions can start here to create req message.
	}

	return requestMessageStrBuffer;
};

EFTTransactionSummaryReport.prototype.parseResponseMessageFromEdc = function(rawMsg){
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
			EFT.processTransactionSummary(this.responseParams, this.responseValues);
		}
	}
};

/***************************************
 * Print Transaction Summary - Start
 ***************************************/
EFT.processTransactionSummary = function(responseParams, responseMessages) {
	var cardData, grandTotal;
	try{
		uilog("DBUG","processTransactionSummary() -- executing");

		//creates transaction summary instance.
		var reportList = EFT.transactionSummaryReportList.getInstance();

		//map response messages to model
		mapResponseMessageToObjectModel(responseParams, responseMessages, EFT.transactionSummaryDataModel);

		//parse card data
		if(EFT.transactionSummaryDataModel.hasOwnProperty(CONSTANTS.EFT.MSG_PARAM.HOST_TYPE.property) && EFT.transactionSummaryDataModel.hasOwnProperty(CONSTANTS.EFT.MSG_PARAM.CARD_DATA.property)){
			cardData = EFT.parseCardDataParam(EFT.transactionSummaryDataModel[CONSTANTS.EFT.MSG_PARAM.HOST_TYPE.property]
				, EFT.transactionSummaryDataModel[CONSTANTS.EFT.MSG_PARAM.CARD_DATA.property]);
			EFT.transactionSummaryDataModel.appendCardDataToTransactionSummaryDataModel(cardData);
			delete EFT.transactionSummaryDataModel[CONSTANTS.EFT.MSG_PARAM.CARD_DATA.property];
		}

		//parse grand total
		if(EFT.transactionSummaryDataModel.hasOwnProperty(CONSTANTS.EFT.MSG_PARAM.HOST_TYPE.property)
				&& EFT.transactionSummaryDataModel.hasOwnProperty(CONSTANTS.EFT.MSG_PARAM.GRAND_TOTAL_DATA.property)){
			grandTotal = EFT.parseGrandTotalDataParam(EFT.transactionSummaryDataModel.hostType
				, EFT.transactionSummaryDataModel[CONSTANTS.EFT.MSG_PARAM.GRAND_TOTAL_DATA.property]);
			EFT.transactionSummaryDataModel.appendGrandTotalToTransactionSummaryDataModel(grandTotal);
			delete EFT.transactionSummaryDataModel[CONSTANTS.EFT.MSG_PARAM.GRAND_TOTAL_DATA.property];
		}

		//formats data in model
		EFT.formatTransactionSummary();

		// if ETX = 0; means data processed is not yet complete. Will send request again to edc
		// if ETX = 1; means data processed is done or has ended.
		if(CONSTANTS.EFT.END_OF_TRANSMISSION.CONTINUE === parseInt(EFT.transactionSummaryDataModel.etx))/*Calls Settle Data*/{

			reportList.addTransactionSummaryData(cloneObject(EFT.transactionSummaryDataModel));

			//caanother data
			eftTransactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_SUMMARY_TXN.name;
			var eftParams = {
					bank			: configuration.banks[CONSTANTS.EFT.BANK.BANK_MEGA.name],
					onlineFlag		: CONSTANTS.EFT.STATUS.ONLINE,
					transactionType : eftTransactionType,
					vendor 			: eftVendor
			};
			EFT.processEFTOnlineTransaction(eftParams);
			$("#eft-processing-dialog").dialog("open");

		//for transaction summary report if transmission end = 1;
		//end of process and save to db.
		} else if(CONSTANTS.EFT.END_OF_TRANSMISSION.END === parseInt(EFT.transactionSummaryDataModel.etx)){
			reportList.addTransactionSummaryData(cloneObject(EFT.transactionSummaryDataModel));
			EFT.saveEftTransactionSummaryRpt(reportList.getTransactionSummaryList());
		} else {
			showMsgDialog(getMsgValue("eft_msg_err_reprint_summary_transaction_missing_data"), "error");
			clearEFT(true);
		}
	} catch (err){
		uilog('DBUG','Error: '+ err);
		showMsgDialog(getMsgValue('eft_msg_err_exception_on_transaction'), "error");
		clearEFT(true);
	}
};

//format transaction summary report data to be more readable
EFT.formatTransactionSummary = function (){
	if(EFT.transactionSummaryDataModel){
		EFT.transactionSummaryDataModel.transactionDate 		= $.datepicker.formatDate('dd/mm/yy', new Date());
		EFT.transactionSummaryDataModel.transactionTime 		= EFT.formatTime(EFT.transactionSummaryDataModel.transactionTime);
		EFT.transactionSummaryDataModel.hostType				= EFT.getHostTypeDesc(EFT.transactionSummaryDataModel.hostType);
		EFT.transactionSummaryDataModel.cashierId				= loggedInUsername;
		EFT.transactionSummaryDataModel.storeCode				= removeLeadingZeroes(EFT.transactionSummaryDataModel.storeCode);
		//sets posId equal to pos number
		EFT.transactionSummaryDataModel.posId 					= configuration.terminalNum === undefined ? null : configuration.terminalNum;
	}
};

EFT.saveEftTransactionSummaryRpt = function(txnSummaryReportList){
	if(txnSummaryReportList && txnSummaryReportList.length > 0){
		$.ajax({
			url : posWebContextPath + "/eft/saveEftTransactionSummaryReport",
			type : "POST",
			async: false,
			dataType: "json",
			contentType : "application/json",
			data: JSON.stringify(EFT.convertTxnSummaryReportToDTO(txnSummaryReportList)),
			success : function(isSuccess) {
				if(isSuccess){
					//print
					printReceipt({
						header : setReceiptHeader(saleTx),
						eftTransactionSummaryData : setReceiptEftTransactionSummaryData(txnSummaryReportList),
                        isQueued : true
					});
					showMsgDialog("Transaction summary report saved succesfully.", "info", clearEFT(true));
				}
			},
			error : function(jqXHR, status, error) {
				showMsgDialog("Error on saving transaction summary report.", "error", clearEFT(true));
			}
		});
	}
};

EFT.convertTxnSummaryReportToDTO = function(txnSummaryReportList){
	uilog("DBUG","convertTxnSummaryReportToDTO() -- execute");
	var eftTransactionReport = {
			transactionType 					: CONSTANTS.EFT.REPORT_TRANSACTION_TYPE.SUMMARY_REPORT,
			eftTransactionSummaryReports 		: [],
			eftTransactionSettlementReports 	: [],
			eftTransactionDetailReports 		: [],
			eftTransactionDetailTotalReports 	: []
	};

	//adds common fields to summary report to parent dto
	for(var prop in eftOnlineObj.requestValues){
		eftTransactionReport[prop] = txnSummaryReportList[0][prop];
	}

	//removes common fields from summary report to chile dto
	for(var ctr = 0 ; ctr < txnSummaryReportList.length; ctr ++){
		for(var prop in eftOnlineObj.requestValues){
			delete txnSummaryReportList[ctr][prop];
		}
	}
	eftTransactionReport.eftTransactionSummaryReports = txnSummaryReportList;
	return eftTransactionReport;
};

/**
 * Wirecard Specs:
 * Parse settlement data and assign it to each property.
 * Card Name 			    	- VISA/MASTER
 * Sales Count; Totals			- Char 3+12 001;999999999999;
 * Refunds Count;Totals			- Char 3+12 001;999999999999;
 * Offline Count;Totals			- Char 3+12 001;999999999999;
 * Void Sales Count;Totals		- Char 3+12 001;999999999999;
 * Void Refunds Count;Totals	- Char 3+12 001;999999999999;
 * Redeem Count;Totals			- Char 3+12 001;999999999999; Only if host is One Dip/Mega Point
 * Card Totals Count;Totals		- Char 3+12 001;999999999999;
 * Type Length Sample			- Char 3+12 001;999999999999;
 */
EFT.parseCardDataParam = function(hostType, propertyValue){
	var cardData = {};
	var cardDataArr = propertyValue.split(";");
	if(hostType.toLowerCase() === CONSTANTS.EFT.HOST_TYPE.MEGAPOINT.value.toLowerCase()){
		for(var ctr = 0; ctr < cardDataArr.length; ctr ++){
			if(ctr == 0){
				cardData[CONSTANTS.EFT.CARD_DATA.CARD_NAME] = cardDataArr[ctr];
			} else if(ctr == 1){
				cardData[CONSTANTS.EFT.CARD_DATA.SALES_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 2){
				cardData[CONSTANTS.EFT.CARD_DATA.SALES_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 3){
				cardData[CONSTANTS.EFT.CARD_DATA.REFUNDS_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 4){
				cardData[CONSTANTS.EFT.CARD_DATA.REFUNDS_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 5){
				cardData[CONSTANTS.EFT.CARD_DATA.OFFLINE_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 6){
				cardData[CONSTANTS.EFT.CARD_DATA.OFFLINE_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 7){
				cardData[CONSTANTS.EFT.CARD_DATA.VOID_SALES_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 8){
				cardData[CONSTANTS.EFT.CARD_DATA.VOID_SALES_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 9){
				cardData[CONSTANTS.EFT.CARD_DATA.VOID_REFUNDS_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 10){
				cardData[CONSTANTS.EFT.CARD_DATA.VOID_REFUNDS_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 11){
				cardData[CONSTANTS.EFT.CARD_DATA.REDEEM_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 12){
				cardData[CONSTANTS.EFT.CARD_DATA.REDEEM_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 13){
				cardData[CONSTANTS.EFT.CARD_DATA.TOTAL_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 14){
				cardData[CONSTANTS.EFT.CARD_DATA.TOTAL] = Number(cardDataArr[ctr]) || 0;
			}
		}
	} else {
		for(var ctr = 0; ctr < cardDataArr.length; ctr ++){
			if(ctr == 0){
				cardData[CONSTANTS.EFT.CARD_DATA.CARD_NAME] = cardDataArr[ctr];
			} else if(ctr == 1){
				cardData[CONSTANTS.EFT.CARD_DATA.SALES_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 2){
				cardData[CONSTANTS.EFT.CARD_DATA.SALES_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 3){
				cardData[CONSTANTS.EFT.CARD_DATA.REFUNDS_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 4){
				cardData[CONSTANTS.EFT.CARD_DATA.REFUNDS_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 5){
				cardData[CONSTANTS.EFT.CARD_DATA.OFFLINE_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 6){
				cardData[CONSTANTS.EFT.CARD_DATA.OFFLINE_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 7){
				cardData[CONSTANTS.EFT.CARD_DATA.VOID_SALES_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 8){
				cardData[CONSTANTS.EFT.CARD_DATA.VOID_SALES_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 9){
				cardData[CONSTANTS.EFT.CARD_DATA.VOID_REFUNDS_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 10){
				cardData[CONSTANTS.EFT.CARD_DATA.VOID_REFUNDS_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 11){
				cardData[CONSTANTS.EFT.CARD_DATA.TOTAL_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 12){
				cardData[CONSTANTS.EFT.CARD_DATA.TOTAL] = Number(cardDataArr[ctr]) || 0;
			}
		}
	}
	return cardData;
};


/**
 * Wirecard Specs:
 * Parse Grand Total Data and assign it to each property.
 * Sales Count; Totals			- Char 3+12 001;999999999999;
 * Refunds Count;Totals			- Char 3+12 001;999999999999;
 * Offline Count;Totals			- Char 3+12 001;999999999999;
 * Void Sales Count;Totals		- Char 3+12 001;999999999999;
 * Void Refunds Count;Totals	- Char 3+12 001;999999999999;
 * Redeem Count;Totals			- Char 3+12 001;999999999999; Only if host is One Dip/Mega Point
 * Card Totals Count;Totals		- Char 3+12 001;999999999999;
 * Type Length Sample			- Char 3+12 001;999999999999;
 */
EFT.parseGrandTotalDataParam = function(hostType, propertyValue){
	var cardData = {};
	var cardDataArr = propertyValue.split(";");
	if(hostType.toLowerCase() === CONSTANTS.EFT.HOST_TYPE.MEGAPOINT.value.toLowerCase()){
		for(var ctr = 0; ctr < cardDataArr.length; ctr ++){
			if(ctr == 0){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_SALES_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 1){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_SALES_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 2){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_REFUNDS_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 3){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_REFUNDS_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 4){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_OFFLINE_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 5){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_OFFLINE_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 6){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_VOID_SALES_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 7){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_VOID_SALES_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 8){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_VOID_REFUNDS_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 9){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_VOID_REFUNDS_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 10){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_REDEEM_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 11){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_REDEEM_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 12){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_TOTALS_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 13){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_TOTALS] = Number(cardDataArr[ctr]) || 0;
			}
		}
	} else {
		for(var ctr = 0; ctr < cardDataArr.length; ctr ++){
			if(ctr == 0){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_SALES_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 1){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_SALES_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 2){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_REFUNDS_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 3){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_REFUNDS_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 4){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_OFFLINE_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 5){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_OFFLINE_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 6){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_VOID_SALES_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 7){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_VOID_SALES_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 8){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_VOID_REFUNDS_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 9){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_VOID_REFUNDS_TOTAL] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 10){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_TOTALS_COUNT] = Number(cardDataArr[ctr]) || 0;
			} else if(ctr == 11){
				cardData[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_TOTALS] = Number(cardDataArr[ctr]) || 0;
			}
		}
	}
	return cardData;
};
