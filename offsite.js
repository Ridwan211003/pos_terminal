var http = require('http');
var Q = require('q');
var fs = require('fs');
var util = require('util');
var config = require("./config/config.js");

console.log('home dir: ' + __dirname);

exports.initOffsite = function(prdb, configuration, cookie) {
	console.log('**********************RUN OFFSITE INIT***********************');
	config = config.getConnection();
	prdb.put('_configuration', configuration, function(err) {
		if(err) {
			console.log('[ERROR] prdb insert: _configuration');
		} else {
			console.log("[SUCCESS] prdb insert: _configuration");
		}
	});
	return Q.all([
  			cacheProtectedResource(cookie, 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', '/cashier/main', 'cashier.html'),
			cacheProtectedResource(cookie, 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', '/customer/main', 'customer.html'),
			cacheProtectedResource(cookie, 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', '/login', 'login.html'),
			cacheProtectedResource(cookie, 'image/png,image/*;q=0.8,*/*;q=0.5', '/cashier/display/displayLogo', 'displayLogo'),
			cacheProtectedResource(cookie, 'image/png,image/*;q=0.8,*/*;q=0.5', '/cashier/display/displayLoginLogo', 'displayLoginLogo'),
			getProtectedData(prdb, cookie, '/sys/getMessages', '_messages'),
			getProtectedData(prdb, cookie, '/sys/getStoreInfo', '_storeInfo'),
			getProtectedData(prdb, cookie, '/cashier/getConfigCodeEnumeration/CREDIT_CARD_TYPE', '_CREDIT_CARD_TYPE'),
			getProtectedData(prdb, cookie, '/cashier/getConfigCodeEnumeration/BANK_ID_LOOKUP', '_BANK_ID_LOOKUP')
	   ]).then(function() {
			console.log('[SUCCESS] cacheProtectedResource/Data');
			cacheStaticResources();
		}, function(error) {
			console.log('[ERROR] Offsite init');
		});
	

	function cacheProtectedResource(jcookie, acceptHeader, path, filename) {
		var deferred = Q.defer();
		var options = {
			    host: config.posServer.url,
			    port: config.posServer.port,
			    path: config.posServer.ctxPath + path,
			    method: 'GET',
			    headers: 
			    {
			    	'cookie': jcookie,
			    	'accept': acceptHeader,
			    	'accept-encoding': 'gzip, deflate',
			    	'connection': 'keep-alive',
				    'Cache-Control': 'max-age=0'
			    }
			};
		var req = http.request(options, function(res){
			if(res.statusCode == 200) {
				var dirPath = __dirname + '/offsite';
				if(!fs.existsSync(dirPath)) {
					fs.mkdirSync(dirPath);
				}
				res.pipe(fs.createWriteStream(dirPath + '/' + filename));
			}
			res.on('data', function(data){
			});
			res.on('end', function(data){
				console.log(res.statusCode, filename, JSON.stringify(res.headers));
				deferred.resolve(filename);
			});
			res.on('error', function(error){
				console.log("[ERROR] cacheProtectedResource response - " + path);
				deferred.reject();
			});
		});
		
		req.on('error', function(error){
			console.log("[ERROR] cacheProtectedResource request: ", path);
			deferred.reject();
		});
		
		req.end();
		return deferred.promise;
	}
	function getProtectedData(prdb, jcookie, url, dataKey) {
		var deferred = Q.defer();
		var options = {
			    host: config.posServer.url,
			    port: config.posServer.port,
			    path: config.posServer.ctxPath + url,
			    method: 'GET',
			    headers: {
			    	'cookie': jcookie,
			        'accept': 'application/json;charset=UTF-8'
			    }
			};

		http.get(options, function(res){
			var pData = '';
			res.on('data', function(data){
				pData += data;
			});
			res.on('end', function(data){
				if(data)
					pData += data;

				if(pData) {
					var jsonData = parseJsonData(pData);
					if(jsonData) {
						prdb.put(dataKey, jsonData, function(err) {
							if(err) {
								console.log('[ERROR] Data insert: ' + dataKey);
							} else {
								console.log("[SUCCESS] Data insert: " + dataKey);
							}
							deferred.resolve({});
						});
					}
					else {
						console.log("[ERROR] getProtectedData: NULL JSON data");
						deferred.reject();
					}
				} else {
					console.log("[ERROR] getProtectedData: NULL response data");
					deferred.reject();
				}
			});
			res.on('error', function(error){
				console.log("[ERROR] getProtectedData response: " + dataKey);
				deferred.reject();
			});
		}).on('error', function(error){
			console.log("[ERROR] getProtectedData request: " + dataKey);
			deferred.reject();
		});
		
		return deferred.promise;
	}

	function cacheStaticResources() {
		httpGetOffsiteMeta().then(function(filePaths) {
			createDirs(filePaths).then(function(results) {
				var pathSets = new Array();
				var setSize = Math.ceil(filePaths.length/15);
				for(var i=0; i<15; i++) {
					pathSets[i] = filePaths.slice(i*setSize, Math.min(i*setSize + setSize, filePaths.length));
				}
				updateOffsiteResources(pathSets[0]).then(function() {
					updateOffsiteResources(pathSets[1]).then(function() {
						updateOffsiteResources(pathSets[2]).then(function() {
							updateOffsiteResources(pathSets[3]).then(function() {
								updateOffsiteResources(pathSets[4]).then(function() {
									updateOffsiteResources(pathSets[5]).then(function() {
										updateOffsiteResources(pathSets[6]).then(function() {
											updateOffsiteResources(pathSets[7]).then(function() {
												updateOffsiteResources(pathSets[8]).then(function() {
													updateOffsiteResources(pathSets[9]).then(function() {
														updateOffsiteResources(pathSets[10]).then(function() {
															updateOffsiteResources(pathSets[11]).then(function() {
																updateOffsiteResources(pathSets[12]).then(function() {
																	updateOffsiteResources(pathSets[13]).then(function() {
																		updateOffsiteResources(pathSets[14]);
																	});
																});
															});
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			}, function() {
				console.log('[ERROR] createDirs');
			});
		}, function(){
			console.log('[ERROR] httpGetOffsiteMeta');
		});
	}

	function httpGetOffsiteMeta() {
		var deferred = Q.defer();
		var options = {
			    host: config.posServer.url,
			    port: config.posServer.port,
			    path: config.posServer.ctxPath +'/sys/getOffsiteMeta',
			    method: 'GET',
			};
		http.get(options, function(res){
			var resData = '';
			res.on('data', function(data){
				resData += data;
			});
			res.on('end', function(data){
				var filePaths = null;
				if(data) {
					resData += data;
				}
				if(res.statusCode == 200 && resData) {
					filePaths = JSON.parse(resData);
					deferred.resolve(filePaths);
				} else {
					console.log('[ERROR] httpGetOffsiteMeta: NULL response');
					deferred.reject();
				}
			});
			res.on('error', function(error){
				console.log('[ERROR] httpGetOffsiteMeta: response');
				deferred.reject();
			});
		}).on('error', function(error){
			console.log("[ERROR] httpGetOffsiteMeta request");
			deferred.reject("[ERROR] httpGetOffsiteMeta request");
		});
		return deferred.promise;
	}
	
	function createDirs(filePaths) {
		var promises = [];
		filePaths.forEach(function (filePath) {
			var deferred = Q.defer();
			var filePathTokens = filePath.split('/');
			var absPath = __dirname + '/offsite/' + filePath;
			if(filePathTokens.length > 1) {
				var dirPath = absPath.substring(0, absPath.lastIndexOf('/'));
				mkDirs(dirPath);
			}
            deferred.resolve(filePath);
			promises.push(deferred.promise);
		});
		
		return Q.allSettled(promises);
	}
	function mkDirs(dirPath) {
		var deferred = Q.defer();
		var parentDir = dirPath.indexOf('/') > -1 ? dirPath.substring(0, dirPath.lastIndexOf('/')) : null;
		if(parentDir && !fs.existsSync(parentDir)) {
			mkDirs(parentDir);
		}
		if(!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath, function(dirPath){
	            deferred.resolve(dirPath);
			});
		}
		else {
            deferred.resolve(dirPath);
		}
		return deferred.promise;
	}
	function updateOffsiteResources(filePaths) {
		console.log('============================================================');
		var promises = [];
		filePaths.forEach(function (filePath) {
			var deferred = Q.defer();
			pullStaticResource(filePath, function(filePath) {
	            deferred.resolve(filePath);          
	        });
			promises.push(deferred.promise);
		});
		
		return Q.allSettled(promises);
	}
	function pullStaticResource(filePath, callback) {
		if(filePath.indexOf('images/uploads/') == 0) {
			var options = {
				    host: config.posServer.url,
				    port: config.posServer.port,
				    path: config.posServer.ctxPath + '/' + filePath,
				    method: 'GET',
				    headers: 
				    {
				    	'accept': 'image/jpeg,image/*;q=0.8,*/*;q=0.5',
				    	'accept-encoding': 'gzip, deflate',
				    	'connection': 'keep-alive',
					    'Cache-Control': 'max-age=0'
				    }
				};
			var req = http.request(options, function(res){
				if(res.statusCode == 200) {
					var dirPath = __dirname + '/offsite';
					if(!fs.existsSync(dirPath)) {
						fs.mkdirSync(dirPath);
					}
					res.pipe(fs.createWriteStream(dirPath + '/' + filePath));
				}
				res.on('data', function(data){
				});
				res.on('end', function(data){
					console.log(res.statusCode, filePath, JSON.stringify(res.headers));
					callback(filePath);
				});
				res.on('error', function(error){
					console.log("[ERROR] pullStaticResource response: " + filePath);
				});
			});
			
			req.on('error', function(error){
				console.log("[ERROR] pullStaticResource request: ", filePath);
			});
			
			req.end();
		} else {
			var lastUpdated = "Thu, 01 Jan 1970 00:00:00 GMT";
			try{
				stats = fs.statSync(__dirname + '/offsite/' + filePath);
				lastUpdated = stats.mtime.toGMTString();
			} catch(e) {}
			
			var options = {
				    host: config.posServer.url,
				    port: config.posServer.port,
				    path: config.posServer.ctxPath + '/resources/' + filePath,
				    method: 'GET',
				    headers: {
				    	'If-Modified-Since': lastUpdated,
				    	'Connection': 'keep-alive',
				    	'Cache-Control': 'max-age=0'
				    }
				};
			http.get(options, function(res){
				if(res.statusCode == 200) {
					var absPath = __dirname + '/offsite/' + filePath;
					var fileStream = fs.createWriteStream(absPath);
					res.pipe(fileStream);
					fileStream.on('error', function(err) {
						console.log('[ERROR] saving file: ' + absPath);
					});
					fileStream.on('finish', function() {	
						var mtime = new Date(res.headers["last-modified"]);
						fs.utimes(absPath, mtime, mtime, function() {}); //preserve modified time of file in server

						console.log(res.statusCode, filePath, JSON.stringify(res.headers));
					});
				}
				else {
					console.log(res.statusCode, filePath, JSON.stringify(res.headers));
				}
				res.on('data', function(data){
				});
				res.on('end', function(data){
					callback(filePath);
				});
			}).on('error', function(error){
				console.log("[ERROR] pullStaticResource request for ", filePath);
			});
		}
	}
	
	function stringifyJson(obj, errorObj) {
		try {
			return JSON.stringify(obj);
		} catch (e) {
			if(errorObj) {
				return JSON.stringify(errorObj);
			}
		}
		return '<JSON stringify error>';
	}
	
	function parseJsonData(data) {
		try {
			return JSON.parse(data);
		} catch (e) {
			console.log('JSON parse error: ');
		}
		return null;
	}

};


