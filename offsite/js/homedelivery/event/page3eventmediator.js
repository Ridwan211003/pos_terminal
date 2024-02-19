var page3eventmediator = {};

_.extend(page3eventmediator, Backbone.Events);

page3eventmediator
		.on('show', function(options) {
					if (!app.page3View.deliveryItemsView) {
						app.page3View.setDeliveryItemsView(new Homedelivery.Page3DeliveryItemsListView({collection : options.posTxItems}));
						app.page3View.deliveryItemsView.render();
					}
					app.page3View.setTransactionAmount(options.transactionAmount);
//					app.page3View.renderCustomerData(options.addedIds);
					app.page3View.showUp(options.addedIds);
				});

//  ---------------------------------------------------------------------
// | @author cyra tanglay												 |
// | if the transaction in making an installation succeeded      	     |
// | loading icon will disappear and installation note will be displayed |
//  ---------------------------------------------------------------------
page3eventmediator.on('transactionresult:success', function(data, view) {
	$('#loading').hide();
	$('#overlay').hide();
	uilog("DBUG","page3eventmediator#transactionresult:success ");
	if (data.errors && _.keys(data.errors).length > 0) {
		alert(JSON.stringify(data.errors));
		// view.showErrorMessages();
	} else {
		view.clear();
		mediator.trigger('page3:next', view);
		var page4View = new Homedelivery.Page4View();
		page4View.render(data);
	}
});

page3eventmediator.on('transactionresult:fail', function(data, view) {
	$('#loading').hide();
	$('#overlay').hide();
	uilog("DBUG","page3eventmediator#transactionresult:fail");
	alert('Server error! Contact your administrator');
	if (data.errors && _.keys(data.errors).length > 0) {
		// view.showErrorMessages
	}
});

page3eventmediator.on('sending_email_failure', function(data, view) {
	$('#loading').hide();
	$('#overlay').hide();
	alert("Email not sent to supplier");
	page3eventmediator.trigger('transactionresult:success', data,
			view);
})


page3eventmediator.on('page3:save', function(view, deliveryDate, customerView,
		receiverView, deliveryItemsView, deliveryFeeView, deliveryType) {
	
	
	var params = {};
	posTxItems = deliveryItemsView.collection;
	params.deliveryDate = deliveryDate;
	params.transactionAmount = view.transactionAmount;
	params.paymentType = deliveryFeeView.model.paymentType;
	params.cardNumber = deliveryFeeView.model.getMaskedCardNumber();
	params.deliveryAddressSame = view.sameDeliveryAdd;
	params.homeAddress = customerView.addressView.model.toParams();
	params.deliveryAddress = receiverView.addressView.model.toParams();
	params.customerProfile = customerView.profileView.model.toParams();
	params.receiverProfile = receiverView.profileView.model.toParams();
	params.hdDeliveryItems = deliveryItemsView.collection.getHdDeliveryItems();
	params.deliveryType = deliveryType;
	params.addedIds = app.addedTransactionCollection.getAddedIds();
	params.loggedInUsername = loggedInUsername;
	params.loggedInUserId = loggedInUserId;
	params.posTransactionDTO = deliveryFeeView.model.toPosTransactionDTO();

	uilog("DBUG", params);
	
	//  --------------------------------------------------------------------------------------------------------
	// | @author cyra tanglay                    																|
	// | if the delivery type is ac installation                                          						|
	// | if the email status is failed -- it will only fail if the app cannot connect to the mail server due to | 
	// | wrong credentials, no connection to the mail server                                                    |
	// | not a valid email address of the recipient or sender                                                   |
	//  --------------------------------------------------------------------------------------------------------
	if (deliveryType == "AC_INSTALLATION") {
			ajax.createHdTransaction(params, function(data) {
			
				$.extend(data, {
					deliveryPrintType : 'ORIGINAL'
				});
				$.extend(data, {
					deliveryType : deliveryType
				});
				if (data.emailStatus == "FAILED") {
					page3eventmediator.trigger('sending_email_failure', data, view);
				} else {
					page3eventmediator.trigger('transactionresult:success', data,
						view);
				}
			}, function(data) {
				page3eventmediator
						.trigger('transactionresult:fail', data, view);
			});
	} else {
		ajax.createHdTransaction(params,
				function(data) {
					$.extend(data, {
						deliveryPrintType : 'ORIGINAL'
					});
					$.extend(data, {
						deliveryType : deliveryType
					});
					page3eventmediator.trigger('transactionresult:success',
							data, view);
				}, function(data) {
					page3eventmediator.trigger('transactionresult:fail', data,
							view);
				});
	}
});


function checkProductDeliveryStatus(posTxItems) {
	var ctr =0;
	var isForDelivery = false;
	posTxItems.each(function(item){
		if(item.get('hdDeliveryItemType') == "ALREADY_FOR_DELIVERY") {
			ctr ++;
		}
	})
	
	if(ctr == posTxItems.length) {
		isForDelivery = true;
	}
	
	return isForDelivery;
}

