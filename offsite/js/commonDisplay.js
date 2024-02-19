var COMMON_DISPLAY = COMMON_DISPLAY || {};

/**
 * Appends the iterated paymentMediaSummary label-value pair to the
 * $displayDOM; which usually the cashier/customer page receipt section.
 */
COMMON_DISPLAY.displayPaymentMediaSummary = function($displayDOM, paymentMediaSummary, tx) {
    //payment type details
    if (tx.totalAmountPaid) {
        paymentMediaSummary.forEach(function(item) {
            var label = item.label;
            // Fix #85005
            var unwrappedLblArr = [
                // List all labels here that needed to be unwrapped.
                getMsgValue('pos_receipt_giftcard_number_label')
            ];
            var isUnwrappedLbl = ($.inArray(label, unwrappedLblArr) >= 0);
            $displayDOM.append(payInfoSummaryLine(isUnwrappedLbl,
                label,
                item.value,
                (item.checkSign) ? displayNegativeSign(tx) : null,
                null,
                item.font));
        });
    }
};

/**
 * Gets the counter messages properties value of
 * 	argument: keyToFormat
 * i.e. pos_label_amount_{0}_param
 *
 * using the CONSTANTS.TX_TYPES values
 *  argument: txType
 * i.e. tx_type is SALE(default)
 * 	messages_*.properties key = pos_label_amount_sale_param *
 */
COMMON_DISPLAY.getTxTypesMsgPropValue = function(txType, keyToFormat) {
    var propVal = null;
    var propKey = null;
    if (txType) {
        propKey = CONSTANTS.TX_TYPES.formatKeyByTxTypeArguments( // The type to search
            txType,
            // The unformatted messages.properties key
            keyToFormat,
            // to lower
            false,
            // use the 1st argument of searched TX_TYPE
            false);
        propVal = getMsgValue(propKey);
        // If null, use the default tx_type; CONSTANTS.TX_TYPES.SALE
        if (!propVal) {
            var defaultTxType = CONSTANTS.TX_TYPES.SALE.name;
            propKey = CONSTANTS.TX_TYPES.formatKeyByTxTypeArguments( // The type to search
                defaultTxType,
                // The unformatted messages.properties key
                keyToFormat,
                // to lower
                false,
                // use the 1st argument of searched TX_TYPE
                false);

            propVal = getMsgValue(propKey);
        }
    }
    return propVal;
};

var lineSeparator1 = "==========";
var lineSeparator2 = "----------------------------------------";
var lineSeparator3 = "****************************************";
var lineSeparator4 = "------------------------";

function displayCancelSale(txType) {
    var cancelledDiv = $("<div></div>").addClass("sale-cancelled");
    var p = $("<p></p>").css({ 'width': '210px', 'text-align': 'center' }).text(getMsgValue('pos_tx_cancel_msg').format(txType));

    cancelledDiv.append(p);
    $("#scannedItemsDiv").append(cancelledDiv);

    // focus on last element
    scrollBottom($("#scannedItemsDiv"));
}

function displayBpjsInfo(data) {
    var bpjs = data;
    var responseCode = bpjs.return.responsecode;
    var responseMsg = bpjs.return.responsemsg;
    var response = bpjs.return.chart_table.replace(/\n/gi, '<br>');;
    var infoList = response.split("<br>");
    var name = infoList[2].replace(",<br>", "<br>").replace(" ,", "\n\t\t").replace(/,\s*$/, "");

    $("#bpjsResponseCode").html(responseCode);
    $("#bpjsResponseMsg").html(responseMsg);
    $("#bpjsInfoVaKel").html(infoList[0]);
    $("#bpjsInfoVaKepkel").html(infoList[1]);
    $("#bpjsInfoNama").html(name);
    $("#bpjsInfoAnggota").html(infoList[3]);
    $("#bpjsInfoPeriode").html(infoList[4]);
    $("#bpjsInfoPremi").html(infoList[5]);
    $("#bpjsInfoAdmin").html(infoList[6]);
}

function displayBpjsAdvice(data) {
    var bpjs = data;
    var responseCode = bpjs.return.responsecode;
    var responseMsg = bpjs.return.responsemsg;
    var accountNumber = bpjs.return.accountnumber;
    var payment_status = bpjs.return.payment_status;

    $("#adviceResponseCode").html(responseCode);
    $("#adviceResponseMsg").html(responseMsg);
    $("#adviceAccount").html(accountNumber);
    $("#adviceStatus").html(payment_status);
}

function displaySimpatindoInfo(data) {
    var simpatindo = data;

    console.log("Simpatindo info");
    console.log(simpatindo);
    $("#simpatindoInfoResponseCode").html(simpatindo.response.rescode);
    $("#simpatindoInfoResponseMsg").html(simpatindo.response.resmessage);
    $("#simpatindoInfoResponseScreen").html(simpatindo.response.scrmessage);
}

function displaySimpatindoAdvice(data) {
    var simpatindo = data;
    console.log("Simpatindo advice");
    console.log(simpatindo);
    $("#simpatindoAdviceResponseCode").html(simpatindo.response.rescode);
    $("#simpatindoAdviceResponseMsg").html(simpatindo.response.resmessage);
    $("#simpatindoAdviceResponseScreen").html(simpatindo.response.scrmessage);
}

function displayEleboxCustomer(data) {
    var elebox = data;
    var orderId = elebox.order.order_id;
    var customerId = elebox.order.cart.detail_list.customer.customer_id;
    var customerData = elebox.order.cart.detail_list.customer.customer_data;
    if (jQuery.isEmptyObject(customerData)) {
        var repCusData = "Ready to Release";
    } else {
        var repCusData = customerData.replace(/-0-/gi, '\n');
    }

    $("#eleboxOrderIdCustomer").html(orderId);
    $("#eleboxCustomerIdCustomer").html(customerId);
    $("#eleboxCustomerDataCustomer").html(repCusData);
}

function displayEleboxStatus(data) {
    var elebox = data;
    var orderId = elebox.order.order_id;
    var customerData = elebox.order.cart.detail_list.item_info;
    var customerInfo = customerData.replace(/-0-/gi, '\n');

    $("#eleboxInfoId").html(orderId);
    $("#eleboxCusInfo").html(customerInfo);
}

function displayEleboxFailed(data) {
    var elebox = data;
    console.log(elebox);
    var orderId = elebox.order.order_id;
    var customerData = elebox.order.cart.detail_list.item_info;
    var customerInfo = customerData.replace(/-0-/gi, '\n');

    $("#eleboxFailedId").html(orderId);
    $("#eleboxFailedInfo").html(customerInfo);
}

function displayLoyaltyMail(data) {
    var loyalty = data;

    $("#custLoyalty_mail_info_hp").html(loyalty.hpNumber);
    $("#custLoyalty_mail_info_nama").html(loyalty.memberName);
    $("#custLoyalty_mail_info_email").html(loyalty.email);
}

//Allo Top Up 2022-08-12
function displayInquiryAlloTopup(data) {
    $("#alloTopupKeyNo").text(data["key_no"]);
    $("#alloTopupCustomerId").text(data["beneficiary_nns_code"]);
    $("#alloTopupCustomerName").text(data["beneficiary_name"]);
    $("#alloTopupAmount").text(data["amount"]);
    $("#alloTopupBarcode").text(data["eancode"]);
    $("#alloTopupItem").text(data["item_name"]);
}

function displayCheckAlloTopup(data) {
    $("#alloTopupCheckKno").text(data["key_no"]);
    $("#alloTopupCheckAmt").text(data["amount"]);
    $("#alloTopupCheckBn").text(data["beneficiary_pan"]);
    $("#alloTopupCheckBnn").text(data["beneficiary_nns_name"]);
    $("#alloTopupCheckBnm").text(data["beneficiary_name"]);
    $("#alloTopupCheckBc").text(data["beneficiary_city"]);
    $("#alloTopupCheckSp").text(data["sender_pan"]);
    $("#alloTopupCheckRrn").text(data["rrn"]);
    $("#alloTopupCheckAc").text(data["approval_code"]);
    $("#alloTopupCheckIn").text(data["invoice_number"]);
    $("#alloTopupCheckAn").text(data["account_no"]);
    $("#alloTopupCheckDt").text(data["datetime"]);
}

function displayInquiryOmniTelkomsel(data) {
    $("#omniTelkomselInqIdCnfrm").text(data["inquiryId"]);
    $("#omniTelkomselCstmrNmCnfrm").text(data["customerName"]);
    $("#omniTelkomselCstmrPhCnfrm").text(data["cust_phone"]);
    $("#omniTelkomselPymtCdCnfrm").text(data["payment_code"]);
    $("#omniTelkomselDescCnfrm").text(data["commercial_name"] + " " +data["description"]);
    $("#omniTelkomselTtlAmtCnfrm").text(data["totalAmount"]);
    $("#omniTelkomselBaseAmtCnfrm").text(data["baseAmount"]);
    $("#omniTelkomselAdmFeeCnfrm").text(data["adminFee"]);
    $("#omniTelkomselBarcode").text(data["eancode"]);
}

function displayCheckOmniTelkomsel(data) {
    $("#omniTelkomselInqId").text(data["inquiryId"]);
    $("#omniTelkomselInqSts").text(data["inquiryStatus"]["status"]);
    $("#omniTelkomselDestInf").text(data["destinationInfo"]["primaryParam"]);
    $("#omniTelkomselTtlAmt").text(data["totalAmount"]["value"]);
    $("#omniTelkomselBsAmt").text(data["baseAmount"]["value"]);
    $("#omniTelkomselAdmFe").text(data["adminFee"]["value"]);
    $("#omniTelkomselPymtCd").text(data["payment_code"]);
    $("#omniTelkomselCstmrNm").text(data["customerName"]);
    $("#omniTelkomselCstmrPh").text(data["cust_phone"]);
    $("#omniTelkomselDesc").text(data["commercial_name"] + " " +data["description"]);
}

function displayDonasiCustomer(data) {
    console.log(data);
    var __header = [];
    var headerCombined = "";
    var __i = 0;
    //__header[__i++]="BARCODE";
    __header[__i++] = "ITEM NAME";
    console.log(__header);
    for (var i = 0; i < __header.length; i++) {
        headerCombined += "<th style='height: 50px' colspan='2'>" + __header[i] + "</th>";
    }

    $("#donationTableHeadCustomer").html("<tr style='color: white;'>" + headerCombined + "</tr>");
    $("#donationTableBodyCustomer").html('');
    var listDonation = data.donation;
    /*if(data.change != ""){
    	var trCss = {'background-color' : 'white'};
    	var tt = $('<tr>');
    	tt.css(trCss);
    	tt.append($('<td>')
    					  .css({"background-color":"#FFFFFF","color":"#000000","text-align":"center","padding-left":"5px","padding-right":"5px","width":"40%","height":"35px"})
    					  .html(" Total Transaksi Rp. " + data.totalTrans));
    	tt.append($('<td>')
    					  .css({"background-color":"#FFFFFF","color":"#000000","text-align":"center","padding-left":"5px","padding-right":"5px","width":"40%","height":"35px"})
    					  .html(" Total Kembali Rp. " + data.change));
    	//}
    	$("#donationTableBodyCustomer").append(tt);
    }*/
    for (var a = 0; a <= listDonation.length - 1; a++) {
        var donation = listDonation[a];
        donation = donation.split(",");
        var trCss = { 'background-color': 'white' };
        var checkBoxCss = { type: 'checkbox' };

        var tt = $('<tr>');

        var itemName = donation[3];
        var subDonasi = "0";
        tt.css(trCss);
        // item name
        tt.append($('<td colspan="2">')
            .css({ "background-color": "#FFFFFF", "color": "#000000", "padding-left": "5px", "padding-right": "5px", "width": "80%", "height": "35px" })
            .html(itemName));

        $("#donationTableBodyCustomer").append(tt);

    }
}

function displayItemQuantity(qty, isVoid) {
    // remove first tempQtyDiv if exists to avoid duplicate
    removeDisplayedQuantity();

    var quantityDiv = $("<div></div>").attr("id", "tempQtyDiv").addClass("pro-scanned");
    var ul = $("<ul></ul>").addClass("scan");
    var li = $("<li></li>").css({ 'width': '210px' }).html(qty + "X ");

    if (isVoid) {
        var li_Void = $("<li></li>").css({ 'width': '150px' }).html(getMsgValue("pos_receipt_void_label"));
        ul.append(li_Void);
    }

    ul.append(li);
    quantityDiv.append(ul);
    $("#scannedItemsDiv").append(quantityDiv);
    scrollBottom($("#scannedItemsDiv"));
}

/**
 * Used for rendering cashier's scanned item/product.
 * @param data Product object.
 * @param qty Product quantity.
 */
function displayScannedItem(tx, type, item) {
    uilog("DBUG", "displayScannedItem.item");
    uilog("DBUG", item);
    // remove first tempQtyDiv if exists before rendering scanned item
    removeDisplayedQuantity();

    var scannedDiv = $("<div></div>").attr("id", item.id).addClass("pro-scanned");
    var ul = $("<ul></ul>").addClass("scan");

    if (item && item.staffId != "" && item.staffId != undefined && item.flagStaff == true) {
        var li_tmpStaff = $("<li></li>").css({ 'width': '210px' }).html("Staff ID : " + item.staffId);
        ul.append(li_tmpStaff);
    }

    // if no Item(productId) Id
    if (item && item.id != undefined) {
        var li_Qty = $("<li></li>").css({ 'width': '210px' }).html(item.qty + (item.categoryId == 'DEPTSTORE' ? "@ " : "X ") + item.unitPrice);
        ul.append(li_Qty);
        // LUCKY - ADD Z SYMBOL IF ITEM IS ZEPRO
        if (tx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO && isItemCMC(item.barcode, tx.promotionsMap)) {
            var li_Zepro = $("<li></li>").addClass("tax-sign").html("Z");
            ul.append(li_Zepro);
        }
    }

    /**
     * isGCActivation variable is not accessible from customer view therefore check if transaction is for GC activation
     * if the product category id is Gift Card
     */
    if (item && item.giftCardNumber && tx.orderItems[tx.orderItems.length - 1].categoryId == 'Gift Card') {
        var li_GiftCard = $("<li></li>").css({ 'width': '210px' }).html(getMsgValue("pos_receipt_giftcard_number_label") + maskValueWithX(item.giftCardNumber, 11, 'LAST'));
        ul.append(li_GiftCard);
    }

    var li_Desc = $("<li></li>").addClass("pro-label").html(((item.categoryId == 'DEPTSTORE') ? item.barcode.substring(1, 5) + ',' + item.barcode.substring(5, 7) + ',' : '') + item.shortDesc);
    var li_Price = $("<li></li>").addClass("pro-price").html(item.itemTotal);
    var li_neg = $("<li></li>").addClass("voided-sign").html((item.categoryId == 'MVOUCHER') ? '-' : displayNegativeSign(tx, item.isVoided)); // INHOUSE VOUCHER 2017-04-13
    var li_tax = $("<li></li>").addClass("tax-sign").html(displayTaxSign(item.isTaxInclusive));

    ul.append(li_Desc);
    ul.append(li_Price);
    ul.append(li_neg);
    ul.append(li_tax);

    //will render discount if item has discountAmount and Transaction type is SALE.
    if ((type == CONSTANTS.TX_TYPES.SALE.name || type == CONSTANTS.TX_TYPES.RECALL.name)) {
        var sign = displayNegativeSign(tx, !item.isVoided);

        // DEPTSTORE
        if (item.categoryId == 'DEPTSTORE' || item.categoryId == 'DIRECTP') {
            if (item.discMarkdown && item.discMarkdown > 0)
                displayDiscount(ul, Math.round(item.qty * parseInt(item.discMarkdown)), sign, getMsgValue("pos_receipt_discount"));

            for (var p in item.discAmount) {
                displayDiscount(ul, Math.round(item.qty * parseInt(item.discAmount[p])), sign,
                    getMsgValue("pos_receipt_discount") + ((parseFloat(item.discPrice[p]) <= 1) ? parseInt(item.discPrice[p] * 100) + '%' : 'Rp'));
            }

            // INHOUSE VOUCHER 2017-04-13
            if (item.discVoucher && item.discVoucher.length > 0) {
                for (var v in item.discVoucher) {
                    displayDiscount(ul, parseInt(item.discVoucher[v]), sign,
                        getMsgValue("pos_receipt_discount") + 'Voucher #' + item.discVoucherBarcode[v]);
                }
            }
            // INHOUSE VOUCHER 2017-04-13
        } else if (item.discountAmount && item.discountAmount > 0) {
            displayDiscount(ul, item.discountAmount, sign, getMsgValue("pos_receipt_discount"));
        }

        if (item.crmMemberDiscountAmount && item.crmMemberDiscountAmount > 0) {
            displayDiscount(ul, item.crmMemberDiscountAmount, sign, getMsgValue("pos_receipt_crm_discount"));
        }

        if (item.memberDiscountAmount && item.memberDiscountAmount > 0) {
            displayDiscount(ul, item.memberDiscountAmount, sign, item.cmcDiscountLabel, true);
        }


    }

    scannedDiv.append(ul);
    $("#scannedItemsDiv").append(scannedDiv);
    // focus on last element
    scrollBottom($("#scannedItemsDiv"));
}

function displayPaymentItem(item) {

    var scannedDiv = $("<div></div>").attr("id", item.id).addClass("pro-scanned");
    var ul = $("<ul></ul>").addClass("scan");

    var li_Label = $("<li></li>").addClass("pro-label").html(item.label);
    var li_Amount = $("<li></li>").addClass("pro-price").html(item.amount);

    ul.append(li_Label);
    ul.append(li_Amount);

    scannedDiv.append(ul);
    $("#scannedItemsDiv").append(scannedDiv);
    // focus on last element
    scrollBottom($("#scannedItemsDiv"));
}

/**
 * Used for rendering voided item/product.
 */
function displayVoidedItem(itemData, tx) {
    // remove first tempQtyDiv if exists before rendering scanned item
    removeDisplayedQuantity();

    uilog(itemData);
    var voidedDiv = $("<div></div>").addClass("pro-scanned");
    var ul = $("<ul></ul>").addClass("void");
    var li_Void = $("<li></li>").css({ 'width': '150px' }).html(getMsgValue("pos_receipt_void_label"));
    var li_Qty = $("<li></li>").css({ 'width': '210px' }).html(itemData.qty + ((itemData.categoryId == 'DEPTSTORE') ? '@ ' : 'X ') + itemData.unitPrice);
    var li_Desc = $("<li></li>").addClass("pro-label").html(((itemData.categoryId == 'DEPTSTORE') ? itemData.barcode.substring(1, 5) + ',' + itemData.barcode.substring(5, 7) + ',' : '') + itemData.shortDesc);
    var li_Price = $("<li></li>").addClass("pro-price").html(itemData.itemTotal);
    var li_minus = $("<li></li>").addClass("voided-sign").html(displayNegativeSign(tx, itemData.isVoided));
    var li_tax = $("<li></li>").addClass("tax-sign").html(displayTaxSign(itemData.isTaxInclusive));

    ul.append(li_Void);
    ul.append(li_Qty);

    //GiftCard Item
    if (itemData && itemData.giftCardNumber) {
        var li_GiftCard = $("<li></li>").css({ 'width': '210px' })
            .html(getMsgValue('pos_receipt_giftcard_number_label') +
                maskValueWithX(itemData.giftCardNumber, 11, 'LAST'));
        ul.append(li_GiftCard);
    }

    ul.append(li_Desc);
    ul.append(li_Price);
    ul.append(li_minus);
    ul.append(li_tax);

    //will enter this statement if item has voided discount.

    // DEPTSTORE
    if (itemData.categoryId == 'DEPTSTORE' || itemData.categoryId == 'DIRECTP') {
        if (itemData.discMarkdown && itemData.discMarkdown > 0)
            displayDiscount(ul, Math.round(itemData.qty * parseInt(itemData.discMarkdown)), null, getMsgValue("pos_receipt_discount"), true);

        for (var p in itemData.discAmount) {
            displayDiscount(ul, Math.round(itemData.qty * parseInt(itemData.discAmount[p])), null,
                getMsgValue("pos_receipt_discount") + ((parseFloat(itemData.discPrice[p]) <= 1) ? parseInt(itemData.discPrice[p] * 100) + '%' : 'Rp'), true);
        }

        // INHOUSE VOUCHER 2017-04-13
        if (itemData.discVoucher && itemData.discVoucher.length > 0) {
            for (var v in itemData.discVoucher) {
                displayDiscount(ul, parseInt(itemData.discVoucher[v]), '-',
                    getMsgValue("pos_receipt_discount") + 'Voucher #' + itemData.discVoucherBarcode[v]);
            }
        }
        // INHOUSE VOUCHER 2017-04-13
    } else if (itemData.voidedDiscount && itemData.voidedDiscount > 0) {
        displayDiscount(ul, itemData.voidedDiscount, null, getMsgValue("pos_receipt_discount"));
    }

    if (itemData.voidedCrmMemberDiscountAmount && itemData.voidedCrmMemberDiscountAmount > 0) {
        displayDiscount(ul, itemData.voidedCrmMemberDiscountAmount, null, getMsgValue("pos_receipt_crm_discount"));
    }

    if (itemData.voidedMemDiscount && itemData.voidedMemDiscount > 0) {
        displayDiscount(ul, itemData.voidedMemDiscount, null, itemData.cmcDiscountLabel, true);
    }

    voidedDiv.append(ul);
    $("#scannedItemsDiv").append(voidedDiv);
    // focus on last element
    scrollBottom($("#scannedItemsDiv"));
}

function displayTransactionType(type) {
    if (type && type != CONSTANTS.TX_TYPES.SALE.name) {
        var txTypeDiv = $("<div></div>").attr("id", type).addClass("pro-scanned");
        var p = $("<p></p>").addClass("tx-type");

        removeDisplayedQuantity();

        p.append(type);
        //p.append(" SALE");

        txTypeDiv.append(p);
        // Clearing before adding
        $("#scannedItemsDiv").empty();
        $("#scannedItemsDiv").append(txTypeDiv);

        // focus on last element
        scrollBottom($("#scannedItemsDiv"));
    } else {
        $("div#scannedItemsDiv div[id*=RETURN]").last().remove();
        $("div#scannedItemsDiv div[id*=REFUND]").last().remove();
        $("div#scannedItemsDiv div[id*=PICKUP]").last().remove();
        $("div#scannedItemsDiv div[id*=FLOAT]").last().remove();
    }
}

function removeScannedItem(productId) {
    $("div#scannedItemsDiv div[id*=" + productId + "]").last().remove();
}

/**
 * Method invoked when CLEAR button is clicked.
 * if disableClrFn is FALSE it will clear respectively.
 * 	1. Input Display
 *  2. Multiplier
 *  3. Mode
 *
 *  otherwise if TRUE will ignore clear.
 *
 * @param disableClrFn
 */
function clearTrigger(disableClrFn) {
    var inputDisplay = $("#inputDisplay").val();
    // renderCustomerInfo("","");
    if (!crmToggleMembershipRenewal) {
        console.log("crmToggleMembershipRenewal 2");
        isRenewMembershipSelected = false;
        isMembershipToBeRenewed = false;
    }

    if (!saleTx.orderItems || !hasScannedItem(saleTx)) {
        renderCustomerInfo("", "");
    }

    if (!disableClrFn) {
        var lastQTY = $("div#scannedItemsDiv div[id*=tempQtyDiv]").val();
        //will proceed clearing receipt items if inputDisplay is empty.
        if (!inputDisplay) {
            //will clear lastQTY if not empty.
            if (!lastQTY && (lastQTY == '' || lastQTY == "")) {
                $("div#scannedItemsDiv div[id*=tempQtyDiv]").last().remove();
                //reset default item multiplier to 1.
                itemQty = 1;
            } else if (!isCustomerView && isInstallmentTransaction) {
                //clear installment
                refreshInstallment();
                promptSysMsg();
            } else if (kidcityEnable) {
                //clear discount off/on display
                kidcityEnable = false;
                kidcityEnableStatus = null;
                promptSysMsg();
            }else if (!isCustomerView && !(enableCoBrand) && coBrandDiscountStatus && scannedItemOrder == -1) {
                //clear discount off/on display
                coBrandDiscountStatus = null;
                saleTx.coBrandNumber = null;
                eftTransactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE.name;
                enableCoBrand = true;
                promptSysMsg();
            } else if (!isCustomerView) {
                if (!saleTx) {
                    clearOrder();
                    createOrder();
                } else if (profCust && !jQuery.isEmptyObject(profCust)) {
                    if (!saleTx.orderItems || !hasScannedItem(saleTx)) {
                        suppressPrinting = false;
                        profCust = {};
                        isRevisedTxn = false;
                        renderCustomerInfo();
                    } else if (isRevisedTxn) {
                        isRevisedTxn = false;
                    }
                } else if (isProCustScan) {
                    isProCustScan = false;
                } else if (toggleTVS && jQuery.isEmptyObject(tVSProductPriceOverrideMap)) {
                    clearTVS();
                } else if ( // If Goods transaction, meaning ORDER-ITEMS is utilized for transaction entries
                    (!CONSTANTS.NON_GOODS_TX_TYPES.findTxTypeByName(saleTx.type) &&
                        (!saleTx.orderItems || !hasScannedItem(saleTx)))
                    // If Non Goods transaction, meaning PAYMENTS utilized for transaction entries
                    ||
                    (CONSTANTS.NON_GOODS_TX_TYPES.findTxTypeByName(saleTx.type) &&
                        (!saleTx.payments || saleTx.payments && saleTx.payments.length == 0)) &&
                    (!isConfirmBtnClicked || !isAuthFormBtnClicked)) {

                    if (crmEarnPointsSelected) {
                        crmEarnPointsSelected = false;
                        customerIdForReward = null;
                        saleTx.customerId = null;
                    }

                    // Reverting the transaction type to NORMAL SALE.
                    saleTx.type = CONSTANTS.TX_TYPES.SALE.name;
                    // Clearing RETURN Transaction lookup
                    RETURN_REFUND.return.service.clearBaseTransactionDetails();
                    displayTransactionType(saleTx.type);
                    CustomerPopupScreen.cus_renderTransactionType(saleTx.type);
                }

                //reset flags and values for normal sale.
                if (togglePostVoid || toggleRecallSale) {
                    togglePostVoid = false;
                    toggleRecallSale = false;
                    // Terminates the flow
                    FUNCTION_FLOW.FLOW_HANDLER.terminateFlow();
                }
                toggleVoid = false;
                toggleCancelSale = false;
                if (toggleTempOff) {
                    toggleTempOff = false;
                }

                if (isGcMmsActivation) {
                    isGcMmsActivation = false;
                }

                if (!customerIdForReward) {
                    toggleEmpCard = false;
                    toggleLoyaltyCard = false;
                }
                if (specialOrder) { // RAHMAT SPO
                    specialOrder = false;
                    specialOrderType = "";
                    tmpSpcOrder = "";
                }
                /*if(saleGameItemTrk || redeemPointTrk){	
                	saleGameItemTrk = false;
                	redeemPointTrk = false;
                }*/
                if (loyVIPThemeParkSelected || saleTx.isVIPThemePark) {
                    delete saleTx.isVIPThemePark;
                    loyVIPThemeParkSelected = false;
                    var i = profitCodes.indexOf(getConfigValue("THEME_PARK_PROMO_CODE"));
                    profitCodes.splice(i, 1);
                }
                //untoggle MODE buttons.
                toggleFNButton("fnCancelSale", false);
                toggleFNButton("fnVoid", false);

                if (toggleTVS) {
                    promptSysMsg(" ", "OPEN PRICE ACTIVATED");
                } else {
                    //clear System Message.
                    isRenewMembershipSelected = false;
                    isMembershipToBeRenewed = false;
                    if (crmEarnPointsSelected && saleTx.customerId)
                        promptSysMsg(getMsgValue('pos_label_member_id_is_active'), getMsgValue('pos_label_reward_points'));
                    else promptSysMsg();
                }
            }
        }
    } else {
        var isInstallmentProcessed = isInstallmentTransaction && (installmentPaymentDetails != null);
        if (isInstallmentTransaction && !isInstallmentProcessed && !inputDisplay) {
            refreshInstallment();
            restoreSysMsg();
            enablePaymentMedia = true;
        } else if (!isCustomerView && toggleCRMPoints && !customerIdForReward) {
            //			toggleCRMPoints = false;
            restoreSysMsg();
        }
    }

    //clear currentPaymentMediaType
    currentPaymentMediaType = null;

    if (crmRedeemPointsSelected && !customerIdForReward) {
        enablePaymentMedia = true;
        crmRedeemPointsSelected = false;
    }
}

/**
 * Used for rendering order subtotal and total quantity.
 * @param totalAmount
 * @param totalQuantity
 * @param totalDiscount
 */
function displayTotals(totalAmount, totalQuantity, totalDiscount) {
    $("#subtotal").html(totalAmount);
    $("#totalQuantity").html(totalQuantity);
    $("#totalDiscount").html(totalDiscount);
}

/**
 * Displays sign/symbol for items rendered if (-) voided return or refund tx's.
 * @param type
 * @param isItemVoided
 * @returns {String}
 */
function displayNegativeSign(tx, isItemVoided) {
    var sign = " ";
    if (isNegativeSign(tx, isItemVoided)) {
        sign = "-";
    }
    return sign;
}

/**
 * Checks whether provided arguments are valid
 * for negative entries or not
 */
function isNegativeSign(tx, isItemVoided) {
    var numBoolean = 1; // default positive
    if (tx) {
        var isVoidedSale = (tx.type == CONSTANTS.TX_TYPES.SALE_VOID.name) &&
            tx.baseTransactionType;
        var originalTxType = (isVoidedSale)
            // Voided Sale's -> Original Transaction Type
            ?
            tx.baseTransactionType
            // Normal Sale Transaction Type
            :
            tx.type;
        var deductionFullTxTypes = [
            CONSTANTS.TX_TYPES.REFUND.name,
            CONSTANTS.TX_TYPES.RETURN.name,
        ];
        var isDeductionFullTxTypes = $.inArray(originalTxType, deductionFullTxTypes) >= 0;
        var isCancelledSale = (tx.status == CONSTANTS.STATUS.CANCELLED);
        /*
         * Replicating the negation multiplication
         */
        if (isVoidedSale) {
            numBoolean *= -1;
        }
        if (isDeductionFullTxTypes) {
            numBoolean *= -1;
        }
        if (isItemVoided === undefined &&
            isCancelledSale) {
            numBoolean *= -1;
        }
        if (isItemVoided) {
            numBoolean *= -1;
        }
    }
    return (tx &&
        numBoolean < 0);
}

function displayTaxSign(isTaxInclusive) {
    var tax_symbol = "  ";
    if (isTaxInclusive) {
        tax_symbol = " *";
    }
    return tax_symbol;
}

function displayPaymentInfo(data) {
    var isOneLine = false;
    // remove first tempQtyDiv if exists to avoid duplicate
    removeDisplayedQuantity();
    refreshPaymentView();
    var hasMemberDiscReversal = (data.clonedSaleTx.memberDiscReversal && data.clonedSaleTx.memberDiscReversal > 0);
    /*
     * NOTE: data.finalSubTotalAmount is the final subtotal all deduction
     * included e.g rounding amount. Amounts that need to be added/removed for
     * the payment breakdown purposes must be place here.
     */
    var subTotalVal = data.finalSubTotalAmount;

    if (data.clonedSaleTx.cpnIntAmount)
        subTotalVal += data.clonedSaleTx.cpnIntAmount;
    if (data.clonedSaleTx.roundingAmount)
        subTotalVal -= data.clonedSaleTx.roundingAmount;
    if (hasMemberDiscReversal)
        subTotalVal -= data.clonedSaleTx.memberDiscReversal;

    if (data.totalNonMemberMarkup && (data.clonedSaleTx.type == CONSTANTS.TX_TYPES.SALE_VOID.name ||
            data.clonedSaleTx.type == CONSTANTS.TX_TYPES.SALE.name ||
            data.clonedSaleTx.type == CONSTANTS.TX_TYPES.RETURN.name)) {
        $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine,
            getMsgValue(Hypercash.service.getMarkUpLabel(data.memberType)),
            numberWithCommas(Math.round(data.totalNonMemberMarkup)),
            displayNegativeSign(data.clonedSaleTx)));
    }

    //@MDR
    if (data.totalMdrSurcharge && (data.clonedSaleTx.type == CONSTANTS.TX_TYPES.SALE_VOID.name ||
            data.clonedSaleTx.type == CONSTANTS.TX_TYPES.SALE.name)) {
        $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine,
            getMsgValue('pos_receipt_mdr_surcharge_label'),
            numberWithCommas(Math.abs(data.totalMdrSurcharge)),
            displayNegativeSign(data.clonedSaleTx)));
    }

    var subTotalAmountDisplayText = numberWithCommas(Math.abs(subTotalVal));
    $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine,
        getMsgValue('pos_receipt_subtotal_label'),
        subTotalAmountDisplayText,
        displayNegativeSign(data.clonedSaleTx)));
    $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, '', lineSeparator1));
    $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine,
        getMsgValue('pos_receipt_total_label'),
        subTotalAmountDisplayText,
        displayNegativeSign(data.clonedSaleTx)));

    if (data.clonedSaleTx.status == CONSTANTS.STATUS.CANCELLED) {

        var txType = (data.clonedSaleTx.type == CONSTANTS.TX_TYPES.BILL_PAYMENT.name) ? CONSTANTS.TX_TYPES.BILL_PAYMENT.typeLabel : data.clonedSaleTx.type;

        //payment type details
        COMMON_DISPLAY.displayPaymentMediaSummary($("#scannedItemsDiv"), data.paymentMediaSummary, data.clonedSaleTx);

        //Number of item scanned items
        displayNumberOfItemScanned(data);

        //bill payment info
        displayBillPaymentInfo(data);

        displayCancelSale(txType);
        //Tax Compututed Details
        displayTaxBreakDown(data.taxBreakdown, data.clonedSaleTx);


    } else if (data.clonedSaleTx.type == CONSTANTS.TX_TYPES.SALE.name || data.clonedSaleTx.type == CONSTANTS.TX_TYPES.BILL_PAYMENT.name) {

        if (hasMemberDiscReversal) {
            var memDiscRevTotalAmount = subTotalVal + data.clonedSaleTx.memberDiscReversal;
            $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, data.cancelCmcLabel, numberWithCommas(data.clonedSaleTx.memberDiscReversal)));
            $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, '', lineSeparator1));
            $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('pos_receipt_total_label'), numberWithCommas(memDiscRevTotalAmount)));
            subTotalVal += data.clonedSaleTx.memberDiscReversal;
        }
        if (data.clonedSaleTx.cpnIntAmount) {
            $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('pos_receipt_cpn_int_amount_label'), numberWithCommas(data.clonedSaleTx.cpnIntAmount), "-"));
            $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, '', lineSeparator1));
            $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, "  " + getMsgValue('pos_receipt_balance_due_label'), numberWithCommas(subTotalVal - data.clonedSaleTx.cpnIntAmount)));
            subTotalVal -= data.clonedSaleTx.cpnIntAmount;
        }
        if (data.clonedSaleTx.roundingAmount) {
            var reverseRoundAmt = data.clonedSaleTx.roundingAmount < 0 ? numberWithCommas(data.clonedSaleTx.roundingAmount * -1) + "-" : numberWithCommas(data.clonedSaleTx.roundingAmount);
            var roundingLbl;

            if (data.roundingType == "SIMPLE_ROUNDING")
                roundingLbl = "pos_receipt_simple_rounding_label";
            else if (data.roundingType == "ROUND_UP")
                roundingLbl = "pos_receipt_round_up_label";
            else if (data.roundingType == "ROUND_DOWN")
                roundingLbl = "pos_receipt_round_down_label";

            $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue(roundingLbl), reverseRoundAmt));
            $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, '', lineSeparator1));
            $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, "  " + getMsgValue('pos_receipt_balance_due_label'), numberWithCommas(subTotalVal + data.clonedSaleTx.roundingAmount)));
            subTotalVal += data.clonedSaleTx.roundingAmount;
        }

        //payment type details
        COMMON_DISPLAY.displayPaymentMediaSummary($("#scannedItemsDiv"), data.paymentMediaSummary, data.clonedSaleTx);

        if (data.clonedSaleTx.donationAmount) {
            $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('pos_receipt_donation_label'), numberWithCommas(data.clonedSaleTx.donationAmount)));
        }
        if (data.clonedSaleTx.totalChange != 0) {
            $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('pos_receipt_change_label'), numberWithCommas(data.clonedSaleTx.totalChange)));
        }

        //Number of item scanned items
        displayNumberOfItemScanned(data);

        //bill payment info
        displayBillPaymentInfo(data);

        //Hot Spice table number
        HOTSPICE_MODULE.print.printTableNumberInScreen(data.hotSpiceTableNumber);

        //Tax Compututed Details
        displayTaxBreakDown(data.taxBreakdown, data.clonedSaleTx);

        //GiftCard Details
        displayGiftCardReceipt(data);

        //EFT Online Details -- commented might be used for future feature
        //displayEftOnlineReceipt(data);
    } else if (data.clonedSaleTx.type == CONSTANTS.TX_TYPES.RETURN.name ||
        data.clonedSaleTx.type == CONSTANTS.TX_TYPES.REFUND.name) {

        //payment type details
        COMMON_DISPLAY.displayPaymentMediaSummary($("#scannedItemsDiv"), data.paymentMediaSummary, data.clonedSaleTx);

        //Number of item scanned items
        displayNumberOfItemScanned(data);

        //Tax Compututed Details
        displayTaxBreakDown(data.taxBreakdown, data.clonedSaleTx);
    }
    scrollBottom($("#scannedItemsDiv"));
}

/**
 * Function
 * @param data
 */
function displayGiftCardReceipt(data) {
    var gcItems = data.gcItems;
    var isOneLine = true;
    if (gcItems && gcItems.length) {
        $("#scannedItemsDiv").append(payInfoLine(isOneLine, getMsgValue('pos_receipt_giftcard_activation_label')));
        $.each(gcItems, function(index, gcItem) {
            $("#scannedItemsDiv").append(payInfoLine(isOneLine, getMsgValue('pos_receipt_giftcard_card_type_label'),
                gcItem.gcInfo.cardType));
            $("#scannedItemsDiv").append(payInfoLine(isOneLine, getMsgValue('pos_receipt_giftcard_act_number_label'),
                //hotfix 2-12-2014
                maskValueWithX(((typeof gcItem.gcTx.cardNumber == 'undefined') ? gcItem.gcInfo.cardNumber : gcItem.gcTx.cardNumber), 11, 'LAST')));
            $("#scannedItemsDiv").append(payInfoLine(isOneLine, getMsgValue('pos_receipt_giftcard_transaction_type_label'),
                gcItem.baseRequestType));
            //$("#scannedItemsDiv").append(payInfoLine(isOneLine, getMsgValue('pos_receipt_giftcard_date_time_label'),
            //		formatGCTransactionDateRendered(gcItem.gcTx.transactionDate)));
            $("#scannedItemsDiv").append(payInfoLine(isOneLine, getMsgValue('pos_receipt_giftcard_prev_balance_label'),
                "Rp" + numberWithCommas(gcItem.gcTx.previousBalance)));
            $("#scannedItemsDiv").append(payInfoLine(isOneLine, getMsgValue('pos_receipt_giftcard_top_up_amount_label'),
                "Rp" + numberWithCommas(gcItem.gcTx.amount)));
            $("#scannedItemsDiv").append(payInfoLine(isOneLine, getMsgValue('pos_receipt_giftcard_balance_label'),
                "Rp" + numberWithCommas(gcItem.gcTx.balance)));
            $("#scannedItemsDiv").append(payInfoLine(isOneLine, getMsgValue('pos_receipt_giftcard_expiry_label'),
                formatGiftCardDate(gcItem.gcTx.expireDate)));
            $("#scannedItemsDiv").append("<br />");
        });
        $("#scannedItemsDiv").append(payInfoLine(false, getMsgValue('pos_receipt_total_label'),
            numberWithCommas(data.clonedSaleTx.totalAmount),
            displayNegativeSign(data.clonedSaleTx)));
    }

    //	GC MMS
    if (GIFTCARDMMSObject && GIFTCARDMMSObject.giftCardMMSTxnArray.length) {

        $("#scannedItemsDiv").append(payInfoLine(isOneLine, getMsgValue('pos_receipt_giftcard_mms_activation_label')));

        var gcMmsItems = GIFTCARDMMSObject.giftCardMMSTxnArray;
        $.each(GIFTCARDMMSObject.giftCardMMSTxnArray, function(index, gcMmsItems) {

            var scannedDiv = $("<div></div>").attr("id", "tax-breakdown").addClass("pro-scanned");
            var ul = $("<ul></ul>").addClass("scan");

            ul.append($("<li></li>").addClass("pro-label").html(getMsgValue('pos_receipt_giftcard_card_type_label')));
            ul.append($("<li></li>").addClass("pro-price").html(gcMmsItems.gcInfo.cardType));
            ul.append($("<li></li>").addClass("pro-label").html(getMsgValue('pos_receipt_giftcard_act_number_label')));
            ul.append($("<li></li>").addClass("pro-price").html(maskValueWithX(gcMmsItems.gcTx.cardNumber, 3, 'LAST')));
            ul.append($("<li></li>").addClass("pro-label").html(getMsgValue('pos_receipt_giftcard_transaction_type_label')));
            ul.append($("<li></li>").addClass("pro-price").html(CONSTANTS.FUNCTIONS.getGCRequestTypeNameByCode(gcMmsItems.gcTx.requestType)));
            ul.append($("<li></li>").addClass("pro-label").html(getMsgValue('pos_receipt_giftcard_prev_balance_label')));
            ul.append($("<li></li>").addClass("pro-price").html(numberWithCommas(gcMmsItems.gcTx.previousBalance)));
            ul.append($("<li></li>").addClass("pro-label").html(getMsgValue('pos_receipt_giftcard_top_up_amount_label')));
            ul.append($("<li></li>").addClass("pro-price").html(numberWithCommas(gcMmsItems.gcTx.amount)));
            ul.append($("<li></li>").addClass("pro-label").html(getMsgValue('pos_receipt_giftcard_balance_label')));
            ul.append($("<li></li>").addClass("pro-price").html(numberWithCommas(gcMmsItems.gcTx.balance)));
            ul.append($("<li></li>").addClass("pro-label").html(getMsgValue('pos_receipt_giftcard_expiry_label')));
            ul.append($("<li></li>").addClass("pro-price").html(formatGiftCardDate(gcMmsItems.gcTx.expireDate)));

            scannedDiv.append(ul);

            $("#scannedItemsDiv").append(scannedDiv);

        });
    }
}

/**
 * Function to display eft online payment
 * @param data
 * @returns
 */
function displayEftOnlineReceipt(data) {
    var payments = data.clonedSaleTx.payments;
    $.each(payments, function(index, payment) {
        if (data.enableEftRendering && data.enableEftRendering == 'true' && payment.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name) {
            $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html("<hr/>"));

            $("#scannedItemsDiv").append($("<div></div>").addClass("pro-header").html(payment.eftData.bankName));
            $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html("<br/>"));

            $("#scannedItemsDiv").append(renderEFTOnlineLineItem(getMsgValue('pos_receipt_eft_terminal_id'), maskValueWithX(payment.eftData.terminalId, 4, 'BEGIN')));
            $("#scannedItemsDiv").append(renderEFTOnlineLineItem(getMsgValue('pos_receipt_eft_merchant_id'), maskValueWithX(payment.eftData.merchantId, 10, 'BEGIN')));
            $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html("<br/>"));

            $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html(getMsgValue('pos_receipt_eft_card_type') + getCardType(payment.eftData.cardNum, data.creditCardTypes)));
            $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").css({ 'font-weight': 'bold' }).html(payment.eftData.cardNum));
            $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html(payment.eftData.cardHolder));
            $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html("<br/>"));

            $("#scannedItemsDiv").append(renderEFTOnlineLineItem(getDescriptionFromEnumByCode(payment.eftData.transactionCode, 'EFT_TX_CD'), getMsgValue('pos_receipt_eft_exp_card') + payment.eftData.expCard));
            $("#scannedItemsDiv").append(renderEFTOnlineLineItem(getMsgValue('pos_receipt_eft_date') + payment.eftData.transactionDate, getMsgValue('pos_receipt_eft_time') + payment.eftData.transactionTime));
            $("#scannedItemsDiv").append(renderEFTOnlineLineItem(getMsgValue('pos_receipt_eft_batch') + payment.eftData.batchNum, getMsgValue('pos_receipt_eft_trace') + payment.eftData.traceNum));
            $("#scannedItemsDiv").append(renderEFTOnlineLineItem(getMsgValue('pos_receipt_eft_rref') + payment.eftData.referenceCode, getMsgValue('pos_receipt_eft_approval') + payment.eftData.approvalCode));
            $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html("<br/>"));

            $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html(getMsgValue('pos_receipt_eft_appl_id') + payment.eftData.applId));
            $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html(getMsgValue('pos_receipt_eft_appl_name') + payment.eftData.applName));
            $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html(getMsgValue('pos_receipt_eft_appl_crypt') + payment.eftData.applCrypt));
            $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html(getMsgValue('pos_receipt_eft_tvr') + payment.eftData.tvr));
            $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html("<br/>"));

            $("#scannedItemsDiv").append(renderEFTOnlineLineItem(getMsgValue('pos_receipt_eft_amount'), getMsgValue('pos_receipt_eft_currency') + payment.eftData.transactionAmount));
            $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html("<hr/>"));
        }
    });
}

/**
 * Function to display the number of items scanned
 * @param data
 */
function displayNumberOfItemScanned(data) {
    var isOneLine = false;
    var isSaleCancelled = (data.clonedSaleTx.status == CONSTANTS.STATUS.CANCELLED);
    /*
     * Gets the appropriate label for the current transaction type.
     *
     * pos_receipt_qty_sale_label       =QUANTITY PURCHASED:
     * pos_receipt_qty_sale_voided_label=QUANTITY VOIDED:
     * pos_receipt_qty_cancel_sale_label=QUANTITY CANCELLED:
     * pos_receipt_qty_return_label     =QUANTITY RETURNED:
     * pos_receipt_qty_refund_label     =QUANTITY REFUNDED:
     */
    if (data.totalItemQty) {
        $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine,
            COMMON_DISPLAY.getTxTypesMsgPropValue(
                (isSaleCancelled) ? CONSTANTS.TX_TYPES.CANCEL_SALE.name : data.clonedSaleTx.type,
                CONSTANTS.TX_TYPES.KEY_MESSAGES_PROP_QTY_FORMAT
            ),
            data.totalItemQty));
    }

    if (data.clonedSaleTx.type == CONSTANTS.TX_TYPES.SALE.name) {
        if (data.pointReward && data.pointReward.type == "SUCCESS") {
            console.log("test : data.pointReward");
            $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('pos_receipt_membership_id_label'), data.pointReward.accountNumber));
            if (data.pointReward.callingAction == "EARN" || data.pointReward.callingAction == "PURCHASE") {
                $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('pos_receipt_earned_pts_label'), data.pointReward.earnedPoints));
            }
            var balPoint = data.pointReward.totalPoints;
            if (parseFloat(saleTx.pppTotalPoint) > 0 && saleTx.pppTotalPoint !== null && saleTx.pppTotalPoint !== undefined) {
                $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, 'USED PTS', parseFloat(saleTx.pppTotalPoint)));
                balPoint -= parseFloat(saleTx.pppTotalPoint);
            }
            if (data.pointReward.wsAddress != null) {
                if (data.pointReward.wsAddress != "CRM-PROXY") {
                    $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('pos_receipt_total_pts_label'), balPoint));
                }
            } else {
                $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('pos_receipt_total_pts_label'), balPoint));
            }
        } else if (data.infoLoyaltyProgram && data.infoLoyaltyProgram.length > 0) {
            console.log("1masuk ke kondisi data.infoLoyaltyProgram : " + data.infoLoyaltyProgram);
            console.log(data.infoLoyaltyProgram);
            if (typeof data.infoLoyaltyProgram !== 'undefined') {
                $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('member_name_loyalty'), data.infoLoyaltyProgram.memberName));
                $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('handphone_number_loyalty'), data.infoLoyaltyProgram.hpNumber));
                var balPoint = data.infoLoyaltyProgram.balancePoint;
                if (typeof data.infoLoyaltyProgram.earnedPoint !== 'undefined') {
                    $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('pos_receipt_prev_pts_label'), data.infoLoyaltyProgram.beginningPoints));
                    $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('pos_receipt_earned_pts_label'), data.infoLoyaltyProgram.earnedPoint + ""));
                    if (parseFloat(saleTx.pppTotalPoint) > 0 && saleTx.pppTotalPoint !== null && saleTx.pppTotalPoint !== undefined) {
                        $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, 'USED PTS', parseFloat(saleTx.pppTotalPoint)));
                        balPoint -= parseFloat(saleTx.pppTotalPoint);
                    }
                }
                $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('pos_receipt_total_pts_label'), balPoint));
            }
        } else if (data.isHcEnabled && data.hcMemberId) {
            saveFlag = false;
            $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('pos_receipt_membership_id_label'), data.hcMemberId));
        }
    }

    var fontCss = {
        bold: true,
        large: true
    };

    if (data.memberDiscReversal == 0 && data.totalCmcDisc != "0") {
        $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine,
            data.totalCmcDiscLabel,
            data.totalCmcDisc,
            displayNegativeSign(data.clonedSaleTx),
            null,
            fontCss));
    }

    if ((data.clonedSaleTx.type == CONSTANTS.TX_TYPES.SALE_VOID.name ||
            data.clonedSaleTx.type == CONSTANTS.TX_TYPES.SALE.name) &&
        data.totalDiscount &&
        data.totalDiscount != "0") {
        fontCss.large = false;
        $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine,
            data.totalDiscountLabel,
            data.totalDiscount,
            displayNegativeSign(data.clonedSaleTx),
            null,
            fontCss));
    }
}

function displayScreenReceiptFooter(data, pointReward) {


    // TERMINAL DETAILS
    // ST: 11011 RG: 1 CH: 2
    // TR: 110110010000104
    // Time: 11:02:21  PHT Date: 08/11/2013
    $("#scannedItemsDiv").append(printLineItemCenter('ST: ' + data.storeCd + ' RG: ' + data.terminalNum + ' CH: ' + data.userId));
    $("#scannedItemsDiv").append(printLineItemCenter('TR: ' + data.transactionId));
    $("#scannedItemsDiv").append(printLineItemCenter(data.transactionDate));

    scrollBottom($("#scannedItemsDiv"));
}

function displayTaxBreakDown(taxBreakdown, tx) {
    var scannedDiv = $("<div></div>").attr("id", "tax-breakdown").addClass("pro-scanned");
    var ul = $("<ul></ul>").addClass("scan");

    if (taxBreakdown && (tx.vat > 0 || tx.tariff > 0)) {
        ul.append($("<li></li>").addClass("pro-label").html(getMsgValue('pos_receipt_tax_breakdown_tarif_label')));
        ul.append($("<li></li>").addClass("pro-price").html(taxBreakdown.taxRate));
        // No Sign
        ul.append($("<li></li>").addClass("voided-sign").html(""));

        ul.append($("<li></li>").addClass("pro-label").html(getMsgValue('pos_receipt_tax_breakdown_dpp_label')));
        ul.append($("<li></li>").addClass("pro-price").html(taxBreakdown.taxDPP));
        ul.append($("<li></li>").addClass("voided-sign").html(displayNegativeSign(tx)));

        ul.append($("<li></li>").addClass("pro-label").html(getMsgValue('pos_receipt_tax_breakdown_ppn_label')));
        ul.append($("<li></li>").addClass("pro-price").html(taxBreakdown.taxAmount));
        ul.append($("<li></li>").addClass("voided-sign").html(displayNegativeSign(tx)));

        scannedDiv.append(ul);

        $("#scannedItemsDiv").append(scannedDiv);
    }
}

/**
 * Render topup info in the screen receipt.
 * @param data
 */
function displayTopUpInfo(data) {
    var isOneLine = false;
    if (data.hasHeaderLineSeparator)
        $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html(lineSeparator2));
    if (data.hasHeader) {
        var sign = (data.txData.saleType == CONSTANTS.TX_TYPES.RETURN.name ? "-" : "");
        $("#scannedItemsDiv").append(payInfoLine(isOneLine,
            data.receiptLbl.RECEIPT_TOPUP_TOTAL_LBL,
            numberWithCommas(data.txData.totalAmount),
            sign));
    }
    if (data.hasSummary) {
        $("#scannedItemsDiv").append("<br />");

        var refTxItem = data.txData.refTxItem;
        var item = data.txData.topUpItem;

        if (refTxItem)
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                refTxItem.shortDesc,
                numberWithCommas(refTxItem.priceUnit)));

        if (item.transactionType.toUpperCase() == "CHANGE") {
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                data.receiptLbl.RECEIPT_TOPUP_OLD_PHONE_NO_LBL,
                item.oldPhoneNum));
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                data.receiptLbl.RECEIPT_TOPUP_NEW_PHONE_NO_LBL,
                item.phoneNum));
        } else {
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                data.receiptLbl.RECEIPT_TOPUP_PHONE_NO_LBL,
                item.phoneNum));
        }

        $("#scannedItemsDiv").append(payInfoLine(isOneLine,
            data.receiptLbl.RECEIPT_TOPUP_ID_LBL,
            item.serverTrxId));
        $("#scannedItemsDiv").append(payInfoLine(isOneLine,
            data.receiptLbl.RECEIPT_TOPUP_TR_NO_LBL,
            item.partnerTrxId));

        if (item.vType)
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                data.receiptLbl.RECEIPT_TOPUP_VOUCHER_TYPE_LBL,
                item.vType));

        $("#scannedItemsDiv").append(payInfoLine(isOneLine,
            data.receiptLbl.RECEIPT_TOPUP_STATUS_CODE_LBL,
            item.resCode));
        $("#scannedItemsDiv").append(payInfoLine(isOneLine,
            data.receiptLbl.RECEIPT_TOPUP_STATUS_LBL,
            item.scrMessage));

        if (item.resMessage)
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                data.receiptLbl.RECEIPT_TOPUP_RES_MSG_LBL,
                item.resMessage));
    }
    if (data.hasFooter) {
        $("#scannedItemsDiv").append("<br />");
        $("#scannedItemsDiv").append($("<div></div>").attr("id", "topup-footer").addClass("pro-scanned").html(data.receiptLbl.RECEIPT_TOPUP_FOOTER_LBL));
    }
    if (data.hasFooterLineSeparator)
        $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html(lineSeparator2));

    scrollBottom($("#scannedItemsDiv"));
}

// function displayVoidTxn(data) {
//     var currency = "Rp";
//     var isOneLine = false;
//     // Displays the transactionType
//     displayTransactionType(data.clonedSaleTx.baseTransactionType);

//     var hasMemberDiscReversal = (data.baseTx.memberDiscReversal && data.baseTx.memberDiscReversal > 0);

//     /* 
//      * NOTE: data.finalSubTotalAmount is the final subtotal all deduction
//      * included e.g rounding amount. Amounts that need to be added/removed for
//      * the payment breakdown purposes must be place here. 
//      */
//     var subTotalVal = data.finalSubtotalTxAmount;

//     if (data.baseTx.cpnIntAmount)
//         subTotalVal += data.baseTx.cpnIntAmount;
//     if (data.baseTx.roundingAmount)
//         subTotalVal -= data.baseTx.roundingAmount;
//     if (hasMemberDiscReversal)
//         subTotalVal -= data.baseTx.memberDiscReversal;

//     var voidedAmountHeader = (isNegativeSign(data.clonedSaleTx)) ? subTotalVal * -1 : subTotalVal;

//     $("#scannedItemsDiv").append(printLineItemCenter(lineSeparator3));
//     $("#scannedItemsDiv").append(printLineItemCenter('POST SALE VOID'));
//     $("#scannedItemsDiv").append(printLineItemCenter('TERMINAL# ' + data.clonedSaleTx.terminalNum));
//     $("#scannedItemsDiv").append(printLineItemCenter('TRANS# ' + removeLeadingZeroes(data.baseTx.transactionId)));
//     $("#scannedItemsDiv").append(printLineItemCenter('* ' + numberWithCommas(voidedAmountHeader) + currency + ' *'));
//     $("#scannedItemsDiv").append(printLineItemCenter(lineSeparator3));

//     var voidTxDiv = $("<div></div>").addClass("pro-scanned");
//     var voidTxUL = $("<ul></ul>").addClass("void");
//     for (var i = 0; i < data.clonedSaleTx.orderItems.length; i++) {

//         var item = data.clonedSaleTx.orderItems[i];
//         var isItemVoided = item.isVoided;
//         var itemSubtotal = (item.weight && item.weight > 0) ? Math.round(item.priceSubtotal) : item.priceSubtotal;

//         voidTxUL.append((item.isVoided) ? $("<li></li>").addClass("pro-label").html(getMsgValue("pos_receipt_void_label")) : ""); // The VOID label
//         voidTxUL.append($("<li></li>").css({ 'width': '210px' }).html(numberWithCommas(item.quantity) + ((item.categoryId == 'DEPTSTORE') ? '@ ' : 'X ') + numberWithCommas(item.priceUnit)));
//         voidTxUL.append($("<li></li>").addClass("pro-label").html(((item.categoryId == 'DEPTSTORE') ? item.ean13Code.substring(1, 5) + ',' + item.ean13Code.substring(5, 7) + ',' : '') + item.shortDesc));
//         voidTxUL.append($("<li></li>").addClass("pro-price").html(numberWithCommas(itemSubtotal)));
//         voidTxUL.append($("<li></li>").addClass("voided-sign").html(displayNegativeSign(data.clonedSaleTx, item.isVoided)));
//         voidTxUL.append($("<li></li>").addClass("tax-sign").html(displayTaxSign(item.isTaxInclusive)));

//         var sign = displayNegativeSign(data.clonedSaleTx, !item.isVoided);

//         // DEPTSTORE
//         if (item.categoryId == 'DEPTSTORE' || item.categoryId == 'DIRECTP') {
//             if (item.discMarkdown && item.discMarkdown > 0)
//                 displayDiscount(voidTxUL, Math.round(item.quantity * parseInt(item.discMarkdown)), sign, getMsgValue("pos_receipt_discount"));

//             for (var p in item.discAmount) {
//                 displayDiscount(voidTxUL, Math.round(item.quantity * parseInt(item.discAmount[p])), sign,
//                     getMsgValue("pos_receipt_discount") + ((parseFloat(item.discPrice[p]) <= 1) ? parseInt(item.discPrice[p] * 100) + '%' : 'Amt Off'));
//             }

//             // INHOUSE VOUCHER 2017-04-13
//             if (item.discVoucher && item.discVoucher.length > 0) {
//                 for (var v in item.discVoucher) {
//                     displayDiscount(voidTxUL, parseInt(item.discVoucher[v]), sign,
//                         getMsgValue("pos_receipt_discount") + 'Voucher #' + item.discVoucherBarcode[v]);
//                 }
//             }
//             // INHOUSE VOUCHER 2017-04-13
//         } else if (item.discountAmount && item.discountAmount > 0) {
//             displayDiscount(voidTxUL, item.discountAmount, sign, getMsgValue("pos_receipt_discount"));
//         }

//         if (item.crmMemberDiscountAmount && item.crmMemberDiscountAmount > 0) {
//             displayDiscount(voidTxUL, item.crmMemberDiscountAmount, sign, getMsgValue("pos_receipt_crm_discount"));
//         }

//         if (item.memberDiscountAmount && item.memberDiscountAmount > 0) {
//             displayDiscount(voidTxUL, item.memberDiscountAmount, sign, data.cmcDiscountLabel, true);
//         }

//     }
//     voidTxDiv.append(voidTxUL);

//     $("#scannedItemsDiv").append(voidTxDiv);
//     displayPromotions(data.clonedSaleTx.promotionItems, CONSTANTS.TX_TYPES.SALE_VOID.name);

//     if (data.employeeDiscountTotal != 0) {
//         var empDiscData = {
//             amount: data.employeeDiscountTotal,
//             percentage: data.empDiscPerc,
//             type: CONSTANTS.TX_TYPES.SALE_VOID.name
//         };
//         displayEmployeeDiscount(empDiscData);
//     }

//     if (data.totalNonMemberMarkup) {
//         $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine,
//             getMsgValue(Hypercash.service.getMarkUpLabel(data.memberType)),
//             numberWithCommas(Math.round(data.totalNonMemberMarkup)),
//             displayNegativeSign(data.clonedSaleTx)));
//     }

//     $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine,
//         getMsgValue('pos_receipt_subtotal_label'),
//         numberWithCommas(subTotalVal),
//         displayNegativeSign(data.clonedSaleTx)));
//     $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, '', lineSeparator1));
//     $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine,
//         getMsgValue('pos_receipt_total_label'),
//         numberWithCommas(subTotalVal),
//         displayNegativeSign(data.clonedSaleTx)));

//     if (hasMemberDiscReversal) {
//         $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, data.cancelCmcLabel, numberWithCommas(data.baseTx.memberDiscReversal), "-"));
//         $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, '', lineSeparator1));
//         $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('pos_receipt_total_label'), numberWithCommas(subTotalVal + data.baseTx.memberDiscReversal), "-"));
//         subTotalVal += data.baseTx.memberDiscReversal;
//     }
//     if (data.baseTx.cpnIntAmount) {
//         $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('pos_receipt_cpn_int_amount_label'), numberWithCommas(data.baseTx.cpnIntAmount)));
//         $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, '', lineSeparator1));
//         $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, "  " + getMsgValue('pos_receipt_balance_due_label'), numberWithCommas(subTotalVal - data.baseTx.cpnIntAmount), "-"));
//         subTotalVal -= data.baseTx.cpnIntAmount;
//     }
//     if (data.baseTx.roundingAmount) {
//         var isRoundingAmtNegative = data.baseTx.roundingAmount < 0;
//         var reverseRoundAmt = isRoundingAmtNegative ? data.baseTx.roundingAmount * -1 : data.baseTx.roundingAmount;
//         var roundingLbl;

//         if (data.roundingType == "SIMPLE_ROUNDING")
//             roundingLbl = "pos_receipt_simple_rounding_label";
//         else if (data.roundingType == "ROUND_UP")
//             roundingLbl = "pos_receipt_round_up_label";
//         else if (data.roundingType == "ROUND_DOWN")
//             roundingLbl = "pos_receipt_round_down_label";

//         $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue(roundingLbl), numberWithCommas(reverseRoundAmt), isRoundingAmtNegative ? null : "-"));
//         $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, '', lineSeparator1));
//         $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, "  " + getMsgValue('pos_receipt_balance_due_label'), numberWithCommas(subTotalVal + data.baseTx.roundingAmount), "-"));
//         subTotalVal += data.baseTx.roundingAmount;
//     }
//     if (data.baseTx.donationAmount) {
//         $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('pos_receipt_donation_label'), numberWithCommas(Math.abs(data.baseTx.donationAmount)), "-"));
//     }

//     //Number of item scanned items
//     displayNumberOfItemScanned(data);

//     //Hot Spice table number
//     HOTSPICE_MODULE.print.printTableNumberInScreen(data.hotSpiceTableNumber);

//     //Tax Compututed Details
//     displayTaxBreakDown(data.clonedSaleTx.taxBreakdown, data.clonedSaleTx);

//     displayScreenReceiptFooter(data.clonedSaleTx);
//     scrollBottom($("#scannedItemsDiv"));

//     $("#subtotal").html(data.clonedSaleTx.subTotal);
//     $("#totalQuantity").html(data.clonedSaleTx.totalItemQty);
// }

/**
 * Render topup info in the screen receipt.
 * @param data
 */
function displayIndosmartInfo(data) {
    var isOneLine = false;
    if (data.hasHeaderLineSeparator)
        $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html(lineSeparator2));
    if (data.hasHeader) {
        var sign = (data.txData.saleType == CONSTANTS.TX_TYPES.RETURN.name ? "-" : "");
        $("#scannedItemsDiv").append(payInfoLine(isOneLine,
            data.receiptLbl.RECEIPT_INDOSMART_TOTAL_LBL,
            numberWithCommas(data.txData.totalAmount),
            sign));
    }
    if (data.hasSummary) {
        $("#scannedItemsDiv").append("<br />");

        var refTxItem = data.txData.refTxItem;
        var item = data.txData.indosmartItem;

        if (refTxItem)
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                refTxItem.shortDesc,
                numberWithCommas(refTxItem.priceUnit)));

        if (item.transactionType.toUpperCase() == "CHANGE") {
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                data.receiptLbl.RECEIPT_INDOSMART_OLD_PHONE_NO_LBL,
                item.oldPhoneNum));
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                data.receiptLbl.RECEIPT_INDOSMART_NEW_PHONE_NO_LBL,
                item.phoneNum));
        } else {
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                data.receiptLbl.RECEIPT_INDOSMART_PHONE_NO_LBL,
                item.phoneNum));
        }

        $("#scannedItemsDiv").append(payInfoLine(isOneLine,
            data.receiptLbl.RECEIPT_INDOSMART_ID_LBL,
            item.serverTrxId));
        $("#scannedItemsDiv").append(payInfoLine(isOneLine,
            data.receiptLbl.RECEIPT_INDOSMART_TR_NO_LBL,
            item.partnerTrxId));

        if (item.vType)
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                data.receiptLbl.RECEIPT_INDOSMART_VOUCHER_TYPE_LBL,
                item.vType));

        $("#scannedItemsDiv").append(payInfoLine(isOneLine,
            data.receiptLbl.RECEIPT_INDOSMART_STATUS_CODE_LBL,
            item.resCode));
        $("#scannedItemsDiv").append(payInfoLine(isOneLine,
            data.receiptLbl.RECEIPT_INDOSMART_STATUS_LBL,
            item.scrMessage));

        if (item.resMessage)
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                data.receiptLbl.RECEIPT_INDOSMART_RES_MSG_LBL,
                item.resMessage));
    }
    if (data.hasFooter) {
        $("#scannedItemsDiv").append("<br />");
        $("#scannedItemsDiv").append($("<div></div>").attr("id", "topup-footer").addClass("pro-scanned").html(data.receiptLbl.RECEIPT_INDOSMART_FOOTER_LBL));
    }
    if (data.hasFooterLineSeparator)
        $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html(lineSeparator2));

    scrollBottom($("#scannedItemsDiv"));
}

/**
 * Render topup info in the screen receipt.
 * @param data
 */
function displayMCashInfo(data) {
    var isOneLine = false;
    if (data.hasHeaderLineSeparator)
        $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html(lineSeparator2));
    if (data.hasHeader) {
        var sign = (data.txData.saleType == CONSTANTS.TX_TYPES.RETURN.name ? "-" : "");
        $("#scannedItemsDiv").append(payInfoLine(isOneLine,
            data.receiptLbl.RECEIPT_MCASH_TOTAL_LBL,
            numberWithCommas(data.txData.totalAmount),
            sign));
    }
    if (data.hasSummary) {
        $("#scannedItemsDiv").append("<br />");

        var refTxItem = data.txData.refTxItem;
        var item = data.txData.mCashItem;

        if (refTxItem)
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                refTxItem.shortDesc,
                numberWithCommas(refTxItem.priceUnit)));

        if (item.transactionType.toUpperCase() == "CHANGE") {
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                data.receiptLbl.RECEIPT_MCASH_OLD_PHONE_NO_LBL,
                item.oldPhoneNum));
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                data.receiptLbl.RECEIPT_MCASH_NEW_PHONE_NO_LBL,
                item.phoneNum));
        } else {
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                data.receiptLbl.RECEIPT_MCASH_PHONE_NO_LBL,
                item.phoneNum));
        }

        $("#scannedItemsDiv").append(payInfoLine(isOneLine,
            data.receiptLbl.RECEIPT_MCASH_ID_LBL,
            item.serverTrxId));
        $("#scannedItemsDiv").append(payInfoLine(isOneLine,
            data.receiptLbl.RECEIPT_MCASH_TR_NO_LBL,
            item.partnerTrxId));

        if (item.vType)
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                data.receiptLbl.RECEIPT_MCASH_VOUCHER_TYPE_LBL,
                item.vType));

        $("#scannedItemsDiv").append(payInfoLine(isOneLine,
            data.receiptLbl.RECEIPT_MCASH_STATUS_CODE_LBL,
            item.resCode));
        $("#scannedItemsDiv").append(payInfoLine(isOneLine,
            data.receiptLbl.RECEIPT_MCASH_STATUS_LBL,
            item.scrMessage));

        if (item.resMessage)
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                data.receiptLbl.RECEIPT_MCASH_RES_MSG_LBL,
                item.resMessage));
    }
    if (data.hasFooter) {
        $("#scannedItemsDiv").append("<br />");
        $("#scannedItemsDiv").append($("<div></div>").attr("id", "topup-footer").addClass("pro-scanned").html(data.receiptLbl.RECEIPT_MCASH_FOOTER_LBL));
    }
    if (data.hasFooterLineSeparator)
        $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html(lineSeparator2));

    scrollBottom($("#scannedItemsDiv"));
}

/**
 * Render topup info in the screen receipt.
 * @param data
 */
function displayAlterraInfo(data) {
    var isOneLine = false;
    if (data.hasHeaderLineSeparator)
        $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html(lineSeparator2));
    if (data.hasHeader) {
        var sign = (data.txData.saleType == CONSTANTS.TX_TYPES.RETURN.name ? "-" : "");
        $("#scannedItemsDiv").append(payInfoLine(isOneLine,
            data.receiptLbl.RECEIPT_ALTERRA_TOTAL_LBL,
            numberWithCommas(data.txData.totalAmount),
            sign));
    }
    if (data.hasSummary) {
        $("#scannedItemsDiv").append("<br />");

        var refTxItem = data.txData.refTxItem;
        var item = data.txData.alterraItem;

        if (refTxItem)
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                refTxItem.shortDesc,
                numberWithCommas(refTxItem.priceUnit)));

        if (item.transactionType.toUpperCase() == "CHANGE") {
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                data.receiptLbl.RECEIPT_ALTERRA_OLD_PHONE_NO_LBL,
                item.oldPhoneNum));
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                data.receiptLbl.RECEIPT_ALTERRA_NEW_PHONE_NO_LBL,
                item.phoneNum));
        } else {
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                data.receiptLbl.RECEIPT_ALTERRA_PHONE_NO_LBL,
                item.phoneNum));
        }

        $("#scannedItemsDiv").append(payInfoLine(isOneLine,
            data.receiptLbl.RECEIPT_ALTERRA_ID_LBL,
            item.serverTrxId));
        $("#scannedItemsDiv").append(payInfoLine(isOneLine,
            data.receiptLbl.RECEIPT_ALTERRA_TR_NO_LBL,
            item.partnerTrxId));

        if (item.vType)
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                data.receiptLbl.RECEIPT_ALTERRA_VOUCHER_TYPE_LBL,
                item.vType));

        $("#scannedItemsDiv").append(payInfoLine(isOneLine,
            data.receiptLbl.RECEIPT_ALTERRA_STATUS_CODE_LBL,
            item.resCode));
        $("#scannedItemsDiv").append(payInfoLine(isOneLine,
            data.receiptLbl.RECEIPT_ALTERRA_STATUS_LBL,
            item.scrMessage));

        if (item.resMessage)
            $("#scannedItemsDiv").append(payInfoLine(isOneLine,
                data.receiptLbl.RECEIPT_ALTERRA_RES_MSG_LBL,
                item.resMessage));
    }
    if (data.hasFooter) {
        $("#scannedItemsDiv").append("<br />");
        $("#scannedItemsDiv").append($("<div></div>").attr("id", "topup-footer").addClass("pro-scanned").html(data.receiptLbl.RECEIPT_ALTERRA_FOOTER_LBL));
    }
    if (data.hasFooterLineSeparator)
        $("#scannedItemsDiv").append($("<div></div>").addClass("pro-scanned").html(lineSeparator2));

    scrollBottom($("#scannedItemsDiv"));
}

function displayVoidTxn(data) {
    var currency = "Rp";
    var isOneLine = false;
    // Displays the transactionType
    displayTransactionType(data.clonedSaleTx.baseTransactionType);

    var hasMemberDiscReversal = (data.baseTx.memberDiscReversal && data.baseTx.memberDiscReversal > 0);

    /* 
     * NOTE: data.finalSubTotalAmount is the final subtotal all deduction
     * included e.g rounding amount. Amounts that need to be added/removed for
     * the payment breakdown purposes must be place here. 
     */
    var subTotalVal = data.finalSubtotalTxAmount;

    if (data.baseTx.cpnIntAmount)
        subTotalVal += data.baseTx.cpnIntAmount;
    if (data.baseTx.roundingAmount)
        subTotalVal -= data.baseTx.roundingAmount;
    if (hasMemberDiscReversal)
        subTotalVal -= data.baseTx.memberDiscReversal;

    var voidedAmountHeader = (isNegativeSign(data.clonedSaleTx)) ? subTotalVal * -1 : subTotalVal;

    $("#scannedItemsDiv").append(printLineItemCenter(lineSeparator3));
    $("#scannedItemsDiv").append(printLineItemCenter('POST SALE VOID'));
    $("#scannedItemsDiv").append(printLineItemCenter('TERMINAL# ' + data.clonedSaleTx.terminalNum));
    $("#scannedItemsDiv").append(printLineItemCenter('TRANS# ' + removeLeadingZeroes(data.baseTx.transactionId)));
    $("#scannedItemsDiv").append(printLineItemCenter('* ' + numberWithCommas(voidedAmountHeader) + currency + ' *'));
    $("#scannedItemsDiv").append(printLineItemCenter(lineSeparator3));

    var voidTxDiv = $("<div></div>").addClass("pro-scanned");
    var voidTxUL = $("<ul></ul>").addClass("void");
    for (var i = 0; i < data.clonedSaleTx.orderItems.length; i++) {

        var item = data.clonedSaleTx.orderItems[i];
        var isItemVoided = item.isVoided;
        var itemSubtotal = (item.weight && item.weight > 0) ? Math.round(item.priceSubtotal) : item.priceSubtotal;

        voidTxUL.append((item.isVoided) ? $("<li></li>").addClass("pro-label").html(getMsgValue("pos_receipt_void_label")) : ""); // The VOID label
        voidTxUL.append($("<li></li>").css({ 'width': '210px' }).html(numberWithCommas(item.quantity) + ((item.categoryId == 'DEPTSTORE') ? '@ ' : 'X ') + numberWithCommas(item.priceUnit)));
        voidTxUL.append($("<li></li>").addClass("pro-label").html(((item.categoryId == 'DEPTSTORE') ? item.ean13Code.substring(1, 5) + ',' + item.ean13Code.substring(5, 7) + ',' : '') + item.shortDesc));
        voidTxUL.append($("<li></li>").addClass("pro-price").html(numberWithCommas(itemSubtotal)));
        voidTxUL.append($("<li></li>").addClass("voided-sign").html(displayNegativeSign(data.clonedSaleTx, item.isVoided)));
        voidTxUL.append($("<li></li>").addClass("tax-sign").html(displayTaxSign(item.isTaxInclusive)));

        var sign = displayNegativeSign(data.clonedSaleTx, !item.isVoided);

        // DEPTSTORE
        if (item.categoryId == 'DEPTSTORE' || item.categoryId == 'DIRECTP') {
            if (item.discMarkdown && item.discMarkdown > 0)
                displayDiscount(voidTxUL, Math.round(item.quantity * parseInt(item.discMarkdown)), sign, getMsgValue("pos_receipt_discount"));

            for (var p in item.discAmount) {
                displayDiscount(voidTxUL, Math.round(item.quantity * parseInt(item.discAmount[p])), sign,
                    getMsgValue("pos_receipt_discount") + ((parseFloat(item.discPrice[p]) <= 1) ? parseInt(item.discPrice[p] * 100) + '%' : 'Amt Off'));
            }

            // INHOUSE VOUCHER 2017-04-13
            if (item.discVoucher && item.discVoucher.length > 0) {
                for (var v in item.discVoucher) {
                    displayDiscount(voidTxUL, parseInt(item.discVoucher[v]), sign,
                        getMsgValue("pos_receipt_discount") + 'Voucher #' + item.discVoucherBarcode[v]);
                }
            }
            // INHOUSE VOUCHER 2017-04-13
        } else if (item.discountAmount && item.discountAmount > 0) {
            displayDiscount(voidTxUL, item.discountAmount, sign, getMsgValue("pos_receipt_discount"));
        }

        if (item.crmMemberDiscountAmount && item.crmMemberDiscountAmount > 0) {
            displayDiscount(voidTxUL, item.crmMemberDiscountAmount, sign, getMsgValue("pos_receipt_crm_discount"));
        }

        if (item.memberDiscountAmount && item.memberDiscountAmount > 0) {
            displayDiscount(voidTxUL, item.memberDiscountAmount, sign, data.cmcDiscountLabel, true);
        }

    }
    voidTxDiv.append(voidTxUL);

    $("#scannedItemsDiv").append(voidTxDiv);
    displayPromotions(data.clonedSaleTx.promotionItems, CONSTANTS.TX_TYPES.SALE_VOID.name);

    if (data.employeeDiscountTotal != 0) {
        var empDiscData = {
            amount: data.employeeDiscountTotal,
            percentage: data.empDiscPerc,
            type: CONSTANTS.TX_TYPES.SALE_VOID.name
        };
        displayEmployeeDiscount(empDiscData);
    }

    if (data.totalNonMemberMarkup) {
        $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine,
            getMsgValue(Hypercash.service.getMarkUpLabel(data.memberType)),
            numberWithCommas(Math.round(data.totalNonMemberMarkup)),
            displayNegativeSign(data.clonedSaleTx)));
    }

    $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine,
        getMsgValue('pos_receipt_subtotal_label'),
        numberWithCommas(subTotalVal),
        displayNegativeSign(data.clonedSaleTx)));
    $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, '', lineSeparator1));
    $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine,
        getMsgValue('pos_receipt_total_label'),
        numberWithCommas(subTotalVal),
        displayNegativeSign(data.clonedSaleTx)));

    if (hasMemberDiscReversal) {
        $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, data.cancelCmcLabel, numberWithCommas(data.baseTx.memberDiscReversal), "-"));
        $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, '', lineSeparator1));
        $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('pos_receipt_total_label'), numberWithCommas(subTotalVal + data.baseTx.memberDiscReversal), "-"));
        subTotalVal += data.baseTx.memberDiscReversal;
    }
    if (data.baseTx.cpnIntAmount) {
        $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('pos_receipt_cpn_int_amount_label'), numberWithCommas(data.baseTx.cpnIntAmount)));
        $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, '', lineSeparator1));
        $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, "  " + getMsgValue('pos_receipt_balance_due_label'), numberWithCommas(subTotalVal - data.baseTx.cpnIntAmount), "-"));
        subTotalVal -= data.baseTx.cpnIntAmount;
    }
    if (data.baseTx.roundingAmount) {
        var isRoundingAmtNegative = data.baseTx.roundingAmount < 0;
        var reverseRoundAmt = isRoundingAmtNegative ? data.baseTx.roundingAmount * -1 : data.baseTx.roundingAmount;
        var roundingLbl;

        if (data.roundingType == "SIMPLE_ROUNDING")
            roundingLbl = "pos_receipt_simple_rounding_label";
        else if (data.roundingType == "ROUND_UP")
            roundingLbl = "pos_receipt_round_up_label";
        else if (data.roundingType == "ROUND_DOWN")
            roundingLbl = "pos_receipt_round_down_label";

        $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue(roundingLbl), numberWithCommas(reverseRoundAmt), isRoundingAmtNegative ? null : "-"));
        $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, '', lineSeparator1));
        $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, "  " + getMsgValue('pos_receipt_balance_due_label'), numberWithCommas(subTotalVal + data.baseTx.roundingAmount), "-"));
        subTotalVal += data.baseTx.roundingAmount;
    }
    if (data.baseTx.donationAmount) {
        $("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('pos_receipt_donation_label'), numberWithCommas(Math.abs(data.baseTx.donationAmount)), "-"));
    }

    //Number of item scanned items
    displayNumberOfItemScanned(data);

    //Hot Spice table number
    HOTSPICE_MODULE.print.printTableNumberInScreen(data.hotSpiceTableNumber);

    //Tax Compututed Details
    displayTaxBreakDown(data.clonedSaleTx.taxBreakdown, data.clonedSaleTx);

    displayScreenReceiptFooter(data.clonedSaleTx);
    scrollBottom($("#scannedItemsDiv"));

    $("#subtotal").html(data.clonedSaleTx.subTotal);
    $("#totalQuantity").html(data.clonedSaleTx.totalItemQty);
}

function displayTxn(tx, orderItems, displayData) {
    var totalDiscount = 0;
    var totalAmount = tx.totalAmount;
    var totalQuantity = tx.totalQuantity;
    var voidedDiscount = tx.voidedDiscount;

    for (var i = 0; i < orderItems.length; i++) {
        var item = orderItems[i];
        var itemDiv = $("<div></div>").attr("id", item.productId).addClass("pro-scanned");
        var itemUL = $("<ul></ul>").addClass("scan");
        var itemSubtotal = (item.weight && item.weight > 0) ? Math.round(item.priceSubtotal) : item.priceSubtotal;

        if (item && item.staffId != "" && item.staffId != undefined && item.flagStaff == true) {
            var li_tmpStaff = $("<li></li>").css({ 'width': '210px' }).html("Staff ID : " + item.staffId);
            itemUL.append(li_tmpStaff);
        }

        if (item.salesType == CONSTANTS.TX_TYPES.SALE_VOID.name) {
            itemUL.append($("<li></li>").css({ 'width': '150px' }).html(getMsgValue("pos_receipt_void_label")));
        }
        itemUL.append($("<li></li>").css({ 'width': '210px' }).html(item.quantity + ((item.categoryId == 'DEPTSTORE') ? '@ ' : 'X ') + numberWithCommas(item.priceUnit)));

        // LUCKY - ADD Z SYMBOL IF ITEM IS ZEPRO
        if (tx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO && isItemCMC(item.ean13Code, tx.promotionsMap)) {
            var li_Zepro = $("<li></li>").addClass("tax-sign").html("Z");
            itemUL.append(li_Zepro);
        }

        itemUL.append($("<li></li>").addClass("pro-label").html(((item.categoryId == 'DEPTSTORE') ? item.ean13Code.substring(1, 5) + ',' + item.ean13Code.substring(5, 7) + ',' : '') + item.shortDesc));
        itemUL.append($("<li></li>").addClass("pro-price").html(numberWithCommas(itemSubtotal)));
        itemUL.append($("<li></li>").addClass("voided-sign").html((item.categoryId == 'MVOUCHER') ? '-' : displayNegativeSign(tx, item.isVoided))); // INHOUSE VOUCHER 2017-04-13

        if (item.isTaxInclusive) {
            itemUL.append($("<li></li>").addClass("tax-sign").html(displayTaxSign(item.isTaxInclusive)));
        }

        var sign = displayNegativeSign(tx, !item.isVoided);
        var multiplier = 1;

        if (item.salesType == CONSTANTS.TX_TYPES.SALE_VOID.name) {
            multiplier = -1;
        }

        // DEPTSTORE
        if (item.categoryId == 'DEPTSTORE' || item.categoryId == 'DIRECTP') {
            if (item.discMarkdown && item.discMarkdown > 0)
                displayDiscount(itemUL, Math.round(item.quantity * parseInt(item.discMarkdown)), sign, getMsgValue("pos_receipt_discount"));

            for (var p in item.discAmount) {
                displayDiscount(itemUL, Math.round(item.quantity * parseInt(item.discAmount[p])), sign,
                    getMsgValue("pos_receipt_discount") + ((parseFloat(item.discPrice[p]) <= 1) ? parseInt(item.discPrice[p] * 100) + '%' : 'Amt Off'));
            }

            // INHOUSE VOUCHER 2017-04-13
            if (item.discVoucher && item.discVoucher.length > 0) {
                for (var v in item.discVoucher) {
                    displayDiscount(itemUL, parseInt(item.discVoucher[v]), sign,
                        getMsgValue("pos_receipt_discount") + 'Voucher #' + item.discVoucherBarcode[v]);
                }
            }
            // INHOUSE VOUCHER 2017-04-13
        } else if (item.discountAmount && item.discountAmount > 0) {
            displayDiscount(itemUL, item.discountAmount, sign, getMsgValue("pos_receipt_discount"));
            totalDiscount = totalDiscount + (item.discountAmount * multiplier);
        }

        if (item.crmMemberDiscountAmount && item.crmMemberDiscountAmount > 0) {
            displayDiscount(itemUL, item.crmMemberDiscountAmount, sign, getMsgValue("pos_receipt_crm_discount"));
            totalDiscount = totalDiscount + (item.crmMemberDiscountAmount * multiplier);
        }


        if (item.memberDiscountAmount && item.memberDiscountAmount > 0) {
            displayDiscount(itemUL, item.memberDiscountAmount, sign, displayData.cmcDiscountLabel, true);
            totalDiscount = totalDiscount + (item.memberDiscountAmount * multiplier);
        }

        itemDiv.append(itemUL);

        $("#scannedItemsDiv").append(itemDiv);
    }

    scrollBottom($("#scannedItemsDiv"));
    if (voidedDiscount) {
        totalAmount = totalAmount - voidedDiscount;
    }
    totalAmount = totalAmount - totalDiscount;

    $("#totalDiscount").html(numberWithCommas(totalDiscount));
    $("#subtotal").html(numberWithCommas(totalAmount));
    $("#totalQuantity").html(totalQuantity);
}

/*function displayGiftCardBalance(data) {
    // remove displayed quantifier if any
    removeDisplayedQuantity();
    //hotfix 2-12-2014
    $("#scannedItemsDiv").append(printLineItemCenter(lineSeparator2));
    $("#scannedItemsDiv").append(printLineItemCenter(getMsgValue('pos_label_gc_balance')));
    $("#scannedItemsDiv").append(printLineItemCenter(getMsgValue('pos_receipt_giftcard_number_label') + maskValueWithX(data.cardNumber.substring(0, 16), 3, 'LAST')));
    $("#scannedItemsDiv").append(printLineItemCenter(getMsgValue('pos_label_gc_expiry') + data.expireDate));
    $("#scannedItemsDiv").append(printLineItemCenter(getMsgValue('pos_label_card_balance') + numberWithCommas(data.balance)));
    $("#scannedItemsDiv").append(printLineItemCenter(lineSeparator2));

    scrollBottom($("#scannedItemsDiv"));
}*/

/**
 * Used for clearing transaction details.
 */
function clearCommonDisplay() {
    //clear receipt details on screen
    $("#scannedItemsDiv").empty();
    $("#customerInfoDiv").empty();

    //clean subtotal/ discount details
    $("#subtotal").empty();
    $("h1#subtotal").append("0");
    $("#totalQuantity").empty();
    $("#totalDiscount").empty();
    $("#totalDiscount").append("0");

    //product details of last scanned item.
    $("#btmbox").empty();
    $("#btmBoxProdName").empty();
    $("#btmBoxProdDesc").empty();
    $("#btmBoxProdPrice").empty();
}

/**
 * Create a generated payment line information.
 *
 * @param isOneLine - if the generated information shouldn't be wrapped
 * @param label     - the label of the payment info, the left-most value
 * @param value     - the value of the payment info, most likely an amout, the value next to label
 * @param voidedSign- the void item/txn indicator, only one character; the minus[-] sign
 * @param taxSign   - the tax indicator; the asterisk sign[*]
 *
 * @returns the generated payment line information.
 */
function payInfoLine(isOneLine,
    label,
    value,
    voidedSign,
    taxSign,
    fontCss,
    isSummaryLineItem) {
    var oneLineCSSSuffix = (isOneLine) ? "-one-line" : "";
    var payInfo = $("<div></div>").addClass("pro-scanned").addClass((fontCss && fontCss.bold) ? "prodBold" : "");
    var ul = $("<ul></ul>").addClass("scan");
    var lineLabel = $("<li></li>").addClass((fontCss && fontCss.large) ? "pro-label-big" : "pro-label" + oneLineCSSSuffix);
    var textLabel = $("<p></p>").text(label)
    lineLabel[(isSummaryLineItem) ? "append" : "html"]((isSummaryLineItem) ? textLabel : label);
    var lineValue = $("<li></li>").addClass((fontCss && fontCss.large) ? "pro-price-big" : "pro-price" + oneLineCSSSuffix).html(value);
    var lineVoidedSign = (voidedSign) ? $("<li></li>").addClass("voided-sign").html(voidedSign) :
        null;
    var lineTaxSign = (taxSign) ? $("<li></li>").addClass("tax-sign").html(taxSign) :
        null;

    ul.append(lineLabel);
    ul.append(lineValue);
    ul.append((voidedSign) ? lineVoidedSign : null);
    ul.append((taxSign) ? lineTaxSign : null);
    payInfo.append(ul);
    return payInfo;
}

/**
 *  Extension of payInfoLine; in which its
 *  always sets the isSummaryLineItem to TRUE which means the ff:
 *     1.) Label was prefixed with DOUBLE SPACE
 */
function payInfoSummaryLine(isOneLine,
    label,
    value,
    voidedSign,
    taxSign,
    fontCss) {
    return payInfoLine(isOneLine,
        label,
        value,
        voidedSign,
        taxSign,
        fontCss,
        true);
}

function renderEFTOnlineLineItem(leadingText, value) {
    var payInfo = $("<div></div>").addClass("pro-scanned");
    var ul = $("<ul></ul>").addClass("eft-scan");
    var left = $("<li></li>").addClass("pro-label")
        .html(leadingText);
    var right = $("<li></li>").addClass("pro-price").html(value);
    ul.append(left);
    ul.append(right);
    payInfo.append(ul);
    return payInfo;
}

function printLineItemCenter(item) {
    return $("<div></div>").addClass("pro-scanned").append($("<span></span>").addClass("line-item-center").html(item));
}

/**
 * Will remove rendered quantity if there is any.
 */
function removeDisplayedQuantity() {
    if ($("#tempQtyDiv").length > 0) {
        $("#tempQtyDiv").remove();
    }
}

/**
 * Set Focus at the bottom of scroll
 */
function scrollBottom(elem) {
    var childElem = elem[0];
    var height = childElem.scrollHeight;
    elem.scrollTop(height);
}

function displayDiscount(ul, discountAmount, sign, discountTypeLabel, isBold) {

    var li_discountDesc = $("<li></li>").addClass("pro-label")
        .addClass((isBold) ? "prodBold" : "")
        .html(discountTypeLabel);
    var li_discount = $("<li></li>").addClass("pro-price")
        .html(numberWithCommas(discountAmount));
    var li_discountNeg = $("<li></li>").addClass("voided-sign")
        .html(sign);

    ul.append(li_discountDesc);
    ul.append(li_discount);
    ul.append(li_discountNeg);
}


function displayPromotions(appliedPromotions, type) {
    // remove first tempQtyDiv if exists
    removeDisplayedQuantity();

    var scannedDiv = $("<div></div>").attr("id", "promotions").addClass("pro-scanned");
    var sign = (type && type == CONSTANTS.TX_TYPES.SALE_VOID.name) ? "" : "-";

    for (var i in appliedPromotions) {
        var promoItem = cloneObject(appliedPromotions[i]);
        var discountPerItem = Math.round(promoItem.totalDiscount / promoItem.itemQuantity);

        if (promoItem.type != CONSTANTS.PROMOTION_TYPES.MEMBER_PROMOTION) {
            var promoLabel = "";

            var ul = $("<ul></ul>").addClass("scan");
            var li_Qty = $("<li></li>").css({ 'width': '210px' }).html(promoItem.itemQuantity + "X " + numberWithCommas(discountPerItem) + " " + sign);
            ul.append(li_Qty);

            promoLabel = promoItem.label;

            var li_Desc = $("<li></li>").addClass("pro-label").html(promoLabel);
            var li_Price = $("<li></li>").addClass("pro-price").html(numberWithCommas(promoItem.totalDiscount));
            var li_neg = $("<li></li>").addClass("voided-sign").html(sign);

            ul.append(li_Desc);
            ul.append(li_Price);
            ul.append(li_neg);

            scannedDiv.append(ul);
        }
    }

    $("#scannedItemsDiv").append(scannedDiv);
    // focus on last element
    scrollBottom($("#scannedItemsDiv"));
}

function displayEmployeeDiscount(data) {
    // remove first tempQtyDiv if exists
    removeDisplayedQuantity();

    var scannedDiv = $("<div></div>").attr("id", "emp-disc").addClass("pro-scanned");
    var sign = (data && data.type == CONSTANTS.TX_TYPES.SALE_VOID.name) ? "" : "-";
    var empDiscLabel = getMsgValue('pos_receipt_employee_discount_label').format(data.percentage);

    var ul = $("<ul></ul>").addClass("scan");
    var li_Desc = $("<li></li>").addClass("pro-label").html(empDiscLabel);
    var li_Price = $("<li></li>").addClass("pro-price").html(numberWithCommas(data.amount));
    var li_neg = $("<li></li>").addClass("voided-sign").html(sign);

    ul.append(li_Desc);
    ul.append(li_Price);
    ul.append(li_neg);

    scannedDiv.append(ul);

    $("#scannedItemsDiv").append(scannedDiv);
    // focus on last element
    scrollBottom($("#scannedItemsDiv"));
}

function displayProductDetails(prodDetails) {
    $("#btmBoxProdName").html(prodDetails.name);
    $("#btmBoxProdDesc").html("<b>DESCRIPTION: </b>" + (prodDetails.description ? prodDetails.description : prodDetails.shortDesc));
    if (redeemPointTrk) {
        $("#btmBoxProdPrice").html("<b>PRICE: </b>" + numberWithCommas(prodDetails.trkPoint));
    } else if (saleGameItemTrk) {
        $("#btmBoxProdPrice").html("<b>PRICE: </b>" + numberWithCommas(prodDetails.trkPrice));
    } else {
        $("#btmBoxProdPrice").html("<b>PRICE: </b>" + numberWithCommas(prodDetails.currentPrice));
    }
}

function displayPaymentMediaDetails(paymentMediaDetails) {

    var paymentViewLbl = getMsgValue('pos_label_payment_view');
    var paymentMediaDiv = $("<div></div>").attr("id", "paymentMedia").addClass("systemMsg");
    var paymentMedia;
    var cashierProfile = $("#cashierProfile");
    $("#systemMessageDiv").empty();

    if (cashierProfile) {
        cashierProfile.hide();
    }
    $("#systemMessageDiv").append($("<h4></h4>").text(paymentViewLbl));
    for (var i in paymentMediaDetails) {
        paymentMedia = paymentMediaDetails[i];

        uilog('DBUG', "Console common display : " + JSON.stringify(paymentMedia));
        var ul = $("<ul></ul>").addClass('payment-view');
        var left = $("<li></li>").addClass('payment-view-item-label').html(paymentMedia.label);
        var delimeter = $("<li></li>").html(':');
        var right = $("<li></li>").addClass('pro-price').html(paymentMedia.value);

        if (paymentMedia.cssClassName) {
            left.addClass(paymentMedia.cssClassName);
            delimeter.addClass(paymentMedia.cssClassName);
            right.addClass(paymentMedia.cssClassName);
        }
        ul.append(left);
        ul.append(delimeter);
        ul.append(right);

        paymentMediaDiv.append(ul);
    }

    $("#systemMessageDiv").append(paymentMediaDiv);
    // Scroll to bottom
    $('#systemMessageDiv .systemMsg').scrollTop($('#systemMessageDiv .systemMsg')[0].scrollHeight);
}

function refreshPaymentView() {
    var midBoxDiv = $(".midboxOnline");

    if (midBoxDiv) {
        midBoxDiv.find("#cashierProfile").show();
        midBoxDiv.find("#systemMessageDiv").empty();
    }
}

function displayCustomerInfo(name, id) {
    $("#customerInfoDiv").empty();
    $(".scannedItems").height("68%");
    if (name && id) {
        //adjust the height of scannedItemsDiv
        $(".scannedItems").height("64%");
        var html = $("<p></p>").append(getMsgValue('pos_customer_name_label')).append('&nbsp;').append(name)
            .append($("<br></br>")).append(getMsgValue('pos_customer_id_label')).append('&nbsp;').append(id);
        $("#customerInfoDiv").append(html);
    }
}

/**
 * 
Contract Number	: SPG1402818
Customer Name	: Tutik Yuliani
Type of item	: PIAGGIO LIBERTY 10
Policy Number	: B6271VGF
Date of period	: 7th of each month
Period of pay	: 4
Amount of pay	: Rp. 578,000
Admin Fee	: Rp. 0
Charge	: Rp.10,000
Total amount of pay	: Rp. 588,000
Receipt number	: 1161136
 * 
 * 
 * @param data
 * @returns
 */


function displayBillPaymentInfo(data) {
    var billInfo = data.billPaymentInfo;

    if (billInfo) {
        var txDateTime = new Date(billInfo.transactionDate);
        var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);

        $("#scannedItemsDiv").append(payInfoSummaryLine(false, getMsgValue('bp_label_receipt_contract_num'), billInfo.customerId));
        $("#scannedItemsDiv").append(payInfoSummaryLine(false, getMsgValue('bp_label_receipt_name'), billInfo.customerName));
        $("#scannedItemsDiv").append(payInfoSummaryLine(false, getMsgValue('bp_label_receipt_item_type'), (billInfo.itemType) ? billInfo.itemType : billInfo.customerInfo));

        if (billInfo.policyNumber) {
            $("#scannedItemsDiv").append(payInfoSummaryLine(false, getMsgValue('bp_label_receipt_policy_number'), billInfo.policyNumber));
        }
        //date of period
        $("#scannedItemsDiv").append(payInfoSummaryLine(false, getMsgValue('bp_label_receipt_installment_period'), getMsgValue('bp_label_contract_period_months').format(billInfo.paymentPeriod)));
        $("#scannedItemsDiv").append(payInfoSummaryLine(false, getMsgValue('bp_label_receipt_amount'), numberWithCommas(billInfo.netAmount)));
        $("#scannedItemsDiv").append(payInfoSummaryLine(false, getMsgValue('bp_label_receipt_admin_fee'), numberWithCommas(billInfo.adminFee)));
        $("#scannedItemsDiv").append(payInfoSummaryLine(false, getMsgValue('bp_label_receipt_charge'), numberWithCommas(billInfo.penaltyFee)));
        $("#scannedItemsDiv").append(payInfoSummaryLine(false, getMsgValue('bp_label_receipt_total_amount'), numberWithCommas(billInfo.totalAmount)));
        //$("#scannedItemsDiv").append(payInfoSummaryLine(false, getMsgValue('bp_label_receipt_payment_date'), txDate));
        $("#scannedItemsDiv").append(payInfoSummaryLine(false, getMsgValue('bp_label_receipt_reference_code'), billInfo.referenceCode));
    }

}

function displayEleboxInfo(data) {
    if (ELEBOX.isEleboxTransaction()) {
        var elebox = data.elebox;
        for (var i = 0; i < data.elebox.order.cart.count; i++) {
            if (elebox) {
                if (!$.isArray(elebox)) {
                    $("#scannedItemsDiv").append(payInfoSummaryLine(false, "DETAIL CUSTOMER:", elebox.order.cart.detail_list));
                } else {
                    //Not yet!!!!
                }
            }
        }
    }
}

/*******************************************************************************
 * START : CUSTOMER PAGE FUNCTIONS
 ******************************************************************************/
var CUSTOMER_PAGE = CUSTOMER_PAGE || {};

/**
 * Change the Customer active screen.
 * If the argument passed is null/undefined,
 * render the Idle screen.
 *
 */
CUSTOMER_PAGE.displayCustomerActiveScreen = function(custPageScreenType) {

    var $custTransactionDOM = $("div #customer-container");
    var $custNextCashierDOM = $("div #customer-tempoff-container");
    var $custIdleDOM = $("div #customer-idle-container");

    // Hiding the DOM objects
    $().add($custTransactionDOM)
        .add($custNextCashierDOM)
        .add($custIdleDOM)
        .hide();

    switch (custPageScreenType) {
        case CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.TRANSACTION:
            {
                $custTransactionDOM.show();
                break;
            }
        case CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.NEXT_CASHIER:
            {
                $custNextCashierDOM.show();
                break;
            }
        case CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.IDLE:
            // Fall through to default
        default:
            {
                $custIdleDOM.show();
            }
    };
};
/*******************************************************************************
 * END : CUSTOMER PAGE FUNCTIONS
 ******************************************************************************/