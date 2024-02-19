// This view handles search button, postransaction id text field, 
// transaction date and pos transaction date picker

// REFACTOR this! Use Backbone.View.Epoxy in binding transactionid and TransactionDate 
Homedelivery.SearchControlsView = Backbone.Epoxy.View.extend({
	el : '#searchControls',
	
	addedTransactionCollection : undefined,
	
	initialize : function(){
		_(this).bindAll('searchTransactionClick', 'clearAll', 'selectDate', 'clearDate');
		this.model = new Homedelivery.SearchTransaction();
		this.on('clearAll', this.clearAll, this);
		
		this.$('span.invalid.transactionId').hide();
		this.$('#transactionId').empty();
		this.$('#transactionByDate').datetimepicker(hdSettings.transactionDatePicker).val('');
	},
	
	events : {
		'click #searchTransactionButton' : 'searchTransactionClick',
		'click #clearAllBtn' : 'clearAll',
		'click .clearButton' : 'clearDate',
		'click #transactionByDate' : 'selectDate',
	},
	
	bindings : {
		'#transactionId' : 'value:transactionNumber, events:["keyup", "onchange"]',
		'#transactionByDate' : 'value:transactionDate, events:["keyup", "change", "click", "focus", "blur"]',
	},
	
	setAddedTransactionCollection : function(collection){
		this.addedTransactionCollection = collection;
	},
	
	selectDate : function(){
		this.$('.clearButton').show();
	},
	
	clearDate : function(){
		this.model.set('transactionDate', '');
		this.$('.clearButton').hide();
	},
	
	clearAll : function(){
		this.$('.clearButton').hide();
		this.model.set('transactionNumber', '');
		this.model.set('transactionDate', '');		
		this.collection.reset();
		this.addedTransactionCollection.reset();
		mediator.trigger("clear:all");
	},
		
	searchTransactionClick : function(e) {
		var self = this;
		if(this.model.get('validTransactionNumber') == false){
			this.$('span.invalid.transactionId').fadeIn().delay(1000).fadeOut();
		} else {
			uilog('DBUG','SearchControlsView#searchTransactionClick searchBy transactionDate');
			var view = this;
			this.collection.reset();
			this.collection.searchParams = { transactionDate : this.model.get('transactionDate'), transactionId : this.model.get('transactionNumber') };
			this.collection.fetch({
				reset: true, 
				success : function(collection, response, options){
					view.collection.searchParams = undefined;
					if(collection.length == 0){
						alert('Search returned 0 result');
					} else if(collection.length == 1) {
						var model = view.collection.first();
						view.collection.remove(model);
						view.addedTransactionCollection.add(model);
					}
				},
				error: function(){
					alert('Oooops! Something wrong happened while fetching transactionId');
				}
			});
		}
	},
	render : function(){
		this.$el.show();
	}
});