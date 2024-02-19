/**
 * Created by mperez@exist.com
 * Exist Global Inc.
 */
var Q = require('q');
var printerUtil = require('./printer-util');
//var config = require('../../config/config');
var config = {};
var printer = require('../../devices/printer');

var PAPER_FULL_CUT = '\x1b\x69';
var PAPER_PART_CUT = '\x1b\x6d';

// INHOUSE VOUCHER 2017-04-13
//var VOUCHER_BARCODE = '\x1b\x44\x04\x00\x09\x1d\x68\x08\x1d\x77\x03\x1d\x6b\x49';
var VOUCHER_BARCODE = '\x1d\x77\x02\x1d\x6b\x49';
var VOUCHER_BARCODE_MODE = '\x7b\x43';
// INHOUSE VOUCHER 2017-04-13

var PrinterQueue = {};
PrinterQueue.delay = 300; //default;
/**
 * initialize queue settings such as delay
 * @param terminalConf - configuration data
 */
PrinterQueue.init = function(cf, terminalConf) {
    try {
        config = cf;
        var printerDelay = parseInt(terminalConf.properties['PRINTER_DELAY']);

        this.delay = printerDelay == null ? this.delay : printerDelay;
        console.log("Printer Delay: " + this.delay);

        return this;
    } catch (err) {
        console.log(err);
    }
}

/**
 * Print Receipt in Queue or with time delay
 * @param txData
 * @returns {string}
 */
PrinterQueue.printReceiptQueued = function(txData) {
    var printStatus = "Printing Receipt in Queue Started.";

    try {
        console.log("queue print");
        //Print Flow
        var queue = [];
        var printProcesses = [];
        if (txData.printTo == "P") {
            // Header
            if (txData.header) {
                var header = new ReceiptPart(txData.header);

                queue.push(header);
                printProcesses.push(processQueue);
            }

            if (txData.title) {
                var title = new ReceiptPart(txData.title);

                queue.push(title);
                printProcesses.push(processQueue);
            }

            /*** BODY OF RECEIPT***/
            // Tx Items Scanned
            if (txData.txDetail) {
                var details = new ReceiptPart(txData.txDetail);

                queue.push(details);
                printProcesses.push(processQueue);
            }

            // Tx Payment Details
            if (txData.body) {
                var body = new ReceiptPart(txData.body);

                queue.push(body);
                printProcesses.push(processQueue);
            }

            // Tx Summary Details
            if (txData.summary) {
                var summary = new ReceiptPart(txData.summary);

                queue.push(summary);
                printProcesses.push(processQueue);
            }

            // TopUp Info Details
            if (txData.topUpInfo) {
                for (var d in txData.topUpInfo) {
                    var data = txData.topUpInfo[d];
                    if (data.constructor === Array) {
                        var topUp = new ReceiptPart(data);
                        queue.push(topUp);
                        printProcesses.push(processQueue);
                    } else {
                        var topUp = new ReceiptPart(txData.topUpInfo);
                        queue.push(topUp);
                        printProcesses.push(processQueue);
                        break;
                    }
                }
            }

            // Indosmart Info Details
            if (txData.indosmartInfo) {
                for (var d in txData.indosmartInfo) {
                    var data = txData.indosmartInfo[d];
                    if (data.constructor === Array) {
                        var indosmart = new ReceiptPart(data);
                        queue.push(indosmart);
                        printProcesses.push(processQueue);
                    } else {
                        var indosmart = new ReceiptPart(txData.indosmartInfo);
                        queue.push(indosmart);
                        printProcesses.push(processQueue);
                        break;
                    }
                }
            }

            // MCash Info Details
            if (txData.mCashInfo) {
                for (var d in txData.mCashInfo) {
                    var data = txData.mCashInfo[d];
                    if (data.constructor === Array) {
                        var mCash = new ReceiptPart(data);
                        queue.push(mCash);
                        printProcesses.push(processQueue);
                    } else {
                        var mCash = new ReceiptPart(txData.mCashInfo);
                        queue.push(mCash);
                        printProcesses.push(processQueue);
                        break;
                    }
                }
            }

            // Alterra Info Details
            if (txData.alterraInfo) {
                for (var d in txData.alterraInfo) {
                    var data = txData.alterraInfo[d];
                    if (data.constructor === Array) {
                        var alterra = new ReceiptPart(data);
                        queue.push(alterra);
                        printProcesses.push(processQueue);
                    } else {
                        var alterra = new ReceiptPart(txData.alterraInfo);
                        queue.push(alterra);
                        printProcesses.push(processQueue);
                        break;
                    }
                }
            }

            if (txData.footerSummary) {
                var footerSummary = new ReceiptPart(txData.footerSummary);
                queue.push(footerSummary);
                printProcesses.push(processQueue);
            }

            // INHOUSE VOUCHER 2017-04-13
            if (txData.footer) {
                //adds spaces and cut command
                if (!txData.couponData && !txData.freeParking && !txData.mktInfo && !txData.mlc && !txData.altoWC && !txData.ppp && txData.voucherData != 'undefined' && !(txData.voucherData && txData.voucherData.length > 0 &&
                        typeof txData.voucherData[0].marketingVoucherObj !== 'undefined') && !(txData.specialOrder && txData.specialOrder != 'undefined')) { // CR MLC
                    txData.footer = txData.footer.concat(printerUtil.newLine());
                    if (!config.isThermal) {
                        txData.footer = txData.footer.concat(printerUtil.newLine());
                    }
                    txData.footer = txData.footer.concat(printerUtil.cutPaperReceipt(config.isThermal));
                }
                var footer = new ReceiptPart(txData.footer);

                queue.push(footer);
                printProcesses.push(processQueue);
            }
        }

        if (txData.mktInfo) {
            //adds spaces and cut command
            if (!txData.freeParking && !txData.mlc && !txData.altoWC && !txData.ppp && txData.voucherData != 'undefined' && !(txData.voucherData && txData.voucherData.length > 0 &&
                    typeof txData.voucherData[0].marketingVoucherObj !== 'undefined') && !(txData.specialOrder && txData.specialOrder != 'undefined')) { // CR MLC
                if (!config.isThermal) {
                    txData.mktInfo = txData.mktInfo.concat(printerUtil.newLine());
                }
                txData.mktInfo = txData.mktInfo.concat(printerUtil.cutPaperReceipt(config.isThermal));
            }
            var mktInfo = new ReceiptPart(txData.mktInfo);
            queue.push(mktInfo);
            printProcesses.push(processQueue);
        }

       
        if (txData.kidcity) {
            var voucher = [];
            var trxId = txData.kidcity.transactionId;
            var items = txData.kidcity.transactionDetails;
            
            for (var idx = 0; idx < items.length; idx++) {
                
                var text = items[idx].sku; 
                var result = text.substr(2, 9);
                var data = trxId + result;
                var i = 0;
            
                voucher.push({ 'position': 'centered', 'val': '--  --  --  --  --  --  --  --  --  --' });
                voucher.push(printerUtil.newLine());
                voucher.push(printerUtil.newLine());
            
                if (config.isThermal) {
                    var barcode = VOUCHER_BARCODE_MODE;
                    do {
                        var ch = data[i] + data[i + 1];
                        barcode += String.fromCharCode(parseInt(dechex(ch), 16));
                        i += 2;
                    } while (i < data.length);
            
                    barcode = String.fromCharCode(parseInt(dechex('' + barcode.length), 16)) + barcode;
            
                    //voucher.push({ 'position': 'left', 'val': VOUCHER_BARCODE + barcode });
                    // voucher.push(printerUtil.printerCommand(VOUCHER_BARCODE + barcode + '\x1b\x44\x00'));
                    voucher.push(printerUtil.printerCommand(VOUCHER_BARCODE + barcode));
                }
                
                voucher.push({ 'position': 'centered', 'val': '  ' + ' ' });
                voucher.push({ 'position': 'centered', 'val': data });
                voucher.push({ 'position': 'centered', 'val': items[idx].name });
                voucher.push(printerUtil.newLine());
            }
            
            // for (var b in vouchers) {
            //     var data = '0' + vouchers[b];
            //     var i = 0;

            //     voucher.push({ 'position': 'centered', 'val': '--  --  --  --  --  --  --  --  --  --' });
            //     voucher.push(printerUtil.newLine());
            //     //voucher.push({ 'position': 'centered', 'val': ((config.isThermal) ? '\x1b\x21\x08' : '\x1b\x21\x10') + '    VOUCHER: Rp ' + voucherAmount + ((config.isThermal) ? '\x1b\x21\x00' : '\x1b\x21\x01') + '\x1b\x33\x30\x1b\x4d\x01' + ((config.isThermal) ? '' : '\x1b\x32') });
            //     //voucher.push({'position':'centered', 'val': ((config.isThermal) ? '\x1b\x21\x08' : '') + '    VOUCHER: Rp ' + voucherAmount  + ((config.isThermal) ? '\x1b\x21\x00\x1b\x33\x30\x1b\x4d\x01' : '')});
            //     voucher.push({ 'position': 'centered', 'val': ' ' + teksPromo });
            //     voucher.push({ 'position': 'centered', 'val': ' Exp.Date: ' + voucherExp });
            //     voucher.push(printerUtil.newLine());

            //     if (config.isThermal) {
            //         var barcode = VOUCHER_BARCODE_MODE;
            //         do {
            //             var ch = data[i] + data[i + 1];
            //             barcode += String.fromCharCode(parseInt(dechex(ch), 16));
            //             i += 2;
            //         } while (i < data.length);

            //         barcode = String.fromCharCode(parseInt(dechex('' + barcode.length), 16)) + barcode;

            //         //voucher.push(printerUtil.printerCommand(VOUCHER_BARCODE + barcode + '\x1b\x44\x00'));
            //         //voucher.push(printerUtil.printerCommand(VOUCHER_BARCODE + barcode));
            //     }

            //     //voucher.push({ 'position': 'centered', 'val': '  ' + data.substr(1) });
            //     voucher.push({ 'position': 'centered', 'val': '  ' + ' ' });
            //     voucher.push(printerUtil.newLine());
            //     voucher.push(printerUtil.newLine());
            // }
            
            // var data = txData.kidcity.transactionId + txData.kidcity.transactionDetails[0].sku;
            // var i = 0;
        
            // voucher.push({ 'position': 'centered', 'val': '--  --  --  --  --  --  --  --  --  --' });
            // voucher.push(printerUtil.newLine());
            // voucher.push(printerUtil.newLine());
        
            // if (config.isThermal) {
            //     var barcode = VOUCHER_BARCODE_MODE;
            //     do {
            //         var ch = data[i] + data[i + 1];
            //         barcode += String.fromCharCode(parseInt(dechex(ch), 16));
            //         i += 2;
            //     } while (i < data.length);
        
            //     barcode = String.fromCharCode(parseInt(dechex('' + barcode.length-3), 16)) + barcode;
        
            //     // voucher.push(printerUtil.printerCommand(VOUCHER_BARCODE + barcode + '\x1b\x44\x00'));
        
            //     voucher.push({ 'position': 'left', 'val': VOUCHER_BARCODE + barcode });
            // }
            
            // voucher.push({ 'position': 'centered', 'val': '  ' + ' ' });
            // voucher.push({ 'position': 'centered', 'val': txData.kidcity.transactionDetails[0].name });
            // voucher.push(printerUtil.newLine());
            
            if (!txData.freeParking && !(txData.specialOrder && txData.specialOrder != 'undefined')) {
                if (!config.isThermal) {
                    voucher = voucher.concat(printerUtil.newLine());
                }
                voucher = voucher.concat(printerUtil.cutPaperReceipt(config.isThermal));
            }

            queue.push(new ReceiptPart(voucher));
            printProcesses.push(processQueue);
        }

        //voucher
        // console.log("txData.voucherData");
        // console.log(txData.voucherData);
        if (txData.voucherData && txData.voucherData != 'undefined' && txData.voucherData.length > 0 &&
            typeof txData.voucherData[0].marketingVoucherObj != 'undefined'
        ) {
            //console.log("masuk sini-> txData.voucherData");
            for (var i = 0; i < txData.voucherData.length; i++) {
                var voucher = [];
                var vouchers = txData.voucherData[i].marketingVoucherObj.voucherList;
                var voucherAmount = txData.voucherData[i].marketingVoucherObj.voucherAmt;
                var voucherExp = txData.voucherData[i].marketingVoucherObj.expDate;
                var footerLines = txData.voucherData[i].marketingVoucherObj.promoCouponTemplate;
                var mvea = txData.voucherData[i].marketingVoucherObj.marketingVoucherEligibleAmount;
                var promoHeader = txData.voucherData[i].marketingVoucherObj.promoHeader;
                var promoDesc = txData.voucherData[i].marketingVoucherObj.promoDesc;
                var mvConfig = txData.voucherData[i].marketingVoucherObj.mvConfig;

                var teksPromo = '';
                if(mvea >= parseInt(mvConfig.mvGenReguler) && mvea <= parseInt(mvConfig.mvGenMaxReguler) ||
                mvea >= parseInt(mvConfig.mvGenDeptStore) && mvea <= parseInt(mvConfig.mvGenMaxDeptStore)
                ){
                    teksPromo = promoDesc ;
                }

                for (var b in vouchers) {
                    var data = '0' + vouchers[b];
                    var i = 0;

                    voucher.push({ 'position': 'centered', 'val': '--  --  --  --  --  --  --  --  --  --' });
                    voucher.push(printerUtil.newLine());
                    //voucher.push({ 'position': 'centered', 'val': ((config.isThermal) ? '\x1b\x21\x08' : '\x1b\x21\x10') + '    VOUCHER: Rp ' + voucherAmount + ((config.isThermal) ? '\x1b\x21\x00' : '\x1b\x21\x01') + '\x1b\x33\x30\x1b\x4d\x01' + ((config.isThermal) ? '' : '\x1b\x32') });
                    //voucher.push({'position':'centered', 'val': ((config.isThermal) ? '\x1b\x21\x08' : '') + '    VOUCHER: Rp ' + voucherAmount  + ((config.isThermal) ? '\x1b\x21\x00\x1b\x33\x30\x1b\x4d\x01' : '')});
                    voucher.push({ 'position': 'centered', 'val': ' ' + teksPromo });
                    voucher.push({ 'position': 'centered', 'val': ' Exp.Date: ' + voucherExp });
                    voucher.push(printerUtil.newLine());

                    if (config.isThermal) {
                        var barcode = VOUCHER_BARCODE_MODE;
                        do {
                            var ch = data[i] + data[i + 1];
                            barcode += String.fromCharCode(parseInt(dechex(ch), 16));
                            i += 2;
                        } while (i < data.length);

                        barcode = String.fromCharCode(parseInt(dechex('' + barcode.length), 16)) + barcode;

                        //voucher.push(printerUtil.printerCommand(VOUCHER_BARCODE + barcode + '\x1b\x44\x00'));
                        //voucher.push(printerUtil.printerCommand(VOUCHER_BARCODE + barcode));
                    }

                    //voucher.push({ 'position': 'centered', 'val': '  ' + data.substr(1) });
                    voucher.push({ 'position': 'centered', 'val': '  ' + ' ' });
                    voucher.push(printerUtil.newLine());

                    // FOOTER
                    for (var l in footerLines) {
                        var f = footerLines[l];
                        voucher.push({ 'position': 'left', 'val': f.substr(0, 40) });
                    }
                    voucher.push(printerUtil.newLine());
                }
            }
            if (!txData.freeParking && !(txData.specialOrder && txData.specialOrder != 'undefined')) {
                if (!config.isThermal) {
                    voucher = voucher.concat(printerUtil.newLine());
                }
                voucher = voucher.concat(printerUtil.cutPaperReceipt(config.isThermal));
            }
            queue.push(new ReceiptPart(voucher));
            printProcesses.push(processQueue);
        }
        // INHOUSE VOUCHER 2017-04-13
        // special order
        if (txData.specialOrder && txData.specialOrder != 'undefined') {
            console.log("masuk txData.specialOrder");
            var spcOrder = [];
            spcOrder.push({ 'position': 'centered', 'val': '--  --  --  --  --  --  --  --  --  --' });
            spcOrder.push({ 'position': 'centered', 'val': 'SLIP SPO' });
            spcOrder.push(printerUtil.newLine());
            spcOrder.push({ 'position': 'centered', 'val': 'SPO No: ' + txData.specialOrder.spoNo });
            spcOrder.push({ 'position': 'centered', 'val': 'SPO Type: ' + txData.specialOrder.spoType });
            spcOrder.push(printerUtil.newLine());

            var additional = [];
            for (var i = 1; i < txData.specialOrder.additional.length; i++) {
                additional.push(txData.specialOrder.additional[i]);
            }

            // var txId = '0' + txData.specialOrder.txId; // RAHMAT SPO
            var totalJb = '0' + txData.specialOrder.totalJenisBarang; // RAHMAT SPO
            var totalQty = '0' + txData.specialOrder.totalQuantity; // RAHMAT SPO
            // console.log("totalQty.length"); // RAHMAT SPO
            // console.log(totalQty.length); // RAHMAT SPO

            // if (config.isThermal)
            // {
            // var barcode = VOUCHER_BARCODE_MODE; // RAHMAT SPO
            // var i = 0;
            // var ch = "";
            // 	for(i=0; i < txId.length-1; i+=2) {
            // 		ch = txId[i] + txId[i+1];
            // 		barcode += String.fromCharCode(parseInt(ch));
            // 	}
            /*do
				{
				  var ch = txId[i] + txId[i+1];
				  
				  barcode += String.fromCharCode(parseInt(dechex(ch), 16));
				  i += 2;
				} while(i < txId.length);
			*/
            // barcode = String.fromCharCode(parseInt(dechex('' + barcode.length), 16)) + barcode; // RAHMAT SPO

            // spcOrder.push(printerUtil.printerCommand(VOUCHER_BARCODE + barcode + '\x1b\x44\x00')); // RAHMAT SPO
            // }
            // spcOrder.push({'position':'left', 'val': ' TR: ' + txData.specialOrder.txId}); // RAHMAT SPO
            // spcOrder.push(printerUtil.newLine()); // RAHMAT SPO

            /* if (config.isThermal)
            {
            	var barcode = VOUCHER_BARCODE_MODE; // RAHMAT SPO
            	if(totalJb.length %2 == 1){
            		var ch = "";
            		for(var i=1; i < totalJb.length-1; i+=2) {
            			ch = totalJb[i] + totalJb[i+1];
            			barcode += String.fromCharCode(parseInt(ch));
            		}
            	}
            	else{
            		var ch = "";
            		for(var i=0; i < totalJb.length-1; i+=2) {
            			ch = totalJb[i] + totalJb[i+1];
            			barcode += String.fromCharCode(parseInt(ch));
            		}
            	}
            	barcode = String.fromCharCode(parseInt(barcode.length)) + barcode;
            		console.log("Barcode hasil ahir " + barcode);
            	spcOrder.push(printerUtil.printerCommand(VOUCHER_BARCODE + barcode + '\x1b\x44\x00')); // RAHMAT SPO
            } */
            spcOrder.push({ 'position': 'left', 'val': ' Jenis Barang : ' + txData.specialOrder.totalJenisBarang }); // RAHMAT SPO
            spcOrder.push(printerUtil.newLine()); // RAHMAT SPO
            // console.log("RAHMAT RAHMAT RAHMAT");

            /* if (config.isThermal)
            {
            	var barcode = VOUCHER_BARCODE_MODE;
            	//digit barcode ganjil mulai dari 1
            	if(totalQty.length %2 == 1){
            		var ch = "";
            		for(var i=1; i < totalQty.length-1; i+=2) {
            			ch = totalQty[i] + totalQty[i+1];
            			barcode += String.fromCharCode(parseInt(ch));
            		}
            	}
            	//digit barcode genap mulai dari 0
            	else{ // RAHMAT SPO
            		var ch = "";
            		for(var i=0; i < totalQty.length-1; i+=2) {
            			ch = totalQty[i] + totalQty[i+1];
            			barcode += String.fromCharCode(parseInt(ch));
            		}
            	}
            	barcode = String.fromCharCode(parseInt(barcode.length)) + barcode;
            		console.log("Barcode hasil ahir " + barcode);
            	spcOrder.push(printerUtil.printerCommand(VOUCHER_BARCODE + barcode + '\x1b\x44\x00')); // RAHMAT SPO
            } */
            spcOrder.push({ 'position': 'left', 'val': ' Total Barang : ' + txData.specialOrder.totalQuantity }); // RAHMAT SPO
            spcOrder.push(printerUtil.newLine());

            if (!txData.freeParking) {
                if (!config.isThermal) {
                    spcOrder = spcOrder.concat(printerUtil.newLine());
                }
                spcOrder = spcOrder.concat(printerUtil.cutPaperReceipt(config.isThermal));
            }

            queue.push(new ReceiptPart(spcOrder));

            printProcesses.push(processQueue);

            queue.push(new ReceiptPart(additional));
            printProcesses.push(processQueue);


        } //special order
        //freeParking
        if (txData.freeParking) {
            //adds spaces and cut command
            if (config.isThermal) {
                txData.freeParking.unshift(printerUtil.newLine());
                txData.freeParking.unshift(printerUtil.newLine());
                txData.freeParking.splice(txData.freeParking.length - 5, 0, printerUtil.printerCommand(PAPER_PART_CUT));
            } else {
                txData.freeParking.splice(txData.freeParking.length - 2, 0, printerUtil.printerCommand(PAPER_PART_CUT));
                //txData.freeParking.splice(0,0, printerUtil.printerCommand(PAPER_PART_CUT));
            }
            if (!txData.mlc && !txData.altoWC && !txData.ppp) txData.freeParking = txData.freeParking.concat(printerUtil.cutPaperReceipt(config.isThermal));
            var freeParking = new ReceiptPart(txData.freeParking);

            queue.push(freeParking);
            printProcesses.push(processQueue);
        }

        //return coupon
        if (txData.couponData) {
            //adds spaces and cut command
            if (config.isThermal) {
                txData.couponData.unshift(printerUtil.newLine());
                txData.couponData.unshift(printerUtil.newLine());

                if (txData.couponData.isReturnTrkSales) {
                    txData.couponData.splice(txData.couponData.length - 10, 0, printerUtil.printerCommand(PAPER_PART_CUT));
                } else {
                    txData.couponData.splice(txData.couponData.length - 8, 0, printerUtil.printerCommand(PAPER_PART_CUT));
                }
            } else {
                if (txData.couponData.isReturnTrkSales) {
                    txData.couponData.splice(txData.couponData.length - 4, 0, printerUtil.printerCommand(PAPER_PART_CUT));
                } else {
                    txData.couponData.splice(txData.couponData.length - 2, 0, printerUtil.printerCommand(PAPER_PART_CUT));
                }
                //txData.freeParking.splice(0,0, printerUtil.printerCommand(PAPER_PART_CUT));
            }
            if (!txData.mlc) txData.couponData = txData.couponData.concat(printerUtil.cutPaperReceipt(config.isThermal));
            var couponData = new ReceiptPart(txData.couponData);

            queue.push(couponData);
            printProcesses.push(processQueue);
        }

        if (txData.copyTrk) {
            txData.copyTrk = txData.copyTrk.concat(printerUtil.cutPaperReceipt(config.isThermal));
            var copyTrk = new ReceiptPart(txData.copyTrk);

            queue.push(copyTrk);
            printProcesses.push(processQueue);
        }

        // CR OVO
        if (txData.ovo) {
            //adds spaces and cut command
            if (config.isThermal) {
                // CR OVO ADD SIGN
                txData.ovo.splice(txData.ovo.length - 9, 0, printerUtil.printerCommand(PAPER_PART_CUT));
                // CR OVO ADD SIGN
                //console.log("masuk printer");
            } else {
                txData.ovo.splice(txData.ovo.length - 2, 0, printerUtil.printerCommand(PAPER_PART_CUT));
                //txData.freeParking.splice(0,0, printerUtil.printerCommand(PAPER_PART_CUT));
            }
            if (!config.isThermal) {
                txData.ovo = txData.ovo.concat(printerUtil.newLine());
            }
            txData.ovo = txData.ovo.concat(printerUtil.cutPaperReceipt(config.isThermal));
            var ovo = new ReceiptPart(txData.ovo);

            queue.push(ovo);
            printProcesses.push(processQueue);
        }

        // CR QRTTS
        if (txData.qrtts) {
            //adds spaces and cut command
            if (config.isThermal) {
                // CR MLC ADD SIGN
                txData.qrtts.splice(txData.qrtts.length - 9, 0, printerUtil.printerCommand(PAPER_PART_CUT));
                // CR MLC ADD SIGN
                //console.log("masuk printer");
            } else {
                txData.qrtts.splice(txData.qrtts.length - 2, 0, printerUtil.printerCommand(PAPER_PART_CUT));
                //txData.freeParking.splice(0,0, printerUtil.printerCommand(PAPER_PART_CUT));
            }
            if (!config.isThermal) {
                txData.qrtts = txData.qrtts.concat(printerUtil.newLine());
            }
            txData.qrtts = txData.qrtts.concat(printerUtil.cutPaperReceipt(config.isThermal));
            var qrtts = new ReceiptPart(txData.qrtts);

            queue.push(qrtts);
            printProcesses.push(processQueue);
        }
        
        // CR MLC
        if (txData.mlc) {
            //adds spaces and cut command
            if (config.isThermal) {
                // CR MLC ADD SIGN
                txData.mlc.splice(txData.mlc.length - 9, 0, printerUtil.printerCommand(PAPER_PART_CUT));
                // CR MLC ADD SIGN
                //console.log("masuk printer");
            } else {
                txData.mlc.splice(txData.mlc.length - 2, 0, printerUtil.printerCommand(PAPER_PART_CUT));
                //txData.freeParking.splice(0,0, printerUtil.printerCommand(PAPER_PART_CUT));
            }
            if (!config.isThermal) {
                txData.mlc = txData.mlc.concat(printerUtil.newLine());
            }
            txData.mlc = txData.mlc.concat(printerUtil.cutPaperReceipt(config.isThermal));
            var mlc = new ReceiptPart(txData.mlc);

            queue.push(mlc);
            printProcesses.push(processQueue);
        }
        if (txData.altoWC) {
            //adds spaces and cut command
            if (config.isThermal) {
                // CR MLC ADD SIGN
                txData.altoWC.splice(txData.altoWC.length - 7, 0, printerUtil.printerCommand(PAPER_PART_CUT));
                // CR MLC ADD SIGN
                //console.log("masuk printer");
            } else {
                txData.altoWC.splice(txData.altoWC.length - 2, 0, printerUtil.printerCommand(PAPER_PART_CUT));
                //txData.freeParking.splice(0,0, printerUtil.printerCommand(PAPER_PART_CUT));
            }
            txData.altoWC = txData.altoWC.concat(printerUtil.cutPaperReceipt(config.isThermal));
            var altoWC = new ReceiptPart(txData.altoWC);

            queue.push(altoWC);
            printProcesses.push(processQueue);
        }
        // CR MLC
        if (txData.ppp) {
            //adds spaces and cut command
            if (config.isThermal) {
                // CR MLC ADD SIGN
                txData.ppp.splice(txData.ppp.length - 7, 0, printerUtil.printerCommand(PAPER_PART_CUT));
                // CR MLC ADD SIGN
                //console.log("masuk printer");
            } else {
                txData.ppp.splice(txData.ppp.length - 2, 0, printerUtil.printerCommand(PAPER_PART_CUT));
                //txData.freeParking.splice(0,0, printerUtil.printerCommand(PAPER_PART_CUT));
            }
            txData.ppp = txData.ppp.concat(printerUtil.cutPaperReceipt(config.isThermal));
            var ppp = new ReceiptPart(txData.ppp);

            queue.push(ppp);
            printProcesses.push(processQueue);
        }

        //balloonGame
        if (txData.balloonGame) {
            //adds spaces and cut command
            if (!config.isThermal) {
                txData.balloonGame = txData.balloonGame.concat(printerUtil.newLine());
            }
            txData.balloonGame = txData.balloonGame.concat(printerUtil.cutPaperReceipt(config.isThermal));
            var balloonGame = new ReceiptPart(txData.balloonGame);

            queue.push(balloonGame);
            printProcesses.push(processQueue);
        }

        //eft online printing
        if (txData.eftOnline) {
            //adds spaces and cut command
            if (!config.isThermal) {
                txData.eftOnline = txData.eftOnline.concat(printerUtil.newLine());
            }
            txData.eftOnline = txData.eftOnline.concat(printerUtil.cutPaperReceipt(config.isThermal));
            var eft = new ReceiptPart(txData.eftOnline);

            queue.push(eft);
            printProcesses.push(processQueue);
        }

        if (txData.isInstallmentTransaction) {
            /*var installment = new ReceiptPart(txData.isInstallmentTransaction);
            queue.push(installment);*/
            printProcesses.push(printInstallmentInQueue);
        }

        /**Eft Reports START**/
        if (txData.eftSettlementAll) {
            //adds spaces and cut command
            if (!config.isThermal) {
                txData.eftSettlementAll = txData.eftSettlementAll.concat(printerUtil.newLine());
            }
            txData.eftSettlementAll = (txData.eftSettlementAll).concat(printerUtil.cutPaperReceipt(config.isThermal));
            var eftSettlement = new ReceiptPart(txData.eftSettlementAll);

            queue.push(eftSettlement);
            printProcesses.push(processQueue);
        }

        if (txData.eftTransactionSummaryData) {
            //adds spaces and cut command
            if (!config.isThermal) {
                txData.eftTransactionSummaryData = txData.eftTransactionSummaryData.concat(printerUtil.newLine());
            }
            txData.eftTransactionSummaryData = (txData.eftTransactionSummaryData).concat(printerUtil.cutPaperReceipt(config.isThermal));
            var eftTransactionSummary = new ReceiptPart(txData.eftTransactionSummaryData);

            queue.push(eftTransactionSummary);
            printProcesses.push(processQueue);
        }

        if (txData.eftDetailTransactionReport) {
            //adds spaces and cut command
            if (!config.isThermal) {
                txData.eftDetailTransactionReport = txData.eftDetailTransactionReport.concat(printerUtil.newLine());
            }
            txData.eftDetailTransactionReport = (txData.eftDetailTransactionReport).concat(printerUtil.cutPaperReceipt(config.isThermal));
            var eftDetailTransactionReport = new ReceiptPart(txData.eftDetailTransactionReport);

            queue.push(eftDetailTransactionReport);
            printProcesses.push(processQueue);
        }
        /**Eft Reports END**/

        //Adds stopPrintingReceipt at the last element in queue
        if (!txData.isInstallmentTransaction) {
            printProcesses.push(stopPrintingReceipt);
        }

        //Set processQueue Params
        var printingProcessParams = {
            delay: 0,
            queue: queue,
            txData: txData
        };

        //Processes printProcesses array sequentially
        if (printProcesses.length > 0) {
            var result = Q(printingProcessParams);
            printProcesses.forEach(function(p) {
                result = result.then(p);
            });
        }

        return printStatus;
    } catch (err) {
        console.log(err.message);
        console.log("Unable to print receipt");
        printStatus = "Unable to print receipt;";
        return printStatus;
    }
};

/**
 * ReceiptPart
 * - part of receipt containing its data
 * - add properties to receipt for additional options
 */
var ReceiptPart = function ReceiptPart(items) {
    this.items = items;
};

/*****************************************
 * Q Implementation of printing --> START
 * Process Flow
 *****************************************/
/**
 * Processes Receipt Component inside the Array/Queue
 * @param params contains:
 *  count        : 0,
 *  queue        : queue,
 *  txData       : txData
 * @returns {promise}
 *    - tracks params updated data and pass to next item in Array/Queue
 */
var processQueue = function(params) {
    var items = null;
    var deferred = Q.defer();

    try {
        setTimeout(function() {
            items = params.queue[0].items;

            var result = Q(items);
            for (var count = 0; count < items.length; count++) {
                result = result.then(printItemsInQueue);
            }
            //time delay for the next queue to execute
            params.delay = count;
            params.queue = params.queue.splice(1);
            deferred.resolve(params);
        }, params.delay * PrinterQueue.delay);

    } catch (err) {
        console.log("Error caught on processQueue: " + err);
    }
    return deferred.promise;
};

/**
 * Prints the items sequentially
 * @param items
 *  -- actual data of the receipt component that is printed.
 * @returns {promise}
 *  -- return value is the items that are not yet printed.
 */
var printItemsInQueue = function(items) {
    var deferred = Q.defer();

    setTimeout(function() {
        //console.log("Test: " + JSON.stringify(items[0]));
        printer.printItem(items[0]);
        deferred.resolve(items.splice(1));
    }, PrinterQueue.delay);

    return deferred.promise;
};

/**
 * printInstallmentInQueue
 *    - In queue that processes installment receipt
 * @param params
 */
var printInstallmentInQueue = function(params) {
    var installment = null;
    var deferred = Q.defer();

    try {
        setTimeout(function() {
            if (params && params.txData && params.txData.isInstallmentTransaction) {
                installment = params.txData.isInstallmentTransaction;
                PrinterQueue.printReceiptQueued(installment);
            }
        }, params.delay * PrinterQueue.delay);

        deferred.resolve();
    } catch (err) {
        console.log("Error caught on processQueue: " + err);
    }
    return deferred.promise;
};

//Sends the status of the printer
var stopPrintingReceipt = function(params) {
    var deferred = Q.defer();

    setTimeout(function() {
        printer.sendPrintingStatus(false);
    }, params.delay * PrinterQueue.delay);

    return deferred.promise;
};

// INHOUSE VOUCHER 2017-04-13
function dechex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof(padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}

function numberWithCommas(val) {
    var renderedVal = new String(val);
    return renderedVal.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
// INHOUSE VOUCHER 2017-04-13

/*****************************************
 * Q Implementation of printing --> END
 * Process Flow
 *****************************************/
module.exports = PrinterQueue;