var Hypercash = Hypercash || {};

/**
 * List of URLs used in Hypercash-related web service calls.
 */
Hypercash.url = {
	taxInvoiceNumber:	posWebContextPath + '/hypercash/hypercashsequence/taxInvoiceNumber/',
	taxInvoiceToday: posWebContextPath + '/hypercash/taxinvoice/find/terminalId/today/',
	printTaxInvoice: posWebContextPath + '/cashier/printTaxInvoice/',
	taxInvoiceValidToReprint: posWebContextPath + "/hypercash/taxinvoice/reprint/findByTxnId/",
	printReturnNote: proxyUrl + "/printReturnNote",
	checkAvailableSequence: posWebContextPath + "/hypercash/hypercashsequence/checkAvailableSequence",
  getProductsByBarcodeStartingWith: posWebContextPath + "/product/getProductsByBarcodeStartingWith/",
  getReturnNote: posWebContextPath + "/cashier/returnNote/"
};

Hypercash.ajax = {
  /**
   * Generic AJAX call.
   * @param options - contains the values to supply to in the generic AJAX call such as url, data, etc.
   */
	request : function(options) {
		var response;
		$.ajax({
			url: options.url,
			type: options.type == undefined? 'GET' : options.type,
			cache: false,
			dataType: options.dataType == undefined ? 'json' : options.dataType,
			data: options.data,
			contentType: options.contentType == undefined ? 'application/json' : options.contentType,
            async: options.async == false ? false : true,
            success: function (data) {
                response = data;
                if (options.success) options.success(data);
            },
			error: function (xhr, status, error) {
				uilog("DBUG", xhr);
				uilog("DBUG", status);
				uilog("DBUG", error);
				if (options.error) options.error({errorCode : xhr.status , status : status, error: error});
			},
            complete: function () {
                if (options.complete) options.complete();
            }
		});
	},

  /**
   * Returns the tax invoice that matches the specified parameters.
   * @param statusCode - status code of the txn.
   * @param transactionCode - txn id.
   * @param callback - function to execute once the AJAX call was successful.
   * @param errorCallback - function to execute if the AJAX call encountered an error.
   */
	getTaxInvoice : function(statusCode, transactionCode, callback, errorCallback){
  	this.request({
  		url : Hypercash.url.taxInvoiceNumber + statusCode + '/' + transactionCode,
  		async : false,
  		success : function(data){
  			if(callback) callback(data);
  		},
  		error : function(data){
  			if(errorCallback) errorCallback(data);
  		}
  	});
  },

  /**
   * Returns a list of tax invoices issued today per terminal.
   * @param container - html element where the list will be rendered.
   * @param callback - function to execute once the AJAX call was successful.
   * @param errorCallback - function to execute if AJAX call encountered an error.
   */
  getTaxInvoiceToday : function(container, callback, errorCallback){
  	this.request({
  		url : Hypercash.url.taxInvoiceToday + configuration.terminalId,
  	    async : false,
  	    success : function(data){
  	    	if(callback) callback(container, data);
  	    },
  	    error: function(data){
  	    	if(errorCallback) errorCallback(data);
  	    }
  	});
  },

  /**
   * Returns the DTO representation of the tax invoice with specified transaction number.
   * @param transactionNumber - txn id.
   * @param callback - function to execute once the AJAX call was successful.
   * @param errorCallback - function to execute if AJAX call encountered an error.
   */
  printTaxInvoice : function(transactionNumber, callback, errorCallback) {
    var reqUrl = Hypercash.url.printTaxInvoice + transactionNumber;

    if (Hypercash.printInBigPrinter) {
      reqUrl += "?printInBigPrinter=" + Hypercash.printInBigPrinter;
    }

   	this.request({
   		url : reqUrl,
   		async : false,
   		success : function(data) {
   			if(callback) callback(data);
   		},
   		error: function(data) {
   			if(errorCallback) errorCallback(data);
   		}
   	});
  },

  /**
   * Finds valid tax invoice with the specified transaction id.
   * @param transactionNumber - txn id.
   * @param callback - function to execute once the AJAX call was successful.
   * @param errorCallback - function to execute if AJAX call encountered an error.
   */
  findTaxInvoiceByTxnId : function(txnId, callback, errorCallback) {
    this.request({
      url: Hypercash.url.taxInvoiceValidToReprint + txnId,
      type: "GET",
      async: false,
      success: function(data) {
        if (callback) callback(data);
      },
      error: function(data) {
        if (errorCallback) errorCallback(data);
      }
    });
  },

  /**
   * Triggers the printing of return note in proxy with specified data.
   * @param requestData - values to supply in the return note.
   * @param callback - function to execute once the AJAX call was successful.
   * @param errorCallback - function to execute if AJAX call encountered an error.
   */
  printReturnNote: function(requestData, callback, errorCallback) {
    this.request({
      url: Hypercash.url.printReturnNote,
      type: "POST",
      async: false,
      data: requestData,
      success: function(data) {
        if (callback) callback(data);
      },
      error: function(data) {
        if (errorCallback) errorCallback(data);
      }
    });
  },
  
  /**
   * Checks if there are still available tax invoice number from Hypercash Sequence back office.
   * @param callback - function to execute once the AJAX call was successful.
   * @param errorCallback - function to execute if AJAX call encountered an error.
   * @return boolean value
   */
  isThereAvailableTaxInvSequence : function(callback, errorCallback) {
    this.request({
      url: Hypercash.url.checkAvailableSequence,
      type: "GET",
      async: false,
      success: function(data) {
        if (callback) callback(data);
      },
      error: function(data) {
        if (errorCallback) errorCallback(data);
      }
    });
  },

  /**
   * Returns a list of products with barcode starting with specified plu.
   * @param plu - plu to be searched.
   * @param callback - function to execute once the AJAX call was successful.
   * @param errorCallback - function to execute if AJAX call encountered an error.
   */
  getProductsByBarcodeStartingWith: function(plu, callback, errorCallback) {
    this.request({
      url: Hypercash.url.getProductsByBarcodeStartingWith + plu,
      type: "GET",
      async: false,
      success: function(data) {
        if (callback) callback(data);
      },
      error: function(data) {
        if (errorCallback) errorCallback(data);
      }
    });
  },

  getReturnNote: function(txnId, customerNumber, callback, errorCallback) {
    this.request({
      url: Hypercash.url.getReturnNote + txnId + "/" + customerNumber,
      type: "GET",
      async: false,
      success: function(data) {
        if (callback) callback(data);
      },
      error: function(data) {
        if (errorCallback) errorCallback(data);
      }
    });
  }
};