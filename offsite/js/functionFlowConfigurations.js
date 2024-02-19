/**========================================================================**
 * START: FUNCTION FLOW CONFIGURATIONS
 **========================================================================**/
 var FUNCTION_FLOW_CONFIG = FUNCTION_FLOW_CONFIG || {};
 /****************************************************************************
  * START: Function Flow related methods
  ****************************************************************************/
 FUNCTION_FLOW_CONFIG.executeFlow = function(interferingFnArr,
											 flowOrderDetailsArr,
											 notInFlowFn,
											 context,
											 isMoreMenuIncluded){
 
	 // Creating the Flow Configuration object
	 var queueObj = new FUNCTION_FLOW.FunctionFlowQueue(interferingFnArr,
														flowOrderDetailsArr,
														notInFlowFn,
														context);
	 // Terminates any running functionFlow.js execution
	 FUNCTION_FLOW.FLOW_HANDLER.terminateFlow();
 
	 uilog("DBUG","** Executing the flow...");
	 var $domToExecuteWithFlow = $(".flow");
	 if(isMoreMenuIncluded){
		 var moreMenuSeletor = ".button-more-menu";
		 $domToExecuteWithFlow.add(moreMenuSeletor)
							  // Exclude the function buttons under the button-more-menu
							  .not(".button-more-menu .flow")
							  .functionFlow( queueObj);
		 $(moreMenuSeletor).removeClass("colorbox cboxElement");
	 } else {
		 $domToExecuteWithFlow.functionFlow( queueObj);
	 }
	 // Close the colorbox submenu when clicked.
	 $(".button-more-menu .button-menu").click(function() {
		 $("#inline_functioncontent").colorbox.close();
	 });
	 // Execute the Flow!
 
 };
 /****************************************************************************
  * END: Function Flow related methods
  ****************************************************************************/
 /****************************************************************************
  * START: GENERIC Function Flow methods; used by other flow implementation
  ****************************************************************************/
 FUNCTION_FLOW_CONFIG.GENERIC_FUNCTIONS = FUNCTION_FLOW_CONFIG.GENERIC_FUNCTIONS || {};
 
 /**
  * ElectronicFundTransferObj
  */
 ElectronicFundTransferObj = function (tx, bank, payment){
	 var now = new Date();
	 this.storeCode			= tx.storeCd;
	 this.posId 				= configuration.terminalNum === undefined ? null : configuration.terminalNum;
	 this.cashierId			= loggedInUsername;
	 this.transactionId 		= tx.transactionId;
	 this.transactionAmount 	= payment;
	 this.bankName 			= bank;
	 this.transactionDate 	= $.datepicker.formatDate('dd/mm/yy', now);
	 this.transactionTime	= now.getHours()+":"+(now.getMinutes()<10?"0"+now.getMinutes():now.getMinutes())+":"+now.getSeconds();
	 return this;
 };
 
 FUNCTION_FLOW_CONFIG.GENERIC_FUNCTIONS.strArrayNotInFlowMsgBuilder = function(promptMsg,
																			   validFnNameToExecuteArr){
	 var builtMsg = promptMsg;
	 if(   validFnNameToExecuteArr
		&& validFnNameToExecuteArr.getName() == "Array") {
		 var sb = new StringBuilder(promptMsg);
		 sb.append(" SHOULD CLICK THE FF:");
		 sb.append("<br/><br/>");
		 for (var index = 0; index < validFnNameToExecuteArr.length; ++index) {
			 sb.append(" *");
			 sb.append(validFnNameToExecuteArr[index]);
			 if(!((index + 1) == validFnNameToExecuteArr.length)){
				 sb.append("<br/>");
			 }
			 builtMsg = sb.toString();
		 }
	 }
	 return builtMsg;
 };
 
 /**
  * Generic NOT_IN_FLOW function
  * Executes this function if a non interferingFnArr nor flowOrderDetailsArr was triggered
  */
 FUNCTION_FLOW_CONFIG.GENERIC_FUNCTIONS.defaultNotInFlowFunction = function(invalidFnIdToExecute,
																			isAccessibleInCurrLevel,
																			validFnNameToExecuteArr){
	 var initialPromptMsg = getMsgValue('pos_error_msg_key_not_allowed');
 
	 if(   validFnNameToExecuteArr
		&& validFnNameToExecuteArr.getName() == "Array") {
		 showMsgDialog(FUNCTION_FLOW_CONFIG.GENERIC_FUNCTIONS.strArrayNotInFlowMsgBuilder(initialPromptMsg, validFnNameToExecuteArr),
					   "warning");
	 } else {
		 showMsgDialog( initialPromptMsg, "warning");
	 }
 };
 
 /****************************************************************************
  * END: GENERIC Function Flow methods; used by other flow implementation
  ****************************************************************************/
 
 /****************************************************************************
  * START: CUSTOM Function Details
  ****************************************************************************/
 /*
  * START: Overridden functions for flow execution;
  *
  * ovr means override.
  */
 FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS = {
 
		 /*=================*
		  *  GENERAL
		  *=================*/
		 ovrNewOrderFnDetails : new FUNCTION_FLOW.FunctionDetails("orderBtn", "NEW ORDER", function(){
			 // Trigger the original function
			 FUNCTION_FLOW.FLOW_HANDLER.triggerOriginalDOMFunction("orderBtn");
			 // Terminates any running functionFlow.js execution
			 return true;
		 }),
 
		 /*=================*
		  *  RETURN
		  *=================*/
		 ovrCashReturnFnDetails: new FUNCTION_FLOW.FunctionDetails(
			 "fnCash", "CASH",
			 function(){ RETURN_REFUND.return.payment_fn.ovrCashReturnFn();}
		 ),
		 ovrOVOReturnFnDetails: new FUNCTION_FLOW.FunctionDetails(
			"fnOVO", "OVO OFFLINE",
			function(){ RETURN_REFUND.return.payment_fn.ovrOVOReturnFn();}
		),
	 // MLC 2017-04-25
	 ovrMLCReturnFnDetails: new FUNCTION_FLOW.FunctionDetails(
			 "fnMLC", "MLC OFFLINE",
			 function(){ RETURN_REFUND.return.payment_fn.ovrMLCReturnFn();}
		 ),
		 ovrTrkSalesReturnFnDetails: new FUNCTION_FLOW.FunctionDetails(
			 "fnTrkSales", "TRK SALES",
			 function(){ RETURN_REFUND.return.payment_fn.ovrTrkSalesReturnFn();}
		 ),
	 // MLC 2017-04-25
	 
		 ovrInstallmentReturnFnDetails: new FUNCTION_FLOW.FunctionDetails(
			 "fnInstallment", "INSTALLMENT",
			 function(){ RETURN_REFUND.return.payment_fn.ovrInstallmentReturnFn();}
		 ),
		 ovrEFTOfflineReturnFnDetails: new FUNCTION_FLOW.FunctionDetails(
			 "fnEftOffline", "EFT OFFLINE",
			 function(){ RETURN_REFUND.return.payment_fn.ovrEFTOfflineReturnFn();}
		 ),
		 ovrCouponReturnFnDetails: new FUNCTION_FLOW.FunctionDetails(
			 "fnCoupon", "COUPON",
			 function(){ RETURN_REFUND.return.payment_fn.ovrCouponReturnFn();}
		 ),
		 ovrReturnCouponReturnFnDetails: new FUNCTION_FLOW.FunctionDetails(
			 "fnCouponReturn", "COUPON RETURN",
			 function(){ RETURN_REFUND.return.payment_fn.ovrReturnCouponReturnFn();}
		 ),
		 ovrEdcBcaReturnFnDetails: new FUNCTION_FLOW.FunctionDetails(
			 "fnEdcBca", "EDC BCA",
			 function(){ RETURN_REFUND.return.payment_fn.ovrEdcBcaReturnFn();}
		 ),
		 ovrAlloPaylaterReturnFnDetails: new FUNCTION_FLOW.FunctionDetails(
			 "fnAlloPaylater", "ALLO PAYLATER",
			 function(){ RETURN_REFUND.return.payment_fn.ovrAlloPaylaterReturnFn();}
		 ),
		 /*=================*
		  *  REFUND
		  *=================*/
		 /*
		  * Cash Button function to execute if
		  * the transaction-type is REFUND
		  */
		 ovrCashRefundFnDetails: new FUNCTION_FLOW.FunctionDetails(
				 "fnCash", "CASH",
				 function(){ RETURN_REFUND.refund.payment_fn.ovrCashRefundFn();}
		 ),
		 /**
		  * Same as cash, NO INPUT for the ff
		  *  1.) for installment company number AND
		  *  2.) for application number
		  */
		 ovrInstallmentRefundFnDetails: new FUNCTION_FLOW.FunctionDetails(
				 "fnInstallment", "Installment",
				 function(){ RETURN_REFUND.refund.payment_fn.ovrInstallmentRefundFn();}
		 ),
		 /**
		  * Eft offline only for return/refund
		  * only asks for the card number.
		  */
		 ovrEFTOfflineRefundFnDetails: new FUNCTION_FLOW.FunctionDetails(
				 "fnEftOffline", "EFT Offline",
				 function(){ RETURN_REFUND.refund.payment_fn.ovrEFTOfflineRefundFn();}
		 ),
		 /*=================*
		  *  FLOAT/PICKUP
		  *=================*/
		 /*
		  * Cash Button function to execute if
		  * the transaction-type is FLOAT/PICKUP
		  */
		 ovrCashFloatPickupFnDetails : new FUNCTION_FLOW.FunctionDetails("fnCash", "CASH", function(){
				// Sets "FLOAT AMOUNT" Title
			 var saleTxType = saleTx.type;
			 var saleTxToLowerLbl = saleTxType.toLowerCase();
			 var isPickup = (saleTxType == CONSTANTS.TX_TYPES.PICKUP.name);
			 var isFloat  = (saleTxType == CONSTANTS.TX_TYPES.FLOAT.name);
				var title    = saleTx.type + "\xa0" + "AMOUNT";
				var defaultValue = 0;
				var isToProceed =    saleTx
								  && saleTx.payments
								  && saleTx.payments.length == 1;
				var defer = $.Deferred();
				defer.promise()
					 .pipe(function(){
						// Forcing next level.
						FUNCTION_FLOW.FLOW_HANDLER.forcedNextLevel("fnCash");
			 });
				var validateDialogAmount = function(amount,
													$amountDialogConfirmInput,
													$amountDialogConfirmErrorMsg){
					var minValue = 1;
					var isValidAmount = !isNaN(amount);
					var isAmountLessMin   = ( isValidAmount && amount < minValue);
					var isValid =    isValidAmount
								 && !isAmountLessMin;
					if(!isValid) {
						var errMsg = (!isValidAmount)? getMsgValue('pos_warning_msg_invalid_amount')
													 : getMsgValue('pos_warning_msg_amount_less_than')
															  .format(minValue - 1);
						$amountDialogConfirmInput.val(minValue);
						$amountDialogConfirmErrorMsg.html(errMsg);
					}
					return isValid;
				};
				// convert to boolean value
				isToProceed = !!isToProceed;
				showAmountConfirmationDialog(
				 getMsgValue(title),
				 getMsgValue('pos_label_payment_enter_descriptive_amount')
					 .format(saleTxToLowerLbl),
				 defaultValue,
				 function(amountEntered,
						  $amountConfirmDialog,
						  $amountDialogConfirmInput,
						  $amountDialogConfirmErrorMsg){
					 var isForAmountCfmDialogClosing = false;
					 if(   validateDialogAmount(amountEntered,
													 $amountDialogConfirmInput,
												$amountDialogConfirmErrorMsg)
						&& isFloat
						|| isPickup
						&& checkPickUpAmountValid(amountEntered,
													 $amountConfirmDialog,
													 $amountDialogConfirmInput,
													 $amountDialogConfirmErrorMsg)) {
						 // Clearing the error message value.
						 $amountDialogConfirmErrorMsg.html("");
						 isForAmountCfmDialogClosing = true;
						 // Render Pickup OR Float value
						 saleTx.orderItems = saleTx.orderItems || null;
						 saleTx.totalAmountPaid = amountEntered;
						 saleTx.totalAmount     = amountEntered;
						 // Add entry to posPayment/saleTx.payments
						 PAYMENT_MEDIA.addPaymentDetailsToOrder(
								 saleTx,
								 CONSTANTS.PAYMENT_MEDIA_TYPES.CASH.name,
								 amountEntered
						 );
						 renderTotal();
						 renderPaymentItem(saleTx.payments.last);
						 printPaymentItem(saleTx);
						 // Closing the dialog
						 $amountConfirmDialog.dialog('close');
						 // Proceeds to CASHIER.executePaymentMedia()
						 defer.resolve();
					 }
					 return isForAmountCfmDialogClosing;
			 });
				return isToProceed;
		 }),
		 ovrSubtotalFloatPickupFnDetails : new FUNCTION_FLOW.FunctionDetails("keyTotal", "SUB-TOTAL", function(){
			  saveOrder(CONSTANTS.STATUS.COMPLETED,
					   function(data){
							   if(data.error){
								   promptSysMsg('Transaction failed.' + JSON.stringify(data.error), saleTx.type);
							   }
							   else{
								   uilog("DBUG","SUCCESS: " + data);
								   promptSysMsg('Transaction completed with TR# ' + removeLeadingZeroes(data), saleTx.type);
								   renderScreenReceiptFooter();
								   DrawerModule.validateTxnToOpenDrawer();
								   renderOrderSummaryDialog();
								   printReceipt({
									   footer: setReceiptFooter(saleTx),
									 mktInfo   : setReceiptMarketingPromoInfo (saleTx)
								   });
						 }
					  },
					  function(error){
						  CASHIER.newOrder();
					  }
			 );
			 enablePaymentMedia = false;
			 isSaleStarted = false;
		 }),
		 /*=================*
		  *  POST VOID
		  *=================*/
		 ovrEnterPostVoidFnDetails : new FUNCTION_FLOW.FunctionDetails("keyEnter", "Enter button", function(){
 
			 var txnId = $("#inputDisplay").val();
			 if (txnId) {
				 SALEVOID.voidTxn(padTxnId(txnId));
			 } else {
				 // Fixes #96562
				 showMsgDialog(getMsgValue("pos_warning_msg_entry_required"), "warning");
			 }
		 }),
		 /*=================*
		  *  RECALL
		  *=================*/
		 ovrEnterRecallFnDetails : new FUNCTION_FLOW.FunctionDetails("keyEnter", "Enter button", function(){
			 var txnId = $("#inputDisplay").val();
			 if (!txnId) {
				 showMsgDialog(getMsgValue('pos_warning_msg_entry_required'), "warning");
			 // Commented below, fixes #96562
			 //} else if (txnId.length < 11) {
			 //	showMsgDialog(getMsgValue('pos_warning_msg_length_is_short'), "warning");
			 } else {
				 recallTxn(padTxnId(txnId));
			 }
		 })
 };
 /*
  * END: Overridden functions for flow execution;
  */
 /****************************************************************************
  * END: CUSTOM Function Details
  ****************************************************************************/
 
 /****************************************************************************
  * START: Configuration mapping for applicable payment media types by CONSTANTS.PAYMENT_MEDIA_FLOW_TYPES
  ****************************************************************************/
 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA = FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA || {};
 
 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS = {
 
		 cashFnDetails  				 : new FUNCTION_FLOW.FunctionDetails("fnCash"    	  		, "CASH"     	    	, null),
		 flazzFnDetails 				 : new FUNCTION_FLOW.FunctionDetails("fnFlazzBca"	  		, "FLAZZ BCA"	    	, null),
		 couponFnDetails				 : new FUNCTION_FLOW.FunctionDetails("fnCoupon"  	  		, "Coupon"  	    	, null),
		 couponReturnFnDetails		 : new FUNCTION_FLOW.FunctionDetails("fnCouponReturn"  	  	, "Coupon Return"  	    , null),
		 sodexoFnDetails				 : new FUNCTION_FLOW.FunctionDetails("fnSodexo"  	  		, "Sodexo"  	    	, null),
		 gcPaymentFnDetails			 : new FUNCTION_FLOW.FunctionDetails("fnGcPayment"    		, "GC Redemption" 		, null),
		 gcEVoucherPaymentFnDetails	 : new FUNCTION_FLOW.FunctionDetails("fnEVoucher"    		, "E-GC Redemption" 	, null),
		 trkPointPaymentFnDetails	 : new FUNCTION_FLOW.FunctionDetails("fnTrkPoint"   		, "TRK Points Redeem" 	, null),
		 trkSalesPaymentFnDetails	 : new FUNCTION_FLOW.FunctionDetails("fnTrkSales"   		, "TRK Sales Game Item" 	, null),
		 gcMMSPaymentFnDetails		 : new FUNCTION_FLOW.FunctionDetails("fnGcMmsRedemption"	, "GC MMS Redemption" 	, null),
		 gcMMSBalanceInquiryDetails	 : new FUNCTION_FLOW.FunctionDetails("fnGcMmsInquiry"	  	, "GC MMS Balance Inquiry", null),
		 eftOnlinePaymentFnDetails	 : new FUNCTION_FLOW.FunctionDetails("fnEFTOn"  	  		, "EFT Online"    		, null),
		 cmcEftOnlinePaymentFnDetails : new FUNCTION_FLOW.FunctionDetails("fnCmcEftOn"  	  		, "CMC EFT Online"		, null),
		 cmcEftOfflinePaymentFnDetails: new FUNCTION_FLOW.FunctionDetails("fnCmcEftOffline"		, "CMC EFT Offline"		, null),
		 eftOfflinePaymentFnDetails	 : new FUNCTION_FLOW.FunctionDetails("fnEftOffline"   		, "EFT Offline"   		, null),
		 debitPaymentFnDetails		 : new FUNCTION_FLOW.FunctionDetails("fnDebit"  	  		, "Debit"  				, null),
		 edcBca                       : new FUNCTION_FLOW.FunctionDetails("fnEdcBca"       		, "EDC BCA"        		, null),
		 alloPaylater                       : new FUNCTION_FLOW.FunctionDetails("fnAlloPaylater"       		, "Allo Paylater"        		, null),
		 edcPaymentFnDetails			 : new FUNCTION_FLOW.FunctionDetails("fnEdcOnline"    		, "EDC Payment"   		, null),
		 installmentPaymentDetails	 : new FUNCTION_FLOW.FunctionDetails("fnInstallment"  		, "Installment"   		, null),
		 crmPointsFnDetails			 : new FUNCTION_FLOW.FunctionDetails("fnCRMPoints"	  		, "CRM Points"    		, null),
		 flashizDetails				 : new FUNCTION_FLOW.FunctionDetails("fnFlashiz"	  		, "FLASHiZ"       		, null),
		 mlcDetails				 : new FUNCTION_FLOW.FunctionDetails("fnMLC"	  		, "MLC"       		, null), // MLC 2017-04-21
		 ovoDetails				 : new FUNCTION_FLOW.FunctionDetails("fnOVO"	  		, "OVO"       		, null),
		 altoWCDetails				 : new FUNCTION_FLOW.FunctionDetails("fnAltoWeChat"	  		, "ALTO WeChat"       		, null),
		 altoWCDetails2				 : new FUNCTION_FLOW.FunctionDetails("fnAltoWeChat2"	  		, "ALTO WeChat"       		, null),
		 pppPayment				 : new FUNCTION_FLOW.FunctionDetails("fnPowerPointPurchase"	  		, "PPP Payment"       		, null),
		 mktVoucherDetails			 : new FUNCTION_FLOW.FunctionDetails("fnMktVoucher"	  		, "MKT Voucher"       		, null)
 };
 
 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.FLOW_CONDITIONS = FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.FLOW_CONDITIONS || {};
 /*
  * Default accepted payment media
  */
 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.FLOW_CONDITIONS[CONSTANTS.PAYMENT_MEDIA_FLOW_TYPES.SALE] = [
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.cashFnDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.flazzFnDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.couponFnDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.couponReturnFnDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.sodexoFnDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.gcPaymentFnDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.gcEVoucherPaymentFnDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.trkPointPaymentFnDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.trkSalesPaymentFnDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.gcMMSPaymentFnDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.gcMMSBalanceInquiryDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.eftOnlinePaymentFnDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.cmcEftOnlinePaymentFnDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.cmcEftOfflinePaymentFnDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.eftOfflinePaymentFnDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.edcBca,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.alloPaylater,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.debitPaymentFnDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.edcPaymentFnDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.installmentPaymentDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.crmPointsFnDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.flashizDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.mlcDetails, // MLC 2017-04-21
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.ovoDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.altoWCDetails,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.altoWCDetails2,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.pppPayment,
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.mktVoucherDetails
 ];
 
 /*
 * Return accepted payment media
 */
 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.FLOW_CONDITIONS[CONSTANTS.PAYMENT_MEDIA_FLOW_TYPES.RETURN] = [
 
	 FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrCashReturnFnDetails,
	 FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrEFTOfflineReturnFnDetails,
	 FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrInstallmentReturnFnDetails,
	 FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrCouponReturnFnDetails,
	 FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrReturnCouponReturnFnDetails,
	 FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrEdcBcaReturnFnDetails,
	 FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrAlloPaylaterReturnFnDetails,
	 FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrMLCReturnFnDetails, // MLC 2017-04-25
	 FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrOVOReturnFnDetails,
	 FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrTrkSalesReturnFnDetails // TRK SALES 2018-10-02
 
 ];
 /*
  * Refund accepted payment media
  */
 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.FLOW_CONDITIONS[CONSTANTS.PAYMENT_MEDIA_FLOW_TYPES.REFUND] = [
	 FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrCashRefundFnDetails,
	 FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrEFTOfflineRefundFnDetails,
	 FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrInstallmentRefundFnDetails
 ];
 /*
  * Float accepted payment media
  */
 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.FLOW_CONDITIONS[CONSTANTS.PAYMENT_MEDIA_FLOW_TYPES.FLOAT] = [
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.cashFnDetails
 ];
 /*
  * Pickup accepted payment media
  */
 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.FLOW_CONDITIONS[CONSTANTS.PAYMENT_MEDIA_FLOW_TYPES.PICKUP] = [
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.cashFnDetails
 ];
 
 /*
  * Bill Payment accepted payment media
  */
 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.FLOW_CONDITIONS[CONSTANTS.PAYMENT_MEDIA_FLOW_TYPES.BILL_PAYMENT] = [
	 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.DEFAULT_FN_DETAILS.cashFnDetails
 ];
 
 /****************************************************************************
  * END: Configuration mapping for applicable payment media types by CONSTANTS.PAYMENT_MEDIA_FLOW_TYPES
  ****************************************************************************/
 
 
 
 /****************************************************************************
  * START: FUNCTION FLOW for payment media triggering after clicking SUBTOTAL
  ****************************************************************************/
 
 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.customNotInFlowFunctionBuilder = function(pymtMediaFlowType){
 
	 var pymtFunctionDetailsArr    = FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.FLOW_CONDITIONS[pymtMediaFlowType];
	 var defPymtFunctionDetailsArr = FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.FLOW_CONDITIONS[CONSTANTS.PAYMENT_MEDIA_FLOW_TYPES.SALE];
	 var nonValidPymtFunctionDetailsArr  = defPymtFunctionDetailsArr.filter(function(elem) {
		 // Is to include, return less than ZERO if not found
		 return pymtFunctionDetailsArr.indexOf(elem) < 0;
	 });
	 // If has non-valid payment media
	 var hasNonValidPaymentMedia =    nonValidPymtFunctionDetailsArr
								   && nonValidPymtFunctionDetailsArr.length > 0;
	 // Checker if the currently triggered function's fnName is a payment media.
	 var checkIfInvalidPymtMediaTriggeredByFnId = function(fnId){
		 var isInvalidPaymentMedia = false;
		 for (var index = 0; index < nonValidPymtFunctionDetailsArr.length; ++index) {
			 var item = nonValidPymtFunctionDetailsArr[index];
			 //invalidPaymentMediaFnNames.push(item.fnName);
			 if(    item
				&&  item.fnId
				&&  item.fnId == fnId){
				 isInvalidPaymentMedia = true;
				 break;
			 }
		 }
		 // If found within invalid payment media
		 return isInvalidPaymentMedia;
	 };
	 var customPymtNotInFlowFunction = function(invalidFnIdToExecute,
												isAccessibleInCurrLevel,
												validFnNameToExecuteArr){
		 var isInvalidPaymentPymtTriggered = checkIfInvalidPymtMediaTriggeredByFnId(invalidFnIdToExecute);
		 var defualtPymtMsg = (    isAccessibleInCurrLevel
							   &&  isInvalidPaymentPymtTriggered
							   || !isAccessibleInCurrLevel
							   &&  isInvalidPaymentPymtTriggered)
										 ? getMsgValue('pos_warning_msg_pymt_invalid_media_placeholder')
											   .format(getConfigValue("INVALID_PYMT_TRIGGERED_MSG"),
													   pymtMediaFlowType)
										 : getMsgValue('pos_error_msg_key_not_allowed');
		 showMsgDialog(FUNCTION_FLOW_CONFIG.GENERIC_FUNCTIONS.strArrayNotInFlowMsgBuilder(defualtPymtMsg, validFnNameToExecuteArr),
					   "warning");
	 };
	 return (hasNonValidPaymentMedia)? customPymtNotInFlowFunction
									 : FUNCTION_FLOW_CONFIG.GENERIC_FUNCTIONS.defaultNotInFlowFunction;
 };
 
 /**
  * FLOW EXECUTOR METHOD for Payment Flow
  */
 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.executePaymentFlow = function(pymtMediaFlowType){
 
	 var defaultMsgKey = 'pos_error_msg_key_not_allowed';
	 var promptIfPaymentsExisting = function(saleTx,
											 isToPrompt,
											 msgKey) {
		 var payments = null;
		 // If at least one payments exist.
		 var isPaymentsExisting = (    saleTx
								   && (payments = saleTx.payments)
								   &&  payments.length > 0);
		 if(   isToPrompt
			&& isPaymentsExisting){
			 showMsgDialog(getMsgValue(msgKey),"warning");
		 }
		 return isPaymentsExisting;
	 };
	 if(pymtMediaFlowType) {
		 var interferingFnArr = [
			 // If "new order" is clicked, execute its original behaviour
			 FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrNewOrderFnDetails,
			 new FUNCTION_FLOW.FunctionDetails("keyTotal" , "Sub-total button", function(){
				 if( !promptIfPaymentsExisting(saleTx, false)) {
					 FUNCTION_FLOW.FLOW_HANDLER.triggerOriginalDOMFunction("keyTotal");
				 }
			 }),
			 new FUNCTION_FLOW.FunctionDetails("fnHoldRecall" , "Store Recall button", function(){
				 if( !promptIfPaymentsExisting(saleTx, true, defaultMsgKey)) {
					 FUNCTION_FLOW.FLOW_HANDLER.triggerOriginalDOMFunction("fnHoldRecall");
				 }
			 }),
			 new FUNCTION_FLOW.FunctionDetails("donation" , "Donation button", function(){
				 if( !promptIfPaymentsExisting(saleTx, true, defaultMsgKey)) {
					 FUNCTION_FLOW.FLOW_HANDLER.triggerOriginalDOMFunction("donation");
				 }
			 }),
			 new FUNCTION_FLOW.FunctionDetails("alloTopUp" , "Allo TopUp button", function(){
				if( !promptIfPaymentsExisting(saleTx, true, defaultMsgKey)) {
					FUNCTION_FLOW.FLOW_HANDLER.triggerOriginalDOMFunction("alloTopUp");
				}
			}),
			new FUNCTION_FLOW.FunctionDetails("omniTelkomsel" , "Omni Telkomsel button", function(){
				if( !promptIfPaymentsExisting(saleTx, true, defaultMsgKey)) {
					FUNCTION_FLOW.FLOW_HANDLER.triggerOriginalDOMFunction("omniTelkomsel");
				}
			}),
			 new FUNCTION_FLOW.FunctionDetails("fnEmpCard" , "Employee/Loyalty Card button", function(){
				 if( !promptIfPaymentsExisting(saleTx, true, defaultMsgKey)) {
					 FUNCTION_FLOW.FLOW_HANDLER.triggerOriginalDOMFunction("fnEmpCard");
				 }
			 }),
			 new FUNCTION_FLOW.FunctionDetails("fnVoid"   		, "Void Item button", function(){
				 if(   !promptIfPaymentsExisting(saleTx, true, defaultMsgKey)){
 
					 FUNCTION_FLOW.FLOW_HANDLER.triggerOriginalDOMFunction("fnVoid");
				 }
			 }),
			 new FUNCTION_FLOW.FunctionDetails("fnCancelSale"   	, "Cancel Sale button", function(){
				 // DEBUG MV
			 var isPaymentOnlyVoucher = false;
			 for (var indexPayment in saleTx.payments)
						 {
								 if(saleTx.payments[indexPayment].paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.VOUCHER.name)
										 isPaymentOnlyVoucher = true;
								 else
								 {
										 isPaymentOnlyVoucher = false;
										 break;
								 }
						 }
			 // DEBUG MV
			 uilog('DBUG', 'isPaymentOnlyVoucher' + isPaymentOnlyVoucher);
			 if (isPaymentOnlyVoucher) FUNCTION_FLOW.FLOW_HANDLER.triggerOriginalDOMFunction("fnCancelSale");
			 else if(   !promptIfPaymentsExisting(saleTx, true, defaultMsgKey)) {
					 FUNCTION_FLOW.FLOW_HANDLER.triggerOriginalDOMFunction("fnCancelSale");
				 }
			 }),
			 new FUNCTION_FLOW.FunctionDetails("fnEmpDisc"   	, "Employee Discount button", function(){
				 if(   !promptIfPaymentsExisting(saleTx, true, defaultMsgKey)) {
					 FUNCTION_FLOW.FLOW_HANDLER.triggerOriginalDOMFunction("fnEmpDisc");
				 }
			 }),
			 new FUNCTION_FLOW.FunctionDetails("fnPrimePaylaterDisc"   	, "Allo Prime/Paylater Discount button", function(){
				 if(   !promptIfPaymentsExisting(saleTx, true, defaultMsgKey)) {
					 FUNCTION_FLOW.FLOW_HANDLER.triggerOriginalDOMFunction("fnPrimePaylaterDisc");
				 }
			 }),
			 // INHOUSE VOUCHER 2017-04-13
			 new FUNCTION_FLOW.FunctionDetails("fnIvsOnline"   	, "Voucher Discount button", function(){
			 if(saleTx.type != CONSTANTS.TX_TYPES.SALE.name) showKeyNotAllowedMsg();
			 else FUNCTION_FLOW.FLOW_HANDLER.triggerOriginalDOMFunction("fnIvsOnline");
			 }),
			 // INHOUSE VOUCHER 2017-04-13
			 new FUNCTION_FLOW.FunctionDetails("keyQty"   		, "Multiply button" 	, null),
			 new FUNCTION_FLOW.FunctionDetails("keyClr"   		, "Clear button"    	, null),
			 new FUNCTION_FLOW.FunctionDetails("keyEnter" 		, "Enter button"    	, null),
			 new FUNCTION_FLOW.FunctionDetails("fnHotSpice"		, "Hotspice button"		, null),
			 new FUNCTION_FLOW.FunctionDetails("staffId"			, "Staff Id button"		, null),
			 new FUNCTION_FLOW.FunctionDetails("grabId"			, "Grab Id button"		, null),
			 new FUNCTION_FLOW.FunctionDetails("fnMMSFunctions"	, "MMS Button button"	, null)
		 ];
		 var roundingFnDetails =	new FUNCTION_FLOW.FunctionDetails("fnRounding"     	  , "Rounding button" 		, null);
		 var cpnIntFnDetails   = new FUNCTION_FLOW.FunctionDetails("fnCpnInt"     	  , "Cpn Int button" 		, null);
		 var validateFnDetails = new FUNCTION_FLOW.FunctionDetails("fnValidateWarranty", "Validate Warranty button", null);
		 var redeemFnDetails   = new FUNCTION_FLOW.FunctionDetails("fnBalloonGame", "Balloon Game Redeem button", null);
		 // The FLOW of functions to click!
		 var flowOrderDetailsArr = [
			 /* Rounding: 2nd args means isOptional[TRUE], 3rd args means isInfinite[TRUE]
			  *     in short: Ignore it and call the next level functions, OR execute infinitely
			  */
			 new FUNCTION_FLOW.FlowOrderDetails([roundingFnDetails, cpnIntFnDetails], true, true),
 
			 new FUNCTION_FLOW.FlowOrderDetails([validateFnDetails], true, true),
			 new FUNCTION_FLOW.FlowOrderDetails([redeemFnDetails], true, true),
			 /* Payment Media: 2nd args means isOptional[FALSE], 3rd args means isInfinite[TRUE]
			  *     in short: Could not be ignored AND execute infinitely
			  */
			 new FUNCTION_FLOW.FlowOrderDetails(FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.FLOW_CONDITIONS[pymtMediaFlowType],
				 false,
				 true),
		 ];
		 // Executes the flow
		 FUNCTION_FLOW_CONFIG.executeFlow(interferingFnArr,
			 flowOrderDetailsArr,
			 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.customNotInFlowFunctionBuilder(pymtMediaFlowType),
			 this);
	 }
 };
 
 /****************************************************************************
  * END: FUNCTION FLOW for payment media triggering after clicking SUBTOTAL
  ****************************************************************************/
 
 /****************************************************************************
  * START: FUNCTION FLOW for FLOAT/PICKUP function
  ****************************************************************************/
 
 FUNCTION_FLOW_CONFIG.FLOAT_PICKUP = FUNCTION_FLOW_CONFIG.FLOAT_PICKUP || {};
 
 FUNCTION_FLOW_CONFIG.FLOAT_PICKUP.customNotInFlowFunctionBuilder = function(saleTxType){
	 /*
	  * Define the custom notInFlow messages here if a particular function is triggered
	  * out of the correct flow execution. using the ID return by the functionFlow.js'
	  * notInFlow callback values(1st - fnId not found, 2nd - names of the fNs to be triggered).
	  *    -Only the 1st is utilized
	  */
	 var notInFlowMsgMap = {
			 "keyTotal": getMsgValue('pos_warning_msg_float_pickup_empty_amount')
						   .format(saleTxType.toLowerCase())
	 };
	 return function(invalidFnIdToExecute,
					 isAccessibleInCurrLevel,
					 validFnNameToExecuteArr){
		 var msgToShow = notInFlowMsgMap[invalidFnIdToExecute];
		 if(msgToShow) {
			 showMsgDialog(msgToShow, "warning");
		 } else {
			 FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.customNotInFlowFunctionBuilder
					 (saleTxType)(invalidFnIdToExecute, isAccessibleInCurrLevel, validFnNameToExecuteArr);
		 }
	 };
 };
 FUNCTION_FLOW_CONFIG.FLOAT_PICKUP.executeFloatOrPickupFlow = function(saleTxType){
 
	 /*
	  * Return true within the functions of "interferingFn"
	  * to revert the overridden functions to original
	  */
	 var interferingFnArr = [
							 // If "new order" is clicked, execute its original behaviour
							 FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrNewOrderFnDetails,
								 // "CLEAR" can interfere the flow
							  new FUNCTION_FLOW.FunctionDetails("keyClr", "CLEAR", function(){
								  var saleTxPayments = null;
								  if(!!$("#inputDisplay").val()){
									  clearInputDisplay();
								  }
								  else if(     saleTx
									 && !(saleTxPayments = saleTx.payments)
									 ||   saleTxPayments
									 &&   saleTxPayments.length == 0) {
									  FUNCTION_FLOW.FLOW_HANDLER.triggerOriginalDOMFunction("keyClr");
									 // Returning true to revert to original DOM STATE
										return true;
								  } else {
									  showKeyNotAllowedMsg();
								  }
							  })
								];
	 // The FLOW of functions to click!
	 var flowOrderDetailsArr = [
							 // 1st Function: CASH
						  new FUNCTION_FLOW.FlowOrderDetails([FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrCashFloatPickupFnDetails]    , false, false),
						  // 2nd Function: SUB-TOTAL
						  new FUNCTION_FLOW.FlowOrderDetails([FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrSubtotalFloatPickupFnDetails], false, false)
							];
	 // Executes the flow
	 FUNCTION_FLOW_CONFIG.executeFlow(interferingFnArr,
									  flowOrderDetailsArr,
									  FUNCTION_FLOW_CONFIG.FLOAT_PICKUP.customNotInFlowFunctionBuilder(saleTxType),
									  this);
 };
 /****************************************************************************
  * END: FUNCTION FLOW for FLOAT/PICKUP function
  ****************************************************************************/
 /****************************************************************************
  * START: FUNCTION FLOW for POST VOID function
  ****************************************************************************/
 FUNCTION_FLOW_CONFIG.POST_VOID = FUNCTION_FLOW_CONFIG.POST_VOID || {};
 
 FUNCTION_FLOW_CONFIG.POST_VOID.executePostVoidFlow =  function(){
 
	 /*
	  * Return true within the functions of "interferingFn"
	  * to revert the overridden functions to original
	  */
	 var interferingFnArr = [
							 // If "new order" is clicked, execute its original behaviour
							 FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrNewOrderFnDetails,
								 // "CLEAR" can interfere the flow
							 new FUNCTION_FLOW.FunctionDetails("keyClr"   , "Clear button"    , null)
								];
	 // The FLOW of functions to click!
	 var flowOrderDetailsArr = [
							 // 1st Function: ENTER
						  new FUNCTION_FLOW.FlowOrderDetails([FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrEnterPostVoidFnDetails]    , false, true)
							];
	 // Executes the flow
	 FUNCTION_FLOW_CONFIG.executeFlow(interferingFnArr,
									  flowOrderDetailsArr,
									  FUNCTION_FLOW_CONFIG.GENERIC_FUNCTIONS.defaultNotInFlowFunction,
									  this);
 };
 
 /****************************************************************************
  * END: FUNCTION FLOW for POST VOID function
  ****************************************************************************/
 
 /****************************************************************************
  * START: FUNCTION FLOW for RECALL function
  ****************************************************************************/
 FUNCTION_FLOW_CONFIG.RECALL = FUNCTION_FLOW_CONFIG.RECALL || {};
 
 FUNCTION_FLOW_CONFIG.RECALL.executeRecallFlow =  function(){
 
	 /*
	  * Return true within the functions of "interferingFn"
	  * to revert the overridden functions to original
	  */
	 var interferingFnArr = [
							 // If "new order" is clicked, execute its original behaviour
							 FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrNewOrderFnDetails,
								 // "CLEAR" can interfere the flow
							 new FUNCTION_FLOW.FunctionDetails("keyClr"   , "Clear button"    , null)
								];
	 // The FLOW of functions to click!
	 var flowOrderDetailsArr = [
							 // 1st Function: ENTER
						  new FUNCTION_FLOW.FlowOrderDetails([FUNCTION_FLOW_CONFIG.CUSTOM_FN_DETAILS.ovrEnterRecallFnDetails], false, true)
							];
	 // Executes the flow
	 FUNCTION_FLOW_CONFIG.executeFlow(interferingFnArr,
									  flowOrderDetailsArr,
									  FUNCTION_FLOW_CONFIG.GENERIC_FUNCTIONS.defaultNotInFlowFunction,
									  this,
									  true);
 };
 
 /****************************************************************************
  * END: FUNCTION FLOW for RECALL function
  ****************************************************************************/
 /*
  * TODO: Add additional relevant configurations here.
  */
 /**========================================================================**
  * END: FUNCTION FLOW CONFIGURATIONS
  **========================================================================**/