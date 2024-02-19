/*********************************************
 * EFT Detail Transaction Init Transaction
 ********************************************/
var EFTRetrieveTransaction = function(params){
	for(var prop in params){
		this[prop] =  params[prop];
	}
};

/**
 * Request
 */
EFTRetrieveTransaction.prototype.createRequestMessageToEdc = function(){
	uilog("DBUG","Retrieve Transaction: createRequestMessageToEdc() -- execute");
	var requestType = CONSTANTS.EFT.MSG_TYPE.REQUEST;
	var transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE[this.transactionType].desc;
	var requestMessageStrBuffer = "";

	this.requestParams = getEftMessageParamsByRequestAndTransactionType(requestType, transactionType);
	this.requestValues = getEftRequestValuesByTransactionType(this);

	var requestMessageArrMap = mapRequestValuesToEftRequestMessageParam(this.requestParams, this.requestValues, eftDataObj);

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
EFTRetrieveTransaction.prototype.parseResponseMessageFromEdc = function(rawMsg){
	uilog("DBUG","Retrieve Transaction: parseResponseMessageFromEdc() -- execute");
	var requestType = CONSTANTS.EFT.MSG_TYPE.RESPONSE;
	var transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE[this.transactionType].desc;

	this.responseParams = getEftMessageParamsByRequestAndTransactionType(requestType, transactionType);

	if(this.vendor.toLowerCase() == CONSTANTS.EFT.VENDOR.WIRECARD.name.toLowerCase()) {
		this.responseValues = buildResponseMessageFromWirecard(rawMsg);
		var returnCode = isResponseMessageReturnCodeOnly(this.responseValues);
		if(returnCode){
			processReturnCodeFromWirecard(returnCode);
		} else {
			EFT.processRetrieveTransaction(this.responseParams, this.responseValues);
		}
	}
};

/***************************************
 * Print Detail Transaction  - Start
 ***************************************/
EFT.processRetrieveTransaction = function(responseParams, responseMessages){
	uilog("DBUG","EFT.processRetrieveTransaction() -- execute");

	//map response messages to model
	mapResponseMessageToObjectModel(responseParams, responseMessages, eftDataObj);
	//format retrieved transaction
	EFT.formatRetrieveTransaction();
	if($("#bank-mega-input-trace-number-dialog").dialog("isOpen")){
		$("#bank-mega-input-trace-number-dialog").dialog("close");
	}
	if(enablePaymentMedia){
		$("#eft-retrieve-transaction-details").dialog("open");	
	} else {
		if(!hasScannedItem (saleTx)){
			//Print Retrieve Eft Transaction if there is no scanned item
			var contents = {
					footer 	: setReceiptEftRetrieveTransaction(),
					eftOnline 	: setReceiptEftRetrieveTransaction(true),
                    isQueued : true
			};
			printReceipt(contents);
			showMsgDialog(getMsgValue("eft_msg_info_printing_retrieve_transaction"), "info");
		} else {
			$("#eft-retrieve-transaction-details").dialog("open");
		}
		/*if($("#bank-mega-input-trace-number-dialog").dialog("isOpen")){
			$("#bank-mega-input-trace-number-dialog").dialog("close");
		}*/
		clearEFT(true);
	}
};

//Formats detail transaction date report data to be more readable.
EFT.formatRetrieveTransaction = function (){
	if(eftDataObj){
		eftDataObj.bankName 				= eftOnlineObj.bank;
		eftDataObj.transactionDate 			= $.datepicker.formatDate('dd/mm/yy', new Date());
		eftDataObj.transactionTime 			= EFT.formatTime(eftDataObj.transactionTime);
		eftDataObj.transactionType 			= CONSTANTS.EFT.EFT_TRANSACTION_TYPE[eftTransactionType].desc;
		eftDataObj.signature 				= parseInt(eftDataObj.signature) === 1 ? true : false;
		eftDataObj.terminalId 				= maskValueWithX(eftDataObj.terminalId, 4, 'BEGIN');
		eftDataObj.storeCode 				= removeLeadingZeroes(eftDataObj.storeCode);
		eftDataObj.transactionAmount 		= eftDataObj.transactionAmount.substr(0,
				eftDataObj.transactionAmount.length - 2);
		eftDataObj.expCard					= eftDataObj.expCard.substr(0,2) + "/" + eftDataObj.expCard.substr(2,2);
		eftDataObj.storeCode				= removeLeadingZeroes(eftDataObj.storeCode);
		eftDataObj.posId 					= configuration.terminalNum === undefined ? null : configuration.terminalNum;
		eftDataObj.cashierId				= removeLeadingCharacter(eftDataObj.cashierId, " ");
	}
};

EFT.retrieveEftTxn = function(traceNumber){
	var errorMessage = "";
	if (traceNumber){
		var eftParams = {
			bank			: configuration.banks[CONSTANTS.EFT.BANK.BANK_MEGA.name],
			onlineFlag		: CONSTANTS.EFT.STATUS.ONLINE,
			traceNumber 	: traceNumber,
			transactionType : eftTransactionType,
			vendor			: eftVendor
		};
		EFT.processEFTOnlineTransaction(eftParams);
	} else {
		errorMessage = getMsgValue("pos_warning_msg_eft_online_payment_not_found");
		$("#eftTraceNumberErrorSpan").empty();
		$("#eftTraceNumberErrorSpan").html(errorMessage);
	}
};

EFT.addRetrievedTransactionAsPayment = function(){
	var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name;
	var eftPayment = parseInt(eftDataObj.transactionAmount) || 0;
	eftType = CONSTANTS.EFT.TYPE.ONLINE_PAYMENT;

	if ((isHcEnabled && profCust && profCust.customerNumber) && !toggleTVS) {
		eftPayment = EFT.applyMdrSurchargeOnTotalAmount(eftPayment);
		renderTotal();
	}

	if(enablePaymentMedia && !toggleVoid){
		if (PAYMENT_MEDIA.isValidForTriggering(
				saleTx, pymtMediaTypeName,
				eftPayment, enablePaymentMedia)
				&& isNoneGiftCardItemInTransaction()) {
			eftDataObj.transactionId = saleTx.transactionId;
			CASHIER.executePaymentMedia(saleTx, pymtMediaTypeName, eftPayment,{
				eftData: eftDataObj
			});
		}
	}
};
