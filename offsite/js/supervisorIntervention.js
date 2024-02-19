
/*******************************************************************************
 * START : Functions used - Supervisor Intervention
 ******************************************************************************/
/**
 * The supervisor-intervention intercepted
 * transaction types that the amount value depends on the whole/full transaction.
 * 
 * EXCLUDED:
 * 1.) "itemVoid" is not included because its just a micro-tx
 *  within a full transaction, and have different handling.
 */
var fullTxWithSupervisorInterventionAndAmountTypeLabel = [
                                 CONSTANTS.TX_TYPES.SALE_VOID.getTypeLabel(),
                                 CONSTANTS.TX_TYPES.PICKUP.getTypeLabel(),
                                 CONSTANTS.TX_TYPES.FLOAT.getTypeLabel(),
                                 CONSTANTS.TX_TYPES.CANCEL_SALE.getTypeLabel(),
                                 CONSTANTS.TX_TYPES.STORE.getTypeLabel(),
                                 CONSTANTS.TX_TYPES.RECALL.getTypeLabel(),
                                 CONSTANTS.TX_TYPES.RETURN.getTypeLabel()
                                 ];

/**
 * @namespace Namespace for SUPERVISOR_INTERVENTION classes and functions.
 */
var SUPERVISOR_INTERVENTION = SUPERVISOR_INTERVENTION || {};

/**
 * The format of supervisorInterventionObject
 */
SUPERVISOR_INTERVENTION.supervisorInterventionDataFormat = {
		supervisorNumber   : "",
		cashierNumber      : "",
		// Date Object
		dateTimeAuthorized : {},
		interventionType   : "",
		// Initialised to null, to signify that no value has been set yet.
		amount			   : null,
		trialMode          : false,
		posNumber          : null
};

/**
 * Temporary Supervisor Intervention data container
 */
SUPERVISOR_INTERVENTION.tempData = {};

/**
 * Temporary Supervisor Intervention data
 * @param interventionDataToCache
 */
SUPERVISOR_INTERVENTION.saveTempData = function(interventionDataToCache){

	if(interventionDataToCache) {
		// Save recall intervention data temporarily
		SUPERVISOR_INTERVENTION.tempData = $.extend({},
												    SUPERVISOR_INTERVENTION.supervisorInterventionDataFormat,
												    interventionDataToCache);
	}
};

/**
 * Get the temporarily saved data with the interventionType of txType
 * @param txType
 */
SUPERVISOR_INTERVENTION.getTempData = function(txType){
	
	var returnTempData = null;
	
	if(    txType
	   //  temp container must have a value and gets the return tempData
	   && (returnTempData = SUPERVISOR_INTERVENTION.tempData)
	   //  Must have the same type as requested argument
	   &&  SUPERVISOR_INTERVENTION.tempData.interventionType == txType){
	   //  Referencing to null
		SUPERVISOR_INTERVENTION.tempData = null;
	}
	return returnTempData;
};

/**
 * Merged and return the SaleTx data with the temporarily saved supervisor intervention data
 * @param saleTx - the sale transaction from which the temp supervisor intervention data will be merged
 * @param txType - the type to lookup in the temp supervisor intervention container
 * @param amount - optional, if present, override the amount value of the temporarily saved supervisor intervention data
 */
SUPERVISOR_INTERVENTION.mergeTempDataToSaleTx = function(saleTx, txType, amount){

	var tempData = SUPERVISOR_INTERVENTION.getTempData(txType);
	
	if(    saleTx
	   &&  tempData){
		    // Set empty array if null
		    saleTx.supervisorInterventions = saleTx.supervisorInterventions || [];
		    // Pushing the value
			saleTx.supervisorInterventions.push(tempData);
			// Empty/Remove the reference
			SUPERVISOR_INTERVENTION.tempData = null;
	   } 
	return saleTx;
};
/**
 * Push the supervisor intervention data to saleTx
 * @param supervisorAuthRes
 */
SUPERVISOR_INTERVENTION.pushAsSaleTxData = function(supervisorInterventionData){

	if(   saleTx
	   && supervisorInterventionData){
		// if existing, use it, if not, create an empty Array.
		saleTx.supervisorInterventions = saleTx.supervisorInterventions || [];
		// Merging the data to the 1st argument
		var mergedData = $.extend({},
								  SUPERVISOR_INTERVENTION.supervisorInterventionDataFormat,
								  supervisorInterventionData);
		// Pushing to saleTx.supervisorInterventions array
		saleTx.supervisorInterventions.push(mergedData);
	}
};

/**
 * Gets the last instance of supervisor intervention type within the sale transaction(saleTx.supervisorInterventions)
 * which has no amount(null). Returns null if none of the condition said was satisfied.
 * 
 * @param interventionType - the inteventionType to lookup within the array of saleTx.supervisorInterventions
 * @returns
 */
SUPERVISOR_INTERVENTION.getLastInstanceByInterventionType = function(tx, interventionType){
	var supervisorInterventions = null;
	var sInterventionReturn = null;
	var keyInterventionType = 'interventionType';
	var keyAmount  			= 'amount';
	if(    tx
	   && (supervisorInterventions = tx.supervisorInterventions)){
		// Search from last to first
		for (var countDown = (supervisorInterventions.length - 1); countDown >= 0; countDown--) {

			var currSupervisorInterventionItem = supervisorInterventions[countDown];
			// if same interventionType value
			if(    currSupervisorInterventionItem[keyInterventionType] == interventionType
				  // Check if it doesn't have an amount value, in short null
			   && currSupervisorInterventionItem[keyAmount] == null){
				sInterventionReturn = currSupervisorInterventionItem;
				break;
			}
		}
	} 
	return sInterventionReturn;
};


/**
 * Sets the amount value of supervisor intervention data within saleTx(saleTx.supervisorInterventions)
 * in which the interventionType is equals to saleTx.type. Also initialise the remaining interventionn data
 * with ZERO if found NULL.
 * 
 */
SUPERVISOR_INTERVENTION.setTotalAmountBySaleTxType = function(tx){
	/* Integrate the amount value to saleTx.supervisorInterventions array,
	 * should only integrate the amount if the interventionType is a full transaction type,
	 * (i.e. Pick-up, Float; and not itemVoid, which is a micro feature)
	 */	
	if(	   tx
	   &&  tx.type
	       // if saleTx.supervisorInterventions is not empty
	   && (tx.supervisorInterventions)){
		var currSupvrIntvItem;
		for (var txTypeKey in CONSTANTS.TX_TYPES) {
			var currTxTypeProp =  null;
		    if (	 txTypeKey 
		    	 &&	 CONSTANTS.TX_TYPES.hasOwnProperty(txTypeKey)
		    	 && (currTxTypeProp = CONSTANTS.TX_TYPES[txTypeKey])
		         && !isFunction(currTxTypeProp)
		         && TX_TYPE.prototype.isPrototypeOf(currTxTypeProp)) {		    	
		    	var currTxTypeName = currTxTypeProp.getTypeLabel();
		    	while(currSupvrIntvItem = SUPERVISOR_INTERVENTION.getLastInstanceByInterventionType(tx, currTxTypeName)){
		    		var isTxTypeWithFullAmt = $.inArray(currTxTypeName, fullTxWithSupervisorInterventionAndAmountTypeLabel) >= 0;
		    		currSupvrIntvItem.amount = (isTxTypeWithFullAmt)? (CASHIER.getFinalSubtotalTxAmount(tx) || 0)
		    										                :  0; 
		    	}
		    }
		}	
	}
};

/**
 * An AJAX call to save the supervisor intervention data directly. 
 * @param transactionId - the transactionId to link with the supervisorInterventionData
 * @param supervisorInterventionData - the data to save
 * 
 */
SUPERVISOR_INTERVENTION.saveInterventionData = function(transactionId, 
													    supervisorInterventionData,
													    overridenAmount){
	
	var amount = null;
	if(   transactionId
	   && supervisorInterventionData){
		// Setting the amount to ZERO, if null
		supervisorInterventionData.amount = (amount = supervisorInterventionData.amount)? amount: (overridenAmount || 0);	
		
		$.ajax({
			url 		: posWebContextPath + "/cashier/saveSupervisorIntervention/" + transactionId,
			type		: "POST",
			dataType 	: "json",
			async	    : false,
			contentType	: "application/json; charset=utf-8",
			data		: JSON.stringify(supervisorInterventionData),
		    error	    : function(jqXHR, textStatus, errorThrown) {
				uilog('DBUG','Error: '  + errorThrown.message
					    +"\nError Response: " + jqXHR.responseText ,"error");
			}
		});
	} 
};

/**
 * Extracts the supervisor authentication data and returns it.
 * 
 * $domWithSupvrData the JQuery dom instance containing 
 * the supervisor authentication data.
 */
SUPERVISOR_INTERVENTION.extractSupervisorInterventionData = function($domWithSupvrData, trialMode){
	// Start: Supervisor intervention data processing
	var keySupvrData = "supervisorInterventionRes";
	var keyInterventionType = "interventionType";
	var supervisorInterventionData = $domWithSupvrData.data(keySupvrData);
	var interventionType = $domWithSupvrData.data(keyInterventionType);
    // TODO - implement this
		
    if (supervisorInterventionData) {
		supervisorInterventionData.trialMode = trialMode;
		supervisorInterventionData.posNumber = configuration ? configuration.terminalNum : null; //set pos number
	}

	if(   interventionType 
	   && supervisorInterventionData) {
		var interventionTxType = CONSTANTS.TX_TYPES.findTxTypeByName(interventionType);
		// Setting the label
		supervisorInterventionData.interventionType = interventionTxType.getTypeLabel();
		if (   interventionType != CONSTANTS.TX_TYPES.RECALL.name
			&& interventionType != CONSTANTS.TX_TYPES.REPRINT_RECEIPT.name
		    && interventionType != CONSTANTS.TX_TYPES.SALE_VOID.name) {
			SUPERVISOR_INTERVENTION.pushAsSaleTxData(supervisorInterventionData);
		}	
	}
	// Clearing the source of extracted supervisorIntervention Data
	$domWithSupvrData.data(keySupvrData        , null);
	$domWithSupvrData.data(keyInterventionType , null);

	// returning the value
	return supervisorInterventionData;
};


/**
 * Gets the latest supervisor intervention-type of the passed 
 * array of tx-types (interventionTypeArr)
 * 
 * @returns intervention-type label, null if none of the passed interventionTypeArr values 
 * are within the saleTx.supervisorInterventions.
 */
SUPERVISOR_INTERVENTION.getLatestInterventionTxTypeInstanceByTxTypes = function(tx, txTypeArr){
	var supervisorInterventions = null;
	var keyInterventionType = 'interventionType';
	var interventionTxTypeReturn = null;		
	if(    tx
	   && (supervisorInterventions = tx.supervisorInterventions)
	   &&  txTypeArr){		
		// Search from last to first
		for (var countDown = (supervisorInterventions.length - 1); countDown >= 0; countDown--) {
			var currSupervisorInterventionItem    = supervisorInterventions[countDown];
			var currSuprvisorInterventionTypeName = currSupervisorInterventionItem[keyInterventionType];
			jQuery.each(txTypeArr, function(index, item) {
				// Cross checking the intervention type name to the tx-type label.
				if( currSuprvisorInterventionTypeName == item.getTypeLabel()){
					interventionTxTypeReturn = item;
					return false;
				}				
			});
			if(interventionTxTypeReturn){
				break;
			}
		}
	} 
	return interventionTxTypeReturn;
};

SUPERVISOR_INTERVENTION.saveCustomSupervisorIntervention = function(supervisorInterventionData) {
	$.ajax({
		url      : posWebContextPath + "/supervisorIntervention/saveAuthentication",
		type     : "POST",
		async    : true,
		dataType : "json",
		contentType : "application/json",
		data     : JSON.stringify(supervisorInterventionData),
		timeout: 10000, //10 seconds
		success  : function(response) {
			//do something
		},
		error : function(jqXHR, status, error) {
			uilog("DBUG","Failed to save supervisor intervention. Error: ", error);
			//showMsgDialog('Error: ' + error,"error");
		}
	});
}

/*******************************************************************************
 * END : Functions used Supervisor Intervention
 ******************************************************************************/