/**
 * POS CLIENT PROXY MESSAGES
 */

var MESSAGES = MESSAGES || {};

//Scanner Messages
MESSAGES.SCANNER = {};
MESSAGES.SCANNER.INIT_SCANNER_MSG = "Scanner is ready.";
MESSAGES.SCANNER.UNPARSABLE_BARCODE_MSG = "Barcode scanned is unparsable: ";
MESSAGES.SCANNER.DEV_NOT_AVAILABLE = "Scanner is detach.";
MESSAGES.SCANNER.MSG_PROP_INVALID_BARCODE_SCANNED = "invalid_barcode_scanned";
MESSAGES.SCANNER.MSG_PROP_DEV_NOT_AVAILABLE = "scanner_device_not_available";

//Edc Messages
MESSAGES.INIT_EDC_MSG = "Edc terminal is ready.";
MESSAGES.TRANSMISSION_SUCCESS = "[POS => EDC]: Message transmission success.";
MESSAGES.TRANSMISSION_ERROR = "[POS => EDC]: Message transmission failed.";

//Cash Drawer Messages
MESSAGES.DEVICE = MESSAGES.DEVICE || {};
MESSAGES.DEVICE.IBM = MESSAGES.DEVICE.IBM || {};
MESSAGES.DEVICE.IBM.DRAWER_STATUS_CHECK_SUCCESS = 'Drawer status checked.';
MESSAGES.DEVICE.IBM.DRAWER_STATUS_CHECK_ERROR = "Unable to check drawer status.";

module.exports = MESSAGES;