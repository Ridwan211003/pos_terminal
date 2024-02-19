var ElectronicFundTransferModel = function ElectronicFundTransferModel(){
	this.bankName 			= "";
	this.bankId				= "";
	this.bankName			= "";
	this.batchNum			= "";
	this.cardFlag			= "";
	this.cardHolder			= "";
	this.cardNum			= "";
	this.cardType			= "";
	this.cashierId			= "";
	this.catalogCode		= "";
	this.expCard			= "";
	this.firstInstallment	= "";
	this.header1			= "";
	this.header2			= "";
	this.header3			= "";
	this.header4			= "";
	this.interestRate		= "";
	this.merchantId			= "";
	this.onlineFlag                 = "0";
	this.openingPoint		= "";
	this.period				= "";
	this.pointRedeemed		= "";
	this.posId				= "";
	this.redeemReference	= "";
	this.referenceCode		= "";
	this.returnCode			= "";
	this.signature			= "";
	this.stan				= "";
	this.storeCode			= "";
	this.terminalId			= "";
	this.traceNum			= "";
	this.transactionAmount  = "";
	this.transactionCode    = "";
	this.transactionDate    = "";
	this.transactionId      = "";
	this.transactionTime	= "";
	this.transactionType	= "";
	this.tvr				= "";
	this.withdrawalAmount	= "";
	this.withdrawalType		= "";
	this.memberID = "";
	this.memberName = "";
	this.prevPoints = "";
	this.pppUsedPoints = "";
	return this;
};

ElectronicFundTransferModel.prototype.initEftOfflineModel = function (tx, bank, payment, trxType){
	this.storeCode			= tx.storeCd;
	this.posId 				= configuration.terminalNum === undefined ? null : configuration.terminalNum;
	this.cashierId			= loggedInUsername;
	this.transactionId 		= tx.transactionId;
	this.transactionAmount 	= payment;
	this.bankName 			= bank;
	this.transactionType		= trxType;
	return this;
};

/**
 * Model: Settlement All
 */
var SettlementAllModel = function SettlementAllModel(){
};

SettlementAllModel.prototype.updateSettlementAllModel = function(params){
	for(var prop in params){
		this[prop] = params[prop];
	}
};

/**
 * Model: Settlement Data
 */
var SettlementDataModel = function SettlementDataModel(){
	this.cardName 					= "";
	this.salesCount 				= 0;
	this.salesTotal 				= 0;
	this.refundsCount 				= 0;
	this.refundsTotal				= 0;
	this.offlineCount				= 0;
	this.offlineTotal				= 0;
	this.voidSalesCount				= 0;
	this.voidSalesTotal     		= 0;
	this.voidRefundsCount			= 0;
	this.voidRefundsTotal   		= 0;
	this.redeemCount				= 0;
	this.redeemTotal				= 0;
	this.totalCount					= 0;
	this.total						= 0;
	this.grandTotalSalesCount 		= 0;
	this.grandTotalSalesTotal 		= 0;
	this.grandTotalRefundsCount 	= 0;
	this.grandTotalRefundsTotal	 	= 0;
	this.grandTotalOfflineCount 	= 0;
	this.grandTotalOfflineTotal 	= 0;
	this.grandTotalVoidSalesCount 	= 0;
	this.grandTotalVoidSalesTotal 	= 0;
	this.grandTotalVoidRefundsCount = 0;
	this.grandTotalVoidRefundsTotal = 0;
	this.grandTotalRedeemCount 		= 0;
	this.grandTotalRedeemTotal 		= 0;
	this.grandTotalTotalsCount 		= 0;
	this.grandTotalTotals 			= 0;
};

//update settlement data
SettlementDataModel.prototype.updateSettlementDataModel = function(params){
	for(var prop in params){
		this[prop] = params[prop];
	}
};

/**
 * Model : Summary Transaction
 */
var transactionSummaryDataModel =  function(){
	//default
	this.cardName 					= "";
	this.salesCount 				= 0;
	this.salesTotal 				= 0;
	this.refundsCount 				= 0;
	this.refundsTotal				= 0;
	this.offlineCount				= 0;
	this.offlineTotal				= 0;
	this.voidSalesCount				= 0;
	this.voidSalesTotal     		= 0;
	this.voidRefundsCount			= 0;
	this.voidRefundsTotal   		= 0;
	this.redeemCount				= 0;
	this.redeemTotal				= 0;
	this.totalCount					= 0;
	this.total						= 0;
	this.grandTotalSalesCount 		= 0;
	this.grandTotalSalesTotal 		= 0;
	this.grandTotalRefundsCount 	= 0;
	this.grandTotalRefundsTotal	 	= 0;
	this.grandTotalOfflineCount 	= 0;
	this.grandTotalOfflineTotal 	= 0;
	this.grandTotalVoidSalesCount 	= 0;
	this.grandTotalVoidSalesTotal 	= 0;
	this.grandTotalVoidRefundsCount = 0;
	this.grandTotalVoidRefundsTotal = 0;
	this.grandTotalRedeemCount 		= 0;
	this.grandTotalRedeemTotal 		= 0;
	this.grandTotalTotalsCount 		= 0;
	this.grandTotalTotals 			= 0;
};

transactionSummaryDataModel.prototype.appendCardDataToTransactionSummaryDataModel = function(params){
	for(var prop in params){
		this[prop] = params[prop];
	}
};

transactionSummaryDataModel.prototype.appendGrandTotalToTransactionSummaryDataModel = function(params){
	for(var prop in params){
		this[prop] = params[prop];
	}
};

/**
 * Model : Detail Transaction Report
 */
var DetailTransactionReportModel = function (){
};

/**
 * Model : Detail Transaction Report By Host
 */
var DetailTransactionDataReportModel = function(){
};

DetailTransactionDataReportModel.prototype.updateDetailTransactionDataReportModel = function(params){
	for(var prop in params){
		this[prop] = params[prop];
	}
};


/**
 * Model : Detail Transaction Report By Card
 */
var DetailTransactionTotalReportModel = function(){
};

DetailTransactionTotalReportModel.prototype.updateDetailTransactionTotalReportModel = function(params){
	for(var prop in params){
		this[prop] = params[prop];
	}
};

/**
 * Model : Eft Retrieve Transaction
 **/
var RetrieveTransactionModel = function (){
};

RetrieveTransactionModel.prototype.updateRetrieveTransactionModel = function(params){
	for(var prop in params){
		this[prop] = params[prop];
	}
};
