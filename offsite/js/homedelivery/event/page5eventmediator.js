var page5eventmediator = {};
_.extend(page5eventmediator, Backbone.Events);

page5eventmediator.on('init', function(options){
	if(!app.page5View){
		app.page5View = new Homedelivery.Page5View({collection : new Homedelivery.HdSearchOrderResultCollection() });		
	}
	app.page5View.render();
});

page5eventmediator.on('print', function(model){
	if(!model.hdTransaction){
		var hdTransaction = new Homedelivery.HdTransaction().set('id', model.get('hdTransactionId'));
		model.hdTransaction = hdTransaction;		
	}
	model.hdTransaction.fetch({
		success: function (model, response, options){
			model.set('deliveryPrintType', 'REPRINT / DUPLICATE');
			var printView = new Homedelivery.PrintView({ model : model }).render();
			$(printView).printArea(hdSettings.printSearchOrderSettings);
		}, error : function(model, response, options){
			alert('Printing delivery order failed');
		}
	});
});


