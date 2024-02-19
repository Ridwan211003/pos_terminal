/**
 * Created by mperez@exist.com
 * Exist Global Inc.
 */

var longjohn = require('longjohn');

//longjohn settings
longjohn.async_trace_limit = -1;  // defaults to unlimited

var PAPER_FULL_CUT='\x1b\x69';

//PRINTER UTIL
var printerUtil = {};

/**
 * cut paper receipt
 * @param isThermal
 * @param cutCommand
 * @returns {Array}
 */
printerUtil.cutPaperReceipt = function(isThermal, cutCommand) {
    var arr = [];
    var ctr = 0;

    try {
        //set to full cut if cutCommand is null
        if (cutCommand == null)
            cutCommand = PAPER_FULL_CUT;

        if (isThermal != undefined && isThermal) {
            while (ctr < 5) {
                arr.push(this.newLine());
                ctr++;
            }

            arr.push(this.printerCommand(cutCommand));
        } else {
            while (ctr < 8) {
                arr.push(this.newLine());
                ctr++;
            }

            arr.push(this.printerCommand(cutCommand));
        }
    } catch(err){
        console.log(err);
    }

    return arr;
}


printerUtil.addSpaceOnPaperReceipt = function(isThermal) {
    var arr = [];
    var ctr = 0;

    try {
        //add space on receipt
        if (isThermal != undefined && isThermal) {
            while (ctr < 4) {
                arr.push(this.newLine());
                ctr++;
            }
        } else {
            while (ctr < 8) {
                arr.push(this.newLine());
                ctr++;
            }
        }
    } catch(err){
        console.log(err);
    }
    return arr;
}

/**
 * New line value for adding line in receipt.
 * @returns {{position: string, val: string}}
 */
printerUtil.newLine = function(){
    return {
        position : "left",
        val: " "
    };
}

/**
 * Print Command obj
 * @param code
 * @returns {{position: string, val: *, isCommand: boolean}}
 */
printerUtil.printerCommand = function(code){
        return {
            position : "center",
            val: code,
            isCommand : true
        };
}

/**
 * Accepts item obj:
 * printer - printer api
 * item : {
 *      position - centered, justified
 *      val - value to print/ print code to execute
 *      isCommand - flag if it is a special function of printer instead of printing
 * }
 * @param item
 */
printerUtil.printItem = function(printer, item){
    if(item.isCommand)
        printer.printCommand(item.val);
    else if(item.position == 'centered')
        printer.printCentered(item.val);
    else if(item.position == 'left')
        printer.printLine(item.val);
}

module.exports = printerUtil;
