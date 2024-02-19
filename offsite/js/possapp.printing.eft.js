/**
 * Creates eft online receipt for voided eft.
 * @param posTxn
 * @param isMerchantCopy
 * @returns {Array}
 */
var setReceiptVoidEftOnline = function setReceiptVoidEftOnline(posTxn, isMerchantCopy){
	var maxLength = 40, twoColMaxLength = maxLength/2;
	var eftItem = [];
	var minimumAmount = parseInt(getConfigValue("EFT_SIGNATORY_MIN_AMOUNT"));

	//eft online configurable for printing
	if((getConfigValue("EFT_PRINTING_ENABLE") === "true") && configuration.KARTUKU.isActive == 'N'){
		$.each(posTxn.payments, function(index, payment){
			if(payment.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name
					&& payment.eftData.transactionType.search(CONSTANTS.EFT.EFT_TRANSACTION_TYPE.VOID.name) != -1
                    && payment.eftData.traceNum == eftOnlineObj.traceNumber){
				var params = {
					eftItem 		   : eftItem,
					isMerchantCopy     : isMerchantCopy,
					eftData 		   : payment.eftData,
					eftTransactionType : payment.eftData.transactionType,
					maxLength 		   : maxLength,
					minimumAmount	   : minimumAmount
				};

				// Bank Namel; Terminal Id; Merchant Id; Store Code; Transaction Id
				eftItem.push(
					new PrintBlock(RECEIPT_POS_CENTERED, payment.eftData.bankName));
				eftItem.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printKeyValueItem(
							getMsgValue('pos_receipt_eft_terminal_id')
							, maskValueWithX(payment.eftData.terminalId, 4, 'BEGIN')
							, maxLength
						)));
				eftItem.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printKeyValueItem(
							getMsgValue('pos_receipt_eft_merchant_id')
							, maskValueWithX(payment.eftData.merchantId, 10, 'BEGIN')
							, maxLength
						)));
				if(isMerchantCopy){
					eftItem.push(
						new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printKeyValueItem(
								getMsgValue('pos_receipt_eft_store_code')
								, posTxn.storeCd
								, maxLength
							)));
					eftItem.push(
						new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printKeyValueItem(
								getMsgValue('pos_receipt_eft_transaction_id')
								, posTxn.transactionId
								, maxLength + 2
							)));
				}

				// Credit Card Type; Card Number; Card Holder, Transaction Type
				eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getCardType(payment.eftData.cardNum, creditCardType)));
				eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, payment.eftData.cardNum));
				eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, payment.eftData.cardHolder));

				eftItem.push(newLine());
				eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, payment.eftData.transactionType));
				// Two column format
				// Eft Date & Time; Batch; Trace; Ref Number, Approval
				eftItem.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumn(getMsgValue('pos_receipt_eft_date'), payment.eftData.transactionDate, 5, twoColMaxLength)
							+ printColumn(getMsgValue('pos_receipt_eft_time'), payment.eftData.transactionTime, 6, twoColMaxLength, RECEIPT_POS_RIGHT)));
				eftItem.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumn(getMsgValue('pos_receipt_eft_batch'), payment.eftData.batchNum, 5, twoColMaxLength)
							+ printColumn(getMsgValue('pos_receipt_eft_trace'), payment.eftData.traceNum, 6, twoColMaxLength, RECEIPT_POS_RIGHT)));
				eftItem.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumn(getMsgValue('pos_receipt_eft_rref'), payment.eftData.referenceCode, 5, twoColMaxLength)
							+ printColumn(getMsgValue('pos_receipt_eft_approval'), payment.eftData.approvalCode, 6, twoColMaxLength, RECEIPT_POS_RIGHT)));

				//TODO:remove extra line
				params.eftItem.push(newLine());
				//prints application details for merchant copy only
				if(isMerchantCopy){
					printReceiptEftApplicationDetails(params);
				}

				if/*Zepro*/(payment.eftData.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.ZEPRO3.desc
						|| payment.eftData.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.MEGA_PAY3.desc){
					printReceiptEftInstallment(params);
				}/*MEGA POINT*/ else if (payment.eftData.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.ONE_DIP.desc){
					printReceiptEftMegaPoint(params);
				}

				eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printKeyValueItem(
							getMsgValue('pos_receipt_eft_total_amount')
							, getMsgValue('pos_receipt_eft_currency') + EFT.appendNegativeSymbolIfEftIsVoided(payment.eftData.transactionType) + numberWithCommas(removeLeadingZeroes(payment.eftData.transactionAmount))
							, maxLength
						)
				));
				//One Line Space
				eftItem.push(newLine());

				//prints eft receipt footer
				printReceiptEftSignatory(params);
			}
		});
	}
	//empty array
	if(eftItem.length == 0){
		eftItem = null;
	}
	return eftItem;
};

/**
 * Prints application details
 * @params - params
 */
var printReceiptEftApplicationDetails = function printReceiptEftApplicationDetail(params){
	params.eftItem.push(
			new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printColumn(
							printSameLengthLabel(getMsgValue('pos_receipt_eft_appl_id'), 10)
							, params.eftData.applId
							, params.maxLength)));
	params.eftItem.push(
			new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printColumn(
							printSameLengthLabel(getMsgValue('pos_receipt_eft_appl_name'), 10)
							, params.eftData.applName
							, params.maxLength)));
	params.eftItem.push(
			new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printColumn(
							printSameLengthLabel(getMsgValue('pos_receipt_eft_appl_crypt'), 10)
							, params.eftData.applCrypt
							, params.maxLength)));
	params.eftItem.push(
			new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printColumn(
							printSameLengthLabel(getMsgValue('pos_receipt_eft_tvr'), 10)
							, params.eftData.tvr
							, params.maxLength)));
	//TODO:remove extra line
	params.eftItem.push(newLine());
};

/**
 * prints bank mega installment details
 * @params - params
 */
var printReceiptEftInstallment = function printReceiptEftInstallment(params){
	params.eftItem.push(
			new PrintBlock(RECEIPT_POS_JUSTIFIED,
				printKeyValueItem(
					getMsgValue('pos_receipt_eft_period')
					, params.eftData.period + getMsgValue('pos_receipt_eft_month')
					, params.maxLength
				)));
	params.eftItem.push(
			new PrintBlock(RECEIPT_POS_JUSTIFIED,
				printKeyValueItem(
					getMsgValue('pos_receipt_eft_interest_rate')
					, params.eftData.interestRate + getMsgValue('pos_receipt_eft_percent_symbol')
					, params.maxLength
				)));

	params.eftItem.push(
			new PrintBlock(RECEIPT_POS_JUSTIFIED,
				printKeyValueItem(
					getMsgValue('pos_receipt_eft_first_installment_amount')
					, getMsgValue('pos_receipt_eft_currency') + numberWithCommas(params.eftData.firstInstallment) || ""
					, params.maxLength
				)));
	//TODO:remove extra line
	params.eftItem.push(newLine());
};

/**
 * Prints bank mega onedip or mega point details.
 * @params - params
 */
var printReceiptEftMegaPoint = function printReceiptEftMegaPoint(params){
	//var redeemPoint = (parseInt(params.eftData.openingPoint) - parseInt(params.eftData.availablePoint)).toString();
	params.eftItem.push(
		new PrintBlock(RECEIPT_POS_JUSTIFIED,
			printKeyValueItem(
				getMsgValue('pos_receipt_eft_redeem_ref')
				, params.eftData.redeemReference
				, params.maxLength
			)));
	params.eftItem.push(
		new PrintBlock(RECEIPT_POS_JUSTIFIED,
			printKeyValueItem(
				getMsgValue('pos_receipt_eft_catalog_code')
				, params.eftData.catalogCode
				, params.maxLength
			)));
	params.eftItem.push(
		new PrintBlock(RECEIPT_POS_JUSTIFIED,
			printKeyValueItem(
				getMsgValue('pos_receipt_eft_opening_point')
				, params.eftData.openingPoint
				, params.maxLength
			)));
	params.eftItem.push(
		new PrintBlock(RECEIPT_POS_JUSTIFIED,
			printKeyValueItem(
				getMsgValue('pos_receipt_eft_redeem_point')
				, params.eftData.pointRedeemed
				, params.maxLength
			)));
	params.eftItem.push(
		new PrintBlock(RECEIPT_POS_JUSTIFIED,
			printKeyValueItem(
				getMsgValue('pos_receipt_eft_available_point')
				, params.eftData.availablePoint
				, params.maxLength
			)));
	params.eftItem.push(
		new PrintBlock(RECEIPT_POS_JUSTIFIED,
			printKeyValueItem(
				getMsgValue('pos_receipt_eft_amount_for_point')
				, numberWithCommas(params.eftData.amountForPoint)
				, params.maxLength
			)));
	params.eftItem.push(
		new PrintBlock(RECEIPT_POS_JUSTIFIED,
			printKeyValueItem(
				getMsgValue('pos_receipt_eft_amount_for_sale')
				, numberWithCommas(params.eftData.amountForSale)
				, params.maxLength
			)));
};

/**
 * Prints eft online receipt footer/signatory
 * @params - params;
 */
var printReceiptEftSignatory = function printReceiptEftSignatory(params){
	var maxLength = 40;

	if(params.eftData.signature){
		params.eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('pos_receipt_eft_signature') + Array((maxLength - (getMsgValue('pos_receipt_eft_signature')).length) +1).join('_')));
	} else {
		params.eftItem.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_eft_no_signatory')));
	}

	// agreement note
	params.eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('pos_receipt_eft_agreement')));

	// labels receipt if for merchant or customer
	if(params.isMerchantCopy){
		params.eftItem.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_eft_merchant_copy')));
	}/*customer copy*/ else {
		params.eftItem.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_eft_customer_copy')));
	}
};

/******************************
 * Settlement Receipt Layout
 ******************************/
var setReceiptEftSettlementAll = function(settledTransactionList){
	var maxLength = 40, twoColMaxLength = maxLength/2;
	var prevHost = '', hostCount;
	var settledItem = [];

	$.each(settledTransactionList, function(index, settledTransaction){
		//Prints Header if data is new host
		if(!(prevHost === settledTransaction.hostType)){
			prevHost = settledTransaction.hostType;
			//adds a seperator line to determine settled transactions by host
			if(hostCount > 0){
				itemList.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED
					, Array((maxLength - ("").length) +1).join('=')));
			}

			//Header
			settledItem.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumn(getMsgValue('pos_receipt_eft_date'), settledTransaction.transactionDate, 5, twoColMaxLength + 4)
							+ printColumn(getMsgValue('pos_receipt_eft_time'), settledTransaction.transactionTime, 5, twoColMaxLength - 4, RECEIPT_POS_RIGHT)));
			settledItem.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumn(getMsgValue('pos_receipt_eft_mid'), maskValueWithX(settledTransaction.merchantId, 10, 'BEGIN'), 5, twoColMaxLength + 4)
							+ printColumn(getMsgValue('pos_receipt_eft_tid'), maskValueWithX(settledTransaction.terminalId, 4, 'BEGIN'), 5, twoColMaxLength - 4, RECEIPT_POS_RIGHT)));
			settledItem.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumn(getMsgValue('pos_receipt_eft_batch'), settledTransaction.batchNum, 5, twoColMaxLength + 4)
							+ printColumn(getMsgValue('pos_receipt_eft_host_name'), settledTransaction.hostType, 5, twoColMaxLength - 4, RECEIPT_POS_RIGHT)));
			//Title
			settledItem.push(
				new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_eft_settlement_report')));
		}

		settledItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
				printColumn(
					printSameLengthLabel(getMsgValue('pos_receipt_eft_card_name'), 10)
					, settledTransaction.cardName
					, maxLength)));

		//Breakdown count/amount
		settledItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printColumnWithoutColon("", getMsgValue('pos_receipt_eft_count'), 12, twoColMaxLength)
						+ printColumnWithoutColon("", getMsgValue('pos_receipt_eft_total'), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

		settledItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printColumnWithoutColon(getMsgValue('pos_receipt_eft_sales'), numberWithCommas(settledTransaction.salesCount), 12, twoColMaxLength)
						+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(settledTransaction.salesTotal), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

		settledItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printColumnWithoutColon(getMsgValue('pos_receipt_eft_refunds'), numberWithCommas(settledTransaction.refundsCount), 12, twoColMaxLength)
						+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(settledTransaction.refundsTotal), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

		settledItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printColumnWithoutColon(getMsgValue('pos_receipt_eft_offline'), numberWithCommas(settledTransaction.offlineCount), 12, twoColMaxLength)
						+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(settledTransaction.offlineTotal), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

		settledItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printColumnWithoutColon(getMsgValue('pos_receipt_eft_void_sales'), numberWithCommas(settledTransaction.voidSalesCount), 12, twoColMaxLength)
						+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(settledTransaction.voidSalesTotal), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

		settledItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printColumnWithoutColon(getMsgValue('pos_receipt_eft_void_refunds'), numberWithCommas(settledTransaction.voidRefundsCount), 12, twoColMaxLength)
						+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(settledTransaction.voidRefundsTotal), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

		if(settledTransaction.hostType.toLowerCase() === CONSTANTS.EFT.HOST_TYPE.MEGAPOINT.value.toLowerCase()){
			settledItem.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumnWithoutColon(getMsgValue('pos_receipt_eft_redeem'), numberWithCommas(settledTransaction.redeemCount), 12, twoColMaxLength)
							+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(settledTransaction.redeemTotal), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));
		}
		//Breakdown Total
		settledItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED
					, Array((maxLength - ("").length) +1).join('-')));

		settledItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printColumnWithoutColon(getMsgValue('pos_receipt_eft_card_totals'), numberWithCommas(settledTransaction.totalCount) , 12, twoColMaxLength)
						+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(settledTransaction.total), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

		if(settledTransaction[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_TOTALS] > 0){
			settledItem = settledItem.concat(EFT.printGrandTotalBreakdown(settledTransaction));
		}
	});

	return settledItem;
};

/**
 * Prints Grand Total for:
 * - Settlement All
 * - Transction Summary Report
 */
EFT.printGrandTotalBreakdown = function(itemToPrint) {
	var maxLength = 40, twoColMaxLength = maxLength/2;
	var itemList = [];

	itemList.push(
			new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printColumn(
							//TODO: replace
							printSameLengthLabel(getMsgValue('pos_receipt_eft_grand_total'), 15)
							, ""
							, maxLength)));

	//Breakdown count/amount
	itemList.push(
			new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printColumnWithoutColon("", getMsgValue('pos_receipt_eft_count'), 12, twoColMaxLength)
					+ printColumnWithoutColon("", getMsgValue('pos_receipt_eft_total'), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

	itemList.push(
			new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printColumnWithoutColon(getMsgValue('pos_receipt_eft_sales'), numberWithCommas(itemToPrint.grandTotalSalesCount), 12, twoColMaxLength)
					+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(itemToPrint.grandTotalSalesTotal), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

	itemList.push(
			new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printColumnWithoutColon(getMsgValue('pos_receipt_eft_refunds'), numberWithCommas(itemToPrint.grandTotalRefundsCount), 12, twoColMaxLength)
					+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(itemToPrint.grandTotalRefundsTotal), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

	itemList.push(
			new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printColumnWithoutColon(getMsgValue('pos_receipt_eft_offline'), numberWithCommas(itemToPrint.grandTotalOfflineCount), 12, twoColMaxLength)
					+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(itemToPrint.grandTotalOfflineTotal), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

	itemList.push(
			new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printColumnWithoutColon(getMsgValue('pos_receipt_eft_void_sales'), numberWithCommas(itemToPrint.grandTotalVoidSalesCount), 12, twoColMaxLength)
					+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(itemToPrint.grandTotalVoidSalesTotal), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

	itemList.push(
			new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printColumnWithoutColon(getMsgValue('pos_receipt_eft_void_refunds'), numberWithCommas(itemToPrint.grandTotalRefundsCount), 12, twoColMaxLength)
					+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(itemToPrint.grandTotalRefundsTotal), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

	if(itemToPrint.hostType.toLowerCase() === CONSTANTS.EFT.HOST_TYPE.MEGAPOINT.desc.toLowerCase()){
		itemList.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printColumnWithoutColon(getMsgValue('pos_receipt_eft_redeem'), numberWithCommas(itemToPrint.grandTotalRedeemCount), 12, twoColMaxLength)
						+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(itemToPrint.grandTotalRedeemTotal), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));
	}

	//Breakdown Total
	itemList.push(
			new PrintBlock(RECEIPT_POS_JUSTIFIED
				, Array((maxLength - ("").length) +1).join('-')));

	itemList.push(
			new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printColumnWithoutColon(getMsgValue('pos_receipt_eft_card_totals'), numberWithCommas(itemToPrint.grandTotalTotalsCount) , 12, twoColMaxLength)
					+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(itemToPrint.grandTotalTotals), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

	return itemList;
};

/**
 * Transaction Summary Report receipt layout
 * @param itemsToPrint; type - array list
 * 		- the transaction summary report list object
 */
var setReceiptEftTransactionSummaryData = function(itemsToPrint){
	var maxLength = 40, twoColMaxLength = maxLength/2;
	var prevHost = '', hostCount = 0;
	var itemList = [];

	try {
		//Loop the List
		$.each(itemsToPrint, function(index, eftTxnSummary){
		//TODO: remove
			//Prints Header if data is new host
			if(!(prevHost === eftTxnSummary.hostType)){
				prevHost = eftTxnSummary.hostType;
				if(hostCount > 0){
					itemList.push(
						new PrintBlock(RECEIPT_POS_JUSTIFIED
						, Array((maxLength - ("").length) +1).join('=')));
				}

				itemList.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printColumn(getMsgValue('pos_receipt_eft_date'), eftTxnSummary.transactionDate, 5, twoColMaxLength + 4)
						+ printColumn(getMsgValue('pos_receipt_eft_time'), eftTxnSummary.transactionTime, 5, twoColMaxLength - 4, RECEIPT_POS_RIGHT)));
				itemList.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printColumn(getMsgValue('pos_receipt_eft_mid'), maskValueWithX(eftTxnSummary.merchantId, 10, 'BEGIN'), 5, twoColMaxLength + 4)
						+ printColumn(getMsgValue('pos_receipt_eft_tid'), maskValueWithX(eftTxnSummary.terminalId, 4, 'BEGIN'), 5, twoColMaxLength - 4, RECEIPT_POS_RIGHT)));
				itemList.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printColumn(getMsgValue('pos_receipt_eft_batch'), eftTxnSummary.batchNum, 5, twoColMaxLength + 4)
						+ printColumn(getMsgValue('pos_receipt_eft_host_name'), eftTxnSummary.hostType, 5, twoColMaxLength - 4, RECEIPT_POS_RIGHT)));
				//Title
				itemList.push(
						new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_eft_summary_report')));

				//increments if all transaction summary from same host is done
				hostCount ++;
			}

			itemList.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumn(
									printSameLengthLabel(getMsgValue('pos_receipt_eft_card_name'), 10)
									, eftTxnSummary.cardName
									, maxLength)));

			//Breakdown count/amount
			itemList.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumnWithoutColon("", getMsgValue('pos_receipt_eft_count'), 12, twoColMaxLength)
							+ printColumnWithoutColon("", getMsgValue('pos_receipt_eft_total'), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

			itemList.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumnWithoutColon(getMsgValue('pos_receipt_eft_sales'), numberWithCommas(eftTxnSummary.salesCount), 12, twoColMaxLength)
							+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(eftTxnSummary.salesTotal), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

			itemList.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumnWithoutColon(getMsgValue('pos_receipt_eft_refunds'), numberWithCommas(eftTxnSummary.refundsCount), 12, twoColMaxLength)
							+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(eftTxnSummary.refundsTotal), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

			itemList.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumnWithoutColon(getMsgValue('pos_receipt_eft_offline'), numberWithCommas(eftTxnSummary.offlineCount), 12, twoColMaxLength)
							+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(eftTxnSummary.offlineTotal), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

			itemList.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumnWithoutColon(getMsgValue('pos_receipt_eft_void_sales'), numberWithCommas(eftTxnSummary.voidSalesCount), 12, twoColMaxLength)
							+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(eftTxnSummary.voidSalesTotal), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

			itemList.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumnWithoutColon(getMsgValue('pos_receipt_eft_void_refunds'), numberWithCommas(eftTxnSummary.voidRefundsCount), 12, twoColMaxLength)
							+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(eftTxnSummary.voidRefundsTotal), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

			if(eftTxnSummary.hostType.toLowerCase() === CONSTANTS.EFT.HOST_TYPE.MEGAPOINT.desc.toLowerCase()){
				itemList.push(
						new PrintBlock(RECEIPT_POS_JUSTIFIED,
								printColumnWithoutColon(getMsgValue('pos_receipt_eft_redeem'), numberWithCommas(eftTxnSummary.redeemCount), 12, twoColMaxLength)
								+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(eftTxnSummary.redeemTotal), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));
			}

			//Breakdown Total
			itemList.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED
						, Array((maxLength - ("").length) +1).join('-')));

			itemList.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumnWithoutColon(getMsgValue('pos_receipt_eft_card_totals'), numberWithCommas(eftTxnSummary.totalCount) , 12, twoColMaxLength)
							+ printColumnWithoutColon(getMsgValue('pos_receipt_currency_symbol'), numberWithCommas(eftTxnSummary.total), 4, twoColMaxLength, RECEIPT_POS_RIGHT)));

			//Prints grand total for multiple data on same host type
			if(eftTxnSummary[CONSTANTS.EFT.GRAND_TOTAL_DATA.GRAND_TOTAL_TOTALS] > 0){
				itemList = itemList.concat(EFT.printGrandTotalBreakdown(eftTxnSummary));
			}
		});
		return itemList;
	} catch (err){
		showMsgDialog(getMsgValue("pos_error_msg_contact_helpdesk_prefix").format(getMsgValue('pos_error_message_failed_printing_receipt')), "error");
		uilog("DBUG","System Error: " + err);
	}
}

/**
 * @Param itemsToPrint - Detail Transaction Report in an array per host
 */
var setReceiptEftDetailTransactionReport = function(itemsToPrint){
	var maxLength = 40, twoColMaxLength = maxLength/2;
	var itemList = [];
	var hostCount = 0;

	try{
		itemsToPrint.forEach(function(detailTransactionReportPerHost){
			var detailTranscationDataList	=  detailTransactionReportPerHost.detailTransactionDataReportList;
			var detailTranscationTotalList 	=  detailTransactionReportPerHost.detailTransactionTotalReportList;

			$.each(detailTranscationDataList, function(index, detailTranscationData){
				//Print Header
				if(index === 0){
					if(hostCount > 0){
						itemList.push(
							new PrintBlock(RECEIPT_POS_JUSTIFIED
							, Array((maxLength - ("").length) +1).join('=')));
					}

					itemList.push(
							new PrintBlock(RECEIPT_POS_JUSTIFIED,
									printColumn(getMsgValue('pos_receipt_eft_date'), detailTranscationData.transactionDate, 5, twoColMaxLength + 4)
									+ printColumn(getMsgValue('pos_receipt_eft_time'), detailTranscationData.transactionTime, 5, twoColMaxLength - 4, RECEIPT_POS_RIGHT)));
					itemList.push(
							new PrintBlock(RECEIPT_POS_JUSTIFIED,
									printColumn(getMsgValue('pos_receipt_eft_mid'), maskValueWithX(detailTranscationData.merchantId, 10, 'BEGIN'), 5, twoColMaxLength + 4)
									+ printColumn(getMsgValue('pos_receipt_eft_tid'), maskValueWithX(detailTranscationData.terminalId, 4, 'BEGIN'), 5, twoColMaxLength - 4, RECEIPT_POS_RIGHT)));
					itemList.push(
							new PrintBlock(RECEIPT_POS_JUSTIFIED,
									printColumn(getMsgValue('pos_receipt_eft_batch'), detailTranscationData.batchNum, 5, twoColMaxLength + 4)
									+ printColumn(getMsgValue('pos_receipt_eft_host_name'), detailTranscationData.hostType, 5, twoColMaxLength - 4, RECEIPT_POS_RIGHT)));
					//Print Header Title
					itemList.push(
							new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_eft_detail_report')));

					//Print Transaction Details Title
					itemList.push(
							new PrintBlock(RECEIPT_POS_JUSTIFIED,
									printColumnWithoutColon(getMsgValue('pos_receipt_eft_card_name'), "", twoColMaxLength, twoColMaxLength + 4)
									+ printColumnWithoutColon(getMsgValue('pos_receipt_eft_card_number'), "", twoColMaxLength - 4, twoColMaxLength - 4)));

					itemList.push(
							new PrintBlock(RECEIPT_POS_JUSTIFIED,
									printColumnWithoutColon(getMsgValue('pos_receipt_eft_exp_date'), "", twoColMaxLength, twoColMaxLength + 4)
									+ printColumnWithoutColon(getMsgValue('pos_receipt_eft_invoice_number'), "", twoColMaxLength - 4, twoColMaxLength - 4)));

					itemList.push(
							new PrintBlock(RECEIPT_POS_JUSTIFIED,
									printColumnWithoutColon(getMsgValue('pos_receipt_eft_transaction'), "", twoColMaxLength, twoColMaxLength + 4)
									+ printColumnWithoutColon(getMsgValue('pos_receipt_eft_amount'), "", twoColMaxLength - 4, twoColMaxLength - 4)));

					itemList.push(
							new PrintBlock(RECEIPT_POS_JUSTIFIED,
									getMsgValue('pos_receipt_eft_approval_code')));

					itemList.push(
						new PrintBlock(RECEIPT_POS_JUSTIFIED
						, Array((maxLength - ("").length) +1).join('-')));
				}

				//Print Transaction Details
				itemList.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printColumnWithoutColon(detailTranscationData.cardName, "", twoColMaxLength, twoColMaxLength + 4)
						+ printColumnWithoutColon(detailTranscationData.cardNum, "", twoColMaxLength - 4, twoColMaxLength - 4)));

				itemList.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printColumnWithoutColon(detailTranscationData.expDate, "", twoColMaxLength, twoColMaxLength + 4)
						+ printColumnWithoutColon(detailTranscationData.invoiceNum, "", twoColMaxLength - 4, twoColMaxLength - 4)));

				itemList.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printColumnWithoutColon(detailTranscationData.transactionType, "", twoColMaxLength, twoColMaxLength + 4)
						+ printColumnWithoutColon(numberWithCommas(detailTranscationData.amount), "", twoColMaxLength - 4, twoColMaxLength - 4)));

				itemList.push(
						new PrintBlock(RECEIPT_POS_JUSTIFIED, detailTranscationData.approvalCode));

				//Print Detail Transaction Data Total Amount
				if(detailTranscationData[CONSTANTS.EFT.DETAIL_TOTAL_PROPERTIES.SALE_COUNT] > 0){
					itemList.push(
							new PrintBlock(RECEIPT_POS_JUSTIFIED,
								printColumnWithoutColon(getMsgValue('pos_receipt_eft_currency_total'), getMsgValue('pos_receipt_eft_count'), 15, twoColMaxLength + 4)));

					itemList.push(
						new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumnWithoutColon(getMsgValue('pos_receipt_eft_sale_total'), numberWithCommas(detailTranscationData.saleCount), 16, twoColMaxLength + 4)
							+ printColumnWithoutColon("Rp " + numberWithCommas(detailTranscationData.saleTotal), "", twoColMaxLength - 4, twoColMaxLength - 4)));

					itemList.push(
						new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumnWithoutColon(getMsgValue('pos_receipt_eft_tip_total'), numberWithCommas(detailTranscationData.tipCount), 16, twoColMaxLength + 4)
							+ printColumnWithoutColon("Rp " + numberWithCommas(detailTranscationData.tipTotal), "", twoColMaxLength - 4 , twoColMaxLength - 4)));

					itemList.push(
							new PrintBlock(RECEIPT_POS_JUSTIFIED,
								printColumn(getMsgValue('pos_receipt_eft_Refund_total'), numberWithCommas(detailTranscationData.refundCount), 16, twoColMaxLength + 4)
								+ printColumnWithoutColon("Rp " + numberWithCommas(detailTranscationData.refundTotal), "", twoColMaxLength -4 , twoColMaxLength - 4)));

					itemList.push(
							new PrintBlock(RECEIPT_POS_JUSTIFIED,
								printColumnWithoutColon(getMsgValue('pos_receipt_eft_total2'), numberWithCommas(detailTranscationData.totalCount), 16, twoColMaxLength + 4)
								+ printColumnWithoutColon("Rp " + numberWithCommas(detailTranscationData.total), "", twoColMaxLength -4 , twoColMaxLength - 4)));
				}
			});

			//print detail transaction report total
			$.each(detailTranscationTotalList, function(index, detailTranscationTotal){
				//header
				if(index === 0){
					itemList.push(
						new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue("pos_receipt_eft_credit")));

					itemList.push(
						new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumnWithoutColon(getMsgValue('pos_receipt_eft_card_type'), getMsgValue('pos_receipt_eft_count'), 15, twoColMaxLength + 4)
							+ printColumnWithoutColon(getMsgValue("pos_receipt_eft_amount"), "", twoColMaxLength -4 , twoColMaxLength - 4)));
				}

				itemList.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printColumnWithoutColon(detailTranscationTotal.cardTypeName, numberWithCommas(detailTranscationTotal.cardTypeCount), 16, twoColMaxLength + 4)
						+ printColumnWithoutColon(numberWithCommas(detailTranscationTotal.cardTypeAmount), "", twoColMaxLength - 4, twoColMaxLength - 4)));

				if(detailTranscationTotal[CONSTANTS.EFT.CARD_TYPE_TOTAL_PROPERTIES.CARD_TYPE_TOTAL_AMOUNT] > 0){
					itemList.push(
						new PrintBlock(RECEIPT_POS_JUSTIFIED
						, Array((maxLength - ("").length) +1).join('-')));

					itemList.push(
						new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumnWithoutColon(getMsgValue('pos_receipt_eft_total'), numberWithCommas(detailTranscationTotal.cardTypeTotalCount), 16, twoColMaxLength + 4)
							+ printColumnWithoutColon(numberWithCommas(detailTranscationTotal.cardTypeTotalAmount), "", twoColMaxLength - 4, twoColMaxLength - 4)));
				}
			});
			//next host
			hostCount ++;
		});
		return itemList;
	} catch (err){
		showMsgDialog(getMsgValue("pos_error_msg_contact_helpdesk_prefix").format(getMsgValue('pos_error_message_failed_printing_receipt')), "error");
		uilog("DBUG","System Error: " + err);
	}
};

/**
 * sets eft online draft to print in the receipt.
 * @param isMerchantCopy
 * @returns {Array}
 */
function setReceiptEftRetrieveTransaction(isMerchantCopy){
	var maxLength = 40, twoColMaxLength = maxLength/2;
	var eftItem = new Array();

	if(eftDataObj){
		var eftTransactionType = getDescriptionFromEnumByCode(eftDataObj.transactionCode, 'EFT_TX_CD');

		eftItem.push(
			new PrintBlock(RECEIPT_POS_CENTERED, eftDataObj.bankName));

		eftItem.push(
			new PrintBlock(RECEIPT_POS_JUSTIFIED,
				printKeyValueItem(
					getMsgValue('pos_receipt_eft_terminal_id')
					, maskValueWithX(eftDataObj.terminalId, 4, 'BEGIN')
					, maxLength
				)));
		eftItem.push(
			new PrintBlock(RECEIPT_POS_JUSTIFIED,
				printKeyValueItem(
					getMsgValue('pos_receipt_eft_merchant_id')
					, maskValueWithX(eftDataObj.merchantId, 10, 'BEGIN')
					, maxLength
				)));
		if(isMerchantCopy){
			eftItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printKeyValueItem(
						getMsgValue('pos_receipt_eft_store_code')
						, eftDataObj.storeCode
						, maxLength
					)));
			eftItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printKeyValueItem(
						getMsgValue('pos_receipt_eft_transaction_id')
						, eftDataObj.transactionId
						, maxLength + 2
					)));
		}

		eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getCardType(eftDataObj.cardNum, creditCardType)));
		eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, eftDataObj.cardNum));
		eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, eftDataObj.cardHolder));

		eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, eftTransactionType));

		//two column format
		eftItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printColumn(getMsgValue('pos_receipt_eft_date'), eftDataObj.transactionDate, 5, twoColMaxLength + 4)
						+ printColumn(getMsgValue('pos_receipt_eft_time'), eftDataObj.transactionTime, 5, twoColMaxLength - 4, RECEIPT_POS_RIGHT)));
		eftItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printColumn(getMsgValue('pos_receipt_eft_mid'), maskValueWithX(eftDataObj.merchantId, 10, 'BEGIN'), 5, twoColMaxLength + 4)
						+ printColumn(getMsgValue('pos_receipt_eft_tid'), maskValueWithX(eftDataObj.terminalId, 4, 'BEGIN'), 5, twoColMaxLength - 4, RECEIPT_POS_RIGHT)));
		eftItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printColumn(getMsgValue('pos_receipt_eft_batch'), eftDataObj.batchNum, 5, twoColMaxLength + 4)
						+ printColumn(getMsgValue('pos_receipt_eft_trace'), eftDataObj.traceNum, 5, twoColMaxLength - 4, RECEIPT_POS_RIGHT)));
		eftItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
						printColumn(getMsgValue('pos_receipt_eft_rref'), eftDataObj.referenceCode, 5, twoColMaxLength + 4)
					+ printColumn(getMsgValue('pos_receipt_eft_approval'), eftDataObj.approvalCode, 6, twoColMaxLength - 4, RECEIPT_POS_RIGHT)));

		if(isMerchantCopy){	
			eftItem.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumn(
									printSameLengthLabel(getMsgValue('pos_receipt_eft_appl_id'), 10)
									, eftDataObj.applId
									, maxLength)));
			eftItem.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumn(
									printSameLengthLabel(getMsgValue('pos_receipt_eft_appl_name'), 10)
									, eftDataObj.applName
									, maxLength)));
			eftItem.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumn(
									printSameLengthLabel(getMsgValue('pos_receipt_eft_appl_crypt'), 10)
									, eftDataObj.applCrypt
									, maxLength)));
			eftItem.push(
					new PrintBlock(RECEIPT_POS_JUSTIFIED,
							printColumn(
									printSameLengthLabel(getMsgValue('pos_receipt_eft_tvr'), 10)
									, eftDataObj.tvr
									, maxLength)));
		}

		/*MEGA PAY Details*/
		if(eftTransactionType.search(CONSTANTS.EFT.INSTALLMENT_TYPE.MEGA_PAY) != -1){
			eftItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printKeyValueItem(
						getMsgValue('pos_receipt_eft_period')
						, eftDataObj.period + getMsgValue('pos_receipt_eft_month')
						, maxLength
					)));
			eftItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printKeyValueItem(
						getMsgValue('pos_receipt_eft_interest_rate')
						, eftDataObj.interestRate + getMsgValue('pos_receipt_eft_percent_symbol')
						, maxLength
					)));

			eftItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printColumn(
						printSameLengthLabel(getMsgValue('pos_receipt_eft_first_installment_amount'), 14)
						, ""
						, twoColMaxLength)
				  + printColumn(
						""
						, getMsgValue('pos_receipt_currency_symbol') +" "+ (numberWithCommas(eftDataObj.firstInstallment) || "")
						, twoColMaxLength
						, RECEIPT_POS_RIGHT)));
		/*MEGA POINT Details*/
		} else if (eftTransactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.MEGA_POINT.name){
			var redeemPoint = (parseInt(eftDataObj.openingPoint) - parseInt(eftDataObj.availablePoint)).toString();
			eftItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printKeyValueItem(
						getMsgValue('pos_receipt_eft_redeem_ref')
						, eftDataObj.redeemReference
						, maxLength
					)));
			eftItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printKeyValueItem(
						getMsgValue('pos_receipt_eft_catalog_code')
						, eftDataObj.catalogCode
						, maxLength
					)));
			eftItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printKeyValueItem(
						getMsgValue('pos_receipt_eft_opening_point')
						, eftDataObj.openingPoint
						, maxLength
					)));
			eftItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printKeyValueItem(
						getMsgValue('pos_receipt_eft_redeem_point')
						, redeemPoint
						, maxLength
					)));
			eftItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printKeyValueItem(
						getMsgValue('pos_receipt_eft_available_point')
						, eftDataObj.availablePoint
						, maxLength
					)));
			eftItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printKeyValueItem(
						getMsgValue('pos_receipt_eft_amount_for_point')
						, numberWithCommas(eftDataObj.amountForPoint)
						, maxLength
					)));
			eftItem.push(
				new PrintBlock(RECEIPT_POS_JUSTIFIED,
					printKeyValueItem(
						getMsgValue('pos_receipt_eft_amount_for_sale')
						, numberWithCommas(eftDataObj.amountForSale)
						, maxLength
					)));
		}

		eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED,
				printKeyValueItem(
					getMsgValue('pos_receipt_eft_total_amount')
					, getMsgValue('pos_receipt_eft_currency') + EFT.appendNegativeSymbolIfEftIsVoided(eftTransactionType) + numberWithCommas(removeLeadingZeroes(eftDataObj.transactionAmount))
					, maxLength
				)
		));
		eftItem.push(newLine());
		eftItem.push(newLine());

		if(eftDataObj.signature){
			eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('pos_receipt_eft_signature') + Array((maxLength - (getMsgValue('pos_receipt_eft_signature')).length) +1).join('_')));
			eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('pos_receipt_eft_agreement')));
		} else {
			eftItem.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_eft_no_signatory')));
			eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('pos_receipt_eft_agreement')));
		}
		if(isMerchantCopy){
			eftItem.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_eft_merchant_copy')));
		}
	}

	return eftItem;
}


/**
 * Creates eft online receipt.
 * @param posTxn
 * @param isMerchantCopy
 * @returns {Array}
 */
var setReceiptEftOnline = function setReceiptEftOnline(posTxn, isMerchantCopy){
    var maxLength = 40, twoColMaxLength = maxLength/2;
    var eftItem = [];
    var minimumAmount = parseInt(getConfigValue("EFT_SIGNATORY_MIN_AMOUNT"));

    //eft online configurable for printing
    if(getConfigValue("EFT_PRINTING_ENABLE") === "true"){
        $.each(posTxn.payments, function(index, payment){
            if(payment.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name
                && posTxn.type == CONSTANTS.TX_TYPES.SALE.name){
                var params = {
                    eftItem 		   : eftItem,
                    isMerchantCopy     : isMerchantCopy,
                    eftData 		   : payment.eftData,
                    eftTransactionType : payment.eftData.transactionType,
                    maxLength 		   : maxLength,
                    minimumAmount	   : minimumAmount
                };

                // prints merchant copy only label
                if(!isMerchantCopy){
                    eftItem.push(
                        new PrintBlock(RECEIPT_POS_JUSTIFIED
                            , Array((maxLength - ("").length) +1).join('-')));
                }

                // Bank Namel; Terminal Id; Merchant Id; Store Code; Transaction Id
                eftItem.push(
                    new PrintBlock(RECEIPT_POS_CENTERED, payment.eftData.bankName));
                eftItem.push(
                    new PrintBlock(RECEIPT_POS_JUSTIFIED,
                        printKeyValueItem(
                            getMsgValue('pos_receipt_eft_terminal_id')
                            , maskValueWithX(payment.eftData.terminalId, 4, 'BEGIN')
                            , maxLength
                        )));
                eftItem.push(
                    new PrintBlock(RECEIPT_POS_JUSTIFIED,
                        printKeyValueItem(
                            getMsgValue('pos_receipt_eft_merchant_id')
                            , maskValueWithX(payment.eftData.merchantId, 10, 'BEGIN')
                            , maxLength
                        )));
                if(isMerchantCopy){
                    eftItem.push(
                        new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printKeyValueItem(
                                getMsgValue('pos_receipt_eft_store_code')
                                , posTxn.storeCd
                                , maxLength
                            )));
                    eftItem.push(
                        new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printKeyValueItem(
                                getMsgValue('pos_receipt_eft_transaction_id')
                                , posTxn.transactionId
                                , maxLength + 2
                            )));
                }

                // Credit Card Type; Card Number; Card Holder, Transaction Type
                eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getCardType(payment.eftData.cardNum, creditCardType)));
                eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, payment.eftData.cardNum));
                eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, payment.eftData.cardHolder));

                eftItem.push(newLine());
                eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, payment.eftData.transactionType));
                // Two column format
                // Eft Date & Time; Batch; Trace; Ref Number, Approval
                eftItem.push(
                    new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printColumn(getMsgValue('pos_receipt_eft_date'), payment.eftData.transactionDate, 5, twoColMaxLength)
                            + printColumn(getMsgValue('pos_receipt_eft_time'), payment.eftData.transactionTime, 6, twoColMaxLength, RECEIPT_POS_RIGHT)));
                eftItem.push(
                    new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printColumn(getMsgValue('pos_receipt_eft_batch'), payment.eftData.batchNum, 5, twoColMaxLength)
                            + printColumn(getMsgValue('pos_receipt_eft_trace'), payment.eftData.traceNum, 6, twoColMaxLength, RECEIPT_POS_RIGHT)));
                eftItem.push(
                    new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printColumn(getMsgValue('pos_receipt_eft_rref'), payment.eftData.referenceCode, 5, twoColMaxLength)
                            + printColumn(getMsgValue('pos_receipt_eft_approval'), payment.eftData.approvalCode, 6, twoColMaxLength, RECEIPT_POS_RIGHT)));

                //TODO:remove extra line
                params.eftItem.push(newLine());
                //prints application details for merchant copy only
                if(isMerchantCopy){
                    printReceiptEftApplicationDetails(params);
                }

                if/*Zepro*/(payment.eftData.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.ZEPRO3.desc
                    || payment.eftData.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.MEGA_PAY3.desc){
                    printReceiptEftInstallment(params);
                }/*MEGA POINT*/ else if (payment.eftData.transactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.ONE_DIP.desc){
                    printReceiptEftMegaPoint(params);
                }

                eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED,
                    printKeyValueItem(
                        getMsgValue('pos_receipt_eft_total_amount')
                        , getMsgValue('pos_receipt_eft_currency') + EFT.appendNegativeSymbolIfEftIsVoided(payment.eftData.transactionType) + numberWithCommas(removeLeadingZeroes(payment.eftData.transactionAmount))
                        , maxLength
                    )
                ));
                //One Line Space
                eftItem.push(newLine());

                //prints eft receipt footer
                printReceiptEftSignatory(params);
            }
        });
    }
    //empty array
    if(eftItem.length == 0){
        eftItem = null;
    }
    return eftItem;
};
