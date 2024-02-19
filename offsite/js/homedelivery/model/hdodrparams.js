Homedelivery.HdOdrParams = Backbone.Epoxy.Model.extend({
	initialize : function(){
		_(this).bindAll('reset');
	},
	
	defaults : {
		odrDateFrom : '',
		odrDateTo : '',
		odrOperatorId : '',
	},
	
	reset : function(){
		this.set(this.defaults);
	},
	
	computeds : {
		isComplete : {
			deps : ['odrDateFrom', 'odrDateTo', 'odrOperatorId'],
			get : function(odrDateFrom, odrDateTo, odrOperatorId){
				return !!odrDateFrom && !!odrDateTo && !!odrOperatorId;
			}
		}
	}
});