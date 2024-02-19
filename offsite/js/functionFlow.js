/**==========================================================================**
 * START : FUNCTION FLOW
 * Used for simulating a FLOW like execution of function buttons
 * @author mdelrosario 
 * 
 **==========================================================================**/
var FUNCTION_FLOW = FUNCTION_FLOW || {};

//*** START: Object Constructor ***

/**
 * The object containing the function details for the FunctionFlowQueue object.
 * 
 * @param fnId the functionId specifically the button-id of the original function
 * @param fnName the pseudo name of the function, used mainly for logging
 * @param fnToExecute the function that will be used to overwrite the original
 * @returns
 */
FUNCTION_FLOW.FunctionDetails = function FunctionDetails(fnId, 
						                                 fnName, 
						                                 fnToExecute){
	this.fnId   	 = fnId;
	this.fnName 	 = fnName;
	this.fnToExecute = fnToExecute;
};

FUNCTION_FLOW.FlowOrderDetails = function FlowOrderDetails(flowOrderSameLevelFnArr, 
														   isOptional, 
														   isInfinite) {
	this.flowOrderSameLevelFnArr = flowOrderSameLevelFnArr;
	this.isOptional = (isOptional)? isOptional: false;
	this.isInfinite = isInfinite;
};

/**
 * The Queue object for containing the configuration of the intended step by step function flow triggering.
 * 
 * @param interferingFnArr - the Array of FUNCTION_FLOW.FunctionDetails, which contains
 * the details of interfering function. This contains all the functions that can interfere the FLOW.
 * If the FUNCTION_FLOW.FunctionDetails.fnToExecute returns "true", it will return
 * the function to original function.
 * @param flowOrderDetails - the Array of FUNCTION_FLOW.FlowOrderDetails, which is considered the main FLOW itself.
 * This will be triggered in order, considering the additional parameters(isOptional, isInfinite). If the
 * FUNCTION_FLOW.FlowOrderDetails.FunctionDetails.fnToExecute  returns "true" or "undefined", it will proceed, if "false"
 * it would rendered the button as if it were not clicked and the flow would not proceed.
 * @param notInFlowFn - the function to execute when none of the interferingFnArr nor flowOrderFnArr will be triggered.
 * @param fnThisScope - the "this" scope that would be used for the functions specified above(interferingFnArr, flowOrderDetails[*].flowOrderSameLevelFnArr, notInFlowFn),
 * used mainly to connect the specified functions to the top level context of "this", which is the GLOBAL_OBJECT itself.
 * @returns - the FUNCTION_FLOW.FunctionFlowQueue object used for $.functionFlow(queueObj) utility.
 */
FUNCTION_FLOW.FunctionFlowQueue = function FunctionFlowQueue(interferingFnArr, 
														     flowOrderDetails, 
														     notInFlowFn, 
														     fnThisScope) {	
	/**
	 * Used for counting the trigger occurrence of each flowOrderDetails[*].flowOrderSameLevelFnArr
	 * of the current level. Not utilised if flowOrderDetails[*].isInfinite is true.
	 */
	this.tempContainerObj = {
		/*	
		'0' : { key1: occurrenceCount1 },
		'3' : { key2: occurrenceCount2 }
		*/
	};		
	// The flow always start at position 1.
	this.currPosition     = 1;	
	if(   flowOrderDetails
	   && fnThisScope) {	
		
		this.interferingFnArr   = interferingFnArr;
		this.flowOrderDetails   = flowOrderDetails;
		this.notInFlowFn        = notInFlowFn;	
	} else {
		// If has invalid argument/s, return Error
		throw new Error(">> Has invalid argument/s!");
	}
	
	/**
	 * Extracts all the FUNCTION_FLOW.FunctionDetails instances from 
	 * flowOrderDetails[positionToSearch].flowOrderSameLevelFnArr. If positionToSearch is NULL,
	 * search all the levels/position for extraction.
	 * 
	 * @param positionToSearch the position from which to look for.
	 * 
	 * @returns the Array of extracted FUNCTION_FLOW.FunctionDetails
	 */
	this.extractFunctionDetails = function(positionToSearch){
		var extractedFunctionDetails = [];
		if(positionToSearch == undefined) { 
			for(var member in this.flowOrderDetails){
				extractedFunctionDetails = extractedFunctionDetails.concat(this.flowOrderDetails[member].flowOrderSameLevelFnArr);
			}
		} else if(positionToSearch <= flowOrderDetails.length){
			extractedFunctionDetails = extractedFunctionDetails.concat(this.flowOrderDetails[(positionToSearch - 1)].flowOrderSameLevelFnArr);
		} else {
			extractedFunctionDetails = null;
		}
		return extractedFunctionDetails;			
	};

	/**
	 * Sets the this scope for all the passed argument functions within the FunctionFlowQueue
	 * namely: interferingFnArr, flowOrderDetails[*].flowOrderSameLevelFnArr and notInFlowFn.
	 */
	this.setFnScope = function(){
		
		var mergedFnArrRef = $.merge([], interferingFnArr);
		mergedFnArrRef = mergedFnArrRef.concat( this.extractFunctionDetails(), 
											    // Making notInFlowFn function same type as array of FUNCTION_FLOW.FunctionDetails
											   [new FUNCTION_FLOW.FunctionDetails(null, null, notInFlowFn)]);
		for(var member in mergedFnArrRef){
			var fnToExecuteHolder = null;
			if((fnToExecuteHolder = member.fnToExecute) != undefined){
				// Binding each function's object scope
				fnToExecuteHolder.bind(fnThisScope);
			}
		}
	};	
	/**
	 * Finds the nearest FUNCTION_FLOW.FunctionDetails in the FLOW(flowOrderDetails) utilising 
	 * the fnId parameter.
	 * @param isFnId the identifier used for searching
	 * 
	 * @returns an Object containing the position found and the actual FUNCTION_FLOW.FunctionDetails instance
	 *    {
	 *    	'positionFound': position,
			'fnDetails'    : FUNCTION_FLOW.FunctionDetails
	 *    }
	 */
	this.searchValidFnDetails = function(fnId){
		//uilog("DBUG","** enter searchValidFnDetails( isFnId)");
		
		var returnFnDetails  = null;
		var flowOrderDetails = this.flowOrderDetails;
		var currPosition     = this.currPosition;
		var flowOrderDetailItem;

		if(    currPosition != 0 // Check if currPosition is nonZero;
		   &&  currPosition <= flowOrderDetails.length
		   && (flowOrderDetailItem = flowOrderDetails[currPosition - 1])){
			
			var isValid = false;
			var searchedFnDetails;
			
			var isInCurrPosition  = !!(searchedFnDetails = this.getFnDetailsIfFnIdIsPresentInCurrentPosition(fnId, currPosition));
			/* IF CONDITION #1: 
			 * 		isOptional[FALSE], 
			 * 		isInfinite[FALSE]
			 */ 
			if(   !flowOrderDetailItem.isOptional
			   && !flowOrderDetailItem.isInfinite) {
				
				isValid =     isInCurrPosition
						  && !this.checkIfPresentInTempContainerObj(fnId, currPosition, false/*true*/);				
			} 				
			/* IF CONDITION #2: 
			 * 		isOptional[FALSE], 
			 *      isInfinite[TRUE ]
			 */ 
			else if (   !flowOrderDetailItem.isOptional
					 &&  flowOrderDetailItem.isInfinite) {
					isValid =    isInCurrPosition;
			}				
			/* IF CONDITION #3: 
			 * 		isOptional[TRUE ], 
			 *      isInfinite[FALSE]
			 */ 
			else if (    flowOrderDetailItem.isOptional
					 && !flowOrderDetailItem.isInfinite) {
					isValid = (     isInCurrPosition 
							  &&  ! this.checkIfPresentInTempContainerObj(fnId, currPosition, false/*true*/)
							  )
						   || (   ! isInCurrPosition 
					          && !!(searchedFnDetails = this.getFnDetailsIfFnIdIsPresentInSucceedingPosition(fnId, currPosition))
					          &&  ! this.checkIfPresentInTempContainerObj(fnId, searchedFnDetails.positionFound, false/*true*/)
					          );
			}				
			/* IF CONDITION #4: 
			 * 		isOptional[TRUE ], 
			 *      isInfinite[TRUE ]
			 */ 
			else if (   flowOrderDetailItem.isOptional
					 && flowOrderDetailItem.isInfinite) { 
				
				isValid =     isInCurrPosition 
						   ||	  ! isInCurrPosition 
					          && !!(searchedFnDetails = this.getFnDetailsIfFnIdIsPresentInSucceedingPosition(fnId, currPosition))
					          &&  ! this.checkIfPresentInTempContainerObj(fnId, searchedFnDetails.positionFound, false/*true*/);
			}				
			
			if(isValid){					
				// Returning the searched FunctionDetails within a new object, with an additional positionFound value
				returnFnDetails = searchedFnDetails;
			}				
			//uilog("DBUG","** isFnId: \""+ isFnId +"\", currValidFnIdentifier: \"" + currValidFnIdentifier + "\"");
		} else {
			// Current position invalid.
			//uilog("DBUG","Error: Current Position[" + currPosition 
			//		    + "] invalid, flowOrderDetails Length[" + flowOrderDetails.length + "]");
		}							
		return returnFnDetails;
	};		
	/**
	 * Checks whether the fnId's button is already triggered ONCE or NOT
	 * @param fnId, the fnId to search
	 * @param initPosition, the position/level to look up whether the fnId is triggered ONCE or NOT 
	 * @param isForSaving, whether to save as triggered ONCE, or ignore saving.
	 */
	this.checkIfPresentInTempContainerObj = function(fnId, initPosition, isForSaving){
		var initIndex = (initPosition - 1);
		var searchTempContainerObjIndex;
		var tempContainerObjLocal = this.tempContainerObj;
		var isNotPresent =    !(initIndex in tempContainerObjLocal)
		                    || (   (searchTempContainerObjIndex = tempContainerObjLocal[initIndex])
		                        && !searchTempContainerObjIndex[fnId]);
		if(   isForSaving
		   && isNotPresent){
			searchTempContainerObjIndex = searchTempContainerObjIndex || (tempContainerObjLocal[initIndex] = {});
			searchTempContainerObjIndex[fnId] = fnId;
		}
		return !isNotPresent;
	};
	/**
	 * Checks whether there are items needed to be triggered ONCE, in the current
	 * level(initPosition).
	 */
	this.checkIfHasRemainingItemsInTempContainerObj = function(initPosition){
		
		var hasRemainingItems = true;
		if(initPosition){
			var currPositionFunctionDetails   = this.extractFunctionDetails(initPosition);
			var triggeredFunctionDetailsFnIds = this.tempContainerObj[(initPosition - 1)];
			
			if(   triggeredFunctionDetailsFnIds
			   && currPositionFunctionDetails
			   && Object.keys(triggeredFunctionDetailsFnIds).length == currPositionFunctionDetails.length){				
				hasRemainingItems = false;
			} else {
				//uilog("DBUG","** Has remaining item/s");
			}
		}
		return hasRemainingItems;
	};
	/**
	 * Search the FnDetails by fnId within the current FUNCTION_FLOW.FlowOrderDetails level(initPosition)
	 */
	this.getFnDetailsIfFnIdIsPresentInCurrentPosition = function(fnId, initPosition){
		// Search Only the current position;
		return this.getFnDetailsIfFnIdIsPresent(fnId, initPosition, false);
	};
	/**
	 * Search the FnDetails by fnId within the current FUNCTION_FLOW.FlowOrderDetails level(initPosition)
	 * upto the last level.
	 */
	this.getFnDetailsIfFnIdIsPresentInSucceedingPosition = function(fnId, initPosition){
		// Search All
		return this.getFnDetailsIfFnIdIsPresent(fnId, initPosition, true);
	};
	/**
	 * Search the FnDetails by fnId within the current FUNCTION_FLOW.FlowOrderDetails level(initPosition).
	 * Searches from current level up to the last level, if and only if isSearchAll is TRUE.  
	 */
	this.getFnDetailsIfFnIdIsPresent = function(fnId, initPosition, isSearchAll){
        var isPresent = false;
        var currIndex = 0, currItem, returnFnDetails, searchedFnDetails;
        var flowOrderDetailsIndex = (initPosition - 1);
        var items = this.extractFunctionDetails(initPosition);
        while(   currItem = items[currIndex++]){
            if(currItem.fnId == fnId){
                searchedFnDetails  = currItem;
                //uilog("DBUG","flowOrderDetails[%s], %s was found!", flowOrderDetailsIndex, searchedFnDetails.fnName);
		    	isPresent = true;
                break;
            }
        }
		if(   !isPresent
		   &&  isSearchAll
		   &&  items
		   &&  this.flowOrderDetails[flowOrderDetailsIndex].isOptional // isOptional == TRUE
		   // Calling itself: recursive function
		   && (returnFnDetails = this.getFnDetailsIfFnIdIsPresent(fnId, (initPosition + 1), isSearchAll))) {
			isPresent = true;			
		} else {
            returnFnDetails = { 'positionFound': initPosition, 'fnDetails': searchedFnDetails};
        }
		// return the object if present, otherwise FALSE
		return (isPresent)? returnFnDetails : false;
	};
	/**
	 * Fetches all the valid for clicking FUNCTION_FLOW.FlowOrderDetails' FUNCTION_FLOW.FunctionDetails.fnNames 
	 * starting from the specified level(initPosition)
	 */
	this.getAllValidForExecutionFnNames = function(initPosition){
		var validFnNameArr = [];
		
		var flowOrderDetailsIndex = (initPosition - 1);
		var currFlowOrderDetails = this.flowOrderDetails[flowOrderDetailsIndex];
		var currIndex = 0, currItem;
		var items = this.extractFunctionDetails(initPosition);

		while(   currItem = items[currIndex++]){
		    if(		currFlowOrderDetails.isInfinite
			    || (   !currFlowOrderDetails.isInfinite
			        && !this.checkIfPresentInTempContainerObj(currItem.fnId, initPosition, false)
			       )){
		    	validFnNameArr.push(currItem.fnName);
		    } 
		}	
		
		var hasNext =     items
					  &&  currFlowOrderDetails.isOptional // isOptional == TRUE
				      &&  initPosition < this.flowOrderDetails.length;
		if(    hasNext
			   // Calling itself, recursive function implementation.
		   && (validFnNameArr = validFnNameArr.concat(this.getAllValidForExecutionFnNames(initPosition + 1)))){		
			// Remove duplicates
			validFnNameArr = validFnNameArr.filter(function(elem, pos, self) {
			    return self.indexOf(elem) == pos;
			});
		}	
		// return the object if present, otherwise FALSE
		return validFnNameArr;
	};
	/**
	 * Checks whether an fnId is present either in flowOrderDetails OR interferingFnArr Arrays.
	 * @param fnId the fnId to search
	 * @param isLookingForClickOrderFn true if looking within clickOrferFn Array, interferingFnArr Array otherwise. 
	 * @returns true if found, false otherwise
	 */
	this.isFnIdPresent = function(fnId, isLookingForClickOrderFn){
		
		return !!this.getFnDetails(fnId, isLookingForClickOrderFn);
	};
	/**
	 * Gets the function fnToExecute within flowOrderDetails OR interferingFnArr array by fnId
	 * @param fnId the fnId used for searching
	 * @param isLookingForClickOrderFn true if looking within clickOrferFn Array, interferingFnArr Array otherwise. 
	 * @returns the found fnToExecute function
	 */
	this.getInterferingFnToExecuteByFnId = function(fnId){
        var searcheFnDetailsFnToExecute;
        var searchedFnDetails = this.getFnDetails(fnId, false);
		return (    searchedFnDetails
				&& (searcheFnDetailsFnToExecute = searchedFnDetails.fnToExecute))? searcheFnDetailsFnToExecute: null;
	};
	/**
	 * Gets the FunctionDetails instance 
	 * @param fnId the fnId to search
	 * @param isLookingForOrderFn, tells whether to look at:
	 * 	<pre> 
	 * 		TRUE : flow order functions array  (this.flowOrderDetails[*].flowOrderSameLevelFnArr)
	 * 	    FALSE: interfering functions array (this.interferingFnArr)
	 *  </pre>
	 * @returns FunctionDetails instance if found, NULL otherwise
	 */
	this.getFnDetails = function(fnId, isLookingForClickOrderFn){
		
		var currIndex = 0, currItem;
		var items = (isLookingForClickOrderFn)? this.extractFunctionDetails() /*this.flowOrderFnArr*/
											  : this.interferingFnArr;
		// Searched object to return
		var returnFnDetails = null;
		while(   currItem = items[currIndex++]){
		    if(currItem.fnId == fnId){
		    	//uilog("DBUG", currItem.fnName + " was found!");
		    	returnFnDetails = currItem;
		    	break;
		    }
		}
		return returnFnDetails;
	};
	/**
	 * Advance the position of FunctionFlowQueue's currPosition by 1
	 * @returns true if increased, false otherwise.
	 */
	this.increasePosition = function(searchedFunction){		
		/* 
		 * 1.) Update current position
		 * 2.) Conditional operations, checking if valid for increasing this.currPosition
		 */		
		var isLastItem = false;
		if(searchedFunction) {
			this.currPosition = (this.currPosition < searchedFunction.positionFound)? searchedFunction.positionFound
					                                                                 : this.currPosition;
			var flowOrderDetailsLength = this.flowOrderDetails.length;
			var isValidToIncrease =     this.currPosition <= (flowOrderDetailsLength)
			                   		&& !this.flowOrderDetails[(this.currPosition - 1)].isInfinite
			                   		&& !this.checkIfHasRemainingItemsInTempContainerObj(this.currPosition);
			if(isValidToIncrease) {
				// If in the last item, and this.currPosition is for increasing.
				isLastItem = (this.currPosition == flowOrderDetailsLength);
				this.currPosition++;
				//uilog("DBUG","** Increasing queueObj position to \"" + this.currPosition + "\"");
			} else {
				//uilog("DBUG","** Warning: Not valid for increasing, clickOrderFnLength: \"" + flowOrderDetailsLength + "\", "
				//			+ "currPosition: \"" + this.currPosition + "\"");
			}
		}
		return !isLastItem;
	};
	/**
	 * Forced this object to increase it position, regardless of
	 * the flow restrictions.
	 * 
	 * @returns true if successfully increases the position, 
	 * false otherwise;
	 */
	this.forcedIncrementPosition = function(fnIdPositionToSearch){
		/*
		 * Increasing the current position if its lower that the 
		 * length of the flow.
		 */
		var searchedFn = this.getFnDetailsIfFnIdIsPresentInSucceedingPosition( fnIdPositionToSearch, this.currPosition);
		var positionFound = (searchedFn) ? searchedFn.positionFound: 0;
		return (positionFound && positionFound < this.flowOrderDetails.length) ? (this.currPosition = (positionFound + 1)) // always true
				: false;
	};
};
//*** END: Object Constructor ***

/**
 * JQuery functions below
 */	
FUNCTION_FLOW.FLOW_HANDLER = (function( $ ){		
	
	// Sample access, $(".flow").functionFlow( queueObj);
	
	// Container of the deeply cloned selected elements
	var clonedOriginalMap = {};
	var queueObj= null;
	
	/**
	 * Executes the flow of the FunctionFlowQueue object
	 */
	$.fn.functionFlow = function( passedQueueObj) {	
		/** 
		 *	passedQueueObj: Needed to assign to external variable 
		 *  for external flow overrides
		 */ 
		queueObj = passedQueueObj;
		// Set each flowRefContainer[keyQueueObj] function's object scope
		queueObj.setFnScope();		
		// Disregarding the default "fx" queue of JQuery
		var queueName = "custom";
		//this - jQuery object holds your selected elements
		return this.map( function ( i, elem ) {
			    var currFnId  = $(this).attr('id');
			    var clone = $( this ).clone(); 
			    // Cloning the original, without the data and events.
			    if (currFnId) {
			        /* Clone(deep-copy) all the selected element, used for returning the previous state
					 * after the flow execution.
					 * Saving the cloned original(super deep copy: means including events etc.) to a map
					 */ 
			        clonedOriginalMap[currFnId] = $( this ).clone(true, true);
			    	// Setting the clone's click eventHandler
			        $(clone).click(function() {		     	
			        	// If the currFnId is present within the Flow_Functions_Array(flowOrderDetails)
			        	if(queueObj.isFnIdPresent(currFnId, true)) {	
			        		//uilog("DBUG","++ in if if(queueObj.isFnIdPresent(currFnId, true))");		        		
			        		//uilog("DBUG","** Commencing queueing functions operation...");
			        		var returnedFnDetails = null;
			        		var foundValidFunctionDetails = null;
			        		$(this).queue(queueName, function(next) {		
			        			//uilog("DBUG","** Checkin the flow if valid! currFnId: \"" + currFnId + "\"");
					  			// 1st Function for "access validation filtering"
							    var isValid       = !!(returnedFnDetails = queueObj.searchValidFnDetails(currFnId));
							    foundValidFunctionDetails = (isValid)? returnedFnDetails.fnDetails
							    		                             : null;
							    if(isValid) {
							    	// Log that the particular function was click in the right order!
							    	//uilog("DBUG","%s was clicked in right order!", foundValidFunctionDetails.fnName);
							        // Calls the next queued function
							    	next();
							    } else {
							    	//uilog("DBUG","Invalid function selection clicked");
							    	var isAccessibleInCurrLevel = !!queueObj.getFnDetailsIfFnIdIsPresentInSucceedingPosition(
							    			currFnId, 
							    			queueObj.currPosition
							    	);
							    	queueObj.notInFlowFn(currFnId,
							    			             isAccessibleInCurrLevel,
							    			             queueObj.getAllValidForExecutionFnNames( queueObj.currPosition));
							    	// Clears the queue, remove anything left in the queue
							    	$(this).clearQueue(queueName);
							    }
							}).queue(queueName, function(next){
								//uilog("DBUG","** Executing the real intended method");
								// 2nd Function for executing the real intended function
								// Execute the function selected within flowOrderDetails 
								var hasFnToExecute = foundValidFunctionDetails.fnToExecute != null;
								var execFnReturnValue = (hasFnToExecute)? foundValidFunctionDetails.fnToExecute()
								                                        : $(clonedOriginalMap[currFnId]).triggerHandler('click');
								/* If the function return value is either
								 * "undefined"(meaning no return given/intended) or 
								 * "true", the flow will proceeds, otherwise not.
								 */
								var isToProceed =   execFnReturnValue === undefined
												 || execFnReturnValue == true;
								if( isToProceed){	
									// save in temporary container object
									queueObj.checkIfPresentInTempContainerObj(currFnId, returnedFnDetails.positionFound, true);
									/*
									 * Proceed to increasing/updating queueObj currPosition if not for-killing. Return to 
									 * original DOM state if both false
									 */
									if( queueObj.increasePosition(returnedFnDetails)){
										/* True means there's another steps to execute
										 * Calls the next queued function, if any 
										 */
									    next();	
									} else {
										// FALSE means end of the flow, and return to ORIGINAL DOM STATE								
										// Clears the queue, remove anything left in the queue
										$(this).clearQueue(queueName);
										// Return to ORIGNAL DOM STATE
										returnToOriginalDOMState(clonedOriginalMap);
									}								
								} /*else {
									queueObj.removeIfPresentInTempContainerObj(currItem.fnId, initPosition);
								}*/																		
							}).dequeue(queueName);	/* Execute the 2 functions above, in order */		        	
			  			}
			        	// If the currFnId is present within the Interfering_Functions_Array(interferingFnArr)
			        	else if (queueObj.isFnIdPresent(currFnId, false)) {
			        		//uilog("DBUG","** Interfering function executed! currFnId: \"" + currFnId + "\"");
			        		var interferingFnToExecute = queueObj.getInterferingFnToExecuteByFnId(currFnId);
				  			// Execute the function selected within interferingFnArr		        		
			        		var isReturnToOriginal = (interferingFnToExecute)? interferingFnToExecute()
			        													      // Execute the original click event handler(function)
			        													      : $(clonedOriginalMap[currFnId]).triggerHandler('click');
				  			if(   isReturnToOriginal) {
				  				// Return to ORIGINAL DOM STATE
				  				returnToOriginalDOMState(clonedOriginalMap);
				  			}
				  		}
			        	/*
			        	 * If currFnId not within either of Flow_Functions_Array(flowOrderDetails) or Interfering_Functions_Array(interferingFnArr),
			        	 * execute the provided "notInFlowFn" function.
			        	 */ 
				  		else {
				  			//uilog("DBUG","** Executing NOT_IN_FLOW function!");
				  			queueObj.notInFlowFn(currFnId);
				  		}
			        });		  			        
			        $( this ).replaceWith( clone );        
			    }
			    return clone[0];
		});  	
    };
    
    /**
     * Return the same old original DOM State, including data and events.
     */
    function returnToOriginalDOMState(clonedOriginalMap) {
    	
    	if(    clonedOriginalMap
    	   && !jQuery.isEmptyObject(clonedOriginalMap)) {
    		uilog("DBUG","** Returning the values to original!");
	    	for (var key in clonedOriginalMap){
	    		// uilog("DBUG","** Resetting \"%s\"", key);
	    		var currValue = clonedOriginalMap[key];
	    		if(currValue) {
	    			$('#' + key).replaceWith(currValue);
	    			// Do not change the clonedOriginalMap[key], to currValue
	    			// It is intended.
	    			delete clonedOriginalMap[key];
	    		}
	    	}
    	} else {
    		// uilog("DBUG",">> Has empty cloned original map!");
    	}
    } 
    return {
    	/**
    	 * Terminates the flow.
    	 */    	
	    terminateFlow: function(){
	    	//uilog("DBUG","** Forced terminate the function-flow");
	    	returnToOriginalDOMState(clonedOriginalMap);
	    },
	    /**
	     * Fetches the original DOM state of a particular fnId
	     * and execute it.
	     * @return the value return on the originally executed
	     * function.
	     */
	    triggerOriginalDOMFunction: function(fnId){
	    	var originalDOM = clonedOriginalMap[fnId];
			return (originalDOM)? $(originalDOM).triggerHandler('click')
					            : null;
		},
		/**
	     * Forced next level/position. Pass through function 
	     * call for FUNCTION_FLOW.FunctionFlowQueue's forcedIncrementPosition().
	     * @return true if incremented, false otherwise
	     */
	    forcedNextLevel: function(fnId){
	    	return (queueObj)? queueObj.forcedIncrementPosition(fnId)
                    		 : false;
		}
    };
})( jQuery );
/**==========================================================================**
 * END : FUNCTION FLOW
 **==========================================================================**/
