Homedelivery.Page5View = Backbone.Epoxy.View.extend({
	el : '#page5Container',
	
	events : {
		'click #page5HomeBtn' : 'page5Home'
	},
	
	initialize : function(){
		_(this).bindAll('page5Home');
		this.page5SearchOrderControlView = new Homedelivery.Page5SearchOrderControlView({ collection : this.collection });
		this.page5SearchOrderListView = new Homedelivery.Page5SearchOrderListView ({ collection : this.collection });
		this.$('#completeDialog').dialog(hdSettings.completeDialog);
		
		this.page5SearchOrderListView.on('cancel', this.cancel, this);
	},
	
	render : function(){
		this.page5SearchOrderControlView.render();
		this.page5SearchOrderListView.render();
		this.$el.show();
	},
	
	page5Home : function(){
		if(this.page5SearchOrderControlView){
			this.page5SearchOrderControlView.clearAll();
		}
		this.page5SearchOrderControlView.model.set(this.page5SearchOrderControlView.model.defaults);
		mediator.trigger('home', this.$el);
	},
});