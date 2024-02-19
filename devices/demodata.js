var db = require('any-db');
var dbURL = 'postgres://postgres:admin@localhost:5432/transretail';
var conn = db.createConnection(dbURL);
var sql = 'SELECT ean13code FROM PRODUCT';
var barcodes = [ { ean13code: '4974052854569' },
                 { ean13code: '8851295511021' },
                 { ean13code: '4902505088834' },
                 { ean13code: '4902505088919' },
                 { ean13code: '4902505088827' },
                 { ean13code: '4902505088728' },
                 { ean13code: '4902505088612' },
                 { ean13code: '4902505088537' },
                 { ean13code: '4902505088445' },
                 { ean13code: '4902505088315' } ];
conn.query(sql, function (error, result) {
	console.log(result.rows);
	barcodes = result.rows;
});

exports.getBarcode = function() {
	return barcodes[Math.floor(Math.random()*barcodes.length)].ean13code;
};
