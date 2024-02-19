var proxyUrl = 'http://localhost:8089';
var configuration;

// used in calculator and function pad
var deptStoreTempEan = null;
var enablePaymentMedia = false;
var toggleVoid = false;
var toggleTVS = false;
var toggleQty = false;
var toggleTotal = false;
var toggleCancelSale = false;
var toggleLogout = false;
var toggleReprintReceipt = false;
var toggleOpenDrawer = false;
var togglePostVoid = false;
var toggleStoreSale = false;
var toggleRecallSale = false;
var isStoreSaleTransaction = false;
var toggleEFTOnline = false;
var toggleRounding = false;
var enableRoundingBarcodeScan = false;
var toggleCpnInt = false;
var toggleTempOff = false; // TEMP OFF flag
var toggleEmpCard = false; // EMPLOYEE CARD flag
var toggleLoyaltyCard = false; // LOYALTY CARD flag.
var toggleBankMega = false;
// var loyEarnPointsSelected = false;
var toggleGCMMSRedemptionVoid = false;
var availEmpLoyaltyPoints = false;
var dfltText = "";
var cleared = true;
var itemQty = 1;
var previousTxType = "";
var productObj = null;
var cpnIntAvailableAmt = 0;
var earnLoyaltyProgram = [];

// used in topup transaction
var topUpObj = null;
var topUpTempObj = null; //used for printing duplicate
var processtopUpStdSleCntr = 0;
var topUpItemRefundFlag = false;

// used in indosmart transaction
var indosmartObj = null;
var indosmartTempObj = null; //used for printing duplicate
var processIndosmartStdSleCntr = 0;
var indosmartItemRefundFlag = false;

// used in mcash transaction
var mCashObj = null;
var mCashTempObj = null; //used for printing duplicate
var processMCashStdSleCntr = 0;
var mCashItemRefundFlag = false;
var mCashInquiryCounter = 1000;

// used in alterra transaction
var alterraObj = null;
var alterraTempObj = null; //used for printing duplicate
var processAlterraStdSleCntr = 0;
var alterraItemRefundFlag = false;
var alterraInquiryCounter = 1000;

var store;
var scannedItemOrder = -1;
var priceChecker = false;
var isSaleStarted = false;
var searchData = null;
var saleTx = null;
var isPOSClear = true;
var lastBarcodeScanned = "";

//gift card transactions
//note that gift card transaction cannot be mixed with other type of
//transaction
var isInputGiftCardNumber = false;
var isGiftCardBalanceInquiry = false;
var isGCActivation = false;
var isGCPaymentMedia = false;
var gcPaymentAmount = 0;
var cancelledGCItem = null;
var hasGiftCardRedemption = false;
var isEnablePaymentMedia = false;
var isEVoucherGiftCard = false;
var checkMcashTrx = false;
var inquiryOnRedeem = false;

// flag for clearing function. Value is false if enabling CLEAR function.
var disableClrFn = false;

//For New Donation
var donationNotValid = false;
var donationValidPaymentMedia = "";
var donationExecute = [];
var hasDonationCheck = false;
var donationVal = 0;
var beforeDonationPayment = 0;
var tempDisc = 0;
var donationPromoItem = [];
var donationOrderItem = [];
var cancelCmcDonation = false;
// Promotions
var calculatePromotion = false;
var promoDiscount = 0;
// contains initial list of promotions, upon initial validation (date, time,
// day)
var promotionsMap = {};
var promotionItems = [];
var enableCoBrand = false;
var memberPromos = {};
var coBrandDiscountStatus;
var itemScanDatesMap = {};
var addedCrmResponse = {};
//Bank Obj for eft online
var bankTransactionType = null;

var couponCancelledCmcDiscount = false;

//flag for valid tax invoice number generated
var isTaxInvSeqAvailable = true;

// customer feedback
var customerFeedback = null;
var lastCustFeedbackTrxId = null;

var isFeedbackGiven = false;
var feedbackSettings = {
    "timeout": 20000,
    "message": "Please rate our cashier's performance"
};

var TRIAL_MODE_URL_PARAM = "?trailMode={0}";

// connection status
var connectionOnline = true;

// for extra warranty
//var applianceAndWarranty = null;

// for installment
var isInstallmentTransaction = false;
var installmentPayent;
var installmentPaymentDetails;

// for Employee/Loyalty Card
var customerIdForReward = null;
var customerContactForReward = null;
var isMemberContactSelected = false;
var customerPin = null;
var pointReward = null;
var toggleCRMPoints = false;
var crmPointsAmount = null;
var enableCRMPaymentMedia = false;
var totalCRMPoints = null;
var profitCodes = null;
//var runningNonMemberMarkup = 0;
var toggleCRMPayment = true;
var crmEarnPointsSelected = false;
var crmBalInquirySelected = false;
var crmRedeemPointsSelected = false;
var crmMemberId;
var crmEnableEmpIdScan = false;
var crmRedeemAmountPaid = null;
var isMembershipToBeRenewed = false;
var isOnGcMmsRedemptionMode = false;
var crmToggleMembershipRenewal = false;
var pendingPwpPromo = {};

//for role based cashier functionality
var cashierRole = {
    "initialized": false,
    "isSalesCashier": false,
    "isCustomerServiceCashier": false
};

//used in commonDisplay to avoid errors during call of
//cashier side codes on customer view
var isCustomerView = false;

// container for regular reminders
var regularReminders = [];

//used in saving the UI state of system msg
var savedSysMsg = null;

//TVS Product Override Map
var tVSProductPriceOverrideMap = {};
var tVSTxApproverUserId = null;

//Banana Report Form DTO
var bananaReportFormDTO = null;

var currentPaymentMediaType = null;
var terminalModel = null;

/**
 * Authentication data keys, used for deleting
 * previously assigned values to these keys.
 */
var AUTH_DATA_KEYS = ['roles', 'defer', 'interventionType', 'tempSignOffData', 'trainingMode'];

// variable to flag input from scanner
var isInputFromScanner = false;

var paymentAmtEFTWC;

var printTo = "P";

var alloPaylaterDiscountToggled  = false;

var kidcityEnable = false;
var kidcityEnableStatus;

var midnightSalesPreLogin = false;
var midnightSalesSuccessLogin = false;

var isEnabledAgainEmotor = true;

//event listener for events from customer window
window.addEventListener('message', function(event) {
    if (event.origin == location.protocol + "//" + location.host) {
        if (event.data.messageType == "CUSTOMER_FEEDBACK") {
            customerFeedback.customerSatisfaction = event.data.customerFeedback;
            isFeedbackGiven = true;
            //if(event.data.customerFeedback != 0){
            saveCustomerFeedback();
            //}
            if (saleTx.orderItems && saleTx.orderItems.length < 1) displayOrderMessageChanges(true);
        } else if (event.data.messageType == "CUSTOMER_PIN") {
            customerPin = event.data.customerPin;

            var crmResponse = validateCRMPin(customerIdForReward, customerPin);

            if (crmResponse && crmResponse.type == 'SUCCESS') {
                sendCustomerPinToCustomer(true, "");
                $("#enterPin-message").dialog("close");
                payWithPoints(saleTx);
            } else if (crmResponse.messageCode == "ERR005" ||
                crmResponse.messageCode == "ERR003" ||
                crmResponse.messageCode == "ERR004") {
                $("#enterPinErrorMsg").html(getMsgValue('pos_label_cannot_connect_to_crm_web'));
                sendCustomerPinToCustomer(false, crmResponse.messageCode);
                //				$("#crmMsgSpan").html(getMsgValue('pos_label_cannot_connect_to_crm_web'));
            } else {
                sendCustomerPinToCustomer(false, "");
                $("#enterPinErrorMsg").html(getMsgValue('pos_label_invalid_pin'));
            }
        } else if (event.data.messageType == "CANCEL_PAY_WITH_POINTS") {
            $("#enterPin-message").dialog("close");
            $("#enterPinErrorMsg").empty();
        } else if (event.data.messageType == "BALLOON_GAME_REDEEM_DATA") {
            var selectedItems = event.data.balloonGameSelectedItems;
            var memberId = event.data.memberId;

            //Opens cashier loading screen if it isnt.
            $("#loading-dialog").dialog("open");
            $("#loadingDialogMessage").html(getMsgValue("balloon_game_loading_msg2"));

            if (selectedItems != null && memberId != null) {
                // TODO find a better way to do this
                // add delay to avoid loading screen not showing
                setTimeout(function() {
                    BALLOON_GAME.redeemBalloons(memberId, selectedItems);
                }, 100);
            }

        } else if (event.data.messageType == "BALLOON_GAME_CLOSE_CASHIER_LOADING_DIALOG") {
            //Close BalloonGame Customer Waiting Dialog. Issued from Customer Page
            $("#loading-dialog").dialog("close");
            $("#balloonGameLoading-dialog").dialog("close");
        }
    }
}, false);

$(document).ready(function() {
    disableClrFn = false;

    //Initiate global ajax handlers, see: ajaxGlobalHandler.js
    AjaxGlobalHandler.initiate();

    if (!processChangePassword()) {
        DrawerModule.openDrawer({ afterLogin: true });
    }

    // popup dialog for more menu
    $(".inline").colorbox({ inline: true, width: "50%" });
    $(".inline-extended").colorbox({ inline: true, width: "50%", height: "45%" });
    $(".button-more-menu .button-menu").click(function() {
        $("#inline_functioncontent").colorbox.close();
    });

    // popup dialog for kids city
    $(".inline").colorbox({ inline: true, width: "50%" });
    $(".inline-extended").colorbox({ inline: true, width: "50%", height: "45%" });
    $(".button-more-menu .button-menu").click(function() {
        $("#kids-city").colorbox.close();
    });

    loadCashierPage();

    /***********************************
     * Connect with proxy server using socket.io
     ***********************************/
    var socket = io.connect(proxyUrl);

    socket.on('configData', function(data) {
        configuration = JSON.parse(data);
        terminalModel = configuration.terminalModel;
        initMarketingAdds();
        initHypercash();
        initDeptstore();
    });

    socket.on('uname', function(data) {
        //uilog('DBUG','uname: ' + data);
        if (data) {
            loggedInUsername = data;
        }
    });

    socket.on('uroles', function(uroles) {
        //uilog('DBUG','uroles: ' + uroles);
        if (uroles) {
            cashierRole = {
                "initialized": true,
                "isSalesCashier": uroles.indexOf('ROLE_CASHIER_SALES') > -1,
                "isCustomerServiceCashier": uroles.indexOf('ROLE_CUSTOMER_SERVICE') > -1
            };
        }
    });

    socket.on('connStatus', function(data) {
        connectionOnline = data;
        connectionOnline = true;
        processConnectionStatus();
    });

    socket.on('configUpdateData', function(data) {
        var configProps = JSON.parse(data).properties;
        var propKeys = Object.keys(configProps);
        for (var i = 0; i < propKeys.length; i++) {
            configuration.properties[propKeys[i]] = configProps[propKeys[i]];
            //uilog("DBUG", propKeys[i], " = ", configuration.properties[propKeys[i]]);
        }
    });

    /* scanner listener from proxy */
    socket.on('scanBarcode', function(data)

        {
            isInputFromScanner = true;
            if (data && data.length == 20 && $("#giftcard-input-dialog").dialog("isOpen")) {
                $("#giftcardInputField").val(data);
                uilog("INFO", "Scanned barcode (GC): " + data);
            } else if (data && data.length == 20 && $("#evoucher-input-dialog").dialog("isOpen")) {
                $("#eVoucherGiftCard").val(data);
            } else if (data && $("#itemCheck-dialog").dialog("isOpen")) {
                $("#inputItem").val(data);
            } else if (data && $("#MotorListrik-dialog").dialog("isOpen")) {
                $("#MotorListrikNumField").val(data);
            } else if (data && data.length == 13 && $("#depstore-detail-dialog").dialog("isOpen") && $("#depstoreBarcodeField").is(":focus")) {
                if (configuration.properties['DEPTSTORE_PRICE_PREFIX'].split(',').indexOf(data.substring(0, 1)) < 0) {
                    uilog("INFO", "Scanned barcode (DEPTSTORE PRICE): " + data);
                    showMsgDialog('Please scan price barcode (prefix ' + configuration.properties['DEPTSTORE_PRICE_PREFIX'] + ')', 'warning');
                } else {
                    uilog("INFO", "Scanned barcode (DEPTSTORE PROD): " + data);
                    $("#depstoreBarcodeField").keyboard().getkeyboard().insertText(data);
                    $("#depstoreBarcodeField").val(data);
                }
            } else if (data && $("#tspcOrder").is(":focus")) {
                uilog("INFO", "Scanned SPO (SPO PROD): " + data);
                $("#tspcOrder").keyboard().getkeyboard().insertText(data);
                $("#tspcOrder").val(data);
            } else if (data && $("#depstoreSPGField").is(":focus")) {
                uilog("INFO", "Scanned barcode (DEPTSTORE SPG): " + data);
                $("#depstoreSPGField").val(data);
            }
            // INDENT 2017-05-18
            else if (data && $("#indentSlip").is(":focus")) {
                //$("#indentSlip").keyboard().getkeyboard().insertText(data);
                $("#indentSlip").val();
                uilog("INFO", "Scanned barcode (CREATE INDENT SLIP): " + $("#indentSlip").val());
            }
            // INDENT 2017-05-18
            // voidDeptStore 2017022
            else if (data && $("#voidDeptStorePrice").is(":focus")) {
                uilog("INFO", "Scanned void barcode price (VOID DEPT STORE): " + data);
                $("#voidDeptStorePrice").keyboard().getkeyboard().insertText(parseInt(data.substring(1, 12)));
                $("#voidDeptStorePrice").val(parseInt(data.substring(1, 12)));
            }
            // voidDeptStore 2017022
            else if (data && $("#depstore-voucher-dialog").dialog("isOpen")) {
                uilog("INFO", "Scanned barcode (DEPTSTORE VOUCHER): " + data);
                $("#depstoreVoucherField").val(data.substring(1));
            } else if ($("#staffId-dialog").dialog("isOpen")) {
                $("#tstaffId").val();
                uilog("INFO", "Scanned staff Id " + $("#tstaffId").val());
            } else if ($("#specialOrder-dialog").dialog("isOpen")) {
                $("#tspcOrder").val();
                uilog("INFO", "Scanned SPO No " + $("#tspcOrder").val());
            } else if ($("#trkPoint-dialog").dialog("isOpen")) {
                $("#trkPoint").val();
                uilog("INFO", "Scanned barcode (trkPoint): " + $("#trkPoint").val());
            } else if ($("#trkSales-dialog").dialog("isOpen")) {
                $("#trkSales").val();
                uilog("INFO", "Scanned barcode (trkSales): " + $("#trkSales").val());
            } else if (isToProcessScannedBarcode() && isToProcessFreshBarcode(data) && !toggleTempOff && (!$("#elebox-receipt-dialog").dialog("isOpen")) && (!$("#bpjs-receipt-dialog").dialog("isOpen"))) {
                // CR XREPORT
                if (!isInputGiftCardNumber) {
                    saleTx.scanItemCount++;
                    uilog('INFO', saleTx.scanItemCount);
                }
                // CR XREPORT

                uilog("INFO", "Scanned barcode: " + data);
                dataReceived(data);
            } else if (data && data.length == 13 && $("#elebox-receipt-dialog").dialog("isOpen") && isToProcessScannedBarcode()) {
                uilog('DBUG', "Scanned barcode Elebox: " + data);
                if ($("#eleboxOrderIDField").is(":focus")) {
                    $("#eleboxOrderIDField").keyboard().getkeyboard().insertText(data);
                } else {
                    $("#eleboxOrderIDField").val(data);
                }
            } else if (data && data.length == 13 && $("#bpjs-receipt-dialog").dialog("isOpen") && isToProcessScannedBarcode()) {
                uilog('DBUG', "Scanned barcode Bpjs: " + data);
                $("#bpjsOrderIDField").val(data);
            }
            //MKT voucher
            else if(data && $("#marketing-voucher-dialog").dialog("isOpen")){
                $("#marketingVoucherField").val(data);
                uilog('DBUG', "Scanned marketing voucher: " + data);
            }
        });

    socket.on('scanBarcodeErr', function(data) {
        if (data) {
            uilog("ERRO", "Scanned barcode error: " + data);
            showMsgDialog(getMsgValue("pos_error_msg_" + data), "info");
        }
    });

    /* scanner listener from proxy */
    socket.on('mouseData', function(data) {
        barcode = data.data || null;
        //uilog("DBUG","barcode: " + barcode);
        if (barcode &&
            barcode.length == 20 &&
            $("#giftcard-input-dialog").dialog("isOpen")) {
            $("#giftcardInputField").val(barcode);
        } else if (isToProcessScannedBarcode() &&
            !toggleTempOff) {
            dataReceived(barcode);
        }
    });

    /*eft response message listener*/
    socket.on('EFTData', function(rawMsg) {
        // CR KARTUKU
        if (rawMsg.returnCode && rawMsg.returnCode == '99') {
            $("#eft-processing-dialog").dialog("close");
            promptSysMsg("EFT Online Payment Failed, Please check EDC Connection", "EFT ONLINE PAYMENT FAILED");
            return false;
        }

        if (configuration.KARTUKU && configuration.KARTUKU.isActive == 'Y' && rawMsg.type == "INQUIRY") {
            $("#tenderNewAmount-dialog").data("cardNumber", rawMsg.cardNum);
            //var payment = parseInt($("#inputDisplay").val());
            var payment;
            if (saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO && typeof saleTx.zeproPaid == 'undefined' && !saleTx.zeproPaid) {
                payment = calculateZeproAmount(saleTx);
            } else payment = parseInt($("#inputDisplay").val());

            var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name;
            var cardNumber = rawMsg.cardNum;
            var firstSixOfCard = removeAllDash(cardNumber.substring(0, 6));
            var isCardCoBrand = (saleTx.promotionsMap && isTrxCobrand(firstSixOfCard, saleTx.promotionsMap));
            saleTx.isCardCoBrand = isCardCoBrand;

            uilog('DBUG', 'masuk sini eftdata');

            if (isCardCoBrand && !isContainAdditionalDiscountPaymentLevelPromo(pymtMediaTypeName, firstSixOfCard)) {
                uilog('DBUG', 'cmc payment');
                console.log("Cmc payment");
                processCoBrandEftOnlinePayment(payment, pymtMediaTypeName);
            } else {
                uilog('DBUG', 'non cmc payment');
                console.log("non cmc payment");
                processNonCmcPayment(function() {
                    processCoBrandEftOnlinePayment(payment, pymtMediaTypeName);
                }, pymtMediaTypeName);
            }
        } else {
            $("#eft-processing-dialog").dialog("close");
            if (eftOnlineObj) {
                uilog("DBUG", "EFTData Object: " + JSON.stringify(eftOnlineObj));
                uilog("DBUG", "EFTData Raw Message: " + JSON.stringify(rawMsg));
                eftOnlineObj.parseResponseMessageFromEdc(rawMsg);
            }
        }
        // CR KARTUKU
    });

    //Printing Status Listener
    socket.on('printingStatus', function(status) {
        if (status != null) {
            isPrinting = status;
            uilog("DBUG", "Printing Status: " + isPrinting);
            if (isPrinting === false) {
                //clears printing status interval
                clearInterval(printingStatusInterval);
                //printingStatusInterval = null;
                //Close loading dialog screen
                $("#printerStatusDialog").dialog("close");
            }
        }
    });
    /***********************************************************
     * Socket End
     **********************************************************/

    /***********************************
     * Marketing Ads transition data Start
     ***********************************/

    function initMarketingAdds() {
        var transitionData = {
            tCuWLA: getConfigValue("LARGE_WHITE_ADS_TRANSITION"),
            tCuRLA: getConfigValue("LARGE_RED_ADS_TRANSITION"),
            tCuWSA: getConfigValue("SMALL_WHITE_ADS_TRANSITION"),
            tCuRSA: getConfigValue("SMALL_RED_ADS_TRANSITION"),
            tCuCOA: getConfigValue("CASHIER_OFFLINE_TRANSITION"),
            tCaRR: getConfigValue("REGULAR_REMINDERS_TRANSITION"),
            tCaPR: getConfigValue("PROMO_REMINDERS_TRANSITION")
        };

        if (terminalModel != 'M2') {
            setPromotionTransition(transitionData);
        }
        CustomerPopupScreen.cus_setMarketingAdsTransition(transitionData, terminalModel);
    }

    function setPromotionTransition(transitionData) {
        setInterval("slideSwitchRegularReminders()", transitionData.tCaRR);
        setInterval("slideSwitchPromoReminders()", transitionData.tCaPR);
    }

    // save regular reminders to cache
    saveRegularReminders();

    /***********************************
     * Marketing Ads transition data End
     ***********************************/

    /***********************************
     * Calculator Buttons Start
     ***********************************/
    // DIGIT button
    $("div#numPad div#keyNumber div.label-num").click(function() {
        var btn = $(this).html();
        if (cleared) {
            $("#inputDisplay").val(btn);
            cleared = false;
        } else {
            $("#inputDisplay").val($("#inputDisplay").val() + btn);
        }
    });

    // CLEAR button
    $("div#numPad div#keyClr").click(function() {
        $("#fnReturnTx").removeData("isAuthenticated");
        clearTrigger(disableClrFn);
        CustomerPopupScreen.cus_clearTrigger(disableClrFn);
        // DEBUG ROUNDING
        clearRounding();
        clearInputDisplay();
    });

    // QTY button
    $("div#numPad div#keyQty").click(function() {
        var maxItemQty = getConfigValue("MAX_ITEM_QTY");
        // for now theres no way to change qty
        // value except if it contains default
        // value. For demo purposes.
        // TODO: Change this in the next iteration.
        if (!toggleRecallSale && !BILL_PAYMENT.isBillPaymentTansaction()) {
            if ($("#tempQtyDiv").length == 0) {
                itemQty = Number($("#inputDisplay").val());

                if (isNaN(itemQty) ||
                    itemQty <= 0) {
                    itemQty = 1;
                }

                if (itemQty > 0 &&
                    itemQty <= maxItemQty) {
                    disableClrFn = false;
                    renderQuantity(itemQty);
                } else {
                    // TODO: replace in
                    // message.property
                    var qtyMsg = "Not allowed. Please input a number between 1-" +
                        maxItemQty + ".";
                    showMsgDialog(qtyMsg,
                        "warning");
                    itemQty = 1;
                }
            }

            clearInputDisplay();
        } else
            showKeyNotAllowedMsg();
    });

    // CO-BRAND button
    //$("div#numPad div#keyCobra").click(function() {
    $(document).on("click", "div#keyCobra", function() {
        if (enableCoBrand &&
            saleTx.type != CONSTANTS.TX_TYPES.RETURN.name &&
            saleTx.type != CONSTANTS.TX_TYPES.REFUND.name &&
            !redeemPointTrk && !saleGameItemTrk &&
            !toggleRecallSale) {
            $("#memberPromotion-dialog").data("isPaymentProcessing", false);
            $("#memberPromotion-dialog").dialog("open");
        } else {
            showKeyNotAllowedMsg();
        }
    });

    // ENTER button
    $("#inputDisplay").keypress(function(e) {
        if (e.keyCode === 13) {
            $("div#numPad div#keyEnter").click();
        }
    });
    $("div#numPad div#keyEnter").click(function() {
        // var inputDisplay = $("#inputDisplay").val();
        //alert(itemQty);
        //alert(saleTx.qrtts);
        if (isProCustScan) {
            var customerId = $("#inputDisplay").val();
            if (!customerId) {
                showMsgDialog("ENTRY REQUIRED", "warning");
            }
            /*else if (customerId.length != 13) {
				showMsgDialog('INVALID ID LENGTH', "warning");
			} else {
				//processProCustTxn(customerId);
				CRMAccountModule.retriever.findAccountId(customerId);
			}*/

            CRMAccountModule.Hypercash.lastCustomerCardScanned = customerId;
            CRMAccountModule.retriever.findAccountId(customerId);
        } else if (isInputGiftCardNumber) {
            var giftCardNumber = $("#inputDisplay").val();
            if (giftCardNumber == "") {
                showMsgDialog(getMsgValue("giftcard_msg_invalid_card_item"), "warning");
                clearInputDisplay();
            } else {
                processGiftCardScanned({ giftCardNumber: giftCardNumber });
            }
        } else if (isRenewMembershipSelected && $("#crmTrIdField").val() != "") {

            if ($("#crmTrIdField").val() != "") {
                var memberId = $("#crmTrIdField").val();
            } else {
                var memberId = $("#inputDisplay").val();
            }

            if (memberId != "") {

                var crmResponse = isCustomerValidForReward(memberId, saleTx);

                if (crmResponse.type != "ERROR") {
                    checkIfMembershipHasExpired(crmResponse, customerIdForReward);

                    $("div#numPad div#keyClr").triggerHandler('click');
                    isRenewMembershipSelected = false;
                }
            }
        } else if (loyEarnPointsSelected) {
            console.log("masuk ke enter si no");
            var loyMemberId = $("#inputDisplay").val();

            if (loyMemberId != "") {
                earnLoyaltyProgram = {
                    hpNumber: loyMemberId
                }
                console.log("masuk ke enter si mid");
                earnLoyaltPoint(earnLoyaltyProgram);
                loyEarnPointsSelected = false;
                console.log("sale tx id : " + saleTx.customerId + " + " + saleTx.isLoyalty);
            }
        } else if (loyVIPThemeParkSelected) {
            // console.log("masuk ke enter si no");
            var loyVIPTicket = $("#inputDisplay").val();

            if (loyVIPTicket != "") {
                vipThemePark = {
                    ticketNo: loyVIPTicket
                };
                getVIPTicket(vipThemePark);
                loyVIPThemeParkSelected = false;
            }
        }else if (saleTx.orderItems.length > 0 && saleTx.qrtts){
        // || (itemQty > 1 && saleTx.qrtts)) {
            showMsgDialog("Multiplier not allowed for Allo Topup", "warning");
        } else {
            // this if else block is for the transaction that uses manual barcode scan only.
            if (isToProcessScannedBarcode()) {
                var barcodeToScan = $("#inputDisplay").val();
                var subsidi = getConfigValue("PROGRAM_KBLBB");

                if (barcodeToScan == "" && saleTx.orderItems.length > 0) {
                    toggleNoEmpId = true;
                    barcodeToScan = lastBarcodeScanned;
                }

                var freshGoodsScanMode = getConfigValue("FRESH_GOODS_SCAN_MODE");

                if (inhibitMultipler(barcodeToScan)) {
                    showMsgDialog(getMsgValue("fresh_goods_warning_msg_multiplier_not_allowed"), "warning");
                } else if (toggleVoid) {
                    processVoidItemScan(barcodeToScan);
                } else if (!customerIdForReward && (toggleEmpCard || toggleCRMPoints)) {
                    if (isMemberIdInputTypeAllowed('Input')) {

                        if (crmMemberId != null && crmEnableEmpIdScan == false) {
                            processSaleScan(barcodeToScan);
                        } else {
                            processEmpIdScan(barcodeToScan);
                        }
                    } else {
                        showMsgDialog(getMsgValue("pos_warning_msg_member_scan_item_failed"), "warning");
                    }
                } else if (isInstallmentTransaction) {
                    processInstallmentScan(barcodeToScan);
                } else if (barcodeToScan == subsidi) {
                    showKeyNotAllowedMsg() 
                } else {
                    console.log("barcode =", saleTx.orderItems.join());
                    if (isToProcessFreshBarcode(barcodeToScan)) {
                        // CR XREPORT
                        saleTx.keyItemCount++;
                        processSaleScan(barcodeToScan);
                        uilog('INFOkeyItemCount', saleTx.keyItemCount);
                        // CR XREPORT
                    }
                }
            }
        }
    });

    // ABC button
    $("div#numPad div#keyAbc").click(function() {
        var inp = $('#inputDisplay').val();
        if (inp != "") $('#inputDisplay').val(inp.substring(0, inp.length - 1));
    });

    // SUBTOTAL button
    $("div#numPad div#keyTotal").click(function() {
        clearInputDisplay();
        $('#inputDisplay').attr('readonly', false);

        var saleType = saleTx.type;
        var isNormalSale = (saleType == CONSTANTS.TX_TYPES.SALE.name);
        var isReturnRefund = (saleType == CONSTANTS.TX_TYPES.RETURN.name ||
            saleType == CONSTANTS.TX_TYPES.REFUND.name);
        var isReturnTx = saleType == CONSTANTS.TX_TYPES.RETURN.name;
        var isBillPaymentTx = saleType == CONSTANTS.TX_TYPES.BILL_PAYMENT.name;
        var isEleboxTx = saleType == CONSTANTS.TX_TYPES.ELEBOX.name;
        var isBpjsTx = saleType == CONSTANTS.TX_TYPES.BPJS.name;
        var isSimpatindoTx = saleType == CONSTANTS.TX_TYPES.SIMPATINDO.name;
        uilog('DBUG', "sebelum hasScannedItem di keyTotal, saleTx.payments: ")
        uilog('DBUG', saleTx.payments);
        uilog('DBUG', saleTx);

        if (hasScannedItem(saleTx)) {
            //console.log(isNormalSale + ' ' + calculatePromotion);
            addedDiscount();

            //check Donation Payment Media
            donationCheckPaymentMedia(saleTx.orderItems);

            if (isNormalSale &&
                calculatePromotion) {
                /*if(runningNonMemberMarkup) {
                	saleTx.totalAmount += Math.round(runningNonMemberMarkup);
                	runningNonMemberMarkup = 0;
                }*/

                processLayerTwoPromotions();

                // CR ADD DISCOUNT
                processLayerThreePromotions(false, false);
                // CR ADD DISCOUNT

                // initialize to zero if
                // null,NaN,undefined.
                if (!saleTx.totalDiscount) {
                    saleTx.totalDiscount = 0;
                }
                //console.log('promoDiscount :' + promoDiscount);
                saleTx.totalDiscount += promoDiscount;
                renderTotal();
                calculatePromotion = false;
                saleTx.promotionItems = promotionItems;
            }
            if (isNormalSale) {
                uilog('DBUG', "Recheck secondLayerDiscountAmount");
                var isSecondLayer = false;
                //var secondLayerLength = 0;
                var secondLayerDiscountAll = 0;
                var totalDiscountAll = 0;
                var totalDiscountTmp1 = 0;
                for (var i = 0; i < saleTx.orderItems.length; i++) {
                    totalDiscountTmp1 += saleTx.orderItems[i].discountAmount + saleTx.orderItems[i].memberDiscountAmount + saleTx.orderItems[i].crmMemberDiscountAmount;
                    if (saleTx.orderItems[i].secondLayerDiscountAmount != 0) {
                        if (saleTx.orderItems[i].memberDiscountAmount != 0) {
                            secondLayerDiscountAll += saleTx.orderItems[i].secondLayerDiscountAmount;
                        } else {
                            secondLayerDiscountAll += saleTx.orderItems[i].secondLayerDiscountAmountWithoutMember;
                        }
                        //secondLayerLength++;
                        isSecondLayer = true;
                    }
                }
                for (var i = 0; i < saleTx.promotionItems.length; i++) {
                    if (saleTx.promotionItems[i].totalDiscount != 0) {
                        totalDiscountAll += saleTx.promotionItems[i].totalDiscount;
                        isSecondLayer = true;
                    }
                }
                uilog('DBUG', 'totalDiscountAll: ' + totalDiscountAll);
                uilog('DBUG', 'secondLayerDiscountAll : ' + secondLayerDiscountAll);
                console.log('totalDiscountTmp1 :' + totalDiscountTmp1);

                //recalculate if pwp not valid baseon cobrand
                //limit payment media with promotion type 7(pwp)
                // if(saleTx.coBrandNumber && saleTx.coBrandNumber != ""){
                //     var promoItems = saleTx.promotionItems;
                //     var promoMaps = saleTx.promotionsMap;
                //     for (var i in promoItems) {
                //         if (promoItems[i].type == '7') {
                //             var objPromoPwp = findReversePromoPwp(promoItems[i].productId, saleTx.coBrandNumber, promoMaps);
                //             //var objPromoPwp = findReversePromoPwp(promoItems[i].productId, '999999', promoMaps);
                //             if(objPromoPwp){
                //                 saleTx.totalChange = Math.round(saleTx.totalChange) + Math.round(objPromoPwp.promoSellingPrice);
                //                 saleTx.totalDiscount = Math.round(saleTx.totalDiscount) - Math.floor(objPromoPwp.promoSellingPrice);
                //                 saleTx.totalTaxableAmount = Math.round(saleTx.totalTaxableAmount) + Math.floor(objPromoPwp.promoSellingPrice);
                //                 saleTx.promotionItems.splice(i,1);
                //             }
                //         }
                //     }
                // }

                if (isSecondLayer && totalDiscountAll != secondLayerDiscountAll) {
                    //if(isSecondLayer && saleTx.promotionItems.length != secondLayerDiscountLength){
                    uilog('DBUG', "DO NOT Recalculate secondLayerDiscountAmount");
                    /*saleTx.promotionItems = [];
                    saleTx.totalDiscount = totalDiscountTmp1;
                    promoDiscount = totalDiscountTmp1;
                    promotionItems = [];
                    processLayerTwoPromotions();
                    processLayerThreePromotions(false, false);
                    if (!saleTx.totalDiscount) {
                    	saleTx.totalDiscount = 0;
                    }
                    console.log('promoDiscount :' + promoDiscount);
                    saleTx.totalDiscount = promoDiscount;
                    renderTotal();
                    calculatePromotion = false;
                    saleTx.promotionItems = promotionItems;*/
                }
            }
            //			console.log("795 saleTx");
            //			console.log(saleTx);
            //			if (   isNormalSale
            //				&& applianceAndWarranty.isSaleHasWarrantyItem) {
            //				setWarrantyItemToBeValidated();
            //			}
            if (isNormalSale ||
                isReturnRefund || BILL_PAYMENT.isBillPaymentTansaction() || isEleboxTx || isBpjsTx || isSimpatindoTx) {
                /*if (isReturnTx && profCust && profCust.customerNumber) {
                	//Apply Non Member Markup Charge for Hypercash Return Tx
                	Hypercash.service.applyNonMemberMarkupOnReturnItems();
                	saleTx.totalAmount += Math.round(saleTx.totalNonMemberMarkup);
                	renderTotal();
                }*/

                Hypercash.service.applyNonMemberMarkupOnSubTotal();
                renderTotal();


                uilog('DBUG', 'reApplyEmployeeDiscount====');
                reApplyEmployeeDiscount();
                var paymentFlowType = (isReturnRefund || BILL_PAYMENT.isBillPaymentTansaction() || isEleboxTx || isBpjsTx || isSimpatindoTx) ? saleType : CONSTANTS.PAYMENT_MEDIA_FLOW_TYPES.SALE;
                // Enable payment media
                enablePaymentMedia = true;

                FUNCTION_FLOW_CONFIG.PAYMENT_MEDIA.executePaymentFlow(paymentFlowType);

            }
            if (isNormalSale && isInputGiftCardNumber) {
                showKeyNotAllowedMsg();
            }

            /*
             * This determines that the subTotal button is clicked. Date here is used for cashier x report duration computation
             */
            if (saleTx.orderItems[saleTx.orderItems.length - 1]) {
                saleTx.orderItems[saleTx.orderItems.length - 1].scanDate = new Date();
            }
        } else {
            showKeyNotAllowedMsg();
        }

        var pendingPwpArray = [];

        $('#pendingPWPDialog').html('');
        if (Object.keys(pendingPwpPromo).length > 0) {
            var pwpcounter = 1;
            for (var p in pendingPwpPromo) {
                var pwpPromo = pendingPwpPromo[p];
                var pwpDialog = $('<div>').addClass("dialogFont pwp-class-dialog pwp-dialog-tab-" + pwpcounter).attr('pwp-dialog-tab', pwpcounter);

                var pwpTable = $('<table>').css({ 'width': '100%', 'font-size': '12px' })
                    .append(
                        $('<thead>')
                        .append($('<tr>')
                            .append($('<th>').attr('colspan', '2').html('RTA:&nbsp;' + numberWithCommas(pwpPromo.rta) + '; Total Amount:&nbsp;' + numberWithCommas(pwpPromo.eligibleRta)))
                        )
                        .append($('<tr>')
                            .append($('<th>').attr('colspan', '1').css('width', '40%').html('Qualifier Item'))
                            .append($('<th>').attr('colspan', '1').html('Reward Item'))
                        )
                    );

                var pwpQualifierTable = $('<table>').addClass('pwpQualifiers').css('width', '100%');
                pwpQualifierTable.append(
                    $('<thead>')
                    .append($('<tr>')
                        .append($('<th>').css('width', '50%').html('Item'))
                        .append($('<th>').css('width', '50%').html('Price'))
                    )
                );
                var pwpQualifierBody = $('<tbody>');
                var cnt = 0;
                for (var q in pwpPromo.qualifiers) {
                    pwpQualifierBody
                        .append(
                            $('<tr>')
                            .append($('<td>').html(pwpPromo.qualifiers[q].name))
                            .append($('<td style="text-align:right;">').html(numberWithCommas(pwpPromo.qualifiers[q].price)))
                        );

                    if (cnt > 9) break;
                    else cnt++;
                }
                pwpQualifierTable.append(pwpQualifierBody);

                var pwpRewardTable = $('<table>').addClass('pwpRewards').css('width', '100%');
                cnt = 0;
                pwpRewardTable.append(
                    $('<thead>')
                    .append($('<tr>')
                        .append($('<th>').css('width', '50%').html('Item'))
                        .append($('<th>').css('width', '50%').html('Price'))
                    )
                );
                var pwpRewardBody = $('<tbody>');
                for (var r in pwpPromo.rewards) {
                    var discountPrice = 0;
                    switch (pwpPromo.rewards[r].discountType) {
                        case '1':
                            discountPrice = parseInt(pwpPromo.rewards[r].promo);
                            break;
                        case '2':
                            discountPrice = Math.round(parseInt(pwpPromo.rewards[r].price) * ((100 - parseInt(pwpPromo.rewards[r].promo)) / 100));
                            break;
                        case '3':
                            discountPrice = parseInt(pwpPromo.rewards[r].price) - parseInt(pwpPromo.rewards[r].promo);
                            break;
                    }

                    pwpRewardBody
                        .append(
                            $('<tr>')
                            .append($('<td>').html(pwpPromo.rewards[r].name))
                            .append($('<td style="text-align:right;">').html('<strike>' + numberWithCommas(pwpPromo.rewards[r].price) + '</strike> > <strong>' + numberWithCommas(discountPrice) + '</strong>'))
                        );

                    if (cnt > 9) break;
                    else cnt++;
                }
                pwpRewardTable.append(pwpRewardBody);

                pwpTable
                    .append(
                        $('<tbody>').append(
                            $('<tr>')
                            .append($('<td>').attr('valign', 'top').append(pwpQualifierTable))
                            .append($('<td>').attr('valign', 'top').append(pwpRewardTable))
                        )
                    );
                pwpDialog.append(pwpTable);

                var prevBtn = $('<button>').html('Prev').css({ 'position': 'absolute', 'top': '310px', 'left': '-6px' });
                var nextBtn = $('<button>').html('Next').css({ 'position': 'absolute', 'top': '310px', 'left': '435px' });

                prevBtn.click(
                    function() {
                        var thisTab = $(this).parent().attr('pwp-dialog-tab');
                        $('.pwp-dialog-tab-' + thisTab).hide();
                        $('.pwp-dialog-tab-' + (parseInt(thisTab) - 1)).show();

                    }
                );

                nextBtn.click(
                    function() {
                        var thisTab = $(this).parent().attr('pwp-dialog-tab');
                        $('.pwp-dialog-tab-' + thisTab).hide();
                        $('.pwp-dialog-tab-' + (parseInt(thisTab) + 1)).show();
                    }
                );
                pwpDialog.hide();

                if (pwpcounter == 1) {
                    prevBtn.css('display', 'none');
                    pwpDialog.show();
                }
                if (pwpcounter == Object.keys(pendingPwpPromo).length) nextBtn.css('display', 'none');

                pwpDialog.append(prevBtn).append(nextBtn);
                pwpcounter++;

                $('#pendingPWPDialog').append(pwpDialog);
            }

            $('#pendingPWPDialog').dialog('open');
        }
    });
    /***********************************************************
     * Calculator Buttons End
     **********************************************************/

    /***********************************************************
     * Function Pad Buttons Start
     **********************************************************/

    //$("div#fnPad div#proCustomer").click(function() {
    $(document).on("click", "div#proCustomer", function() {
        taxInvoiceSeqFlag = true;
        if (isHcEnabled) {
            console.log(connectionOnline);
            if (connectionOnline) {
                Hypercash.service.isThereAvailableTaxInvSequence(function(response) {
                    taxInvoiceSeqFlag = true;
                });
            }
            console.log(taxInvoiceSeqFlag);
            if (taxInvoiceSeqFlag) {
                $("#proCustomer").attr('class', 'button-cal flow').attr('disabled', true);
            } else {
                return false;
            }
            console.log(JSON.stringify(saleTx));
            if ((saleTx && saleTx.orderItems && saleTx.orderItems.length > 0) ||
                toggleStoreSale || toggleRecallSale || togglePostVoid) {
                showKeyNotAllowedMsg();
            } else {
                promptSysMsg("Please SCAN/ENTER customer account number.", "HYPERCASH TRANSACTION");
                isProCustScan = true;
            }
        }
    });

    $("div#fnPad div#reprintInv").click(function() {
        if (isHcEnabled) {
            //TODO Verify: does a customer need to have his card validated before he can avail of the tax invoice reprint?
            if ((saleTx && saleTx.orderItems && saleTx.orderItems.length > 0) ||
                toggleStoreSale || toggleRecallSale || togglePostVoid) {
                showKeyNotAllowedMsg();
            } else {
                Hypercash.service.promptReprintInvoice();
            }
        }
    });

    // INHOUSEVOUCHER 2017-04-13
    $("div#fnPad div#fnIvsOnline").click(function() {
	    if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANS.TX_TYPES.SIMPATINDO.name || redeemPointTrk || saleGameItemTrk) {
            showKeyNotAllowedMsg();
        } else {
            if (enablePaymentMedia && saleTx.totalAmount && saleTx.totalAmount > 0)
                $("#depstore-voucher-dialog").data('mode', 'group').dialog("open");
            else showKeyNotAllowedMsg();
        }
    });
    // INHOUSEVOUCHER 2017-04-13

    /**
     * Will open Banana Report dialog box for Cashier
     */
    $("div#fnPad div#fnBananaReport").click(function() {
        Banana.service.promptCashierBananaReportDialog();
    });

    /*
    $("div#fnPad div#reviseTxn").click(function() {
    	if(isHcEnabled) {
    		if (!profCust ||
    			(!saleTx || !saleTx.orderItems || saleTx.orderItems.length > 0)
    		    || toggleStoreSale || toggleRecallSale || togglePostVoid) {
    			showKeyNotAllowedMsg();
    		} else if(profCust && profCust.taxId){
    			isRevisedTxn = true;
    		}
    	}
    });
    */

    // Logout button
    $("div#fnPad div#logoutBtn").click(function() {
        if (hasScannedItem(saleTx) ||
            saleTx.type == CONSTANTS.TX_TYPES.RETURN.name ||
            saleTx.type == CONSTANTS.TX_TYPES.REFUND.name ||
            saleTx.type == CONSTANTS.TX_TYPES.PICKUP.name ||
            saleTx.type == CONSTANTS.TX_TYPES.FLOAT.name ||
            toggleStoreSale ||
            toggleRecallSale ||
            redeemPointTrk ||
            saleGameItemTrk ||
            togglePostVoid) {
            showKeyNotAllowedMsg();
        } else {
            var storedTxns = getStoredTxns(saleTx.userId);
            if (storedTxns.length) {
                showConfirmDialog(
                    getMsgValue('confirm_msg_pending_stored_txn').format(storedTxns.join(', ')),
                    'information',
                    showLogoutAuthDialog
                );
            } else {
                showLogoutAuthDialog();
            }
        }
    });

    $("div#fnPad div#fnPowerPointPurchase").click(function() {
        var payment = CASHIER.getFinalSubtotalTxAmount(saleTx, { payments: saleTx.payments });
        var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.POWER_POINT_PURCHASE.name;
        // if(!PAYMENT_MEDIA.isValidForTriggering(saleTx, pymtMediaTypeName, payment, enablePaymentMedia)) {
        // 	return;
        // };
        if (donationNotValid && !donationPaymentMedia(pymtMediaTypeName)) {
            showMsgDialog(getMsgValue("donation_payment_media") + donationValidPaymentMedia, "warning");
        } else if (redeemPointTrk || saleGameItemTrk || InfoloyaltyProgram.length === 0 || saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name) { // Need to add saleBlibliInStore
            showKeyNotAllowedMsg();
            return;
        }
        // else {
        //   // LUCKY - CALCULATE ZEPRO PAYMENT
        //   if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name) {
        //     showKeyNotAllowedMsg();
        //   } else {
        eftType = CONSTANTS.EFT.TYPE.POWER_POINT_PURCHASE;
        if (
            saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO &&
            typeof saleTx.zeproPaid == "undefined" &&
            !saleTx.zeproPaid
        ) {
            $("#inputDisplay").val("");
            payment = calculateZeproAmount(saleTx);
            console.log("payment zepro : " + payment);
            showMsgDialog("Total Pembayaran Zepro: " + payment, "info", function() {
                if (
                    PAYMENT_MEDIA.isValidForTriggering(saleTx, pymtMediaTypeName, payment, enablePaymentMedia) &&
                    isNoneGiftCardItemInTransaction()
                ) {
                    fnAltoWeChat(pymtMediaTypeName);
                }
            });
        } else {
            if (
                PAYMENT_MEDIA.isValidForTriggering(saleTx, pymtMediaTypeName, payment, enablePaymentMedia) &&
                isNoneGiftCardItemInTransaction()
            ) {
                pppPayment(pymtMediaTypeName);
            }
        }
    });


    // Validate button
    $("div#fnPad div#fnValidateWarranty").click(function() {
        //		if (applianceAndWarranty.warrantyItemForValidation != null &&
        //				!applianceAndWarranty.isWarrantyValidated) {
        //			applianceAndWarranty.isWarrantyValidated = true;
        if (saleTx && saleTx.orderItems && saleTx.orderItems.length > 0 &&
            saleTx.type == CONSTANTS.TX_TYPES.SALE.name && enablePaymentMedia) {
            printDocument(setDocumentWarrantyItem(saleTx));
            showMsgDialog(
                getMsgValue('pos_warranty_validation'), "info");
        } else {
            showKeyNotAllowedMsg();
        }
    });

    // New Order button
    /*	$("div#fnPad div#orderBtn").click(function() {
    		// change the location of the customer screen to main
    		// window.customerWinObject.location.href =
    		// posWebContextPath+"/customer/main";
    		isGiftCardTransaction = false;
    		giftCardRefNumbers = [];
    		isGiftCardBalanceInquiry = false;
    		isInputGiftCardNumber = false;
    		disableClrFn = false;
    		clearOrder();
    		createOrder();
    	});*/

    // Print button
    $("div#fnPad div#printBtn").click(function() {
        if (saleTx) {
            $.ajax(proxyUrl + '/printReceipt', {
                type: 'POST',
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(printReceipt),
                success: function(data) {
                    //uilog('DBUG','Success: ');
                },
                error: function(status, error) {}
            });
        }
    });

    // Cpn Int (Kupon Program Internal) button
    $("div#fnPad div#fnCpnInt").click(function() {
        if (saleTx.totalAmount == 0 || !enablePaymentMedia || toggleVoid || isInstallmentTransaction ||
            RETURN_REFUND.return.service.isReturnOrRefundTxn()) {
            showKeyNotAllowedMsg();
        } else {
            var promotionStatusFlag = parseBoolean(getConfigValue("PROMOTION_STATUS_FLAG"));

            if (promotionStatusFlag) {
                var amount = Number($("#inputDisplay").val());
                if (amount == "")
                    showMsgDialog(getMsgValue("pos_warning_msg_enter_cpn_int_amount"), "warning");
                else if (amount > cpnIntAvailableAmt)
                    showMsgDialog(getMsgValue("pos_warning_msg_amount_exceeds_available_cpn_int_amount"), "warning");
                else {
                    cpnIntAvailableAmt -= amount;
                    saleTx.cpnIntAmount += amount;
                    clearInputDisplay();
                    renderTotal();
                    if (!toggleCpnInt)
                        toggleCpnInt = true;
                }
            } else {
                showKeyNotAllowedMsg();
            }
        }
    });

    // Hotspice button
    $("div#fnPad div#fnHotSpice").click(function() {
        if (!BILL_PAYMENT.isBillPaymentTansaction()) {
            if (HOTSPICE_MODULE.variables.tableNumber) {
                $("#hotSpice-dialog").dialog("open");
            } else {
                $("#hotSpiceTableNumber-dialog").dialog("open"); //if no table number has been selected yet
            }
        } else {
            showKeyNotAllowedMsg();
        }
    });

    // Top Up button
    $("div#fnPad div#topupBtn").click(function() {
        if (connectionOnline)
            $("#topUp-dialog").data("saleType", saleTx.type).dialog("open");
        else
            showMsgDialog(getMsgValue("pos_warning_msg_topup_func_not_allowed_in_offline"), "warning");
    });

    // Top Up button
    $("div#fnPad div#indosmartBtn").click(function() {
        if (connectionOnline)
            $("#indosmart-dialog").data("saleType", saleTx.type).dialog("open");
        else
            showMsgDialog(getMsgValue("pos_warning_msg_indosmart_func_not_allowed_in_offline"), "warning");
    });

    $("div#fnPad div#mCashBtn").click(function() {
        if (connectionOnline)
            $("#mCash-dialog").data("saleType", saleTx.type).dialog("open");
        else
            showMsgDialog(getMsgValue("pos_warning_msg_mcash_func_not_allowed_in_offline"), "warning");
    });

    // Asuransi Pop-Up
    $("div#fnPad div#asuransiBtn").click(function() {
        if (connectionOnline)
            $("#asuransi-dialog").data("saleType", saleTx.type).dialog("open");
        else
            showMsgDialog(getMsgValue("pos_warning_msg_asuransi_func_not_allowed_in_offline"), "warning");
    });

    // Top Up button
    $("div#fnPad div#alterraBtn").click(function() {
        if (connectionOnline)
            $("#alterra-dialog").data("saleType", saleTx.type).dialog("open");
        else
            showMsgDialog(getMsgValue("pos_warning_msg_alterra_func_not_allowed_in_offline"), "warning");
    });

    // CASH button
    $("div#fnPad div#fnCash").click(function() {

        /*If paying for any payment media, the variable currentPaymentMediaType isn't null
         *If it is null, cashier should be able to pay with CASH
         * Currently, CRM POINTS implements the use of currentPaymentMediaType
         */
        if (enablePaymentMedia && !toggleVoid && !currentPaymentMediaType && !redeemPointTrk && !saleGameItemTrk) {

            var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.CASH.name;
            if (donationNotValid == true && !donationPaymentMedia(pymtMediaTypeName)) {
                showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
                    "warning");
            } else {
                processNonCmcPayment(function() {
                    var payment = parseInt($("#inputDisplay").val());
                    console.log("length promotion items : " + saleTx.promotionItems.length);

                    var finalSubtotalTxAmount = CASHIER.getFinalSubtotalTxAmount(saleTx, { payments: saleTx.payments });

                    payment = (isNaN(payment) === true) ? finalSubtotalTxAmount : payment;

                    if (beforeDonationPayment != 0) {
                        var amount = saleTx.totalAmount;
                        console.log("Total Discount : " + saleTx.totalDiscount);
                        console.log("Total Discount : " + tempDisc);
                        if (saleTx.totalDiscount != 0 || tempDisc != 0) {
                            console.log("Total Discount 1 : " + saleTx.totalDiscount);
                            console.log("Total Discount 1 : " + tempDisc);
                            saleTx.totalDiscount = tempDisc;
                            amount = amount - saleTx.totalDiscount;
                        }
                        //if(beforeDonationPayment){
                        payment = beforeDonationPayment;
                        //}
                    }

                    var paymentConfig = {};
                    if (BILL_PAYMENT.isBillPaymentTansaction() || saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name) {
                        paymentConfig = {
                            isSinglePaymentInTx: true
                        };
                    }

                    if (PAYMENT_MEDIA.isValidForTriggering(saleTx,
                            pymtMediaTypeName,
                            payment,
                            enablePaymentMedia,
                            paymentConfig)
                        /*
                         * If not for donation, execute
                         * CASHIER.executePaymentMedia()
                         * w/o special processes.
                         */
                        &&
                        !DONATION.processDonation(saleTx, pymtMediaTypeName, payment, paymentConfig)) {
                        console.log(JSON.stringify(saleTx.payments));
                        var payments = 0;
                        for (var a = 0; a <= saleTx.payments.length - 1; a++) {
                            payments += parseInt(saleTx.payments[a].amountPaid);
                        }
                        console.log("total Amount 1 : " + saleTx.totalAmount);
                        var amount = saleTx.totalAmount;
                        /*if(saleTx.totalDiscount != 0){
                        	amount = amount - saleTx.totalDiscount;
                        }
                        console.log("total Amount 2 : " + amount);
                        if(saleTx.cmcAmount){
                        	amount = amount + saleTx.cmcAmount;
                        }*/
                        console.log("total Amount 3 : " + amount);

                        //donationExecute = [saleTx, pymtMediaTypeName, payment, paymentConfig];
                        if (donationPromoItem.length > 0 || donationOrderItem.length > 0) {
                            if (donationPromoItem.length > 0) {
                                saleTx.promotionItems = donationPromoItem;
                            }
                            if (donationOrderItem.length > 0) {
                                saleTx.orderItems = donationOrderItem;
                                for (var i in saleTx.orderItems) {
                                    if (saleTx.orderItems[i].secondLayerDiscountAmountWithoutMember) {
                                        saleTx.orderItems[i].secondLayerDiscountAmount = saleTx.orderItems[i].secondLayerDiscountAmountWithoutMember;
                                        for (var a in saleTx.promotionItems) {
                                            if (saleTx.orderItems[i].productId == saleTx.promotionItems[a].productId) {
                                                saleTx.orderItems[i].qtyWithSecondLayerDiscount = saleTx.promotionItems[a].itemQuantity;
                                            }
                                        }
                                    }
                                }
                            }
                            saveTxn();
                        }
                        if (donationPromoItem.length <= 0) {
                            if (saleTx.promotionItems.length > 0) {
                                saveTxn();
                                donationPromoItem = saleTx.promotionItems;
                            }
                        }
                        if (donationOrderItem.length <= 0) {
                            if (saleTx.orderItems.length > 0) {
                                //donationOrderItem = [];
                                donationOrderItem = saleTx.orderItems;
                            }
                        }
                        if (saleTx.promotionItems.length > 0) {
                            for (var i in saleTx.promotionItems) {
                                var discount = saleTx.promotionItems[i].totalDiscount;
                                //amount -= discount;
                            }
                        } else if (saleTx.promotionItems.length <= 0 && donationPromoItem.length > 0) {
                            for (var i in donationPromoItem) {
                                var discount = donationPromoItem[i].totalDiscount;
                                //amount -= discount;
                            }
                        }

                        console.log("get Total Discount : " + (amount - getTotalDiscount(saleTx)));
                        console.log("get Total amount : " + amount);
                        console.log("get Total payment : " + (payment + payments));
                        if ((amount - getTotalDiscount(saleTx)) < (payment + payments) && saleTx.type == CONSTANTS.TX_TYPES.SALE.name) {

                            hasDonationCheck = true;
                            var rounding = 0;
                            tempDisc = saleTx.totalDiscount;
                            beforeDonationPayment = payment;
                            if (saleTx.roundingAmount != 0) {
                                rounding = saleTx.roundingAmount * -1;
                            }
                            donationVal = (payment + payments + rounding) - (amount - getTotalDiscount(saleTx));
                            donationExecute = [saleTx, pymtMediaTypeName, payment, paymentConfig];
                            donationPopupCash();

                        } else {
                            if (saleTx.promotionItems.length <= 0) {
                                saleTx.promotionItems = donationPromoItem;
                            }
                            CASHIER.executePaymentMedia(saleTx, pymtMediaTypeName, payment, paymentConfig);
                        }
                    }
                }, pymtMediaTypeName);
            }
        } else {
            console.log("Masuk Kesini");
            showKeyNotAllowedMsg();
        }
    });

    // CR ADD DISCOUNT
    //EFT Online Payment Trigger
    $("div#fnPad div#fnEFTOn").click(function() {
        var payment = parseInt($("#inputDisplay").val());
        var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name;
        // DEBUG ROUNDING
        /*if (!isValidForRounding(pymtMediaTypeName))
        {
        	showMsgDialog("Please Clear Rounding Amount First", "Warning");
        	return false;
        }*/
        var isMaxPayment = false;
        var isContainAdditionalDiscountPaymentLevel = isContainAdditionalDiscountPaymentLevelPromo(pymtMediaTypeName, 0);

        eftType = CONSTANTS.EFT.TYPE.ONLINE_PAYMENT;
        //sets default vendor to wirecard
        // CR KARTUKU
        if (donationNotValid == true && !donationPaymentMedia(pymtMediaTypeName)) {
            showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
                "warning");
        } else if (redeemPointTrk || saleGameItemTrk) {
            showKeyNotAllowedMsg();
        } else {
            if (configuration.KARTUKU.isActive == 'Y')
                eftVendor = CONSTANTS.EFT.VENDOR.KARTUKU.name;
            else if (configuration.WIRECARD.isActive == 'Y')
                eftVendor = CONSTANTS.EFT.VENDOR.WIRECARD.name;
            else {
                showMsgDialog("Wrong Edc Configuration", "error");
                return false;
            }
            // CR KARTUKU

            // LUCKY - CALCULATE ZEPRO PAYMENT
            if (saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO && typeof saleTx.zeproPaid == 'undefined' && !saleTx.zeproPaid) {
                $("#inputDisplay").val('');
                payment = calculateZeproAmount(saleTx);
            }

            // LUCKY - ADD ZEPRO CONDITION
            if (saleTx.eftTransactionType != CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO &&
                saleTx.coBrandNumber &&
                (saleTx.payments && saleTx.payments.length == 0) &&
                coBrandDiscountStatus &&
                (coBrandDiscountStatus == getConfigValue("COBRAND_DISCOUNT_ON") || coBrandDiscountStatus == getConfigValue("COBRAND_OFFLINE"))
            ) {
                isMaxPayment = true;
            }

            if (enablePaymentMedia &&
                !isNaN(payment) &&
                !isMaxPayment &&
                !isContainAdditionalDiscountPaymentLevel
            ) {
                if (!isGcMmsActivation) {
                    if (PAYMENT_MEDIA.isValidForTriggering(saleTx, pymtMediaTypeName, payment, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                        if (saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO && saleTx.zeproPaid)
                            eftTransactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE.name;
                        processEftOnlinePayment(payment, pymtMediaTypeName);
                    }
                } else {
                    showMsgDialog("Gift Card hanya dapat dibayar secara tunai", "warning");
                }
            } else if (enablePaymentMedia && !isNaN(payment) && (isMaxPayment || isContainAdditionalDiscountPaymentLevel)) {
                // CR KARTUKU
                if (PAYMENT_MEDIA.isValidForTriggering(saleTx, pymtMediaTypeName, payment, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                    if (configuration.KARTUKU.isActive == 'Y') {
                        var inquiryObj = {
                            transactionId: saleTx.transactionId,
                            posId: configuration.terminalNum,
                            transactionType: 'INQUIRY'
                        };
                        sendEFT(inquiryObj);
                        $("#eft-processing-dialog").dialog("open");
                        //console.log("KARTUKU INQ");
                        //processEftOnlinePayment(payment, pymtMediaTypeName);
                    } else {
                        console.log("WIRECARD INQ");
                        eftTransactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE_INQ.name;
                        paymentAmtEFTWC = payment;
                        uilog('DBUG', 'masuk sini eft online');
                        console.log("eft online");
                        processCoBrandEftOnlinePayment(payment, pymtMediaTypeName);

                        //cobrand eft online payment, input bin number
                        // $("#memberPromotionWc-dialog").data("isPaymentProcessing", true);
                        // $("#memberPromotionWc-dialog").data("payment", payment);
                        // $("#memberPromotionWc-dialog").data("pymtMediaTypeName", pymtMediaTypeName);
                        // $("#memberPromotionWc-dialog").data("memberPromos", memberPromos);
                        // $("#memberPromotionWc-dialog").dialog("open"); // CR COBRAND

                        //OLD
                        //$("#eftOfflineCardNoCode-dialog").dialog("open");
                        //processCoBrandEftOnlinePayment(payment, pymtMediaTypeName);
                    }
                }
                // CR KARTUKU
            } else {
                if (hasScannedItem(saleTx)) {
                    showMsgDialog(getMsgValue("pos_warning_msg_invalid_amount"), "error");
                } else {
                    showKeyNotAllowedMsg();
                }
            }
        }
    });
    // CR ADD DISCOUNT 

    $("div#fnPad div#bankMegaBtn").click(function() {
        if (getConfigValue("EFT_PRINTING_ENABLE") !== 'true') { showKeyNotAllowedMsg(); return false; }
        toggleBankMega = true;

        // CR KARTUKU
        if (configuration.KARTUKU.isActive == 'Y')
            eftVendor = CONSTANTS.EFT.VENDOR.KARTUKU.name;
        else if (configuration.WIRECARD.isActive == 'Y')
            eftVendor = CONSTANTS.EFT.VENDOR.WIRECARD.name;
        else {
            showMsgDialog("Wrong Edc Configuration", "error");
            return false;
        }
        // CR KARTUKU

        var authenticationDeferred = $.Deferred();
        $("#authentication-form").removeData(AUTH_DATA_KEYS)
            .data('roles', ['ROLE_SUPERVISOR'])
            .data('defer', authenticationDeferred)
            .dialog("option", "title", "Supervisor Authentication")
            .dialog("open");

        authenticationDeferred.done(function() {
            $("#bank-mega-other-transaction-type-dialog").dialog("open");
        });
    });

    $("div#fnPad div#fnCoBrandReturn").click(function() {
        if (enableCoBrand &&
            saleTx.type != CONSTANTS.TX_TYPES.RETURN.name &&
            saleTx.type != CONSTANTS.TX_TYPES.REFUND.name &&
            !redeemPointTrk && !saleGameItemTrk &&
            !toggleRecallSale) {
            $("#memberPromotion-dialog").data("isPaymentProcessing", false);
            $("#memberPromotion-dialog").dialog("open");
        } else {
            showKeyNotAllowedMsg();
        }
    });

    //CMC EFT Online Payment Trigger
    //	$("div#fnPad div#fnCmcEftOn").click(function() {
    //		var payment = parseInt($("#inputDisplay").val());
    //		var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.CMC_EFT_ONLINE.name;
    //		eftType = CONSTANTS.EFT.TYPE.CMC_PAYMENT;
    //
    //		if (PAYMENT_MEDIA.isValidForTriggering(
    //				saleTx, pymtMediaTypeName,
    //				payment, enablePaymentMedia)) {
    //
    //			if (saleTx.coBrandNumber) {
    //				processMemberDiscount();
    //				var memberDisc = calculateTotalMemberDiscount();
    //				if(memberDisc > 0){
    //					var newPayment = payment-memberDisc;
    //					showMsgDialog("Total Member Discount: "+numberWithCommas(memberDisc)+
    //							"<br/>New Total Amount Due: "+$("#subtotal").text()+
    //							"<br/><br/>Automatically deducted discount to the amount tendered"+
    //							"<br/>New Amount Tendered: "+numberWithCommas(newPayment)+
    //							"<br/><br/>Click OK to continue"
    //							, "info",eftPaymentProcess);
    //					$("#inputDisplay").val(newPayment);
    //				}else{
    //					eftPaymentProcess();
    //				}
    //			}else{
    //				eftPaymentProcess();
    //			}
    //		}
    //	});

    // $("div.bankIdBanks").click(function(eventObj){
    // resetSelectedBank();

    // var targetElement = eventObj.currentTarget;
    // $(targetElement).addClass("bankIdBanksSelected");

    // var targetElementId = $(targetElement).attr("id");
    // if(targetElementId == "bankIdBankMega"){
    // eftDataObj.bankId = 1;
    // }else if(targetElementId == "bankIdCitibank"){
    // eftDataObj.bankId = 2;
    // }else if(targetElementId == "bankIdBRI"){
    // eftDataObj.bankId = 3;
    // }else if(targetElementId == "bankIdAmex"){
    // eftDataObj.bankId = 4;
    // }else if(targetElementId == "bankIdBCA"){
    // eftDataObj.bankId = 5;
    // }
    // });

    // EDC BCA
    $("div#fnPad div#fnEdcBca").click(function() {
        var payment = parseInt($("#inputDisplay").val());
        var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_BCA.name;
        // DEBUG ROUNDING
        /*if (!isValidForRounding(pymtMediaTypeName))
        {
        	showMsgDialog("Please Clear Rounding Amount First", "Warning");
        	return false;
        }*/
        eftType = CONSTANTS.EFT.TYPE.EDC_BCA;
        if (donationNotValid && !donationPaymentMedia(pymtMediaTypeName)) {
            showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
                "warning");
        } else if (redeemPointTrk || saleGameItemTrk) {
            showKeyNotAllowedMsg();
        } else {
            if (PAYMENT_MEDIA.isValidForTriggering(
                    saleTx, pymtMediaTypeName,
                    payment, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name) {
                    showKeyNotAllowedMsg();
                } else {
                    eftOfflinePayment(pymtMediaTypeName);
                }
            }
        }
    });

    // ALLO PAYLATER
    $("div#fnPad div#fnAlloPaylater").click(function() {
        var payment = parseInt($("#inputDisplay").val());
        var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.ALLO_PAYMENT.name;
        eftType = CONSTANTS.EFT.TYPE.ONLINE_PAYMENT;

        if (donationNotValid && !donationPaymentMedia(pymtMediaTypeName)) {
            showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
                "warning");
        } else if (redeemPointTrk || saleGameItemTrk) {
            showKeyNotAllowedMsg();
        } else {
            if (PAYMENT_MEDIA.isValidForTriggering(
                    saleTx, pymtMediaTypeName,
                    payment, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name) {
                    showKeyNotAllowedMsg();
                } else {
                    eftOfflinePaymentAlloPaylater(pymtMediaTypeName);
                }
            }
        }
    });

    //EFT Offline Payment Trigger
    $("div#fnPad div#fnEftOffline").click(function() {
        var payment = parseInt($("#inputDisplay").val());
        var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_OFFLINE.name;
        if (donationNotValid && !donationPaymentMedia(pymtMediaTypeName)) {
            showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
                "warning");
        } else if (redeemPointTrk || saleGameItemTrk) {
            showKeyNotAllowedMsg();
        } else {
            // LUCKY - CALCULATE ZEPRO PAYMENT
            if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name) {
                showKeyNotAllowedMsg();
            } else {
                // DEBUG ROUNDING
                /*if (!isValidForRounding(pymtMediaTypeName))
                {
                	showMsgDialog("Please Clear Rounding Amount First", "Warning");
                	return false;
                }*/
                eftType = CONSTANTS.EFT.TYPE.OFFLINE_PAYMENT;

                if (saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO && typeof saleTx.zeproPaid == 'undefined' && !saleTx.zeproPaid) {
                    $("#inputDisplay").val('');
                    payment = calculateZeproAmount(saleTx);
                    console.log("payment zepro : " + payment);
                    showMsgDialog("Total Pembayaran Zepro: " + payment, "info",
                        function() {
                            if (PAYMENT_MEDIA.isValidForTriggering(
                                    saleTx,
                                    pymtMediaTypeName,
                                    payment,
                                    enablePaymentMedia) &&
                                isNoneGiftCardItemInTransaction()) {
                                eftOfflinePayment(pymtMediaTypeName);
                            }
                        }
                    );
                } else {
                    if (PAYMENT_MEDIA.isValidForTriggering(
                            saleTx,
                            pymtMediaTypeName,
                            payment,
                            enablePaymentMedia) &&
                        isNoneGiftCardItemInTransaction()) {
                        // if(saleTx.isCouponCmc){
                        // 	processCmcCouponPayment(function(){
                        // 		eftOfflinePayment(pymtMediaTypeName)
                        // 	},pymtMediaTypeName);
                        // }else{
                        // 	eftOfflinePayment(pymtMediaTypeName);
                        // }

                        eftOfflinePayment(pymtMediaTypeName)

                    }
                }
            }
        }
    });

    //EFT Debit Payment Trigger
    $("div#fnPad div#fnDebit").click(function() {
        var payment = parseInt($("#inputDisplay").val());
        var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.DEBIT.name;
        // DEBUG ROUNDING
        /*if (!isValidForRounding(pymtMediaTypeName))
        {
        	showMsgDialog("Please Clear Rounding Amount First", "Warning");
        	return false;
        }*/
        eftType = CONSTANTS.EFT.TYPE.DEBIT;
        if (donationNotValid && !donationPaymentMedia(pymtMediaTypeName)) {
            showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
                "warning");
        } else if (redeemPointTrk || saleGameItemTrk) {
            showKeyNotAllowedMsg();
        } else {
            if (PAYMENT_MEDIA.isValidForTriggering(saleTx, pymtMediaTypeName, payment, enablePaymentMedia)) {
                // comment for allow Gift Card Activation with debitBCA
                //&& isNoneGiftCardItemInTransaction()) {
                // comment for ADD DISOCUNT
                //processNonCmcPayment(function(){
                if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name) {
                    showKeyNotAllowedMsg();
                } else {
                    eftOfflinePayment(pymtMediaTypeName);
                }
                //},pymtMediaTypeName);
            }
        }
    });

    //EFT EDC Payment Trigger
    $("div#fnPad div#fnEdcOnline").click(function() {
        var payment = parseInt($("#inputDisplay").val());
        if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name || redeemPointTrk || saleGameItemTrk) {
            showKeyNotAllowedMsg();
        } else {
            var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_PAYMENT.name;
            // DEBUG ROUNDING
            /*if (!isValidForRounding(pymtMediaTypeName))
            {
            	showMsgDialog("Please Clear Rounding Amount First", "Warning");
            	return false;
            }*/
            if (donationNotValid && !donationPaymentMedia(pymtMediaTypeName)) {
                showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
                    "warning");
            } else {
                eftType = CONSTANTS.EFT.TYPE.EDC_PAYMENT;
                if (PAYMENT_MEDIA.isValidForTriggering(saleTx, pymtMediaTypeName, payment, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                    processNonCmcPayment(function() {
                        eftOfflinePayment(pymtMediaTypeName);
                    }, pymtMediaTypeName);
                }
            }
        }
    });

    // PAYMENT MEDIA - FLAZZ BCA button
    $("div#fnPad div#fnFlazzBca").click(function() {
        var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.FLAZZ.name;

        // DEBUG ROUNDING
        //var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.FLAZZ.name;
        /*if (!isValidForRounding(mediaType))
        {
        	showMsgDialog("Please Clear Rounding Amount First", "Warning");
        	return false;
        }*/
        if (donationNotValid && !donationPaymentMedia(mediaType)) {
            showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
                "warning");
        } else {
            if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name || redeemPointTrk || saleGameItemTrk) {
                showKeyNotAllowedMsg();
            } else {
                if (enablePaymentMedia) {
                    processNonCmcPayment(function() {
                        var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.FLAZZ.name;
                        var payment = parseInt($(
                            "#inputDisplay").val());
                        if (PAYMENT_MEDIA.isValidForTriggering(saleTx, pymtMediaTypeName, payment, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                            CASHIER.executePaymentMedia(saleTx, pymtMediaTypeName, payment);
                        }
                    }, mediaType);
                } else {
                    showKeyNotAllowedMsg();
                }
            }
        }
    });

    // PAYMENT MEDIA - COUPON button
    $("div#fnPad div#fnCoupon").click(function() {
        var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.COUPON.name;
        //var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.COUPON.name;
        /*if (!isValidForRounding(mediaType))
        {
        	showMsgDialog("Please Clear Rounding Amount First", "Warning");
        	return false;
        }*/
        if (donationNotValid && !donationPaymentMedia(mediaType)) {
            showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
                "warning");
        } else {
            if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name || redeemPointTrk || saleGameItemTrk) {
                showKeyNotAllowedMsg();
            } else {
                console.log(enablePaymentMedia);
                if (enablePaymentMedia && !saleTx.coBrandNumber) {
                    console.log("coupon process");
                    processNonCmcPayment(function() {
                        var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.COUPON.name;
                        var payment = parseInt($("#inputDisplay").val());

                        if (PAYMENT_MEDIA.isValidForTriggering(saleTx, pymtMediaTypeName, payment, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                            CASHIER.executePaymentMedia(saleTx, pymtMediaTypeName, payment);
                        }
                    }, mediaType);
                } else {
                    showKeyNotAllowedMsg();
                }
            }
        }
    });

    // PAYMENT MEDIA - COUPON button
    $("div#fnPad div#fnCouponReturn").click(function() {
        console.log("Coupon Return");
        console.log(saleTx);

        //SUPERVISOR AUTHENTICATION

        if (cashierRole.isCustomerServiceCashier) {
            showKeyNotAllowedMsg();
        } else {
            var deferred = $.Deferred();

            $("#authentication-form").removeData(AUTH_DATA_KEYS)
                .data('roles', ['ROLE_SUPERVISOR'])
                .data('defer', deferred)
                .data('interventionType', CONSTANTS.TX_TYPES.SALE.name)
                .dialog("open");

            deferred.then(function() {
                var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.COUPON_RETURN.name;
                console.log(mediaType);
                console.log(enablePaymentMedia);

                if (donationNotValid && !donationPaymentMedia(mediaType)) {
                    showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
                        "warning");
                } else {
                    if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || redeemPointTrk) {
                        showKeyNotAllowedMsg();
                    } else {
                        if (enablePaymentMedia) {
                            console.log("coupon return dialog");

                            $("#couponReturn-dialog").dialog("open");
                        } else {
                            showKeyNotAllowedMsg();
                        }
                    }
                }
            });
        }

        // var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.COUPON_RETURN.name;

        // if(donationNotValid && !donationPaymentMedia(mediaType)){
        // 	showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
        // 			"warning");
        // } else {
        // 	if(saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || redeemPointTrk || saleGameItemTrk){
        // 		showKeyNotAllowedMsg();
        // 	} else {
        // 		if(enablePaymentMedia){
        // 			console.log("coupon return dialog");

        // 			$("#couponReturn-dialog").dialog("open");
        // 		}
        // 		else{
        // 			showKeyNotAllowedMsg();
        // 		}
        // 	}
        // }

    });

    // PAYMENT MEDIA - Mkt Voucher button
    $("div#fnPad div#fnMktVoucher").click(function() {
        var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.COUPON.name;
        uilog('DBUG',"marketing voucher");
        if (donationNotValid && !donationPaymentMedia(mediaType)) {
            showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
                "warning");
        } else {
            if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name || redeemPointTrk || saleGameItemTrk) {
                showKeyNotAllowedMsg();
            } else {
                if (enablePaymentMedia && !saleTx.coBrandNumber) {
                    $("#marketing-voucher-dialog").data('mode', 'inquiry').dialog("open");
                } else {
                    showKeyNotAllowedMsg();
                }
            }
        }
    });

    // PAYMENT MEDIA - SODEXO button
    $("div#fnPad div#fnSodexo").click(function() {
        var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.SODEXO.name;
        // DEBUG ROUNDING
        // var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.SODEXO.name;
        /*if (!isValidForRounding(mediaType))
        {
        	showMsgDialog("Please Clear Rounding Amount First", "Warning");
        	return false;
        }*/
        if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name || redeemPointTrk || saleGameItemTrk) {
            //console.log("Kesini");
            showKeyNotAllowedMsg();
        } else {
            if (enablePaymentMedia) {
                processNonCmcPayment(function() {
                    var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.SODEXO.name;
                    var payment = parseInt($("#inputDisplay").val());
                    if (donationNotValid && !donationPaymentMedia(pymtMediaTypeName)) {
                        showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
                            "warning");
                    } else {
                        if (PAYMENT_MEDIA.isValidForTriggering(saleTx, pymtMediaTypeName, payment, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                            printDocument(setDocumentSodexo(saleTx));
                            showMsgDialog(getMsgValue("pos_sodexo_printing"), "info", function() {
                                CASHIER.executePaymentMedia(saleTx, pymtMediaTypeName, payment);
                            });
                        }
                    }
                }, mediaType);
            } else {
                showKeyNotAllowedMsg();
            }
        }
    });

    // PAYMENT MEDIA - GC PAYMENT button
    $("div#fnPad div#fnGcPayment").click(function() {
        var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.GC.name;
        // DEBUG ROUNDING
        //var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.GC.name;
        /*if (!isValidForRounding(mediaType))
        {
        	showMsgDialog("Please Clear Rounding Amount First", "Warning");
        	return false;
        }*/
        if (donationNotValid && !donationPaymentMedia(mediaType)) {
            showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
                "warning");
        } else {
            if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name || redeemPointTrk || saleGameItemTrk) {
                showKeyNotAllowedMsg();
            } else {
                if (enablePaymentMedia) {
                    processNonCmcPayment(function() {
                        // GC payment media
                        gcPaymentAmount = $("#inputDisplay").val();
                        var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.GC.name;
                        //var finalSubtotalTxAmount = CASHIER.getFinalSubtotalTxAmount(saleTx, {payments:saleTx.payments});

                        // GC COUNT MAX GC PAYMENT
                        isEVoucherGiftCard = false;
                        var gcPaymentCount = 0;
                        for (var i in saleTx.payments) {
                            if (saleTx.payments[i].paymentMediaType == 'GC') gcPaymentCount++;
                        }

                        if (gcPaymentCount >= parseInt(configuration.properties["MAX_GC_PAYMENT_HARD"])) {
                            showMsgDialog("Pembayaran GC sudah mencapai batas maksimal. Mohon selesaikan transaksi", "warning");
                            return false;
                        } else if (gcPaymentCount == parseInt(configuration.properties["MAX_GC_PAYMENT_SOFT"]))
                            promptSysMsg("WARNING: Pembayaran GC sudah mencapai batas maksimal. Mohon selesaikan transaksi", "GC PAYMENT ALERT");

                        if (PAYMENT_MEDIA.isValidForTriggering(saleTx, pymtMediaTypeName, gcPaymentAmount, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                            isGCPaymentMedia = true;
                            isInputGiftCardNumber = true;
                            //added
                            isGcMmsRedemption = true;
                            inquiryOnRedeem = false;
                            //end
                            processGiftCardItem({ giftCardNumber: "" });
                        }
                    }, mediaType);
                } else {
                    showKeyNotAllowedMsg();
                }
            }
        }
    });
    /* Added By Rafi Zendaris 28-11-2017 */
    $("div#fnPad div#fnEVoucher").click(function() {
        var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.GC.name;
        if (donationNotValid && !donationPaymentMedia(mediaType)) {
            showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
                "warning");
        } else {
            if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name || redeemPointTrk || saleGameItemTrk) {
                showKeyNotAllowedMsg();
            } else {
                if (enablePaymentMedia) {
                    processNonCmcPayment(function() {
                        // GC payment media
                        gcPaymentAmount = $("#inputDisplay").val();
                        var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.GC.name;
                        //var finalSubtotalTxAmount = CASHIER.getFinalSubtotalTxAmount(saleTx, {payments:saleTx.payments});

                        // GC COUNT MAX GC PAYMENT
                        isEVoucherGiftCard = true;
                        var gcPaymentCount = 0;
                        for (var i in saleTx.payments) {
                            if (saleTx.payments[i].paymentMediaType == 'GC') gcPaymentCount++;
                        }

                        if (gcPaymentCount >= parseInt(configuration.properties["MAX_GC_PAYMENT_HARD"])) {
                            showMsgDialog("Pembayaran GC sudah mencapai batas maksimal. Mohon selesaikan transaksi", "warning");
                            return false;
                        } else if (gcPaymentCount == parseInt(configuration.properties["MAX_GC_PAYMENT_SOFT"]))
                            promptSysMsg("WARNING: Pembayaran GC sudah mencapai batas maksimal. Mohon selesaikan transaksi", "GC PAYMENT ALERT");

                        if (PAYMENT_MEDIA.isValidForTriggering(saleTx, pymtMediaTypeName, gcPaymentAmount, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                            isGCPaymentMedia = true;
                            isInputGiftCardNumber = true;
                            isGcMmsRedemption = true;
                            inquiryOnRedeem = false;
                            processGiftCardItem({ giftCardNumber: "" });
                        }
                    }, mediaType);
                } else {
                    showKeyNotAllowedMsg();
                }
            }
        }
    });

    // PAYMENT MEDIA TRK
    $("div#fnPad div#fnTrkPoint").click(function() {
        var paymentMediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.TRK_POINT.name;
        eftType = CONSTANTS.EFT.TYPE.TRK_POINT;
        paymentTrk = CASHIER.getFinalSubtotalTxAmount(saleTx, { payments: saleTx.payments });
        if (redeemPointTrk) {
            if (PAYMENT_MEDIA.isValidForTriggering(saleTx, paymentMediaType, paymentTrk, enablePaymentMedia)) {
                if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name) {
                    showKeyNotAllowedMsg();
                } else {
                    if (enablePaymentMedia) {
                        //$("#trkPoint-dialog").dialog("open");
                        trkPointPayment(paymentMediaType);
                    } else {
                        showKeyNotAllowedMsg();
                    }
                }
            }
        } else {
            showKeyNotAllowedMsg();
        }
    });
    $("div#fnPad div#fnTrkSales").click(function() {
        console.log("div#fnPad div#fnTrkSales");
        var paymentMediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.TRK_SALES.name;
        eftType = CONSTANTS.EFT.TYPE.TRK_SALES;
        paymentTrk = CASHIER.getFinalSubtotalTxAmount(saleTx, { payments: saleTx.payments });
        console.log("TRK SALES saleGameItemTrk");
        if (saleGameItemTrk) {
            if (PAYMENT_MEDIA.isValidForTriggering(saleTx, paymentMediaType, paymentTrk, enablePaymentMedia)) {
                if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name) {
                    showKeyNotAllowedMsg();
                } else {
                    if (enablePaymentMedia) {
                        //$("#trkSales-dialog").dialog("open");
                        trkSalesPayment(paymentMediaType);
                    } else {
                        showKeyNotAllowedMsg();
                    }
                }
            }
        } else {
            showKeyNotAllowedMsg();
        }
    });

    // PAYMENT MEDIA - INSTALLMENT button
    $("div#fnPad div#fnInstallment").click(function() {
        var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name;
        // DEBUG ROUNDING
        /*if (!isValidForRounding(mediaType))
        {
        	showMsgDialog("Please Clear Rounding Amount First", "Warning");
        	return false;
        }*/
        if (donationNotValid && !donationPaymentMedia(mediaType)) {
            showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
                "warning");
        } else if (redeemPointTrk || saleGameItemTrk) {
            showKeyNotAllowedMsg();
        } else {
            if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name) {
                showKeyNotAllowedMsg();
            } else {
                var hasInstallment = PAYMENT_MEDIA.isTransactionHasMedia(saleTx, mediaType);
                $("#tenderNewAmount-dialog").data("mediaType", mediaType);
                if (enablePaymentMedia && !hasInstallment && !isInstallmentTransaction) {
                    // Comment because will be run after barcode scan for installment
                    //processNonCmcPayment(function(){
                    installmentPayent = parseInt($("#inputDisplay").val());
                    var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name;

                    if (PAYMENT_MEDIA.isValidForTriggering(
                            saleTx,
                            pymtMediaTypeName,
                            installmentPayent,
                            enablePaymentMedia) &&
                        isNoneGiftCardItemInTransaction()) {
                        saveSysMsg();
                        startInstallment();
                    }
                    //}, mediaType);
                } else {
                    showKeyNotAllowedMsg();
                }
            }
        }
    });

    // PAYMENT MEDIA - CRM_POINTS button
    $("div#fnPad #fnCRMPoints").click(function() {
        var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.CRM_POINTS.name;
        if (donationNotValid && !donationPaymentMedia(pymtMediaTypeName)) {
            showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
                "warning");
        } else {
            if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name || redeemPointTrk || saleGameItemTrk) {
                showKeyNotAllowedMsg();
            } else {
                crmRedeemPointsSelected = true;
                crmEnableEmpIdScan = true;
                toggleCpnInt = false;
                crmPointsAmount = parseInt($("#inputDisplay").val());
                // DEBUG ROUNDING
                /*if (!isValidForRounding(pymtMediaTypeName))
                {
                	showMsgDialog("Please Clear Rounding Amount First", "Warning");
                	return false;
                }*/

                currentPaymentMediaType = pymtMediaTypeName;
                var payment = crmPointsAmount;

                if (enablePaymentMedia && connectionOnline) {
                    crmRedeemAmountPaid = parseInt($("#inputDisplay").val());
                    if (!isGcMmsActivation) {
                        processNonCmcPayment(function() {
                            if (PAYMENT_MEDIA.isValidForTriggering(saleTx, pymtMediaTypeName, payment, enablePaymentMedia)) {
                                payWithPoints(saleTx);
                            }
                        }, pymtMediaTypeName);

                    } else {
                        showMsgDialog("Gift Card hanya dapat dibayar secara tunai", "warning");
                    }
                } else {
                    showKeyNotAllowedMsg();
                    $("div#numPad div#keyClr").triggerHandler('click');
                }
                clearInputDisplay();

                if (isNaN(payment) || (crmRedeemAmountPaid > saleTx.totalAmount) || (crmRedeemAmountPaid == 0)) {
                    $("div#numPad div#keyClr").triggerHandler('click');
                    $("div#numPad div#keyTotal").triggerHandler('click');
                }
            }
        }
    });

    // PAYMENT MEDIA -- FLASHiZ button
    $("div#fnPad #fnFlashiz").click(function() {
        if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name || redeemPointTrk || saleGameItemTrk) {
            showKeyNotAllowedMsg();
        } else {
            if (enablePaymentMedia && connectionOnline) {
                if (FLASHIZ.isFlashizConfigured()) {
                    var amount = parseInt($("#inputDisplay").val());
                    var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.FLASHIZ.name;
                    // DEBUG ROUNDING
                    /*if (!isValidForRounding(pymtMediaTypeName))
                    {
                    	showMsgDialog("Please Clear Rounding Amount First", "Warning");
                    	return false;
                    }*/
                    processNonCmcPayment(function() {
                        if (PAYMENT_MEDIA.isValidForTriggering(saleTx, mediaType, amount, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                            FLASHIZ.payWithFlashiz(amount);
                        }
                    }, mediaType);
                } else {
                    showMsgDialog(getMsgValue('flashiz_pos_not_configured'), "info");
                }
            } else {
                showKeyNotAllowedMsg();
            }
        }
    });

    // MLC 2017-04-21
    $("div#fnPad #fnMLC").click(function() {
        if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name || redeemPointTrk || saleGameItemTrk) {
            showKeyNotAllowedMsg();
        } else {
            if (enablePaymentMedia && (saleTx.eftTransactionType != CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO) && connectionOnline) {
                if (MLC.isMLCConfigured()) {
                    var amount = parseInt($("#inputDisplay").val());
                    var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.MLC_ONLINE.name;
                    // DEBUG ROUNDING
                    /*if (!isValidForRounding(mediaType))
                    {
                    	showMsgDialog("Please Clear Rounding Amount First", "Warning");
                    	return false;
                    }*/
                    //processNonCmcPayment(function() {
                    if (donationNotValid && !donationPaymentMedia(mediaType)) {
                        showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
                            "warning");
                    } else {
                        if (PAYMENT_MEDIA.isValidForTriggering(saleTx, mediaType, amount, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                            MLC.payWithMLC(amount);
                        }
                        //}, mediaType);
                    }
                } else {
                    showMsgDialog(getMsgValue('flashiz_pos_not_configured'), "info");
                }
            } else {
                showKeyNotAllowedMsg();
            }
        }
    });

    $("div#fnPad #fnOVO").click(function() {
        if (enablePaymentMedia && connectionOnline) {
            if (OVO.isOVOConfigured()) {
                var amount = parseInt($("#inputDisplay").val());
                var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.OVO_PAYMENT.name;
                if (donationNotValid && !donationPaymentMedia(mediaType)) {
                    showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
                        "warning");
                } else {
                    if (PAYMENT_MEDIA.isValidForTriggering(saleTx, mediaType, amount, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                        OVO.payWithOVO(amount);
                    }
                }
            } else {
                showMsgDialog("This POS Terminal is not yet configured to use OVO. Please contact administrator", "info");
            }
        } else {
            showKeyNotAllowedMsg();
        }
    });
    
    // ALTO WECHAT
    $("div#fnPad #fnAltoWeChat").click(function() {
        if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name || redeemPointTrk || saleGameItemTrk) {
            showKeyNotAllowedMsg();
        } else {
            if (enablePaymentMedia && (saleTx.eftTransactionType != CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO) && connectionOnline) {
                if (ALTOWC.isALTOWCConfigured()) {
                    var amount = parseInt($("#inputDisplay").val());
                    var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.ALTOWECHAT.name;
                    // DEBUG ROUNDING
                    /*if (!isValidForRounding(mediaType))
                    {
                    	showMsgDialog("Please Clear Rounding Amount First", "Warning");
                    	return false;
                    }*/
                    //processNonCmcPayment(function() {
                    if (donationNotValid && !donationPaymentMedia(mediaType)) {
                        showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
                            "warning");
                    } else {
                        if (PAYMENT_MEDIA.isValidForTriggering(saleTx, mediaType, amount, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                            ALTOWC.payWithALTOWC(amount);
                        }
                        //}, mediaType);
                    }
                } else {
                    showMsgDialog(getMsgValue('flashiz_pos_not_configured'), "info");
                }
            } else {
                showKeyNotAllowedMsg();
            }
        }
    });

    // ALTO WECHAT 2
    $("div#fnPad #fnAltoWeChat2").click(function() {
        if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name || redeemPointTrk || saleGameItemTrk) {
            showKeyNotAllowedMsg();
        } else {
            if (enablePaymentMedia && (saleTx.eftTransactionType != CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO) && connectionOnline) {
                if (ALTOWC.isALTOWCConfigured()) {
                    var amount = parseInt($("#inputDisplay").val());
                    var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.ALTOWECHAT.name;
                    // DEBUG ROUNDING
                    /*if (!isValidForRounding(mediaType))
                    {
                    	showMsgDialog("Please Clear Rounding Amount First", "Warning");
                    	return false;
                    }*/
                    //processNonCmcPayment(function() {
                    if (donationNotValid && !donationPaymentMedia(mediaType)) {
                        showMsgDialog(getMsgValue('donation_payment_media') + donationValidPaymentMedia,
                            "warning");
                    } else {
                        if (PAYMENT_MEDIA.isValidForTriggering(saleTx, mediaType, amount, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                            ALTOWC.payWithALTOWC2(amount);
                        }
                        //}, mediaType);
                    }
                } else {
                    showMsgDialog(getMsgValue('flashiz_pos_not_configured'), "info");
                }
            } else {
                showKeyNotAllowedMsg();
            }
        }
    });

    // MLC 2017-04-21
    // VOID ITEM button
    $("div#fnPad div#fnVoid").click(function() {
        if (toggleVoid) {
            toggleFNButton("fnVoid", false);
            if (toggleTVS) {
                restoreSysMsg();
            } else {
                promptSysMsg();
            }
            // set following variable to default value
            isAuthenticated = false;
            isPreAuthenticated = false;
            //			removeRenderedQuantity();
            if ($('#tempQtyDiv').html() != undefined) {
                renderQuantity(itemQty);
            }
        } else {
            var voidItemCnt = 0;
            var saleItemCnt = 0;
            saleTx.orderItems.forEach(function(saleItem) {
                if (saleItem.salesType === 'VOID')
                    voidItemCnt += saleItem.quantity;
                else if (saleItem.salesType === 'SALE')
                    saleItemCnt += saleItem.quantity;
            });
            // ADDS another level of condition to prevent using VOID function when no item to void.
            if (saleItemCnt > voidItemCnt) {
                if (isSaleStarted && saleTx.orderItems.length && !saleTx.qrtts && !toggleRounding) {
                    toggleFNButton("fnVoid", true);
                    disableClrFn = false;
                    $("#authentication-form").removeData(AUTH_DATA_KEYS)
                        .data('roles', ['ROLE_CASHIER_CANCELLATION', 'ROLE_CASHIER_VOID'])
                        .data('interventionType', CONSTANTS.TX_TYPES.ITEM_VOID.name)
                        .dialog("open");
                } else {
                    showKeyNotAllowedMsg();
                }
            } else
                showKeyNotAllowedMsg();
        }
    });

    $("div#fnPad div#fnTVS").click(function() {
        //uilog('DBUG','The connection is online: '+connectionOnline);
        if (connectionOnline) {
            if (toggleTVS) {
                showKeyNotAllowedMsg();
            } else {
                if ((saleTx && saleTx.orderItems && saleTx.orderItems.length > 0) ||
                    toggleStoreSale || toggleRecallSale || togglePostVoid ||
                    isProCustScan || (profCust && profCust.customerNumber) ||
                    saleTx.type != CONSTANTS.TX_TYPES.SALE.name) {
                    showKeyNotAllowedMsg();
                } else {
                    toggleTVS = true;
                    $("#authentication-form").removeData(AUTH_DATA_KEYS)
                        .data('roles', ['ROLE_STORE_MANAGER'])
                        .data('interventionType', CONSTANTS.TX_TYPES.TVS_SALE.name)
                        .dialog("open");
                }
            }
        } else {
            //Do not allow when offline
            showKeyNotAllowedMsg();
        }

    });

    // VOID SALE button
    $("div#fnPad div#fnPostVoid").click(function() {
        if (!connectionOnline) showMsgDialog("PSV Tidak dapat dilakukan ketika Offline", "warning");
        else SALEVOID.voidSale();
    });

    $("div#fnHoldRecall").click(function() {
        var $authFormDialog = $("#authentication-form");
        var rolesStoreRecallArray = ['ROLE_SUPERVISOR'];
        var defer = $.Deferred();
        if (hasScannedItem(saleTx)) {

            if (toggleRounding || toggleCpnInt) {
                showKeyNotAllowedMsg();
            } else {
                if (printTo != "P") {
                    showKeyNotAllowedMsg();
                } else {
                    // STORE function
                    var saleTxType = CONSTANTS.TX_TYPES.STORE.name;
                    toggleStoreSale = false;
                    isStoreSaleTransaction = true;
                    $authFormDialog.removeData(AUTH_DATA_KEYS)
                        .data('roles', rolesStoreRecallArray)
                        .data('interventionType',
                            saleTxType)
                        .data('defer', defer)
                        .dialog("open");
                    /*
                     * JQuery Deffered, used for chaining callbacks
                     * @author http://api.jquery.com/jQuery.Deferred/
                     */
                    defer.promise()
                        .done(function() {
                            toggleStoreSale = false;
                            STORE_RECALL.storeTxn();
                            // Terminates the flow
                            FUNCTION_FLOW.FLOW_HANDLER.terminateFlow();
                            // Show transaction complete dialog
                            toggleTVS = false;
                            showTransactionCompletedDialog(saleTxType + ' COMPLETED',
                                getMsgValue('prompt_msg_tx_stored_placeholder').format(saleTx.transactionId),
                                getMsgValue('prompt_msg_transaction_complete_new_order'));
                        });
                }
            }
        } else {
            // RECALL function
            if (toggleTVS || saleTx.coBrandNumber) {
                showKeyNotAllowedMsg();
            } else {
                toggleRecallSale = true;
                $authFormDialog.removeData(AUTH_DATA_KEYS)
                    .data('roles', rolesStoreRecallArray)
                    .data('interventionType',
                        CONSTANTS.TX_TYPES.RECALL.name)
                    .data('defer', defer)
                    .dialog("open");
                defer.promise()
                    .done(function(supervisorInterventionData) {
                        promptSysMsg(getMsgValue('prompt_msg_enter_txn_to_recall'), "RECALL SALE");
                        // temporary save the intervention data
                        SUPERVISOR_INTERVENTION.saveTempData(supervisorInterventionData);
                        disableClrFn = false;
                        //trigger customer screen change to in-active: Next Customer Please.
                        changeCustomerActiveScreen(CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.TRANSACTION);
                        FUNCTION_FLOW_CONFIG.RECALL.executeRecallFlow();
                    });
            }
        }
    });

    $("div#fnHoldRecallDP").click(function() {
        var $authFormDialog = $("#authentication-form");
        var rolesStoreRecallArray = ['ROLE_SUPERVISOR'];
        var defer = $.Deferred();
        if (hasScannedItem(saleTx)) {
            if (toggleRounding || toggleCpnInt) {
                showKeyNotAllowedMsg();
            } else {
                if (printTo != "P") {
                    showKeyNotAllowedMsg();
                } else {
                    // STORE function
                    var saleTxType = CONSTANTS.TX_TYPES.STORE.name;
                    toggleStoreSale = false;
                    isStoreSaleTransaction = true;
                    $authFormDialog.removeData(AUTH_DATA_KEYS)
                        .data('roles', rolesStoreRecallArray)
                        .data('interventionType',
                            saleTxType)
                        .data('defer', defer)
                        .dialog("open");
                    /*
                     * JQuery Deffered, used for chaining callbacks
                     * @author http://api.jquery.com/jQuery.Deferred/
                     */
                    defer.promise()
                        .done(function() {
                            toggleStoreSale = false;
                            STORE_RECALL.storeTxn();
                            // Terminates the flow
                            FUNCTION_FLOW.FLOW_HANDLER.terminateFlow();
                            // Show transaction complete dialog
                            toggleTVS = false;
                            showTransactionCompletedDialog(saleTxType + ' COMPLETED',
                                getMsgValue('prompt_msg_tx_stored_placeholder').format(saleTx.transactionId),
                                getMsgValue('prompt_msg_transaction_complete_new_order'));
                        });
                }
            }
        } else {
            // RECALL function
            if (toggleTVS || saleTx.coBrandNumber) {
                showKeyNotAllowedMsg();
            } else {
                toggleRecallSale = true;
                $authFormDialog.removeData(AUTH_DATA_KEYS)
                    .data('roles', rolesStoreRecallArray)
                    .data('interventionType',
                        CONSTANTS.TX_TYPES.RECALL.name)
                    .data('defer', defer)
                    .dialog("open");
                defer.promise()
                    .done(function(supervisorInterventionData) {
                        promptSysMsg(getMsgValue('prompt_msg_enter_txn_to_recall'), "RECALL SALE");
                        // temporary save the intervention data
                        SUPERVISOR_INTERVENTION.saveTempData(supervisorInterventionData);
                        disableClrFn = false;
                        //trigger customer screen change to in-active: Next Customer Please.
                        changeCustomerActiveScreen(CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.TRANSACTION);
                        FUNCTION_FLOW_CONFIG.RECALL.executeRecallFlow();
                    });
            }
        }
    });

    // TempOff button
    $("div#fnPad div#fnTempOff").click(function() {
        if ((saleTx && saleTx.orderItems.length > 0)) {
            showKeyNotAllowedMsg();
        } else {
            var $authFormDialog = $("#authentication-form");
            var defer = $.Deferred();
            toggleTempOff = true;
            var tempSignOffData = {
                startDate: new Date(),
                endDate: null
            };
            $authFormDialog.removeData(AUTH_DATA_KEYS)
                .data('roles', ['ROLE_SELF'])
                .data('defer', defer)
                .data('tempSignOffData', tempSignOffData)
                .dialog("open");
            var tempOffMsg = getConfigValue("TEMPOFF_MSG_1");
            $("#authFormMsg").text(tempOffMsg);
            changeCustomerActiveScreen(CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.NEXT_CASHIER);
            /*
             * JQuery Deffered, used for chaining callbacks
             * @author http://api.jquery.com/jQuery.Deferred/
             */
            defer.promise()
                .done(function() {
                    var tempSignOffData = $authFormDialog.data("tempSignOffData");
                    tempSignOffData.endDate = new Date();
                    TRANING_MODE.addTrialModeProperty(tempSignOffData);
                    saveTempOffDetails(tempSignOffData);
                    clearAuthenticationForm();
                    isPreAuthenticated = false;
                    //Display items in customer page
                    changeCustomerActiveScreen(CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.NEXT_CASHIER);
                    toggleTempOff = false;
                });
        }
    });

    // Cancel Sale button
    $("div#fnPad div#fnCancelSale").click(function() {
        if (isDeptstore) $('#depstoreSPGField').val('');
        console.log("Start cancel");
        CANCEL.cancelSaleTransaction();
        console.log("-1");
        saleTx.isCancelled = true;
        // INHOUSEVOUCHER 2017-04-13
        // ROLLBACK ALL REDEEMED VOUCHER
        if (saleTx.redeemVoucherList && saleTx.redeemVoucherList.length > 0) {
            console.log(saleTx);
            var rollBackVoucher = {
                'trxId': saleTx.transactionId,
                'voucherList': []
            };

            for (var i in saleTx.redeemVoucherList)
                rollBackVoucher.voucherList.push(saleTx.redeemVoucherList[i].id);

            console.log('Rollback redeemed vouchers');
            console.log(rollBackVoucher);

            var resp = callAgent('rollback', rollBackVoucher);
            console.log(resp);
        }
        // INHOUSEVOUCHER 2017-04-13
    });

    // Rounding button
    $("div#fnPad div#fnRounding").click(function() {
        if (saleTx.totalAmount == 0 ||
            !enablePaymentMedia ||
            toggleRounding ||
            toggleVoid
            //|| isInstallmentTransaction
            ||
            (saleTx.type == CONSTANTS.TX_TYPES.REFUND.name || saleTx.type == CONSTANTS.TX_TYPES.RETURN.name || redeemPointTrk || saleGameItemTrk)) {
            showKeyNotAllowedMsg();
        } else {
            var roundingType = getConfigValue("ROUNDING_TYPE");
            var subTotal = CASHIER.getFinalSaleTxAmount(saleTx);
            if ($("#tenderNewAmount-dialog").data('subtotal') &&
                $("#tenderNewAmount-dialog").data('subtotal') != 0) {
                subTotal = parseInt($("#tenderNewAmount-dialog").data('subtotal'));
            }

            if (roundingType == "SIMPLE_ROUNDING") {
                var amount = Number($("#inputDisplay").val());
                var placeVal = 100; // TODO must set a rule, for now place value when rounding using simple rounding is not configurable.
                var initialRoundingAmt = subTotal % placeVal;
                var configMaxRoundingAmt = Number(getConfigValue("MAX_ROUNDING_AMOUNT"));

                if (initialRoundingAmt == 0)
                    showMsgDialog(getMsgValue("pos_warning_msg_rounding_not_applicable"), "warning");
                else if (amount == "")
                    showMsgDialog(getMsgValue("pos_warning_msg_enter_rounding_amount"), "warning");
                else if (amount > configMaxRoundingAmt)
                    showMsgDialog(getMsgValue("pos_warning_msg_amount_exceeds_configured_rounding_limit"), "warning");
                else {
                    var isRoundingAllowed = false;
                    var allowedRoundingValues = [];
                    var tempRoundingValue;

                    if (initialRoundingAmt > 50)
                        tempRoundingValue = initialRoundingAmt - 50;
                    else
                        tempRoundingValue = initialRoundingAmt;

                    while (tempRoundingValue < configMaxRoundingAmt) {
                        allowedRoundingValues.push(tempRoundingValue);
                        tempRoundingValue += 50;
                    }
                    for (var i = 0; i < allowedRoundingValues.length; i++) {
                        if (amount == allowedRoundingValues[i]) {
                            isRoundingAllowed = true;
                            break;
                        }
                    }

                    if (isRoundingAllowed) {
                        saleTx.roundingAmount = amount * -1;
                        toggleRounding = true;
                    } else {
                        if (allowedRoundingValues.length == 0)
                            showMsgDialog(getMsgValue("pos_warning_msg_configured_rounding_amount_invalid"), "warning");
                        else
                            showMsgDialog(getMsgValue("pos_warning_msg_invalid_rounding_amount_entered"), "warning");
                    }
                }
                clearInputDisplay();
            } else {
                var roundingPlaces = parseInt(getConfigValue("ROUNDING_PLACES"));

                if (roundingType == "ROUND_UP")
                    saleTx.roundingAmount = ((Math.ceil(subTotal / roundingPlaces) * roundingPlaces) - subTotal);
                else if (roundingType == "ROUND_DOWN")
                    saleTx.roundingAmount = (subTotal - (Math.floor(subTotal / roundingPlaces) * roundingPlaces)) * -1;

                if (saleTx.roundingAmount)
                    toggleRounding = true;
            }
            renderTotal();
        }
        enableRoundingBarcodeScan = true;
        return toggleRounding;
    });

    // REFUND BUTTON
    $("#fnRefundTx").click(function() {
        if (!cashierRole.isCustomerServiceCashier &&
            cashierRole.isSalesCashier) {
            showMsgDialog(getMsgValue("pos_error_msg_refund_not_allowed"), "error");
        } else {
            if (!hasScannedItem(saleTx) && !toggleTVS) {
                //clearOrder();
                //createOrder();
                saleTx.type = CONSTANTS.TX_TYPES.REFUND.name;
                renderTransactionType();
                if (isHcEnabled && profCust.customerNumber) {
                    renderCustomerInfo(profCust.customerName, profCust.customerNumber);
                    $("#refundInfo-dialog").dialog("open");
                }
            } else {
                showKeyNotAllowedMsg();
            }
        }
    });
    var donationPopup = function() {
        var reqCatDon = reqCategoryDonation();
        var getDateDonation = getStartEndDateDonation();
        var nowDate = (new Date()).toISOString().slice(0, 10);
        if (saleTx.type != CONSTANTS.TX_TYPES.SALE.name) {
            showKeyNotAllowedMsg();
        } else {
            if (reqCatDon) {
                if (reqCatDon != "") {
                    if (getDateDonation.startDate <= nowDate && getDateDonation.endDate >= nowDate) {
                        $("#donation-dialog").data("reqCatDon", reqCatDon).dialog("open");
                    } else {
                        showMsgDialog(getMsgValue('list_donation_expired'),
                            "warning");
                    }
                } else {
                    showMsgDialog(getMsgValue('list_donation_not_found'),
                        "warning");
                }
            } else {
                showKeyNotAllowedMsg();
            }
        }
    }
    var donationPopupCash = function() {
            var reqCatDon = reqCategoryDonation();
            var getDateDonation = getStartEndDateDonation();
            var nowDate = (new Date()).toISOString().slice(0, 10);
            if (saleTx.type != CONSTANTS.TX_TYPES.SALE.name) {
                //showKeyNotAllowedMsg();
            } else {
                if (reqCatDon) {
                    console.log("reqCatDon : " + reqCatDon);
                    if (reqCatDon != "") {
                        if (getDateDonation.startDate <= nowDate && getDateDonation.endDate >= nowDate) {
                            $("#donation-dialog").data("reqCatDon", reqCatDon).dialog("open");
                        } else {
                            if (hasDonationCheck) {
                                uilog('DBUG', "Donation Donasi Execute : " + JSON.stringify(donationExecute));
                                if (saleTx.promotionItems.length <= 0) {
                                    saleTx.promotionItems = donationPromoItem;
                                }
                                CASHIER.executePaymentMedia(saleTx, donationExecute[1], donationExecute[2], donationExecute[3]);
                            }
                            //$(this).dialog("close");
                        }
                    } else {
                        CASHIER.executePaymentMedia(saleTx, donationExecute[1], donationExecute[2], donationExecute[3]);
                    }
                } else {
                    showKeyNotAllowedMsg();
                }
            }
        }
        //LOYALTY added by Rafi

    //e-MOTOR
    $("#MotorListrik").click(function() {
        if (connectionOnline) {
            if(isEnabledAgainEmotor) {
                $("#MotorListrikNumField").val('');
                $("#valSalesNoOrder").val('');
                $("#MotorListrik-dialog").dialog("open");
            }
            else{
                showKeyNotAllowedMsg();
            }
        } else {
            showMsgDialog(getMsgValue('pos_warning_offline_MotorListrik_program_not_allowed'), "warning");
        }
    });

    //CHECK PRICE
    $("#itemCheck").click(function() {
        $("#itemCheck-dialog").dialog("open");
        CustomerPopupScreen.cus_showCheckPriceDialog();
        $("#inputItem").val();
    });

    //LOYALTY PROGRAM
    $("#loyaltyProgram").click(function() {
        if (connectionOnline) {
            $("#valProgName").val('');
            $("#valMemberName").val('');
            $("#valTglLahir").val('');
            $("#valBlnLahir").val('');
            $("#valThnLahir").val('');
            $("#valAlamat").val('');
            $("#valKtpNumber").val('');
            $("#valHpNumber").val('');
            $("#valEmail").val('');
            $("#loyaltyProg-dialog").dialog("open");
        } else {
            showMsgDialog(getMsgValue('pos_warning_offline_loyalty_program_not_allowed'), "warning");
        }
    });

    $("#loyaltyMemberMobileNoBtn").click(function() {
        //TODO HERE
    });

    $("#loyaltyMemberIdBtn").click(function() {
        //TODO HERE
    });

    //DONATION Added By Rafi 
    $("#donation").click(function() {
        var reqCatDon = reqCategoryDonation();
        var getDateDonation = getStartEndDateDonation();
        var nowDate = (new Date()).toISOString().slice(0, 10);
        hasDonationCheck = false;
        if (saleTx.type != CONSTANTS.TX_TYPES.SALE.name) {
            showKeyNotAllowedMsg();
        } else {
            if (reqCatDon) {
                uilog('DBUG', "Request Category : " + JSON.stringify(reqCatDon));
                if (reqCatDon != "") {
                    if (getDateDonation.startDate <= nowDate && getDateDonation.endDate >= nowDate) {
                        $("#donation-dialog").data("reqCatDon", reqCatDon).dialog("open");
                    } else {
                        showMsgDialog(getMsgValue('list_donation_expired'),
                            "warning");
                    }
                } else {
                    showMsgDialog(getMsgValue('list_donation_not_found'),
                        "warning");
                }
            } else {
                showKeyNotAllowedMsg();
            }
        }
    });

    // Allo Top Up 2022-08-12
    $("div#fnPad div#alloTopUp").click(function() {
        $("#alloTopUp-dialog").data("saleType", saleTx.type).dialog("open");
    });


    $("div#fnPad div#alloTopUpBarcodeBtn").click(function() {
        $("#topupBarcodeInput-dialog").data("saleType", saleTx.type).dialog("open");
    });

    $("div#fnPad div#omniTelkomsel").click(function() {
        $("#omniTelkomsel-dialog").data("saleType", saleTx.type).dialog("open");
    });

    // RETURN BUTTON
    $("#fnReturnTx").click(function() {
        if (!cashierRole.isCustomerServiceCashier &&
            cashierRole.isSalesCashier) {
            showMsgDialog(getMsgValue("pos_error_msg_return_not_allowed"), "error");
        } else {
            if (!hasScannedItem(saleTx) && !toggleTVS) {
                //				clearOrder();
                //				createOrder();
                saleTx.type = CONSTANTS.TX_TYPES.RETURN.name;
                renderTransactionType();

                RETURN_REFUND.return.service.processOriginalTransactionIdInput();

                /*if (isHcEnabled && profCust.customerNumber) {
					// Hypercash POS, return function
                    //renderCustomerInfo(profCust.customerName, profCust.customerNumber);
					//$("#returnInfo-dialog").dialog("open");
				}*/
            } else {
                showKeyNotAllowedMsg();
            }
        }
    });

    /*
     * == FLOAT Function ==
     *
     * Press the FLOAT button
     * Press MEDIA TYPE KEY
     * Press Amount (using the amountConfirmDialog)
     * Press Subtotal
     * Print Float receipt
     *
     * Can interfere:
     * CLEAR, NEW ORDER, PRINT RECEIPT
     * Cannot interfere:
     * CANCEL SALE, VOID and etcetera(almost all)
     *
     * Implementation:
     * 1.) Use amountConfirmDialog, for amount capture
     * 2.) block 'mouseData' and 'scanBarcode', and #keyEnter(to prevent entry of manual barcode)
     *
     * Created function(functionFlow.js):
     * 1.) Clones all the func button, for backup
     * 2.) Overwrite the non-FunctionFlowQueue functions(not interferingFnArr, not flowOrderFnArr)
     *  with error msg prompt
     * 3.) Overwrite the original functions with the FunctionFlowQueue functions(interferingFnArr, flowOrderFnArr)
     * 4.) If the flow ends or the interfering function/s return true, the flow will terminate and return the
     * fuctions to its ORIGINAL DOM STATE(including data and events)
     */
    $("#fnPad #fnFloat").click(function() {
        if (!hasScannedItem(saleTx)) {
            var defer = $.Deferred();
            var saleTxtype = CONSTANTS.TX_TYPES.FLOAT.name;
            $("#authentication-form").removeData(AUTH_DATA_KEYS)
                .data('roles', ['ROLE_SUPERVISOR'])
                .data('interventionType',
                    saleTxtype)
                .data('defer',
                    defer)
                .dialog("open");
            /*
             * JQuery Deffered, used for chaining callbacks
             * @author http://api.jquery.com/jQuery.Deferred/
             */
            defer.promise()
                .done(function() {
                    saleTx.type = saleTxtype;
                    //Display items in customer page
                    changeCustomerActiveScreen(CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.TRANSACTION);
                    renderTransactionType();
                    // Execute the flow of Float function
                    FUNCTION_FLOW_CONFIG.FLOAT_PICKUP.executeFloatOrPickupFlow(saleTxtype);
                });
        } else {
            showKeyNotAllowedMsg();
        }
    });

    /**
     * Function call for PICK UP feature
     * TODO : modify function for saving PICK UP
     */
    $("#fnPad #fnPickup").click(function() {

        if (!hasScannedItem(saleTx) &&
            connectionOnline) {
            var defer = $.Deferred();
            var saleTxtype = CONSTANTS.TX_TYPES.PICKUP.name;
            $("#authentication-form").removeData(AUTH_DATA_KEYS)
                .data('roles', ['ROLE_SUPERVISOR'])
                .data('interventionType',
                    saleTxtype)
                .data('defer',
                    defer)
                .dialog("open");
            /*
             * JQuery Deffered, used for chaining callbacks
             * @author http://api.jquery.com/jQuery.Deferred/
             */
            defer.promise()
                .done(function() {
                    saleTx.type = saleTxtype;
                    //Display items in customer page
                    //				changeCustomerScreen(false);
                    changeCustomerActiveScreen(CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.TRANSACTION);
                    renderTransactionType();
                    // Execute the flow of Float function
                    FUNCTION_FLOW_CONFIG.FLOAT_PICKUP.executeFloatOrPickupFlow(saleTxtype);
                });
        } else if (!connectionOnline) {
            showMsgDialog(getMsgValue('pos_warning_offline_pickup_not_allowed'), "warning");
        } else {
            showKeyNotAllowedMsg();
        }
    });

    $("#fnPad #fnMMSFunctions").click(function() {
        if (connectionOnline) {
            $("#MMSFunctions-dialog").dialog("open");
        } else {
            showMsgDialog('MMS Functions are not allowed when offline', "warning");
        }
    });

    // PAYMENT MEDIA - GC MMS PAYMENT button
    $("div#fnGcMmsRedemption").click(function() {
        isGcMmsActivation = false;
        isGcMmsInquiry = false;
        var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.GC_MMS.name;
        if (enablePaymentMedia) {
            processNonCmcPayment(function() {
                // GC MMS payment amount
                gcPaymentAmount = $("#inputDisplay").val();
                if (PAYMENT_MEDIA.isValidForTriggering(saleTx, mediaType, gcPaymentAmount, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                    //uilog("DBUG","GC MMS redemption process start")
                    isGcMmsRedemption = true;
                    $("#MMSFunctions-dialog").dialog("close");
                    GIFTCARD_MMS.processGiftCardMmsTransaction();
                } else {
                    $("#MMSFunctions-dialog").dialog("close");
                }
            }, mediaType);
        } else {
            showKeyNotAllowedMsg();
        }
    });

    // MMS GC Activation button
    $("div#fnGcMmsActivation").click(function() {
        isGcMmsRedemption = false;
        isGcMmsInquiry = false;
        if (enablePaymentMedia) {
            showKeyNotAllowedMsg();
        } else {
            promptSysMsg('Please scan Gift Card item to be activated.', 'GC MMS Activation');
            //uilog("DBUG","GC MMS activation process start")
            isGcMmsActivation = true;
            $("#MMSFunctions-dialog").dialog("close");
        }
    });

    // MMS GC Inquiry button
    $("div#fnGcMmsInquiry").click(function() {

        if (isGcMmsRedemption) {
            isOnGcMmsRedemptionMode = true;
        }

        isGcMmsActivation = false;
        isGcMmsRedemption = false;
        //		if (enablePaymentMedia) {
        //			showKeyNotAllowedMsg();
        //		} else {
        //uilog("DBUG","GC MMS inquiry process start")
        isGcMmsInquiry = true;
        $("div#numPad div#keyClr").triggerHandler('click');
        GIFTCARD_MMS.processGiftCardMmsTransaction();
        $("#MMSFunctions-dialog").dialog("close");
        //		}

    });

    /**
     * Function call for EMPLOYEE/LOYALTY CARD feature
     */
    $("div#fnEmpCard").click(function() {
        if (!hasScannedItem(saleTx) &&
            connectionOnline) {
            $("#MMSFunctions-dialog").dialog("close");
            $("#crm-dialog").dialog("open");
        } else {
            showKeyNotAllowedMsg();
        }
    });

    $("#crmMemberMobileNoBtn").click(function() {
        isMemberContactSelected = true;
        $("#crm-member-input-option").dialog("close");
        $("#crmTxIdDiv label").text('ENTER MOBILE NO:');
        if (crmEarnPointsSelected == true ||
            crmRedeemPointsSelected == true ||
            isRenewMembershipSelected == true) {
            promptSysMsg(getMsgValue('pos_label_input_member_contact'), getMsgValue('pos_label_employee_loyalty_card'));
        }
    });

    $("#crmMemberIdBtn").click(function() {
        isMemberContactSelected = false;
        $("#crm-member-input-option").dialog("close");
        $("#crmTxIdDiv label").text('ENTER MEMBER ID:');
    });

    /*	$("#fnPad #moreFunction").click(function() {
    		if (toggleEmpCard){
    			showKeyNotAllowedMsg();
    		}
    	});

    	$("#fnPad #morePaymentMedia").click(function() {
    		if (toggleEmpCard){
    			showKeyNotAllowedMsg();
    		}
    	});

    	$("#fnPad #moreButtons").click(function() {
    		if (toggleEmpCard){
    			showKeyNotAllowedMsg();
    		}
    	});*/

    /**
     * Function call for LOYALTY CARD feature
     */
    /*	$("#fnPad #fnLoyaltyCard").click(function(){
    		if(saleTx &&
    		   saleTx.type == CONSTANTS.TX_TYPES.SALE.name &&
    		   saleTx.orderItems.length &&
    		   !toggleEmpCard){
    			uilog("DBUG","LOYALTY CARD clicked.");

    			if(customerIdForReward){
    				showMsgDialog("Member ID already provided.","warning");
    			}else{
    				toggleLoyaltyCard = true;
    				disableClrFn = false;
    				promptSysMsg("Please input customer's Member ID.", "Employee/Loyalty Card");
    			}
    		} else {
    			showKeyNotAllowedMsg();
    		}
    	});
    */
    $("div#fnPad div#fnFunc").click(function() {
        if (saleTx && saleTx.orderItems.length)
            showKeyNotAllowedMsg();
        else
            $("#function-dialog").dialog("open");

    });

    /**
     * GC balance inquiry button listener
     */
    $("div#fnPad div#fnGcInquiry").click(function() {
        //		if (saleTx && saleTx.orderItems.length) {
        //			showKeyNotAllowedMsg();
        //		} else {
        //cutTransactionId(saleTx.transactionId);
        var saleTxType = saleTx.type;
        var isPickup = (saleTxType == CONSTANTS.TX_TYPES.PICKUP.name);
        var isFloat = (saleTxType == CONSTANTS.TX_TYPES.FLOAT.name);

        if (toggleVoid || togglePostVoid || isInstallmentTransaction || isPickup || isFloat || redeemPointTrk || saleGameItemTrk) {
            showKeyNotAllowedMsg();
        } else {
            isEnablePaymentMedia = Boolean(enablePaymentMedia);
            isInputGiftCardNumber = true;
            isGiftCardBalanceInquiry = true;
            //added
            isGcMmsInquiry = true;
            isEVoucherGiftCard = false;
            inquiryOnRedeem = true;
            //end
            processGiftCardItem({ giftCardNumber: "" });
        }
        //		}
    });

    $("div#fnPad div#fnEvoucherInquiry").click(function() {
        //		if (saleTx && saleTx.orderItems.length) {
        //			showKeyNotAllowedMsg();
        //		} else {
        var saleTxType = saleTx.type;
        var isPickup = (saleTxType == CONSTANTS.TX_TYPES.PICKUP.name);
        var isFloat = (saleTxType == CONSTANTS.TX_TYPES.FLOAT.name);

        if (toggleVoid || togglePostVoid || isInstallmentTransaction || isPickup || isFloat || redeemPointTrk || saleGameItemTrk) {
            showKeyNotAllowedMsg();
        } else {
            isEnablePaymentMedia = Boolean(enablePaymentMedia);
            isInputGiftCardNumber = true;
            isGiftCardBalanceInquiry = true;
            //added
            isGcMmsInquiry = true;
            isEVoucherGiftCard = true;
            inquiryOnRedeem = true;
            //end
            processGiftCardItem({ giftCardNumber: "" });
        }
        //		}
    });

    /**
     * Function call for Annual Discount feature
     */
    $("div#fnPad div#fnEmpDisc").click(function() {
        if (saleTx &&
            saleTx.type == CONSTANTS.TX_TYPES.SALE.name &&
            saleTx.orderItems.length > 0 &&
            saleTx.coBrandNumber == "" &&
            enablePaymentMedia &&
            !toggleRounding &&
            !toggleCpnInt &&
            !toggleTVS) {
                if(midnightSalesSuccessLogin){
                    alloPaylaterDiscountToggled = false;
                    applyEmployeeDiscount();
                }else{
                    midnightSalesPreLogin = true;
                    $("#authentication-form").removeData(AUTH_DATA_KEYS)
                    .data('roles', ['ROLE_SUPERVISOR'])
                    .data('interventionType', CONSTANTS.TX_TYPES.SALE.name)
                    .dialog("open");
                }

        } else {
            showKeyNotAllowedMsg();
        }
    });

    $("div#fnPad div#fnPrimePaylaterDisc").click(function() {
        if (saleTx &&
            saleTx.type == CONSTANTS.TX_TYPES.SALE.name &&
            saleTx.orderItems.length > 0 &&
            enablePaymentMedia &&
            !toggleRounding &&
            !toggleCpnInt &&
            !toggleTVS) {
            
            alloPaylaterDiscountToggled = true;
            saleTx.employeeDiscountToggled = true;
            applyEmployeeDiscount();

        } else {
            showKeyNotAllowedMsg();
        }
    });

    // Balloon Game Redemption button
    $("div#fnPad div#fnBalloonGame").click(function() {
        if (saleTx &&
            saleTx.orderItems &&
            saleTx.orderItems.length > 0 &&
            saleTx.type == CONSTANTS.TX_TYPES.SALE.name &&
            enablePaymentMedia &&
            saleTx.payments &&
            saleTx.payments.length == 0 &&
            connectionOnline) {
            $("#balloonGameInputMember-dialog").dialog("open");
        } else {
            showKeyNotAllowedMsg();
        }
    });

    //Temporary Weighing Scale
    $("div#fnHcWeighingScale").click(function() {
        HC_WEIGH_SCALE.service.promptWeighingScaleEnterPluDialog();
        $("#MMSFunctions-dialog").dialog("close");
    });

    /***********************************
     * Function Pad Buttons End
     ***********************************/


    $(":button").click(function() {
        $(":button").trigger('blur');
    });

    $("#priceCheck").click(function() {
        togglePriceChecker();
    });

    $("#btnAddItem").click(function() {
        addItem(searchData);
    });

    // execute this function after the even binding of the FN buttons is done.
    // initPOSFnBtns(); uncomment this once final list of functions depending on a POS terminal is available.

    // invoke clock method
    clock();
    populateCreditCardTypeGlobal();
    populateOfflineBankIdMapGlobal();
    printCashierInformation(saleTx);


});

function printCashierInformation() {
    printReceipt({
        header: setReceiptHeader(saleTx),
        footer: setReceiptCashierInfo(saleTx)
    });
}
/**
 * Function for allowing barcode scanning.
 * Either by calculator, middle-mouse(test), or scanner itself.
 * @returns {Boolean}
 */
function isToProcessScannedBarcode() {
    // dis-allow scanning of item if any pop up dialog (message, warning or error dialog) is open
    var isTransactionDialogNotOpen = (!$(".ui-dialog").is(":visible"));
    var isRoundingBtnNotPressed = !toggleRounding;
    var isCoBrandDialogOpen = $("#memberPromotion-dialog").dialog("isOpen");
    var eleboxTransaction = $("#elebox-receipt-dialog").dialog("isOpen");
    var bpjsTransaction = $("#bpjs-receipt-dialog").dialog("isOpen");
    // if not FLOAT or PICKUP
    var isGoodsTransaction = saleTx && !CONSTANTS.NON_GOODS_TX_TYPES.findTxTypeByName(saleTx.type);
    // regular item is not allowed on topup refund, topup item is not allowed on regular item. 1 topup item only for topup refund.
    var isTopUpRefund = topUpItemRefundFlag;
    var isIndosmartRefund = indosmartItemRefundFlag;
    var isMCashRefund = mCashItemRefundFlag;
    var isAlterraRefund = alterraItemRefundFlag;
    var isInstallmentProcessed = isInstallmentTransaction && (installmentPaymentDetails != null);
    var isPaymentEnabled = saleTx &&
        saleTx.payments &&
        saleTx.payments.length > 0 &&
        (!isInstallmentTransaction || isInstallmentProcessed) &&
        toggleCRMPayment;

    //uilog("DBUG", saleTx);
    //uilog("DBUG", saleTx.payments);
    //uilog("DBUG", saleTx.payments.length);
    //uilog("DBUG", toggleCRMPayment);

    var enableScan = isTransactionDialogNotOpen &&
        (isRoundingBtnNotPressed || (isInstallmentTransaction && !isInstallmentProcessed)) &&
        (!toggleCpnInt || (isInstallmentTransaction && !isInstallmentProcessed)) &&
        isGoodsTransaction &&
        !isCoBrandDialogOpen &&
        !isTopUpRefund &&
        !isIndosmartRefund &&
        !isMCashRefund &&
        !isAlterraRefund &&
        !isPaymentEnabled &&
        !toggleRecallSale &&
        !isPrinting &&
        !BILL_PAYMENT.isBillPaymentTansaction() || eleboxTransaction || bpjsTransaction;

    /*uilog('DBUG','isTransactionDialogNotOpen: ' + isTransactionDialogNotOpen +
    	' isRoundingBtnNotPressed: ' + isRoundingBtnNotPressed + 
    	' isInstallmentTransaction: ' + isInstallmentTransaction + 
    	' isInstallmentProcessed: ' + isInstallmentProcessed + 
    	' toggleCpnInt: ' + toggleCpnInt + 
    	' isGoodsTransaction: ' + isGoodsTransaction + 
    	' isCoBrandDialogOpen: ' + isCoBrandDialogOpen + 
    	' isTopUpRefund: ' + isTopUpRefund + 
    	' isPaymentEnabled: ' + isPaymentEnabled + 
    	' toggleRecallSale: ' + toggleRecallSale + 
    	' isPrinting: ' + isPrinting +
    	' BILL_PAYMENT.isBillPaymentTansaction(): ' + BILL_PAYMENT.isBillPaymentTansaction());*/
    /*
     TODO: Customizable message for RETURNS scan not allowed
        1.) If Scanning an item, not in the returnable list.
        2.) If the available item for returns is exhausted.
     */
    if (!enableScan) {
        var msg = "Scan not allowed.";
        if (isPrinting)
            msg = "Scan not allowed. Printing is on-going."
        showMsgDialog(msg, "warning", function() {
            clearInputDisplay();
        });
    }

    return enableScan;
};

/**
 * Data received from proxy (scanner device)
 */
function dataReceived(barcode) {
    if ($("#barcodeAuthentication-form").dialog("isOpen")) {
        $("#barcodeAuthFormEmpCode").val(barcode);
    } else {

        var freshGoodsScanMode = getConfigValue("FRESH_GOODS_SCAN_MODE");

        if (isProCustScan) {
            //processProCustTxn(barcode);
            CRMAccountModule.Hypercash.lastCustomerCardScanned = barcode;
            CRMAccountModule.retriever.findAccountId(barcode);
        } else if (togglePostVoid) {
            showMsgDialog("Scan not allowed.", "warning");
        } else if (inhibitMultipler(barcode)) {
            showMsgDialog("Multiplier not allowed", "warning");
        } else if (toggleVoid) {
            processVoidItemScan(barcode);
        } else if (isInputGiftCardNumber) {
            var giftCardNumber = barcode;
            processGiftCardItem({ giftCardNumber: giftCardNumber });
        } else if (isInstallmentTransaction) {
            processInstallmentScan(barcode);
        } else if (!customerIdForReward && toggleEmpCard) {
            if (isMemberIdInputTypeAllowed('Scan')) {
                processEmpIdScan(barcode);
            } else {
                showMsgDialog(
                    "Scanner is not allowed this time. Please Input memberId manually.",
                    "warning");
            }
        } else {
            processSaleScan(barcode);
        }
    }
}

function processVoidItemScan(barcode) {
    var toVoidNow = true;

    if (isAuthenticated) {
        var prodObj = findItem(barcode);
        //uilog("DBUG","VOIDED ITEM: " + JSON.stringify(prodObj));

        //does not void until giftcard is cancelled
        if (isGiftCardItem(prodObj)) {
            if (GIFTCARDObject && GIFTCARDObject.giftCardItemArray && GIFTCARDObject.giftCardItemArray.length && !cancelledGCItem) {
                processGiftCardItem({ giftCardNumber: "" });
                toVoidNow = false;
            }
        }

        //DONATION
        if (isDonation(prodObj)) {
            prodObj.currentPrice = donasiVoidPrice;
            uilog("DBUG", "VOIDED ITEM id DONATION: " + JSON.stringify(prodObj));
            uilog("DBUG", "VOIDED ITEM id DONATION: " + JSON.stringify(saleTx));
        }

        // voidDeptStore 2017022
        if (isDeptStoreItem(prodObj) && !isDonation(prodObj)) {
            //(isVoidingDeptStore)? $("#voidDeptStore-dialog").dialog("open") : null;
            $("#voidDeptStore-dialog").dialog("open");
            toVoidNow = false;

        }
        // voidDeptStore 2017022

        if(prodObj.categoryId == 'ALLO_TOPUP'){
            showMsgDialog(
                "Allo Topup items cannot cancelled",
                "warning");
            toVoidNow = false;
        }
        
        if (!jQuery.isEmptyObject(prodObj) && !prodObj.error && toVoidNow) {
            revertEmployeeDiscount();
            if (voidItem(prodObj, itemQty)) {
                renderProductDetails(prodObj);
                refreshPromotion(false);
                renderTotal();
                saveTxn();
                toggleFNButton("fnVoid", false);
                if (toggleTVS) {
                    restoreSysMsg();
                } else {
                    promptSysMsg();
                }
                // set following variable to default value
                isAuthenticated = false;
                isPreAuthenticated = false;
                // will disable CLEAR function.
                disableClrFn = true;
                Hypercash.service.autoTagCustomerAsNonMember();
            } else {
                reApplyEmployeeDiscount();
            }
        }
    }
    clearInputDisplay();
}

function processGiftCardScan(barcode) {
    var giftCardObj = findItem(barcode);
    if (!jQuery.isEmptyObject(giftCardObj) && !giftCardObj.error) {
        if (isGiftCardItem(giftCardObj)) {
            showMsgDialog("Enter Card Number", "warning");
            isInputGiftCardNumber = true;
            renderSearchResult(giftCardObj, null);
        } else {
            showMsgDialog("Non Gift card item rejected", "error");
            clearInputDisplay();
        }
    } else {
        $("#prodSearchResult").html("No product found!");
        clearInputDisplay();
    }
}

function processDeptstoreScan(prodObj, barcode) {
    deptStoreTempEan = barcode;
    var currentDate = new Date();
    var hours = currentDate.getHours() < 10 ? "0" + currentDate.getHours() : currentDate.getHours();
    var minutes = currentDate.getMinutes() < 10 ? "0" + currentDate.getMinutes() : currentDate.getMinutes();
    var currentTime = hours + ":" + minutes;

    $("#depstore-detail-dialog").data('item', prodObj);
    $('#depstoreDescField').val(prodObj['shortDesc']);

    var autoMarkdownPromo = getSinglePromo(prodObj, CONSTANTS.PROMOTION_TYPES.AUTOMATIC_MARKDOWN, currentTime);

    if (prodObj.categoryId != 'DEPTSTORE') {
        $('#depstoreBarcodeField').attr('disabled', 'disabled').val('');
        $("#depstore-detail-dialog").dialog("open");
        var sPrice = prodObj.currentPrice;
        var markdown = PROMOTIONS.calculateDiscount(autoMarkdownPromo, sPrice, 1, isWeightSupplied(prodObj));

        if (markdown > 0) {
            $('#deptNettPrice').data('discmarkdown', markdown);
            $('#deptMarkdownPrice').html(numberWithCommas(markdown));
        }

        $('#deptScannedPrice').html(numberWithCommas(sPrice));
        $('#deptNettPrice').data('sprice', sPrice);
        calculateDeptStoreNettPrice();
    } else {
        $('#depstoreBarcodeField').removeAttr('disabled');
        prodObj.ean13Code = barcode;
        $("#depstore-detail-dialog").dialog("open");
    }
}

function processSaleScanNext(prodObj, barcode) {
    console.log("process sale barcode =", barcode);
    var continueTx = true;
    if (isRenewMembershipSelected || isMembershipToBeRenewed) {
        continueTx = false;
        if (!isMembershipRenewalItem(prodObj)) {
            crmToggleMembershipRenewal = true;
            showMsgDialog('Please scan membership renewal item.', 'Error');
        }
    }

    if (!jQuery.isEmptyObject(prodObj) && !prodObj.error) {
        if (TOPUP.isTopUpItem(prodObj)) {
            if (!connectionOnline) {
                showMsgDialog("TopUp item is not allowed on Offline Mode.", "warning");
                clearInputDisplay();
                continueTx = false;
            }
            /* else if (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name && saleTx.orderItems.length) {
            				showMsgDialog("TopUp item is not allowed.", "warning");
            				clearInputDisplay();
            				continueTx = false;
            			}*/
        } else if (INDOSMART.isIndosmartItem(prodObj)) {
            if (!connectionOnline) {
                showMsgDialog("Indosmart item is not allowed on Offline Mode.", "warning");
                clearInputDisplay();
                continueTx = false;
            }
        } else if (MCASH.isMCashItem(prodObj)) {
            if (!connectionOnline) {
                showMsgDialog("MCash item is not allowed on Offline Mode.", "warning");
                clearInputDisplay();
                continueTx = false;
            }
        } else if (ALTERRA.isAlterraItem(prodObj)) {
            if (!connectionOnline) {
                showMsgDialog("Alterra item is not allowed on Offline Mode.", "warning");
                clearInputDisplay();
                continueTx = false;
            }
        } else if (isGiftCardItem(prodObj) && (!cashierRole.isCustomerServiceCashier || cashierRole.isSalesCashier)) {
            if (!isGCCanBeAdded() && (!GIFTCARDObject && !GCMMSCardNoRef.length)) {
                showMsgDialog(getMsgValue("giftcard_msg_gc_rejected"), "error");
                clearInputDisplay();
            } else {
                if (isGcMmsActivation) {
                    // GC MMS activation here
                    GIFTCARD_MMS.processGiftCardMmsTransaction({ prodObj: prodObj });
                } else {
                    // GC OGLOBA activation here
                    processGiftCardItem({ prodObj: prodObj });
                }
            }
            continueTx = false;
        } else if (isMembershipRenewalItem(prodObj)) {
            if (!isRenewMembershipSelected && !isMembershipToBeRenewed) {
                showMsgDialog('Scan not allowed', 'Error');
                continueTx = false;
            } else {
                if (saleTx.orderItems.length > 0) {
                    showMsgDialog('Scan not allowed', 'Error');
                    continueTx = false;
                } else {
                    continueTx = true;
                }
            }
        }
        //			else if (isExtraWarrantyItem(prodObj)) {
        //				// For Feature: #89049
        ////				if(   saleTx.type == CONSTANTS.TX_TYPES.RETURN.name
        ////				   || saleTx.type == CONSTANTS.TX_TYPES.REFUND.name){
        ////					continueTx = false;
        ////					var txType = saleTx.type == CONSTANTS.TX_TYPES.RETURN.name?"returned":"refunded";
        ////					showMsgDialog("Extra Warranty can't be "+txType+".", "error");
        ////				}else{
        //					if (isWarrantyItemCanBeAdded()) {
        //						applianceAndWarranty.isSaleHasWarrantyItem = true;
        //						applianceAndWarranty.scannedWarrantyItems[prodObj.id] = prodObj.id;
        //					} else {
        //						continueTx = false;
        //						showMsgDialog("Extra Warranty should be sold separately.", "error");
        //					}
        ////				}
        //			} else if (applianceAndWarranty.isSaleHasWarrantyItem
        //					&& isSaleHasWarrantyItem()) {
        //				// the applianceAndWarranty.isSaleHasWarrantyItem is true
        //				// even the warranty
        //				// item is voided so we have to double check the tx with
        //				// isSaleHasWarrantyItem()
        //				continueTx = false;
        //				showMsgDialog("Extra Warranty should be sold separately.", "error");
        //			}
        else if ($("#topUp-phoneNum-dialog").dialog("isOpen")) {
            continueTx = false;
        } else if ($("#indosmart-phoneNum-dialog").dialog("isOpen")) {
            continueTx = false;
        } else if ($("#mCash-phoneNum-dialog").dialog("isOpen")) {
            continueTx = false;
        } else if ($("#alterra-phoneNum-dialog").dialog("isOpen")) {
            continueTx = false;
        } else if (redeemPointTrk) {
            if (prodObj.trkType != "RDM") {
                showMsgDialog('NON TRK REDEEMED PRODUCT', 'Error');
                continueTx = false;
            }
        } else if (saleGameItemTrk) {
            if (prodObj.trkType != "GMS") {
                showMsgDialog('NON TRK SALES PRODUCT', 'Error');
                continueTx = false;
            }
        }
        /*else if(isInstallmentItem(prodObj)){
        	if(eftTransactionType && eftTransactionType.search(CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO) != -1){
        		renderSearchResult(prodObj);
        		continueTx = false;
        	} else {
        		continueTx = true;
        	}
        }*/

        if (saleTx.type == CONSTANTS.TX_TYPES.SALE.name &&
            cashierRole.isCustomerServiceCashier &&
            !cashierRole.isSalesCashier) {
            continueTx = false;
            showMsgDialog(getMsgValue("pos_warning_msg_return_refund_only"), "warning");
        }

        //cannot scan other item if there is gc card
        if ((GCMMSCardNoRef.length && (GIFTCARDObject && GIFTCARDObject.isGiftCardItemOrder)) && continueTx) {
            continueTx = false;
            showMsgDialog(getMsgValue("giftcard_msg_non_giftcard"), "warning");
            clearInputDisplay();
        }





        //cannot scan other item is installment
        /*if(eftTransactionType && eftTransactionType.search(CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO) != -1 && continueTx){
        	continueTx = false;
        	//TODO: uncomment and replace the static message
        	showMsgDialog(getMsgValue("eft_msg_err_non_installment_prohibited"), "warning");
        	clearInputDisplay();
        }*/

        console.log("continue tx ?", continueTx);
        if (continueTx) {
            renderSearchResult(prodObj);
            // reset to false after successful product scan
            enablePaymentMedia = false;
            Hypercash.service.autoTagCustomerAsNonMember();
        }
        cleared = true;

        var itemAum = findItem(barcode);
        if (itemAum.categoryId == 'AUM') {
            $("#asuransi-dialog").data("saleType", saleTx.type).dialog("open");
        }
    } else {
        console.log("No product found");
        $("#prodSearchResult").html("No product found!");
    }
}

function processSaleScan(barcode) {
    CustomerPopupScreen.cus_closeFeedback();
    if (barcode) {
        //uilog('DBUG','Tx status: '+saleTx.type+' baseidfun: '+saleTx.baseTransactionId);
        var prodObj = {};

        if (RETURN_REFUND.return.service.isReturnTransaction()) {
            if (RETURN_REFUND.return.service.validateReturnItemScan(barcode)) {
                prodObj = findItem(barcode);
            }
        } else prodObj = findItem(barcode);

        if (donasiFlag) {
            prodObj.currentPrice = donasiRes;
            uilog('DBUG', "Proses Sale Scan donasi true : " + JSON.stringify(prodObj));
            if (configuration.terminalType == 'DEPTSTORE') {
                processSaleScanNext(prodObj, barcode);
                return false;
            }
        }

        if (!RETURN_REFUND.return.service.isReturnOrRefundTxn() && configuration.terminalType != 'DEPTSTORE') {
            processSaleScanNext(prodObj, barcode);
            return false;
        }

        if (!$.isArray(prodObj)) {
            if (!RETURN_REFUND.return.service.isReturnOrRefundTxn()) {
                console.log("line 3621 my barcode =", barcode);
                processDeptstoreScan(prodObj, barcode);
            }                
            else {
                console.log("line 3625 my barcode =", barcode);
                processSaleScanNext(prodObj, barcode);
            }
        } else {
            $('#profitBarcodeBtn').data({ 'prodObj': prodObj[0], 'barcode': barcode });
            $('#depstoreBarcodeBtn').data({ 'prodObj': prodObj[1], 'barcode': barcode });
            $("#barcode-menu-dialog").dialog('open').data('prodObj', prodObj);
        }
    } else {
        // JUST FOR DEVELOPMENT
        showMsgDialog("Product ID not supplied.", "error");
    }
}

/*********************************
 * GiftCard Functions Start
 ********************************/
/**
 * Checks if param specified is a Gift card data
 */
function isGiftCardItem(data) {
    if (data && data.categoryId && data.categoryId.toLowerCase() == "gift card") {
        return true;
    } else {
        return false;
    }
}
/*********************************
 * DONATION Functions Start
 ********************************/
/**
 * Checks if param specified is a DONATION data
 */
function isDonation(data) {
    if (data && data.categoryId && data.categoryId.toLowerCase() == "donation") {
        return true;
    } else {
        return false;
    }
}

function processInstallmentItem(data) {
    if (EFT.installmentType && EFT.installmentType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO) {
        renderSearchResult(data);
    } else {
        showMsgDialog("Non-installment items are not allowed.", "warning");
        clearInputDisplay();
    }
}

/**
 * Adds giftcard item in the transaction
 * @param data
 * @param response
 */
function addGiftCardItem(data) {
    //qty is always 1
    itemQty = 1;

    ++scannedItemOrder;
    // scan transactions start here
    if (!(saleTx.startDate))
        saleTx.startDate = new Date();
    addScannedItem(data);

    renderProductDetails(data);
    renderScannedItem(saleTx.orderItems.last);
    renderGiftCardRequest(data);
    renderTotal();

    refreshPromotion(false);
    enableCoBrand = false;
    clearInputDisplay();
    $("#btnAddItem").empty();
    printScannedItem();
    // Item has been added cannot do CLEAR already.
    disableClrFn = true;
}

/**
 * Gift Card Start process
 * @param data
 */
function processGiftCardItem(data) {
    initGiftCardObj();
    var gcProduct = null;
    var giftCardNumber = "";
    var giftCardInfo = null;

    if (data['giftCardNumber']) {
        giftCardNumber = data['giftCardNumber'];
    }
    if (data['prodObj']) {
        gcProduct = data['prodObj'];
        GIFTCARDObject.currProductScanned = gcProduct;
    }
    // return/refund not allowed for gift card
    if (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name || saleTx.type == CONSTANTS.TX_TYPES.REFUND.name) {
        clearGiftCardTransaction();
        clearInputDisplay();
        showMsgDialog(getMsgValue("giftcard_msg_return_refund_not_allowed"), "warning");
    } else {
        if (connectionOnline) {
            if (!isInputGiftCardNumber) {
                //Open dialog to input/scan card number dialog
                $("#giftcard-input-dialog").dialog("open");
            } else {
                //opens giftcard number input/scan dialog
                if ($("#giftcard-input-dialog").dialog("isOpen")) {
                    $("#giftcardInputField").val(giftCardNumber);
                } else {
                    if (isEVoucherGiftCard) {
                        $("#evoucher-input-dialog").dialog("open");
                    } else {
                        $("#giftcard-input-dialog").dialog("open");
                    }
                }
            }
        } else {
            clearGiftCardTransaction();
            showMsgDialog(getMsgValue("giftcard_msg_offline"), "warning");
        }
    }

}

/**
 * Check all payment media for giftcard items. Should be cash only.
 * @returns {Boolean}
 */
function processGiftCardItemsPayment() {
    var payments = saleTx.payments;
    var isValidGiftCardItemTransaction = true;
    for (var ctr = 0; ctr < payments.length; ctr++) {
        if (payments[ctr].paymentMediaType != CONSTANTS.PAYMENT_MEDIA_TYPES.CASH.name) {
            if (!GCMMSCardNoRef.length) {
                isValidGiftCardItemTransaction = false;
            }
        }
    }
    return isValidGiftCardItemTransaction;
}

/**
 * Checks if order items has giftcard items.
 * @returns {Boolean}
 */
function isNoneGiftCardItemInTransaction() {
    var containsGiftCardItem = false;

    for (var i = 0; i < saleTx.orderItems.length; i++) {
        if (isGiftCardItem(saleTx.orderItems[i])) {
            containsGiftCardItem = true;
            break;
        }
    }
    /*if(GIFTCARDObject && GIFTCARDObject.isGiftCardItemOrder){
    	showMsgDialog(getMsgValue('giftcard_msg_cash_payment_only'),"warning");
    	return false;
    }*/
    if (containsGiftCardItem) {
        showMsgDialog(getMsgValue('giftcard_msg_cash_payment_only'), "warning");
        return false;
    }
    return true;
}

/**
 * Checks if GC item can be added in saleTx
 * @returns {Boolean}
 */
function isGCCanBeAdded() {
    var origItems = saleTx.orderItems;
    var voidedItems = [];

    for (x in origItems) {
        if (origItems[x].isVoided) {
            voidedItems.push(origItems[x]);
        }
    }
    //hotfix 1-12-2014
    if (origItems.length > 0 && voidedItems.length == 0) {
        return false;
    }
    if (origItems.length > 0 && voidedItems.length > 0 && !((voidedItems.length * 2) == origItems.length)) {
        return false;
    }

    return true;
}
/*********************************
 * GiftCard Functions End
 ********************************/

/**
 * Method for Processing Employee Reward.
 *
 * @param barcode
 */
function processEmpIdScan(barcode) {

    if (barcode && !toggleNoEmpId) {
        var isCashier = isLoggedInCashier(barcode);

        if (isCashier) {
            showMsgDialog(getMsgValue('pos_warning_msg_id_is_in_use'), "warning");
        } else {

            var crmResponse = isCustomerValidForReward(barcode, saleTx);

            if (crmResponse && crmResponse.type == 'SUCCESS') {
                if (crmResponse.status == "ACTIVE") {
                    // store barcode.
                    customerIdForReward = barcode;

                    if (isMemberContactSelected) {
                        customerIdForReward = crmResponse.accountNumber;
                    }

                    profitCodes = crmResponse.profitCodes;

                    if (!toggleCRMPoints) {
                        promptSysMsg(getMsgValue('pos_label_member_id_is_active'), getMsgValue('pos_label_reward_points'));
                        availEmpLoyaltyPoints = true;
                        if (isHcEnabled) {
                            CRMAccountModule.Hypercash.startProfCust(crmResponse);
                            renderCustomerInfo(profCust.customerName, profCust.customerNumber);
                        }
                        checkIfMembershipHasExpired(crmResponse, customerIdForReward);
                    } else {
                        $("#systemMessageDiv").empty();
                        enableCRMEnterPinDialog();
                    }

                    if (!isHcEnabled)
                        renderCustomerInfo((crmResponse.firstName ? crmResponse.firstName : '') + ' ' + (crmResponse.lastName ? crmResponse.lastName : ''), crmResponse.accountNumber);

                    clearInputDisplay();
                    toggleEmpCard = false;
                    saleTx.customerId = customerIdForReward;
                } else if (crmResponse.status == "INACTIVE") {
                    clearInputDisplay();
                    currentPaymentMediaType = null;
                    showMsgDialog(getMsgValue('pos_label_member_id_is_inactive'), "warning");
                    if (crmEarnPointsSelected ||
                        crmRedeemPointsSelected ||
                        isRenewMembershipSelected) {
                        if (isMemberContactSelected == true) {
                            promptSysMsg("Please input customer's Mobile No.", "Employee/Loyalty Card");
                        } else {
                            promptSysMsg("Please input customer's Member ID.", "Employee/Loyalty Card");
                        }
                    } else {
                        promptSysMsg();
                    }
                }
            } else if (crmResponse.type == 'ERROR') {
                clearInputDisplay();
                if (crmResponse.messageCode == 'MSGC001' &&
                    isMemberContactSelected == true) {
                    showMsgDialog(getMsgValue('pos_label_no_mobile_no_found') + ' ' + barcode, "warning");
                } else {
                    showMsgDialog(crmResponse.message, "warning");
                }
                currentPaymentMediaType = null;

                if (crmEarnPointsSelected || crmRedeemPointsSelected || isRenewMembershipSelected) {
                    if (isMemberContactSelected == true) {
                        promptSysMsg("Please input customer's Mobile No.", "Employee/Loyalty Card");
                    } else {
                        promptSysMsg("Please input customer's Member ID.", "Employee/Loyalty Card");
                    }
                } else {
                    promptSysMsg();
                }
            }
        }
    } else {
        if (isMemberContactSelected == true) {
            showMsgDialog(getMsgValue('pos_warning_member_contact_not_supplied'), "warning");
        } else {
            showMsgDialog(getMsgValue('pos_warning_member_id_not_supplied'), "warning");
        }

        toggleNoEmpId = false;
    }
    saveTxn();
}

function getMsgSubstring(data, length) {
    var str = data.substring(0, length);
    data = data.slice(length);
    return str;
}

/**
 * Check if scanned item is membership renewal item
 */
function isMembershipRenewalItem(data) {
    if (data && data.categoryId && data.categoryId.toLowerCase() == "mrenewal") {
        promptSysMsg();
        return true;
    } else {
        return false;
    }
}

/**
 * Will return a Product object if no error encountered.
 */
function findItem(barcode) {
    var isHTTPStatusOK = false;
    var data = $.ajax({
        url: posWebContextPath + "/product/getProductByBarcode/" + barcode,
        type: "GET",
        async: false,
        dataType: "json",
        success: function(data, status) {
            if (!jQuery.isEmptyObject(data) && !data.error) {
                isHTTPStatusOK = true;
                lastBarcodeScanned = barcode;
                productObj = data;
            }
        },
        error: function(jqXHR, status, error) {
            uilog('DBUG', 'Error: ' + error + "\nError Response: " + jqXHR.responseText);
        }
    }).responseText;

    if (!isHTTPStatusOK && (!isRenewMembershipSelected || !isMembershipToBeRenewed)) {
        showMsgDialog(getMsgValue('pos_warning_msg_file_not_found'), "warning");
    }
    return (isHTTPStatusOK) ? JSON.parse(data) : null;
}

function findTrxItem(barcode) {
    var data = null;
    for (var idx in saleTx.orderItems) {
        var item = saleTx.orderItems[idx];
        // FOR NOW, RETURN THE HIGHEST PRICE
        if (item.ean13Code == barcode && (data == null || data.priceSubtotal > item.priceSubtotal) && !item.isVoided)
            data = item;
        else uilog("DBUG", item);
    }

    if (!isRenewMembershipSelected || !isMembershipToBeRenewed || data == null) {
        showMsgDialog("Barang tidak terbeli", "warning");
    }
    return data;
}

function forceLogout(terminalId) {
    // set to default value
    toggleLogout = false;
    // TODO : must be pulled from somewhere
    isUserBarcodeRequired = true;
    /*
     * Display items in customer page
     *
     * Displays the "NEXT CASHIER PLEASE"
     */
    changeCustomerActiveScreen(
        CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.NEXT_CASHIER
    );
    //sign-off open Cashier Drawer
    // Logout-ing the user
    if (terminalId) {
        location.href = posWebContextPath + "/resources/j_spring_security_logout?tid=" + terminalId;
    } else {
        location.href = posWebContextPath + "/resources/j_spring_security_logout";
    }
}

/**
 * Finds an item by sku
 * Will return a Product object if no error encountered.
 */
function findItemBySku(sku) {
    var isHTTPStatusOK = false;
    var data = $.ajax({
        url: posWebContextPath + "/product/getProductBySku/" + sku,
        type: "GET",
        async: false,
        dataType: "json",
        success: function(data, status) {
            isHTTPStatusOK = true;
        },
        error: function(jqXHR, status, error) {
            //uilog('DBUG','Error: ' + error + "\nError Response: " + jqXHR.responseText);
        }
    }).responseText;

    if (!isHTTPStatusOK) {
        showMsgDialog(getMsgValue('pos_warning_msg_file_not_found'), "warning");
    }
    return (isHTTPStatusOK) ? JSON.parse(data) : null;
}


function findItemById(id) {
    var isHTTPStatusOK = false;
    var data = $.ajax({
        url: posWebContextPath + "/product/getProductById/" + id,
        type: "GET",
        async: false,
        dataType: "json",
        success: function(data, status) {
            isHTTPStatusOK = true;
        }
    }).responseText;

    if (!isHTTPStatusOK) {
        showMsgDialog(getMsgValue('pos_warning_msg_file_not_found'), "warning");
    }
    return (isHTTPStatusOK) ? JSON.parse(data) : null;
}

///**
// * Will return true if ean13Code exist otherwise will return false.
// */
//function hasMarkDown(ean13Code) {
//	return JSON.parse($.ajax({
//		url : posWebContextPath + "/product/hasMarkDown/" + ean13Code,
//		type : "GET",
//		async : false,
//		dataType : "json"
//	}).responseText);
//}
//
///**
// * Will return ProductMarkDown object if no error encountered.
// */
//function findMarkDown(barcode) {
//	return JSON.parse($.ajax({
//		url : posWebContextPath + "/product/getProductMarkDownByBarCode/" + barcode,
//		type : "GET",
//		async : false,
//		dataType : "json"
//	}).responseText);
//}

/**
 * Adds item to SaleTx.
 *
 * @param data
 */
function addItem(data) {
    if (saleTx) {
        if (saleTx.type == CONSTANTS.TX_TYPES.SALE.name) {
            // SCAN ITEM LIMIT
            if (saleTx.orderItems.length >= parseInt(configuration.properties["MAX_ITEM_SCAN_HARD"]))
                return false;
            else if (saleTx.orderItems.length == parseInt(configuration.properties["MAX_ITEM_SCAN_SOFT"]))
                promptSysMsg("WARNING: Transaksi sudah mencapai batas maksimal. Mohon selesaikan transaksi", "SCAN ALERT");

            if (toggleTVS && isTVSOpenPrice(data)) {
                clearInputDisplay();
                // adding of item, rendering, processes and etc. will be done after ok button is pressed.
                var tVSProductPriceOverride = getPriceOverrideOfProduct(data.id);
                var priceUnit = tVSProductPriceOverride != null ? tVSProductPriceOverride.recentPriceUnit : data.currentPrice;
                var output = data.shortDesc + "\t\t" + data.currentPrice;

                $("#itemScanned").text(output);
                $("#priceInput").val(priceUnit);
                $("#priceConfirmation-dialog").dialog("option", "title", "OPEN PRICE").data("prodObj", data).dialog("open");
                //uilog("DBUG","Price Unit INPUT: "+$("#priceInput").val());
            } else if((saleTx.orderItems.length >= 1 && data.categoryId == 'ALLO_TOPUP') || (itemQty > 1 && data.categoryId == 'ALLO_TOPUP')){
                showMsgDialog("Multiply Item Allo Topup tidak di ijinkan", "warning");
            } else {
                //uilog("DBUG","ITEM:" + JSON.stringify(data));
                addSaleItem(data);
            }
        } else if (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name || saleTx.type == CONSTANTS.TX_TYPES.REFUND.name) {
            if (TOPUP.isTopUpItem(data)) {
                if (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name) {
                    clearInputDisplay();
                    // adding of item, rendering, processes and etc. will be done after topup id is provided.
                    $("#topUp-dialog").data("saleType", saleTx.type).data("prodObj", data).dialog("open");
                } else if (saleTx.type == CONSTANTS.TX_TYPES.REFUND.name)
                    showMsgDialog("Item not allowed.", "warning");
            } else if (INDOSMART.isIndosmartItem(data)) {
                if (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name) {
                    clearInputDisplay();
                    $("#indosmart-dialog").data("saleType", saleTx.type).data("prodObj", data).dialog("open");
                } else if (saleTx.type == CONSTANTS.TX_TYPES.REFUND.name)
                    showMsgDialog("Item not allowed.", "warning");
            } else if (MCASH.isMCashItem(data)) {
                if (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name) {
                    clearInputDisplay();
                    $("#mCash-dialog").data("saleType", saleTx.type).data("prodObj", data).dialog("open");
                } else if (saleTx.type == CONSTANTS.TX_TYPES.REFUND.name)
                    showMsgDialog("Item not allowed.", "warning");
            } else if (ALTERRA.isAlterraItem(data)) {
                if (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name) {
                    clearInputDisplay();
                    $("#alterra-dialog").data("saleType", saleTx.type).data("prodObj", data).dialog("open");
                } else if (saleTx.type == CONSTANTS.TX_TYPES.REFUND.name)
                    showMsgDialog("Item not allowed.", "warning");
            } else if (isGiftCardItem(data)) {
                showMsgDialog(getMsgValue("giftcard_msg_return_refund_not_allowed"), "warning");
            } else {
                clearInputDisplay();
                // adding of item, rendering, processes and etc. will be done after ok button is pressed.
                var priceUnit = data.currentPrice;
                var output = data.shortDesc + "\t\t" + priceUnit;

                //Bug #92714 - If HC Return, default price to be displayed is price before tax if taxable
                if (profCust && profCust.customerNumber && saleTx.type == CONSTANTS.TX_TYPES.RETURN.name) {
                    priceUnit = Math.round(Hypercash.service.getItemPriceBeforeTax(data)); //applied same rounding in epsonprinter.js
                }

                $("#itemScanned").text(output);
                $("#priceInput").val(priceUnit);
                // CR RETURN 
                if (getConfigValue("RETURN_FLAG") == "true" && saleTx.type == CONSTANTS.TX_TYPES.RETURN.name) {

                    if (!connectionOnline || $("#fnReturnTx").data("isAuthenticated")) {
                        $("#returnConfirmation-dialog").data("itemName", data.name)
                            .data("maxReturnQty", itemQty)
                            .data("totalPrice", priceUnit)
                            .data("totalDiscount", 0)
                            .data("megaDiscount", 0)
                            .data("nett", data.currentPrice * itemQty)
                            .data("prodObj", data)
                            .dialog("open");
                    } else {
                        console.log("Returned item");
                        console.log(data);
                        console.log(saleTx);

                        if (SIMPATINDO.isSimpatindoItem(data)) {
                            var isValidForReturn = SIMPATINDO.isValidForReturn(saleTx);
                            if (isValidForReturn) {
                                $("#return-dialog").data("prodObj", data).dialog("open");
                            } else {
                                showMsgDialog("Item tidak dapat dikembalikan. Silahkan inquiry kembali.");
                            }
                        } else if(data.categoryId == 'ALLO_TOPUP'){
                            showMsgDialog("Item Allo Topup tidak dapat dikembalikan.", "warning");
                        } else {
                            $("#return-dialog").data("prodObj", data).dialog("open");
                        }
                    }
                } else
                    $("#priceConfirmation-dialog").dialog("option", "title", saleTx.type + "\xa0" + "SALE").data("prodObj", data).dialog("open");
                // CR RETURN
                //uilog("DBUG","Price Unit INPUT: "+$("#priceInput").val());
            }
            // NOTE : itemQty must be set to 1 (default) after addScannedItem for Return or Refund sale type.
        }
    }
}

function addSaleItem(data, oldPrice) {
    if (TOPUP.isTopUpItem(data)) {
        console.log("topup");
        TOPUP.initTopUpStandardSale(data);
    } else if (INDOSMART.isIndosmartItem(data)) {
        console.log("indosmart");
        INDOSMART.initIndosmartStandardSale(data);
    } else if (MCASH.isMCashItem(data)) {
        console.log("mcash");
        MCASH.initMCashStandardSale(data);
    } else if (ALTERRA.isAlterraItem(data)) {
        console.log("alterra");
        ALTERRA.initAlterraStandardSale(data);
    } else {
        ++scannedItemOrder;
        // scan transactions start here
        if (!(saleTx.startDate))
            saleTx.startDate = new Date();

        //uilog("DBUG", data);
        addScannedItem(data, oldPrice);
        renderProductDetails(data);
        // Item has been added cannot do CLEAR already.
        disableClrFn = true;
        renderScannedItem(saleTx.orderItems.last);
        renderTotal();
        refreshPromotion(false);
        enableCoBrand = false;
        clearInputDisplay();
        $("#btnAddItem").empty();
        printScannedItem();
    }
    // scan finished for sale transaction, must set itemQty to 1 (default)
    itemQty = 1;
}

/**
 * Add scanned items in saleTx object and compute subtotal and total quantity.
 */
function addScannedItem(data, oldPrice) {
    //uilog("DBUG", data);
    var quantity = isWeightSupplied(data) ? data.weight : itemQty;

    // push items in orderItems and add quantity and subtotal.
    var orderItem = new Object();
    orderItem.productId = data.id;
    if (redeemPointTrk) {
        orderItem.categoryId = "RDM";
    } else if (saleGameItemTrk) {
        orderItem.categoryId = "GMS";
    } else {
        orderItem.categoryId = data.categoryId;
    }

    orderItem.ean13Code = data.ean13Code;

    //orderItem.originalPriceUnit = oldPrice!=null?oldPrice:null;
    if (redeemPointTrk) {
        orderItem.priceUnit = data.trkPoint;
        orderItem.originalPriceUnit = data.trkPrice;
        orderItem.priceSubtotal = quantity * data.trkPoint;
    } else if (saleGameItemTrk) {
        orderItem.priceUnit = data.trkPrice;
        orderItem.priceSubtotal = quantity * data.trkPrice;
    } else {
        orderItem.priceUnit = data.currentPrice;
        orderItem.priceSubtotal = quantity * data.currentPrice;
    }

    if (isWeightSupplied(data)) {
        orderItem.priceSubtotal = calculateWeightedPrice(quantity, data.currentPrice);
        var valToAppend = parseFloat(quantity * 1000).toFixed(0);
        orderItem.weightBarcode = data.ean13Code.substring(0, 6) + valToAppend.toString().leftPad("0", 6) + "0";
    }


    orderItem.plu = data.plu;
    orderItem.sku = data.sku;
    orderItem.departmentCode = data.departmentCode;

    // init to zero
    orderItem.discountAmount = 0;
    orderItem.memberDiscountAmount = 0;
    orderItem.crmMemberDiscountAmount = 0;
    orderItem.discBtnAmount = 0;

    orderItem.quantity = quantity;
    orderItem.name = data.name;
    orderItem.shortDesc = data.shortDesc;
    if (redeemPointTrk) {
        orderItem.isTaxInclusive = false;
    } else {
        orderItem.isTaxInclusive = data.isTaxInclusive;
    }
    orderItem.salesType = CONSTANTS.TX_TYPES.SALE.name;
    orderItem.isVoided = false;
    orderItem.description = data.description;
    orderItem.isHotSpiceItem = data.isHotSpiceItem;
    orderItem.weight = data.weight;
    orderItem.discBtnApplied = false;

    orderItem.discVoucher = [];

    if (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name &&
        connectionOnline)
        orderItem.returnItemId = data.returnItemId;

    var currentDate = new Date();
    var hours = currentDate.getHours() < 10 ? "0" + currentDate.getHours() : currentDate.getHours();
    var minutes = currentDate.getMinutes() < 10 ? "0" + currentDate.getMinutes() : currentDate.getMinutes();
    var currentTime = hours + ":" + minutes;
    orderItem.scanTime = currentTime;
    itemScanDatesMap[orderItem.scanTime + orderItem.productId] = currentDate;

    // add total quantity and price on order
    if (isWeightSupplied(data)) {
        saleTx.totalAmount += calculateWeightedPrice(quantity, data.currentPrice);
    } else {
        if (redeemPointTrk) {
            saleTx.totalAmount += (data.trkPoint * quantity);
            saleTx.totalTrk += (data.trkPrice * quantity);
        } else if (saleGameItemTrk) {
            saleTx.totalAmount += (data.trkPrice * quantity);
        } else {
            saleTx.totalAmount += (data.currentPrice * quantity);
        }
    }
    //handle fresh goods, quantity max 3 decimal places
    saleTx.totalQuantity = ((parseFloat(saleTx.totalQuantity * 1000) + parseFloat(quantity * 1000)) / 1000);

    // will calculate markdown discount if product has markdown and Transaction type is SALE.
    if ((saleTx.type == CONSTANTS.TX_TYPES.SALE.name || saleTx.type == CONSTANTS.TX_TYPES.RECALL.name) && !redeemPointTrk && !saleGameItemTrk) {
        processLayerOnePromotions(saleTx, orderItem, CONSTANTS.TX_TYPES.SALE.name, data);
    }

    if (TOPUP.isTopUpItem(data)) {
        var topUpAmt = orderItem.priceSubtotal - orderItem.discountAmount - orderItem.memberDiscountAmount - orderItem.crmMemberDiscountAmount;
        topUpObj.totalAmt += topUpAmt;
    }

    if (INDOSMART.isIndosmartItem(data)) {
        var indosmartAmt = orderItem.priceSubtotal - orderItem.discountAmount - orderItem.memberDiscountAmount - orderItem.crmMemberDiscountAmount;
        indosmartObj.totalAmt += indosmartAmt;
    }

    if (MCASH.isMCashItem(data)) {
        var mCashAmt = orderItem.priceSubtotal - orderItem.discountAmount - orderItem.memberDiscountAmount - orderItem.crmMemberDiscountAmount;
        mCashObj.totalAmt += mCashAmt;
    }

    if (ALTERRA.isAlterraItem(data)) {
        var alterraAmt = orderItem.priceSubtotal - orderItem.discountAmount - orderItem.memberDiscountAmount - orderItem.crmMemberDiscountAmount;
        alterraObj.totalAmt += alterraAmt;
    }

    var clonedPromotions = cloneObject(data.promotions);

    // for layer 2 promotions
    // FIX FOR BUGS #
    if (!(orderItem.productId in promotionsMap) && clonedPromotions.length > 0 &&
        !redeemPointTrk && !saleGameItemTrk
        /*&& !(isFreshGoods(data))*/
    ) {

        var itemPromotions = [];
        var validPromo;

        for (var i in CONSTANTS.PROMOTION_TYPES) {
            if (isLayerTwoPromo(CONSTANTS.PROMOTION_TYPES[i])) {
                validPromo = getSinglePromo(data, CONSTANTS.PROMOTION_TYPES[i]);
                if (validPromo) {
                    if (CONSTANTS.PROMOTION_TYPES[i] == CONSTANTS.PROMOTION_TYPES.PURCHASE_WITH_PURCHASE)
                        itemPromotions = itemPromotions.concat(validPromo);
                    else itemPromotions.push(validPromo);
                }
            }
        }

        if (itemPromotions.length > 0) {
            promotionsMap[orderItem.productId] = itemPromotions;
        }

    }

    /*//Exclude RETURN/REFUND transaction on applying Non Member Markup charge
    if (isHcEnabled && profCust && profCust.customerNumber
    	&& saleTx.type != CONSTANTS.TX_TYPES.RETURN.name
    	&& saleTx.type != CONSTANTS.TX_TYPES.REFUND.name) {
    	Hypercash.service.applyNonMemberMarkup(orderItem);
    }*/

    // TO NEUTRALIZE CMC ON DEPTSTORE
    // console.log("addScannedItem.data");
    // console.log(data);

    if (redeemPointTrk) {
        orderItem.priceUnit = data.trkPoint;
    } else if (saleGameItemTrk) {
        orderItem.priceUnit = data.trkPrice;
    } else {
        orderItem.priceUnit = data.currentPrice;
    }

    if (tmpStaff) {
        orderItem.staffId = tmpStaff;
    }
    //console.log("addScannedItem.orderItem");
    //console.log(orderItem);

    // DEPTSTORE CALCULATE DISCOUNT
    if (isDeptstore) {
        orderItem.discMarkdown = data.discMarkdown;
        orderItem.discPrice = data.discPrice;
        orderItem.discAmount = data.discAmount;
        orderItem.discVoucher = data.discVoucher;
        orderItem.discVoucherBarcode = data.discVoucherBarcode; // INHOUSE VOUCHER 2017-04-13
        orderItem.staffId = data.staffId;

        if (data.discMarkdown && data.discMarkdown > 0)
            orderItem.discountAmount += Math.round(orderItem.quantity * data.discMarkdown);

        for (var p in data.discAmount)
            orderItem.discountAmount += Math.round(orderItem.quantity * parseInt(data.discAmount[p]));

        for (var v in data.discVoucher) // INHOUSE VOUCHER 2017-04-13
            orderItem.discountAmount += parseInt(data.discVoucher[v]);

        saleTx.totalDiscount += orderItem.discountAmount;

        if (orderItem.categoryId != 'DEPTSTORE' &&
            orderItem.categoryId != 'GIFT CARD' &&
            orderItem.categoryId != 'TOPUP' &&
            orderItem.categoryId != 'ALLO_TOPUP' &&
            orderItem.categoryId != 'INDOSMART' &&
            orderItem.categoryId != 'MCASH' &&
            orderItem.categoryId != 'ALTERRA' &&
            orderItem.categoryId != 'XWARRANTY' &&
            orderItem.categoryId != 'DONATION') orderItem.categoryId = 'DIRECTP';
        else orderItem.plu = data.ean13Code.substring(1, 7);

        if (typeof data.voucherSingleMode != 'undefined') orderItem.voucherSingleMode = true; // INHOUSE VOUCHER 2017-04-13
    }

    // CR RETURN
    if (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name && getConfigValue("RETURN_FLAG") == "true") {
        if (!saleTx.totalDiscount) {
            saleTx.totalDiscount = 0;
        }

        //if($("#returnConfirmation-dialog").data("deptItem"))
        //{
        orderItem.priceUnit = parseInt(data.currentPrice);
        // DEBUG CR RETURN
        orderItem.priceSubtotal = parseInt(data.currentPrice * quantity);
        if (isWeightSupplied(data)) {
            orderItem.priceSubtotal = calculateWeightedPrice(quantity, data.currentPrice)
        }
        //}
        orderItem.discountAmount = data.discount_amount;
        orderItem.memberDiscountAmount = data.member_discount_amount;
        saleTx.totalDiscount += orderItem.memberDiscountAmount;
        saleTx.totalDiscount += orderItem.discountAmount;
    }
    // CR RETURN
    if (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name ||
        saleTx.type == CONSTANTS.TX_TYPES.REFUND.name) {
        orderItem.rrReason = data.rr_reason;
    }

    if (data.isUsedADAF) {
        orderItem.isUsedADAF = true;
        orderItem.ADAFData = data.ADAFData;
    } else {
        orderItem.isUsedADAF = false;
    }

    saleTx.orderItems.push(orderItem);
    var tmpJb = [];
    for (var jb in saleTx.orderItems) {
        if (tmpJb.indexOf(saleTx.orderItems[jb].sku) <= -1) {
            tmpJb.push(saleTx.orderItems[jb].sku);
        }
    }
    saleTx.totalJenisBarang = tmpJb.length;

    if (typeof saleTx.cmcAmount == 'undefined') saleTx.cmcAmount = 0;
    saleTx.cmcAmount += orderItem.memberDiscountAmount;
}




/**
 * business logic for voiding items. will return true if void success otherwise
 * will return false.
 *
 * @param prodObj
 * @param qty
 */
function voidItem(prodObj, qty) {
    var isVoidingFreshGoods = isFreshGoods(prodObj);
    // voidDeptStore 2017022
    var isVoidingDeptStore = isDeptStoreItem(prodObj);
    // voidDeptStore 2017022
    // Include fresh good productId to filter; Fresh good is price sensitive
    var priceSensitiveProdIdArr = (isVoidingFreshGoods) ? [prodObj.id] : [];
    var isPriceSensitive = (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name || saleTx.type == CONSTANTS.TX_TYPES.REFUND.name || toggleTVS);
    var orderItemArr = getSummarizeSaleItems(saleTx, priceSensitiveProdIdArr, isPriceSensitive);

    var item = null;
    var quantity = 1;
    var success = false;
    var isFreshGoodsScanByWeight = isWeightSupplied(prodObj);

    if (qty) quantity = qty;

    if (isFreshGoodsScanByWeight) quantity = prodObj.weight;

    for (var i = orderItemArr.length - 1; i >= 0; i--) {
        //for ( var i = 0; i < orderItemArr.length; i++) {	
        if ((!isVoidingFreshGoods &&
                orderItemArr[i].productId === prodObj.id) ||
            // voidDeptStore 2017022
            (isVoidingDeptStore &&
                orderItemArr[i].productId === prodObj.productId) ||
            // voidDeptStore 2017022
            (isVoidingFreshGoods &&
                !isFreshGoodsScanByWeight &&
                orderItemArr[i].productId === prodObj.id &&
                orderItemArr[i].priceUnit === prodObj.currentPrice) ||
            (isFreshGoodsScanByWeight &&
                orderItemArr[i].productId === prodObj.id &&
                orderItemArr[i].weight === prodObj.weight)
        ) {
            item = orderItemArr[i];
            if (orderItemArr[i].quantity > 0) break;
        }
    }

    var eligibleItem = item;

    if (item != null && item.quantity > 0) {
        // 20160201 - LUCKY - CHANGE TO LIFO MECHANISM FOR VOIDING ITEM ORDER INDEX
        var qtyItem = item.quantity;
        var itemList = saleTx.orderItems;
        var ix;
        // voidDeptStore 2017
        for (ix = itemList.length - 1; ix >= 0; ix--) {
            var tempAmountSaleTx = itemList[ix]["priceSubtotal"] - itemList[ix]["discountAmount"] - itemList[ix]["memberDiscountAmount"] - itemList[ix]["crmMemberDiscountAmount"] - itemList[ix]["discBtnAmount"] - itemList[ix]["secondLayerDiscountAmount"];
            var tempAmountProdObj = prodObj["priceSubtotal"] - prodObj["discountAmount"] - prodObj["memberDiscountAmount"] - prodObj["crmMemberDiscountAmount"] - prodObj["discBtnAmount"] - prodObj["secondLayerDiscountAmount"];

            if (isVoidingDeptStore) {
                if (itemList[ix]['productId'] == item.productId &&
                    itemList[ix]['salesType'] != CONSTANTS.TX_TYPES.SALE_VOID.name &&
                    !itemList[ix]['isVoided'] &&
                    typeof itemList[ix]['allvoided'] === 'undefined' &&
                    tempAmountSaleTx === tempAmountProdObj) {
                    item = cloneObject(itemList[ix]);
                    item.quantity = qtyItem;
                    break;
                }
            } else if (itemList[ix]['productId'] == item.productId &&
                itemList[ix]['salesType'] != CONSTANTS.TX_TYPES.SALE_VOID.name &&
                !itemList[ix]['isVoided'] &&
                typeof itemList[ix]['allvoided'] == 'undefined') {
                item = cloneObject(itemList[ix]);
                item.quantity = qtyItem;
                break;
            }
        }
        // voidDeptStore 2017

        var voidingQty = quantity;
        while (voidingQty > 0 && ix > -1) {
            if (typeof itemList[ix]['voidedQty'] == 'undefined') itemList[ix].voidedQty = 0;

            if ((itemList[ix].quantity - itemList[ix].voidedQty) <= voidingQty && !isDonation(prodObj)) {
                itemList[ix].allvoided = true;
            } else if (isDonation(prodObj)) {
                itemList[ix].allvoided = false;
            } else {
                itemList[ix].voidedQty = voidingQty;
            }

            voidingQty -= (itemList[ix].quantity > voidingQty ? voidingQty : itemList[ix].quantity);
            ix--;
        }

        if (isFreshGoodsScanByWeight && item.quantity != quantity) {
            showMsgDialog(getMsgValue("fresh_goods_warning_msg_invalid_weight"), "warning");
            return success;
        } else if (item.quantity >= quantity) {
            if (!((saleTx.type == CONSTANTS.TX_TYPES.RETURN.name || saleTx.type == CONSTANTS.TX_TYPES.REFUND.name) && isFreshGoodsScanByWeight))
                item.priceSubtotal = (isFreshGoodsScanByWeight) ? calculateWeightedPrice(quantity, item.priceUnit) : quantity * item.priceUnit;

            uilog("DBUG", prodObj);
            item.quantity = quantity;
            item.salesType = CONSTANTS.TX_TYPES.SALE_VOID.name;
            item.isVoided = true;
            item.promotions = prodObj.promotions;
            item.barcode = prodObj.ean13Code;

            if (!isVoidingDeptStore && (saleTx.type == CONSTANTS.TX_TYPES.SALE.name || saleTx.type == CONSTANTS.TX_TYPES.RECALL.name) && !redeemPointTrk && !saleGameItemTrk)
                processLayerOnePromotions(saleTx, item, CONSTANTS.TX_TYPES.SALE_VOID.name, item);

            if (TOPUP.isTopUpItem(prodObj)) {
                TOPUP.voidTopUpItem(prodObj.sku);
                topUpObj.totalAmt -= (item.priceSubtotal - item.discountAmount - item.memberDiscountAmount);
            }

            if (INDOSMART.isIndosmartItem(prodObj)) {
                INDOSMART.voidIndosmartItem(prodObj.sku);
                indosmartObj.totalAmt -= (item.priceSubtotal - item.discountAmount - item.memberDiscountAmount);
            }

            if (MCASH.isMCashItem(prodObj)) {
                MCASH.voidMCashItem(prodObj.sku);
                mCashObj.totalAmt -= (item.priceSubtotal - item.discountAmount - item.memberDiscountAmount);
            }

            if (ALTERRA.isAlterraItem(prodObj)) {
                ALTERRA.voidAlterraItem(prodObj.sku);
                alterraObj.totalAmt -= (item.priceSubtotal - item.discountAmount - item.memberDiscountAmount);
            }

            // Start: "Supervisor intervention" voided item amount

            var voidedItemAmount = item.discountAmount + item.memberDiscountAmount + item.crmMemberDiscountAmount;

            var searchedLastSupervisorIntvObj = SUPERVISOR_INTERVENTION.getLastInstanceByInterventionType(saleTx, CONSTANTS.TX_TYPES.ITEM_VOID.name /*ITEM VOID*/ );
            if (voidedItemAmount > 0 && searchedLastSupervisorIntvObj)
                searchedLastSupervisorIntvObj.amount = item.priceSubtotal - voidedItemAmount;
            else if (searchedLastSupervisorIntvObj)
                searchedLastSupervisorIntvObj.amount = item.priceSubtotal;
            // End: "Supervisor intervention" voided item amount

            var currentDate = new Date();
            var hours = currentDate.getHours() < 10 ? "0" + currentDate.getHours() : currentDate.getHours();
            var minutes = currentDate.getMinutes() < 10 ? "0" + currentDate.getMinutes() : currentDate.getMinutes();
            var currentTime = hours + ":" + minutes;
            item.scanTime = currentTime;

            /*			//NOTE: TEMPORARILY exclude RETURN transaction on applying Non Member Markup charge
            			// if(isHcEnabled && saleTx.type != CONSTANTS.TX_TYPES.RETURN.name)
            			//Exclude RETURN transaction on applying Non Member Markup charge
            			if(isHcEnabled && profCust && profCust.customerNumber && saleTx.type != CONSTANTS.TX_TYPES.RETURN.name){
            				Hypercash.service.applyNonMemberMarkup(item);
            			}*/

            // DEPSTORE TREATMENT
            // INHOUSE VOUCHER 2017-04-13
            if (item.categoryId == 'DEPTSTORE' && item.discVoucher.length > 0) {
                //showMsgDialog('Tidak dapat melakukan VOID pada item yang sudah memiliki Redeem Voucher', 'warning');
                //return false;
                // IF THERE IS VOUCHER REDEEMED
                var rollBackVoucher = {
                    'trxId': saleTx.transactionId,
                    'voucherList': []
                };

                for (var i in item.discVoucherBarcode) {
                    rollBackVoucher.voucherList.push(item.discVoucherBarcode[i]);
                    saleTx.totalDiscount -= parseInt(item.discVoucher);
                }

                console.log('Rollback redeemed vouchers');
                console.log(rollBackVoucher);

                var resp = callAgent('rollback', rollBackVoucher);
                console.log(resp);

            }
            // INHOUSE VOUCHER 2017-04-13

            if (item.discMarkdown && item.discMarkdown > 0)
                saleTx.totalDiscount -= Math.round(item.discMarkdown * item.quantity);

            for (var p in item.discAmount)
                saleTx.totalDiscount -= Math.round(item.quantity * item.discAmount[p]);

            //item.priceUnit = eligibleItem.priceUnit;

            if (typeof saleTx.cmcAmount != 'undefined')
                saleTx.cmcAmount -= item.memberDiscountAmount;

            saleTx.orderItems.push(item);
            if (isVoidingDeptStore)
                saleTx.totalDiscount -= item.memberDiscountAmount + item.crmMemberDiscountAmount;

            uilog('DBUG', "voided item render : " + JSON.stringify(item));
            if (isDonation(prodObj)) {
                prodObj.currentPrice = donasiVoidPrice;
                item.priceUnit = donasiVoidPrice;
                item.priceSubtotal = parseInt(donasiVoidPrice);
                for (var a = 0; a <= saleTx.orderItems.length - 1; a++) {
                    var temp = saleTx.orderItems[a];
                    if (temp.priceUnit == donasiVoidPrice && temp.ean13Code == donasiCode) {
                        temp.allvoided = true;
                    }
                }
            }
            renderVoidedItem(item);
            printScannedItem();
            // update quantity and subtotal on order
            saleTx.totalAmount -= item.priceSubtotal;
            if (redeemPointTrk) {
                saleTx.totalTrk -= item.quantity * item.originalPriceUnit;
            }
            saleTx.totalQuantity = ((parseFloat(saleTx.totalQuantity * 1000) - parseFloat(item.quantity * 1000)) / 1000);
            itemQty = 1;
            success = true;
            // Already added voided item cannot do CLEAR.
            disableClrFn = true;
            // void item must also increment the scannedItemOrder
            ++scannedItemOrder;
        } else
            showMsgDialog(getMsgValue("pos_warning_msg_void_more_than_current_purchased_quantity"), "warning");
    } else showMsgDialog(getMsgValue("pos_warning_msg_item_not_purchased"), "warning");

    return success;
}

function saveTxn() {
    saleTx.transactionDate = saleTx.transactionDate || new Date();

    // check if there is topup tx and encapsulate it to SaleTx, remove it upon recall.
    if (topUpObj &&
        topUpObj.topUpTxItems &&
        topUpObj.topUpTxItems.length) {
        saleTx.topUpObj = topUpObj;
    }

    // check if there is topup tx and encapsulate it to SaleTx, remove it upon recall.
    if (indosmartObj &&
        indosmartObj.indosmartTxItems &&
        indosmartObj.indosmartTxItems.length) {
        saleTx.indosmartObj = indosmartObj;
    }

    // check if there is topup tx and encapsulate it to SaleTx, remove it upon recall.
    if (mCashObj &&
        mCashObj.mCashTxItems &&
        mCashObj.mCashTxItems.length) {
        saleTx.mCashObj = mCashObj;
    }

    // check if there is topup tx and encapsulate it to SaleTx, remove it upon recall.
    if (alterraObj &&
        alterraObj.alterraTxItems &&
        alterraObj.alterraTxItems.length) {
        saleTx.alterraObj = alterraObj;
    }

    // encapsulate scannedItemOrder to SaleTx, remove it upon recall.
    saleTx.scannedItemOrder = scannedItemOrder;
    if (redeemPointTrk) {
        saleTx.redeemPointTrkFlag = redeemPointTrk;
    }
    if (saleGameItemTrk) {
        saleTx.saleGameItemTrkFlag = saleGameItemTrk;
    }
    if (specialOrder) { // RAHMAT SPO
        saleTx.spcOrderFlag = specialOrder;
        saleTx.spcOrder = tmpSpcOrder;
        saleTx.spcOrderType = specialOrderType
    }
    if (staffFlag) {
        saleTx.flaggStaff = staffFlag;
    }
    if (printTo != "") {
        saleTx.printTo = printTo;
    }

    if (eftTransactionType && eftTransactionType.search(CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO) != -1) {
        saleTx.eftTransactionType = eftTransactionType;
    }

    //fix for Bug #80579
    if (saleTx.type == CONSTANTS.TX_TYPES.SALE.name && calculatePromotion) {
        //processLayerTwoPromotions();

        if (!saleTx.totalDiscount) {
            saleTx.totalDiscount = 0;
        }
        saleTx.totalDiscount += promoDiscount;
        //calculatePromotion = false;
        saleTx.promotionItems = promotionItems;
    }

    //fix for Bug #86442
    saleTx.promotionsMap = promotionsMap;
    saleTx.promoDiscount = promoDiscount; //layer 2 discount

    if (toggleTVS) {
        saleTx["toggleTVS"] = toggleTVS;
        saleTx["tVSTxApproverUserId"] = tVSTxApproverUserId;
    }

    saleTx.profCust = profCust;

    $.ajax({
        url: proxyUrl + "/saveTxn",
        type: "POST",
        async: false,
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify(saleTx),
        success: function(response) {
            //uilog("DBUG","Transaction saved: " + response);
        },
        error: function(jqXHR, status, error) {
            uilog('DBUG', 'FAIL: ' + JSON.stringify(error));
            promptSysMsg('Failed to store transaction.', 'STORE SALE');
        }
    });
}

function returnTxnExist(txnId) {
    var isHTTPStatusOK = false;
    var responseData = $.ajax({
        url: posWebContextPath + "/cashier/getTxn/" + txnId + '?salesDateAgo=' + 1,
        type: "GET",
        async: false,
        dataType: "json",
        success: function(data) {
            if (!jQuery.isEmptyObject(data) && !data.error) {
                isHTTPStatusOK = true;
            }
        },
        error: function(jqXHR, status, error) {
            uilog('DBUG', 'Error: ' + error + "\nError Response: " + jqXHR.responseText);

            if (error && error == 'SERVER_OFFLINE') {
                jqXHR.responseText = error;
            } else {
                jqXHR.responseText = null;
                showMsgDialog("Search Error", "warning");
            }
            return;
        }
    }).responseText;
    return responseData;
}

/*
 * @param txnId full transaction ID, including leading 0's
 */
function recallTxn(txnId) {
    $.ajax({
        url: proxyUrl + "/recallTxn",
        type: "GET",
        async: false,
        data: {
            txnId: txnId,
            mode: isTrainingModeOn ? "trial" : ''
        },
        success: function(response) {
            if (!jQuery.isEmptyObject(response) && !response.error) {
                isSaleStarted = true;
                saleTx = JSON.parse(JSON.stringify(response));
                profCust = saleTx.profCust;
                customerIdForReward = saleTx.customerId;

                console.log("customerIdForReward : " + customerIdForReward);
                console.log("profCust : " + profCust);

                uilog("DBUG", "saleTx.giftcard: " + JSON.stringify(saleTx.giftcard));
                if (saleTx.giftcard !== undefined) {
                    for (var a = 0; a <= saleTx.giftcard.length - 1; a++) {
                        GIFTCARDMMSObject = saleTx.giftcard[a];
                        if (GIFTCARDMMSObject.currProductScanned != null) {
                            GCMMSCardNoRef.push({ cardNo: GIFTCARDMMSObject.currGiftCardTxnItem.gcInfo.cardNumber, amount: GIFTCARDMMSObject.currGiftCardTxnItem.gcInfo.amount });
                            isGcMmsRedemption = false;
                        }
                    }
                    delete saleTx.giftcard;
                }

                processRecalledSaleTVS();
                delete saleTx.toggleTVS;
                delete saleTx.tVSTxApproverUserId;

                topUpObj = saleTx.topUpObj || TOPUP.createTopupTransactionObj();
                indosmartObj = saleTx.indosmartObj || INDOSMART.createIndosmartTransactionObj();
                mCashObj = saleTx.mCashObj || MCASH.createMCashTransactionObj();
                alterraObj = saleTx.alterraObj || ALTERRA.createAlterraTransactionObj();
                // remove the encapsulated topUpObj in saleTx
                delete saleTx.topUpObj;
                delete saleTx.indosmartObj;
                delete saleTx.mCashObj;
                delete saleTx.alterraObj;

                scannedItemOrder = saleTx.scannedItemOrder;
                redeemPointTrk = saleTx.redeemPointTrkFlag;
                saleGameItemTrk = saleTx.saleGameItemTrkFlag;
                specialOrder = saleTx.spcOrderFlag; // RAHMAT SPO
                tmpSpcOrder = saleTx.spcOrder;
                specialOrderType = saleTx.spcOrderType;
                staffFlag = saleTx.flaggStaff;
                printTo = saleTx.printTo;
                // remove the encapsulated scannedItemOrder in saleTx
                delete saleTx.scannedItemOrder;
                delete saleTx.redeemPointTrkFlag;
                delete saleTx.saleGameItemTrkFlag;
                delete saleTx.flaggStaff;
                delete saleTx.printTo;

                if (curstaffId != "") {
                    tmpStaff = curstaffId;
                }

                if (typeof saleTx.eftTransactionType != 'undefined')
                    eftTransactionType = saleTx.eftTransactionType;
                // remove the encapsulated eftTransactionType in saleTx
                //delete saleTx.eftTransactionType;

                renderTransactionType();
                renderTxn(saleTx);
                //				recallTxPopulateWarrantyItems();
                if (saleTx.coBrandNumber) {
                    // DEBUG RECALL EIGHT DIGIT CO-BRAND
                    if (eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO) enableCoBrand = false;
                    if (saleTx.coBrandNumberWithoutMask)
                        determineCoBrandDiscountStatus(saleTx.coBrandNumberWithoutMask);
                    else
                        determineCoBrandDiscountStatus(saleTx.coBrandNumber);
                    enableCoBrand = false;
                    // DEBUG RECALL EIGHT DIGIT CO-BRAND
                }
                toggleRecallSale = false;
                // Merge the SupervisorIntervention Data to SaleTx
                SUPERVISOR_INTERVENTION.mergeTempDataToSaleTx(saleTx,
                    CONSTANTS.TX_TYPES.RECALL.name);
                if (!isHcEnabled) {
                    if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name) {
                        printReceipt({
                            header: setReceiptHeader(saleTx),
                            txDetail: setReceiptTxDetails(saleTx),
                            body: setReceiptItems(saleTx,
                                saleTx, { currency: "Rp" }),
                            isQueued: true
                        });
                    } else if (redeemPointTrk == true) {
                        printReceipt({
                            header: setReceiptHeader(saleTx),
                            txDetail: setReceiptTxDetails(saleTx),
                            body: setReceiptItems(saleTx,
                                saleTx.orderItems, { currency: "Points" }),
                            isQueued: true
                        });
                    } else {
                        printReceipt({
                            header: setReceiptHeader(saleTx),
                            txDetail: setReceiptTxDetails(saleTx),
                            body: setReceiptItems(
                                saleTx,
                                saleTx.orderItems, { currency: "Rp" }
                            ),
                            isQueued: true
                        });
                    }
                }
                //Bug #81095 fix: transaction date is created on the storing of tx
                //deleted the txDate so that when transaction is done it is replaced by the TxDate from DB timestamp
                //txDate was only populated for the store receipt footer date and recall receipt head date to be the same
                delete saleTx.transactionDate;


                //fix for Bug #86442
                promoDiscount = saleTx.promoDiscount;
                delete saleTx.promoDiscount;

                refreshPromotion(false);
                saleTx.promotionItems = [];
                promotionsMap = saleTx.promotionsMap;
                //delete saleTx.promotionsMap;

                if (!jQuery.isEmptyObject(saleTx.billPaymentVar)) {
                    BILL_PAYMENT.variables = saleTx.billPaymentVar;
                    delete saleTx.billPaymentVar;
                } else if (!jQuery.isEmptyObject(saleTx.elebox)) {
                    ELEBOX.variables = saleTx.elebox;
                } else if (!jQuery.isEmptyObject(saleTx.bpjs)) {
                    uilog('DBUG', "BPJS Recall");
                    BPJS.variables = saleTx.bpjs;
                } else if (!jQuery.isEmptyObject(saleTx.simpatindo)) {
                    SIMPATINDO.variables = saleTx.simpatindo
                }

                if (!toggleTVS) {
                    promptSysMsg();
                }
                clearInputDisplay();

                if (profCust) renderCustomerInfo(profCust.customerName, profCust.customerNumber);

                if (saleGameItemTrk != null) { //&& typeof saleGameItemTrk != "undefined"){
                    saleGameItemTrk = true;
                    console.log("masuk ke saleGameItemTrk");
                    promptSysMsg(" ", "TRK SALE GAME ITEM");
                }
                if (redeemPointTrk != null) { //&& typeof redeemPointTrk != "undefined"){
                    redeemPointTrk = true;
                    console.log("masuk ke redeemPointTrk");
                    promptSysMsg(" ", "TRK REDEEM POINTS");
                }
                if (specialOrder != null) {
                    specialOrder = true;
                    promptSysMsg(" ", "SPECIAL ORDER");
                }
                if (customerIdForReward != null) {
                    availEmpLoyaltyPoints = true;
                    console.log("customerIdForReward != null");
                    if (typeof saleTx.isLoyalty != 'undefined' && saleTx.isLoyalty == true) {
                        var dataBody = {
                            hpNumber: customerIdForReward
                        }
                        console.log("dataBody.hpNumber" + dataBody.hpNumber);
                        earnLoyaltPoint(dataBody);

                    } else {
                        processEmpIdScan(customerIdForReward);
                    }
                    //promptSysMsg(getMsgValue('pos_label_member_id_is_active'), getMsgValue('pos_label_reward_points'));
                }

                // Terminates the flow
                FUNCTION_FLOW.FLOW_HANDLER.terminateFlow();
            } else {
                showMsgDialog(getMsgValue("pos_warning_trans_not_in_file"), "warning");
            }
        },
        error: function(response) {
            showMsgDialog(getMsgValue("pos_warning_trans_not_in_file"), "warning");
        }
    });
}

function getPromoCobrand() {
    $.ajax({
        url: proxyUrl + "/getPromo",
        type: "GET",
        async: false,
        // data: { 
        //     id: item.barcode
        // },
        success: function(response) {
            JSON.parse(JSON.stringify(response));
        }
    });
} 

function recallSavedTxn(txnId) {
    $.ajax({
        url: proxyUrl + "/recallSavedTxn",
        type: "GET",
        async: false,
        data: {
            txnId: txnId,
            mode: isTrainingModeOn ? "trial" : ''
        },
        success: function(response) {
            if (!jQuery.isEmptyObject(response) && !response.error) {
                isSaleStarted = true;
                saleTx = JSON.parse(JSON.stringify(response));
                uilog('DBUG', "Giftcard : " + JSON.stringify(saleTx.giftcard));
                if (saleTx.giftcard !== undefined) {
                    for (var a = 0; a <= saleTx.giftcard.length - 1; a++) {
                        GIFTCARDMMSObject = saleTx.giftcard[a];
                        if (GIFTCARDMMSObject.currProductScanned != null) {
                            GCMMSCardNoRef.push({ cardNo: GIFTCARDMMSObject.currGiftCardTxnItem.gcInfo.cardNumber, amount: GIFTCARDMMSObject.currGiftCardTxnItem.gcInfo.amount });
                            isGcMmsRedemption = false;
                        }
                    }
                    delete saleTx.giftcard;
                }

                profCust = saleTx.profCust;
                customerFeedback = createCustomerFeedbackObj(saleTx.transactionId);
                customerIdForReward = saleTx.customerId;

                processRecalledSaleTVS();
                delete saleTx.toggleTVS;
                delete saleTx.tVSTxApproverUserId;

                topUpObj = saleTx.topUpObj || TOPUP.createTopupTransactionObj();
                indosmartObj = saleTx.indosmartObj || INDOSMART.createIndosmartTransactionObj();
                mCashObj = saleTx.mCashObj || MCASH.createMCashTransactionObj();
                alterraObj = saleTx.alterraObj || ALTERRA.createAlterraTransactionObj();

                // remove the encapsulated topUpObj in saleTx
                delete saleTx.topUpObj;
                delete saleTx.indosmartObj;
                delete saleTx.mCashObj;
                delete saleTx.alterraObj;

                scannedItemOrder = saleTx.scannedItemOrder;
                redeemPointTrk = saleTx.redeemPointTrkFlag;
                saleGameItemTrk = saleTx.saleGameItemTrkFlag;
                specialOrder = saleTx.spcOrderFlag; // RAHMAT SPO
                tmpSpcOrder = saleTx.spcOrder;
                specialOrderType = saleTx.spcOrderType;
                staffFlag = saleTx.flaggStaff;
                printTo = saleTx.printTo;
                // remove the encapsulated scannedItemOrder in saleTx
                delete saleTx.scannedItemOrder;
                delete saleTx.redeemPointTrkFlag;
                delete saleTx.saleGameItemTrkFlag;
                delete saleTx.printTo;

                if (curstaffId != "") {
                    tmpStaff = curstaffId;
                }

                if (typeof saleTx.eftTransactionType != 'undefined')
                    eftTransactionType = saleTx.eftTransactionType;
                // remove the encapsulated eftTransactionType in saleTx
                //delete saleTx.eftTransactionType;

                renderTransactionType();
                renderTxn(saleTx);
                //				recallTxPopulateWarrantyItems();
                if (saleTx.coBrandNumber) {
                    enableCoBrand = true;
                    if (eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO) enableCoBrand = false;
                    if (saleTx.coBrandNumberWithoutMask)
                        determineCoBrandDiscountStatus(saleTx.coBrandNumberWithoutMask);
                    else
                        determineCoBrandDiscountStatus(saleTx.coBrandNumber);
                    enableCoBrand = false;
                }
                toggleRecallSale = false;
                // Merge the SupervisorIntervention Data to SaleTx
                //SUPERVISOR_INTERVENTION.mergeTempDataToSaleTx(saleTx,
                //		CONSTANTS.TX_TYPES.RECALL.name);
                if (!isHcEnabled) {
                    if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name) {
                        printReceipt({
                            header: setReceiptHeader(saleTx),
                            txDetail: setReceiptTxDetails(saleTx),
                            body: setReceiptItems(saleTx,
                                saleTx, { currency: "Rp" }),
                            isQueued: true
                        });
                    } else if (redeemPointTrk == true) {
                        printReceipt({
                            header: setReceiptHeader(saleTx),
                            txDetail: setReceiptTxDetails(saleTx),
                            body: setReceiptItems(saleTx,
                                saleTx.orderItems, { currency: "Points" }),
                            isQueued: true
                        });
                    } else {
                        printReceipt({
                            header: setReceiptHeader(saleTx),
                            txDetail: setReceiptTxDetails(saleTx),
                            body: setReceiptItems(
                                saleTx,
                                saleTx.orderItems, { currency: "Rp" }
                            ),
                            isQueued: true
                        });
                    }
                }
                //Bug #81095 fix: transaction date is created on the storing of tx
                //deleted the txDate so that when transaction is done it is replaced by the TxDate from DB timestamp
                //txDate was only populated for the store receipt footer date and recall receipt head date to be the same
                //delete saleTx.transactionDate;

                //fix for Bug #86442
                promoDiscount = saleTx.promoDiscount;
                //delete saleTx.promoDiscount;

                refreshPromotion(false);
                //saleTx.promotionItems = [];
                promotionsMap = saleTx.promotionsMap;
                //delete saleTx.promotionsMap;

                if (!jQuery.isEmptyObject(saleTx.billPaymentVar)) {
                    BILL_PAYMENT.variables = saleTx.billPaymentVar;
                    delete saleTx.billPaymentVar;
                } else if (!jQuery.isEmptyObject(saleTx.elebox)) {
                    ELEBOX.variables = saleTx.elebox;
                } else if (!jQuery.isEmptyObject(saleTx.bpjs)) {
                    uilog('DBUG', "Masuk ke bpjs");
                    BPJS.variables = saleTx.bpjs;
                } else if (!jQuery.isEmptyObject(saleTx.simpatindo)) {
                    uilog("DBUG", "Masuk ke simpatindo");
                    SIMPATINDO.variables = saleTx.simpatindo;
                }


                if (!toggleTVS) {
                    promptSysMsg();
                }
                clearInputDisplay();

                if (profCust) renderCustomerInfo(profCust.customerName, profCust.customerNumber);

                if (saleGameItemTrk != null) { //&& typeof saleGameItemTrk != "undefined"){
                    saleGameItemTrk = true;
                    console.log("masuk ke saleGameItemTrk");
                    promptSysMsg(" ", "TRK SALE GAME ITEM");
                }
                if (redeemPointTrk != null) { //&& typeof saleGameItemTrk != "undefined"){
                    redeemPointTrk = true;
                    console.log("masuk ke redeemPointTrk");
                    promptSysMsg(" ", "TRK REDEEM POINTS");
                }
                if (specialOrder != null) {
                    specialOrder = true;
                    promptSysMsg(" ", "SPECIAL ORDER");
                }
                if (customerIdForReward != null) {
                    availEmpLoyaltyPoints = true;
                    console.log("customerIdForReward != null");
                    if (typeof saleTx.isLoyalty != 'undefined' && saleTx.isLoyalty == true) {
                        var dataBody = {
                            hpNumber: customerIdForReward
                        }
                        console.log("dataBody.hpNumber" + dataBody.hpNumber);
                        earnLoyaltPoint(dataBody);

                    } else {
                        processEmpIdScan(customerIdForReward);
                    }
                    //promptSysMsg(getMsgValue('pos_label_member_id_is_active'), getMsgValue('pos_label_reward_points'));
                }

                // Terminates the flow
                FUNCTION_FLOW.FLOW_HANDLER.terminateFlow();
                if (saleTx.payments) {
                    PAYMENT_MEDIA.displayPaymentViewAsSystemMessage(saleTx);
                }
            } else {
                showMsgDialog(response.error, "warning",
                    function() {
                        showLogoutAuthDialog();
                    }
                );
            }
        },
        error: function(response) {
            showMsgDialog(getMsgValue("pos_warning_trans_not_in_file"), "warning");
        }
    });
}

/**
 * Will return an Authentication object if no error encountered.
 *
 * @param username
 *            Employee username.
 * @param empCode
 *            Employee private code (Pin/Barcode) value
 * @param type
 *            Type of authentication. Either authentication using "barcode" or
 *            authentication using "pin".
 * @param roles
 */
function authUser(username,
    empCode,
    type,
    roles,
    interventionType, action) {
    type = type.toLowerCase();

    if (type != "pin" && type != "barcode") {
        return null;
    }

    var typeParam = "";
    if (interventionType) {
        /*
         * Used as an identifier for filtering authUser url,
         * i.e. blocking pickup authentication while offline-mode.
         */
        var interventionTypeToLower = interventionType.toLowerCase();
        var sbTypeParam = new StringBuilder("?");
        sbTypeParam.append("type=");
        sbTypeParam.append(interventionTypeToLower);
        typeParam = sbTypeParam.toString();
    }

    var isHTTPStatusOK = false;
    var data = $.ajax({
        url: posWebContextPath + "/user/authUser" + typeParam,
        type: "POST",
        async: false,
        contentType: 'application/json',
        dataType: "json",
        offlineMsgPropKey: ("pos_warning_offline_" + interventionTypeToLower + "_not_allowed"),
        data: JSON.stringify({
            username: username,
            empCode: empCode,
            authType: type,
            roles: roles,
            action: action
        }),
        success: function(data, status) {
            if (data.code != 0)
                showMsgDialog('Error: ' + JSON.stringify(data.msg), "error");
            else
                isHTTPStatusOK = true;
        },
        error: function(jqXHR, status, error) {
            showMsgDialog('Error: ' + error, "error");
        }
    }).responseText;
    return (isHTTPStatusOK) ? JSON.parse(data) : null;
}

/**
 *
 * Will return true if cashier's is for Password change otherwise will return
 * false.
 */
function isUserForPasswordChange() {
    var isHTTPStatusOK = false;
    var data = $.ajax({
        url: posWebContextPath + "/user/isUserForPasswordChange",
        type: "GET",
        async: false,
        dataType: "json",
        success: function(data, status) {
            isHTTPStatusOK = true;
        }
    }).responseText;
    return (isHTTPStatusOK) ? JSON.parse(data) : false;
}

/**
 * Will return TRUE if customerId is cashier's employeeId.
 */
function isLoggedInCashier(customerId) {
    var isHTTPStatusOK = false;
    var data = $.ajax({
        url: posWebContextPath + "/user/isLoggedInCashier/" + customerId,
        type: "GET",
        async: false,
        dataType: "json",
        success: function(data, status) {
            isHTTPStatusOK = true;
        }
    }).responseText;
    return (isHTTPStatusOK) ? JSON.parse(data) : false;
}

/**
 * Updates user pin/password.
 *
 * @param newPassword
 *            new pin value
 * @returns Users object and a message
 */
function updateUserPassword(newPassword, passwordChangeType) {
    return JSON.parse($.ajax({
        url: posWebContextPath + "/user/updateUserPassword",
        type: "POST",
        async: false,
        dataType: "json",
        data: {
            "newPassword": newPassword,
            "passwordChangeType": passwordChangeType
        }
    }).responseText);
}

function saveOrder(orderStatus, onSuccess, onError) {
    Hypercash.service.promptPrintTaxInvoice(function() {
        processEventRewardsTry(function() {
            processFreeParking(function() {
                processBalloonGame(function() {
                    finalOrderProcess(orderStatus, onSuccess, onError);
                });
            }); // end of freeparking
        });
    }, orderStatus);
}

function finalOrderProcess(orderStatus, onSuccess, onError) {
    // Finalising the value of supervisor-intervention data
    // BUG FIX CANCEL SALE SPV INTERVENTION
    saleTx.status = orderStatus;
    if (!isGcMmsRedemption) {
        SUPERVISOR_INTERVENTION.setTotalAmountBySaleTxType(saleTx);
    } else {
        //
    }
    if (saleTx.giftcard) {
        delete saleTx.giftcard;
    }
    // BUG FIX CANCEL SALE SPV INTERVENTION
    renderTotal();

    //processEventRewardsTry(function() {uilog("DBUG","DONE processEventRewardsTry");});

    saleTx.customerId = customerIdForReward;
    console.log("saletx.customerId : " + saleTx.customerId);
    // add tax details on tx
    calculateTaxBreakDown(saleTx);
    // CR ADD DISCOUNT
    for (var index in saleTx.orderItems) {
        if (saleTx.orderItems[index].additionalDiscount && saleTx.orderItems[index].additionalDiscount != 0) {
            saleTx.orderItems[index].secondLayerDiscountAmount += saleTx.orderItems[index].additionalDiscount;
            for (var indexPromo in saleTx.promotionItems) {
                if (saleTx.orderItems[index].productId == saleTx.promotionItems[indexPromo].productId &&
                    saleTx.promotionItems[indexPromo].type == CONSTANTS.PROMOTION_TYPES.ADDITIONAL_DISCOUNT.type) {
                    saleTx.orderItems[index].qtyWithSecondLayerDiscount += saleTx.promotionItems[indexPromo].itemQuantity;
                }
            }
        }
        // ENSURE no more NAN value
        if (isNaN(saleTx.orderItems[index].discountAmount)) saleTx.orderItems[index].discountAmount = 0;
        if (isNaN(saleTx.orderItems[index].secondLayerDiscountAmount)) saleTx.orderItems[index].secondLayerDiscountAmount = 0;
        if (isNaN(saleTx.orderItems[index].memberDiscount)) saleTx.orderItems[index].memberDiscount = 0;
    }
    // ENSURE no more NAN value
    if (isNaN(saleTx.roundingAmount)) saleTx.roundingAmount = 0;
    if (isNaN(saleTx.cpnIntAmount)) saleTx.cpnIntAmount = 0;
    if (isNaN(saleTx.totalDiscount)) saleTx.totalDiscount = 0;
    if (isNaN(saleTx.voidedDiscount)) saleTx.voidedDiscount = 0;
    if (isNaN(saleTx.totalAmount)) saleTx.totalAmount = 0;
    if (isNaN(saleTx.totalTrk)) saleTx.totalTrk = 0;
    if (isNaN(saleTx.totalQuantity)) saleTx.totalQuantity = 0;

    // CR ADD DISCOUNT

    if (saleTx.transactionId || saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name) {
        // commented due to #79948
        // saleTx.transactionDate = new Date();

        //the value of this date (endDate) is used for computing cashier's active time and should be set at the client side
        //transaction date can't be used for computation since it is sometimes set at the server side and some times produces discrepancies
        //when the terminal and the server have different date and time.
        saleTx.endDate = new Date();
        unsetEmployeeDiscountProperties();
        Hypercash.service.preProcessHypercashTxn();

        if (!HOTSPICE_MODULE.service.hasHotSpiceItems(getSummarizeSaleItems(saleTx))) {
            HOTSPICE_MODULE.service.resetTransactionVariables();
        }

        //uilog("DBUG","Taxable Amount" + saleTx.totalTaxableAmount);
        var saleType = saleTx.type.toLowerCase();
        var typeParam = "?type=" + saleType;
        var offlineMsgPropKey = "pos_warning_offline_{0}_not_allowed".format(saleType);
        $.ajax({
            url: posWebContextPath + "/cashier/saveOrder" + typeParam,
            type: "POST",
            async: false,
            dataType: "json",
            offlineMsgPropKey: offlineMsgPropKey,
            /* see ajaxGlobalHandler.js */
            enableLocalOnErrorHandler: true,
            /* see ajaxGlobalHandler.js */
            contentType: 'application/json',
            data: JSON.stringify(PAYMENT_MEDIA.finalizeSaleTxLastPaymentAmount(saleTx)),
            success: function(response) {
                if (!jQuery.isEmptyObject(response) && !response.error) {
                    pendingPwpPromo = {};
                    if (isDeptstore) $('#depstoreSPGField').val('');
                    // Terminates any running functionFlow.js execution
                    FUNCTION_FLOW.FLOW_HANDLER.terminateFlow();
                    if (saleTx && saleTx.type &&
                        saleTx.type == CONSTANTS.TX_TYPES.SALE.name) {
                        var isRewarded = false;
                        if (!$.isEmptyObject(saleTx.supervisorInterventions)) {
                            for (var i in saleTx.supervisorInterventions) {
                                var interventionType = saleTx.supervisorInterventions[i].interventionType;
                                var recalledSale = CONSTANTS.TX_TYPES.RECALL.typeLabel;
                                if (interventionType == recalledSale || interventionType == CONSTANTS.TX_TYPES.ITEM_VOID.name || interventionType == CONSTANTS.TX_TYPES.TVS_SALE.name) {
                                    isRewarded = true;
                                }
                            }
                        } else {
                            isRewarded = true;
                        }
                        if (isRewarded) {
                            if (crmEarnPointsSelected == true) {
                                pointReward = getPointReward(saleTx,
                                    saleTx.startDate);
                            }
                            crmEarnPointsSelected = false;
                        }

                        for (var i in saleTx.payments) {
                            if (CONSTANTS.PAYMENT_MEDIA_TYPES.CRM_POINTS.name == saleTx.payments[i].paymentMediaType) {
                                pointReward = redeemCRMPoints(customerIdForReward, saleTx, response.transactionDate);
                                break;
                            }
                        }
                    }
                    // setting the traonsaction date to saleTx, if not existing.
                    saleTx.transactionDate = saleTx.transactionDate || (response.transactionDate);
                    if (pointReward != null) {
                        if (pointReward.type != "ERROR") {
                            onSuccess(saleTx.transactionId);
                        }

                        if (pointReward.type == "ERROR" && pointReward.callingAction == "EARN") {
                            showMsgDialog("Transaction failed to earn points.", "warning");
                            onSuccess(saleTx.transactionId);
                        }

                        if (pointReward.type == "ERROR" && pointReward.callingAction == "REDEEM") {
                            showMsgDialog("Transaction failed to redeem points.", "warning");
                            saleTx.payments.length = 0;
                            saleTx.totalAmountPaid = 0;
                            pointReward = null;
                            $("div#numPad div#keyTotal").click();
                        }
                    } else {
                        onSuccess(saleTx.transactionId);
                    }

                    // INHOUSE VOUCHER 2017-04-13    
                    // IF THERE IS MARKETING VOUCHER REDEEMED
                    if (saleTx.type == 'SALE' && !saleTx.isCancelled && saleTx.redeemVoucherList && saleTx.redeemVoucherList.length > 0) {
                        var commitVoucher = {
                            'trxId': saleTx.transactionId,
                            'voucherList': []
                        };

                        for (var i in saleTx.redeemVoucherList)
                            commitVoucher.voucherList.push(saleTx.redeemVoucherList[i].id);

                        uilog('DBUG', 'COMMITING VOUCHER');
                        uilog('DBUG', commitVoucher);

                        var resp = callAgent('commit', commitVoucher);
                        console.log(resp);
                    }
                    // INHOUSE VOUCHER 2017-04-13
                } else {
                    // Mostly pertains to proxy/offline related errors.
                    var errorMsg = RETURN_REFUND.return.service.getErrorMsgByResponse(response, null);
                    if (errorMsg) {
                        showMsgDialog(errorMsg, 'error', CASHIER.newOrder);
                    } else {
                        CASHIER.promptContactHelpdeskDialog();
                    }
                }
            },
            error: function(jqXHR, status, error) {
                onError(error);
                if (/NS_ERROR_FAILURE/i.test(error.toString())) {
                    // prompt dialog w/ new-order
                    CASHIER.promptContactHelpdeskDialog();
                }
            }
        }); //end of ajax

    } //end of sales txn
}

/**
 * Create new order
 */
function createOrder() {
    $.ajax({
        url: posWebContextPath + "/cashier/createOrder" + (isTrainingModeOn ? "?mode=trial" : ''),
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        async: false,
        success: function(response) {
            if (jQuery.isEmptyObject(response) || response.error) {
                if ('NULL_POS_SESSION' == response.error) {
                    forceLogout(configuration.terminalId);
                } else {
                    showMsgDialog(getMsgValue('pos_error_msg_cashier_new_order'), "error");
                }
            } else {
                // CHECK IF THERE IS SAVED TRANSACTION
                if ("savedTrxId" in response) {
                    //uilog("DBUG","Recalling saved transaction id: " + response['savedTrxId']);
                    recallSavedTxn(response['savedTrxId'].substring(1, 18));
                } else if ("relogin" in response) {
                    showMsgDialog("POS is back to ONLINE, Please Relogin", "warning",
                        function() {
                            //showLogoutAuthDialog();
                            forceLogout(configuration.terminalId);
                        }
                    );
                // } else if ("updateProduct" in response) {
                //     showMsgDialog("update product", "warning")
                // } else if ("updatePromo" in response) {
                //     console.log("update promo")
                } else {
                    // if (saleTx.UPCproduct == true){
                    //     showMsgDialog("update product", "warning")
                    // }
                    isSaleStarted = true;
                    saleTx = JSON.parse(JSON.stringify(response));
                    // Initializing saleTx Object field values
                    saleTx = $.extend(new CASHIER.SaleTx(), saleTx);
                    topUpObj = TOPUP.createTopupTransactionObj();
                    indosmartObj = INDOSMART.createIndosmartTransactionObj();
                    mCashObj = MCASH.createMCashTransactionObj();
                    alterraObj = ALTERRA.createAlterraTransactionObj();
                    initGiftCardMMSdObj();
                    enableCoBrand = true;
                    // trigger customer screen change to idle: Next Customer
                    // please.
                    eftTransactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE.name;
                    changeCustomerActiveScreen(CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.IDLE);
                    enableCustomerFeedback(false);

                    if (customerFeedback)
                        lastCustFeedbackTrxId = customerFeedback.transactionId;

                    customerFeedback = createCustomerFeedbackObj(saleTx.transactionId);
                    //				applianceAndWarranty = createApplianceAndWarrantyObj();
                    cpnIntAvailableAmt = Number(getConfigValue("CPN_INT_MAX_AMOUNT"));
                    BILL_PAYMENT.refreshBillPayment();
                    ELEBOX.refreshElebox();
                    clearIndentSales('all'); // INDENT 2017-05-18
                    // voidDeptStore 2017022
                    clearVoidDeptStore('all');
                    // voidDeptStore 2017022
                    saleTx.mlcSeq = 0; // MLC 2017-05-04
                    saleTx.mlcReffNo = ''; // MLC 2017-05-12
                    saleTx.mlcQRCode = ''; // MLC 2017-05-12
                    saleTx.altoWCSeq = 0; // ALTO WECHAT
                    saleTx.altoWCReffNo = ''; // ALTO WECHAT
                    saleTx.altoWCQRCode = ''; // ALTO WECHAT
                    saleTx.ecrSeq = 0; //EDC Kartuku 2017-10-31
                    clearReturnDialog(); // CR RETURN
                    printTo = "P";
                }
            }

            // Terminates any running functionFlow.js execution
            FUNCTION_FLOW.FLOW_HANDLER.terminateFlow();
        },
        error: function(jqXHR, status, error) {
            showMsgDialog(getMsgValue('pos_error_msg_cashier_new_order'), "error");
        }
    });
}

/**
 * Add payment details on order object.
 *
 * @param subtotal
 * @param payment
 * @param finalAmount
 */
function addPaymentDetailsToOrder(payment, finalAmount) {
    saleTx.totalAmountPaid = payment;
    // more amount addition/deduction here before the final amount, change the condition if necessary.
    saleTx.totalChange = payment - finalAmount;
}

/**
 * Sets the title and if the order message dialog has an ok button
 * @param title
 * @param reminderMsg
 */
function openOrderSummaryDialog(title, reminderMsg) {
    POS_DIALOGS.resetOrderMessageDialog();
    POS_DIALOGS.resetCustomerDataDialog();

    if (reminderMsg == getMsgValue('prompt_msg_transaction_complete_new_order')) {
        showOkButtonOnOrderMessage();
    }
    $("#orderMsgReminder").text(reminderMsg);
    $("#order-message").dialog('option', 'title', title);
    $("#order-message").dialog("open");
}

function removeLastScannedItem() {
    var item = saleTx.orderItems.last;
    removeScannedItem(item.productId);
    // Removes last item rendered in receipt view on customer view.
    CustomerPopupScreen.cus_removeScannedItem(item.productId);
    saleTx.totalAmount -= (item.discountAmount ? item.discountAmount :
        item.priceSubtotal);
    renderTotal();
}

/*******************************************************************************
 * START: Functions used for Cashier operations
 ******************************************************************************/
var CASHIER = CASHIER || {};

// CR ADD DISCOUNT
CASHIER.SaleTx = function() {
    /**
     * + Objects should be NULL,
     * + Lists should be ARRAY
     */
    this.transactionId = "";
    this.type = "";
    this.posTerminalId = "";
    this.storeCd = "";
    this.store = null;
    this.posSession = null;
    this.userId = "";
    this.userName = "";
    this.transactionDate = null;
    this.status = "";
    this.totalQuantity = 0;
    this.totalJenisBarang = 0;
    this.totalAmount = 0;
    this.totalTrk = 0;
    this.totalDiscount = 0;
    this.voidedDiscount = 0;
    this.customerId = "";
    this.cpnIntAmount = 0;
    this.roundingAmount = 0;
    this.totalAmountPaid = 0;
    this.totalChange = 0;
    this.totalTaxableAmount = 0;
    this.vat = 0;
    this.tariff = 0;
    this.trialMode = false;
    this.memberDiscReversal = 0;
    this.donationAmount = 0;
    this.orderItems = [];
    this.supervisorInterventions = [];
    this.payments = [];
    this.baseTransactionId = "";
    this.promotionItems = [];
    this.customerSatisfaction = 0;
    this.freeParkingGiven = 0;
    this.startDate = null;
    this.coBrandNumber = "";
    this.returnNoteNo = "";
    this.totalMdrSurcharge = 0;
    this.endDate = null;
    // CR XREPORT
    this.keyItemCount = 0;
    this.scanItemCount = 0;
    // CR XREPORT
    this.totalAdditionalDiscount = 0;
};
// CR ADD DISCOUNT

CASHIER.executePaymentMedia = function(saleTx,
    paymentMediaType,
    payment,
    additionalData,
    overriddenPaymentConfig) {

    var clonedSaleTxForCouponCmc = cloneObject(saleTx);

    if (hasScannedItem(saleTx)
        // If not valid for another payment(means the payment already
        // exceeds the amount of goods), continue
        &&
        !PAYMENT_MEDIA.processPaymentDetailsToOrder(saleTx,
            paymentMediaType,
            payment,
            additionalData,
            overriddenPaymentConfig)) {
        //remove member disc amount per item if reversed
        if (saleTx.memberDiscReversal > 0) {
            reverseMemberDiscountAmountPerItem(saleTx.orderItems);
        }


        if (ELEBOX.isEleboxTransaction() && (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.RETURN.name)) {
            var isEleboxReturTrx = (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name);
            uilog('DBUG', "elebox transaction");
            ELEBOX.processEleboxTransaction2(saleTx, isEleboxReturTrx);
        }else if(kidcityEnable){
            var responseKidcity = KIDCITY.saveTransaction(saleTx);

            if(responseKidcity){
                saleTx.kidcityObj = {};
                saleTx.kidcityObj.transactionId = saleTx.transactionId;
                saleTx.kidcityObj.transactionDetails = saleTx.orderItems;

                KIDCITY.printTransaction(saleTx,paymentMediaType);
                        
            }else{
                kidcityEnable = false;
                kidcityEnableStatus = null;
                CASHIER.newOrder();
                showMsgDialog("Gagal dalam membuat Transaksi", "error");
                
            }
        }else if (BILL_PAYMENT.isBillPaymentTansaction() && saleTx.type == CONSTANTS.TX_TYPES.BILL_PAYMENT.name) {
            BILL_PAYMENT.processBillPaymentTransaction(saleTx);
        } else if (!jQuery.isEmptyObject(saleTx.bpjs) && saleTx.type == CONSTANTS.TX_TYPES.BPJS.name) {
            uilog("DBUG", "processing bpjs payment");
            BPJS.processBpjsTransaction(saleTx);
        } else if (!jQuery.isEmptyObject(saleTx.simpatindo) && saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name) {
            uilog("DBUG", "processing simpatindo payment");
            SIMPATINDO.processSimpatindoTransaction(saleTx);
        } else if (topUpObj &&
            topUpObj.topUpTxItems &&
            topUpObj.topUpTxItems.length) {
            //uilog("DBUG","disregard, top-up not yet supported!");
            renderPaymentInfo();

            topUpTempObj = {
                totalAmount: topUpObj.totalAmt,
                saleType: saleTx.type
            };

            // If Hypercash enabled, queue top up info to print
            if (isHcEnabled) {
                Hypercash.queuedTopUpToPrint.push(setReceiptTopUpInfo(topUpTempObj, true, true, false, false, false));
            } else {
                printReceipt({ summary: setReceiptSummary(saleTx) });
                printReceipt({ topUpInfo: setReceiptTopUpInfo(topUpTempObj, true, true, false, false, false) });
            }

            renderTopUpInfo({
                totalAmount: topUpObj.totalAmt,
                saleType: saleTx.type
            }, true, true, false, false, false);
            TOPUP.processTopUpTransaction();
        } else if (mCashObj &&
            mCashObj.mCashTxItems &&
            mCashObj.mCashTxItems.length) {

            uilog("DBUG", "disregard, mcash not yet supported!");
            renderPaymentInfo();

            mCashTempObj = {
                totalAmount: mCashObj.totalAmt,
                saleType: saleTx.type
            };

            // If Hypercash enabled, queue top up info to print
            if (isHcEnabled) {
                Hypercash.queuedMCashToPrint.push(setReceiptMCashInfo(mCashTempObj, true, true, false, false, false));
            } else {
                printReceipt({ summary: setReceiptSummary(saleTx) });
                printReceipt({ mCashInfo: setReceiptMCashInfo(mCashTempObj, true, true, false, false, false) });
            }

            renderMCashInfo({
                totalAmount: mCashObj.totalAmt,
                saleType: saleTx.type
            }, true, true, false, false, false);
            MCASH.processMCashTransaction();
        } else if (indosmartObj &&
            indosmartObj.indosmartTxItems &&
            indosmartObj.indosmartTxItems.length) {
            uilog("DBUG", "disregard, indosmart not yet supported!");
            renderPaymentInfo();

            indosmartTempObj = {
                totalAmount: indosmartObj.totalAmt,
                saleType: saleTx.type
            };

            // If Hypercash enabled, queue top up info to print
            if (isHcEnabled) {
                Hypercash.queuedIndosmartToPrint.push(setReceiptIndosmartInfo(indosmartTempObj, true, true, false, false, false));
            } else {
                printReceipt({ summary: setReceiptSummary(saleTx) });
                printReceipt({ indosmartInfo: setReceiptIndosmartInfo(indosmartTempObj, true, true, false, false, false) });
            }

            renderIndosmartInfo({
                totalAmount: indosmartObj.totalAmt,
                saleType: saleTx.type
            }, true, true, false, false, false);

            console.log(saleTx.type);
            if (saleTx.type != CONSTANTS.TX_TYPES.RETURN.name) {
                INDOSMART.processIndosmartTransaction();
            } else {
                if (isHcEnabled) {
                    Hypercash.queuedIndosmartToPrint.push(setReceiptIndosmartInfo(null, false, false, false, true, true));
                } else {
                    printReceipt({ indosmartInfo: setReceiptIndosmartInfo(null, false, false, false, true, true) });
                }

                renderIndosmartInfo(null, false, false, false, true, false);

                var type = null;
                try {
                    if (saleTx.type == 'RETURN') {
                        RETURN_REFUND.return.service.saveCouponReturnData();
                    }
                    type = indosmartTxItem.transactionType ? indosmartTxItem.transactionType.toUpperCase() : null;
                    if (type == 'REFUND') {
                        RETURN_REFUND.return.service.saveCouponReturnData();
                    }
                } catch (err) {
                    console.log("Save coupon return data error");
                    console.log(err);
                }

                saveOrder(CONSTANTS.STATUS.COMPLETED,
                    function(data) {
                        if (data && data.error) {
                            promptSysMsg(getMsgValue('prompt_msg_order_failed') + JSON.stringify(data.error), 'SALE');
                        } else {
                            uilog("DBUG", "SUCCESS: " + data);
                            promptSysMsg(getMsgValue('prompt_msg_order_completed') + removeLeadingZeroes(data), 'SALE');
                            renderCustomerFeedbackDialog();
                            DrawerModule.validateTxnToOpenDrawer();
                            renderOrderSummaryDialog();

                            var detailsToPrint = {
                                footerSummary: setReceiptFooterSummary(saleTx, { eftOnline: setReceiptEftOnline(saleTx) }),
                                footer: setReceiptFooter(saleTx),
                                mktInfo: setReceiptMarketingPromoInfo(saleTx),
                                freeParking: setReceiptFreeParking(saleTx),
                                qrtts: setReceiptQrtts(saleTx),
                                mlc: setReceiptMLC(saleTx),
                                altoWC: setReceiptAltoWC(saleTx),
                                ppp: setReceiptPPP(saleTx),
                                balloonGame: setReceiptBalloonGame(saleTx),
                                eftOnline: setReceiptEftOnline(saleTx, true),
                                isInstallmentTransaction: isInstallmentTransaction,
                                isQueued: true,
                                voucherData: (saleTx.type != 'SALE') ? {} : saleTx.marketingVoucher, // INHOUSE VOUCHER 2017-04-13
                                couponData: (type == 'REFUND' || saleTx.type == 'RETURN') ? setCouponSummary(saleTx) : {}
                            }

                            if (isHcEnabled) {
                                Hypercash.printer.printTransactionBasedOnMediaPaymentType(saleTx.payments, detailsToPrint);
                            } else {
                                printReceipt(detailsToPrint);
                            }

                            if (indosmartObj &&
                                indosmartObj.indosmartTxItems &&
                                indosmartObj.indosmartTxItems.length != 0) {
                                saleTx.indosmartObj = indosmartObj.indosmartTxItems;
                            }

                            indosmartTempObj = null;
                        }
                    },
                    function(error) {
                        uilog('DBUG', 'FAIL: ' + JSON.stringify(error));
                        promptSysMsg(getMsgValue('prompt_msg_order_failed') + JSON.stringify(error), 'SALE');
                    }
                );
            }
        } else if (alterraObj &&
            alterraObj.alterraTxItems &&
            alterraObj.alterraTxItems.length) {
            //uilog("DBUG","disregard, top-up not yet supported!");
            renderPaymentInfo();

            alterraTempObj = {
                totalAmount: alterraObj.totalAmt,
                saleType: saleTx.type
            };

            // If Hypercash enabled, queue top up info to print
            if (isHcEnabled) {
                Hypercash.queuedAlterraToPrint.push(setReceiptAlterraInfo(alterraTempObj, true, true, false, false, false));
            } else {
                printReceipt({ summary: setReceiptSummary(saleTx) });
                printReceipt({ alterraInfo: setReceiptAlterraInfo(alterraTempObj, true, true, false, false, false) });
            }

            renderAlterraInfo({
                totalAmount: alterraObj.totalAmt,
                saleType: saleTx.type
            }, true, true, false, false, false);
            ALTERRA.processAlterraTransaction();
        } else if (((GCMMSCardNoRef.length) && !isGcMmsRedemption) || (GIFTCARDObject && GIFTCARDObject.giftCardItemArray && GIFTCARDObject.isGiftCardItemOrder)) {

            //activate and save gift card items upon saving transactions
            //if (processGiftCardItemsPayment()) {
            // call first the gc mms then ogloba
            var saveFlag = callGcMmsConfirmActivationRequest(); // || callConfirmGcRequest();
            lockKeyboard = false;

            if (saveFlag) {
                try {
                    RETURN_REFUND.return.service.saveCouponReturnData();
                } catch (err) {
                    console.log("Save coupon return data error");
                    console.log(err);
                }

                saveOrder(CONSTANTS.STATUS.COMPLETED, function(data) {
                    if (data && data.error) {
                        promptSysMsg('Order failed.' + JSON.stringify(data.error), 'SALE');
                    } else {
                        //uilog("DBUG","SUCCESS: " + data);
                        promptSysMsg('Order completed with TR# ' + removeLeadingZeroes(data), 'SALE');
                        renderScreenReceiptSummary();
                        //renderCustomerFeedbackDialog();
                        DrawerModule.validateTxnToOpenDrawer();
                        renderOrderSummaryDialog();

                        var detailsToPrint = {
                            summary: setReceiptSummary(saleTx),
                            footerSummary: setReceiptFooterSummary(saleTx),
                            footer: setReceiptFooter(saleTx),
                            mktInfo: setReceiptMarketingPromoInfo(saleTx),
                            balloonGame: setReceiptBalloonGame(saleTx),
                            freeParking: setReceiptFreeParking(saleTx),
                            isInstallmentTransaction: isInstallmentTransaction,
                            isQueued: true,
                            voucherData: (saleTx.type != 'SALE') ? {} : saleTx.marketingVoucher, // INHOUSE VOUCHER 2017-04-13
                            couponData: (saleTx.type != 'RETURN') ? {} : setCouponSummary(saleTx)
                        };

                        /**
                         * Print header and body first before printing summary if hypercash enabled
                         **/
                        if (isHcEnabled) {
                            Hypercash.printer.printTransactionBasedOnMediaPaymentType(saleTx.payments, detailsToPrint);
                        } else {
                            printReceipt(detailsToPrint);
                        }
                    }
                }, function(error) {
                    uilog('DBUG', 'FAIL: ' + error);
                });
            }
            //} else {
            //	showMsgDialog("Only cash payment is allowed to purchase giftcards items.", "warning");
            //}
        } else if (specialOrder == true) { // RAHMAT SPO
            try {
                RETURN_REFUND.return.service.saveCouponReturnData();
            } catch (err) {
                console.log("Save coupon return data error");
                console.log(err);
            }

            saveOrder(CONSTANTS.STATUS.COMPLETED, function(data) {
                if (data && data.error) {
                    promptSysMsg('Order failed.' + JSON.stringify(data.error), 'SALE');
                } else {
                    //uilog("DBUG","SUCCESS: " + data);
                    promptSysMsg('Order completed with TR# ' + removeLeadingZeroes(data), 'SALE');
                    renderScreenReceiptSummary();
                    //renderCustomerFeedbackDialog();
                    DrawerModule.validateTxnToOpenDrawer();
                    renderOrderSummaryDialog();
                    var specialOrder = {
                        txId: saleTx.transactionId,
                        totalQuantity: saleTx.totalQuantity,
                        totalJenisBarang: saleTx.totalJenisBarang,
                        spoNo: saleTx.spcOrder,
                        spoType: saleTx.spcOrderType,
                        additional: setReceiptSpecialOrder(saleTx)
                    };

                    var detailsToPrint = {
                        summary: setReceiptSummary(saleTx),
                        footerSummary: setReceiptFooterSummary(saleTx),
                        footer: setReceiptFooter(saleTx),
                        mktInfo: setReceiptMarketingPromoInfo(saleTx),
                        balloonGame: setReceiptBalloonGame(saleTx),
                        freeParking: setReceiptFreeParking(saleTx),
                        isInstallmentTransaction: isInstallmentTransaction,
                        isQueued: true,
                        voucherData: (saleTx.type != 'SALE') ? {} : saleTx.marketingVoucher, // INHOUSE VOUCHER 2017-04-13
                        couponData: (saleTx.type != 'RETURN') ? {} : setCouponSummary(saleTx),
                        specialOrder: specialOrder
                    };
                    // {
                    // 	"spo_no": "S123", -- semi done
                    // 	"spo_type": "PICKUP" | "DELIVERY" -- done
                    // 	"tr_id": "10997...",
                    // 	"sku": {
                    // 		"14": 4,
                    // 		"13": 5,
                    // 	},
                    // 	"total_barang": 9,
                    // 	"jenis_barang": 2
                    // }
                    var scannedSKUs = [];
                    saleTx.orderItems.forEach(function(el, index) {
                        if (scannedSKUs.indexOf(el["sku"]) === -1) {
                            scannedSKUs.push(el["sku"]);
                        }
                    });
                    var skuToSend = {};
                    for (var idx in scannedSKUs) {
                        var amount = 0;
                        saleTx.orderItems.forEach(function(el) {
                            if (scannedSKUs[idx] === el["sku"]) {
                                amount = amount + el["quantity"];
                            }
                        });
                        skuToSend[scannedSKUs[idx]] = amount;
                    };
                    var dateNow = Date.now();
                    var secret = "pindahkelb_";
                    var data = {
                        key: window.btoa(secret + dateNow),
                        spo_no: saleTx.spcOrder,
                        spo_type: saleTx.spcOrderType,
                        tr_id: saleTx.transactionId,
                        sku: skuToSend,
                        total_barang: saleTx.totalQuantity,
                        jenis_barang: saleTx.totalJenisBarang,
                        tr_total_amount: saleTx.totalAmount
                    };
                    data = JSON.stringify(data);
                    uilog('DBUG', 'Start Calling SPO PROFIT');
                    uilog('DBUG', 'Data to Send to SPO PROFIT:');
                    uilog('DBUG', JSON.stringify(data));
                    $.ajax({
                        type: 'POST',
                        url: posWebContextPath + '/cashier/spo/process',
                        async: true,
                        contentType: "application/json",
                        data: data,
                        timeout: 30000,
                        success: function(response) {
                            uilog('DBUG', 'Response from PROFIT SPO :');
                            uilog('DBUG', JSON.stringify(response));
                            if (response.success == false) {
                                console.log("SPO ERROR");
                                console.log(response);
                                showMsgDialog(response.msg, "SPO Information");
                                /* vipMemberErr = response.ResultMsg;
                                console.log("vipMemberErr");
                                console.log(vipMemberErr);
                                $("#vipNotReg-dialog").dialog("open"); */
                                // $(".spoMessage-dialog").dialog("open");
                            } else if (response.success == true) {
                                console.log("SPO SUCCESS");
                                console.log(response);
                                showMsgDialog(response.msg, "SPO Information");
                                /* promptSysMsg(getMsgValue('pos_label_member_id_is_active'), getMsgValue('pos_label_vip_themepark'));
                                $("#inputDisplay").val("");
                                renderCustomerInfo('VIP Member', response.ResultJson[0].sbarcode);
                                saleTx.customerId = response.ResultJson[0].sbarcode; // sbarcode
                                saleTx.isVIPThemePark = true;
                                customerIdForReward = response.ResultJson[0].sbarcode; // sbarcode
                                if (profitCodes === null) {
                                	profitCodes = [];
                                }
                                if (profitCodes.indexOf(getConfigValue("THEME_PARK_PROMO_CODE")) === -1) {
                                	profitCodes.push(getConfigValue("THEME_PARK_PROMO_CODE")); // ["M1"] for Testing
                                }
                                console.log("customer sale tx inq earn / dr : " + saleTx.customerId); */
                            } else {
                                console.log("SPO OTHER RESPONSE");
                                console.log(response);
                                showMsgDialog(response.msg, "SPO Information");
                                /* promptSysMsg();
                                $("#inputDisplay").val("");
                                loyVIPThemeParkSelected = false;
                                alert(response.ResultMsg); */
                            }
                        },
                        error: function(err) {
                            uilog('DBUG', 'Call SPO Submitted but there is an Error');
                            uilog('DBUG', err);
                        }
                    });
                    /**
                     * Print header and body first before printing summary if hypercash enabled
                     **/
                    if (isHcEnabled) {
                        Hypercash.printer.printTransactionBasedOnMediaPaymentType(saleTx.payments, detailsToPrint);
                    } else {
                        printReceipt(detailsToPrint);
                    }
                }
            }, function(error) {
                uilog('DBUG', 'FAIL: ' + error);
            });
        } else {
            if (profCust && profCust.returnNote) {
                saleTx.returnNote = Hypercash.service.printReturnNote();
            }

            try {
                RETURN_REFUND.return.service.saveCouponReturnData();
            } catch (err) {
                console.log("Save coupon return data error");
                console.log(err);
            }
            
            saveOrder(CONSTANTS.STATUS.COMPLETED, function(data) {

                if (data && data.error) {
                    promptSysMsg('Order failed.' +
                        JSON.stringify(data.error), 'SALE');
                } else {
                    if (isGcMmsRedemption) {
                        callGcMmsConfirmRedemptionRequest();
                    }
                    lockKeyboard = false;
                    //uilog("DBUG","SUCCESS: " + data);
                    promptSysMsg('Order completed with TR# ' +
                        removeLeadingZeroes(data), 'SALE');
                    renderScreenReceiptSummary();
                    //renderCustomerFeedbackDialog();
                    DrawerModule.validateTxnToOpenDrawer();
                    renderOrderSummaryDialog();
                    var detailsToPrint = {
                        summary: setReceiptSummary(saleTx),
                        footerSummary: setReceiptFooterSummary(saleTx, { eftOnline: setReceiptEftOnline(saleTx) }),
                        footer: setReceiptFooter(saleTx),
                        mktInfo: setReceiptMarketingPromoInfo(saleTx),
                        balloonGame: setReceiptBalloonGame(saleTx),
                        freeParking: setReceiptFreeParking(saleTx),
                        kidcity: (kidcityEnable) ? saleTx.kidcityObj : false,
                        ovo: setReceiptOVO(saleTx),
                        qrtts: setReceiptQrtts(saleTx),
                        mlc: setReceiptMLC(saleTx),
                        altoWC: setReceiptAltoWC(saleTx),
                        ppp: setReceiptPPP(saleTx),
                        eftOnline: setReceiptEftOnline(saleTx, true),
                        isInstallmentTransaction: isInstallmentTransaction,
                        isQueued: true,
                        voucherData: (saleTx.type != 'SALE') ? {} : saleTx.marketingVoucher, // INHOUSE VOUCHER 2017-04-13
                        couponData: (saleTx.type != 'RETURN') ? {} : setCouponSummary(saleTx),
                        copyTrk: (paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.TRK_POINT.name) ? setReceiptCopyTrk(saleTx) : {}
                    };

                    if(kidcityEnable){
                        kidcityEnable = false;
                        kidcityEnableStatus = null;
                    }

                    /**
                     * Print header and body first before printing summary if hypercash enabled
                     **/
                    if (isHcEnabled && saleTx) {
                        Hypercash.printer.printTransactionBasedOnMediaPaymentType(saleTx.payments, detailsToPrint);
                    } else {
                        printReceipt(detailsToPrint);
                    }

                    processTVS(saleTx);
                }
            }, function(error) {
                uilog('DBUG', 'FAIL: ' + error);
                /*
                promptSysMsg('Order failed.' + error, 'SALE');
                */
            });
        }
    } else {
        saveTxn();
        uilog("DBUG", "** Amount paid is less than the total amount of goods!, current: %s",
            saleTx.totalAmountPaid);
    }
};

/**
 * Gets the finalised sub-total with
 * promotion deductions and rounding included.
 */
CASHIER.getFinalSubtotalTxAmount = function(saleTx, additionalDeductions) {
    var finalSubtotalTxAmount = 0;

    // NOTE: Add relevant deductions here
    if (saleTx && saleTx.totalAmount) {
        // final transaction amount w/ all discounts deducted
        finalSubtotalTxAmount = deductTotalDiscount(saleTx);

        //console.log("Final subtotal tx amount after deduct total discount : " + finalSubtotalTxAmount);
        if (saleTx.cpnIntAmount) {
            finalSubtotalTxAmount -= saleTx.cpnIntAmount;
        }
        //console.log("Final subtotal tx amount after cpn int amount : " + finalSubtotalTxAmount);

        // add rounding amount. NOTE apply rounding amount to the final subtotal.
        if (saleTx.roundingAmount)
        // DEBUG ROUNDING
        // close for cure bug ROUNDING inside Cancel CMC
        //&& !(saleTx.\memberDiscReversal && saleTx.memberDiscReversal != 0)){
        // DEBUG ROUNDING
        {
            finalSubtotalTxAmount = finalSubtotalTxAmount + saleTx.roundingAmount;
        }
        //console.log("Final subtotal tx amount after rounding : " + finalSubtotalTxAmount);

        //if partial payment is already available
        if (additionalDeductions && additionalDeductions['payments']) {
            var paymentMediaArrLocal = additionalDeductions['payments'];
            for (var ctr = 0; ctr < paymentMediaArrLocal.length; ctr++) {
                finalSubtotalTxAmount -= paymentMediaArrLocal[ctr].amountPaid;
            }
        }
        //console.log("Final subtotal tx amount after partial deduction : " + finalSubtotalTxAmount);
    }

    return finalSubtotalTxAmount;
};

/**
 * Gets the total amount that 'MUST BE PAID' by the customer,
 *
 *
 * It includes:
 * Amount to be paid for finalised sub-total amount, iF10038007160300010.txtncludes:
 * 	  1.) PROMOTION DEDUCTIONS
 * Amount to be paid after zeroing the balance due(POST Goods Payment):
 *    1.) DONATION
 */
CASHIER.getFinalSaleTxAmount = function(saleTx) {
    var finalTxAmount = 0;

    if (saleTx && saleTx.totalAmount) {
        // Get final Subtotal amount
        finalTxAmount = CASHIER.getFinalSubtotalTxAmount(saleTx);
        finalTxAmount += CASHIER.getTotalPostGoodsPaymentAmount(saleTx);
        // TODO: Add relevant deductions here
    }
    console.log("Total final : " + finalTxAmount);
    return finalTxAmount;
};

/**
 * Amount to be paid after zeroing the balance due(POST Goods Payment):
 *    1.) DONATION
 */
CASHIER.getTotalPostGoodsPaymentAmount = function(saleTx) {

    var postGoodsPaymentAmount = 0;
    if (saleTx) {

        /*
         * List Post-Goods payment amount here
         *    1.) DONATION
         */
        saleTx.donationAmount = saleTx.donationAmount || 0;

        /* Adding donation amount if any, treating it like an item that was purchased
         *
         * Sub-total    : 10,000
         * Total paid   : 15,000 (CASH)
         * ____________________________________
         * *Change Due  : 5,000
         * ____________________________________
         **************************************
         * SCENARIO, w/ Cash donation of: 2,000
         **************************************
         * New Sub-total(w/ donation)
         *   => 10,000 + 2,000 : 12,000
         * Total paid          : 15,000
         * ____________________________________
         * *New Change Due     :  3,000
         * ____________________________________
         */
        postGoodsPaymentAmount += saleTx.donationAmount;
    }
    return postGoodsPaymentAmount;
};

/**
 * New order function
 */
CASHIER.newOrder = function() {
    isGiftCardTransaction = false;
    giftCardRefNumbers = [];
    isGiftCardBalanceInquiry = false;
    isInputGiftCardNumber = false;
    disableClrFn = false;
    saleGameItemTrk = false;
    redeemPointTrk = false;
    specialOrder = false; // RAHMAT SPO
    tmpStaff = "";
    curstaffId = "";
    tmpSpcOrder = "";
    specialOrderType = "";
    staffFlag = false;
    clearOrder();
    createOrder();
};

/**
 *  Used for displaying "Please contact helpdesk" message
 *  together with clearing and creating a new order transaction.
 */
CASHIER.promptContactHelpdeskDialog = function() {
    showMsgDialog(getMsgValue('pos_error_msg_contact_helpdesk'),
        'error',
        CASHIER.newOrder);
};

/*
 *>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>**
 * Start: Cashier Payments
 *<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
 */
CASHIER.PAYMENTS = CASHIER.PAYMENTS || {};

/**
 * Simple payment processing with overrideable payment configurations.
 * @param saleTx
 * @param overridenPaymentConfig
 */
CASHIER.PAYMENTS.processSimplePayment = function(saleTx, paymentMediaTypeName, overridenPaymentConfig) {

    var payment = parseInt($("#inputDisplay").val());
    var finalSubtotalTxAmount = CASHIER.getFinalSubtotalTxAmount(saleTx, { payments: saleTx.payments });

    payment = (isNaN(payment) === true) ? finalSubtotalTxAmount :
        payment;
    if (PAYMENT_MEDIA.isValidForTriggering(saleTx,
            paymentMediaTypeName,
            payment,
            enablePaymentMedia,
            overridenPaymentConfig)) {
        if (paymentMediaTypeName == "TRK_SALES") {
            var trkDataObj = {
                acntNo: "",
                amount: finalSubtotalTxAmount
            };
            CASHIER.executePaymentMedia(saleTx,
                paymentMediaTypeName,
                payment, { trk: trkDataObj },
                overridenPaymentConfig);
        } else {
            CASHIER.executePaymentMedia(saleTx,
                paymentMediaTypeName,
                payment,
                null,
                overridenPaymentConfig);
        }
    }
};


/*******************************************************************************
 * END: Functions used for Cashier operations
 ******************************************************************************/

/*******************************************************************************
 * Functions after success on saving order.
 ******************************************************************************/
/**
 * Functions to open cash drawer based on transaction payment type.
 * This function is called upon saving order.
 * Should be called first before print functions is executed.
 */
function renderOrderSummaryDialog() {
    //default message
    var orderMsgReminder = getMsgValue('prompt_msg_transaction_close_drawer');
    var payments = saleTx.payments;
    var lastPayment = payments.last;
    var titleTxnType = (saleTx.type == CONSTANTS.TX_TYPES.BILL_PAYMENT.name) ? CONSTANTS.TX_TYPES.BILL_PAYMENT.typeLabel : saleTx.type;
    if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name) {
        titleTxnType = "MCASH";
    }

    if (saleTx.type == CONSTANTS.TX_TYPES.SALE.name || saleTx.type == CONSTANTS.TX_TYPES.BILL_PAYMENT.name || saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name) {
        if (hasCashPayment(payments) || (lastPayment && CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_PAYMENT.name == lastPayment.paymentMediaType)) {
            orderMsgReminder = getMsgValue('prompt_msg_transaction_close_drawer');
        } else {
            //message change with ok button
            orderMsgReminder = getMsgValue('prompt_msg_transaction_complete_new_order');
        }
    } else if (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name ||
        saleTx.type == CONSTANTS.TX_TYPES.REFUND.name ||
        saleTx.type == CONSTANTS.TX_TYPES.PICKUP.name) {
        orderMsgReminder = getMsgValue('prompt_msg_transaction_close_drawer');
    } else if (saleTx.type == CONSTANTS.TX_TYPES.FLOAT.name) {
        //message change with ok button
        orderMsgReminder = getMsgValue('prompt_msg_transaction_complete_new_order');
    }

    //call order summary dialog
    openOrderSummaryDialog(titleTxnType + getMsgValue('pos_tx_order_summary_completed_msg'), orderMsgReminder);
}

function hasCashPayment(payments) {
    for (var ctr = 0; ctr < payments.length; ctr++) {
        if (payments[ctr].paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.CASH.name) {
            return true;
        }
    }
    return false;
}

function hasEftOnlinePayment(payments) {
    for (var ctr = 0; ctr < payments.length; ctr++) {
        if (payments[ctr].paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name) {
            return true;
        }
    }
    return false;
}

function renderCustomerFeedbackDialog() {
    var isTransactionCancelled = (saleTx.status == CONSTANTS.STATUS.CANCELLED);
    if (!isTransactionCancelled &&
        (saleTx.type == CONSTANTS.TX_TYPES.SALE.name || saleTx.type == CONSTANTS.TX_TYPES.BILL_PAYMENT.name || saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name)) {
        enableCustomerFeedback(true);
    }
}
/*******************************************************************************
 * Functions used for drawer ends here
 ******************************************************************************/

/*******************************************************************************
 * Functions used for printing starts here
 ******************************************************************************/
/**
 * Prints receipt by line item.
 */
function printScannedItem() {
    var txType = saleTx.type;
    console.log('cashier.js localStorage.getItem("trx_insurance_id") =', localStorage.getItem("trx_insurance_id"));
    if (typeof localStorage.getItem("trx_insurance_id") != "undefined") {
        saleTx.trx_insurance_id = localStorage.getItem("trx_insurance_id");
    }
    else {
        if (typeof saleTx.trx_insurance_id != "undefined") {
            delete saleTx.trx_insurance_id;
        }
    }
    //print receipt header; prints header if item scanned is the 1st one.
    if (saleTx.orderItems.length == 1) {
        //trigger customer screen change to active.

        changeCustomerActiveScreen(CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.TRANSACTION);
        if (!isHcEnabled) {
            if (redeemPointTrk == true) {
                //customer screen:
                printReceipt({
                    header: setReceiptHeader(saleTx),
                    body: setReceiptItems(saleTx,
                        saleTx.orderItems.slice(saleTx.orderItems.length - 1), { currency: "Points" })
                });
            } else if (txType == CONSTANTS.TX_TYPES.SALE.name) {
                //customer screen:
                printReceipt({
                    header: setReceiptHeader(saleTx),
                    body: setReceiptItems(saleTx,
                        saleTx.orderItems.slice(saleTx.orderItems.length - 1), { currency: "Rp" })
                });
            } else if (txType == CONSTANTS.TX_TYPES.RETURN.name ||
                txType == CONSTANTS.TX_TYPES.REFUND.name) {
                printReceipt({

                    txDetail: setReceiptTxDetails(saleTx),
                    header: setReceiptHeader(saleTx),
                    body: setReceiptItems(saleTx,
                        saleTx.orderItems.slice(saleTx.orderItems.length - 1), { currency: "Rp" })
                });
            }
        }
        //prints scanned item per line
    } else if (!isHcEnabled && saleTx.orderItems.length > 1) {
        printReceipt({
            body: setReceiptItems(saleTx,
                saleTx.orderItems.slice(saleTx.orderItems.length - 1),
                // enable lineItemPrice printing
                { enableLineItemPrice: true })
        });
    }
}

function printPaymentItem(saleTx) {

    var paymentMediaArrLocal = null;
    var paymentMediaArrLocalLength = null;
    if (saleTx &&
        (paymentMediaArrLocal = saleTx.payments) &&
        (paymentMediaArrLocalLength = paymentMediaArrLocal.length) > 0 &&
        paymentMediaArrLocalLength == 1) {

        changeCustomerActiveScreen(CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.TRANSACTION);
        printReceipt({
            header: setReceiptHeader(saleTx),
            txDetail: setReceiptTxDetails(saleTx),
            body: setPaymentReceiptItems(paymentMediaArrLocal.slice(paymentMediaArrLocal.length - 1), { currency: "Rp" })
        });
    } else {
        printReceipt({
            body: setPaymentReceiptItems(paymentMediaArrLocal.slice(paymentMediaArrLocal.length - 1))
        });
    }
};

/**
 * Duplicate receipt.
 * Prints non-completed transaction.
 */
/*$("#fnDuplicateReceipt").click(function(){
	if (saleTx && saleTx.orderItems && saleTx.orderItems.length > 0) {
		printReceipt({
			header: setReceiptHeader(),
			body: setReceiptItems(saleTx.orderItems)
		});
	} else {
		showMsgDialog("Cannot duplicate receipt. No items scanned.","warning");
	}
});*/

/*
 * Reprint receipt
 * Prints completed transaction.
 */
$("#fnReprintReceipt").click(function() {
    var lastTxStatus = isThereLastTransaction();
    if (lastTxStatus == 1) {
        toggleReprintReceipt = true;
        if (!hasScannedItem(saleTx)) {
            var defer = $.Deferred();
            $("#authentication-form").removeData(AUTH_DATA_KEYS)
                .data('roles', ['ROLE_SUPERVISOR'])
                .data('defer', defer)
                .data('interventionType', CONSTANTS.TX_TYPES.REPRINT_RECEIPT.name)
                .dialog("open");
            /*
             * JQuery Deffered, used for chaining callbacks
             * @author http://api.jquery.com/jQuery.Deferred/
             */
            defer.promise()
                .done(function(supervisorInterventionData) {
                    toggleReprintReceipt = false;
                    // temporary save the intervention data
                    SUPERVISOR_INTERVENTION.saveTempData(supervisorInterventionData);
                    reprintReceipt();
                });
        } else {
            showMsgDialog(
                getMsgValue("pos_warning_msg_reprint_failed_existing_tx"),
                "warning");
        }
    } else if (lastTxStatus == 0) {
        showKeyNotAllowedMsg();
    }
});


function isThereLastTransaction() {
    var status = 0;
    $.ajax({
        url: posWebContextPath + "/cashier/isThereLastTransaction",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        async: false,
        success: function(response) {
            var isThereLast = JSON.parse(JSON.stringify(response));
            if (isThereLast) {
                status = 1;
            } else {
                status = 0;
            }
        },
        error: function(jqXHR, status, error) {
            showMsgDialog("error checking for last transaction.", "error");
            status = 3;
        }
    });
    return status;
}

/*
 * Prints Last Transaction
 */
function reprintReceipt() {
    $.ajax({
        url: posWebContextPath + "/cashier/reprintReceipt",
        type: "POST",
        dataType: "json",
        async: false,
        contentType: "application/json; charset=utf-8",
        success: function(response) {
            saleTx = JSON.parse(JSON.stringify(response));
            if (typeof saleTx.error != 'undefined') {
                showMsgDialog(saleTx.error, 'warning');
                clearOrder();
                createOrder();
                return;
            }
            var isGoodsTxType = !CONSTANTS.NON_GOODS_TX_TYPES.findTxTypeByName(saleTx.type);
            if (isGoodsTxType) {
                // The inverse of PAYMENT_MEDIA.finalizeSaleTxLastPaymentAmount()
                PAYMENT_MEDIA.toRawSaleTxLastPaymentAmount(saleTx);
            }
            //EFT Online new feature
            $("#reprint-dialog").data("saleTx", saleTx).dialog("open");
        },
        error: function(jqXHR, status, error) {
            showMsgDialog(getMsgValue("pos_error_msg_reprint_failed."), "error");
        }
    });
}

/**
 *
 * @param saleTx
 * @param inputCode
 */
function reprintReceiptDetails(saleTx, reprintCode, excludeTitle) {
    var txType = saleTx.type;
    var isNonGoodsTxType = CONSTANTS.NON_GOODS_TX_TYPES.findTxTypeByName(txType);
    var reprintCodeConstant = CONSTANTS.REPRINT[reprintCode] === undefined ? -1 : CONSTANTS.REPRINT[reprintCode]['value'];
    saleTx.reprint = true;
    if (saleTx.elebox) {
        saleTx.type = CONSTANTS.TX_TYPES.ELEBOX.name;
    } else if (saleTx.bpjs) {
        saleTx.type = CONSTANTS.TX_TYPES.BPJS.name;
    } else if (saleTx.simpatindo) {
        saleTx.type = CONSTANTS.TX_TYPES.SIMPATINDO.name;
    }


    if (reprintCode.toString() && reprintCodeConstant === 0) {
        var contents = {
            header: setReceiptHeader(saleTx),
            txDetail: setReceiptTxDetails(saleTx),
            body: (isNonGoodsTxType) ?
                setPaymentReceiptItems(saleTx.payments, { currency: "Rp" }) : setReceiptItems(saleTx,
                    saleTx.orderItems, { currency: "Rp" }
                ),
            summary: setReceiptSummary(saleTx),
            footerSummary: setReceiptFooterSummary(saleTx),
            footer: setReceiptFooter(saleTx),
            //mktInfo   : setReceiptMarketingPromoInfo (saleTx),
            isQueued: true
        };
        if (!excludeTitle) {
            contents.title = setReceiptTitle(getMsgValue('pos_receipt_duplicated_receipt'));
        }
        printReceipt(contents);
    } else if (reprintCode.toString() && reprintCodeConstant === 1) {
        var payments = saleTx.payments;
        var contents = {
            header: setReceiptHeader(saleTx),
            footerSummary: setReceiptEftOnline(saleTx),
            footer: setReceiptFooter(saleTx),
            //mktInfo   : setReceiptMarketingPromoInfo (saleTx),
            eftOnline: setReceiptEftOnline(saleTx, true),
            isQueued: true
        };
        if (!excludeTitle) {
            contents.title = setReceiptTitle(getMsgValue('pos_receipt_duplicated_receipt'));
        }
        if (hasEftOnlinePayment(payments)) {
            printReceipt(contents);
        } else {
            showMsgDialog(getMsgValue('eft_msg_err_no_payment_with_receipt'), 'warning');
        }
    } else {
        showMsgDialog(getMsgValue('pos_warning_msg_eft_online_reprint_msg'), 'warning');
    }
}

//function processTxDetail
/*******************************************************************************
 * Functions used for printing ends here
 ******************************************************************************/

/*******************************************************************************
 * Functions used for rendering starts here
 ******************************************************************************/
/**
 * Use this function to remove the rendered quantity explicitly.
 */
function removeRenderedQuantity() {
    removeDisplayedQuantity();
    CustomerPopupScreen.cus_removeRenderedQuantity();
}

/**
 * Renders transaction type on screen
 */
function renderTransactionType() {
    // trigger customer screen change to active.

    changeCustomerActiveScreen(CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.TRANSACTION);

    if (saleTx.type != CONSTANTS.TX_TYPES.SALE.name) {
        var txType = CONSTANTS.TX_TYPES.findTxTypeByName(saleTx.type);
        var txTypeLabel = (txType.name == CONSTANTS.TX_TYPES.BILL_PAYMENT.name) ? CONSTANTS.TX_TYPES.BILL_PAYMENT.typeLabel : txType.name;

        displayTransactionType(txTypeLabel);
        CustomerPopupScreen.cus_renderTransactionType(txTypeLabel);
    } else {
        uilog("DBUG", ">> No txType found!");
    }
}

/**
 * Used for rendering quantity if QTY button is pressed.
 */
function renderQuantity(qty) {
    displayItemQuantity(qty, toggleVoid);
    CustomerPopupScreen.cus_renderItemQuantity(qty, toggleVoid);
}

function renderPaymentInfo() {
    var data = {
        clonedSaleTx: cloneObject(saleTx),
        roundingType: getConfigValue("ROUNDING_TYPE"),
        finalSubTotalAmount: CASHIER.getFinalSubtotalTxAmount(saleTx),
        paymentMediaSummary: PAYMENT_MEDIA.generatePaymentSummaryReceiptMap(saleTx),
        memberDiscReversal: saleTx.memberDiscReversal,
        totalDiscount: numberWithCommas(Math.abs(getTotalDiscount(saleTx))),
        promotionItems: saleTx.promotionItems,
        coBrandNumber: saleTx.coBrandNumber,
        taxBreakdown: calculateTaxBreakDown(saleTx),
        pointReward: pointReward,
        totalItemQty: numberWithCommas(saleTx.totalQuantity),
        gcItems: getGiftCardItems(),
        creditCardTypes: creditCardType,
        enableEftRendering: getConfigValue('EFT_RENDER_ENABLE'),
        totalNonMemberMarkup: Math.round(saleTx.totalNonMemberMarkup),
        totalMdrSurcharge: saleTx.totalMdrSurcharge,
        memberType: Hypercash.service.getMemberTypeForScreen(),
        empDiscPerc: getConfigValue('EMP_DISC_PERCENTAGE'),
        employeeDiscountTotal: numberWithCommas(Math.abs(calculateEmployeeDiscountTotal(saleTx))),
        hotSpiceTableNumber: HOTSPICE_MODULE.variables.tableNumber,
        billPaymentInfo: saleTx.billPaymentItem,
        totalDiscountLabel: getConfigValue('RECEIPT_TOTAL_DIRECT_DISCOUNT'),
        totalCmcDisc: numberWithCommas(calculateTotalMemberDiscount()),
        totalCmcDiscLabel: getConfigValue('RECEIPT_CMC_TOTAL_DISCOUNT'),
        cancelCmcLabel: getConfigValue('RECEIPT_CMC_CANCEL_DISCOUNT'),
        isHcEnabled: isHcEnabled,
        hcMemberId: (profCust && profCust.customerNumber && profCust.memberType != "NONMEMBER") ? profCust.customerNumber : null,
        infoLoyaltyProgram: InfoloyaltyProgram
    };

    displayPaymentInfo(data);
    CustomerPopupScreen.cus_renderPaymentInfo(data);
}

function renderScreenReceiptFooter() {
    var txDateTime = new Date(saleTx.transactionDate);
    var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);
    /*if(!isDatesTheSame(new Date(), txDateTime)){
    	txDateTime = utcDateToLocalTime(txDateTime);
    }*/
    var txTimeStr = formatTime(txDateTime);
    var data = {
        //	        txType : saleTx.type,
        totalItemQty: numberWithCommas(saleTx.totalQuantity),
        //		taxBreakdown : calculateTaxBreakDown(saleTx),
        storeCd: removeLeadingZeroes(saleTx.storeCd),
        terminalNum: removeLeadingZeroes(configuration.terminalNum),
        posTerminalId: removeLeadingZeroes(configuration.posTerminalId),
        transactionId: removeLeadingZeroes(saleTx.transactionId),
        userId: loggedInUsername,
        //		totalDiscount : numberWithCommas(getTotalDiscount(saleTx)),
        //		payments: saleTx.payments,
        //		promotionItems: saleTx.promotionItems,
        //		coBrandNumber: saleTx.coBrandNumber
        payments: saleTx.payments,
        // format cashier/customer datetime receipt view same as actual receipt
        transactionDate: getMsgValue('pos_receipt_time_label') + txTimeStr + " " + getMsgValue('pos_receipt_date_label') + txDate
    };

    displayScreenReceiptFooter(data, pointReward);
    CustomerPopupScreen.cus_renderScreenReceiptFooter(data, pointReward);
}

function renderAppliedPromotions() {

    if (promotionItems && promotionItems.length > 0) {
        displayPromotions(promotionItems);
        CustomerPopupScreen.cus_renderAppliedPromotions(promotionItems);
    }
}

function renderAppliedEmployeeDiscount() {
    var employeeDiscountTotal = calculateEmployeeDiscountTotal(saleTx);
    if (employeeDiscountTotal > 0) {
        var data = {
            amount: employeeDiscountTotal,
            percentage: (alloPaylaterDiscountToggled ? getConfigValue("ALLO_PAYLATER_DISC") : getConfigValue("EMP_DISC_PERCENTAGE")),
            type: CONSTANTS.TX_TYPES.SALE.name
        };
        displayEmployeeDiscount(data);
        CustomerPopupScreen.cus_renderAppliedEmployeeDiscount(data);
    }
}

function renderScreenReceiptSummary() {
    renderAppliedPromotions();
    renderAppliedEmployeeDiscount();
    renderPaymentInfo();
    renderScreenReceiptFooter();
}

/**
 * Render topup info in the screen receipt.
 *
 * @param data
 */
function renderTopUpInfo(data, hasHeaderLineSeparator, hasHeader, hasSummary,
    hasFooter, hasFooterLineSeparator) {
    var printTopupReceipt = parseBoolean(getConfigValue("PRINT_TOPUP_RECEIPT"));
    if (printTopupReceipt) {
        var _data = {
            txData: data,
            hasHeaderLineSeparator: hasHeaderLineSeparator,
            hasHeader: hasHeader,
            hasSummary: hasSummary,
            hasFooter: hasFooter,
            hasFooterLineSeparator: hasFooterLineSeparator,
            receiptLbl: {
                RECEIPT_TOPUP_TOTAL_LBL: getConfigValue('RECEIPT_TOPUP_TOTAL_LBL'),
                RECEIPT_TOPUP_OLD_PHONE_NO_LBL: getConfigValue('RECEIPT_TOPUP_OLD_PHONE_NO_LBL'),
                RECEIPT_TOPUP_NEW_PHONE_NO_LBL: getConfigValue('RECEIPT_TOPUP_NEW_PHONE_NO_LBL'),
                RECEIPT_TOPUP_PHONE_NO_LBL: getConfigValue('RECEIPT_TOPUP_PHONE_NO_LBL'),
                RECEIPT_TOPUP_ID_LBL: getConfigValue('RECEIPT_TOPUP_ID_LBL'),
                RECEIPT_TOPUP_TR_NO_LBL: getConfigValue('RECEIPT_TOPUP_TR_NO_LBL'),
                RECEIPT_TOPUP_VOUCHER_TYPE_LBL: getConfigValue('RECEIPT_TOPUP_VOUCHER_TYPE_LBL'),
                RECEIPT_TOPUP_STATUS_CODE_LBL: getConfigValue('RECEIPT_TOPUP_STATUS_CODE_LBL'),
                RECEIPT_TOPUP_STATUS_LBL: getConfigValue('RECEIPT_TOPUP_STATUS_LBL'),
                RECEIPT_TOPUP_RES_MSG_LBL: getConfigValue('RECEIPT_TOPUP_RES_MSG_LBL'),
                RECEIPT_TOPUP_FOOTER_LBL: getConfigValue('RECEIPT_TOPUP_FOOTER_LBL')
            }
        };

        displayTopUpInfo(_data);
        CustomerPopupScreen.cus_renderTopUpInfo(_data);
    }
}

/**
 * Render topup info in the screen receipt.
 *
 * @param data
 */
function renderIndosmartInfo(data, hasHeaderLineSeparator, hasHeader, hasSummary,
    hasFooter, hasFooterLineSeparator) {
    var printIndosmartReceipt = parseBoolean(getConfigValue("PRINT_INDOSMART_RECEIPT"));
    if (printIndosmartReceipt) {
        var _data = {
            txData: data,
            hasHeaderLineSeparator: hasHeaderLineSeparator,
            hasHeader: hasHeader,
            hasSummary: hasSummary,
            hasFooter: hasFooter,
            hasFooterLineSeparator: hasFooterLineSeparator,
            receiptLbl: {
                RECEIPT_INDOSMART_TOTAL_LBL: getConfigValue('RECEIPT_INDOSMART_TOTAL_LBL'),
                RECEIPT_INDOSMART_OLD_PHONE_NO_LBL: getConfigValue('RECEIPT_INDOSMART_OLD_PHONE_NO_LBL'),
                RECEIPT_INDOSMART_NEW_PHONE_NO_LBL: getConfigValue('RECEIPT_INDOSMART_NEW_PHONE_NO_LBL'),
                RECEIPT_INDOSMART_PHONE_NO_LBL: getConfigValue('RECEIPT_INDOSMART_PHONE_NO_LBL'),
                RECEIPT_INDOSMART_ID_LBL: getConfigValue('RECEIPT_INDOSMART_ID_LBL'),
                RECEIPT_INDOSMART_TR_NO_LBL: getConfigValue('RECEIPT_INDOSMART_TR_NO_LBL'),
                RECEIPT_INDOSMART_VOUCHER_TYPE_LBL: getConfigValue('RECEIPT_INDOSMART_VOUCHER_TYPE_LBL'),
                RECEIPT_INDOSMART_STATUS_CODE_LBL: getConfigValue('RECEIPT_INDOSMART_STATUS_CODE_LBL'),
                RECEIPT_INDOSMART_STATUS_LBL: getConfigValue('RECEIPT_INDOSMART_STATUS_LBL'),
                RECEIPT_INDOSMART_RES_MSG_LBL: getConfigValue('RECEIPT_INDOSMART_RES_MSG_LBL'),
                RECEIPT_INDOSMART_FOOTER_LBL: getConfigValue('RECEIPT_INDOSMART_FOOTER_LBL')
            }
        };

        displayIndosmartInfo(_data);
        CustomerPopupScreen.cus_renderIndosmartInfo(_data);
    }
}

/**
 * Render topup info in the screen receipt.
 *
 * @param data
 */
function renderMCashInfo(data, hasHeaderLineSeparator, hasHeader, hasSummary,
    hasFooter, hasFooterLineSeparator) {
    var printMCashReceipt = parseBoolean(getConfigValue("PRINT_MCASH_RECEIPT"));
    if (printMCashReceipt) {
        var _data = {
            txData: data,
            hasHeaderLineSeparator: hasHeaderLineSeparator,
            hasHeader: hasHeader,
            hasSummary: hasSummary,
            hasFooter: hasFooter,
            hasFooterLineSeparator: hasFooterLineSeparator,
            receiptLbl: {
                RECEIPT_MCASH_TOTAL_LBL: getConfigValue('RECEIPT_MCASH_TOTAL_LBL'),
                RECEIPT_MCASH_OLD_PHONE_NO_LBL: getConfigValue('RECEIPT_MCASH_OLD_PHONE_NO_LBL'),
                RECEIPT_MCASH_NEW_PHONE_NO_LBL: getConfigValue('RECEIPT_MCASH_NEW_PHONE_NO_LBL'),
                RECEIPT_MCASH_PHONE_NO_LBL: getConfigValue('RECEIPT_MCASH_PHONE_NO_LBL'),
                RECEIPT_MCASH_ID_LBL: getConfigValue('RECEIPT_MCASH_ID_LBL'),
                RECEIPT_MCASH_TR_NO_LBL: getConfigValue('RECEIPT_MCASH_TR_NO_LBL'),
                RECEIPT_MCASH_VOUCHER_TYPE_LBL: getConfigValue('RECEIPT_MCASH_VOUCHER_TYPE_LBL'),
                RECEIPT_MCASH_STATUS_CODE_LBL: getConfigValue('RECEIPT_MCASH_STATUS_CODE_LBL'),
                RECEIPT_MCASH_STATUS_LBL: getConfigValue('RECEIPT_MCASH_STATUS_LBL'),
                RECEIPT_MCASH_RES_MSG_LBL: getConfigValue('RECEIPT_MCASH_RES_MSG_LBL'),
                RECEIPT_MCASH_FOOTER_LBL: getConfigValue('RECEIPT_MCASH_FOOTER_LBL')
            }
        };

        displayMCashInfo(_data);
        CustomerPopupScreen.cus_renderMCashInfo(_data);
    }
}

/**
 * Render alterra info in the screen receipt.
 *
 * @param data
 */
function renderAlterraInfo(data, hasHeaderLineSeparator, hasHeader, hasSummary,
    hasFooter, hasFooterLineSeparator) {
    var printAlterraReceipt = parseBoolean(getConfigValue("PRINT_ALTERRA_RECEIPT"));
    if (printAlterraReceipt) {
        var _data = {
            txData: data,
            hasHeaderLineSeparator: hasHeaderLineSeparator,
            hasHeader: hasHeader,
            hasSummary: hasSummary,
            hasFooter: hasFooter,
            hasFooterLineSeparator: hasFooterLineSeparator,
            receiptLbl: {
                RECEIPT_ALTERRA_TOTAL_LBL: getConfigValue('RECEIPT_ALTERRA_TOTAL_LBL'),
                RECEIPT_ALTERRA_OLD_PHONE_NO_LBL: getConfigValue('RECEIPT_ALTERRA_OLD_PHONE_NO_LBL'),
                RECEIPT_ALTERRA_NEW_PHONE_NO_LBL: getConfigValue('RECEIPT_ALTERRA_NEW_PHONE_NO_LBL'),
                RECEIPT_ALTERRA_PHONE_NO_LBL: getConfigValue('RECEIPT_ALTERRA_PHONE_NO_LBL'),
                RECEIPT_ALTERRA_ID_LBL: getConfigValue('RECEIPT_ALTERRA_ID_LBL'),
                RECEIPT_ALTERRA_TR_NO_LBL: getConfigValue('RECEIPT_ALTERRA_TR_NO_LBL'),
                RECEIPT_ALTERRA_VOUCHER_TYPE_LBL: getConfigValue('RECEIPT_ALTERRA_VOUCHER_TYPE_LBL'),
                RECEIPT_ALTERRA_STATUS_CODE_LBL: getConfigValue('RECEIPT_ALTERRA_STATUS_CODE_LBL'),
                RECEIPT_ALTERRA_STATUS_LBL: getConfigValue('RECEIPT_ALTERRA_STATUS_LBL'),
                RECEIPT_ALTERRA_RES_MSG_LBL: getConfigValue('RECEIPT_ALTERRA_RES_MSG_LBL'),
                RECEIPT_ALTERRA_FOOTER_LBL: getConfigValue('RECEIPT_ALTERRA_FOOTER_LBL')
            }
        };

        displayAlterraInfo(_data);
        CustomerPopupScreen.cus_renderAlterraInfo(_data);
    }
}

/*
 * render last scanned item on bottom box;
 */
function renderProductDetails(data) {

    displayProductDetails(data);

    CustomerPopupScreen.cus_renderProductDetails(data);
}

/**
 * Return / Refund Tx;
 * Price Changed;
 * Updates transaction's total amount and item price.
 */
function updateScannedItem() {
    var item;
    if (saleTx.orderItems.last) {
        item = saleTx.orderItems.last;
    }

    // subtract old item subtotal;

    saleTx.totalAmount -= item.priceSubtotal;

    // add updated price of item
    var updatedUnitPrice;
    // DEBUG CR RETURN
    if (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name && getConfigValue("RETURN_FLAG") == "true")
        updatedUnitPrice = item.priceUnit;
    else
        updatedUnitPrice = parseInt($("#priceInput").val());

    /*
     * For Hypercash Transaction, add the tax value on taxable products
     * since inputted PRICE by cashier for RETURNED items
     * is just the SELLING PRICE BEFORE TAX.
     */
    /*updatedUnitPrice = (profCust && profCust.customerNumber && item.isTaxInclusive) ?
    		Math.round(updatedUnitPrice * parseFloat(getConfigValue('TAX_TARIFF_DIVISOR'))) : updatedUnitPrice;*/

    if (profCust && profCust.customerNumber) {
        if (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name && item.isTaxInclusive) {
            updatedUnitPrice = Math.round(updatedUnitPrice * parseFloat(getConfigValue('TAX_TARIFF_DIVISOR')));
        }
    }

    item.priceUnit = updatedUnitPrice;

    if (item.weight && item.weight > 0) {
        item.priceSubtotal = calculateWeightedPrice(item.quantity, item.priceUnit);
    } else {
        item.priceSubtotal = item.quantity * item.priceUnit;
    }


    saleTx.totalAmount += item.priceSubtotal;
    renderScannedItem(item);
    printScannedItem();
    renderTotal();
}

/**
 * Used for rendering scanned item/product.
 */
function renderScannedItem(data) {

    var itemTotal = data.quantity * data.priceUnit;

    if (data.weight) {
        itemTotal = calculateWeightedPrice(data.quantity, data.priceUnit);
    }

    // LUCKY - ADD BARCODE ON ITEM OBJ
    uilog("DBUG", 'Item Object:');
    uilog("DBUG", data);
    var item = {
        id: data.productId,
        unitPrice: numberWithCommas(data.priceUnit),
        itemTotal: numberWithCommas(itemTotal),
        shortDesc: data.shortDesc,
        qty: data.quantity,
        salesType: data.salesType,
        barcode: data.ean13Code,
        isTaxInclusive: data.isTaxInclusive,
        discountAmount: data.discountAmount,
        memberDiscountAmount: data.memberDiscountAmount,
        crmMemberDiscountAmount: data.crmMemberDiscountAmount,
        cmcDiscountLabel: getConfigValue('RECEIPT_CMC_DISCOUNT'),
        categoryId: data.categoryId,
        staffId: tmpStaff,
        flagStaff: staffFlag
    };
    var type = saleTx.type;

    //GiftCards
    if (GIFTCARDObject && GIFTCARDObject.currGiftCardInfo) {
        item.giftCardNumber = GIFTCARDObject.currGiftCardInfo.cardNumber;
    }

    if (configuration.terminalType == 'DEPTSTORE') {
        item.discAmount = data.discAmount;
        item.discPrice = data.discPrice;
        item.discVoucher = data.discVoucher;
        item.discVoucherBarcode = data.discVoucherBarcode; // INHOUSE VOUCHER 2017-04-13
        item.discMarkdown = data.discMarkdown;
    }

    // SAVE THE TRX
    saveTxn();
    displayScannedItem(saleTx, type, item);
    CustomerPopupScreen.cus_renderScannedItem(saleTx, type, item);
}

/*
 * Rendering payment media items.
 */
function renderPaymentItem(data) {
    var item = {
        label: data.paymentMediaType,
        amount: numberWithCommas(data.amountPaid)
    };
    displayPaymentItem(item);
    CustomerPopupScreen.cus_renderPaymentItem(item);
}

/**
 * Used for rendering voided item/product.
 */
function renderVoidedItem(data) {
    //	var type = saleTx.type;
    var itemTotal = (data.weight && data.weight > 0) ?
        calculateWeightedPrice(data.quantity, data.priceUnit) :
        data.quantity * data.priceUnit;


    var itemData = {
        unitPrice: numberWithCommas(data.priceUnit),
        itemTotal: numberWithCommas(itemTotal),
        shortDesc: data.shortDesc,
        qty: data.quantity,
        salesType: data.salesType,
        isTaxInclusive: data.isTaxInclusive,
        voidedDiscount: data.discountAmount,
        voidedMemDiscount: data.memberDiscountAmount,
        isVoided: data.isVoided,
        voidedCrmMemberDiscountAmount: data.crmMemberDiscountAmount,
        cmcDiscountLabel: getConfigValue('RECEIPT_CMC_DISCOUNT'),
        categoryId: data.categoryId,
        barcode: data.barcode
    };

    //GiftCards
    if (GIFTCARDObject && GIFTCARDObject.currGiftCardInfo) {
        itemData.giftCardNumber = GIFTCARDObject.currGiftCardInfo.cardNumber;
    }

    if (isDeptstore) {
        itemData.discAmount = data.discAmount;
        itemData.discPrice = data.discPrice;
        itemData.discVoucher = data.discVoucher;
        itemData.discVoucherBarcode = data.discVoucherBarcode; // INHOUSE VOUCHER 2017-04-13
        itemData.discMarkdown = data.discMarkdown;
    }

    displayVoidedItem(itemData, saleTx);
    CustomerPopupScreen.cus_renderVoidedItem(itemData, saleTx);
}

/*
 * @param baseTx the transaction being voided. This is expected to be a throw-away object,
 * 			as it is modified in this method and reusing it after this call will
 * 			likely cause unexpected results.
 * @param voidTx the new voided transaction.
 */
function renderVoidTxn(baseTx, voidTx, uid) {
    var txDate = new Date();
    var txTimeStr = txDate.toLocaleTimeString();
    var voidTxData = {
        type: voidTx.type,
        totalAmount: numberWithCommas(voidTx.totalAmount),
        taxBreakdown: calculateTaxBreakDown(voidTx),
        orderItems: voidTx.orderItems,
        storeCd: removeLeadingZeroes(voidTx.storeCd),
        posTerminalId: removeLeadingZeroes(voidTx.posTerminalId),
        transactionId: removeLeadingZeroes(voidTx.transactionId),
        userId: loggedInUsername,
        promotionItems: voidTx.promotionItems,
        totalDiscount: numberWithCommas(getTotalDiscount(voidTx) * -1),
        subTotal: numberWithCommas(voidTx.totalAmount - (getTotalDiscount(voidTx))),
        terminalNum: removeLeadingZeroes(configuration.terminalNum),
        transactionDate: txTimeStr.substring(0, txTimeStr.lastIndexOf(':')) + ' ' + $.datepicker.formatDate('dd/mm/yy', txDate),
        baseTransactionType: voidTx.baseTransactionType,
        vat: voidTx.vat,
        tariff: voidTx.tariff
    };
    var data = {
        baseTx: baseTx,
        totalItemQty: voidTx.totalQuantity,
        /*  Note it was renamed for consitency with normal sale implementation
         *  "clonedSaleTx" was originally "voidTxData"
         */
        clonedSaleTx: voidTxData,
        finalSubtotalTxAmount: CASHIER.getFinalSubtotalTxAmount(baseTx),
        finalSaleTxAmount: CASHIER.getFinalSaleTxAmount(baseTx),
        roundingType: getConfigValue("ROUNDING_TYPE"),
        memberDiscReversal: baseTx.memberDiscReversal,
        totalDiscount: numberWithCommas(Math.abs(getTotalDiscount(saleTx))),
        totalNonMemberMarkup: voidTx.totalNonMemberMarkup,
        empDiscPerc: getConfigValue('EMP_DISC_PERCENTAGE'),
        employeeDiscountTotal: numberWithCommas(Math.abs(calculateEmployeeDiscountTotal(saleTx))),
        cmcDiscountLabel: getConfigValue('RECEIPT_CMC_DISCOUNT'),
        totalDiscountLabel: getConfigValue('RECEIPT_TOTAL_DIRECT_DISCOUNT'),
        totalCmcDisc: numberWithCommas(calculateTotalMemberDiscount()),
        totalCmcDiscLabel: getConfigValue('RECEIPT_CMC_TOTAL_DISCOUNT'),
        cancelCmcLabel: getConfigValue('RECEIPT_CMC_CANCEL_DISCOUNT')

    };

    displayVoidTxn(data);
    CustomerPopupScreen.cus_renderVoidTxn(data);
}

function renderTxn(tx) {
    var orderItems = cloneObject(tx.orderItems);
    if (BILL_PAYMENT.isBillPaymentTansaction() && tx.type == CONSTANTS.TX_TYPES.BILL_PAYMENT.name) {
        orderItems = BILL_PAYMENT.getItemInfoList(tx.billPaymentItem);
        uilog('DBUG', "Masuk ke Bill Payment");
    } else if (ELEBOX.isEleboxTransaction() && tx.type == CONSTANTS.TX_TYPES.ELEBOX.name) {
        orderItems = ELEBOX.getItemInfoList(tx);
        uilog('DBUG', "Elebox renderTxn param: " + JSON.stringify(tx));
    } else if (BPJS.isBpjsTransaction() && tx.type == CONSTANTS.TX_TYPES.BPJS.name) {
        uilog('DBUG', "BPJS renderTxn param: " + JSON.stringify(tx));
        orderItems = BPJS.getItemInfo(tx);
    } else if (SIMPATINDO.isSimpatindoTransaction() && tx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name) {
        uilog('DBUG', "SIMPATINDO renderTxn param: " + JSON.stringify(tx));
        orderItems = SIMPATINDO.getItemInfo(tx);
    }

    var displayData = {
        cmcDiscountLabel: getConfigValue('RECEIPT_CMC_DISCOUNT')
    };
    displayTxn(tx, orderItems, displayData);
    CustomerPopupScreen.cus_renderTxn(tx, orderItems, displayData);
}

/**
 * Used for rendering item/product information after scanning the barcode.
 */
function renderSearchResult(prodObj) {
    searchData = prodObj;
    var output = "";

    if (redeemPointTrk) {
        output = "Name : <em>" + prodObj.name + "</em><br />" +
            "Description : <em>" + prodObj.description + "</em><br />" +
            "Current Price : <em>" + prodObj.trkPoint + "</em><br />" +
            "Active : <em>" + prodObj.active + "</em><br />";
    } else if (saleGameItemTrk) {
        output = "Name : <em>" + prodObj.name + "</em><br />" +
            "Description : <em>" + prodObj.description + "</em><br />" +
            "Current Price : <em>" + prodObj.trkPrice + "</em><br />" +
            "Active : <em>" + prodObj.active + "</em><br />";
    } else {
        output = "Name : <em>" + prodObj.name + "</em><br />" +
            "Description : <em>" + prodObj.description + "</em><br />" +
            "Current Price : <em>" + prodObj.currentPrice + "</em><br />" +
            "Active : <em>" + prodObj.active + "</em><br />";
    }

    $("#prodSearchResult").html(output);
    // $("#btnAddItem").first().html("<button class='button red
    // button-label'>Add Item</button>"); commented for now, add item directly

    addItem(searchData);
}

/**
 * GiftCard Render - GC Product Request
 * @param gcProduct
 */
function renderGiftCardRequest(prodObj) {
    var output = "Name : <em>" + prodObj.name + "</em><br />" +
        "Description : <em>" + prodObj.description + "</em><br />" +
        "Current Price : <em>" + prodObj.currentPrice + "</em><br />" +
        "Active : <em>" + prodObj.active + "</em><br />";

    $("#prodSearchResult").html(output);
}

/**
 * Used for rendering order subtotal and total quantity. This function uses the
 * ff functions: cus_renderTotal (CustomerPopupScreen)
 */
function renderTotal() {
    var clonedSaleTx = cloneObject(saleTx);
    if (clonedSaleTx != null) {
        // will deduct totalDiscount and voidedDiscount.
        var discountedTotalAmt = deductTotalDiscount(clonedSaleTx);

        if (saleTx.cpnIntAmount) {
            discountedTotalAmt -= saleTx.cpnIntAmount;
        }

        // rounding amount applies only to final amount.
        if (saleTx.roundingAmount) {
            discountedTotalAmt += saleTx.roundingAmount;
        }

        var totalDiscount = getTotalDiscount(clonedSaleTx);
        if ((saleTx.type == CONSTANTS.TX_TYPES.SALE.name && saleTx.status == CONSTANTS.STATUS.CANCELLED) ||
            (saleTx.status != CONSTANTS.STATUS.CANCELLED &&
                (saleTx.type == CONSTANTS.TX_TYPES.REFUND.name || saleTx.type == CONSTANTS.TX_TYPES.RETURN.name))) {
            discountedTotalAmt = discountedTotalAmt * -1;
            totalDiscount = totalDiscount * -1;
        }

        var discountedTotalAmtStr = numberWithCommas(discountedTotalAmt);
        var totalDiscountStr = numberWithCommas(totalDiscount);

        displayTotals(discountedTotalAmtStr, saleTx.totalQuantity, totalDiscountStr);
        CustomerPopupScreen.cus_renderTotal(discountedTotalAmtStr, saleTx.totalQuantity, totalDiscountStr);
    }
}

/**
 * Dialog function Display order summary when transaction is paid.
 */
function displayOrderSummary() {

    var crmResponse;
    var crmMembershipStatus;

    /* If not HC, proceed; 
     * Else if HC, should be SALE txn type and not NON-MEMBER type, and not in CRM offline mode
     */

    if ((!isHcEnabled) ||
        (isHcEnabled && saleTx.type == CONSTANTS.TX_TYPES.SALE.name &&
            profCust && profCust.memberType != "NONMEMBER" &&
            !CRMAccountModule.Hypercash.crmOfflineMode) || isMembershipToBeRenewed) {
        crmMembershipStatus = isCustomerValidForReward(customerIdForReward ? customerIdForReward : saleTx.customerId, saleTx);

        if (crmMembershipStatus != null) {
            if (crmMembershipStatus.loyaltyCardExpired && toggleCancelSale == false) {
                crmResponse = renewMembership(customerIdForReward, saleTx);
            }
        }
    }

    var output = "";
    var paymentMediaOrderSummary = PAYMENT_MEDIA.generatePaymentOrderSummaryMap(saleTx);

    var subtotal = saleTx.totalAmount;
    var cpnIntAmount = saleTx.cpnIntAmount;
    var roundingAmount = saleTx.roundingAmount;
    var balanceDue = saleTx.totalAmount + saleTx.roundingAmount - saleTx.cpnIntAmount;

    // will override subtotal if has discount.
    if (saleTx.totalDiscount) {
        //subtotal = saleTx.totalAmount - getTotalDiscount(saleTx);
        subtotal = CASHIER.getFinalSubtotalTxAmount(saleTx);
        balanceDue = subtotal + saleTx.roundingAmount - saleTx.cpnIntAmount;
    }

    var cash = saleTx.totalAmountPaid;
    var change = saleTx.totalChange;
    var isCancelSale = saleTx.status == CONSTANTS.STATUS.CANCELLED;

    // TR Display on Pop Up
    if (saleTx.type == CONSTANTS.TX_TYPES.SALE.name || saleTx.type == CONSTANTS.TX_TYPES.BILL_PAYMENT.name || saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name) {
        if (!isCancelSale) {
            if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name) {
                output = "Subtotal: <em>" + numberWithCommas(saleTx.priceSubtotal) + "</em><br />";
            } else {
                output = "";
                // if (typeof localStorage.getItem("trx_insurance_id") != "undefined") {
                if (localStorage.getItem("trx_insurance_id") != null) {
                    output += "TR: <em>" + localStorage.getItem("trx_insurance_id") + "</em><br />";                  
                }
                output += "Subtotal: <em>" + numberWithCommas(subtotal) + "</em><br />";
            }
        }
        if (saleTx.cpnIntAmount)
            output += "Cpn Int Amount: <em>-" + numberWithCommas(cpnIntAmount) + "</em><br />";
        if (saleTx.roundingAmount)
            output += "Rounding Amount: <em>" + numberWithCommas(roundingAmount) + "</em><br />";
        if (saleTx.cpnIntAmount || saleTx.roundingAmount)
            output += "Total: <em>" + numberWithCommas(balanceDue) + "</em><br />";
        if (!isCancelSale)
            output += "Total Amount Paid: <em>" + numberWithCommas(cash) + "</em><br />";
        if (saleTx.donationAmount) {
            output += "Donation Amount : <em>" + numberWithCommas(saleTx.donationAmount) + "</em><br />";
        }
        if (!isCancelSale)
            output += "Total Change : <em>" + numberWithCommas(change) + "</em><br />";

        //Payment Breakdown
        if (paymentMediaOrderSummary &&
            paymentMediaOrderSummary.length > 0) {
            output += "<br/><em>Payment Breakdown:<br/>";
            for (var ctr = 0; ctr < paymentMediaOrderSummary.length; ctr++) {
                output += paymentMediaOrderSummary[ctr] + '<br/>';
            }
        }

        //Topup items
        if (topUpObj &&
            topUpObj.topUpTxItems &&
            topUpObj.topUpTxItems.length) {
            output += "<br />";
            output += getConfigValue('RECEIPT_TOPUP_TOTAL_LBL') + " <em>" + numberWithCommas(topUpObj.totalAmt) + "</em><br /><br />";
            topUpObj.topUpTxItems.forEach(function(key) {
                output += saleTx.orderItems[key.refTxItemOrder].shortDesc + " <em>" + numberWithCommas(saleTx.orderItems[key.refTxItemOrder].priceUnit) + "</em><br />";
                output += getConfigValue('RECEIPT_TOPUP_PHONE_NO_LBL') + " <em>" + key.phoneNum + "</em><br />";
                output += getConfigValue('RECEIPT_TOPUP_ID_LBL') + " <em>" + key.serverTrxId + "</em><br />";
                output += getConfigValue('RECEIPT_TOPUP_STATUS_CODE_LBL') + " <em>" + key.resCode + "</em><br />";
                output += getConfigValue('RECEIPT_TOPUP_STATUS_LBL') + " <em>" + key.scrMessage + "</em><br />";
                output += "<br />";
            });
        }

        //Indosmart items
        if (indosmartObj &&
            indosmartObj.indosmartTxItems &&
            indosmartObj.indosmartTxItems.length) {
            output += "<br />";
            output += getConfigValue('RECEIPT_INDOSMART_TOTAL_LBL') + " <em>" + numberWithCommas(indosmartObj.totalAmt) + "</em><br /><br />";
            console.log("INDOSMART ITEM COMPLETE");
            indosmartObj.indosmartTxItems.forEach(function(key) {
                output += saleTx.orderItems[key.refTxItemOrder].shortDesc + " <em>" + numberWithCommas(saleTx.orderItems[key.refTxItemOrder].priceUnit) + "</em><br />";

                console.log(key);

                if (key.responseCode) {
                    output += getConfigValue('RECEIPT_INDOSMART_PHONE_NO_LBL') + " <em>" + key.destination + "</em><br />";
                    output += getConfigValue('RECEIPT_INDOSMART_ID_LBL') + " <em>" + key.referenceNo + "</em><br />";
                    output += getConfigValue('RECEIPT_INDOSMART_STATUS_CODE_LBL') + " <em>" + key.responseCode + "</em><br />";
                }
                output += getConfigValue('RECEIPT_INDOSMART_STATUS_LBL') + " <em>" + key.message + "</em><br />";
                output += getConfigValue('RECEIPT_INDOSMART_STATUS_GENERAL_LBL') + " <em>" + key.messageGeneral + "</em><br />";
                output += "<br />";
            });
        }

        //Indosmart items
        if (mCashObj &&
            mCashObj.mCashTxItems &&
            mCashObj.mCashTxItems.length) {
            output += "<br />";
            output += getConfigValue('RECEIPT_MCASH_TOTAL_LBL') + " <em>" + numberWithCommas(mCashObj.totalAmt) + "</em><br /><br />";
            console.log("MCASH ITEM COMPLETE");
            mCashObj.mCashTxItems.forEach(function(key) {
                console.log(key);
                output += saleTx.orderItems[key.refTxItemOrder].shortDesc + " <em>" + numberWithCommas(saleTx.orderItems[key.refTxItemOrder].priceUnit) + "</em><br />";
                output += getConfigValue('RECEIPT_MCASH_PHONE_NO_LBL') + " <em>" + key.phoneNum + "</em><br />";
                output += getConfigValue('RECEIPT_MCASH_ID_LBL') + " <em>" + key.serverTrxId + "</em><br />";
                output += getConfigValue('RECEIPT_MCASH_STATUS_CODE_LBL') + " <em>" + key.resCode + "</em><br />";
                output += getConfigValue('RECEIPT_MCASH_STATUS_LBL') + " <em>" + key.scrMessage + "</em><br />";
                output += "<br />";
            });
        }

        //Alterra items
        if (alterraObj &&
            alterraObj.alterraTxItems &&
            alterraObj.alterraTxItems.length) {
            output += "<br />";
            console.log("alterra screen");
            output += getConfigValue('RECEIPT_ALTERRA_TOTAL_LBL') + " <em>" + numberWithCommas(alterraObj.totalAmt) + "</em><br /><br />";
            alterraObj.alterraTxItems.forEach(function(key) {
                console.log(key);
                output += saleTx.orderItems[key.refTxItemOrder].shortDesc + " <em>" + numberWithCommas(saleTx.orderItems[key.refTxItemOrder].priceUnit) + "</em><br />";
                output += getConfigValue('RECEIPT_ALTERRA_PHONE_NO_LBL') + " <em>" + key.phoneNum + "</em><br />";
                output += getConfigValue('RECEIPT_ALTERRA_ID_LBL') + " <em>" + key.serverTrxId + "</em><br />";
                output += getConfigValue('RECEIPT_ALTERRA_STATUS_CODE_LBL') + " <em>" + key.resCode + "</em><br />";
                output += getConfigValue('RECEIPT_ALTERRA_STATUS_LBL') + " <em>" + key.scrMessage + "</em><br />";
                output += "<br />";
            });
        }
    } else if (saleTx.type == CONSTANTS.TX_TYPES.REFUND.name || saleTx.type == CONSTANTS.TX_TYPES.RETURN.name) {

        if (saleTx.status == CONSTANTS.STATUS.COMPLETED)
            subtotal = subtotal * -1;
        output += "Total Amount: <em>" + numberWithCommas(subtotal) + "</em><br />";

        //Payment Breakdown
        if (paymentMediaOrderSummary &&
            paymentMediaOrderSummary.length > 0) {
            output += "<br/><em>Payment Breakdown:<br/>";
            for (var ctr = 0; ctr < paymentMediaOrderSummary.length; ctr++) {
                output += paymentMediaOrderSummary[ctr].format() + '<br/>';
            }
        }
    }

    if (crmResponse != null) {
        if (crmResponse.type == 'SUCCESS') {
            output += crmResponse.message;
        }
    }

    $("#orderSummary").append(output);

    isRenewMembershipSelected = false;
    isMembershipToBeRenewed = false;
}

/**
 * Customer Page change trigger
 */
function changeCustomerScreen(isIdle) {
    CustomerPopupScreen.cus_renderActiveScreen(isIdle, toggleTempOff);
}

function restoreSysMsg() {
    var before = $(savedSysMsg);
    $("#systemMessageDiv").html(before);
}

function saveSysMsg() {
    savedSysMsg = $("#systemMessageDiv").children();
}

function promptSysMsg(msg, header) {

    if (msg || coBrandDiscountStatus || (saleTx && saleTx.indentSlip) || isTrainingModeOn || kidcityEnableStatus ||
        (EFT.installmentType && EFT.installmentType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO)) {

        $("#systemMessageDiv").empty();
        if (coBrandDiscountStatus)
            displayCoBrandStatus();
        if (kidcityEnableStatus)
            displayKidcityStatus();
        if (eftTransactionType &&
            eftTransactionType.toLowerCase().search(CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO.toLowerCase()) != -1)
            $("#systemMessageDiv").append($("<h4></h4>").text(getMsgValue('eft_msg_info_zepro_on')));
        if (header)
            $("#systemMessageDiv").append($("<h4></h4>").text(header));
        if (isTrainingModeOn)
            $("#systemMessageDiv").append($("<h4></h4>").text(getMsgValue("pos_cashier_training_mode_msg")));
        // INDENT 2017-05-18
        if (saleTx && saleTx.indentSlip)
            $("#systemMessageDiv").append($("<h4></h4>").text("INDENT SALES"));
        if (crmEarnPointsSelected && saleTx.customerId)
            $("#systemMessageDiv").append($("<h4></h4>").text(getMsgValue('pos_label_member_id_is_active')));
        // INDENT 2017-05-18
        if (msg)
            $("#systemMessageDiv").append($("<p></p>").addClass('systemMsg').html(msg));
    } else {
        displayRegularReminders();
    }
}

/**
 * Calculates total tax with tax rate = 10% - configurable.
 *
 * @returns txDetails
 */
function calculateTaxBreakDown(tx) {
    var txItems = getSummarizeSaleItems(tx);
    var totalTaxableAmount = 0,
        vat = 0,
        tariff = 0,
        taxRate = getConfigValue('TAX_RATE'),
        totalDiscountAmountPerOrder = 0;
    var item;
    var hasDiscReversal = tx.memberDiscReversal && tx.memberDiscReversal > 0;
    //loop in the items and get summation of tax inclusive items
    for (var i = txItems.length - 1; i >= 0; i--) {
        item = txItems[i];
        if (item.isTaxInclusive) {

            totalDiscountAmountPerOrder = (item.discountAmount ? item.discountAmount : 0) +
                (!hasDiscReversal && item.memberDiscountAmount ? item.memberDiscountAmount : 0) +
                (item.secondLayerDiscountAmount ? item.secondLayerDiscountAmount : 0) +
                item.crmMemberDiscountAmount //crmMemberDiscountAmount default value is 0
                +
                (item.discBtnAmount ? item.discBtnAmount : 0);
            console.log("Total Discount Amount Pre Order : " + totalDiscountAmountPerOrder);
            if (totalDiscountAmountPerOrder > 0) {
                totalTaxableAmount += item.priceSubtotal - totalDiscountAmountPerOrder;
            } else {
                totalTaxableAmount += item.priceSubtotal;
            }
        }
        if (item.nonMemberMarkup) {
            if (item.isVoided) {
                totalTaxableAmount -= item.nonMemberMarkup;
            } else {
                totalTaxableAmount += item.nonMemberMarkup;
            }
        }
    }


    // get tariff tax and vat;
    tariff = totalTaxableAmount / parseFloat(getConfigValue('TAX_TARIFF_DIVISOR'));
    vat = tariff * (parseInt(taxRate) / 100);

    var taxDetails = {
        taxRate: "" + taxRate + "%", // appends percent symbol
        // round up tariff
        taxDPP: numberWithCommas(Math.ceil(tariff)),
        // round down vat
        taxAmount: numberWithCommas(Math.floor(vat))
    };

    tx.totalTaxableAmount = totalTaxableAmount;
    tx.tariff = tariff;
    tx.vat = vat;

    if (tx.type == 'SALE' ||
        tx.type == CONSTANTS.TX_TYPES.SALE_VOID.name /*'VOID'*/ ||
        tx.type == CONSTANTS.TX_TYPES.REFUND.name /*'REFUND'*/ ||
        tx.type == CONSTANTS.TX_TYPES.RETURN.name /*'RETURN'*/ ) {
        return taxDetails;
    } else {
        return null;
    }
}

function insertSubsidi(){
    var subsidi = getConfigValue("PROGRAM_KBLBB");
    processSaleScan(subsidi);
    isEnabledAgainEmotor = false;
}

/**
 * Place SaleTx non-voided items to unique array for checking if voiding of
 * single/multiple items is possible.
 */
function getSummarizeSaleItems(tx,
    priceSensitiveProdIdArr,
    isPriceSensitive) {
    // clone saleTx orderItems
    var priceSensitive = isPriceSensitive || false;
    var clonedSaleTxItems = cloneObject(tx.orderItems);
    var orderItems = [],
        uniqItems = [];
    var i = 0;
    var itemScanTimeArr = [];

    while (clonedSaleTxItems[i]) {
        orderItems.push(clonedSaleTxItems[i]);
        if (clonedSaleTxItems[i].salesType == CONSTANTS.TX_TYPES.SALE.name) {
            itemScanTimeArr.push(createItemScanTimeObj(
                clonedSaleTxItems[i].productId,
                clonedSaleTxItems[i].priceUnit,
                clonedSaleTxItems[i].quantity,
                clonedSaleTxItems[i].scanTime,
                (clonedSaleTxItems[i].discountAmount / clonedSaleTxItems[i].quantity)));
        }
        i++;
    }

    for (var ctr = 0; ctr < orderItems.length; ctr++) {
        for (var ctr2 = ctr + 1; ctr2 < orderItems.length; ctr2++) {

            var orderItem1 = orderItems[ctr];
            var orderItem2 = orderItems[ctr2];
            var withinPriceSensitiveProdIdArr = priceSensitiveProdIdArr != null &&
                priceSensitiveProdIdArr.length > 0 &&
                ($.inArray(orderItem1.productId, priceSensitiveProdIdArr) >= 0 ||
                    $.inArray(orderItem2.productId, priceSensitiveProdIdArr) >= 0
                );

            var enablePriceChecking = priceSensitive
                // If either of the comparing entries productId
                // is within the priceSensitiveProdIdArr
                ||
                withinPriceSensitiveProdIdArr;

            var isSameItem = enablePriceChecking ?
                (orderItem1.productId == orderItem2.productId &&
                    orderItem1.priceUnit == orderItem2.priceUnit) :
                (orderItem1.productId == orderItem2.productId)

            var isScanByWeight = withinPriceSensitiveProdIdArr && ((orderItem1.weight && orderItem1.weight > 0) || (orderItem2.weight && orderItem2.weight > 0));

            if (isSameItem && !isScanByWeight) {
                if (orderItem1.salesType == orderItem2.salesType &&
                    orderItem1.isVoided == orderItem2.isVoided) {

                    orderItem1.quantity += orderItem2.quantity;
                    orderItem1.priceSubtotal += orderItem2.priceSubtotal;
                    orderItem1.discountAmount += orderItem2.discountAmount;
                    orderItem1.memberDiscountAmount += orderItem2.memberDiscountAmount;
                    orderItem1.secondLayerDiscountAmount += orderItem2.secondLayerDiscountAmount;
                    orderItem1.qtyWithSecondLayerDiscount += orderItem2.qtyWithSecondLayerDiscount;
                    orderItem1.qtyWithMemberDiscount += orderItem2.qtyWithMemberDiscount;
                    orderItem1.discBtnAmount += orderItem2.discBtnAmount;
                    orderItem1.crmMemberDiscountAmount += orderItem2.crmMemberDiscountAmount;
                    if (orderItem1.nonMemberMarkup && orderItem2.nonMemberMarkup) {
                        orderItem1.nonMemberMarkup += orderItem2.nonMemberMarkup;
                    }
                } else {
                    orderItem1.quantity -= orderItem2.quantity;
                    orderItem1.priceSubtotal -= orderItem2.priceSubtotal;
                    orderItem1.discountAmount -= orderItem2.discountAmount;
                    orderItem1.memberDiscountAmount -= orderItem2.memberDiscountAmount;
                    orderItem1.discBtnAmount -= orderItem2.discBtnAmount;
                    // 2nd layer discount, no need to subtract since this field
                    // is not populated for voided items
                    orderItem1.crmMemberDiscountAmount -= orderItem2.crmMemberDiscountAmount;
                    if (orderItem1.nonMemberMarkup && orderItem2.nonMemberMarkup) {
                        orderItem1.nonMemberMarkup -= orderItem2.nonMemberMarkup;
                    }


                    var itemRemainingQtyDeduction = orderItem2.quantity;
                    for (var i = itemScanTimeArr.length - 1; i >= 0; i--) {
                        var currScanTimeArr = itemScanTimeArr[i];
                        var isSameItemScanTime = priceSensitive
                            // Check for price sensitivity
                            ?
                            (currScanTimeArr.productId == orderItems[ctr2].productId &&
                                currScanTimeArr.priceUnit == orderItems[ctr2].priceUnit &&
                                currScanTimeArr.discountPerItem == (orderItems[ctr2].discountAmount / orderItems[ctr2].quantity))
                            // Do not check for price sensitivity
                            :
                            (currScanTimeArr.productId == orderItems[ctr2].productId &&
                                currScanTimeArr.discountPerItem == (orderItems[ctr2].discountAmount / orderItems[ctr2].quantity));
                        if (isSameItemScanTime && currScanTimeArr.quantity > 0) {
                            currScanTimeArr.quantity -= itemRemainingQtyDeduction;
                            if (currScanTimeArr.quantity < 0) {
                                itemRemainingQtyDeduction = currScanTimeArr.quantity * -1;
                                currScanTimeArr.quantity = 0;
                            } else {
                                break;
                            }
                        }
                    }
                }
                orderItems.splice(ctr2, 1);
                ctr2--;
            }
        }

        for (var i = itemScanTimeArr.length - 1; i >= 0; i--) {
            var isSameItemScanTime = priceSensitive ?
                (itemScanTimeArr[i].productId == orderItems[ctr].productId &&
                    itemScanTimeArr[i].priceUnit == orderItems[ctr].priceUnit &&
                    itemScanTimeArr[i].discountPerItem == (orderItems[ctr].discountAmount / orderItems[ctr].quantity)) :
                (itemScanTimeArr[i].productId == orderItems[ctr].productId &&
                    itemScanTimeArr[i].discountPerItem == (orderItems[ctr].discountAmount / orderItems[ctr].quantity));
            if (isSameItemScanTime && itemScanTimeArr[i].quantity > 0) {
                orderItems[ctr].scanTime = itemScanTimeArr[i].scanTime;
                break;
            }
        }
        uniqItems.push(orderItems[ctr]);
    }

    return getSummarizedItemsLastInFirstOutOrder(uniqItems, tx, isPriceSensitive, priceSensitiveProdIdArr);
}

/**
 * Returns the Last-In First-Out(LIFO) array arrangement of
 * getSummarizeSaleItems() function. The Head of the array starts
 * at the end, meaning lifoSummArr(lifoSummArr.length - 1) is equals to LIFO item.
 * @param summArr
 * @param tx
 * @param isPriceSensitive
 * @returns {Array}
 */
function getSummarizedItemsLastInFirstOutOrder(summArr, tx, isPriceSensitive, priceSensitiveProdIdArr) {

    var lifoOrderItemsMap = {};
    var lifoSummArr = [];
    var clonedSaleTxItems = cloneObject(tx.orderItems);
    var ctr = (clonedSaleTxItems.length - 1);

    var orderIndex = 0;
    while (clonedSaleTxItems[ctr]) {
        var item = clonedSaleTxItems[ctr];
        //uilog("DBUG","LIFO ITEM: " + JSON.stringify(item));
        var isVoided = (item.salesType == 'VOID');
        var itemEan13Code = item.ean13Code;
        var itemQuantity = (isVoided) ? (item.quantity * -1) : item.quantity;
        var itemPriceUnit = item.priceUnit;
        var weightBarcode = item.weightBarcode;

        var withinPriceSensitiveProdIdArr = priceSensitiveProdIdArr != null &&
            priceSensitiveProdIdArr.length > 0 &&
            ($.inArray(item.productId, priceSensitiveProdIdArr) >= 0);

        /*
         * If isPriceSensitive, make the KEY as concatenation of ean13Code and priceUnit:
         * i.e:
         *    "4902505088827" + 12,000 = "490250508882712000"
         * else, use ean13Code only as KEY.
         */
        var key = (isPriceSensitive || withinPriceSensitiveProdIdArr) ? itemEan13Code + itemPriceUnit : itemEan13Code;
        //uilog("DBUG","LIFO KEY: " + key + " " + JSON.stringify(lifoOrderItemsMap[key]));

        if (item.weight && item.weight > 0 && typeof item.weightBarcode != 'undefined') {
            key = item.weightBarcode;
        }

        if (key in lifoOrderItemsMap) {
            var currQuantity = lifoOrderItemsMap[key].quantity;
            currQuantity += itemQuantity;
            lifoOrderItemsMap[key].quantity = currQuantity;
            if (currQuantity <= 0) {
                lifoOrderItemsMap[key].orderIndex = -1;
                // Reapply new value of orderIndex, if and only if, the previous order index is negative.
            } else if (lifoOrderItemsMap[key].orderIndex == -1) {
                lifoOrderItemsMap[key].orderIndex = orderIndex;
            }
        } else {
            lifoOrderItemsMap[key] = {
                ean13Code: itemEan13Code,
                quantity: itemQuantity,
                priceUnit: itemPriceUnit,
                orderIndex: (isVoided) ? -1 : orderIndex,
                weightBarcode: weightBarcode
            };
            //uilog("DBUG","LIFO ARR INIT: " + JSON.stringify(lifoOrderItemsMap));
        }
        orderIndex++;
        ctr--;
    }

    // Getting the lifoOrderItemsMap property values as arrays
    var lifoOrderItemsArray = [];
    for (var obj in lifoOrderItemsMap) {
        lifoOrderItemsArray.push(lifoOrderItemsMap[obj]);
    }

    // Reordering the lifoOrderItemsArray by orderIndex value
    lifoOrderItemsArray.sort(function(a, b) {
        var a1 = a.orderIndex,
            b1 = b.orderIndex;
        if (a1 == b1) return 0;
        return a1 > b1 ? 1 : -1;
    });

    //uilog("DBUG","LIFO ITEMS ARR: " + JSON.stringify(lifoOrderItemsArray));
    // Rearranging the passed summArr for LIFO arrangement.
    lifoOrderItemsArray.forEach(function(entry) {
        var orderIndex = entry.orderIndex;
        if (orderIndex > -1) {
            var ctr = 0;
            while (summArr[ctr]) {
                var item = summArr[ctr];
                var withinPriceSensitiveProdIdArr = priceSensitiveProdIdArr != null &&
                    priceSensitiveProdIdArr.length > 0 &&
                    ($.inArray(item.productId, priceSensitiveProdIdArr) >= 0);

                var enablePriceChecking = (isPriceSensitive || withinPriceSensitiveProdIdArr);

                if (item.ean13Code == entry.ean13Code &&
                    ((!enablePriceChecking) || item.priceUnit == entry.priceUnit)) {
                    if (!(item.weightBarcode) || (item.weightBarcode && item.weightBarcode == entry.weightBarcode)) {
                        lifoSummArr.unshift(item);
                        // Fix by Rahmat, 15 Feb 2019											
                        if (!(item.weightBarcode) && (item.weight === 0)) {
                            for (var i = 1; i < lifoSummArr.length; i++) {
                                if (lifoSummArr[i].ean13Code === item.ean13Code) {
                                    lifoSummArr.shift(item);
                                }
                            }
                        }
                        break;
                    }

                }
                ctr++;
            };
        }
    });

    //Returns the rearrange summarized sale items
    //uilog("DBUG","LIFO SUMM: " + JSON.stringify(lifoSummArr));
    return lifoSummArr;
}

// voidDeptStore 2017022
function getSummarizedItemsVoidDeptStore(barcodeToVoid, priceToVoid) {
    //console.log('getSummarizedItemsVoidDeptStore|barcode|' + barcodeToVoid + '|priceToVoid|' + priceToVoid);
    var itemAvailableToVoid = [];
    var voidedList = [];
    //   var summaryToVoid = [];
    var itemLists = saleTx.orderItems;

    for (var i in itemLists) {
        if (((itemLists[i].categoryId === 'DEPTSTORE' && itemLists[i]["priceUnit"] == priceToVoid) || itemLists[i].categoryId === 'DIRECTP') &&
            itemLists[i].ean13Code === barcodeToVoid &&
            itemLists[i]["isVoided"] === true) {
            voidedList.push(itemLists[i]);
        }
    }
    var isAlreadyVoided = false;

    for (var j in itemLists) {
        isAlreadyVoided = false;
        if (((itemLists[j].categoryId === 'DEPTSTORE' && itemLists[j]["priceUnit"] == priceToVoid) || itemLists[j].categoryId === 'DIRECTP') &&
            itemLists[j].ean13Code === barcodeToVoid &&
            itemLists[j]["isVoided"] === false) {
            for (var k in voidedList) {
                var amtOri = itemLists[j]["priceSubtotal"] - itemLists[j]["discountAmount"] - itemLists[j]["memberDiscountAmount"] - itemLists[j]["crmMemberDiscountAmount"] - itemLists[j]["discBtnAmount"] - itemLists[j]["secondLayerDiscountAmount"];
                var amtVoid = voidedList[k]["priceSubtotal"] - voidedList[k]["discountAmount"] - voidedList[k]["memberDiscountAmount"] - voidedList[k]["crmMemberDiscountAmount"] - voidedList[k]["discBtnAmount"] - voidedList[k]["secondLayerDiscountAmount"];
                if (amtOri == amtVoid && itemLists[j]["quantity"] == voidedList[k]["quantity"]) {
                    delete voidedList[k];
                    isAlreadyVoided = true;

                }
            }
            (!isAlreadyVoided) ? itemAvailableToVoid.push(itemLists[j]): null;

        }
    }
    return itemAvailableToVoid;
}
// voidDeptStore 2017022

function createItemScanTimeObj(productId, priceUnit, quantity, scanTime, discountPerItem) {
    var itemScanTime = {
        productId: productId,
        priceUnit: priceUnit,
        quantity: quantity,
        scanTime: scanTime,
        discountPerItem: discountPerItem
    };
    return itemScanTime;
}
/*******************************************************************************
 * Functions used for rendering ends here
 ******************************************************************************/

/*******************************************************************************
 * Functions used for clearing items starts here
 ******************************************************************************/
/**
 * Clears sale trasanction and also the scanned item of cashier's screen.
 */
function loadCashierPage() {
    // createOrder();
    $("#inputDisplay").val(dfltText);

    loadStoreInfo();
    preloadResources();
    $("#storeName").text(store.name);
    $("#storeAddress").text(store.address);
}

function preloadResources() {
    //jquery-ui images
    jQuery("<img>").attr("src", '/pos-web/resources/styles/jQuery/images/ui-bg_flat_75_ffffff_40x100.png');
    jQuery("<img>").attr("src", '/pos-web/resources/styles/jQuery/images/ui-bg_highlight-soft_75_cccccc_1x100.png');
    jQuery("<img>").attr("src", '/pos-web/resources/styles/jQuery/images/ui-icons_888888_256x240.png');
    jQuery("<img>").attr("src", '/pos-web/resources/styles/jQuery/images/ui-icons_222222_256x240.png');
    jQuery("<img>").attr("src", '/pos-web/resources/styles/jQuery/images/ui-bg_flat_0_aaaaaa_40x100.png');
    jQuery("<img>").attr("src", '/pos-web/resources/styles/jQuery/images/ui-icons_454545_256x240.png');
    //colorbox images
    //	jQuery("<img>").attr("src", '/pos-web/resources/images/controls.png');
    //	jQuery("<img>").attr("src", '/pos-web/resources/images/border.png');
    //	jQuery("<img>").attr("src", '/pos-web/resources/images/loading_background.png');
    //	jQuery("<img>").attr("src", '/pos-web/resources/images/loading.gif');
}

function loadStoreInfo() {
    var isHTTPStatusOK = false;
    var data = $.ajax({
        url: posWebContextPath + "/sys/getStoreInfo",
        type: "GET",
        async: false,
        success: function(data, status) {
            isHTTPStatusOK = true;
        }
    }).responseText;
    store = (isHTTPStatusOK) ? JSON.parse(data) : null;
}

function clearInputDisplay() {
    $("#inputDisplay").val(dfltText);
    cleared = true;
}

// CR DEBUG ROUNDING
function clearRounding() {
    if (saleTx && saleTx.roundingAmount && saleTx.roundingAmount != 0 && saleTx.payments.length == 0) {
        saleTx.roundingAmount = 0;
        toggleRounding = false;
        $("div#numPad div#keyTotal").click();
    }
}

function isValidForRounding(paymentMedia) {
    if (saleTx &&
        saleTx.roundingAmount &&
        saleTx.roundingAmount != 0 &&
        paymentMedia != CONSTANTS.PAYMENT_MEDIA_TYPES.CASH.name &&
        paymentMedia != CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name &&
        saleTx.payments.length == 0) {
        return false;
    } else if (saleTx &&
        saleTx.roundingAmount &&
        saleTx.roundingAmount != 0 &&
        paymentMedia == CONSTANTS.PAYMENT_MEDIA_TYPES.CASH.name &&
        paymentMedia == CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name) {
        return true;
    } else return true;
}
// CR DEBUG ROUNDING
function clearOrder() {
    saleTx = null;
    scannedItemOrder = -1;
    itemQty = 1;

    //	applianceAndWarranty = null;

    // Clear elements
    clearCommonDisplay();
    $("#systemMessageDiv").empty();
    displayRegularReminders();
    $("#prodSearchResult").empty();
    $("#btnAddItem").empty();
    $("#orderSummary").empty();
    // CR RETURN
    $("#fnReturnTx").removeData("isAuthenticated");
    // CR RETURN
    // CR ADD DISCOUNT
    $("#tenderNewAmount-dialog").removeData('mediaType');
    $("#tenderNewAmount-dialog").removeData('cardNumber');
    $("#tenderNewAmount-dialog").removeData('barcode');
    $("#tenderNewAmount-dialog").removeData('additionalDiscountPaymentLevel');
    $("#tenderNewAmount-dialog").removeData('additionalDiscountItemLevel');
    // CR ADD DISCOUNT
    // DEBUG ROUNDING
    $("#tenderNewAmount-dialog").removeData('subtotal');
    // DEBUG ROUNDING
    clearInputDisplay();

    loyaltyProgram = [];
    InfoloyaltyProgram = [];
    isSaleStarted = false;
    enablePaymentMedia = false;
    toggleRounding = false;
    enableRoundingBarcodeScan = false;
    toggleCpnInt = false;
    toggleNumKeyButton("keyQty", false);
    toggleNumKeyButton("keyTotal", false);
    toggleEmpCard = false;
    toggleNoEmpId = false;
    toggleCRMPoints = false;
    crmRedeemPointsSelected = false;
    crmToggleMembershipRenewal = false;
    isRenewMembershipSelected = false;
    isMembershipToBeRenewed = false;
    isMemberContactSelected = false;
    toggleCancelSale = false;
    isStoreSaleTransaction = false;
    toggleGCMMSRedemptionVoid = false;
    availEmpLoyaltyPoints = false;
    empLoyaltyPointsAvail = false;
    customerIdForReward = null;
    isPreAuthenticated = false;
    lastBarcodeScan = false;
    inquiryOnRedeem = false;
    //	previousTxType = "";
    profitCodes = null;
    saleGameItemTrk = false;
    redeemPointTrk = false;
    specialOrder = false; // RAHMAT SPO
    //DONATION
    donationNotValid = false;
    donationValidPaymentMedia = "";
    hasDonationCheck = false;
    donationExecute = [];
    beforeDonationPayment = 0;
    tempDisc = 0;
    donationPromoItem = [];
    donationOrderItem = [];
    cancelCmcDonation = false;
    checkCancelCmc = false;
    // topup related here
    processtopUpStdSleCntr = 0;
    processIndosmartStdSleCntr = 0;
    processMCashStdSleCntr = 0;
    processAlterraStdSleCntr = 0;
    topUpItemRefundFlag = false;
    indosmartItemRefundFlag = false;
    mCashItemRefundFlag = false;
    alterraItemRefundFlag = false;
    tmpStaff = "";
    tmpSpcOrder = ""; // RAHMAT SPO
    specialOrderType = "";
    staffFlag = false;

    printTo = "P";

    //EFTOnline
    bankTransactionType = null;
    clearEFT(true);
    addedCrmResponse = {};

    // refresh promotion
    refreshPromotion(true);
    refreshInstallment();

    // Sets the disableClrFn to default, #82901
    disableClrFn = false;

    if (DrawerModule.isConnected) {
        promptSysMsg();
    }

    //GiftCard
    GIFTCARDObject = null;
    hasGiftCardRedemption = false;
    isEnablePaymentMedia = false;
    isGCActivation = false;

    // GC MSS
    GIFTCARD_MMS.clearGiftCardMMSTransaction();

    // Hypercash
    if (isHcEnabled) {
        //uilog("DBUG","Reset Hypercash-related variables...");
        isProCustScan = false;
        suppressPrinting = false;
        profCust = {};
        isRevisedTxn = false;
        Hypercash.printInBigPrinter = null;
        Hypercash.queuedTopUpToPrint = [];
        Hypercash.queuedIndosmartToPrint = [];
        Hypercash.queuedMCashToPrint = [];
        Hypercash.queuedAlterraToPrint = [];
    }

    // Fix - clear price checker
    // priceChecker = true;
    // togglePriceChecker();

    clearTVS();
    HOTSPICE_MODULE.service.resetTransactionVariables();

    RETURN_REFUND.return.service.clearBaseTransactionDetails();
    pointReward = null;

    // clear the scanned item of customer's screen
    CustomerPopupScreen.cus_clearOrder();
}
/*******************************************************************************
 * Functions used for clearing items ends here
 ******************************************************************************/

/*******************************************************************************
 * Functions used for utility starts here
 ******************************************************************************/
/**
 * Will toggle the function button with an ID equal to param btnId.
 * Toogle/untoggle using the toggledFlag.
 */
function toggleFNButton(btnId, toggledFlag) {
    if (toggledFlag) {
        $("#" + btnId).removeClass("button-menu");
        $("#" + btnId).addClass("toggle-button-menu");
    } else {
        $("#" + btnId).removeClass("toggle-button-menu");
        $("#" + btnId).addClass("button-menu");
    }

    if (btnId == "fnVoid") {
        toggleVoid = toggledFlag;
    } else if (btnId == "fnPostVoid") {
        togglePostVoid = toggledFlag;
    } else if (btnId == "fnCancelSale") {
        toggleCancelSale = toggledFlag;
    }
}

/**
 * Will toggle the numpad key button with an ID equal to param btnId.
 * Toogle/untoggle using the toggledFlag.
 */
function toggleNumKeyButton(btnId, toggledFlag) {
    if (toggledFlag) {
        $("#" + btnId).removeClass("button-cal");
        $("#" + btnId).addClass("toggle-button-cal");
    } else {
        $("#" + btnId).removeClass("toggle-button-cal");
        $("#" + btnId).addClass("button-cal");
    }

    if (btnId == "keyQty") {
        toggleQty = toggledFlag;
    } else if (btnId == "keyTotal") {
        toggleTotal = toggledFlag;
    }
}

function padTxnId(txnId) {
    if (txnId.length === 11) {
        return '00' + txnId;
    } else if (txnId.length === 12) {
        return '0' + txnId;
    }
    return txnId;
}

function addLeadingZeroes(val, length) {
    var clonedVal = new String(val);
    var zero = "0";
    for (var ctr = length - clonedVal.length; ctr > 0; ctr--) {
        clonedVal = zero + clonedVal;
    }
    return clonedVal;
}

/**
 * Pings a HTTP URL. This effectively sends a HEAD request and returns true if
 * the response code is in the 200-399 range.
 *
 * @param url
 *            The HTTP URL to be pinged.
 * @param timeout
 *            The timeout in millis for both the connection timeout and the
 *            response read timeout. Note that the total timeout is effectively
 *            two times the given timeout.
 * @return true if the given HTTP URL has returned response code 200-399 on a
 *         HEAD request within the given timeout, otherwise false.
 */
function checkServerStatus(url, timeout) {
    return JSON.parse($.ajax({
        url: posWebContextPath + "/sys/pingServer",
        type: "GET",
        async: false,
        dataType: "json",
        data: {
            url: url,
            timeout: timeout
        },
        beforeSend: function() {
            $("#loading-dialog").dialog('open');
        },
        complete: function() {
            $("#loading-dialog").dialog('close');
        }
    }).responseText);
}

/**
 * Returns true if the pass condArr are ALL true;
 */
function isArrayAllTrue(condArr) {
    //uilog("DBUG","** enter isArrayAllTrue( condArr)");
    var isAllTrue = true;

    for (var index = 0; index < condArr.length; ++index) {
        //uilog("DBUG","!condArr[index]: " + !condArr[index]);
        if (!condArr[index]) {
            //uilog("DBUG","break It, not all are true");
            isTrue = false;
            break;
        }
    }
    return isAllTrue;
}

/**
 * Method to change Password Change Dialog box label.
 */
function processChangePassword() {

    var isForPasswordChange = false;
    var passwordChangeData = isUserForPasswordChange();

    if (isForPasswordChange = passwordChangeData.isForPasswordChange) {
        var passwordChangeType = passwordChangeData.passwordChangeType;
        var msgPropKey = CONSTANTS.PASS_CHANGE_TYPES
            .formatKeyByTxTypeArguments(
                CONSTANTS.PASS_CHANGE_TYPES[passwordChangeType].name,
                CONSTANTS.PASS_CHANGE_TYPES.KEY_MESSAGES_PROP_FORMAT,
                false, true);
        //uilog("DBUG","Password change type: %s", passwordChangeType);
        $("#firstLogon-dialog").data("passwordChangeType", passwordChangeType)
            .dialog("option", "title", getMsgValue(msgPropKey));
        $("#firstLogon-dialog").dialog("open");
    }

    return isForPasswordChange;
}

/**
 * Process Online Payment with CMC
 * @param payment
 * @param pymtMediaTypeName
 */
function processCoBrandEftOnlinePayment(payment, pymtMediaTypeName) {
    uilog('DBUG', 'co brand eft');
    console.log("Co brand eft");
    if (CASHIER.getFinalSaleTxAmount(saleTx) == payment) {
        processEftOnlinePayment(payment, pymtMediaTypeName);
    } else {
        showMsgDialog(getMsgValue('eft_msg_err_co_brand_amount_payment_not_exact'), "warning");
    }
}

/**
 * Process Online Payment to Edc
 * @param payment
 * @param pymtMediaTypeName
 */
function processEftOnlinePayment(payment, pymtMediaTypeName) {
    if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name || saleTx.type == CONSTANTS.TX_TYPES.BPJS.name || saleTx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name) {
        showKeyNotAllowedMsg();
    } else {
        if ( /*Regular; One Dip; Mega Pay*/
            eftTransactionType &&
            (eftTransactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE.name ||
                eftTransactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.ONE_DIP.name ||
                eftTransactionType.search(CONSTANTS.EFT.INSTALLMENT_TYPE.MEGA_PAY) != -1)) {
            if (isHcEnabled && profCust && profCust.customerNumber) {

                $("#bin-number-input-eftonline-dialog")
                    .data("payment", payment)
                    .data("pymtMediaTypeName", pymtMediaTypeName)
                    .dialog("open");
            } else {
                //Proceed to Normal POS EFT Online Payment Transaction 
                // CR KARTUKU
                if (configuration.KARTUKU && configuration.KARTUKU.isActive == 'Y') {
                    eftTransactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE.name;
                    if (PAYMENT_MEDIA.isValidForTriggering(
                            saleTx, pymtMediaTypeName, payment, enablePaymentMedia) &&
                        isNoneGiftCardItemInTransaction()) {
                        eftPaymentProcess(payment);
                    }
                } else {
                    $("#bank-mega-payment-type-selection-dialog")
                        .data("payment", payment)
                        .data("pymtMediaTypeName", pymtMediaTypeName)
                        .dialog("open");
                }
                // CR KARTUKU
            }


        } /*Zepro*/
        else if (eftTransactionType &&
            eftTransactionType.toLowerCase().search(CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO.toLowerCase()) != -1) {
            //uilog("DBUG","ZEPRO PAYMENT: " + payment);
            $("#bank-mega-installment-terms-dialog")
                .data("payment", payment)
                .data("pymtMediaTypeName", pymtMediaTypeName)
                .dialog("open");
        } else {
            if (PAYMENT_MEDIA.isValidForTriggering(
                    saleTx, pymtMediaTypeName,
                    payment, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                eftPaymentProcess(payment);
            }
        }
    }
}

/*******************************************************************************
 * Functions used for utility ends here
 ******************************************************************************/
/**
 * Method for deducting Total discount from total amount.
 *
 * @param saleTx
 * @param totalAmt
 * @returns totalAmt
 */
function deductTotalDiscount(tx) {
    if (tx) {
        var totalAmt = tx.totalAmount;
        totalAmt -= ((saleTx.status == 'CANCELLED') ? -1 : 1) * getTotalDiscount(tx);
        //totalAmt -= getTotalDiscount(tx);
        return totalAmt;
    } else {
        //uilog("DBUG","saleTx is null. " + saleTx);
    }
}

/**
 * Method to get Total Markdown discount.
 */
function getTotalDiscount(saleTx) {
    var totalDiscount = 0;
    // calculate totalDiscount if saleTx.totalDiscount and/or
    // saleTx.voidedDiscount has value.
    console.log("total Discount before reduction : " + saleTx.totalDiscount);
    if (saleTx.totalDiscount && saleTx.totalDiscount > 0) {
        totalDiscount = saleTx.totalDiscount;
        // will deduct voidedDiscount from totalDiscount if has voided discount.
        if (saleTx.voidedDiscount && saleTx.voidedDiscount > 0) {
            totalDiscount -= saleTx.voidedDiscount;
        }

        if (saleTx.memberDiscReversal && saleTx.memberDiscReversal > 0) {
            totalDiscount -= saleTx.memberDiscReversal;
        }
    }
    totalDiscount = (saleTx.type == CONSTANTS.TX_TYPES.SALE_VOID.name) ? totalDiscount * -1 : totalDiscount;
    console.log("total Discount after reduction : " + totalDiscount);
    return totalDiscount;
}

/**
 * Method for Checking Available Pick Up amount.
 *
 * @param pickUpAmt
 * @returns {Boolean}
 */
function checkPickUpAmountValid(pickUpAmt,
    $amountConfirmDialog,
    $amountDialogConfirmInput,
    $amountDialogConfirmErrorMsg) {
    var totalCashSalesAndPickupAmt = getTotalCashSalesAndPickupAmount();

    var renderPickUp = false;
    var pickUpMsg = "";

    if (totalCashSalesAndPickupAmt &&
        pickUpAmt) {

        // Total cash sales
        var totalSalesAmount = totalCashSalesAndPickupAmt.left || 0;
        // Available amount for pickup
        var validPickupAmt = totalCashSalesAndPickupAmt.right || 0;

        /* If validPickupAmt is ZERO:
         * totalPickUpTransAmt IS EQUAL totalSalesAmount
         */
        var totalPickUpTransAmt = totalSalesAmount + validPickupAmt;
        // LOGGER, used only for development
        //uilog("DBUG","totalSalesAmount : " + totalSalesAmount);
        //uilog("DBUG","totalPickUpTransAmt : " + totalPickUpTransAmt);
        //uilog("DBUG","validPickupAmt : " + validPickupAmt);

        if (validPickupAmt == 0) {

            $amountConfirmDialog.dialog("close");
            //Cannot do PICKUP while Cash Sales is Zero.
            pickUpMsg = getConfigValue("PICKUP_MSG_1");
            if (totalSalesAmount > 0 &&
                totalSalesAmount == totalPickUpTransAmt) {
                //No more CASH available for PICKUP.
                pickUpMsg = getConfigValue("PICKUP_MSG_2");
            }
            showMsgDialog(pickUpMsg, "error", function() {
                $("div#numPad div#keyClr").triggerHandler('click');
            });
        } else {
            if (pickUpAmt > validPickupAmt) {
                // Maximum amount allowed to PICKUP is
                pickUpMsg = getConfigValue("PICKUP_MSG_3") + numberWithCommas(validPickupAmt) + ".";
                $amountDialogConfirmInput.val(numberWithCommas(validPickupAmt));
                $amountDialogConfirmErrorMsg.html(pickUpMsg);
            } else {
                renderPickUp = true;
            }
        }
    }
    return renderPickUp;
}

/**
 * Method to get Total Sales Amount and Pickup amount
 *
 * @returns totalSalesAmount
 */
function getTotalCashSalesAndPickupAmount() {
    var isHTTPStatusOK = false;
    var data = $.ajax({
        url: posWebContextPath + "/cashier/getTotalCashSalesAndPickupAmount",
        type: "GET",
        async: false,
        dataType: "json",
        offlineMsgPropKey: "pos_warning_offline_pickup_not_allowed",
        success: function(data, status) {
            isHTTPStatusOK = true;
        }
    }).responseText;
    return (isHTTPStatusOK) ? JSON.parse(data) : null;
}
/*******************************************************************************
 * PROMOTIONS START
 ******************************************************************************/

/**
 * Function that checks if any product in the item list has promotion
 * @param orderItems
 * @returns {Boolean}
 */
function anyProductHasPromotion(orderItems) {

    for (var num = 0; num < orderItems.length; num++) {

        if ((orderItems[num].productId in promotionsMap)) {
            return true;
        }
    }

    return false;

}

/**
 * Function that checks if the promotion time is valid
 * 
 * @param promotion
 * @param time
 * @param data
 * @returns {Boolean}
 */
function isValidPromoTime(promotion, time, data) {

    if (!promotion.startTime || !promotion.endTime) {
        return isValidPromoDate(promotion);
    }

    // 24 hour time format can be compared as string as long as HH:MM:SS format

    var currentDate = new Date();
    var hours = currentDate.getHours();
    var minutes = currentDate.getMinutes();

    if (hours < 10) {
        hours = "0" + hours;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    var scanTime = ((time) ? time : hours + ":" + minutes) + ":00";
    var startTime = promotion.startTime + ":00";
    var endTime = promotion.endTime + ":00";

    if (startTime < endTime && scanTime >= startTime && scanTime <= endTime) {
        return isValidPromoDate(promotion);

    } else if (startTime > endTime) {

        try {
            var startTimeArray = promotion.startTime.split(":");
            var endTimeArray = promotion.endTime.split(":");
            var scanTimeArray = scanTime.split(":");
            var startDate = new Date(promotion.startDate);
            var endDate = new Date(promotion.endDate);
            var scanDate = (time && (itemScanDatesMap[time + data.id])) ? (itemScanDatesMap[time + data.id]) : currentDate;

            endDate.setDate(endDate.getDate() + 1);
            startDate.setHours(parseInt(startTimeArray[0]), parseInt(startTimeArray[1]), 0, 0);
            endDate.setHours(parseInt(endTimeArray[0]), parseInt(endTimeArray[1]), 0, 0);
            scanDate.setHours(parseInt(scanTimeArray[0]), parseInt(scanTimeArray[1]), 0, 0);

            //check scan date time is within the date time period
            if (scanDate >= startDate && scanDate <= endDate) {
                if (scanTime < startTime) { //time is not null, for void item
                    startDate.setDate(scanDate.getDate() - 1);
                    endDate.setDate(scanDate.getDate());
                } else if (scanTime >= startTime) {
                    startDate.setDate(scanDate.getDate());
                    endDate.setDate(scanDate.getDate() + 1);
                }
            } else {
                return false;
            }

            //check against the new filter start date time and end date time
            if (scanDate >= startDate && scanDate <= endDate) {
                return true;
            }

        } catch (e) {
            uilog("DBUG", "Error in validating time");
        }
    }

    return false;

}

/**
 * Checks if promotion is valid on the current day
 *
 * @param promotion
 * @returns {Boolean}
 */
function isValidPromoDay(promotion) {
    var promoDays = promotion.promoDay;

    if (promoDays == "All") {
        return true;
    }

    var currentDate = new Date();
    var currentDay = currentDate.getDay();

    if (promoDays.indexOf(currentDay) != -1) {
        return true;
    }

    return false;
}

function isValidPromoDate(promotion) {

    var currentDate = new Date();
    var startDate = new Date(promotion.startDate);
    var endDate = new Date(promotion.endDate);

    currentDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (currentDate >= startDate && currentDate <= endDate) {
        return true;
    }

    return false;
}

/**
 * This method puts eligible promos in a temporary map
 *
 * @param orderItems
 * @param eligiblePromosMap
 */

function populateEligiblePromosMap(orderItems, initialPromos) {

    try {
        for (var num = 0; num < orderItems.length; num++) {
            //uilog("DBUG","PROCESSING ITEM NO#: " + num + "/" + orderItems.length);
            var eligiblePromos = [];

            if ((orderItems[num].productId in promotionsMap)) {
                var orderItemsPromos = cloneObject(promotionsMap[orderItems[num].productId]);
                for (var int = 0; int < orderItemsPromos.length; int++) {
                    var promo = cloneObject(orderItemsPromos[int]);

                    // buy n at promotion
                    if (promo.promotionType == CONSTANTS.PROMOTION_TYPES.BUY_N_AT_PROMOTION.type) {
                        // promo is valid
                        promo.qualifiedQuantity = orderItems[num].quantity;
                        if (promo.maxPromoQty <= orderItems[num].quantity) {
                            promo.qualifiedQuantity = promo.maxPromoQty;
                        }
                        eligiblePromos.push(promo);
                    } else if (promo.promotionType == CONSTANTS.PROMOTION_TYPES.BUY_N_GET_Y_PROMOTION.type) {
                        var mixAndMatchKey = promo.mixAndMatchCode.concat("-", promo.productId);
                        // buy n get y at promotion
                        if ((mixAndMatchKey in initialPromos.mixAndMatchPromoMap)) {
                            // qualified quantity is to be validated in
                            // validateMixAndMatchPromos
                            initialPromos.mixAndMatchPromoMap[mixAndMatchKey].qualifiedQuantity += orderItems[num].quantity;
                            initialPromos.mixAndMatchItemsMap[mixAndMatchKey]
                                .push(orderItems[num]);
                        } else {
                            var itemArray = [];
                            itemArray.push(orderItems[num]);
                            promo.qualifiedQuantity = orderItems[num].quantity;

                            initialPromos.mixAndMatchPromoMap[mixAndMatchKey] = promo;
                            initialPromos.mixAndMatchItemsMap[mixAndMatchKey] = itemArray;
                        }

                    } else if (promo.promotionType == CONSTANTS.PROMOTION_TYPES.SLIDING_DISCOUNT.type) {

                        var slidingInfo = getEligibleSlidingInfo(orderItems[num].quantity, promo.slidingDiscountInfo);
                        promo.discountType = promo.slidingDiscountType;
                        if (slidingInfo) {
                            promo.qualifiedQuantity = orderItems[num].quantity;
                            determineSlidingDiscount(promo, slidingInfo);
                            eligiblePromos.push(promo);
                        }
                    } else if (promo.promotionType == CONSTANTS.PROMOTION_TYPES.BUY_N_A_GET_Y_B_PROMOTION.type) {

                        if ((promo.promotionId in initialPromos.rewardPromosMap)) {
                            var rewardPromo = initialPromos.rewardPromosMap[promo.promotionId];

                            if (promo.itemType == CONSTANTS.PROMOTION_ITEM_TYPE.REWARD) {
                                rewardPromo.rewardItems.push(orderItems[num]);
                                transferPromoDetails(rewardPromo, promo);

                            } else if (promo.itemType == CONSTANTS.PROMOTION_ITEM_TYPE.QUALIFIER) {
                                rewardPromo.qualifierItem = !(rewardPromo.qualifierItem) ? orderItems[num] : rewardPromo.qualifierItem;
                                rewardPromo.promoDetails.pointPerUnit = promo.pointPerUnit;
                                rewardPromo.qualifierItems.push(orderItems[num]);
                            }

                        } else {
                            var rewardItems = [];

                            if (promo.itemType == CONSTANTS.PROMOTION_ITEM_TYPE.REWARD) {
                                rewardItems.push(orderItems[num]);
                            }

                            var rewardPromo = {
                                rewardItems: rewardItems,
                                qualifierItem: (promo.itemType == CONSTANTS.PROMOTION_ITEM_TYPE.QUALIFIER) ? orderItems[num] : null,
                                promoDetails: promo,
                                qualifierItems: (promo.itemType == CONSTANTS.PROMOTION_ITEM_TYPE.QUALIFIER) ? [orderItems[num]] : []
                            };

                            initialPromos.rewardPromosMap[promo.promotionId] = rewardPromo;
                        }
                    } else if (promo.promotionType == CONSTANTS.PROMOTION_TYPES.PURCHASE_WITH_PURCHASE.type) {
                        if ((promo.mixAndMatchCode in initialPromos.pwpPromosMap)) {
                            var pwpPromo = initialPromos.pwpPromosMap[promo.mixAndMatchCode];
                            console.log("pwpPromo populateEligiblePromosMap");
                            console.log(pwpPromo);
                            if (promo.itemType == CONSTANTS.PROMOTION_ITEM_TYPE.REWARD) {
                                pwpPromo.rewardItems.push(orderItems[num]);
                                pwpPromo.rta.push({ 'tier': promo.memberGroupCode, 'rta': promo.requiredPoint });
                                pwpPromo.rtaTolerance.push({ 'tier': promo.memberGroupCode, 'rtaTolerance': parseInt(((parseInt(promo.maximumPoint)) * parseInt(promo.requiredPoint)) / 100) });
                                if (promo.memberGroupCode < pwpPromo.rtaTier.low || pwpPromo.rtaTier.low == 0) pwpPromo.rtaTier.low = promo.memberGroupCode;
                                else if (promo.memberGroupCode > pwpPromo.rtaTier.high || pwpPromo.rtaTier.high == 0) pwpPromo.rtaTier.high = promo.memberGroupCode
                            } else if (promo.itemType == CONSTANTS.PROMOTION_ITEM_TYPE.QUALIFIER)
                                pwpPromo.qualifierItems.push(orderItems[num]);
                            pwpPromo.pwpPromos.push(promo);
                        } else {
                            /*var rewardPromo = {
                                    rewardItems: (promo.itemType == CONSTANTS.PROMOTION_ITEM_TYPE.REWARD) ? [orderItems[num]] : [],
                                    qualifierItems: (promo.itemType == CONSTANTS.PROMOTION_ITEM_TYPE.QUALIFIER) ? [orderItems[num]] : [],
                                    pwpPromos: [promo],
                                    rta: (promo.itemType == CONSTANTS.PROMOTION_ITEM_TYPE.REWARD) ? promo.requiredPoint : 0,
                                    rtaTolerance: (promo.itemType == CONSTANTS.PROMOTION_ITEM_TYPE.REWARD) ? parseInt(((100 - parseInt(promo.maximumPoint)) * parseInt(promo.requiredPoint)) / 100) : 0
                            };*/

                            var rewardPromo = {
                                rewardItems: (promo.itemType == CONSTANTS.PROMOTION_ITEM_TYPE.REWARD) ? [orderItems[num]] : [],
                                qualifierItems: (promo.itemType == CONSTANTS.PROMOTION_ITEM_TYPE.QUALIFIER) ? [orderItems[num]] : [],
                                pwpPromos: [promo],
                                rta: [],
                                rtaTolerance: [],
                                rtaTier: { 'low': 0, 'high': 0 }
                            };
                            if (promo.memberGroupCode && promo.memberGroupCode != '' && promo.itemType == CONSTANTS.PROMOTION_ITEM_TYPE.REWARD) {
                                rewardPromo.rta.push({ 'tier': promo.memberGroupCode, 'rta': promo.requiredPoint });
                                rewardPromo.rtaTolerance.push({ 'tier': promo.memberGroupCode, 'rtaTolerance': parseInt(((parseInt(promo.maximumPoint)) * parseInt(promo.requiredPoint)) / 100) });
                                rewardPromo.rtaTier.low = rewardPromo.rtaTier.high = promo.memberGroupCode;
                            }

                            initialPromos.pwpPromosMap[promo.mixAndMatchCode] = rewardPromo;
                        }
                    }
                }
            }

            // put all eligible promos in temp map
            if (eligiblePromos.length > 0 &&
                !(orderItems[num].productId in initialPromos.eligiblePromosMap)) {
                initialPromos.eligiblePromosMap[orderItems[num].productId] = eligiblePromos;
            }
        }
        //uilog("DBUG","INITIAL PROMO: " + JSON.stringify(initialPromos)); 
    } catch (e) {
        uilog("DBUG", "error in populateEligiblePromosMap");
    }
}

/**
 * Function that validates mix and match promos
 * 
 * @param orderItems
 * @param initialPromos
 * @returns
 */
function validateMixAndMatchPromos(orderItems, initialPromos) {
    // handle mix and match promos
    try {

        for (var j in initialPromos.mixAndMatchItemsMap) {
            var higherTotalQty = 0;

            for (var i in initialPromos.mixAndMatchPromoMap) {
                if (j == i) {
                    var mixAndMatchPromo = initialPromos.mixAndMatchPromoMap[i];
                    var items = initialPromos.mixAndMatchItemsMap[j];
                    var productId = "";

                    var mixQtyDetails = {
                        total: mixAndMatchPromo.qualifiedQuantity,
                        normalPriceQty: mixAndMatchPromo.normalPriceQty,
                        promoPriceQty: mixAndMatchPromo.promoPriceQty
                    };
                    var promoQty = determinePromoQty(mixQtyDetails);

                    for (var int = 0; int < items.length; int++) {
                        if (higherTotalQty < items[int].quantity) {
                            higherTotalQty = items[int].quantity;
                            productId = items[int].productId;
                        }
                    }

                    if (promoQty && promoQty > 0) {
                        mixAndMatchPromo.qualifiedQuantity = promoQty;

                        addToEligiblePromosMap(productId, mixAndMatchPromo,
                            initialPromos);
                    }
                }
            }

        }

        // for ( var num = 0; num < orderItems.length; num++) {
        // for ( var i in initialPromos.mixAndMatchPromoMap) {
        // var mixAndMatchPromo = initialPromos.mixAndMatchPromoMap[i];
        //
        // var mixQtyDetails = {
        // total: mixAndMatchPromo.qualifiedQuantity,
        // normalPriceQty: mixAndMatchPromo.normalPriceQty,
        // promoPriceQty: mixAndMatchPromo.promoPriceQty
        // };
        //
        // var promoQty = determinePromoQty(mixQtyDetails);
        //
        // if(promoQty && promoQty > 0){
        // mixAndMatchPromo.qualifiedQuantity = promoQty;
        // addToEligiblePromosMap(orderItems[num].productId, mixAndMatchPromo,
        // initialPromos);
        // }
        // }
        // }
    } catch (e) {
        uilog("DBUG", "error in validateMixAndMatchPromos");
    }
}

/**
 * Function that refresh promotion related variables
 * 
 * @param refreshAll
 * @returns
 */
function refreshPromotion(refreshAll) {

    if (saleTx) {
        saleTx.totalDiscount -= promoDiscount;
        // remove 2nd layer discount distributed per item
        for (var i in saleTx.orderItems) {
            saleTx.orderItems[i].secondLayerDiscountAmount = 0;
            saleTx.orderItems[i].qtyWithSecondLayerDiscount = 0;
        }
    }

    promoDiscount = 0;
    calculatePromotion = true;

    // applicablePromoMap = {};
    promotionItems = [];

    if (refreshAll) {
        promotionsMap = {};
        memberPromos = {};
        coBrandDiscountStatus = null;
        itemScanDatesMap = {};

        if (!DrawerModule.isConnected) {
            promptSysMsg("Warning: Cash Drawer is disconnected.");
        }
    }
}

/**
 * This method finds the applicable sliding discount for a given item quantity.
 *
 * @param itemQuantity
 * @param slidingInfo
 * @returns {slidingDiscountInfo object}
 */
function getEligibleSlidingInfo(itemQuantity, slidingInfo) {

    var infoArray = [];
    var slidingDiscountInfo = null;
    var mode = getConfigValue("SLIDING_DISCOUNT_MODE");
    var isValid = false;

    try {
        for (var i = 0; i < slidingInfo.length; i++) {
            infoArray.push(slidingInfo[i]);
        }

        var fromQty = 0;
        var toQty = 0;
        var discount = "0";

        for (var i = 0; i < infoArray.length; i++) {

            if (infoArray[i]) {
                var info = infoArray[i].split(",");

                fromQty = parseFloat(info[0]);
                toQty = parseFloat(info[1]);
                discount = info[2];
            }

            isValid = (mode == CONSTANTS.SLIDING_PROMOTION_MODE.TP_LINUX) ? (itemQuantity >= toQty) :
                (itemQuantity >= fromQty && itemQuantity <= toQty);

            if (isValid || (i === (infoArray.length - 1) && itemQuantity > toQty)) {

                slidingDiscountInfo = {
                    from: fromQty,
                    to: toQty,
                    discount: discount
                };
            }

        }
    } catch (e) {
        uilog("DBUG", "Error in getting sliding discount info");
    }

    return slidingDiscountInfo;
}

/**
 * Function that validates the target group of the promotion
 * 
 * @param promotion
 * @returns {Boolean}
 */
function isValidTargetGroup(promotion, promoToSearch) {

    var isValid = true;

    if (promotion.targetGroup === CONSTANTS.PROMOTION_TARGET_GRP.MEMBER) {
        isValid = promoToSearch.subtype ? true : false;
    }

    return isValid;
}

/**
 * Function that retrieves a single promotion given a promo type. This is used for automatic markdown and
 * member discount
 *
 * @param data
 * @param promoType
 * @returns promo {object}
 */
function getSinglePromo(data, promoToSearch, time) {

    if (toggleTVS) {
        return null;
    }

    var validPromos = [];
    validPromos = PROMOTIONS.getValidPromos(data, promoToSearch, time);

    var promo = getLatestValidPromo(validPromos);
    // CR ADD DISCOUNT
    if (typeof promo != 'undefined' && promo.length > 0 && promoToSearch != CONSTANTS.PROMOTION_TYPES.PURCHASE_WITH_PURCHASE &&
        promoToSearch != CONSTANTS.PROMOTION_TYPES.ADDITIONAL_DISCOUNT)
        promo = promo.pop();
    // CR ADD DISCOUNT	
    //get latest valid promo
    return promo;

}

/**
 * Function that determines if the promotion type is layer 2
 * 
 * @param promotionType
 * @returns
 */
function isLayerTwoPromo(promotionType) {

    if (promotionType == CONSTANTS.PROMOTION_TYPES.MEMBER_COBRAND_PROMOTION.type ||
        promotionType == CONSTANTS.PROMOTION_TYPES.MEMBER_CRM_PROMOTION.type ||
        promotionType == CONSTANTS.PROMOTION_TYPES.AUTOMATIC_MARKDOWN.type) {
        return false;
    }

    return true;

}

/**
 * Function that validates the promotion date and time and day 
 * 
 * @param promotion
 * @param time
 * @param data
 * @returns {Boolean}
 */
function isValidPromoDateTime(promotion, time, data) {
    var bValidPromoTime = time ? isValidPromoTime(promotion, time, data) :
        isValidPromoTime(promotion);
    return bValidPromoTime &&
        isValidPromoDay(promotion);
}


/**
 * Function that determine the sliding discount type
 *
 * @param promo
 * @param slidingInfo
 */
function determineSlidingDiscount(promo, slidingInfo) {

    if (promo.slidingDiscountType == CONSTANTS.PROMOTION_DISCOUNT_TYPES.PERCENT_DISCOUNT) {
        promo.percentDiscount = slidingInfo.discount;
    } else if (promo.slidingDiscountType == CONSTANTS.PROMOTION_DISCOUNT_TYPES.AMOUNT_OFF) {
        promo.amountOff = slidingInfo.discount;
    } else if (promo.slidingDiscountType == CONSTANTS.PROMOTION_DISCOUNT_TYPES.PROMO_SELLING_PRICE) {
        promo.promoSellingPrice = slidingInfo.discount;
    }
}

/**
 * Function that determines qualified quantity for mix and match promos, reward promos
 * 
 * @param mixQtyDetails
 */

function determinePromoQty(mixQtyDetails) {

    var qualifiedPromoQty = 0;

    if ((mixQtyDetails.total - mixQtyDetails.normalPriceQty) > 0) {

        var total = mixQtyDetails.total;

        while (total > 0) {
            total -= mixQtyDetails.normalPriceQty;
            if (total > 0) {
                if (total < mixQtyDetails.promoPriceQty) {
                    qualifiedPromoQty += total;
                    break;
                } else {
                    qualifiedPromoQty += mixQtyDetails.promoPriceQty;
                    total -= mixQtyDetails.promoPriceQty;
                }
            }
        }
    }

    return qualifiedPromoQty;
}

/**
 * Function that validates reward promos
 *
 * @param orderItems
 * @param initialPromos
 */
function validateRewardPromos(initialPromos) {

    try {
        for (var i in initialPromos.rewardPromosMap) {
            var rewardPromo = initialPromos.rewardPromosMap[i];

            if (rewardPromo.rewardItems.size == 0 || !rewardPromo.qualifierItem) {
                continue;
            }

            var promoQty = 0,
                multiplier = 0,
                maxRewardQty = 0,
                highestTotalDiscount = 0,
                qualifierQuantity = 0;
            var reward;


            //multiple qualifiers
            for (var i in rewardPromo.qualifierItems) {
                qualifierQuantity += rewardPromo.qualifierItems[i].quantity;
            }

            qualifierQuantity = qualifierQuantity * rewardPromo.promoDetails.pointPerUnit;

            multiplier = Math.floor(qualifierQuantity / rewardPromo.promoDetails.requiredPoint);
            //maxRewardQty = multiplier * rewardPromo.promoDetails.maximumPoint;
            maxRewardQty = multiplier * 1;

            //obtain the highest discounted reward item
            for (var i in rewardPromo.rewardItems) {
                var rewardItem = rewardPromo.rewardItems[i];
                var discount = 0,
                    qty = 0;

                if (maxRewardQty > 0) {
                    qty = (maxRewardQty < rewardItem.quantity) ? maxRewardQty : rewardItem.quantity;
                }

                discount = PROMOTIONS.calculateDiscount(rewardPromo.promoDetails, rewardItem.priceUnit, qty);

                if (discount > highestTotalDiscount) {
                    highestTotalDiscount = discount;
                    reward = rewardItem;
                    promoQty = qty;
                }
            }

            // this is if maximum is applied
            if ((rewardPromo.qualifierItemQty * rewardPromo.promoDetails.pointPerUnit) >= rewardPromo.promoDetails.requiredPoint) {
                promoQty = (rewardPromo.rewardItemQty >= rewardPromo.promoDetails.maximumPoint) ? rewardPromo.promoDetails.maximumPoint : rewardPromo.rewardItemQty;
            }


            if (promoQty && promoQty > 0) {
                rewardPromo.promoDetails.qualifiedQuantity = promoQty;
                addToEligiblePromosMap(reward.productId, rewardPromo.promoDetails, initialPromos);
            } else {
                delete rewardPromo[i];
            }
        }

    } catch (e) {
        uilog("DBUG", "error in validateRewardPromos");
    }
}

/**
 * Function that adds the eligible promo to eligiblePromosMap
 *
 * @param id
 * @param promoToAdd
 * @param initialPromos
 */
function addToEligiblePromosMap(id, promoToAdd, initialPromos) {

    if (!(id in initialPromos.eligiblePromosMap)) {
        var eligiblePromos = [];
        eligiblePromos.push(promoToAdd);
        initialPromos.eligiblePromosMap[id] = eligiblePromos;
    } else {
        initialPromos.eligiblePromosMap[id].push(promoToAdd);
    }
}

/**
 * Function that process the layer 2 promotion
 * @returns
 */
function processLayerTwoPromotions() {
    //if(isDeptstore) return false; //layer two valid for deptstore also 
    //var orderItems = ((typeof saleObj != 'undefined') ? getSummarizeSaleItems(saleObj) : getSummarizeSaleItems(saleTx));
    //var tempSale = (typeof saleObj != 'undefined') ;

    //uilog("DBUG","ORDER ITEM: " + JSON.stringify(orderItems));

    var orderItems = getSummarizeSaleItems(saleTx);
    if (orderItems && anyProductHasPromotion(orderItems) && !redeemPointTrk && !saleGameItemTrk) {

        var initialPromos = {
            eligiblePromosMap: {},
            mixAndMatchPromoMap: {},
            rewardPromosMap: {},
            mixAndMatchItemsMap: {},
            pwpPromosMap: {}
        };

        var totalDiscPerItemMap = {};
        var totalDiscPerItemMapWithoutMember = {};
        var totalQtyWithDiscMap = {};

        populateEligiblePromosMap(orderItems, initialPromos);
        validateMixAndMatchPromos(orderItems, initialPromos);
        validateRewardPromos(initialPromos);

        //calculate for the total Discount

        for (var int2 = 0; int2 < orderItems.length; int2++) {
            var promoOrderItem = cloneObject(orderItems[int2]);

            if ((promoOrderItem.productId in initialPromos.eligiblePromosMap)) {

                var maxTotalDiscount = 0;
                var eligiblePromos = cloneObject(initialPromos.eligiblePromosMap[orderItems[int2].productId]);
                var highestDiscountPromo = null;
                var totalSecondLayerDiscount = 0,
                    totalSecondLayerDiscountWithoutMember = 0;
                var hasSlidingDiscount = false;
                var qtyDiscount = 0;

                //highest total discount is considered applicable for layer 2 promo (excl. sliding promo)
                for (var int3 = 0; int3 < eligiblePromos.length; int3++) {
                    var promo = cloneObject(eligiblePromos[int3]);
                    var itemTotalDiscount = promoOrderItem.discountAmount ? promoOrderItem.discountAmount : 0;
                    var itemTotalMemDiscount = promoOrderItem.memberDiscountAmount ? promoOrderItem.memberDiscountAmount : 0;

                    //recalculate price unit for overlapping discounts
                    promoOrderItem.priceDiscountWithoutMember = promoOrderItem.priceUnit - Math.round(itemTotalDiscount / promoOrderItem.quantity);
                    orderItems[int2].priceDiscountWithoutMember = promoOrderItem.priceDiscountWithoutMember;
                    promoOrderItem.priceUnit -= Math.round(((itemTotalDiscount / promoOrderItem.quantity) +
                        (itemTotalMemDiscount / promoOrderItem.quantity)));

                    var totalDiscount = Math.round(PROMOTIONS.calculateDiscount(promo, promoOrderItem.priceUnit, null));
                    var totalDiscountWithoutMember = Math.round(PROMOTIONS.calculateDiscount(promo, promoOrderItem.priceDiscountWithoutMember, null));

                    //sliding discount can overlap with any layer 2 discounts
                    if (promo.promotionType == CONSTANTS.PROMOTION_TYPES.SLIDING_DISCOUNT.type) {
                        promotionItems.push(createPromotItemObj(totalDiscount, promo, promoOrderItem, null, totalDiscountWithoutMember));
                        totalSecondLayerDiscount += totalDiscount;
                        totalSecondLayerDiscountWithoutMember += totalDiscountWithoutMember;
                        hasSlidingDiscount = true;
                    } else if (maxTotalDiscount < totalDiscount) {
                        maxTotalDiscount = totalDiscount;
                        //applicablePromoMap[orderItems[int2].productId] = promo;
                        highestDiscountPromo = cloneObject(promo);
                    }
                }

                if (highestDiscountPromo) {
                    totalSecondLayerDiscount += maxTotalDiscount;
                    totalSecondLayerDiscountWithoutMember += totalDiscountWithoutMember;
                    var rewardPromoDetails = initialPromos.rewardPromosMap[highestDiscountPromo.promotionId];
                    qtyDiscount = highestDiscountPromo.qualifiedQuantity;
                    promotionItems.push(createPromotItemObj(maxTotalDiscount, highestDiscountPromo, promoOrderItem, rewardPromoDetails, totalDiscountWithoutMember));
                }

                if (hasSlidingDiscount)
                    qtyDiscount = orderItems[int2].quantity;

                totalDiscPerItemMap[orderItems[int2].productId] = Math.round(totalSecondLayerDiscount / qtyDiscount);
                totalQtyWithDiscMap[orderItems[int2].productId] = qtyDiscount;
                totalDiscPerItemMapWithoutMember[orderItems[int2].productId] = Math.round(totalSecondLayerDiscountWithoutMember / qtyDiscount);
                promoDiscount += totalSecondLayerDiscount;
            }
        }
        uilog('DBUG', 'promotionItems:' + JSON.stringify(promotionItems));
        //distributeLayerTwoDiscounts(saleTx, totalDiscPerItemMap, totalQtyWithDiscMap, totalDiscPerItemMapWithoutMember);

        pendingPwpPromo = {};
        if (saleTx.eftTransactionType != CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO && initialPromos.pwpPromosMap && Object.keys(initialPromos.pwpPromosMap).length > 0) {
            for (var p in initialPromos.pwpPromosMap) {
                var pwpPromo = initialPromos.pwpPromosMap[p];
                var rewardExist = true;
		// if rta still 0, then no rewards is bought, then add to popup
                if (pwpPromo.rta.length == 0) {
                    uilog('INFO', 'PWP: No Reward Bought');
                    rewardExist = false;
                }

                var eligibleRta = 0,
                    eligibleRtaWithoutMember = 0,
                    eligibleRtaOriginal = 0,
                    eligibleRtaOriginalWithoutMember = 0;

                for (var pp in pwpPromo.qualifierItems) {
                    eligibleRtaOriginal += (pwpPromo.qualifierItems[pp].priceSubtotal -
                        pwpPromo.qualifierItems[pp].discountAmount -
                        pwpPromo.qualifierItems[pp].memberDiscountAmount -
                        pwpPromo.qualifierItems[pp].discBtnAmount -
                        pwpPromo.qualifierItems[pp].crmMemberDiscountAmount);

                    if (totalDiscPerItemMap[pwpPromo.qualifierItems[pp].productId] > 0)
                        eligibleRtaOriginal -= totalDiscPerItemMap[pwpPromo.qualifierItems[pp].productId] * totalQtyWithDiscMap[pwpPromo.qualifierItems[pp].productId];
                    eligibleRtaOriginalWithoutMember += pwpPromo.qualifierItems[pp].memberDiscountAmount;
                }

                //if(!rewardExist || (eligibleRta < pwpPromo.rta))
                if (!rewardExist) {
                    // REQUEST TO BACKEND TO GET PWP ITEM LIST
                    $.ajax({
                        url: posWebContextPath + "/product/getPWPList/" + p,
                        type: "GET",
                        async: false,
                        dataType: "json",
                        contentType: "application/json",
                        success: function(data, status) {
                            if (eligibleRtaOriginal >= data.rtaTolerance) {
                                pendingPwpPromo[p] = data;
                                pendingPwpPromo[p].eligibleRta = eligibleRtaOriginal;
                            }
                        },
                        error: function(jqXHR, status, error) {
                            uilog("DBUG", error);
                        }
                    });
                } else {
                    // CALCULATE THE PWP REWARDS
                    // CHECK PRIORITY
                    delete pendingPwpPromo[p];
                    var currentTier = (pwpPromo.rtaTier.high > 0) ? pwpPromo.rtaTier.high : pwpPromo.rtaTier.low;

                    while (currentTier > 0) {
                        eligibleRta = eligibleRtaOriginal;
                        var pwpRewardPromoPriority = null;
                        var pwpRewardPromoBiggest = null;
                        var rewardItem = null;
                        var rewardItemPriority = null;
                        var rewardItemBiggest = null;
                        var eligibleRtaReward = 0;

                        var currentRta = 0;
                        var currentRtaTolerance = 0;
                        for (var rt in pwpPromo.rta) {
                            if (pwpPromo.rta[rt].tier == currentTier) {
                                currentRta = pwpPromo.rta[rt].rta;
                                break;
                            }
                        }

                        for (var rt in pwpPromo.rtaTolerance) {
                            if (pwpPromo.rtaTolerance[rt].tier == currentTier) {
                                currentRtaTolerance = pwpPromo.rtaTolerance[rt].rtaTolerance;
                                break;
                            }
                        }

                        if (currentRta == 0) { currentTier--; continue; }

                        for (var r in pwpPromo.pwpPromos) {
                            if (pwpPromo.pwpPromos[r].itemType == '1' || pwpPromo.pwpPromos[r].memberGroupCode != currentTier) continue;
                            eligibleRtaReward = 0;
                            var reward = pwpPromo.pwpPromos[r];

                            for (var ri in pwpPromo.rewardItems) {
                                if (pwpPromo.rewardItems[ri].ean13Code == reward.ean13code) {
                                    rewardItem = pwpPromo.rewardItems[ri];
                                    break;
                                }
                            }

                            if (reward.slidingDiscountType == '1') {
                                eligibleRtaReward = (rewardItem.priceSubtotal -
                                    rewardItem.discountAmount -
                                    rewardItem.memberDiscountAmount -
                                    rewardItem.discBtnAmount -
                                    rewardItem.crmMemberDiscountAmount);

                                if (totalDiscPerItemMap[rewardItem.productId] > 0)
                                    eligibleRtaReward -= totalDiscPerItemMap[rewardItem.productId] * totalQtyWithDiscMap[rewardItem.productId];
                            }
                            eligibleRta += eligibleRtaReward;
                            eligibleRtaWithoutMember += rewardItem.memberDiscountAmount;

                            // PWP PRIORITY CHECK
                            if ((!pwpRewardPromoPriority && reward.pointPerUnit && reward.pointPerUnit != '0') ||
                                (pwpRewardPromoPriority && reward.pointPerUnit && reward.pointPerUnit != '0' &&
                                    (reward.pointPerUnit < pwpRewardPromoPriority.pointPerUnit))
                            ) {
                                pwpRewardPromoPriority = reward;
                                rewardItemPriority = rewardItem;
                            }

                            var itemDiscount = Math.round(PROMOTIONS.calculateDiscount(
                                reward,
                                rewardItem.priceUnit - parseInt((rewardItem.memberDiscountAmount + rewardItem.discountAmount) / rewardItem.quantity),
                                1,
                                null
                            ));

                            var itemDiscountWithoutMember = Math.round(PROMOTIONS.calculateDiscount(
                                reward,
                                rewardItem.priceUnit - parseInt((rewardItem.discountAmount) / rewardItem.quantity),
                                1,
                                null
                            ));

                            uilog('DBUG', 'PWP BIGGEST: ' + JSON.stringify(pwpRewardPromoBiggest));
                            // PWP BIGGEST CHECK
                            if (!pwpRewardPromoBiggest ||
                                //(pwpRewardPromoBiggest && (rewardItem.currentPrice - reward.promoSellingPrice) > pwpRewardPromoBiggest.discountAmount)
                                (pwpRewardPromoBiggest && (itemDiscount > pwpRewardPromoBiggest.discountAmount))
                            ) {
                                pwpRewardPromoBiggest = reward;
                                //pwpRewardPromoBiggest.discountAmount = (rewardItem.currentPrice - reward.promoSellingPrice);
                                pwpRewardPromoBiggest.discountAmount = itemDiscount;
                                rewardItemBiggest = rewardItem;
                            }
                        }

                        var totalPwpDiscount = 0,
                            totalPwpDiscountWithoutMember = 0;
                        var pwpRewardPromo = null;
                        if (pwpRewardPromoPriority) {
                            pwpRewardPromo = pwpRewardPromoPriority;
                            rewardItem = rewardItemPriority;
                        } else {
                            uilog('DBUG', 'PWP Biggest: ' + JSON.stringify(pwpRewardPromoBiggest));
                            pwpRewardPromo = pwpRewardPromoBiggest;
                            rewardItem = rewardItemBiggest;
                        }

                        var eligibleQty = parseInt(eligibleRta / currentRta);
                        if (eligibleQty > rewardItem.quantity) eligibleQty = rewardItem.quantity;

                        var qtyDiscount = (eligibleQty > pwpRewardPromo.maxPromoQty) ? pwpRewardPromo.maxPromoQty : eligibleQty;

                        totalPwpDiscount = Math.round((isWeightSupplied(rewardItem) ? qtyDiscount : 1) * Math.round(PROMOTIONS.calculateDiscount(
                            pwpRewardPromo,
                            rewardItem.priceUnit - parseInt((rewardItem.memberDiscountAmount + rewardItem.discountAmount) / rewardItem.quantity),
                            qtyDiscount,
                            isWeightSupplied(rewardItem)
                        )));

                        totalPwpDiscountMember = Math.round((isWeightSupplied(rewardItem) ? qtyDiscount : 1) * Math.round(PROMOTIONS.calculateDiscount(
                            pwpRewardPromo,
                            rewardItem.priceUnit - parseInt(rewardItem.discountAmount / rewardItem.quantity),
                            qtyDiscount,
                            isWeightSupplied(rewardItem)
                        )));

                        uilog('DBUG', 'PWP Eligible:' + JSON.stringify(eligibleRta) + ' REWARD: ' + JSON.stringify(reward));
                        if (eligibleRta < currentRta) {
                            uilog('INFO', 'PWP Cancel: Eligible RTA = ' + eligibleRta + '; RTA = ' + currentRta + ' Tier: ' + currentTier + ' Tolerance: ' + currentRtaTolerance + ' low:' + pwpPromo.rtaTier.low);

                            if (eligibleRta >= currentRtaTolerance && currentTier == pwpPromo.rtaTier.low) {
                                // REQUEST TO BACKEND TO GET PWP ITEM LIST
                                $.ajax({
                                    url: posWebContextPath + "/product/getPWPList/" + p,
                                    type: "GET",
                                    async: false,
                                    dataType: "json",
                                    contentType: "application/json",
                                    success: function(data, status) {
                                        pendingPwpPromo[p] = data;
                                        pendingPwpPromo[p].eligibleRta = eligibleRta;
                                    },
                                    error: function(jqXHR, status, error) {
                                        uilog("ERRO", error);
                                    }
                                });
                            }

                            currentTier--;
                        } else {
                            if (eligibleRtaReward > 0) {
                                //console.log(eligibleRta + ' ' + totalPwpDiscount);
                                //eligibleRta -= totalPwpDiscount;

                                if (eligibleRta < currentRta) {
                                    //console.log('PWP NOT IMPLEMENTED: eligible ' + eligibleRta + ' eligiblertareward: ' + eligibleRtaReward + ' Tolerance: ' + currentRtaTolerance + ' totalPwpDiscount:' + totalPwpDiscount + ' current tier:' + currentTier + ' pwppromo:' + pwpPromo.rtaTier.low);
                                    if (eligibleRta >= currentRtaTolerance && currentTier == pwpPromo.rtaTier.low) {
                                        // REQUEST TO BACKEND TO GET PWP ITEM LIST
                                        $.ajax({
                                            url: posWebContextPath + "/product/getPWPList/" + p,
                                            type: "GET",
                                            async: false,
                                            dataType: "json",
                                            contentType: "application/json",
                                            success: function(data, status) {
                                                pendingPwpPromo[p] = data;
                                                pendingPwpPromo[p].eligibleRta = eligibleRta;
                                            },
                                            error: function(jqXHR, status, error) {
                                                uilog("ERRO", error);
                                            }
                                        });
                                    }

                                    currentTier--;
                                    continue;
                                }
                            }

                            uilog('INFO', 'PWP Implemented: Eligible RTA = ' + eligibleRta + '; RTA = ' + currentRta + ' Tier: ' + currentTier);

                            pwpRewardPromo.qualifiedQuantity = qtyDiscount;
                            promotionItems.push(createPromotItemObj(totalPwpDiscount, pwpRewardPromo, rewardItem, null, totalPwpDiscountWithoutMember));

                            totalDiscPerItemMap[rewardItem.productId] = Math.round(totalPwpDiscount / qtyDiscount);
                            totalQtyWithDiscMap[rewardItem.productId] = qtyDiscount;
                            totalDiscPerItemMapWithoutMember[rewardItem.productId] = Math.round(totalPwpDiscountMember / qtyDiscount);
                            promoDiscount += totalPwpDiscount;

                            //uilog('DBUG', 'PWP Eligible:' + JSON.stringify(promotionItems));
                            uilog('DBUG', 'PWP Disc Per item:' + JSON.stringify(totalDiscPerItemMap));
                            uilog('DBUG', 'PWP Qty Per item:' + JSON.stringify(totalQtyWithDiscMap));
                            break;
                        }
                    }
                }
            }
        }
        distributeLayerTwoDiscounts(saleTx, totalDiscPerItemMap, totalQtyWithDiscMap, totalDiscPerItemMapWithoutMember);
    }
}
/**
 * Function that creates promotion item DTO
 * 
 * @param totalDiscount
 * @param promo
 * @param orderItem
 * @param rewardPromoDetails
 * @returns promoItem
 */
function createPromotItemObj(totalDiscount, promo, orderItem,
    rewardPromoDetails, totalDiscountWithoutCMC) {

    var promoItem = {
        totalDiscount: totalDiscount,
        totalDiscountWithoutCMC: totalDiscountWithoutCMC,
        itemQuantity: promo.qualifiedQuantity,
        type: promo.promotionType,
        itemDesc: orderItem.shortDesc,
        priceUnit: orderItem.priceUnit,
        priceDiscountWithoutMember: orderItem.priceDiscountWithoutMember,
        label: PROMOTIONS.getPromoLabel(promo, orderItem, totalDiscount,
            rewardPromoDetails),
        productId: orderItem.productId
    };

    return promoItem;
}

/**
 * Function that gets the discounted unit price
 * @param origPrice
 * @param totalDiscount
 * @param totalQualifiedQty
 * @returns discountedUnitPrice
 */
function getDiscountedUnitPrice(origPrice, totalDiscount, totalQualifiedQty) {
    return numberWithCommas((origPrice) - (totalDiscount / totalQualifiedQty));
}

/**
 * Function that transfers reward promo details to rewardPromo object
 * 
 * @param rewardPromo
 * @param promo
 * @returns
 */
function transferPromoDetails(rewardPromo, promo) {

    rewardPromo.promoDetails.requiredPoint = promo.requiredPoint;
    rewardPromo.promoDetails.maximumPoint = promo.maximumPoint;
    rewardPromo.promoDetails.percentDiscount = promo.percentDiscount;
    rewardPromo.promoDetails.amountOff = promo.amountOff;
    rewardPromo.promoDetails.promoSellingPrice = promo.promoSellingPrice;
    rewardPromo.promoDetails.discountType = promo.discountType;
}

/**
 * Checks if BIN number is found on the product promotion table
 *
 * @param coBrandNumber
 * @returns
 */
function determineCoBrandDiscountStatus(coBrandNumber) {
    var cobrandPromotionNumber = coBrandNumber.substring(0, 6);

    /*if(connectionOnline){
    	coBrandDiscountStatus = getConfigValue("COBRAND_OFFLINE");
    	promptSysMsg();
    	return coBrandDiscountStatus;
    }*/

    //uilog("DBUG","COBRAND ENABLED? " + enableCoBrand);
    // coBrandDiscountStatus =  getConfigValue("COBRAND_DISCOUNT_ON");
    // console.log("==========" + coBrandDiscountStatus)
    if (enableCoBrand) {
        $.ajax({
            url: posWebContextPath + "/product/doesCoBrandContainsDiscount/" + cobrandPromotionNumber,
            type: "GET",
            async: false,
            dataType: "json",
            contentType: "application/json",
            success: function(response) {
                coBrandDiscountStatus = response ? getConfigValue("COBRAND_DISCOUNT_ON") : getConfigValue("COBRAND_DISCOUNT_OFF");
                uilog("DBUG", "coBrandResponse 6 digit try: " + coBrandDiscountStatus);
                if (!response) {
                    $.ajax({
                        url: posWebContextPath + "/product/doesCoBrandContainsDiscount/" + coBrandNumber.substring(0, 8),
                        type: "GET",
                        async: false,
                        dataType: "json",
                        contentType: "application/json",
                        success: function(response) {
                            coBrandDiscountStatus = response ? getConfigValue("COBRAND_DISCOUNT_ON") : getConfigValue("COBRAND_DISCOUNT_OFF");
                            uilog("DBUG", "coBrandResponse 8 digit try: " + coBrandDiscountStatus);
                        },
                        error: function(jqXHR, status, error) {
                            if (error == 'SERVER_OFFLINE') {
                                coBrandDiscountStatus = getConfigValue("COBRAND_OFFLINE");
                            } else {
                                coBrandDiscountStatus = getConfigValue("COBRAND_DISCOUNT_OFF");
                            }
                        }
                    });
                }
            },
            error: function(jqXHR, status, error) {
                if (error == 'SERVER_OFFLINE') {
                    coBrandDiscountStatus = getConfigValue("COBRAND_OFFLINE");
                } else {
                    coBrandDiscountStatus = getConfigValue("COBRAND_DISCOUNT_OFF");
                }
            }
        });
    } else coBrandDiscountStatus = getConfigValue("COBRAND_DISCOUNT_OFF");

    promptSysMsg();
    return coBrandDiscountStatus;
}

/**
 * Function that displays the cobrand status in the cashier screen
 * @returns
 */
function displayCoBrandStatus() {

    if (coBrandDiscountStatus) {
        if (coBrandDiscountStatus == getConfigValue("COBRAND_DISCOUNT_OFF")) {
            $("#systemMessageDiv").append($("<h4></h4>").text(coBrandDiscountStatus).css("color", "red"));
        } else {
            $("#systemMessageDiv").append($("<h4></h4>").text(coBrandDiscountStatus));
        }
    } else {
        $("#systemMessageDiv").append($("<h4></h4>").text("CO-BRAND CARD ENTERED"));
    }
}

function displayKidcityStatus() {

    if (kidcityEnable) {
        if (kidcityEnableStatus == "KIDCITY ON") {
            $("#systemMessageDiv").append($("<h4></h4>").text(kidcityEnableStatus).css("color", "red"));
        } else {
            $("#systemMessageDiv").append($("<h4></h4>").text(kidcityEnableStatus));
        }
    } else {
        $("#systemMessageDiv").append($("<h4></h4>").text(kidcityEnableStatus));
    }
}

/**
 * Function that distributes layer 2 discounts to applicable items
 * 
 * @param saleTx
 * @param totalDiscPerItemMap
 * @param totalQtyWithDiscMap
 * @returns
 */
function distributeLayerTwoDiscounts(saleTx, totalDiscPerItemMap, totalQtyWithDiscMap, totalDiscPerItemMapWithoutMember) {

    var recomputeEmpDisc = false;
    for (var i in saleTx.orderItems) {
        var orderItem = saleTx.orderItems[i];
        if (orderItem.salesType == CONSTANTS.TX_TYPES.SALE.name &&
            totalDiscPerItemMap[orderItem.productId] && totalQtyWithDiscMap[orderItem.productId] > 0 &&
            !orderItem.isVoided && !orderItem.allvoided) {
            var qtyWithDisc = totalQtyWithDiscMap[orderItem.productId] > orderItem.quantity ? orderItem.quantity : totalQtyWithDiscMap[orderItem.productId];
            orderItem.qtyWithSecondLayerDiscount = qtyWithDisc;
            orderItem.secondLayerDiscountAmount = totalDiscPerItemMap[orderItem.productId] * qtyWithDisc;
            orderItem.secondLayerDiscountAmountWithoutMember = totalDiscPerItemMapWithoutMember[orderItem.productId] * qtyWithDisc;
            //console.log(orderItem.productId + ':' + totalDiscPerItemMapWithoutMember[orderItem.productId] + ' ' + qtyWithDisc);
            totalQtyWithDiscMap[orderItem.productId] -= qtyWithDisc;

            recomputeEmpDisc = recomputeEmpDisc || (saleTx.employeeDiscountToggled && orderItem.discBtnApplied);
            if (saleTx.employeeDiscountToggled && orderItem.discBtnApplied) {
                // revert employee discount of current item and recompute later
                if (orderItem.salesType == CONSTANTS.TX_TYPES.SALE_VOID.name) {
                    saleTx.voidedDiscount -= orderItem.discBtnAmount;
                } else if (orderItem.salesType == CONSTANTS.TX_TYPES.SALE.name) {
                    saleTx.totalDiscount -= orderItem.discBtnAmount;
                }
                orderItem.discBtnAmount = 0;
                orderItem.discBtnApplied = false;
            }
        }
    }

    // If there are changes in layer 2 promotions, recompute employee discount
    if (recomputeEmpDisc) {
        applyEmployeeDiscount();
    }
}

function calculateTotalMemberDiscount(saleTxObj) {

    var summarizedOrderItems = (saleTxObj) ? getSummarizeSaleItems(saleTxObj) :
        getSummarizeSaleItems(saleTx);
    var totalMemberDiscount = 0;
    for (var i in summarizedOrderItems) {
        var orderItem = summarizedOrderItems[i];
        var memberDiscountAmount = orderItem.memberDiscountAmount ? orderItem.memberDiscountAmount : 0;
        var orderItemTotalMemberDisc = memberDiscountAmount;
        totalMemberDiscount += orderItemTotalMemberDisc;
    }
    return totalMemberDiscount;
}

// function insertPerItemDiscountCouponCmc(saleTxObj, clone){
// 	var totalBeforeMegaDiscount = saleTx.totalBeforeCmcCouponDiscount;
// 	var megaDiscount = saleTxObj.cmcTotalDiscount;
// 	var subtotal = CASHIER.getFinalSubtotalTxAmount(saleTxObj);

// 	console.log("==========");
// 	console.log("Sale obj");
// 	console.log(saleTxObj);
// 	console.log("Clone");
// 	console.log(clone);
// 	console.log("Summarize");
// 	console.log(getSummarizeSaleItems(saleTxObj));
// 	console.log("Subtotal : " + totalBeforeMegaDiscount);

// 	var percentage = SALE_RETURN_COUPON.getDiscountPercentage();

// 	console.log("Percentage : " + percentage);

// 	var totalAccumulatedDiscount = 0;

// 	var minDiscount = megaDiscount;
// 	var maxDiscount = 0;
// 	var excludedTotal = 0;

// 	for(var i = 0; i < saleTxObj.orderItems.length; i++){
// 		var orderItem = saleTxObj.orderItems[i];
// 		if(clone.orderItems[i].memberDiscountAmount > 0){
// 			var memberDiscount= Math.floor(orderItem.priceSubtotal / subtotal * totalBeforeMegaDiscount * percentage);
// 			orderItem.memberDiscountAmount = memberDiscount;
// 			totalAccumulatedDiscount += memberDiscount;

// 			if(memberDiscount < minDiscount){
// 				minDiscount = memberDiscount;
// 			}
// 			if(memberDiscount > maxDiscount){
// 				maxDiscount = memberDiscount;
// 			}
// 		}else{
// 			excludedTotal += 1;
// 		}
// 	}

// 	var difference = 0;
// 	var modulo = 0;
// 	var div = 0;

// 	if(totalAccumulatedDiscount != megaDiscount){
// 		difference = Math.abs(totalAccumulatedDiscount - megaDiscount);
// 		div = Math.floor(difference / (saleTxObj.orderItems.length - excludedTotal)); 
// 		modulo = difference % (saleTxObj.orderItems.length - excludedTotal);
// 	}

// 	console.log("Total item : " + saleTxObj.orderItems.length);
// 	console.log("Exclude total : " + excludedTotal);
// 	console.log("Difference : " + difference);
// 	console.log("Division : " + div);
// 	console.log("Modulo : " + modulo);

// 	if(difference > 0 ){
// 		for(var i = 0; i < saleTxObj.orderItems.length; i++){
// 			var orderItem = saleTxObj.orderItems[i];

// 			if(clone.orderItems[i].memberDiscountAmount == 0){
// 				continue;
// 			}

// 			if(totalAccumulatedDiscount > megaDiscount){
// 				orderItem.memberDiscountAmount -= div;
// 			}else{
// 				orderItem.memberDiscountAmount += div;
// 			}

// 			if(modulo > 0){
// 				if(totalAccumulatedDiscount > megaDiscount){
// 					orderItem.memberDiscountAmount -= 1;
// 				}else{
// 					orderItem.memberDiscountAmount += 1;
// 				}
// 				modulo -= 1;
// 			}
// 		}
// 	}

// 	console.log("========================");
// 	console.log("Mega discount : " + megaDiscount);
// 	console.log("COUNT AFTER DISCOUNT CMC");
// 	for(var i = 0; i < saleTxObj.orderItems.length; i++){
// 		var orderItem = saleTxObj.orderItems[i];
// 		console.log("Discount : " + orderItem.memberDiscountAmount);
// 	}
// 	console.log("========================");



// 	console.log("AFTER INSERT MEMBER DISCOUNT");
// 	console.log("Sale obj");
// 	console.log(saleTxObj);
// 	console.log("Summarize");
// 	console.log(getSummarizeSaleItems(saleTxObj));
// 	console.log("=====END=====");
// }

function getPercentageCmcCouponDiscount(coBrandNumber) {
    var cmcCouponDiscountPercentage = getConfigValue('CO_BRAND_COUPON_DISC_PERCENTAGE');
    console.log("CMC COUPON DISCOUNT PERCENTAGE : " + cmcCouponDiscountPercentage);
    var cmcListPercentage = cmcCouponDiscountPercentage.split(";");

    console.log("LIST PERCENTAGE : " + JSON.stringify(cmcListPercentage));

    for (var i = 0; i < cmcListPercentage.length; i++) {
        var cmcP = cmcListPercentage[i];
        var cmcCoupon = cmcP.split("|");
        var coBrandNumberCode = cmcCoupon[0];
        var coBrandDiscount = parseInt(cmcCoupon[1]);

        console.log(cmcP, coBrandNumberCode, coBrandDiscount);

        if (coBrandNumberCode == coBrandNumber) {
            return coBrandDiscount / 100;
        }
    }
}

function cmcCouponDiscount(total, coBrandNumber) {
    var percentage = getPercentageCmcCouponDiscount(coBrandNumber);
    var disc = total * percentage;
    return Math.ceil(disc);
}

function calculateCancelCMCWithSecondLayer() {
    var reversalSecondLayerAmount = 0;
    for (var i in saleTx.orderItems)
        if (saleTx.orderItems[i].secondLayerDiscountAmount > 0)
            reversalSecondLayerAmount += (!saleTx.orderItems[i].isVoided ? 1 : -1) * (saleTx.orderItems[i].memberDiscountAmount ? saleTx.orderItems[i].memberDiscountAmount : 0);
    return reversalSecondLayerAmount;
}

function reverseMemberDiscount(reverse, amount) {
    if (reverse) {
        var saleObj = cloneObject(saleTx);

        var amountReversal = calculateTotalMemberDiscount();
        if (amount) {
            amountReversal = amount;
        }

        // TO PROTECT REVERSAL
        uilog("DBUG", 'CMC Reversal Amount: ' + saleTx.cmcAmount + ', Calculated CMC Reversal Amount: ' + amountReversal);
        if (saleTx.cmcAmount && amountReversal < saleTx.cmcAmount)
            amountReversal = saleTx.cmcAmount;

        saleTx.memberDiscReversal = amountReversal;

        if (saleTx.employeeDiscountToggled) {
            // recalculate employee discount
            revertEmployeeDiscount();
            applyEmployeeDiscount();
        }
    } else {
        saleTx.memberDiscReversal = 0;
    }

    if (saleTx.employeeDiscountToggled) {
        // recalculate employee discount
        revertEmployeeDiscount();
        applyEmployeeDiscount();
    }

    Hypercash.service.applyNonMemberMarkupOnSubTotal();
    renderTotal();
}

function reverseMemberDiscountAmountPerItem(orderItems, reversedItems) {
    if (orderItems) {
        orderItems.forEach(function(item) {

            if (!jQuery.isEmptyObject(reversedItems)) {
                //uilog("DBUG","item.id", item.productId);
                //uilog("DBUG","reverseItems[item.id]", reversedItems[item.productId]);
                var reverseItem = reversedItems[item.productId];
                if (reverseItem) {
                    item.memberDiscountAmount = 0;
                }
            } else {
                item.memberDiscountAmount = 0;
            }
        });
    }
}

function processCmcCouponPayment(fnExecuteAfter, paymentMediaType, reversedItems) {
    if ($("#eftOfflineCardNoCode-dialog").dialog("isOpen")) $("#eftOfflineCardNoCode-dialog").dialog("close");

    var totalMemberDisc = calculateTotalMemberDiscount();
    var cardNum = (eftDataObj && eftDataObj.cardNum) ? eftDataObj.cardNum : "";
    if ($("#tenderNewAmount-dialog").data("cardNumber")) {
        cardNum = $("#tenderNewAmount-dialog").data("cardNumber");
    }
    var firstSixOfCard = cardNum.substring(0, 6);
    var isCardCoBrand = (saleTx.coBrandNumber && (firstSixOfCard == saleTx.coBrandNumber.substring(0, 6) || cardNum.substring(0, 8) == saleTx.coBrandNumber.substring(0, 8)));
    saleTx.isCardCoBrand = isCardCoBrand;

    var validCMCPaymentMediaType = (paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name ||
        paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_OFFLINE.name ||
        paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.MLC_ONLINE.name ||
        paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.MLC_OFFLINE.name);

    var isAddDiscPaymentLevel;
    if (cancelCmcDonation) {
        fnExecuteAfter();
    } else {
        if ((parseInt($("#inputDisplay").val()) < saleTx.totalAmount - getTotalDiscount(saleTx)) ||
            saleTx.payments.length != 0) {
            isAddDiscPaymentLevel = false;
        } else {
            isAddDiscPaymentLevel = processLayerThreePromotions(paymentMediaType, false);
            $("#tenderNewAmount-dialog").data('isAddDiscPaymentLevel', isAddDiscPaymentLevel);
        }

        fnExecuteAfter();
    }
}

// CR ADD DISCOUNT
function processNonCmcPayment(fnExecuteAfter, paymentMediaType, reversedItems) {
    console.log("=====processNonCmcPayment======");
    if ($("#eftOfflineCardNoCode-dialog").dialog("isOpen")) $("#eftOfflineCardNoCode-dialog").dialog("close");

    var totalMemberDisc = calculateTotalMemberDiscount();
    var cardNum = (eftDataObj && eftDataObj.cardNum) ? eftDataObj.cardNum : "";
    if ($("#tenderNewAmount-dialog").data("cardNumber")) {
        cardNum = $("#tenderNewAmount-dialog").data("cardNumber");
    }
    var firstSixOfCard = cardNum.substring(0, 6);
    var isCardCoBrand = (saleTx.coBrandNumber && (firstSixOfCard == saleTx.coBrandNumber.substring(0, 6) || cardNum.substring(0, 8) == saleTx.coBrandNumber.substring(0, 8)));
    var validCMCPaymentMediaType = (paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name ||
        paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_OFFLINE.name ||
        paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.MLC_ONLINE.name ||
        paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.MLC_OFFLINE.name);

    var isAddDiscPaymentLevel;

    // saleTx.isCardCoBrand = isCardCoBrand;

    if (cancelCmcDonation) {
        fnExecuteAfter();
    } else {
        if ((parseInt($("#inputDisplay").val()) < saleTx.totalAmount - getTotalDiscount(saleTx)) ||
            saleTx.payments.length != 0) {
            isAddDiscPaymentLevel = false;
        }
        else {
            console.log("Masuk ke else if kedua ");
            isAddDiscPaymentLevel = processLayerThreePromotions(paymentMediaType, false);
            $("#tenderNewAmount-dialog").data('isAddDiscPaymentLevel', isAddDiscPaymentLevel);
        }

        console.log("==COUPON TEST==");
        console.log(saleTx);
        console.log("Payments : " + JSON.stringify(saleTx.payments));
        console.log("Co-Brand : " + saleTx.coBrandNumber);
        console.log("Discount : " + totalMemberDisc);
        console.log("Type : " + paymentMediaType);
        console.log("Is card cobrand : " + isCardCoBrand);
        console.log("Else if 3 condition : " + (saleTx.coBrandNumber && !isCardCoBrand));
        console.log("===END===");

        if (((!saleTx.payments || saleTx.payments.length == 0) &&
                saleTx.coBrandNumber && paymentMediaType != CONSTANTS.PAYMENT_MEDIA_TYPES.COUPON.name && paymentMediaType != CONSTANTS.PAYMENT_MEDIA_TYPES.COUPON_RETURN.name &&
                totalMemberDisc > 0) ||
            isAddDiscPaymentLevel ||
            (saleTx.payments && saleTx.coBrandNumber && SALE_RETURN_COUPON.isUseCouponReturn() && !saleTx.isAleardyCancelledCmc)
        ) {

            console.log("Masuk ke else if ketiga ");
             if(saleTx.coBrandNumber && saleTx.coBrandNumber == '056700' && paymentMediaType == 'ALLO_PAYMENT'){
                 fnExecuteAfter();
             }else {
                $("#tenderNewAmountField").val("");
                $("#tenderNewAmount-dialog").data("fnExecuteAfter", fnExecuteAfter);
                if ($("#tenderNewAmount-dialog").data("mediaType") != CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name)
                    $("#tenderNewAmount-dialog").data("mediaType", paymentMediaType ? paymentMediaType : "");
                $("#tenderNewAmount-dialog").data("reversedItems", reversedItems);
                $("#tenderNewAmount-dialog").dialog("open");
            }
            
        } else {
            console.log("Masuk ke else if keempat ");
            fnExecuteAfter();
        }
    }
}
// CR ADD DISCOUNT

function isCmcTransaction() {
    var totalCmcDiscount = calculateTotalMemberDiscount();

    return (saleTx && saleTx.memberDiscReversal == 0 && totalCmcDiscount > 0);
}

//function distributeMemberDiscounts(saleTx, totalDiscPerItemMap, totalQtyWithDiscMap){
//
//	for (var i in saleTx.orderItems) {
//		var orderItem = saleTx.orderItems[i];
//		if(orderItem.salesType == CONSTANTS.TX_TYPES.SALE.name &&
//				totalDiscPerItemMap[orderItem.productId] && totalQtyWithDiscMap[orderItem.productId] > 0){
//			var qtyWithDisc = totalQtyWithDiscMap[orderItem.productId] > orderItem.quantity ? orderItem.quantity : totalQtyWithDiscMap[orderItem.productId];
//			orderItem.qtyWithMemberDiscount = qtyWithDisc;
//			orderItem.memberDiscountAmount = totalDiscPerItemMap[orderItem.productId] * qtyWithDisc;
//			totalQtyWithDiscMap[orderItem.productId] -= qtyWithDisc;
//		}
//	}
//}

//function calculateTotalMemberDiscount(){
//	var totalDisc = 0;
//	for(var i in promotionItems){
//		if(promotionItems[i].type == CONSTANTS.PROMOTION_TYPES.MEMBER_PROMOTION){
//			totalDisc += promotionItems[i].totalDiscount;
//		}
//	}
//	return totalDisc;
//}

//function resetMemberPromotion(){
//	if (saleTx) {
//		var memberDisc = calculateTotalMemberDiscount(promotionItems);
//		saleTx.totalDiscount -= memberDisc;
//		// remove 2nd layer member discount distributed per item
//		for ( var i in saleTx.orderItems) {
//			saleTx.orderItems[i].memberDiscountAmount = 0;
//		}
//		renderTotal();
//
//		var revertedPromotionItems = [];
//		for(var i in promotionItems){
//			if(promotionItems[i].type != CONSTANTS.PROMOTION_TYPES.MEMBER_PROMOTION){
//				revertedPromotionItems.push(promotionItems[i]);
//			}
//		}
//		promotionItems = revertedPromotionItems;
//		saleTx.promotionItems = promotionItems;
//
//		var tenderedAmount = parseInt($("#inputDisplay").val());
//		var newTenderedAmount = tenderedAmount+memberDisc;
//		$("#inputDisplay").val(newTenderedAmount);
//	}
//}

//function processMemberDiscount(){
//	var totalDiscPerItemMap = {};
//	var totalQtyWithDiscMap = {};
//	var summarizedOrderItems = getSummarizeSaleItems(saleTx);
//	for ( var i in summarizedOrderItems) {
//		var orderItem = summarizedOrderItems[i];
//		var productId = orderItem.productId;
//		var itemQuantity = orderItem.quantity;
//		if (itemQuantity > 0) {
//			item = findItemById(productId);
//			var memberPromo = getSinglePromo(item,
//					CONSTANTS.PROMOTION_TYPES.MEMBER_PROMOTION);
//			if (memberPromo) {
//				if(orderItem.qtyWithSecondLayerDiscount && !memberPromo.coBrandMix){
//					memberPromo.qualifiedQuantity = itemQuantity - orderItem.qtyWithSecondLayerDiscount;
//				}else{
//					memberPromo.qualifiedQuantity = itemQuantity
//				}
//				discount = calculateDiscount(memberPromo, orderItem, memberPromo.qualifiedQuantity);
//				promotionItems.push(createPromotItemObj(discount, memberPromo, orderItem, null));
//				totalDiscPerItemMap[productId] = (discount / itemQuantity);
//				totalQtyWithDiscMap[productId] = memberPromo.qualifiedQuantity;
//			}
//		}
//	}
//	distributeMemberDiscounts(saleTx, totalDiscPerItemMap, totalQtyWithDiscMap);
//	saleTx.totalDiscount += calculateTotalMemberDiscount();
//	renderTotal();
//	saleTx.promotionItems = promotionItems;
//}

/**
 * Function that gets the latest valid promo if more than 2 promos 
 * with same target group and type are applicable
 * 
 * @param validPromos
 * 
 */
function getLatestValidPromo(validPromos) {

    var latestPromo = [];
    var baseStartDate;

    for (var num = 0; num < validPromos.length; num++) {
        var promo = cloneObject(validPromos[num]);

        if (num == 0) {
            baseStartDate = new Date(promo.startDate);
            baseStartDate.setHours(0, 0, 0, 0);
        }
        var promoToCheckStartDate = new Date(promo.startDate);
        promoToCheckStartDate.setHours(0, 0, 0, 0);

        if (baseStartDate <= promoToCheckStartDate) {
            baseStartDate = promoToCheckStartDate;
            latestPromo.push(promo);
        }
    }

    return latestPromo;
}

// CR ADD DISCOUNT
function isContainAdditionalDiscountPaymentLevelPromo(paymentMediaType, firstSixOfCard) {
    var orderItems = getSummarizeSaleItems(saleTx);
    var additionalDiscPromo = null;
    var hasPaymentLevelPromo = false;
    var allowedCoBrandNumber = [];
    var isCmcAddDisc = false;
    var isZeproAddDisc = false;
    var isCardCoBrand = (saleTx.promotionsMap && isTrxCobrand(firstSixOfCard, saleTx.promotionsMap));
    saleTx.isCardCoBrand = isCardCoBrand;

    for (var int2 = 0; int2 < orderItems.length; int2++) {
        isCmcAddDisc = false;
        isZeproAddDisc = false;

        var additionalDiscPromo = null;

        for (var id in saleTx.promotionsMap) {
            if (orderItems[int2].productId == id) {
                for (var p in saleTx.promotionsMap[id]) {
                    for (var indexPromo in saleTx.promotionsMap[id][p]) {
                        if (typeof(saleTx.promotionsMap[id][p][indexPromo]) == "object" && saleTx.promotionsMap[id][p][indexPromo].promotionType == CONSTANTS.PROMOTION_TYPES.ADDITIONAL_DISCOUNT.type)
                            additionalDiscPromo = saleTx.promotionsMap[id][p];
                    }
                }
                break;
            }
        }
        if (!additionalDiscPromo) continue;

        for (var indexDiscPromo in additionalDiscPromo) {
            isCmcAddDisc = false;
            isZeproAddDisc = false;

            if (additionalDiscPromo[indexDiscPromo].coBrandNumber) {
                allowedCoBrandNumber = additionalDiscPromo[indexDiscPromo].coBrandNumber.split(",");
            }

            if (paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name && firstSixOfCard == 0) {
                if (additionalDiscPromo[indexDiscPromo].slidingDiscountInfo == "") return false;
                else return true;
            }

            for (var indexCoBrandList in additionalDiscPromo[indexDiscPromo].slidingDiscountInfo) {
                if (additionalDiscPromo[indexDiscPromo].slidingDiscountInfo[indexCoBrandList] == "CMC") {
                    isCmcAddDisc = true;
                } else if (additionalDiscPromo[indexDiscPromo].slidingDiscountInfo[indexCoBrandList] == "ZEPRO") {
                    isZeproAddDisc = true;
                } else {
                    if ((additionalDiscPromo[indexDiscPromo].slidingDiscountInfo[indexCoBrandList] == paymentMediaType &&
                            (paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_OFFLINE.name ||
                                paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name ||
                                paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_BCA.name ||
                                paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.DEBIT.name)) &&
                        additionalDiscPromo[indexDiscPromo].coBrandNumber == "") {
                        hasPaymentLevelPromo = true;
                    } else if ((additionalDiscPromo[indexDiscPromo].slidingDiscountInfo[indexCoBrandList] == paymentMediaType &&
                            (paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_OFFLINE.name ||
                                paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name ||
                                paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_BCA.name ||
                                paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.DEBIT.name ||
                                paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name)) &&
                        additionalDiscPromo[indexDiscPromo].coBrandNumber != "") {
                        for (var indexCoBrand in allowedCoBrandNumber) {
                            if (allowedCoBrandNumber[indexCoBrand] == firstSixOfCard ||
                                allowedCoBrandNumber[indexCoBrand] == $("#tenderNewAmount-dialog").data('barcode')) {
                                hasPaymentLevelPromo = true;
                            }
                            if (hasPaymentLevelPromo) break;
                            //if ($("#tenderNewAmount-dialog").data('barcode')) console.log($("#tenderNewAmount-dialog").data('barcode'));
                        }
                    }

                }
                if (hasPaymentLevelPromo) break;

            }

            var prodData = findItem(orderItems[int2].ean13Code);
            if (isItemContainCMCPromo(orderItems[int2].ean13Code, prodData.promotions)) {
                if (saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO &&
                    typeof saleTx.zeproCardDone == 'undefined' &&
                    !saleTx.zeproCardDone &&
                    !isZeproAddDisc
                ) {
                    hasPaymentLevelPromo = false;
                    continue;
                } else if (isCmcAddDisc &&
                    !isCardCoBrand &&
                    !(saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO &&
                        typeof saleTx.zeproCardDone == 'undefined' &&
                        !saleTx.zeproCardDone)) {
                    hasPaymentLevelPromo = false;
                    continue;
                } else if (!isCmcAddDisc &&
                    !isCardCoBrand &&
                    !(saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO &&
                        typeof saleTx.zeproCardDone == 'undefined' &&
                        !saleTx.zeproCardDone)) {
                    hasPaymentLevelPromo = false;
                    continue;
                }
                if (isZeproAddDisc &&
                    !(saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO &&
                        typeof saleTx.zeproCardDone == 'undefined' &&
                        !saleTx.zeproCardDone)
                ) {
                    hasPaymentLevelPromo = false;
                    continue;
                }
            } else if (isZeproAddDisc) {
                hasPaymentLevelPromo = false;
                continue;
            } else if (!isZeproAddDisc && (saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO &&
                    typeof saleTx.zeproCardDone == 'undefined' &&
                    !saleTx.zeproCardDone)) {
                hasPaymentLevelPromo = false;
                continue;
            } else if (isCmcAddDisc) {
                hasPaymentLevelPromo = false;
                continue;
            }
            if (hasPaymentLevelPromo) return true;
        }
    }

    if (!additionalDiscPromo) return false;

    //for(var p in additionalDiscPromo.slidingDiscountInfo)
    //{
    //if(additionalDiscPromo.slidingDiscountInfo[p] == "") return false;
    return hasPaymentLevelPromo;
    //}
}

function processLayerThreePromotions(paymentMediaType, reversed) {
    if (redeemPointTrk || saleGameItemTrk) {
        return false;
    }

    var additionalDiscount = 0;
    var totalPaymentLevelAdditionalDiscount = 0;
    var totalItemLevelAdditionalDiscount = 0;
    var orderItems = getSummarizeSaleItems(saleTx);
    var isPaymentLevel = false;
    var isItemLevel = false;
    var hasPaymentLevelPromo = false;
    var promoObj;
    var isInPromotions = false;
    var cardNum = (eftDataObj && eftDataObj.cardNum) ? eftDataObj.cardNum : "";
    var isCmcAddDisc = false;
    var isZeproAddDisc = false;

    if ($("#tenderNewAmount-dialog").data("cardNumber")) {
        cardNum = $("#tenderNewAmount-dialog").data("cardNumber");

        //$("#tenderNewAmount-dialog").removeData("cardNumber");
    }

    var firstSixOfCard = cardNum.substring(0, 6);
    var isCardCoBrand = (saleTx.promotionsMap && isTrxCobrand(firstSixOfCard, saleTx.promotionsMap));
    saleTx.isCardCoBrand = isCardCoBrand;

    var allowedCoBrandNumber = [];
    var validCMCPaymentMediaType = (paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name ||
        paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_OFFLINE.name ||
        paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.MLC_ONLINE.name ||
        paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.MLC_OFFLINE.name ||
        paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.DEBIT.name ||
        paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_BCA.name);

    var isNotValidGetCmc = false;
    if ((!isCardCoBrand && cardNum != "" && !validCMCPaymentMediaType) ||
        (validCMCPaymentMediaType && !isCardCoBrand) ||
        (paymentMediaType && !validCMCPaymentMediaType)) {
        isNotValidGetCmc = true;
    } else isNotValidGetCmc = false;

    if (typeof(saleTx.totalAdditionalDiscount) != "undefined") {
        saleTx.totalDiscount -= saleTx.totalAdditionalDiscount;
        saleTx.totalAdditionalDiscount = 0;
    }

    for (var int2 = 0; int2 < orderItems.length; int2++) {
        isPaymentLevel = false;
        isItemLevel = false;
        isCmcAddDisc = false;
        isZeproAddDisc = false;

        isInPromotions = false;
        var additionalDiscPromo = null;

        for (var id in saleTx.promotionsMap) {
            if (orderItems[int2].productId == id) {
                for (var p in saleTx.promotionsMap[id]) {
                    for (var indexPromo in saleTx.promotionsMap[id][p]) {
                        if (typeof(saleTx.promotionsMap[id][p][indexPromo]) == "object" && saleTx.promotionsMap[id][p][indexPromo].promotionType == CONSTANTS.PROMOTION_TYPES.ADDITIONAL_DISCOUNT.type)
                            additionalDiscPromo = saleTx.promotionsMap[id][p];
                    }
                }
                break;
            }
        }
        if (!additionalDiscPromo) continue;

        /*getSinglePromo(orderItems[int2].data,
                        CONSTANTS.PROMOTION_TYPES.ADDITIONAL_DISCOUNT, orderItems[int2].scanTime);*/

        for (var indexDiscPromo in additionalDiscPromo) {
            if (additionalDiscPromo[indexDiscPromo].coBrandNumber) {
                allowedCoBrandNumber = additionalDiscPromo[indexDiscPromo].coBrandNumber.split(",");
            }

            additionalDiscount = 0;
            isCmcAddDisc = false;
            isZeproAddDisc = false;

            additionalDiscPromo[indexDiscPromo].qualifiedQuantity = orderItems[int2].quantity;
            if (!paymentMediaType && $("#tenderNewAmount-dialog").data('mediaType') == CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name)
                paymentMediaType = $("#tenderNewAmount-dialog").data('mediaType');
            // if check payment level
            // else item level
            for (var indexCoBrandList in additionalDiscPromo[indexDiscPromo].slidingDiscountInfo) {
                if (additionalDiscPromo[indexDiscPromo].slidingDiscountInfo[indexCoBrandList] == "") {
                    isItemLevel = true;
                    isPaymentLevel = false;
                } else if (additionalDiscPromo[indexDiscPromo].slidingDiscountInfo[indexCoBrandList] == "CMC") {
                    isCmcAddDisc = true;
                } else if (additionalDiscPromo[indexDiscPromo].slidingDiscountInfo[indexCoBrandList] == "ZEPRO") {
                    isZeproAddDisc = true;
                } else {

                    if (additionalDiscPromo[indexDiscPromo].slidingDiscountInfo[indexCoBrandList] == paymentMediaType &&
                        paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.CASH.name) {
                        isPaymentLevel = true;
                        isItemLevel = false;
                        hasPaymentLevelPromo = true;
                    } else if ((additionalDiscPromo[indexDiscPromo].slidingDiscountInfo[indexCoBrandList] == paymentMediaType &&
                            (paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_OFFLINE.name ||
                                paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name ||
                                paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_BCA.name ||
                                paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.DEBIT.name)) &&
                        additionalDiscPromo[indexDiscPromo].coBrandNumber == "") {
                        isPaymentLevel = true;
                        isItemLevel = false;
                        hasPaymentLevelPromo = true;
                    } else if ((additionalDiscPromo[indexDiscPromo].slidingDiscountInfo[indexCoBrandList] == paymentMediaType &&
                            (paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_OFFLINE.name ||
                                paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name ||
                                paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_BCA.name ||
                                paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.DEBIT.name ||
                                paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name)) &&
                        additionalDiscPromo[indexDiscPromo].coBrandNumber != "") {
                        for (var indexCoBrand in allowedCoBrandNumber) {
                            if (allowedCoBrandNumber[indexCoBrand] == firstSixOfCard ||
                                allowedCoBrandNumber[indexCoBrand] == $("#tenderNewAmount-dialog").data('barcode')) {
                                isPaymentLevel = true;
                                isItemLevel = false;
                                hasPaymentLevelPromo = true;
                            }
                            if (isItemLevel || isPaymentLevel) break;
                        }
                    }

                }
                if (isItemLevel || isPaymentLevel) break;

            }
            var prodData = findItem(orderItems[int2].ean13Code);
            if (isItemCMC(orderItems[int2].ean13Code, saleTx.promotionsMap) && !isItemLevel && !isNotValidGetCmc) {
                if (saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO &&
                    typeof saleTx.zeproCardDone == 'undefined' &&
                    !saleTx.zeproCardDone &&
                    !isZeproAddDisc
                ) {
                    isPaymentLevel = false;
                    isItemLevel = false;
                    continue;
                } else if (isCmcAddDisc
                    //&& coBrandDiscountStatus == getConfigValue("COBRAND_DISCOUNT_ON")
                    &&
                    isNotValidGetCmc &&
                    !(saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO &&
                        typeof saleTx.zeproCardDone == 'undefined' &&
                        !saleTx.zeproCardDone)) {
                    isPaymentLevel = false;
                    isItemLevel = false;
                    continue;
                } else if (!isCmcAddDisc
                    //&& coBrandDiscountStatus == getConfigValue("COBRAND_DISCOUNT_ON")
                    &&
                    isNotValidGetCmc &&
                    !(saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO &&
                        typeof saleTx.zeproCardDone == 'undefined' &&
                        !saleTx.zeproCardDone)) {
                    isPaymentLevel = false;
                    isItemLevel = false;
                    continue;
                }
                if (isZeproAddDisc &&
                    !(saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO &&
                        typeof saleTx.zeproCardDone == 'undefined' &&
                        !saleTx.zeproCardDone)
                ) {
                    isPaymentLevel = false;
                    isItemLevel = false;
                    continue;
                }
            } else if (isZeproAddDisc) {
                isPaymentLevel = false;
                isItemLevel = false;
                continue;
            } else if (!isZeproAddDisc && (saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO &&
                    typeof saleTx.zeproCardDone == 'undefined' &&
                    !saleTx.zeproCardDone)) {
                isPaymentLevel = false;
                isItemLevel = false;
                continue;
            } else if (isCmcAddDisc) {
                isPaymentLevel = false;
                isItemLevel = false;
                continue;
            }

            if (additionalDiscPromo[indexDiscPromo] &&
                !isDeptstore &&
                ((isPaymentLevel && paymentMediaType && (saleTx.payments.length == 0)) ||
                    isItemLevel)
            ) {
                //var basePrice = orderItems[int2].priceUnit;
                var basePrice = orderItems[int2].priceUnit - (orderItems[int2].discountAmount / orderItems[int2].quantity) - (orderItems[int2].secondLayerDiscountAmount / orderItems[int2].quantity) - (orderItems[int2].memberDiscountAmount / orderItems[int2].quantity);

                var isCancelCmC = $("#tenderNewAmount-dialog").data('additionalDiscountItemLevelCancel');
                //if ((!isCardCoBrand && cardNum !="") 
                //      || (!validCMCPaymentMediaType && paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name))

                if ((!isCardCoBrand && cardNum != "" && !validCMCPaymentMediaType) ||
                    (validCMCPaymentMediaType && !isCardCoBrand)
                    //   || (validCMCPaymentMediaType && isPaymentLevel)
                    ||
                    (paymentMediaType && !validCMCPaymentMediaType))
                    basePrice = basePrice + (orderItems[int2].memberDiscountAmount / orderItems[int2].quantity);

                var quantity = orderItems[int2].quantity;
                var isFreshGoodsItem = isFreshGoods(orderItems[int2]);
                var isScannedByWeight = isWeightSupplied(orderItems[int2]);

                additionalDiscount = PROMOTIONS.calculateDiscount(additionalDiscPromo[indexDiscPromo], basePrice, quantity, isScannedByWeight);

                if (additionalDiscount > 0) {
                    if (isScannedByWeight) {
                        basePrice = Math.round(basePrice - additionalDiscount); //additionalDiscount here is discount per 1kg
                        additionalDiscount = calculateWeightedPrice(quantity, additionalDiscount);

                    } else
                        basePrice -= (additionalDiscount / quantity);

                    if (saleTx.type == CONSTANTS.TX_TYPES.SALE.name) {
                        if (!saleTx.totalDiscount) {
                            saleTx.totalDiscount = 0;
                        }

                        if (!(isPaymentLevel && reversed)) {
                            saleTx.totalDiscount += additionalDiscount;
                            saleTx.totalAdditionalDiscount += additionalDiscount;
                            if (isPaymentLevel && !isItemLevel) totalPaymentLevelAdditionalDiscount += additionalDiscount;
                            else totalItemLevelAdditionalDiscount += additionalDiscount;
                        }
                        for (var count = 0; count < saleTx.orderItems.length; count++) {
                            if ((saleTx.orderItems[count].productId == orderItems[int2].productId) &&
                                (!reversed)) {
                                // ADD DISCOUNT PRORATE
                                var singleAdditionalDiscount = additionalDiscount / quantity;

                                //saleTx.orderItems[count].additionalDiscount = additionalDiscount;
                                saleTx.orderItems[count].additionalDiscount = singleAdditionalDiscount * saleTx.orderItems[count].quantity;
                                // ADD DISCOUNT PRORATE
                                var promoLength = promotionItems.length;
                                if (promoLength == 0) {
                                    promotionItems.push(createPromotItemObj(additionalDiscount, additionalDiscPromo[indexDiscPromo], saleTx.orderItems[count], null, additionalDiscount));
                                } else {
                                    for (var indexPromo = 0; indexPromo < promoLength; indexPromo++) {
                                        if (promotionItems[indexPromo].productId == orderItems[int2].productId &&
                                            promotionItems[indexPromo].type == additionalDiscPromo[indexDiscPromo].promotionType) {

                                            promoObj = createPromotItemObj(additionalDiscount, additionalDiscPromo[indexDiscPromo], saleTx.orderItems[count], null, additionalDiscount);
                                            promotionItems[indexPromo] = promoObj;
                                            isInPromotions = true;
                                        } else if (indexPromo + 1 == promoLength && !isInPromotions) {
                                            var promoObj = createPromotItemObj(additionalDiscount, additionalDiscPromo[indexDiscPromo], saleTx.orderItems[count], null, additionalDiscount);
                                            promotionItems.push(promoObj);
                                        }
                                    }
                                }

                                //break;

                            }
                        }


                    } else if (saleTx.type == CONSTANTS.TX_TYPES.SALE_VOID.name) {
                        if (!saleTx.voidedDiscount) {
                            saleTx.voidedDiscount = 0;
                        }
                        saleTx.voidedDiscount += additionalDiscount;
                    }
                    //}
                }

                if (totalPaymentLevelAdditionalDiscount > 0) $("#tenderNewAmount-dialog").data('additionalDiscountPaymentLevel', totalPaymentLevelAdditionalDiscount);
                else if (totalItemLevelAdditionalDiscount > 0) $("#tenderNewAmount-dialog").data('additionalDiscountItemLevel', totalItemLevelAdditionalDiscount);
            }
            if (isItemLevel || isPaymentLevel) break;
        }
    }
    if (!totalPaymentLevelAdditionalDiscount && totalPaymentLevelAdditionalDiscount == 0) hasPaymentLevelPromo = false;
    return hasPaymentLevelPromo;
}

function isItemContainCMCPromo(barcode, promotionsMap) {
    for (var j in promotionsMap) {
        if (promotionsMap[j].promotionType == 'M' && barcode == promotionsMap[j].ean13code) {
            return true;
        }
    }
    return false;
}

function removeAdditionalDicount() {
    if (saleTx.totalAdditionalDiscount && saleTx.totalAdditionalDiscount != 0) {
        for (var promoIndex in saleTx.promotionItems) {
            if (saleTx.promotionItems[promoIndex].type == CONSTANTS.PROMOTION_TYPES.ADDITIONAL_DISCOUNT.type) {
                saleTx.promotionItems.splice(promoIndex, 1);
            }
        }

        for (var itemIndex in saleTx.orderItems) {
            if (saleTx.orderItems[itemIndex].additionalDiscount && saleTx.orderItems[itemIndex].additionalDiscount != 0) saleTx.orderItems[itemIndex].additionalDiscount = 0
        }

        if ($("#tenderNewAmount-dialog").data('additionalDiscountPaymentLevel')) {
            saleTx.totalDiscount -= $("#tenderNewAmount-dialog").data('additionalDiscountPaymentLevel');
            saleTx.totalAdditionalDiscount -= $("#tenderNewAmount-dialog").data('additionalDiscountPaymentLevel');
            $("#tenderNewAmount-dialog").removeData('additionalDiscountPaymentLevel');
        }

        if ($("#tenderNewAmount-dialog").data('additionalDiscountItemLevel')) {
            saleTx.totalDiscount -= $("#tenderNewAmount-dialog").data('additionalDiscountItemLevel');
            saleTx.totalAdditionalDiscount -= $("#tenderNewAmount-dialog").data('additionalDiscountItemLevel');
            //eftDataObj.cardNum = null;
            //$("#tenderNewAmount-dialog").data('additionalDiscountItemLevelCancel', true);
            processLayerThreePromotions(false, false);
            $("#tenderNewAmount-dialog").removeData('additionalDiscountItemLevel');
        }
    }

    $("div#numPad div#keyTotal").click();
}


// CR ADD DISCOUNT
/**
 * Function that process layer 1 promotions - cmc, automatic markdown
 * 
 * @param saleTx
 * @param orderItem
 * @param scanType
 * @param data
 * @returns
 */
function processLayerOnePromotions(saleTx, orderItem, scanType, data) {
    var discounts = [];
    var markdownDiscount = 0;
    var coBrandMemDiscount = 0;
    var crmMemDiscount = 0;
    var basePrice = orderItem.priceUnit;
    var quantity = orderItem.quantity;
    var isFreshGoodsItem = isFreshGoods(data);
    var isScannedByWeight = isWeightSupplied(data);

    if ((isFreshGoodsItem && !isScannedByWeight) || redeemPointTrk || saleGameItemTrk) {
        //uilog("DBUG","do not calculate markdown promo for fresh goods scanned by price");
    } else {
        var autoMarkdownPromo = getSinglePromo(data,
            CONSTANTS.PROMOTION_TYPES.AUTOMATIC_MARKDOWN, orderItem.scanTime);

        //if (autoMarkdownPromo && isValidPromoDateTime(autoMarkdownPromo)) {
        if (autoMarkdownPromo && !isDeptstore) {
            markdownDiscount = PROMOTIONS.calculateDiscount(autoMarkdownPromo, basePrice, quantity, isScannedByWeight);
            if (markdownDiscount > 0) {

                if (isScannedByWeight) {
                    basePrice = Math.round(basePrice - markdownDiscount); //markdownDiscount here is discount per 1kg
                    markdownDiscount = calculateWeightedPrice(quantity, markdownDiscount);
                } else {
                    basePrice -= (markdownDiscount / quantity);
                }

                discounts.push(markdownDiscount);
                orderItem.discountAmount = markdownDiscount;
            }
        }

        // DEPSTORE TREATMENT
        if (isDeptstore) {
            //orderItem.staffId = data.staffId;
            var deptstoreDiscount = 0;
            if (data.discMarkdown && data.discMarkdown > 0)
                deptstoreDiscount += Math.round(data.discMarkdown);

            for (var p in data.discAmount)
                deptstoreDiscount += Math.round(data.discAmount[p]);

            orderItem.priceUnit = data.priceUnit;
            //saleTx.totalDiscount += orderItem.quantity * deptstoreDiscount;
            basePrice -= deptstoreDiscount;
        }
    }

    if (connectionOnline && saleTx.customerId) {
        var validPromos = PROMOTIONS.getValidPromos(data, CONSTANTS.PROMOTION_TYPES.MEMBER_CRM_PROMOTION);
        var crmMemberPromo = PROMOTIONS.getMaxDiscountPromo(validPromos, basePrice, quantity);

        crmMemDiscount = PROMOTIONS.calculateDiscount(crmMemberPromo, basePrice, quantity);
        if (crmMemDiscount > 0) {
            discounts.push(crmMemDiscount);
            basePrice -= (crmMemDiscount / quantity);
            orderItem.crmMemberDiscountAmount = crmMemDiscount;
        }
    }

    if (saleTx.coBrandNumber) {
        // check for member promo
        var coBrandPromo = getSinglePromo(data,
            CONSTANTS.PROMOTION_TYPES.MEMBER_COBRAND_PROMOTION);
        //uilog("DBUG", coBrandPromo);
        if (coBrandPromo && (coBrandDiscountStatus != getConfigValue("COBRAND_DISCOUNT_OFF"))) {

            var validPromoQty = true;
            
            if(coBrandPromo.maxPromoQty > 0){
                
                validPromoQty = isValidMaxPromoQty(saleTx.orderItems, coBrandPromo, orderItem);
                
                if(validPromoQty && orderItem.quantity > 1 && orderItem.quantity >= coBrandPromo.maxPromoQty){
                    quantity = coBrandPromo.maxPromoQty
                }
                
            }
            
            if(validPromoQty){
                
                coBrandMemDiscount = PROMOTIONS.calculateDiscount(coBrandPromo, basePrice, quantity, isScannedByWeight);

                if (isScannedByWeight) {
                    coBrandMemDiscount = calculateWeightedPrice(quantity, coBrandMemDiscount);
                }

                if (scanType == CONSTANTS.TX_TYPES.SALE.name) {
                    // used for checking upon payment if member promo is applied
                    if (!(orderItem.productId in memberPromos)) {
                        coBrandPromo.qualifiedQuantity = quantity;
                        memberPromos[orderItem.productId] = coBrandPromo;
                    } else if (scanType == CONSTANTS.TX_TYPES.SALE_VOID.name) {
                        if (isScannedByWeight) {
                            memberPromos[orderItem.productId].qualifiedQuantity = ((memberPromos[orderItem.productId].qualifiedQuantity * 1000) +
                                (orderItem.quantity * 1000)) / 1000;
                        } else {
                            memberPromos[orderItem.productId].qualifiedQuantity += orderItem.quantity;
                        }
                    }
                } else {
                    // subtract quantity from promos map
                    if ((orderItem.productId in memberPromos)) {
                        if (isScannedByWeight) {
                            memberPromos[orderItem.productId].qualifiedQuantity = ((memberPromos[orderItem.productId].qualifiedQuantity * 1000) -
                                (orderItem.quantity * 1000)) / 1000;
                        } else {
                            memberPromos[orderItem.productId].qualifiedQuantity -= orderItem.quantity;
                        }
                    }
                }

                discounts.push(coBrandMemDiscount);
                //uilog("DBUG", coBrandMemDiscount);
                orderItem.memberDiscountAmount = coBrandMemDiscount;
            }
            
        }
    }

    for (var num = 0; num < discounts.length; num++) {

        if (scanType == CONSTANTS.TX_TYPES.SALE.name) {
            if (!saleTx.totalDiscount) {
                saleTx.totalDiscount = 0;
            }
            saleTx.totalDiscount += discounts[num];
        } else if (scanType == CONSTANTS.TX_TYPES.SALE_VOID.name) {
            if (!saleTx.voidedDiscount) {
                saleTx.voidedDiscount = 0;
            }
            saleTx.voidedDiscount += discounts[num];
        }
    }
}

/**
 * Function that checks the valid member group
 *
 * @param promotion
 * @returns {Boolean}
 */
function isValidMemberGroup(promotion, promoToSearch) {

    var isValid = false;

    if (promoToSearch.subtype) {
        if (promoToSearch.subtype == CONSTANTS.MEMBER_SUB_TYPE.COBRAND && saleTx.coBrandNumber &&
            promotion.coBrandNumber && (promotion.coBrandNumber.indexOf(saleTx.coBrandNumber.substring(0, 6)) != -1 ||
                promotion.coBrandNumber.indexOf(saleTx.coBrandNumber.substring(0, 8)) != -1)) {
            isValid = true;
        } else if (promoToSearch.subtype == CONSTANTS.MEMBER_SUB_TYPE.CRM &&
            saleTx.customerId && promotion.memberGroupCode && profitCodes) {

            for (var i in profitCodes) {
                if (profitCodes[i] == promotion.memberGroupCode) {
                    return true;
                }
            }
        }
    } else {
        isValid = true;
    }

    return isValid;
}

function isValidMaxPromoQty(arrSales, cobrand, order) {
    var salesOrderQty = 0;
    var arrSalesNew = arrSales.filter(x => x.ean13Code === cobrand.ean13code);

    arrSalesNew.forEach(e => {
        salesOrderQty += e.quantity;
    });

    var salesAndOrderQty = order.quantity + salesOrderQty;

    if (cobrand.maxPromoQty == 0) {
        return true
    } else if (arrSalesNew.length == 0 && order.quantity >= cobrand.maxPromoQty) {
        return true;
    } else if (salesAndOrderQty <= cobrand.maxPromoQty) {
        return true;
    } else {
        return false;
    }

}

/*******************************************************************************
 * PROMOTIONS END
 ******************************************************************************/

/*******************************************************************************
 * Customer Feedback Start
 ******************************************************************************/
function createCustomerFeedbackObj(saleTxId) {
    var customerFeedbackObj = {
        transactionId: saleTxId ? saleTxId : null,
        customerSatisfaction: 0,
        customerName: '',
        customerPhone: ''
    };
    return customerFeedbackObj;
}

function enableCustomerFeedback(enable) {
    if (enable) {
        loadCustomerFeedbackConfig();
    }
    isFeedbackGiven = false;

    var clonedSaleTx = cloneObject(saleTx);
    var totalDiscount = clonedSaleTx ? getTotalDiscount(clonedSaleTx) : 0;
    var totalCmcDiscount = (clonedSaleTx && clonedSaleTx.memberDiscReversal == 0) ? calculateTotalMemberDiscount() : 0;

    feedbackSettings.totalDisc = totalDiscount;
    feedbackSettings.totalCmcDisc = totalCmcDiscount;

    CustomerPopupScreen.cus_enableFeedback(enable, feedbackSettings);
}

function loadCustomerFeedbackConfig() {
    try {
        var timeout = getConfigValue("CUST_FB_TIMEOUT");
        var fbMsg = getConfigValue("CUST_FB_MSG");
        feedbackSettings.timeout = parseInt(timeout);
        feedbackSettings.message = fbMsg;
        feedbackSettings.totalDiscMsg = getConfigValue("CUST_FB_TOTAL_DISC_MSG");
        feedbackSettings.totalCmcDiscMsg = getConfigValue("CUST_FB_CMC_TOTAL_DISC_MSG");
    } catch (e) {
        uilog("DBUG", "error on fetching feedback timeout config: " + e.message);
    }
}

function saveCustomerFeedback() {
    var custFeedbackData = customerFeedback;
    //if (custFeedbackData.transactionId != lastCustFeedbackTrxId) 
    //	custFeedbackData.transactionId = lastCustFeedbackTrxId;

    if (custFeedbackData.customerName == "'") custFeedbackData.customerName = "''";

    $.ajax({
        url: posWebContextPath + "/cashier/saveCustFeedback",
        type: "POST",
        async: false,
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify(custFeedbackData),
        success: function(response) {
            if (!jQuery.isEmptyObject(response) && !response.error) {
                // TODO additional process if save is success
                //uilog('DBUG','Customer Feedback Saved');
            } else {
                promptSysMsg(getMsgValue('prompt_msg_saving_customer_feedback_err'),
                    'Customer Feedback');
            }
        },
        error: function(jqXHR, status, error) {
            promptSysMsg(getMsgValue('prompt_msg_saving_customer_feedback_err'),
                'Customer Feedback');
        }
    });
}
/*******************************************************************************
 * Customer Feedback End
 ******************************************************************************/

/**
 * Function changing messages on the order message dialog
 * Changes happening after feedback.
 * @param show check if order message dialog is already showing
 */
function displayOrderMessageChanges(show) {
    var reminderMsg = getMsgValue("prompt_msg_transaction_complete_new_order");
    if (show) {
        if (DrawerModule.isConnected) {
            var payments = saleTx.payments;
            var lastPayment = saleTx.payments.last;
            //opens drawer if payment has cash or last payment is edc payment
            if (hasCashPayment(payments) || (lastPayment && CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_PAYMENT.name == lastPayment.paymentMediaType)) {
                reminderMsg = getMsgValue("prompt_msg_transaction_close_drawer");
            } else {
                reminderMsg = getMsgValue('prompt_msg_transaction_complete_new_order');
            }
            DrawerModule.checkStatus({ afterTransaction: true });
        } else {
            // if drawer is disconnected, will prompt ok button
            showOkButtonOnOrderMessage();
        }
    } else {
        $("#order-message").dialog('option', 'buttons', {});
        reminderMsg = getMsgValue("prompt_msg_transaction_customer_feedback");
    }
    $("#orderMsgReminder").text(reminderMsg);
}

function processBalloonGame(executeFunctionAfter) {
    var isEnabled = getConfigValue("BALLOON_REDEEM_FLAG") != null ?
        parseBoolean(getConfigValue("BALLOON_REDEEM_FLAG")) :
        false;

    if (isEnabled &&
        saleTx.type == CONSTANTS.TX_TYPES.SALE.name && !toggleCancelSale) {
        $("#balloonGamePrompt-dialog").dialog('option', 'beforeClose', function(event, ui) {
            executeFunctionAfter();
        });


        $("#balloonGamePrompt-dialog").dialog('option', 'buttons', {
            'Balloon Game': function() {
                $("#balloonGameInputMember-dialog").dialog("open");
            },
            'Skip': function() {
                $(this).dialog("close");
            }
        });

        $("#balloonGamePrompt-dialog").dialog('open');
    } else {
        executeFunctionAfter();
    }
}

function processFreeParking(executeFunctionAfter) {
    var validCarParking = false;
    var validMotorParking = false;
    try {
        if (saleTx.type == CONSTANTS.TX_TYPES.SALE.name && !toggleCancelSale) {
            var freeCarParkMinAmt = parseInt(getConfigValue("FREE_PARKING_CAR_MIN_AMT"));
            var freeMotorParkMinAmt = parseInt(getConfigValue("FREE_PARKING_MOTOR_MIN_AMT"));
            var subTotalAmount = saleTx.totalAmount - getTotalDiscount(saleTx);

            validCarParking = subTotalAmount >= freeCarParkMinAmt && freeCarParkMinAmt != 0;
            validMotorParking = subTotalAmount >= freeMotorParkMinAmt && freeMotorParkMinAmt != 0;
        }
    } catch (e) {
        uilog('DBUG', 'Error on validating transaction for free parking');
    } finally {
        if (validCarParking && validMotorParking) {
            $("#freeParking-dialog").dialog('option', 'beforeClose', function(event, ui) {
                executeFunctionAfter();
            });
            $("#freeParking-dialog").dialog('option', 'buttons', {
                "Car": function() {
                    saleTx.freeParkingGiven = 1;
                    $(this).dialog("close");
                },
                "Motorcycle": function() {
                    saleTx.freeParkingGiven = 2;
                    $(this).dialog("close");
                },
                "Skip": function() {
                    saleTx.freeParkingGiven = 0;
                    $(this).dialog("close");
                }
            });
            $("#freeParking-dialog").dialog("open");
        } else if (validCarParking) {
            $("#freeParking-dialog").dialog('option', 'beforeClose', function(event, ui) {
                executeFunctionAfter();
            });
            $("#freeParking-dialog").dialog('option', 'buttons', {
                "Car": function() {
                    saleTx.freeParkingGiven = 1;
                    $(this).dialog("close");
                },
                "Skip": function() {
                    saleTx.freeParkingGiven = 0;
                    $(this).dialog("close");
                }
            });
            $("#freeParking-dialog").dialog("open");
        } else if (validMotorParking) {
            $("#freeParking-dialog").dialog('option', 'beforeClose', function(event, ui) {
                executeFunctionAfter();
            });
            $("#freeParking-dialog").dialog('option', 'buttons', {
                "Motorcycle": function() {
                    saleTx.freeParkingGiven = 2;
                    $(this).dialog("close");
                },
                "Skip": function() {
                    saleTx.freeParkingGiven = 0;
                    $(this).dialog("close");
                }
            });
            $("#freeParking-dialog").dialog("open");
        } else {
            saleTx.freeParkingGiven = 0;
            executeFunctionAfter();
        }
    }
}

function processConnectionStatus() {
    /*if (connectionOnline) {
    	$("#connStatus").text("online").attr("style", "color:green");
    } else {
    	$("#connStatus").text("offline").attr("style", "color:red");
    }*/
}

/*******************************************************************************
 * Functions used for EMPLOYEE CARD/LOYALTY CARD
 ******************************************************************************/
/**
 * Method for checking Customer eligible for reward.
 */
function isCustomerValidForReward(memberId, saleTx) {
    var store = saleTx.storeCd;
    var contact = null;
    if (memberId) {
        if (isMemberContactSelected && customerIdForReward == null) {
            contact = memberId;
            memberId = null;
        }
        var crmReqParams = {
            id: memberId,
            store: null,
            paymentType: null,
            amount: null,
            cardNo: null,
            transactionNo: null,
            transactionDate: null,
            store: store,
            contact: contact
        };

        return callCrmWsConsumer(posWebContextPath + "/crmWsConsumer/findMemberById/", crmReqParams);
    }
}

/**
 * Method to get Points for Employee/Loyalty Card.
 * @param memberId
 * @param saleTx
 * @param transactionDate
 * @returns crmWsResponseObject
 */
function getRewardPoints(memberId, saleTx, txnDate) {
    var store = saleTx.storeCd;
    var paymentType = getPaymentDetail(saleTx.payments, 'paymentType');
    var amount = getPaymentDetail(saleTx.payments, 'amount');
    var cardNo = getPaymentDetail(saleTx.payments, 'cardNum');
    var transactionNo = saleTx.transactionId;
    var transactionDate = $.format.date(txnDate, 'ddMMyyyyHHmmss');
    var items = getItems(saleTx);

    var crmReqParams = {
        id: memberId,
        store: store,
        paymentType: paymentType,
        amount: amount,
        cardNo: cardNo,
        transactionNo: transactionNo,
        transactionDate: transactionDate,
        items: items
    };

    return callCrmWsConsumer(posWebContextPath + "/crmWsConsumer/earnPoint/", crmReqParams);
}

/**
 * Method to redeem Points for Employee/Loyalty Card.
 */
function redeemCRMPoints(memberId, saleTx, txnDate) {
    customerPin = null;
    var store = saleTx.storeCd;
    var amount = null;

    if (memberId == null) {
        memberId = saleTx.customerId;
    }

    for (var i in saleTx.payments) {
        if (CONSTANTS.PAYMENT_MEDIA_TYPES.CRM_POINTS.name == saleTx.payments[i].paymentMediaType) {
            amount = amount + saleTx.payments[i].amountPaid;
        }
    }

    var transactionNo = saleTx.transactionId;
    var transactionDate = null;
    if (null != txnDate) {
        transactionDate = $.format.date(saleTx.startDate, 'ddMMyyyyHHmmss');
    }

    var crmReqParams = {
        id: memberId,
        store: store,
        paymentType: null,
        amount: amount,
        cardNo: null,
        transactionNo: transactionNo,
        transactionDate: transactionDate
    };

    return callCrmWsConsumer(posWebContextPath + "/crmWsConsumer/redeemPoints/", crmReqParams);
}

/**
 * Method to void Points for Employee/Loyalty Card.
 */
function voidCRMPoints(txnId) {
    var transactionNo = txnId;
    var txnDate = new Date();
    var transactionDate = $.format.date(txnDate, 'ddMMyyyyHHmmss');
    var crmReqParams = {};

    crmReqParams = {
        transactionNo: transactionNo,
        transactionDate: transactionDate
    };

    return callCrmWsConsumer(posWebContextPath + "/crmWsConsumer/voidPoints/", crmReqParams);
}

/**
 * Method to validate Pin for Employee/Loyalty Card.
 */
function validateCRMPin(memberId, pin) {

    var crmReqParams = {
        id: memberId,
        store: null,
        paymentType: null,
        amount: null,
        cardNo: null,
        transactionNo: null,
        transactionDate: null,
        pin: pin
    };

    return callCrmWsConsumer(posWebContextPath + "/crmWsConsumer/validatePin/", crmReqParams);
}

/**
 * Method to call to renew membership
 * @param memberId, saleTx
 * @returns crmWsResponseObject
 */
function renewMembership(memberId, saleTx) {
    var transactionId = saleTx.transactionId;
    if (memberId && isMembershipToBeRenewed == true) {
        var crmReqParams = {
            id: memberId,
            store: null,
            paymentType: null,
            amount: null,
            cardNo: null,
            transactionNo: transactionId,
            transactionDate: null,
            store: null
        };

        return callCrmWsConsumer(posWebContextPath + "/crmWsConsumer/renewMembership/", crmReqParams);
    }
}


/**
 * Method to call CRM webservice consumer.
 */
function callCrmWsConsumer(wsUrl, requestParams) {
    var crmWsResponse = null;

    $.ajax({
        url: wsUrl,
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(requestParams),
        async: false,
        beforeSend: function() {
            $("#loadingDialogMessage").html(getMsgValue("crm_loading_msg1"));
            $("#loading-dialog").dialog("open");
        },
        complete: function() {
            $("#loading-dialog").dialog("close");
            $("#loadingDialogMessage").html("");
        },
        success: function(data, status) {
            if (status) {
                crmWsResponse = getWsResponse(data);
                addedCrmResponse = getWsResponse(data);
            }

        },
        error: function(jqXHR, status, error) {
            uilog("DBUG", error);
            crmWsResponse = {
                "type": "ERROR",
                "messageCode": "ERROR",
                "message": "CRM: " + error
            };
        }
    });

    return crmWsResponse;
}

/**
 * Method for creating paymentDetailList used in CRM request creation.
 */
function getItems(saleTx) {
    var itemDetailList = '';
    var delimeterProdQty = '!';
    var delimeterItems = '_';

    for (var i in saleTx.orderItems) {
        if (itemDetailList == '') {
            itemDetailList = itemDetailList + saleTx.orderItems[i].productId + delimeterProdQty + saleTx.orderItems[i].quantity;
        } else {
            itemDetailList = itemDetailList + delimeterItems + saleTx.orderItems[i].productId + delimeterProdQty + saleTx.orderItems[i].quantity;
        }
    }

    return itemDetailList;
}

/**
 * Method for creating paymentDetailList used in CRM request creation.
 */
function getPaymentDetail(payments, fieldName) {
    var paymentDetailList = '';
    var delimeter = ':';
    var ptCount = 0;
    var paymentCount = payments.length - 1;
    var totalPayment = 0;
    var lastPaymentMediaAmt = 0;
    var subTotalAmount = saleTx.totalAmount - getTotalDiscount(saleTx);
    subTotalAmount = subTotalAmount + saleTx.roundingAmount;

    //uilog("DBUG","fieldName : "+fieldName);
    for (var i in payments) {
        if (fieldName == 'paymentType') {
            paymentDetailList = paymentDetailList + setCrmPaymentType(payments[i].paymentMediaType) + delimeter;
            ptCount++;
        } else if (fieldName == 'amount') {
            totalPayment = totalPayment + parseInt(payments[i].amountPaid);
            if (paymentCount == ptCount && subTotalAmount < totalPayment) {
                lastPaymentMediaAmt = payments[i].amountPaid - (totalPayment - subTotalAmount);
            }
            if (lastPaymentMediaAmt != 0) {
                paymentDetailList = paymentDetailList + lastPaymentMediaAmt + delimeter;
            } else {
                paymentDetailList = paymentDetailList + payments[i].amountPaid + delimeter;
            }
            ptCount++;
        } else if (fieldName == 'cardNum') {
            if (payments[i].eftData) {
                paymentDetailList = paymentDetailList + payments[i].eftData.cardNum + delimeter;
            } else {
                paymentDetailList = paymentDetailList + null + delimeter;
            }
            ptCount++;
        }
    }

    //will remove excess delimeter.
    if (ptCount > 1) {
        var delimeterCount = paymentDetailList.match(/:/g).length;

        if (delimeterCount && delimeterCount == ptCount) {
            paymentDetailList = paymentDetailList.replace(/:([^:]*)$/, '' + '$1'); //will remove last ':'
        }
    } else {
        //will remove ':' if only 1 or no paymentType.
        paymentDetailList = paymentDetailList.replace(/:([^:]*)$/, '' + '$1');
    }

    //will set value to null if '' or ""
    if (paymentDetailList == '' || paymentDetailList == "") {
        paymentDetailList = null;
    }

    //uilog("DBUG","paymentDetailList : "+paymentDetailList);
    return paymentDetailList;
}


/**
 * Method to convert POS paymentType to CRM paymentType.
 *
 * @param posPaymentType
 * @returns crmPaymentType
 */
function setCrmPaymentType(posPaymentType) {
    return CONSTANTS.CRM_PAYMENT_TYPES[posPaymentType];
}

/**
 * Method for extracting CRM webservice response.
 */
function getWsResponse(wsResp) {
    var returnResp = wsResp;

    if (wsResp && wsResp.type) {
        if (wsResp.type == 'SUCCESS') {
            //uilog("DBUG","SUCCESS was found.");
        }
    } else if (wsResp) {
        returnResp = { isValidPin: wsResp };
    }

    return returnResp;
}

/**
 * Method to render Employee Reward to Cashier and Customer screen.
 * @param saleTx
 * @param transactionDate
 * @returns crmWsResponse
 */
function getPointReward(saleTx, transactionDate) {
    var crmWsResponse = null;

    if (saleTx && availEmpLoyaltyPoints && customerIdForReward && transactionDate) {
        crmWsResponse = getRewardPoints(customerIdForReward, saleTx, transactionDate);
        //		customerIdForReward = null;
    } else {
        uilog("DBUG", "Not valid to call CRM webservice.");
    }

    return crmWsResponse;
}

/**
 * Method to check if Member ID is allowed for scanner/manual input or both.
 *
 * @param inputType
 * @returns {Boolean}
 */
function isMemberIdInputTypeAllowed(inputType) {
    var allowInputType = false;
    var defaultAllowed = getConfigValue("CRM_MEMBERID_INPUT");

    if (inputType && defaultAllowed) {
        if (countString(defaultAllowed, inputType) > 0) {
            allowInputType = true;
        } else {
            if ($("#inputDisplay").val()) {
                $("div#numPad div#keyClr").triggerHandler('click');
            }
        }
    }
    return allowInputType;
}

/**
 * Pay with points
 *
 * @param totalCRMPoints
 */
function payWithPoints(saleTx) {

    toggleCRMPoints = true;

    var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.CRM_POINTS.name;
    currentPaymentMediaType = pymtMediaTypeName;
    var payment = crmPointsAmount;
    toggleCRMPayment = false;

    if (!customerIdForReward) {
        showMemberInputOptionDialog();
        saveSysMsg();
        enablePaymentMedia = false;
        promptSysMsg(getMsgValue('pos_label_input_member_id'), getMsgValue('pos_label_employee_loyalty_card'));
    } else if (customerIdForReward && null == customerPin) {
        showConfirmDialog(getMsgValue('pos_warning_change_member_id').format(customerIdForReward),
            "warning",
            function() {
                showMemberInputOptionDialog();
                customerIdForReward = null;
                $("#crm-dialog").dialog("close");
                promptSysMsg(getMsgValue('pos_label_input_member_id'), getMsgValue('pos_label_employee_loyalty_card'));
            },
            function() {
                enableCRMEnterPinDialog();
            });

    } else if (customerIdForReward && null != customerPin) {
        executePayWithPoints(saleTx, pymtMediaTypeName, payment);
    }

}

/**
 * Execute pay with points
 *
 * @param saleTx, pymtMediaTypeName, payment
 * @returns {Boolean}
 */
function executePayWithPoints(saleTx, pymtMediaTypeName, payment) {

    var crmResponse = isCustomerValidForReward(customerIdForReward, saleTx);

    totalCRMPoints = crmResponse.totalPoints;
    crmPointsAmount = null;

    if (isValidToRedeem(totalCRMPoints, pymtMediaTypeName, payment, saleTx.payments) && !crmResponse.loyaltyCardExpired) {
        CASHIER.executePaymentMedia(saleTx, pymtMediaTypeName, payment);
    } else {
        if (crmResponse.loyaltyCardExpired) {
            promptSysMsg('Membership has expired. Please select other payment media.', 'Membership Renewal');
        } else {
            promptSysMsg();
        }
        $("div#numPad div#keyTotal").click();
    }

    toggleCRMPayment = true;
    currentPaymentMediaType = null;
}

/**
 * Validate points to redeem
 *
 * @param totalCRMPoints, pymtMediaTypeName, payment, points
 * @returns {Boolean}
 */
function isValidToRedeem(totalCRMPoints, pymtMediaTypeName, payment, points) {

    var accumulatedCRMPointsDue = 0;
    var isValidToRedeem = false;

    if (points) {
        for (var i in points) {
            if (pymtMediaTypeName == points[i].paymentMediaType) {
                accumulatedCRMPointsDue = accumulatedCRMPointsDue + points[i].amountPaid;
            }
        }
        if ((accumulatedCRMPointsDue + payment) <= totalCRMPoints) {
            isValidToRedeem = true;
        } else {
            customerIdForReward = null;
            showMsgDialog(getMsgValue("pos_label_not_enough_points"), "warning");
        }
    } else if (payment <= totalCRMPoints) {

        isValidToRedeem = true;
    } else {
        customerIdForReward = null;
        showMsgDialog(getMsgValue("pos_label_not_enough_points"), "warning");
    }

    return isValidToRedeem;
}

function enableCRMEnterPinDialog() {
    var msg = "Please advise member to enter PIN.";
    $("#enterPin-message").dialog('option', 'title',
        'INFORMATION');
    $("#enterPin-message").dialog('option', 'buttons', {});
    $("#enterPinMsgReminder").html(msg);
    $("#enterPin-message").dialog("open");
    CustomerPopupScreen.cus_crmEnterPin();
}

/**
 * Method to render Employee Reward to Cashier and Customer screen.
 */
function sendCustomerPinToCustomer(isValidPin, status) {
    CustomerPopupScreen.cus_crmIsValidPin(isValidPin, status);
    if (!isValidPin) {
        customerPin = null;
    }
}

/**
 * Method to count instance of string within another string.
 */
function countString(str, search) {
    var count = 0;
    var index = str.indexOf(search);
    while (index != -1) {
        count++;
        index = str.indexOf(search, index + 1);
    }
    return count;
}

/*******************************************************************************
 * INSTALLMENT START
 ******************************************************************************/
function processInstallmentScan(barcode) {
    var installmentCompany = findInstallmentCompany(barcode);
    clearInputDisplay();

    if (!$.isEmptyObject(installmentCompany)) {
        $("#tenderNewAmount-dialog").data('barcode', barcode);
        installmentPaymentDetails = createInstallmentObj(installmentCompany,
            null, installmentPayent);
        //showEnterApplicationNumDialog(installmentCompany.companyName);
        showConfirmInstallmentCompanyDialog(installmentCompany.companyName);

    } else {
        showMsgDialog("Invalid Barcode", "warning");
    }

}

function findInstallmentCompany(barcode) {
    var isHTTPStatusOK = false;
    var data = $.ajax({
        url: posWebContextPath + "/cashier/getInstallmentCompany/" + barcode,
        type: "GET",
        async: false,
        dataType: "json",
        success: function(data, status) {
            if (!jQuery.isEmptyObject(data) && !data.error) {
                isHTTPStatusOK = true;
            }
        }
    }).responseText;

    return (isHTTPStatusOK) ? JSON.parse(data) : null;
}

function createInstallmentObj(installment, applicationNum, amount) {
    var posInstallment = {
        applicationNumber: applicationNum,
        installmentPaymentDTO: installment,
        amount: amount
    };

    return posInstallment;
}

function showApplicationNumConfirmDialog(appNumber) {
    $("#installmentConfirmAppNum-dialog").data("applicationNum", appNumber)
        .dialog("open");
}

function showEnterApplicationNumDialog() {
    $("#installmentAppNum-dialog").dialog("open");
}

function processInstallment(appNum) {
    if (installmentPaymentDetails && appNum) {
        //uilog("DBUG","saving installment");
        installmentPaymentDetails.applicationNumber = appNum;
        installmentPaymentDetails.amount;
        // BUG FIX for multi payment installment but maybe make add disc for installment not working
        //= CASHIER.getFinalSubtotalTxAmount(saleTx);
        enablePaymentMedia = true;

        CASHIER.executePaymentMedia(saleTx,
            CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name,
            installmentPaymentDetails.amount, {
                installmentPayment: installmentPaymentDetails
            });

    }
}

function refreshInstallment() {
    isInstallmentTransaction = false;
    // DEBUG ROUNDING AMOUNT
    if (saleTx && saleTx.memberDiscReversal && saleTx.memberDiscReversal != 0 && saleTx.roundingAmount) {
        saleTx.totalDiscount += saleTx.roundingAmount;
        saleTx.totalChange += saleTx.roundingAmount;
    }
    //See BUG#87911 - Its OK not to reset the value for installmentPayent here since every new installment transactions retrieves the amount from inputDisplay text field.
    //We are not clearing it for scenarios where the cashier choses to cancel the transaction but then decided to continue for some reason
    //installmentPayent = null;
    installmentPaymentDetails = null;
}

function showConfirmInstallmentCompanyDialog(companyName) {
    var confirmMsg = getMsgValue('installment_company_confirm_msg');

    $("#installmentConfirmCompany-dialog").data("companyName", companyName)
        .data("confirmMsg", confirmMsg).dialog("open");
}

function startInstallment() {
    promptSysMsg(getMsgValue("installment_scan_company_barcode_msg"));
    isInstallmentTransaction = true;
    clearInputDisplay();
}

/*******************************************************************************
 * INSTALLMENT END
 ******************************************************************************/

/*******************************************************************************
 * Appliance And Extra Warranty Start
 ******************************************************************************/
//function isExtraWarrantyItem(item) {
//	if (item && item.categoryId && item.categoryId.toLowerCase() == "xwarranty") {
//		return true;
//	} else {
//		return false;
//	}
//}

//function isWarrantyItemCanBeAdded() {
//	// it is assumed that the current scanned item is a warranty item
//
//	var canBeAdded = true;
//	if (itemQty > 1) {
//		canBeAdded = false;
//	} else if (isSaleHasWarrantyItem()) {
//		canBeAdded = false;
//	} else {
//		// check if sale has already other items
//		var summarizedOrderItems = getSummarizeSaleItems(saleTx);
//		for ( var i in summarizedOrderItems) {
//			var orderItem = summarizedOrderItems[i];
//			var productId = orderItem.productId;
//			if (!applianceAndWarranty.scannedWarrantyItems[productId]
//					&& orderItem.quantity > 0) {
//				canBeAdded = false;
//			}
//		}
//	}
//	return canBeAdded;
//}

//function isSaleHasWarrantyItem() {
//	var hasWarrantyItem = false;
//	var summarizedOrderItems = getSummarizeSaleItems(saleTx);
//	for ( var i in summarizedOrderItems) {
//		var orderItem = summarizedOrderItems[i];
//		var productId = orderItem.productId;
//		if (applianceAndWarranty.scannedWarrantyItems[productId]
//				&& orderItem.quantity > 0) {
//			hasWarrantyItem = true;
//		}
//	}
//	return hasWarrantyItem;
//}

//function setWarrantyItemToBeValidated() {
//	var summarizedOrderItems = getSummarizeSaleItems(saleTx);
//	for ( var i in summarizedOrderItems) {
//		var orderItem = summarizedOrderItems[i];
//		var productId = orderItem.productId;
//		if (applianceAndWarranty.scannedWarrantyItems[productId]
//				&& orderItem.quantity == 1) {
//			applianceAndWarranty.warrantyItemForValidation = applianceAndWarranty.scannedWarrantyItems[productId];
//		}
//	}
//}

//function createApplianceAndWarrantyObj() {
//	var obj = {
//		"scannedWarrantyItems" : {},
//		"isSaleHasWarrantyItem" : false,
//		"warrantyItemForValidation" : null,
//		"isWarrantyValidated" : false
//	};
//	return obj;
//}

//function recallTxPopulateWarrantyItems(){
//	applianceAndWarranty = createApplianceAndWarrantyObj();
//	var summarizedOrderItems = getSummarizeSaleItems(saleTx);
//	for ( var i in summarizedOrderItems) {
//		var orderItem = summarizedOrderItems[i];
//		var productId = orderItem.productId;
//		if (orderItem.categoryId && orderItem.categoryId.toLowerCase() == "xwarranty"
//				&& orderItem.quantity == 1) {
//			applianceAndWarranty.isSaleHasWarrantyItem = true;
//			applianceAndWarranty.scannedWarrantyItems[productId] = productId;
//		}
//	}
//}
/*******************************************************************************
 * Appliance And Extra Warranty End
 ******************************************************************************/

function initPOSFnBtns() {
    // TODO : only specific buttons will be disabled depending on the POS
    // Terminal
    $("div#fnPad .button-menu").removeClass("button-menu").addClass(
        "disabled-button-menu").unbind("click");
}

/*******************************************************************************
 * START : Donation(valid only for Cash payment media)
 ******************************************************************************/
var DONATION = DONATION || {};

DONATION.DonationSaleTxEntendedField = function(donationAmount) {
    // The rest of the saleTx field plus the item/s below:

    this.donationAmount = (donationAmount) ? donationAmount : 0;
};

/**
 * Accepted Sale transaction type in Donation feature.
 */
DONATION.ACCEPTED_TX_TYPES = [
    CONSTANTS.TX_TYPES.SALE.name
];

DONATION.ACCEPTED_PAYMENT_MEDIA_TYPES = [
    CONSTANTS.PAYMENT_MEDIA_TYPES.CASH.name
];

DONATION.processDonation = function(saleTx,
    paymentMediaType,
    payment) {
    var outerProcessDonationDefer = $.Deferred();
    var isValidForDonation = false;
    var donationMinimumAmountConfig = parseInt(getConfigValue('DONATION_MINIMUM_AMOUNT'));
    if (saleTx &&
        saleTx.type
        // Check if sale transaction type is within the array of ACCEPTED_TX_TYPES
        &&
        ($.inArray(saleTx.type, DONATION.ACCEPTED_TX_TYPES) > -1)
        // Check if payment media type is within the array of DONATION.ACCEPTED_PAYMENT_MEDIA_TYPES
        &&
        ($.inArray(paymentMediaType, DONATION.ACCEPTED_PAYMENT_MEDIA_TYPES) > -1) &&
        donationMinimumAmountConfig &&
        PAYMENT_MEDIA.isValidAsLastPaymentWithoutConfig(saleTx,
            (payment - donationMinimumAmountConfig))
    ) {
        /* Is valid for donation.
         */
        isValidForDonation = true;
        // If null, set the default ZERO amount
        saleTx.totalAmountPaid = saleTx.totalAmountPaid || 0;
        var changeDueAmount = (saleTx.totalAmountPaid + payment) - (CASHIER.getFinalSaleTxAmount(saleTx));
        /**
         * JQuery piping, for linking multiple asynchronously trigger dialog buttons.
         * @author http://stackoverflow.com/questions/12274114/sequencing-function-calls-in-javascript-are-callbacks-the-only-way
         */
        outerProcessDonationDefer.resolve();
        outerProcessDonationDefer.promise()
            .pipe(function() {

                var innerProcessDonationDefer = $.Deferred();
                showAmountConfirmationDialog(
                    getMsgValue('confirm_lbl_donation_amount'),
                    getMsgValue('pos_label_payment_enter_descriptive_amount')
                    .format(getMsgValue('pos_label_donation')),
                    changeDueAmount,
                    function(donationAmountEntered,
                        $amountConfirmDialog,
                        $amountDialogConfirmInput,
                        $amountDialogConfirmErrorMsg) {
                        var isValid = false;

                        // Conditions
                        var isAmountAboveZero = donationAmountEntered && donationAmountEntered > 0;
                        var isLessThanEqToChangeDue = donationAmountEntered <= changeDueAmount;
                        var isAllowableToMinimumAmount = donationMinimumAmountConfig && donationAmountEntered >= donationMinimumAmountConfig;

                        isValid = isAmountAboveZero && isLessThanEqToChangeDue && isAllowableToMinimumAmount;
                        // If confirmed or not
                        var isConfirmed = false;

                        if (isValid) {
                            // Clearing the error message value.
                            $amountDialogConfirmErrorMsg.html("");
                            // Confirmation dialog: Are you sure or not?
                            showConfirmDialog(
                                getMsgValue('confirm_msg_donation_amount_confirmation').format(numberWithCommas(donationAmountEntered)),
                                getMsgValue('confirm_lbl_action_confirmation'),
                                function() {
                                    $.extend(saleTx, new DONATION.DonationSaleTxEntendedField(donationAmountEntered));
                                    /*
                                     * Closing the showAmountConfirmationDialog()
                                     * function's underlying dialog
                                     */
                                    $amountConfirmDialog.dialog('close');
                                    isConfirmed = true;
                                    // Proceeds to CASHIER.executePaymentMedia()
                                    innerProcessDonationDefer.resolve();
                                }
                            );
                        } else {
                            var amountBoundary = (isNaN(donationAmountEntered)) ? 0 : (!isLessThanEqToChangeDue) ? changeDueAmount : donationMinimumAmountConfig;
                            var errMsgCode;

                            if (!isLessThanEqToChangeDue)
                                errMsgCode = 'pos_warning_msg_donation_more_than_change_due';
                            else if (!isAllowableToMinimumAmount)
                                errMsgCode = 'pos_warning_msg_donation_less_than_min_amount';
                            else
                                errMsgCode = 'pos_warning_msg_invalid_amount';

                            // Display error message.
                            $amountDialogConfirmErrorMsg.html(getMsgValue(errMsgCode).format(numberWithCommas(amountBoundary)));
                            // Setting the value to amount boundary
                            $amountDialogConfirmInput.val(numberWithCommas(amountBoundary));
                        }
                        // tells showAmountConfirmationDialog() dialog to whether or NOT to terminate itself.
                        return isValid &&
                            isConfirmed;
                    },
                    function() {
                        // Proceeds to CASHIER.executePaymentMedia()
                        innerProcessDonationDefer.resolve();
                    });
                return innerProcessDonationDefer.promise();

            }).pipe(function() {
                CASHIER.executePaymentMedia(saleTx, paymentMediaType, payment);
            });
    }
    return isValidForDonation;
};
/*******************************************************************************
 * END : Donation
 ******************************************************************************/

/**
 * Saving of start date time and end date time of Temporary Sign Off
 * Data saved will be used in Productivity Report
 */

function saveTempOffDetails(tempSignOffData) {
    if (tempSignOffData) {
        $.ajax({
            url: posWebContextPath + "/cashier/saveTempSignOff",
            type: "POST",
            async: false,
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(tempSignOffData),
            success: function(response) {
                //uilog("DBUG","Temp Sign Off saved.");
            },
            error: function(jqXHR, status, error) {
                uilog("DBUG", "Temp Sign Off saving failed. " + error);
            }
        });
    }
}

/********************************************************************************
 * START: Functions for Regular reminders
 ********************************************************************************/
function getRegularReminders() {
    return JSON.parse($.ajax({
        url: posWebContextPath + "/cashier/getRegularReminders",
        type: "GET",
        async: false,
        dataType: "json",
        data: {},
        error: function(jqXHR, status, error) {
            promptSysMsg('Error getting regular reminders');
        }
    }).responseText);
}

/**
 * Save regular reminders to cache
 */
function saveRegularReminders() {
    if (regularReminders.length == 0) {
        regularReminders = $("#systemMessageDiv img").map(function() {
            return $(this).attr("src");
        }).get();
    }
}

/**
 * Display regular reminders from cache
 */
function displayRegularReminders() {
    $("#systemMessageDiv").empty();
    // display regular reminders
    var div;
    if (regularReminders.length > 1) {
        div = $("<div></div>").attr("id", "pos-cashier-regular-reminder").addClass("slideshow");
        for (var i = regularReminders.length - 1; i >= 0; i--) {
            var img = $("<img></img>").attr("src", regularReminders[i]).addClass("img");
            div.append(img);
        }
    } else {
        div = $("<div></div>").attr("id", "pos-cashier-regular-reminder-single").addClass("slideshow");
        var img = $("<img></img>").attr("src", regularReminders[0]).addClass("img");
        div.append(img);
    }

    var sysMsg1 = $("<h4></h4>").text("REGULAR REMINDER");
    var sysMsg2 = $("<p></p>").append(div);
    $("#systemMessageDiv").append(sysMsg1);
    $("#systemMessageDiv").append(sysMsg2);
}
/********************************************************************************
 * END: Functions for Regular reminders
 ********************************************************************************/
/********************************************************************************
 * START: TRAINING MODE
 ********************************************************************************/
var TRANING_MODE = TRANING_MODE || {};

TRANING_MODE.addTrialModeProperty = function(objToAppendProperty) {
    var keyTrialMode = "trialMode";
    if (objToAppendProperty) {
        objToAppendProperty[keyTrialMode] = true;
    }
};

/********************************************************************************
 * END: TRAINING MODE
 ********************************************************************************/

/*************************************************
 * Product Object
 *************************************************/
var Product = function(product) {
    var ean13Code = product.ean13Code;
    var name = product.name;
    var shortDesc = product.shortDesc;
    var currentPrice = product.currentPrice;
    var categoryId = product.categoryId;
    var isTaxInclusive = product.isTaxInclusive;
    var plu = product.plu;
    var sku = product.sku;
    var promotions = product.promotions;
    var description = product.description;
};

/*******************************************************************************
 * START : CUSTOMER PAGE FUNCTIONS
 ******************************************************************************/

/**
 * Customer Page change trigger
 */
function changeCustomerActiveScreen(custPageScreenType) {
    CustomerPopupScreen.cus_renderActiveScreen(custPageScreenType);
}

/*
 * Task #88139 - This method switches Co-brand and Customer Card buttons if terminal is HYPERCASH
 * Client-side switching of buttons
 */
function switchCustomerCardCoBrandButtons() {
    var txtCoBrand = $("#keyCobra > div.label-cal").text();
    var txtCustCard = $("#proCustomer > div.label").text();

    $("#keyCobra").attr("id", "tempProCustomer");
    $("#proCustomer").attr("id", "tempCobra");

    $("#tempProCustomer > div.label-cal").text(txtCustCard);
    $("#tempCobra > div.label").text(txtCoBrand);

    $("#tempProCustomer").attr("id", "proCustomer");
    $("#tempCobra").attr("id", "keyCobra");
}

/*******************************************************************************
 * END : CUSTOMER PAGE FUNCTIONS
 ******************************************************************************/

/**
 * Checks if product is fresh goods.
 */
function isFreshGoods(data) {

    if (data &&
        data.ean13Code
        //&& data.ean13Code.length == 13 No more limitations for price length
        &&
        startsWithFreshGoodsBarcode(data.ean13Code)) {
        return true;
    } else {
        return false;
    }
}

// voidDeptStore 2017022
function isDeptStoreItem(data) {
    return (data && (data.categoryId === 'DEPTSTORE' || (data.categoryId != 'DEPTSTORE' && isDeptstore))) ? true : false;
}
// voidDeptStore 2017022

function startsWithFreshGoodsBarcode(barcode) {

    var freshGoodsIndicators = getConfigValue("FRESH_GOODS_INDICATOR");
    var freshGoodsArray = [];

    if (freshGoodsIndicators) {
        freshGoodsArray = freshGoodsIndicators.split(",");
    } else {
        freshGoodsArray.push("20");
        freshGoodsArray.push("21");
    }

    for (var i = 0; i < freshGoodsArray.length; i++) {

        if (barcode && barcode.toString().startsWith(freshGoodsArray[i])) {
            return true;
        }
    }
    return false;
}

function isWeightSupplied(data) {
    var result = false;

    if (saleTx.type == CONSTANTS.TX_TYPES.REFUND.name) {
        return false;
    }

    if (isFreshGoods(data) && data.weight && data.weight > -1) {
        result = true;
    }

    return result;
}

function calculateWeightedPrice(quantity, unitPrice) {
    return Math.round(((quantity * 1000) * unitPrice) / 1000);
}

function inhibitMultipler(barcodeToScan) {
    var freshGoodsScanMode = getConfigValue("FRESH_GOODS_SCAN_MODE");

    if (freshGoodsScanMode && freshGoodsScanMode == "2" &&
        itemQty > 1 && startsWithFreshGoodsBarcode(barcodeToScan)) {
        return true;
    }

    return false;
}

function isToProcessFreshBarcode(barcode) {
    var minBarcodeLength = 13; //TODO: make configurable
    var maxBarcodeLength = 14; //TODO: make configurable

    if (startsWithFreshGoodsBarcode(barcode) &&
        (barcode.length < minBarcodeLength || barcode.length > maxBarcodeLength)) {
        showMsgDialog(getMsgValue('pos_warning_msg_file_not_found'), "warning");
        return false;
    }

    return true;
}



//HYPERCASH
var isHcEnabled = false;
var isProCustScan = false;
var profCust;
var isRevisedTxn = false;
var isDeptstore = false;

function initHypercash() {
    isHcEnabled = 'HYPERCASH' == configuration.terminalType;

    if (isHcEnabled) {
        switchCustomerCardCoBrandButtons();
    } else {
        //$('#reviseTxn div').text('X');
        $('#reprintInv div').text('X');
        $('#proCustomer div').text('X');
    }
}

function initDeptstore() {
    if (configuration.terminalType == 'DEPTSTORE') {
        isDeptstore = true;
    }
}

function printFullReceipt() {
    reprintReceiptDetails(saleTx, 0, true);
}

function startProfCust(customer) {
    profCust = CRMAccountModule.Hypercash.startProfCust(customer);
    suppressPrinting = true;
    //isHcMember = profCust.customerNumber && profCust.customerNumber != getConfigValue('HC_NON_MEMBER_DEF_CARDNO');
    if (isHcMember) {
        saleTx.customerId = profCust.customerNumber;
    }
    saleTx.profCust = profCust;
    saveTxn();
}

function endProfCustTxn() {
    suppressPrinting = false;
    //printFullReceipt();
    //profCust = {}; Should only be emptied if new order is about to start; Will affect label in receipt
    CRMAccountModule.Hypercash.resetCrmOfflineVariables();
    isRevisedTxn = false;
    renderCustomerInfo();
}

function renderCustomerInfo(name, id) {
    console.log("Masuk renderCustomerInfo");
    displayCustomerInfo(name, id);
    CustomerPopupScreen.cus_renderCustomerInfo(name, id);
}

/**
 *  TVS START **********************************
 */
function getPriceOverrideOfProduct(productId) {
    var tVSProductPriceOverride = JSON.parse($.ajax({
        url: posWebContextPath + "/tvs/getLatestOverridePriceOfProduct/" + productId,
        type: "GET",
        async: false,
        dataType: "json",
        success: function(data, status) {
            //uilog("DBUG","getLatestOverridePriceOfProduct success");
        },
        error: function(jqXHR, status, error) {
            showMsgDialog('Error: ' + error, "error");
        }
    }).responseText);

    if (tVSProductPriceOverride.id == null) {
        tVSProductPriceOverride = null;
    }

    return tVSProductPriceOverride;
}

function addProductPriceOverrideToMap(productId, price) {
    var priceOverride = createTVSProductPriceOverrideObject();
    priceOverride.productId = productId;
    priceOverride.recentPriceUnit = price;
    tVSProductPriceOverrideMap[productId] = priceOverride;
}

function saveTVSProductPriceOverrideMap(map) {
    var productOverrideList = [];
    for (var i in map) {
        productOverrideList.push(map[i]);
    }
    saveTVSProductPriceOverrideList(productOverrideList);
}

function saveTVSProductPriceOverrideList(productPriceOverrideList) {
    $.ajax({
        url: posWebContextPath + "/tvs/saveTVSProductPriceOverrideList",
        type: "POST",
        async: false,
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify(productPriceOverrideList),
        success: function(data, status) {
            //uilog("DBUG","saveTVSProductPriceOverride success");
        },
        error: function(jqXHR, status, error) {
            uilog('DBUG', 'Error Saving saveTVSProductPriceOverride: ' + error.message);
        }
    });
}

function saveTVSTransaction(tvsTx) {
    $.ajax({
        url: posWebContextPath + "/tvs/saveTVSTransaction",
        type: "POST",
        async: false,
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify(tvsTx),
        success: function(data, status) {
            //uilog("DBUG","saveTVSTransaction success");
        },
        error: function(jqXHR, status, error) {
            uilog('DBUG', 'Error Saving saveTVSTransaction: ' + error.message);
        }
    });
}

function processTVS(tx) {
    if (toggleTVS) {
        saveTVSProductPriceOverrideMap(tVSProductPriceOverrideMap);

        var tvsTx = createTVSTransactionObject();
        tvsTx.approverUserId = tVSTxApproverUserId;
        tvsTx.txId = tx.transactionId;
        saveTVSTransaction(tvsTx);
    }
}

function createTVSProductPriceOverrideObject() {
    return {
        id: null,
        productId: null,
        recentPriceUnit: null,
        salesDate: null
    };
}

function createTVSTransactionObject() {
    return {
        txId: null,
        tx: null,
        salesDate: null,
        approverUserId: null
    };
}

function isOverrideValueValid(newPrice, originalPrice) {
    var isValid = true;
    var overrideThreshold = parseFloat(getConfigValue('TVS_OVERRIDE_THRESHOLD'));
    var priceThreshold = originalPrice * (overrideThreshold / 100);
    var priceDifference = Math.abs(newPrice - originalPrice);

    /*if(newPrice > originalPrice){
    	isValid = false;
    }else */
    if (priceDifference > priceThreshold) {
        isValid = false;
    }
    return isValid;
}

function clearTVS() {
    toggleTVS = false;
    tVSProductPriceOverrideMap = {};
    tVSTxApproverUserId = null;

    isAuthenticated = false;
    isPreAuthenticated = false;
}

function activateTVS() {
    promptSysMsg(" ", "OPEN PRICE ACTIVATED");
    tVSTxApproverUserId = $("#authFormUsername").val();
}

function isTVSOpenPrice(product) {
    var isOpenPrice = false;
    if (product.categoryId && product.categoryId == '1') {
        isOpenPrice = true;
    }
    return isOpenPrice;
}

function processRecalledSaleTVS() {
    if (saleTx.toggleTVS) {
        var orderItems = saleTx.orderItems;
        toggleTVS = true;
        activateTVS();
        tVSTxApproverUserId = saleTx.tVSTxApproverUserId;

        for (var i in orderItems) {
            var orderItem = orderItems[i];
            if (orderItem.originalPriceUnit) {
                addProductPriceOverrideToMap(orderItem.productId, orderItem.priceUnit);
            }
        }
    }
}
/**
 *  TVS END ************************************
 */

/**
 * Returns all stored transaction ids on current terminal
 *
 * @param userId: used to filter results by userId (optional)
 */
function getStoredTxns(userId) {
    userId = userId || null;
    var storedTxns = [];
    $.ajax({
        url: proxyUrl + '/getStoredTxns',
        async: false,
        type: 'GET',
        dataType: 'json',
        data: { userId: userId },
        contentType: 'application/json',
        success: function(response) {
            storedTxns = response;
        }
    });

    return storedTxns;
}

/**
 * Display logout authentication dialog
 */
function showLogoutAuthDialog() {
    var defer = $.Deferred();
    toggleLogout = true;
    $("#authentication-form").removeData(AUTH_DATA_KEYS)
        .data('roles', ['ROLE_SELF'])
        .data('defer', defer)
        .data('action', 'LOGOUT')
        .dialog("open");

    /*
     * JQuery Deffered, used for chaining callbacks
     * @author http://api.jquery.com/jQuery.Deferred/
     */
    defer.promise()
        .done(function() {

            // set to default value
            toggleLogout = false;
            // TODO : must be pulled from somewhere
            isUserBarcodeRequired = true;
            /*
             * Display items in customer page
             *
             * Displays the "NEXT CASHIER PLEASE"
             */
            changeCustomerActiveScreen(
                CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.NEXT_CASHIER
            );
            // sign-off open Cashier Drawer
            DrawerModule.openDrawerOnLogout();
            // Logout-ing the user
            location.href = posWebContextPath + "/resources/j_spring_security_logout";
        });
}


/**
 * Get transaction data by ID and within current business date
 *
 * @param txnId
 */
function getTodayTxn(txnId) {
    var txn = null;
    $.ajax({
        url: posWebContextPath + "/cashier/getTodayTxn/" + txnId,
        type: "GET",
        async: false,
        dataType: "json",
        success: function(response) {
            if (response && response.transactionId) {
                var isGoodsTxType = !CONSTANTS.NON_GOODS_TX_TYPES.findTxTypeByName(response.type);
                if (isGoodsTxType) {
                    // The inverse of PAYMENT_MEDIA.finalizeSaleTxLastPaymentAmount()
                    txn = PAYMENT_MEDIA.toRawSaleTxLastPaymentAmount(response);
                } else {
                    txn = response;
                }
            }
        }
    });
    return txn;
}

function reApplyEmployeeDiscount() {
    if (saleTx.employeeDiscountToggled) { //|| isEmployeeDiscountEnabled()) {
        //applyEmployeeDiscount();
    }
}


//SPECIAL DISCOUNT
function applyEmployeeDiscount() {
    if (isEmployeeDiscountEnabled() || saleTx.employeeDiscountToggled) {
        var listItemInclusions = getItemInclusion(saleTx.orderItems);

        saleTx.employeeDiscountToggled = true;
        var empDiscType = getConfigValue("EMP_DISC_TYPE");
        var forvalid = false;

        //INCLUSION
        if (empDiscType === "INCLUSION") {
            for (var i = 0; i < saleTx.orderItems.length; i++) {
                var item = saleTx.orderItems[i];
        
                if (!item.discBtnApplied && isValidForEmployeeDiscount(item.plu)) {
                    var percentageDisc = alloPaylaterDiscountToggled ? getConfigValue("ALLO_PAYLATER_DISC") : 0;
        
                    var inclusionItem = listItemInclusions.find(function (inclusion) {
                        return inclusion.sku === item.sku.substr(0, 11);
                    });
        
                    if (inclusionItem && inclusionItem.discount !== undefined) {
                        percentageDisc = inclusionItem.discount;
                    } else {
                        cobrandItem = findItem(item.ean13Code);
                        console.log(cobrandItem);
                        var targetValue = "056700";
                        var barcodeFound = false;
        
                        if (cobrandItem && cobrandItem.promotions) {
                            var promotions = cobrandItem.promotions;
                            var itemPromotionLength = promotions.length;
        
                            for (var j = 0; j < itemPromotionLength; j++) {
                                if (promotions[j].coBrandNumber.indexOf(targetValue) !== -1) {
                                    if (promotions[j].promotionType === "M" && promotions[j].discountType === "2") {
                                        percentageDisc = promotions[j].percentDiscount;
                                        console.log("coBrandNumber:", promotions[j].coBrandNumber);
                                        console.log("promotionType:", promotions[j].promotionType);
                                        console.log("discountType:", promotions[j].discountType);
                                        console.log("Percent Discount coBrand : " + percentageDisc);
                                        barcodeFound = true;
                                        break;
                                    }
                                }
                            }
                        } else {
                            console.log("CobrandItem tidak ditemukan atau tidak memiliki properti 'promotions'.");
                        }
                    }
        
                    var empDiscPer = parseInt(percentageDisc) / 100;
                    var forvalid = isValidForItemExclusion(listItemInclusions, item.sku);
                    if (forvalid || barcodeFound) {
                        var totalDiscount = (item.discountAmount ? item.discountAmount : 0) +
                            (item.secondLayerDiscountAmount ? item.secondLayerDiscountAmount : 0) +
                            (item.crmMemberDiscountAmount ? item.crmMemberDiscountAmount : 0);

                        if (!saleTx.memberDiscReversal) {
                            totalDiscount += item.memberDiscountAmount ? item.memberDiscountAmount : 0;
                        }

                        var discountedSubtotal = item.priceSubtotal - totalDiscount;

                        if (isHcEnabled && profCust.memberType != 'PROFESSIONAL') {
                            discountedSubtotal += Hypercash.service.computeMarkUpWithoutTax(item);
                        }

                        var employeeDiscount = Math.round(discountedSubtotal * empDiscPer);
                        item.discBtnAmount = employeeDiscount;
                        item.discPercentage = percentageDisc;

                        if (item.salesType == CONSTANTS.TX_TYPES.SALE_VOID.name) {
                            saleTx.voidedDiscount += employeeDiscount;
                        } else if (item.salesType == CONSTANTS.TX_TYPES.SALE.name) {
                            saleTx.totalDiscount += employeeDiscount;
                            console.log(saleTx)
                        }

                        item.discBtnApplied = true;
                    }
                }
            }
        } else {
            var percentageDisc = (alloPaylaterDiscountToggled? getConfigValue("ALLO_PAYLATER_DISC") : getConfigValue("EMP_DISC_PERCENTAGE"))
            var empDiscPer = parseInt(percentageDisc) / 100;

            saleTx.orderItems.forEach(function (item) {
                if (!item.discBtnApplied && isValidForEmployeeDiscount(item.plu)) {
                    var forvalid = !isValidForItemExclusion(listItemInclusions, item.sku);

                    if (forvalid) {
                        var totalDiscount = (item.discountAmount ? item.discountAmount : 0) +
                            (item.secondLayerDiscountAmount ? item.secondLayerDiscountAmount : 0) +
                            (item.crmMemberDiscountAmount ? item.crmMemberDiscountAmount : 0);

                        if (!saleTx.memberDiscReversal) {
                            totalDiscount += item.memberDiscountAmount ? item.memberDiscountAmount : 0;
                        }

                        var discountedSubtotal = item.priceSubtotal - totalDiscount;

                        if (isHcEnabled && profCust.memberType != 'PROFESSIONAL') {
                            discountedSubtotal += Hypercash.service.computeMarkUpWithoutTax(item);
                        }

                        var employeeDiscount = Math.round(discountedSubtotal * empDiscPer);
                        item.discBtnAmount = employeeDiscount;

                        if (item.salesType == CONSTANTS.TX_TYPES.SALE_VOID.name) {
                            saleTx.voidedDiscount += employeeDiscount;
                        } else if (item.salesType == CONSTANTS.TX_TYPES.SALE.name) {
                            saleTx.totalDiscount += employeeDiscount;
                        }

                        item.discBtnApplied = true;
                    }
                }
            });
        }

        renderTotal();
    } else {
        showMsgDialog(getMsgValue("pos_error_msg_employee_discount_disabled"), "error");
    }
}


function isEmployeeDiscountEnabled() {
    var startTimeString = getConfigValue("EMP_DISC_START_TIME"),
        endTimeString = getConfigValue("EMP_DISC_END_TIME"),
        discountStart = new Date(startTimeString),
        discountEnd = new Date(endTimeString),
        now = new Date();
    return (discountStart <= now) && (now <= discountEnd);
}

function EmployeeThrMaxAmount(totalAmountDiscount) {
    var empDiscThrMax = parseInt(getConfigValue("EMP_DISC_THR_MAX"));
    if(totalAmountDiscount >= empDiscThrMax){
        return false
    }
    return true;
}


function getItemInclusion(orderItems){

    var empDiscType = getConfigValue("EMP_DISC_TYPE");

    var listSku = [];
    var skuInclusions = [];
    orderItems.forEach(item => {
        listSku.push(item.sku.substr(0, 11));
    });

    $.ajax({
        url: posWebContextPath + "/cashier/thr/getItemNonPromos/",
        type: "POST",
        async: false,
        dataType: "json",
        data : JSON.stringify({
            "sku": listSku,
            "type": empDiscType
        }),
        success: function(response) {
            if (response['result'] && Array.isArray(response['result'])) {
                skuInclusions = response['result'];
            }
        }
    });
    return skuInclusions;
}

function isValidForItemExclusion(inclusions, sku) {
    return inclusions.some(function(el) {
        return el.sku === sku.substr(0, 11);
    }); 
}

function isValidForEmployeeDiscountItemExclusion(sku) {
    var isValid = true;
    var skucut = sku.substr(0, 11);
    $.ajax({
        url: posWebContextPath + "/cashier/thr/getItemNonPromo/" + skucut,
        type: "GET",
        async: false,
        dataType: "json",
        success: function(response) {
            if (!response.error) {
                isValid = response;
            }
        }
    });
    return isValid;
}


function isValidForEmployeeDiscount(plu) {
    var isValid = false;
    $.ajax({
        url: posWebContextPath + "/cashier/isValidForEmpDisc/" + plu,
        type: "GET",
        async: false,
        dataType: "json",
        success: function(response) {
            if (!response.error) {
                isValid = response;
            }
        }
    });
    //uilog("DBUG", isValid);
    return isValid;
}



function revertEmployeeDiscount() {
    if (saleTx.employeeDiscountToggled) {
        saleTx.orderItems.forEach(function(item) {
            if (item.discBtnApplied) {
                if (item.salesType == CONSTANTS.TX_TYPES.SALE_VOID.name) {
                    saleTx.voidedDiscount -= item.discBtnAmount;
                } else if (item.salesType == CONSTANTS.TX_TYPES.SALE.name) {
                    saleTx.totalDiscount -= item.discBtnAmount;
                }
                item.discBtnAmount = 0;
                item.discBtnApplied = false;
            }
        });
    }
}

function calculateEmployeeDiscountTotal(tmpSaleTx) {
    var summarizedOrderItems = getSummarizeSaleItems(tmpSaleTx);
    var employeeDiscountTotal = 0;
    for (var i = 0; i < summarizedOrderItems.length; i++) {
        var itemEmpDisc = parseFloat(summarizedOrderItems[i].discBtnAmount);
        if (!isNaN(itemEmpDisc)) {
            employeeDiscountTotal += itemEmpDisc;
        }
    }
    return employeeDiscountTotal;
}

function unsetEmployeeDiscountProperties() {
    delete saleTx.employeeDiscountToggled;
    for (var i = 0; i < saleTx.orderItems.length; i++) {
        delete saleTx.orderItems[i].plu;
        delete saleTx.orderItems[i].discBtnApplied;
    }
}

function printCashierInformation() {
    printReceipt({
        header: setReceiptHeader(saleTx),
        footer: setReceiptCashierInfo(saleTx)
    });
}

/**
 * Checks product is it is as installment item.
 * Checks if product_promotion has cmc card number which considered as installment item.
 */
function isInstallmentItem(data) {

    var memberPromo = getSinglePromo(data, CONSTANTS.PROMOTION_TYPES.MEMBER_COBRAND_PROMOTION);
    if (memberPromo) {
        return true;
    }
    return false;
}

/**
 * Ajax call to get voided transaction.
 */
function getVoidedTransaction(txnId) {
    var VoidTx = null;
    $.ajax({
        url: posWebContextPath + "/cashier/getVoidedTransaction/" + txnId,
        type: "GET",
        async: false,
        dataType: "json",
        success: function(response) {
            if (!jQuery.isEmptyObject(response) && !response.error) {
                VoidTx = response;
            } else {
                showMsgDialog(getMsgValue('pos_warning_msg_void_transaction_not_found'), "warning");
            }
        }
    });
    return VoidTx;
}

/*
 * Searches POS transaction by specified transaction ID.
 * @return if has match, returns in form of PosTransactionDTO; else, returns null.
 */
function findTxnByTxnId(transactionId) {
    var txn = null;

    $.ajax({
        url: posWebContextPath + "/cashier/getTxn/" + transactionId,
        type: "GET",
        async: false,
        dataType: "json",
        success: function(response) {
            if (!jQuery.isEmptyObject(response) && !response.error) {
                txn = JSON.parse(JSON.stringify(response));
            }
        },
        error: function(jqXHR, status, error) {}
    });

    return txn;
}

// CR RETURN
function clearReturnDialog(__section) {
    $("#returnInfoLabel").html('');
    $("#returnTableHead").html('');
    $("#returnTableBody").html('');
}
// CR RETURN

// INDENT 2017-05-18
//INDENT SALES button
$("div#fnPad div#indentSales").click(function() {
    if (!hasScannedItem(saleTx)) {
        $("#indentSales-dialog").dialog("open");
    } else {
        showKeyNotAllowedMsg();
    }
});

//INDENT MODIFIED 20170130
$("div#fnCreateIndent").click(function() {
    if (!cashierRole.isCustomerServiceCashier) {
        if (!hasScannedItem(saleTx)) {
            var __dateToday = new Date();
            $("#indentExpectedDeliveryDate").datepicker({
                dateFormat: 'dd/mm/yy',
                minDate: __dateToday
            });
            $("#indentSales-dialog").dialog("close");
            $("#indentSalesCreate-dialog").dialog("open");
        } else {
            showKeyNotAllowedMsg();
        }
    } else {
        showKeyNotAllowedMsg();
    }
});

$("div#fnInquiryIndent").click(function() {
    if (connectionOnline) {
        $("#indentSales-dialog").dialog("close");
        $("#indentSalesInquiry-dialog").dialog("open");
    } else {
        showKeyNotAllowedMsg();
    }
});

function clearIndentSales(__section) {
    switch (__section) {
        case 'create':
            $("#indentSlip").val('');
            $("#indentExpectedDeliveryDate").val('');
            $('#indentHomdelCheck').is(":checked") ? $('#indentHomdelCheck').click() : null;
            break;
        case 'close':
            $("#indentSlipClose").val('');
            $("#indentSalesCloseDate").val('');
            break;
        case 'inquiry':
            $("#indentSlipInquiry").val('');
            $("#indentInqInfoLabel").html('');
            $("#indentInqInfoHead").html('');
            $("#indentInqInfoBody").html('');
            break;
        case 'all':
            $("#indentSlip").val('');
            $("#indentExpectedDeliveryDate").val('');

            $("#indentSlipClose").val('');
            $("#indentSalesCloseDate").val('');
            $('#indentHomdelCheck').is(":checked") ? $('#indentHomdelCheck').click() : null;

            $("#indentSlipInquiry").val('');
            $("#indentInqInfoLabel").html('');
            $("#indentInqInfoHead").html('');
            $("#indentInqInfoBody").html('');
            break;
    }
}
// INDENT 2017-05-18

// voidDeptStore 2017022
function clearVoidDeptStore(__section) {
    switch (__section) {
        case 'all':
            $("#voidDeptStorePrice").val('');
            $("#voidDeptStoreInfoLabel").html('');
            $("#voidDeptStoreTableHead").html('');
            $("#voidDeptStoreTableBody").html('');
            $('#voidDeptStorePrice').removeAttr('disabled');
            break;
    }
}
// voidDeptStore 2017022

//BILLS PAYMENT button
$("div#fnPad div#billPaymentBtn").click(function() {
    if (!hasScannedItem(saleTx)) {
        $("#billPaymentFunctions-dialog").dialog("open");
    } else {
        showKeyNotAllowedMsg();
    }
});

//SIMPATINDO button
$("div#fnSimpatindoFunctions").click(function() {
    if (!hasScannedItem(saleTx)) {
        $("#billPaymentFunctions-dialog").dialog("close");
        $("#simpatindo-dialog").dialog("open");
    } else {
        showKeyNotAllowedMsg();
    }
});

$("#grabBtn").click(function() {
    $("#grab-dialog").dialog("open");
});

$("#kidcityBtn").click(function() {
    kidcityEnable = true;
    kidcityEnableStatus = "KIDCITY ON";
    promptSysMsg();
});

//SIMPATINDO button
$("div#fnMCashFunctions").click(function() {
    if (!hasScannedItem(saleTx)) {
        $("#billPaymentFunctions-dialog").dialog("close");
        $("#mCash-dialog").dialog("open");
    } else {
        showKeyNotAllowedMsg();
    }
});

$("#staffId").click(function() {
    $("#staffId-dialog").dialog("open");
});
$("div#fnPad div#trk").click(function() {
    if (!hasScannedItem(saleTx)) {
        $("#trkPaymentFunctions-dialog").dialog("open");
    } else {
        showKeyNotAllowedMsg();
    }
});

$("div#fnMegaFinance").click(function() {
    if (!hasScannedItem(saleTx)) {
        BILL_PAYMENT.variables.paymentType = BILL_PAYMENT.types.MEGA_FINANCE_INSTALLMENT; //set chosen product
        $("#billPaymentFunctions-dialog").dialog("close");
        $("#billPaymentContractNumInput-dialog").dialog("open");
    } else {
        showKeyNotAllowedMsg();
    }
});

$("div#fnEleboxKiosk").click(function() {
    if (!hasScannedItem(saleTx)) {
        $("#billPaymentFunctions-dialog").dialog("close");
        $("#eleboxOrderIDField").val("");
        $("#elebox-receipt-dialog").dialog("open");
    } else {
        showKeyNotAllowedMsg();
    }
});

$("div#fnBpjs").click(function() {
    if (!hasScannedItem(saleTx)) {
        if (getConfigValue("IS_ALLOW_BPJS") != 0) {
            BPJS.CONSTANTS = BPJS.CONFIG();
            $("#billPaymentFunctions-dialog").dialog("close");
            $("#bpjs-receipt-dialog").dialog("open");
        }
    } else {
        showKeyNotAllowedMsg();
    }
});

// $("div#fnHoldRecallOptions").click(function(){
// 	if (!hasScannedItem(saleTx)) {
// 		$("#holdRecallFunctions-dialog").dialog("open");
// 	} else {
// 		showKeyNotAllowedMsg();
// 	}
// });

var redeemPointTrk = false;
var saleGameItemTrk = false;
var specialOrder = false;
$("div#fnRedeemPointTrk").click(function() {
    if (!hasScannedItem(saleTx)) {
        redeemPointTrk = true;
        saleGameItemTrk = false;
        //saveTxn();
        if (redeemPointTrk == true) {
            promptSysMsg(" ", "TRK REDEEM POINTS");
        } else {
            promptSysMsg();
        }
        $("#trkPaymentFunctions-dialog").dialog("close");
    } else {
        showKeyNotAllowedMsg();
    }
});

$("div#fnSaleGameTrk").click(function() {
    if (!hasScannedItem(saleTx)) {
        saleGameItemTrk = true;
        redeemPointTrk = false;
        if (saleGameItemTrk == true) {
            //saveTxn();
            promptSysMsg(" ", "TRK SALE GAME ITEM");
        } else {
            promptSysMsg();
        }
        $("#trkPaymentFunctions-dialog").dialog("close");
    } else {
        showKeyNotAllowedMsg();
    }
});

$("#specialOrder").click(function() {
    if (connectionOnline) {
        $("#specialOrder-dialog").dialog("open");
    } else {
        showMsgDialog(getMsgValue("pos_warning_msg_specorder_func_not_allowed_in_offline"), "warning");
    }
    // if(!hasScannedItem(saleTx)){
    // specialOrder = true;
    // promptSysMsg(" ", "SPECIAL ORDER");
    // }else{
    // showKeyNotAllowedMsg();
    // }
});

$("#adaf").click(function() {
    if (connectionOnline) {
        $("#ADAF-dialog").dialog("open");
    } else {
        showMsgDialog(getMsgValue("pos_warning_msg_specorder_func_not_allowed_in_offline"), "warning");
    }
});

$("#adaf").click(function() {
    if (connectionOnline) {
        $("#ADAF-dialog").dialog("open");
    } else {
        showMsgDialog(getMsgValue("pos_warning_msg_specorder_func_not_allowed_in_offline"), "warning");
    }
});

$("#kids-city").click(function() {
    // if (connectionOnline) {
        $("#KC-dialog").dialog("open");
    // } else {
    //     showMsgDialog(getMsgValue("pos_warning_msg_specorder_func_not_allowed_in_offline"), "warning");
    // }
});

$("div#fnPad div#eReceiptBtn").click(function() {
    if (!hasScannedItem(saleTx)) {
        $("#receipt_output-dialog").dialog("open");
    } else {
        showKeyNotAllowedMsg();
    }
});

/**
 * Function that checks if there's already a scanned item, includes bill payment item in checking
 * @param saleTx
 * @returns boolean
 */
function hasScannedItem(saleTx) {
    if (saleTx && saleTx.orderItems && saleTx.orderItems.length == 0 && !BILL_PAYMENT.isBillPaymentTansaction()) {
        return false;
    } else {
        return true;
    }
}

// INHOUSE VOUCHER 2017-04-13
/*
 * FUNCTION TO CALCULATE EVENT REWARDS
 */
function processEventRewards(executeFunctionAfter) {
    if (isHcEnabled && getConfigValue('HC_USE_SMALL_PRINTER') == 'false') {
        executeFunctionAfter();
        return false;
    }

    if (saleTx.type != 'SALE' || saleTx.isCancelled) {
        executeFunctionAfter();
        return false;
    }

    var orderItems = saleTx.orderItems;

    // get rule and exclusion item
    var barcodeList = [];
    for (var p in orderItems)
        barcodeList.push(orderItems[p].ean13Code);

    console.log('BARCODE LIST');
    console.log(barcodeList);
    var configEventRewards = reqEventGenRule(barcodeList);

    saleTx.stampCoupon = {};
    saleTx.luckyCustomer = {};
    saleTx.marketingVoucher = {};


    if (configEventRewards.stampCoupon != null) {
        saleTx.stampCoupon.eventSponsorProduct = [];
        saleTx.stampCoupon.eventRewardNo = 0;
        var totalTrxAmount = 0;
        var isSponsor = false;
        var binExcludedPayment = 0;


        var voucherExcludedPayment = 0;

        for (var i in orderItems) {
            var oItem = orderItems[i];

            // CHECK ITEM EXCLUSION
            if (configEventRewards.stampCoupon.itemExclusion != null && configEventRewards.stampCoupon.itemExclusion.indexOf(oItem.ean13Code) > -1) continue;

            // CHECK CMC EXCLUSION
            if (configEventRewards.stampCoupon.cmcExclusion != null && configEventRewards.stampCoupon.cmcExclusion && isItemCMC(oItem.ean13Code, saleTx.promotionsMap) && oItem.memberDiscountAmount > 0) continue;

            // CHECK SPONSOR PRODUCT
            if (configEventRewards.stampCoupon.sponsorProducts != null &&
                configEventRewards.stampCoupon.sponsorProducts.indexOf(oItem.ean13Code) > -1 &&
                saleTx.stampCoupon.eventSponsorProduct.indexOf(oItem.ean13Code) < 0) {
                saleTx.stampCoupon.eventSponsorProduct.push(oItem.ean13Code);
                isSponsor = true;
            }


            // CALCULATE ITEM PRICE
            var oItemAmount = oItem.priceSubtotal - oItem.discountAmount - oItem.memberDiscountAmount - oItem.crmMemberDiscountAmount - oItem.discBtnAmount - oItem.secondLayerDiscountAmount;
            oItemAmount = (oItemAmount) ? oItemAmount : 0;
            totalTrxAmount += (oItem.isVoided ? -1 * oItemAmount : oItemAmount);
        }

        for (var p in saleTx.payments) {
            var payment = saleTx.payments[p];

            // CHECK BIN EXCLUSION
            if (payment.eftData != null && configEventRewards.stampCoupon.binExclusion != null && configEventRewards.stampCoupon.binExclusion.indexOf(payment.eftData.cardNum.substring(0, 6)) > -1)
                binExcludedPayment += payment.amountPaid;
            // CHECK VOUCHER PAYMENT
            // STEVEN QUESTION:  GENERATE CONSIDER PAYMENT MEDIA MARKETING VOUCHER, iF YESTTAM
            if (configEventRewards.stampCoupon.voucherExclusion != null &&
                configEventRewards.stampCoupon.voucherExclusion &&
                ((payment.paymentMediaType == 'GC') ||
                    (payment.paymentMediaType == 'COUPON') ||
                    (payment.paymentMediaType == 'INSTALLMENT') ||
                    (payment.paymentMediaType == 'SODEXO') ||
                    (payment.paymentMediaType == 'VOUCHER')))
                voucherExcludedPayment += payment.amountPaid;
        }

        console.log('[processEventRewards] Voucher Excluded Amount = ' + voucherExcludedPayment + '; Bin Excluded Amount = ' + binExcludedPayment);

        // CALCULATE NO OF REWARDS
        totalTrxAmount -= (binExcludedPayment + voucherExcludedPayment);
        console.log('[processEventRewards] Total Sales Amount = ' + totalTrxAmount);

        if (binExcludedPayment <= 0 && totalTrxAmount >= configEventRewards.stampCoupon.minimumPayment) {
            if (configEventRewards.stampCoupon.isMulti)
                saleTx.stampCoupon.eventRewardNo += parseInt(totalTrxAmount / configEventRewards.stampCoupon.minimumPayment);
            else saleTx.stampCoupon.eventRewardNo++;

            if ((configEventRewards.stampCoupon.minimumPaymentSponsor == null || configEventRewards.stampCoupon.minimumPaymentSponsor == 0) && isSponsor)
                saleTx.stampCoupon.eventRewardNo++;
        } else if (binExcludedPayment <= 0 && isSponsor && configEventRewards.stampCoupon.minimumPaymentSponsor != null && configEventRewards.stampCoupon.minimumPaymentSponsor > 0 && (totalTrxAmount >= configEventRewards.stampCoupon.minimumPaymentSponsor))
            saleTx.stampCoupon.eventRewardNo++;

        saleTx.stampCoupon.eventRewardNo = (saleTx.stampCoupon.eventRewardNo > configEventRewards.stampCoupon.maxRewards && configEventRewards.stampCoupon.maxRewards > 0) ? configEventRewards.stampCoupon.maxRewards : saleTx.stampCoupon.eventRewardNo;
        saleTx.stampCoupon.eventPromoId = configEventRewards.stampCoupon.id;
        saleTx.stampCoupon.eventStartDate = configEventRewards.stampCoupon.startDate;
        saleTx.stampCoupon.eventEndDate = configEventRewards.stampCoupon.endDate;
        saleTx.stampCoupon.eventMaxReward = configEventRewards.stampCoupon.maxRewards;
        saleTx.stampCoupon.eventType = configEventRewards.stampCoupon.type;
        saleTx.stampCoupon.eventTotalAmount = totalTrxAmount;

        // COLLECT THE COUPON NUMBER
        saleTx.stampCoupon.eventCoupons = [];
        if (configEventRewards.stampCoupon.type == 2) {
            for (var seq = 1; seq <= saleTx.stampCoupon.eventRewardNo; seq++)
                saleTx.stampCoupon.eventCoupons.push(configEventRewards.stampCoupon.promoPrefix + saleTx.transactionId + ("000" + seq).slice(-3));
        }

        saleTx.stampCoupon.eventRewardsObj = {};
        saleTx.stampCoupon.eventRewardsObj.promoHeader = configEventRewards.stampCoupon.promoHeader;
        saleTx.stampCoupon.eventRewardsObj.promoLines = configEventRewards.stampCoupon.promoLines;
        saleTx.stampCoupon.eventRewardsObj.startDate = configEventRewards.stampCoupon.startDate;
        saleTx.stampCoupon.eventRewardsObj.endDate = configEventRewards.stampCoupon.endDate;
        saleTx.stampCoupon.eventRewardsObj.promoCouponTemplate = configEventRewards.stampCoupon.promoCouponTemplate;
        saleTx.stampCoupon.eventRewardsObj.promoPrefix = configEventRewards.stampCoupon.promoPrefix;

        console.log('[processEventRewards] Event Reward Details|ToAmt:' + totalTrxAmount + '|MinPay:' + configEventRewards.stampCoupon.minimumPayment + '|MinPaySpon:' + configEventRewards.stampCoupon.minimumPaymentSponsor + '|ReNo:' + saleTx.stampCoupon.eventRewardNo + '|EvTy:' + saleTx.stampCoupon.eventType + '|EvID:' + saleTx.stampCoupon.eventPromoId);
    }

    if (connectionOnline && configEventRewards.luckyCustomer != null) {
        saleTx.luckyCustomer.eventSponsorProduct = [];
        saleTx.luckyCustomer.luckyEventRewardNo = 0;
        saleTx.luckyCustomer.luckyEventPromoId = configEventRewards.luckyCustomer.id;
        saleTx.luckyCustomer.luckyEventStartDate = configEventRewards.luckyCustomer.startDate;
        saleTx.luckyCustomer.luckyEventEndDate = configEventRewards.luckyCustomer.endDate;
        saleTx.luckyCustomer.luckyEventType = configEventRewards.luckyCustomer.type;
        saleTx.luckyCustomer.luckyEventMaxReward = configEventRewards.luckyCustomer.maxRewards;

        // CALCULATE ITEM
        var binExcludedPayment = 0;


        var totalTrxAmount = 0;
        var voucherExcludedPayment = 0;
        var isSponsor = false;

        for (var i in saleTx.orderItems) {
            var oItem = saleTx.orderItems[i];

            // CHECK ITEM EXCLUSION
            if (configEventRewards.luckyCustomer.itemExclusion != null &&
                configEventRewards.luckyCustomer.itemExclusion.indexOf(oItem.ean13Code) > -1) continue;

            // CHECK CMC EXCLUSION
            if (configEventRewards.luckyCustomer.cmcExclusion != null &&
                configEventRewards.luckyCustomer.cmcExclusion &&
                isItemCMC(oItem.ean13Code, saleTx.promotionsMap) &&
                oItem.memberDiscountAmount > 0) continue;

            // CHECK SPONSOR PRODUCT
            if (configEventRewards.luckyCustomer.sponsorProducts != null &&
                configEventRewards.luckyCustomer.sponsorProducts.indexOf(oItem.ean13Code) > -1 &&
                saleTx.luckyCustomer.eventSponsorProduct.indexOf(oItem.ean13Code) < 0) {
                saleTx.luckyCustomer.eventSponsorProduct.push(oItem.ean13Code);
                isSponsor = true;
            }

            // CALCULATE ITEM PRICE
            var oItemAmount = oItem.priceSubtotal - oItem.discountAmount - oItem.memberDiscountAmount - oItem.crmMemberDiscountAmount - oItem.discBtnAmount - oItem.secondLayerDiscountAmount;
            oItemAmount = (oItemAmount) ? oItemAmount : 0;
            totalTrxAmount += (oItem.isVoided ? -1 * oItemAmount : oItemAmount);
        }

        for (var p in saleTx.payments) {
            var payment = saleTx.payments[p];

            // CHECK BIN EXCLUSION
            if (payment.eftData != null &&
                configEventRewards.luckyCustomer.binExclusion != null &&
                configEventRewards.luckyCustomer.binExclusion.indexOf(payment.eftData.cardNum.substring(0, 6)) > -1)
                binExcludedPayment += payment.amountPaid;

            if (configEventRewards.luckyCustomer.voucherExclusion != null &&
                configEventRewards.luckyCustomer.voucherExclusion &&
                ((payment.paymentMediaType == 'GC') ||
                    (payment.paymentMediaType == 'COUPON') ||
                    (payment.paymentMediaType == 'INSTALLMENT') ||
                    (payment.paymentMediaType == 'SODEXO') ||
                    (payment.paymentMediaType == 'VOUCHER')))
                voucherExcludedPayment += payment.amountPaid;
        }
        console.log('[processEventRewards|LUCKYCUST] Voucher Excluded Amount = ' + voucherExcludedPayment + '; Bin Excluded Amount = ' + binExcludedPayment);

        // CALCULATE NO OF REWARDS
        totalTrxAmount -= (binExcludedPayment + voucherExcludedPayment);
        console.log('[processEventRewards|LUCKYCUST] Total Sales Amount = ' + totalTrxAmount);


        // CALCULATE NO OF REWARDS
        if ((binExcludedPayment <= 0 && totalTrxAmount >= configEventRewards.luckyCustomer.minimumPayment) ||
            (binExcludedPayment <= 0 && isSponsor &&
                configEventRewards.luckyCustomer.minimumPaymentSponsor != null &&
                configEventRewards.luckyCustomer.minimumPaymentSponsor > 0 &&
                (totalTrxAmount >= configEventRewards.luckyCustomer.minimumPaymentSponsor))
        ) {
            console.log('masuk ke kondisi <<<>>>');
            saleTx.luckyCustomer.luckyEventRewardsObj = {};
            saleTx.luckyCustomer.luckyEventRewardsObj.promoHeader = configEventRewards.luckyCustomer.promoHeader;
            saleTx.luckyCustomer.luckyEventRewardsObj.promoLines = configEventRewards.luckyCustomer.promoLines;
            saleTx.luckyCustomer.luckyEventRewardsObj.startDate = configEventRewards.luckyCustomer.startDate;
            saleTx.luckyCustomer.luckyEventRewardsObj.endDate = configEventRewards.luckyCustomer.endDate;
            saleTx.luckyCustomer.luckyEventRewardsObj.eventTotalAmount = totalTrxAmount;

            // REQUEST THE LUCKY CUSTOMER COUNTER TO STORE SERVICE
            $.ajax({
                url: posWebContextPath + "/cashier/getLuckyCustomer",
                type: "POST",
                async: false,
                data: JSON.stringify({
                    'luckyEventPromoId': saleTx.luckyCustomer.luckyEventPromoId,
                    'luckyEventStartDate': saleTx.luckyCustomer.luckyEventStartDate,
                    'luckyEventEndDate': saleTx.luckyCustomer.luckyEventEndDate,
                    'luckyEventMaxReward': saleTx.luckyCustomer.luckyEventMaxReward
                }),
                success: function(response) {
                    saleTx.luckyCustomer.luckyEventRewardNo = response;
                    if (parseInt(response) == 0) saleTx.luckyCustomer.luckyEventPromoId = 0;
                }
            });
        }
    }

    if (connectionOnline && configEventRewards.marketingVoucher != null && typeof configEventRewards.marketingVoucher.mvConfig != 'undefined') {
        // check if pos group not allowed, return false
        if ((configuration.terminalType != 'DEPTSTORE' && configEventRewards.marketingVoucher.mvConfig.mvGenRegulerStatus != 1) ||
            configuration.terminalType == 'DEPTSTORE' && configEventRewards.marketingVoucher.mvConfig.mvGenDeptStoreStatus != 1) {
            executeFunctionAfter();
            return false;
        }

        saleTx.marketingVoucher.eventSponsorProduct = [];

        // CALCULATE ITEM
        var binExcludedPayment = 0;


        var totalTrxAmount = 0;
        var voucherExcludedPayment = 0;
        var isSponsor = false;
        var isRequestAgent = false;
        var agentResponse = null;
        var responseRequest = {};
        responseRequest.rspCode = 999;
        responseRequest.msg = 'UNKNOWN ERROR';

        console.log(saleTx.orderItems);
        console.log('MARKETING VOUCHER OBJ');
        console.log(configEventRewards.marketingVoucher);
        for (var i in saleTx.orderItems) {
            var oItem = saleTx.orderItems[i];

            if (oItem.categoryId == 'MVOUCHER') continue;
            // CHECK ITEM EXCLUSION
            if (configEventRewards.marketingVoucher.itemExclusion != null &&
                configEventRewards.marketingVoucher.itemExclusion.indexOf(oItem.ean13Code) > -1) continue;

            // CHECK CMC EXCLUSION
            if (configEventRewards.marketingVoucher.cmcExclusion != null &&
                configEventRewards.marketingVoucher.cmcExclusion &&
                isItemCMC(oItem.ean13Code, saleTx.promotionsMap) &&
                oItem.memberDiscountAmount > 0) continue;

            // CHECK SPONSOR PRODUCT
            if (configEventRewards.marketingVoucher.sponsorProducts != null &&
                configEventRewards.marketingVoucher.sponsorProducts.indexOf(oItem.ean13Code) > -1 &&
                saleTx.marketingVoucher.eventSponsorProduct.indexOf(oItem.ean13Code) < 0) {
                saleTx.marketingVoucher.eventSponsorProduct.push(oItem.ean13Code);
                isSponsor = true;
            }

            // CALCULATE ITEM PRICE
            var oItemAmount = oItem.priceSubtotal - oItem.discountAmount - oItem.memberDiscountAmount - oItem.crmMemberDiscountAmount - oItem.discBtnAmount - oItem.secondLayerDiscountAmount;

            uilog('DBUG', 'ITEM');
            uilog('DBUG', oItem);
            // INHOUSE VOUCHER 2017-05-02
            /*if(oItem.discVoucher && oItem.discVoucher.length > 0)
            {
            	for(var v in oItem.discVoucher)
            		oItemAmount -= parseInt(oItem.discVoucher);
            }*/
            // INHOUSE VOUCHER 2017-05-02

            totalTrxAmount += (oItem.isVoided ? -1 * oItemAmount : oItemAmount);
        }

        for (var p in saleTx.payments) {
            var payment = saleTx.payments[p];

            // CHECK BIN EXCLUSION
            if (payment.eftData != null &&
                configEventRewards.marketingVoucher.binExclusion != null &&
                configEventRewards.marketingVoucher.binExclusion.indexOf(payment.eftData.cardNum.substring(0, 6)) > -1)
                binExcludedPayment += payment.amountPaid;

            if (configEventRewards.marketingVoucher.voucherExclusion != null &&
                configEventRewards.marketingVoucher.voucherExclusion &&
                ((payment.paymentMediaType == 'GC') ||
                    (payment.paymentMediaType == 'COUPON') ||
                    (payment.paymentMediaType == 'INSTALLMENT') ||
                    (payment.paymentMediaType == 'SODEXO') ||
                    (payment.paymentMediaType == 'VOUCHER')))
                voucherExcludedPayment += payment.amountPaid;
        }
        console.log('[processEventRewards|MARKETINGVOUCHER] Voucher Excluded Amount = ' + voucherExcludedPayment + '; Bin Excluded Amount = ' + binExcludedPayment);

        // CALCULATE NO OF REWARDS
        totalTrxAmount -= (binExcludedPayment + voucherExcludedPayment);
        uilog('DBUG', '[processEventRewards|MARKETINGVOUCHER] Total Sales Amount = ' + totalTrxAmount);

        // CHECK MINIMUM PAYMENT ELIGIBLE TO CALL AGENT
        if (binExcludedPayment > 0) // CONFIRMED PAK IMAN 20161024143600: Jika contaminated bin = gagal semua
            isRequestAgent = false;


        else if (isSponsor && (totalTrxAmount >= configEventRewards.marketingVoucher.minimumPaymentSponsor))
            isRequestAgent = true;
        else if (configuration.terminalType != 'DEPTSTORE' &&
            configEventRewards.marketingVoucher.mvConfig.mvGenRegulerStatus == 1 &&
            totalTrxAmount >= configEventRewards.marketingVoucher.mvConfig.mvGenReguler)
            isRequestAgent = true;
        else if (configuration.terminalType == 'DEPTSTORE' &&
            configEventRewards.marketingVoucher.mvConfig.mvGenDeptStoreStatus == 1 &&
            totalTrxAmount >= configEventRewards.marketingVoucher.mvConfig.mvGenDeptStore)
            isRequestAgent = true;
        else isRequestAgent = false;

        // IF OK FIRE REQUEST TO AGENT POSS
        if (isRequestAgent == true /* && isRequestAgent == false*/ ) {
            // prepare to hit agent
            var mvRequestData = {};
            var isHTTPStatusOK = false;
            mvRequestData.trxId = saleTx.transactionId;
            mvRequestData.amtTotal = saleTx.totalAmount;
            mvRequestData.amtAffected = totalTrxAmount;
            mvRequestData.posGrp = configuration.terminalType;
            mvRequestData.eventPromoId = configEventRewards.marketingVoucher.id;
            mvRequestData.isSponsor = isSponsor;

            /*agentResponse = {
            	'rspCode': 200,
            	'msg': 'SUCCESS',
            	'voucherList': ['1003012345689098'],
            	'voucherAmt': 50000,
            	'expDate': '2016-12-31',
            	'promoId': '1003',
            	'auxInfo': {
            		'status': 'GENERATED',
            		
            	}
            }; // DUMMY VOUCHER RESP
            */
            agentResponse = callAgent('generate', mvRequestData);
        } else responseRequest.rspCode = 121; //GENERATE-MINIMUM ELIGIBLE AMOUNT NOT MEET
        //*/

        // response to set
        if (agentResponse) {
            var voucherList = [];
            if (agentResponse.voucherList) {
                for (var vc in agentResponse.voucherList)
                    voucherList.push(vc);
            }

            saleTx.marketingVoucher.marketingVoucherRewardNo = (agentResponse != null && typeof agentResponse.voucherList != 'undefined' && voucherList != null) ? voucherList.length : 0;
            saleTx.marketingVoucher.marketingVoucherPromoId = configEventRewards.marketingVoucher.id;
            saleTx.marketingVoucher.marketingVoucherStartDate = configEventRewards.marketingVoucher.startDate;
            saleTx.marketingVoucher.marketingVoucherEndDate = configEventRewards.marketingVoucher.endDate;
            saleTx.marketingVoucher.marketingVoucherType = configEventRewards.marketingVoucher.type;
            saleTx.marketingVoucher.marketingVoucherMaxReward = configEventRewards.marketingVoucher.maxRewards;
            saleTx.marketingVoucher.marketingVoucherObj = {};
            saleTx.marketingVoucher.marketingVoucherObj.promoHeader = configEventRewards.marketingVoucher.promoHeader;
            saleTx.marketingVoucher.marketingVoucherObj.promoDesc = configEventRewards.marketingVoucher.promoDesc;
            saleTx.marketingVoucher.marketingVoucherObj.mvConfig = configEventRewards.marketingVoucher.mvConfig;
            saleTx.marketingVoucher.marketingVoucherObj.promoLines = configEventRewards.marketingVoucher.promoLines;
            saleTx.marketingVoucher.marketingVoucherObj.promoCouponTemplate = configEventRewards.marketingVoucher.promoCouponTemplate;
            saleTx.marketingVoucher.marketingVoucherObj.startDate = configEventRewards.marketingVoucher.startDate;
            saleTx.marketingVoucher.marketingVoucherObj.endDate = configEventRewards.marketingVoucher.endDate;
            saleTx.marketingVoucher.marketingVoucherObj.marketingVoucherEligibleAmount = totalTrxAmount;
            saleTx.marketingVoucher.marketingVoucherObj.rspCode = (agentResponse != null) ? agentResponse.rspcode : responseRequest.rspCode;
            saleTx.marketingVoucher.marketingVoucherObj.msg = (agentResponse != null) ? agentResponse.msg : responseRequest.msg;
            saleTx.marketingVoucher.marketingVoucherObj.voucherList = voucherList;
            saleTx.marketingVoucher.marketingVoucherObj.voucherAmt = (typeof agentResponse.voucherAmt != 'undefined') ? agentResponse.voucherAmt : null;
            saleTx.marketingVoucher.marketingVoucherObj.expDate = (typeof agentResponse.expDate != 'undefined') ? agentResponse.expDate : null;


        }

        //*/
        // COUNT NUMBER OF REWARDS -- FINAL CHECK BEFORE HITTING -- END
    }
    executeFunctionAfter();
}

/*
 * 
 * Caculate redeem rule
 * Input : 	mvBarcode, 
 *			salesItemObj, 
 *			openAmountDeductionList
 * Return : Redeem response status list, 
 * 			newOpenAmountDeduction
 */

function redeemEventRewards(mvBarcode, salesItemObj, openAmountDeductionList, mode) {
    if (saleTx.type != 'SALE') {
        executeFunctionAfter();
        return false;
    }

    var returnResponse = {};
    if (connectionOnline) //this function must be online
    {
        returnResponse.mvRedeem = {};
        var isHTTPStatusOK = false;

        var barcodeItemList = [];
        for (var i in salesItemObj) barcodeItemList.push(salesItemObj[i]['ean13Code']);

        var reqConfigObj = {};
        reqConfigObj.promoId = mvBarcode.substr(0, 4);
        reqConfigObj.barcodeList = barcodeItemList;
        var configEventRewards = reqEventRdmRule(reqConfigObj.promoId, reqConfigObj.barcodeList);

        if (typeof configEventRewards.mvRedeem.mvConfig != 'undefined' || salesItemObj.length == 0) {
            uilog('DBUG', 'REDEEM CONFIG');
            uilog('DBUG', configEventRewards.mvRedeem.mvConfig);
            // CHECK VOUCHER REDEEM METHOD FIRST
            if (configuration.terminalType == 'DEPTSTORE' && configEventRewards.mvRedeem.mvConfig.mvRdmDeptStoreConMethod == '1' && !mode) {
                uilog('DBUG', 'POS DEPTSTORE is not allowed to REDEEM single voucher on mode ' + configEventRewards.mvRedeem.mvConfig.mvRdmDeptStoreConMethod);
                returnResponse.mvRedeem.rspCode = 146;
                returnResponse.mvRedeem.msg = 'REDEEM-NOT ALLOWED AS DISCOUNT';

            } else if ((configuration.terminalType != 'DEPTSTORE' || configEventRewards.mvRedeem.mvConfig.mvRdmDeptStoreConMethod == '1') && (configEventRewards.mvRedeem.mvConfig.mvRdmRegulerStatus == 1 || configEventRewards.mvRedeem.mvConfig.mvRdmDeptStoreStatus == 1)) {
                salesItemObj = saleTx.orderItems;
                openAmountDeductionList = (typeof saleTx.openDeductAmount == 'undefined' ? [] : saleTx.openDeductAmount);
                var totalTrxAmount = 0;

                for (var i in salesItemObj) {
                    var oItem = salesItemObj[i];

                    // CHECK NEW ITEM EXCLUSION
                    if (configEventRewards.mvRedeem.mvConfig.mvRdmItemExc.indexOf(oItem.ean13Code) > -1) continue;

                    // CALCULATE ITEM PRICE
                    var oItemAmount = oItem.priceSubtotal - oItem.discountAmount - oItem.memberDiscountAmount - oItem.crmMemberDiscountAmount - oItem.discBtnAmount - oItem.secondLayerDiscountAmount;
                    totalTrxAmount += (oItem.isVoided ? -1 * oItemAmount : oItemAmount);

                    var categoryId = oItem.categoryId;
                }

                var terminalAmountDeduction = openAmountDeductionList.reduce(function(a, b) { return a + b; }, 0); // sum all openAmountDeductionList array value
                var toad = totalTrxAmount - terminalAmountDeduction; // total open amount deduction
                console.log(totalTrxAmount + ' ' + terminalAmountDeduction + ' ' + configEventRewards.mvRedeem.mvConfig.mvRdmRegulerReg);

                uilog('DBUG', 'REDEEM X:' + toad + ' ' + configEventRewards.mvRedeem.mvConfig.mvRdmRegulerReg);
                if (toad >= configEventRewards.mvRedeem.mvConfig.mvRdmRegulerReg) {
                    //add open amount deduction, after reply from server
                    var mvRequestData = {};
                    mvRequestData.trxId = saleTx.transactionId;
                    mvRequestData.voucherId = mvBarcode;
                    mvRequestData.lastAmtTotal = saleTx.totalAmount;
                    mvRequestData.lastAmtAffected = toad;
                    mvRequestData.categoryId = categoryId;
                    mvRequestData.groupingRedeem = '';
                    mvRequestData.posGrp = configuration.terminalType;

                    // do hit agent
                    /*var data = $.ajax
                    (
                    	{
                    		url : posAgentBaseUrl + "/redeem",
                    		type : "POST",
                    		async : false,
                    		dataType : "json",
                    		data : JSON.stringify(mvRequestData),
                    		success: function(data, status)
                    		{
                    			isHTTPStatusOK = true;
                    		},
                    		error : function(jqXHR, status, error) 
                    		{
                    			returnResponse.mvRedeem.rspCode = 401; //MARKETING VOUCHER AGENT UNABLE TO RESPONSE
                    			returnResponse.mvRedeem.msg = error;
                    		},
                    	}
                    ).responseText;
                    */

                    var data = callAgent('redeem', mvRequestData);
                    // HARDCODED
                    isHTTPStatusOK = true;
                    //var data = '{"rspCode":200,"msg":"DUMMY RESPONSE","result":{"voucherAmt":51000,"expDate":"2016-09-19","openAmountDeduction":100000}}';

                    // checking if response marketing voucher return value
                    if (isHTTPStatusOK) {
                        var agentResponse = data;
                        console.log('[requestRedeem] Return data from Agent|' + JSON.stringify(agentResponse));
                        if (data.rspCode != '200') {
                            showMsgDialog("Failed to redeem:" + data.msg + ' (' + data.rspCode + ')', "warning");
                            return false;
                        }
                        returnResponse.mvRedeem.rspCode = agentResponse.rspCode;
                        returnResponse.mvRedeem.msg = agentResponse.msg;
                        returnResponse.mvRedeem.result = agentResponse.result;
                        returnResponse.mvRedeem.totalTrxAmount = totalTrxAmount;
                        returnResponse.mvRedeem.voucherNumber = mvBarcode;
                        returnResponse.mvRedeem.openAmountDeductionList = openAmountDeductionList;
                        returnResponse.mvRedeem.openAmountDeductionList.push(parseInt(agentResponse.result.openAmountDeduction));
                        returnResponse.mvRedeem.mode = '1' // VOUCHER AS PAYMENT
                        console.log('[redeemEventRewards] Return data from Agent|' + JSON.stringify(agentResponse));
                    }
                } else {
                    returnResponse.mvRedeem.rspCode = 143;
                    returnResponse.mvRedeem.msg = 'REDEEM-NOT ENOUGH MINIMUM PAYMENT REGULER';
                }
            } else if (configuration.terminalType == 'DEPTSTORE' && configEventRewards.mvRedeem.mvConfig.mvRdmDeptStoreConMethod == '2' && configEventRewards.mvRedeem.mvConfig.mvRdmDeptStoreStatus == 1) {
                var totalTrxAmount = 0;
                var categoryId = null;
                var groupingRedeem = '';
                var oItem = null;

                for (var i in salesItemObj) {
                    oItem = salesItemObj[i];

                    // CHECK NEW ITEM EXCLUSION
                    if (configEventRewards.mvRedeem.mvConfig.mvRdmItemExc.indexOf(oItem.ean13Code) > -1) continue;

                    // CALCULATE ITEM PRICE
                    var oItemAmount = oItem.priceSubtotal - oItem.discountAmount - oItem.memberDiscountAmount - oItem.crmMemberDiscountAmount - oItem.discBtnAmount - oItem.secondLayerDiscountAmount;
                    totalTrxAmount += (oItem.isVoided ? -1 * oItemAmount : oItemAmount);
                }

                var terminalAmountDeduction = openAmountDeductionList.reduce(function(a, b) { return a + b; }, 0);
                var toad = totalTrxAmount - terminalAmountDeduction; // total open amount deduction

                // GET MINIMUM REDEEM
                categoryId = oItem.categoryId;
                var allowMinRdm = false;
                var minRdmAmount = 0;

                if (categoryId == 'DEPTSTORE') {
                    groupingRedeem = oItem.ean13Code.substr(1, 4);
                    if (typeof configEventRewards.mvRedeem.mvConfig.mvRdmDeptStoreCon['ALL'] != 'undefined') {
                        minRdmAmount = configEventRewards.mvRedeem.mvConfig.mvRdmDeptStoreCon['ALL'];
                        allowMinRdm = true;
                    } else if (typeof configEventRewards.mvRedeem.mvConfig.mvRdmDeptStoreCon[groupingRedeem] != 'undefined') {
                        minRdmAmount = configEventRewards.mvRedeem.mvConfig.mvRdmDeptStoreCon[groupingRedeem];
                        allowMinRdm = true;
                    } else allowMinRdm = false;
                } else {
                    groupingRedeem = oItem.sku.substring(0, 2);
                    uilog('DBUG', 'REDEEM ITEM');
                    uilog('DBUG', oItem);
                    if (typeof configEventRewards.mvRedeem.mvConfig.mvRdmDeptStoreDirPur['ALL'] != 'undefined') {
                        minRdmAmount = configEventRewards.mvRedeem.mvConfig.mvRdmDeptStoreDirPur['ALL'];
                        allowMinRdm = true;
                    } else if (typeof configEventRewards.mvRedeem.mvConfig.mvRdmDeptStoreDirPur[groupingRedeem] != 'undefined') {
                        minRdmAmount = configEventRewards.mvRedeem.mvConfig.mvRdmDeptStoreDirPur[groupingRedeem];
                        allowMinRdm = true;
                    } else allowMinRdm = false;
                    uilog('DBUG', configEventRewards.mvRedeem.mvConfig.mvRdmDeptStoreDirPur[groupingRedeem]);
                    uilog('DBUG', toad);
                }

                if (typeof minRdmAmount == 'undefined') {
                    uilog('DBUG', toad + ' ' + minRdmAmount + ' ' + allowMinRdm);
                    returnResponse.mvRedeem.rspCode = (!isDeptstore) ? 141 : 142;
                    returnResponse.mvRedeem.msg = 'POS GROUP ' + configuration.terminalType + ' NOT ALLOW TO REDEEM THIS VOUCHER';
                } else if (toad >= minRdmAmount && allowMinRdm === true) {
                    //add open amount deduction, after reply from server
                    var mvRequestData = {};
                    mvRequestData.trxId = saleTx.transactionId;
                    mvRequestData.voucherId = mvBarcode;
                    mvRequestData.lastAmtTotal = saleTx.totalAmount;
                    mvRequestData.lastAmtAffected = toad;
                    mvRequestData.categoryId = categoryId;
                    mvRequestData.groupingRedeem = groupingRedeem;

                    // do hit agent
                    /*var data = $.ajax
                    (
                    	{
                    		url : posAgentBaseUrl + "/redeem",
                    		type : "POST",
                    		async : false,
                    		dataType : "json",
                    		data : JSON.stringify(mvRequestData),
                    		success: function(data, status)
                    		{
                    			isHTTPStatusOK = true;
                    		},
                    		error : function(jqXHR, status, error)
                    		{
                    			returnResponse.mvRedeem.rspCode = 401; //MARKETING VOUCHER AGENT UNABLE TO RESPONSE
                    			returnResponse.mvRedeem.msg = error;
                    		},
                    	}
                    ).responseText;*/

                    var data = callAgent('redeem', mvRequestData);
                    // HARDCODED!
                    isHTTPStatusOK = true;
                    //var data = '{"rspCode":200,"msg":"DUMMY RESPONSE","result":{"voucherAmt":51000,"expDate":"2016-09-19","openAmountDeduction":100000}}';

                    // checking if response marketing voucher return value
                    if (isHTTPStatusOK) {
                        var agentResponse = data;
                        if (data.rspCode != '200') {
                            showMsgDialog("Failed to redeem:" + data.msg + ' (' + data.rspCode + ')', "warning");
                            return false;
                        }
                        returnResponse.mvRedeem.rspCode = agentResponse.rspCode;
                        returnResponse.mvRedeem.msg = agentResponse.msg;
                        returnResponse.mvRedeem.result = agentResponse.result;
                        returnResponse.mvRedeem.totalTrxAmount = totalTrxAmount;
                        returnResponse.mvRedeem.voucherNumber = mvBarcode;
                        returnResponse.mvRedeem.openAmountDeductionList = openAmountDeductionList;
                        returnResponse.mvRedeem.openAmountDeductionList.push(agentResponse.result.openAmountDeduction);
                        returnResponse.mvRedeem.mode = '2' // VOUCHER AS DISCOUNT
                        console.log('[redeemEventRewards] Return data from Agent|' + JSON.stringify(agentResponse));
                    }
                } else {
                    uilog('DBUG', toad + ' ' + minRdmAmount + ' ' + allowMinRdm);
                    returnResponse.mvRedeem.rspCode = 144;
                    returnResponse.mvRedeem.msg = 'REDEEM-NOT ENOUGH MINIMUM PAYMENT';
                }
                //venven
            } else {
                returnResponse.mvRedeem.rspCode = (!isDeptstore) ? 141 : 142;
                returnResponse.mvRedeem.msg = 'POS GROUP ' + configuration.terminalType + ' NOT ALLOW TO REDEEM THIS VOUCHER';
            }
        } else {
            returnResponse.mvRedeem.rspCode = 150;
            returnResponse.mvRedeem.msg = 'PROMO ID FOR REDEEM NOT FOUND';
        }
    } else {
        returnResponse.mvRedeem.rspCode = 402;
        returnResponse.mvRedeem.msg = 'POS TERMINAL OFFLINE';
    }
    return returnResponse;
}

//MKT Voucher
function redeemMarketingVoucher(mvBarcode){
    if (saleTx.type != 'SALE') {
        executeFunctionAfter();
        return false;
    }

    var returnResponse = {};
    if (connectionOnline) //this function must be online
    {
        returnResponse.mvRedeem = {};

        var salesItemObj = saleTx.orderItems;
        var totalTrxAmount = 0;
        var openAmountDeductionList = (typeof saleTx.openDeductAmount == 'undefined' ? [] : saleTx.openDeductAmount);

        for (var i in salesItemObj) {
            var oItem = salesItemObj[i];

            // CALCULATE ITEM PRICE
            var oItemAmount = oItem.priceSubtotal - oItem.discountAmount - oItem.memberDiscountAmount - oItem.crmMemberDiscountAmount - oItem.discBtnAmount - oItem.secondLayerDiscountAmount;
            totalTrxAmount += (oItem.isVoided ? -1 * oItemAmount : oItemAmount);

            var categoryId = oItem.categoryId;
        }

        var terminalAmountDeduction = openAmountDeductionList.reduce(function(a, b) { return a + b; }, 0); // sum all openAmountDeductionList array value
        var toad = totalTrxAmount - terminalAmountDeduction; // total open amount deduction
            
        var mvRequestData = {};
        mvRequestData.trxId = saleTx.transactionId;
        mvRequestData.voucherId = mvBarcode;
        mvRequestData.lastAmtTotal = saleTx.totalAmount;
        mvRequestData.lastAmtAffected = toad;
        mvRequestData.categoryId = categoryId;
        mvRequestData.groupingRedeem = '';
        mvRequestData.posGrp = configuration.terminalType;

        var data = callAgent('redeem', mvRequestData);
        console.log('[requestRedeem] Return data from Agent|' + JSON.stringify(data));
        // checking if response marketing voucher return value
        if(data.rspCode != '200'){
            showMsgDialog("Failed to redeem:" + data.msg + ' (' + data.rspCode + ')', "warning");
            return false;
        }else{
            var agentResponse = data;
            returnResponse.mvRedeem.rspCode = agentResponse.rspCode;
            returnResponse.mvRedeem.msg = agentResponse.msg;
            returnResponse.mvRedeem.result = agentResponse.result;
        }
    }else {
        returnResponse.mvRedeem.rspCode = 402;
        returnResponse.mvRedeem.msg = 'POS TERMINAL OFFLINE';
    }
    return returnResponse;
}


function calculateVoucherReturn(eligibleGenAmt, genTrxPosGroup, voidedObj) {
    var countVoucher = 0;

    if (saleTx.isCancelled) {
        executeFunctionAfter();
        return countVoucher;
    }

    var orderItems = saleTx.orderItems;

    // get rule and exclusion item
    var barcodeList = [];
    for (var p in orderItems)
        barcodeList.push(orderItems[p].ean13Code);

    var configEventRewards = reqEventGenRule(barcodeList);

    $("#depstore-voucher-dialog").data('voidConfigVoucher', configEventRewards);

    if (connectionOnline && configEventRewards.marketingVoucher != null) {
        for (var i = 0; i < configEventRewards.marketingVoucher.length; i++) {
            // CALCULATE ITEM
            var binExcludedPayment = 0;
            var totalTrxAmount = 0;
            var voucherExcludedPayment = 0;
            var isSponsor = false;

            for (var i in saleTx.orderItems) {
                var oItem = saleTx.orderItems[i];

                // CHECK ITEM EXCLUSION
                if (configEventRewards.marketingVoucher[i].itemExclusion != null &&
                    configEventRewards.marketingVoucher[i].itemExclusion.indexOf(oItem.ean13Code) > -1) continue;

                // CHECK CMC EXCLUSION
                if (configEventRewards.marketingVoucher[i].cmcExclusion != null &&
                    configEventRewards.marketingVoucher[i].cmcExclusion &&
                    isItemCMC(oItem.ean13Code, saleTx.promotionsMap) &&
                    oItem.memberDiscountAmount > 0) continue;

                // CHECK SPONSOR PRODUCT
                if (configEventRewards.marketingVoucher[i].sponsorProducts != null &&
                    configEventRewards.marketingVoucher[i].sponsorProducts.indexOf(oItem.ean13Code) > -1 &&
                    saleTx.marketingVoucher.eventSponsorProduct.indexOf(oItem.ean13Code) < 0) {
                    saleTx.marketingVoucher.eventSponsorProduct.push(oItem.ean13Code);
                    isSponsor = true;
                }

                // CALCULATE ITEM PRICE
                var oItemAmount = oItem.priceSubtotal -
                    oItem.discountAmount -
                    oItem.memberDiscountAmount -
                    oItem.crmMemberDiscountAmount -
                    oItem.discBtnAmount -
                    ((oItem.secondLayerDiscountAmount) ? oItem.secondLayerDiscountAmount : 0);

                totalTrxAmount += (oItem.isVoided ? -1 * oItemAmount : oItemAmount);
            }

            for (var p in saleTx.payments) {
                var payment = saleTx.payments[p];

                // CHECK BIN EXCLUSION
                if (payment.eftData != null &&
                    configEventRewards.marketingVoucher[i].binExclusion != null &&
                    configEventRewards.marketingVoucher[i].binExclusion.indexOf(payment.eftData.cardNum.substring(0, 6)) > -1)
                    binExcludedPayment += payment.amountPaid;

                if (configEventRewards.marketingVoucher[i].voucherExclusion != null &&
                    configEventRewards.marketingVoucher[i].voucherExclusion &&
                    ((payment.paymentMediaType == 'GC') ||
                        (payment.paymentMediaType == 'COUPON') ||
                        (payment.paymentMediaType == 'INSTALLMENT') ||
                        (payment.paymentMediaType == 'SODEXO') ||
                        (payment.paymentMediaType == 'MVOUCHER')))
                    voucherExcludedPayment += payment.amountPaid;
            }
            console.log('[calculateVoucherReturn|MARKETINGVOUCHER] Voucher Excluded Amount = ' + voucherExcludedPayment + '; Bin Excluded Amount = ' + binExcludedPayment);

            // CALCULATE NO OF REWARDS
            totalTrxAmount -= (binExcludedPayment + voucherExcludedPayment);
            console.log('[calculateVoucherReturn|MARKETINGVOUCHER] Total Sales Amount = ' + totalTrxAmount + ' EligibleGenAmt = ' + eligibleGenAmt + ' isSponsor=' + isSponsor);
            console.log(configEventRewards.marketingVoucher[i]);
            totalTrxAmount = eligibleGenAmt - totalTrxAmount;
            voidedObj.amount = totalTrxAmount;

            // CHECK MINIMUM PAYMENT ELIGIBLE TO CALCULATE
            if (binExcludedPayment > 0)
                countVoucher = 0;
            else if (isSponsor && (totalTrxAmount >= (configEventRewards.marketingVoucher[i].minimumPaymentSponsor || 0))) {
                if (genTrxPosGroup != 'DEPTSTORE' &&
                    //configEventRewards.marketingVoucher.mvConfig.mvGenRegulerStatus == 1) &&
                    totalTrxAmount >= configEventRewards.marketingVoucher[i].mvConfig.mvGenReguler)
                    countVoucher = totalTrxAmount / configEventRewards.marketingVoucher[i].mvConfig.mvGenReguler;
                else if (genTrxPosGroup == 'DEPTSTORE' &&
                    //configEventRewards.marketingVoucher.mvConfig.mvGenDeptStoreStatus == 1) &&
                    totalTrxAmount >= configEventRewards.marketingVoucher[i].mvConfig.mvGenDeptStore)
                    countVoucher = totalTrxAmount / configEventRewards.marketingVoucher[i].mvConfig.mvGenDeptStore;

                if (countVoucher < 1) countVoucher++; // at least get one if minimum sponsor passed
            } else if (genTrxPosGroup != 'DEPTSTORE' && typeof configEventRewards.marketingVoucher[i] != "undefined" //&&
                //configEventRewards.marketingVoucher.mvConfig.mvGenRegulerStatus == 1) &&
                //totalTrxAmount >= configEventRewards.marketingVoucher.mvConfig.mvGenReguler
            )
            //{
            // console.log("configEventRewards231");
            // console.log(configEventRewards);
                countVoucher = totalTrxAmount / configEventRewards.marketingVoucher[i].mvConfig.mvGenReguler;

            //}
            else if (genTrxPosGroup == 'DEPTSTORE' //&&
                //configEventRewards.marketingVoucher.mvConfig.mvGenDeptStoreStatus == 1) &&
                //totalTrxAmount >= configEventRewards.marketingVoucher.mvConfig.mvGenDeptStore
            )
                countVoucher = totalTrxAmount / configEventRewards.marketingVoucher[i].mvConfig.mvGenDeptStore;
            console.log(countVoucher);
            //countVoucher = (countVoucher > 0 && countVoucher < 1) ? 1 : Math.floor(countVoucher);
            countVoucher = Math.floor(countVoucher);
        }
    }
    console.log('COUNTV: ' + countVoucher);

    return countVoucher;
}

/*
 * 
 * Caller to node.js generate event reward rule
 * Input : barcodeList
 * Output : eventRewardsResp --> with filter matching item exclusion and item sponsor
 * 
 */
function reqEventGenRule(barcodeList) {
    var isHTTPStatusOK = false;
    // do hit agent
    var data = $.ajax({
        url: "/reqEventGenRule",
        type: "POST",
        async: false,
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify(barcodeList),
        success: function(data, status) {
            isHTTPStatusOK = true;
        },
        error: function(jqXHR, status, error) {
            console.log('[reqEventGenRule] failed to call proxyserver.js - reqEventGenRule');
        },
    }).responseText;

    if (isHTTPStatusOK) return JSON.parse(data);
    else return null;
}

var getStartEndDateDonation = function() {
    var startDate = getConfigValue('DONATION_START_DATE');
    var endDate = getConfigValue('DONATION_END_DATE');
    var config = {
        startDate: startDate,
        endDate: endDate
    }
    return config;
}

var donationCheckPaymentMedia = function(orderItems) {
    for (var a = 0; a <= orderItems.length - 1; a++) {
        var findDonation = orderItems[a];
        if (findDonation.categoryId == 'DONATION') {
            donationNotValid = true;
        }
    }
}

var donationPaymentMedia = function(paymentMediaType) {

    var paymentMediaFlag = false;
    var paymentMediaDonation = getConfigValue('DONATION_PAYMENT_MEDIA');
    donationValidPaymentMedia = paymentMediaDonation;
    paymentMediaDonation = paymentMediaDonation.split(",");
    for (var a = 0; a <= paymentMediaDonation.length - 1; a++) {
        var temp = paymentMediaDonation[a];
        temp = temp.replace(" ", "");
        if (temp == paymentMediaType) {
            paymentMediaFlag = true;
        }
    }
    return paymentMediaFlag;
}

function reqCategoryDonation() {
    var isHTTPStatusOK = false;
    // do hit agent
    var data = $.ajax({
        url: "/reqCategoryDonation",
        type: "GET",
        async: false,
        contentType: 'application/json',
        dataType: "json",
        success: function(data) {
            console.log(data);
            isHTTPStatusOK = true;
        },
        error: function(jqXHR, status, error) {
            console.log('[reqEventGenRule] failed to call proxyserver.js - reqEventGenRule');
        },
    }).responseText;

    if (isHTTPStatusOK) return JSON.parse(data);
    else return null;
}

/*
 * 
 * Caller to node.js redeem event reward rule
 * Input : barcodeList
 * Output : eventRewardsResp --> with filter matching item exclusion and item sponsor
 * 
 */
function reqEventRdmRule(promoId, barcodeList) {
    var isHTTPStatusOK = false;
    var reqData = {};
    reqData.promoId = promoId;
    reqData.barcodeList = barcodeList;
    // do hit agent
    var data = $.ajax({
        url: "/reqEventRdmRule",
        type: "POST",
        async: false,
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify(reqData),
        success: function(data, status) {
            isHTTPStatusOK = true;
        },
        error: function(jqXHR, status, error) {
            console.log('[reqEventRdmRule] failed to call proxyserver.js - reqEventRdmRule');
        },
    }).responseText;

    if (isHTTPStatusOK) return JSON.parse(data);
    else return null;
}

function callAgent(reqType, reqData) {
    var returnResponse = {};
    returnResponse.rspCode = 999;
    returnResponse.msg = 'FAILED GENERAL REASON';

    if (connectionOnline) {
        //initiate variable
        var isHTTPStatusOK = false;
        var path = {};
        path.generate = '/voucher/generate';
        path.rollback = '/voucher/rollback';
        path.redeem = '/voucher/redeem';
        path.commit = '/voucher/commit';
        path.void = '/voucher/invalidate';
        path.inquiry = '/voucher/inquiry';

        reqData.posGrp = configuration.terminalType;

        var reqObj = {
            'storeId': saleTx.storeCd,
            'posNumber': saleTx.posTerminalId,
            'cashierId': saleTx.userName,
            'payload': reqData,
            'macAddress': configuration.macAddress,
            'posKey': configuration.initkey
        }

        // do hit agent
        uilog('DBUG', '[VoucherAgent]::Req::' + reqType + '::' + JSON.stringify(reqObj));
        var data = $.ajax({
            url: configuration.properties['MV_HOST'] + ':' + configuration.properties['MV_PORT'] + path[reqType],
            type: 'POST',
            async: false,
            dataType: "json",
            data: JSON.stringify(reqObj),
            success: function(data, status) {
                isHTTPStatusOK = true;
            },
            error: function(jqXHR, status, error) {
                returnResponse.rspCode = 401; //MARKETING VOUCHER AGENT UNABLE TO RESPONSE
                returnResponse.msg = error;
                //console.log(agentBaseUrl + path[reqType]);
                console.log('[VoucherAgent] failed to call agent');
            },
            timeout: 10000
        }).responseText;

        uilog('DBUG', '[VoucherAgent]::Resp::' + reqType + '::' + data);

        if (isHTTPStatusOK) returnResponse = JSON.parse(data);
    } else {
        returnResponse.rspCode = 402; //MARKETING VOUCHER AGENT UNABLE TO RESPONSE
        returnResponse.msg = 'POS TERMINAL OFFLINE';
        console.log('[VoucherAgent] POS TERMINAL OFFLINE ');
    }
    return returnResponse;
}
// INHOUSE VOUCHER 2017-04-13

// INDENT 2017-05-18
function getIndentInquiry(trx_no) {
    var isHTTPStatusOK = false;
    var postData = { trx_no: trx_no };

    var data = $.ajax({
        url: posWebContextPath + "/cashier/getIndentInquiry",
        type: "POST",
        async: false,
        dataType: "json",
        data: JSON.stringify(postData),
        success: function(data, status) {
            isHTTPStatusOK = true;
        },
        error: function(jqXHR, status, error) {
            //uilog('DBUG','Error: ' + error + "\nError Response: " + jqXHR.responseText);
        }
    }).responseText;

    if (!isHTTPStatusOK) {
        showMsgDialog("Failed to retrieve indent information", "warning");
    }
    return (data != '' ? ((isHTTPStatusOK) ? JSON.parse(data) : null) : null);
}

function closeIndent(trx_no) {
    var isHTTPStatusOK = false;
    var postData = { trx_no: trx_no, close_by: saleTx.userId };

    var data = $.ajax({
        url: posWebContextPath + "/cashier/closeIndent",
        type: "POST",
        async: false,
        dataType: "json",
        data: JSON.stringify(postData),
        success: function(data, status) {
            isHTTPStatusOK = true;
        },
        error: function(jqXHR, status, error) {
            //uilog('DBUG','Error: ' + error + "\nError Response: " + jqXHR.responseText);
        }
    }).responseText;

    if (!isHTTPStatusOK) {
        showMsgDialog("Failed to retrieve indent information", "warning");
    }
    return (data != '' ? ((isHTTPStatusOK) ? JSON.parse(data) : null) : null);
}

function voidIndent(trx_no) {
    var isHTTPStatusOK = false;
    var postData = { trx_no: trx_no, void_by: saleTx.userId };

    var data = $.ajax({
        url: posWebContextPath + "/cashier/voidIndent",
        type: "POST",
        async: false,
        dataType: "json",
        data: JSON.stringify(postData),
        success: function(data, status) {
            isHTTPStatusOK = true;
        },
        error: function(jqXHR, status, error) {
            //uilog('DBUG','Error: ' + error + "\nError Response: " + jqXHR.responseText);
        }
    }).responseText;

    // voidDeptStore 2017
    if (!isHTTPStatusOK) {
        //		showMsgDialog("Failed to void indent", "warning");
        //console.log("Failed to void indent");
    }
    // voidDeptStore 2017
    return (data != '' ? ((isHTTPStatusOK) ? JSON.parse(data) : null) : null);
}

// INDENT 2017-05-18
//Added By Rafi Haribi
function addedDiscount() {
    var triggerAddedDiscount = addedCrmResponse;
    console.log("triggerAddedDiscount : " + JSON.stringify(triggerAddedDiscount));
    if (addedDiscountEnable(triggerAddedDiscount)) {
        saleTx.employeeDiscountToggled = true;
        addedApplyEmployeeDiscount();
    }
}

function addedDiscountEnable(crmParameter) {
    var result = false;
    var profitCode = getConfigValue("DISC_PROFIT_CODE");
    var status = crmParameter.status;
    if (crmParameter.profitCodes == profitCode && crmParameter.status == 'ACTIVE') {
        uilog('DBUG', "result true");
        result = true;
    } else {
        uilog('DBUG', "result false");
        result = false;
    }
    return result;
}

function addedApplyEmployeeDiscount() {
    // if (saleTx.employeeDiscountToggled) {
    //     console.log("=====addedApplyEmployeeDiscount");
    //     var empDiscPer = parseInt(getConfigValue("DISC_PERCENT")) / 100;
    //     var empDiscThrMax = parseInt(getConfigValue("EMP_DISC_THR_MAX"));
    //     var listItemInclusions = getItemInclusion(saleTx.orderItems);

    //     saleTx.employeeDiscountToggled = true;
    //     saleTx.orderItems.forEach(function(item) {
    //         if (!item.discBtnApplied && isValidForEmployeeDiscount(item.plu) && !isValidForItemExclusion(listItemInclusions, item.sku)
    //         && EmployeeThrMaxAmount(saleTx.totalDiscount)) {
    //             var totalDiscount = (item.discountAmount ? item.discountAmount : 0) +
    //                 (item.secondLayerDiscountAmount ? item.secondLayerDiscountAmount : 0) +
    //                 (item.crmMemberDiscountAmount ? item.crmMemberDiscountAmount : 0);
    //             if (!saleTx.memberDiscReversal) {
    //                 totalDiscount += item.memberDiscountAmount ? item.memberDiscountAmount : 0;
    //             }
    //             var discountedSubtotal = item.priceSubtotal - totalDiscount;

    //             //If HYPERCASH and customer is not PROFESSIONAL, apply employee discount after markup
    //             if (isHcEnabled && profCust.memberType != 'PROFESSIONAL') {
    //                 discountedSubtotal += Hypercash.service.computeMarkUpWithoutTax(item);
    //             }

    //             var employeeDiscount = Math.round(discountedSubtotal * empDiscPer);

    //             uilog('DBUG', "employeeDiscount" + parseInt(employeeDiscount));
    //             item.discBtnAmount = employeeDiscount;
    //             if (item.salesType == CONSTANTS.TX_TYPES.SALE_VOID.name) {
    //                 saleTx.voidedDiscount += employeeDiscount;
    //             } else if (item.salesType == CONSTANTS.TX_TYPES.SALE.name) {
    //                 saleTx.totalDiscount += employeeDiscount;
    //             }
    //             item.discBtnApplied = true;
    //             saleTx.totalDiscount = parseInt(saleTx.totalDiscount);
    //             saveTxn();
               
    //         }
    //     });

    //     if(saleTx.totalDiscount >= empDiscThrMax){
    //         saleTx.totalDiscount = empDiscThrMax;
    //     }
        
    //     renderTotal();
    // } else {
    //     showMsgDialog(getMsgValue("pos_error_msg_employee_discount_disabled"), "error");
    // }
}

function parsing(binInclusion, cardNumber) {
    var qty = "0";
    var temp = [];
    var bolId = false;

    for (var i = 0; i <= binInclusion.length - 1; i++) {
        console.log("Inclusion : " + binInclusion[i]);
        var incRep = binInclusion[i].replace(/[|]/gi, ",");
        incRep = incRep.split(",");
        for (var a = 0; a <= incRep.length - 1; a++) {
            var toSend = incRep[a];
            temp.push(toSend.substring(0, 6));
            var parseInclusion = incRep[a].substring(0, 6);
            if (parseInclusion == cardNumber) {
                var qtytemp = incRep[incRep.length - 1];
                qtytemp = qtytemp.split(":");
                qty = qtytemp[1];
                bolId = true;
            }
            if (toSend.length < 5) {
                console.log("toSend : " + toSend);
                if (!bolId) {
                    var qtytemp = incRep[incRep.length - 1];
                    qtytemp = qtytemp.split(":");
                    if (toSend == cardNumber.substring(0, 1) || qtytemp[0] == cardNumber.substring(0, 1)) {
                        qty = qtytemp[1];
                        bolId = true;
                    }
                }
            }
        }
    }
    var ret = {
        "binInclusion": temp,
        "qtyInclusion": qty,
        "bolId": bolId
    }
    return ret;
}

function processEventRewardsTry(executeFunctionAfter) {
    if (isHcEnabled && getConfigValue('HC_USE_SMALL_PRINTER') == 'false') {
        executeFunctionAfter();
        return false;
    }

    if (redeemPointTrk || saleGameItemTrk) {
        executeFunctionAfter();
        return false;
    }

    if (saleTx.type != 'SALE' || saleTx.isCancelled) {
        executeFunctionAfter();
        return false;
    }

    var orderItems = saleTx.orderItems;

    // get rule and exclusion item
    var barcodeList = [];
    for (var p in orderItems)
        barcodeList.push(orderItems[p].ean13Code);

    console.log('BARCODE LIST');
    console.log(barcodeList);
    var configEventRewards = reqEventGenRule(barcodeList);
    //fahmik
    console.log("barcodeList: " + barcodeList);
    console.log("configEventRewards: " + configEventRewards);
    //fahmik
    
    saleTx.stampCoupon = [];
    saleTx.luckyCustomer = {};
    saleTx.marketingVoucher = [];

    if (configEventRewards.stampCoupon != null) {
        uilog('DBUG', '[processEventRewards] configEventRewards.stampCoupon != null');
        console.log('[processEventRewards] configEventRewards.stampCoupon  = ' + JSON.stringify(configEventRewards.stampCoupon));
        for (var a = 0; a <= configEventRewards.stampCoupon.length - 1; a++) {
            var isSponsor = false;
            var binExcludedPayment = 0;
            var binIncludedPayment = 0;
            var voucherExcludedPayment = 0;
            var totalTrxAmount = 0;
            var temp = {};
            temp.eventSponsorProduct = [];
            temp.eventRewardNo = 0;
            var countRequireSponsor = 0;
            var totalTrxAmountSponsor = 0;
            for (var i in orderItems) {
                var oItem = orderItems[i];


                // CHECK ITEM EXCLUSION
                if (configEventRewards.stampCoupon[a].itemExclusion != null && configEventRewards.stampCoupon[a].itemExclusion.indexOf(oItem.ean13Code) > -1) continue;

                // CHECK CMC EXCLUSION
                if (configEventRewards.stampCoupon[a].cmcExclusion != null && configEventRewards.stampCoupon[a].cmcExclusion && isItemCMC(oItem.ean13Code, saleTx.promotionsMap) && oItem.memberDiscountAmount > 0) continue;

                // CHECK SPONSOR PRODUCT
                if (configEventRewards.stampCoupon[a].sponsorProducts != null &&
                    configEventRewards.stampCoupon[a].sponsorProducts.indexOf(oItem.ean13Code) > -1
                    /* &&
                    				   temp.eventSponsorProduct.indexOf(oItem.ean13Code) < 0*/
                ) {
                    temp.eventSponsorProduct.push(oItem.ean13Code);
                    console.log("Item Ean Code : " + oItem.ean13code);
                    if (configEventRewards.stampCoupon[a].requireSponsor != "0") {
                        countRequireSponsor += oItem.quantity;
                    } else {
                        isSponsor = true;
                    }
                }

                var oItemAmount = oItem.priceSubtotal - oItem.discountAmount - oItem.memberDiscountAmount - oItem.crmMemberDiscountAmount - oItem.discBtnAmount - oItem.secondLayerDiscountAmount;

                console.log("oItemAmount : " + oItemAmount);
                console.log(oItem);

                if (typeof oItem.additionalDiscount !== "undefined") {
                    oItemAmount = oItemAmount - oItem.additionalDiscount;
                }
                // CALCULATE ITEM PRICE
                oItemAmount = (oItemAmount) ? oItemAmount : 0;
                totalTrxAmount += (oItem.isVoided ? -1 * oItemAmount : oItemAmount);

                // FAHMI CHECK SPONSOR PRODUCT
                if (configEventRewards.stampCoupon[a].sponsorProducts != null &&
                    configEventRewards.stampCoupon[a].sponsorProducts.indexOf(oItem.ean13Code) > -1) {
                    totalTrxAmountSponsor += (oItem.isVoided ? -1 * oItemAmount : oItemAmount);
                }

            }
            if (countRequireSponsor >= parseInt(configEventRewards.stampCoupon[a].requireSponsor)) {
                console.log("Test 2 : " + countRequireSponsor);
                isSponsor = true;
            }

            for (var p in saleTx.payments) {
                var payment = saleTx.payments[p];

                // CHECK BIN EXCLUSION
                if (payment.eftData != null && configEventRewards.stampCoupon[a].binExclusion != null && configEventRewards.stampCoupon[a].binExclusion.indexOf(payment.eftData.cardNum.substring(0, 6)) > -1)
                    binExcludedPayment += payment.amountPaid;
                if (payment.PPP !== null) {
                    binExcludedPayment += parseFloat(payment.amountPaid);
                }
                // CHECK BIN INCLUSION
                var simInclNo = false;
                var parsebinInclusion = "";
                var binIncludedQty = 0;
                var binStatus = false;
                if (configEventRewards.stampCoupon[a].binInclusion != null && payment.eftData != null) {
                    var parse = parsing(configEventRewards.stampCoupon[a].binInclusion, payment.eftData.cardNum.substring(0, 6));
                    binIncludedQty = parseInt(parse.qtyInclusion);
                    parsebinInclusion = parse.binInclusion;
                    simInclNo = parse.bolId;
                }
                if (configEventRewards.stampCoupon[a].binInclusion[0] === "") {
                    binIncludedQty = 1;
                    binStatus = true;
                }

                if (payment.eftData != null && parsebinInclusion != null && simInclNo &&
                    ((payment.paymentMediaType == 'EFT_ONLINE') ||
                        (payment.paymentMediaType == 'EFT_OFFLINE') ||
                        (payment.paymentMediaType == 'DEBIT') ||
                        (payment.paymentMediaType == 'EDC_BCA'))) {
                    binIncludedPayment = binIncludedPayment;
                }

                // CHECK VOUCHER PAYMENT
                // STEVEN QUESTION:  GENERATE CONSIDER PAYMENT MEDIA MARKETING VOUCHER, iF YESTTAM
                if (configEventRewards.stampCoupon[a].voucherExclusion != null &&
                    configEventRewards.stampCoupon[a].voucherExclusion &&
                    (
                        (payment.paymentMediaType == 'GC') ||
                        (payment.paymentMediaType == 'GC_MMS') ||
                        (payment.paymentMediaType == 'COUPON') ||
                        (payment.paymentMediaType == 'INSTALLMENT') ||
                        (payment.paymentMediaType == 'SODEXO') ||
                        (payment.paymentMediaType == 'VOUCHER') ||
                        (payment.paymentMediaType == 'POWER_POINT_PURCHASE')
                    ))
                    voucherExcludedPayment += payment.amountPaid;

                console.log("totalTrxAmount : " + totalTrxAmount);
                console.log("saleTx : " + saleTx);
                console.log("saleTx.totalDiscount : " + saleTx.totalDiscount);
                totalTrxAmount -= (binExcludedPayment + voucherExcludedPayment);
                if (totalTrxAmount > payment.amountPaid) {
                    if (!binStatus) {
                        binIncludedPayment = totalTrxAmount;
                        totalTrxAmount = payment.amountPaid;
                    }
                }
                //fahmik
                //if stamp coupon type, count only sponsor items
                if (configEventRewards.stampCoupon[a].minimumPayment == 999999999001) {
                    if (totalTrxAmountSponsor >= configEventRewards.stampCoupon[a].minimumPaymentSponsor) {
                        console.log("Customer eligble for stamp coupon " + configEventRewards.stampCoupon[a].promoHeader);
                        temp.eventRewardNo = 1;
                    }

                } else if (binExcludedPayment <= 0 && totalTrxAmount >= configEventRewards.stampCoupon[a].minimumPayment) {
                    if (configEventRewards.stampCoupon[a].isMulti)
                        temp.eventRewardNo += parseInt(Math.floor(Math.floor(totalTrxAmount / configEventRewards.stampCoupon[a].minimumPayment))) * binIncludedQty;
                    else temp.eventRewardNo++;

                    // 02-03-2018 WC 2018	if((configEventRewards.stampCoupon[a].minimumPaymentSponsor == null || configEventRewards.stampCoupon[a].minimumPaymentSponsor == 0) && isSponsor && (binStatus || simInclNo)){if((configEventRewards.stampCoupon[a].minimumPaymentSponsor == null || configEventRewards.stampCoupon[a].minimumPaymentSponsor == 0) && isSponsor && (binStatus || simInclNo)){
                    if (isSponsor) {
                        console.log("Test 3 : " + configEventRewards.stampCoupon[a].rewardsSponsor);
                        temp.eventRewardNo += parseInt(configEventRewards.stampCoupon[a].rewardsSponsor);
                    }
                } else if (binExcludedPayment <= 0 && isSponsor && configEventRewards.stampCoupon[a].minimumPaymentSponsor != null && configEventRewards.stampCoupon[a].minimumPaymentSponsor > 0 && (totalTrxAmount >= configEventRewards.stampCoupon[a].minimumPaymentSponsor)) {
                    if (!binStatus) {
                        console.log("Test 4 : " + (temp.eventRewardNo += parseInt(Math.floor(Math.floor(totalTrxAmount / configEventRewards.stampCoupon[a].minimumPaymentSponsor))) * binIncludedQty));
                        temp.eventRewardNo += parseInt(Math.floor(Math.floor(totalTrxAmount / configEventRewards.stampCoupon[a].minimumPaymentSponsor))) * binIncludedQty;
                    } else {
                        temp.eventRewardNo += parseInt(configEventRewards.stampCoupon[a].rewardsSponsor);
                    }
                } else if (binExcludedPayment > 0 && ((saleTx.totalAmount - binExcludedPayment) >= parseFloat(configEventRewards.stampCoupon[a].minimumPayment)) && payment.PPP !== null && payment.PPP.trAmt > 0) {
                    if (configEventRewards.stampCoupon[a].isMulti) {
                        var y = parseInt(Math.floor(Math.floor((saleTx.totalAmount - binExcludedPayment) / configEventRewards.stampCoupon[a].minimumPayment))) * binIncludedQty;
                        temp.eventRewardNo = (y);
                    }
                    // else temp.eventRewardNo++;					
                    if (isSponsor) {
                        // console.log("Test 3 : " + configEventRewards.stampCoupon[a].rewardsSponsor);
                        // temp.eventRewardNo += parseInt(configEventRewards.stampCoupon[a].rewardsSponsor);
                    }
                }
                if (!binStatus) {
                    totalTrxAmount = binIncludedPayment - totalTrxAmount;
                }
            }
            var isPPP = false;
            saleTx.payments.forEach(function(val, idx) {
                if (val["PPP"] !== null && val["PPP"]["trAmt"] > 0) {
                    isPPP = true;
                }
            });
            var onlyForPPP = null;
            if (configEventRewards.stampCoupon[a].binInclusion[0] === "" && saleTx.payments.length > 1) {
                onlyForPPP = temp.eventRewardNo;
                temp.eventRewardNo = temp.eventRewardNo / saleTx.payments.length;
            }

            if (isPPP === true && onlyForPPP !== null) {
                temp.eventRewardNo = onlyForPPP;
            }

            uilog('DBUG', '[processEventRewards] Voucher Excluded Amount = ' + voucherExcludedPayment + '; Bin Excluded Amount = ' + binExcludedPayment + '; Bin Included Amount = ' + binIncludedPayment);

            // CALCULATE NO OF REWARDS

            temp.eventRewardNo = (temp.eventRewardNo > configEventRewards.stampCoupon[a].maxRewards && configEventRewards.stampCoupon[a].maxRewards > 0) ? configEventRewards.stampCoupon[a].maxRewards : temp.eventRewardNo;
            temp.eventPromoId = configEventRewards.stampCoupon[a].id;
            temp.eventStartDate = configEventRewards.stampCoupon[a].startDate;
            temp.eventEndDate = configEventRewards.stampCoupon[a].endDate;
            temp.eventMaxReward = configEventRewards.stampCoupon[a].maxRewards;
            temp.eventType = configEventRewards.stampCoupon[a].type;
            temp.eventTotalAmount = totalTrxAmount;

            // COLLECT THE COUPON NUMBER
            temp.eventCoupons = [];
            if (configEventRewards.stampCoupon[a].type == 2) {
                for (var seq = 1; seq <= temp.eventRewardNo; seq++)
                    temp.eventCoupons.push(configEventRewards.stampCoupon[a].promoPrefix + saleTx.transactionId + ("000" + seq).slice(-3));
            }

            temp.eventRewardsObj = {};
            temp.eventRewardsObj.promoHeader = configEventRewards.stampCoupon[a].promoHeader;
            temp.eventRewardsObj.promoLines = configEventRewards.stampCoupon[a].promoLines;
            temp.eventRewardsObj.startDate = configEventRewards.stampCoupon[a].startDate;
            temp.eventRewardsObj.endDate = configEventRewards.stampCoupon[a].endDate;
            temp.eventRewardsObj.promoCouponTemplate = configEventRewards.stampCoupon[a].promoCouponTemplate;
            temp.eventRewardsObj.promoPrefix = configEventRewards.stampCoupon[a].promoPrefix;

            uilog('DBUG', '[processEventRewards] Event Reward Details|ToAmt:' + totalTrxAmount + '|MinPay:' + configEventRewards.stampCoupon[a].minimumPayment + '|MinPaySpon:' + configEventRewards.stampCoupon[a].minimumPaymentSponsor + '|ReNo:' + temp.eventRewardNo + '|EvTy:' + saleTx.stampCoupon.eventType + '|EvID:' + saleTx.stampCoupon.eventPromoId);
            saleTx.stampCoupon.push(temp);

            if (empLoyaltyPointsAvail && temp.eventRewardNo > 0) {
                earnLoyaltyProgram = {
                    hpNumber: saleTx.customerId,
                    trNumber: saleTx.transactionId,
                    eventPromoId: configEventRewards.stampCoupon[a].id,
                    eventPromoPoint: temp.eventRewardNo
                }
                earnLoyaltPointAfter(earnLoyaltyProgram);
                console.log("data `" + InfoloyaltyProgram);
            }
        }
    }

    if (connectionOnline && parseFloat(saleTx.pppTotalPoint) > 0 && parseFloat(saleTx.pppTotalAmount) > 0) {
        earnLoyaltyProgram = {
            hpNumber: saleTx.customerId,
            trNumber: saleTx.transactionId,
            eventPromoId: "27",
            eventPromoPoint: (parseFloat(saleTx.pppTotalPoint) - 2 * parseFloat(saleTx.pppTotalPoint)).toString(),
            pppPointRedeem: true
        }
        earnLoyaltPointAfter(earnLoyaltyProgram);
    }

    if (connectionOnline && configEventRewards.luckyCustomer != null) {
        saleTx.luckyCustomer.eventSponsorProduct = [];
        saleTx.luckyCustomer.luckyEventRewardNo = 0;
        saleTx.luckyCustomer.luckyEventPromoId = configEventRewards.luckyCustomer.id;
        saleTx.luckyCustomer.luckyEventStartDate = configEventRewards.luckyCustomer.startDate;
        saleTx.luckyCustomer.luckyEventEndDate = configEventRewards.luckyCustomer.endDate;
        saleTx.luckyCustomer.luckyEventType = configEventRewards.luckyCustomer.type;
        saleTx.luckyCustomer.luckyEventMaxReward = configEventRewards.luckyCustomer.maxRewards;

        // CALCULATE ITEM
        var binExcludedPayment = 0;

        console.log("configEventRewards.luckyCustomer : " + JSON.stringify(configEventRewards.luckyCustomer));
        var totalTrxAmount = 0;
        var voucherExcludedPayment = 0;
        var isSponsor = false;

        for (var i in saleTx.orderItems) {
            var oItem = saleTx.orderItems[i];

            // CHECK ITEM EXCLUSION
            if (configEventRewards.luckyCustomer.itemExclusion != null &&
                configEventRewards.luckyCustomer.itemExclusion.indexOf(oItem.ean13Code) > -1) continue;

            // CHECK CMC EXCLUSION
            if (configEventRewards.luckyCustomer.cmcExclusion != null &&
                configEventRewards.luckyCustomer.cmcExclusion &&
                isItemCMC(oItem.ean13Code, saleTx.promotionsMap) &&
                oItem.memberDiscountAmount > 0) continue;

            // CHECK SPONSOR PRODUCT
            if (configEventRewards.luckyCustomer.sponsorProducts != null &&
                configEventRewards.luckyCustomer.sponsorProducts.indexOf(oItem.ean13Code) > -1 &&
                saleTx.luckyCustomer.eventSponsorProduct.indexOf(oItem.ean13Code) < 0) {
                saleTx.luckyCustomer.eventSponsorProduct.push(oItem.ean13Code);
                isSponsor = true;
            }

            // CALCULATE ITEM PRICE
            var oItemAmount = oItem.priceSubtotal - oItem.discountAmount - oItem.memberDiscountAmount - oItem.crmMemberDiscountAmount - oItem.discBtnAmount - oItem.secondLayerDiscountAmount;
            oItemAmount = (oItemAmount) ? oItemAmount : 0;
            totalTrxAmount += (oItem.isVoided ? -1 * oItemAmount : oItemAmount);
        }

        for (var p in saleTx.payments) {
            var payment = saleTx.payments[p];

            // CHECK BIN EXCLUSION
            if (payment.eftData != null &&
                configEventRewards.luckyCustomer.binExclusion != null &&
                configEventRewards.luckyCustomer.binExclusion.indexOf(payment.eftData.cardNum.substring(0, 6)) > -1)
                binExcludedPayment += payment.amountPaid;
            if (configEventRewards.luckyCustomer.voucherExclusion != null &&
                configEventRewards.luckyCustomer.voucherExclusion &&
                ((payment.paymentMediaType == 'GC') ||
                    (payment.paymentMediaType == 'GC_MMS') ||
                    (payment.paymentMediaType == 'COUPON') ||
                    (payment.paymentMediaType == 'INSTALLMENT') ||
                    (payment.paymentMediaType == 'SODEXO') ||
                    (payment.paymentMediaType == 'VOUCHER')))
                voucherExcludedPayment += payment.amountPaid;
        }
        uilog('DBUG', '[processEventRewards|LUCKYCUST] Voucher Excluded Amount = ' + voucherExcludedPayment + '; Bin Excluded Amount = ' + binExcludedPayment);

        // CALCULATE NO OF REWARDS
        totalTrxAmount -= (binExcludedPayment + voucherExcludedPayment);

        uilog('DBUG', '[processEventRewards|LUCKYCUST] Total Sales Amount = ' + totalTrxAmount);

        // CALCULATE NO OF REWARDS
        if ((binExcludedPayment <= 0 && totalTrxAmount >= configEventRewards.luckyCustomer.minimumPayment) ||
            (binExcludedPayment <= 0 && isSponsor &&
                configEventRewards.luckyCustomer.minimumPaymentSponsor != null &&
                configEventRewards.luckyCustomer.minimumPaymentSponsor > 0 &&
                (totalTrxAmount >= configEventRewards.luckyCustomer.minimumPaymentSponsor))
        ) {
            console.log('masuk ke kondisi <<<>>>');
            saleTx.luckyCustomer.luckyEventRewardsObj = {};
            saleTx.luckyCustomer.luckyEventRewardsObj.promoHeader = configEventRewards.luckyCustomer.promoHeader;
            saleTx.luckyCustomer.luckyEventRewardsObj.promoLines = configEventRewards.luckyCustomer.promoLines;
            saleTx.luckyCustomer.luckyEventRewardsObj.startDate = configEventRewards.luckyCustomer.startDate;
            saleTx.luckyCustomer.luckyEventRewardsObj.endDate = configEventRewards.luckyCustomer.endDate;
            saleTx.luckyCustomer.luckyEventRewardsObj.eventTotalAmount = totalTrxAmount;

            // REQUEST THE LUCKY CUSTOMER COUNTER TO STORE SERVICE
            $.ajax({
                url: posWebContextPath + "/cashier/getLuckyCustomer",
                type: "POST",
                async: false,
                data: JSON.stringify({
                    'luckyEventPromoId': saleTx.luckyCustomer.luckyEventPromoId,
                    'luckyEventStartDate': saleTx.luckyCustomer.luckyEventStartDate,
                    'luckyEventEndDate': saleTx.luckyCustomer.luckyEventEndDate,
                    'luckyEventMaxReward': saleTx.luckyCustomer.luckyEventMaxReward
                }),
                success: function(response) {
                    saleTx.luckyCustomer.luckyEventRewardNo = response;
                    if (parseInt(response) == 0) saleTx.luckyCustomer.luckyEventPromoId = 0;
                }
            });
        }
    }
    if (configEventRewards.marketingVoucher != null) {
        for (var a = 0; a <= configEventRewards.marketingVoucher.length - 1; a++) {
            if (connectionOnline && typeof configEventRewards.marketingVoucher[a].mvConfig != 'undefined') {
                // check if pos group not allowed, return false
                if ((configuration.terminalType != 'DEPTSTORE' && configEventRewards.marketingVoucher[a].mvConfig.mvGenRegulerStatus != 1) ||
                    configuration.terminalType == 'DEPTSTORE' && configEventRewards.marketingVoucher[a].mvConfig.mvGenDeptStoreStatus != 1) {
                    executeFunctionAfter();
                    return false;
                }

                var temp = {};
                temp.eventSponsorProduct = [];

                // CALCULATE ITEM
                var binExcludedPayment = 0;
                var binIncludedPayment = 0;
                var binIncludedQty = "1";
                var totalTrxAmount = 0;
                var voucherExcludedPayment = 0;
                var isSponsor = false;
                var isRequestAgent = false;
                var agentResponse = null;
                var responseRequest = {};
                responseRequest.rspCode = 999;
                responseRequest.msg = 'UNKNOWN ERROR';

                console.log(saleTx.orderItems);
                console.log('MARKETING VOUCHER OBJ');
                console.log(configEventRewards.marketingVoucher[a]);
                for (var i in saleTx.orderItems) {
                    var oItem = saleTx.orderItems[i];

                    if (oItem.categoryId == 'MVOUCHER') continue;
                    // CHECK ITEM EXCLUSION
                    if (configEventRewards.marketingVoucher[a].itemExclusion != null &&
                        configEventRewards.marketingVoucher[a].itemExclusion.indexOf(oItem.ean13Code) > -1) continue;

                    // CHECK CMC EXCLUSION
                    if (configEventRewards.marketingVoucher[a].cmcExclusion != null &&
                        configEventRewards.marketingVoucher[a].cmcExclusion &&
                        isItemCMC(oItem.ean13Code, saleTx.promotionsMap) &&
                        oItem.memberDiscountAmount > 0) continue;

                    // CHECK SPONSOR PRODUCT
                    if (configEventRewards.marketingVoucher[a].sponsorProducts != null &&
                        configEventRewards.marketingVoucher[a].sponsorProducts.indexOf(oItem.ean13Code) > -1 &&
                        temp.eventSponsorProduct.indexOf(oItem.ean13Code) < 0) {
                        temp.eventSponsorProduct.push(oItem.ean13Code);
                        isSponsor = true;
                    }

                    // CALCULATE ITEM PRICE
                    var oItemAmount = oItem.priceSubtotal - oItem.discountAmount - oItem.memberDiscountAmount - oItem.crmMemberDiscountAmount - oItem.discBtnAmount - oItem.secondLayerDiscountAmount;

                    uilog('DBUG', 'ITEM');
                    uilog('DBUG', oItem);
                    // INHOUSE VOUCHER 2017-05-02
                    /*if(oItem.discVoucher && oItem.discVoucher.length > 0)
                    {
                    	for(var v in oItem.discVoucher)
                    		oItemAmount -= parseInt(oItem.discVoucher);
                    }*/
                    // INHOUSE VOUCHER 2017-05-02

                    totalTrxAmount += (oItem.isVoided ? -1 * oItemAmount : oItemAmount);
                }

                for (var p in saleTx.payments) {
                    var payment = saleTx.payments[p];

                    // CHECK BIN EXCLUSION
                    if (payment.eftData != null &&
                        configEventRewards.marketingVoucher[a].binExclusion != null &&
                        configEventRewards.marketingVoucher[a].binExclusion.indexOf(payment.eftData.cardNum.substring(0, 6)) > -1)
                        binExcludedPayment += payment.amountPaid;

                    // CHECK BIN INCLUSION
                    var simInclNo = false;
                    if (configEventRewards.marketingVoucher[a].binInclusion != null && payment.eftData != null) {
                        var parse = parsing(configEventRewards.marketingVoucher[a].binInclusion, payment.eftData.cardNum.substring(0, 6));
                        uilog('DBUG', "Parse : " + JSON.stringify(parse));
                        binIncludedQty = parse.qtyInclusion;
                        configEventRewards.marketingVoucher[a].binInclusion = parse.binInclusion;
                        simInclNo = parse.bolId;
                    }

                    if (payment.eftData != null && configEventRewards.marketingVoucher[a].binInclusion != null && simInclNo &&
                        ((payment.paymentMediaType == 'EFT_ONLINE') ||
                            (payment.paymentMediaType == 'EFT_OFFLINE') ||
                            (payment.paymentMediaType == 'DEBIT') ||
                            (payment.paymentMediaType == 'EDC_BCA'))) {
                        binIncludedPayment = binIncludedPayment;
                    } else {
                        console.log("Masuk Kesini Else Inclusion");
                        binIncludedPayment += payment.amountPaid;
                    }

                    if (configEventRewards.marketingVoucher[a].voucherExclusion != null &&
                        configEventRewards.marketingVoucher[a].voucherExclusion &&
                        ((payment.paymentMediaType == 'GC') ||
                            (payment.paymentMediaType == 'COUPON') ||
                            (payment.paymentMediaType == 'INSTALLMENT') ||
                            (payment.paymentMediaType == 'SODEXO') ||
                            (payment.paymentMediaType == 'VOUCHER')))
                        voucherExcludedPayment += payment.amountPaid;
                }
                uilog('DBUG', '[processEventRewards|MARKETINGVOUCHER] Voucher Excluded Amount = ' + voucherExcludedPayment + '; Bin Excluded Amount = ' + binExcludedPayment + '; Bin Included Amount = ' + binIncludedPayment);

                // CALCULATE NO OF REWARDS
                totalTrxAmount -= (binExcludedPayment + voucherExcludedPayment);
                uilog('DBUG', '[processEventRewards|MARKETINGVOUCHER] Total Sales Amount = ' + totalTrxAmount);

                // CHECK MINIMUM PAYMENT ELIGIBLE TO CALL AGENT
                if (binExcludedPayment > 0) // CONFIRMED PAK IMAN 20161024143600: Jika contaminated bin = gagal semua
                    isRequestAgent = false;
                else if (binIncludedPayment > 0) {
                    //isRequestAgent = true;
                    if (configuration.terminalType != 'DEPTSTORE' &&
                        configEventRewards.marketingVoucher[a].mvConfig.mvGenRegulerStatus == 1 &&
                        totalTrxAmount >= configEventRewards.marketingVoucher[a].mvConfig.mvGenReguler){
                            //multi tier
                            if(configEventRewards.marketingVoucher[a].mvConfig.mvGenMaxReguler != null){
                                if(totalTrxAmount <= configEventRewards.marketingVoucher[a].mvConfig.mvGenMaxReguler)
                                    isRequestAgent = true;
                            }else{
                                isRequestAgent = true;
                            }
                    }
                    else if (configuration.terminalType == 'DEPTSTORE' &&
                        configEventRewards.marketingVoucher[a].mvConfig.mvGenDeptStoreStatus == 1 &&
                        totalTrxAmount >= configEventRewards.marketingVoucher[a].mvConfig.mvGenDeptStore){
                            //multi tier
                            if(configEventRewards.marketingVoucher[a].mvConfig.mvGenMaxDeptStore != null){
                                if(totalTrxAmount <= configEventRewards.marketingVoucher[a].mvConfig.mvGenMaxDeptStore)
                                    isRequestAgent = true;
                            }else{
                                isRequestAgent = true;
                            }
                    }
                    else isRequestAgent = false;
                } else if (isSponsor && (totalTrxAmount >= configEventRewards.marketingVoucher[a].minimumPaymentSponsor))
                    isRequestAgent = true;
                else if (configuration.terminalType != 'DEPTSTORE' &&
                    configEventRewards.marketingVoucher[a].mvConfig.mvGenRegulerStatus == 1 &&
                    totalTrxAmount >= configEventRewards.marketingVoucher[a].mvConfig.mvGenReguler){
                        //multi tier
                        if(configEventRewards.marketingVoucher[a].mvConfig.mvGenMaxReguler != null){
                            if(totalTrxAmount <= configEventRewards.marketingVoucher[a].mvConfig.mvGenMaxReguler)
                                isRequestAgent = true;
                        }else{
                            isRequestAgent = true;
                        }
                }
                else if (configuration.terminalType == 'DEPTSTORE' &&
                    configEventRewards.marketingVoucher[a].mvConfig.mvGenDeptStoreStatus == 1 &&
                    totalTrxAmount >= configEventRewards.marketingVoucher[a].mvConfig.mvGenDeptStore){
                        //multi tier
                        if(configEventRewards.marketingVoucher[a].mvConfig.mvGenMaxDeptStore != null){
                            if(totalTrxAmount <= configEventRewards.marketingVoucher[a].mvConfig.mvGenMaxDeptStore)
                                isRequestAgent = true;
                        }else{
                            isRequestAgent = true;
                        }
                }
                else isRequestAgent = false;

                // IF OK FIRE REQUEST TO AGENT POSS
                if (isRequestAgent == true /* && isRequestAgent == false*/ ) {
                    // prepare to hit agent
                    var mvRequestData = {};
                    var isHTTPStatusOK = false;
                    mvRequestData.trxId = saleTx.transactionId;
                    mvRequestData.amtTotal = saleTx.totalAmount;
                    mvRequestData.amtAffected = totalTrxAmount;
                    mvRequestData.posGrp = configuration.terminalType;
                    mvRequestData.eventPromoId = configEventRewards.marketingVoucher[a].id;
                    mvRequestData.isSponsor = isSponsor;

                    /*agentResponse = {
                    	'rspCode': 200,
                    	'msg': 'SUCCESS',
                    	'voucherList': ['1003012345689098'],
                    	'voucherAmt': 50000,
                    	'expDate': '2016-12-31',
                    	'promoId': '1003',
                    	'auxInfo': {
                    		'status': 'GENERATED',
                    		
                    	}
                    }; // DUMMY VOUCHER RESP
                    */
                    agentResponse = callAgent('generate', mvRequestData);
                } else responseRequest.rspCode = 121; //GENERATE-MINIMUM ELIGIBLE AMOUNT NOT MEET
                //*/

                // response to set
                if (agentResponse) {
                    var voucherList = [];
                    if (agentResponse.voucherList) {
                        for (var vc in agentResponse.voucherList)
                            voucherList.push(vc);
                    }

                    temp.marketingVoucherRewardNo = 1; //(agentResponse != null && typeof agentResponse.voucherList != 'undefined' && voucherList != null) ? voucherList.length : 0;
                    temp.marketingVoucherPromoId = configEventRewards.marketingVoucher[a].id;
                    temp.marketingVoucherStartDate = configEventRewards.marketingVoucher[a].startDate;
                    temp.marketingVoucherEndDate = configEventRewards.marketingVoucher[a].endDate;
                    temp.marketingVoucherType = configEventRewards.marketingVoucher[a].type;
                    temp.marketingVoucherMaxReward = configEventRewards.marketingVoucher[a].maxRewards;
                    temp.marketingVoucherObj = {};
                    temp.marketingVoucherObj.promoHeader = configEventRewards.marketingVoucher[a].promoHeader;
                    temp.marketingVoucherObj.promoDesc = configEventRewards.marketingVoucher[a].promoDesc;
                    temp.marketingVoucherObj.mvConfig = configEventRewards.marketingVoucher[a].mvConfig;
                    temp.marketingVoucherObj.promoLines = configEventRewards.marketingVoucher[a].promoLines;
                    temp.marketingVoucherObj.promoCouponTemplate = configEventRewards.marketingVoucher[a].promoCouponTemplate;
                    temp.marketingVoucherObj.startDate = configEventRewards.marketingVoucher[a].startDate;
                    temp.marketingVoucherObj.endDate = configEventRewards.marketingVoucher[a].endDate;
                    temp.marketingVoucherObj.marketingVoucherEligibleAmount = totalTrxAmount;
                    temp.marketingVoucherObj.rspCode = (agentResponse != null) ? agentResponse.rspcode : responseRequest.rspCode;
                    temp.marketingVoucherObj.msg = (agentResponse != null) ? agentResponse.msg : responseRequest.msg;
                    temp.marketingVoucherObj.voucherList = voucherList;
                    temp.marketingVoucherObj.voucherAmt = (typeof agentResponse.voucherAmt != 'undefined') ? agentResponse.voucherAmt : null;
                    temp.marketingVoucherObj.expDate = (typeof agentResponse.expDate != 'undefined') ? agentResponse.expDate : null;
                    uilog('DBUG', "Marketing Voucher : " + JSON.stringify(temp));

                    //multi tier
                    saleTx.marketingVoucher.push(temp);
                }
                //*/
                // COUNT NUMBER OF REWARDS -- FINAL CHECK BEFORE HITTING -- END
            }
        }
    }

    executeFunctionAfter();
}

function findReversePromoPwp(productId, cobrand, promoMaps) {
    for (var i in promoMaps) {
        if (productId == i) {
            for (var j in promoMaps[i]) {
                if (promoMaps[i][j].promotionType == "7" && promoMaps[i][j].discountType == "1") {
                    if (promoMaps[i][j].coBrandNumber == "") {
                        return false;
                    } else if (promoMaps[i][j].coBrandNumber !== "") {
                        if (promoMaps[i][j].coBrandNumber.indexOf(cobrand) > -1) {
                            return false;
                        } else {
                            return promoMaps[i][j];
                        }
                    } else {
                        return false;
                    }
                }
            }
        }
    }
}

$("#buildversion").click(function() {
    var isHTTPStatusOK = false;
    var changelogData;
    var data = $.ajax({
        url: posWebContextPath + "/cashier/getChangelog",
        type: "GET",
        async: false,
        success: function(data, status) {
            isHTTPStatusOK = true;
            $("#semver-dialog").dialog("open");
            $("#semverui").text(data);
        }
    }).responseText;
});
