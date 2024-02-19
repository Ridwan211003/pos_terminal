/*******************************************************************************
 * START : CONSTANTS
 ******************************************************************************/
 var CONSTANTS = CONSTANTS || {};

 var TX_TYPE = function TX_TYPE(name, typeLabel) {
     //invoke base constructor
     Enum.call(this, name);
     this.typeLabel = typeLabel;
 };
 TX_TYPE.prototype = new Enum();
 TX_TYPE.prototype.constructor = TX_TYPE;
 /**
  * Returns the txType Label if any, if not available
  * returns the search argument
  */
 TX_TYPE.prototype.getTypeLabel = function() {
     var typeLabelLocal = this.typeLabel;
     // Returns the name if typeLabel is null/undefined;
     if (!typeLabelLocal) {
         typeLabelLocal = (this.name) ? this.name : null;
     }
     return typeLabelLocal;
 };
 /**
  * Process the name for Display,
  * removing unnecessary characters, and converting
  * underscores to spaces.
  * @returns
  */
 TX_TYPE.prototype.getDisplayName = function() {
 
     // Convert underscore to space
     var nameForDisplay = configuration.paymentMediaTypes[this.name] || this.name.split('_').join(' ');
     // Removed unwanted characters
     nameForDisplay = nameForDisplay.replace(/[|&;$%@"<>()+,]/g, "");
     return nameForDisplay;
 };
 
 // START - CONSTANTS FUNCTIONS
 
 CONSTANTS.FUNCTIONS = CONSTANTS.FUNCTIONS || {};
 
 /**
  * Finds the TX_TYPE instance by name
  */
 CONSTANTS.FUNCTIONS.findTxTypeByName = function(nameToSearch) {
     var txTypeToReturn = null;
     if (nameToSearch) {
         for (key in this) {
             var currTxType = this[key];
             if (!isFunction(currTxType) // Checks if the current key is not a function
                 // Checks if instance of TX_TYPE
                 &&
                 TX_TYPE.prototype.toString.call(this) &&
                 currTxType.name == nameToSearch) {
                 txTypeToReturn = currTxType;
                 break;
             }
         }
     }
     return txTypeToReturn;
 };
 
 /**
  * Format/Replace the {0} place holder of the keyToFormat parameter by the value of the
  * nameToSearch's TX_TYPE argument(whether the 1st (name) OR the 2nd( type label)).
  *
  * @param nameToSearch the name used for searching the TX_TYPE instance from which the typeLabel(the 2nd argument)
  * would be extracted.
  * @param keyToFormat the String with a {0} placeholder in which the extracted typeLabel would be supplied. see: nameToSearch, for
  * the typeLabel reference.
  * @param isToUpper sets the output to either UPPER-CASE when TRUE, FALSE to lower-case, otherwise maintain
  * the original casing.
  * @param isToUse2ndArgument tells whether to substitute the 1st or 2nd argument.
  */
 CONSTANTS.FUNCTIONS.formatKeyByTxTypeArguments = function(nameToSearch,
     keyToFormat,
     isToUpper,
     isToUse2ndArgument) {
     var formattedKey = null;
     var searchedTxType = null;
     if (this.findTxTypeByName // checks if findTxTypeByName is Existing
         &&
         nameToSearch &&
         (searchedTxType = this.findTxTypeByName(nameToSearch)) &&
         keyToFormat &&
         (isToUse2ndArgument != undefined)) {
         // if isToUse2ndArgument[TRUE], fetch the value, null otherwise
         var typeLabel = (isToUse2ndArgument) ? searchedTxType.getTypeLabel() :
             null;
         /* i.e. keyToFormat = "{0} is handsome and {1}!"
          * keyToFormat.format("MJ", "cute") returns "MJ is handsome and cute!";
          */
         formattedKey = keyToFormat.format((typeLabel) ? typeLabel :
             searchedTxType.name);
         // Change spaces to underscores(_)
         formattedKey = formattedKey.split(' ').join('_');
         // if undefined, remain as is.
         formattedKey = (isToUpper == undefined) ? formattedKey :
             (isToUpper) ? formattedKey.toUpperCase() :
             formattedKey.toLowerCase();
     }
     return formattedKey;
 };
 
 // END - CONSTANTS FUNCTIONS
 
 CONSTANTS.STATUS = {
 
     COMPLETED: "COMPLETED",
     VOIDED: "VOIDED",
     CANCELLED: "CANCELLED"
 };
 
 CONSTANTS.TX_TYPES = {
 
     SALE: new TX_TYPE("SALE", null),
     ITEM_VOID: new TX_TYPE("ITEM VOID", null),
     SALE_VOID: new TX_TYPE("VOID", "POST SALE VOID"),
     STORE: new TX_TYPE("STORE", "STORED SALE"),
     RECALL: new TX_TYPE("RECALL", "RECALLED SALE"),
     PICKUP: new TX_TYPE("PICKUP", null),
     FLOAT: new TX_TYPE("FLOAT", null),
     BILL_PAYMENT: new TX_TYPE("BILL_PAYMENT", "BILL PAYMENT"),
     ELEBOX: new TX_TYPE("ELEBOX", "ELEBOX"),
     BPJS: new TX_TYPE("BPJS", "BPJS"),
     SIMPATINDO: new TX_TYPE("SIMPATINDO", "SIMPATINDO"),
     MCASH: new TX_TYPE("MCASH", "MCASH"),
     INDOSMART: new TX_TYPE("INDOSMART", "INDOSMART"),
     ALTERRA: new TX_TYPE("ALTERRA", "ALTERRA"),
 
     /* Not actually a POS Transaction type, but a status of the transaction
      * Used for Supervisor Intervention.
      */
     CANCEL_SALE: new TX_TYPE("CANCEL SALE", null),
     RETURN: new TX_TYPE("RETURN", null),
     REFUND: new TX_TYPE("REFUND", null),
     REPRINT_RECEIPT: new TX_TYPE("REPRINT RECEIPT", null),
     LOGOUT: new TX_TYPE("LOGOUT", null),
     FORCE_SHUTDOWN: new TX_TYPE("FORCE SHUTDOWN", null),
     TVS_SALE: new TX_TYPE("TVS_SALE", null),
     BANK_MEGA: new TX_TYPE("BANK MEGA", null),
     CASHIER_X_REPORT: new TX_TYPE("CASHIER X REPORT", null),
     GC_INPUT: new TX_TYPE("GIFT CARD INPUT", null),
     SPV_OTP: new TX_TYPE("OTP SUPERVISOR", null),
     SPV_EARN: new TX_TYPE("EARN POINT MANUAL", null),
 
     /*
      * Used for amount paid/refunded/returned display
      */
     KEY_MESSAGES_PROP_AMOUNT_RENDERED_PARAM: "pos_label_amount_{0}_param",
     KEY_MESSAGES_PROP_QTY_FORMAT: "pos_receipt_qty_{0}_label"
 };
 //Adding the findTxTypeByName() function as part of the CONSTANTS.TX_TYPES object
 CONSTANTS.TX_TYPES.findTxTypeByName = CONSTANTS.FUNCTIONS.findTxTypeByName;
 CONSTANTS.TX_TYPES.formatKeyByTxTypeArguments = CONSTANTS.FUNCTIONS.formatKeyByTxTypeArguments;
 /**
  * Non Goods(order item) related transaction types
  */
 CONSTANTS.NON_GOODS_TX_TYPES = {
 
     FLOAT: CONSTANTS.TX_TYPES.FLOAT,
     PICKUP: CONSTANTS.TX_TYPES.PICKUP
 };
 CONSTANTS.NON_GOODS_TX_TYPES.findTxTypeByName = CONSTANTS.FUNCTIONS.findTxTypeByName;
 
 /**
  * Constants for password change feature
  */
 CONSTANTS.PASS_CHANGE_TYPES = {
     FIRST_LOGIN: new TX_TYPE("FIRST_LOGIN", "CHANGE PASSWORD"),
     FORCED_CHANGE: new TX_TYPE("FORCED_CHANGE", "CHANGE PASSWORD"),
     RESET_BLOCKED: new TX_TYPE("RESET_BLOCKED", null),
     EXPIRED: new TX_TYPE("EXPIRED", null),
 
     //Other common KEY values for payment media types
     KEY_MESSAGES_PROP_FORMAT: "pos_pwd_chg_lbl_{0}"
 };
 //Adding the findTxTypeByName() function as part of the CONSTANTS.PASS_CHANGE_TYPES object
 CONSTANTS.PASS_CHANGE_TYPES.findTxTypeByName = CONSTANTS.FUNCTIONS.findTxTypeByName;
 CONSTANTS.PASS_CHANGE_TYPES.formatKeyByTxTypeArguments = CONSTANTS.FUNCTIONS.formatKeyByTxTypeArguments;
 
 /**
  * Constants for Promotion START
  */
 
 /*
 CONSTANTS.PROMOTION_TYPES = {
 
         AUTOMATIC_MARKDOWN   : "1",
         BUY_N_GET_Y_PROMOTION : "2",
         BUY_N_AT_PROMOTION   : "4",
         SLIDING_DISCOUNT   : "8",
         MEMBER_PROMOTION       : "M",
         BUY_N_A_GET_Y_B_PROMOTION : "5"
 };*/
 
 CONSTANTS.MEMBER_SUB_TYPE = {
 
     COBRAND: "COBRAND",
     CRM: "CRM"
 };
 
 // CR ADD DISCOUNT
 CONSTANTS.PROMOTION_TYPES = {
 
     AUTOMATIC_MARKDOWN: { type: "1", subtype: null },
     BUY_N_GET_Y_PROMOTION: { type: "2", subtype: null },
     BUY_N_AT_PROMOTION: { type: "4", subtype: null },
     SLIDING_DISCOUNT: { type: "8", subtype: null },
     MEMBER_COBRAND_PROMOTION: { type: "M", subtype: CONSTANTS.MEMBER_SUB_TYPE.COBRAND },
     MEMBER_CRM_PROMOTION: { type: "M", subtype: CONSTANTS.MEMBER_SUB_TYPE.CRM },
     BUY_N_A_GET_Y_B_PROMOTION: { type: "5", subtype: null },
     PURCHASE_WITH_PURCHASE: { type: "7", subtype: null },
     ADDITIONAL_DISCOUNT: { type: "9", subtype: null }
 };
 // CR ADD DISCOUNT
 
 // EVENT REWARDS
 CONSTANTS.EVENT_REWARD_TYPES = {
     STAMPS: 1,
     COUPON: 2,
     LUCKYCUST: 3
 }
 
 CONSTANTS.PROMOTION_DISCOUNT_TYPES = {
 
     PERCENT_DISCOUNT: 2,
     AMOUNT_OFF: 3,
     PROMO_SELLING_PRICE: 1
 };
 
 CONSTANTS.PROMOTION_TARGET_GRP = {
 
     GENERAL: 0,
     MEMBER: 1
 };
 
 CONSTANTS.PROMOTION_ITEM_TYPE = {
 
     QUALIFIER: 1,
     REWARD: 2
 };
 
 CONSTANTS.SLIDING_PROMOTION_MODE = {
 
     TP_LINUX: "1",
     POSS: "2"
 };
 
 /**
  * Constants for Promotion END
  */
 
 
 /**
  * START: Constants for Payment media types.
  */
 CONSTANTS.PAYMENT_MEDIA_TYPES = {
     /**
      * Usage of TX_TYPE arguments below
      *
      * 1.) Currently the 1st argument( name) is used to substitute to KEY_MESSAGES_PROP_FORMAT's {0}
      * 2.) The 2nd argument (type label) is used to substitute to KEY_CONFIG_AMOUNT_[MIN/MAX]'s {0},
      *     if the 2nd argument is null, it then use the 1st argument(name) as a substitute.
      *
      * Other notes:
      * 1.) the 1st argument (name) will also served as the look-up for the Enumeration Code value
      * to save in the PosPayment entity.
      */
     CASH: new TX_TYPE("CASH", null),
     FLAZZ: new TX_TYPE("FLAZZ", null),
     COUPON: new TX_TYPE("COUPON", null),
     COUPON_RETURN: new TX_TYPE("COUPON_RETURN", null),
     SODEXO: new TX_TYPE("SODEXO", null),
     GC: new TX_TYPE("GC", null),
     GC_MMS: new TX_TYPE("GC_MMS", null),
     TRK_POINT: new TX_TYPE("TRK_POINT", null),
     TRK_SALES: new TX_TYPE("TRK_SALES", null),
     EFT_ONLINE: new TX_TYPE("EFT_ONLINE", "EFT"),
     CMC_EFT_ONLINE: new TX_TYPE("CMC_EFT_ONLINE", null),
     CMC_EFT_OFFLINE: new TX_TYPE("CMC_EFT_OFFLINE", null),
     EFT_OFFLINE: new TX_TYPE("EFT_OFFLINE", "EFT"),
     EDC_BCA: new TX_TYPE("EDC_BCA", null),
     DEBIT: new TX_TYPE("DEBIT", null),
     EDC_PAYMENT: new TX_TYPE("EDC_PAYMENT", null),
     INSTALLMENT: new TX_TYPE("INSTALLMENT", null),
     CRM_POINTS: new TX_TYPE("CRM_POINTS", null),
     FLASHIZ: new TX_TYPE("FLASHIZ", null),
     VOUCHER: new TX_TYPE("VOUCHER", null), // INHOUSE VOUCHER 2017-04-13
     // MLC 2017-04-21
     MLC_ONLINE: new TX_TYPE("MEGA_SMARTPAY_ONLINE", null),
     MLC_OFFLINE: new TX_TYPE("MEGA_SMARTPAY_OFFLINE", null),
     //Allo Payment 
     ALLO_PAYMENT : new TX_TYPE("ALLO_PAYMENT", null),
     OVO_PAYMENT : new TX_TYPE("OVO_PAYMENT", null),
     ALTOWECHAT: new TX_TYPE("ALTO_QR_PAY", null),
     POWER_POINT_PURCHASE: new TX_TYPE("POWER_POINT_PURCHASE", null),
     // MLC 2017-04-21
     // TODO add other relevant payment media here...
 
     // Other common KEY values for payment media types
     KEY_MESSAGES_PROP_FORMAT: "pos_receipt_{0}_label", // used the 1st argument
     KEY_CONFIG_AMOUNT_MIN: "{0}_MINIMUM_AMOUNT", // used the 2nd argument, else the 1st
     KEY_CONFIG_AMOUNT_MAX: "{0}_MAXIMUM_AMOUNT", // used the 2nd argument, else the 1st
     KEY_CONFIG_AMOUNT_CHANGE_MIN: "{0}_MIN_CHANGE_AMOUNT", // used 1st
     KEY_CONFIG_AMOUNT_CHANGE_MAX: "{0}_MAX_CHANGE_AMOUNT" // used 1st
 };
 // Adding the findTxTypeByName() function as part of the CONSTANTS.PAYMENT_MEDIA_TYPES object
 CONSTANTS.PAYMENT_MEDIA_TYPES.findTxTypeByName = CONSTANTS.FUNCTIONS.findTxTypeByName;
 CONSTANTS.PAYMENT_MEDIA_TYPES.formatKeyByTxTypeArguments = CONSTANTS.FUNCTIONS.formatKeyByTxTypeArguments;
 
 CONSTANTS.PAYMENT_MEDIA_FLOW_TYPES = {
 
     SALE: CONSTANTS.TX_TYPES.SALE.name,
     RETURN: CONSTANTS.TX_TYPES.RETURN.name,
     REFUND: CONSTANTS.TX_TYPES.REFUND.name,
     FLOAT: CONSTANTS.TX_TYPES.FLOAT.name,
     PICKUP: CONSTANTS.TX_TYPES.PICKUP.name,
     BILL_PAYMENT: CONSTANTS.TX_TYPES.BILL_PAYMENT.name,
     ELEBOX: CONSTANTS.TX_TYPES.ELEBOX.name,
     BPJS: CONSTANTS.TX_TYPES.BPJS.name,
     SIMPATINDO: CONSTANTS.TX_TYPES.SIMPATINDO.name,
     MCASH: CONSTANTS.TX_TYPES.MCASH.name,
     ALTERRA: CONSTANTS.TX_TYPES.ALTERRA.name,
     INDOSMART: CONSTANTS.TX_TYPES.INDOSMART.name,
 };
 
 /**
  * END: Constants for Payment media types.
  */
 
 /**
  * Constants used in CRM Payment types.
  */
 CONSTANTS.CRM_PAYMENT_TYPES = {
     CASH: "PTYP001",
     GC: "PTYP002",
     VOUCHER: "PTYP003",
     CRM_POINTS: "PTYP004",
     FLAZZ: "PTYP005",
     COUPON: "PTYP006",
     INSTALLMENT: "PTYP007",
     EFT_ONLINE: "PTYP008",
     EDC_PAYMENT: "PTYP009",
     SODEXO: "PTYP010",
     DEBIT: "PTYP011",
     EFT_OFFLINE: "PTYP012",
     CMC_EFT_OFFLINE: "PTYP013",
     CMC_EFT_ONLINE: "PTYP014",
     EDC_BCA: "PTYP015",
     COUPON_RETURN: "PTYP016",
 };
 
 /**
  * Constants used in CRM Member types.
  */
 CONSTANTS.CRM_MEMBER_TYPES = {
     PERSONAL: "MTYP001",
     EMPLOYEE: "MTYP002"
 };
 
 CONSTANTS.CRM_PROFIT_CODE = {
     COBRAND: "C",
     GOLD_MEMBER: "A",
     SILVER_MEMBER: "B"
 };
 
 CONSTANTS.CRM_MEMBER_TYPES_DESC = {
     PROFESSIONAL: "PROFESSIONAL",
     NONMEMBER: "NONMEMBER",
     INDIVIDUAL: "INDIVIDUAL",
     EMPLOYEE: "EMPLOYEE",
     MEMBER_TYPE_UNKNOWN: "MEMBER_TYPE_UNKNOWN"
 };
 
 CONSTANTS.EFT = {
     TYPE: {
         ONLINE_PAYMENT: "ONLINE_PAYMENT",
         DEBIT: "DEBIT",
         EDC_PAYMENT: "EDC_PAYMENT",
         CMC_PAYMENT: "CMC_PAYMENT",
         CMC_OFFLINE_PAYMENT: "CMC_OFFLINE_PAYMENT",
         EDC_BCA: "EDC_BCA",
         OFFLINE_PAYMENT: "OFFLINE_PAYMENT",
         TRK_POINT: "TRK_POINT",
         TRK_SALES: "TRK_SALES",
         POWER_POINT_PURCHASE: "POWER_POINT_PURCHASE"
     },
     BANK_ID_INPUT: {
         MANUAL: "manual bank id",
         AUTO: "auto bank id",
         AUTO_CONDITIONAL: "auto-conditional bank id"
     },
     BANK_ID_INPUT_STATUS: {
         MANUAL: 1,
         AUTO_SUCCESS: 2,
         AUTO_FAILED: 3
     },
     CRYPT_MODE: {
         CBC: { name: 'CBC', value: CryptoJS.mode.CBC },
         ECB: { name: 'ECB', value: CryptoJS.mode.ECB }
     },
     CRYPT_PAD: {
         ZERO_PADDING: { name: 'ZERO_PADDING', value: CryptoJS.pad.ZeroPadding },
         NO_PADDING: { name: 'NO_PADDING', value: CryptoJS.pad.NoPadding },
         PKCS7_PADDING: { name: 'PKCS7_PADDING', value: CryptoJS.pad.Pkcs7 }
     },
     CRYPT_TYPE: {
         AES: 'AES',
         TRIPLEDES: '3DES'
     },
     STATUS: {
         ONLINE: '1',
         OFFLINE: '0'
     },
     TYPE: {
         ONLINE_PAYMENT: "ONLINE_PAYMENT",
         CREDIT: "CREDIT",
         DEBIT: "DEBIT",
         EDC_PAYMENT: "EDC_PAYMENT",
         CMC_PAYMENT: "CMC_PAYMENT",
         CMC_OFFLINE_PAYMENT: "CMC_OFFLINE_PAYMENT",
         EDC_BCA: "EDC_BCA",
         OFFLINE_PAYMENT: "OFFLINE_PAYMENT",
         TRK_POINT: "TRK_POINT",
         TRK_SALES: "TRK_SALES",
         POWER_POINT_PURCHASE: "POWER_POINT_PURCHASE"
     },
     MSG_PARAM: {
         ONLINE_FLAG: { name: 'ONLINE_FLAG', property: 'onlineFlag' },
         TRANSACTION_CODE: { name: 'TRANSACTION_CODE', property: 'transactionCode' },
         STORE_CODE: { name: 'STORE_CODE', property: 'storeCode' },
         TRANSACTION_AMOUNT: { name: 'TRANSACTION_AMOUNT', property: 'transactionAmount' },
         POS_NUM: { name: 'POS_NUM', property: 'posId' },
         TRANSACTION_NUM: { name: 'TRANSACTION_NUM', property: 'transactionId' },
         CASHIER_ID: { name: 'CASHIER_ID', property: 'cashierId' },
         MERCHANT_ID: { name: 'MERCHANT_ID', property: 'merchantId' },
         CARD_NUM: { name: 'CARD_NUM', property: 'cardNum' },
         BANK_ID: { name: 'BANK_ID', property: 'bankId' },
         TERMINAL_ID: { name: 'TERMINAL_ID', property: 'terminalId' },
         TRANSACTION_DATE: { name: 'TRANSACTION_DATE', property: 'transactionDate' },
         TRANSACTION_TIME: { name: 'TRANSACTION_TIME', property: 'transactionTime' },
         RETURN_CODE: { name: 'RETURN_CODE', property: 'returnCode' },
         APPROVAL_CODE: { name: 'APPROVAL_CODE', property: 'approvalCode' },
         CARD_TYPE: { name: 'CARD_TYPE', property: 'cardType' },
         STAN: { name: 'STAN', property: 'stan' },
         TRACE_NUM: { name: 'TRACE_NUM', property: 'traceNum' },
         REFERENCE_CODE: { name: 'REF_CODE', property: 'referenceCode' },
         TRANSACTION_AMOUNT: { name: 'TRANSACTION_AMOUNT', property: 'transactionAmount' },
         CARD_FLAG: { name: 'CARD_FLAG', property: 'cardFlag' },
         WITHDRAWAL_TYPE: { name: 'WITHDRAWAL_TYPE', property: 'withdrawalType' },
         WITHDRAWAL_AMOUNT: { name: 'WITHDRAWAL_AMOUNT', property: 'withdrawalAmount' },
         ADDITIONAL_PAYMENT_TYPE: { name: 'ADDITIONAL_PAYMENT_TYPE', property: 'addlPaymentType' },
         ADDITIONAL_PAYMENT_AMOUNT: { name: 'ADDITIONAL_PAYMENT_AMOUNT', property: 'addlPaymentAmount' },
         TRANSACTION_TYPE: { name: 'TRANSACTION_TYPE', property: 'transactionType' },
         HEADER1: { name: 'HEADER1', property: 'header1' },
         HEADER2: { name: 'HEADER2', property: 'header2' },
         HEADER3: { name: 'HEADER3', property: 'header3' },
         HEADER4: { name: 'HEADER4', property: 'header4' },
         EXP_CARD: { name: 'EXP_CARD', property: 'expCard' },
         APPL_ID: { name: 'APPL_ID', property: 'applId' },
         APPL_NAME: { name: 'APPL_NAME', property: 'applName' },
         APPL_CRYPT: { name: 'APPL_CRYPT', property: 'applCrypt' },
         TVR: { name: 'TVR', property: 'tvr' },
         CARD_HOLDER: { name: 'CARD_HOLDER', property: 'cardHolder' },
         BATCH_NUM: { name: 'BATCH_NUM', property: 'batchNum' },
         REDEEM_REF: { name: 'REDEEM_REF', property: 'redeemReference' },
         OPENING_POINT: { name: 'OPENING_POINT', property: 'openingPoint' },
         CATALOG_CODE: { name: 'CATALOG_CODE', property: 'catalogCode' },
         AVAILABLE_POINT: { name: 'AVAILABLE_POINT', property: 'availablePoint' },
         AMOUNT_FOR_POINT: { name: 'AMOUNT_FOR_POINT', property: 'amountForPoint' },
         AMOUNT_FOR_SALE: { name: 'AMOUNT_FOR_SALE', property: 'amountForSale' },
         PERIOD: { name: 'PERIOD', property: 'period' },
         INTEREST_RATE: { name: 'INTEREST_RATE', property: 'interestRate' },
         FIRST_INSTALLMENT: { name: 'FIRST_INSTALLMENT', property: 'firstInstallment' },
         SIGNATURE: { name: 'SIGNATURE', property: 'signature' },
         SALDO: { name: 'SALDO', property: 'saldo' },
         REDEEM_COUNT: { name: 'REDEEM_COUNT', property: 'redeemCount' },
         REDEEM_TOTALS: { name: 'REDEEM_TOTALS', property: 'redeemTotals' },
         CATALOGUE: { name: 'CATALOGUE', property: 'catalogue' },
         ITEM: { name: 'ITEM', property: 'item' },
         QUANTITY: { name: 'QUANTITY', property: 'quantity' },
         POINT_REDEEMED: { name: 'POINT_REDEEMED', property: 'pointRedeemed' },
         FAST_TRACK_AMOUNT: { name: 'FAST_TRACK_AMOUNT', property: 'fastTrackAmount' },
         HOST_TYPE: { name: 'HOST_TYPE', property: 'hostType' },
         HOST_TOTAL: { name: 'HOST_TOTAL', property: 'hostTotal' },
         HOST_LIST: { name: 'HOST_LIST', property: 'hostList' },
         CARD_DATA: { name: 'CARD_DATA', property: 'cardData' },
         GRAND_TOTAL_DATA: { name: 'GRAND_TOTAL_DATA', property: 'grandTotalData' },
         ETX: { name: 'ETX', property: 'etx' },
         DETAIL_DATA: { name: 'DETAIL_DATA', property: 'detailData' },
         DETAIL_TOTAL: { name: 'DETAIL_TOTAL', property: 'detailTotal' },
         CARD_TYPE_DATA: { name: 'CARD_TYPE_DATA', property: 'cardTypeData' },
         CARD_TYPE_TOTAL: { name: 'CARD_TYPE_TOTAL', property: 'cardTypeTotal' }
     },
     MSG_TYPE: {
         REQUEST: 'REQUEST',
         RESPONSE: 'RESPONSE'
     },
     BANK: {
         BANK_MEGA: { name: 'BANK_MEGA', desc: 'bank mega', /*Bin number*/ code: '123456' },
         BCA: { name: 'BCA', desc: 'bca', /*Bin number*/ code: '123457' },
         CITIBANK: { name: 'CITIBANK', desc: 'citibank', /*Bin number*/ code: '123456' },
         BRI: { name: 'BRI', desc: 'bri', /*Bin number*/ code: '123456' },
         AMEX: { name: 'AMEX', desc: 'amex', /*Bin number*/ code: '123456' }
     },
     EFT_TRANSACTION_TYPE: {
         //WIRECARD
         SALE: { name: 'SALE', desc: 'SALE', code: '01' },
         SALE_INQ: { name: 'SALE_INQ', desc: 'SALE_INQ', code: '08' },
         ZEPRO3: { name: 'ZEPRO3', desc: 'ZEPRO', code: 'Z3' },
         ZEPRO6: { name: 'ZEPRO6', desc: 'ZEPRO', code: 'Z6' },
         ZEPRO8: { name: 'ZEPRO8', desc: 'ZEPRO', code: 'Z8' },
         ZEPRO9: { name: 'ZEPRO9', desc: 'ZEPRO', code: 'Z9' },
         ZEPRO18: { name: 'ZEPRO18', desc: 'ZEPRO', code: 'Z8' },
         ZEPRO12: { name: 'ZEPRO12', desc: 'ZEPRO', code: 'Z2' },
         ZEPRO24: { name: 'ZEPRO24', desc: 'ZEPRO', code: 'Z4' },
         ZEPRO36: { name: 'ZEPRO36', desc: 'ZEPRO', code: 'ZX' },
         MEGA_PAY3: { name: 'MEGA_PAY3', desc: 'MEGA PAY', code: 'M3' },
         MEGA_PAY6: { name: 'MEGA_PAY6', desc: 'MEGA PAY', code: 'M6' },
         MEGA_PAY8: { name: 'MEGA_PAY8', desc: 'MEGA PAY', code: 'M8' },
         MEGA_PAY9: { name: 'MEGA_PAY9', desc: 'MEGA PAY', code: 'M9' },
         MEGA_PAY12: { name: 'MEGA_PAY12', desc: 'MEGA PAY', code: 'M2' },
         MEGA_PAY18: { name: 'MEGA_PAY18', desc: 'MEGA PAY', code: 'M8' },
         MEGA_PAY24: { name: 'MEGA_PAY24', desc: 'MEGA PAY', code: 'M4' },
         MEGA_PAY36: { name: 'MEGA_PAY36', desc: 'MEGA PAY', code: 'MX' },
         MEGA_POINT: { name: 'MEGA_POINT', desc: 'MEGA POINT', code: '03' },
         ONE_DIP: { name: 'ONE_DIP', desc: 'ONE DIP', code: '05' },
         VOID: { name: 'VOID', desc: 'VOID', code: '06' },
         RETRIEVE_TXN: { name: 'RETRIEVE_TXN', desc: 'RETRIEVE TXN', code: '90' },
         SETTLEMENT_ALL: { name: 'SETTLEMENT_ALL', desc: 'SETTLEMENT ALL', code: '91' },
         GET_SETTLEMENT_DATA: { name: 'GET_SETTLEMENT_DATA', desc: 'GET SETTLEMENT DATA', code: '92' },
         SETTLEMENT_DATA: { name: 'SETTLEMENT_DATA', desc: 'SETTLEMENT DATA', code: '93' },
         REPRINT_ALL_SUMMARY_TXN: { name: 'REPRINT_ALL_SUMMARY_TXN', desc: 'REPRINT ALL SUMMARY TXN', code: '94' },
         REPRINT_ALL_DETAIL_TXN: { name: 'REPRINT_ALL_DETAIL_TXN', desc: 'REPRINT ALL DETAIL TXN', code: '95' },
         REPRINT_ALL_DETAIL_TXN_BY_HOST: { name: 'REPRINT_ALL_DETAIL_TXN_BY_HOST', desc: 'REPRINT ALL DETAIL TXN BY HOST', code: '96' },
         REPRINT_ALL_DETAIL_TXN_BY_CARD: { name: 'REPRINT_ALL_DETAIL_TXN_BY_CARD', desc: 'REPRINT ALL DETAIL TXN BY CARD', code: '97' }
     },
     RETURN_CODE: {
         DECLINED: { name: "DECLINED", code: "99" },
         APPROVED: { name: "APPROVED", code: "00" },
         ERROR: { name: "ERROR", code: "9" }
     },
     VENDOR: {
         WIRECARD: { name: 'WIRECARD', code: '1' },
         KARTUKU: { name: 'KARTUKU', code: '2' }
     },
     WIRECARD_ERR_MSG: {
         DRIVER_BUSY: { name: "DRIVER_BUSY", value: "D0" },
         DRIVER_INVALID_PARAM: { name: "DRIVER_INVALID_PARAM", value: "M0" },
         DRIVER_UNKNOWN_CMD_PARAM: { name: "DRIVER_UNKNOWN_CMD_PARAM", value: "M1" },
         DRIVER_UNKNOWN_TRXID_PARAM: { name: "DRIVER_UNKNOWN_TRXID_PARAM", value: "M2" },
         DRIVER_UNKNOWN_MID_PARAM: { name: "DRIVER_UNKNOWN_MID_PARAM", value: "M3" },
         DRIVER_UNKNOWN_TID_PARAM: { name: "DRIVER_UNKNOWN_TID_PARAM", value: "M4" },
         DRIVER_UNKNOWN_PAN_PARAM: { name: "DRIVER_UNKNOWN_PAN_PARAM", value: "M5" },
         DRIVER_UNKNOWN_EXP_PARAM: { name: "DRIVER_UNKNOWN_EXP_PARAM", value: "M6" },
         DRIVER_UNKNOWN_AMT_PARAM: { name: "DRIVER_UNKNOWN_AMT_PARAM", value: "M7" },
         DRIVER_UNKNOWN_TRACENO_PARAM: { name: "DRIVER_UNKNOWN_TRACENO_PARAM", value: "M8" },
         DRIVER_UNKNOWN_CMD: { name: "DRIVER_UNKNOWN_CMD", value: "M9" },
         DRIVER_UNKNOWN_TRX_ID: { name: "DRIVER_UNKNOWN_TRX_ID", value: "N0" },
         DRIVER_INVALID_MID: { name: "DRIVER_INVALID_MID", value: "N1" },
         DRIVER_INVALID_TID: { name: "DRIVER_INVALID_TID", value: "N2" },
         DRIVER_INVALID_AMOUNT: { name: "DRIVER_INVALID_AMOUNT", value: "N3" },
         DRIVER_INVALID_TRACENO: { name: "DRIVER_INVALID_TRACENO", value: "N4" },
         DRIVER_RECORD_NOT_FOUND: { name: "DRIVER_RECORD_NOT_FOUND", value: "N5" },
         DRIVER_BATCH_EMPTY: { name: "DRIVER_BATCH_EMPTY", value: "N6" },
         DRIVER_SETTLE_FAIL: { name: "DRIVER_SETTLE_FAIL", value: "N7" },
         DRIVER_COMM_ERROR: { name: "DRIVER_COMM_ERROR", value: "N8" },
         DRIVER_CARD_NOT_SUPPORTED: { name: "DRIVER_CARD_NOT_SUPPORTED", value: "N9" },
         DRIVER_BAD_ACCOUNT: { name: "DRIVER_BAD_ACCOUNT", value: "O1" },
         DRIVER_ALREADY_VOIDED: { name: "DRIVER_ALREADY_VOIDED", value: "O2" },
         DRIVER_TXN_CANCELLED: { name: "DRIVER_TXN_CANCELLED", value: "O3" },
         DRIVER_MUST_SETTLE: { name: "DRIVER_MUST_SETTLE", value: "O4" },
         DRIVER_SETTLE_HOST1_SUCCESS: { name: "DRIVER_SETTLE_HOST1_SUCCESS", value: "S1" },
         DRIVER_SETTLE_HOST2_SUCCESS: { name: "DRIVER_SETTLE_HOST2_SUCCESS", value: "S2" },
         DRIVER_SETTLE_ALL_HOST_SUCCESS: { name: "DRIVER_SETTLE_ALL_HOST_SUCCESS", value: "S3" },
         DRIVER_ERROR: { name: "DRIVER_ERROR", value: "ZZ" },
         DRIVER_TRX_NOT_SUPPORT: { name: "DRIVER_TRX_NOT_SUPPORT", value: "T1" }
     },
     INSTALLMENT_TYPE: {
         ZEPRO: "ZEPRO",
         MEGA_PAY: "MEGA_PAY"
     },
     HOST_TYPE: {
         REGULAR: { name: "REGULAR", desc: 'Regular', value: "A0" },
         MP3MTHS: { name: "MP3MTHS", desc: 'MegaPay3', value: "A1" },
         MP6MTHS: { name: "MP6MTHS", desc: 'MegaPay6', value: "A2" },
         MP9MTHS: { name: "MP9MTHS", desc: 'MegaPay9', value: "A3" },
         MP12MTHS: { name: "MP12MTHS", desc: 'MegaPay12', value: "A4" },
         MEGAPOINT: { name: "MEGAPOINT", desc: 'MegaPoint', value: "A5" },
         MEGACASH: { name: "MEGACASH", desc: 'MegaCash', value: "A6" },
         MP18MTHS: { name: "MP18MTHS", desc: 'MegaPay18', value: "A7" },
         MP24MTHS: { name: "MP24MTHS", desc: 'MegaPay24', value: "A8" },
         MP36MTHS: { name: "MP36MTHS", desc: 'MegaPay36', value: "A9" },
         ZP3MTHS: { name: "ZP3MTHS", desc: 'Zepro3', value: "B0" },
         ZP6MTHS: { name: "ZP6MTHS", desc: 'Zepro6', value: "B1" },
         ZP9MTHS: { name: "ZP9MTHS", desc: 'Zepro9', value: "B2" },
         ZP12MTHS: { name: "ZP12MTHS", desc: 'Zepro12', value: "B3" },
         ZP18MTHS: { name: "ZP18MTHS", desc: 'Zepro18', value: "B4" },
         ZP24MTHS: { name: "ZP24MTHS", desc: 'Zepro24', value: "B5" },
         ZP36MTHS: { name: "ZP36MTHS", desc: 'Zepro36', value: "B6" }
     },
     END_OF_TRANSMISSION: {
         END: 1,
         CONTINUE: 0
     },
     GRAND_TOTAL_DATA: {
         GRAND_TOTAL_SALES_COUNT: "grandTotalSalesCount",
         GRAND_TOTAL_SALES_TOTAL: "grandTotalSalesTotal",
         GRAND_TOTAL_REFUNDS_COUNT: "grandTotalRefundsCount",
         GRAND_TOTAL_REFUNDS_TOTAL: "grandTotalRefundsTotal",
         GRAND_TOTAL_OFFLINE_COUNT: "grandTotalOfflineCount",
         GRAND_TOTAL_OFFLINE_TOTAL: "grandTotalOfflineTotal",
         GRAND_TOTAL_VOID_SALES_COUNT: "grandTotalVoidSalesCount",
         GRAND_TOTAL_VOID_SALES_TOTAL: "grandTotalVoidSalesTotal",
         GRAND_TOTAL_VOID_REFUNDS_COUNT: "grandTotalVoidRefundsCount",
         GRAND_TOTAL_VOID_REFUNDS_TOTAL: "grandTotalVoidRefundsTotal",
         GRAND_TOTAL_REDEEM_COUNT: "grandTotalRedeemCount",
         GRAND_TOTAL_REDEEM_TOTAL: "grandTotalRedeemTotal",
         GRAND_TOTAL_TOTALS_COUNT: "grandTotalTotalsCount",
         GRAND_TOTAL_TOTALS: "grandTotalTotals"
     },
     CARD_DATA: {
         CARD_NAME: "cardName",
         SALES_COUNT: "salesCount",
         SALES_TOTAL: "salesTotal",
         REFUNDS_COUNT: "refundsCount",
         REFUNDS_TOTAL: "refundsTotal",
         OFFLINE_COUNT: "offlineCount",
         OFFLINE_TOTAL: "offlineTotal",
         VOID_SALES_COUNT: "voidSalesCount",
         VOID_SALES_TOTAL: "voidSalesTotal",
         VOID_REFUNDS_COUNT: "voidRefundsCount",
         VOID_REFUNDS_TOTAL: "voidRefundsTotal",
         REDEEM_COUNT: "redeemCount",
         REDEEM_TOTAL: "redeemTotal",
         TOTAL_COUNT: "totalCount",
         TOTAL: "total"
     },
     DETAIL_DATA_PROPERTIES: {
         CARD_NAME: 'cardName',
         CARD_NUM: 'cardNum',
         EXP_DATE: 'expDate',
         INVOICE_NUM: 'invoiceNum',
         TRANSACTION: 'transactionType',
         AMOUNT: 'amount',
         APPROVAL_CODE: 'approvalCode'
     },
     DETAIL_TOTAL_PROPERTIES: {
         SALE_COUNT: 'saleCount',
         SALE_TOTAL: 'saleTotal',
         TIP_COUNT: 'tipCount',
         TIP_TOTAL: 'tipTotal',
         REFUND_COUNT: 'refundCount',
         REFUND_TOTAL: 'refundTotal',
         TOTAL_COUNT: 'totalCount',
         TOTAL: 'total'
     },
     CARD_TYPE_DATA_PROPERTIES: {
         CARD_TYPE_NAME: 'cardTypeName',
         CARD_TYPE_COUNT: 'cardTypeCount',
         CARD_TYPE_AMOUNT: 'cardTypeAmount'
     },
     CARD_TYPE_TOTAL_PROPERTIES: {
         CARD_TYPE_TOTAL_COUNT: 'cardTypeTotalCount',
         CARD_TYPE_TOTAL_AMOUNT: 'cardTypeTotalAmount'
     },
     REPORT_TRANSACTION_TYPE: {
         SETTLEMENT: 'settlement',
         SUMMARY_REPORT: 'summary rpt',
         DETAIL_REPORT: 'detail rpt'
     }
 };
 
 /************************
  * GIFT Card Constants
  ************************/
 CONSTANTS.GIFTCARD = {
     GC_REQUEST_TYPE: {
         ACTIVATION: { name: "ACTIVATION", code: "A", description: 'Activation Request', note: 'gc request' },
         REDEMPTION: { name: "REDEMPTION", code: "P", description: 'Activation Request', note: 'redemption' },
         CANCELLATION: { name: "CANCELLATION", code: "N", description: 'Cancellation Request', note: 'gc cancel' },
         CONFIRMATION: { name: "CONFIRMATION", code: "Y", description: 'Confirmation Request', note: 'gc confirm' },
         BALANCE: { name: "BALANCE", code: "B", description: 'Balance Request', note: 'gc balance' },
         ACTIVATE: { name: "ACTIVATE", code: "C", description: 'GC-MMS Activation Request', note: 'gc-mms activation' },
         INQUIRE: { name: "INQUIRE", code: "I", description: 'GC-MMS Inquiry Request', note: 'gc-mms inquiry' },
         REDEEM: { name: "REDEEM", code: "R", description: 'GC-MMS Redemption Request', note: 'gc-mms redeem' },
         PRE_ACTIVATE: { name: "PRE-ACTIVATE", code: "P", description: 'GC-MMS Pre-Activate Request', note: 'gc-mms pre-activate' }
     }
 };
 
 CONSTANTS.FUNCTIONS.getGCRequestTypeNameByCode = function(code) {
         var name = null;
 
         if (CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.ACTIVATION.code == code)
             name = CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.ACTIVATION.name;
         else if (CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.REDEMPTION.code == code)
             name = CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.REDEMPTION.name;
         else if (CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.CANCELLATION.code == code)
             name = CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.CANCELLATION.name;
         else if (CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.CONFIRMATION.code == code)
             name = CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.CONFIRMATION.name;
         else if (CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.BALANCE.code == code)
             name = CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.BALANCE.name;
         else if (CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.INQUIRE.code == code)
             name = CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.INQUIRE.name;
         else if (CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.REDEEM.code == code)
             name = CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.REDEEM.name;
         else if (CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.ACTIVATE.code == code)
             name = CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.ACTIVATE.name;
         else if (CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.PRE_ACTIVATE.code == code)
             name = CONSTANTS.GIFTCARD.GC_REQUEST_TYPE.PRE_ACTIVATE.name;
         return name;
     }
     /**=====================================================**
      * Customer Page Constants
      **=====================================================**/
 CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES = {
     TRANSACTION: "Transcation Screen",
     NEXT_CASHIER: "Next Cashier Screen",
     IDLE: "Idle Screen"
 };
 
 /**=====================================================**
  * Printing fields configuration
  **=====================================================**/
 CONSTANTS.PRINT_FIELD_AFFIXES = {
     LEFT: "LEFT",
     RIGHT: "RIGHT"
 };
 
 CONSTANTS.PRINT_FIELD_CONFIG = {
     // Cap is same as length, just not using the reserved word
     LABEL: {
         cap: 20,
         affix: CONSTANTS.PRINT_FIELD_AFFIXES.RIGHT
     },
     LABEL_VALUE_BOUNDARY: {
         /* In the wrapLineItem(), it is used
          * to accommodate space boundary between label and value boundary
          */
         cap: 1,
         // Not used
         affix: CONSTANTS.PRINT_FIELD_AFFIXES.LEFT
     },
     VALUE: {
         cap: 16,
         affix: CONSTANTS.PRINT_FIELD_AFFIXES.LEFT
     },
     IDENTIFIER: {
         cap: 3,
         affix: CONSTANTS.PRINT_FIELD_AFFIXES.RIGHT
     },
     MAX_LABEL: {
         cap: 40,
         affix: CONSTANTS.PRINT_FIELD_AFFIXES.RIGHT
     }
 };
 
 
 CONSTANTS.REPRINT = {
     "0": { name: "REPRINT_TX", value: 0 },
     "1": { name: "REPRINT_EFT", value: 1 }
 };
 
 CONSTANTS.PRODUCT_TYPES = {
     FRESH_GOODS_INDICATOR: "20"
 };
 
 CONSTANTS.FLASHIZ_PAYMENT_STATUS = {
     NEW: "NEW",
     EXE: "EXE",
     OUT: "OUT"
 };
 
 // MLC 2017-04-21
 CONSTANTS.FLASHIZ_PAYMENT_STATUS = {
     SUCCESS: "SUCCESS",
     EXE: "EXE",
     OUT: "OUT"
 };
 // MLC 2017-04-21
 
 CONSTANTS.USER_PROFILE = {
     CASHIER_HEAD: "Cashier Head"
 };
 
 CONSTANTS.LOG_CONFIG = {
     LOG_DELIMITER: "||"
 };
 
 CONSTANTS.QRIS_PAYMENT_SOURCE = {
     ALLO : "93600567"
 };
 /*******************************************************************************
  * END : CONSTANTS
  ******************************************************************************/