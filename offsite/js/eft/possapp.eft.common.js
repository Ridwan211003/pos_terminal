/**************************************************************
 * Eft Commons functions
 * mperez@exist.com
 **************************************************************/
/**
 * Eft Payment global variables
 */
 var EFT = EFT || {};

 // Settlement Transaction
 EFT.settledHostCount = 0;
 EFT.unsettledHostCount = 0;
 EFT.hostTypeList = [];
 EFT.settlementDataModel = null;
 EFT.settlementAll = null;
 
 // Report: Print Summary Transactions
 EFT.transactionSummaryDataModel = null;
 
 // Report: Print Detail Transactions
 EFT.detailTransactionReport = null;
 EFT.detailTransactionDataReport = null;
 EFT.detailTransactionDataReportList = null;
 EFT.detailTransactionTotalReport = null;
 EFT.detailTransactionTotalReportList = null;
 
 // Reprint Transaction
 EFT.isLastTransaction = false;
 EFT.retrieveTransaction = null;
 
 // Eft Payment Transaction
 var eftOnlineObj = null;
 var eftDataObj = null;
 var eftConfigObj = null;
 var eftType = "";
 var eftVendor = "";
 var eftTransactionType = null;
 var eftProcessingDialogTimeout = null;
 var offlineBankIdMap = null;
 var creditCardType = null;
 
 // Flag for hypercash transaction
 var isHypercashTx = false;
 
 /*******************************************************************************
  * EFT Functions; Business Requirements
  ******************************************************************************/
 /**
  * Calls EFT object to create request obj to be sent to edc. Sends the
  * processEFTrequest messsage to EDC
  */
 EFT.processEFTOnlineTransaction = function(params) {
	 if (!params.hasOwnProperty("posTxn")) {
		 params.posTxn = saleTx;
	 }
 
	 var transactionFactory = new BankTransactionFactory();
	 eftOnlineObj = transactionFactory.createTransactionRequest(params);
	 eftConfigObj = JSON.parse(getEFTConfiguration(params.vendor));
 
	 // set data model to corresponding request
	 if (eftOnlineObj instanceof EFTPaymentTransaction) {
		 eftDataObj = new ElectronicFundTransferModel();
	 } else if (eftOnlineObj instanceof EFTSettleAllTransaction) {
		 EFT.settlementAll = new SettlementAllModel();
	 } else if (eftOnlineObj instanceof EFTSettleDataTransaction) {
		 EFT.settlementDataModel = new SettlementDataModel();
	 } else if (eftOnlineObj instanceof EFTTransactionSummaryReport) {
		 EFT.transactionSummaryDataModel = new transactionSummaryDataModel();
	 } else if (eftOnlineObj instanceof EFTDetailTransactionReport) {
		 EFT.detailTransactionReport = new DetailTransactionReportModel();
	 } else if (eftOnlineObj instanceof EFTDetailTransactionDataReport) {
		 EFT.detailTransactionDataReport = new DetailTransactionDataReportModel();
	 } else if (eftOnlineObj instanceof EFTDetailTransactionTotalReport) {
		 EFT.detailTransactionTotalReport = new DetailTransactionTotalReportModel();
	 } else if (eftOnlineObj instanceof EFTRetrieveTransaction) {
		 eftDataObj = new ElectronicFundTransferModel();
	 }
 
	 sendEFT(eftOnlineObj.createRequestMessageToEdc());
	 // opens eft processing dialog
	 $("#eft-processing-dialog").dialog("open");
	 eftProcessingDialogTimeout = setTimeout(
			 executeAfterEftProcessingDialogExpires,
			 parseInt(getConfigValue("EFT_PROCESS_TIMEOUT")));
	 /**
	  * For Testing/Development Uncomment this
	  */
	 
	 /*  $.getScript(posWebContextPath + '/resources/js/possapp.eft.simulator.js')
		 .done(
		 function( script, textStatus ) 
		 { 
			 uilog("DBUG","Simulator is loaded." + textStatus);
			 eftOnlineObj = new EFTSimulator.EFTOnline(params);
			   eftOnlineObj.createRequestMessageToEdc();
			   EFTSimulator.createEftSimulatorResponse(); 
		 })
		 .fail(
		 function( jqxhr,settings, exception ) 
		 { 
			 uilog("DBUG","Failed to load script: "+exception);
		   }
		 );
	  */
 
	 /*uilog("DBUG","EFTOBJ: " + JSON.stringify(eftOnlineObj));
	 // ZEPRO SAMPLE RESPONSE
	 setTimeout(function()
	 {
		 $("#eft-processing-dialog").dialog("close");
				 
		 if(eftOnlineObj)
		 {
			 
			 uilog("DBUG","EFTOBJ 2: " + JSON.stringify(eftOnlineObj));
			 uilog("DBUG","CONSTANTS 2: " + JSON.stringify(CONSTANTS.EFT.EFT_TRANSACTION_TYPE));
			 var requestType = CONSTANTS.EFT.MSG_TYPE.RESPONSE;
				 var transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE[eftOnlineObj.transactionType].desc;
				 var eftMessageParam = getEftMessageParamsByRequestAndTransactionType(requestType, transactionType, true);
 
			 uilog("DBUG","EFT CONFIG OBJ: " + JSON.stringify(eftConfigObj));
			 var decrypted = decryptData(eftConfigObj, "c8d9ca3594b78e44792ee77615e00f97eb664faa6ed73d90aac1e936851ce3b20f3cc587b14b206cf6bf5d014674d08afa1689197327cdaf220a7667cbf485fb03bf95e2541570e0708b927334730934de392a2579045c988f6d8e775e6b36c978e767e7ce3c599cb734a99fe85afa360da326c169d7e21d6c7372fe69b21530e7402e98ed0b95eebde56d2b81f109d747facd80db559a8f8e425922c913b111691e1d3688fe22c75aeb92edc6cecd617366a316d8c0deff68fe65e2c637657b0a8e4b243eef72e4bb62684d4594ad9535df01e336a0fe337ea592aad6fa941a5a06b8fbf082273c079f2e1260964396ce42b6eeb456933bdfc84ff28ca64620e224685072abb87fc0841872062063ec");
			 uilog("DBUG","EFT DECRYPTED: " + JSON.stringify(decrypted));
			 var parsedResponseMesssage = parseResponseMessageFromWirecard(decrypted);
 
				 var returnCode = isResponseMessageReturnCodeOnly(parsedResponseMesssage);
			 uilog("DBUG", returnCode);
				 if(returnCode){
						 processReturnCodeFromWirecard(returnCode);
				 } else {
						 processEftResponseMessage(eftMessageParam, parsedResponseMesssage);
				 }
				 }
	 }, 3000);*/
 };
 
 /**
  * Clears Eft Transaction
  */
 function clearEFT(clearAll) {
	 $("#eft-processing-dialog").dialog("close");
	 clearTimeout(eftProcessingDialogTimeout);
	 eftProcessingDialogTimeout = null;
 
	 eftOnlineObj = null;
	 eftConfigObj = null;
	 eftDataObj = null;
	 EFT.isMegaPay = false;
	 /*if (saleTx
		 && saleTx.totalAdditionalDiscount
		 && saleTx.totalAdditionalDiscount != 0
		 && !(saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO
			  && saleTx.zeproCardDone)
		 && (saleTx.payments[0] && saleTx.payments[0].paymentMediaType != CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name))
	 {
		 removeAdditionalDicount();
	 }*/
	 
	 if (clearAll) {
		 eftTransactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE.name;
		 EFT.installmentType = null;
		 EFT.isMegaPay = false;
		 EFT.isZepro = false;
		 EFT.bank = null;
 
		 // Resets Settlement Global Variables
		 EFT.settledHostCount = 0;
		 EFT.unsettledHostCount = 0;
		 EFT.hostTypeList = [];
		 EFT.settlementDataModel = null;
		 EFT.settlementAll = null;
		 // Transaction Summary
		 EFT.transactionSummaryReportList.destroyInstance();
		 EFT.detailTransactionReportHostList.destroyInstance();
		 EFT.settledTransactionList.destroyInstance();
		 EFT.transactionSummaryReportModel = null;
		 EFT.detailTransactionReport = null;
		 EFT.detailTransactionDataReport = null;
		 EFT.detailTransactionDataReportList = null;
		 EFT.detailTransactionTotalReport = null;
		 EFT.detailTransactionTotalReportList = null;
	 }
 }
 
 //#98048
 EFT.checkEftTransactionIfValidToClearData = function(){
	  if (eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_SUMMARY_TXN.name
		 ||eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN.name
		 || eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN_BY_HOST.name
		 || eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN_BY_CARD.name
		 || eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.VOID.name
		 || eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.RETRIEVE_TXN.name
		 || eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SETTLEMENT_ALL.name
		 || eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.RETRIEVE_TXN.name){
		 //close trace number dialog if transaction type is void or retrieve transaction
		 if($('#bank-mega-input-trace-number-dialog').dialog("isOpen")){
			 $('#bank-mega-input-trace-number-dialog').dialog("close");
		 }
		 clearEFT(true);
	 } 
 };
 
 /**
  * Request Parameter Properties
  */
 var EFTRequestMessageParam = function(seqNum, size, val) {
	 this.sequence = seqNum;
	 this.size = size;
	 this.value = val;
	 uilog("DBUG","this.tag: " + seqNum + "; this.value: " + val);
 };
 
 /**
  * formats eftData to be saved on paymentMedia. overides eft details to
  * save/render.
  *
  * @returns eft
  */
 function formatEftForPaymentMedia() {
	 var now = new Date();
	 eftDataObj.cardNum = maskCardNoNew(eftDataObj.cardNum);
	 eftDataObj.transactionDate = $.datepicker.formatDate('dd/mm/yy', now);
	 eftDataObj.transactionTime = now.getHours()
			 + ":"
			 + (now.getMinutes() < 10 ? "0" + now.getMinutes() : now
					 .getMinutes()) + ":" + now.getSeconds();
	 if (eftType == CONSTANTS.EFT.TYPE.ONLINE_PAYMENT) {
		 formatEftOnlineForPaymentMedia();
	 }
	 uilog("DBUG", JSON.stringify(eftDataObj));
 }
 
 /**
  *
  */
 function formatEftOnlineForPaymentMedia() {
	 eftDataObj.bankName 					= eftOnlineObj.bank;
	 eftDataObj.expCard 						= eftDataObj.expCard.substr(0, 2) + "/"
			 + eftDataObj.expCard.substr(2, 2);
	 eftDataObj.transactionAmount                    = (eftVendor.toLowerCase() === CONSTANTS.EFT.VENDOR.KARTUKU.name.toLowerCase()) ? eftDataObj.transactionAmount : eftDataObj.transactionAmount.substr(0,eftDataObj.transactionAmount.length - 2); // CR KARTUKU
 
	 eftDataObj.transactionType 				= CONSTANTS.EFT.EFT_TRANSACTION_TYPE[eftTransactionType].desc;
	 eftDataObj.signature					= parseInt(eftDataObj.signature) === 1 ? true : false;
	 eftDataObj.terminalId 					= maskValueWithX(eftDataObj.terminalId, 4, 'BEGIN');
	 eftDataObj.storeCode		 			= removeLeadingZeroes(eftDataObj.storeCode);
 }
 
 /**
  * Gets the first number of the card to get the card type.
  *
  * @returns cardType{String} - card type description
  */
 function getCardType(cardNum, cardTypes) {
	 var cardType = "";
	 if (eftDataObj && eftDataObj.cardNum) {
		 var cardFirstDigit = eftDataObj.cardNum.substring(0, 1);
		 cardType = creditCardType[cardFirstDigit];
	 }
 
	 if (cardNum && cardTypes) {
		 var cardFirstDigit = cardNum.substring(0, 1);
		 cardType = cardTypes[cardFirstDigit];
	 }
	 return cardType;
 }
 
 /**
  * Checks if amount paid is > minimum signatory amount if amount paid > minimum
  * signatory amount it will print signature on receipt.
  *
  * @returns cardType{String} - card type description
  */
 var checkTransactionAmountIfWithSignature = function checkTransactionAmountIfWithSignature() {
	 var returnVal = false;
	 if (eftDataObj.transactionAmount > parseInt(getConfigValue('EFT_SIGNATORY_MIN_AMOUNT'))) {
		 returnVal = true;
	 }
	 return returnVal;
 };
 
 /**
  * init request values by transaction type.
  */
 var getEftRequestValuesByTransactionType = function getEftRequestValuesByTransactionType(
		 eftOnlineObject) {
	 uilog("DBUG","getEftRequestValuesByTransactionType() -- execute");
	 uilog("DBUG","eftOnlineObj.posTxn.ecrSeq :: " + eftOnlineObject.posTxn.ecrSeq);
	 uilog("DBUG","eftOnlineObj.transactionType :: " + eftOnlineObject.transactionType);
	 var requestFactory = new EftRequestFactory();
 
	 var properties = {
		 transactionId : eftOnlineObject.posTxn.transactionId,
		 transactionType : eftOnlineObject.transactionType,
		 storeCode : eftOnlineObject.posTxn.storeCd
	 };
 
	 /*
	  * Sale; Zepro Mega Pay OneDip
	  */
	 if (eftOnlineObject.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE.name
			 || eftOnlineObject.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.ONE_DIP.name
			 || eftOnlineObject.transactionType
					 .search(CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO) != -1
			 || eftOnlineObject.transactionType
					 .search(CONSTANTS.EFT.INSTALLMENT_TYPE.MEGA_PAY) != -1) {
		 properties.transactionId = eftOnlineObject.posTxn.transactionId + eftOnlineObject.posTxn.ecrSeq;
		 eftOnlineObject.posTxn.ecrSeq++;
		 uilog("DBUG", "properties.transactionId :: " + properties.transactionId);
		 properties.transactionAmount = eftOnlineObject.payment;
	 } /* SALES INQ */
	 else if (eftOnlineObject.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE_INQ.name) {
		 properties.transactionId = eftOnlineObject.posTxn.transactionId;
		 uilog("DBUG", "SALE_INQ properties.transactionId :: " + properties.transactionId);
	 } /* Void */
	 else if (eftOnlineObject.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.VOID.name) {
		 properties.traceNumber = eftOnlineObject.traceNumber;
	 } /*
		  * Settlement Data Settlement All Reprint Summary Report Reprint
		  * Detailed Transaction By Host Reprint Detailed Transaction By Card
		  */
	 else if (eftOnlineObject.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SETTLEMENT_ALL.name
			 || eftOnlineObject.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SETTLEMENT_DATA.name
			 || eftOnlineObject.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_SUMMARY_TXN.name
			 || eftOnlineObject.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN_BY_HOST.name
			 || eftOnlineObject.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN_BY_CARD.name) {
		 properties.transactionId = "000000000000000";
	 } /* Get Last Settlement Data */
	 else if (eftOnlineObject.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.GET_SETTLEMENT_DATA.name) {
		 properties.transactionId = "000000000000000";
		 properties.hostType = EFT.getLastHostSettled();
	 } /* Reprint Detail Txn */
	 else if (eftOnlineObject.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN.name) {
		 properties.transactionId = "123456789012345";
	 } /* Retrieve Transaction*/
	 else if (eftOnlineObject.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.RETRIEVE_TXN.name){
		 properties.transactionAmount = "000000000000";
		 properties.transactionId = "000000000000000";
		 properties.traceNumber = "000000";
		 if(!EFT.isLastTransaction){
			 properties.traceNumber = eftOnlineObject.traceNumber;
		 }
		 }
 
 
	 return requestFactory.createRequest(properties);
 };
 
 /**
  * Get message params per eft transaction type and type of Request
  */
 var getEftMessageParamsByRequestAndTransactionType = function getEftMessageParamsByRequestAndTransactionType(
		 requestType, transactionType, isSorted) {
	 uilog("DBUG","getEftMessageParamsByRequestAndTransactionType() -- execute");
	 var eftMsgParams = [];
	 try {
		 uilog("DBUG","transactionType: " + transactionType);
		 uilog("DBUG","requestType: " + requestType);
		 
		 for ( var ctr = 0; ctr < eftConfigObj.eftMsgParams.length; ctr++) {
			 var msgParam = eftConfigObj.eftMsgParams[ctr];
			 // uilog("DBUG","msgParam.messageType: " + msgParam.messageType);
			 if (msgParam.messageType.toLowerCase() == requestType.toLowerCase()
					 // transaction type = eft transaction type
					 && msgParam.messageTxnType.toLowerCase() == transactionType
							 .toLowerCase()) {
				 eftMsgParams.push(msgParam);
			 }
		 }
 
		 // sort the message params by its sequence number
		 if (isSorted) {
			 eftMsgParams.sort(sortBySequenceNum);
		 }
 
 //		console
 //				.log("getEftMessageParamsByRequestAndTransactionType() -- executed| eftMsgParams: "
 //						+ JSON.stringify(eftMsgParams));
		 return eftMsgParams;
	 } catch (err) {
		 showMsgDialog(
				 getMsgValue("pos_error_msg_contact_helpdesk_prefix")
						 .format(
								 getMsgValue('pos_error_message_failed_get_eft_message_request')),
				 "error");
		 uilog("DBUG","System Error: " + err);
	 }
 };
 
 /**
  * Sort function ascending order;
  */
 var sortBySequenceNum = function(a, b) {
	 return (a.messageSequenceNumber > b.messageSequenceNumber) ? 1
			 : ((a.msgSequenceNumber < b.msgSequenceNumber) ? -1 : 0);
 };
 
 /**
  * Maps transaction details based on eft message params.
  *
  * @param msgParams -
  *            eft message parameters obj.
  */
 function mapRequestValuesToEftRequestMessageParam(msgParams, msgValues, model) {
	 uilog("DBUG","mapRequestValuesToEftRequestMessageParam() -- execute");
	 uilog("DBUG", JSON.stringify(msgParams));
	 uilog("DBUG", JSON.stringify(msgValues));
	 uilog("DBUG", JSON.stringify(model));
	 var msgArr = [], msgParam = null, modelProperty = null;
	 for ( var i = 0; i < msgParams.length; i++) {
		 msgParam = msgParams[i];
		 modelProperty = CONSTANTS.EFT.MSG_PARAM[msgParam.messageDescription].property;
		 if (msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.ONLINE_FLAG.name) {
			 msgArr.push(new EFTRequestMessageParam(
					 msgParam.messageSequenceNumber, msgParam.messageSize,
					 msgValues.onlineFlag));
			 model[modelProperty] = msgValues.onlineFlag;
		 } else if (msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.TRANSACTION_CODE.name) {
			 msgArr.push(new EFTRequestMessageParam(
					 msgParam.messageSequenceNumber, msgParam.messageSize,
					 msgValues.transactionCode));
			 model[modelProperty] = msgValues.transactionCode;
		 } else if (msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.TRANSACTION_AMOUNT.name) {
			 msgArr.push(new EFTRequestMessageParam(
					 msgParam.messageSequenceNumber, msgParam.messageSize,
					 addLeadingZeroes(msgValues.transactionAmount,
							 msgParams[i].messageSize)));
			 model[modelProperty] = addLeadingZeroes(
					 msgValues.transactionAmount, msgParams[i].messageSize);
		 } else if (msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.POS_NUM.name) {
			 msgArr
					 .push(new EFTRequestMessageParam(
							 msgParam.messageSequenceNumber,
							 msgParam.messageSize, addLeadingZeroes(
									 msgValues.posId, msgParams[i].messageSize)));
			 model[modelProperty] = addLeadingZeroes(msgValues.posId,
					 msgParams[i].messageSize);
		 } else if (msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.TRANSACTION_NUM.name) {
			 msgArr.push(new EFTRequestMessageParam(
					 msgParam.messageSequenceNumber, msgParam.messageSize,
					 addLeadingZeroes(msgValues.transactionId.substr(2, msgValues.transactionId.length),
							 msgParams[i].messageSize)));
			 model[modelProperty] = addLeadingZeroes(msgValues.transactionId,
					 msgParams[i].messageSize);
		 } else if (msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.STORE_CODE.name) {
			 msgArr.push(new EFTRequestMessageParam(
					 msgParam.messageSequenceNumber, msgParam.messageSize,
					 addLeadingZeroes(msgValues.storeCode,
							 msgParams[i].messageSize)));
			 model[modelProperty] = addLeadingZeroes(msgValues.storeCode,
					 msgParams[i].messageSize);
		 } else if (msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.CASHIER_ID.name) {
			 msgArr.push(new EFTRequestMessageParam(
					 msgParam.messageSequenceNumber, msgParams[i].messageSize,
					 addLeadingCharacter(msgValues.cashierId,
					 msgParams[i].messageSize, " ")));
			 model[modelProperty] = addLeadingCharacter(msgValues.cashierId, msgParams[i].messageSize, " ");
		 } else if (msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.TRACE_NUM.name) {
			 msgArr.push(new EFTRequestMessageParam(
					 msgParam.messageSequenceNumber, msgParam.messageSize,
					 msgValues.traceNumber));
			 model[modelProperty] = msgValues.traceNumber;
		 }
	 }
	 uilog("DBUG","messageArray: " + JSON.stringify(msgArr));
	 return msgArr;
 };
 
 /**
  * Maps response message to eft obj;
  *
  * @param msgMap
  * @param eftMessageParams
  */
 function mapResponseMessageToEftData(eftMessageParams, parsedResponseMesssage) {
	 var msgVal = "";
	 for ( var prop in parsedResponseMesssage) {
		 msgVal = parsedResponseMesssage[prop].msgVal;
		 for ( var i = 0; i < eftMessageParams.length; i++) {
			 if (eftMessageParams[i].messageSequenceNumber == parseInt(prop)) {
				 // get substr equal to messageSize to make sure size will not
				 // exceed.
				 eftDataObj[CONSTANTS.EFT.MSG_PARAM[eftMessageParams[i].messageDescription].property] = msgVal
						 .substr(0, eftMessageParams[i].messageSize) === undefined ? ""
						 : msgVal.substr(0, eftMessageParams[i].messageSize);
				 break;
			 }
		 }
	 }
	 uilog("DBUG","mapResponseMessageToEftData() -- excuted; eftDataObj: "
			 + JSON.stringify(eftDataObj));
 }
 
 function mapResponseMessageToObjectModel(eftMessageParams,
		 parsedResponseMesssage, objectModel) {
	 var msgVal = "";
	 for ( var prop in parsedResponseMesssage) {
		 msgVal = parsedResponseMesssage[prop].msgVal;
		 for ( var i = 0; i < eftMessageParams.length; i++) {
			 if (eftMessageParams[i].messageSequenceNumber == parseInt(prop)) {
				 // get substr equal to messageSize to make sure size will not
				 // exceed.
				 objectModel[CONSTANTS.EFT.MSG_PARAM[eftMessageParams[i].messageDescription].property] = msgVal
						 .substr(0, eftMessageParams[i].messageSize) === undefined ? ""
						 : msgVal.substr(0, eftMessageParams[i].messageSize);
				 break;
			 }
		 }
	 }
	 uilog("DBUG","mapResponseMessageToObjectModel() -- excuted; objectModel: "
			 + JSON.stringify(objectModel));
 }
 /*******************************************************************************
  * AJAX Requests
  ******************************************************************************/
 /**
  * Get EFT Configuration
  */
 function getEFTConfiguration(vendor) {
	 var vendor = vendor || eftVendor;
	 uilog("DBUG","eft bank configuration...");
	 return JSON.parse(JSON.stringify($.ajax({
		 url : posWebContextPath + "/cashier/getEftBankConfig/" + vendor,
		 type : "GET",
		 async : false,
		 error : function(jqXHR, status, error) {
			 showMsgDialog(getMsgValue("eft_msg_err_configuration_failed"),
					 "error");
			 clearEFT();
		 }
	 }).responseText));
 };
 
 /*
  * Send EFT request message to EDC
  */
 function sendEFT(msg) {
	 var hitURL = '';
		 hitURL = (eftVendor.toLowerCase() === CONSTANTS.EFT.VENDOR.KARTUKU.name.toLowerCase()) ? 'eftOnlineKartuku' : 'eftOnline';
 
		 $.ajax({
				 url : proxyUrl + "/" + hitURL,
				 type : "POST",
				 async : false,
				 dataType : "json",
				 data : JSON.stringify(msg),
				 success : function(incomingMessage) {
						 console.log(getMsgValue("eft_msg_success_edc_transmission_success"));
				 },
				 error : function(jqXHR, status, error)
				 {
						 clearEFT();
						 showMsgDialog(getMsgValue("eft_err_msg_edc_failed"),"error");
						 if (saleTx.coBrandNumber)
						 {
								 reverseMemberDiscount(false);
						 }
				 }
		 });
 };
 
 /**
  * Gets MDR Configuration set in Back Office based on the param Card BIN
  */
 function getMdrConfig(cardBinNo) {
	 uilog("DBUG","Retrieval of MDR Configuration...");
	 var DEFAULT_MDR_RATE = '0';
	 
	 var responseText = $.ajax({
		 url : posWebContextPath + "/cashier/get" + (connectionOnline ? "" : "Offsite") + "MDRConfiguration/" + cardBinNo,
		 type : "GET",
		 async : false,
		 error : function(jqXHR, status, error) {
			 uilog('DBUG','No MDR config for: ' + cardBinNo
					 + '. Use default rate: 2');
		 }
	 }).responseText;
	 return (responseText) ? JSON.parse(responseText) : {
		 mdrRate : DEFAULT_MDR_RATE
	 };
 };
 
 /**
  * Gets MDR Configuration set in Back Office based on param Bank Name
  */
 function getMdrConfigByBankName(bankName) {
	 var DEFAULT_MDR_RATE = '0';
	 
	 var responseText = $.ajax({
		 url : posWebContextPath + "/cashier/get" + (connectionOnline ? "" : "Offsite") + "MDRConfigurationByBankName/" + bankName,
		 type : "GET",
		 async : false,
		 error : function(jqXHR, status, error) {
			 uilog('DBUG','No mdr config found for bank name: '+bankName);
		 }
	 }).responseText;
	 return (responseText) ? JSON.parse(responseText) : {
		 mdrRate : DEFAULT_MDR_RATE
	 };
 };
 
 /*******************************************************************************
  * Bank Mega - Wirecard functions
  ******************************************************************************/
 /**
  * EFT Request Message for Wirecard
  *
  * @param mappedRequestMessage
  *            array- message mapped to transaction
  */
 function stringifyRequestMessageFromWirecard(mappedRequestMessageArr) {
	 uilog("DBUG","stringifyRequestMessageFromWirecard() -- execute");
	 var msg = "";
 
	 // starts message with random 3 digit number
	 // random number from 100-999;
	 msg += Math.floor((Math.random() * 900) + 100);
 
	 // message = tag id + length + msg value
	 for ( var ctr = 0; ctr < mappedRequestMessageArr.length; ctr++) {
		 msg += hexToAscii(toHex(parseInt(mappedRequestMessageArr[ctr].sequence)));
		 msg += hexToAscii(toHex(parseInt(mappedRequestMessageArr[ctr].size)));
		 msg += mappedRequestMessageArr[ctr].value;
	 }
 
	 // encrypt message
	 var encryptedMsg = encryptData(eftConfigObj, msg);
	 // get encrypted message length
	 var encryptedMsgLen = toHexPadded(encryptedMsg.length / 2);
 
	 // add encrypted message length and encrypted message
	 msg = encryptedMsgLen + encryptedMsg;
	 uilog("DBUG","msg w/ padding encrypted: " + msg);
	 return msg;
 };
 
 /**
  * Process bank mega response data. EDC response data returned is in array type.
  * Wraps all functions into this method.
  */
 function buildResponseMessageFromWirecard(rawMsg) {
	 // removes the first two characters;
	 rawMsg.splice(0, 2);
	 // converts message to hex string format
	 var encryptedMsg = toHexString(rawMsg);
	 // decode encrypted message
	 var decodedMsg = decryptData(eftConfigObj, encryptedMsg);
	 // parse the decoded msg
	 return parseResponseMessageFromWirecard(decodedMsg);
 }
 
 /**
  * Parse response message based on wirecard specs. Splits the response message;
  * tagId; tagSize;
  *
  * @param decodedMsg -
  *            decoded message
  *
  * @Return splittedMsgMap propety1: {tagId1:{msgSize:size; msgValue:value}}
  *         propety2: {tagId2:{msgSize:size; msgValue:value}}
  */
 function parseResponseMessageFromWirecard(decodedMsg) {
	 var parsedMsgMap = {};
	 // remove first 3 bytes
	 decodedMsg = decodedMsg.substr(6);
 
	 while (decodedMsg.length > 0) {
		 var msgSize = hexToDec(decodedMsg.substr(2, 2));
		 parsedMsgMap[hexToDec(decodedMsg.substr(0, 2))] = {
			 msgSize : msgSize,
			 msgVal : hexToAscii(decodedMsg.substr(4, msgSize * 2))
		 };
		 decodedMsg = decodedMsg.substr(msgSize * 2 + 4);
	 }
 
	 uilog("DBUG","parseBankMegaResponseMessage()-- execute;"
			 + JSON.stringify(parsedMsgMap));
	 return parsedMsgMap;
 }
 
 /**
  * Check if the parsed message is only return code.
  *
  * @param parsedResponseMesssage
  * @returns {Boolean}
  */
 function processReturnCodeFromWirecard(returnCode) {
	 var messagePrefix = "eft_wirecard_msg_";
	 var message = "";
	 if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_BUSY.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_BUSY.name.toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_INVALID_PARAM.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_INVALID_PARAM.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_UNKNOWN_CMD_PARAM.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_UNKNOWN_CMD_PARAM.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_UNKNOWN_TRXID_PARAM.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_UNKNOWN_TRXID_PARAM.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_UNKNOWN_MID_PARAM.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_UNKNOWN_MID_PARAM.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_UNKNOWN_TID_PARAM.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_UNKNOWN_TID_PARAM.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_UNKNOWN_PAN_PARAM.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_UNKNOWN_PAN_PARAM.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_UNKNOWN_EXP_PARAM.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_UNKNOWN_EXP_PARAM.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_UNKNOWN_AMT_PARAM.value) {
		 uilog("DBUG","EFT RET: " + returnCode);
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_UNKNOWN_AMT_PARAM.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_UNKNOWN_TRACENO_PARAM.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_UNKNOWN_TRACENO_PARAM.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_UNKNOWN_CMD.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_UNKNOWN_CMD.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_UNKNOWN_TRX_ID.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_UNKNOWN_TRX_ID.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_INVALID_MID.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_INVALID_MID.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_INVALID_TID.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_INVALID_TID.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_INVALID_AMOUNT.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_INVALID_AMOUNT.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_INVALID_TRACENO.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_INVALID_TRACENO.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_RECORD_NOT_FOUND.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_RECORD_NOT_FOUND.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_BATCH_EMPTY.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_BATCH_EMPTY.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_SETTLE_FAIL.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_SETTLE_FAIL.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_COMM_ERROR.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_COMM_ERROR.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_CARD_NOT_SUPPORTED.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_CARD_NOT_SUPPORTED.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_BAD_ACCOUNT.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_BAD_ACCOUNT.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_ALREADY_VOIDED.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_ALREADY_VOIDED.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_TXN_CANCELLED.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_TXN_CANCELLED.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_MUST_SETTLE.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_MUST_SETTLE.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_SETTLE_HOST1_SUCCESS.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_SETTLE_HOST1_SUCCESS.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_SETTLE_HOST2_SUCCESS.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_SETTLE_HOST2_SUCCESS.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_SETTLE_ALL_HOST_SUCCESS.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_SETTLE_ALL_HOST_SUCCESS.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_ERROR.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_ERROR.name
						 .toLowerCase());
	 } else if (returnCode === CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_TRX_NOT_SUPPORT.value) {
		 message += getMsgValue(messagePrefix
				 + CONSTANTS.EFT.WIRECARD_ERR_MSG.DRIVER_TRX_NOT_SUPPORT.name
						 .toLowerCase());
	 }
	 // if message is empty string
	 if (message == "") {
		 message = getMsgValue('eft_msg_err_processing_failed');
	 }
	 showMsgDialog(message, "warning");
 
	 // if the transaction to bank fails;
	 if (!eftTransactionType.toLowerCase().search(
			 CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO.toLowerCase()) != -1
			 && !eftTransactionType.toLowerCase() === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SETTLEMENT_DATA.name
					 .toLowerCase()
			 && !eftTransactionType.toLowerCase() === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.GET_SETTLEMENT_DATA.name
					 .toLowerCase()) {
		 clearEFT();
	 }
 
	 // re-settle transaction report
	 if (eftTransactionType.toLowerCase() === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SETTLEMENT_DATA.name
			 .toLowerCase()
			 || eftTransactionType.toLowerCase() === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.GET_SETTLEMENT_DATA.name
					 .toLowerCase()) {
		 EFT.reprocessSettlementData();
	 }
 }
 
 /**
  * Check if the parsed message only consists of a return code.
  *
  * @param parsedResponseMesssage
  * @returns {Boolean}
  */
 function isResponseMessageReturnCodeOnly(parsedResponseMesssage) {
	 uilog("DBUG","isResponseMessageReturnCodeOnly() -- executed");
	 var returnCode = null;
	 if (Object.keys(parsedResponseMesssage).length == 1
			 && parsedResponseMesssage
					 .hasOwnProperty(CONSTANTS.EFT.RETURN_CODE.ERROR.code)) {
		 returnCode = parsedResponseMesssage[CONSTANTS.EFT.RETURN_CODE.ERROR.code].msgVal;
		 uilog("DBUG","returnCode has err: " + returnCode);
	 }
	 uilog("DBUG","returnCode: " + returnCode);
	 return returnCode;
 }
 
 /**
  * Get Bank Mega message length based on its message signature.
  *
  * @param msgLenArr
  * @returns msgLen - message length in int
  */
 function getBankMegaMsgLength(msgLenArr) {
	 try {
		 uilog("DBUG", msgLenArr);
		 var msgLen = "";
		 for ( var i = 0; i < msgLenArr.length; i++) {
			 msgLen += toHex(msgLenArr[i]);
		 }
 
		 return parseInt(msgLen, 16);
	 } catch (err) {
		 showMsgDialog(getMsgValue("eft_msg_err_unparsed_data_length"), "error");
	 }
 }
 
 /**
  * Updates the eft data from old pos transaction.
  */
 var updateEftDataFromPosTransaction = function updateEftDataFromPosTransaction() {
	 uilog("DBUG","updateEftDataFromPosTransaction()--execute ");
	 var eft = null;
	 var posTxn = eftOnlineObj.posTxn;
	 var traceNumber = eftOnlineObj.traceNumber;
 
	 formatEftForPaymentMedia();
 
	 if (posTxn && traceNumber) {
		 for ( var ctr = 0; ctr < posTxn.payments.length; ctr++) {
			 if (posTxn.payments[ctr].paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name
					 && (posTxn.payments[ctr].eftData && posTxn.payments[ctr].eftData.traceNum == traceNumber)) {
				 posTxn.payments[ctr].eftData.transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.VOID.desc
						 + ' ' + posTxn.payments[ctr].eftData.transactionType;
				 eft = posTxn.payments[ctr].eftData;
				 break;
			 }
		 }
	 }
	 uilog("DBUG","updateEftDataFromPosTransaction()--execute"
			 + JSON.stringify(eft));
	 return eft;
 };
 
 /**
  * Entry when selected transcation from pressing EFT Online
  *
  * @param payment
  */
 function eftPaymentProcess(payment) {
	 var eftParams = {
		 bank : configuration.banks[CONSTANTS.EFT.BANK.BANK_MEGA.name],
		 onlineFlag : CONSTANTS.EFT.STATUS.ONLINE,
		 payment : payment,
		 transactionType : eftTransactionType,
		 vendor : eftVendor
	 };
	 if (isTrainingModeOn) {
		 showConfirmDialog(getMsgValue('confirm_msg_training_mode_edc_device'),
			 getMsgValue('confirm_lbl_training_mode_edc_device'),
			 function() {
				 EFT.processEFTOnlineTransaction(eftParams);
			 });
	 } else {
		 EFT.processEFTOnlineTransaction(eftParams);
	 }
 }
 
 /**
  * Timeout function for eft transactions
  */
 var executeAfterEftProcessingDialogExpires = function executeWhenEftDialogExpires() {
	 var eftWarningMsg = "";
	 var showDialog = false; 
	 if (eftType == CONSTANTS.EFT.TYPE.ONLINE_PAYMENT) {
		 if (eftTransactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE.name
				 || eftTransactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.ONE_DIP.name
				 || eftTransactionType
						 .search(CONSTANTS.EFT.INSTALLMENT_TYPE.MEGA_PAY) != -1
				 || eftTransactionType
						 .search(CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO) != -1) {
			 eftWarningMsg = getMsgValue("eft_msg_err_tx_expires");
			 if (saleTx.coBrandNumber) {
				 reverseMemberDiscount(false);
			 }
			 showDialog = true;
		 } else if (eftTransactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.VOID.name) {
			 eftWarningMsg = getMsgValue("eft_msg_err_void_txn_expires");
			 showDialog = true;
		 } else if (eftTransactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SETTLEMENT_ALL.name) {
			 eftWarningMsg = getMsgValue("eft_msg_err_settlement_all_expires");
			 showDialog = true;
		 } else if (eftTransactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SETTLEMENT_DATA.name) {
			 eftWarningMsg = getMsgValue("eft_msg_err_settlement_data_expires");
			 // resettle last settlement data
			 showMsgDialog(eftWarningMsg, "error", EFT.resettleData());
		 } else if (eftTransactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_SUMMARY_TXN.name){
			 eftWarningMsg = getMsgValue("eft_msg_err_transaction_summary_report_failed");
			 showDialog = true;
		 } else if(eftTransactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN.name
				 || eftTransactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN_BY_HOST.name
				 || eftTransactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN_BY_CARD.name){
			 eftWarningMsg = getMsgValue("eft_msg_err_detail_transaction_report_failed");
			 showDialog = true;
		 } else if (eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.RETRIEVE_TXN.name){
			 eftWarningMsg = getMsgValue("eft_msg_err_retrieve_transaction_expires");
			 showDialog = true;
		 }
		 
		 if(showDialog){
			 showMsgDialog(eftWarningMsg, "error");
			 $("#eft-processing-dialog").dialog("close");
		 }
	 }
 };
 
 /**
  * EFT Online Save Payments
  */
 var saveEftPayment = function saveEftPayment() {
	 var mediaType = "";
	 var payment = parseInt($("#inputDisplay").val());
 
	 // LUCKY - CALCULATE ZEPRO PAYMENT
	 uilog("DBUG","SAVEEFT: " + saleTx.eftTransactionType + " " + saleTx.zeproPaid);
 
		 if(saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO && typeof saleTx.zeproPaid == 'undefined' && !saleTx.zeproPaid)
		 {
				 $("#inputDisplay").val('');
				 payment = calculateZeproAmount(saleTx);
				 //console.log('payment' + payment);
		 saleTx.zeproPaid = true;
		 saleTx.zeproCardDone = true;
		 }
	 
	 uilog("DBUG","PAYMENT : " + payment);
	 var isMdrSurchargeApplicable = isHypercashTx && !toggleTVS;
	 uilog("DBUG","eftType : " + eftType);
	 if (eftType == CONSTANTS.EFT.TYPE.ONLINE_PAYMENT) {
		 mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name;
 
		 if ((isHcEnabled && profCust && profCust.customerNumber) && !toggleTVS) {
			 payment = payment + (Math.round(payment * (mdrConfig.mdrRate/100)));
			 renderTotal();
		 }		
	 } /* DEBIT */else if (eftType == CONSTANTS.EFT.TYPE.DEBIT) {
		 var bankId = getConfigValue('BANK_ID_DEBIT_BCA');
		 window.eftDataObj.bankId = bankId; // added window. because it is in
											 // conflict with eftData
		 mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.DEBIT.name;
 
		 if (isMdrSurchargeApplicable) {
			 payment = EFT.applyMdrSurchargeOnTotalAmount(payment);
			 renderTotal();
		 }
 
	 } /* EDC PAYMENT */else if (eftType == CONSTANTS.EFT.TYPE.EDC_PAYMENT) {
		 var bankId = getConfigValue('BANK_ID_EDC_PAYMENT');
		 window.eftDataObj.bankId = bankId; // added window. because it is in
											 // conflict with eftData
		 mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_PAYMENT.name;
 
		 if (isMdrSurchargeApplicable) {
			 payment = EFT.applyMdrSurchargeOnTotalAmount(payment);
			 renderTotal();
		 }
 
	 } /* CMC PAYMENT */else if (eftType == CONSTANTS.EFT.TYPE.CMC_PAYMENT) {
		 mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.CMC_EFT_ONLINE.name;
	 } /* CMC OFFLINE PAYMENT */else if (eftType == CONSTANTS.EFT.TYPE.CMC_OFFLINE_PAYMENT) {
		 mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.CMC_EFT_OFFLINE.name;
	 } /* EDC BCA */else if (eftType == CONSTANTS.EFT.TYPE.EDC_BCA) {
		 var bankId = getConfigValue('BANK_ID_EDC_BCA');
		 window.eftDataObj.bankId = bankId; // added window. because it is in
											 // conflict with eftData
		 mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_BCA.name;
 
		 if (isMdrSurchargeApplicable) {
			 payment = EFT.applyMdrSurchargeOnTotalAmount(payment);
			 renderTotal();
		 }
 
	 } /* OFFLINE */else {
		 mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_OFFLINE.name;
 
		 if (connectionOnline && isMdrSurchargeApplicable) {
			 /*
			  * Set the actual Bank Name selected for this EFT Offline Tx.
			  * Get the MDR config based on the selected bank. 
			  * Other than Bank Mega, each bank will have a configured default MDR 
			  * not based on BIN.
			  */
			 if(eftDataObj.bankId == 2){
				 eftDataObj.bankName = CONSTANTS.EFT.BANK.CITIBANK.name;
				 mdrConfig = getMdrConfigByBankName("DEFAULT_MDR_" + eftDataObj.bankName);
			 }else if(eftDataObj.bankId == 3){
				 eftDataObj.bankName = CONSTANTS.EFT.BANK.BRI.name;
				 mdrConfig = getMdrConfigByBankName("DEFAULT_MDR_" + eftDataObj.bankName);
			 }else if(eftDataObj.bankId == 4){
				 eftDataObj.bankName = CONSTANTS.EFT.BANK.AMEX.name;
				 mdrConfig = getMdrConfigByBankName("DEFAULT_MDR_" + eftDataObj.bankName);
			 }else if(eftDataObj.bankId == 5){
				 eftDataObj.bankName = CONSTANTS.EFT.BANK.BCA.name;
				 mdrConfig = getMdrConfigByBankName("DEFAULT_MDR_" + eftDataObj.bankName);
			 }
			 
			 payment = EFT.applyMdrSurchargeOnTotalAmount(payment);
			 renderTotal();
		 }
	 }
 
	 formatEftForPaymentMedia();
	 CASHIER.executePaymentMedia(saleTx, mediaType, payment, {
		 eftData : eftDataObj
	 });
	 clearEFT();
 };
 /**
  * This method will apply MDR Surcharge on Subtotal
  *
  * @param payment
  * @returns
  */
 EFT.applyMdrSurchargeOnTotalAmount = function(payment) {
	 var mdrSurcharge = Math.round(payment * (mdrConfig.mdrRate/100));
	 payment += mdrSurcharge;
	 eftDataObj.transactionAmount = payment;
 
	 // Increment value for overall/total MDR Surcharge Amount
	 if(eftType != CONSTANTS.EFT.TYPE.ONLINE_PAYMENT){
		 saleTx.totalMdrSurcharge += mdrSurcharge;
		 saleTx.totalAmount += mdrSurcharge;
	 }
	 return payment;
 };
 
 /**
  * This method will recalculate/remove MDR from Total Amount 
  * when EDC Transaction encountered error.
  *
  * @param payment
  * @returns
  */
 EFT.reCalculateMdrSurcharge = function() {
	 uilog('DBUG','@@@@Subtract value of Global Mdr Surcharge from total: '+mdrSurchargeGlobal);
	 saleTx.totalMdrSurcharge -= mdrSurchargeGlobal;
	 saleTx.totalAmount -= mdrSurchargeGlobal;
 };
 
 /**
  * Populates credit card description based on card type id.
  */
 function populateCreditCardTypeGlobal() {
	 var cardTypeEnum = getConfigCodeEnumeration("CREDIT_CARD_TYPE");
	 var cardTypes = {};
	 for ( var i in cardTypeEnum) {
		 cardTypes[cardTypeEnum[i].code] = cardTypeEnum[i].description;
	 }
	 creditCardType = cardTypes;
 }
 
 /**
  * Appends a negative symbol on the printing of receipt
  */
 EFT.appendNegativeSymbolIfEftIsVoided = function appendNegativeSymbolIfEftIsVoided(
		 eftTxnType) {
	 if (eftTxnType.search(CONSTANTS.EFT.EFT_TRANSACTION_TYPE.VOID.desc) != -1) {
		 return "-";
	 }
	 return "";
 };
 
 /**
  * Displays EFT Processing Dialog Message
  */
 EFT.displayEftProcessingMsg = function() {
	 $("#eftProcessingMsg").empty();
	 // default message
	 var message = "";
	 if(eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE.name
			 || eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE_INQ.name
			 || eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.MEGA_POINT.name
			 || eftTransactionType.search(CONSTANTS.EFT.INSTALLMENT_TYPE.MEGA_PAY) != -1
			 || eftTransactionType.search(CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO) != -1
			 || eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.ONE_DIP.name){
		 message = getMsgValue("eft_msg_info_processing_swipe_card");
	 } else if (eftTransactionType.toLowerCase() == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.VOID.name
			 .toLowerCase()) {
		 message = getMsgValue("eft_msg_info_processing_void_txn");
	 } else if (eftTransactionType.toLowerCase() == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SETTLEMENT_ALL.name
			 .toLowerCase()) {
		 message = getMsgValue("eft_msg_info_processing_settlement_all");
	 } else if (eftTransactionType.toLowerCase() == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SETTLEMENT_DATA.name
			 .toLowerCase()) {
		 message = getMsgValue('eft_msg_info_processing_settlement_data')
				 .format(
						 EFT
								 .getHostTypeDesc(EFT.hostTypeList[EFT.settledHostCount]));
	 } else if (eftTransactionType.toLowerCase() == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_SUMMARY_TXN.name
			 .toLowerCase()) {
		 message = getMsgValue('eft_msg_info_processing_transaction_summary_report');
	 } else if (eftTransactionType.toLowerCase() == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN.name
			 .toLowerCase()
			 || eftTransactionType.toLowerCase() == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN_BY_HOST.name
					 .toLowerCase()
			 || eftTransactionType.toLowerCase() == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN_BY_CARD.name
					 .toLowerCase()) {
		 message = getMsgValue('eft_msg_info_processing_detail_transaction_report');
	 } else if (eftTransactionType.toLowerCase() == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.RETRIEVE_TXN.name
			 .toLowerCase()){
		 message = getMsgValue("eft_msg_info_processing_retrieve_transaction");
	 } else{
		 uilog("DBUG","Transaction not supported.");
	 }
 
	 $("#eftProcessingMsg").append(message);
 };
 
 /**
  * Get Host Type Description
  */
 EFT.getHostTypeDesc = function(hostType) {
	 try {
		 if (hostType) {
			 for ( var hostTypeConst in CONSTANTS.EFT.HOST_TYPE) {
				 if (hostType.toLowerCase() === CONSTANTS.EFT.HOST_TYPE[hostTypeConst].value
						 .toLowerCase())
					 return CONSTANTS.EFT.HOST_TYPE[hostTypeConst].desc;
			 }
		 } else {
			 showMsgDialog(getMsgValue('eft_msg_err_host_type_does_not_exist'),
					 "error");
		 }
	 } catch (err) {
		 uilog("DBUG","@EFT.getHostTypeDesc() Error: " + err, "error");
		 return "";
	 }
 };
 
 //TODO:
 /*EFT.isValidForClearingState = function(){
	 if(eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE.name
			 || eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.MEGA_POINT.name
			 || eftTransactionType.toLowerCase() == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN.name.toLowerCase()
			 || eftTransactionType.toLowerCase() == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN_BY_HOST.name.toLowerCase()
			 || eftTransactionType.toLowerCase() == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN_BY_CARD.name.toLowerCase()
			 || eftTransactionType.toLowerCase() == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.RETRIEVE_TXN.name.toLowerCase()) {
		 clearEFT(true);
	 }
 };*/
 
 /*******************************************************************************
  * Singletons
  ******************************************************************************/
 /**
  * Transaction Summary Report List instance
  */
 EFT.transactionSummaryReportList = (function() {
	 var instance = null;
 
	 function init() {
		 var transactionSummaryList = [];
 
		 return {
			 getTransactionSummaryList : function() {
				 return transactionSummaryList;
			 },
			 addTransactionSummaryData : function(txnSummaryData) {
				 transactionSummaryList.push(txnSummaryData);
			 }
		 };
	 }
 
	 return {
		 // Get the Singleton instance if one exists
		 // or create one if it doesn't
		 getInstance : function() {
 
			 if (!instance) {
				 instance = init();
			 }
 
			 return instance;
		 },
		 destroyInstance : function() {
			 instance = null;
		 }
	 };
 })();
 
 /**
  * Detail Transaction Report instance
  */
 EFT.detailTransactionReportHostList = (function() {
	 var instance = null;
 
	 function init() {
		 var detailTransactionReportHostList = [];
 
		 return {
			 // add detail transaction by host.
			 addDetailTransactionReportHostList : function(obj) {
				 detailTransactionReportHostList.push(obj);
			 },
			 // get all detail transaction in the list.
			 getDetailTransactionReportHostList : function() {
				 return detailTransactionReportHostList;
			 }
		 };
	 }
 
	 return {
		 // Get the Singleton instance if one exists
		 // or create one if it doesn't
		 getInstance : function() {
 
			 if (!instance) {
				 instance = init();
			 }
 
			 return instance;
		 },
		 destroyInstance : function() {
			 instance = null;
		 }
	 };
 })();
 
 /**
  * Transaction Summary Report List instance
  */
 EFT.settledTransactionList = (function() {
	 var instance = null;
 
	 function init() {
		 var settledTransactionList = [];
 
		 return {
			 getSettledTransactionList : function() {
				 return settledTransactionList;
			 },
			 addSettledTransaction : function(settledTransaction) {
				 settledTransactionList.push(settledTransaction);
			 }
		 };
	 }
 
	 return {
		 // Get the Singleton instance if one exists
		 // or create one if it doesn't
		 getInstance : function() {
 
			 if (!instance) {
				 instance = init();
			 }
 
			 return instance;
		 },
		 destroyInstance : function() {
			 instance = null;
		 }
	 };
 })();
 