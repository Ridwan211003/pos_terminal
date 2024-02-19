Homedelivery.Page1SearchResultListView = Backbone.View.extend({
	el : "#searchResultListContainer",
	
	addedTransactionCollection : undefined,
	
	events : {
		"click #addTransactionButton" : "addTransactions",
	},
	
	initialize: function(){
		_(this).bindAll('add', 'reset', 'toggleAddTransactionBtn');	
		uilog("DBUG","Page1SearchResultListView#initialize this view!");
		this.collection.bind('reset', this.reset, this);
		this.collection.bind('remove', this.reset, this);
		this.collection.bind('add', this.add, this);
		
		this.dataTable = this.$(hdSettings.transactionListTable.id).dataTable(hdSettings.transactionListTable.dataTableParams);
		this.render();
	},
	
	transactionClicked : function(){
		uilog('DBUG','checked search_transaction_cb');
	},
	
	render : function(){
		this.$("#addTransactionButton").hide();
		this.$el.hide();		
	},
	
	setAddedTransactionCollection : function(collection){
		this.addedTransactionCollection = collection;
		this.addedTransactionCollection.bind('returnto:searchresult', this.returnToSeachResult, this);
	},
	
	reset : function(){
		this.dataTable.fnClearTable();
		this.dataTable.fnFilter('');
		if(this.collection.length > 0){
			this.$el.show();
			this.collection.each(function(model){
				var addedAlready = this.addedTransactionCollection.get(model.get('transactionId')); 
				if(!addedAlready){
					this.add(model);					
				}
			}, this);
		}
		else {
			this.$el.hide();
		}
		return this;
	}, 
	
	add : function(model){
		this.$el.show();
		this.dataTable.fnAddData(model.toJSON());
		$('.search_transaction_cb').click(this.toggleAddTransactionBtn);
	},
	
	toggleAddTransactionBtn : function(){
	    if ($('.search_transaction_cb:checked').length) {
	    	this.$('#addTransactionButton').show();
	    } else {
	        this.$('#addTransactionButton').hide();
	    }
	},
	
	addTransactions : function(e){
		var view = this;
		// loop through all checked rows. Remove model, and add to added collection
		$(".search_transaction_cb:checked").each(function(){
			var model = view.collection.remove($(this).val());
			var row = $(this).closest("tr").get(0);
			view.addedTransactionCollection.add(model);
		});
		this.toggleAddTransactionBtn();
	},
	
	returnToSeachResult : function(returningModel){
		this.collection.add(returningModel);
		this.toggleAddTransactionBtn();
	}
	
});