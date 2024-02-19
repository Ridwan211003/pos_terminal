/**
 * @author odelapena 
 * Hypercash Module to receive incoming hypercash processes.
 * Exports printDoc function to call printer specified.
 */

var epsonprinter = require("../devices/hypercash/epsonprinter.js");
var taxInvoiceService = require("../devices/hypercash/taxInvoiceService.js");
var returnNoteService = require("../devices/hypercash/returnNoteService.js");
var configuration;

/**
 * Calls the corresponding print method based on specified type.
 * @param type - type of printing based on txn type.
 * @param data - data to print.
 */
exports.printDoc = function(type, data) {
	console.log("type = " + type);

	// Use global configuration object
	if (!configuration) {
		configuration = global.configuration_poss;
	}

	switch (type) {
		case 'PRINT_TAX_INVOICE':
			printTaxInvoice(data);
			break;
		case 'REPRINT_TAX_INVOICE':
			reprintTaxInvoice(data);
			break;
		case 'PRINT_RETURN_NOTE':
			printReturnNote(data);
			break;
	}
};

/**
 * Calls printTaxInvoice private method.
 * @param txnObj - representation of PosTransactionDTO.
 */
function printTaxInvoice(txnObj){
	console.log('Printing tax invoice in hypercash.js');
	
	printTaxInvoice(txnObj);
};

/**
 * Reprints the supplied tax invoice.
 * @param taxInvoice - representation of TaxInvoiceDTO to reprint.
 */
function reprintTaxInvoice(taxInvoice) {
	createOrderItems(taxInvoice, taxInvoice.txnItems);	
	groupSimilarProducts(taxInvoice);

	var totalSellingPriceBeforeTax = getTotalSellingPriceBeforeTax(taxInvoice.orderItems, taxInvoice.totalNonMemberMarkup);
	taxInvoice.totalSellingPriceBeforeTax = totalSellingPriceBeforeTax.totalSellingPriceBeforeTax;
	taxInvoice.totalSellingPriceNonTaxable = totalSellingPriceBeforeTax.totalSellingPriceNonTaxable;
	taxInvoice.totalSellingPriceTaxable = totalSellingPriceBeforeTax.totalSellingPriceTaxable;
	taxInvoice.totalNonMemberMarkupTaxable = taxInvoice.totalNonMemberMarkup ? getTaxableAmount(taxInvoice.totalNonMemberMarkup)  : 0;
	
	console.log("taxInvoice.totalSellingPriceBeforeTax = " + taxInvoice.totalSellingPriceBeforeTax );
	console.log("taxInvoiceTaxAndSellingPriceItems.totalSellingPriceNonTaxable = " + taxInvoice.totalSellingPriceNonTaxable );
	console.log("totalSellingPriceBeforeTax.totalSellingPriceTaxable = " + taxInvoice.totalSellingPriceTaxable );
	
	taxInvoice.totalTax = getTotalTax(taxInvoice.orderItems, taxInvoice.totalNonMemberMarkup);

	//Do not include Total MDR Surcharge on Total Yang Harus Di Bayar
	taxInvoice.totalAmtTaxed = Math.ceil(taxInvoice.totalSellingPriceBeforeTax + taxInvoice.totalTax);
	
	console.log("taxInvoice.totalTax = " + taxInvoice.totalTax );
	taxInvoice.cashierId = taxInvoice.issuerId;

	taxInvoice.taxName = taxInvoice.taxName ? taxInvoice.taxName : taxInvoice.customerName ?  taxInvoice.customerName  : ' ';
	setTaxInvoiceAddressAndBusinessName(taxInvoice);

	taxInvoice.sumSellingPriceTaxable = Math.ceil(taxInvoice.totalSellingPriceTaxable + taxInvoice.totalNonMemberMarkupTaxable);
	taxInvoice.sumPPN = Math.floor(taxInvoice.totalTax);
	taxInvoice.sumSellingPricePlusTax = taxInvoice.totalSellingPriceTaxable + taxInvoice.totalTax + taxInvoice.totalNonMemberMarkupTaxable;

	taxInvoice.grandHarga = taxInvoice.totalSellingPriceTaxable + taxInvoice.totalSellingPriceNonTaxable + taxInvoice.totalNonMemberMarkupTaxable;
	taxInvoice.grandPPN = Math.floor(taxInvoice.totalTax);
	taxInvoice.grandTotalHarga = taxInvoice.totalSellingPriceTaxable + taxInvoice.totalSellingPriceNonTaxable + taxInvoice.totalTax + taxInvoice.totalNonMemberMarkupTaxable;

	//Post Rounding
	taxInvoice.totalSellingPriceBeforeTax = Math.ceil(taxInvoice.totalSellingPriceBeforeTax);
	taxInvoice.totalTax = Math.floor(taxInvoice.totalTax);

	taxInvoice.reprint = true;

	//epsonprinter.reprintTaxInvoice(taxInvoice);

	applyFormatToTaxInvoice(taxInvoice);
	extractTaxInvoiceData(taxInvoice);
	taxInvoice.fileName = '/equnix/arch/data/' + taxInvoice.invoiceNumber + ".pdf";
	taxInvoiceService.printTaxInvoice(taxInvoice, epsonprinter.printFile);
};

/**
 * Prints the return note.
 * @param returnTxn - representation of ReturnNoteDTO.
 */
function printReturnNote(returnTxn) {
	createOrderItems(returnTxn, returnTxn.orderItems);

	var totalSellingPriceBeforeTax = getTotalSellingPriceBeforeTax(returnTxn.orderItems, returnTxn.totalNonMemberMarkup);	

	returnTxn.totalSellingPriceBeforeTax = totalSellingPriceBeforeTax.totalSellingPriceBeforeTax;
	returnTxn.totalSellingPriceNonTaxable = totalSellingPriceBeforeTax.totalSellingPriceNonTaxable;
	returnTxn.totalSellingPriceTaxable = totalSellingPriceBeforeTax.totalSellingPriceTaxable;
	
	returnTxn.totalNonMemberMarkupTaxable = returnTxn.totalNonMemberMarkup ? getTaxableAmount(returnTxn.totalNonMemberMarkup) : 0;
	returnTxn.totalTax = getTotalTax(returnTxn.orderItems, returnTxn.totalNonMemberMarkup);
	returnTxn.totalAmount = Math.ceil(returnTxn.totalSellingPriceBeforeTax + returnTxn.totalTax);

	returnTxn.sumSellingPriceTaxable = Math.ceil(returnTxn.totalSellingPriceTaxable + returnTxn.totalNonMemberMarkupTaxable);
	returnTxn.sumPPN = Math.floor(returnTxn.totalTax);
	returnTxn.sumSellingPricePlusTax = returnTxn.totalSellingPriceTaxable + returnTxn.totalTax + returnTxn.totalNonMemberMarkupTaxable;

	//Post Rounding
	returnTxn.totalSellingPriceBeforeTax = Math.ceil(returnTxn.totalSellingPriceBeforeTax);
	returnTxn.totalTax = Math.floor(returnTxn.totalTax);

	setTaxInvoiceAddressAndBusinessName(returnTxn);
	applyFormatToReturnNote(returnTxn);
	extractReturnNoteData(returnTxn);
	returnTxn.fileName = '/equnix/arch/data/' + returnTxn.returnNoteNumber + ".pdf";
	returnNoteService.printReturnNote(returnTxn, epsonprinter.printFile);
	
	//epsonprinter.printReturnNote(returnTxn);
};

/*
 * Prints the tax invoice.
 * @param saleTxn - representation of PosTransactionDTO.
 */
function printTaxInvoice(saleTxn) {
	var taxInvoice = {};
	taxInvoice.invoiceNumber = saleTxn.taxInvoice.invoiceNumber;
	taxInvoice.transactionId = saleTxn.transactionId;
	taxInvoice.dateIssued = saleTxn.taxInvoice.dateIssued;
	taxInvoice.signatoryFullName = saleTxn.taxInvoice.signatoryFullName;
	taxInvoice.customerNumber = saleTxn.taxInvoice.customerNumber;
	taxInvoice.cashierId = saleTxn.userName;
	taxInvoice.taxId = saleTxn.taxInvoice.taxId;
	taxInvoice.taxName = saleTxn.taxInvoice.taxName ? saleTxn.taxInvoice.taxName : saleTxn.taxInvoice.customerName ? saleTxn.taxInvoice.customerName : ' ';
	taxInvoice.memberType = saleTxn.taxInvoice.memberType;
	taxInvoice.memberDiscReversal = saleTxn.memberDiscReversal;

	console.log('totalAmountPaid = ' + saleTxn.totalAmountPaid);
	console.log('totalChange = ' + saleTxn.totalChange);
	console.log('dateIssued = ' + taxInvoice.dateIssued);
	
	taxInvoice.totalChange = saleTxn.totalChange;
	if (taxInvoice.customerNumber == configuration.properties['HC_NON_MEMBER_DEF_CARDNO'] || taxInvoice.taxId == '00.000.000.0-000.000') {
		taxInvoice.businessName = '';
		taxInvoice.taxAddress = '';
	} else {
		taxInvoice.businessName = saleTxn.taxInvoice.businessName;
		taxInvoice.taxAddress = saleTxn.taxInvoice.taxAddress;
	}
	taxInvoice.totalQuantity = saleTxn.totalQuantity;
	taxInvoice.totalNonMemberMarkup = saleTxn.totalNonMemberMarkup ? saleTxn.totalNonMemberMarkup : 0;
	taxInvoice.totalNonMemberMarkupTaxable = saleTxn.totalNonMemberMarkup ? getTaxableAmount(saleTxn.totalNonMemberMarkup) : 0;
	
	processItemsWithSecondLayerDiscount(taxInvoice, saleTxn.orderItems);
	createOrderItems(taxInvoice, taxInvoice.segregatedOrderItems);
	//createOrderItems(taxInvoice, saleTxn.orderItems);
	groupSimilarProducts(taxInvoice);
	
	var totalSellingPriceBeforeTax = getTotalSellingPriceBeforeTax(taxInvoice.orderItems, taxInvoice.totalNonMemberMarkup);
	taxInvoice.totalSellingPriceBeforeTax = totalSellingPriceBeforeTax.totalSellingPriceBeforeTax;
	taxInvoice.totalSellingPriceNonTaxable = totalSellingPriceBeforeTax.totalSellingPriceNonTaxable;
	taxInvoice.totalSellingPriceTaxable = totalSellingPriceBeforeTax.totalSellingPriceTaxable;
	taxInvoice.totalTax = getTotalTax(taxInvoice.orderItems, taxInvoice.totalNonMemberMarkup);
	taxInvoice.totalAmount = saleTxn.totalAmount;
	//Remove total MDR charge in Total Media Payment
	taxInvoice.totalAmountPaid = saleTxn.totalAmountPaid - saleTxn.totalMdrSurcharge;
	taxInvoice.totalChange = saleTxn.totalChange;
	
	//Do not include Total MDR Surcharge on Total Yang Harus Di Bayar
	taxInvoice.totalAmtTaxed = Math.ceil(taxInvoice.totalSellingPriceBeforeTax + taxInvoice.totalTax);
	
	taxInvoice.sumSellingPriceTaxable = Math.ceil(taxInvoice.totalSellingPriceTaxable + taxInvoice.totalNonMemberMarkupTaxable);
	taxInvoice.sumPPN = Math.floor(taxInvoice.totalTax);
	taxInvoice.sumSellingPricePlusTax = taxInvoice.totalSellingPriceTaxable + taxInvoice.totalTax + taxInvoice.totalNonMemberMarkupTaxable;

	taxInvoice.grandHarga = taxInvoice.totalSellingPriceTaxable + taxInvoice.totalSellingPriceNonTaxable + taxInvoice.totalNonMemberMarkupTaxable;
	taxInvoice.grandPPN = Math.floor(taxInvoice.totalTax);
	taxInvoice.grandTotalHarga = taxInvoice.totalSellingPriceTaxable + taxInvoice.totalSellingPriceNonTaxable + taxInvoice.totalTax + taxInvoice.totalNonMemberMarkupTaxable;

	//Post Rounding
	taxInvoice.totalSellingPriceBeforeTax = Math.ceil(taxInvoice.totalSellingPriceBeforeTax);
	taxInvoice.totalTax = Math.floor(taxInvoice.totalTax);

	//epsonprinter.printTaxInvoice(taxInvoice);
	
	setTaxInvoiceAddressAndBusinessName(taxInvoice);
	applyFormatToTaxInvoice(taxInvoice);
	extractTaxInvoiceData(taxInvoice);
	taxInvoice.fileName = '/equnix/arch/data/' + taxInvoice.invoiceNumber + ".pdf";
	taxInvoiceService.printTaxInvoice(taxInvoice, epsonprinter.printFile);
}

/*
 * Creates a list of valid items only excluding the voided ones.
 * @param taxInvoice - representation of TaxInvoiceDTO.
 * @param txnItems - list of order items.
 */
function createOrderItems(taxInvoice, txnItems) {
	var orderItemsList = new Array();
	var voidedItemsList = new Array();
	taxInvoice.orderItems = new Array();		

	// Iterate over all txnItems separating voided and non-voided transactions
	txnItems.forEach(function(item) {
		// instantiate orderItem
		var orderItem = {};
		
		// Assign preliminary values
		orderItem.productId = item.productId;
        orderItem.shortDesc = item.shortDesc;
        orderItem.name = item.name;
        orderItem.quantity = item.quantity;
        orderItem.description = item.description;
        orderItem.ean13Code = item.ean13Code;
        if (item.discountAmount && item.discountAmount > 0) {
            orderItem.discountAmount = item.discountAmount;
		}
		orderItem.discBtnAmount = (item.discBtnAmount ? item.discBtnAmount : 0);
		orderItem.weight = item.weight;
        orderItem.staffId = item.staffId;
        
		if (item.isVoided) {
			// Add to voidedItemsList
			// Will cancel out orderItemsList
			voidedItemsList.push(orderItem);
		} else {
			orderItem.unitPrice = item.priceSubtotal / item.quantity;
			orderItem.secondLayerDiscountAmount = (item.secondLayerDiscountAmount ? item.secondLayerDiscountAmount : 0);
			orderItem.memberDiscountAmount = (item.memberDiscountAmount && (!taxInvoice.memberDiscReversal || taxInvoice.memberDiscReversal == 0) ? item.memberDiscountAmount : 0);
			orderItem.isTaxInclusive = item.isTaxInclusive;
			orderItem.nonMemberMarkup = item.nonMemberMarkup;
			// Add to orderItemsList i.e.,
			// Candidate for checkout
			orderItemsList.push(orderItem);
		}
	});

	// Iterate over the voided Items list
	// to deduct quantity from voidable entries
	voidedItemsList.forEach(function(voidedItem) {
		var done = false;
		//for (var i=0; i<orderItemsList.length && !done; i++) {
		for (var i = orderItemsList.length-1; -1 < i && !done; i--) { //reverse
			var orderItem = orderItemsList[i];
            if (voidedItem.productId == orderItem.productId) {
            	// If true, remove record from candidate list
            	if (voidedItem.quantity == orderItem.quantity) {
            		console.log('item.quantity == invItem.quantity');
            		orderItemsList.splice(i, 1);
            		done = true;
            	}
            	// If true, decrement orderItem quantity
            	else if (voidedItem.quantity < orderItem.quantity) {
            		console.log('item.quantity < invItem.quantity');
            		orderItem.quantity -= voidedItem.quantity;
            		orderItem.discountAmount -= voidedItem.discountAmount;
            		orderItem.discBtnAmount -= voidedItem.discBtnAmount;
            		//TODO: Should other discounts get deducted here?
            		done = true;
            	} 
            	// If true, decrement voidedItem quantity and
            	// remove record from candidate list
            	else if (voidedItem.quantity > orderItem.quantity) {
            		console.log('item.quantity > invItem.quantity');
            		voidedItem.quantity -= orderItem.quantity;
            		voidedItem.discountAmount -= orderItem.discountAmount;
            		voidedItem.discBtnAmount -= orderItem.discBtnAmount;
            		//TODO: Should other discounts get deducted here?
            		orderItemsList.splice(i--, 1);
            	}
            }
		}
	});

	orderItemsList.forEach(function(orderItem) {
		console.log(JSON.stringify(orderItem));
		orderItem.priceSubtotal = orderItem.quantity * orderItem.unitPrice;
		orderItem.sellingPrice = getItemSellingPrice(orderItem, taxInvoice);
		orderItem.sellingPriceBeforeTax = getItemSellingPriceBeforeTax(orderItem.isTaxInclusive, orderItem.sellingPrice);
		orderItem.tax = getTaxForItem(orderItem.isTaxInclusive, orderItem.sellingPriceBeforeTax);
		taxInvoice.orderItems.push(orderItem);
	});
}

/**
 * Computes for the item selling price without the applied discounts.
 * @param orderItem - item containing data to be used for computation.
 * @param taxInvoice - representation of TaxInvoiceDTO.
 * @return double - computed selling price.
 */
function getItemSellingPrice(orderItem, taxInvoice) {
	return orderItem.priceSubtotal
			- (orderItem.discountAmount ? orderItem.discountAmount : 0)
			- (orderItem.secondLayerDiscountAmount ? orderItem.secondLayerDiscountAmount : 0)
			- (orderItem.memberDiscountAmount && (!taxInvoice.memberDiscReversal || taxInvoice.memberDiscReversal == 0) ? orderItem.memberDiscountAmount : 0)
			- (orderItem.discBtnAmount ? orderItem.discBtnAmount : 0);
}

/**
 * Computs for the item selling price without tax.
 * @param isTaxInclusive - boolean that tells if the item is inclusive of tax or not.
 * @param sellingPrice - selling price of the specified item.
 * @return double - computed selling price before tax.
 */
function getItemSellingPriceBeforeTax(isTaxInclusive, sellingPrice) {
	return isTaxInclusive ? (sellingPrice /  configuration.properties['TAX_TARIFF_DIVISOR']) : (sellingPrice);
}

/**
 * Computes the total tax of order items and total non-member markup.
 * @param orderItems - list of order items.
 * @param totalNonMemberMarkup - total computed non-member markup.
 * @return double - total computed tax.
 */
function getTotalTax(orderItems, totalNonMemberMarkup) {
	var totalTax = 0;
	orderItems.forEach(function(orderItem) {
		totalTax += orderItem.tax;
	});

	if (totalNonMemberMarkup) {
		totalTax += ((totalNonMemberMarkup * (configuration.properties['TAX_RATE'] /100) / 1.1));			
	}

	return totalTax;
}

/**
 * Get total amount of selling price beforeTax.
 * @param orderItems - list of order items.
 * @param totalNonMemberMarkup - total computed non-member markup.
 * @return Object - contains total selling price before tax, taxable selling price, and non-taxable selling price.
 */
function getTotalSellingPriceBeforeTax(orderItems, totalNonMemberMarkup) {
	var totalSellingPriceBeforeTax = 0;
	var totalSellingPriceNonTaxable = 0;
	var totalSellingPriceTaxable  = 0;

	orderItems.forEach(function(orderItem) {
		totalSellingPriceBeforeTax += orderItem.sellingPriceBeforeTax;
		if (orderItem.isTaxInclusive) {
			totalSellingPriceTaxable += orderItem.sellingPriceBeforeTax;
		} else {
			totalSellingPriceNonTaxable += orderItem.sellingPriceBeforeTax;
		}		
	});

	if (totalNonMemberMarkup) {
		totalSellingPriceBeforeTax += getTaxableAmount(totalNonMemberMarkup);
	}

	return {
		totalSellingPriceBeforeTax: totalSellingPriceBeforeTax, 
		totalSellingPriceNonTaxable : totalSellingPriceNonTaxable,
		totalSellingPriceTaxable : totalSellingPriceTaxable
	};
}

/**
 * Computes the tax of the specified item.
 * @param isTaxInclusive - boolean to tell if the item is inclusive of tax.
 * @param sellingPrice - selling price of the item.
 * @return double - if tax is inclusive, returns the computed tax; else, returns 0.
 */
function getTaxForItem(isTaxInclusive, sellingPrice) {
	return isTaxInclusive ? (sellingPrice * configuration.properties['HC_TAX_INVOICE_VAT_RATE']) : 0;
}

/**
 * Sets address and business name to supply in Tax Invoice. If non-member, sets a static address and business name.
 * @param taxInvoice - representation of TaxInvoiceDTO.
 */
function setTaxInvoiceAddressAndBusinessName(taxInvoice) {
	if (taxInvoice.customerNumber && taxInvoice.customerNumber === configuration.properties['HC_NON_MEMBER_DEF_CARDNO'] ||
		taxInvoice.taxId && taxInvoice.taxId === '00.000.000.0-000.000') {
		taxInvoice.businessName = ' ';
		taxInvoice.taxAddress = ' ';
		taxInvoice.taxId = '00.000.000.0-000.000';
	} else {
		taxInvoice.businessName = !taxInvoice.businessName ? ' ' : taxInvoice.businessName;
		taxInvoice.taxAddress = !taxInvoice.taxAddress ? ' ' : taxInvoice.taxAddress;
		taxInvoice.taxId = !taxInvoice.taxId ? ' ' : taxInvoice.taxId;
	}
}

/**
 * Computes for taxable amount.
 * @param price - amount after tax.
 * @return double - amount before tax.
 */
function getTaxableAmount(price) {
	return price / configuration.properties['TAX_TARIFF_DIVISOR'];
}

/**
 * Methods that re-group product with similar barcodes. Except for the ff. items:
 * (a) Promo items that have discounted amounts.
 * @param taxInvoice - representation of TaxInvoiceDTO.
 */
function groupSimilarProducts(taxInvoice) {
	taxInvoice.groupedOrderItems = new Array();
	var clonedList = taxInvoice.orderItems,
		groupedList = {},
		finalList = {},
		item,
		gItems,
		finalItem,
		productId,
		i;

	//group first similar items then insert to 2D array
	for (i = 0; i < clonedList.length; i++) {
		item = clonedList[i];

		//productId = item.productId
		if (item.secondLayerDiscountAmount > 0) {
			productId = item.productId + "-discounted"; //for discounted items
			item.description += " (Discounted)";
		} else {
			productId = item.productId
		}

		//if not yet existing, create an empty list
		if (!(productId in groupedList)) {
			groupedList[productId] = [];
		}

		groupedList[productId].push(item);
	}

	//combine similar items into one entry in array
	for (var key in groupedList) {
		finalItem = {};
		gItems = groupedList[key];

		for (i = 0; i < gItems.length; i++) {
			item = gItems[i];

			//load this info only once
			if (i == 0) {
				finalItem.productId = item.productId;
				finalItem.shortDesc = item.shortDesc;
				finalItem.name = item.name;
				finalItem.quantity = item.quantity;
				finalItem.priceSubtotal = item.priceSubtotal;
				finalItem.sellingPrice = item.sellingPrice;
				finalItem.sellingPriceBeforeTax = item.sellingPriceBeforeTax;
				finalItem.tax = item.tax;
				finalItem.ean13Code = item.ean13Code;
				finalItem.description = item.description;
				finalItem.isTaxInclusive = item.isTaxInclusive;
				finalItem.weight = item.weight ? item.weight : 0;
			} else {
				finalItem.quantity += item.quantity;
				finalItem.sellingPrice += item.sellingPrice;
				finalItem.sellingPriceBeforeTax += item.sellingPriceBeforeTax;
				finalItem.weight += item.weight ? item.weight : 0;
			}
		}

		taxInvoice.groupedOrderItems.push(finalItem);
	}
}

/**
 * Applies currency format to supplied amount.
 * @param x - amount to format.
 * @return - formatted x including commas and decimal.
 */
function applyCurrencyFormat(x) {
	return (x ? Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","):"0");
}

/**
 * Applies the date format used in Tax Invoice (d MM yyyy).
 * @param date - date to format.
 * @return String - formatted date (e.g. 9 February 2015).
 */
function applyInvoiceDateFormat(date) {
	var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	var d = new Date(date);
	return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

/**
 * Applies the time format used in Tax Invoice (hh24:mm).
 * @param date - containing the time to format.
 * @return String - formatted time (e.g. 17:23).
 */
function applyInvoiceTimeFormat(date) {
	var d = new Date(date);
	return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
}

/**
 * Applies the date format used in Return Note (m/d/yyyy). 
 * @param date - date to format.
 * @return String - formatted date (e.g. 2/9/2015).
 */
function applyReturnDateFormat(date) {
	var d = date ? new Date(date) : new Date();
	return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
}

/**
 * Applies the purchase date format used in  Return Note (d/m/yyyy).
 * @param date - date to format.
 * @return String - formatted date (e.g. 9/2/2015).
 */
function applyPurchaseDateFormat(date) {
	var d = new Date(date);
	return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
}

/**
 * Returns the markup label to use in Tax Invoice based on member type.
 * @param memberType - member type.
 * @return String - corresponding label.
 */
function getMarkupLabelForTaxInvoice(memberType) {
	switch (memberType) {
		case "EMPLOYEE":
			return "Total Employee Mark Up";
		default:
			return "Total Non Member Mark Up";
	}	
}

/**
 * Returns the markup label in Return Note based on member type.
 * @param memberType - member type.
 * @return String - corresponding label.
 */
function getMarkupLabelForReturnNote(memberType) {
	switch (memberType) {
		case "EMPLOYEE":
			return "Employee Mark Up";
		default:
			return "Biaya Non Member";
	}	
}

/**
 * Applies format to all fields in Tax Invoice that should be formatted.
 * @param taxInvoice - representation of TaxInvoiceDTO.
 */
function applyFormatToTaxInvoice(taxInvoice) {
	taxInvoice.formattedDateIssued = applyInvoiceDateFormat(taxInvoice.dateIssued); //Tanggal / Tgl. Pembelian
	taxInvoice.formattedTimeIssued = applyInvoiceTimeFormat(taxInvoice.dateIssued); //Jam

	taxInvoice.markupLabel = getMarkupLabelForTaxInvoice(taxInvoice.memberType); // Mark Up Label (conditional)
	taxInvoice.totalNonMemberMarkupTaxable = applyCurrencyFormat(taxInvoice.totalNonMemberMarkupTaxable); //Total Employee / Non Member Mark Up
	taxInvoice.totalSellingPriceBeforeTax = applyCurrencyFormat(taxInvoice.totalSellingPriceBeforeTax); //Harga Jual
	taxInvoice.totalTax = applyCurrencyFormat(taxInvoice.totalTax); //PPN / GRAND TOTAL, PPN
	taxInvoice.totalAmtTaxed = applyCurrencyFormat(taxInvoice.totalAmtTaxed); //Total Yang Harus Dibayar
	taxInvoice.totalAmountPaid = applyCurrencyFormat(taxInvoice.totalAmountPaid); //Total media payment
	taxInvoice.totalChange = applyCurrencyFormat(taxInvoice.totalChange); //Kembalian
	
	taxInvoice.sumSellingPriceTaxable = applyCurrencyFormat(taxInvoice.sumSellingPriceTaxable); //Barang & Jasa Kena Pajak*, HARGA
	taxInvoice.sumPPN = applyCurrencyFormat(taxInvoice.sumPPN); ////Barang & Jasa Kena Pajak*, PPN
	taxInvoice.sumSellingPricePlusTax = applyCurrencyFormat(taxInvoice.sumSellingPricePlusTax); //Barang & Jasa Kena Pajak*, TOTAL HARGA
	console.log('************************total amt taxed: '+taxInvoice.totalAmtTaxed);
	console.log('************************total amt paid: '+taxInvoice.totalAmountPaid);

	taxInvoice.totalSellingPriceNonTaxable = applyCurrencyFormat(taxInvoice.totalSellingPriceNonTaxable); //Bukan Barang Kena Pajak & Jasa Kena Pajak*

	taxInvoice.grandHarga = applyCurrencyFormat(taxInvoice.grandHarga); //GRAND TOTAL, HARGA
	taxInvoice.grandTotalHarga = applyCurrencyFormat(taxInvoice.grandTotalHarga); //GRAND TOTAL, TOTAL HARGA
}

/**
 * Applies format to all fields in Return Note that should be formatted.
 * @param returnNote - representation of ReturnNoteDTO.
 */
function applyFormatToReturnNote(returnNote) {
	returnNote.purchaseDate = applyPurchaseDateFormat(returnNote.purchaseDate);
	returnNote.returnDate = applyReturnDateFormat(returnNote.returnDate);

	returnNote.markupLabel = getMarkupLabelForReturnNote(returnNote.memberType); //Mark Up Label (conditional)
	returnNote.totalNonMemberMarkupTaxable = applyCurrencyFormat(returnNote.totalNonMemberMarkupTaxable); //Total Employee / Non Member Mark Up
	
	returnNote.totalSellingPriceBeforeTax = applyCurrencyFormat(returnNote.totalSellingPriceBeforeTax); //Jumlah Harga Jual BKP yang dikembalikan / Total Harga Jual BKP setelah Potongan Harga yang dikembalikan
	returnNote.totalTax = applyCurrencyFormat(returnNote.totalTax); //PPN yang diminta kembali
	returnNote.totalAmount = applyCurrencyFormat(returnNote.totalAmount); //Total yang harus dikembalikan

	returnNote.sumSellingPriceTaxable = applyCurrencyFormat(returnNote.sumSellingPriceTaxable); //Barang & Jasa Kena Pajak*, HARGA
	returnNote.sumPPN = applyCurrencyFormat(returnNote.sumPPN); //Barang & Jasa Kena Pajak*, PPN
	returnNote.sumSellingPricePlusTax = applyCurrencyFormat(returnNote.sumSellingPricePlusTax); //Barang & Jasa Kena Pajak*, TOTAL HARGA

	returnNote.totalSellingPriceNonTaxable = applyCurrencyFormat(returnNote.totalSellingPriceNonTaxable); //Bukan barang kena pajak
}

/**
 * Prepares the data to be displayed in Tax Invoice most especially the list of order items.
 * @param taxInvoice - representation of TaxInvoiceDTO.
 */
function extractTaxInvoiceData(taxInvoice) {
	taxInvoice.data = [];
	
	for (var i = 0; i < taxInvoice.groupedOrderItems.length; i++) {
		var item = taxInvoice.groupedOrderItems[i];
		var modDesc = item.description ? item.description : item.shortDesc;

		//modify description
		if (item.weight > 0) {
			modDesc += " (" + item.weight + " Kilograms)";
		}

		taxInvoice.data.push({number: i+1, 
							  description: modDesc,
							  quantity: item.quantity,
							  price: applyCurrencyFormat(item.sellingPriceBeforeTax / item.quantity),
							  subtotal: applyCurrencyFormat(item.sellingPriceBeforeTax),
							  isTaxInclusive: item.isTaxInclusive,
							  common: 1, //any value, this will be used for groupBy if no grouping to be applied
							  ean13Code: item.ean13Code
							});
	}
}

/**
 * Prepares the data to be displayed in Return Note most especially the list of order items.
 * @param returnNote - representation of ReturnNoteDTO.
 */
function extractReturnNoteData(returnNote) {
	returnNote.data = [];
	
	for (var i = 0; i < returnNote.orderItems.length; i++) {
		var item = returnNote.orderItems[i];

		returnNote.data.push({number: i+1, 
							  description: item.description ? item.description : item.shortDesc,
							  quantity: item.quantity,
							  price: applyCurrencyFormat(item.sellingPriceBeforeTax / item.quantity),
							  subtotal: applyCurrencyFormat(item.sellingPriceBeforeTax),
							  isTaxInclusive: item.isTaxInclusive,
							  common: 1, //any value, this will be used for groupBy if no grouping to be applied
							  ean13Code: item.ean13Code
							});
	}

	//add mark up
	returnNote.data.push({
		number: "", 
	  	description: returnNote.markupLabel,
	  	quantity: "",
	  	price: "",
	  	subtotal: returnNote.totalNonMemberMarkupTaxable,
	  	isTaxInclusive: true,
	  	common: 1, //any value, this will be used for groupBy if no grouping to be applied
	  	ean13Code: ""
	});
}

/**
 * Segregates discounted item from items with normal price. Creates a new entry in array for discounted items.
 * @param taxInvoice - representation of TaxInvoiceDTO.
 * @param orderItems - raw list of order items (from saleTx obj).
 */
function processItemsWithSecondLayerDiscount(taxInvoice, orderItems) {
	taxInvoice.segregatedOrderItems = new Array();
	var newItem;

	if (orderItems) {
		orderItems.forEach(function(item) {
			if (item.qtyWithSecondLayerDiscount > 0 
				&& item.quantity != item.qtyWithSecondLayerDiscount 
				&& item.secondLayerDiscountAmount > 0) {
				newItem = JSON.parse(JSON.stringify(item)); //shallow clone

				var nonMemberMarkupPerItem = item.nonMemberMarkup / item.quantity;
				newItem.nonMemberMarkup = nonMemberMarkupPerItem * item.qtyWithSecondLayerDiscount;
				newItem.priceSubtotal = item.priceUnit * item.qtyWithSecondLayerDiscount;
				newItem.secondLayerDiscountAmount = item.secondLayerDiscountAmount;
				newItem.quantity = item.qtyWithSecondLayerDiscount;
				
				item.nonMemberMarkup = item.nonMemberMarkup - newItem.nonMemberMarkup;
				item.priceSubtotal = item.priceSubtotal - newItem.priceSubtotal;
				item.secondLayerDiscountAmount = 0;
				item.quantity = item.quantity - item.qtyWithSecondLayerDiscount;

				taxInvoice.segregatedOrderItems.push(newItem); //insert another entry
			}

			taxInvoice.segregatedOrderItems.push(item); //update existing order item
		});
	}
}

/**
 * Checks if the product with specified ean13Code is fresh goods.
 * @param ean13Code - product barcode.
 * @return boolean - returns true if product is fresh goods; else, false.
 */
function isProductFreshGoods(ean13Code) {
	if (ean13Code) {
		var freshGoodsIndicators = configuration.properties["FRESH_GOODS_INDICATOR"];
		var freshGoodsArray = [];
		
		if (freshGoodsIndicators) {
			freshGoodsArray = freshGoodsIndicators.split(",");
		} else {
			freshGoodsArray.push("20");
			freshGoodsArray.push("21");
		}
		
		for (var i=0; i < freshGoodsArray.length; i++) {
			if (data.ean13Code.startsWith(freshGoodsArray[i])) {
				return true;
			}
		}
	}	

	return false;
}
