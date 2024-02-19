var customerWinObject;
var winName = "cusScreen";
var predefinedParams = [
    'screenX = 801', // + screen.width,
    'screenLeft = 801', // + screen.width,
    'screenY = 0',
    'screenTop = 0',
    'height = 600', // + screen.height,
    'width = 800', // + screen.width,
    'fullscreen = 0',
    'scrollbars = 0',
    'resizable = 0',
    'location = 0'
];

$(document).ready(function() {
    CustomerPopupScreen.createPopup(posWebContextPath + '/customer/main');
});

function CustomerPopupScreen() {}

/**
 * Will create a customer's window(screen).
 */
CustomerPopupScreen.createPopup = function(url, params) {
    if (params) {
        customerWinObject = window.open(url, winName, params);
    } else {
        customerWinObject = window.open(url, winName, predefinedParams);
    }
};

CustomerPopupScreen.cus_renderItemQuantity = function(qty, isVoid) {
    var _data = {
        "messageType": "RENDER_ITEM_QUANTITY",
        "quantity": qty,
        "isVoid": isVoid
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

/**
 * Sends data/msg to customer's window(screen).
 */
CustomerPopupScreen.cus_renderScannedItem = function(tx, type, item) {
    var _data = {
        "messageType": "RENDER_SCANNED_ITEM",
        "tx": tx,
        "type": type,
        "item": item
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_renderPaymentItem = function(item) {
    var _data = {
        "messageType": "RENDER_PAYMENT_ITEM",
        "item": item
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_renderVoidedItem = function(itemData, tx) {
    var _data = {
        "messageType": "RENDER_VOIDED_ITEM",
        "itemData": itemData,
        "tx": tx
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

/**
 * Displays voided transaction on customer screen.
 */
CustomerPopupScreen.cus_renderVoidTxn = function(data) {
    var _data = {
        "messageType": "RENDER_VOID_TXN",
        "txData": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

/**
 * Displays recalled transaction on customer screen.
 */
CustomerPopupScreen.cus_renderTxn = function(tx, orderItems, totalAmount, totalQuantity, voidedDiscount, type) {
    var _data = {
        "messageType": "RENDER_TXN",
        "tx": tx,
        "orderItems": orderItems,
        "totalAmount": totalAmount,
        "totalQuantity": totalQuantity,
        "voidedDiscount": voidedDiscount
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_renderPaymentInfo = function(data) {

    var _data = {
        "messageType": "RENDER_PAYMENT_INFO",
        "txData": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_renderScreenReceiptFooter = function(data, pointReward) {
    var _data = {
        "messageType": "RENDER_SCREEN_RECEIPT_FOOTER",
        "txData": data,
        "pointReward": pointReward
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_renderTopUpInfo = function(data) {
    var _data = {
        "messageType": "RENDER_TOPUP_INFO",
        "txData": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_renderIndosmartInfo = function(data) {
    var _data = {
        "messageType": "RENDER_INDOSMART_INFO",
        "txData": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_renderMCashInfo = function(data) {
    var _data = {
        "messageType": "RENDER_MCASH_INFO",
        "txData": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};


CustomerPopupScreen.cus_renderAlterraInfo = function(data) {
    var _data = {
        "messageType": "RENDER_ALTERRA_INFO",
        "txData": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
/**
 * Clears scanned item of customer's window(screen).
 */
CustomerPopupScreen.cus_clearOrder = function() {
    var _data = {
        "messageType": "CLEAR_ORDER"
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

/**
 * Renders subtotal and total quantity of customer's window(screen).
 */
CustomerPopupScreen.cus_renderTotal = function(totalAmount, totalQuantity, totalDiscount) {
    var _data = {
        "messageType": "RENDER_TOTAL_ITEM",
        "totalAmount": totalAmount,
        "totalQuantity": totalQuantity,
        "totalDiscount": totalDiscount
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

/**
 * Renders transaction type on customer's window(screen).
 */
CustomerPopupScreen.cus_renderTransactionType = function(type) {
    var _data = {
        "messageType": "RENDER_TX_TYPE",
        "type": type
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

/**
 * Re-Renders items scanned on customer's window(screen).
 */
CustomerPopupScreen.cus_removeScannedItem = function(productId, disableClrFn) {
    var _data = {
        "messageType": "REMOVE_SCANNED_ITEM",
        "productId": productId,
        "disableClrFn": disableClrFn
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_clearTrigger = function(disableClrFn) {
    var _data = {
        "messageType": "CLEAR_TRIGGER",
        "disableClrFn": disableClrFn
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

/**
 * removes rendered quantity on customer's window(screen).
 */
CustomerPopupScreen.cus_removeRenderedQuantity = function() {
    var _data = {
        "messageType": "REMOVE_RENDERED_QUANTITY"
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

/*CustomerPopupScreen.cus_renderGiftCardBalance = function(data) {
    var _data = {
        "messageType": "RENDER_GIFT_CARD_BALANCE",
        "txData": data
    };
    customerWinObject.postMessage(_data,location.protocol+"//"+location.host);
};*/

CustomerPopupScreen.cus_enableFeedback = function(enable, feedbackSettings) {
    var _data = {
        "messageType": "ENABLE_CUST_FEEDBACK",
        "enableCustFeedback": enable,
        "feedbackSettings": JSON.stringify(feedbackSettings)
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

//CHECK PRICE FOR CUSTOMER
CustomerPopupScreen.cus_showCheckPriceDialog = function() {
    var _data = {
        "messageType": "OPEN_CHECK_PRICE_DIALOG",
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_clearCheckPrice = function() {
    var _data = {
        "messageType": "CLEAR_CHECK_PRICE_DIALOG",
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_showCheckPrice = function(data) {
    var _data = {
        "messageType": "OPEN_CHECK_PRICE_INFO",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_closeCheckPrice = function() {
    var _data = {
        "messageType": "CLOSE_CHECK_PRICE_INFO",
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_closeFeedback = function() {
    var _data = {
        "messageType": "CLOSE_CUST_FEEDBACK"
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_crmEnterPin = function() {
    var _data = {
        "messageType": "ENABLE_CRM_PIN"
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_crmIsValidPin = function(isValidPin, status) {
    var _data = {
        "messageType": "IS_VALID_PIN",
        "isValidPin": isValidPin,
        "status": status
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_crmCloseShowPoints = function() {
    var _data = {
        "messageType": "CLOSE_SHOW_POINTS"
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_crmShowPoints = function(crmResponse) {
    var _data = {
        "messageType": "SHOW_POINTS",
        "crmResponse": crmResponse
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_renderAppliedPromotions = function(data) {
    var _data = {
        "messageType": "RENDER_APPLIED_PROMOTIONS",
        "promoData": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_renderAppliedEmployeeDiscount = function(data) {
    var _data = {
        "messageType": "RENDER_APPLIED_EMP_DISC",
        "empDiscData": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

/**
 * Customer renders last scanned item details
 */
CustomerPopupScreen.cus_renderProductDetails = function(prodDetails) {
    var _data = {
        "messageType": "RENDER_PROD_DETAILS",
        "prodDetails": prodDetails
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

/**
 * Changes customer view if cashier is idle/active
 */
//CustomerPopupScreen.cus_renderActiveScreen = function(isIdle, toggleTempOff) {
//	var _data = {
//		"messageType": "RENDER_ACTIVE_SCREEN",
//		"isIdle": isIdle,
//		"toggleTempOff": toggleTempOff
//	};
//	customerWinObject.postMessage(_data,location.protocol+"//"+location.host);
//};

/**
 * Display details of multiple payment media
 */
CustomerPopupScreen.cus_renderPaymentDetails = function(paymentMediaDetails) {
    var _data = {
        "messageType": "RENDER_PAYMENT_DETAILS",
        "paymentMediaDetails": paymentMediaDetails
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

/**
 * Marketing Ads Transition
 */
CustomerPopupScreen.cus_setMarketingAdsTransition = function(transitionData, terminalModel) {
    var _data = {
        "terminalModel": terminalModel,
        "messageType": "MARKETING_ADS_TRANSITION",
        "transitionData": transitionData
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

/**
 * Changes customer view by CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES
 */
CustomerPopupScreen.cus_renderActiveScreen = function(custPageScreenType) {
    var _data = {
        "messageType": "RENDER_ACTIVE_SCREEN",
        "custPageScreenType": custPageScreenType
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

/**
 * show gift card balance from customer page
 */
CustomerPopupScreen.cus_renderGiftCardBalance = function(gcBalanceDetails) {
    var _data = {
        "messageType": "RENDER_GIFT_CARD_BALANCE",
        "gcBalanceDetails": gcBalanceDetails
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

/**
 * show gift card balance from customer page
 */
CustomerPopupScreen.cus_closeGiftCardBalanceDialog = function() {
    var _data = {
        "messageType": "CLOSE_GIFT_CARD_BALANCE_DIALOG"
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_renderCustomerInfo = function(name, id) {
    var _data = {
        "messageType": "CUSTOMER_INFO",
        "name": name,
        "id": id
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_openFlashizQRCodeDialog = function(image) {
    var _data = {
        "messageType": "OPEN_FLASHIZ_QR_CODE",
        "image": image
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_closeFlashizQRCodeDialog = function() {
    var _data = {
        "messageType": "CLOSE_FLASHIZ_QR_CODE"
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_openAltoWeChatQRCodeDialog = function(data) {
    var _data = {
        "messageType": "OPEN_ALTO_WECHAT_QR_CODE",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_closeAltoWeChatQRCodeDialog = function() {
    var _data = {
        "messageType": "CLOSE_ALTO_WECHAT_QR_CODE"
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

// MLC 2017-04-21
CustomerPopupScreen.cus_openMLCQRCodeDialog = function(data) {
    var _data = {
        "messageType": "OPEN_MLC_QR_CODE",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_closeMLCQRCodeDialog = function() {
    var _data = {
        "messageType": "CLOSE_MLC_QR_CODE"
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
// MLC 2017-04-21

CustomerPopupScreen.cus_openOVOQRCodeDialog = function(data) {
    var _data = {
        "messageType": "OPEN_OVO_QR_CODE",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_openTopupBarcodeDialog = function(data) {
    var _data = {
        "messageType": "OPEN_TOPUP_BARCODE",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_closeTopupBarcodeDialog = function() {
    var _data = {
        "messageType": "CLOSE_TOPUP_BARCODE"
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_closeOVOQRCodeDialog = function() {
    var _data = {
        "messageType": "CLOSE_OVO_QR_CODE"
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_openBalloonGameUserDialog = function() {
    var _data = {
        "messageType": "OPEN_BALLOON_GAME_USER_DIALOG"
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_openBalloonGameItemsDialog = function(memberId, redeemableItems, itemThreshold) {
    var _data = {
        "messageType": "OPEN_BALLOON_GAME_ITEMS_DIALOG",
        "redeemableItems": redeemableItems,
        "itemThreshold": itemThreshold,
        "memberId": memberId
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_closeBalloonGameItemsDialog = function() {
    var _data = {
        "messageType": "CLOSE_BALLOON_GAME_ITEMS_DIALOG"
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_showFlashPaymentInfo = function(flashInfo) {
    var _data = {
        "messageType": "FLASHIZ_PAYMENT_SUCCESSFUL_INFO",
        "flashInfo": flashInfo
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

// INHOUSE VOUCHER 2017-04-13
CustomerPopupScreen.cus_showVoucherInfo = function(voucherInfo) {
    var _data = {
        "messageType": "INQUIRY_VOUCHER_INFO",
        "voucherInfo": voucherInfo
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_closeVoucherInfo = function(voucherInfo) {
    var _data = {
        "messageType": "CLOSE_VOUCHER_INFO"
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
// INHOUSE VOUCHER 2017-04-13

CustomerPopupScreen.cus_showEventInfo = function(eventInfo) {
    var _data = {
        "messageType": "EVENT_PROMO_INFO",
        "eventInfo": eventInfo
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

CustomerPopupScreen.cus_closeEventInfo = function(eventInfo) {
    var _data = {
        "messageType": "CLOSE_EVENT_INFO"
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
}; //ELEBOX
CustomerPopupScreen.cus_renderEleboxDetails = function(eleboxData) {
    var _data = {
        "messageType": "ELEBOX_INFO",
        "data": eleboxData
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_showEleboxCustomer = function(eleboxCustomer) {
    var _data = {
        "messageType": "ELEBOX_CUSTOMER_VIEW",
        "data": eleboxCustomer
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_showEleboxDialog = function(data) {
    var _data = {
        "messageType": "ELEBOX_CUSTOMER_DIALOG",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_showEleboxInfoStatus = function(eleboxCustomer) {
    var _data = {
        "messageType": "ELEBOX_INFO_STATUS",
        "data": eleboxCustomer
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_showEleboxDialogStatus = function(status) {
    var _data = {
        "messageType": "ELEBOX_DIALOG_STATUS",
        "status": status
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_EleboxRemove = function(data) {
    var _data = {
        "messageType": "ELEBOX_CUSTOMER_REMOVE"
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_EleboxStatusRemove = function(data) {
    var _data = {
        "messageType": "ELEBOX_STATUS_REMOVE"
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_showEleboxFailed = function(data) {
    var _data = {
        "messageType": "ELEBOX_FAILED_STATUS",
        "status": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_showEleboxFailDialog = function(data) {
    var _data = {
        "messageType": "ELEBOX_FAILED_DIALOG",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_EleboxFailedRemove = function(data) {
    var _data = {
        "messageType": "ELEBOX_FAILED_REMOVE"
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

//BPJS
CustomerPopupScreen.cus_BpjsStatusRemove = function(data) {
    var _data = {
        "messageType": "BPJS_STATUS_REMOVE"
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_showBPJS = function(data) {
    var _data = {
        "messageType": "BPJS_STATUS",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_showBPJSDialog = function(data) {
    var _data = {
        "messageType": "BPJS_DIALOG",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
//SIMPATINDO
CustomerPopupScreen.cus_simpatindoStatusRemove = function(data) {
    var _data = {
        "messageType": "REMOVE_SIMPATINDO_DIALOG"
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_showSimpatindo = function(data) {
    var _data = {
        "messageType": "SIMPATINDO_STATUS",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_showSimpatindoDialog = function(data) {
    var _data = {
        "messageType": "SIMPATINDO_DIALOG",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
//DONASI
CustomerPopupScreen.cus_renderDonasiDetails = function(donasiData) {
    var _data = {
        "messageType": "DONASI_INFO",
        "data": donasiData
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_showDonasiCustomer = function(donasiCustomer) {
    var _data = {
        "messageType": "DONASI_CUSTOMER_VIEW",
        "data": donasiCustomer
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_showDonasiDialog = function(data) {
    var _data = {
        "messageType": "DONASI_CUSTOMER_DIALOG",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_removeDonasiDialog = function(data) {
    var _data = {
        "messageType": "REMOVE_DONASI_DIALOG",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};

//END DONASI
CustomerPopupScreen.cus_removeBPJSDialog = function(data) {
    var _data = {
        "messageType": "REMOVE_BPJS_DIALOG",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_showBPJSAdvice = function(data) {
    var _data = {
        "messageType": "BPJS_ADVICE",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_showBPJSDialogAdvice = function(data) {
    var _data = {
        "messageType": "BPJS_ADVICE_DIALOG",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_removeBPJSAdviceDialog = function(data) {
    var _data = {
        "messageType": "REMOVE_ADVICE_DIALOG",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_showSimpatindoAdvice = function(data) {
    var _data = {
        "messageType": "SIMPATINDO_ADVICE",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_showSimpatindoDialogAdvice = function(data) {
    var _data = {
        "messageType": "SIMPATINDO_ADVICE_DIALOG",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_removeSimpatindoAdviceDialog = function(data) {
    var _data = {
        "messageType": "REMOVE_SIMPATINDO_ADVICE_DIALOG",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_showLoyaltyMailDialog = function(data) {
    var _data = {
        "messageType": "LOYALTY_MAIL_DIALOG",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};
CustomerPopupScreen.cus_removeLoyaltyMailDialog = function(data) {
    var _data = {
        "messageType": "REMOVE_LOYALTY_MAIL_DIALOG",
        "data": data
    };
    customerWinObject.postMessage(_data, location.protocol + "//" + location.host);
};