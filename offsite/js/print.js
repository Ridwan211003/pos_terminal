/***********************************
 * Exist Global Inc.
 * http://www.exist.com
 * Receipt Functions
 * Receipt is divided into 4 main parts;
 *  - header; footer
 *  - body; summary
 * Can add other objects if needed.
 *
 * Sets Receipt Format
 **********************************/

//Global variables for receipt
var RECEIPT_SPACE = getMsgValue('pos_receipt_space');
var RECEIPT_DBL_SPACE = getMsgValue('pos_receipt_dbl_space');
var RECEIPT_TAB_SPACE = getMsgValue('pos_receipt_tab_space');
var RECEIPT_DBL_DOT = getMsgValue('pos_receipt_dbl_dot');
var RECEIPT_CENTER_ALIGN = getMsgValue('pos_receipt_center_align');
var RECEIPT_POS_CENTERED = 'centered';
var RECEIPT_POS_JUSTIFIED = 'left';
var RECEIPT_POS_RIGHT = 'right';
var RECEIPT_BANNER_DIVIDER = '******************************************';
var RECEIPT_RETURN_BANNER = '****************RETURN***************';
var RECEIPT_RETURN_ELEBOX = 'RETURN';

//printing
var suppressPrinting = false;
var isPrinting = false;
var printingStatusInterval = null;

var RECEIPT_FONT_DOUBLE_WIDTH = '\x1b\x21\x20';
var RECEIPT_FONT_DOUBLE_HEIGHT = '\x1b\x21\x10';
var RECEIPT_FONT_DEFAULT = 'defaultFont';
var RECEIPT_FONT_BOLD = '\x1b\x21\x08';
var RECEIPT_POS_COMMAND = 'command';
var RECEIPT_BILL_PAYMENT_DIVIDER = '----------------------------------------';
var RECEIPT_ELEBOX_DIVIDER = '----------------------------------------';

/**
 * Receipt header. This includes store details like number etc.
 *
 * @returns {Array}
 */
function setReceiptHeader(tx) {
    var header = new Array();
    try {
        header.push(new PrintBlock(RECEIPT_POS_CENTERED, store.name));
        if (store.hotline) {
            header.push(new PrintBlock(RECEIPT_POS_CENTERED,
                getMsgValue('pos_receipt_hotline_label') + RECEIPT_SPACE + store.hotline));
        }
        header.push(new PrintBlock(RECEIPT_POS_CENTERED,
            getConfigValue('RECEIPT_CARREFOUR_NAME')));
        if (getConfigValue('TAX_ID_NUMBER') != "") {
            header.push(new PrintBlock(RECEIPT_POS_CENTERED,
                getMsgValue('pos_receipt_tax_id_number_label') + RECEIPT_SPACE + getConfigValue('TAX_ID_NUMBER')));
        }
        header.push(new PrintBlock(RECEIPT_POS_CENTERED, store.address));

        if (printTo == "E") {
            header.push(newLine());
            header.push(new PrintBlock(RECEIPT_POS_CENTERED, "DIGITAL RECEIPT (COPY)"));
            header.push(newLine());
        } else if (printTo == "N") {
            header.push(newLine());
            header.push(new PrintBlock(RECEIPT_POS_CENTERED, "NOT PRINTED"));
            header.push(newLine());
        }

        if (tx != null) {

            //for HC return
            if (tx.type == CONSTANTS.TX_TYPES.RETURN.name && tx.returnNote) {
                header.push(newLine());
                header.push(new PrintBlock(RECEIPT_POS_CENTERED, RECEIPT_RETURN_BANNER));
            }
            if (tx.type == CONSTANTS.TX_TYPES.RETURN.name && tx.elebox) {
                header.push(new PrintBlock(RECEIPT_POS_CENTERED, RECEIPT_BANNER_DIVIDER));
                header.push(new PrintBlock(RECEIPT_POS_CENTERED, RECEIPT_RETURN_ELEBOX));
                header.push(new PrintBlock(RECEIPT_POS_CENTERED, RECEIPT_BANNER_DIVIDER));
            }
        }
    } catch (err) {
        uilog("DBUG", "Error on receipt header caused by:" + err.message);
    }
    return header;
}

/**
 * Prints the cashier name
 * @returns {Array}
 */
function setReceiptCashierInfo(tx) {
    var infos = new Array();
    try {
        infos.push(new PrintBlock(RECEIPT_CENTER_ALIGN, "\n"));
        infos.push(new PrintBlock(RECEIPT_CENTER_ALIGN, getMsgValue('pos_receipt_cashier_name') + RECEIPT_SPACE + loggedInUsername));
        infos.push(new PrintBlock(RECEIPT_CENTER_ALIGN, "\n"));
    } catch (err) {
        uilog("DBUG", "Error getting the cashier's information caused by: " + err.message);
    }

    return infos;
}

/**
 * Contains the following which shouldn't be
 * MIDDLE aligned(as opposed to 'footer' section):
 * ..etcetera
 * QUANTITY PURCHASED
 *          VOIDED
 *          CANCELLED
 *          RETURNED
 *          REFUNDED
 * EMPLOYEE {0}% DISC
 * TOTAL DIRECT DISC
 */

// 05092022
function setReceiptFooterSummary(tx, additionalPrintedReceipts, trxId) {
    var footerSummary = [];
    var totalDiscount = 0;
    var isDoubleHeight = false;

    profCust = tx.profCust;

    try {
        if (tx) {
            totalDiscount = Math.abs(getTotalDiscount(tx)) + saleTx.roundingAmount;
            var isSaleCancelled = (tx.status == CONSTANTS.STATUS.CANCELLED);

            // START: Total Quantity Block
            /*
             * Gets the appropriate label for the current transaction type.
             *
             * pos_receipt_qty_sale_label       =QUANTITY PURCHASED:
             * pos_receipt_qty_sale_voided_label=QUANTITY VOIDED:
             * pos_receipt_qty_cancel_sale_label=QUANTITY CANCELLED:
             * pos_receipt_qty_return_label     =QUANTITY RETURNED:
             * pos_receipt_qty_refund_label     =QUANTITY REFUNDED:
             */
            var totalQtyPrintBlk = null;
            if (tx.totalQuantity) {
                totalQtyPrintBlk = new PrintBlock(RECEIPT_POS_JUSTIFIED,
                    setLineSummaryItem(
                        COMMON_DISPLAY.getTxTypesMsgPropValue(
                            (isSaleCancelled) ? CONSTANTS.TX_TYPES.CANCEL_SALE.name : tx.type,
                            CONSTANTS.TX_TYPES.KEY_MESSAGES_PROP_QTY_FORMAT
                        ),
                        numberWithCommas(tx.totalQuantity)
                    ));
            }
            // END  : Total Quantity Block

            var totalCmcDisc = calculateTotalMemberDiscount();
            var cmcPayment = tx.memberDiscReversal == 0 && totalCmcDisc > 0;
            var cmcPaymentCoupon = SALE_RETURN_COUPON.isCmcPayment() && SALE_RETURN_COUPON.isUseCouponReturn();
            var isCmcCoupon = tx.payments.some(function(p) {
                console.log(p);
                return p.paymentMediaType == 'COUPON_RETURN' & tx.isCardCoBrand;
            });
            if (isSaleCancelled) {
                var txType = tx.type;

                if (totalQtyPrintBlk) {
                    footerSummary.push(totalQtyPrintBlk);
                }

                var totalCmcDisc = calculateTotalMemberDiscount();

                if (tx.memberDiscReversal == 0 && totalCmcDisc > 0) {
                    isDoubleHeight = true;
                    var val = {};
                    val.thermal = setLineSummaryItem(getConfigValue('RECEIPT_CMC_TOTAL_DISCOUNT'), numberWithCommas(totalCmcDisc), CONSTANTS.TX_TYPES.CANCEL_SALE.name);
                    val.nonThermal = setLineSummaryItem(
                        getConfigValue('RECEIPT_CMC_TOTAL_DISCOUNT'),
                        numberWithCommas(totalCmcDisc),
                        CONSTANTS.TX_TYPES.CANCEL_SALE.name,
                        isDoubleHeight);

                    footerSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DOUBLE_HEIGHT));
                    footerSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, val));
                    footerSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DEFAULT));
                }
                //Bug #94937
                if (totalDiscount && totalDiscount > 0) {
                    isDoubleHeight = true;
                    var val = {};
                    val.thermal = setLineSummaryItem(getConfigValue('RECEIPT_TOTAL_DIRECT_DISCOUNT'), numberWithCommas(totalDiscount), CONSTANTS.TX_TYPES.CANCEL_SALE.name);
                    val.nonThermal = setLineSummaryItem(
                        getConfigValue('RECEIPT_TOTAL_DIRECT_DISCOUNT'),
                        numberWithCommas(totalDiscount),
                        CONSTANTS.TX_TYPES.CANCEL_SALE.name,
                        isDoubleHeight);

                    footerSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DOUBLE_HEIGHT));
                    footerSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, val));
                    footerSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DEFAULT));
                }

                if (tx.type == CONSTANTS.TX_TYPES.BILL_PAYMENT.name) {
                    setReceiptBillPayment(tx, footerSummary);
                    txType = CONSTANTS.TX_TYPES.BILL_PAYMENT.typeLabel;
                }

                if (tx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name) {
                    setReceiptSimpatindo(tx, footerSummary);
                    txType = CONSTANTS.TX_TYPES.SIMPATINDO.typeLabel;
                }

                footerSummary.push(new PrintBlock(
                    RECEIPT_POS_JUSTIFIED,
                    getMsgValue('pos_tx_cancel_msg').format(txType)));

            } else if (tx.type == CONSTANTS.TX_TYPES.SALE.name || tx.type == CONSTANTS.TX_TYPES.BILL_PAYMENT.name || tx.type == CONSTANTS.TX_TYPES.ELEBOX.name || tx.type == CONSTANTS.TX_TYPES.BPJS.name || tx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name) {
                //				if (tx.payments[0] &&
                //						(tx.payments[0].paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.CMC_EFT_OFFLINE.name ||
                //								tx.payments[0].paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EDC_BCA.name ||
                //								tx.payments[0].paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.CMC_EFT_OFFLINE.name)) {
                //					var totalMemberDisc = 0;
                //					var promotionItems = tx.promotionItems;
                //					for ( var i in promotionItems) {
                //						if (promotionItems[i].type == CONSTANTS.PROMOTION_TYPES.MEMBER_PROMOTION) {
                //							totalMemberDisc += promotionItems[i].totalDiscount;
                //						}
                //					}
                //					footerSummary.push(setLineSummaryItem(
                //							getMsgValue('pos_receipt_carrefour_mega_card')
                //									+ " " + tx.coBrandNumber, ""));
                //					footerSummary
                //							.push(setLineSummaryItem(
                //									getMsgValue('pos_receipt_carrefour_mega_total_disc'),
                //									numberWithCommas(totalMemberDisc)));
                //				}

                if (totalQtyPrintBlk) {
                    footerSummary.push(totalQtyPrintBlk);
                }

                // TO REPRINT MEMBER ID IF ANY
                if (tx.reprint && tx.customerId) {
                    console.log("print cust id");
                    footerSummary.push(new PrintBlock(
                        RECEIPT_POS_JUSTIFIED,
                        setLineSummaryItem(
                            getMsgValue('pos_receipt_employee_no_label'),
                            tx.customerId.toString().slice(0, -4) + "XXXX")));
                }

                /*if(){
                	setNotEarnPointLoyalty
                }*/
                console.log("2cek kondisi InfoloyaltyProgram : " + InfoloyaltyProgram);
                if ((pointReward && pointReward.type == "SUCCESS") && !isStoreSaleTransaction) {
                    footerSummary.push(new PrintBlock(
                        RECEIPT_POS_JUSTIFIED,
                        setLineSummaryItem(
                            getMsgValue('pos_receipt_employee_no_label'),
                            pointReward.accountNumber.toString().slice(0, -4) + "XXXX")));

                    if (pointReward.callingAction == "EARN" || pointReward.callingAction == "PURCHASE") {
                        footerSummary.push(new PrintBlock(
                            RECEIPT_POS_JUSTIFIED,
                            setLineSummaryItem(
                                getMsgValue('pos_receipt_earned_pts_label'),
                                numberWithCommas(pointReward.earnedPoints))));
                    }

                    var balPoint = pointReward.totalPoints;
                    if (parseFloat(tx.pppTotalPoint) > 0 && tx.pppTotalPoint !== null && tx.pppTotalPoint !== undefined) {
                        footerSummary.push(new PrintBlock(
                            RECEIPT_POS_JUSTIFIED,
                            setLineSummaryItem(
                                getMsgValue('pos_receipt_ppp_used_points_label'),
                                tx.pppTotalPoint.toString())));
                        balPoint -= parseFloat(tx.pppTotalPoint);
                    }

                    if (pointReward.wsAddress != null) {
                        if (pointReward.wsAddress != "CRM-PROXY") {
                            footerSummary.push(new PrintBlock(
                                RECEIPT_POS_JUSTIFIED,
                                setLineSummaryItem(
                                    getMsgValue('pos_receipt_total_pts_label'),
                                    balPoint.toString())));
                        }
                    } else {
                        footerSummary.push(new PrintBlock(
                            RECEIPT_POS_JUSTIFIED,
                            setLineSummaryItem(
                                getMsgValue('pos_receipt_total_pts_label'),
                                balPoint.toString())));
                    }

                } else if (typeof InfoloyaltyProgram.memberName !== 'undefined') {
                    console.log("2masuk ke kondisi InfoLoyaltyProgram : " + InfoloyaltyProgram.earnedPoint);
                    footerSummary.push(new PrintBlock(
                        RECEIPT_POS_JUSTIFIED,
                        setLineSummaryItem(
                            getMsgValue('pos_receipt_employee_no_label'), InfoloyaltyProgram.hpNumber.toString().slice(0, -4) + "XXXX")));
                    footerSummary.push(new PrintBlock(
                        RECEIPT_POS_JUSTIFIED,
                        setLineSummaryItem(
                            getMsgValue('member_name_loyalty') + ":", InfoloyaltyProgram.memberName)));

                    if (typeof InfoloyaltyProgram.earnedPoint !== 'undefined') {
                        footerSummary.push(new PrintBlock(
                            RECEIPT_POS_JUSTIFIED,
                            setLineSummaryItem(
                                getMsgValue('pos_receipt_prev_pts_label'), InfoloyaltyProgram.beginningPoints)));
                        footerSummary.push(new PrintBlock(
                            RECEIPT_POS_JUSTIFIED,
                            setLineSummaryItem(
                                getMsgValue('pos_receipt_earned_pts_label'), InfoloyaltyProgram.earnedPoint + "")));
                    }
                    var balPoint = InfoloyaltyProgram.balancePoint;
                    if (parseFloat(tx.pppTotalPoint) > 0 && tx.pppTotalPoint !== null && tx.pppTotalPoint !== undefined) {
                        footerSummary.push(new PrintBlock(
                            RECEIPT_POS_JUSTIFIED,
                            setLineSummaryItem(
                                getMsgValue('pos_receipt_ppp_used_points_label'),
                                tx.pppTotalPoint.toString())));
                        // balPoint -= parseFloat(tx.pppTotalPoint);
                    }

                    footerSummary.push(new PrintBlock(
                        RECEIPT_POS_JUSTIFIED,
                        setLineSummaryItem(
                            getMsgValue('pos_receipt_total_pts_label'), balPoint.toString())));
                    if (printTo == "E") {
                        footerSummary.push(new PrintBlock(
                            RECEIPT_POS_JUSTIFIED,
                            setLineSummaryItem(
                                getMsgValue('email_loyalty') + ":", InfoloyaltyProgram.email)));
                    }
                } else if (isHcEnabled && profCust && profCust.customerNumber && profCust.memberType != "NONMEMBER") {
                    footerSummary.push(new PrintBlock(
                        RECEIPT_POS_JUSTIFIED,
                        setLineSummaryItem(
                            getMsgValue('pos_receipt_membership_id_label'),
                            profCust.customerNumber)));

                } if(barangSubsidi){
                    var type = "status";
                    var txId = saleTx.transactionId;
                    var salesNoOrder = SalesOrderEbike;
                    InfoUpdStatus = {
                        NoSalesOrder: salesNoOrder,
                        transactionId: txId
                    }
                    changeStatus(InfoUpdStatus, type);
                    barangSubsidi = false;
                    showPrintingMessage();
                }

                if (HOTSPICE_MODULE.variables.tableNumber) {
                    footerSummary.push(HOTSPICE_MODULE.print.printTableNumberInReceipt(HOTSPICE_MODULE.variables.tableNumber));
                }

                var totalCmcDisc = calculateTotalMemberDiscount();

                uilog("DBUG", "***** CHECK CMC COUPON NON COBRAND *****");
                uilog("DBUG", "is card cobrand : " + saleTx.isCardCoBrand);
                uilog("DBUG", "is cmc coupon : " + isCmcCoupon);
                uilog("DBUG", "payments : " + JSON.stringify(saleTx.payments));

                if (cmcPayment || cmcPaymentCoupon) {
                    isDoubleHeight = true;
                    var val = {};

                    val.thermal = setLineSummaryItem(getConfigValue('RECEIPT_CMC_TOTAL_DISCOUNT'), numberWithCommas(totalCmcDisc), tx.type);
                    val.nonThermal = setLineSummaryItem(
                        getConfigValue('RECEIPT_CMC_TOTAL_DISCOUNT'),
                        numberWithCommas(totalCmcDisc),
                        tx.type,
                        isDoubleHeight);

                    footerSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DOUBLE_HEIGHT));
                    footerSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, val));
                    footerSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DEFAULT));
                }

                // if(cmcPayment || cmcPaymentCoupon){
                // 	isDoubleHeight = true;
                // 	var val = {};

                // 	if(cmcPaymentCoupon){
                // 		val.thermal = setLineSummaryItem(getConfigValue('RECEIPT_CMC_TOTAL_DISCOUNT'), numberWithCommas(tx.megaDiscPayment), tx.type);
                // 		val.nonThermal = setLineSummaryItem(
                // 								getConfigValue('RECEIPT_CMC_TOTAL_DISCOUNT'),
                // 								numberWithCommas(tx.megaDiscPayment),
                // 								tx.type,
                // 								isDoubleHeight);
                // 	}else{
                // 		val.thermal = setLineSummaryItem(getConfigValue('RECEIPT_CMC_TOTAL_DISCOUNT'), numberWithCommas(totalCmcDisc), tx.type);
                // 		val.nonThermal = setLineSummaryItem(
                // 								getConfigValue('RECEIPT_CMC_TOTAL_DISCOUNT'),
                // 								numberWithCommas(totalCmcDisc),
                // 								tx.type,
                // 								isDoubleHeight);
                // 	}

                // 	footerSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DOUBLE_HEIGHT));
                // 	footerSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, val));
                // 	footerSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DEFAULT));
                // }

                uilog("DBUG", "total discount : " + totalDiscount);

                uilog("DBUG", "total coupon amount : " + SALE_RETURN_COUPON.calculateCouponReturn());

                if (totalDiscount && totalDiscount > 0) {
                    isDoubleHeight = true;
                    var val = {};

                    val.thermal = setLineSummaryItem(getConfigValue('RECEIPT_TOTAL_DIRECT_DISCOUNT'), numberWithCommas(totalDiscount), tx.type);
                    val.nonThermal = setLineSummaryItem(
                        getConfigValue('RECEIPT_TOTAL_DIRECT_DISCOUNT'),
                        numberWithCommas(totalDiscount),
                        tx.type,
                        isDoubleHeight);

                    footerSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DOUBLE_HEIGHT));
                    footerSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, val));
                    footerSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DEFAULT));
                }

                // if ((totalDiscount && totalDiscount > 0) || (cmcPayment || cmcPaymentCoupon)) {
                // 	isDoubleHeight = true;
                // 	var val = {};
                // 	if(cmcPaymentCoupon){
                // 		console.log("Total discount hemat : ");
                // 		console.log("Total discount : " + totalDiscount);

                // 		val.thermal = setLineSummaryItem(getConfigValue('RECEIPT_TOTAL_DIRECT_DISCOUNT'), numberWithCommas(totalDiscount+tx.megaDiscPayment), tx.type);
                // 		val.nonThermal = setLineSummaryItem(
                // 								getConfigValue('RECEIPT_TOTAL_DIRECT_DISCOUNT'),
                // 								numberWithCommas(totalDiscount+tx.megaDiscPayment),
                // 								tx.type,
                // 								isDoubleHeight);
                // 	}
                // 	else{
                // 		if(SALE_RETURN_COUPON.isCouponReturnNotCmc() && saleTx.coBrandNumber){
                // 			val.thermal = setLineSummaryItem(getConfigValue('RECEIPT_TOTAL_DIRECT_DISCOUNT'), numberWithCommas(totalDiscount-SALE_RETURN_COUPON.calculateCouponReturn()), tx.type);
                // 			val.nonThermal = setLineSummaryItem(
                // 									getConfigValue('RECEIPT_TOTAL_DIRECT_DISCOUNT'),
                // 									numberWithCommas(totalDiscount-SALE_RETURN_COUPON.calculateCouponReturn()),
                // 									tx.type,
                // 									isDoubleHeight);
                // 		}else{
                // 			val.thermal = setLineSummaryItem(getConfigValue('RECEIPT_TOTAL_DIRECT_DISCOUNT'), numberWithCommas(totalDiscount), tx.type);
                // 			val.nonThermal = setLineSummaryItem(
                // 									getConfigValue('RECEIPT_TOTAL_DIRECT_DISCOUNT'),
                // 									numberWithCommas(totalDiscount),
                // 									tx.type,
                // 									isDoubleHeight);
                // 		}
                // 	}

                // 	footerSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DOUBLE_HEIGHT));
                // 	footerSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, val));
                // 	footerSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DEFAULT));
                // }

                uilog("DBUG", "***** Printing GC Receipt");
                //GiftCard
                printReceiptGiftCardItems(footerSummary);

                if (tx.type == CONSTANTS.TX_TYPES.BILL_PAYMENT.name) {
                    setReceiptBillPayment(tx, footerSummary);
                }

                if (tx.type == CONSTANTS.TX_TYPES.BPJS.name) {
                    uilog('DBUG', "tx type BPJS");
                    setReceiptBPJS(tx, footerSummary);
                }

                if (tx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name) {
                    setReceiptSimpatindo(tx, footerSummary);
                }

                if (tx.type == CONSTANTS.TX_TYPES.ELEBOX.name && tx.status == "SUCCESS") {
                    setReceiptElebox(tx, footerSummary);
                }

                if (tx.type == CONSTANTS.TX_TYPES.ELEBOX.name && tx.status == "Acknowledge") {
                    setReceiptEleboxAck(tx, footerSummary);
                }


            } else if (tx.type == CONSTANTS.TX_TYPES.RETURN.name) {
                if (totalQtyPrintBlk) {
                    footerSummary.push(totalQtyPrintBlk);
                }
            } else if (tx.type == CONSTANTS.TX_TYPES.REFUND.name) {
                if (totalQtyPrintBlk) {
                    footerSummary.push(totalQtyPrintBlk);
                }
            } else if (tx.type == CONSTANTS.TX_TYPES.SALE_VOID.name) {
                if (totalQtyPrintBlk) {
                    footerSummary.push(totalQtyPrintBlk);
                }

                if (HOTSPICE_MODULE.variables.tableNumber) {
                    footerSummary.push(HOTSPICE_MODULE.print.printTableNumberInReceipt(HOTSPICE_MODULE.variables.tableNumber));
                }

                var totalCmcDisc = calculateTotalMemberDiscount();

                if (tx.memberDiscReversal == 0 && totalCmcDisc > 0) {
                    isDoubleHeight = true;
                    var val = {};
                    val.thermal = setLineSummaryItem(getConfigValue('RECEIPT_CMC_TOTAL_DISCOUNT'), numberWithCommas(totalCmcDisc), tx.type);
                    val.nonThermal = setLineSummaryItem(
                        getConfigValue('RECEIPT_CMC_TOTAL_DISCOUNT'),
                        numberWithCommas(totalCmcDisc),
                        tx.type,
                        isDoubleHeight);

                    footerSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DOUBLE_HEIGHT));
                    footerSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, val));
                    footerSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DEFAULT));
                }

                if (totalDiscount && totalDiscount != 0) {
                    isDoubleHeight = true;
                    var val = {};
                    isDoubleHeight = true;
                    val.thermal = setLineSummaryItem(getConfigValue('RECEIPT_TOTAL_DIRECT_DISCOUNT'), numberWithCommas(totalDiscount), tx.type);
                    val.nonThermal = setLineSummaryItem(
                        getConfigValue('RECEIPT_TOTAL_DIRECT_DISCOUNT'),
                        numberWithCommas(totalDiscount),
                        tx.type,
                        isDoubleHeight);

                    footerSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DOUBLE_HEIGHT));
                    footerSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, val));
                    footerSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DEFAULT));
                }
            }

            // INDENT 2017-05-18
            if (typeof tx.indentSlip !== 'undefined') {
                printIndentSales(tx, footerSummary);
            }

            //tax computation
            printReceiptTaxComputation(tx, footerSummary);
            //print eft online receipt
            if (additionalPrintedReceipts && additionalPrintedReceipts.eftOnline) {
                $.each(additionalPrintedReceipts.eftOnline, function(index, eftItem) {
                    footerSummary.push(eftItem);
                });
            }
        }
    } catch (err) {
        uilog("DBUG", "Problem with receipt footer summary caused by:" + err.message);
    }

    // 05092022
    if (localStorage.getItem("trx_insurance_id") != null) {
        footerSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, "\n" + "TR: " + localStorage.getItem("trx_insurance_id")));
    }
    localStorage.removeItem("trx_insurance_id");
    return footerSummary;
}

/**
	LOYALTY PRINT
 */
function setInfoInquiryLoyalty(InfoloyaltyProgram) {

    console.log(InfoloyaltyProgram);
    console.log("=====================");

    var receiptLoyalty = new Array();
    try {
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('member_name_loyalty') + "      : " + InfoloyaltyProgram.memberName));
        if (InfoloyaltyProgram.gender == "F") {
            receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('member_gender_loyalty') + "           : " + "Female"));
        } else {
            receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('member_gender_loyalty') + "           : " + "Male"));
        }
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('member_tgl_lahir') + "    : " + InfoloyaltyProgram.tglLahir));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('ktp_number_loyalty') + "       : " + InfoloyaltyProgram.ktpNumber));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('handphone_number_loyalty') + " : " + InfoloyaltyProgram.hpNumber));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('email_loyalty') + "            : " + InfoloyaltyProgram.email));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));

        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('balance_points_loyalty') + "   : " + InfoloyaltyProgram.balancePoint));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));

    } catch (err) {
        uilog("DBUG", "Problem with receipt footer summary caused by:" + err.message);
    }

    return receiptLoyalty;
}

function setNotEarnPointLoyalty(earnLoyaltyProgram) {

    console.log("earnLoyaltyProgram=====================");
    console.log(earnLoyaltyProgram);

    var receiptLoyalty = new Array();
    try {

        // txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, earnLoyaltyProgram.memberName));
        // txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, earnLoyaltyProgram.hpNumber));
        // txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, earnLoyaltyProgram.beginningPoints));
        // txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, earnLoyaltyProgram.earnedPoint));
        // txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, earnLoyaltyProgram.balancePoint));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('member_name_loyalty') + "      : " + earnLoyaltyProgram.memberName));

        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('handphone_number_loyalty') + " : " + earnLoyaltyProgram.hpNumber));

        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));

        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, "Balanced Point   : " + earnLoyaltyProgram.balancePoint));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));

    } catch (err) {
        uilog("DBUG", "Problem with receipt footer summary caused by:" + err.message);
    }

    return receiptLoyalty;
}

function setReceiptRegLoyalty(loyaltyProgram) {
    var receiptLoyalty = new Array();
    try {
        var header = "Selamat anda sudah terdaftar dalam program";
        var header2 = "Transaction Number";

        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, header));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, loyaltyProgram.progName));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('member_name_loyalty') + "      : " + loyaltyProgram.memberName));
        if (loyaltyProgram.gender == "F") {
            receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('member_gender_loyalty') + "           : " + "Female"));
        } else {
            receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('member_gender_loyalty') + "           : " + "Male"));
        }
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('member_tgl_lahir') + "    : " + loyaltyProgram.tglLahir));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('member_address_loyalty') + "           : " + loyaltyProgram.address));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('ktp_number_loyalty') + "       : " + loyaltyProgram.ktpNumber));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('handphone_number_loyalty') + " : " + loyaltyProgram.hpNumber));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('email_loyalty') + "            : " + loyaltyProgram.email));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('tr_number_loyalty') + " : " + loyaltyProgram.trNumberPrint));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('program_name_loyalty') + "     : " + loyaltyProgram.progName));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('balance_points_loyalty') + "   : " + loyaltyProgram.balancePoint));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));

        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, loyaltyProgram.regMsg1));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, loyaltyProgram.regMsg2));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, loyaltyProgram.regMsg3));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, loyaltyProgram.regMsg4));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, loyaltyProgram.regMsg5));

        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
    } catch (err) {
        uilog("DBUG", "Problem with receipt footer summary caused by:" + err.message);
    }

    return receiptLoyalty;
}

function setReceiptUnpLoyalty(unpointProgram) {
    var receiptLoyalty = new Array();

    try {
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        //receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, "Member ID        : " + unpointProgram.memberId));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('member_name_loyalty') + "      : " + unpointProgram.memberName));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('ktp_number_loyalty') + "       : " + unpointProgram.ktpNumber));
        //receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('handphone_number_loyalty') + " : " + unpointProgram.hpNumber));
        //receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('email_loyalty') + "            : " + unpointProgram.email));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('tr_number_loyalty') + " : " + unpointProgram.trNumberPrint));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('program_name_loyalty') + "     : "));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, unpointProgram.unpProgName));

        // receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('beginning_points_loyalty') + " : " + unpointProgram.beginningPoints));
        // receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('earned_points_loyalty') + "    : " + unpointProgram.earnedPoints));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('balance_points_loyalty') + "   : " + unpointProgram.balancePoint));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
    } catch (err) {
        uilog("DBUG", "Problem with receipt footer summary caused by:" + err.message);
    }

    return receiptLoyalty;
}

function setReceiptRedeemLoyalty(redeemProgram) {
    var receiptLoyalty = new Array();
    try {
        var headerA = redeemProgram.rdmMsgA;
        var headerB = redeemProgram.rdmMsgB;
        var header1 = "Reward Information ";

        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, headerA));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, headerB));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('member_name_loyalty') + "      : " + redeemProgram.memberName));
        if (redeemProgram.gender == "F") {
            receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('member_gender_loyalty') + "           : " + "Female"));
        } else {
            receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('member_gender_loyalty') + "           : " + "Male"));
        }
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('member_tgl_lahir') + "    : " + redeemProgram.tglLahir));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('ktp_number_loyalty') + "       : " + redeemProgram.ktpNumber));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('handphone_number_loyalty') + " : " + redeemProgram.hpNumber));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('email_loyalty') + "            : " + redeemProgram.email));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('balance_points_loyalty') + "   : " + redeemProgram.balancePoint));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('program_name_loyalty') + "     : "));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, redeemProgram.progName));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, header1 + " : "));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        // for(var i = 0; i < redeemProgram.redeemGiftType.length; i++){
        // receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED,  getMsgValue('gift_type') + "\n" + redeemProgram.redeemGiftType[i]));
        // receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED,  getMsgValue('gift_qty') + redeemProgram.redeemGiftQty[i]));
        // }
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('gift_type') + " : " + getMsgValue('gift_qty')));
        for (var i = 0; i < (redeemProgram.redeemGiftType).length; i++) {
            receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, redeemProgram.redeemGiftType[i] + " : " + redeemProgram.redeemGiftQty[i]));
        }
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, redeemProgram.rdmMsg1));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, redeemProgram.rdmMsg2));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, redeemProgram.rdmMsg3));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, redeemProgram.rdmMsg4));
        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, redeemProgram.rdmMsg5));

        receiptLoyalty.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
    } catch (err) {
        uilog("DBUG", "Problem with receipt footer summary caused by:" + redeemProgram.redeemGift + err.message);
    }
    return receiptLoyalty;
}

function setReceiptFooterRegLoyalty() {
    var footer = new Array();
    try {
        var dateTime = new Date();
        var txDateTime = new Date(dateTime);
        var txTimeStr = formatTime(txDateTime);

        var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);

        var posTerminal = configuration.terminalCode;
        var userName = loggedInUsername;
        var storeCode = configuration.storeCode;

        setPosTerminalLoyalty(storeCode, posTerminal, userName, footer);
        footer.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_time_label') + txTimeStr + " " + getMsgValue('pos_receipt_date_label') + txDate));

        footer.push(newLine());
    } catch (err) {
        uilog("DBUG", "Problem with receipt footer summary caused by:" + err.message);
    }

    return footer;
}


/**
 * Receipt footer. This includes the tx and terminal details.
 * Alignment is centered
 * @param tx -
 *            transaction details.
 * @returns {Array}
 */

function setReceiptFooter(tx) {
    var footer = new Array();
    try {
        var dateTime = tx.transactionDate || new Date();
        if (tx.status == CONSTANTS.STATUS.CANCELLED) dateTime = new Date();
        var txDateTime = new Date(dateTime);
        //if(!isDatesTheSame(new Date(), txDateTime))
        //	txDateTime = utcDateToLocalTime(txDateTime);
        var txTimeStr = formatTime(txDateTime);

        var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);
        var divider = addSpaces("", ""); //creates one line item space.

        //add tax breakdown on receipt //TODO: need to be centered and put to summary
        /*		if(   tx.type == CONSTANTS.TX_TYPES.SALE.name
        		   || tx.type == CONSTANTS.TX_TYPES.SALE_VOID.name
        		   || tx.type == CONSTANTS.TX_TYPES.RETURN.name
        		   || tx.type == CONSTANTS.TX_TYPES.REFUND.name){
        			var taxDetails = calculateTaxBreakDown(tx);

        			if(tx.totalTaxableAmount && tx.totalTaxableAmount > 0){
        				footer.push(getMsgValue('pos_receipt_tax_breakdown_label'));
        				footer.push(setTaxBreakdown(taxDetails, tx.type));
        			}
        		}*/

        footer.push(new PrintBlock(RECEIPT_POS_CENTERED, divider)); // add new line
        // if(specialOrder == true){
        // footer.push(new PrintBlock(RECEIPT_POS_CENTERED, "Jenis Barang : " + tx.totalJenisBarang));
        // footer.push(new PrintBlock(RECEIPT_POS_CENTERED, "Total Barang : " + tx.totalQuantity));			
        // footer.push(new PrintBlock(RECEIPT_POS_CENTERED, divider)); // add new line
        // }
        //footer.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_ty_msg')));
        footer.push(new PrintBlock(RECEIPT_POS_CENTERED, getConfigValue('POS_RECEIPT_TY_MSG')));
        //footer.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_taxable_goods')));
        footer.push(new PrintBlock(RECEIPT_POS_CENTERED, getConfigValue('POS_RECEIPT_TAXABLE_GOODS')));
        if (getConfigValue("POS_RECEIPT_TAXABLE_GOODS2") != "") {
            footer.push(new PrintBlock(RECEIPT_POS_CENTERED, getConfigValue('POS_RECEIPT_TAXABLE_GOODS2')));
        }
        footer.push(new PrintBlock(RECEIPT_POS_CENTERED, divider.replace(/ /g, '='))); //creates one line separator.
        footer.push(new PrintBlock(RECEIPT_POS_CENTERED, getConfigValue('POS_RECEIPT_PROMOTION_MSG')));
        footer.push(new PrintBlock(RECEIPT_POS_CENTERED, getConfigValue('RECEIPT_CARREFOUR_WEBSITE')));
        footer.push(new PrintBlock(RECEIPT_POS_CENTERED, getConfigValue('RECEIPT_CARREFOUR_FACEBOOK')));
        footer.push(new PrintBlock(RECEIPT_POS_CENTERED, getConfigValue('RECEIPT_CARREFOUR_TWITTER')));



        // Receipt promotional message
        setPromotionalMsgDetails(footer);
        // #80087
        setPosTerminalDetails(tx, footer, true);
        // footer.push(setPosTerminalDetails(tx));
        if (connectionOnline) {
            footer.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_time_label') + txTimeStr + " " + getMsgValue('pos_receipt_date_label') + txDate));
        } else {
            footer.push(new PrintBlock(RECEIPT_POS_CENTERED, "******" + getMsgValue('pos_receipt_time_label') +
                txTimeStr + " " + getMsgValue('pos_receipt_date_label') + txDate + "*****"));
        }

        // // EVENT REWARDS
        //               footer.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));

        //               // INHOUSE VOUCHER 2017-04-13
        //               if (tx.luckyCustomer && typeof tx.luckyCustomer.luckyEventType != 'undefined' &&
        // 			tx.luckyCustomer.luckyEventRewardNo > 0 && tx.type == 'SALE' && tx.status == 'COMPLETED')
        //               {
        // 			var luckyEventSeparator = "--  --  --  --  --  --  --  --  --"; 	
        // 			var luckyEventRewardsObj = saleTx.luckyCustomer.luckyEventRewardsObj;

        // 			if(luckyEventRewardsObj != null)
        // 			{
        // 				footer.push(new PrintBlock(RECEIPT_POS_CENTERED, luckyEventSeparator));
        // 							footer.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        // 							footer.push(new PrintBlock(RECEIPT_POS_CENTERED, luckyEventRewardsObj.promoHeader));	

        // 				var luckyPromoLines = luckyEventRewardsObj.promoLines;
        // 							for (var l in luckyPromoLines)
        // 							{
        // 									var lines = luckyPromoLines[l];
        // 									lines = lines.replace(/\{totalAmount\}/g, numberWithCommas(luckyEventRewardsObj.eventTotalAmount));
        // 									lines = lines.replace(/\{rewardNo\}/g, tx.luckyCustomer.luckyEventRewardNo);
        // 									lines = lines.replace(/\{startDate\}/g, $.datepicker.formatDate('dd/mm/yy', new Date(luckyEventRewardsObj.startDate)));
        // 									lines = lines.replace(/\{endDate\}/g, $.datepicker.formatDate('dd/mm/yy', new Date(luckyEventRewardsObj.endDate)));
        // 									footer.push(new PrintBlock(RECEIPT_POS_CENTERED, lines.substr(0, 40)));
        // 							}
        // 								footer.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, " "));
        // 								setPosTerminalDetails(tx, footer, true);
        // 								footer.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_time_label') + txTimeStr + " " + getMsgValue('pos_receipt_date_label') + txDate));
        // 				footer.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        // 			}
        // 		}
        // 	//COUPON
        // 	if(tx.stampCoupon != null) {
        // 		for(var a=0; a <= tx.stampCoupon.length-1; a++){
        //               if (tx.stampCoupon[a] && tx.stampCoupon[a].eventRewardNo > 0 && tx.type == 'SALE' && tx.status == 'COMPLETED')
        //               {
        //                       var eventSeparator = "--  --  --  --  --  --  --  --  --  --";

        //                       var eventRewardsObj = saleTx.stampCoupon[a].eventRewardsObj;

        //                       footer.push(new PrintBlock(RECEIPT_POS_CENTERED, eventSeparator));
        //                       footer.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        //                       footer.push(new PrintBlock(RECEIPT_POS_CENTERED, eventRewardsObj.promoHeader));

        //                       var promoLines = eventRewardsObj.promoLines;
        //                       for (var l in promoLines)
        //                       {
        //                               var lines = promoLines[l];
        //                               lines = lines.replace(/\{totalAmount\}/g, numberWithCommas(saleTx.stampCoupon[a].eventTotalAmount));
        //                               lines = lines.replace(/\{rewardNo\}/g, tx.stampCoupon[a].eventRewardNo);
        //                               lines = lines.replace(/\{startDate\}/g, $.datepicker.formatDate('dd/mm/yy', new Date(eventRewardsObj.startDate)));
        //                               lines = lines.replace(/\{endDate\}/g, $.datepicker.formatDate('dd/mm/yy', new Date(eventRewardsObj.endDate)));
        //                               footer.push(new PrintBlock(RECEIPT_POS_CENTERED, lines.substr(0, 40)));
        //                       }

        // 	footer.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        //                       setPosTerminalDetails(tx, footer, true);
        //                       footer.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_time_label') + txTimeStr + " " + getMsgValue('pos_receipt_date_label') + txDate));
        //                       footer.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));

        //                       // COUPON MODE
        //                       if(tx.stampCoupon[a].eventType == CONSTANTS.EVENT_REWARD_TYPES.COUPON)
        //                       {
        // 		var promoCouponTemplate = eventRewardsObj.promoCouponTemplate;

        //                               for (var seq = 1; seq <= tx.stampCoupon[a].eventRewardNo; seq++)
        //                               {
        //                                       footer.push(new PrintBlock(RECEIPT_POS_CENTERED, "--  --  --  POTONG DISINI --  --  --"));
        //                                       footer.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        // 			footer.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, "Store: " + store.name));
        //                                       footer.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, "Kupon No: " + eventRewardsObj.promoPrefix + tx.transactionId + ("000" + seq).slice(-3)));

        // 	        	for (var k in promoCouponTemplate){
        //                                       footer.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, promoCouponTemplate[k]));
        // 								if(promoCouponTemplate[k] != ""){
        // 									footer.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        // 								}
        // 								console.log("promoCouponTemplate[k] : " + promoCouponTemplate[k]);
        // 				}
        //                                       footer.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, " "));
        //                                       footer.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_time_label') + txTimeStr + " " + getMsgValue('pos_receipt_date_label') + txDate));
        //                                       footer.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, " "));
        //                               }
        //                       }
        //               }
        // 		}
        // 	}	

        // 	if(tx.marketingVoucher != null) {
        // 		for(var a=0; a <= tx.marketingVoucher.length-1; a++){
        // 		if (tx.marketingVoucher[a] && typeof tx.marketingVoucher[a].marketingVoucherObj != 'undefined' &&
        // 			tx.marketingVoucher[a].marketingVoucherRewardNo > 0 && tx.type == 'SALE' && tx.status == 'COMPLETED')
        // 				{
        // 						var eventSeparator = "--  --  --  --  --  --  --  --  --  --";

        // 						var eventRewardsObj = saleTx.marketingVoucher[a].marketingVoucherObj;

        // 						footer.push(new PrintBlock(RECEIPT_POS_CENTERED, eventSeparator));
        // 						footer.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        // 						footer.push(new PrintBlock(RECEIPT_POS_CENTERED, eventRewardsObj.promoHeader));

        // 						var promoLines = eventRewardsObj.promoLines;
        // 						for (var l in promoLines)
        // 						{
        // 								var lines = promoLines[l];
        // 								lines = lines.replace(/\{totalAmount\}/g, numberWithCommas(eventRewardsObj.marketingVoucherEligibleAmount));
        // 								lines = lines.replace(/\{rewardNo\}/g, tx.marketingVoucher[a].marketingVoucherRewardNo);
        // 								lines = lines.replace(/\{startDate\}/g, $.datepicker.formatDate('dd/mm/yy', new Date(eventRewardsObj.startDate)));
        // 								lines = lines.replace(/\{endDate\}/g, $.datepicker.formatDate('dd/mm/yy', new Date(eventRewardsObj.endDate)));
        // 								footer.push(new PrintBlock(RECEIPT_POS_CENTERED, lines.substr(0, 40)));
        // 						}

        // 			footer.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        // 						setPosTerminalDetails(tx, footer, true);
        // 						footer.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_time_label') + txTimeStr + " " + getMsgValue('pos_receipt_date_label') + txDate));
        // 						footer.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
        // 				}
        // 		}
        // 	}
        // // INHOUSE VOUCHER 2017-04-13


        //       //new line
        //       footer.push(newLine());
    } catch (err) {
        uilog("DBUG", "Problem with receipt footer caused by:" + err.message);
    }
    return footer;
}

function setReceiptMarketingPromoInfo(tx) {
    var mktInfo = new Array();
    try {
        var dateTime = tx.transactionDate || new Date();
        if (tx.status == CONSTANTS.STATUS.CANCELLED) dateTime = new Date();
        var txDateTime = new Date(dateTime);
        var txTimeStr = formatTime(txDateTime);

        var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);
        var divider = addSpaces("", ""); //creates one line item space.


        mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, divider));
        // EVENT REWARDS
        mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));

        // INHOUSE VOUCHER 2017-04-13
        if (tx.luckyCustomer && typeof tx.luckyCustomer.luckyEventType != 'undefined' &&
            tx.luckyCustomer.luckyEventRewardNo > 0 && tx.type == 'SALE' && tx.status == 'COMPLETED') {
            var luckyEventSeparator = "--  --  --  --  --  --  --  --  --";
            var luckyEventRewardsObj = saleTx.luckyCustomer.luckyEventRewardsObj;

            if (luckyEventRewardsObj != null) {
                mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, luckyEventSeparator));
                mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
                mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, luckyEventRewardsObj.promoHeader));

                var luckyPromoLines = luckyEventRewardsObj.promoLines;
                for (var l in luckyPromoLines) {
                    var lines = luckyPromoLines[l];
                    lines = lines.replace(/\{totalAmount\}/g, numberWithCommas(luckyEventRewardsObj.eventTotalAmount));
                    lines = lines.replace(/\{rewardNo\}/g, tx.luckyCustomer.luckyEventRewardNo);
                    lines = lines.replace(/\{startDate\}/g, $.datepicker.formatDate('dd/mm/yy', new Date(luckyEventRewardsObj.startDate)));
                    lines = lines.replace(/\{endDate\}/g, $.datepicker.formatDate('dd/mm/yy', new Date(luckyEventRewardsObj.endDate)));
                    mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, lines.substr(0, 40)));
                }
                mktInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, " "));
                setPosTerminalDetails(tx, mktInfo, true);
                mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_time_label') + txTimeStr + " " + getMsgValue('pos_receipt_date_label') + txDate));
                mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            }
        }
        //COUPON
        if (tx.stampCoupon && typeof tx.stampCoupon != 'undefined' && tx.stampCoupon != null) {
            for (var a = 0; a <= tx.stampCoupon.length - 1; a++) {
                if (tx.stampCoupon[a] && tx.stampCoupon[a].eventRewardNo > 0 && tx.type == 'SALE' && tx.status == 'COMPLETED') {
                    var eventSeparator = "--  --  --  --  --  --  --  --  --  --";

                    var eventRewardsObj = saleTx.stampCoupon[a].eventRewardsObj;

                    mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, eventSeparator));
                    mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
                    mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, eventRewardsObj.promoHeader));

                    var promoLines = eventRewardsObj.promoLines;
                    for (var l in promoLines) {
                        var lines = promoLines[l];
                        lines = lines.replace(/\{totalAmount\}/g, numberWithCommas(saleTx.stampCoupon[a].eventTotalAmount));
                        lines = lines.replace(/\{rewardNo\}/g, tx.stampCoupon[a].eventRewardNo);
                        lines = lines.replace(/\{startDate\}/g, $.datepicker.formatDate('dd/mm/yy', new Date(eventRewardsObj.startDate)));
                        lines = lines.replace(/\{endDate\}/g, $.datepicker.formatDate('dd/mm/yy', new Date(eventRewardsObj.endDate)));
                        mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, lines.substr(0, 40)));
                    }

                    mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
                    setPosTerminalDetails(tx, mktInfo, true);
                    mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_time_label') + txTimeStr + " " + getMsgValue('pos_receipt_date_label') + txDate));
                    mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));

                    // COUPON MODE
                    if (tx.stampCoupon[a].eventType == CONSTANTS.EVENT_REWARD_TYPES.COUPON) {
                        var promoCouponTemplate = eventRewardsObj.promoCouponTemplate;

                        for (var seq = 1; seq <= tx.stampCoupon[a].eventRewardNo; seq++) {
                            mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, "--  --  --  POTONG DISINI --  --  --"));
                            mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
                            mktInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, "Store: " + store.name));
                            mktInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, "Kupon No: " + eventRewardsObj.promoPrefix + tx.transactionId + ("000" + seq).slice(-3)));

                            for (var k in promoCouponTemplate) {
                                mktInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, promoCouponTemplate[k]));
                                if (promoCouponTemplate[k] != "") {
                                    mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
                                }
                                console.log("promoCouponTemplate[k] : " + promoCouponTemplate[k]);
                            }
                            mktInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, " "));
                            mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_time_label') + txTimeStr + " " + getMsgValue('pos_receipt_date_label') + txDate));
                            mktInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, " "));
                        }
                    }
                }
            }
        }

        if (tx.marketingVoucher != null) {
            for (var a = 0; a <= tx.marketingVoucher.length - 1; a++) {
                if (tx.marketingVoucher[a] && typeof tx.marketingVoucher[a].marketingVoucherObj != 'undefined' &&
                    tx.marketingVoucher[a].marketingVoucherRewardNo > 0 && tx.type == 'SALE' && tx.status == 'COMPLETED') {
                    var eventSeparator = "--  --  --  --  --  --  --  --  --  --";

                    var eventRewardsObj = saleTx.marketingVoucher[a].marketingVoucherObj;

                    mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, eventSeparator));
                    mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
                    mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, eventRewardsObj.promoHeader));

                    var promoLines = eventRewardsObj.promoLines;
                    for (var l in promoLines) {
                        var lines = promoLines[l];
                        lines = lines.replace(/\{totalAmount\}/g, numberWithCommas(eventRewardsObj.marketingVoucherEligibleAmount));
                        lines = lines.replace(/\{rewardNo\}/g, tx.marketingVoucher[a].marketingVoucherRewardNo);
                        lines = lines.replace(/\{startDate\}/g, $.datepicker.formatDate('dd/mm/yy', new Date(eventRewardsObj.startDate)));
                        lines = lines.replace(/\{endDate\}/g, $.datepicker.formatDate('dd/mm/yy', new Date(eventRewardsObj.endDate)));
                        mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, lines.substr(0, 40)));
                    }

                    mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
                    setPosTerminalDetails(tx, mktInfo, true);
                    mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_time_label') + txTimeStr + " " + getMsgValue('pos_receipt_date_label') + txDate));
                    mktInfo.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
                }
            }
        }
        // INHOUSE VOUCHER 2017-04-13
        if (mktInfo.length > 2) {
            //new line
            mktInfo.push(newLine());
        } else {
            mktInfo = null;
        }
    } catch (err) {
        uilog("DBUG", "Problem with receipt mktInfo caused by:" + err.message);
    }
    return mktInfo;
}

/**
 * Prints the cashier name
 * @returns {Array}
 */
function setReceiptCashierInfo(tx) {
    var infos = new Array();
    try {
        infos.push(newLine());
        infos.push(new PrintBlock(RECEIPT_POS_CENTERED,
            getMsgValue('pos_receipt_cashier_name') + RECEIPT_SPACE + loggedInUsername));
        infos.push(newLine());
    } catch (err) {
        uilog("DBUG", "Error getting the cashier's information caused by: " + err.message);
    }

    return infos;
}

/**
 * Sets transaction details to be printed once transaction is voided for payments.
 * @param baseTx
 * @param voidedTx
 * @returns {Array}
 */
function setReceiptVoidTxSummary(baseTx, voidedTx) {
    var txSummary = new Array();
    try {
        var subTotal = "",
            cpnIntAmount = "",
            cpnIntBalanceDue = "",
            cancelAmount = "",
            cancelAmountBalanceDue = "",
            couponCobrandDisc = "",
            couponCobrandDiscBalanceDue = "",
            roundingAmount = "",
            balanceDue = "",
            totalAmount = "",
            reversedMemberDisc = "",
            totalWithRevMemDisc = "",
            donationAmountPrintLine = "",
            maxLength = 40;

        var mediaSummaryReceiptMap;
        var isRoundingApplied = false;
        var hasMemberDiscReversal = (baseTx.memberDiscReversal && baseTx.memberDiscReversal != 0);

        var subTotalAmount = CASHIER.getFinalSubtotalTxAmount(baseTx);

        if (baseTx.cpnIntAmount)
            subTotalAmount += baseTx.cpnIntAmount;
        if (baseTx.roundingAmount)
            subTotalAmount -= baseTx.roundingAmount;
        if (hasMemberDiscReversal)
            subTotalAmount -= baseTx.memberDiscReversal;

        var separatorLineItem1 = setWrappedLineSummaryItem("", lineSeparator1);

        //add total amount and subtotal to print.
        if (baseTx.totalAmount) {
            subTotal += setWrappedLineSummaryItem(getMsgValue('pos_receipt_subtotal_label'), numberWithCommas(subTotalAmount), voidedTx);
            totalAmount += setWrappedLineSummaryItem(getMsgValue('pos_receipt_total_label'), numberWithCommas(subTotalAmount), voidedTx);

            if (hasMemberDiscReversal) {
                var amount = subTotalAmount + baseTx.memberDiscReversal;

                reversedMemberDisc += setWrappedLineSummaryItem(getConfigValue('RECEIPT_CMC_CANCEL_DISCOUNT'), numberWithCommas(baseTx.memberDiscReversal), voidedTx);
                totalWithRevMemDisc += setWrappedLineSummaryItem(getMsgValue('pos_receipt_total_label'), numberWithCommas(amount), voidedTx);
                subTotalAmount = amount;
            }
        }
        if (baseTx.cpnIntAmount) {
            var amount = subTotalAmount - baseTx.cpnIntAmount;

            cpnIntAmount += setWrappedLineSummaryItem(getMsgValue('pos_receipt_cpn_int_amount_label'), numberWithCommas(baseTx.cpnIntAmount));
            cpnIntBalanceDue += setWrappedLineSummaryItem(RECEIPT_DBL_SPACE.concat(getMsgValue('pos_receipt_balance_due_label')), numberWithCommas(amount), voidedTx);
            /*cpnIntBalanceDue += printKeyValueItem(
                "  " + getMsgValue('pos_receipt_balance_due_label')
                , numberWithCommas(amount)
                , maxLength
            );*/

            subTotalAmount = amount;
        }
        // more amount addition/deduction here before the final amount, change the condition if necessary.
        if (baseTx.roundingAmount) {
            isRoundingApplied = true;
            var isRoundingAmtNegative = baseTx.roundingAmount < 0;
            var reversedRoundSign;
            var amount;
            var roundingType = getConfigValue("ROUNDING_TYPE");
            var roundingLbl;

            reversedRoundSign = isRoundingAmtNegative ? numberWithCommas(baseTx.roundingAmount * -1) : numberWithCommas(baseTx.roundingAmount);
            amount = subTotalAmount + baseTx.roundingAmount;

            if (roundingType == "SIMPLE_ROUNDING")
                roundingLbl = "pos_receipt_simple_rounding_label";
            else if (roundingType == "ROUND_UP")
                roundingLbl = "pos_receipt_round_up_label";
            else if (roundingType == "ROUND_DOWN")
                roundingLbl = "pos_receipt_round_down_label";

            roundingAmount += setWrappedLineSummaryItem(getMsgValue(roundingLbl), reversedRoundSign, isRoundingAmtNegative ? null : voidedTx);
            balanceDue += setWrappedLineSummaryItem(RECEIPT_DBL_SPACE.concat(getMsgValue('pos_receipt_balance_due_label')), numberWithCommas(amount), voidedTx);
            /*uilog("DBUG","Printing Balance Label: " + RECEIPT_TAB_SPACE + getMsgValue('pos_receipt_balance_due_label'));
            balanceDue += printKeyValueItem(
                "  " + getMsgValue('pos_receipt_balance_due_label')
                , numberWithCommas(amount)
                , maxLength
            );*/
            //subTotalAmount = amount;
        }

        // If has donation amount
        if (baseTx.donationAmount) {
            donationAmountPrintLine += setWrappedLineSummaryItem(getMsgValue('pos_receipt_donation_label'), numberWithCommas(Math.abs(baseTx.donationAmount)), voidedTx);
        }
        if (voidedTx.promotionItems) {
            setPromotions(voidedTx.promotionItems, txSummary, voidedTx.type);
        }

        var employeeDiscountTotal = Math.abs(calculateEmployeeDiscountTotal(voidedTx));
        if (employeeDiscountTotal != 0) {
            setEmployeeDiscount(employeeDiscountTotal, txSummary, voidedTx.type);
        }

        if (voidedTx.totalNonMemberMarkup && voidedTx.totalNonMemberMarkup != 0) {
            txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setWrappedLineSummaryItem(getMsgValue(Hypercash.service.getMarkUpLabel(tx.taxInvoice.memberType)), numberWithCommas(Math.round(voidedTx.totalNonMemberMarkup * -1)), voidedTx)));
        }

        txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, subTotal));
        txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, separatorLineItem1));
        txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, totalAmount));

        if (hasMemberDiscReversal) {
            txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, reversedMemberDisc));
            txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, separatorLineItem1));
            txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, totalWithRevMemDisc));

        }
        if (baseTx.cpnIntAmount) {
            txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cpnIntAmount));
            txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, separatorLineItem1));
            txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cpnIntBalanceDue));
        }
        if (isRoundingApplied) {
            txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, roundingAmount));
            txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, separatorLineItem1));
            txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, balanceDue));
        }
        // If has donation amount
        if (baseTx.donationAmount) {
            txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, donationAmountPrintLine));
        }
        // if(earnLoyaltyProgram.eventPromoPoint > 0){
        // txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, earnLoyaltyProgram.memberName));
        // txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, earnLoyaltyProgram.hpNumber));
        // txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, earnLoyaltyProgram.beginningPoints));
        // txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, earnLoyaltyProgram.earnedPoint));
        // txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, earnLoyaltyProgram.balancePoint));
        // }
    } catch (err) {
        uilog("DBUG", "Problem with receipt summary caused by:" + err.message);
    }
    return txSummary;
}

/**
 * Sets sale transaction summary for printing.
 * @param tx - transaction details
 * @returns saleSummary
 */
function setReceiptSummary(tx) {
    var txSummary = new Array();
    try {
        var subTotal = "",
            cpnIntAmount = "",
            cpnIntBalanceDue = "",
            couponAmount = "",
            couponAmountBalanceDue = "",
            cancelAmount = "",
            cancelAmountBalanceDue = "",
            couponCobrandDisc = "",
            couponCobrandDiscBalanceDue = "",
            roundingAmount = "",
            balanceDue = "",
            totalAmount = "",
            megaDiscPayment = "",
            reversedMemberDisc = "",
            totalWithRevMemDisc = "",
            cmcCouponSummary = [],
            change = "",
            mediaPaymentSummaryArr = [];
        // XXX: remove LOC below, not used
        // accountNumber = "",
        donationAmountPrintLine = "";
        var mediaSummaryReceiptMap;
        var isRoundingApplied = false;
        var hasMemberDiscReversal = (tx.memberDiscReversal && tx.memberDiscReversal != 0);
        var cmcPaymentSummary = [];

        var totalSecondLayer = 0,
            totalSecondLayerWithoutMember = 0,
            saleTotalDiscount = 0;

        var subTotalAmount = CASHIER.getFinalSubtotalTxAmount(tx);
        var amountPaid = tx.totalDiscount - tx.memberDiscReversal;

        // if(SALE_RETURN_COUPON.isCouponReturnCmc()){
        // 	// for(var i in saleTx.orderItems)
        // 	// {
        // 	// 	if(!tx.orderItems[i].isVoided && tx.orderItems[i].secondLayerDiscountAmount > 0 && tx.orderItems[i].secondLayerDiscountAmountWithoutMember)
        // 	// 	{
        // 	// 		totalSecondLayer += tx.orderItems[i].secondLayerDiscountAmount;
        // 	// 		totalSecondLayerWithoutMember += tx.orderItems[i].secondLayerDiscountAmountWithoutMember;
        // 	// 	}
        // 	// }
        // 	// saleTotalDiscount += (totalSecondLayerWithoutMember - totalSecondLayer);
        // 	subTotalAmount -= saleTotalDiscount;
        // }else if(SALE_RETURN_COUPON.isCouponReturnNotCmc() && saleTx.coBrandNumber){
        // 	subTotalAmount = SALE_RETURN_COUPON.isCashFirst() ? subTotalAmount + SALE_RETURN_COUPON.calculateCouponReturn() : SALE_RETURN_COUPON.subtotalPayWithCash(tx);
        // }else if(SALE_RETURN_COUPON.isUseCouponReturn() && !saleTx.coBrandNumber){
        // 	for(var i in saleTx.orderItems)
        // 	{
        // 		if(!tx.orderItems[i].isVoided && tx.orderItems[i].secondLayerDiscountAmount > 0 && tx.orderItems[i].secondLayerDiscountAmountWithoutMember)
        // 		{
        // 			totalSecondLayer += tx.orderItems[i].secondLayerDiscountAmount;
        // 			totalSecondLayerWithoutMember += tx.orderItems[i].secondLayerDiscountAmountWithoutMember;
        // 		}
        // 	}
        // 	saleTotalDiscount += (totalSecondLayerWithoutMember - totalSecondLayer);
        // 	subTotalAmount -= saleTotalDiscount;
        // }

        console.log(tx);
        console.log("Print Subtotal before : " + subTotalAmount);
        console.log("Print Is card cobrand : " + SALE_RETURN_COUPON.isCardCoBrand(tx));
        console.log("Print Is coupon return cmc : " + SALE_RETURN_COUPON.isCouponReturnCmc(tx));
        console.log("Print Is coupon return not cmc : " + SALE_RETURN_COUPON.isCouponReturnNotCmc(tx));
        console.log("Print Is coupon return : " + SALE_RETURN_COUPON.isUseCouponReturn(tx));
        console.log("Print Total discount : " + tx.totalDiscount);
        console.log("Print member discount reversal : " + tx.memberDiscReversal);
        console.log("Print member discount : " + calculateTotalMemberDiscount());
        console.log("Print total amount : " + tx.totalAmountPaid);

        // if(SALE_RETURN_COUPON.isCouponReturnNotCmc(tx)){
        // 	subTotalAmount += amountPaid;
        // }

        console.log("Print Subtotal after : " + subTotalAmount);

        if (tx.type == CONSTANTS.TX_TYPES.SALE.name) {
            /*
             * NOTE: data.finalSubTotalAmount is the final subtotal all deduction
             * included e.g rounding amount. Amounts that need to be added/removed for
             * the payment breakdown purposes must be place here. (applicable only if sale type is equal to SALE.)
             */
            if (tx.cpnIntAmount)
                subTotalAmount += tx.cpnIntAmount;
            if (tx.roundingAmount)
                subTotalAmount -= tx.roundingAmount;
            if (hasMemberDiscReversal)
                subTotalAmount -= tx.memberDiscReversal;
        }

        var separatorLineItem1 = setWrappedLineSummaryItem("", lineSeparator1);
        //add total amount and subtotal to print.
        if (tx.totalAmount) {
            var subTotalAmountDisplayText = numberWithCommas(Math.abs(subTotalAmount));
            subTotal += setWrappedLineSummaryItem(getMsgValue('pos_receipt_subtotal_label'), subTotalAmountDisplayText, tx);
            totalAmount += setWrappedLineSummaryItem(getMsgValue('pos_receipt_total_label'), subTotalAmountDisplayText, tx);

            if (hasMemberDiscReversal) {
                var amount = subTotalAmount + tx.memberDiscReversal;

                reversedMemberDisc += setWrappedLineSummaryItem(getConfigValue('RECEIPT_CMC_CANCEL_DISCOUNT'), numberWithCommas(tx.memberDiscReversal), tx);
                totalWithRevMemDisc += setWrappedLineSummaryItem(getMsgValue('pos_receipt_total_label'), numberWithCommas(amount), tx);
                subTotalAmount = amount;
            }
        }
        if (tx.cpnIntAmount) {
            var amount = subTotalAmount - tx.cpnIntAmount;

            cpnIntAmount += wrapLineItem(getMsgValue('pos_receipt_cpn_int_amount_label'), numberWithCommas(tx.cpnIntAmount), "-", RECEIPT_DBL_SPACE);
            cpnIntBalanceDue += setWrappedLineSummaryItem(RECEIPT_DBL_SPACE.concat(getMsgValue('pos_receipt_balance_due_label')), numberWithCommas(amount), tx);
            subTotalAmount = amount;
        }
        // more amount addition/deduction here before the final amount, change the condition if necessary.
        if (tx.roundingAmount) {
            isRoundingApplied = true;
            var isRoundingAmtNegative = tx.roundingAmount < 0;
            var reversedRoundSign;
            var amount;
            var roundingType = getConfigValue("ROUNDING_TYPE");
            var roundingLbl;

            reversedRoundSign = isRoundingAmtNegative ? numberWithCommas(tx.roundingAmount * -1) : numberWithCommas(tx.roundingAmount);
            amount = subTotalAmount + tx.roundingAmount;

            if (roundingType == "SIMPLE_ROUNDING")
                roundingLbl = "pos_receipt_simple_rounding_label";
            else if (roundingType == "ROUND_UP")
                roundingLbl = "pos_receipt_round_up_label";
            else if (roundingType == "ROUND_DOWN")
                roundingLbl = "pos_receipt_round_down_label";

            roundingAmount += wrapLineItem(getMsgValue(roundingLbl), reversedRoundSign, isRoundingAmtNegative ? "-" : null, RECEIPT_DBL_SPACE);
            balanceDue += setWrappedLineSummaryItem(RECEIPT_DBL_SPACE.concat(getMsgValue('pos_receipt_balance_due_label')), numberWithCommas(amount), tx);
            //subTotalAmount = amount;
        }

        var totalCmcDisc = calculateTotalMemberDiscount();
        var cmcPayment = !hasMemberDiscReversal && totalCmcDisc > 0;
        var cmcPaymentCoupon = SALE_RETURN_COUPON.isCmcPayment() && SALE_RETURN_COUPON.isUseCouponReturn();

        // if(cmcPaymentCoupon){
        // 	for(var k = 0; k < tx.payments.length; k++){
        // 		pk = tx.payments[k];

        // 		if(pk.paymentMediaType == 'COUPON_RETURN'){
        // 			cpnAmount = pk.amountPaid;
        // 			subTotalAmount -= cpnAmount;
        // 			console.log(subTotalAmount);

        // 			couponAmount = wrapLineItem('COUPON RETURN', numberWithCommas(cpnAmount), "-", RECEIPT_DBL_SPACE);
        // 			couponAmountBalanceDue = setWrappedLineSummaryItem(RECEIPT_DBL_SPACE.concat(getMsgValue('pos_receipt_balance_due_label')), numberWithCommas(subTotalAmount), tx);
        // 			cmcCouponSummary.push({'amount' : couponAmount, 'balance_due':couponAmountBalanceDue});
        // 		}
        // 	}
        // }

        // 	megaDiscPayment = SALE_RETURN_COUPON.calculateTotalMemberDiscount(subTotalAmount);
        // 	saleTx.megaDiscPayment = megaDiscPayment;
        // 	amount = subTotalAmount - megaDiscPayment;

        // 	couponCobrandDisc += wrapLineItem(getConfigValue('RECEIPT_CMC_TOTAL_DISCOUNT'), numberWithCommas(megaDiscPayment), "-", RECEIPT_DBL_SPACE);
        // 	couponCobrandDiscBalanceDue += setWrappedLineSummaryItem(RECEIPT_DBL_SPACE.concat(getMsgValue('pos_receipt_balance_due_label')), numberWithCommas(amount), tx);
        // }

        //add total amount paid and the change to print.
        if (tx.totalAmountPaid) {
            mediaSummaryReceiptMap = PAYMENT_MEDIA.generatePaymentSummaryReceiptMap(tx);

            console.log("MEDIA SUMMARY RECEIPT MAP : " + JSON.stringify(mediaSummaryReceiptMap));

            //handle cmc payment details
            console.log("Cmc payment : " + cmcPayment);

            // if(cmcPaymentCoupon){
            // 	for (var i in mediaSummaryReceiptMap){
            // 		var mediaItem = mediaSummaryReceiptMap[i];
            // 		var checkOneItemBehind = mediaSummaryReceiptMap[i-1] != undefined && mediaSummaryReceiptMap[i-1].label != 'COUPON RETURN';
            // 		var checkTwoItemBehind = mediaSummaryReceiptMap[i-2] != undefined && mediaSummaryReceiptMap[i-2].label != 'COUPON RETURN';
            // 		if(mediaItem.label != 'COUPON RETURN' && checkOneItemBehind && checkTwoItemBehind){
            // 			if(mediaItem.font && mediaItem.font.bold){
            // 				cmcPaymentSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_BOLD));
            // 				cmcPaymentSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, 
            // 						setLineSummaryItem(mediaItem.label, mediaItem.value, (mediaItem.checkSign)? tx.type: null)));
            // 				cmcPaymentSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DEFAULT));
            // 			}else{
            // 				cmcPaymentSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, 
            // 						setLineSummaryItem(mediaItem.label, mediaItem.value, (mediaItem.checkSign)? tx.type: null)));
            // 			}
            // 		}
            // 	} 
            // 	cmcPaymentSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, "\n"));

            // }else 
            if (cmcPayment) {
                for (var i in mediaSummaryReceiptMap) {
                    var mediaItem = mediaSummaryReceiptMap[i];
                    if (mediaItem.font && mediaItem.font.bold) {
                        cmcPaymentSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_BOLD));
                        cmcPaymentSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            setLineSummaryItem(mediaItem.label, mediaItem.value, (mediaItem.checkSign) ? tx.type : null)));
                        cmcPaymentSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DEFAULT));
                    } else {
                        cmcPaymentSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            setLineSummaryItem(mediaItem.label, mediaItem.value, (mediaItem.checkSign) ? tx.type : null)));
                    }
                }
                cmcPaymentSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, "\n"));
            } else {
                mediaSummaryReceiptMap.forEach(function(data) {
                    //console.log(mediaSummaryReceiptMap);
                    var label = data.label;
                    var mediaPaymentSummary = "";
                    // Fix #85005
                    //if(GIFTCARDMMSObject.currGiftCardTxnItem.gcServerType == 'E-CTC'){
                    //	var unwrappedLblArr = [
                    // List all labels here that needed to be unwrapped.
                    //	   getMsgValue('pos_receipt_ctc_number_label')
                    //	];
                    //} else {
                    var unwrappedLblArr = [
                        // List all labels here that needed to be unwrapped.
                        getMsgValue('pos_receipt_giftcard_number_label')
                    ];
                    var unwrappedLblArr2 = [
                        getMsgValue('pos_receipt_voucher_number_label')
                    ];
                    //}
                    var isUnwrappedLbl = (($.inArray(label, unwrappedLblArr) >= 0) || ($.inArray(label, unwrappedLblArr2) >= 0));
                    mediaPaymentSummary += (isUnwrappedLbl) ? setLineSummaryItem(label, data.value, (data.checkSign) ? tx.type : null) :
                        setWrappedLineSummaryItem(label, data.value, (data.checkSign) ? tx : null);
                    mediaPaymentSummaryArr.push(mediaPaymentSummary);
                });
            }
        }
        // If has donation amount
        if (tx.donationAmount) {
            donationAmountPrintLine += setWrappedLineSummaryItem(getMsgValue('pos_receipt_donation_label'),
                numberWithCommas(Math.abs(tx.donationAmount)),
                tx);
        }
        if (tx.totalChange != 0) {
            change += setWrappedLineSummaryItem(getMsgValue('pos_receipt_change_label'),
                numberWithCommas(tx.totalChange),
                tx);
        }
        if (tx.promotionItems) {
            setPromotions(tx.promotionItems, txSummary, tx.type);
        }

        var employeeDiscountTotal = Math.abs(calculateEmployeeDiscountTotal(tx));
        if (employeeDiscountTotal != 0) {
            txSummary.push(new PrintBlock(RECEIPT_POS_CENTERED, addSpaces("", "").replace(/ /g, '=')));
            
            var empDiscAndSubtotal = subTotalAmount + employeeDiscountTotal;
            txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem('TOTAL BELANJA:', numberWithCommas(empDiscAndSubtotal), "")));
            txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, separatorLineItem1));
            
            var summarizedOrderItems = getSummarizeSaleItems(tx);
            console.log("CUY ", summarizedOrderItems);
            var percentage;
            var discount;
            for (var i = 0; i < summarizedOrderItems.length; i++) {
                var empDiscType = getConfigValue("EMP_DISC_TYPE");
                if (empDiscType === "INCLUSION") {
                    percentage = summarizedOrderItems[i].discPercentage;
                    discount = percentage + "%" + " ";
                } else {
                    discount = "";
                }
                var itemLabelName = summarizedOrderItems[i].shortDesc;
                var itemLabelQty = summarizedOrderItems[i].quantity;
                var itemEmpDisc = parseFloat(summarizedOrderItems[i].discBtnAmount);
                if (!isNaN(itemEmpDisc) && itemEmpDisc > 0) {
                    setEmployeeDiscountItem(discount + itemLabelName +" "+itemLabelQty+"x", itemEmpDisc, txSummary, tx.type);
                }
            }
            txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, separatorLineItem1));
            setEmployeeDiscount(employeeDiscountTotal, txSummary, tx.type);
            txSummary.push(new PrintBlock(RECEIPT_POS_CENTERED, addSpaces("", "").replace(/ /g, '=')));
        }

        if (tx.totalNonMemberMarkup && tx.totalNonMemberMarkup != 0 &&
            tx.type != CONSTANTS.TX_TYPES.REFUND.name) {
            txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED,
                setWrappedLineSummaryItem(getMsgValue(Hypercash.service.getMarkUpLabel((profCust && profCust.customerNumber) ? profCust.memberType : tx.taxInvoice.memberType)), numberWithCommas(Math.round(tx.totalNonMemberMarkup)), tx)));
        }

        //@MDR
        if (tx.totalMdrSurcharge && tx.totalMdrSurcharge != 0) {
            txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED,
                setWrappedLineSummaryItem(getMsgValue('pos_receipt_mdr_surcharge_label'), numberWithCommas(Math.round(tx.totalMdrSurcharge)), tx)));
        }
        /*
         * General: Applicable for all sale types.
         *  SUBTOTAL:     100,000 <subTotal>
         *          ============= <separatorLineItem1>
         *  TOTAL:        100,000 <totalAmount>
         */
        txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, subTotal));
        txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, separatorLineItem1));
        txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, totalAmount));

        if (tx.type == CONSTANTS.TX_TYPES.SALE.name || tx.type == CONSTANTS.TX_TYPES.BILL_PAYMENT.name) {
            if (hasMemberDiscReversal) {
                txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, reversedMemberDisc));
                txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, separatorLineItem1));
                txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, totalWithRevMemDisc));
            }
            if (tx.cpnIntAmount) {
                txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cpnIntAmount));
                txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, separatorLineItem1));
                txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cpnIntBalanceDue));
            }
            if (isRoundingApplied) {
                txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, roundingAmount));
                txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, separatorLineItem1));
                txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, balanceDue));
            }

            if (cmcPaymentCoupon) {
                for (var i = 0; i < cmcCouponSummary.length; i++) {
                    cmcCouponObj = cmcCouponSummary[i];
                    amountCoupon = cmcCouponObj['amount'];
                    balanceDueCoupon = cmcCouponObj['balance_due'];

                    txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, amountCoupon));
                    txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, separatorLineItem1));
                    txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, balanceDueCoupon));
                }
                // txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, couponCobrandDisc));
                // txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, separatorLineItem1));
                // txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, couponCobrandDiscBalanceDue));
            }

            if (cmcPayment || cmcPaymentCoupon) {
                console.log("CMC Payment summary");
                console.log(cmcPaymentSummary);
                txSummary = txSummary.concat(cmcPaymentSummary);
            } else {
                mediaPaymentSummaryArr.forEach(function(data) {
                    txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, data));
                });

            }

            // If has donation amount
            if (tx.donationAmount) {
                txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, donationAmountPrintLine));
            }
            if (tx.totalChange != 0) {
                txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, change));
            }
        } else if (tx.type == CONSTANTS.TX_TYPES.CANCEL_SALE.name) {} else if (tx.type == CONSTANTS.TX_TYPES.RETURN.name) {
            //console.log("DBUG RETURN");
            //console.log(mediaPaymentSummaryArr);
            // DEBUG RETURN MLC
            if (cmcPayment) {
                txSummary = txSummary.concat(cmcPaymentSummary);
            } else {
                mediaPaymentSummaryArr.forEach(function(data) {
                    txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, data));
                });
            }
            // DEBUG RETURN MLC
        } else if (tx.type == CONSTANTS.TX_TYPES.REFUND.name) {
            mediaPaymentSummaryArr.forEach(function(data) {
                txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, data));
            });
        }

        for (var i = 0; i < tx.orderItems.length; i++) {
            var item = tx.orderItems[i];
            if (item.percentageDiscount !== undefined && item.percentageDiscount !== null) {
                // Add the percentageDiscount for each item to the summary
                txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED,
                    setWrappedLineSummaryItem('Percentage Discount: ', item.percentageDiscount + '%', tx)));
            }
        }    
    } catch (err) {
        uilog("DBUG", "Problem with receipt summary caused by:" + err.message);
    }

    return txSummary;
}

/**
 * Stores all line items for printing in array.
 * @param scannedItems - scanned products/items/topup/indosmart etc.
 * @param inclusions - adds other details to be printed like currency symbol etc.
 * @returns item {Array} - an array of product items scanned.
 */
var curstaffId = "";

function setReceiptItems(tx, scannedItems, inclusions, trxId) {
    //var item = [], items = [];
    var items = [];


    try {

        // If enableLineItemPrice is not defined, enable lineItemPrice printing
        // else follow the defined value of enableLineItemPrice.
        var enableLineItemPrice = (inclusions &&
            inclusions.enableLineItemPrice == undefined) ? true : inclusions.enableLineItemPrice;

        // add currency symbol on receipt for first scan
        if (inclusions && inclusions.currency) {
            /*
            item.push(buildLineItem({
				left : "",
				right : inclusions.currency,
				pad : addSpaces("", inclusions.currency)
			}));
			*/
            items.push(new PrintBlock(RECEIPT_POS_CENTERED, wrapLineItem("", inclusions.currency, "")));
        }

        if (tx.type == CONSTANTS.TX_TYPES.BILL_PAYMENT.name) {
            scannedItems = BILL_PAYMENT.getItemInfoList(tx.billPaymentItem);
        }

        if (tx.type == CONSTANTS.TX_TYPES.ELEBOX.name) {
            scannedItems = ELEBOX.getItemInfoList(tx);
            uilog('DBUG', "scannedItems : " + JSON.stringify(scannedItems));
        }
        if (tx.type == CONSTANTS.TX_TYPES.BPJS.name) {
            scannedItems = BPJS.getItemInfo(tx);
        }
        if (tx.type == CONSTANTS.TX_TYPES.SIMPATINDO.name) {
            scannedItems = SIMPATINDO.getItemInfo(tx);
        }

        // Loop items scanned and set each item to print'
        for (var i in scannedItems) {

            var isItemVoided = scannedItems[i].isVoided;

            // Adds Void Description on receipt.
            if (scannedItems[i].isVoided) {
                items.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('pos_receipt_void_label')));
            }

            if (scannedItems[i].staffId && staffFlag && curstaffId != scannedItems[i].staffId) {
                curstaffId = scannedItems[i].staffId;
                items.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, "Staff Id : " + scannedItems[i].staffId));
            }

            // if(staff == true){
            // printStaffId();
            // }

            // prints price and quantity
            if (enableLineItemPrice) {
                var sign = (tx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO && isItemCMC(scannedItems[i].ean13Code, tx.promotionsMap)) ? "Z" : "";
                items.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setLineItemPrice(scannedItems[i]) + sign));
            }

            //GiftCard - prints gc in item level only for activation.
            if (hasGiftCardRedemption == '0' && GIFTCARDObject && GIFTCARDObject.currGiftCardInfo) {
                items.push(new PrintBlock(RECEIPT_POS_CENTERED, setLineItemGC(GIFTCARDObject.currGiftCardInfo)));
            }

            //Set Line item Desc with unit price.
            items.push(new PrintBlock(RECEIPT_POS_CENTERED, setWrappedLineItemDesc(tx, scannedItems[i])));

            // CR RETURN

            //if product has markdown and Transaction type is SALE, insert line.
            if (tx.type == CONSTANTS.TX_TYPES.SALE.name ||
                tx.type == CONSTANTS.TX_TYPES.RECALL.name ||
                tx.type == CONSTANTS.TX_TYPES.SALE_VOID.name ||
                (tx.type == CONSTANTS.TX_TYPES.RETURN.name && getConfigValue("RETURN_FLAG") == "true")) {

                var discAmt = scannedItems[i].discountAmount;
                // DEPTSTORE ITEM
                if (configuration.terminalType == 'DEPTSTORE') {
                    if (scannedItems[i].discMarkdown && scannedItems[i].discMarkdown > 0)
                        items.push(new PrintBlock(RECEIPT_POS_CENTERED, wrapLineItem(getMsgValue("pos_receipt_discount"),
                            numberWithCommas(Math.round(scannedItems[i].quantity * parseInt(scannedItems[i].discMarkdown))),
                            displayNegativeSign(tx, !isItemVoided))));
                    var disc = scannedItems[i].discPrice;

                    for (var p in disc) {
                        items.push(new PrintBlock(RECEIPT_POS_CENTERED,
                            wrapLineItem(
                                getMsgValue("pos_receipt_discount") +
                                ((parseFloat(disc[p]) <= 1) ? Math.round(disc[p] * 100) + '%' : 'Rp'),
                                numberWithCommas(Math.round(scannedItems[i].quantity * parseInt(scannedItems[i].discAmount[p]))),
                                displayNegativeSign(tx, !isItemVoided))));
                    }

                    // INHOUSE VOUCHER 2017-04-13
                    if (scannedItems[i].discVoucher.length > 0) {
                        for (var v in scannedItems[i].discVoucher) {
                            items.push(new PrintBlock(RECEIPT_POS_CENTERED,
                                wrapLineItem(getMsgValue("pos_receipt_discount") + 'Voucher #' + scannedItems[i].discVoucherBarcode[v],
                                    numberWithCommas(parseInt(scannedItems[i].discVoucher[v])),
                                    displayNegativeSign(tx, !isItemVoided)
                                )
                            ));
                        }
                    }
                    // INHOUSE VOUCHER 2017-04-13
                } else if (discAmt &&
                    discAmt > 0) {
                    items.push(new PrintBlock(RECEIPT_POS_CENTERED, wrapLineItem(getMsgValue("pos_receipt_discount"),
                        numberWithCommas(discAmt),
                        displayNegativeSign(tx, !isItemVoided))));
                }

                var crmDiscAmt = scannedItems[i].crmMemberDiscountAmount;
                if (crmDiscAmt &&
                    crmDiscAmt > 0) {
                    items.push(new PrintBlock(RECEIPT_POS_CENTERED, wrapLineItem(getMsgValue("pos_receipt_crm_discount"),
                        numberWithCommas(crmDiscAmt),
                        displayNegativeSign(tx, !isItemVoided))));
                }
                var cmcDiscAmt = scannedItems[i].memberDiscountAmount;
                if (cmcDiscAmt &&
                    cmcDiscAmt > 0) {
                    
                    var rcmcText = getConfigValue('CO_BRAND_LIST');
                    var labelCmc = getLabelCmc(tx.coBrandNumber, rcmcText);
                    
                    if(labelCmc){
                        items.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_BOLD));
                        items.push(wrapLineItem(labelCmc + ' Discount:',
                            numberWithCommas(cmcDiscAmt),
                            displayNegativeSign(tx, !isItemVoided)));
                        items.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DEFAULT));
                    }else{
                        items.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_BOLD));
                        items.push(wrapLineItem('MEGA Discount:',
                            numberWithCommas(cmcDiscAmt),
                            displayNegativeSign(tx, !isItemVoided)));
                        items.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DEFAULT));
                    }
                        

                    
                }
            }
            // CR RETURN
            if (tx.type == CONSTANTS.TX_TYPES.RETURN.name && getConfigValue("RETURN_FLAG") == "true" || tx.type == CONSTANTS.TX_TYPES.REFUND.name) {
                items.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, "R : " + scannedItems[i].rrReason));
            }

        }
        staffFlag = false;
        //items.push(item);
    } catch (err) {
        uilog("DBUG", "Problem with receipt item/body caused by:" + err.message);
    }
    staffFlag = false;
    return items;
}

/**
 * Payment Receipt details to be printed.
 * @param paymentItems
 * @param additionalData
 * @returns {Array}
 */
function setPaymentReceiptItems(paymentItems, additionalData) {
    var itemArray = [];
    var paymentItem;
    var counter = 0;
    try {
        // add currency symbol on receipt for first scan
        if (additionalData &&
            additionalData.currency) {
            //printItem.push(wrapLineItem("", additionalData.currency, ""));
            itemArray.push(new PrintBlock(RECEIPT_POS_CENTERED, wrapLineItem("", additionalData.currency, "")));
        }

        while (paymentItem = paymentItems[counter++]) {

            /*printItem.push(wrapLineItem(paymentItem.paymentMediaType,
            			                numberWithCommas(paymentItem.amountPaid),
            			                ""));*/
            itemArray.push(new PrintBlock(RECEIPT_POS_CENTERED, wrapLineItem(paymentItem.paymentMediaType,
                numberWithCommas(paymentItem.amountPaid),
                "")));
        }
        //printItemArray.push(itemArray);
    } catch (err) {
        uilog("DBUG", "Problem with receipt item/body caused by: " + err.message);
    }
    return itemArray;
}

/**
 * Sets Topup Response for printing.
 * @param data containing topUpTxItem and the posTxItem reference.
 * @param hasHeaderLineSeparator
 * @param hasHeader
 * @param hasSummary
 * @param hasFooter
 * @param hasFooterLineSeparator
 * @returns topupResponse
 */
function setReceiptTopUpInfo(data, hasHeaderLineSeparator, hasHeader, hasSummary, hasFooter, hasFooterLineSeparator) {
    var printTopupReceipt = parseBoolean(getConfigValue("PRINT_TOPUP_RECEIPT"));
    if (printTopupReceipt) {
        var topUpInfo = new Array();
        var wrapLength = parseInt(getMsgValue('pos_receipt_max_length')) - RECEIPT_DBL_SPACE.length;

        try {
            if (hasHeaderLineSeparator)
                topUpInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, lineSeparator2));
            if (hasHeader) {
                var sign = (data.saleType == CONSTANTS.TX_TYPES.RETURN.name ? "-" : "");
                topUpInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem(RECEIPT_DBL_SPACE + getConfigValue('RECEIPT_TOPUP_TOTAL_LBL'), numberWithCommas(data.totalAmount), sign)));
            }
            if (hasSummary) {
                topUpInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, ""));

                var refTxItem = data.refTxItem;
                var item = data.topUpItem;

                if (data.refTxItem)
                    topUpInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setTopUpResLineItem(refTxItem.shortDesc, numberWithCommas(refTxItem.priceUnit))));

                if (item.transactionType.toUpperCase() == "CHANGE") {
                    topUpInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setTopUpResLineItem(getConfigValue('RECEIPT_TOPUP_NEW_PHONE_NO_LBL'), item.phoneNum)));
                } else {
                    topUpInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setTopUpResLineItem(getConfigValue('RECEIPT_TOPUP_PHONE_NO_LBL'), item.phoneNum)));
                }

                topUpInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setTopUpResLineItem(getConfigValue('RECEIPT_TOPUP_ID_LBL'), item.serverTrxId)));
                topUpInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setTopUpResLineItem(getConfigValue('RECEIPT_TOPUP_TR_NO_LBL'), item.partnerTrxId)));

                if (item.vType)
                    topUpInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setTopUpResLineItem(getConfigValue('RECEIPT_TOPUP_VOUCHER_TYPE_LBL'), item.vType)));

                topUpInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setTopUpResLineItem(getConfigValue('RECEIPT_TOPUP_STATUS_CODE_LBL'), item.resCode)));
                topUpInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setTopUpResLineItem(getConfigValue('RECEIPT_TOPUP_STATUS_LBL'), item.scrMessage)));

                if (item.resMessage)
                    topUpInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setTopUpResLineItem(getConfigValue('RECEIPT_TOPUP_RES_MSG_LBL'), item.resMessage)));
            }
            if (hasFooter) {
                topUpInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, ""));
                wrapText(topUpInfo, getConfigValue('RECEIPT_TOPUP_FOOTER_LBL'), wrapLength, true);
            }

            if (hasFooterLineSeparator)
                topUpInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, lineSeparator2));
        } catch (err) {
            uilog("DBUG", "Problem with receipt topup info caused by:" + err.message);
        }

        return topUpInfo;
    } else {
        return null;
    }
}

/**
 * Sets Indosmart Response for printing.
 * @param data containing indosmartTxItem and the posTxItem reference.
 * @param hasHeaderLineSeparator
 * @param hasHeader
 * @param hasSummary
 * @param hasFooter
 * @param hasFooterLineSeparator
 * @returns indosmartResponse
 */
function setReceiptIndosmartInfo(data, hasHeaderLineSeparator, hasHeader, hasSummary, hasFooter, hasFooterLineSeparator) {
    console.log("Data receipt indosmart");
    console.log(data);
    var printIndosmartReceipt = parseBoolean(getConfigValue("PRINT_INDOSMART_RECEIPT"));
    console.log(printIndosmartReceipt);
    if (printIndosmartReceipt) {
        var indosmartInfo = new Array();
        var wrapLength = parseInt(getMsgValue('pos_receipt_max_length')) - RECEIPT_DBL_SPACE.length;

        try {
            if (hasHeaderLineSeparator)
                indosmartInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, lineSeparator2));
            if (hasHeader) {
                var sign = (data.saleType == CONSTANTS.TX_TYPES.RETURN.name ? "-" : "");
                indosmartInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem(RECEIPT_DBL_SPACE + getConfigValue('RECEIPT_INDOSMART_TOTAL_LBL'), numberWithCommas(data.totalAmount), sign)));
            }
            if (hasSummary) {
                indosmartInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, ""));

                var refTxItem = data.refTxItem;
                var item = data.indosmartItem;

                if (data.refTxItem)
                    indosmartInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setIndosmartResLineItem(refTxItem.shortDesc, numberWithCommas(refTxItem.priceUnit))));

                if (item.transactionType.toUpperCase() == "CHANGE") {
                    indosmartInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setIndosmartResLineItem(getConfigValue('RECEIPT_INDOSMART_NEW_PHONE_NO_LBL'), item.phoneNum)));
                } else {
                    indosmartInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setIndosmartResLineItem(getConfigValue('RECEIPT_INDOSMART_PHONE_NO_LBL'), item.phoneNum)));
                }

                indosmartInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setIndosmartResLineItem(getConfigValue('RECEIPT_INDOSMART_ID_LBL'), item.referenceNo)));
                indosmartInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setIndosmartResLineItem(getConfigValue('RECEIPT_INDOSMART_TR_NO_LBL'), item.partnerTrxId)));

                if (item.responseCode) {
                    indosmartInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setIndosmartResLineItem(getConfigValue('RECEIPT_INDOSMART_STATUS_CODE_LBL'), item.responseCode)));
                }

                if (item.faultCode) {
                    indosmartInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setIndosmartResLineItem(getConfigValue('RECEIPT_INDOSMART_FAULT_CODE_LBL'), item.faultCode)));
                }

                if (item.messageGeneral) {
                    indosmartInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setIndosmartResLineItem(getConfigValue('RECEIPT_INDOSMART_STATUS_GENERAL_LBL'), item.messageGeneral)));
                }

                if (item.message) {
                    indosmartInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setIndosmartResLineItem(getConfigValue('RECEIPT_INDOSMART_RES_MSG_LBL'), item.message)));
                }

                if (item.faultString) {
                    indosmartInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setIndosmartResLineItem(getConfigValue('RECEIPT_INDOSMART_RES_MSG_LBL'), item.faultString)));
                }
            }
            if (hasFooter) {
                indosmartInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, ""));
                wrapText(indosmartInfo, getConfigValue('RECEIPT_INDOSMART_FOOTER_LBL'), wrapLength, true);
            }

            if (hasFooterLineSeparator)
                indosmartInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, lineSeparator2));
        } catch (err) {
            uilog("DBUG", "Problem with receipt indosmart info caused by:" + err.message);
        }

        console.log(indosmartInfo);
        return indosmartInfo;
    } else {
        return null;
    }
}

/**
 * Sets Indosmart Response for printing.
 * @param data containing indosmartTxItem and the posTxItem reference.
 * @param hasHeaderLineSeparator
 * @param hasHeader
 * @param hasSummary
 * @param hasFooter
 * @param hasFooterLineSeparator
 * @returns indosmartResponse
 */
function setReceiptMCashInfo(data, hasHeaderLineSeparator, hasHeader, hasSummary, hasFooter, hasFooterLineSeparator) {
    console.log("Data receipt mcash");
    console.log(data);
    var printMCashReceipt = parseBoolean(getConfigValue("PRINT_MCASH_RECEIPT"));
    console.log(printMCashReceipt);
    if (printMCashReceipt) {
        var mCashInfo = new Array();
        var wrapLength = parseInt(getMsgValue('pos_receipt_max_length')) - RECEIPT_DBL_SPACE.length;

        try {
            if (hasHeaderLineSeparator)
                mCashInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, lineSeparator2));
            if (hasHeader) {
                var sign = (data.saleType == CONSTANTS.TX_TYPES.RETURN.name ? "-" : "");
                mCashInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem(RECEIPT_DBL_SPACE + getConfigValue('RECEIPT_MCASH_TOTAL_LBL'), numberWithCommas(data.totalAmount), sign)));
            }
            if (hasSummary) {
                mCashInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, ""));

                var refTxItem = data.refTxItem;
                var item = data.mCashItem;

                if (data.refTxItem)
                    mCashInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setMCashResLineItem(refTxItem.shortDesc, numberWithCommas(refTxItem.priceUnit))));

                if (item.transactionType.toUpperCase() == "CHANGE") {
                    mCashInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setMCashResLineItem(getConfigValue('RECEIPT_MCASH_NEW_PHONE_NO_LBL'), item.phoneNum)));
                } else {
                    mCashInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setMCashResLineItem(getConfigValue('RECEIPT_MCASH_PHONE_NO_LBL'), item.phoneNum)));
                }

                mCashInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setMCashResLineItem(getConfigValue('RECEIPT_MCASH_ID_LBL'), item.serverTrxId)));
                mCashInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setMCashResLineItem(getConfigValue('RECEIPT_MCASH_TR_NO_LBL'), item.partnerTrxId)));

                if (item.vType)
                    mCashInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setMCashResLineItem(getConfigValue('RECEIPT_MCASH_VOUCHER_TYPE_LBL'), item.vType)));

                mCashInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setMCashResLineItem(getConfigValue('RECEIPT_MCASH_STATUS_CODE_LBL'), item.resCode)));
                mCashInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setMCashResLineItem(getConfigValue('RECEIPT_MCASH_STATUS_LBL'), item.scrMessage)));

                if (item.resMessage)
                    mCashInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setMCashResLineItem(getConfigValue('RECEIPT_MCASH_RES_MSG_LBL'), item.resMessage)));
            }
            if (hasFooter) {
                mCashInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, ""));
                wrapText(mCashInfo, getConfigValue('RECEIPT_MCASH_FOOTER_LBL'), wrapLength, true);
            }

            if (hasFooterLineSeparator)
                mCashInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, lineSeparator2));
        } catch (err) {
            uilog("DBUG", "Problem with receipt mcash info caused by:" + err.message);
        }

        console.log(mCashInfo);
        return mCashInfo;
    } else {
        return null;
    }
}

/**
 * Sets Indosmart Response for printing.
 * @param data containing indosmartTxItem and the posTxItem reference.
 * @param hasHeaderLineSeparator
 * @param hasHeader
 * @param hasSummary
 * @param hasFooter
 * @param hasFooterLineSeparator
 * @returns indosmartResponse
 */
function setReceiptAlterraInfo(data, hasHeaderLineSeparator, hasHeader, hasSummary, hasFooter, hasFooterLineSeparator) {
    console.log("Data receipt alterra");
    console.log(data);
    var printAlterraReceipt = parseBoolean(getConfigValue("PRINT_ALTERRA_RECEIPT"));
    console.log(printAlterraReceipt);
    if (printAlterraReceipt) {
        var alterraInfo = new Array();
        var wrapLength = parseInt(getMsgValue('pos_receipt_max_length')) - RECEIPT_DBL_SPACE.length;

        try {
            if (hasHeaderLineSeparator)
                alterraInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, lineSeparator2));
            if (hasHeader) {
                var sign = (data.saleType == CONSTANTS.TX_TYPES.RETURN.name ? "-" : "");
                alterraInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem(RECEIPT_DBL_SPACE + getConfigValue('RECEIPT_ALTERRA_TOTAL_LBL'), numberWithCommas(data.totalAmount), sign)));
            }
            if (hasSummary) {
                alterraInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, ""));

                var refTxItem = data.refTxItem;
                var item = data.alterraItem;

                if (data.refTxItem)
                    alterraInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setAlterraResLineItem(refTxItem.shortDesc, numberWithCommas(refTxItem.priceUnit))));

                if (item.transactionType.toUpperCase() == "CHANGE") {
                    alterraInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setAlterraResLineItem(getConfigValue('RECEIPT_ALTERRA_NEW_PHONE_NO_LBL'), item.phoneNum)));
                } else {
                    alterraInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setAlterraResLineItem(getConfigValue('RECEIPT_ALTERRA_PHONE_NO_LBL'), item.phoneNum)));
                }

                alterraInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setAlterraResLineItem(getConfigValue('RECEIPT_ALTERRA_ID_LBL'), item.serverTrxId)));
                alterraInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setAlterraResLineItem(getConfigValue('RECEIPT_ALTERRA_TR_NO_LBL'), item.partnerTrxId)));

                if (item.productId)
                    alterraInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setAlterraResLineItem(getConfigValue('RECEIPT_ALTERRA_PRODUCT_ID_LBL'), item.productId)));

                alterraInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setAlterraResLineItem(getConfigValue('RECEIPT_ALTERRA_STATUS_CODE_LBL'), item.resCode)));
                alterraInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setAlterraResLineItem(getConfigValue('RECEIPT_ALTERRA_STATUS_LBL'), item.scrMessage)));

                if (item.resMessage)
                    alterraInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setAlterraResLineItem(getConfigValue('RECEIPT_ALTERRA_RES_MSG_LBL'), item.resMessage)));
            }
            if (hasFooter) {
                alterraInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, ""));
                wrapText(alterraInfo, getConfigValue('RECEIPT_ALTERRA_FOOTER_LBL'), wrapLength, true);
            }

            if (hasFooterLineSeparator)
                alterraInfo.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, lineSeparator2));
        } catch (err) {
            uilog("DBUG", "Problem with receipt alterra info caused by:" + err.message);
        }

        console.log(alterraInfo);
        return alterraInfo;
    } else {
        return null;
    }
}

/**
 * Collates all receipt items for printing receipt.
 * @Param header
 * @Param footer
 * @Param txDetail
 * @Param summary
 * @Param topUpInfo
 * @Param indosmartInfo
 * @Param body
 */
var printReceipt = function(p) {
    if (!suppressPrinting) {
        var dataToPrint = new Object();
        if (p.header && p.header.length > 0)
            dataToPrint.header = p.header;
        if (p.txDetail && p.txDetail.length > 0)
            dataToPrint.txDetail = p.txDetail;
        if (p.title && p.title.length > 0)
            dataToPrint.title = p.title;
        if (p.body && p.body.length > 0)
            dataToPrint.body = p.body;
        if (p.summary && p.summary.length > 0)
            dataToPrint.summary = p.summary;
        if (p.topUpInfo && p.topUpInfo.length > 0)
            dataToPrint.topUpInfo = p.topUpInfo;
        if (p.indosmartInfo && p.indosmartInfo.length > 0)
            dataToPrint.indosmartInfo = p.indosmartInfo;
        if (p.mCashInfo && p.mCashInfo.length > 0)
            dataToPrint.mCashInfo = p.mCashInfo;
        if (p.alterraInfo && p.alterraInfo.length > 0)
            dataToPrint.alterraInfo = p.alterraInfo;
        if (p.footerSummary && p.footerSummary.length > 0)
            dataToPrint.footerSummary = p.footerSummary;
        if (p.footer && p.footer.length > 0)
            dataToPrint.footer = p.footer;
        if (p.mktInfo && p.mktInfo.length > 0)
            dataToPrint.mktInfo = p.mktInfo;
        if (p.freeParking && p.freeParking.length > 0)
            dataToPrint.freeParking = p.freeParking;
        if (p.ovo && p.ovo.length > 0)
            dataToPrint.ovo = p.ovo;
        // uilog("DBUG","dataToPrint.freeParking: " + JSON.stringify(dataToPrint.freeParking));
        if (p.qrtts && p.qrtts.length > 0)
            dataToPrint.qrtts = p.qrtts;
        if (p.kidcity)
            dataToPrint.kidcity = p.kidcity;
        if (p.mlc && p.mlc.length > 0)
            dataToPrint.mlc = p.mlc;
        if (p.altoWC && p.altoWC.length > 0)
            dataToPrint.altoWC = p.altoWC;
        if (p.ppp && p.ppp.length > 0)
            dataToPrint.ppp = p.ppp;
        if (p.voucherData) // INHOUSE VOUCHER 2017-04-13
            dataToPrint.voucherData = p.voucherData; // INHOUSE VOUCHER 2017-04-13
        if (p.specialOrder)
            dataToPrint.specialOrder = p.specialOrder;
        if (p.balloonGame && p.balloonGame.length > 0)
            dataToPrint.balloonGame = p.balloonGame;
        if (p.eftOnline && p.eftOnline.length > 0)
            dataToPrint.eftOnline = p.eftOnline;
        if (p.eftSettlementAll && p.eftSettlementAll.length > 0)
            dataToPrint.eftSettlementAll = p.eftSettlementAll;
        if (p.eftTransactionSummaryData && p.eftTransactionSummaryData.length > 0)
            dataToPrint.eftTransactionSummaryData = p.eftTransactionSummaryData;
        if (p.eftDetailTransactionReport && p.eftDetailTransactionReport.length > 0)
            dataToPrint.eftDetailTransactionReport = p.eftDetailTransactionReport;
        if (p.isHypercashPrint && p.isHypercashPrint === true)
            dataToPrint.isHypercashPrint = true;
        if (p.couponData && p.couponData.length > 0)
            dataToPrint.couponData = p.couponData;
        if (p.copyTrk && p.copyTrk.length > 0)
            dataToPrint.copyTrk = p.copyTrk;
        if (p.isInstallmentTransaction) {
            var isNonGoodsTxType = CONSTANTS.NON_GOODS_TX_TYPES.findTxTypeByName(saleTx.txType);
            dataToPrint.isInstallmentTransaction = {
                isInstallmentTransaction: p.isInstallmentTransaction,
                header: setReceiptHeader(saleTx),
                title: setReceiptTitle(getMsgValue('pos_receipt_duplicated_receipt')),
                txDetail: setReceiptTxDetails(saleTx),
                body: (isNonGoodsTxType) ?
                    setPaymentReceiptItems(saleTx.payments, { currency: "Rp" }) : setReceiptItems(saleTx,
                        saleTx.orderItems, { currency: "Rp" },saleTx.transactionId),
                summary: setReceiptSummary(saleTx),
                topUpInfo: setReceiptTopUpInfo(topUpTempObj, true, true, true, true, true),
                indosmartInfo: setReceiptIndosmartInfo(indosmartTempObj, true, true, true, true, true),
                footerSummary: setReceiptFooterSummary(saleTx),
                footer: setReceiptFooter(saleTx),
                //mktInfo   : setReceiptMarketingPromoInfo (saleTx),
                printTo: printTo
            };
        }

        // if (printTo == "N" || printTo == "E"){
        // 	dataToPrint.logOnly = true;
        // }else{
        // 	dataToPrint.logOnly = false;
        // }

        dataToPrint.printTo = printTo;

        if (p.logOnly && p.logOnly === true) {
            dataToPrint.logOnly = true;
        }
        if (p.isQueued && p.isQueued === true) {
            isPrinting = !(p.logOnly); //should only be set to true if not log only
            dataToPrint.isQueued = true;
        }
        console.log("dataToPrint");
        console.log(JSON.stringify(dataToPrint));
        console.log("dataToPrint");
        console.log(dataToPrint);
        $.ajax({
            url: 'http://localhost:8089/printReceipt',
            type: 'POST',
            dataType: "json",
            async: false,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(dataToPrint),
            success: function(data) {

                if (!dataToPrint.logOnly && dataToPrint.printTo == "P") {
                    showPrintingMessage();
                }
                uilog('DBUG', 'Print Success:');
            },
            error: function(status, error) {
                showMsgDialog(getMsgValue('pos_error_msg_print_failure'), "error");
            }
        });
    }
};

/**
 * print document receipt from the back of receipt.
 * @param p - data to be printed
 */
var printDocument = function(p) {
    $.ajax({
        url: 'http://localhost:8089/printDocument',
        type: 'POST',
        dataType: "json",
        data: JSON.stringify(p),
        success: function(data) {
            uilog('DBUG', 'Print Success');
        },
        error: function(status, error) {
            showMsgDialog(getMsgValue('pos_error_msg_print_doc_failure'), "error");
        }
    });
};

/********************************
 * Setter functions that are added
 * on the parts of receipts.
 *********************************/
/**
 * Sets type of tx of the receipt for printing. for Return and Refund Tx
 * @returns {Array}
 */
function setReceiptTitle(type) {
    var description = [];
    if (type instanceof Array) {
        for (var i = 0; i < type.length; i++) {
            if (i == (type.length - 1)) {
                description.push(type[i] + "\n");
            } else {
                description.push(type[i]);
            }
        }
    } else {
        description.push(new PrintBlock(RECEIPT_POS_CENTERED, type + "\n"));
    }
    return description;
}

/**
 * Set WRAPPED Line item Desc and price subtotal of the scanned item.
 * Add additional symbols based on transaction type.
 * @param tx - the sale transaction
 * @param item - scanned item
 * @return the wrapped line item - return confirmed
 */
function setWrappedLineItemDesc(tx, item) {

    var identifierStrBldr = new StringBuilder("");
    // Adds (-) sign on item if it is a void item
    identifierStrBldr.append((item.categoryId == 'MVOUCHER') ? '-' : displayNegativeSign(tx, item.isVoided)); // INHOUSE VOUCHER 2017-04-13
    // Adds Tax symbol (*) if item/product has tax inclusive.
    identifierStrBldr.append(displayTaxSign(item.isTaxInclusive));

    var itemTotal = item.priceSubtotal;

    if (item.weight) {
        itemTotal = Math.round(itemTotal);
    }

    return wrapLineItem(
        ((item.categoryId == 'DEPTSTORE') ? item.ean13Code.substring(1, 5) + ',' + item.ean13Code.substring(5, 7) + ',' : '') + item.shortDesc,
        numberWithCommas(itemTotal),
        identifierStrBldr.toString());
}

/**
 * Set Line item with quantity and unit price of the scanned item.
 * @param item - scanned item
 * @return lineItemPrice - return confirmed
 */
function setLineItemPrice(item) {
    var lineItemPrice = new StringBuilder("");

    if (item.categoryId == 'MVOUCHER') return ""; // INHOUSE VOUCHER 2017-04-13

    lineItemPrice.append(item.quantity);
    lineItemPrice.append((item.categoryId == 'DEPTSTORE') ? '@ ' : getMsgValue("pos_receipt_multiply_symbol"));
    lineItemPrice.append(numberWithCommas(item.priceUnit));

    var itemPrice = lineItemPrice.toString();
    var padLength = 39 - itemPrice.length;
    for (var i = 0; i < padLength; i++)
        itemPrice += RECEIPT_SPACE;
    return itemPrice;
}

/**
 * Set Line item Desc and price subtotal of the scanned item.
 * Add additional symbols based on transaction type.
 * @param item - scanned item
 * @return lineItemDesc - return confirmed
 */
function setLineItemGC(gcInfo) {

    var gcMaskedCardNumber = maskValueWithX(gcInfo.cardNumber, 11, 'LAST');
    var gcNumberLabel = getMsgValue('pos_receipt_giftcard_number_label') + gcMaskedCardNumber;
    var lineItemGC = new StringBuilder("");
    lineItemGC.append(buildLineItem({
        left: gcNumberLabel,
        right: "",
        pad: addSpaces(gcNumberLabel, "")
    }));
    return lineItemGC.toString();
}


/**
 * Set line summary item for topup info.
 * @param label - label of the value/amount
 * @param val - description or the amount to be printed
 * @returns {String} - the line item to be printed.
 */
function setTopUpResLineItem(label, val) {
    label = RECEIPT_DBL_SPACE + label;

    return wrapLineItem(label, val, "");
}

/**
 * Set line summary item for topup info.
 * @param label - label of the value/amount
 * @param val - description or the amount to be printed
 * @returns {String} - the line item to be printed.
 */
function setIndosmartResLineItem(label, val) {
    label = RECEIPT_DBL_SPACE + label;

    return wrapLineItem(label, val, "");
}

/**
 * Set line summary item for topup info.
 * @param label - label of the value/amount
 * @param val - description or the amount to be printed
 * @returns {String} - the line item to be printed.
 */
function setMCashResLineItem(label, val) {
    label = RECEIPT_DBL_SPACE + label;

    return wrapLineItem(label, val, "");
}

/**
 * Set line summary item for topup info.
 * @param label - label of the value/amount
 * @param val - description or the amount to be printed
 * @returns {String} - the line item to be printed.
 */
function setAlterraResLineItem(label, val) {
    label = RECEIPT_DBL_SPACE + label;

    return wrapLineItem(label, val, "");
}

/**
 * Set line summary item like, total, change etc.
 * @param label - label of the value/amount
 * @param val - description or the amount to be printed
 * @param type - if not null displays negative symbol for selected tx type.
 * @returns {String} - the line item to be printed.
 */
function setLineSummaryItem(label, val, type, doubleHeight) {
    var lineItem = new StringBuilder("");
    var maxlength = (doubleHeight) ? 28 : undefined;
    //console.log("doubleHeight");
    //console.log(doubleHeight);
    //Add tab space to indent summary details
    label = ((doubleHeight) ? RECEIPT_SPACE : RECEIPT_DBL_SPACE) + label;

    lineItem.append(buildLineItem({
        left: label,
        right: val,
        pad: addSpaces(label, val, maxlength)
    }));

    if (type &&
        type == CONSTANTS.TX_TYPES.SALE_VOID.name ||
        type == CONSTANTS.TX_TYPES.CANCEL_SALE.name ||
        type == CONSTANTS.TX_TYPES.RETURN.name ||
        type == CONSTANTS.TX_TYPES.REFUND.name) {
        lineItem.append(getMsgValue('pos_receipt_negative_symbol'));
    }
    //console.log("lineItem");
    //console.log(lineItem);
    return lineItem.toString();
}

/**
 * Wrapping enabled counterpart of setLineSummaryItem()
 * @param label
 * @param val
 * @param tx
 * @returns
 */
function setWrappedLineSummaryItem(label, val, tx) {
    var identifier = displayNegativeSign(tx);
    return wrapLineItem(label, val, identifier, RECEIPT_DBL_SPACE);
}

/**
 * Wrapping enabled line summary
 * @param summary
 * @returns
 */
function setWrappedLineSummary(summary) {
    var splittedString = prefixedSplit(summary.trim(), CONSTANTS.PRINT_FIELD_CONFIG.MAX_LABEL.cap, "\n", true, null);
    return splittedString;
}

function setReceiptFreeParking(tx) {
    var freeParking = null;
    if (tx.freeParkingGiven) {
        var separator = "--  --  --  --  --  --  --  --  --  --";
        try {
            if (tx.freeParkingGiven == 0) {
                return freeParking;
            }
            freeParking = new Array();
            var dateTime = tx.transactionDate || new Date();
            var txDateTime = new Date(dateTime);
            /*if(!isDatesTheSame(new Date(), txDateTime))
            	txDateTime = utcDateToLocalTime(txDateTime);*/
            var txTimeStr = formatTime(txDateTime);
            var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);

            freeParking.push(new PrintBlock(RECEIPT_POS_CENTERED, separator));
            freeParking.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            freeParking.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            if (tx.freeParkingGiven == 1) {
                freeParking.push(new PrintBlock(RECEIPT_POS_CENTERED, getConfigValue("FREE_PARKING_CAR")));
            } else if (tx.freeParkingGiven == 2) {
                freeParking.push(new PrintBlock(RECEIPT_POS_CENTERED, getConfigValue("FREE_PARKING_MOTOR")));
            }
            freeParking.push(new PrintBlock(RECEIPT_POS_CENTERED, getConfigValue("FREE_PARKING_MSG")));

            //NEW FREE PARKING "WORDING" start
            //			var subTotalAmount = tx.totalAmount - getTotalDiscount(tx);
            //			freeParking.push("TOTAL: "+numberWithCommas(subTotalAmount));
            //			freeParking.push(getConfigValue("FREE_PARKING_MSG"));
            //			freeParking.push("MINIMAL BELANJA RP."+numberWithCommas(getConfigValue("FREE_PARKING_CAR_MIN_AMT"))+" UNTUK MOBIL");
            //			freeParking.push("MINIMAL BELANJA RP."+numberWithCommas(getConfigValue("FREE_PARKING_MOTOR_MIN_AMT"))+" UNTUK MOTOR");
            //NEW FREE PARKING "WORDING" end

            // #80087
            setPosTerminalDetails(tx, freeParking, false);
            // freeParking.push(setPosTerminalDetails(tx));
            freeParking.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_time_label') + txTimeStr + " " +
                getMsgValue('pos_receipt_date_label') + txDate));
            freeParking.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            freeParking.push(new PrintBlock(RECEIPT_POS_CENTERED, separator));
        } catch (err) {
            uilog("DBUG", "Error on receipt free parking caused by:" + err.message);
        }
    }

    return freeParking;
}

function setReceiptSpecialOrder(tx) { // RAHMAT SPO
    var specialOrder = null;
    if (tx.spcOrder.length > 0) {
        var separator = "--  --  --  --  --  --  --  --  --  --";
        try {
            specialOrder = new Array();
            var dateTime = tx.transactionDate || new Date();
            var txDateTime = new Date(dateTime);
            var txTimeStr = formatTime(txDateTime);
            var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);

            specialOrder.push(new PrintBlock(RECEIPT_POS_CENTERED, separator));
            specialOrder.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            specialOrder.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));

            // #80087
            setPosTerminalDetails(tx, specialOrder, false);
            // specialOrder.push(setPosTerminalDetails(tx));
            specialOrder.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_time_label') + txTimeStr + " " + getMsgValue('pos_receipt_date_label') + txDate));
            specialOrder.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            specialOrder.push(new PrintBlock(RECEIPT_POS_CENTERED, separator));
        } catch (err) {
            uilog("DBUG", "Error on receipt special order caused by:" + err.message);
        }
    }

    return specialOrder;
}
// print MLC details

function setReceiptMLC(tx) {
    var receiptMLC = null;
    if (tx.mlcReffNo) {
        //console.log(saleTx.payments);
        //console.log(tx.payments[0].MLCPayment.acntNo);
        //console.log(tx.payments[0].MLCPayment.amount);
        //console.log(tx.payments[0].MLCPayment.approvalCode);
        var separator = "--  --  --  --  --  --  --  --  --  --";
        try {
            receiptMLC = new Array();
            var dateTime = tx.transactionDate || new Date();
            var txDateTime = new Date(dateTime);
            var maxLength = 40;
            /*if(!isDatesTheSame(new Date(), txDateTime))
            	txDateTime = utcDateToLocalTime(txDateTime);*/
            var txTimeStr = formatTime(txDateTime);
            var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);

            //receiptMLC.push(new PrintBlock(RECEIPT_POS_CENTERED, separator));
            receiptMLC.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            receiptMLC.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));

            //receiptMLC.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, "ACNT NO.: " + tx.payments[0].MLCPayment.acntNo));
            //receiptMLC.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, "MEGA SMARTPAY: " + tx.payments[0].MLCPayment.amount));
            //receiptMLC.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, "APPROVAL CODE: " + tx.payments[0].MLCPayment.approvalCode));

            receiptMLC.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem('ACNT NO.',
                tx.payments[0].MLCPayment.acntNo,
                '')));
            receiptMLC.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem('QRIS:',
                numberWithCommas(tx.payments[0].MLCPayment.amount),
                '')));
            receiptMLC.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem('APPROVAL CODE:',
                tx.payments[0].MLCPayment.approvalCode,
                '')));
            // CR MLC ADD SIGN
            receiptMLC.push(newLine());
            receiptMLC.push(newLine());
            receiptMLC.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('pos_receipt_eft_signature') + Array((maxLength - (getMsgValue('pos_receipt_eft_signature')).length) + 1).join('_')));
            receiptMLC.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('pos_receipt_mlc_agreement')));
            // CR MLC ADD SIGN

            // #80087
            setPosTerminalDetails(tx, receiptMLC, false);
            // freeParking.push(setPosTerminalDetails(tx));
            receiptMLC.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_time_label') + txTimeStr + " " +
                getMsgValue('pos_receipt_date_label') + txDate));
            receiptMLC.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            receiptMLC.push(new PrintBlock(RECEIPT_POS_CENTERED, separator));
        } catch (err) {
            uilog("DBUG", "Error on receipt MLC caused by:" + err.message);
        }
    }

    return receiptMLC;
}

function setReceiptOVO(tx) {
    var receiptOVO = null;
    if (tx.ovorefNo) {
        var separator = "--  --  --  --  --  --  --  --  --  --";
        try {
            receiptOVO = new Array();
            var dateTime = tx.transactionDate || new Date();
            var txDateTime = new Date(dateTime);
            var maxLength = 40;

            var txTimeStr = formatTime(txDateTime);
            var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);

            receiptOVO.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            receiptOVO.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));

            receiptOVO.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem('REF NO.',
                tx.payments[0].OVOPayment.refNo,
                '')));
            receiptOVO.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem('OVO:',
                numberWithCommas(tx.payments[0].OVOPayment.amount),
                '')));
            receiptOVO.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem('APPROVAL CODE:',
                tx.payments[0].OVOPayment.retrievalReferenceNumber,
                '')));
            // CR OVO ADD SIGN
            receiptOVO.push(newLine());
            receiptOVO.push(newLine());
            receiptOVO.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('pos_receipt_eft_signature') + Array((maxLength - (getMsgValue('pos_receipt_eft_signature')).length) + 1).join('_')));
            receiptOVO.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, "I AGREE TO PAY THE ABOVE TOTAL AMOUNT\nACCORDING TO THE OVO PAY AGREEMENT"));
            // CR OVO ADD SIGN

            // #80087
            setPosTerminalDetails(tx, receiptOVO, false);

            receiptOVO.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_time_label') + txTimeStr + " " +
                getMsgValue('pos_receipt_date_label') + txDate));
            receiptOVO.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            receiptOVO.push(new PrintBlock(RECEIPT_POS_CENTERED, separator));
        } catch (err) {
            uilog("DBUG", "Error on receipt OVO caused by:" + err.message);
        }
    }

    return receiptOVO;
}

function setReceiptQrtts(tx) {
    var receiptQrtts = null;
    if (tx.qrtts) {
        //console.log(saleTx.payments);
        //console.log(tx.payments[0].MLCPayment.acntNo);
        //console.log(tx.payments[0].MLCPayment.amount);
        //console.log(tx.payments[0].MLCPayment.approvalCode);
        var separator = "--  --  --  --  --  --  --  --  --  --";
        try {
            receiptQrtts = new Array();
            var dateTime = tx.transactionDate || new Date();
            var txDateTime = new Date(dateTime);
            var maxLength = 40;
            /*if(!isDatesTheSame(new Date(), txDateTime))
            	txDateTime = utcDateToLocalTime(txDateTime);*/
            var txTimeStr = formatTime(txDateTime);
            var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);

            //receiptQrtts.push(new PrintBlock(RECEIPT_POS_CENTERED, separator));
            receiptQrtts.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            receiptQrtts.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));

            //receiptQrtts.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, "ACNT NO.: " + tx.payments[0].MLCPayment.acntNo));
            //receiptQrtts.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, "MEGA SMARTPAY: " + tx.payments[0].MLCPayment.amount));
            //receiptQrtts.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, "APPROVAL CODE: " + tx.payments[0].MLCPayment.approvalCode));

            receiptQrtts.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem('KEY NO:',
                tx.qrtts.keyNo,
                '')));
            receiptQrtts.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem('CUSTOMER ID:',
                tx.qrtts.customerId,
                '')));
            receiptQrtts.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem('AMOUNT:',
                tx.qrtts.topupAmount,
                '')));
            // CR MLC ADD SIGN
            receiptQrtts.push(newLine());
            receiptQrtts.push(newLine());
            receiptQrtts.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('pos_receipt_eft_signature') + Array((maxLength - (getMsgValue('pos_receipt_eft_signature')).length) + 1).join('_')));
            receiptQrtts.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('pos_receipt_mlc_agreement')));
            // CR MLC ADD SIGN

            // #80087
            setPosTerminalDetails(tx, receiptQrtts, false);
            // freeParking.push(setPosTerminalDetails(tx));
            receiptQrtts.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_time_label') + txTimeStr + " " +
                getMsgValue('pos_receipt_date_label') + txDate));
            receiptQrtts.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            receiptQrtts.push(new PrintBlock(RECEIPT_POS_CENTERED, separator));
        } catch (err) {
            uilog("DBUG", "Error on receipt MLC caused by:" + err.message);
        }
    }

    return receiptQrtts;
}

function setReceiptPPP(tx) {
    var receiptPPP = null;
    var shouldPrintPPP = false;
    saleTx.payments.forEach(function(el) {
        if (el["PPP"] !== null && el["PPP"] !== undefined) {
            shouldPrintPPP = true;
        }
    });
    if (shouldPrintPPP === true) {
        var separator = "--  --  --  --  --  --  --  --  --  --";
        try {
            receiptPPP = new Array();
            var dateTime = tx.transactionDate || new Date();
            var txDateTime = new Date(dateTime);
            var maxLength = 40;
            var txTimeStr = formatTime(txDateTime);
            var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);

            receiptPPP.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            receiptPPP.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            receiptPPP.push(newLine());
            receiptPPP.push(newLine());
            // receiptPPP.push(newLine());
            if (InfoloyaltyProgram.earnedPoint === null || InfoloyaltyProgram.earnedPoint === undefined || InfoloyaltyProgram.earnedPoint.toString().trim() === '') {
                InfoloyaltyProgram.earnedPoint = 0;
            }
            receiptPPP.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem('Member Name: ',
                InfoloyaltyProgram.memberName.toString(),
                '')));
            receiptPPP.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem('Prev PTS: ',
                parseFloat(InfoloyaltyProgram.balancePoint) - parseFloat(InfoloyaltyProgram.earnedPoint) + parseFloat(tx.pppTotalPoint),
                '')));
            receiptPPP.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem('Earned PTS: ',
                parseFloat(InfoloyaltyProgram.earnedPoint).toString(),
                '')));
            receiptPPP.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem('Used PTS: ',
                tx.pppTotalPoint,
                '')));
            receiptPPP.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem('Balance PTS: ',
                parseFloat(InfoloyaltyProgram.balancePoint),
                '')));
            receiptPPP.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem('Total Amt: ',
                numberWithCommas(tx.pppTotalAmount),
                '')));
            setPosTerminalDetails(tx, receiptPPP, false);
            receiptPPP.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_time_label') + txTimeStr + " " +
                getMsgValue('pos_receipt_date_label') + txDate));
            receiptPPP.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            receiptPPP.push(new PrintBlock(RECEIPT_POS_CENTERED, separator));
        } catch (err) {
            uilog("DBUG", "Error on receipt PPP Payment caused by:" + err.message);
        }
    }

    return receiptPPP;
}

function setReceiptAltoWC(tx) {
    var receiptALTOWC = null;
    if (tx.altoWCReffNo) {
        //console.log(saleTx.payments);
        //console.log(tx.payments[0].MLCPayment.acntNo);
        //console.log(tx.payments[0].MLCPayment.amount);
        //console.log(tx.payments[0].MLCPayment.approvalCode);
        var separator = "--  --  --  --  --  --  --  --  --  --";
        try {
            receiptALTOWC = new Array();
            var dateTime = tx.transactionDate || new Date();
            var txDateTime = new Date(dateTime);
            var maxLength = 40;
            /*if(!isDatesTheSame(new Date(), txDateTime))
            	txDateTime = utcDateToLocalTime(txDateTime);*/
            var txTimeStr = formatTime(txDateTime);
            var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);

            //receiptALTOWC.push(new PrintBlock(RECEIPT_POS_CENTERED, separator));
            receiptALTOWC.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            receiptALTOWC.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            receiptALTOWC.push(newLine());
            receiptALTOWC.push(newLine());
            receiptALTOWC.push(newLine());

            //receiptALTOWC.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, "ACNT NO.: " + tx.payments[0].ALTOWECHAT.acntNo));
            //receiptALTOWC.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, "MEGA SMARTPAY: " + tx.payments[0].ALTOWECHAT.amount));
            //receiptALTOWC.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, "APPROVAL CODE: " + tx.payments[0].ALTOWECHAT.approvalCode));

            // receiptALTOWC.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem('ACNT NO.',
            //                                                           tx.payments[0].ALTOWECHAT.acntNo,
            //                                                           '')));
            receiptALTOWC.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem("ALTO QR PAY",
                numberWithCommas(tx.payments[0].ALTOWECHAT.amount),
                '')));
            receiptALTOWC.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrapLineItem('APPROVAL CODE:',
                tx.payments[0].ALTOWECHAT.approvalCode,
                '')));
            // receiptALTOWC.push(newLine());
            // receiptALTOWC.push(newLine());
            // receiptALTOWC.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('pos_receipt_eft_signature') + Array((maxLength - (getMsgValue('pos_receipt_eft_signature')).length) +1).join('_')));
            // receiptALTOWC.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('pos_receipt_mlc_agreement')));

            // #80087
            setPosTerminalDetails(tx, receiptALTOWC, false);
            // freeParking.push(setPosTerminalDetails(tx));
            receiptALTOWC.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_time_label') + txTimeStr + " " +
                getMsgValue('pos_receipt_date_label') + txDate));
            receiptALTOWC.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            receiptALTOWC.push(new PrintBlock(RECEIPT_POS_CENTERED, separator));
        } catch (err) {
            uilog("DBUG", "Error on receipt ALTO WeChat/AliPay caused by:" + err.message);
        }
    }

    return receiptALTOWC;
}
// print MLC details
/**
 * Baloon game receipt to be printed.
 * @param tx
 * @returns {Array}
 */
function setReceiptBalloonGame(tx) {
    var redeemedBalloons = BALLOON_GAME.redeemedBalloons.get();

    var balloonGame = new Array();

    if (redeemedBalloons != null) {
        var separator = "--  --  --  --  --  --  --  --  --  --";
        try {
            var dateTime = tx.transactionDate || new Date();
            var txDateTime = new Date(dateTime);
            /*if(!isDatesTheSame(new Date(), txDateTime))
            	txDateTime = utcDateToLocalTime(txDateTime);*/
            var txTimeStr = formatTime(txDateTime);
            var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);

            balloonGame.push(new PrintBlock(RECEIPT_POS_CENTERED, separator));
            balloonGame.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            balloonGame.push(new PrintBlock(RECEIPT_POS_CENTERED, "BALLOON GAME REDEEMED ITEMS"));

            //Balloon Redeemed Items
            redeemedBalloons.forEach(function(entry) {
                balloonGame.push(new PrintBlock(RECEIPT_POS_CENTERED, entry.balloonItemDesc.toUpperCase()));
                balloonGame.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            });

            setPosTerminalDetails(tx, balloonGame, false);
            balloonGame.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_time_label') + txTimeStr + " " +
                getMsgValue('pos_receipt_date_label') + txDate));
            balloonGame.push(new PrintBlock(RECEIPT_POS_CENTERED, " "));
            balloonGame.push(new PrintBlock(RECEIPT_POS_CENTERED, separator));

        } catch (err) {
            uilog("DBUG", "Error on receipt balloongame caused by: " + err.message);
        }
    }

    // Set Balloon Game Redeemed items to Null
    BALLOON_GAME.redeemedBalloons.set(null);

    return balloonGame;
}

/**
 * sets eft online draft to print in the receipt.
 * @param saleTx
 * @param isMerchantCopy
 * @returns {Array}
 */
function setReceiptEftOnline(saleTx, isMerchantCopy) {
    var maxLength = 40,
        twoColMaxLength = maxLength / 2;
    var eftItem = new Array();

    //hotfix
    //eft online configurable for printing
    if (getConfigValue("EFT_PRINTING_ENABLE") === "true") {
        $.each(saleTx.payments, function(index, payment) {
            if (payment.paymentMediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name &&
                saleTx.type == CONSTANTS.TX_TYPES.SALE.name) {
                var eftTransactionType = getDescriptionFromEnumByCode(payment.eftData.transactionCode, 'EFT_TX_CD');

                if (!isMerchantCopy) {
                    eftItem.push(
                        new PrintBlock(RECEIPT_POS_JUSTIFIED, Array((maxLength - ("").length) + 1).join('-')));
                }
                eftItem.push(
                    new PrintBlock(RECEIPT_POS_CENTERED, payment.eftData.bankName));

                eftItem.push(
                    new PrintBlock(RECEIPT_POS_JUSTIFIED,
                        printKeyValueItem(
                            getMsgValue('pos_receipt_eft_terminal_id'), maskValueWithX(payment.eftData.terminalId, 4, 'BEGIN'), maxLength
                        )));
                eftItem.push(
                    new PrintBlock(RECEIPT_POS_JUSTIFIED,
                        printKeyValueItem(
                            getMsgValue('pos_receipt_eft_merchant_id'), maskValueWithX(payment.eftData.merchantId, 10, 'BEGIN'), maxLength
                        )));
                if (isMerchantCopy) {
                    eftItem.push(
                        new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printKeyValueItem(
                                getMsgValue('pos_receipt_eft_store_code'), saleTx.storeCd, maxLength
                            )));
                    eftItem.push(
                        new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printKeyValueItem(
                                getMsgValue('pos_receipt_eft_transaction_id'), saleTx.transactionId, maxLength
                            )));
                }

                eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getCardType(payment.eftData.cardNum, creditCardType)));
                eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, payment.eftData.cardNum));
                eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, payment.eftData.cardHolder));

                eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, eftTransactionType));
                //two column format
                eftItem.push(
                    new PrintBlock(RECEIPT_POS_JUSTIFIED,
                        printColumn(
                            printSameLengthLabel(getMsgValue('pos_receipt_eft_date'), 5), payment.eftData.transactionDate, twoColMaxLength) +
                        printColumn(
                            printSameLengthLabel(getMsgValue('pos_receipt_eft_time'), 6), formatDateTime(payment.eftData.transactionTime), twoColMaxLength, RECEIPT_POS_RIGHT)));
                eftItem.push(
                    new PrintBlock(RECEIPT_POS_JUSTIFIED,
                        printColumn(
                            printSameLengthLabel(getMsgValue('pos_receipt_eft_batch'), 5), payment.eftData.batchNum, twoColMaxLength) +
                        printColumn(
                            printSameLengthLabel(getMsgValue('pos_receipt_eft_trace'), 6), payment.eftData.traceNum, twoColMaxLength, RECEIPT_POS_RIGHT)));
                eftItem.push(
                    new PrintBlock(RECEIPT_POS_JUSTIFIED,
                        printColumn(
                            printSameLengthLabel(getMsgValue('pos_receipt_eft_rref'), 5), payment.eftData.referenceCode, twoColMaxLength) +
                        printColumn(
                            printSameLengthLabel(getMsgValue('pos_receipt_eft_approval'), 6), payment.eftData.approvalCode, twoColMaxLength, RECEIPT_POS_RIGHT)));
                //hotfix
                if (isMerchantCopy) {
                    eftItem.push(
                        new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printColumn(
                                printSameLengthLabel(getMsgValue('pos_receipt_eft_appl_id'), 10), payment.eftData.applId, maxLength)));
                    eftItem.push(
                        new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printColumn(
                                printSameLengthLabel(getMsgValue('pos_receipt_eft_appl_name'), 10), payment.eftData.applName, maxLength)));
                    eftItem.push(
                        new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printColumn(
                                printSameLengthLabel(getMsgValue('pos_receipt_eft_appl_crypt'), 10), payment.eftData.applCrypt, maxLength)));
                    eftItem.push(
                        new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printColumn(
                                printSameLengthLabel(getMsgValue('pos_receipt_eft_tvr'), 10), payment.eftData.tvr, maxLength)));
                }

                /*MEGA PAY Details*/
                if (eftTransactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.MEGA_PAY.desc) {
                    eftItem.push(
                        new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printKeyValueItem(
                                getMsgValue('pos_receipt_eft_period'), payment.eftData.period + getMsgValue('pos_receipt_eft_month'), maxLength
                            )));
                    eftItem.push(
                        new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printKeyValueItem(
                                getMsgValue('pos_receipt_eft_interest_rate'), payment.eftData.interestRate + getMsgValue('pos_receipt_eft_percent_symbol'), maxLength
                            )));

                    eftItem.push(
                        new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printColumn(
                                printSameLengthLabel(getMsgValue('pos_receipt_eft_first_installment_amount'), 14), "", twoColMaxLength) +
                            printColumn(
                                "", getMsgValue('pos_receipt_currency_symbol') + " " + numberWithCommas(payment.eftData.firstInstallment), twoColMaxLength, RECEIPT_POS_RIGHT)));
                    /*MEGA POINT Details*/
                } else if (eftTransactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.MEGA_POINT.desc) {
                    var redeemPoint = (parseInt(payment.eftData.openingPoint) - parseInt(payment.eftData.availablePoint)).toString();
                    eftItem.push(
                        new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printKeyValueItem(
                                getMsgValue('pos_receipt_eft_redeem_ref'), payment.eftData.redeemReference, maxLength
                            )));
                    eftItem.push(
                        new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printKeyValueItem(
                                getMsgValue('pos_receipt_eft_catalog_code'), payment.eftData.catalogCode, maxLength
                            )));
                    eftItem.push(
                        new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printKeyValueItem(
                                getMsgValue('pos_receipt_eft_opening_point'), payment.eftData.openingPoint, maxLength
                            )));
                    eftItem.push(
                        new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printKeyValueItem(
                                getMsgValue('pos_receipt_eft_redeem_point'), redeemPoint, maxLength
                            )));
                    eftItem.push(
                        new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printKeyValueItem(
                                getMsgValue('pos_receipt_eft_available_point'), payment.eftData.availablePoint, maxLength
                            )));
                    eftItem.push(
                        new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printKeyValueItem(
                                getMsgValue('pos_receipt_eft_amount_for_point'), numberWithCommas(payment.eftData.amountForPoint), maxLength
                            )));
                    eftItem.push(
                        new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            printKeyValueItem(
                                getMsgValue('pos_receipt_eft_amount_for_sale'), numberWithCommas(payment.eftData.amountForSale), maxLength
                            )));
                }

                eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED,
                    printKeyValueItem(
                        getMsgValue('pos_receipt_eft_total_amount'), getMsgValue('pos_receipt_eft_currency') + numberWithCommas(removeLeadingZeroes(payment.eftData.transactionAmount)), maxLength
                    )
                ));
                eftItem.push(newLine());
                eftItem.push(newLine());

                eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('pos_receipt_eft_signature') + Array((maxLength - (getMsgValue('pos_receipt_eft_signature')).length) + 1).join('_')));
                eftItem.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('pos_receipt_eft_agreement')));
                if (isMerchantCopy) {
                    eftItem.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_eft_merchant_copy')));
                }
            }
        });
    }
    //empty array
    if (eftItem.length == 0) {
        eftItem = null;
    }
    return eftItem;
}

/**
 * Set warranty items to be printed in receipt
 * @param tx - transaction details
 * @returns {*}
 */
function setDocumentWarrantyItem(tx) {
    var documentItem = null;
    if (tx) {
        var nA = "N/A";
        documentItem = new Array();

        var dateTime = tx.transactionDate || new Date();
        var txDateTime = new Date(dateTime);
        /*if(!isDatesTheSame(new Date(), txDateTime))
        	txDateTime = utcDateToLocalTime(txDateTime);*/
        var txTimeStr = formatTime(txDateTime);
        var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);
        var storeCd = tx.storeCd === undefined ? nA : removeLeadingZeroes(tx.storeCd);
        var terminalNum = configuration.terminalNum === undefined ? nA : removeLeadingZeroes(configuration.terminalNum);

        documentItem.push(txDate + "   " + txTimeStr + "   STORE:" + storeCd + "   POS:" + terminalNum + "   CASHIER:" + loggedInUsername);
        if (configuration.terminalType != 'DEPTSTORE') documentItem.push("              EXTRA WARRANTY");
        else documentItem.push("TRX ID: " + tx.transactionId);

    }
    return documentItem;
}

/**
 * Sodexo details to be printed.
 * @param tx
 * @returns {*}
 */
function setDocumentSodexo(tx) {
    var documentItem = null;
    if (tx) {
        var nA = "N/A";
        documentItem = new Array();
        var txId = tx.transactionId === undefined ? nA : removeLeadingZeroes(tx.transactionId);
        documentItem.push("              " + getMsgValue('pos_receipt_transaction_id_label') + txId);
    }
    return documentItem;
}

/**
 * 
 * 
RECEIPT FORMAT
Carrefour Lebak Bulus	
11/05/14 11:21 AM	
	
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


 * @param saleTx
 * @param footerSummary
 */

function setReceiptBillPayment(saleTx, footerSummary) {

    var dateTime = saleTx.billPaymentItem.transactionDate || new Date();
    var txDateTime = new Date(dateTime);
    /*if(!isDatesTheSame(new Date(), txDateTime))
    	txDateTime = utcDateToLocalTime(txDateTime);*/
    var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);
    var txTime = formatTimeAMPM(txDateTime);

    var txDateTime = new StringBuilder("");
    txDateTime.append(txDate);
    txDateTime.append(" ");
    txDateTime.append(txTime);

    var currency = "Rp. ";

    try {

        footerSummary.push(" ");
        footerSummary.push(RECEIPT_BILL_PAYMENT_DIVIDER);
        footerSummary.push(new PrintBlock(RECEIPT_POS_CENTERED, store.name));
        footerSummary.push(new PrintBlock(RECEIPT_POS_CENTERED, txDateTime.toString()));
        footerSummary.push(RECEIPT_BILL_PAYMENT_DIVIDER);
        footerSummary.push(" ");

        footerSummary.push(new PrintBlock(
            RECEIPT_POS_JUSTIFIED,
            setLineSummaryItem(
                getMsgValue('bp_label_receipt_contract_num'),
                saleTx.billPaymentItem.customerId)));

        footerSummary.push(new PrintBlock(
            RECEIPT_POS_JUSTIFIED,
            setWrappedLineSummaryItem(
                getMsgValue('bp_label_receipt_name'),
                saleTx.billPaymentItem.customerName),
            saleTx));

        footerSummary.push(new PrintBlock(
            RECEIPT_POS_JUSTIFIED,
            setWrappedLineSummaryItem(
                getMsgValue('bp_label_receipt_item_type'),
                (saleTx.billPaymentItem.itemType) ?
                saleTx.billPaymentItem.itemType :
                saleTx.billPaymentItem.customerInfo)));

        if (saleTx.billPaymentItem.policyNumber) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED,
                setWrappedLineSummaryItem(
                    getMsgValue('bp_label_receipt_policy_number'),
                    saleTx.billPaymentItem.policyNumber)));
        }
        //date of period

        footerSummary.push(new PrintBlock(
            RECEIPT_POS_JUSTIFIED,
            setLineSummaryItem(
                getMsgValue('bp_label_receipt_installment_period'),
                getMsgValue('bp_label_contract_period_months').format(saleTx.billPaymentItem.paymentPeriod))));

        footerSummary.push(new PrintBlock(
            RECEIPT_POS_JUSTIFIED,
            setLineSummaryItem(
                getMsgValue('bp_label_receipt_amount'),
                currency.concat(numberWithCommas(saleTx.billPaymentItem.netAmount).toString())
            )));

        footerSummary.push(new PrintBlock(
            RECEIPT_POS_JUSTIFIED,
            setLineSummaryItem(
                getMsgValue('bp_label_receipt_admin_fee'),
                currency.concat(numberWithCommas(saleTx.billPaymentItem.adminFee).toString())
            )));

        footerSummary.push(new PrintBlock(
            RECEIPT_POS_JUSTIFIED,
            setLineSummaryItem(
                getMsgValue('bp_label_receipt_charge'),
                currency.concat(numberWithCommas(saleTx.billPaymentItem.penaltyFee).toString())
            )));

        footerSummary.push(new PrintBlock(
            RECEIPT_POS_JUSTIFIED,
            setLineSummaryItem(
                getMsgValue('bp_label_receipt_total_amount'),
                currency.concat(numberWithCommas(saleTx.billPaymentItem.totalAmount).toString())
            )));
        /*
        footerSummary.push(new PrintBlock(
        		RECEIPT_POS_JUSTIFIED,
        		setLineSummaryItem(
        				getMsgValue('bp_label_receipt_payment_date'),
        				txDate)));
        */

        footerSummary.push(new PrintBlock(
            RECEIPT_POS_JUSTIFIED,
            setLineSummaryItem(
                getMsgValue('bp_label_receipt_reference_code'),
                saleTx.billPaymentItem.referenceCode)));

        footerSummary.push(" ");

    } catch (e) {
        uilog("DBUG", "Error in setting receipt bill payment")
    }
}

function setReceiptElebox(saleTx, footerSummary) {
    uilog("DBUG " + " setReceiptElebox");
    uilog("DBUG " + saleTx);
    var dateTime = new Date();
    var txDateTime = new Date(dateTime);
    /*if(!isDatesTheSame(new Date(), txDateTime))
    	txDateTime = utcDateToLocalTime(txDateTime);*/
    var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);
    var txTime = formatTimeAMPM(txDateTime);

    var txDateTime = new StringBuilder("");
    txDateTime.append(txDate);
    txDateTime.append(" ");
    txDateTime.append(txTime);
    var customer = saleTx.info;
    var dataCustomer = customer.split("\n");
    uilog('DBUG', saleTx.orderId);

    var currency = "Rp. ";
    try {

        footerSummary.push(" ");
        footerSummary.push(RECEIPT_ELEBOX_DIVIDER);
        footerSummary.push(new PrintBlock(RECEIPT_POS_CENTERED, store.name));
        footerSummary.push(new PrintBlock(RECEIPT_POS_CENTERED, txDateTime.toString()));
        footerSummary.push(RECEIPT_ELEBOX_DIVIDER);
        footerSummary.push(" ");

        footerSummary.push(new PrintBlock(
            RECEIPT_POS_CENTERED, setLineSummaryItem(
                getMsgValue('elebox_order_code'),
                saleTx.orderId)));

        footerSummary.push(" ");

        if (saleTx.acknow) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_CENTERED, saleTx.acknow));
        }

        if (dataCustomer[0]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_CENTERED, dataCustomer[0]));
        }

        if (dataCustomer[1]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_CENTERED, dataCustomer[1]));
        }

        if (dataCustomer[2]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_CENTERED, dataCustomer[2]));
        }

        if (dataCustomer[3]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_CENTERED, dataCustomer[3]));
        }

        if (dataCustomer[4]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_CENTERED, dataCustomer[4].replace(' TV/', '\nTV/')));
        }

        footerSummary.push(" ");

        if (dataCustomer[5]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[5]));
        }

        if (dataCustomer[6]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[6]));
        }

        if (dataCustomer[7]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[7]));
        }

        if (dataCustomer[8]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[8]));
        }

        if (dataCustomer[9]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[9]));
        }

        if (dataCustomer[10]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[10]));
        }

        if (dataCustomer[11]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[11]));
        }

        if (dataCustomer[12]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[12]));
        }

        if (dataCustomer[13]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[13]));
        }

        if (dataCustomer[14]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[14]));
        }

        if (dataCustomer[15]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[15]));
        }

        if (dataCustomer[16]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[16]));
        }

        if (dataCustomer[17]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[17]));
        }

        if (dataCustomer[18]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[18]));
        }

        if (dataCustomer[19]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[19]));
        }

        if (dataCustomer[20]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[20]));
        }

        if (dataCustomer[21]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[21]));
        }

        if (dataCustomer[22]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[22]));
        }

        if (dataCustomer[23]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[23]));
        }

        if (dataCustomer[24]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[24]));
        }

        if (dataCustomer[25]) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_JUSTIFIED, dataCustomer[25]));
        }
    } catch (e) {
        uilog("DBUG", "Error in setting receipt ELEBOX")
    }
}

function setReceiptEleboxAck(saleTx, footerSummary) {
    uilog("DBUG " + " setReceiptEleboxAck");
    uilog("DBUG " + saleTx);
    var dateTime = new Date();
    var txDateTime = new Date(dateTime);
    /*if(!isDatesTheSame(new Date(), txDateTime))
    	txDateTime = utcDateToLocalTime(txDateTime);*/
    var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);
    var txTime = formatTimeAMPM(txDateTime);

    var txDateTime = new StringBuilder("");
    txDateTime.append(txDate);
    txDateTime.append(" ");
    txDateTime.append(txTime);

    var currency = "Rp. ";
    try {

        footerSummary.push(" ");
        footerSummary.push(RECEIPT_ELEBOX_DIVIDER);
        footerSummary.push(new PrintBlock(RECEIPT_POS_CENTERED, store.name));
        footerSummary.push(new PrintBlock(RECEIPT_POS_CENTERED, txDateTime.toString()));
        footerSummary.push(RECEIPT_ELEBOX_DIVIDER);
        footerSummary.push(" ");

        footerSummary.push(new PrintBlock(
            RECEIPT_POS_CENTERED, setLineSummaryItem(
                getMsgValue('elebox_order_code'),
                saleTx.orderId)));

        footerSummary.push(" ");

        if (saleTx.acknow) {
            footerSummary.push(new PrintBlock(
                RECEIPT_POS_CENTERED, saleTx.acknow));
        }
    } catch (e) {
        uilog("DBUG", "Error in setting receipt ELEBOX")
    }
}

function setReceiptBPJS(saleTx, footerSummary) {
    var dateTime = new Date();
    var txDateTime = new Date(dateTime);
    var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);
    var txTime = formatTimeAMPM(txDateTime);

    var txDateTime = new StringBuilder("");
    txDateTime.append(txDate);
    txDateTime.append(" ");
    txDateTime.append(txTime);
    var info = saleTx.info;
    var replaces = info.replace(/[<]/gi, " <").replace(/[>]/gi, "> ").replace("bulan", "Bulan");
    var after = replaces.replace(" <b>  ", "").replace(/[</b>]/g, ""); //.replace(/[,]/g,"\n\t");
    replaces = after.split("\n");
    var name = replaces[2].replace(",\n", "\n").replace(" ,", "\n\t\t").replace(/,\s*$/, "");
    var premi = replaces[5].replace(" : ", ":").split(":");
    var admin = replaces[6].replace(" : ", ":").split(":");
    var parsPremi = numberWithCommas(premi[1]);
    var parsAdmin = numberWithCommas(admin[1]);
    var header = "PT. Bank Negara Indonesia (Persero)";
    var header1 = "BPJS KESEHATAN";
    var footer = "BPJS KESEHATAN MENYATAKAN STRUK INI";
    var footer1 = "SEBAGAI BUKTI PEMBAYARAN YANG SAH";
    var footer2 = "Rincian tagihan dapat diakses di";
    var footer3 = "www.bpjs-kesehatan.go.id";
    var currency = "Rp. ";
    try {

        footerSummary.push(" ");
        footerSummary.push(RECEIPT_ELEBOX_DIVIDER);
        footerSummary.push(new PrintBlock(RECEIPT_POS_CENTERED, store.name));
        footerSummary.push(new PrintBlock(RECEIPT_POS_CENTERED, txDateTime.toString()));
        footerSummary.push(RECEIPT_ELEBOX_DIVIDER);
        footerSummary.push(" ");

        footerSummary.push(new PrintBlock(
            RECEIPT_POS_CENTERED, header
        ));
        footerSummary.push(new PrintBlock(
            RECEIPT_POS_CENTERED, header1
        ));

        footerSummary.push(" ");

        footerSummary.push(new PrintBlock(
            RECEIPT_POS_JUSTIFIED, replaces[0]));
        footerSummary.push(new PrintBlock(
            RECEIPT_POS_JUSTIFIED, replaces[1]));
        footerSummary.push(new PrintBlock(
            RECEIPT_POS_JUSTIFIED, name));
        footerSummary.push(new PrintBlock(
            RECEIPT_POS_JUSTIFIED, replaces[3]));
        footerSummary.push(new PrintBlock(
            RECEIPT_POS_JUSTIFIED, replaces[4]));
        footerSummary.push(new PrintBlock(
            RECEIPT_POS_JUSTIFIED, premi[0] + " : " + currency + parsPremi));
        footerSummary.push(new PrintBlock(
            RECEIPT_POS_JUSTIFIED, admin[0] + " : " + currency + parsAdmin));

        footerSummary.push(" ");

        footerSummary.push(new PrintBlock(
            RECEIPT_POS_CENTERED, footer
        ));
        footerSummary.push(new PrintBlock(
            RECEIPT_POS_CENTERED, footer1
        ));
        footerSummary.push(new PrintBlock(
            RECEIPT_POS_CENTERED, footer2
        ));
        footerSummary.push(new PrintBlock(
            RECEIPT_POS_CENTERED, footer3
        ));
    } catch (e) {
        uilog("DBUG", "Error in setting receipt ELEBOX")
    }
}

function setReceiptSimpatindo(saleTx, footerSummary) {
    var dateTime = new Date();
    var txDateTime = new Date(dateTime);
    var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);
    var txTime = formatTimeAMPM(txDateTime);

    var txDateTime = new StringBuilder("");
    txDateTime.append(txDate);
    txDateTime.append(" ");
    txDateTime.append(txTime);

    console.log("set receipt simpatindo");

    try {
        footerSummary.push(" ");
        footerSummary.push(RECEIPT_ELEBOX_DIVIDER);
        footerSummary.push(new PrintBlock(RECEIPT_POS_CENTERED, store.name));
        footerSummary.push(new PrintBlock(RECEIPT_POS_CENTERED, txDateTime.toString()));
        footerSummary.push(RECEIPT_ELEBOX_DIVIDER);
        footerSummary.push(" ");

        var simpatindo = saleTx.simpatindo;

        console.log(simpatindo);

        if (simpatindo.response.ext_data && typeof simpatindo.response.ext_data != 'object') {
            var ext_data = simpatindo.response.ext_data;
            var rows_ext = ext_data.split("|");

            for (var i = 0; i < rows_ext.length; i++) {
                // var wrapLine = setWrappedLineSummaryItem(rows_ext[i].trim(), "");
                // var summaryItem = setLineSummaryItem(rows_ext[i].trim());

                var wrappedSummary = setWrappedLineSummary(rows_ext[i]);
                footerSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrappedSummary));
            }
        } else {
            // var resmessage = simpatindo.response.resmessage.trim();
            // var test = prefixedSplit(resmessage, CONSTANTS.PRINT_FIELD_CONFIG.MAX_LABEL.cap, "\n", true, null);

            // console.log("Prefixed split test : ");
            // console.log(test);
            // var wrapLine = setWrappedLineSummaryItem(simpatindo.response.resmessage.trim(), "");
            // var summaryItem = setLineSummaryItem(simpatindo.response.resmessage);

            var wrappedSummary = setWrappedLineSummary(simpatindo.response.resmessage);
            footerSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrappedSummary));

            var wrappedSummary = setWrappedLineSummary(simpatindo.response.scrmessage);
            footerSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, wrappedSummary));
        }




        footerSummary.push(" ");
    } catch (e) {
        uilog("DBUG", "Error in setting receipt SIMPATINDO");
        uilog("DBUG", JSON.stringify(e));
        uilog("DBUG", e);
    }
}

/**
 * Promo details before footer of receipt
 * @param printableStringArr
 */
function setPromotionalMsgDetails(printableStringArr) {

    var configKey = "RECEIPT_PROMOTIONAL_MSG_{0}";
    var receiptPromoMsgArr = [];
    var lineDivider = addSpaces("", "").replace(/ /g, '=');
    var hasAtLeastOneMsg = false;
    for (var ctr = 1; ctr <= 4; ctr++) {
        var currMsg = getConfigValue(configKey.format(ctr)) || null;
        if (currMsg &&
            (currMsg = currMsg.trim()) &&
            currMsg.length > 0) {
            receiptPromoMsgArr.push(new PrintBlock(RECEIPT_POS_CENTERED, currMsg));
            hasAtLeastOneMsg = true;
        }
    }
    if (hasAtLeastOneMsg) {
        printableStringArr.push(new PrintBlock(RECEIPT_POS_CENTERED, lineDivider));
        $.merge(printableStringArr, receiptPromoMsgArr);
    }
}

/**
 * ST = Store code/number; RG = Terminal number; CH = Cashier number; TR =
 * Transaction number;
 * @Param tx - transaction details
 * @Return linePOS - prints st, rg, ch and tr in 1 line.
 */

function setPosTerminalLoyalty(storeCode, posTerminal, userName, printableStringArr) {
    var linePOS = new StringBuilder("");
    console.log("===============masuk=============" + posTerminal + " " + storeCode);
    var posDtl = {
        st: getMsgValue('pos_receipt_store_cd_label') + storeCode,
        rg: RECEIPT_SPACE + getMsgValue('pos_receipt_terminal_id_label') + posTerminal,
        ch: RECEIPT_SPACE + getMsgValue('pos_receipt_cashier_id_label') + userName
    };

    for (var i in posDtl) {
        linePOS.append(posDtl[i]);
    }
    printableStringArr.push(new PrintBlock(RECEIPT_POS_CENTERED, addSpaces("", "").replace(/ /g, '=')));
    printableStringArr.push(new PrintBlock(RECEIPT_POS_CENTERED, linePOS.toString()));
}

function setPosTerminalDetails(tx, printableStringArr, hasPreDetailsLineDivider) {
    var nA = "N/A";
    var linePOS = new StringBuilder("");

    var storeCd = tx.storeCd === undefined ? nA : removeLeadingZeroes(tx.storeCd);
    var terminalNum = configuration.terminalNum === undefined ? nA : removeLeadingZeroes(configuration.terminalNum);
    //var cashierId = tx.userId === undefined ? nA : removeLeadingZeroes(tx.userId);
    var txId = tx.transactionId === undefined ? nA : removeLeadingZeroes(tx.transactionId);

    var posDtl = {
        st: getMsgValue('pos_receipt_store_cd_label') + storeCd,
        rg: RECEIPT_SPACE + getMsgValue('pos_receipt_terminal_id_label') + terminalNum,
        ch: RECEIPT_SPACE + getMsgValue('pos_receipt_cashier_id_label') + loggedInUsername
    };
    for (var i in posDtl) {
        linePOS.append(posDtl[i]);
    }
    if (hasPreDetailsLineDivider) {
        // Line Divider
        printableStringArr.push(new PrintBlock(RECEIPT_POS_CENTERED, addSpaces("", "").replace(/ /g, '=')));
    }
    // #80087
    printableStringArr.push(new PrintBlock(RECEIPT_POS_CENTERED, linePOS.toString()));
    printableStringArr.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_transaction_id_label') + txId));
}

/**
 * Sets transaction details. This info is printed for retrieved transactions.
 * @param tx - transaction details
 * @returns {Array} - returns transaction #, terminal# and amount in an array
 */
function setReceiptTxDetails(tx) {
    var txDtl = [];
    if (tx.orderItems.length > 0 && (redeemPointTrk == true || tx.orderItems[0].categoryId == "RDM")) {
        var currency = "Points";
    } else {
        var currency = "Rp";
    }
    var txDateTime = new Date(tx.transactionDate);
    /*if(!isDatesTheSame(new Date(), txDateTime))
    	txDateTime = utcDateToLocalTime(txDateTime);*/
    var txTimeStr = formatTime(txDateTime);
    var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);
    var finalSaleTxAmount = Math.abs(CASHIER.getFinalSaleTxAmount(tx));

    /*
     * Implementation to include at most 2
     * star-boxed banners, Tier#1 and Tier#2
     */
    /* Tier #1 - non-full(micro) transaction type BANNER
     * of the original transaction
     */
    var validStarBoxedMicroTxType = [
        CONSTANTS.TX_TYPES.STORE,
        CONSTANTS.TX_TYPES.RECALL
    ];

    var microTxTypeBannerTier1 = SUPERVISOR_INTERVENTION
        .getLatestInterventionTxTypeInstanceByTxTypes(tx, validStarBoxedMicroTxType);
    /*
     * Tier #2 - POST SALE VOID banner
     */
    var isVoidSaleTransaction = (tx.type == CONSTANTS.TX_TYPES.SALE_VOID.name) &&
        tx.baseTransactionType;
    var voidSaleTxTypeBannerTier2 = (isVoidSaleTransaction) ?
        CONSTANTS.TX_TYPES.SALE_VOID :
        null;

    /* Tier #3 - full transaction types BANNER
     *
     * a.) validNormalSaleTxTypes - normal sale
     * 		banner of the original sale transaction
     * b.) validVoidSaleTxTypes - voided sale
     * 		banner of the original sale transaction
     */
    var validNormalSaleTxTypesArr = [
        CONSTANTS.TX_TYPES.RETURN,
        CONSTANTS.TX_TYPES.REFUND,
        CONSTANTS.TX_TYPES.FLOAT,
        CONSTANTS.TX_TYPES.PICKUP
    ];
    var validVoidSaleTxTypesArr = [
        CONSTANTS.TX_TYPES.RETURN,
        CONSTANTS.TX_TYPES.REFUND
    ];
    var fullTxTypesToUseArr = (isVoidSaleTransaction) ?
        validVoidSaleTxTypesArr :
        validNormalSaleTxTypesArr;
    var toProcessTxType = CONSTANTS.TX_TYPES.findTxTypeByName(
        // If void sale transaction
        (isVoidSaleTransaction) ? tx.baseTransactionType
        // If normal sale transaction
        :
        tx.type
    );
    var fullTxTypeBannerTier3 =
        // If Tier1(MicroTx) is Store txn, disregard printing the full tx type banner
        ((!(isStoredTxType = (microTxTypeBannerTier1 == CONSTANTS.TX_TYPES.STORE)) &&
                $.inArray(toProcessTxType, fullTxTypesToUseArr) >= 0) ?
            toProcessTxType :
            null
        );

    /*
     * Array containing the banners to print
     */
    var txDetailArr = [
        // Tier #1
        microTxTypeBannerTier1,
        // Tier #2
        voidSaleTxTypeBannerTier2,
        // Tier #3
        fullTxTypeBannerTier3
    ];
    for (var counter = 0, len = txDetailArr.length; counter < len; counter++) {
        var item = txDetailArr[counter];
        switch (item) {
            case CONSTANTS.TX_TYPES.STORE:
                // fall through condition
            case CONSTANTS.TX_TYPES.SALE_VOID:
                {
                    var voidedAmountHeader = Math.abs(CASHIER.getFinalSubtotalTxAmount(tx));

                    // use the opposite operator, cpn, rounding, memberDisc amount is already negative
                    if (tx.cpnIntAmount)
                        voidedAmountHeader -= tx.cpnIntAmount;
                    if (tx.roundingAmount)
                        voidedAmountHeader += tx.roundingAmount;
                    if (tx.memberDiscReversal && tx.memberDiscReversal != 0)
                        voidedAmountHeader += tx.memberDiscReversal;

                    var bannerTerminalNum = removeLeadingZeroes(configuration.terminalNum);
                    var bannerTxNo = removeLeadingZeroes((tx.baseTransactionId)
                        // If sale-void txn
                        ?
                        tx.baseTransactionId
                        // otheriwise, the txn id
                        :
                        tx.transactionId);
                    if (tx.orderItems[0].categoryId == "RDM") {
                        currency = "Points";
                    } else {
                        currency = "Rp";
                    }
                    txDtl.push(new PrintBlock(RECEIPT_POS_CENTERED, item.getTypeLabel()));
                    txDtl.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_terminal_num_label') + bannerTerminalNum));
                    txDtl.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_transaction_num_label') + bannerTxNo));
                    txDtl.push(new PrintBlock(RECEIPT_POS_CENTERED, "* " + numberWithCommas(isNegativeSign(tx) ? (voidedAmountHeader * -1) : voidedAmountHeader) + currency + " *"));
                    break;
                }
            case CONSTANTS.TX_TYPES.RECALL:
                {
                    if (redeemPointTrk == true) {
                        currency = "Points";
                    } else {
                        currency = "Rp";
                    }
                    txDtl.push(new PrintBlock(RECEIPT_POS_CENTERED, item.getTypeLabel()));
                    txDtl.push(new PrintBlock(RECEIPT_POS_CENTERED, "* " + numberWithCommas(finalSaleTxAmount) + currency + " *"));

                    // #80087
                    setPosTerminalDetails(tx, txDtl);
                    txDtl.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_time_label') + txTimeStr + RECEIPT_SPACE +
                        getMsgValue('pos_receipt_date_label') + txDate));
                    break;
                }
            default:
                {
                    if (item) {
                        txDtl.push(new PrintBlock(RECEIPT_POS_CENTERED, item.getTypeLabel()));
                    }
                    break;
                }
        }
    }
    //Add lines separator on receipt
    if (txDtl.length > 0) {
        txDtl.unshift(new PrintBlock(RECEIPT_POS_CENTERED, "******************************************"));
        txDtl.push(new PrintBlock(RECEIPT_POS_CENTERED, "******************************************"));
    }

    return (txDtl.length > 0) ? txDtl :
        null;
}

function setCouponSummary(tx) {
    var coupon = new Array();

    try {
        var dateTime = tx.transactionDate || new Date();
        if (tx.status == CONSTANTS.STATUS.CANCELLED) dateTime = new Date();
        var txDateTime = new Date(dateTime);
        //if(!isDatesTheSame(new Date(), txDateTime))
        //	txDateTime = utcDateToLocalTime(txDateTime);
        var txTimeStr = formatTime(txDateTime);

        var txDate = $.datepicker.formatDate('dd/mm/yy', txDateTime);
        var divider = addSpaces("", ""); //creates one line item space.

        var final_sale = RETURN_REFUND.return.service.calculateTotalReturn();
        coupon.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_BOLD));
        coupon.push(new PrintBlock(RECEIPT_POS_CENTERED, divider.replace(/ /g, '=')));
        coupon.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DOUBLE_HEIGHT));
        coupon.push(new PrintBlock(RECEIPT_POS_CENTERED, "VOUCHER RETURN"));
        coupon.push(new PrintBlock(RECEIPT_POS_CENTERED, divider));
        coupon.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, getMsgValue('pos_receipt_refund_voucher_label') + RECEIPT_TAB_SPACE + RECEIPT_DBL_DOT + RECEIPT_DBL_SPACE + final_sale));
        coupon.push(new PrintBlock(RECEIPT_POS_CENTERED, divider));
        coupon.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DEFAULT));
        if (saleTx.isReturnTrkSales) {
            coupon.push(new PrintBlock(RECEIPT_POS_CENTERED, "Kupon ini hanya dapat digunakan"));
            coupon.push(new PrintBlock(RECEIPT_POS_CENTERED, "untuk transaksi TRK SALE GAME ITEM"));
        }
        // #80087
        setPosTerminalDetails(tx, coupon, true);
        // footer.push(setPosTerminalDetails(tx));
        if (connectionOnline) {
            coupon.push(new PrintBlock(RECEIPT_POS_CENTERED, getMsgValue('pos_receipt_time_label') + txTimeStr + " " + getMsgValue('pos_receipt_date_label') + txDate));
        } else {
            coupon.push(new PrintBlock(RECEIPT_POS_CENTERED, "******" + getMsgValue('pos_receipt_time_label') +
                txTimeStr + " " + getMsgValue('pos_receipt_date_label') + txDate + "*****"));
        }
        coupon.push(new PrintBlock(RECEIPT_POS_CENTERED, divider)); // add new line
    } catch (err) {
        console.log("DBUG", "Error getting the coupon caused by: " + err.message);
    }

    return coupon;
}

function setReceiptCopyTrk(tx) {
    var copyTrk = new Array();

    try {
        var divider = addSpaces("", ""); //creates one line item space.
        copyTrk.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_BOLD));
        copyTrk.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DOUBLE_HEIGHT));
        copyTrk.push(new PrintBlock(RECEIPT_POS_CENTERED, divider.replace(/ /g, '-')));
        copyTrk.push(new PrintBlock(RECEIPT_POS_CENTERED, divider));
        copyTrk.push(new PrintBlock(RECEIPT_POS_CENTERED, "Cashier Receipt"));
        copyTrk.push(new PrintBlock(RECEIPT_POS_CENTERED, divider));
        copyTrk.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DEFAULT));

        var subTotal = "",
            cpnIntAmount = "",
            cpnIntBalanceDue = "",
            couponAmount = "",
            couponAmountBalanceDue = "",
            cancelAmount = "",
            cancelAmountBalanceDue = "",
            couponCobrandDisc = "",
            couponCobrandDiscBalanceDue = "",
            roundingAmount = "",
            balanceDue = "",
            totalAmount = "",
            megaDiscPayment = "",
            reversedMemberDisc = "",
            totalWithRevMemDisc = "",
            cmcCouponSummary = [],
            change = "",
            mediaPaymentSummaryArr = [];
        // XXX: remove LOC below, not used
        // accountNumber = "",
        donationAmountPrintLine = "";
        var mediaSummaryReceiptMap;
        var isRoundingApplied = false;
        var hasMemberDiscReversal = (tx.memberDiscReversal && tx.memberDiscReversal != 0);
        var cmcPaymentSummary = [];

        var totalSecondLayer = 0,
            totalSecondLayerWithoutMember = 0,
            saleTotalDiscount = 0;

        var subTotalAmount = CASHIER.getFinalSubtotalTxAmount(tx);
        var amountPaid = tx.totalDiscount - tx.memberDiscReversal;

        if (tx.type == CONSTANTS.TX_TYPES.SALE.name) {
            if (tx.cpnIntAmount)
                subTotalAmount += tx.cpnIntAmount;
            if (tx.roundingAmount)
                subTotalAmount -= tx.roundingAmount;
            if (hasMemberDiscReversal)
                subTotalAmount -= tx.memberDiscReversal;
        }

        var separatorLineItem1 = setWrappedLineSummaryItem("", lineSeparator1);
        if (tx.totalAmount) {
            var subTotalAmountDisplayText = numberWithCommas(Math.abs(subTotalAmount));
            subTotal += setWrappedLineSummaryItem(getMsgValue('pos_receipt_subtotal_label'), subTotalAmountDisplayText, tx);
            totalAmount += setWrappedLineSummaryItem(getMsgValue('pos_receipt_total_label'), subTotalAmountDisplayText, tx);

            if (hasMemberDiscReversal) {
                var amount = subTotalAmount + tx.memberDiscReversal;

                reversedMemberDisc += setWrappedLineSummaryItem(getConfigValue('RECEIPT_CMC_CANCEL_DISCOUNT'), numberWithCommas(tx.memberDiscReversal), tx);
                totalWithRevMemDisc += setWrappedLineSummaryItem(getMsgValue('pos_receipt_total_label'), numberWithCommas(amount), tx);
                subTotalAmount = amount;
            }
        }
        if (tx.cpnIntAmount) {
            var amount = subTotalAmount - tx.cpnIntAmount;

            cpnIntAmount += wrapLineItem(getMsgValue('pos_receipt_cpn_int_amount_label'), numberWithCommas(tx.cpnIntAmount), "-", RECEIPT_DBL_SPACE);
            cpnIntBalanceDue += setWrappedLineSummaryItem(RECEIPT_DBL_SPACE.concat(getMsgValue('pos_receipt_balance_due_label')), numberWithCommas(amount), tx);
            subTotalAmount = amount;
        }
        if (tx.roundingAmount) {
            isRoundingApplied = true;
            var isRoundingAmtNegative = tx.roundingAmount < 0;
            var reversedRoundSign;
            var amount;
            var roundingType = getConfigValue("ROUNDING_TYPE");
            var roundingLbl;

            reversedRoundSign = isRoundingAmtNegative ? numberWithCommas(tx.roundingAmount * -1) : numberWithCommas(tx.roundingAmount);
            amount = subTotalAmount + tx.roundingAmount;

            if (roundingType == "SIMPLE_ROUNDING")
                roundingLbl = "pos_receipt_simple_rounding_label";
            else if (roundingType == "ROUND_UP")
                roundingLbl = "pos_receipt_round_up_label";
            else if (roundingType == "ROUND_DOWN")
                roundingLbl = "pos_receipt_round_down_label";

            roundingAmount += wrapLineItem(getMsgValue(roundingLbl), reversedRoundSign, isRoundingAmtNegative ? "-" : null, RECEIPT_DBL_SPACE);
            balanceDue += setWrappedLineSummaryItem(RECEIPT_DBL_SPACE.concat(getMsgValue('pos_receipt_balance_due_label')), numberWithCommas(amount), tx);
        }

        var totalCmcDisc = calculateTotalMemberDiscount();
        var cmcPayment = !hasMemberDiscReversal && totalCmcDisc > 0;
        var cmcPaymentCoupon = SALE_RETURN_COUPON.isCmcPayment() && SALE_RETURN_COUPON.isUseCouponReturn();


        if (tx.totalAmountPaid) {
            mediaSummaryReceiptMap = PAYMENT_MEDIA.generatePaymentSummaryReceiptMap(tx);

            console.log("MEDIA SUMMARY RECEIPT MAP : " + JSON.stringify(mediaSummaryReceiptMap));

            console.log("Cmc payment : " + cmcPayment);

            if (cmcPayment) {
                for (var i in mediaSummaryReceiptMap) {
                    var mediaItem = mediaSummaryReceiptMap[i];
                    if (mediaItem.font && mediaItem.font.bold) {
                        cmcPaymentSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_BOLD));
                        cmcPaymentSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            setLineSummaryItem(mediaItem.label, mediaItem.value, (mediaItem.checkSign) ? tx.type : null)));
                        cmcPaymentSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, RECEIPT_FONT_DEFAULT));
                    } else {
                        cmcPaymentSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED,
                            setLineSummaryItem(mediaItem.label, mediaItem.value, (mediaItem.checkSign) ? tx.type : null)));
                    }
                }
                cmcPaymentSummary.push(new PrintBlock(RECEIPT_POS_COMMAND, "\n"));
            } else {
                mediaSummaryReceiptMap.forEach(function(data) {
                    var label = data.label;
                    var mediaPaymentSummary = "";
                    var unwrappedLblArr = [
                        getMsgValue('pos_receipt_giftcard_number_label')
                    ];
                    var unwrappedLblArr2 = [
                        getMsgValue('pos_receipt_voucher_number_label')
                    ];
                    //}
                    var isUnwrappedLbl = (($.inArray(label, unwrappedLblArr) >= 0) || ($.inArray(label, unwrappedLblArr2) >= 0));
                    mediaPaymentSummary += (isUnwrappedLbl) ? setLineSummaryItem(label, data.value, (data.checkSign) ? tx.type : null) :
                        setWrappedLineSummaryItem(label, data.value, (data.checkSign) ? tx : null);
                    mediaPaymentSummaryArr.push(mediaPaymentSummary);
                });
            }
        }
        // If has donation amount
        if (tx.donationAmount) {
            donationAmountPrintLine += setWrappedLineSummaryItem(getMsgValue('pos_receipt_donation_label'),
                numberWithCommas(Math.abs(tx.donationAmount)),
                tx);
        }
        if (tx.totalChange != 0) {
            change += setWrappedLineSummaryItem(getMsgValue('pos_receipt_change_label'),
                numberWithCommas(tx.totalChange),
                tx);
        }
        if (tx.promotionItems) {
            setPromotions(tx.promotionItems, copyTrk, tx.type);
        }

        var employeeDiscountTotal = Math.abs(calculateEmployeeDiscountTotal(tx));
        if (employeeDiscountTotal != 0) {
            setEmployeeDiscount(employeeDiscountTotal, copyTrk, tx.type);
        }

        copyTrk.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, totalAmount));

        if (tx.type == CONSTANTS.TX_TYPES.SALE.name || tx.type == CONSTANTS.TX_TYPES.BILL_PAYMENT.name) {
            uilog('DBUG', "will print coupon cobrand");
            console.log("coBrand Number : " + tx.coBrandNumber);
            console.log("cmcPayment : " + cmcPayment);

            if (cmcPaymentCoupon) {
                for (var i = 0; i < cmcCouponSummary.length; i++) {
                    cmcCouponObj = cmcCouponSummary[i];
                    amountCoupon = cmcCouponObj['amount'];
                    balanceDueCoupon = cmcCouponObj['balance_due'];

                    copyTrk.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, amountCoupon));
                    copyTrk.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, separatorLineItem1));
                    copyTrk.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, balanceDueCoupon));
                }
            }

            if (cmcPayment || cmcPaymentCoupon) {
                copyTrk = copyTrk.concat(cmcPaymentSummary);
            } else {
                mediaPaymentSummaryArr.forEach(function(data) {
                    copyTrk.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, data));
                });

            }

            if (tx.donationAmount) {
                copyTrk.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, donationAmountPrintLine));
            }
            if (tx.totalChange != 0) {
                copyTrk.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, change));
            }
        } else if (tx.type == CONSTANTS.TX_TYPES.CANCEL_SALE.name) {} else if (tx.type == CONSTANTS.TX_TYPES.RETURN.name) {
            if (cmcPayment) {
                copyTrk = copyTrk.concat(cmcPaymentSummary);
            } else {
                mediaPaymentSummaryArr.forEach(function(data) {
                    copyTrk.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, data));
                });
            }
        } else if (tx.type == CONSTANTS.TX_TYPES.REFUND.name) {
            mediaPaymentSummaryArr.forEach(function(data) {
                copyTrk.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, data));
            });
        }
        copyTrk = copyTrk.concat(setReceiptFooterSummary(tx));
        copyTrk = copyTrk.concat(setReceiptFooter(tx));
    } catch (err) {
        console.log("DBUG", "Error getting the copy trk caused by: " + err.message);
    }

    return copyTrk;
}

// INHOUSE VOUCHER 2017-04-13
function setVoucherVoid(tx, voucherItem) {
    var voucher = [];

    try {
        voucher.push(new PrintBlock(RECEIPT_POS_CENTERED, "------------------------------------------"));
        voucher.push(new PrintBlock(RECEIPT_POS_CENTERED, wrapLineItem('VOIDED VOUCHER', voucherItem, false)));
    } catch (err) {
        console.log("Problem with receipt item/body caused by:" + err.message);
    }
    return voucher;
}
// INHOUSE VOUCHER 2017-04-13

/**
 * Sets tax breakdown of the transaction to be printed.
 * @param tb - tax breakdown
 * @returns lineTax - returns a string with tax breakdown printed in one line.
 */
function setTaxBreakdown(tb, tx) {
    var lineTax = new StringBuilder("");
    var count = 0;
    for (var t in tb) {
        lineTax.append(RECEIPT_TAB_SPACE);
        lineTax.append(tb[t]);
        // On first iteration, disregard adding of negative sign
        // since its a percentage.
        lineTax.append((count > 0) ? displayNegativeSign(tx) : "");
        count++;
    }
    return lineTax.toString();
}

/**
 * Get the transaction summary details to be printed from a tx and clones it.
 * @param tx - transaction obj
 * @returns txSummary - cloned transaction summary obj
 */
function getTxnSummaryData(tx) {
    var clonedTx = cloneObject(tx);

    var txSummary = {
        subtotal: clonedTx.totalAmount,
        totalAmount: clonedTx.totalAmount,
        roundingAmount: clonedTx.roundingAmount,
        totalAmountPaid: clonedTx.totalAmountPaid
    };

    return negateNegativeSign(txSummary);
}

/**
 * Negates the amount if value is less than 0 and place the negative sign at the right position.
 * Add Spaces if value is greater than 0 for receipt format.
 * @param tx - transaction obj
 * @returns txSummary - cloned transaction summary obj
 */
function negateNegativeSign(tx) {
    for (var i in tx) {
        if (tx[i] < 0) {
            //Negate the symbol if value is less than 0.
            tx[i] = (-tx[i]);
        }
    }
    return tx;
}

/**
 * Promo details on footer summary
 * @param promoItems
 * @param container
 * @param type
 */
function setPromotions(promoItems, container, type) {

    try {
        var sign = (type && type == CONSTANTS.TX_TYPES.SALE_VOID.name) ? "" : "-";


        for (var i in promoItems) {
            var promoItem = cloneObject(promoItems[i]);
            if (promoItem.totalDiscount == 0) continue;
            var discountPerItem = Math.round(promoItem.totalDiscount / promoItem.itemQuantity);

            if (promoItem.type != CONSTANTS.PROMOTION_TYPES.MEMBER_PROMOTION) {
                var item = {
                    quantity: promoItem.itemQuantity,
                    priceUnit: discountPerItem
                };
                container.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, " "));
                container.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setLineItemPrice(item) + sign));

                var promoItemDesc = new StringBuilder("");
                var totalItemDiscount = numberWithCommas(promoItem.totalDiscount);
                var descLimit = (parseInt(getMsgValue('pos_receipt_max_length')) - (totalItemDiscount.length + 1));
                var promoLabel = promoItem.label;

                if (promoLabel.length > descLimit) {
                    container.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, promoLabel.substring(0, descLimit)));

                    promoLabel = promoLabel.substring(descLimit, promoLabel.length);
                }
                /*
					promoItemDesc.append(buildLineItem({
						left : promoLabel,
						right : numberWithCommas(promoItem.totalDiscount),
						pad : addSpaces(promoLabel,
								numberWithCommas(promoItem.totalDiscount))
					}));
					promoItemDesc.append(wrapLineItem(promoLabel,
													  numberWithCommas(promoItem.totalDiscount),
													  ""));
					promoItemDesc.append(sign);
					*/
                promoItemDesc.append(wrapLineItem(promoLabel,
                    numberWithCommas(promoItem.totalDiscount),
                    sign));

                container.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, promoItemDesc.toString()));
            }
        }
    } catch (e) {
        uilog("DBUG", "error in populating promotions in receipt " + e.message);
    }

}

/**
 * Get Employee discount details from transaction to be printed in receipt
 * @param amount
 * @param container
 * @param type
 */
function setEmployeeDiscount(amount, container, type) {
    try {
        var percentageDisc = (alloPaylaterDiscountToggled ? getConfigValue("ALLO_PAYLATER_DISC") : getConfigValue("EMP_DISC_PERCENTAGE"))
        var empDiscType = getConfigValue("EMP_DISC_TYPE");
        var sign = (type && type == CONSTANTS.TX_TYPES.SALE_VOID.name) ? "" : "-";
        var empDiscDesc = new StringBuilder("");
        var descLimit = (parseInt(getMsgValue('pos_receipt_max_length')) - RECEIPT_TAB_SPACE.length);
        if (empDiscType === "INCLUSION") {
            empDiscLabel = "TOTAL DISCOUNT";
        } else {
            console.log("CUY " + empDiscType)
            empDiscLabel = "20% DISCOUNT";
        }
        if (empDiscLabel.length > descLimit) {
            container.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, empDiscLabel.substring(0, descLimit)));
            empDiscLabel = empDiscLabel.substring(descLimit, empDiscLabel.length);
        }

        empDiscDesc.append(wrapLineItem(empDiscLabel, numberWithCommas(amount), sign));
        container.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, empDiscDesc.toString()));
    } catch (e) {
        uilog("DBUG", "error in populating employee discount in receipt " + e.message);
    }
}

function setEmployeeDiscountItem(labelString, amount, container, type) {
    try {
        var sign = (type && type == CONSTANTS.TX_TYPES.SALE_VOID.name) ? "" : "-";
        var empDiscDesc = new StringBuilder("");
        var descLimit = (parseInt(getMsgValue('pos_receipt_max_length')) - RECEIPT_TAB_SPACE.length);
        var empDiscLabel = labelString;

        if (empDiscLabel.length > descLimit) {
            container.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, empDiscLabel.substring(0, descLimit)));
            empDiscLabel = empDiscLabel.substring(descLimit, empDiscLabel.length);
        }

        empDiscDesc.append(wrapLineItem(empDiscLabel, numberWithCommas(amount), sign));
        container.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, empDiscDesc.toString()));
    } catch (e) {
        uilog("DBUG", "error in populating employee discount in receipt " + e.message);
    }
}

/**
 * Get transaction details to be printed in receipt for cashier x report
 * @param data
 * @returns {*}
 */
function createCashierXReport(data) {
    if (data) {
        var body = new Array();
        var label = "",
            val = "";
        var pad1Length = 7;
        var maxLen = parseInt(getMsgValue('pos_receipt_max_length'));
        var lineItem = new StringBuilder("");
        var totalLine = "--------------";
        var totalLineStr = "".rightPad(" ", (maxLen - totalLine.length)) + totalLine;

        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, RECEIPT_SPACE + "CASHIER X REPORT"));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, ("CASHIER # " + loggedInUsername).centerPad(" ", maxLen)));

        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, RECEIPT_TAB_SPACE + "SALES TOTALS"));
        body.push(new PrintBlock(RECEIPT_POS_CENTERED, ("MERCHANDISE:").centerPad(" ", maxLen)));
        var salesTotal = data.salesTotal;
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem(salesTotal.positiveItemsCount,
            "POSITIVE ITEMS", salesTotal.positiveItemsAmount)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem(salesTotal.negativeItemsCount,
            "NEGATIVE ITEMS", salesTotal.negativeItemsAmount)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem(salesTotal.positiveCorrectionsCount,
            "POS. CORRECTIONS", salesTotal.positiveCorrectionsAmount)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem(salesTotal.negativeCorrectionsCount,
            "NEG. CORRECTIONS", salesTotal.negativeCorrectionsAmount)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportSubTotal("MERCHANDISE SUBTOTAL",
            salesTotal.merchandiseSubTotal)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportSubTotal("SALES TAX SUBTOTAL",
            salesTotal.salesTaxSubTotal)));

        var discSurcharge = data.discountSurcharges;
        body.push(new PrintBlock(RECEIPT_POS_CENTERED, ("DISCOUNT/SURCHARGE").centerPad(" ", maxLen)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItemNoCount("DISCOUNT/SURCH 1",
            discSurcharge.discountSurchargeOne)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItemNoCount("DISCOUNT/SURCH 2",
            discSurcharge.discountSurchargeTwo)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItemNoCount("DISCOUNT/SURCH 4",
            discSurcharge.discountSurchargeFour)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItemNoCount("DISCOUNT/SURCH 5",
            discSurcharge.discountSurchargeFive)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItemNoCount("DISCOUNT/SURCH 7",
            discSurcharge.discountSurchargeSeven)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItemNoCount("DISCOUNT/SURCH 8",
            discSurcharge.discountSurchargeEight)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItemNoCount("DISCOUNT/SURCH 9",
            discSurcharge.discountSurchargeNine)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportSubTotal("DISC/SURCH SUBTOTAL",
            discSurcharge.discountSurchargeSubTotal)));
        //DONATION
        body.push(new PrintBlock(RECEIPT_POS_CENTERED, ("NON MERCHANDISE").centerPad(" ", maxLen)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem(salesTotal.donationCount,
            "DONATION", salesTotal.donationAmount)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem(salesTotal.allotopupCount,
                "ALLO-TOPUP", salesTotal.allotopupAmount)));
        //BILL_PAYMENT
        var megazip = salesTotal.bp_megazip.split(",");
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem(megazip[1],
            megazip[0], megazip[2])));

        var bpjs_ks = salesTotal.bp_bpjs_ks.split(",");
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem(bpjs_ks[1],
            bpjs_ks[0], bpjs_ks[2])));

        var mcash = salesTotal.bp_mcash.split(",");
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem(mcash[1],
            mcash[0], mcash[2])));

        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportSubTotal("NON MERCHANDISE TOTAL",
            salesTotal.nonMerchandiseAmount)));

        body.push(totalLineStr);
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportSubTotal("SALES ACCOUNTABILITY",
            data.salesAccountability)));

        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, RECEIPT_TAB_SPACE + "MEDIA TOTALS"));
        body.push(new PrintBlock(RECEIPT_POS_CENTERED, "MEDIA TENDER:".centerPad(" ", maxLen)));

        var mediaGrandTotal = 0;

        data.mediaTotals.forEach(function(key) {
            mediaGrandTotal += key.estimateAmount ? parseInt(key.estimateAmount) : 0;


            body.push(cashierXReportLineItem(key.estimateCount, key.mediaDesc, key.estimateAmount));
            if (key.mediaDesc.toLowerCase() == 'cash') {
                // pickup part
                body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem(key.pickupCount, "PICK UP",
                    key.pickupAmount, RECEIPT_DBL_SPACE)));

                // float part
                body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem(key.floatCount, "FLOAT",
                    key.floatAmount, RECEIPT_DBL_SPACE)));
            }
        });

        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportSubTotal("MEDIA TENDER SUBTOTL", mediaGrandTotal)));

        body.push(new PrintBlock(RECEIPT_POS_CENTERED, "MEDIA ADJUSTMENTS:".centerPad(" ", maxLen)));
        var mediaAdj = data.mediaAdjustments;
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem(mediaAdj.roundingAdjustmentCount,
            "ROUNDING ADJUSTMENTS", mediaAdj.roundingAdjustmentAmount)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportSubTotal("MEDIA ADJUSTMT SBTL",
            mediaAdj.mediaAdjustmentSubTotal)));
        body.push(totalLineStr);
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportSubTotal("MEDIA ACCOUNTABILITY",
            data.mediaAccountability)));

        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportSubTotal("TRK POINT REDEMPTION(POINTS)", data.totalTrkPoint)));

        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, RECEIPT_TAB_SPACE + "OTHER TOTALS"));
        var otherTotals = data.otherTotals;
        body.push(new PrintBlock(RECEIPT_POS_CENTERED, "VAT TAX:".centerPad(" ", maxLen)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem(otherTotals.totalTaxableAmount, " VAT 10%",
            otherTotals.tenPercent, RECEIPT_SPACE)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem(discSurcharge.totalDiscountItems,
            "NO. OF DISC. ITEMS:", discSurcharge.discountSurchargeSubTotal)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem(otherTotals.itemVoidedCount, "ITEM VOIDED",
            otherTotals.itemVoidedAmount)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem(otherTotals.saleCancellationCount,
            "SALE CANCELLATIONS", otherTotals.saleCancellationAmount)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem(otherTotals.postSaleVoidCount,
            "POST SALE VOIDS", otherTotals.postSaleVoidAmount)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItemNoAmt(otherTotals.positiveTxnCount,
            "POSITIVE TRANS", true)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItemNoAmt(otherTotals.negativeTxnCount,
            "NEGATIVE TRANS", true)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItemNoAmt(otherTotals.customerCount,
            "NO. OF CUSTOMERS", true)));

        var durations = data.duration;
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItemNoAmt(durations.cashierActiveTime,
            "CASHIER ACTIVE TIME", true)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItemNoAmt(durations.tempOffTime,
            "TEMP. OFF TIME", true)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItemNoAmt(durations.enteringItemsTime,
            "ENTERING ITEMS TIME", true)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItemNoAmt(durations.tenderingTime,
            "TENDERING TIME", true)));

        // CR XREPORT
        var trxAttr = data.trxAttr;
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItemNoAmt(trxAttr.keyItemCount,
            "ENTRIES KEYED", true)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItemNoAmt(trxAttr.scanItemCount,
            "ENTRIES SCANNED", true)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem(trxAttr.storeTransCount,
            "STORED SALES", trxAttr.storeTransAmount)));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem(trxAttr.recallTransCount,
            "RECALLED SALES", trxAttr.recallTransAmount)));

        uilog('DBUG', 'TRX ATTR: ');
        uilog('DBUG', trxAttr);
        // CR XREPORT

        return body;
    } else {
        return null;
    }
}

/**
 * cashier x report line by line details
 * @param count
 * @param desc
 * @param amount
 * @param leadingSpace
 * @returns {*}
 */
function cashierXReportLineItem(count, desc, amount, leadingSpace) {
    var pad1Length = 7;
    var lineItem = new StringBuilder("");
    if (leadingSpace == undefined) {
        leadingSpace = "";
    }
    var label = leadingSpace + numberWithCommas(count).rightPad(" ", pad1Length) + desc;
    var val = amount ? numberWithCommas(amount) : "0";
    lineItem.append(buildLineItem({
        left: label,
        pad: addSpaces(label, val),
        right: val
    }));
    return lineItem.toString();
}

/**
 * cashier x report total amount
 * @param label
 * @param amount
 * @returns {*}
 */
function cashierXReportSubTotal(label, amount) {
    var lineItem = new StringBuilder("");
    var val = numberWithCommas(amount);
    lineItem.append(buildLineItem({
        left: label,
        pad: addSpaces(label, val),
        right: val
    }));
    return lineItem.toString();
}

/**
 * Cashier x report with label
 * @param desc
 * @param amount
 * @returns {*}
 */
function cashierXReportLineItemNoCount(desc, amount) {
    var pad1Length = 7;
    var lineItem = new StringBuilder("");
    var label = "".rightPad(" ", pad1Length) + desc;
    var val = amount ? numberWithCommas(amount) : "0";
    lineItem.append(buildLineItem({
        left: label,
        pad: addSpaces(label, val),
        right: val
    }));
    return lineItem.toString();
}

/**
 * cashier x report to be printed in receipt
 * @param data
 * @returns {*}
 */
function cashierXReportLineItemNoAmt(count, desc, numeric) {
    var pad1Length = 7;
    var lineItem = new StringBuilder("");

    var label = "";
    if (numeric) {
        label = numberWithCommas(count).rightPad(" ", pad1Length) + desc;
    } else {
        label = count.rightPad(" ", pad1Length) + desc;
    }
    lineItem.append(buildLineItem({
        left: label,
        pad: addSpaces(label, ""),
        right: ""
    }));
    return lineItem.toString();
}

function createCashierDepstoreReport(obj) {
    if (obj) {
        var body = new Array();
        var label = "",
            val = "";
        var pad1Length = 7;
        var maxLen = parseInt(getMsgValue('pos_receipt_max_length'));
        var lineItem = new StringBuilder("");
        var totalLine = "--------------";
        var totalLineStr = "".rightPad(" ", (maxLen - totalLine.length)) + totalLine;

        body.push(new PrintBlock(RECEIPT_POS_CENTERED, RECEIPT_SPACE + "CASHIER DEPSTORE REPORT"));
        body.push(new PrintBlock(RECEIPT_POS_CENTERED, ("CASHIER # " + loggedInUsername).centerPad(" ", maxLen)));
        body.push(new PrintBlock(RECEIPT_POS_CENTERED, RECEIPT_TAB_SPACE + "DEPTSTORE SALES TOTALS"));

        data = obj.deptstore;
        for (var p in data) {
            var classItem = data[p];

            body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierDeptstoreReportLineClass(p, classItem.desc)));

            for (var pp in classItem.items) {
                body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem(classItem.items[pp].sku,
                    classItem.items[pp].qty, classItem.items[pp].amount)));
            }
            body.push(totalLineStr);
            body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem("Total", classItem.totalQty, classItem.totalAmt)));
            body.push(totalLineStr);
        }

        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, RECEIPT_TAB_SPACE + "DEPTSTORE TOTALS"));
        body.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, cashierXReportLineItem('', obj.totalqty, obj.totalamt)));

        return body;
    } else {
        return null;
    }
}

function cashierDeptstoreReportLineClass(cls, desc, leadingSpace) {
    var pad1Length = 7;
    var lineItem = new StringBuilder("");
    if (leadingSpace == undefined) leadingSpace = "";

    var label = leadingSpace + cls.rightPad(" ", pad1Length) + desc;

    lineItem.append(buildLineItem({
        left: label,
        pad: addSpaces(label, desc),
        right: ''
    }));
    return lineItem.toString();
}

/******************************
 * Utility Functions
 ******************************/
/**
 * Wraps a single line of text, identifying words by ' '.
 * @param arr container of the line to be printed.
 * @param str string to be wrapped.
 * @param wrapLength the column to wrap the words at, less than 1 is treated as 1.
 * @param wrapLongWords true if long words (such as URLs) should be wrapped.
 */
function wrapText(arr, str, wrapLength, wrapLongWords) {
    if (str) {
        if (wrapLength < 1) {
            wrapLength = 1;
        }
        var inputLineLength = str.length;
        var offset = 0;
        var wrappedLine = new StringBuilder("");

        while ((inputLineLength - offset) > wrapLength) {
            if (str.charAt(offset) == ' ') {
                offset++;
                continue;
            }

            var spaceToWrapAt = str.lastIndexOf(' ', wrapLength + offset);

            if (spaceToWrapAt >= offset) {
                // normal case
                wrappedLine.append(str.substring(offset, spaceToWrapAt));
                arr.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, RECEIPT_DBL_SPACE + wrappedLine.toString()));
                wrappedLine = new StringBuilder("");
                offset = spaceToWrapAt + 1;
            } else {
                // really long word or URL
                if (wrapLongWords) {
                    // wrap really long word one line at a time
                    wrappedLine.append(str.substring(offset, wrapLength + offset));
                    arr.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, RECEIPT_DBL_SPACE + wrappedLine.toString()));
                    wrappedLine = new StringBuilder("");
                    offset += wrapLength;
                } else {
                    // do not wrap really long word, just extend beyond limit
                    spaceToWrapAt = str.indexOf(' ', wrapLength + offset);
                    if (spaceToWrapAt >= 0) {
                        wrappedLine.append(str.substring(offset, spaceToWrapAt));
                        arr.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, RECEIPT_DBL_SPACE + wrappedLine.toString()));
                        wrappedLine = new StringBuilder("");
                        offset = spaceToWrapAt + 1;
                    } else {
                        wrappedLine.append(str.substring(offset));
                        offset = inputLineLength;
                    }
                }
            }
        }

        // Whatever is left in line is short enough to just pass through
        wrappedLine.append(str.substring(offset));
        arr.push(RECEIPT_DBL_SPACE + wrappedLine.toString());
    }
}

/**
 * Determines the padded length needed to be added between the left item and
 * right item.
 * @param arg1 - length of left side argument
 * @param arg2 - length of right side argument
 * @param maxLen - (optional) max length of the reciept. This arg can be null.
 * @returns {String} returns the total length spaces.
 */
function addSpaces(arg1, arg2, length) {
    var leftLen = arg1 === undefined ? 0 : (parseInt(arg1.length) === undefined ? 0 : parseInt(arg1.length));
    var rightLen = arg2 === undefined ? 0 : (parseInt(arg2.length) === undefined ? 0 : parseInt(arg2.length));
    var pad = "";
    var maxLen = length === undefined ? parseInt(getMsgValue('pos_receipt_max_length')) : parseInt(length);
    if (!maxLen) {
        maxLen = parseInt(getMsgValue('pos_receipt_max_length'));
    }

    var lineLen = maxLen - (leftLen + rightLen);

    for (var i = 0; i < lineLen; i++) {
        pad += " ";
    }
    return pad;
}

function appendSpaces(arg, maxLength) {
    return Array((maxLength - arg.length) + 1).join(' ');
}

function twoColumns(arg1, arg2) {
    return arg1 + arg2;
}

/**
 * Sets the label and the tx details for printing line by line.
 * @param label
 * @param padded
 * @param value
 * @returns
 */
function buildLineItem(data) {
    var lineItem = "";
    if (data.left)
        lineItem += data.left;
    if (data.pad)
        lineItem += data.pad;
    if (data.right)
        lineItem += data.right;
    return lineItem;
}

/**
 * Prints text per line; It indicates position to print text;
 * left; centered.
 */
var PrintBlock = function(pos, val) {
    this.position = pos;
    this.val = val;
}

/**
 * creates a "label + value" line item with format:
 * labelxx    : val
 * labelyyyyy : val
 * labelz	  : val
 */
var printColumn = function printColumn(colLabel, colVal, colLabelLen, maxLength, pos) {
    try {
        var lineItem = "";
        colVal = "" + colVal;

        var label = printSameLengthLabel(colLabel, 5);

        if (label) {
            lineItem += label;
        }

        //append spaces to the middle to have it full length
        if (pos && pos == 'right') {
            lineItem += appendSpaces(lineItem, maxLength - colVal.length, pos);
        }

        if (colVal) {
            lineItem += colVal;
        }

        //append spaces to the left to have it full length
        if (!pos && maxLength > lineItem.length) {
            lineItem += appendSpaces(lineItem, maxLength, pos);
        }
        return lineItem;
    } catch (err) {
        uilog("DBUG", err);
        return "";
    }
};

/**
 * Creates a label with same length.
 * labelxx    :
 * labelyyyyy :
 * labelz	  :
 */
function printSameLengthLabel(label, maxLength, char) {
    var spec_char = ":";
    if (char) {
        spec_char = char;
    }
    if (maxLength - label.length >= 0) {
        label += Array((maxLength - label.length) + 1).join(' ');
        label += spec_char + ' ';
    }

    return label;
}

function printKeyValueItem(arg1, arg2, length) {
    return buildLineItem({
        left: arg1,
        right: arg2,
        pad: addSpaces(arg1, arg2, length)
    });
}

function printReceiptTaxComputation(tx, footerSummary) {
    if (tx.type == CONSTANTS.TX_TYPES.SALE.name ||
        tx.type == CONSTANTS.TX_TYPES.SALE_VOID.name ||
        tx.type == CONSTANTS.TX_TYPES.RETURN.name ||
        tx.type == CONSTANTS.TX_TYPES.REFUND.name) {
        var taxDetails = calculateTaxBreakDown(tx);

        if (tx.totalTaxableAmount && tx.totalTaxableAmount > 0) {
            // footerSummary.push(new PrintBlock(
            //     RECEIPT_POS_CENTERED,
            //     getMsgValue('pos_receipt_tax_breakdown_label')));
            // footerSummary.push(new PrintBlock(
            //     RECEIPT_POS_CENTERED,
            //     setTaxBreakdown(taxDetails, tx)));
        }
    }
}

// INDENT 2017-05-18
function printIndentSales(tx, footerSummary) {
    footerSummary.push(new PrintBlock(
        RECEIPT_POS_CENTERED,
        wrapLineItem('INDENT SLIP NUMBER  ', tx.indentSlip, "")));
    footerSummary.push(new PrintBlock(
        RECEIPT_POS_CENTERED,
        wrapLineItem('INDENT DELIVERY DATE', tx.indentExpectedDeliveryDate, "")));
}
// INDENT 2017-05-18

/**
 * Collect GC process data to be printed on receipt. Put to footer summary part
 * @param footerSummary
 */
function printReceiptGiftCardItems(footerSummary) {
    // for GC OGLOBA
    if (GIFTCARDObject && GIFTCARDObject.giftCardItemArray && GIFTCARDObject.giftCardItemArray.length) {
        uilog("DBUG", "printing receipt ogloba gc");
        var gcItems = GIFTCARDObject.giftCardItemArray;
        footerSummary.push(newLine());
        footerSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setLineSummaryItem(getMsgValue('pos_receipt_giftcard_activation_label'))));
        $.each(gcItems, function(index, gcItem) {
            constructGCReceipt(footerSummary, gcItem);
            if (index < gcItems.length) {
                footerSummary.push(new PrintBlock(RECEIPT_POS_CENTERED, "\n"));
            }
        });
    }
    // for GC MMS
    if (GIFTCARDMMSObject && GIFTCARDMMSObject.giftCardMMSTxnArray.length) {
        uilog("DBUG", "printing receipt mms gc");
        footerSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, setLineSummaryItem(getMsgValue('pos_receipt_giftcard_mms_activation_label'))));
        var gcMmsItems = GIFTCARDMMSObject.giftCardMMSTxnArray;
        $.each(GIFTCARDMMSObject.giftCardMMSTxnArray, function(index, gcMmsItems) {
            constructGCReceipt(footerSummary, gcMmsItems);
            if (index < gcMmsItems.length) {
                footerSummary.push(new PrintBlock(RECEIPT_POS_CENTERED, "\n"));
            }
        });
    }
}

/**
 * Construct GC details to be printed.
 * GC activation and redemption processed on ogloba, mms
 * @param footerSummary
 * @param gcItem
 */
function constructGCReceipt(footerSummary, gcItem) {
    var txnType, expireDate;

    if (gcItem.gcTx.gcServerType == 'OGLOBA') {
        txnType = gcItem.baseRequestType;
    } else if (gcItem.gcTx.gcServerType == 'MMS') {
        txnType = CONSTANTS.FUNCTIONS.getGCRequestTypeNameByCode(gcItem.gcTx.requestType);
    }

    footerSummary.push(new PrintBlock(
        RECEIPT_POS_JUSTIFIED,
        setLineSummaryItem(
            getMsgValue('pos_receipt_giftcard_card_type_label'),
            gcItem.gcInfo.cardType)));
    footerSummary.push(new PrintBlock(
        RECEIPT_POS_JUSTIFIED,
        setLineSummaryItem(
            getMsgValue('pos_receipt_giftcard_act_number_label'),
            //hotfix 2-12-2014
            maskValueWithX(((typeof gcItem.gcTx.cardNumber == 'undefined') ? gcItem.gcInfo.cardNumber : gcItem.gcTx.cardNumber), 11, 'LAST'))));
    footerSummary.push(new PrintBlock(
        RECEIPT_POS_JUSTIFIED,
        setLineSummaryItem(
            getMsgValue('pos_receipt_giftcard_transaction_type_label'),
            txnType)));
    //	footerSummary.push(new PrintBlock(
    //			RECEIPT_POS_JUSTIFIED,
    //			setLineSummaryItem(
    //				getMsgValue('pos_receipt_giftcard_date_time_label'),
    //				formatGCTransactionDateRendered(gcItem.gcTx.transactionDate))));
    footerSummary.push(new PrintBlock(
        RECEIPT_POS_JUSTIFIED,
        setLineSummaryItem(
            getMsgValue('pos_receipt_giftcard_prev_balance_label'),
            "Rp" + numberWithCommas(gcItem.gcTx.previousBalance))));
    footerSummary.push(new PrintBlock(
        RECEIPT_POS_JUSTIFIED,
        setLineSummaryItem(
            getMsgValue('pos_receipt_giftcard_top_up_amount_label'),
            "Rp" + numberWithCommas(gcItem.gcTx.amount))));
    footerSummary.push(new PrintBlock(
        RECEIPT_POS_JUSTIFIED,
        setLineSummaryItem(
            getMsgValue('pos_receipt_giftcard_balance_label'),
            "Rp" + numberWithCommas(gcItem.gcTx.balance))));
    footerSummary.push(new PrintBlock(
        RECEIPT_POS_JUSTIFIED,
        setLineSummaryItem(
            getMsgValue('pos_receipt_giftcard_expiry_label'),
            formatGiftCardDate(gcItem.gcTx.expireDate))));
}

/**
 * Add new line of the receipt
 * @returns {PrintBlock}
 */
function newLine() {
    return new PrintBlock(RECEIPT_POS_CENTERED, "\n");
}

/**
 * Breaks the label, value and the
 * idenfier arguments for printing,
 * Used for preventing overlapping
 * and unseen data because of non-break'ed line.
 *
 * @param label
 * @param value
 * @param identifier
 * @param labelPrefix
 * @returnsLineItem
 */
function wrapLineItem(label,
    value,
    identifier,
    labelPrefix) {
    var labelArr = [];
    var valueArr = [];
    var identifierArr = [];

    var labelKey = 'label';
    var labelValueBoundaryKey = "labelValueBoundary";
    var valueKey = 'value';
    var identifierKey = 'identifier';

    var lineItem = null;
    var wrappedLineItemReturn = new StringBuilder("");
    var LineItem = function(label, labelvalueboundary, value, identifier) {
        this[labelKey] = label;
        this[labelValueBoundaryKey] = labelvalueboundary;
        this[valueKey] = value;
        this[identifierKey] = identifier;
    };

    labelArr = (label) ? prefixedSplit(label.toString(),
            CONSTANTS.PRINT_FIELD_CONFIG.LABEL.cap,
            "\n",
            true,
            (labelPrefix) ? labelPrefix : null).split('\n') :
        labelArr;
    valueArr = (value) ? value.toString().wordWrap(CONSTANTS.PRINT_FIELD_CONFIG.VALUE.cap, "\n", true).split('\n') :
        valueArr;
    identifierArr = (identifier) ? identifier.toString().wordWrap(CONSTANTS.PRINT_FIELD_CONFIG.IDENTIFIER.cap, "\n", true).split('\n') :
        identifierArr;
    // Gets the longest length
    var longestLen = Math.max(labelArr.length,
        valueArr.length,
        identifierArr.length);
    for (var counter = 0; counter < longestLen; counter++) {
        lineItem = new LineItem(
            addSpacesPadding(((counter < labelArr.length) // checking out-of-bounds
                    ?
                    labelArr[counter] :
                    ''),
                CONSTANTS.PRINT_FIELD_CONFIG.LABEL.cap,
                CONSTANTS.PRINT_FIELD_CONFIG.LABEL.affix),
            addSpacesPadding(RECEIPT_SPACE,
                CONSTANTS.PRINT_FIELD_CONFIG.LABEL_VALUE_BOUNDARY.cap,
                CONSTANTS.PRINT_FIELD_CONFIG.LABEL_VALUE_BOUNDARY.affix),
            addSpacesPadding(((counter < valueArr.length) // checking out-of-bounds
                    ?
                    valueArr[counter] :
                    ''),
                CONSTANTS.PRINT_FIELD_CONFIG.VALUE.cap,
                CONSTANTS.PRINT_FIELD_CONFIG.VALUE.affix),
            addSpacesPadding(((counter < identifierArr.length) // checking out-of-bounds
                    ?
                    identifierArr[counter] :
                    ''),
                CONSTANTS.PRINT_FIELD_CONFIG.IDENTIFIER.cap,
                CONSTANTS.PRINT_FIELD_CONFIG.IDENTIFIER.affix)
        );
        wrappedLineItemReturn.append(lineItem[labelKey]);
        wrappedLineItemReturn.append(lineItem[labelValueBoundaryKey]);
        wrappedLineItemReturn.append(lineItem[valueKey]);
        wrappedLineItemReturn.append(lineItem[identifierKey]);
        // If last item, do not append 'NEW LINE'
        wrappedLineItemReturn.append((counter < (longestLen - 1) ?
            "\n" :
            ''));
    }
    //console.log("wrappedLineItemReturn : " + wrappedLineItemReturn.toString());
    return wrappedLineItemReturn.toString();
}

/**
 * Add spacing between the string appended from the affix.
 * @param str
 * @param length
 * @param affix
 * @returns {*}
 */
function addSpacesPadding(str, length, affix) {
    var paddedStrReturn = (str) ? str :
        '';
    switch (affix) {
        case CONSTANTS.PRINT_FIELD_AFFIXES.LEFT:
            {
                while (paddedStrReturn.length < length) {
                    paddedStrReturn = RECEIPT_SPACE + paddedStrReturn;
                }
                break;
            }
        case CONSTANTS.PRINT_FIELD_AFFIXES.RIGHT:
            // Fall through condition
        default:
            {
                while (paddedStrReturn.length < length) {
                    paddedStrReturn = paddedStrReturn + RECEIPT_SPACE;
                }
                break;
            }
    }
    return paddedStrReturn;
}

/**
 * Returns a string broken into the desired limit
 * and delimited by the breakWith argument
 *
 * str - the string to break into array
 * maxLen - the cap limit for breaking
 * breakWith - if the limit is reached(maxLen),
 * it breaks the line using this argument
 * cutType - false, do not break long words, otherwise, break it.
 * prefixStr - the desired prefix for each break'ed data.
 *
 **/
function prefixedSplit(str, maxLen, breakWith, cutType, prefixStr) {

    var i, j, l, s, r;
    if (prefixStr) {
        str = (prefixStr + str);
        maxLen -= prefixStr.length;
        breakWith += prefixStr;
    }
    if (maxLen < 1)
        return str;
    for (i = -1, l = (r = str.split("\n")).length; ++i < l; r[i] += s)
        for (s = r[i], r[i] = ""; s.length > maxLen; r[i] += s.slice(0, j) + ((s = s.slice(j)).length ? breakWith : ""))
            j = cutType == 2 || (j = s.slice(0, maxLen + 1).match(/\S*(\s)?$/))[1] ? maxLen : j.input.length - j[0].length ||
            cutType == 1 && maxLen || j.input.length + (j = s.slice(maxLen).match(/^\S*/)).input.length;
    return r.join("\n");
}



/**
 * Sets store transaction summary for printing.
 * Before the store banner details
 *
 * @param tx -
 *            transaction details
 * @returns saleSummary
 */
function setStoreTxnReceiptSummary(tx) {
    var txSummary = new Array();
    try {

        if (tx.promotionItems) {
            setPromotions(tx.promotionItems, txSummary, tx.type);
        }

        var employeeDiscountTotal = Math.abs(calculateEmployeeDiscountTotal(tx));
        if (employeeDiscountTotal != 0) {
            setEmployeeDiscount(employeeDiscountTotal, txSummary, tx.type);
        }
        if (redeemPointTrk == true) {
            var currency = "Points";
        } else {
            var currency = "Rp";
        }
        var finalSaleTxAmount = Math.abs(CASHIER.getFinalSaleTxAmount(tx));
        var bannerTerminalNum = removeLeadingZeroes(configuration.terminalNum);
        var bannerTxNo = removeLeadingZeroes((tx.baseTransactionId) ? tx.baseTransactionId : tx.transactionId);

        txSummary.push(new PrintBlock(RECEIPT_POS_CENTERED,
            RECEIPT_BANNER_DIVIDER));
        txSummary.push(new PrintBlock(RECEIPT_POS_CENTERED,
            CONSTANTS.TX_TYPES.STORE.getTypeLabel()));
        txSummary.push(new PrintBlock(RECEIPT_POS_CENTERED,
            getMsgValue('pos_receipt_terminal_num_label') + bannerTerminalNum));
        txSummary.push(new PrintBlock(RECEIPT_POS_CENTERED,
            getMsgValue('pos_receipt_transaction_num_label') + bannerTxNo));
        txSummary.push(new PrintBlock(RECEIPT_POS_CENTERED,
            "* " + numberWithCommas(isNegativeSign(tx) ? (finalSaleTxAmount * -1) : finalSaleTxAmount) + currency + " *"));
        txSummary.push(new PrintBlock(RECEIPT_POS_CENTERED,
            RECEIPT_BANNER_DIVIDER));

        if ((saleTx.type == CONSTANTS.TX_TYPES.SALE.name) && saleTx.customerId) {
            txSummary.push(new PrintBlock(RECEIPT_POS_JUSTIFIED, 'MEMBER ID: ' + saleTx.customerId));
        }

    } catch (err) {
        uilog("DBUG", "Problem with receipt summary caused by:" + err.message);
    }

    return txSummary;
}

var printColumnWithoutColon = function(colLabel, colVal, colLabelLen, maxLength, pos) {
    try {
        var lineItem = "";
        colVal = "" + colVal;

        var label = printSameLengthLabel(colLabel, colLabelLen, " ");

        if (label) {
            lineItem += label;
        }

        //append spaces to the middle to have it full length
        if (pos && pos == 'right') {
            lineItem += appendSpaces(lineItem, maxLength - colVal.length, pos);
        }

        if (colVal) {
            lineItem += colVal;
        }

        //append spaces to the left to have it full length
        if (!pos && maxLength > lineItem.length) {
            lineItem += appendSpaces(lineItem, maxLength, pos);
        }
        return lineItem;
    } catch (err) {
        uilog("DBUG", err);
        return "";
    }
};

function showPrintingMessage() {
    uilog("DBUG", "showPrintingMessage() -- executed");
    //init interval if receipt is printing.
    if (isPrinting === true) {
        printingStatusInterval = setInterval(function() {
            //Checks if there are dialogs open
            if (isPrinting === true && !$(".ui-dialog").is(":visible")) {
                $("#printerStatusDialog").dialog("open");
                $("#printerStatusDialogMsg").html(getMsgValue("printer_info_status"));
            }
        }, 1000);
    }
};