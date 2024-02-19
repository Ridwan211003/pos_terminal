var mediator = {};

_.extend(mediator, Backbone.Events);

mediator.on("alert", function(msg) {
	alert("Triggered " + msg);
});

//This function will hide page1 and will show page2View
mediator.on("page1:next", function($page1){
	uilog("DBUG","mediator#page1Next");
	$page1.hide();
	app.page2View.render();
});

//This function will trigger page5eventmediator.js init function
mediator.on("page1:searchOrder", function($page1){
	uilog("DBUG","page1:searchOrder triggered");
	$page1.hide();
	page5eventmediator.trigger('init');
});

mediator.on("page1:printOrderReport", function($page1){
	alert('Print order not yet implemented');
});

mediator.on("page2:back", function(){
	app.page1View.$el.show();
	app.page2View.$el.hide();
});

mediator.on("page2:next", function(options, $view){
	app.page2View.$el.hide();
//	$view.hide();
	page3eventmediator.trigger('show', {
		posTxItems : options.posTxItems,
		addedIds : options.addedIds,
		transactionAmount : options.transactionAmount
	});
});

mediator.on("page3:next", function(page3view){
	app.page2View.posTxItemListView.posTxItems.reset();
	page3view.$el.hide();
});


//This function will just make page2View visible
mediator.on("page3:back", function($view){
	$view.hide();
	app.page2View.$el.show();
});

//This will clear all the inputted values in page3
mediator.on("clear:all", function(){
	app.page3View.clear(); 
});

mediator.on('home', function(view){
	app.searchControlsView.trigger('clearAll');
	view.hide();
	app.page1View.$el.show();
	if(app.page3View){
		app.page3View.clear();
	}
});
