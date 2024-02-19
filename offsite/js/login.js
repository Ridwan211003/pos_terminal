$(document).ready(function() {
	$.ajax({
		url : "http://localhost:8089/getMac",
		type : "GET",
		contentType : 'application/json',
		success : function(response) {
			uilog("DBUG","MAC Address: > %s <", response);
			$("#posMacAddress").val(response);
		},
		error : function(jqXHR, status, error) {
			uilog("DBUG","Error: " + error);
		}
	});

	$('#j_username').keyboard({
		display: display,
	    layout: 'custom',
	    customLayout: customLayout
	});

	$('#j_password').keyboard({
	    display: display,
	    layout: 'custom',
	    customLayout: customLayout
	});

	$('#ipad').keyboard({
	    display: display,
	    layout: 'custom',
	    customLayout: customLayout
	});
});

var display = {
        'bksp'   :  "backspace",
        'accept' : 'accept',
        'default': 'ABC',
        'meta1'  : '.?123',
        'meta2'  : '#+='
};

var customLayout =  {
        'default': [
            'q w e r t y u i o p {bksp}',
            'a s d f g h j k l {accept}',
            '{s} z x c v b n m , . {s}',
            '{meta1} {space} {meta1}'
        ],
        'shift': [
            'Q W E R T Y U I O P {bksp}',
            'A S D F G H J K L {accept}',
            '{s} Z X C V B N M ! ? {s}',
            '{meta1} {space} {meta1}'
        ],
        'meta1': [
            '1 2 3 4 5 6 7 8 9 0 {bksp}',
            '- / : ; ( ) \u20ac & @ {accept}',
            '{meta2} . , ? ! \' " {meta2}',
            '{default} {space} {default}'
        ],
        'meta2': [
            '[ ] { } # % ^ * + = {bksp}',
            '_ \\ | ~ < > $ \u00a3 \u00a5 {accept}',
            '{meta1} . , ? ! \' " {meta1}',
            '{default} {space} {default}'
        ]
};
