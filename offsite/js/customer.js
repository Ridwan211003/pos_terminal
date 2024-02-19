var cashierWinObject = window.opener;
var isCustomerFeedbackEnabled = false;
var feedbackTimer = null;
var feedbackCounter = null;
var isValidPin = false;
var ovocount;
var ovocounter;

var numberDisplay1 = {
    'bksp': "backspace",
    'accept': 'accept'
};

var customNumberLayout1 = {
    'default': [
        '7 8 9 ',
        '4 5 6 ',
        '1 2 3 ',
        '0 {bksp} {accept}'
    ]
};

//used in commonDisplay to avoid errors during call of
//cashier side codes on customer view
var isCustomerView = true;

/**
 * Event listener
 */
window.addEventListener('message', function(event) {
    if (event.origin == location.protocol + "//" + location.host) {
        if (event.data.messageType == "CLEAR_ORDER") {
            clearCommonDisplay();
        } else if (event.data.messageType == "RENDER_ITEM_QUANTITY") {
            displayItemQuantity(event.data.quantity, event.data.isVoid);
        } else if (event.data.messageType == "RENDER_SCANNED_ITEM") {
            displayScannedItem(event.data.tx, event.data.type, event.data.item);
        } else if (event.data.messageType == "RENDER_PAYMENT_ITEM") {
            displayPaymentItem(event.data.item);
        } else if (event.data.messageType == "RENDER_VOIDED_ITEM") {
            displayVoidedItem(event.data.itemData, event.data.tx);
        } else if (event.data.messageType == "RENDER_TOTAL_ITEM") {
            displayTotals(event.data.totalAmount, event.data.totalQuantity, event.data.totalDiscount);
        } else if (event.data.messageType == "RENDER_PAYMENT_INFO") {
            displayPaymentInfo(event.data.txData);
        } else if (event.data.messageType == "RENDER_SCREEN_RECEIPT_FOOTER") {
            displayScreenReceiptFooter(event.data.txData, event.data.pointReward);
        } else if (event.data.messageType == "RENDER_TOPUP_INFO") {
            displayTopUpInfo(event.data.txData);
        } else if (event.data.messageType == "RENDER_INDOSMART_INFO") {
            displayIndosmartInfo(event.data.txData);
        } else if (event.data.messageType == "RENDER_MCASH_INFO") {
            displayMCashInfo(event.data.txData);
        } else if (event.data.messageType == "RENDER_ALTERRA_INFO") {
            displayAlterraInfo(event.data.txData);
        } else if (event.data.messageType == "RENDER_VOID_TXN") {
            displayVoidTxn(event.data.txData);
        } else if (event.data.messageType == "RENDER_TXN") {
            displayTxn(event.data.tx, event.data.orderItems, event.data.displayData);
        } else if (event.data.messageType == "CANCEL_SALE") {
            displayCancelSale(event.data.txType);
        } else if (event.data.messageType == "RENDER_TX_TYPE") {
            displayTransactionType(event.data.type);
        } else if (event.data.messageType == "REMOVE_SCANNED_ITEM") {
            removeScannedItem(event.data.productId);
        } else if (event.data.messageType == "REMOVE_RENDERED_QUANTITY") {
            removeDisplayedQuantity();
        } else if (event.data.messageType == "RENDER_GIFT_CARD_BALANCE") {
            displayGiftCardBalance(event.data.gcBalanceDetails);
        } else if (event.data.messageType == "CLEAR_TRIGGER") {
            clearTrigger(event.data.disableClrFn);
        } else if (event.data.messageType == "ENABLE_CUST_FEEDBACK") {
            enableCustomerFeedback(event.data.enableCustFeedback, JSON.parse(event.data.feedbackSettings));
        } else if (event.data.messageType == "ENABLE_CRM_PIN") {
            enableCRMEnterPinDialog();
        } else if (event.data.messageType == "CLOSE_CUST_FEEDBACK") {
            closeCustomerFeedback();
        } else if (event.data.messageType == "CLOSE_CHECK_PRICE_INFO") {
            closeCheckPrice();
        } else if (event.data.messageType == "IS_VALID_PIN") {
            isValidCRMPin(event.data.isValidPin, event.data.status);
        } else if (event.data.messageType == "CLOSE_SHOW_POINTS") {
            closeCRMPoints();
        } else if (event.data.messageType == "SHOW_POINTS") {
            displayCRMPoints(event.data.crmResponse);
        } else if (event.data.messageType == "RENDER_APPLIED_PROMOTIONS") {
            displayPromotions(event.data.promoData);
        } else if (event.data.messageType == "RENDER_APPLIED_EMP_DISC") {
            displayEmployeeDiscount(event.data.empDiscData);
        }
        /*else if(event.data.messageType == "RENDER_ACTIVE_SCREEN"){
        	displayActiveScreen(event.data.isIdle, event.data.toggleTempOff);
        }*/
        else if (event.data.messageType == "RENDER_PROD_DETAILS") {
            displayProductDetails(event.data.prodDetails);
        } else if (event.data.messageType == "RENDER_PAYMENT_DETAILS") {
            displayPaymentMediaDetails(event.data.paymentMediaDetails);
        } else if (event.data.messageType == "MARKETING_ADS_TRANSITION" && event.data.terminalModel != 'M2') {
            setMarketingAdsTransition(event.data.transitionData);
        } else if (event.data.messageType == "RENDER_ACTIVE_SCREEN") {
            CUSTOMER_PAGE.displayCustomerActiveScreen(event.data.custPageScreenType);
        } else if (event.data.messageType == "CUSTOMER_INFO") {
            displayCustomerInfo(event.data.name, event.data.id);
        } else if (event.data.messageType == "CLOSE_GIFT_CARD_BALANCE_DIALOG") {
            $("#gift-card-balance-dialog").dialog("close");
        } else if (event.data.messageType == "OPEN_FLASHIZ_QR_CODE") {
            displayFlashizQRCode(event.data.image);
        } else if (event.data.messageType == "CLOSE_FLASHIZ_QR_CODE") {
            closeFlashizQRCode();
        } else if (event.data.messageType == "OPEN_ALTO_WECHAT_QR_CODE") {
            displayAltoWeChatQRCode(event.data.data);
        } else if (event.data.messageType == "CLOSE_ALTO_WECHAT_QR_CODE") {
            closeAltoWeChatQRCode();
        } else if (event.data.messageType == "OPEN_MLC_QR_CODE") { // MLC 2017-04-021 
            displayMLCQRCode(event.data.data);
        }else if (event.data.messageType == "OPEN_TOPUP_BARCODE") { // MLC 2017-04-021 
            displayTopupBarcode(event.data.data);
        }else if (event.data.messageType == "CLOSE_TOPUP_BARCODE") { // MLC 2017-04-021 
            closeTopupBarcode(event.data.data);
        } else if (event.data.messageType == "CLOSE_MLC_QR_CODE") {
            closeMLCQRCode(); // MLC 2017-04-021 
        }else if (event.data.messageType == "OPEN_OVO_QR_CODE") {
            displayOVOQRCode(event.data.data);
        } else if (event.data.messageType == "CLOSE_OVO_QR_CODE") {
            closeOVOQRCode(); 
        } else if (event.data.messageType == "OPEN_BALLOON_GAME_USER_DIALOG") {
            $("#balloonGameUser-dialog").dialog("open");
        } else if (event.data.messageType == "OPEN_BALLOON_GAME_ITEMS_DIALOG") {
            var redeemableItems = event.data.redeemableItems;
            var itemThreshold = event.data.itemThreshold;
            var memberId = event.data.memberId;

            BALLOON_GAME.itemThreshold.set(itemThreshold);
            BALLOON_GAME.member.set(memberId);
            BALLOON_GAME.populateBalloonGameRedemptionDialog(redeemableItems);
            $("#balloonGameItemRedemption-dialog").dialog("open");
        } else if (event.data.messageType == "CLOSE_BALLOON_GAME_ITEMS_DIALOG") {
            closeBalloonGameItemsDialog();
        } else if (event.data.messageType == "INQUIRY_VOUCHER_INFO") { // INHOUSE VOUCHER 2017-04-13
            $("#voucherInfo-dialog").data('voucherResp', event.data.voucherInfo).dialog("open");
        } else if (event.data.messageType == "CLOSE_VOUCHER_INFO") {
            $("#voucherInfo-dialog").dialog("close"); // INHOUSE VOUCHER 2017-04-13
        } else if (event.data.messageType == "EVENT_PROMO_INFO") {
            $("#eventInfo-dialog").data('eventInfo', event.data.eventInfo).dialog("open");

        } else if (event.data.messageType == "OPEN_CHECK_PRICE_INFO") {
            var itemDetails = event.data.data; // Extract data from the event
            console.log("Received new item details:", itemDetails);
            displayCheckPrice(itemDetails);
        } else if (event.data.messageType == "OPEN_CHECK_PRICE_DIALOG") {
            $("#itemCheck-dialog").dialog("open");
        } else if (event.data.messageType == "CLEAR_CHECK_PRICE_DIALOG") {
            clearCheckPrice();

        } else if (event.data.messageType == "CLOSE_EVENT_INFO") {
            $("#eventInfo-dialog").dialog('close');
        } else if (event.data.messageType == "ELEBOX_INFO") {
            displayEleboxDetails(event.data.data);
        } else if (event.data.messageType == "ELEBOX_CUSTOMER_VIEW") {
            $("#eleboxCustomer-dialog").dialog('open');
        } else if (event.data.messageType == "ELEBOX_CUSTOMER_DIALOG") {
            displayEleboxCustomer(event.data.data);
        } else if (event.data.messageType == "ELEBOX_CUSTOMER_REMOVE") {
            $("#eleboxCustomer-dialog").dialog('close');
        } else if (event.data.messageType == "ELEBOX_INFO_STATUS") {
            $("#eleboxStatus-dialog").dialog('open');
        } else if (event.data.messageType == "ELEBOX_DIALOG_STATUS") {
            displayEleboxStatus(event.data.status);
        } else if (event.data.messageType == "ELEBOX_FAILED_STATUS") {
            $("#eleboxFailedStatus-dialog").dialog('open');
        } else if (event.data.messageType == "ELEBOX_FAILED_DIALOG") {
            displayEleboxFailed(event.data.data);
        } else if (event.data.messageType == "ELEBOX_FAILED_REMOVE") {
            $("#eleboxFailedStatus-dialog").dialog('close');
        } else if (event.data.messageType == "ELEBOX_STATUS_REMOVE") {
            $("#eleboxStatus-dialog").dialog('close');
        } else if (event.data.messageType == "BPJS_DIALOG") {
            $("#bpjs-dialog").dialog('open');
        } else if (event.data.messageType == "BPJS_STATUS") {
            displayBpjsInfo(event.data.data);
        } else if (event.data.messageType == "REMOVE_BPJS_DIALOG") {
            $("#bpjs-dialog").dialog('close');
        } else if (event.data.messageType == "BPJS_ADVICE_DIALOG") {
            $("#bpjsAdvice-dialog").dialog('open');
        } else if (event.data.messageType == "BPJS_ADVICE") {
            displayBpjsAdvice(event.data.data);
        } else if (event.data.messageType == "REMOVE_ADVICE_DIALOG") {
            $("#bpjsAdvice-dialog").dialog('close');
        } else if (event.data.messageType == "SIMPATINDO_DIALOG") {
            $("#simpatindoInfo-dialog").dialog('open');
        } else if (event.data.messageType == "SIMPATINDO_STATUS") {
            displaySimpatindoInfo(event.data.data);
        } else if (event.data.messageType == "REMOVE_SIMPATINDO_DIALOG") {
            $("#simpatindoInfo-dialog").dialog('close');
        } else if (event.data.messageType == "SIMPATINDO_ADVICE_DIALOG") {
            $("#simpatindoAdvice-dialog").dialog('open');
        } else if (event.data.messageType == "SIMPATINDO_ADVICE") {
            displaySimpatindoAdvice(event.data.data);
        } else if (event.data.messageType == "REMOVE_SIMPATINDO_ADVICE_DIALOG") {
            $("#simpatindoAdvice-dialog").dialog('close');
        } else if (event.data.messageType == "DONASI_INFO") {
            displayDonasiCustomer(event.data.data);
        } else if (event.data.messageType == "DONASI_CUSTOMER_VIEW") {
            $("#donationCustomer-dialog").dialog('open');
        } else if (event.data.messageType == "DONASI_CUSTOMER_DIALOG") {
            displayDonasiCustomer(event.data.data);
        } else if (event.data.messageType == "REMOVE_DONASI_DIALOG") {
            $("#donationCustomer-dialog").dialog('close');
        } else if (event.data.messageType == "LOYALTY_MAIL_DIALOG") {
            $("#custLoyalty_mail_info2-dialog").dialog('open');
            displayLoyaltyMail(event.data.data);
        } else if (event.data.messageType == "REMOVE_LOYALTY_MAIL_DIALOG") {
            $("#custLoyalty_mail_info2-dialog").dialog('close');
        }
    } else {
        return;
    }
}, false);

$(document).ready(function() {
    $("img#customerFeedbackStatusHappyImg").hide();
    $("img#customerFeedbackStatusSadImg").hide();

    $("img#fnCustomerSatisfied").click(function() {
        processCustomerFeedback(1);
    });

    $("img#fnCustomerNotSatisfied").click(function() {
        processCustomerFeedback(2);
    });

    $("#crmPinEnterBtn").click(function() {
        var crmPin = null;
        $("#crmEnterPinMsgSpan").empty();
        crmPin = $("#crmEnterPinField").val();
        if (crmPin != "") {
            processCustomerPin(crmPin);
        } else {
            $("#crmEnterPinMsgSpan").html(getMsgValue('pos_label_invalid_pin'));
        }
        $("#crmEnterPinField").val("");
    });

    $("#crmEnterPinField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1
    });

    $("#balloonGameUserText").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1
    });

    $("#crmEnterPIN-dialog").on("dialogclose", function(event, ui) {
        $("#crmEnterPinMsgSpan").empty();
        $("#crmEnterPinField").val("");
        sendCloseMsgToCashier();
    });
});

/**************************************
 * Customer Feedback START
 *************************************/
function processCustomerFeedback(feedback) {
    //only process feedback when no feedback yet from customer
    if (isCustomerFeedbackEnabled) {
        sendCustomerFeedbackToCashier(feedback);
        isCustomerFeedbackEnabled = false;
        $("#customerFeedback-dialog").dialog("close");
        window.clearTimeout(feedbackTimer);
        feedbackTimer = null;
        renderFeedbackStatus(feedback);
    }

}

function renderFeedbackStatus(feedback) {
    var feedbackTitle = "";
    var feedbackStatus = "";
    $("img#customerFeedbackStatusHappyImg").hide();
    $("img#customerFeedbackStatusSadImg").hide();
    //1 is happy, 2 is sad
    if (feedback == 1) {
        feedbackStatus = getMsgValue("pos_cust_feedback_given_happy");
        $("img#customerFeedbackStatusHappyImg").show();
    } else if (feedback == 2) {
        feedbackStatus = getMsgValue("pos_cust_feedback_given_sad");
        $("img#customerFeedbackStatusSadImg").show();
    } else {
        feedbackTitle = getMsgValue("pos_cust_feedback_title");
    }

    $("#customerFeedbackTitle").text(feedbackTitle);
    $("#customerFeedbackStatusText").text(feedbackStatus);
}

function clearCheckPrice() {
    $("#itemName").empty();
    $("#itemPrice").empty();
    $("#itemBarcode").empty();
    $("#afterPrice").empty();
}

function closeCustomerFeedback() {
    $("#customerFeedback-dialog").dialog("close");
}

function closeCheckPrice() {
    $("#itemCheck-dialog").dialog("close");
}

function enableCustomerFeedback(enable, feedbackSettings) {
    isCustomerFeedbackEnabled = enable;
    var timeout = feedbackSettings.timeout;
    var feedbackMessage = feedbackSettings.message;

    if (enable) {
        $("#customerFeedback-dialog").dialog("open");
        feedbackCounter = (timeout / 1000);
        $("#feedbackCounter").text(feedbackCounter);
        //hotfix 2-17-2014
        feedbackTimer = setTimeout("feedbackCountdown()", 1000);
        //		feedbackTimer = window.setInterval("feedbackCountdown()", 1000);
        $("#feedbackMessage").text(feedbackMessage);

        if (feedbackSettings.totalDisc && feedbackSettings.totalDisc > 0) {
            $("#totalDiscountMsg").show();
            $("#totalDiscountMsg").text(feedbackSettings.totalDiscMsg + " Rp " + numberWithCommas(feedbackSettings.totalDisc));
        } else {
            $("#totalDiscountMsg").hide();
        }

        if (feedbackSettings.totalCmcDisc && feedbackSettings.totalCmcDisc > 0) {
            $("#totalCmcDiscountMsg").show();
            $("#totalCmcDiscountMsg").text(feedbackSettings.totalCmcDiscMsg + " Rp " + numberWithCommas(feedbackSettings.totalCmcDisc));
        } else {
            $("#totalCmcDiscountMsg").hide();
        }

    } else {
        $("#customerFeedback-dialog").dialog("close");
    }
    renderFeedbackStatus(0);
}

function feedbackCountdown() {
    $("#feedbackCounter").text(feedbackCounter);
    if (feedbackCounter == 1) {
        processCustomerFeedback(0);
    } else {
        feedbackCounter -= 1;
        $("#feedbackCounter").text(feedbackCounter);
        //hotfix 2-17-2014
        setTimeout("feedbackCountdown()", 1000);
    }
}

function sendCustomerFeedbackToCashier(feedback) {
    var _data = {
        "messageType": "CUSTOMER_FEEDBACK",
        "customerFeedback": feedback,
    };
    cashierWinObject.postMessage(_data, location.protocol + "//" + location.host);
}
/**************************************
 * Customer Feedback END
 *************************************/

/**************************************
 * CRM Enter PIN START
 *************************************/
function enableCRMEnterPinDialog() {
    $("#crmEnterPIN-dialog").dialog("open");
}

function isValidCRMPin(isValidPin, status) {
    if (status == "ERR005" ||
        status == "ERR003" ||
        status == "ERR004") {
        $("#crmEnterPinMsgSpan").html(getMsgValue('pos_label_cannot_connect_to_crm_web'));
    } else {
        if (isValidPin) {
            $("#crmEnterPIN-dialog").dialog("close");
        } else {
            $("#crmEnterPinMsgSpan").html(getMsgValue('pos_label_invalid_pin'));
        }
    }
}

function processCustomerPin(pin) {
    /*if (pin == "") {
    	$("#crmEnterPinMsgSpan").html(getMsgValue('pos_label_invalid_pin'));
    } else {*/
    sendCustomerPinToCashier(pin);
    //	}
}

function sendCustomerPinToCashier(pin) {
    var _data = {
        "messageType": "CUSTOMER_PIN",
        "customerPin": pin,
    };
    cashierWinObject.postMessage(_data, location.protocol + "//" + location.host);
}

function sendCloseMsgToCashier() {
    var _data = {
        "messageType": "CANCEL_PAY_WITH_POINTS",
    };
    cashierWinObject.postMessage(_data, location.protocol + "//" + location.host);
}

function displayCRMPoints(crmResponse) {
    var msg = "Member Name: " + "<br />" + " <em>" + crmResponse.memberName + "</em><br />";
    msg += "Member ID: " + " <em>" + crmResponse.accountNumber + "</em><br />";
    msg += "Total Points: " + " <em>" + crmResponse.totalPoints + "</em><br />";
    msg += "<br />";

    $("#crm-message").dialog('option', 'title', 'INFORMATION');
    $("#crmMsgReminder").html(msg);
    $("#crm-message").dialog("open");
}

function displayCheckPrice(itemDetails) {
    if (itemDetails) {
        // Update the dialog with new product details
        $("#itemName").text(itemDetails.itemName);
        $("#itemPrice").text(numberWithCommas(itemDetails.itemPrice));
        $("#itemBarcode").text(itemDetails.itemBarcode);
        $("#afterPrice").text(numberWithCommas(itemDetails.afterPrice));
    } else {
        var noEmpty = "Barang Tidak Ditemukans!";
        showMsgDialog(noEmpty, "alert");
        // Clear the details if itemDetails is not defined
        $("#itemName").text("");
        $("#itemPrice").text("");
        $("#itemBarcode").text("");
        $("#afterPrice").text("");
    }
}

function closeCRMPoints() {
    $("#crm-message").dialog("close");
}
/**************************************
 * CRM Enter PIN END
 *************************************/

/***********************************
 * Marketing Ads transition data Start
 ***********************************/
function setMarketingAdsTransition(transitionData) {
    /*setInterval( "slideSwitchWhiteLargeAds()", transitionData.tCuWLA);
    setInterval( "slideSwitchRedLargeAds()", transitionData.tCuRLA);
    setInterval( "slideSwitchWhiteSmallAds()", transitionData.tCuWSA);
    setInterval( "slideSwitchRedSmallAds()", transitionData.tCuRSA);
    setInterval( "slideSwitchCashierOfflineAds()", transitionData.tCuCOA);
    setInterval( "slideSwitchRegularReminders()", transitionData.tCaRR);
    setInterval( "slideSwitchPromoReminders()", transitionData.tCaPR);*/

}
/***********************************
 * Marketing Ads transition data End
 ***********************************/

/**
 * GC Balance
 */
function displayGiftCardBalance(gcBalanceDetails) {
    $("#gift-card-balance-dialog").data("gcBalanceDetails", gcBalanceDetails).dialog("open");
}

/***********************************
 * FLASHiZ Scan QR Code Start
 ***********************************/
function displayFlashizQRCode(image) {
    $("#flasizQRCode-img").prop("src", "data:image/png;base64," + image);
    $("#flashizQRCode-dialog").dialog("open");
}

function closeFlashizQRCode() {
    $("#flashizQRCode-dialog").dialog("close");
}
/***********************************
 * FLASHiZ Scan QR Code End
 ***********************************/

/***********************************
 * MLC Scan QR Code Start
 ***********************************/
function displayMLCQRCode(data) {
    // $("#flashizQRCode-dialog img").remove();

    // var qrcode = new QRCode(document.getElementById("flashizQRCode-dialog"),
    // {
    //        width : 200,
    //        height : 200
    // });

    // qrcode.makeCode(data);
   
    
    $("#flashizQRCode-dialog canvas").remove();
    jQuery('#flashizQRCode-canvas').qrcode(data.QRCode);
    $("#midQrisTeks").text("MID : " + data.ReffNo);
    
    $("#flashizQRCode-dialog").dialog("open");
}

// function displayTopupBarcode(data) {
//     //$("#allotopupBarcode-dialog canvas").remove();
//     // Initialize input variable
//     // var inputValue = data.responseData.barcode; 
//     var inputValue = "12345670"; 
//     var barcodeType = "ean8";
//     var settings = {
//             output: "canvas", // renderer type
//             // bgColor: '#FFFFFF', //background color
//             // color: '#000000', // barcode color
//             barWidth: '5', // canvas width
//             barHeight: '200', // canvas height
//             // moduleSize: '1',
//             // posX: '5', // starting x position in canvas
//             // posY: '5', // starting y position in canvas
//             //addQuietZone: '1'
//         };

//     $('#allotopupBarcode-canvas').barcode(inputValue, barcodeType, settings);
//     $("#allotopupBarcode-dialog").dialog("open");

// }

// function closeTopupBarcode(data) {
//     $("#allotopupBarcode-dialog").dialog("close");

// }

function closeMLCQRCode() {
    $("#flashizQRCode-dialog").dialog("close");
}

function displayOVOQRCode(data) {

    $("#ovoQRCode-dialog canvas").remove();
    jQuery('#ovoQRCode-canvas').qrcode(data.qrStr);
    $("#midOvoTeks").text("MID : " + data.refNo);
    
    ovoCount=70;
    ovoCounter=setInterval(ovoTimer, 1000);

    $("#ovoQRCode-dialog").dialog("open");
}

function ovoTimer(){
    ovoCount=ovoCount-1;
    if (ovoCount < 0){
      clearInterval(ovoCounter);
      $("#ovoQRCodeExpired").text("QRCODE EXPIRED");
      closeOVOQRCode()
      return;  
    }
    $("#ovoQRCodeExpired").text(" EXPIRED :" + ovoCount + " secs");
  }

function closeOVOQRCode() {
    $("#ovoQRCode-dialog").dialog("close");
}
/***********************************
 * MLC Scan QR Code End
 ***********************************/

/***********************************
 * ALTO WECHAT QR Code Start
 ***********************************/
function displayAltoWeChatQRCode(data) {
    // $("#altoWeChatQRCode-dialog img").remove();

    // var qrcode = new QRCode(document.getElementById("altoWeChatQRCode-dialog"),
    // {
    //        width : 200,
    //        height : 200
    // });

    // qrcode.makeCode(data);

    $("#altoWeChatQRCode-dialog canvas").remove();
    jQuery('#altoWeChatQRCode-dialog').qrcode(data);

    $("#altoWeChatQRCode-dialog").dialog("open");
}

function closeAltoWeChatQRCode() {
    $("#altoWeChatQRCode-dialog").dialog("close");
}
/***********************************
 * ALTO WECHAT QR Code End
 ***********************************/

/***********************************
 * BalloonGame Start
 ***********************************/
function closeBalloonGameItemsDialog() {
    $("#balloonGameItemRedemption-dialog").dialog("close");
}
/***********************************
 * BalloonGame End
 ***********************************/

/**************************************************
 * Dialogs
 **************************************************/
$("#customerFeedback-dialog").dialog({
    width: 400,
    height: "auto",
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function(event, ui) {
        //if there are any function that must be exec on open
    },
    buttons: {
        //no buttons
    }
});

$("#gift-card-balance-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function(event, ui) {
        var gcBalance = $(this).data("gcBalanceDetails");

        var output = "Card #: " + maskValueWithX(gcBalance.cardNumber, 11, 'LAST') +
            "<br />Exp. Date: " + ((gcBalance.expireDate) ? formatGiftCardDate(gcBalance.expireDate) : "N/A") +
            "<br />Card Balance: " + numberWithCommas(gcBalance.balance);
        output = "<em>" + output + "</em><br />";
        $("#giftcardBalanceSummary").html(output);
    },
    buttons: {}
});

$("#crmEnterPIN-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function(event, ui) {
        //if there are any function that must be exec on open
    },
    buttons: {
        //no buttons
    }
});

$("#crm-message").on("dialogopen", function(event, ui) {
    $("#crm-message").dialog({ height: "auto" });
});

$("#crm-message").dialog({
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function() {

    }
});

$("#flashizQRCode-dialog").dialog({
    autoOpen: false,
    width: "auto",
    height: "auto",
    modal: true,
    resizable: false,
    autoResize: false,
    closeOnEscape: false,
    dialogClass: "no-close"
});

$("#allotopupBarcode-dialog").dialog({
    autoOpen: false,
    width: "auto",
    height: "auto",
    modal: true,
    resizable: false,
    autoResize: false,
    closeOnEscape: false,
    dialogClass: "no-close"
});



$("#altoWeChatQRCode-dialog").dialog({
    autoOpen: false,
    width: "auto",
    height: "auto",
    modal: true,
    resizable: false,
    autoResize: false,
    closeOnEscape: false,
    dialogClass: "no-close"
});

// MLC 2017-04-21
$("#mlcQRCode-dialog").dialog({
    autoOpen: false,
    width: "auto",
    height: "auto",
    modal: true,
    resizable: false,
    autoResize: false,
    closeOnEscape: false,
    dialogClass: "no-close"
});
// MLC 2017-04-21
$("#ovoQRCode-dialog").dialog({
    autoOpen: false,
    width: "auto",
    height: "auto",
    modal: true,
    resizable: false,
    autoResize: false,
    closeOnEscape: false,
    dialogClass: "no-close"
});
$("#balloonGameItemRedemption-dialog").dialog({
    width: 560,
    height: 420,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function(event, ui) {

    },
    buttons: {
        "Redeem": function() {
            var selectedBalloons = BALLOON_GAME.getBalloonGameSelectedItems();
            if (selectedBalloons != null && selectedBalloons.length > 0) {
                BALLOON_GAME.sendRedeemDataToCashier(selectedBalloons);
                $(this).dialog("close");
            } else {
                showMsgDialog(getMsgValue('balloon_game_customer_no_select'), "warning");
            }
        },
        "Cancel": function() {
            BALLOON_GAME.closeLoadingDialog();
            $(this).dialog("close");
        }
    }
});

$("#balloonGameUser-dialog").dialog({
    width: 370,
    height: 220,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    close: function(event, ui) {
        $("#balloonGameUserText").val("");
    },
    buttons: {
        "OK": function() {
            var memberId = $("#balloonGameUserText").val();
            BALLOON_GAME.requestRedeemableItemsToCashier(memberId);
            $(this).dialog("close");
        },
        "Cancel": function() {
            $(this).dialog("close");
        }
    }
});

// INHOUSE VOUCHER 2017-04-13
$("#voucherInfo-dialog").dialog({
    width: 430,
    height: 250,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function(event, ui) {
        $("#voucherInfoMsg").empty();

        var voucherResp = $(this).data('voucherResp');
        $('#voucherNumberInfo').text(voucherResp.result.voucherId);
        $('#voucherAmountInfo').text(numberWithCommas(voucherResp.result.voucherAmt));
        $('#voucherExpDateInfo').text(voucherResp.result.expDate);
        $('#voucherStatusInfo').text(voucherResp.result.status);
        $("#voucherInfo-dialog").dialog('open');
    }
});

//CHECK PRICE DIALOG
$("#itemCheck-dialog").dialog({
    width: 430,
    height: 250,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function(event, ui) {
        var itemCheck = $(this).data('itemCheck');
        if (itemCheck) {
            // Update the dialog with new product details
            $("#itemName").text(itemCheck.itemName);
            $("#itemPrice").text(numberWithCommas(itemCheck.itemPrice));
            $("#itemBarcode").text(itemCheck.itemBarcode);
            $("#afterPrice").text(numberWithCommas(itemCheck.afterPrice));
        } else {
            // Clear the details if itemCheck is not defined
            $("#itemName").empty();
            $("#itemPrice").empty();
            $("#itemBarcode").empty();
            $("#afterPrice").empty();
        }
    }
});

$("#eventInfo-dialog").dialog({
    width: 430,
    height: 450,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function() {
        var eventInfo = $(this).data('eventInfo');
        $("#eventInfo-dialog-content").html(eventInfo);
        //setTimeout(function(){ $("#eventInfo-dialog").dialog('close'); }, parseInt(getConfigValue("CUST_FB_TIMEOUT")));
    },
    buttons: {
        OK: function() {
            $(this).dialog("close");
            //CustomerPopupScreen.cus_closeEventInfo();
        }
    }
});
$("#eleboxCustomer-dialog").dialog({
    width: 430,
    height: 450,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function(event, ui) {
        var eleboxDataCustomer = $(this).data('data');
        $("#eleboxInfo-dialog").html(eleboxDataCustomer);
    },
    buttons: {
        //no buttons
    }
});
$("#eleboxStatus-dialog").dialog({
    width: 430,
    height: 500,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function(event, ui) {

    },
    buttons: {
        //no buttons
    }
});
$("#eleboxFailedStatus-dialog").dialog({
    width: 430,
    height: 500,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function(event, ui) {
        var eleboxFailCustomer = $(this).data('data');
        $("#eleboxFailedStatus-dialog").html(eleboxFailCustomer);
    },
    buttons: {
        //no buttons
    }
});
$("#bpjs-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function(event, ui) {
        //
    },
    buttons: {
        //no buttons
    }
});
$("#bpjsAdvice-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function(event, ui) {
        //
    },
    buttons: {
        //no buttons
    }
});
$("#simpatindoInfo-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function(event, ui) {
        //
    },
    buttons: {
        //no buttons
    }
});
$("#simpatindoAdvice-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function(event, ui) {
        //
    },
    buttons: {
        //no buttons
    }
});
$("#donationCustomer-dialog").dialog({
    width: 510,
    height: 400,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function(event, ui) {
        //
    },
    buttons: {
        //no buttons
    }
});
$("#custLoyalty_mail_info2-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function(event, ui) {
        //
    },
    buttons: {
        //no buttons
    }
});

function displayTopupBarcode(data) {

    // $("#ovoQRCode-dialog canvas").remove();
    // jQuery('#ovoQRCode-canvas').qrcode(data.qrStr);
    // $("#midOvoTeks").text("MID : " + data.refNo);

    $("#allotopupBarcode-dialog canvas").remove();
    // Initialize input variable
    var inputValue = data.responseData.barcode; 
    var barcodeType = "code128";
    var settings = {
            //output: "canvas", // renderer type
            barWidth: '2', // canvas width
            barHeight: '100', // canvas height
            moduleSize: '1',
            posX: '1', // starting x position in canvas
            posY: '1', // starting y position in canvas
            //addQuietZone: '1'
        };

    $('#allotopupBarcode-canvas').barcode(inputValue, barcodeType, settings);
    $("#allotopupBarcode-dialog").dialog("open");

}

function closeTopupBarcode(data) {
    $("#allotopupBarcode-dialog").dialog("close");

}