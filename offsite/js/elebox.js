var ELEBOX = ELEBOX || {};

/**
 * Constants
 */
ELEBOX.constants = {
    SALES: 0,
    RETURN: 1,
    INQUIRY: 2
};

// Yang bisa lanjut hanya item status 1
ELEBOX.itemStatus = {
    REGISTERED: "1",
    EXPIRED: "2",
    PAID: "3", //Kirim
    SUCCESS: "5", //Kalo dapet ini jgn di lanjut
    FAILED: "6",
    RETURNED: "7" //Kirim
};

ELEBOX.trxStatus = {
    ACK_ONLY: "1",
    FULL_INFO: "2"
};

/**
 * Global variables
 */
ELEBOX.variables = {
    paymentType: null,
    transactionType: null,
    customerId: null,
    apiType: null,
    enablePaymentMedia: false
};

ELEBOX.trxId = null;
ELEBOX.storeCd = null;

/**
 * Web service URLs.
 */
ELEBOX.mUrl = {
    inquiry: "inquiry",
    confirmation: "confirmation"
};

ELEBOX.isEleboxTransaction = function() {
    //uilog("DBUG", "isEleboxTransaction saleTx: "+JSON.stringify(saleTx.elebox));
    if (!jQuery.isEmptyObject(saleTx.elebox)) {
        return true;
    }
    return false;
};

/**
 * ELEBOX Create Request
 * @param requestType type for request 0 = SALES, 1 = RETURN, 2 = INQUIRY
 */
ELEBOX.createRequest = function(paramData, requestType) {
    var data = JSON.stringify(paramData);
    var response = null;
    var mUrl = posWebContextPath + "/cashier/elebox/";
    switch (requestType) {
        case ELEBOX.constants.INQUIRY:
            mUrl += this.mUrl.inquiry;
            type = "INQUIRY";
            break;
        case ELEBOX.constants.RETURN:
            mUrl += this.mUrl.confirmation;
            type = "RETURN";
            break;
        default:
            mUrl += this.mUrl.confirmation;
            type = "SALES";
            break;
    }
    uilog('DBUG', "data" + data);
    uilog('DBUG', "mUrl" + mUrl);
    $.ajax({
        url: mUrl,
        type: "POST",
        async: false,
        contentType: "application/json",
        data: data,
        beforeSend: function() {
            $("#bpLoadingDialogMessage").html(getMsgValue("bp_label_loading_elebox_inquiry"));
            $("#bpLoading-dialog").dialog("open");
        },
        timeout: 180000, //180 sec
        success: function(resp) {
            console.log(resp);
            uilog('DBUG', "rsponse awal" + resp);
            $("#bpLoading-dialog").dialog("close");
            if (resp == null) {
                $("#eleboxTimeout-dialog").dialog("open");
            } else {
                switch (requestType) {
                    case ELEBOX.constants.INQUIRY:
                        response = resp;
                        var parsedResponse = ELEBOX.parseResponse(response);
                        var responseItemStatus = parsedResponse.order.cart.detail_list.item_status;
                        switch (responseItemStatus) {
                            case ELEBOX.itemStatus.REGISTERED:
                                $("#eleboxInfo-dialog").data("eleboxInfoX", resp);
                                $("#eleboxInfo-dialog").data("eleboxInfo", parsedResponse).dialog("open");
                                displayEleboxCustomer(parsedResponse);
                                CustomerPopupScreen.cus_showEleboxCustomer(parsedResponse);
                                CustomerPopupScreen.cus_showEleboxDialog(parsedResponse);
                                break;
                            case ELEBOX.itemStatus.EXPIRED:
                                $("#eleboxExpired-dialog").data("eleboxInfo", parsedResponse).dialog("open");
                                break;
                            case ELEBOX.itemStatus.FAILED:
                                $("#eleboxFailed-dialog").data("eleboxInfo", parsedResponse).dialog("open");
                                displayEleboxFailed(parsedResponse);
                                CustomerPopupScreen.cus_showEleboxFailed(parsedResponse);
                                CustomerPopupScreen.cus_showEleboxFailDialog(parsedResponse);
                                break;
                            default:
                                $("#elebox-status-dialog").data("eleboxInfo", parsedResponse).dialog("open");
                                displayEleboxStatus(parsedResponse);
                                CustomerPopupScreen.cus_showEleboxInfoStatus(parsedResponse);
                                CustomerPopupScreen.cus_showEleboxDialogStatus(parsedResponse);
                                break;
                        }
                        break;
                    default:
                        response = resp;
                }
                console.log(response);
            }
        },
        error: function(xhr, opt, ex) {
            response = ex;
            console.log("ERROR: ");
            console.log(ex);
            uilog('DBUG', "Error: " + ex);
            $("#bpLoading-dialog").dialog("close");
            $("#eleboxTimeout-dialog").dialog("open");
        },
        progress: function() {
            //While on progress here.
        }
    });

    uilog('DBUG', "ELEBOX.createRequest");
    uilog('DBUG', "Type: " + type);
    uilog('DBUG', "mUrl: " + mUrl);
    uilog('DBUG', "Response: ");
    uilog('DBUG', response);

    return response;
};

ELEBOX.trxCount = 1;

ELEBOX.resetTrxCount = function() {
    ELEBOX.trxCount = 1;
};

ELEBOX.refreshElebox = function() {
    ELEBOX.variables = null;
};

ELEBOX.generateEleboxRequestParam = function(parameter, type) {
    var trxDate = $.format.date(new Date(), "yyyyMMdd");
    var trxTime = $.format.date(new Date(), "HHmmss");
    var result = "";
    var param = "";
    /*
    if(!type || type == 1){
	   var eleboxInfoList = $("#eleboxInfo-dialog").data("eleboxInfo");
	if(type == 1){
	   eleboxInfoList = $("#eleboxFailed-dialog").data("eleboxInfo");
	}
    var ee = {
        elebox: eleboxInfoList
    };
	var data = ee;*/
    var orderId = "";
    uilog("DBUG", "generateEleboxRequestParam parameter: " + JSON.stringify(parameter));
    if (type == ELEBOX.constants.INQUIRY) {
        orderId = parameter;
        param = "<order><order_id>" + orderId + "</order_id><trx_date>" + trxDate + "</trx_date><trx_time>" + trxTime + "</trx_time><trx_type>" + type + "</trx_type></order>";
    } else {
        orderId = parameter.elebox.order.order_id;
        var unitPrice = parameter.elebox.order.cart.detail_list.unit_price;
        var qty = parameter.elebox.order.cart.detail_list.qty;
        var ean = parameter.elebox.order.cart.detail_list.ean;
        var eanFee = parameter.elebox.order.cart.detail_list.ean_fee;
        var unitPriceBase = parameter.elebox.order.cart.detail_list.unit_price_base;
        var unitPriceFee = parameter.elebox.order.cart.detail_list.unit_price_fee;
        if (type == ELEBOX.constants.RETURN) {
            var i = 0;
            var seq = i + 1;
            uilog('DBUG', "ELEBOX transaction id: " + this.trxId);
            param = "<elebox><order_count>" + seq + "</order_count><order><order_sequence>" + seq + "</order_sequence><order_id>" + orderId + "</order_id><trx_date>" + trxDate + "</trx_date><trx_time>" + trxTime + "</trx_time><rcpt_no>" + ELEBOX.trxId + "</rcpt_no><trx_type>" + type + "</trx_type><cart><count>" + seq + "</count><detail_list><sequence>" + seq + "</sequence><ean>" + ean + "</ean><ean_fee>" + eanFee + "</ean_fee><unit_price>" + unitPrice + "</unit_price><unit_price_base>" + unitPriceBase + "</unit_price_base><unit_price_fee>" + unitPriceFee + "</unit_price_fee><qty>" + qty + "</qty><item_status>" + ELEBOX.itemStatus.RETURNED + "</item_status></detail_list></cart></order></elebox>";
        } else {
            var i = 0;
            var seq = i + 1;
            uilog('DBUG', "ELEBOX transaction id: " + this.trxId);
            param = "<elebox><order_count>" + seq + "</order_count><order><order_sequence>" + seq + "</order_sequence><order_id>" + orderId + "</order_id><trx_date>" + trxDate + "</trx_date><trx_time>" + trxTime + "</trx_time><rcpt_no>" + ELEBOX.trxId + "</rcpt_no><trx_type>" + type + "</trx_type><cart><count>" + seq + "</count><detail_list><sequence>" + seq + "</sequence><ean>" + ean + "</ean><ean_fee>" + eanFee + "</ean_fee><unit_price>" + unitPrice + "</unit_price><unit_price_base>" + unitPriceBase + "</unit_price_base><unit_price_fee>" + unitPriceFee + "</unit_price_fee><qty>" + qty + "</qty><item_status>" + ELEBOX.itemStatus.PAID + "</item_status></detail_list></cart></order></elebox>";
        }
    }
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(param, "text/xml");
    result = this.xmlParser(xmlDoc);
    return result;
};

/** Parse XML Resonse and converts it to JSON */
ELEBOX.parseResponse = function(response, asString = true) {
    if (!this.isJSON(response)) {
        if (!jQuery.isEmptyObject(response)) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(response, "text/xml");
            var json = this.xmlParser(xmlDoc);
            if (asString) {
                var parse = JSON.stringify(json);
                return parse;
            } else {
                return json;
            }
        }
    } else {
        return response;
    }
};

ELEBOX.isJSON = function(m) {

    if (typeof m == 'object') {
        try { m = JSON.stringify(m); } catch (err) { return false; }
    }

    if (typeof m == 'string') {
        try { m = JSON.parse(m); } catch (err) { return false; }
    }

    if (typeof m != 'object') { return false; }
    return true;

};

// Changes XML to JSON
ELEBOX.xmlParser = function xmlToJson(xml) {

    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.data;
            }
        }
    } else if (xml.nodeType == 3) { // text
        obj = xml.data;
    }

    // do children
    // If just one text node inside
    if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
        obj = xml.childNodes[0].data;
    } else if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof(obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof(obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
};


ELEBOX.processEleboxTransaction2 = function(saleTx, isReturTrx = false) {
    var reqType = ELEBOX.constants.SALES;
    if (isReturTrx) {
        reqType = ELEBOX.constants.RETURN;
    }
    saleTx.transactionId = (saleTx.transactionId) ? saleTx.transactionId : this.trxId;
    saleTx.storeCd = (saleTx.storeCd) ? saleTx.storeCd : this.storeCd;
    var requestData = this.generateEleboxRequestParam(saleTx, reqType);
    var requestResponse = this.createRequest(requestData, reqType);
    uilog('DBUG', "processEleboxTransaction2 : " + JSON.stringify(requestResponse));
    if (requestResponse.order.trx_info == "FAILED") {
        $("#elebox-status-dialog").data("eleboxInfo", requestResponse).dialog("open");
        displayEleboxStatus(requestResponse);
        CustomerPopupScreen.cus_showEleboxInfoStatus(requestResponse);
        CustomerPopupScreen.cus_showEleboxDialogStatus(requestResponse);
    } else {
        if (requestResponse.order.trx_status == ELEBOX.trxStatus.FULL_INFO) {
            if (isReturTrx) {
                var status = 'RETURN';
                saleTx.totalAmount = saleTx.totalAmount * -1;
                saleTx.totalAmountPaid = saleTx.totalAmountPaid * -1;
                saleTx.priceUnit = saleTx.priceUnit * -1;
                saleTx.priceSubtotal = saleTx.priceSubtotal * -1;
            } else {
                var status = 'SUCCESS';
            }
            saleTx.status = 'SUCCESS';

            var infoData = requestResponse.order.cart.detail_list.item_info;
            saleTx.info = infoData.replace(/-0-/gi, '\n');
            var admin_fee = "0";
            if (saleTx.unitFee == "0") {
                var string = saleTx.info;
                var admin_bank = string.split("\n").find(function(v) {
                    return v.indexOf("ADMIN BANK") > -1;
                });
                if (!admin_bank) {
                    admin_fee = saleTx.unitFee;
                } else {
                    admin_bank = admin_bank.split(":");
                    admin_fee = admin_bank[1];
                    admin_fee = admin_fee.replace(/[Rp]/gi, "");
                }
            } else {
                admin_fee = saleTx.unitFee;
            }
            if (isReturTrx) {
                admin_fee = admin_fee * -1;
            }
            console.log("Admin Fee : " + admin_fee);
            var replaceData = infoData.replace(/[']/g, '');
            var insDataCus = replaceData.split("-0-");
            saleTx.type = CONSTANTS.TX_TYPES.BILL_PAYMENT.name;
            saleTx.billPaymentItem = {
                transactionDate: saleTx.transactionDate,
                type: saleTx.shortDesc,
                transactionAgentId: ELEBOX.sessionId,
                customerId: saleTx.id,
                paymentPeriod: 0,
                netAmount: parseInt(saleTx.totalAmount) - parseInt(admin_fee),
                penaltyFee: 0,
                totalAmount: saleTx.totalAmount,
                adminFee: admin_fee,
                responseCode: "00",
                responseDescription: status,
                referenceCode: saleTx.orderId,
                additionalInfo: insDataCus[7] + insDataCus[8] + insDataCus[9] + insDataCus[10] + insDataCus[11] +
                    insDataCus[12] + insDataCus[13],
                customerName: insDataCus[14] + insDataCus[15] + insDataCus[16] + insDataCus[17] + insDataCus[18] +
                    insDataCus[19] + insDataCus[20],
                customerInfo: insDataCus[0] + insDataCus[1] + insDataCus[2] + insDataCus[3] + insDataCus[4] +
                    insDataCus[5] + insDataCus[6],
                deadlineTime: insDataCus[21] + insDataCus[22] + insDataCus[23] + insDataCus[24] + insDataCus[25] +
                    insDataCus[26] + insDataCus[27],
                itemType: insDataCus[28] + insDataCus[29] + insDataCus[30] + insDataCus[31],
                policyNumber: "",
                status: "SUCCESS",

            }
            console.log("cek disini");
            console.log(saleTx.billPaymentItem.customerInfo);

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
                    if (isReturTrx) {
                        saleTx.type = CONSTANTS.TX_TYPES.RETURN.name;
                    } else {
                        saleTx.type = CONSTANTS.TX_TYPES.ELEBOX.name;
                    }
                    renderScreenReceiptSummary();
                    renderCustomerFeedbackDialog();
                    DrawerModule.validateTxnToOpenDrawer();
                    renderOrderSummaryDialog();
                    saleTx.status = "SUCCESS";
                    var detailsToPrint = {
                        summary: setReceiptSummary(saleTx),
                        footerSummary: setReceiptFooterSummary(saleTx),
                        footer: setReceiptFooter(saleTx),
                        mktInfo: setReceiptMarketingPromoInfo(saleTx),
                        balloonGame: setReceiptBalloonGame(saleTx),
                        freeParking: setReceiptFreeParking(saleTx),
                        isInstallmentTransaction: isInstallmentTransaction,
                        couponData: (saleTx.type != 'RETURN') ? {} : setCouponSummary(saleTx)
                    };

                    if (!isHcEnabled) {
                        uilog('DBUG', "processEleboxTransaction2 detailsToPrint: " + detailsToPrint);
                        printReceipt(detailsToPrint);
                    } else {
                        Hypercash.printer.printTransactionWithHeaderAndBody(detailsToPrint);
                    }
                }
            }, function(error) {
                uilog('DBUG', 'FAIL: ' + error);
            });
        } else {
            saleTx.returnTrx = isReturTrx;
            $("#eleboxAcknow-dialog").data("eleboxInfo", requestResponse).dialog("open");
        }
    }
};
ELEBOX.getItemInfoList = function(eleboxInfo) {
        var itemInfoElebox = [];

        if (eleboxInfo) {
            var eleboxInfoList = "";
            if ($("#eleboxFailed-dialog").dialog("isOpen")) {
                eleboxInfoList = $("#eleboxFailed-dialog").data("eleboxInfo");
            } else {
                eleboxInfoList = $("#eleboxInfo-dialog").data("eleboxInfo");
            }
            var data = "";
            if (typeof eleboxInfoList == 'undefined') {
                data = eleboxInfo;
                uilog('DBUG', "Elebox Info Data if : " + JSON.stringify(data));
            } else {
                data = {
                    elebox: eleboxInfoList
                }
                uilog('DBUG', "Elebox Info Data else : " + JSON.stringify(data));
            }
            uilog("DBUG", "getItemInfoList data: " + JSON.stringify(data));
            uilog("DBUG", "getItemInfoList eleboxInfo: " + JSON.stringify(eleboxInfo));
            var unitPrice = data.elebox.order.cart.detail_list.unit_price;
            var productName = data.elebox.order.cart.detail_list.product_name;
            var unitPriceTotal = data.elebox.order.cart.detail_list.unit_price_total;
            if ($("#eleboxFailed-dialog").dialog("isOpen")) {
                var desc = data.elebox.order.cart.detail_list.item_info;
                var id = data.elebox.order.cart.detail_list.customer_id;
                if (jQuery.isEmptyObject(desc)) {
                    var replaceData = "Transaksi Sukses";
                    saleTx.info = replaceData;
                    var insDataCus = replaceData;
                } else {
                    var replaceData = desc.replace(/-0-/gi, '\n');
                    saleTx.info = desc.replace(/-0-/gi, '\n');
                    var replace = replaceData.replace(/[']/g, '');
                    var insDataCus = replace.split("-0-");
                }
            } else {
                var desc = data.elebox.order.cart.detail_list.customer.customer_data;
                var id = data.elebox.order.cart.detail_list.customer.customer_id;
                if (jQuery.isEmptyObject(desc)) {
                    var replaceData = "Transaksi Sukses";
                    saleTx.info = replaceData;
                    var insDataCus = replaceData;
                } else {
                    var replaceData = desc.replace(/-0-/gi, '\n');
                    saleTx.info = desc.replace(/-0-/gi, '\n');
                    var replace = replaceData.replace(/[']/g, '');
                    var insDataCus = replace.split("-0-");
                }
            }
            var orderId = data.elebox.order.order_id;
            var trxDate = data.elebox.order.trx_date;
            var trxTime = data.elebox.order.trx_time;
            var trxType = data.elebox.order.trx_type;
            var ean = data.elebox.order.cart.detail_list.ean;
            var eanFee = data.elebox.order.cart.detail_list.ean_fee;
            var unitPriceBase = data.elebox.order.cart.detail_list.unit_price_base;
            var unitFee = data.elebox.order.cart.detail_list.unit_price_fee;
            var qty = data.elebox.order.cart.detail_list.qty;
            var itemStatus = data.elebox.order.cart.detail_list.item_status;
            var store = null;
            var posSession = {
                posSessionId: ELEBOX.sessionId,
                userId: ELEBOX.userId,
            }
            var eleboxInfo = {
                transactionDate: trxDate,
                trxTime: trxTime,
                trxType: trxType,
            }
            var itemInfo = {
                transactionId: saleTx.transactionId,
                type: "ELEBOX",
                posTerminalId: ELEBOX.posTerminal,
                storeCd: saleTx.storeCd,
                store: store,
                posSession: {
                    posSessionId: ELEBOX.sessionId,
                    userId: ELEBOX.userId,
                },
                userId: ELEBOX.userId,
                userName: ELEBOX.userName,
                totalQuantity: qty,
                priceUnit: unitPrice,
                quantity: 1,
                priceSubtotal: unitPrice,
                orderItems: productName,
                orderId: orderId,
                qty: qty,
                itemStatus: itemStatus,
                info: replaceData,
                shortDesc: productName,
                id: id,
                unitFee: unitFee,
                trialMode: false,
                memberDiscReversal: 0,
                supervisorInterventions: [],
                baseTransactionId: "",
                promotionItems: [],
                customerSatisfaction: 0,
                coBrandNumber: "",
                returnNoteNo: "",
                totalMdrSurcharge: 0,
                mlcSeq: 0,
                mlcReffNo: "",
                mlcQRCode: "",
                billPaymentItem: {
                    transactionDate: saleTx.transactionDate,
                    type: productName,
                    transactionAgentId: ELEBOX.sessionId,
                    customerId: saleTx.id,
                    paymentPeriod: 0,
                    netAmount: unitPrice,
                    penaltyFee: 0,
                    totalAmount: unitPrice,
                    adminFee: 0,
                    responseCode: "00",
                    responseDescription: status,
                    referenceCode: saleTx.orderId,
                    additionalInfo: insDataCus[7] + insDataCus[8] + insDataCus[9] + insDataCus[10] + insDataCus[11] +
                        insDataCus[12] + insDataCus[13],
                    customerName: insDataCus[14] + insDataCus[15] + insDataCus[16] + insDataCus[17] + insDataCus[18] +
                        insDataCus[19] + insDataCus[20],
                    customerInfo: insDataCus[0] + insDataCus[1] + insDataCus[2] + insDataCus[3] + insDataCus[4] +
                        insDataCus[5] + insDataCus[6],
                    deadlineTime: insDataCus[21] + insDataCus[22] + insDataCus[23] + insDataCus[24] + insDataCus[25] +
                        insDataCus[26] + insDataCus[27],
                    itemType: insDataCus[28] + insDataCus[29] + insDataCus[30] + insDataCus[31],
                    policyNumber: "",
                    status: "SUCCESS",

                }
            }

            if (typeof data.elebox != 'undefined') {
                itemInfo.elebox = data.elebox;
                itemInfo.elebox.customerId = id
            }
            console.log(itemInfo);
        }

        itemInfoElebox.push(itemInfo);
        return itemInfoElebox;
    }
    /*
    ELEBOX.saveOrder = function(eleboxOrder){
    	eleboxSaveOrder = [];
    	
    	if(eleboxOrder){
    		var itemInfo = {
    			transactionId : saleTx.transactionId,
    			type : saleTx.type,
    			posTerminalId : saleTx.posTerminalId,
    			storeCd : saleTx.storeCd,
    			store : saleTx.store,
    			posSession : saleTx.posSession,
    			userId : saleTx.userId,
    			userName : saleTx.userName,
    			transactionDate : saleTx.transactionDate,
    			status : saleTx.status,
    			totalQuantity : saleTx.totalQuantity,
    			totalAmount : saleTx.totalAmount,
    			totalDiscount : 0,
    			voidedDiscount : 0,
    			customerId : null,
    			cpnIntAmount : 0,
    			roundingAmount : 0,
    			totalAmountPaid : saleTx.totalAmountPaid,
    			totalChange : saleTx.totalChange,
    			totalTaxableAmount : 0,
    			vat : 0,
    			tariff : 0,
    			trialMode : saleTx.trialMode,
    			memberDiscReversal : 0,
    			donationAmount : saleTx.donationAmount,
    			orderItems : [],
    			supervisorInterventions : [],
    			payments : saleTx.payments,
    			baseTransactionId : "",
    			promotionItems : [],
    			customerSatisfaction : 0,
    			freeParkingGiven : 0,
    			startDate : saleTx.startDate,
    			coBrandNumber : "",
    			returnNoteNo : "",
    			totalMdrSurcharge : 0,
    			endDate : saleTx.endDate,
    			totalAdditionalDiscount : 0,
    			mlcSeq : 0,
    			mlcReffNo : "",
    			mlcQRCode : "",
    			billPaymentItem : {
    				transactionDate : saleTx.transactionDate,
    				type : saleTx.shortDesc,
    				transactionAgentId : saleTx.transactionId,
    				customerId : saleTx.id,
    				paymentPeriod : null,
    				netAmount : saleTx.totalAmount,
    				penaltyFee : null,
    				totalAmount : saleTx.totalAmount,
    				adminFee : null,
    				responseCode : 0,
    				responseDescription : "",
    				referenceCode : saleTx.orderId,
    				additionalInfo : "",
    				customerName : "",
    				customerInfo : saleTx.info,
    				deadlineTime : null,
    				itemType : "",
    				policyNumber : saleTx.id,
    				status : "SUCCESS",
    			},
    			scannedItemOrder : saleTx.scannedItemOrder,
    			promotionsMap : {},
    			promoDiscount : 0
    		}
    	}
    	
    	eleboxSaveOrder.push(itemInfo);
    	return eleboxSaveOrder;
    }*/