Homedelivery.PosTransactionDTO = Backbone.Model.extend({
	defaults : {
		transactionId :  '123456' + Math.floor((Math.random()*1000000)+1) + + Math.floor((Math.random()*1000)+1),
		type : 'SALE',
		posTerminalId : 'posTerminalId',
		storeCd : 'storeCd',
		store : {
			name : 'Owie"s Store',
			hotline : 'Hotline',
			address : 'Owie"s Address'
		},
		posSession : {
			posSessionId : posSessionId,
			userId : loggedInUserId,
			posTerminal : {
				id : 'posTerminalId',
				store : {
					name : 'Owie"s Store',
					hotline : 'Hotline',
					address : 'Owie"s Address'
				},
				posNumber : '123',
				macAddress : '123456789012',
				categoryId : '8',
			},
			changeAmount : 0.0
		},
		userId : loggedInUserId,
		transactionDate : null,
		status : null,
		trialMode : false,
		supervisorInterventions : [],
		startDate : new Date(),
	}
});