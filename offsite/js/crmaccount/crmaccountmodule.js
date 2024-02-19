var CRMAccountModule = CRMAccountModule || {};

/**
 * Module utility for retrieving 
 */
CRMAccountModule.retriever = {
	findAccountId : function(accountId) {
		var crmRequestParams = {
				id : accountId,
				store: null,
				paymentType: null,
				amount: null,
				cardNo: null,
				transactionNo: null,
				transactionDate: null,
				store : saleTx.storeCd
		};

		var useSmallPrinter = getConfigValue('HC_USE_SMALL_PRINTER');

		if (connectionOnline) {
			CRMAccountModule.ajax.findAccountId(crmRequestParams, function(customer) {
				uilog("DBUG","CRM response: " + JSON.stringify(customer));
				
				if (customer && customer.type != 'ERROR'
					&& ((CRMAccountModule.Hypercash.getMemberType(customer) == CONSTANTS.CRM_MEMBER_TYPES_DESC.NONMEMBER) 
					|| (customer.status != 'INACTIVE' && !customer.loyaltyCardExpired))) {
					uilog('DBUG','Successful customer retrieved!');
					
					CRMAccountModule.Hypercash.startProfCust(customer);

					// Assign barcode as Customer Id for reward.
					// global variable from cashier.js
					customerIdForReward = customer.accountNumber;
					saleTx.customerId = customerIdForReward;
					// global variable from cashier.js
					availEmpLoyaltyPoints = true;
					runningNonMemberMarkup = 0;

					/*	
					 * If non-member, enter customer information for invoice
					 */
					if (CRMAccountModule.Hypercash.getMemberType(customer) == CONSTANTS.CRM_MEMBER_TYPES_DESC.NONMEMBER) {
						Hypercash.service.enterCustomerInformation();
					}

					// global function from cashier.js
					renderCustomerInfo(profCust.customerName, profCust.customerNumber); //TODO: Delete this line on testing
				} else if (customer.status == 'INACTIVE') {
					showMsgDialog(getMsgValue("pos_label_member_id_is_inactive"), "error");
					promptSysMsg();
				} else if (customer.loyaltyCardExpired) {
					showMsgDialog(getMsgValue("pos_label_membership_expired_no_renew"), "error");
					promptSysMsg();
				} else if (customer &&
						   customer.messageCode != "ERR005" &&
						   customer.messageCode != "ERR003" &&
						   customer.messageCode != "ERR004") {
					// common function from common.js
					//alert in the POS screen, so the cashier able to report to senior cashier to be followed up to customer service desk
					showMsgDialog(customer.message, "error");
					promptSysMsg();
				} else {
					CRMAccountModule.Hypercash.handleCRMOfflineMode(useSmallPrinter, accountId);
				}
			}, 
			/**
			 * errorCallback
			 */
			function(jqXHR, status, error) {
				uilog('DBUG','Failed customer retreive ' + error);
				uilog('DBUG','ERROR', getConfigValue('CRM_URL_FIND_MEMBER'), JSON.stringify(error));
				//alert in the POS screen, so the cashier able to report to senior cashier to be followed up to customer service desk

				CRMAccountModule.Hypercash.handleCRMOfflineMode(useSmallPrinter, accountId);
			}, 
			/**
			 * complete callback
			 * */
			function() {
				clearInputDisplay();
				isProCustScan = false;

				/*// global function from cashier.js
				renderCustomerInfo(profCust.customerName, profCust.customerNumber);	*/
			});
		} else {
			CRMAccountModule.Hypercash.handleCRMOfflineMode(useSmallPrinter, accountId);
		}
	}
};

CRMAccountModule.Hypercash = {
	toggleCrmOfflineMode: false,
	lastCustomerCardScanned: "",
	crmOfflineMode: false,

	resetCrmOfflineVariables: function() {
		this.toggleCrmOfflineMode = false;
		this.lastCustomerCardScanned = "";
		this.crmOfflineMode = false;
	},

	/**
	 *  
	 */	
	startProfCust : function(customer){
		profCust = {};
		profCust.customerNumber = customer.accountNumber;
		profCust.businessName = (customer.businessName ? customer.businessName:'');
		profCust.customerName = (customer.firstName ? customer.firstName:'') + ' ' + (customer.lastName ? customer.lastName :'');
		profCust.customerPhone = (customer.contact ? customer.contact:'');
		//profCust.taxId = (customer.npwpId ? customer.npwpId:'');
		profCust.taxId = (!customer.npwpId || /^0*$/.test(customer.npwpId)) ? '' : customer.npwpId;

		profCust.taxName = this.getTaxName(customer);
		profCust.taxAddress = (customer.npwpAddress ? customer.npwpAddress:'');
		profCust.ktpId = (customer.ktpId ? customer.ktpId:'');
		profCust.txnCode = customer.transactionCode ? customer.transactionCode : getConfigValue('HC_INV_DFLT_TXN_CODE');
		profCust.memberType = this.getMemberType(customer);
		promptSysMsg();
	},
	/**
	 * 
	 */
	getMemberType : function(customer){
		switch(customer.memberTypeDesc){
			// PROFESSIONAL (memberType: MTYP003)
			case 'PROFESSIONAL':
			//	INDIVIDUAL (memberType: MTYP001)
			case 'INDIVIDUAL' : 
				// Not yet applied on CRM prod data: NON MEMBER GROSERINDO (memberType: MTYP004)
				if(customer.accountNumber == getConfigValue('HC_NON_MEMBER_DEF_CARDNO')){
					return 'NONMEMBER';
				}
				return 'PROFESSIONAL';
			// EMPLOYEE (memberType: MTYP002)
			case 'EMPLOYEE':
				return 'EMPLOYEE';
			default:
				return 'MEMBER_TYPE_UNKNOWN';
		}
	},

	//TODO Replace with customer.memberName
	getTaxName : function(customer){
		if (customer.npwpName) {
			profCust.taxName = customer.npwpName;
		} else if (customer.firstName || customer.lastName) {
			var isComplete = customer.firstName && customer.lastName;
			profCust.taxName = 	(customer.lastName ? customer.lastName : "") 
								+ (isComplete ? ", " : "")
								+ (customer.firstName ? customer.firstName : "");
		}
	},

	activateCRMOfflineMode: function(accountId) {
		$("#crmOffline-dialog").data("accountId", accountId)
							   .dialog("open");
	},

	postCRMOfflineModeFunction: function() {
		$("#crmOffline-dialog").dialog("close");

		var accountId = $("#crmCustomerNumber").val();

		/*	
		 * If non-member, enter customer information for invoice
		 */
		if (accountId == getConfigValue('HC_NON_MEMBER_DEF_CARDNO')) {
			Hypercash.service.enterCustomerInformation();
		}
	
		CRMAccountModule.Hypercash.startProfCust({
												  "accountNumber": 	accountId,
												  "memberTypeDesc": $("#crmMemberTypes").val()
												});

		renderCustomerInfo(profCust.customerName, profCust.customerNumber);
			
		/** NOTE: 	Did not set values for availEmpLoyaltyPoints
		 *		  	because customer was not checked in CRM service in the first place
		 */
		// Assign barcode as Customer Id for reward.
		// global variable from cashier.js
		customerIdForReward = accountId;
		// global variable from cashier.js
		//availEmpLoyaltyPoints = true;
		runningNonMemberMarkup = 0;
		this.crmOfflineMode = true;

		saleTx.profCust = profCust;
		saveTxn();
		$("authentication-form").dialog("option", "title", "Employee Authentication"); //revert authentication form title
	},

	handleCRMOfflineMode: function(useSmallPrinter, accountId) {
		if (isHcEnabled
		   	&& (useSmallPrinter == 'true'
		   	|| accountId == getConfigValue('HC_NON_MEMBER_DEF_CARDNO'))) {
			//proceed to CRM offline mode
			showConfirmDialog(getMsgValue("pos_error_crm_offline_mode"), 'ERROR!', function() {
				var accountId = CRMAccountModule.Hypercash.lastCustomerCardScanned != "" ? CRMAccountModule.Hypercash.lastCustomerCardScanned : getConfigValue('HC_NON_MEMBER_DEF_CARDNO');

				uilog("DBUG","Entering CRM offline mode | Customer card: ", accountId);
				CRMAccountModule.Hypercash.activateCRMOfflineMode(accountId);
			});		
		} else {
			showMsgDialog(getMsgValue("pos_error_block_crm_offline_mode"), "error");
		}

		promptSysMsg();
		clearInputDisplay();
		isProCustScan = false;
	}
};
