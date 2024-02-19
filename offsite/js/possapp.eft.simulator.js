/************************************
 * Simulator for edc
 * Replace this init function with the existing
 */
var EFTSimulator = null || {};

EFTSimulator.Simulator = "Simulator loaded.";

EFTSimulator.EFTOnline = function(eftParams){
	this.bank 				= eftParams.bank;
	this.oldEftData 		= eftParams.oldEftData;
	this.payment 			= eftParams.payment;
	this.posTxn 			= eftParams.posTxn;
	this.traceNumber 		= eftParams.traceNumber;
	this.transactionType 	= eftTransactionType;
	this.vendor 			= eftVendor;
	this.onlineFlag			= CONSTANTS.EFT.STATUS.ONLINE;

	//initialize global variables
	eftConfigObj = JSON.parse(getEFTConfiguration(this.vendor));
	eftDataObj = new ElectronicFundTransferModel();
};

EFTSimulator.EFTOnline.prototype.createRequestMessageToEdc = function(){
	uilog("DBUG","createRequestMessageToEdc() -- execute");
	var requestType = CONSTANTS.EFT.MSG_TYPE.REQUEST;
	var transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE[this.transactionType].desc;
	var requestMessageStrBuffer = "";

	var requestParams = EFTSimulator.getMessageParamsByRequestAndTransactionType(requestType, transactionType);
	var requestValues = EFTSimulator.getEftRequestValuesByTransactionType(this);

	var requestMessageArrMap = EFTSimulator.mapRequestValuesToEftRequestMessageParam(requestParams, requestValues, eftDataObj);

	if(this.vendor.toLowerCase() == CONSTANTS.EFT.VENDOR.WIRECARD.name.toLowerCase()){
		requestMessageStrBuffer = stringifyRequestMessageFromWirecard(requestMessageArrMap);
	} else if (eftConfigObj.vendorName.toLowerCase() == CONSTANTS.EFT.VENDOR.KARTUKU.name.toLowerCase()){
		//TODO: kartuku and other vendor functions can start here to create req message.
	}

	return requestMessageStrBuffer;
};


EFTSimulator.getEftRequestValuesByTransactionType = function(eftOnlineObject){
	var requestFactory = new EftRequestFactory();
	var properties = {
			transactionId 	: eftOnlineObject.posTxn.transactionId,
			transactionType : eftOnlineObject.transactionType,
			storeCode 		: eftOnlineObject.posTxn.storeCd
	};

	if(eftOnlineObject.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE.name
			|| eftOnlineObject.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.ONE_DIP.name
			|| eftOnlineObject.transactionType.search(CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO.name) != -1
			|| eftOnlineObject.transactionType.search(CONSTANTS.EFT.INSTALLMENT_TYPE.MEGA_PAY.name) != -1){
		properties.transactionAmount = eftOnlineObject.payment;
	} else if(eftOnlineObject.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.VOID.name){
		properties.traceNum = eftOnlineObject.traceNumber;
	} else if(eftOnlineObject.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SETTLEMENT_ALL.name
			|| eftOnlineObject.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SETTLEMENT_DATA.name){
		properties.transactionId = "000000000000000";
	}

	uilog("DBUG","getEftRequestValuesByTransactionType() -- executed");
	return requestFactory.createRequest(properties);
};

EFTSimulator.getMessageParamsByRequestAndTransactionType = function(requestType, transactionType, isSorted){
	uilog("DBUG","getEftMessageParamsByRequestAndTransactionType() -- execute");
	var eftMsgParams = [];
	for(var ctr = 0; ctr < eftConfigObj.eftMsgParams.length; ctr ++){
		var msgParam = eftConfigObj.eftMsgParams[ctr];
		if(msgParam.messageType.toLowerCase() == requestType.toLowerCase()
				//transaction type = eft transaction type
				&& msgParam.messageTxnType.toLowerCase() == transactionType.toLowerCase()){
			eftMsgParams.push(msgParam);
		}
	}

	if(isSorted){
		eftMsgParams.sort(sortBySequenceNum);
	}

	//sort the message params by its sequence number
	return eftMsgParams;
};

EFTSimulator.mapRequestValuesToEftRequestMessageParam = function(msgParams, msgValues, model) {
	uilog("DBUG","mapRequestValuesToEftRequestMessageParam() -- execute");
	var msgArr = [], msgParam = null, modelProperty = null;
	for(var i = 0; i < msgParams.length; i++){
		msgParam = msgParams[i];
		modelProperty = CONSTANTS.EFT.MSG_PARAM[msgParam.messageDescription].property;
		if(msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.ONLINE_FLAG.name){
			msgArr.push(new EFTRequestMessageParam(
				msgParam.messageSequenceNumber,
				msgParam.messageSize,
				msgValues.onlineFlag
			));
			model[modelProperty] = msgValues.onlineFlag;
		} else if(msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.TRANSACTION_CODE.name) {
			msgArr.push(new EFTRequestMessageParam(
				msgParam.messageSequenceNumber,
				msgParam.messageSize,
				msgValues.transactionCode
			));
			model[modelProperty] = msgValues.transactionCode;
		 } else if(msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.TRANSACTION_AMOUNT.name){
			msgArr.push(new EFTRequestMessageParam(
				msgParam.messageSequenceNumber,
				msgParam.messageSize,
				addLeadingZeroes(msgValues.transactionAmount, msgParams[i].messageSize)
			));
			model[modelProperty] = msgValues.transactionAmount;
		 } else if(msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.POS_NUM.name){
			msgArr.push(new EFTRequestMessageParam(
				msgParam.messageSequenceNumber,
				msgParam.messageSize,
				msgValues.posId
			));
			model[modelProperty] = msgValues.posId;
		 } else if(msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.TRANSACTION_NUM.name){
			msgArr.push(new EFTRequestMessageParam(
				msgParam.messageSequenceNumber,
				msgParam.messageSize,
				addLeadingZeroes(msgValues.transactionId, msgParams[i].messageSize)
			));
			model[modelProperty] = msgValues.transactionAmount;
		 } else if(msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.STORE_CODE.name){
			 msgArr.push(new EFTRequestMessageParam(
				msgParam.messageSequenceNumber,
				msgParam.messageSize,
				addLeadingZeroes(removeLeadingZeroes(msgValues.storeId), msgParams[i].messageSize)
 			 ));
			 model[modelProperty] = removeLeadingZeroes(msgValues.storeId);
		 } else if(msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.CASHIER_ID.name){
			 msgArr.push(new EFTRequestMessageParam(
				msgParam.messageSequenceNumber,
				msgParam.messageSize,
				msgValues.cashierId
 			 ));
			 model[modelProperty] = msgValues.cashierId;
		 } else if(msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.TRACE_NUM.name){
			 msgArr.push(new EFTRequestMessageParam(
				msgParam.messageSequenceNumber,
				msgParam.messageSize,
				msgValues.traceNumber
 			 ));
			 model[modelProperty] = msgValues.traceNumber;
		 }
	}
	uilog("DBUG","messageArray: " + JSON.stringify(msgArr));
	return msgArr;
};

EFTSimulator.EFTOnline.prototype.parseResponseMessageFromEdc = function(rawMsg){
	var requestType = CONSTANTS.EFT.MSG_TYPE.RESPONSE;
	var transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE[this.transactionType].desc;
	var eftMessageParam = getEftMessageParamsByRequestAndTransactionType(requestType, transactionType, true);

	if(this.vendor.toLowerCase() == CONSTANTS.EFT.VENDOR.WIRECARD.name.toLowerCase()) {
		var responseMsgObj = buildResponseMessageFromWirecard(rawMsg);
		var returnCode = isResponseMessageReturnCodeOnly(responseMsgObj);
		if(returnCode){
			processReturnCodeFromWirecard(returnCode);
		} else {
			processEftResponseMessage(eftMessageParam, responseMsgObj);
		}
	} else if (this.vendor.toLowerCase() == CONSTANTS.EFT.VENDOR.KARTUKU.name.toLowerCase()){
		//TODO: Kartuku and other banks functions can start here to create response message
	}
};

// simulator
EFTSimulator.createEftSimulatorResponse = function(){
	uilog("DBUG","EFTSimulator.createEftSimulatorResponse() -- execute");
	var requestType = CONSTANTS.EFT.MSG_TYPE.RESPONSE;
	var transactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE[eftTransactionType].desc;
	var eftMessageParam = getEftMessageParamsByRequestAndTransactionType(requestType, transactionType, true);

	//set sample data from this method
	var encryptedMsg = EFTSimulator.getSampleResponse();

	var decodedMsg = decryptData(eftConfigObj, encryptedMsg);
	var parsedResponseMesssage = parseResponseMessageFromWirecard(decodedMsg);

	var returnCode = isResponseMessageReturnCodeOnly(parsedResponseMesssage);
	if(returnCode){
		processReturnCodeFromWirecard(returnCode);
	} else {
		processEftResponseMessage(eftMessageParam, parsedResponseMesssage);
	}
}

EFTSimulator.getSampleResponse = function(){
	var returnVal = "";
	if(eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.VOID.name){
		returnVal = "c8d9ca3594b78e44792ee77615e00f97eb664faa6ed73d90aac1e936851ce3b20f3cc587b14b206cf6bf5d014674d08afa1689197327cdaf220a7667cbf485fb03bf95e2541570e0708b927334730934de392a2579045c988f6d8e775e6b36c978e767e7ce3c599cb734a99fe85afa360da326c169d7e21d6c7372fe69b21530e7402e98ed0b95eebde56d2b81f109d747facd80db559a8f8e425922c913b111691e1d3688fe22c75aeb92edc6cecd617366a316d8c0deff68fe65e2c637657b0a8e4b243eef72e4bb62684d4594ad9535df01e336a0fe337ea592aad6fa941a5a06b8fbf082273c079f2e1260964396ce42b6eeb456933bdfc84ff28ca64620e224685072abb87fc0841872062063ec";
	} else if(eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE.name){
		returnVal = "b522f55e12a391bcf2cb88d41c4df038006904b807de3ef036350d742e0735058202a1398e2b729354b4a8ab1906ddbb4458a5b25f7c35779d053e7f5d85714ba614f5d1c894dc6a2132112d6b20d55270c1506237c820cf353585a1d9c1d6adf61890588907d6d98047169f4b0e7c8e49845a180cf07489140a8164b34144339c707d612fa98ee5812d5d77eb612af95ee03b9094899b0591e2cbc1252a1ffb4d3d9091a419ed11181f5a06aaa45b9fbee2b9b40a5a8d9cf10d7f59059b45aa39f82991058da74489558bba7b947ced6c5cf8ec5706a8b025ad98e07f9e9fdc1f527c0423bdd75305cda893855a33e92b8e9674de99181651c0d9e80c3bb220b0752c3afd680d477dcc44ddb836dc67";
	} else if(eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.MEGA_PAY3.desc){
		returnVal = "b522f55e12a391bcf2cb88d41c4df0389937471bd25bef92d111a53e6fcaec75dee684f6fb0693957ee0e481326ffd8fb7d2971c9da1118729583765fd43b302b4f3d97b65025ef2a99c91ba0621139c639410321227034629c4ca5e152b4a5d2f4d7f76b3f0db10a3125b280e5a4a309058d594b23da89a53f620fbee4a465351c096b0e65f5af835c254f04681a84ae4a65e7b1549abbadf22c6d01dd3899f1725f70d5e89ff3b1ca769f941d9a6f3703e8b985d1c6206ef17e2cb2789e1db60eaab14229aaab96d59a79ee3341295095e7576797b55c533bdb7ca9f6b58a88ac8bcfea69daf598811dbe4c48967781811469f8c93669b6ac5c15b3330ce08fdcb2dfc95ed9fa66bbf4959875f21c4a0375a539c03ab8958efb5b37afabb0ef2c3cd2256c3d440dc5591b50b8e639b";
	} else if(eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.ZEPRO3.desc){
		returnVal = "c8d9ca3594b78e44792ee77615e00f97eb664faa6ed73d90aac1e936851ce3b20f3cc587b14b206cf6bf5d014674d08afa1689197327cdaf220a7667cbf485fb03bf95e2541570e0708b927334730934de392a2579045c988f6d8e775e6b36c978e767e7ce3c599cb734a99fe85afa360da326c169d7e21d6c7372fe69b21530e7402e98ed0b95eebde56d2b81f109d747facd80db559a8f8e425922c913b111691e1d3688fe22c75aeb92edc6cecd617366a316d8c0deff68fe65e2c637657b0a8e4b243eef72e4bb62684d4594ad9535df01e336a0fe337ea592aad6fa941a5a06b8fbf082273c079f2e1260964396ce42b6eeb456933bdfc84ff28ca64620e224685072abb87fc0841872062063ec";
	} else if(eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.ONE_DIP.desc){
		returnVal = "068d18ff1345beb9d53715d29d2238db3832bddbbfa0162f14ce18f8eeb16f5be3774d716f0b52a4a13110eb9153e6fd709280ab525baba9719d8cf15f3e042198b8073eae0d1635033ee04d035431324bc7a676d636335a24cb8b6e9c2c4817dfc7ec031a50bf5da7ecca38e8766b863bf51721c496c7bb2e30c7cb5e74d66b5e2ff8603b744813954e90c4bee615cc3d7f0e41598fa43b348ad136e5b70e177e09627b4efece5e53466917cc21122c58123b430078d61fd996fe08772ce15ea784c9ccd26b3a0c51a9e8c7114aefac5d9ae8a968c3014e42dc9e777d1700e9bde98e5720da555f64260adaf504aa1e801f02dcb9e54dccf1db6fcee7eb5e4a4f6d18dc0a4cb5c5f6158b20ce6e78575ec20d7aecedd9dcd813fc4365334818a532e292f6c75918b219745c3c310d9475a9ac0009034274f36bcaa02caaa6b53cd2a5796bfbfa7b0c77e4a271a2e3f5";
	} else if(eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SETTLEMENT_ALL.name){
		returnVal = "e4d1b36e5b067aefed3df5534ea0fda7";
	}
	return returnVal;
}

EFTSimulator.createRequestValuesFromRequestParams = function(requestParams){
	uilog("DBUG","createRequestValuesFromRequestParam() -- execute");
	var reqMsgArr = [], msgParam = null, modelProperty = null;
	for(var i = 0; i < requestParams.length; i++){
		msgParam = requestParams[i];
		if(msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.ONLINE_FLAG.name){
			reqMsgArr.push(new EFTRequestMessageParam(
				msgParam.messageSequenceNumber,
				msgParam.messageSize,
				msgValues.onlineFlag
			));
		} else if(msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.TRANSACTION_CODE.name) {
			reqMsgArr.push(new EFTRequestMessageParam(
				msgParam.messageSequenceNumber,
				msgParam.messageSize,
				msgValues.transactionCode
			));
		 } else if(msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.TRANSACTION_AMOUNT.name){
			reqMsgArr.push(new EFTRequestMessageParam(
				msgParam.messageSequenceNumber,
				msgParam.messageSize,
				addLeadingZeroes(msgValues.transactionAmount, msgParams[i].messageSize)
			));
		 } else if(msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.POS_NUM.name){
			reqMsgArr.push(new EFTRequestMessageParam(
				msgParam.messageSequenceNumber,
				msgParam.messageSize,
				msgValues.transactionId
			));
		 } else if(msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.TRANSACTION_NUM.name){
			reqMsgArr.push(new EFTRequestMessageParam(
				msgParam.messageSequenceNumber,
				msgParam.messageSize,
				addLeadingZeroes(msgValues.transactionId, msgParams[i].messageSize)
			));
		 } else if(msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.STORE_CODE.name){
			 reqMsgArr.push(new EFTRequestMessageParam(
				msgParam.messageSequenceNumber,
				msgParam.messageSize,
				addLeadingZeroes(removeLeadingZeroes(msgValues.storeId), msgParams[i].messageSize)
 			 ));
		 } else if(msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.CASHIER_ID.name){
			 reqMsgArr.push(new EFTRequestMessageParam(
				msgParam.messageSequenceNumber,
				msgParam.messageSize,
				msgValues.cashierId
 			 ));
		 } else if(msgParam.messageDescription.toUpperCase() == CONSTANTS.EFT.MSG_PARAM.TRACE_NUM.name){
			 reqMsgArr.push(new EFTRequestMessageParam(
				msgParam.messageSequenceNumber,
				msgParam.messageSize,
				msgValues.traceNumber
 			 ));
		 }
	}
	uilog("DBUG","messageArray: " + JSON.stringify(reqMsgArr));
}
