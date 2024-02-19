var App = function(){
	this.init = function(){
		this.posTransactionCollection = new Homedelivery.PosTransactionCollection();
		this.addedTransactionCollection = new Homedelivery.AddedTransactionCollection();
		this.posTxItemCollection = new Homedelivery.PosTxItemCollection();		
		this.selectedPosTxItemCollection = new Homedelivery.SelectedPosTxItemCollection();
		// instantiate collections transaction 
		
		// instantiate views
		this.page1View = new Homedelivery.Page1View();
		this.searchControlsView = new Homedelivery.SearchControlsView({collection : this.posTransactionCollection});
		this.searchControlsView.setAddedTransactionCollection(this.addedTransactionCollection);
		
		this.searchResultListView = new Homedelivery.Page1SearchResultListView({collection : this.posTransactionCollection});
		this.searchResultListView.setAddedTransactionCollection(this.addedTransactionCollection);

		//		this.posTransactionView = new Homedelivery.PosTransactionView({collection : this.posTransactionCollection});
		this.addedTransactionView = new Homedelivery.Page1AddedTransactionView({collection : this.addedTransactionCollection});
		this.addedTransactionView.setPosTxItemCollection(this.posTxItemCollection);
		
		this.page2View = new Homedelivery.Page2View();
		this.posTxItemListView = new Homedelivery.Page2PosTxItemListView({collection : this.posTxItemCollection});
		this.page2View.setPosTxItemListView(this.posTxItemListView);
		
		this.page3View = new Homedelivery.Page3View();
		this.page3View.render();
		
	};
	this.init();
};