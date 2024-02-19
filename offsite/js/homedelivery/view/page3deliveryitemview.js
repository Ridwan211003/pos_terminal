Homedelivery.Page3DeliveryItemView = Backbone.View.extend({
	tagName : 'tr',
	className : 'deliveryItem',
	
	initialize : function() {
		uilog('DBUG','Homedelivery.Page3DeliveryItemView#initialize');
		_(this).bindAll('render');
		this.model.view = this;
	},
	
	render : function(){
		var source = $('#DeliveryItemTemplate').html();
		var template = Handlebars.compile(source);
		
		this.$el.append(template(this.model.toJSON()));
		return this.$el;
	},
	
});
