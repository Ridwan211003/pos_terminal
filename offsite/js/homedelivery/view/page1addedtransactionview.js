
Homedelivery.Page1AddedTransactionView = Backbone.View.extend({
	el : "#addedTransactionContainer",
	
	events : {
	},
	
	posTxItemCollection : undefined,
	transactionAmount : undefined,
	
	initialize : function(){
		_(this).bindAll('add', 'remove', 'removeClick', 'render', 'calculate');
		
		this.on('removeClick', this.removeClick, this);
		
		this.collection.bind('add', this.add, this);
		this.collection.bind('add', this.calculate, this);
		this.collection.bind('remove', this.remove, this);
		this.collection.bind('remove', this.calculate, this);
		this.collection.bind('reset', this.render, this);
		this.collection.bind('reset', this.calculate, this);
		this.collection.bind('reset', this.reset, this);
		
		this.addedTransactionTable = this.$(hdSettings.addedTransactionTable.id).dataTable(hdSettings.addedTransactionTable.dataTableParams);
		this.$el.hide();
	},
	
	setPosTxItemCollection : function(collection) {
		this.posTxItemCollection = collection;
	},
	
	/*This function is used to redraw table given collection models*/
	render : function(){
		this.addedTransactionTable.fnClearTable();
		this.addedTransactionTable.fnFilter('');
		if(this.collection.length < 1){
			$("#page1NextBtn").hide();
			this.$el.hide();
		}
		this.collection.each(function(item){
			this.addedTransactionTable.fnAddData(item.toJSON());
		}, this);
	},
	
	/*This function is triggered everytime a new item is added in this.collection,
	 * requesting from backend posTxItems TODO : ONLY DELIVERABLE will be displayed*/
	add : function(model){
		var view = this;
		this.$el.show();
		$("#page1NextBtn").show();
		var transactionId = model.get('transactionId');
		var index = this.addedTransactionTable.fnAddData(model.toJSON());
		model.posTxItems.fetch({
			success : function(collection, response, options){
				_.each(collection.removeVoided().models, function(fetched){
					// map postxitem to pos_transaction
					fetched.set('transactionId', transactionId);
					view.posTxItemCollection.add(fetched);
				}, view);
			}
		});
	},
	
	remove : function(model){
		this.posTxItemCollection.remove(model.posTxItems.models);
		this.render();
	},
	
	reset : function(){
		this.posTxItemCollection.reset();
		this.render();
	},
	
	removeClick : function(transactionId){
		 var posTransactionModel = this.collection.get(transactionId);
		 var model = this.collection.remove(posTransactionModel);
		 this.collection.trigger('returnto:searchresult', posTransactionModel);
		 this.render();
	},
	
	calculate : function(){
		this.transactionAmount = this.collection.getTransactionAmount();
		this.$('#transactionAmount').html(this.transactionAmount.toMoney());
	}
});