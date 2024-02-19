/**
 * These JS file includes the keyboards set for the Cashier's Banana Dialog.
 */
$(function() { 
	//For eft online UNIT textboxes
	$('input[name^=eftOnline\\.][name$=Unt]').keyboard({
	    display: numberDisplay2,
	    layout: 'custom',
	    customLayout: customNumberLayout2,
	    maxLength : 4
	});
	
	//For eft online AMOUNT textboxes
	$('input[name^=eftOnline\\.][name$=Amt]').keyboard({
	    display: numberDisplay2,
	    layout: 'custom',
	    customLayout: customNumberLayout2,
	    maxLength : 10
	});
	
	//For eft offline UNIT textboxes
	$('input[name^=eftOffline\\.][name$=Unt]').keyboard({
	    display: numberDisplay2,
	    layout: 'custom',
	    customLayout: customNumberLayout2,
	    maxLength : 4
	});
	
	//For eft offline AMOUNT textboxes
	$('input[name^=eftOffline\\.][name$=Amt]').keyboard({
	    display: numberDisplay2,
	    layout: 'custom',
	    customLayout: customNumberLayout2,
	    maxLength : 10
	});
	
	$('input[name^=eb][name$=Unt]').keyboard({
	    display: numberDisplay2,
	    layout: 'custom',
	    customLayout: customNumberLayout2,
	    maxLength : 4
	});
	
	$('input[name^=eb][name$=Amt]').keyboard({
	    display: numberDisplay2,
	    layout: 'custom',
	    customLayout: customNumberLayout2,
	    maxLength : 10
	});
	
	$('input[name^=giftCard][name$=Unt]').keyboard({
	    display: numberDisplay2,
	    layout: 'custom',
	    customLayout: customNumberLayout2,
	    maxLength : 4
	});
	
	$('input[name^=giftCard][name$=Amt]').keyboard({
	    display: numberDisplay2,
	    layout: 'custom',
	    customLayout: customNumberLayout2,
	    maxLength : 10
	});
	
	$('input[name^=supplierVoucher]').keyboard({
	    display: numberDisplay2,
	    layout: 'custom',
	    customLayout: customNumberLayout2,
	    maxLength : 10
	});
	
	$('input[name^=otherVoucher]').keyboard({
	    display: numberDisplay2,
	    layout: 'custom',
	    customLayout: customNumberLayout2,
	    maxLength : 10
	});
	
	$('input[name^=dinners]').keyboard({
	    display: numberDisplay2,
	    layout: 'custom',
	    customLayout: customNumberLayout2,
	    maxLength : 10
	});
	
	$('input[name^=installment]').keyboard({
	    display: numberDisplay2,
	    layout: 'custom',
	    customLayout: customNumberLayout2,
	    maxLength : 10
	});
	
	$('input[name^=note][name$=Unt]').keyboard({
	    display: numberDisplay2,
	    layout: 'custom',
	    customLayout: customNumberLayout2,
	    maxLength : 10
	});
	
	$('input[name^=coin][name$=Unt]').keyboard({
	    display: numberDisplay2,
	    layout: 'custom',
	    customLayout: customNumberLayout2,
	    maxLength : 10
	});
	
	$('input[name=cashCvsAmt]').keyboard({
	    display: numberDisplay2,
	    layout: 'custom',
	    customLayout: customNumberLayout2,
	    maxLength : 10
	});
	
	$('input[name=cashEcommerceAmt]').keyboard({
	    display: numberDisplay2,
	    layout: 'custom',
	    customLayout: customNumberLayout2,
	    maxLength : 10
	});
	
	$('input[name=cashHomeDeliveryAmt]').keyboard({
	    display: numberDisplay2,
	    layout: 'custom',
	    customLayout: customNumberLayout2,
	    maxLength : 10
	});
	
	$('input[name^=cashPickup][name$=Amt]').keyboard({
	    display: numberDisplay2,
	    layout: 'custom',
	    customLayout: customNumberLayout2,
	    maxLength : 10
	});
	
	$('input[name=totalOthersAmt]').keyboard({
	    display: numberDisplay2,
	    layout: 'custom',
	    customLayout: customNumberLayout2,
	    maxLength : 10
	});
	
	$('input[name=salesCitiLinkAmt]').keyboard({
	    display: numberDisplay2,
	    layout: 'custom',
	    customLayout: customNumberLayout2,
	    maxLength : 10
	});
});




