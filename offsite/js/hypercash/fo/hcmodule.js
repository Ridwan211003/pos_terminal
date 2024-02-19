var Hypercash = Hypercash || {};

Hypercash.lastSignatoryId = "";
Hypercash.printInBigPrinter = null;
Hypercash.tempScannedProduct = null;
Hypercash.queuedTopUpToPrint = [];

Hypercash.service = {
	/**
	 * Returns the markup rate based on specified member type.
	 * @param memberType - member type of the customer.
	 * @return double - mark up rate
	 */
	getMarkupRate : function(memberType) {
		var markUpRate = 0;

		switch (memberType) {
			case 'PROFESSIONAL':
				markUpRate = 0;
				break;
			case 'NONMEMBER':
				// Use non member markup rate here
				markUpRate = getConfigValue('HC_NON_MEMBER_MARKUP_RATE');
				break;
			case 'EMPLOYEE':
				// Use employee markup rate here
				markUpRate = getConfigValue('HC_EMPLOYEE_MARKUP_RATE');
				break;
		}

		return markUpRate ? parseFloat(markUpRate) : 0;
	},

	/**
	 * Returns the label to display in the receipt based on specified member type.
	 * @param memberType - member type of the customer.
	 * @return String - key in messages.properties
	 */
	getMarkUpLabel: function(memberType) {
		switch (memberType) {
			case "EMPLOYEE":
				return "pos_receipt_total_emp_markup_label";
			case "NONMEMBER":
				return "pos_receipt_total_non_mem_markup_label";
		}
	},
	
	/**
	 * Computes the markup without tax of the specified item.
	 * @param item - DTO representation of the item.
	 * @return double - mark up rate
	 */
	computeMarkUpWithoutTax: function(item) {
		var markUp = 0;
		var markupPercent = Hypercash.service.getMarkupRate(profCust.memberType);
		var tariffDivisor = 1 + (parseInt(getConfigValue('TAX_RATE')) / 100);

		if (item.isTaxInclusive) {
			//get priceBeforeTax first then deduct total discount
			markUp = ((item.priceSubtotal / tariffDivisor) - item.discountAmount) * markupPercent;
		} else {
			//no need to get priceBeforeTax if item is non-taxable
			markUp = (item.priceSubtotal - item.discountAmount) * markupPercent;
		}

		return markUp;
	},
	
	/**
	 * Returns the member type label for the cashier/customer screen.
	 * Member type will be retrieved from profCust / saleTx object.
	 * @return String - member type
	 */
	getMemberTypeForScreen: function() {
		var memberType = "NONMEMBER"; //default value
		if (isHcEnabled) {
			if (profCust && profCust.memberType) {
				memberType = profCust.memberType;
			} else if (saleTx && saleTx.taxInvoice) {
				memberType = saleTx.taxInvoice.memberType;
			}
		}
		
		return memberType;
	},
	
	/**
	 * Returns 1 if txn is revised, 2 if txn is in CRM offline mode, and else, 0.
	 * Serves as the status code of saleTx object.
	 * @return int - status code
	 */
	getStatusCode: function() {
		if (isRevisedTxn) {
			return '1';
		} else if (CRMAccountModule.Hypercash.crmOfflineMode) {
			return '2';
		} else {
			return '0';
		}
	},
	
	/**
	 * Finds the product with specified barcode in the order item list
	 * of the specified transaction id.
	 * @param barCode - barcode of the product to be searched.
	 * @param baseTransactionId - transaction id.
	 * @return Object - representation of ProductDTO
	 */
	findItemsFromOriginalSalesTx: function(barCode, baseTransactionId) {
		var isHTTPStatusOK = false;
		var data = $.ajax({
			url : posWebContextPath + "/product/findItemsFromOriginalSalesTx/" + baseTransactionId + "/" + barCode,
			type : "GET",
			async : false,
			dataTygetItemPriceBeforeTaxpe : "json",
			success : function(data, status) {
				if (!jQuery.isEmptyObject(data) && !data.error) {
					isHTTPStatusOK = true;
					lastBarcodeScanned = barCode;
				    productObj = data;
				}
			},
			error : function(jqXHR, status, error) {
				uilog('DBUG','Error: ' + error + "\nError Response: " + jqXHR.responseText);
				showMsgDialog(getMsgValue('pos_warning_msg_file_not_found'), "warning");
			}
		}).responseText;

		return (isHTTPStatusOK) ? JSON.parse(data) : null;
	},

	/**
	 * Computes the price without tax if item is tax inclusive; else, returns the current price.
	 * @param orderItem - DTO representation of the item.
	 * @return double - price before tax
	 */
	getItemPriceBeforeTax: function(orderItem) {
		return orderItem.isTaxInclusive ? (orderItem.currentPrice / getConfigValue('TAX_TARIFF_DIVISOR')) : (orderItem.currentPrice);
	},

	/**
	 * Applies the non-member mark up to the list of order items.
	 * @param orderItems - list of items in saleTx object.
	 *
	 * NOTE: profCust, saleTx, and runningNonMemberMarkup
	 * 		 are global variables declared in cashier.js
	 */
	applyNonMemberMarkup: function(orderItems) {
		if (profCust.memberType != 'PROFESSIONAL' && !toggleTVS && orderItems) {
			saleTx.totalNonMemberMarkup = 0; //always reset saleTx.totalNonMemberMarkup
			var markupPercent = this.getMarkupRate(profCust.memberType);
			var tariffDivisor = 1 + (parseInt(getConfigValue('TAX_RATE')) / 100);

			orderItems.forEach(function(item) {
				if (item.isTaxInclusive) {
					// for items that are tax inclusive, actual formula is:
					// priceBeforeTax => (item.priceSubtotal - item.discountAmount) / tariffDivisor
					// item.nonMemberMarkup => priceBeforeTax * tariffDivisor * markupPercent
					// tariffDivisor will cancel out
					item.nonMemberMarkup = ((item.priceSubtotal - item.discountAmount 
											- (item.secondLayerDiscountAmount ? item.secondLayerDiscountAmount : 0)
											- (item.memberDiscountAmount && (!saleTx.memberDiscReversal || saleTx.memberDiscReversal == 0) ? item.memberDiscountAmount : 0)) 
											* markupPercent);
				} else {
					item.nonMemberMarkup = ((item.priceSubtotal - item.discountAmount 
											- (item.secondLayerDiscountAmount ? item.secondLayerDiscountAmount : 0)
											- (item.memberDiscountAmount && (!saleTx.memberDiscReversal || saleTx.memberDiscReversal == 0) ? item.memberDiscountAmount : 0))  
											* markupPercent * tariffDivisor);
				}
				
				if (item.isVoided) {
					saleTx.totalNonMemberMarkup -= item.nonMemberMarkup;
				} else {
					saleTx.totalNonMemberMarkup += item.nonMemberMarkup;
				}

				/*if (!saleTx.totalNonMemberMarkup) {
					saleTx.totalNonMemberMarkup = 0;
				}
				
				if (item.isVoided) {
					saleTx.totalNonMemberMarkup -= item.nonMemberMarkup;
					runningNonMemberMarkup -= item.nonMemberMarkup;
				} else { 
					saleTx.totalNonMemberMarkup += item.nonMemberMarkup;
					runningNonMemberMarkup += item.nonMemberMarkup;
				}*/

				uilog('DBUG','Hypercash.service.applyNonMemberMarkup: ' + JSON.stringify(item));
			});

			saleTx.totalAmount += Math.round(saleTx.totalNonMemberMarkup);
		}
	},

	/**
	 * Applies the non-member mark up to the list of returned items.
	 */
	applyNonMemberMarkupOnReturnItems: function() {
		if (saleTx.totalNonMemberMarkup) {
			saleTx.totalAmount -= Math.round(saleTx.totalNonMemberMarkup);
		}

		saleTx.totalNonMemberMarkup = 0;
		
		if (profCust.memberType != 'PROFESSIONAL') {
			//var markupPercent = parseFloat(getConfigValue('HC_NON_MEMBER_MARKUP_RATE'));
			var markupPercent = this.getMarkupRate(profCust.memberType);
			var tariffDivisor = 1 + (parseInt(getConfigValue('TAX_RATE')) / 100);
			for (var i=0; i<saleTx.orderItems.length; i++) {
				if (saleTx.orderItems[i].isTaxInclusive) {
					saleTx.orderItems[i].nonMemberMarkup = ((saleTx.orderItems[i].priceSubtotal - saleTx.orderItems[i].discountAmount) * markupPercent);
				} else {
					saleTx.orderItems[i].nonMemberMarkup = ((saleTx.orderItems[i].priceSubtotal - saleTx.orderItems[i].discountAmount) * markupPercent * tariffDivisor);
				}

				if (saleTx.orderItems[i].isVoided) {
					saleTx.totalNonMemberMarkup -= saleTx.orderItems[i].nonMemberMarkup;
				} else {
					saleTx.totalNonMemberMarkup += saleTx.orderItems[i].nonMemberMarkup;
				}
			}
		}
	},

	/**
	 * Supplies the values needed when printing return note.
	 * @return Object - representation of ReturnNoteDTO
	 */
	printReturnNote: function() {
		profCust.returnNote.customerNumber = profCust.customerNumber;
		profCust.returnNote.customerName = profCust.customerName;
		profCust.returnNote.businessName = profCust.businessName;
		profCust.returnNote.taxAddress = profCust.taxAddress;
		profCust.returnNote.taxId = profCust.taxId;
		profCust.returnNote.transactionId = saleTx.transactionId;
		profCust.returnNote.returnDate = new Date();
		profCust.returnNote.orderItems = new Array();
		profCust.returnNote.memberType = profCust.memberType;
		
		var totalTaxFromTaxableReturns = 0;
		var totalSellingPriceBeforeTax = 0;
		saleTx.orderItems.forEach(function(item) {
			var orderItem = {};

			orderItem.productId = item.productId;
			orderItem.shortDesc = item.shortDesc;
			orderItem.name = item.name;
			orderItem.quantity = item.quantity;
			orderItem.description = item.description;
			orderItem.ean13Code = item.ean13Code;
			orderItem.priceSubtotal = item.priceSubtotal;

			orderItem.priceUnit = item.isTaxInclusive ? (item.priceUnit / 1.1) : item.priceUnit;
			orderItem.sellingPrice = item.priceSubtotal;
			orderItem.sellingPriceBeforeTax = item.isTaxInclusive ? (item.priceSubtotal / 1.1) : item.priceSubtotal;
			orderItem.isTaxInclusive = item.isTaxInclusive;
			
			profCust.returnNote.orderItems.push(orderItem);
		});

		profCust.returnNote.totalNonMemberMarkup = saleTx.totalNonMemberMarkup;

		/*Hypercash.ajax.printReturnNote(JSON.stringify(profCust.returnNote), function(response) {
			if (!jQuery.isEmptyObject(response) && !response.error) {
				uilog("DBUG","SUCCESS: " + response);
				endProfCustTxn();
			} else {
				endProfCustTxn();
				promptSysMsg('Failed to to print return note.', 'RETURN');
			}
		}, function(jqXHR, status, error) {
			uilog('DBUG','FAIL: ' + JSON.stringify(error));
			endProfCustTxn();
			promptSysMsg('Failed to to print return note.', 'RETURN');
		});*/

		return profCust.returnNote;
	},

	/**
	 * Prompts the pop-up dialog where signatory will be selected
	 * before printing tax invoice.
	 * @param callback - function to execute if tax invoice should not be printed.
	 * @param orderStatus - order status of the txn.
	 */
	promptPrintTaxInvoice: function(callback, orderStatus) {
		if (profCust && profCust.customerNumber && profCust.taxId
			&& saleTx.type == CONSTANTS.TX_TYPES.SALE.name 
			&& orderStatus != CONSTANTS.STATUS.CANCELLED
			&& getConfigValue('HC_USE_SMALL_PRINTER') == 'false') {
			$("#taxInvoiceSignatory-dialog").dialog('option', 'close',function( event, ui ) {
				if (isTaxInvSeqAvailable) {
					if (profCust.printInvoice && saleTx.taxInvoice) {
						callback();
						endProfCustTxn();
					} else if (profCust.printInvoice == false) {
						//means that the 'NO' button was clicked
						callback();
						endProfCustTxn();
					} else {
						//TODO an error (e.g. server offline) would also mean that the sale will push through, which may not be desired
						callback();
						//endProfCustTxn();
					}
				} else {
					endProfCustTxn();
					CASHIER.newOrder();
				}
			});

			$("#taxInvoiceSignatory-dialog").data("statusCode", this.getStatusCode()).dialog("open");
		} else {
			//Not a prof customer sale txn
			callback();
		}
	},

	/**
	 * Prompts the pop-up dialog where tax invoice can be searched and reprinted.
	 */
	promptReprintInvoice: function() {
		$("#taxInvoiceReprint-dialog").dialog('option', 'beforeClose',function( event, ui ) {
			profCust = {};
			isRevisedTxn = false;
			renderCustomerInfo();
		});

		$("#taxInvoiceReprint-dialog").dialog("open");
	},
	
	/**
	 * Connects to BO to check the next available tax sequence.
	 * @param callBack - function to execute once the AJAX call was successful.
	 * @param errorCallback - function to execute if the AJAX call encountered an error.
	 */
	isThereAvailableTaxInvSequence: function(callBack, errorCallback) {
		Hypercash.ajax.isThereAvailableTaxInvSequence(callBack, errorCallback);
	},
	
	/**
	 * Prompts the pop-up dialog where cashier can input the non-member customer name.
	 */
	enterCustomerInformation: function() {
		$("#nonMemberInfo-dialog").dialog("open");
	},
	
	/**
	 * Returns the user id of the last tax invoice signatory.
	 * @return String - user id
	 */
	getLastSignatoryId: function() {
		var value = "";

		if (Hypercash.lastSignatoryId.trim() != "") {
			value = Hypercash.lastSignatoryId;
		} else if ($("#lastSignatoryId").val().trim() != "") {
			value = $("#lastSignatoryId").val();
		}
		
		return value;
	},
	
	/**
	 * Retrieves the quantity bought (ORIG_QTY), returned quantity (RETURNED_QTY), remaining quantity allowed to be returned (NET_QTY),
	 * price paid (ORIG_PRICE), returned amount (RETURNED_PRICE), and price allowed to be returned (NET_PRICE) of the specified barcode.
	 * @param ean13Code - product barcode to search.
	 * @return Object - containing above mentioned values.
	 */
	getQuantityInformationByEan13Code: function(ean13Code) {
		var qtyInfo = {};

		if (profCust && profCust.returnNote 
			&& profCust.returnNote.quantityInformation
			&& profCust.returnNote.quantityInformation[ean13Code]) {
			qtyInfo = profCust.returnNote.quantityInformation[ean13Code];
		}

		return qtyInfo;
	},

	/**
	 * Checks specified quantity vs. purchased quantity if still allowed to be returned.
	 * @param orderItems - list of order items of saleTx object.
	 * @param ean13Code - product barcode to search.
	 * @param quantity - quantity to check if allowed to be returned.
	 * @return boolean - true if quantity is allowed; else, false.
	 */
	isQtyAllowedToBeReturned: function(orderItems, ean13Code, quantity) {
		var isAllowed = false;
		var qtyInfo = this.getQuantityInformationByEan13Code(ean13Code);

		if (!jQuery.isEmptyObject(qtyInfo)) {
			var currentQty = Hypercash.util.getTotalValidQuantityByBarcode(orderItems, ean13Code);
			
			if (qtyInfo.NET_QTY >= (currentQty + quantity)) {
				isAllowed = true;
			}
		}

		return isAllowed;
	},

	/**
	 * Checks specified price vs. price paid if still allowed to be returned.
	 * @param orderItems - list of order items of saleTx object.
	 * @param ean13Code - product barcode to search.
	 * @param price - price to check if allowed to be returned.
	 * @return boolean - true if price is allowed; else, false.
	 */
	isPriceAllowedToBeReturned: function(orderItems, ean13Code, price) {
		var isAllowed = false;
		var qtyInfo = this.getQuantityInformationByEan13Code(ean13Code);

		if (!jQuery.isEmptyObject(qtyInfo)) {
			var currentPrice = Hypercash.util.getTotalValidPriceByBarcode(orderItems, ean13Code);
			
			if (qtyInfo.NET_PRICE >= (currentPrice + price)) {
				isAllowed = true;
			}
		}

		return isAllowed;
	},

	/**
	 * Executes method(s) to be done before Hypercash transaction will be saved.
	 * Process(es) with corresponding to TRANSACTION TYPE.
	 */
	preProcessHypercashTxn: function() {
		if (isHcEnabled) {
			if (saleTx.type == CONSTANTS.TX_TYPES.SALE.name) {
				//place pre-steps before saving HC SALE transaction
			} else if (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name) {
				if (saleTx.returnNote) {
					delete saleTx.returnNote.comparableDate;
					delete saleTx.returnNote.quantityInformation;
				}
			}
		}
	},

	/**
	 * Checks if customer will be auto tagged as NON-MEMBER once it reached
	 * the specified no. of items scanned.
	 */
	autoTagCustomerAsNonMember: function() {
		var autoTag = getConfigValue("HC_AUTO_TAG_NON_MEMBER");
		/*
		 * If Hypercash counter, tag customer as non-member after scanning n no. of items.
		 */
		if (autoTag && parseBoolean(autoTag)) {
			if (isHcEnabled && jQuery.isEmptyObject(profCust) 
			&& saleTx.type == CONSTANTS.TX_TYPES.SALE.name
			&& saleTx.orderItems) {
				var noOfScan = getConfigValue("HC_NO_OF_SCAN_TO_AUTO_TAG") ? getConfigValue("HC_NO_OF_SCAN_TO_AUTO_TAG") : 2; //default to 2

				if (saleTx.orderItems.length == noOfScan) {
					CRMAccountModule.retriever.findAccountId(getConfigValue("HC_NON_MEMBER_DEF_CARDNO"));
				}
			}
		}
	},

	/**
	 * Correctly applies the non-member mark up in sub total
	 * just in case the cashier presses Subtotal multiple times.
	 */
	applyNonMemberMarkupOnSubTotal: function() {
		if (isHcEnabled && profCust && profCust.customerNumber) {
			//do this in case of multiple press of Subtotal
			if (saleTx.totalNonMemberMarkup) {
				saleTx.totalAmount -= Math.round(saleTx.totalNonMemberMarkup);
			}

			Hypercash.service.applyNonMemberMarkup(saleTx.orderItems);
		}
	}
};

Hypercash.util = {
	/**
	 * Applies currency format to the specified parameter.
	 * @param x - number where the currency format will be applied to.
	 * @return String - formatted x
	 */
	fnApplyCurrencyFormat: function(x) {
		return (x ? Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","):"0");
	},
	
	/**
	 * Returns the total valid quantity of the specified ean13Code.
	 * Valid quantity = total quantity - voided quantity.
	 * @param orderItems - list of order items in saleTx object.
	 * @param ean13Code - product barcode to check.
	 * @return int - valid qty
	 */
	getTotalValidQuantityByBarcode: function(orderItems, ean13Code) {
		var qty = 0;
		
		var freshGoodsScanMode = (configuration.properties['FRESH_GOODS_SCAN_MODE']) 
		? configuration.properties['FRESH_GOODS_SCAN_MODE'] 
		: "1";
		
		var freshGoodsScanWeight = (freshGoodsScanMode == "2");

		if (freshGoodsScanWeight && startsWithFreshGoodsBarcode(ean13Code)) {
	    	ean13Code = ean13Code.substring(0,12).concat("0");
		}
		// FIX RETURN QTY (RETURN WITH SAME BARCODE BUT DIFFRENT ITEM)
		if (orderItems && !jQuery.isEmptyObject(orderItems)) {
			orderItems.forEach(function(item) {
				if ((!isWeightSupplied(item) && item.ean13Code == ean13Code
					 || (item.weightBarcode && item.weightBarcode == ean13Code))
					&& item.ean13Code == lastBarcodeScanned) {
					if (item.isVoided && qty > 0) {
						qty -= item.quantity; //deduct voided items
					} else {
						qty += item.quantity;
					}
				}
			});
		}
		//console.log('qty' + qty);
		return qty;
	},

	/**
	 * Returns the total valid price of the specified ean13Code.
	 * Valid price = total price subtotal - voided price subtotal.
	 * @param orderItems - list of order items in saleTx object.
	 * @param ean13Code - product barcode to check.
	 * @return double - valid price
	 */
	getTotalValidPriceByBarcode: function(orderItems, ean13Code) {
		var price = 0;

		if (orderItems && !jQuery.isEmptyObject(orderItems)) {
			orderItems.forEach(function(item) {
				if (item.ean13Code == ean13Code) {
					if (item.isVoided && price > 0) {
						price -= item.priceSubtotal; //deduct voided items
					} else {
						price += item.priceSubtotal;
					}
				}
			});
		}

		return price;
	},

	/**
	 * Checks if list of payment media types contains at least (1) payment media type that is not CASH
	 * @param paymentMediaTypes - list of payment media types (e.g. saleTx.payments).
	 * @return boolean - true if has other payment method other than cash; else, false.
	 */
	hasPaymentOtherThanCash: function(paymentMediaTypes) {
		var hasOtherPymt = false;

		if (paymentMediaTypes) {
			paymentMediaTypes.forEach(function(paymentMedia) {
				if (paymentMedia.paymentMediaType != CONSTANTS.PAYMENT_MEDIA_TYPES.CASH.name) {
					hasOtherPymt = true;
					return;
				}
			});
		}

		return hasOtherPymt;
	},

	/**
	 * Transaction valid for co-brand discount should used the ff. media payments:
	 * CMC EFT ONLINE/OFFLINE, EDC BCA
	 * @param paymentMediaTypes - list of payment media types (e.g. saleTx.payments).
	 * @return boolean - true if valid for co-brand discount; else, false.
	 */
	isValidForCoBrandDiscount: function(paymentMediaTypes) {
		var isValid = true;

		if (paymentMediaTypes) {
			paymentMediaTypes.forEach(function(paymentMedia) {
				if (paymentMedia.paymentMediaType != CONSTANTS.PAYMENT_MEDIA_TYPES.CMC_EFT_ONLINE.name
					|| paymentMedia.paymentMediaType != CONSTANTS.PAYMENT_MEDIA_TYPES.CMC_EFT_OFFLINE.name
					|| paymentMedia.paymentMediaType != CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_BCA.name) {
					isValid = false;
					return;
				}
			});
		}

		return isValid;
	}
};

/**
*	This object contains Hypercash specific printing methods and properties
*	This module's objects are used to enable printing of hypercash transaction receipts
* 	depending on transaction type and other factors.
*/
Hypercash.printer = {

	/**
	* For EFT card payments, only these items will be considered when printing receipt.
	*/
	EFT_PAYMENT_MEDIA_TO_PRINT : [
		CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name, 
		CONSTANTS.PAYMENT_MEDIA_TYPES.DEBIT.name, 
		CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_PAYMENT.name,
		CONSTANTS.PAYMENT_MEDIA_TYPES.CMC_EFT_ONLINE.name,
		CONSTANTS.PAYMENT_MEDIA_TYPES.CMC_EFT_OFFLINE.name,
		CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_BCA.name,
		CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_OFFLINE.name
	],

	/**
	* Logs only or prints the receipt based on media payment used.
	* @param paymentMediaTypes passed from CASHIER.executePayment function. Indicates payment media types used.
	* @param dataToPrint contains original receipt details to print.
	*/
	printTransactionBasedOnMediaPaymentType: function(paymentMediaTypes, dataToPrint) {
		//DO NOT print receipt if SALE txn AND (only CASH payment AND has NPWP id)
		if (getConfigValue('HC_USE_SMALL_PRINTER') == 'false'
			&& saleTx.type == CONSTANTS.TX_TYPES.SALE.name
			&& !Hypercash.util.hasPaymentOtherThanCash(paymentMediaTypes) 
			&& profCust.taxId) {
			dataToPrint.logOnly = true;
		}

		this.printTransactionWithHeaderAndBody(dataToPrint);
	},

	/**
	* This function adds header and body parameters to original receipt details.
	* @param dataToPrint original sale transaction object for printing.
	*/
	printTransactionWithHeaderAndBody: function(dataToPrint) {

		var validStarBoxedMicroTxType = [
	                CONSTANTS.TX_TYPES.STORE,
        	        CONSTANTS.TX_TYPES.RECALL
        	];

	        var microTxTypeBannerTier1 = SUPERVISOR_INTERVENTION
                                .getLatestInterventionTxTypeInstanceByTxTypes(saleTx, validStarBoxedMicroTxType);

		var toPrint = {
                        header: setReceiptHeader(saleTx),
                        body: setReceiptItems(saleTx, saleTx.orderItems, { currency : "Rp" }),
                        isHypercashPrint: true,
                        logOnly: dataToPrint.logOnly
                };

		if(microTxTypeBannerTier1 == CONSTANTS.TX_TYPES.RECALL)
			toPrint.txDetail = setReceiptTxDetails(saleTx);
			
		var isNonGoodsTxType = CONSTANTS.NON_GOODS_TX_TYPES.findTxTypeByName(saleTx.type);
		var contents = {
			header   : setReceiptHeader(saleTx),
			body     : (isNonGoodsTxType)
			                ? setPaymentReceiptItems( saleTx.payments,   {currency:"Rp"})
							: setReceiptItems       ( saleTx,
									                  saleTx.orderItems,
									                  {currency:"Rp"}
							                        ),
			topUpInfo: Hypercash.queuedTopUpToPrint, 
			summary  : setReceiptSummary(saleTx),
			isHypercashPrint: true,
                        logOnly: dataToPrint.logOnly,
			isQueued : true
		};
		printReceipt($.extend(contents, dataToPrint));

		/*printReceipt(toPrint);

		// Print top-up items if there's any
		if (Hypercash.queuedTopUpToPrint.length > 0) {
			printReceipt({
				summary: setReceiptSummary(saleTx),
				isHypercashPrint: true,
				logOnly: dataToPrint.logOnly
			});

			Hypercash.queuedTopUpToPrint.forEach(function(topUpInfo) {
				printReceipt({
					topUpInfo: topUpInfo, 
					isHypercashPrint: true,
					logOnly: dataToPrint.logOnly
				});
			});
		}

		printReceipt($.extend({
			isHypercashPrint: true
		}, dataToPrint));*/
	}
};

