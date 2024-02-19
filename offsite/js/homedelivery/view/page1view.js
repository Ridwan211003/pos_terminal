Homedelivery.Page1View = Backbone.View.extend({
	el : '#page1Container',
	
	events : {
		"click #page1NextBtn" : 'page1NextPage',
		'click #searchOrderBtn' : 'searchOrder',
		'click #printOrderReportBtn' : 'printOrderReport'
	},
	
	//initialize page
	initialize : function(){
		_(this).bindAll('page1NextPage', 'searchOrder', 'printOrderReport');
		this.page1NextBtn = this.$('#page1NextBtn');
		this.page1NextBtn.hide();
	},
	//Function that will go to page1 next page
	page1NextPage : function(e){
		mediator.trigger("page1:next", this.$el);
	},
	
	//Function that will render page1Container
	render : function(){
		this.$el.show();
	},
	
	//Function that will go to search order page
	searchOrder : function(){
		mediator.trigger('page1:searchOrder', this.$el);
	},
	
	printOrderReport : function(){
		if(!this.operationalDeliveryReportDialog){
			this.operationalDeliveryReportDialog = new Homedelivery.Page1OdrDialogView();
		}
		this.operationalDeliveryReportDialog.openDialog(this);
	}
});