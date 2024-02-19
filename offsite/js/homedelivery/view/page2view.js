Homedelivery.Page2View = Backbone.View.extend({
	el : '#page2Container',

	posTxItemListView : undefined,
	
	//This function will initialize this current view
	initialize : function() {
		_(this).bindAll('page2Back', 'page2Next', 'toggleNextBtn');
		this.$el.hide();
	},
	
	setPosTxItemListView : function(view){
		this.posTxItemListView = view;
		this.posTxItemListView.on('toggleNextButton', this.toggleNextBtn, this);
	},

	events : {
		"click #page2BackBtn" : "page2Back",
		"click #page2NextBtn" : "page2Next"
	},

	//This function will render page2Container element
	render : function() {
		this.$el.show();
		this.posTxItemListView.toggleNextBtn();
	},

	//This function will trigger the back button
	page2Back : function(e) {
		mediator.trigger('page2:back');
	},

	//This function will post the transactions in the db 
	page2Next : function(e) {
		this.posTxItemListView.trigger('submit:transactions');
	},
	
	//This function will trigger the next button 
	toggleNextBtn : function(value){
		uilog("DBUG","Page2View#toggleNextBtn");
		this.$('#page2NextBtn').toggle(value);
	}
});