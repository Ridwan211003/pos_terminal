Homedelivery.Page2PosTxItemListView = Backbone.View.extend({
	el : "#transactionItemsContainer",
	posTxItems : new Homedelivery.PosTxItemCollection(),
	events : {
	},
	
	initialize : function(){
		_(this).bindAll( 'add', 'render', 'submitTransactions', 'remove', 'toggleNextBtn');
		uilog('DBUG','Page2PosTxItemListView#initialize');
		
		this.on('submit:transactions', this.submitTransactions);
		this.collection.bind('reset', this.render, this);
		this.collection.bind('add', this.add, this);
		this.collection.bind('remove', this.remove, this);
		this.collection.bind('change', this.change, this);

		this.posTxItemsTable = this.$(hdSettings.transactionItemsTableParams.id).dataTable(hdSettings.transactionItemsTableParams.dataTableSettings);
		this.$el.show();
	}, 
	
	render : function(){
		this.posTxItemsTable.fnClearTable();
		this.toggleNextBtn();		
		this.posTxItemsTable.fnFilter('');
		this.collection.each(function(model){
			this.add(model);
		}, this);
	},
	
	add : function(model){
		this.posTxItemsTable.fnAddData(model.toJSON());
		$('.select_pos_tx_item_cb').click(this.toggleNextBtn);
	},
	
	remove : function(model){
		this.render();
	}, 
	
	submitTransactions : function(customerData){
		var view = this;
		var addedIds = new Array();
		this.posTxItems.reset();

		$(".select_pos_tx_item_cb:checked").each(function(){
			var posTxItemModel = view.collection.get($(this).val());
			var posTransactionModel = app.addedTransactionCollection.get(posTxItemModel.get('transactionId'));
			addedIds.push(posTransactionModel.get('transactionId'));
			view.posTxItems.add(posTxItemModel);
		});
		mediator.trigger("page2:next", {
			addedIds : addedIds,
			posTxItems : this.posTxItems,
			transactionAmount : app.addedTransactionCollection.getTransactionAmount()
//			customerData : customerData
		}, this.$el);
	},
	
	toggleNextBtn : function(){
		if ($('.select_pos_tx_item_cb:checked').length) {
			var totalItemsQty = 0;
			var view = this;
	    	this.$('#totalLineItems').text($('.select_pos_tx_item_cb:checked').length);
	    	
	    	$(".select_pos_tx_item_cb:checked").each(function(){
				var posTxItemModel = view.collection.get($(this).val());
				var itemQty = posTxItemModel.get('quantity');
				totalItemsQty = totalItemsQty + itemQty;
			});
	    	this.$('#totalItemsQty').text(totalItemsQty);
	    	this.trigger('toggleNextButton', true);	    	
	    } else {
	    	this.trigger('toggleNextButton', false);
	    	this.$('#totalItemsQty').text('0');
	    	this.$('#totalLineItems').text('0');
	    }

	}
});