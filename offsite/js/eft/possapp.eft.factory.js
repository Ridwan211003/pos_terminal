/*******************************************
 * EFT Request Factory Start
 *******************************************/
/**
 * Eft Parent Request Object
 */
var EftParentRequest = {
	init: function(p){
		this.storeCode			= p.storeCode;
		this.transactionId		= p.transactionId;
		this.posId 				= configuration.terminalNum === undefined ? null : configuration.terminalNum;
		this.cashierId			= loggedInUsername;
		this.onlineFlag			= CONSTANTS.EFT.STATUS.ONLINE;
		this.transactionCode  	= CONSTANTS.EFT.EFT_TRANSACTION_TYPE[p.transactionType].code;
	}
};

var EftSaleRequest = function(properties){
	function R(){};
	R.prototype = EftParentRequest;

	this.r = new R();
	this.r.init(properties);

	this.r.transactionAmount 	= properties.transactionAmount;

	return this.r;
};

var EftSaleInqRequest = function(properties){
	function R(){};
	R.prototype = EftParentRequest;

	this.r = new R();
	this.r.init(properties);

	uilog("DBUG", "EftSaleInqRequest init: " + JSON.stringify(this.r));


	return this.r;
};


var EftVoidRequest = function(properties){
	function R(){};
	R.prototype = EftParentRequest;

	this.r = new R();
	this.r.init(properties);

	this.r.traceNumber = properties.traceNumber;

	return this.r;
};

var EftSettlementRequest = function(properties){
	function R(){};
	R.prototype = EftParentRequest;

	this.r = new R();
	this.r.init(properties);

	return this.r;
};

var EftTransactionSummaryReportRequest = function(properties){
	function R(){};
	R.prototype = EftParentRequest;

	this.r = new R();
	this.r.init(properties);

	return this.r;
};

var EftDetailedTransactionReportRequest = function(properties){
	function R(){};
	R.prototype = EftParentRequest;

	this.r = new R();
	this.r.init(properties);

	return this.r;
};

var EftGetSettlemenDatatRequest = function(properties){
	function R(){};
	R.prototype = EftParentRequest;

	this.r = new R();
	this.r.init(properties);

	this.r.hostType = properties.hostType;

	return this.r;
};

var EftRetrieveTransactionRequest = function(properties){
	function R(){};
	R.prototype = EftParentRequest;

	this.r = new R();
	this.r.init(properties);

	this.r.traceNumber = properties.traceNumber;
	this.r.transactionAmount 	= properties.transactionAmount;

	return this.r;
};


function EftRequestFactory(){
	//default request
	EftRequestFactory.prototype.requestObj = EftSaleRequest;
	//method for creating new request instances
	EftRequestFactory.prototype.createRequest = function (properties) {
		if(properties.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE.name
				|| properties.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.ONE_DIP.name
				|| properties.transactionType.search(CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO) != -1
				|| properties.transactionType.search(CONSTANTS.EFT.INSTALLMENT_TYPE.MEGA_PAY) != -1){
			this.requestObj = EftSaleRequest;
		} else if(properties.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE_INQ.name){
			this.requestObj = EftSaleInqRequest;
			uilog("DBUG", "EftSaleInqRequest: " + JSON.stringify(this.requestObj));
		} else if(properties.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.VOID.name){
			this.requestObj = EftVoidRequest;
		} else if(properties.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SETTLEMENT_ALL.name
				|| properties.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SETTLEMENT_DATA.name){
			this.requestObj = EftSettlementRequest;
		} else if(properties.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_SUMMARY_TXN.name){
			this.requestObj = EftTransactionSummaryReportRequest;
		} else if(properties.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN.name){
			this.requestObj = EftDetailedTransactionReportRequest;
		} else if(properties.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.RETRIEVE_TXN.name){
			this.requestObj = EftRetrieveTransactionRequest;
		}

		return new this.requestObj(properties);
	};
}
/*******************************************
 * EFT Request Factory End
 *******************************************/

/*******************************************
 * Transaction Request Factory
 * Payments
 * Reports
 *******************************************/
var BankTransactionFactory = function(){
	//default transaction Request for EFT
	BankTransactionFactory.prototype.transactionRequest = EFTPaymentTransaction;

	BankTransactionFactory.prototype.createTransactionRequest = function(option){
		/* Payments */
		if(option.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE.name
				|| option.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE_INQ.name
				|| option.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.VOID.name
				|| option.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.ONE_DIP.name
				|| option.transactionType.search(CONSTANTS.EFT.INSTALLMENT_TYPE.MEGA_PAY) != -1
				|| option.transactionType.search(CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO) != -1){
			this.transactionRequest = EFTPaymentTransaction;
			// console.log("BankTransactionFactory:: transactionType: " + option.transactionType);
		/* Reports */
		} else if (option.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SETTLEMENT_ALL.name){
			this.transactionRequest = EFTSettleAllTransaction;
		} else if(option.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SETTLEMENT_DATA.name){
			this.transactionRequest = EFTSettleDataTransaction;
		} else if(option.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_SUMMARY_TXN.name){
			this.transactionRequest = EFTTransactionSummaryReport;
		} else if(option.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN.name){
			this.transactionRequest = EFTDetailTransactionReport;
		} else if(option.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN_BY_HOST.name){
			this.transactionRequest = EFTDetailTransactionDataReport;
		} else if(option.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN_BY_CARD.name){
			this.transactionRequest = EFTDetailTransactionTotalReport;
		} else if(option.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.RETRIEVE_TXN.name){
			this.transactionRequest = EFTRetrieveTransaction;
		} else {
			showMsgDialog("Transaction not supported.", "error");
		}
		return new this.transactionRequest(option);
	};
};
