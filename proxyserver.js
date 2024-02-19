/*
 * NEW POSS DEVELOPMENT (v2.0)
 * LUCKY (lucky@equnix.co.id)
 * 20150826 - Initial Development
 * 20160214 - Almost Finished
 */
var log = console.log;
var glob = require("glob");
/*console.log = function()
{
	var d = new Date();
	var pad = '00', pad1 = '000';
	log.apply(console, 
			[	d.getFullYear() + "" + 
				(pad + (d.getMonth() + 1)).slice(-pad.length) + "" + 
				(pad + d.getDate()).slice(-pad.length) + " " + 
				(pad + d.getHours()).slice(-pad.length) + "" + 
				(pad + d.getMinutes()).slice(-pad.length) + "" + 
				(pad + d.getSeconds()).slice(-pad.length) + "." + 
				(pad1 + d.getMilliseconds()).slice(-pad1.length) + "|"].concat(arguments[0]));
};*/

var config = {};

config.device = {};
config.posServer = {};

// pos server
config.posServer.url = "";
config.posServer.port = "";
config.posServer.ctxPath = "/pos-web";
config.onDevelopment = false;

// Node Modules/Libraries
var http = require("http");
var shelljs = require("shelljs");
var express = require("express");
var app = express();
var crypto = require("crypto");
var ip = require("ip");
var serialport = require("serialport");
var util = require("util");
var trumpet;

// Business Modules
var router = require("./router.js");
var deviceFactory = require("./devices/deviceFactory.js");
var edc = require("./devices/edc.js");
var constants = require("./possapp.proxy.constants.js");
var macAddress;
var hsList;
var uid, sid;
var uname, emplPic, uroles;
var txdb, prdb;
var server, proxy;
var configuration;
var productUpdatePollInterval = 3600000; // default poll interval millis (1
var isTimeout = false;
// hr)
var txnUpdatePollInterval = 600000; // default poll interval millis (10 min)
var STORED_PREFIX = "R-";
var SALE_PREFIX = "L-";
var USER_PREFIX = "U-";
var SALE_FEEDBACK_PREFIX = SALE_PREFIX + "F-";
var TOPUP_PREFIX = SALE_PREFIX + "T-";
var MCASH_PREFIX = SALE_PREFIX + "MC-";
var ALTERRA_PREFIX = SALE_PREFIX + "A-";
var INDOSMART_PREFIX = SALE_PREFIX + "IS-";
var EFT_PREFIX = "E-";
var IC_PREFIX = "I-";
var EDEI_PREFIX = "D-";
var HOTSPIZZE_KEY = "HOT_SPIZZE";
var ENUM_PREFIX = "C-";
var online = true;
var gcSaveId = "";

// Set max sockets opened by proxy
var MAX_SOCKETS = 256;
var suspendTxnPush = false;

const schedule = require('node-schedule');
var fs = require("fs");
var offlineAuthData = "";
var OFF_SESSION_PREFIX = "Z-";
var initOffsite = true;
var offsite = false;
var isUpdatedProduct
var isUpdatedPromo;
var cSession;
var offsiteDir;
var resourcesDir;

// LUCKY - Added variables
var txtDir = "/equnix/data";
var cmdDir = "/equnix/cmd";
var confDir = "/equnix/conf";
var trxDir = "/equnix/trx";
var archiveTrxDir = "/equnix/arch/trx";
var tmpDir = "/equnix/comm";
var userAccounts = {};
var session;
var configuration;
var productList = [];
var promoList = [];
var pwpPromoList = {};
var PWP_TYPE = "7";
var ejournal = require("./service/ejournal-logger.js");
//var cobrandcode 		= ['489087','420191','420192','420194','472670','458785','478487','524261'];
var cobrandcode = [];
var now = new Date();
var startYear = new Date(now.getFullYear(), 0, 0);
var oneDay = 1000 * 60 * 60 * 24;
var currentWrongAccount = "";
var currentWrongCounter = 0;
var loggedUser = {};
var offlineLogin = false;
var onlineStat = true;
var savedTxns = [];
var savedTrxObj = null;
var reloadStat = false;
var httpTimeout = 120000;
var possVersion = "";
var dataVersion = "";
var oldUPCprodVer = "";
var oldUPCpromoVer = "";
var shutFlag = false;
var isDifferentCashier = false;
var eventRewardsConfig = {};
var donation = [];
var deptstorePrefix = [];
var logLevel = ["DBUG", "INFO", "WARN", "ERRO", "PNIC"];
//Allo Top Up 2022-08-12
var alloTopupItem = [];
var ovoTopupItem = [];
var shopeeTopupItem = [];
var omniTelkomselItem = [];

// set http max sockets
http.globalAgent.maxSockets = MAX_SOCKETS;

exports.startServer = function (forceOffsite) {
  var txnSaveData = "";
  var tvsTrxList = "";
  var tvsTrxData = "";
  var invoiceData = "";
  var authReqData = "";
  var custFeedbackData = "";
  var serverStatusPoller = null;

  runStartup(forceOffsite);

  function refreshVersion() {
    var majorVer = "2.";
    var prodVer;
    var promVer;
    var evtVer;
    var userVer;
    var hscVer;
    var hasCmd;

    if (
      typeof configuration["majorVer"] != "undefined" &&
      configuration["majorVer"] != ""
    )
      majorVer = configuration["majorVer"] + ".";

    runUnixCommand(
      "git",
      [
        "--git-dir=/equnix/.poss",
        "--work-tree=/equnix/poss",
        "rev-parse",
        "HEAD",
      ],
      function (data) {
        possVersion = majorVer + data.data.substring(0, 8);
        possVersion = possVersion.toUpperCase();
        console.log("SYS|POSS Version: " + possVersion);
      }
    );

    // runUnixCommand('git', ['--git-dir=/equnix/.data', '--work-tree=/equnix/data', 'rev-parse', 'HEAD'],
    runUnixCommand("md5sum", ["/equnix/data/PRODUCT.DAT"], function (data) {
      if (typeof data.data != "undefined") {
        dataVersion = data.data.substring(0, 8);
        dataVersion = majorVer + data.data.substring(0, 8);
        dataVersion = dataVersion.toUpperCase();
        console.log("SYS|Data Version: " + dataVersion);
      } else {
        console.log("SYS|Not Exists Product Data ");
      }
    });

    runUnixCommand('scp', ['-P', '5376', 'equstor@storehost:/equnix/data/UPC_PRODUCT.DAT', '/equnix/data/'], function(result) {
      if (result.error) {
        console.log("THERE IS NO UPC PRODUCT ON POSWEB");
      }
    })

    
    runUnixCommand('scp', ['-P', '5376', 'equstor@storehost:/equnix/data/UPC_PROMO.DAT', '/equnix/data/'], function(result) {
      if (result.error) {
        console.log("THERE IS NO UPC PROMO ON POSWEB");
      }
    })
    //          runUnixCommand('md5sum', ['/equnix/data/PROMO.DAT'],
    //                  function(data)
    //                  {
    //                  	promVer = data.data.substring(0, 32);
    //                  }
    //          );

    //          runUnixCommand('md5sum', ['/equnix/data/USERS.DAT'],
    //                  function(data)
    //                  {
    //                  	userVer = data.data.substring(0, 32);
    //                  }
    //          );

    //          runUnixCommand('md5sum', ['/equnix/data/EVENTPROMO.DAT'],
    //                  function(data)
    //                  {
    //                  	evtVer = data.data.substring(0, 32);
    //                  }
    //          );

    //          runUnixCommand('md5sum', ['/equnix/data/HOTSPICE.DAT'],
    //                  function(data)
    //                  {
    //                  	hscVer = data.data.substring(0, 32);
    //                  }
    //          );

    //          runUnixCommand('echo', [prodVer,promVer,userVer,evtVer,hscVer,'|','md5sum'],
    //                  function(data)
    //                  {
    //                  	dataVersion = majorVer + data.data.substring(0, 32);
    // dataVersion = dataVersion.toUpperCase();
    // console.log('SYS|Data Version: ' + dataVersion);
    //                  }
    //          );

    // 			runUnixCommand('tar', ['-cf','- /equnix/data/PRODUCT.DAT /equnix/data/PROMO.DAT /equnix/data/USERS.DAT /equnix/data/EVENTPROMO.DAT /equnix/data/HOTSPICE.DAT', '| md5sum'],
    //                  function(data)
    //                  {
    //                  	dataVersion = majorVer + data.data.substring(0, 32);
    // dataVersion = dataVersion.toUpperCase();
    // console.log('SYS|Data Version: ' + dataVersion);
    //                  }
    //          );
  }

  function checkOnlineStat() {
    if (fs.existsSync(tmpDir + "/.onlinestat")) {
      var online = fs.readFileSync(tmpDir + "/.onlinestat");
      if (online == "") online = 0;
      console.log("SYS|Online status: " + online);
      return parseInt(online) > 0 ? true : false;
    } else false;
  }

  function runStartup(forceOffsite) {
    console.log("forceOffsite: " + forceOffsite);
    offsite = true;
    offsiteDir = __dirname + "/offsite/";
    resourcesDir = "/equnix/resources/";
    trumpet = require("trumpet");
    online = false;


    try {
      if (!fs.existsSync(cmdDir)) {
        fs.mkdirSync(cmdDir);
        console.log("Creating not existed /equnix/cmd");
        fs.writeFile(
          cmdDir + "/PRODUCT.reload",
          JSON.stringify({}),
          function (err) {
            if (err)
              console.log(
                "ERRO|Failed to write PRODUCT.reload file: " +
                  JSON.stringify(err)
              );
            else
              fs.writeFile(
                cmdDir + "/PROMO.reload",
                JSON.stringify({}),
                function (err) {
                  if (err)
                    console.log(
                      "ERRO|Failed to write PROMO.reload file: " +
                        JSON.stringify(err)
                    );
                  else
                    fs.writeFile(
                      cmdDir + "/USERS.reload",
                      JSON.stringify({}),
                      function (err) {
                        if (err)
                          console.log(
                            "ERRO|Failed to write USERS.reload file: " +
                              JSON.stringify(err)
                          );
                        else
                          fs.writeFile(
                            cmdDir + "/EVENTPROMO.reload",
                            JSON.stringify({}),
                            function (err) {
                              if (err)
                                console.log(
                                  "ERRO|Failed to write EVENTPROMO.reload file: " +
                                    JSON.stringify(err)
                                );
                              else
                                fs.writeFile(
                                  cmdDir + "/HOTSPICE.reload",
                                  JSON.stringify({}),
                                  function (err) {
                                    if (err)
                                      console.log(
                                        "ERRO|Failed to write HOTSPICE.reload file: " +
                                          JSON.stringify(err)
                                      );
                                    else console.log("Mark Init DONE");
                                  }
                                );
                            }
                          );
                      }
                    );
                }
              );
          }
        );

        // runUnixCommand('touch ', ['/equnix/cmd/PRODUCT.reload'],
        //                     function(data)
        //                     {
        //                         console.log('SYS|Mark to reload ');
        //                     }
        //             );
      }
    } catch (e) {
      console.log("Failed to create " + cmdDir + " " + JSON.stringify(e));
    }

    // SIGNAL HANDLING
    process.on("SIGHUP", function () {
      console.log("Receive reloading signal");

      // CHECK IF THERE STILL A HANGING TRX
      var trxs = fs.readdirSync(trxDir + "/");
      var saveRgx = /^T([0-9]+)\.save/;
      var midtrx = false;
      for (var f in trxs) {
        var tmpFiles = saveRgx.exec(trxs[f]);
        if (tmpFiles) {
          midtrx = true;
          reloadStat = true;
          break;
        }
      }
      if (!midtrx) {
        loadProducts();
        loadPromo();
        loadHotspice();
        loadUsers();
        loadEventRewards();
        console.log("Reloading Done");
      }
    });

    // SIGNAL HANDLING
    process.on("SIGTERM", function () {
      console.log("Receive TERM signal");
      // CHECK IF THERE STILL A HANGING TRX
      var trxs = fs.readdirSync(trxDir + "/");
      var saveRgx = /^T([0-9]+)\.save/;
      var midtrx = false;
      for (var f in trxs) {
        var tmpFiles = saveRgx.exec(trxs[f]);
        if (tmpFiles) {
          midtrx = true;
          shutFlag = true;
          break;
        }
      }
      if (!midtrx) {
        console.log("POSNODE IS SHUTTING DOWN");
        process.exit(3);
      }
    });

    // CHECK /equnix/arch/data DIR
    var archData = "/equnix/arch/data";
    try {
      if (!fs.existsSync(archData)) {
        fs.mkdirSync(archData);
        console.log("Creating not existed /equnix/arch/data");
      }
    } catch (e) {
      console.log("Failed to create " + archData + " " + JSON.stringify(e));
    }

    // 20150901 - LUCKY - Configuration always read from file provided by agent T1
    try {
      configuration = JSON.parse(
        unescape(fs.readFileSync(confDir + "/terminal.json").toString())
      );
      //configuration 	= JSON.parse(unescape(fs.readFileSync(confDir + '/store.conf').toString()));

      configuration["messages"] = JSON.parse(
        unescape(fs.readFileSync("messages.json").toString())
      );
    } catch (e) {
      console.log("Failed to parse terminal.conf" + e);
    }

    config.isThermal = configuration["isThermal"] == "Y" ? true : false;
    config.store = {};
    config.store.url = configuration.properties["POSSTORE_HOST"];
    config.store.port = configuration.properties["POSSTORE_PORT"];

    // device path
    var printerConfig = /\[*([a-zA-Z0-9\-\_]*)\]*;*(.*)/.exec(
      configuration["printer"]
    );
    config.device.printer = printerConfig[2];
    config.device.printerType = printerConfig[1];
    config.device.scanner1 = configuration["scanner"];
    config.device.edc = configuration["edc"];

    deptstorePrefix =
      configuration["properties"]["DEPTSTORE_PREFIX"].split(",");
    module.exports = config;
    console.log(
      "POSSTORE Service: " + config.store.url + ":" + config.store.port
    );
    console.log("Pos Terminal in Thermal Mode? " + config.isThermal);

    loadProducts();
    loadPromo();
    loadHotspice();
    loadUsers();
    loadEventRewards();

    refreshVersion();

    // GET FROM OTHER FILE
    /*if (fs.existsSync(tmpDir + '/.lasttrxval'))
        {
        	var cut = /([0-9]{1,5}$)/;
        	var last = fs.readFileSync(tmpDir + '/.lasttrxval');
        	var trx = cut.exec(last);
        	configuration.lastTxnSeqValue = (trx == null) ? 1 : parseInt(trx);
        }*/

    configuration["config"] = config;
    global.configuration_poss = configuration;
    runServer(configuration);
  }

  function runServer(cf) {
    if (!cf) process.exit(1);
    server = http.createServer(app);
    server.listen(8089, "0.0.0.0");
    console.log("Local Server started.");

    //var proxyInstance = null;
    var clientIOInstance = null;
    //proxyInstance = startProxy();
    clientIOInstance = openClientSocket();
    //serverStatusPoller.addProxyListener(clientIOInstance, proxyInstance); // ?? DUNNO
    //init devices
    deviceFactory.initDevices(config, cf, app, clientIOInstance);
    console.log("Proxy Server bootup (ONSITE): " + new Date());

    // 20150907 - LUCKY - Write ready file to tell agent T1
    fs.writeFile(tmpDir + "/.ready", JSON.stringify({}), function (err) {
      if (err)
        console.log("ERRO|Failed to write ready file: " + JSON.stringify(err));
      else console.log("POSSTERM_READY");
    });

    // CHECK IF THERE STILL A HANGING TRX
    var hangTrxId = "";
    var trxs = fs.readdirSync(trxDir + "/");
    var saveRgx = /^T([0-9]+)\.save/;
    for (var f in trxs) {
      var tmpFiles = saveRgx.exec(trxs[f]);
      if (tmpFiles) {
        savedTxns.push(tmpFiles[0]);
        hangTrxId = tmpFiles[1];
      }
      console.log("Saved Transactions: " + JSON.stringify(savedTxns));
    }
    // 20160202 - LUCKY - Check if .loggedsess is exist? if exist then FSO
    fs.exists(tmpDir + "/.loggedsess", function (exists) {
      if (exists && checkOnlineStat()) {
        var options = {
          host: config.store.url,
          port: config.store.port,
          path: "/pos-web/sys/saveForcedSignOff",
          method: "POST",
          headers: {
            accept: "application/json;charset=UTF-8",
          },
        };

        var serverReq = http.request(options, function (result) {
          var fsoData = "";
          result.on("data", function (data) {
            fsoData += data;
          });
          result.on("end", function (data) {
            if (data) fsoData += data;

            if (fsoData == "null" || fsoData == null) fsoData = "";
            console.log("Resp FSO Data: " + fsoData);
            fs.unlinkSync(tmpDir + "/.loggedsess");
          });
          result.on("error", function (err) {
            console.log(err);
          });
        });
        serverReq.setTimeout(httpTimeout, function (err) {
          console.log("Save FSO Online Timeout: " + err);
        });

        serverReq.on("error", function (err) {
          console.log("Failed to save FSO online: " + err);
        });

        var loggedData = {};
        try {
          loggedData = JSON.parse(fs.readFileSync(tmpDir + "/.loggedsess"));
          loggedData["transactionId"] = hangTrxId;
        } catch (e) {
          console.log("Failed to read .loggedsess " + JSON.stringify(e));
        }

        if (savedTxns.length > 0) {
          try {
            savedTrxObj = JSON.parse(
              fs.readFileSync(trxDir + "/" + savedTxns[savedTxns.length - 1])
            );
          } catch (e) {
            console.log("Failed to read saved trx " + e);
          }
          console.log("SAVED TRX OBJ " + JSON.stringify(savedTrxObj));
        }
        serverReq.write(JSON.stringify(loggedData));
        serverReq.end();
      }
    });
  }

  // 20150901 - LUCKY - Loading Product to array
function loadProducts() {
        console.log("Begin loading product to array");
        if (!fs.existsSync(txtDir + '/PRODUCT.DAT')) { console.log('PRODUCT.DAT is missing!'); return; }
        if (!fs.existsSync(cmdDir + '/PRODUCT.reload')) { console.log('reload PRODUCT.DAT not exists, do not reloading!'); return; }
        productList = [];
        donation = [];
        // Allo Top Up 2022-08-12
        alloTopupItem = [];
        ovoTopupItem = [];
        shopeeTopupItem = [];
        omniTelkomselItem = [];

        var array = fs.readFileSync(txtDir + '/PRODUCT.DAT').toString().split("\n");
        var counter = 0;
        for (i in array) {
            if (array[i] == "") continue;

            var prodArr = array[i].split(",");
            if (prodArr[6] == "DONATION") {
                donation.push(array[i]);
            }
            // Allo Top Up 2022-08-12
            if (prodArr[2].match(/^ALLO TOP UP.*$/)) {
                alloTopupItem.push(array[i]);
            }
            // Allo Top Up 2022-08-12
            if (prodArr[2].match(/^OVO TOP UP.*$/)) {
                ovoTopupItem.push(array[i]);
            }
            if (prodArr[2].match(/^TOP UP SHOPEE.*$/)) {
                shopeeTopupItem.push(array[i]);
            }
            if (prodArr[6] == "OMNITEL") {
                omniTelkomselItem.push(array[i]);
            }
            productList[prodArr[1]] = prodArr;
            counter++;
        }
        fs.unlinkSync(cmdDir + '/PRODUCT.reload');
        console.log("Loaded " + counter + " products");
        console.log("Loaded " + donation.length + " products donation");
    }


    //load product broken
  // function loadProducts() {
  //   console.log("Begin loading product to array");
  //   if (!fs.existsSync(txtDir + "/PRODUCT.DAT")) {
  //     console.log("PRODUCT.DAT is missing!");
  //     return;
  //   }
  //   if (!fs.existsSync(cmdDir + "/PRODUCT.reload")) {
  //     console.log("reload PRODUCT.DAT not exists, do not reloading!");
  //     return;
  //   }
  //   productList = [];
  //   donation = [];
  //   // Allo Top Up 2022-08-12
  //   alloTopupItem = [];
  //   omniTelkomselItem = [];

  //   var array = fs
  //     .readFileSync(txtDir + "/PRODUCT_PROD1x.DAT")
  //     .toString()
  //     .split("\n");
  //   var counter = 0;
  //   for (i in array) {
  //     if (array[i] == "") continue;

  //     var prodArr = array[i].split(",");
  //     if (prodArr[6] == "DONATION") {
  //       donation.push(array[i]);
  //     }
  //     // Allo Top Up 2022-08-12
  //     if (prodArr[2].match(/^ALLO TOP UP.*$/)) {
  //       alloTopupItem.push(array[i]);
  //     }
  //     if (prodArr[6] == "OMNITEL") {
  //       omniTelkomselItem.push(array[i]);
  //     }
  //     productList[prodArr[1]] = prodArr;
  //     counter++;
  //   }
  //   fs.unlinkSync(cmdDir + "/PRODUCT.reload");
  //   console.log("Loaded " + counter + " products");
  //   console.log("Loaded " + donation.length + " products donation");
  // }

  function loadUsers() {
    console.log("Begin loading users account to array");
    if (!fs.existsSync(txtDir + "/USERS.DAT")) {
      console.log("USERS.DAT is missing!");
      return;
    }
    if (!fs.existsSync(cmdDir + "/USERS.reload")) {
      console.log("reload USERS.DAT not exists, do not reloading!");
      return;
    }

    var usersArray = fs
      .readFileSync(txtDir + "/USERS.DAT")
      .toString()
      .split("\n");
    var userCounter = 0;
    for (i in usersArray) {
      if (usersArray[i] == "") continue;

      var user = JSON.parse(usersArray[i]);
      userAccounts[user["username"]] = user;
      userCounter++;
    }
    fs.unlinkSync(cmdDir + "/USERS.reload");
    console.log("User loaded: " + userCounter);
  }

  // 20150901 - LUCKY - Loading Promo to array

  //load promo broken
  // function loadPromo() {
  //   console.log("Begin loading promo to array");
  //   if (!fs.existsSync(txtDir + "/PROMO.DAT")) {
  //     console.log("PROMO.DAT is missing!");
  //     return;
  //   }
  //   if (!fs.existsSync(cmdDir + "/PROMO.reload")) {
  //     console.log("reload PROMO.DAT not exists, do not reloading!");
  //     return;
  //   }
  //   promoList = [];

  //   var array = fs
  //     .readFileSync(txtDir + "/PROMO_PROD1x.DAT")
  //     .toString()
  //     .split("\n");
  //   var counter = 0;
  //   for (i in array) {
  //     if (array[i] == "") continue;

  //     var promoArr = array[i].split(",");
  //     var ean13code = promoArr[9];
  //     if (
  //       typeof promoList[ean13code] == "undefined" ||
  //       promoList[ean13code] == null
  //     )
  //       promoList[ean13code] = "";

  //     // COBRAND REGISTERING
  //     if (typeof promoArr[23] !== "undefined" && promoArr[23] != "") {
  //       var cobrandArr; //= promoArr[23].split(';');
  //       //if(typeof promoArr[23] !== 'undefined'){
  //       cobrandArr = promoArr[23].split(";");
  //       for (co in cobrandArr)
  //         if (
  //           (cobrandArr[co].length == 6 || cobrandArr[co].length == 8) &&
  //           cobrandcode.indexOf(cobrandArr[co]) < 0
  //         )
  //           cobrandcode.push(cobrandArr[co]);
  //       //				}
  //     }

  //     promoList[ean13code] += array[i] + "|||";
  //     counter++;

  //     // PWP PROMO LOADING
  //     if (
  //       promoArr[17] == PWP_TYPE &&
  //       typeof productList[ean13code] != "undefined"
  //     ) {
  //       if (typeof pwpPromoList[promoArr[13]] == "undefined")
  //         pwpPromoList[promoArr[13]] = { qualifiers: {}, rewards: {} };
  //       if (promoArr[24] == "1")
  //         pwpPromoList[promoArr[13]].qualifiers[ean13code] = {
  //           name: productList[ean13code][4],
  //           price: productList[ean13code][5],
  //         };
  //       else if (promoArr[24] == "2") {
  //         var promoVal = "0";
  //         switch (promoArr[7]) {
  //           case "1":
  //             promoVal = promoArr[12];
  //             break;
  //           case "2":
  //             promoVal = promoArr[10];
  //             break;
  //           case "3":
  //             promoVal = promoArr[11];
  //             break;
  //         }

  //         pwpPromoList[promoArr[13]].rewards[ean13code] = {
  //           name: productList[ean13code][4],
  //           price: productList[ean13code][5],
  //           discountType: promoArr[7],
  //           promo: promoVal,
  //         };

  //         if (
  //           typeof pwpPromoList[promoArr[13]].tier == "undefined" ||
  //           pwpPromoList[promoArr[13]].tier > parseInt(promoArr[30])
  //         ) {
  //           pwpPromoList[promoArr[13]].tier = parseInt(promoArr[30]);
  //           pwpPromoList[promoArr[13]].rta = promoArr[25];
  //           pwpPromoList[promoArr[13]].rtaTolerance = Math.round(
  //             (parseInt(promoArr[26]) * parseInt(promoArr[25])) / 100
  //           );
  //         }
  //       }
  //     }
  //   }
  //   fs.unlinkSync(cmdDir + "/PROMO.reload");
  //   console.log("Loaded " + counter + " promo");
  //   console.log("Cobrand list " + JSON.stringify(cobrandcode));
  // }

  function loadPromo() {
    console.log("Begin loading promo to array");
    if (!fs.existsSync(txtDir + '/PROMO.DAT')) { console.log('PROMO.DAT is missing!'); return; }
    if (!fs.existsSync(cmdDir + '/PROMO.reload')) { console.log('reload PROMO.DAT not exists, do not reloading!'); return; }
    promoList = [];

    var array = fs.readFileSync(txtDir + '/PROMO.DAT').toString().split("\n");
    var counter = 0;
    for (i in array) {
        if (array[i] == "") continue;

        var promoArr = array[i].split(",");
        var ean13code = promoArr[9];
        if (typeof promoList[ean13code] == 'undefined' || promoList[ean13code] == null)
            promoList[ean13code] = '';

        // COBRAND REGISTERING
        if (typeof promoArr[23] !== 'undefined' && promoArr[23] != '') {
            var cobrandArr; //= promoArr[23].split(';');
            //if(typeof promoArr[23] !== 'undefined'){
            cobrandArr = promoArr[23].split(';');
            for (co in cobrandArr)
                if ((cobrandArr[co].length == 6 || cobrandArr[co].length == 8) && cobrandcode.indexOf(cobrandArr[co]) < 0) cobrandcode.push(cobrandArr[co]);
                //				}
        }

        promoList[ean13code] += array[i] + '|||';
        counter++;

        // PWP PROMO LOADING
        if (promoArr[17] == PWP_TYPE && typeof productList[ean13code] != 'undefined') {
            if (typeof pwpPromoList[promoArr[13]] == 'undefined') pwpPromoList[promoArr[13]] = { 'qualifiers': {}, 'rewards': {} };
            if (promoArr[24] == '1') pwpPromoList[promoArr[13]].qualifiers[ean13code] = { 'name': productList[ean13code][4], 'price': productList[ean13code][5] };
            else if (promoArr[24] == '2') {
                var promoVal = '0';
                switch (promoArr[7]) {
                    case '1':
                        promoVal = promoArr[12];
                        break;
                    case '2':
                        promoVal = promoArr[10];
                        break;
                    case '3':
                        promoVal = promoArr[11];
                        break;
                }

                pwpPromoList[promoArr[13]].rewards[ean13code] = { 'name': productList[ean13code][4], 'price': productList[ean13code][5], 'discountType': promoArr[7], 'promo': promoVal };

                if (typeof pwpPromoList[promoArr[13]].tier == 'undefined' ||
                    pwpPromoList[promoArr[13]].tier > parseInt(promoArr[30])
                ) {
                    pwpPromoList[promoArr[13]].tier = parseInt(promoArr[30]);
                    pwpPromoList[promoArr[13]].rta = promoArr[25];
                    pwpPromoList[promoArr[13]].rtaTolerance = Math.round(parseInt(promoArr[26]) * parseInt(promoArr[25]) / 100);
                }

            }
        }
    }
    fs.unlinkSync(cmdDir + '/PROMO.reload');
    console.log("Loaded " + counter + " promo");
    console.log("Cobrand list " + JSON.stringify(cobrandcode));
    // console.log("Promo list " + JSON.stringify(promoList));
}

  function loadHotspice() {
    fs.exists(txtDir + "/HOTSPICE.DAT", function (exists) {
      if (exists) {
        if (!fs.existsSync(cmdDir + "/HOTSPICE.reload")) {
          console.log("reload HOTSPICE.DAT not exists, do not reloading!");
          return;
        }
        hsList = [];

        var hsArray = fs
          .readFileSync(txtDir + "/HOTSPICE.DAT")
          .toString()
          .split("\r\n");
        for (i in hsArray) {
          if (hsArray[i] == "") continue;

          var hsItemArr = hsArray[i].split(",");
          var hsItem = {};
          hsItem.sequence = hsItemArr[0];
          hsItem.category = hsItemArr[1];
          hsItem.itemName = hsItemArr[2];
          hsItem.buttonName = hsItemArr[3];
          hsItem.ean13Code = hsItemArr[4];
          hsList.push(hsItem);
        }
        fs.unlinkSync(cmdDir + "/HOTSPICE.reload");
      } else console.log("Hotspice file not exists");
    });
  }

  function loadEventRewards() {
    fs.exists(txtDir + "/EVENTPROMO.DAT", function (exists) {
      if (exists) {
        try {
          if (!fs.existsSync(cmdDir + "/EVENTPROMO.reload")) {
            console.log("reload EVENTPROMO.DAT not exists, do not reloading!");
            return;
          }
          var eventRewardsFile = fs.readFileSync(txtDir + "/EVENTPROMO.DAT");
          eventRewardsConfig = JSON.parse(eventRewardsFile);
          fs.unlinkSync(cmdDir + "/EVENTPROMO.reload");
          console.log("Event Reward Config loaded");
        } catch (e) {
          console.log(
            "Failed to load event rewards file (" + JSON.stringify(e) + ")"
          );
        }
      } else console.log("eventRewardsConfig file not exists");
    });
  }


// Function to perform the unlink operation for UPC_PRODUCT.DAT
function performFileUnlinkProduct() {
  fs.unlink(txtDir + "/UPC_PRODUCT.DAT", function (err) {
    if (err) {
      console.error("Error unlinking UPC_PRODUCT.DAT:", err);
    } else {
      console.log("UPC_PRODUCT.DAT file unlinked successfully.");
    }
  });
}

// Function to perform the unlink operation for UPC_PROMO.DAT
function performFileUnlinkPromo() {
  fs.unlink(txtDir + "/UPC_PROMO.DAT", function (err) {
    if (err) {
      console.error("Error unlinking UPC_PROMO.DAT:", err);
    } else {
      console.log("UPC_PROMO.DAT file unlinked successfully.");
    }
  });
}

const now = new Date();
const today = new Date(now);
today.setHours(1, 0, 0, 0);
const delay = today - now;

if (delay > 0) {
  setTimeout(performFileUnlinkProduct, delay);
  setTimeout(performFileUnlinkPromo, delay);
} else {
  // performFileUnlinkProduct();
  // performFileUnlinkPromo();
}

  // 20150826 - LUCKY - Modified to read from file
  function doOffsiteAuth(reqData, offline, callback, called, uac) {
    console.log("Call function doOffsiteAuth");
    var userAccount = uac;
    var username, password, macAddr, encPwd;
    var logindata = {};

    if (reqData && reqData.length > 0) {
      reqData.split("&").forEach(function (queryParam) {
        var cred = queryParam.split("=");
        if (cred[0] == "posMacAddress") macAddr = cred[1];
        else if (cred[0] == "j_username") username = cred[1];
        else if (cred[0] == "j_password") password = cred[1];
      });

      encPwd = crypto.createHash("sha256").update(password).digest("hex");
      logindata["posMacAddress"] = macAddr;
      logindata["username"] = username;
      logindata["password"] = encPwd;
    } else {
      console.log("NO POST DATA");
      callback("NO POST DATA");
    }

    // CHECK CRASH RECALL FILE
    var trxs = fs.readdirSync(trxDir + "/");
    var saveRgx = /^T([0-9]+)\.save/;
    for (var f in trxs) {
      var tmpFiles = saveRgx.exec(trxs[f]);
      if (tmpFiles) {
        savedTxns.push(tmpFiles[0]);
      }
      console.log("Saved Transactions: " + JSON.stringify(savedTxns));
    }

    if (savedTxns.length > 0) {
      try {
        savedTrxObj = JSON.parse(
          fs.readFileSync(trxDir + "/" + savedTxns[savedTxns.length - 1])
        );
        console.log(
          "Offsite Auth Check Saved Txn: " + JSON.stringify(savedTxns)
        );
        console.log("Saved Trx Object: " + JSON.stringify(savedTrxObj));
        if (savedTrxObj.userName != username) {
          console.log(
            "Logged in Cashier " +
              username +
              " is different from previous saved transaction " +
              savedTrxObj.userName
          );
          callback(
            "PLEASE LOGIN WITH PREVIOUS CASHIER (" + savedTrxObj.userName + ")"
          );
          isDifferentCashier = true;
          return;
        } else isDifferentCashier = false;
      } catch (e) {
        console.log("Failed to read savedTxnObj: " + e);
      }
    }

    if (typeof called != "undefined" && called) {
      if (typeof userAccount != "undefined") {
        if (
          typeof userAccount["isLoggedIn"] != "undefined" &&
          userAccount["isLoggedIn"] &&
          checkOnlineStat()
        ) {
          console.log(
            "User Has Already Logged In: " + JSON.stringify(userAccount)
          );
          callback("USER HAS ALREADY LOGGED IN");
        } else if (userAccount["enabled"] == "N" && checkOnlineStat()) {
          console.log("USER " + username + " is locked");
          localUpdateUserData(userAccount, false, false);
          callback("USER ACCOUNT HAS BEEN LOCKED.");
        } else if (userAccount["isActive"] == "N" && checkOnlineStat()) {
          console.log("USER " + username + " is inactive");
          localUpdateUserData(userAccount, false, false);
          callback("USER ACCOUNT IS INACTIVE.");
        } else if (userAccount.password != encPwd) {
          console.log(
            "Different password: " + encPwd + " ori: " + userAccount.password
          );
          if (username != currentWrongAccount) {
            currentWrongAccount = username;
            currentWrongCounter = 0;
          }
          currentWrongCounter++;

          if (
            currentWrongCounter > 1 &&
            currentWrongCounter < 3 &&
            checkOnlineStat()
          ) {
            console.log("Wrong Password Counter: " + currentWrongCounter);
            callback(
              "RE-ENTER PASSWORD. RETRY ATTEMPT " +
                currentWrongCounter +
                " OF 3"
            );
          } else if (currentWrongCounter >= 3 && checkOnlineStat()) {
            userAccount["enabled"] = "N";
            console.log(
              "User Account is Locked: " + JSON.stringify(userAccount)
            );
            localUpdateUserData(userAccount, true, false);
            currentWrongAccount = username;
            currentWrongCounter = 0;
            callback("USER ACCOUNT HAS BEEN LOCKED.");
          } else callback("RE-ENTER PASSWORD.");
        } else if (
          userAccount.roles.indexOf("ROLE_CASHIER_SALES") == -1 &&
          userAccount.roles.indexOf("ROLE_CUSTOMER_SERVICE") == -1
        )
          callback("ACCOUNT IS NOT AUTHORIZED.");
        else {
          currentWrongAccount = username;
          currentWrongCounter = 0;
          loggedUser = userAccount;
          localUpdateUserData(userAccount, true, false);
          if (offline) userAccount["password_change_type"] = null;
          console.log(
            "User Successfully Logged In: " + JSON.stringify(userAccount)
          );
          callback("OK", userAccount);
        }
      } else {
        console.log("USER NOT FOUND");
        callback("USER NOT FOUND");
      }

      return;
    }

    // ATTEMPT TO ONLINE LOGIN
    if (checkOnlineStat()) {
      console.log("--Attempting to do online authentication--");

      var options = {
        host: config.store.url,
        port: config.store.port,
        path: "/pos-web/user/getUserLogin",
        method: "POST",
        headers: {
          accept: "application/json;charset=UTF-8",
        },
      };

      var serverReq = http.request(options, function (result) {
        var authData = "";
        result.on("data", function (data) {
          authData += data;
        });
        result.on("end", function (data) {
          if (data) authData += data;

          if (authData == "null" || authData == null) {
            authData = "";
            callback("USER NOT FOUND");
            return;
          }
          console.log("Resp Auth Data: " + authData);
          try {
            authData = JSON.parse(authData);
          } catch (e) {
            console.log("Exception when parsing authdata: " + e);
          }
          offlineLogin = false;
          isTimeout = false;
          doOffsiteAuth(reqData, offline, callback, true, authData);
        });
        result.on("error", function (err) {
          console.log(err);
          sendResponse(res, 500, "Internal Server Error", cType);
        });
      });

      serverReq.setTimeout(httpTimeout, function (err) {
        console.log("Online auth timeout, attempting to do offline auth");
        isTimeout = true;
        serverReq.abort();
        doOffsiteAuth(reqData, true, callback, false);
      });

      console.log("Login data: " + JSON.stringify(logindata));
      serverReq.write(JSON.stringify(logindata));
      serverReq.end();

      serverReq.on("error", function (err) {
        console.log("Failed to get online auth, attempting to do offline auth");
        if (!isTimeout) doOffsiteAuth(reqData, true, callback, false);
      });
    } else {
      userAccount = userAccounts[username];
      console.log("Local Login? " + configuration["enableLocalLogin"]);
      if (
        typeof configuration["enableLocalLogin"] == "undefined" ||
        configuration["enableLocalLogin"]
      ) {
        offlineLogin = true;
        doOffsiteAuth(reqData, offline, callback, true, userAccount);
      } else callback("LOCAL LOGIN IS DISABLED, PLEASE CONTACT IT HELPDESK");
    }
  }



  // 20150826 - LUCKY - Modify to write on files
  function createUserSession(user, callback) {
    var startTime = new Date().getTime();
    session = {
      userId: user.userId,
      emplId: user.emplId,
      username: user.username,
      uroles: user.roles,
      givenName: user.givenName,
      lastName: user.lastName,
      sessionStart: startTime,
      sessionEnd: "",
      terminalId: configuration.terminalId,
      offsiteId:
        configuration.storeCode +
        configuration.terminalCode +
        parseInt(Date.now() / 10000),
      lastTrxId: configuration.lastTxnSeqValue,
    };

    // 20150828 - LUCKY - Write to session transaction file
    fs.writeFile(
      trxDir + "/S" + session.offsiteId + ".txt",
      JSON.stringify(session),
      function (err) {
        if (err) {
          console.log("Session Write error:", session.offsiteId, err);
          callback(null);
        } else {
          fs.writeFileSync(
            tmpDir + "/.loggedsess",
            JSON.stringify({
              sessionId: session.offsiteId,
              supervisorNo: "",
              transactionId: "",
            })
          );
          callback(session);
        }
      }
    );
  }

  // 20150826 - LUCKY - Modify to write on files
  function endUserSession(session, callback) {
    session.sessionEnd = new Date().getTime();
    fs.writeFile(
      trxDir + "/S" + session.offsiteId + ".txt",
      JSON.stringify(session),
      function (err) {
        if (err) {
          console.log("Session Write error:", session.offsiteId, err);
          callback(null);
        } else {
          callback(session);
          session = null;
          if (fs.existsSync(tmpDir + "/.loggedsess"))
            fs.unlinkSync(tmpDir + "/.loggedsess");
          savedTxns = [];
          savedTrxObj = null;
          console.log("Session destroyed");
        }
      }
    );

    // DELETE ALL .SAVE TRANSACTION
    if (isDifferentCashier) {
      console.log("Not cleaning up the .save trxs");
      return;
    }

    try {
      var trxs = fs.readdirSync(trxDir + "/");
      var saveRgx = /^T([0-9]+)\.save/;
      var midtrx = false;
      for (var f in trxs) {
        var tmpFiles = saveRgx.exec(trxs[f]);
        if (tmpFiles) {
          fs.unlinkSync(trxDir + "/" + tmpFiles[0]);
          console.log("SYS|Deleting file " + tmpFiles[0]);
        }
      }
    } catch (e) {
      console.log("SYS|Failed when trying to cleanup .save files " + e);
    }
  }

  function genTxNumber(callback) {
    var now = new Date();

    // CHECK FOR RESET TRANSACTION

    // GET FROM OTHER FILE
    if (fs.existsSync(tmpDir + "/.lasttrxval")) {
      var cut = /([0-9]{1,5}$)/;
      var last = fs.readFileSync(tmpDir + "/.lasttrxval");
      var trx = cut.exec(last);
      if (trx == null) {
        console.log("CANNOT READ TRANSACTION ID");
        process.exit(3);
      }
      configuration.lastTxnSeqValue = parseInt(trx) + 1;
      fs.writeFileSync(tmpDir + "/.lasttrxval", configuration.lastTxnSeqValue);
    } else {
      console.log("CANNOT FIND TRANSACTION ID, NODE SHUTTING DOWN");
      process.exit(3);
    }

    if (configuration.lastTxnSeqValue != null) {
      var now = new Date();
      var date = "" + now.getDate();
      var mon = "" + (parseInt(now.getMonth()) + 1);
      var year = "" + now.getFullYear();

      if (fs.existsSync(tmpDir + "/.lasttrxreset")) {
        var lastTrxReset = fs.readFileSync(tmpDir + "/.lasttrxreset");
        if ("" + year + mon != lastTrxReset) {
          console.log(
            "Resetting transaction id from last reset " + lastTrxReset
          );
          configuration.lastTxnSeqValue = 1;
          fs.writeFileSync(tmpDir + "/.lasttrxreset", "" + year + mon);
          fs.writeFileSync(
            tmpDir + "/.lasttrxval",
            configuration.lastTxnSeqValue
          );
        }
      } else fs.writeFileSync(tmpDir + "/.lasttrxreset", "" + year + mon);

      configuration.lastTxnSeqValue = parseInt(configuration.lastTxnSeqValue);
    } else {
      //configuration.lastTxnSeqValue = 1;
      console.log("TRANSACTION ID NULL");
      process.exit(3);
    }

    var nextTxn =
      configuration.storeCode +
      configuration.terminalCode +
      now.getFullYear().toString().substring(2) +
      "00".substring(0, 2 - (now.getMonth() + 1).toString().length) +
      (now.getMonth() + 1) +
      "00000".substring(
        0,
        5 - configuration.lastTxnSeqValue.toString().length
      ) +
      configuration.lastTxnSeqValue;

    console.log("Starting TRX #" + nextTxn);
    callback(nextTxn);

    // CHECK IF TXN ID ALREADY EXISTS
    /*glob(trxDir + '/T' + nextTxn + '.*', null, function (er, files)
        {
        	if(files.length < 1)
        	{
        		glob(archiveTrxDir + '/T' + nextTxn + '.*', null, function (er, arcfiles)
        		{
        			if(arcfiles.length < 1) console.log('TXN # ' + nextTxn + ' Available');
        			else	configuration.lastTxnSeqValue += 1;
        		});
        	}
        	else configuration.lastTxnSeqValue += 1;
        	
        	nextTxn = 	configuration.storeCode +
        			configuration.terminalCode +
        			now.getFullYear().toString().substring(2) +
        			'00'.substring(0,2 - now.getMonth().toString().length) +
        			(now.getMonth() + 1)  +
        			'00000'.substring(0, 5 - configuration.lastTxnSeqValue.toString().length) +
        			configuration.lastTxnSeqValue;
        	console.log("Starting TRX #" + nextTxn);
        	callback(nextTxn);
        });*/
  }

  // 20150901 - LUCKY - Search Product
  // 20161019 - LUCKY - Add Deptstore Product Check Mechanism
  function getProductList(ean13code) {
    // CHECK FOR PROFIT PRODUCT FIRST
    var prodList = [];
    var prod = productList[ean13code];

    if (typeof prod != "undefined") {
      var resultArr = {};
      resultArr["id"] = prod[0];
      resultArr["ean13Code"] = prod[1];
      resultArr["name"] = prod[2];
      resultArr["description"] = prod[3];
      resultArr["shortDesc"] = prod[4];
      resultArr["currentPrice"] = prod[5];
      resultArr["categoryId"] = prod[6];
      resultArr["isTaxInclusive"] = prod[7] == "Y" ? true : false;
      resultArr["plu"] = prod[8];
      resultArr["isWeighted"] = prod[9] == "Y" ? true : false;
      resultArr["cost"] = prod[10];
      resultArr["departmentCode"] = prod[11];
      resultArr["sku"] = prod[12];
      resultArr["storeCode"] = prod[13];
      resultArr["vatCode"] = prod[17];

      resultArr["trkPoint"] = prod[19];
      resultArr["trkPrice"] = prod[20];
      resultArr["trkType"] = prod[21];
      resultArr["rr_reason"] = "";

      var promoRes = promoList[ean13code];
      resultArr["promotions"] = [];
      if (typeof promoRes != "undefined") {
        var promoArray = promoRes.split("|||");
        for (i in promoArray) {
          if (promoArray[i] == "") continue;

          var promo = promoArray[i].split(",");
          var promoObj = {};
          promoObj["productPromotionId"] = promo[0];
          promoObj["promotionId"] = promo[1];
          promoObj["startDate"] = promo[2];
          promoObj["endDate"] = promo[3];
          promoObj["startTime"] = promo[4];
          promoObj["endTime"] = promo[5];
          promoObj["promoDay"] = promo[6];
          promoObj["discountType"] = promo[7];
          promoObj["enabled"] = promo[8] == "Y" ? true : false;
          promoObj["ean13code"] = promo[9];
          promoObj["percentDiscount"] = promo[10];
          promoObj["amountOff"] = promo[11];
          promoObj["promoSellingPrice"] = promo[12];
          promoObj["mixAndMatchCode"] = promo[13];
          promoObj["promoPriceQty"] = parseInt(promo[14]);
          promoObj["normalPriceQty"] = promo[15];
          promoObj["maxPromoQty"] = parseInt(promo[16]);
          // CR ADD DISCOUNT
          promoObj["promotionType"] =
            promo[23] != "" &&
            promo[22] == "1" &&
            (promo[17] == "1" || promo[17] == "4")
              ? "M"
              : promo[17];
          // CR ADD DISCOUNT
          promoObj["qualifiedQuantity"] = promo[18];
          promoObj["slidingDiscountType"] = promo[19];
          promoObj["slidingDiscountInfo"] = promo[20]
            .replace(/\-/g, ",")
            .split(";"); // ARRAY [fromQty],[toQty],[discount]
          promoObj["normalSellingPrice"] = promo[21];
          promoObj["targetGroup"] = promo[22];
          promoObj["coBrandNumber"] = promo[23].replace(/\;/g, ",");
          promoObj["itemType"] = promo[24];
          promoObj["requiredPoint"] = promo[25];
          promoObj["maximumPoint"] = promo[26];
          promoObj["productId"] = promo[27];
          promoObj["pointPerUnit"] = promo[28];
          promoObj["coBrandMix"] = promo[29];
          promoObj["memberGroupCode"] = promo[30];
          promoObj["slidingDiscountInfoRaw"] = promo[31];
          promoObj["storeCode"] = promo[32];
          //promoObj["mixAndMatchCode"] 		= promo[33];

          resultArr["promotions"].push(promoObj);
        }
      }

      if (resultArr["categoryId"] != "DEPTSTORE") prodList.push(resultArr);
    }

    // ONLY TERMINAL TYPE DEPTSTORE
    if (
      (configuration["terminalType"] == "DEPTSTORE" ||
        configuration["terminalType"] == "RETURN-REFUND") &&
      deptstorePrefix.indexOf(ean13code.substring(0, 1)) > -1
    ) {
      // NOW LET'S SEARCH FOR DEPSTORE
      // DEPSTORE PRODUCT EXAMPLE
      // 109996330639999999,6330639999999,WARDAH,WARDAH,WARDAH,,DEPTSTORE,Y,,N,,13,63,10999,N
      console.log(
        "Trying to check DEPTSTORE item|" +
          "6" +
          ean13code.substring(1, 7) +
          "999999"
      );
      var prodMetro = productList["6" + ean13code.substring(1, 7) + "999999"];

      if (
        typeof prodMetro != "undefined" &&
        prodMetro[14] == "Y" &&
        ean13code.length < 15
      ) {
        var resultArr = {};

        resultArr["id"] = prodMetro[0];
        resultArr["ean13Code"] = prodMetro[1];
        resultArr["name"] = prodMetro[2];
        resultArr["description"] = prodMetro[3];
        resultArr["shortDesc"] = prodMetro[4];
        resultArr["currentPrice"] = "";
        resultArr["categoryId"] = "DEPTSTORE";
        resultArr["isTaxInclusive"] = true;
        resultArr["plu"] = "";
        resultArr["isWeighted"] = false;
        resultArr["cost"] = "";
        resultArr["departmentCode"] = prodMetro[11];
        resultArr["sku"] = prodMetro[12];
        resultArr["storeCode"] = prodMetro[13];
        resultArr["vatCode"] = "N";

        var promoRes = promoList["6" + ean13code.substring(1, 7) + "999999"];
        resultArr["promotions"] = [];
        if (typeof promoRes != "undefined") {
          var promoArray = promoRes.split("|||");
          for (i in promoArray) {
            if (promoArray[i] == "") continue;

            var promo = promoArray[i].split(",");
            var promoObj = {};
            promoObj["productPromotionId"] = promo[0];
            promoObj["promotionId"] = promo[1];
            promoObj["startDate"] = promo[2];
            promoObj["endDate"] = promo[3];
            promoObj["startTime"] = promo[4];
            promoObj["endTime"] = promo[5];
            promoObj["promoDay"] = promo[6];
            promoObj["discountType"] = promo[7];
            promoObj["enabled"] = promo[8] == "Y" ? true : false;
            promoObj["ean13code"] = promo[9];
            promoObj["percentDiscount"] = promo[10];
            promoObj["amountOff"] = promo[11];
            promoObj["promoSellingPrice"] = promo[12];
            promoObj["mixAndMatchCode"] = promo[13];
            promoObj["promoPriceQty"] = parseInt(promo[14]);
            promoObj["normalPriceQty"] = promo[15];
            promoObj["maxPromoQty"] = parseInt(promo[16]);
            promoObj["promotionType"] =
              promo[23] != "" && promo[22] == "1" ? "M" : promo[17];
            promoObj["qualifiedQuantity"] = promo[18];
            promoObj["slidingDiscountType"] = promo[19];
            promoObj["slidingDiscountInfo"] = promo[20]
              .replace(/\-/g, ",")
              .split(";"); // ARRAY [fromQty],[toQty],[discount]
            promoObj["normalSellingPrice"] = promo[21];
            promoObj["targetGroup"] = promo[22];
            promoObj["coBrandNumber"] = promo[23].replace(/\;/g, ",");
            promoObj["itemType"] = promo[24];
            promoObj["requiredPoint"] = promo[25];
            promoObj["maximumPoint"] = promo[26];
            promoObj["productId"] = promo[27];
            promoObj["pointPerUnit"] = promo[28];
            promoObj["coBrandMix"] = promo[29];
            promoObj["memberGroupCode"] = promo[30];
            promoObj["slidingDiscountInfoRaw"] = promo[31];
            promoObj["storeCode"] = promo[32];
            //promoObj["mixAndMatchCode"] 		= promo[33];

            resultArr["promotions"].push(promoObj);
          }
        }

        prodList.push(resultArr);
      }
    }

    if (prodList.length == 0) prodList = null;
    else if (prodList.length == 1) prodList = prodList[0];

    return prodList;
  }

  function getProductListArray(ean13code) {
    // CHECK FOR PROFIT PRODUCT FIRST
    var prodList = [];
    for (var prd in productList) {
      if (prd.indexOf(ean13code) == 0) {
        var prod = productList[prd];

        if (typeof prod != "undefined") {
          var resultArr = {};
          resultArr["id"] = prod[0];
          resultArr["ean13Code"] = prod[1];
          resultArr["name"] = prod[2];
          resultArr["description"] = prod[3];
          resultArr["shortDesc"] = prod[4];
          resultArr["currentPrice"] = prod[5];
          resultArr["categoryId"] = prod[6];
          resultArr["isTaxInclusive"] = prod[7] == "Y" ? true : false;
          resultArr["plu"] = prod[8];
          resultArr["isWeighted"] = prod[9] == "Y" ? true : false;
          resultArr["cost"] = prod[10];
          resultArr["departmentCode"] = prod[11];
          resultArr["sku"] = prod[12];
          resultArr["storeCode"] = prod[13];
          resultArr["vatCode"] = prod[17];

          var promoRes = promoList[prd];
          resultArr["promotions"] = [];
          if (typeof promoRes != "undefined") {
            var promoArray = promoRes.split("|||");
            for (i in promoArray) {
              if (promoArray[i] == "") continue;

              var promo = promoArray[i].split(",");
              var promoObj = {};
              promoObj["productPromotionId"] = promo[0];
              promoObj["promotionId"] = promo[1];
              promoObj["startDate"] = promo[2];
              promoObj["endDate"] = promo[3];
              promoObj["startTime"] = promo[4];
              promoObj["endTime"] = promo[5];
              promoObj["promoDay"] = promo[6];
              promoObj["discountType"] = promo[7];
              promoObj["enabled"] = promo[8] == "Y" ? true : false;
              promoObj["ean13code"] = promo[9];
              promoObj["percentDiscount"] = promo[10];
              promoObj["amountOff"] = promo[11];
              promoObj["promoSellingPrice"] = promo[12];
              promoObj["mixAndMatchCode"] = promo[13];
              promoObj["promoPriceQty"] = parseInt(promo[14]);
              promoObj["normalPriceQty"] = promo[15];
              promoObj["maxPromoQty"] = parseInt(promo[16]);
              promoObj["promotionType"] =
                promo[23] != "" && promo[22] == "1" ? "M" : promo[17];
              promoObj["qualifiedQuantity"] = promo[18];
              promoObj["slidingDiscountType"] = promo[19];
              promoObj["slidingDiscountInfo"] = promo[20]
                .replace(/\-/g, ",")
                .split(";"); // ARRAY [fromQty],[toQty],[discount]
              promoObj["normalSellingPrice"] = promo[21];
              promoObj["targetGroup"] = promo[22];
              promoObj["coBrandNumber"] = promo[23].replace(/\;/g, ",");
              promoObj["itemType"] = promo[24];
              promoObj["requiredPoint"] = promo[25];
              promoObj["maximumPoint"] = promo[26];
              promoObj["productId"] = promo[27];
              promoObj["pointPerUnit"] = promo[28];
              promoObj["coBrandMix"] = promo[29];
              promoObj["memberGroupCode"] = promo[30];
              promoObj["slidingDiscountInfoRaw"] = promo[31];
              promoObj["storeCode"] = promo[32];
              //promoObj["mixAndMatchCode"] 		= promo[33];

              resultArr["promotions"].push(promoObj);
            }
          }

          if (resultArr["categoryId"] != "DEPTSTORE") prodList.push(resultArr);
        }

        // ONLY TERMINAL TYPE DEPTSTORE
        if (
          (configuration["terminalType"] == "DEPTSTORE" ||
            configuration["terminalType"] == "RETURN-REFUND") &&
          deptstorePrefix.indexOf(ean13code.substring(0, 1)) > -1
        ) {
          // NOW LET'S SEARCH FOR DEPSTORE
          // DEPSTORE PRODUCT EXAMPLE
          // 109996330639999999,6330639999999,WARDAH,WARDAH,WARDAH,,DEPTSTORE,Y,,N,,13,63,10999,N
          console.log(
            "Trying to check DEPTSTORE item|" +
              "6" +
              ean13code.substring(1, 7) +
              "999999"
          );
          var prodMetro =
            productList["6" + ean13code.substring(1, 7) + "999999"];

          if (typeof prodMetro != "undefined" && prodMetro[14] == "Y") {
            var resultArr = {};

            resultArr["id"] = prodMetro[0];
            resultArr["ean13Code"] = prodMetro[1];
            resultArr["name"] = prodMetro[2];
            resultArr["description"] = prodMetro[3];
            resultArr["shortDesc"] = prodMetro[4];
            resultArr["currentPrice"] = "";
            resultArr["categoryId"] = "DEPTSTORE";
            resultArr["isTaxInclusive"] = true;
            resultArr["plu"] = "";
            resultArr["isWeighted"] = false;
            resultArr["cost"] = "";
            resultArr["departmentCode"] = prodMetro[11];
            resultArr["sku"] = prodMetro[12];
            resultArr["storeCode"] = prodMetro[13];
            resultArr["vatCode"] = "N";

            var promoRes =
              promoList["6" + ean13code.substring(1, 7) + "999999"];
            resultArr["promotions"] = [];
            if (typeof promoRes != "undefined") {
              var promoArray = promoRes.split("|||");
              for (i in promoArray) {
                if (promoArray[i] == "") continue;

                var promo = promoArray[i].split(",");
                var promoObj = {};
                promoObj["productPromotionId"] = promo[0];
                promoObj["promotionId"] = promo[1];
                promoObj["startDate"] = promo[2];
                promoObj["endDate"] = promo[3];
                promoObj["startTime"] = promo[4];
                promoObj["endTime"] = promo[5];
                promoObj["promoDay"] = promo[6];
                promoObj["discountType"] = promo[7];
                promoObj["enabled"] = promo[8] == "Y" ? true : false;
                promoObj["ean13code"] = promo[9];
                promoObj["percentDiscount"] = promo[10];
                promoObj["amountOff"] = promo[11];
                promoObj["promoSellingPrice"] = promo[12];
                promoObj["mixAndMatchCode"] = promo[13];
                promoObj["promoPriceQty"] = parseInt(promo[14]);
                promoObj["normalPriceQty"] = promo[15];
                promoObj["maxPromoQty"] = parseInt(promo[16]);
                promoObj["promotionType"] =
                  promo[23] != "" && promo[22] == "1" ? "M" : promo[17];
                promoObj["qualifiedQuantity"] = promo[18];
                promoObj["slidingDiscountType"] = promo[19];
                promoObj["slidingDiscountInfo"] = promo[20]
                  .replace(/\-/g, ",")
                  .split(";"); // ARRAY [fromQty],[toQty],[discount]
                promoObj["normalSellingPrice"] = promo[21];
                promoObj["targetGroup"] = promo[22];
                promoObj["coBrandNumber"] = promo[23].replace(/\;/g, ",");
                promoObj["itemType"] = promo[24];
                promoObj["requiredPoint"] = promo[25];
                promoObj["maximumPoint"] = promo[26];
                promoObj["productId"] = promo[27];
                promoObj["pointPerUnit"] = promo[28];
                promoObj["coBrandMix"] = promo[29];
                promoObj["memberGroupCode"] = promo[30];
                promoObj["slidingDiscountInfoRaw"] = promo[31];
                promoObj["storeCode"] = promo[32];
                //promoObj["mixAndMatchCode"] 		= promo[33];

                resultArr["promotions"].push(promoObj);
              }
            }

            prodList.push(resultArr);
          }
        }

        //if (prodList.length == 0) prodList = null;
        //else if(prodList.length == 1) prodList = prodList[0];
      }
    }

    return prodList;
  }

  // 20150917 - LUCKY - Check if transaction has customer id or not
  function localTrxHasCustomerId(trxid, res) {
    // FOR NOW ALWAYS RETURN FALSE
    var fname = archiveTrxDir + "/T" + txnId + ".txt";
    fs.exists(fname, function (exist) {
      if (exist) {
      }
    });
    res.oldEnd(JSON.stringify(false, { error: "TRX_GET_ERROR" }));
  }

  // 20150901 - LUCKY - Modify to read from the array, and always check for DIFF before get to the array
  function localSearchProduct(barcode, res) {
    res.removeHeader("Content-Length");
    res.oldWriteHead(200, {
      Connection: "keep-alive",
      "Content-Type": "application/json;charset=UTF-8",
    });
    res.oldEnd = res.end;
    res.end = function (data) {};

    var freshGoodsIndicators =
      configuration.properties["FRESH_GOODS_INDICATOR"];
    var freshGoodsArray = [];
    var isFreshGoodsBarcode = false;
    var freshGoodsScanMode = configuration.properties["FRESH_GOODS_SCAN_MODE"]
      ? configuration.properties["FRESH_GOODS_SCAN_MODE"]
      : constants.FRESH_GOODS.SCAN_PRICE;

    if (freshGoodsIndicators) freshGoodsArray = freshGoodsIndicators.split(",");
    else {
      freshGoodsArray.push("20");
      freshGoodsArray.push("21");
    }

    for (var i = 0; i < freshGoodsArray.length; i++) {
      if (barcode.indexOf(freshGoodsArray[i]) == 0) {
        isFreshGoodsBarcode = true;
      }
    }
    console.log("isFreshGoods: ", isFreshGoodsBarcode);

    // CHECK FOR DIFF FIRST
    fs.exists(txtDir + "/PRODUCT.DIFF", function (exists) {
      if (exists) {
        console.log("Attempting to get Product Updates");
        var productDiff = fs
          .readFileSync(txtDir + "/PRODUCT.DIFF")
          .toString()
          .split("\n");
        for (i in productDiff) {
          if (/^(\>\s)/.test(productDiff[i])) {
            var prodArr = productDiff[i].split(",");
            productList[prodArr[1]] = prodArr;
          }
        }
      }
    });

    fs.exists(txtDir + "/PROMO.DIFF", function (exists) {
      if (exists) {
        var promoDiff = fs
          .readFileSync(txtDir + "/PROMO.DIFF")
          .toString()
          .split("\n");
        for (i in promoDiff) {
          if (/^(\>\s)/.test(promoDiff[i])) {
            var promoArr = promoDiff[i].split(",");
            promoList[promoArr[9]] = promoDiff[i];
          }
        }
      }
    });

    var product = getProductList(barcode);
    if (product != null) {
      res.oldEnd(JSON.stringify(product, { error: "PRODUCT_GET_ERROR" }));
    } else {
      if (isFreshGoodsBarcode && barcode.length == 13) {
        var pBarcode = barcode.substring(0, 6) + "0000000";
        var freshGoodsScanPrice =
          freshGoodsScanMode == constants.FRESH_GOODS.SCAN_PRICE;
        console.log("BARCODE: ", pBarcode);

        var product = getProductList(pBarcode);
        if (product != null) {
          if (freshGoodsScanPrice)
            product.currentPrice = parseInt(barcode.substring(6, 12), "10");
          else product.weight = parseFloat(barcode.substring(6, 12)) / 1000;

          res.oldEnd(JSON.stringify(product, { error: "PRODUCT_GET_ERROR" }));
        } else {
          localSaveItemCodeNotFound(session.currentTrxId, barcode);
          console.log("BARCODE:PRODUCT_GET_ERROR:" + pBarcode);
          res.oldEnd(JSON.stringify({ error: "PRODUCT_GET_ERROR" }));
        }
      } else {
        var product = getProductList(barcode);
        if (product != null) {
          res.oldEnd(JSON.stringify(product, { error: "PRODUCT_GET_ERROR" }));
        } else {
          localSaveItemCodeNotFound(session.currentTrxId, barcode);
          console.log("PRODUCT_GET_ERROR:" + barcode);
          res.oldEnd(JSON.stringify({ error: "PRODUCT_GET_ERROR" }));
        }
      }
    }
  }

  function localSearchProductArray(barcode, res) {
    res.removeHeader("Content-Length");
    res.oldWriteHead(200, {
      Connection: "keep-alive",
      "Content-Type": "application/json;charset=UTF-8",
    });
    res.oldEnd = res.end;
    res.end = function (data) {};

    var freshGoodsIndicators =
      configuration.properties["FRESH_GOODS_INDICATOR"];
    var freshGoodsArray = [];
    var isFreshGoodsBarcode = false;
    var freshGoodsScanMode = configuration.properties["FRESH_GOODS_SCAN_MODE"]
      ? configuration.properties["FRESH_GOODS_SCAN_MODE"]
      : constants.FRESH_GOODS.SCAN_PRICE;

    if (freshGoodsIndicators) freshGoodsArray = freshGoodsIndicators.split(",");
    else {
      freshGoodsArray.push("20");
      freshGoodsArray.push("21");
    }

    for (var i = 0; i < freshGoodsArray.length; i++) {
      if (barcode.indexOf(freshGoodsArray[i]) == 0) {
        isFreshGoodsBarcode = true;
      }
    }
    console.log("isFreshGoods: ", isFreshGoodsBarcode);

    // CHECK FOR DIFF FIRST
    fs.exists(txtDir + "/PRODUCT.DIFF", function (exists) {
      if (exists) {
        console.log("Attempting to get Product Updates");
        var productDiff = fs
          .readFileSync(txtDir + "/PRODUCT.DIFF")
          .toString()
          .split("\n");
        for (i in productDiff) {
          if (/^(\>\s)/.test(productDiff[i])) {
            var prodArr = productDiff[i].split(",");
            productList[prodArr[1]] = prodArr;
          }
        }
      }
    });

    fs.exists(txtDir + "/PROMO.DIFF", function (exists) {
      if (exists) {
        var promoDiff = fs
          .readFileSync(txtDir + "/PROMO.DIFF")
          .toString()
          .split("\n");
        for (i in promoDiff) {
          if (/^(\>\s)/.test(promoDiff[i])) {
            var promoArr = promoDiff[i].split(",");
            promoList[promoArr[9]] = promoDiff[i];
          }
        }
      }
    });

    if (isFreshGoodsBarcode && barcode.length == 13) {
      var pBarcode = barcode.substring(0, 6) + "0000000";
      var freshGoodsScanPrice =
        freshGoodsScanMode == constants.FRESH_GOODS.SCAN_PRICE;
      console.log("BARCODE: ", pBarcode);

      var product = getProductListArray(pBarcode);
      if (product != null) {
        if (freshGoodsScanPrice)
          product.currentPrice = parseInt(barcode.substring(6, 12), "10");
        else product.weight = parseFloat(barcode.substring(6, 12)) / 1000;

        res.oldEnd(JSON.stringify(product, { error: "PRODUCT_GET_ERROR" }));
      } else {
        localSaveItemCodeNotFound(session.currentTrxId, barcode);
        console.log("BARCODE:PRODUCT_GET_ERROR:" + pBarcode);
        res.oldEnd(JSON.stringify({ error: "PRODUCT_GET_ERROR" }));
      }
    } else {
      var product = getProductListArray(barcode);
      if (product != null) {
        res.oldEnd(JSON.stringify(product, { error: "PRODUCT_GET_ERROR" }));
      } else {
        localSaveItemCodeNotFound(session.currentTrxId, barcode);
        console.log("PRODUCT_GET_ERROR:" + barcode);
        res.oldEnd(JSON.stringify({ error: "PRODUCT_GET_ERROR" }));
      }
    }
  }

  function localUpdateUserData(user, online, password) {
    if (checkOnlineStat()) {
      var options = {
        host: config.store.url,
        port: config.store.port,
        path: "/pos-web/user/updateUserPasswordType",
        method: "POST",
        headers: {
          accept: "application/json;charset=UTF-8",
        },
      };

      var serverReq = http.request(options, function (result) {
        var authData = "";
        result.on("data", function (data) {
          authData += data;
        });
        result.on("end", function (data) {
          if (data) authData += data;

          if (authData == "null" || authData == null) authData = "";
          console.log("User Account Update Response: " + authData);
        });
        result.on("error", function (err) {
          console.log(err);
          sendResponse(res, 500, "Internal Server Error", cType);
        });
      });

      serverReq.setTimeout(httpTimeout, function (err) {
        console.log("HTTP Request Timeout: " + err);
      });

      if (!password) user["password"] = "";
      console.log("Update user data: " + JSON.stringify(user));

      serverReq.write(JSON.stringify(user));
      serverReq.end();

      serverReq.on("error", function (err) {
        console.log("Failed to update account online");
      });
    }

    //var userFName = txtDir + '/USERS.DAT';
    /*
        if(typeof userAccounts[user['username']] == 'undefined') userAccounts[user['username']] = user;
        if(password) userAccounts[user['username']]['password'] = user['password'];
        userAccounts[user['username']]['isActive'] = user['isActive'];
        userAccounts[user['username']]['enabled'] = user['enabled'];
        userAccounts[user['username']]['passwordExpDate'] = user['passwordExpDate'];
        userAccounts[user['username']]['password_change_type'] = (typeof user['passwordChangeType'] != 'undefined') ? user['passwordChangeType'] : userAccounts[user['username']]['password_change_type'];
        */

    /*fs.appendFile(userFName, JSON.stringify(userAccounts[user.username]) + "\n", 
        	function (err) 
        	{
        		if(err) console.log('Failed to update USERS.DAT ', err);
        		else console.log('USERS.DAT updated successfully');
        	}
        );*/
  }

  function localSaveItemCodeNotFound(trxid, barcode) {
    var trxFName = trxDir + "/N" + trxid;
    fs.appendFile(trxFName + ".tmp", barcode + "\n", function (err) {
      if (err) console.log("Item Not Found Write Error:", trxid, err);
      else console.log("Item Not Found " + barcode + " Written to " + trxFName);
    });
  }

  // 20150902 - LUCKY - Modify saving this transaction to local file /equnix/trx/
  function localSaveTxn(res, headers) {
    if (txnSaveData && txnSaveData.length > 0) {
      res.removeHeader("Content-Length");
      res.oldWriteHead(200, {
        "Content-Type": "application/json;charset=UTF-8",
      });
      res.oldEnd = res.end;
      res.end = function (data) {};
      var postObj = JSON.parse(txnSaveData);
      // console.log("postObj localSave : " + JSON.stringify(postObj));
      // CHECK FOR TOPUP AND TVS TRX FILES
      var tvsExist = fs.existsSync(
        trxDir + "/V" + postObj.transactionId + ".tmp"
      );
      if (tvsExist) {
        console.log(
          "Processing TVS Transaction Details: V" + postObj.transactionId
        );
        postObj["tvsTransactionDetails"] = JSON.parse(
          fs.readFileSync(trxDir + "/V" + postObj.transactionId + ".tmp")
        );
        fs.unlinkSync(trxDir + "/V" + postObj.transactionId + ".tmp");
      }

      /*var topupExist = fs.existsSync(trxDir + '/U' + postObj.transactionId + '.tmp'); 
            if(topupExist)
            {
            	console.log('Processing Topup Transaction Details: U' + postObj.transactionId);
            	postObj['topupTransactionDetails'] = JSON.parse(fs.readFileSync(trxDir + '/U' + postObj.transactionId + '.tmp'));
            	fs.unlinkSync(trxDir + '/U' + postObj.transactionId + '.tmp');
            }*/

      /*
       * commented due to #79948 The only spot for saving client date.
       * This is due to offline mode logs implementation.
       */
      if (postObj) {
        postObj.transactionDate = new Date();
        var trxFName = trxDir + "/T" + postObj.transactionId;
        fs.writeFile(
          trxFName + ".tmp",
          JSON.stringify(postObj),
          function (err) {
            if (err) {
              console.log(
                "Transaction Write Error:",
                postObj.transactionId,
                err
              );
              res.oldEnd(JSON.stringify({ error: "TRX_WRITE_ERROR" }));
            } else {
              console.log("===>", postObj.transactionId);

              if (postObj.type == "VOID") {
                fs.exists(
                  archiveTrxDir + "/T" + postObj.baseTransactionId + ".txt",
                  function (exists) {
                    if (exists) {
                      console.log(
                        "Attempting to void transaction: " +
                          postObj.baseTransactionId
                      );
                      var baseTxn = JSON.parse(
                        fs
                          .readFileSync(
                            archiveTrxDir +
                              "/T" +
                              postObj.baseTransactionId +
                              ".txt"
                          )
                          .toString()
                      );

                      console.log(
                        "updated voided Txn: ",
                        baseTxn.transactionId
                      );
                      baseTxn.status = "VOIDED";

                      var trxFNameVoid =
                        archiveTrxDir + "/T" + baseTxn.transactionId;
                      fs.writeFile(
                        trxFNameVoid + ".tmp",
                        JSON.stringify(baseTxn),
                        function (err) {
                          if (err) {
                            console.log(
                              "TX_WRITE_ERROR:",
                              baseTxn.transactionId,
                              err
                            );
                            res.oldEnd(
                              JSON.stringify({ error: "TX_WRITE_ERROR" })
                            );
                          } else {
                            res.oldEnd(
                              JSON.stringify({
                                transactionId: postObj.transactionId,
                                transactionDate: postObj.transactionDate,
                                status: postObj.status,
                              })
                            );

                            if (
                              postObj.taxInvoice &&
                              postObj.taxInvoice.taxId &&
                              configuration.properties.HC_USE_SMALL_PRINTER ==
                                "false"
                            ) {
                              router.printHypercashDoc(
                                "PRINT_TAX_INVOICE",
                                postObj
                              );
                            }

                            fs.renameSync(
                              trxFNameVoid + ".tmp",
                              trxFNameVoid + ".txt"
                            );

                            // DELETE THE PREVIOUS FILE
                            //fs.renameSync(archiveTrxDir + '/T' + postObj.baseTransactionId + '.txt');
                          }
                        }
                      );
                    } else {
                      console.log(
                        "PSV Transaction has not been processed yet: " +
                          postObj.baseTransactionId
                      );
                      res.oldEnd(
                        JSON.stringify({
                          error: "Transaction has not been processed yet",
                        })
                      );
                    }
                  }
                );
              } else {
                res.oldEnd(
                  JSON.stringify({
                    transactionId: postObj.transactionId,
                    transactionDate: postObj.transactionDate,
                    status: postObj.status,
                  })
                );

                if (
                  postObj.taxInvoice &&
                  postObj.taxInvoice.taxId &&
                  configuration.properties.HC_USE_SMALL_PRINTER == "false"
                ) {
                  router.printHypercashDoc("PRINT_TAX_INVOICE", postObj);
                }
              }

              // CHECK IF THERE IS TOPUP, THEN HOLD THE RENAMING
              var topUpExists = false;
              var isTrx = 0,
                isVoided = 0;
              for (var ix in postObj.orderItems) {
                var itm = postObj.orderItems[ix];
                if (itm.categoryId == "TOPUP") {
                  if (itm.isVoided) isVoided++;
                  else isTrx++;
                }
              }

              if (
                isTrx > 0 &&
                isTrx > isVoided &&
                postObj.type == "SALE" &&
                postObj.status == "COMPLETED"
              )
                topUpExists = true;

              var indosmartExists = false;
              var isTrx = 0,
                isVoided = 0;
              for (var ix in postObj.orderItems) {
                var itm = postObj.orderItems[ix];
                if (itm.categoryId == "INDOSMART") {
                  if (itm.isVoided) isVoided++;
                  else isTrx++;
                }
              }

              var mCashExists = false;
              var isTrx = 0,
                isVoided = 0;
              for (var ix in postObj.orderItems) {
                var itm = postObj.orderItems[ix];
                if (itm.categoryId == "MCASH") {
                  if (itm.isVoided) isVoided++;
                  else isTrx++;
                }
              }

              if (
                isTrx > 0 &&
                isTrx > isVoided &&
                postObj.type == "SALE" &&
                postObj.status == "COMPLETED"
              )
                mCashExists = true;

              var alterraExists = false;
              var isTrx = 0,
                isVoided = 0;
              for (var ix in postObj.orderItems) {
                var itm = postObj.orderItems[ix];
                if (itm.categoryId == "ALTERRA") {
                  if (itm.isVoided) isVoided++;
                  else isTrx++;
                }
              }

              if (
                isTrx > 0 &&
                isTrx > isVoided &&
                postObj.type == "SALE" &&
                postObj.status == "COMPLETED"
              )
                alterraExists = true;

              if (
                !topUpExists &&
                !indosmartExists &&
                !mCashExists &&
                !alterraExists
              ) {
                fs.renameSync(trxFName + ".tmp", trxFName + ".txt");

                fs.exists(trxFName + ".save", function (exists) {
                  if (exists) fs.unlinkSync(trxFName + ".save");
                });
              } else
                console.log(
                  "Hold TRX " +
                    postObj.transactionId +
                    " save until Topup / Indosmart / MCash / Alterra Detail Saved"
                );
            }
          }
        );

        txnSaveData = "";
        session.lastTrxId = postObj.transactionId;

        fs.exists(
          trxDir + "/N" + postObj.transactionId + ".tmp",
          function (exists) {
            if (exists)
              fs.renameSync(
                trxDir + "/N" + postObj.transactionId + ".tmp",
                trxDir + "/N" + postObj.transactionId + ".txt"
              );
          }
        );

        savedTxns = [];
        //configuration.lastTxnSeqValue += 1;

        //fs.writeFileSync(tmpDir + '/.lasttrxval', configuration.lastTxnSeqValue);
        // REWRITING THE CONFIG
        //fs.writeFileSync(confDir + '/terminal.conf', JSON.stringify(configuration));
      } else {
        console.log("POST_DATA_EMPTY");
        res.oldWriteHead(200, headers);
        res.end(JSON.stringify({ error: "POST_DATA_EMPTY" }));
      }
    }
  }

  function getLocalMarketingAds(res) {
    fs.exists(tmpDir + "/.adsdata", function (exists) {
      if (exists) {
        var adsData = fs.readFileSync(tmpDir + "/.adsdata").toString();
        var adsRes = processMarketingAds(adsData);
        sendResponse(
          res,
          200,
          "OK",
          "application/json",
          JSON.stringify(adsRes)
        );
      } else {
        console.log("Marketing ads local file does not exist!");
        sendResponse(res, 200, "OK", "application/json;charset=UTF-8");
      }
    });
  }

  function localSaveTVSTransaction(res, headers) {
    if (
      tvsTrxList &&
      tvsTrxList.length > 0 &&
      tvsTrxData &&
      tvsTrxData.length > 0
    ) {
      var postObj = {};
      res.removeHeader("Content-Length");
      res.oldWriteHead(200, {
        Connection: "keep-alive",
        "Content-Type": "application/json;charset=UTF-8",
      });
      res.oldEnd = res.end;
      res.end = function (data) {};
      var tvsData = JSON.parse(tvsTrxData);
      postObj.transactionId = tvsData.txId;
      postObj.approverUserId = tvsData.approverUserId;
      postObj.tvsList = JSON.parse(tvsTrxList);

      if (postObj) {
        var trxFName = trxDir + "/V" + postObj.transactionId;
        fs.appendFile(
          trxFName + ".txt",
          JSON.stringify(postObj),
          function (err) {
            if (err) {
              console.log(
                "Transaction Write Error:",
                postObj.transactionId,
                err
              );
              res.oldEnd(JSON.stringify({ error: "TRX_WRITE_ERROR" }));
            } else {
              res.oldEnd(tvsTrxData);
              //fs.renameSync(trxFName + '.tmp', trxFName + '.txt');
            }
          }
        );
      }

      tvsTrxData = "";
      tvsTrxList = "";
    } else {
      console.log("POST_DATA_EMPTY");
      res.oldWriteHead(200, headers);
      res.end(JSON.stringify({ error: "POST_DATA_EMPTY" }));
    }
  }

  // 20150902 - LUCKY - Modify this save feedback to local file, to what file??
  function localSaveFeedback(res, headers) {
    if (custFeedbackData && custFeedbackData.length > 0) {
      res.removeHeader("Content-Length");
      res.oldWriteHead(200, {
        Connection: "keep-alive",
        "Content-Type": "application/json;charset=UTF-8",
      });
      res.oldEnd = res.end;
      res.end = function (data) {};
      var postObj = JSON.parse(custFeedbackData);
      postObj.transactionId = session.lastTrxId;
      console.log("TX|Customer Feedback " + JSON.stringify(postObj));

      if (postObj) {
        //var trxFName = trxDir + '/F' + postObj.transactionId;
        var trxFName = trxDir + "/F" + session.lastTrxId;
        fs.appendFile(
          trxFName + ".tmp",
          JSON.stringify(postObj),
          function (err) {
            if (err) {
              console.log(
                "Transaction Write Error:",
                postObj.transactionId,
                err
              );
              res.oldEnd(JSON.stringify({ error: "TRX_WRITE_ERROR" }));
            } else {
              res.oldEnd(JSON.stringify(custFeedbackData));
              fs.renameSync(trxFName + ".tmp", trxFName + ".txt");
            }
          }
        );
      }

      custFeedbackData = "";
    } else {
      console.log("POST_DATA_EMPTY");
      res.oldWriteHead(200, headers);
      res.end(JSON.stringify({ error: "POST_DATA_EMPTY" }));
    }
  }

  // 20150903 - LUCKY - Modify to read on the local USERS.DAT
  function localAuthUser(res, headers) {
    console.log("Local Authentication Request");
    if (authReqData && authReqData.length > 0) {
      res.removeHeader("Content-Length");
      res.oldWriteHead(200, {
        Connection: "keep-alive",
        "Content-Type": "application/json;charset=UTF-8",
      });
      res.oldEnd = res.end;
      res.end = function (data) {};
      var authReq = JSON.parse(authReqData);
      var authRes = {
        username: authReq.username,
        code: 0,
        msg: "OK",
      };

      if (authReq) {
        console.log("Authentication Request: " + JSON.stringify(authReq));
        if (!offsite && authReq.action == "LOGOUT") {
          console.log("AUTH:OFFLINE_LOGOUT_NOT_SUPPORTED");
          authRes.code = 5;
          authRes.msg = "SERVER OFFLINE.";
          res.oldEnd(
            JSON.stringify(authRes, { error: "INVALID_RESPONSE_DATA" })
          );
          authReqData = "";
        } else {
          var userAccount = userAccounts[authReq.username];

          if (userAccount || typeof userAccount != "undefined") {
            console.log("userAccount: " + JSON.stringify(userAccount));
            if ("pin" == authReq.authType) {
              var encPwd = crypto
                .createHash("sha256")
                .update(authReq.empCode)
                .digest("hex");
              //if(userAccount.password != encPwd)
              //{
              //authRes.code = 1;
              //authRes.msg = 'RE-ENTER PASSWORD.';

              if (userAccount["enabled"] == "N" && checkOnlineStat()) {
                authRes.code = 1;
                console.log("USER " + authReq.username + " is locked");
                //localUpdateUserData(userAccount, false, false);
                authRes.msg = "USER ACCOUNT HAS BEEN LOCKED.";
              } else if (userAccount["isActive"] == "N" && checkOnlineStat()) {
                authRes.code = 1;
                console.log("USER " + authReq.username + " is inactive");
                //localUpdateUserData(userAccount, false, false);
                authRes.msg = "USER ACCOUNT IS INACTIVE.";
              } else if (userAccount.password != encPwd) {
                authRes.code = 1;
                console.log(
                  "Wrong password: " + encPwd + " ori: " + userAccount.password
                );
                if (authReq.username != currentWrongAccount) {
                  currentWrongAccount = authReq.username;
                  currentWrongCounter = 0;
                }
                //currentWrongCounter++;

                if (
                  currentWrongCounter > 1 &&
                  currentWrongCounter < 3 &&
                  checkOnlineStat()
                ) {
                  authRes.msg =
                    "RE-ENTER PASSWORD. RETRY ATTEMPT " +
                    currentWrongCounter +
                    " OF 3";
                } else if (currentWrongCounter >= 3 && checkOnlineStat()) {
                  userAccount["enabled"] = "N";
                  //localUpdateUserData(userAccount, true, false);
                  currentWrongAccount = authReq.username;
                  currentWrongCounter = 0;
                  authRes.msg = "USER ACCOUNT HAS BEEN LOCKED.";
                } else authRes.msg = "RE-ENTER PASSWORD.";
              } else if (
                userAccount.roles.indexOf("ROLE_CASHIER_SALES") == -1 &&
                userAccount.roles.indexOf("ROLE_CUSTOMER_SERVICE") == -1
              )
                authRes.msg = "ACCOUNT IS NOT AUTHORIZED.";
              //}
            } else if ("barcode" == authReq.authType) {
              if (userAccount.barcode != authReq.empCode) {
                authRes.code = 2;
                authRes.msg = "Incorrect barcode entered.";
              }
            }

            if (authRes.code === 0 && authReq.roles) {
              var isAuthorized = false;
              var isSupvrAuthorized = false;
              var supervisorRoles = [
                "ROLE_CASHIER_CANCELLATION",
                "ROLE_SUPERVISOR",
              ];
              for (var i = 0; i < authReq.roles.length && !isAuthorized; i++) {
                for (var j = 0; j < userAccount.roles.length; j++) {
                  if (
                    authReq.roles[i] == userAccount.roles[j] ||
                    ("ROLE_SELF" == authReq.roles[i] &&
                      userAccount.userId == uid)
                  ) {
                    isAuthorized = true;
                    break;
                  }
                }
              }

              for (
                var i = 0;
                i < authReq.roles.length && isAuthorized; // If
                // authorized
                i++
              ) {
                for (var j = 0; j < userAccount.roles.length; j++) {
                  if (authReq.roles[i] == userAccount.roles[j]) {
                    authRes.supervisorInterventionRes = {
                      /*
                       * Hack to enable supervisor
                       * intervention while offline,
                       * needed for store/recall
                       * banner implementation(receipt
                       * printing).
                       *
                       * Instead of "UserId", it
                       * should be employee table's
                       * "employeeId".
                       */
                      supervisorNumber: userAccount.userId,
                      cashierNumber: uid,
                      dateTimeAuthorized: new Date(),
                    };
                    break;
                  }
                }
              }

              if (!isAuthorized) {
                authRes.code = 3;
                authRes.msg = "ACCOUNT IS NOT AUTHORIZED.";
              }
            }
          } else {
            console.log("USER NOT FOUND");
            authRes.code = 13;
            authRes.msg = "USER NOT FOUND";
          }
        }

        res.oldEnd(JSON.stringify(authRes, { error: "INVALID_RESPONSE_DATA" }));
        authReqData = "";
        if (authReq.action == "LOGOUT")
          userAccounts[authReq.username]["isLoggedIn"] = false;
      } else {
        console.log("AUTH:INVALID_REQUEST_DATA");
        authRes.code = 5;
        authRes.msg = "INVALID REQUEST DATA.";
        res.oldEnd(JSON.stringify(authRes, { error: "INVALID_RESPONSE_DATA" }));
        authReqData = "";
      }
    } else {
      console.log("AUTH:POST_DATA_EMPTY");
      res.oldWriteHead(200, headers);
      res.end(JSON.stringify({ error: "AUTH:POST_DATA_EMPTY" }));
    }
  }

  // 20150908 - LUCKY - Add this function to Reprint Last Receipt
  function localReprintReceipt(trxId) {
    /*res.removeHeader('Content-Length');
        res.oldWriteHead(200, {'Connection' : 'keep-alive', 'Content-Type': 'application/json;charset=UTF-8'});
        res.oldEnd = res.end;
        res.end = function(data) {};*/

    fs.readFile(archiveTrxDir + "T" + trxId + ".txt", function (data, err) {
      if (err) {
        console.log("Failed to read " + archiveTrxDir + "T" + trxId + ".txt");
        res.oldEnd(
          JSON.stringify({ error: "Transaction not found/not processed yet" })
        );
      } else {
        var trxData = JSON.parse(data);
        console.log("Reading the transaction data: " + JSON.stringify(trxData));
        sendResponse(res, 200, "OK", "text/plain", JSON.stringify(trxData));
      }
    });
  }

  // 20150901 - LUCKY - Change to check from loaded configuration
  function localSearchBankConfig(vendor, res) {
    vendor = decodeURIComponent(vendor);
    console.log("vendor: " + vendor);
    res.removeHeader("Content-Length");
    res.oldWriteHead(200, {
      Connection: "keep-alive",
      "Content-Type": "application/json;charset=UTF-8",
    });
    res.oldEnd = res.end;
    res.end = function (data) {};
    //console.log(JSON.stringify(configuration[vendor]));
    res.oldEnd(JSON.stringify(configuration[vendor]));
  }

  // 20150901 - LUCKY - Change to check from loaded configuration
  function localSearchInstallmentCompany(icBarcode, res) {
    res.removeHeader("Content-Length");
    res.oldWriteHead(200, {
      Connection: "keep-alive",
      "Content-Type": "application/json;charset=UTF-8",
    });
    res.oldEnd = res.end;
    res.end = function (data) {};

    res.oldEnd(JSON.stringify(configuration["installment"][icBarcode]));
  }

  // 20150901 - LUCKY - Change to check from loaded configuration
  // I DON'T HAVE IDEA SINCE ON THE LEVELDB THERE IS NO DATA WITH PREFIX C-
  function localSearchEnumerationType(enumType, res) {
    res.removeHeader("Content-Length");
    res.oldWriteHead(200, {
      Connection: "keep-alive",
      "Content-Type": "application/json;charset=UTF-8",
    });
    res.oldEnd = res.end;
    res.end = function (data) {};
    res.oldEnd(JSON.stringify({ error: "CONFIG_GET_ERROR" }));
  }

  // 20150907 - LUCKY - Modify to read from /archive/trx/TXXX.txt
  function localSearchTxn(txnId, status, res) {
    res.removeHeader("Content-Length");
    res.oldWriteHead(200, {
      Connection: "keep-alive",
      "Content-Type": "application/json;charset=UTF-8",
    });
    res.oldEnd = res.end;
    res.end = function (data) {};

    var farchname = archiveTrxDir + "/T" + txnId + ".txt";
    var ftrxname = trxDir + "/T" + txnId + ".txt";
    var fname = "";
    if (fs.existsSync(farchname)) fname = farchname;
    else if (fs.existsSync(ftrxname)) fname = ftrxname;

    var trxValid = true;

    if (status.indexOf("salesDateAgo") == 0) {
      var options = {
        host: config.store.url,
        port: config.store.port,
        path: "/pos-web/cashier/checkTxn/" + txnId,
      };

      var request = http.get(options, function (rs) {
        var resdata = "";

        rs.on("data", function (chunk) {
          resdata += chunk;
        });

        rs.on("end", function () {
          console.log("TRX VALID: " + resdata.trim());
          trxValid = resdata.trim() == "true";

          if (trxValid && fname != "") {
            var txn = JSON.parse(fs.readFileSync(fname).toString());
            if (
              status != "VOIDED" &&
              (txn.type == "VOID" || txn.status == "VOIDED")
            ) {
              console.log("Searched transaction is voided");
              res.oldEnd(JSON.stringify({ error: "TXDB_GET_ERROR" }));
            } else {
              console.log("Returning transction: " + txnId);
              res.oldEnd(JSON.stringify(txn, { error: "TXDB_GET_ERROR" }));
            }
          } else {
            console.log("TXDB_GET_ERROR:", txnId);
            res.oldEnd(JSON.stringify({ error: "TXDB_GET_ERROR" }));
          }
        });
      });

      request.on("error", function (err) {
        console.log("Failed to check transaction from POSSTORE");
      });
    } else {
      if (trxValid && fname != "") {
        var txn = JSON.parse(fs.readFileSync(fname).toString());
        if (
          status != "VOIDED" &&
          (txn.type == "VOID" || txn.status == "VOIDED")
        ) {
          console.log("Searched transaction is voided");
          res.oldEnd(JSON.stringify({ error: "TXDB_GET_ERROR" }));
        } else {
          console.log("Returning transction: " + txnId);
          res.oldEnd(JSON.stringify(txn, { error: "TXDB_GET_ERROR" }));
        }
      } else {
        console.log("TXDB_GET_ERROR:", txnId);
        res.oldEnd(JSON.stringify({ error: "TXDB_GET_ERROR" }));
      }
    }
  }

  // 20150910 - LUCKY - Modify Save Top Up transaction on local file
  function localSaveTopUpTxn(txnId, res, headers) {
    if (txnId && txnSaveData && txnSaveData.length > 0) {
      res.removeHeader("Content-Length");
      res.oldEnd = res.end;
      res.end = function (data) {};
      var postObj = JSON.parse(txnSaveData);
      //console.log("function localSaveTopUpTxn :" + JSON.stringify(postObj));
      if (postObj) {
        console.log("Processing Topup Transaction Details: " + txnId);
        // if(fs.existsSync(trxDir + '/T' + txnId + '.tmp'))
        // {
        // fs.writeFile(trxDir + '/T' + txnId + '.tmp', JSON.stringify(postObj)),
        // function(err){}
        // var trxObj = JSON.parse(fs.readFileSync(trxDir + '/T' + txnId + '.tmp'));
        // trxObj['topupTransactionDetails'] = postObj;

        var trxFName = trxDir + "/T" + txnId;
        fs.writeFile(
          trxFName + ".tmp",
          JSON.stringify(postObj),
          function (err) {
            if (err) {
              console.log("Topup Transaction Write Error:", txnId, err);
              res.oldWriteHead(500);
            } else {
              fs.renameSync(trxFName + ".tmp", trxFName + ".txt");
              if (fs.existsSync(trxFName + ".save"))
                fs.unlinkSync(trxFName + ".save");
              console.log("Topup Transaction Processing Done " + txnId);
              res.oldWriteHead(200);
              res.oldEnd();
            }
          }
        );
        // }
        // else
        // {
        // console.log("Topup Transaction Inquiry Processing Done " + txnId);
        // res.oldWriteHead(200);
        // res.oldEnd();
        // }
      }
      txnSaveData = "";
    } else {
      console.log("POST_DATA_EMPTY");
      res.oldWriteHead(500, headers);
      res.end();
    }
  }

  function localSaveIndosmartTxn(txnId, res, headers) {
    if (txnId && txnSaveData && txnSaveData.length > 0) {
      res.removeHeader("Content-Length");
      res.oldEnd = res.end;
      res.end = function (data) {};
      var postObj = JSON.parse(txnSaveData);
      if (postObj) {
        console.log("Processing Indosmart Transaction Details: " + txnId);
        var trxFName = trxDir + "/T" + txnId;
        fs.writeFile(
          trxFName + ".tmp",
          JSON.stringify(postObj),
          function (err) {
            if (err) {
              console.log("Indosmart Transaction Write Error:", txnId, err);
              res.oldWriteHead(500);
            } else {
              fs.renameSync(trxFName + ".tmp", trxFName + ".txt");
              if (fs.existsSync(trxFName + ".save"))
                fs.unlinkSync(trxFName + ".save");
              console.log("Indosmart Transaction Processing Done " + txnId);
              res.oldWriteHead(200);
              res.oldEnd();
            }
          }
        );
        // }
        // else
        // {
        // console.log("Topup Transaction Inquiry Processing Done " + txnId);
        // res.oldWriteHead(200);
        // res.oldEnd();
        // }
      }
      txnSaveData = "";
    } else {
      console.log("POST_DATA_EMPTY");
      res.oldWriteHead(500, headers);
      res.end();
    }
  }

  function localSaveMCashTxn(txnId, res, headers) {
    if (txnId && txnSaveData && txnSaveData.length > 0) {
      res.removeHeader("Content-Length");
      res.oldEnd = res.end;
      res.end = function (data) {};
      var postObj = JSON.parse(txnSaveData);
      if (postObj) {
        console.log("Processing MCash Transaction Details: " + txnId);
        var trxFName = trxDir + "/T" + txnId;
        fs.writeFile(
          trxFName + ".tmp",
          JSON.stringify(postObj),
          function (err) {
            if (err) {
              console.log("MCash Transaction Write Error:", txnId, err);
              res.oldWriteHead(500);
            } else {
              fs.renameSync(trxFName + ".tmp", trxFName + ".txt");
              if (fs.existsSync(trxFName + ".save"))
                fs.unlinkSync(trxFName + ".save");
              console.log("MCash Transaction Processing Done " + txnId);
              res.oldWriteHead(200);
              res.oldEnd();
            }
          }
        );
        // }
        // else
        // {
        // console.log("Topup Transaction Inquiry Processing Done " + txnId);
        // res.oldWriteHead(200);
        // res.oldEnd();
        // }
      }
      txnSaveData = "";
    } else {
      console.log("POST_DATA_EMPTY");
      res.oldWriteHead(500, headers);
      res.end();
    }
  }

  function localSaveAlterraTxn(txnId, res, headers) {
    if (txnId && txnSaveData && txnSaveData.length > 0) {
      res.removeHeader("Content-Length");
      res.oldEnd = res.end;
      res.end = function (data) {};
      var postObj = JSON.parse(txnSaveData);
      if (postObj) {
        console.log("Processing Alterra Transaction Details: " + txnId);
        var trxFName = trxDir + "/T" + txnId;
        fs.writeFile(
          trxFName + ".tmp",
          JSON.stringify(postObj),
          function (err) {
            if (err) {
              console.log("Alterra Transaction Write Error:", txnId, err);
              res.oldWriteHead(500);
            } else {
              fs.renameSync(trxFName + ".tmp", trxFName + ".txt");
              if (fs.existsSync(trxFName + ".save"))
                fs.unlinkSync(trxFName + ".save");
              console.log("Alterra Transaction Processing Done " + txnId);
              res.oldWriteHead(200);
              res.oldEnd();
            }
          }
        );
        // }
        // else
        // {
        // console.log("Topup Transaction Inquiry Processing Done " + txnId);
        // res.oldWriteHead(200);
        // res.oldEnd();
        // }
      }
      txnSaveData = "";
    } else {
      console.log("POST_DATA_EMPTY");
      res.oldWriteHead(500, headers);
      res.end();
    }
  }

  // 20150903 - LUCKY - Modify to write on /trx/TXXXXX.tmp files
  function storeTxn(res, txnObj) {
    var trxFName = trxDir + "/T" + txnObj.transactionId;
    fs.appendFile(trxFName + ".hld", JSON.stringify(txnObj), function (err) {
      if (err) {
        console.log("Transaction Write Error:", postObj.transactionId, err);
        res.oldEnd(JSON.stringify({ error: "TRX_WRITE_ERROR" }));
      } else {
        fs.exists(
          trxDir + "/T" + txnObj.transactionId + ".save",
          function (exists) {
            if (exists) {
              console.log("Remove .save file " + txnObj.transactionId);
              fs.unlinkSync(trxDir + "/T" + txnObj.transactionId + ".save");
            }
          }
        );

        sendResponse(
          res,
          200,
          "OK",
          "text/plain",
          JSON.stringify(txnObj.transactionId)
        );
      }
    });
  }

  function saveTxn(res, txnObj) {
    var trxFName = trxDir + "/T" + txnObj.transactionId;
    fs.writeFile(trxFName + ".save", JSON.stringify(txnObj), function (err) {
      if (err) {
        console.log("Transaction Save Error:", postObj.transactionId, err);
        res.oldEnd(JSON.stringify({ error: "TRX_WRITE_ERROR" }));
      } else {
        sendResponse(
          res,
          200,
          "OK",
          "text/plain",
          JSON.stringify(txnObj.transactionId)
        );
        //console.log("Stored transaction: " + JSON.stringify(txnObj));
      }
    });
  }

  function processMarketingAds(adsData) {
    var adsRes = {};
    try {
      var adsArr = JSON.parse(adsData);
      console.log("Processing Ads Data: " + adsData);

      var adsArrRes = {};
      for (i in adsArr) {
        var ads = adsArr[i];
        if (!(ads.type in adsArrRes)) adsArrRes[ads.type] = [];
        adsArrRes[ads.type].push(ads);
        loadAdsFromStore(ads);
      }
      adsRes["model"] = configuration.terminalModel;
      adsRes["ads"] = adsArrRes;
    } catch (e) {
      console.log("Failed to parse ads data (" + e + ")");
    }
    return adsRes;
  }

  function loadAdsFromStore(ads) {
    // CHECK IF FILE ALREADY EXIST
    fs.exists(
      resourcesDir + "images/uploads/marketing/" + ads.id,
      function (exist) {
        if (exist) {
          console.log("Ads " + ads.id + " has already exists");
          return;
        }

        // GET FROM POS-WEB FIRST
        var options = {
          host: config.store.url,
          port: config.store.port,
          path: "/uploads/images/marketing/" + ads.id,
        };

        var request = http.get(options, function (res) {
          var imagedata = "";
          res.setEncoding("binary");

          res.on("data", function (chunk) {
            imagedata += chunk;
          });

          res.on("end", function () {
            fs.writeFile(
              resourcesDir + "images/uploads/marketing/" + ads.id,
              imagedata,
              "binary",
              function (err) {
                if (err) throw err;
                console.log("Ads " + ads.id + " pic file saved.");
              }
            );
          });
        });

        request.on("error", function (err) {
          console.log(
            "Failed to get pictures from POSSTORE, attempt to load from local file (" +
              err +
              ")"
          );
        });
      }
    );
  }
  /***************************************************************************
   * SocketIO/Websocket Concept to render on HTMl
   **************************************************************************/
  function openClientSocket() {
    var socketio = require("socket.io");
    // listen for new socket.io connections:
    var clientio = socketio.listen(server, {
      log: false,
    });

    clientio.sockets.setMaxListeners(MAX_SOCKETS);

    clientio.sockets.on("connection", function (socket) {
      clientConnect(socket);
      clientio.emit("configData", JSON.stringify(configuration));
      if (offsite) {
        clientio.sockets.emit("uname", uname);
        clientio.sockets.emit("uroles", uroles);
      }
      // configPoll.startPolling();
    });

    function clientConnect(socket) {
      console.log("connection established");
      clientio.sockets.emit("connStatus", online);
      if (serverStatusPoller) {
        serverStatusPoller.startPolling(10000);
      }
      // disconnect
      socket.on("disconnect", function () {
        clientDisconnect(socket);
      });
      // connection fails
      socket.on("connect_failed", function () {
        console.log("connect_failed socketio");
        delete socket;
      });
      // connection error
      socket.on("error", function () {
        console.log("error socketio");
        delete socket;
      });
      socket.on("reconnect_failed", function () {
        console.log("reconnect_failed");
        delete socket;
      });
      // hotfix-3-02-2014
    }

    function clientDisconnect(socket) {
      console.log("connection terminated");
      if (serverStatusPoller) {
        serverStatusPoller.stopPolling();
      }
      delete socket; // hotfix-3-02-2014
    }
    return clientio;
  }

  /***************************************************************************
   * HTTP Request ; Using APP framework of nodejs
   **************************************************************************/
  // home
  app.get("/", router.home);
  

  // 20150908 - LUCKY - Add functionality to check ejournal too
  app.get(
    config.posServer.ctxPath + "/cashier/createOrder",
    function (req, res) {
      if (reloadStat) {
        loadProducts();
        loadPromo();
        loadHotspice();
        loadUsers()
        loadEventRewards();
        reloadStat = false;

        refreshVersion();
      }

      //UPDATE WITH UPC_PRODUCT
      function updateUPCdataProd() {
        fs.exists(txtDir + "/UPC_PRODUCT.DAT", function (exists) {
          if (exists) {
            console.log("Attempting to get Product Updates");
            var productDiff = fs
              .readFileSync(txtDir + "/UPC_PRODUCT.DAT")
              .toString()
              .split("\n");
            for (i in productDiff) {
              var prodArr = productDiff[i].split(",");
              var barcode = prodArr[1];
              if (productList.hasOwnProperty(barcode)) {
                productList[barcode] = prodArr;
              }
            }
            console.log("UPDATE UPC PRODUCT BERHASIL");
          }
        });
      }

      //UPDATE WITH UPC_PROMO
      function updateUPCdataPromo() {
        fs.exists(txtDir + "/UPC_PROMO.DAT", function (exists) {
          if (exists) {
            console.log("Attempting to get Promo Updates");
            var promoDiff = fs
              .readFileSync(txtDir + "/UPC_PROMO.DAT")
              .toString()
              .split("\n");
            for (i in promoDiff) {
              var promoArr = promoDiff[i].split(",");
              // console.log("CUY " + promoArr[9])
              var barcode = promoArr[9];
              if (promoList.hasOwnProperty(barcode)) {
                promoList[barcode] = promoDiff[i];
              }
            }
            console.log("UPDATE UPC PROMO BERHASIL");
          }
        });
      }
      
      //CHECK DATE OF THE UPC FILES
      checkDateUPCprod();
      checkDateUPCpromo();

      //CHECK DATE UPC PRODUCT
      function checkDateUPCprod() {
        var sshCmdcheckProd = 'ssh';
        var sshArgsCheckProd = [
          '-p', '5376', // Use -p to specify the SSH port
          'equstor@storehost',
          'stat -c %Y /equnix/data/UPC_PRODUCT.DAT'
        ];
      
        runUnixCommand(sshCmdcheckProd, sshArgsCheckProd, function (result) {
          if (result.error) {
            console.error("TIDAK ADA UPC PRODUCT DI POSWEB");
          } else {
            const output = result.data.trim();
            const modifiedTimestamp = parseInt(output);
            const currentDate = new Date(); // Menggunakan konstruktor Date tanpa argumen untuk mendapatkan waktu saat ini
              
            if (!isNaN(modifiedTimestamp)) {
              const modifiedDate = new Date(modifiedTimestamp * 1000); // Convert seconds to milliseconds
              const midnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0); // Set jam menjadi 00:00:00
              
              if (modifiedDate >= midnight) {
                console.log('File modified today');
                checkVersionUPCprod();
              } else if (modifiedDate >= new Date(midnight - 86400000)) {
                console.log('File UPC product modified yesterday');
              } else {
                console.log('File UPC product is not from today or yesterday');
              }
            } else {
              console.error('Failed to retrieve file modification date');
            }
          }
        });    
      }
       
      //CHECK DATE UPC PROMO
      function checkDateUPCpromo() {
        var sshCmdcheckPromo = 'ssh';
        var sshArgsCheckPromo = [
          '-p', '5376', // Use -p to specify the SSH port
          'equstor@storehost',
          'stat -c %Y /equnix/data/UPC_PROMO.DAT'
        ];
      
        runUnixCommand(sshCmdcheckPromo, sshArgsCheckPromo, function (result) {
          if (result.error) {
            console.error("TIDAK ADA UPC PROMO DI POSWEB");
          } else {
            const output = result.data.trim();
            const modifiedTimestamp = parseInt(output);
            const currentDate = new Date(); // Menggunakan konstruktor Date tanpa argumen untuk mendapatkan waktu saat ini
              
            if (!isNaN(modifiedTimestamp)) {
              const modifiedDate = new Date(modifiedTimestamp * 1000); // Convert seconds to milliseconds
              const midnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0); // Set jam menjadi 00:00:00
              
              if (modifiedDate >= midnight) {
                console.log('File UPC Promo modified today');
                checkVersionUPCpromo();
              } else if (modifiedDate >= new Date(midnight - 86400000)) {
                console.log('File UPC promo modified yesterday');
              } else {
                console.log('File UPC promo is not from today or yesterday');
              }
            } else {
              console.error('Failed to retrieve file modification date');
            }
          }
        });    
      }
      
      //CHECK VERSION UPC PRODUCT
      function checkVersionUPCprod() {
        var sshCmdProd = 'ssh';
        var md5ChecksumProd;
        var oldUPCprodVer;
        var sshArgsProd = [
          '-p', '5376', // Use -p to specify the SSH port
          'equstor@storehost',
          'md5sum /equnix/data/UPC_PRODUCT.DAT'
        ];
        
        runUnixCommand(sshCmdProd, sshArgsProd, function (result) {
          if (result.data) {
            md5ChecksumProd = result.data.substring(0, 32);
            console.log("UPC PRODUCT VERSION POSWEB ", md5ChecksumProd);

            fs.exists(txtDir + "/UPC_PRODUCT.DAT", function (exists) {
              if (exists) {
                runUnixCommand('md5sum', ['/equnix/data/UPC_PRODUCT.DAT'], function(data) {
                  oldUPCprodVer = data.data.substring(0, 32);
                  console.log("UPC PRODUCT VERSION TERMINAL " + oldUPCprodVer);
                  
                  // Compare the checksums only when both are available
                  if (md5ChecksumProd != oldUPCprodVer) {
                    downloadUPCproduct();
                  } else if (md5ChecksumProd === oldUPCprodVer) {
                    console.log("UPC PRODUCT SAMA")
                    updateUPCdataProd();
                  }
                });
              } else {
                console.log("TIDAK ADA UPC PRODUCT DI POS TERMINAL");
                downloadUPCproduct();
              }
            });
          } else if (result.error) {
            console.error("TIDAK ADA UPC PRODUCT DI POSWEB");
          }
        });
      }      
    
      //CHECK VERSION UPC PROMO
      function checkVersionUPCpromo() {
        var sshCmdPromo = 'ssh';
        var md5ChecksumPromo;
        var oldUPCpromoVer;
        var sshArgsPromo = [
          '-p', '5376', // Use -p to specify the SSH port
          'equstor@storehost',
          'md5sum /equnix/data/UPC_PROMO.DAT'
        ];
        
        runUnixCommand(sshCmdPromo, sshArgsPromo, function (result) {
          if (result.data) {
            md5ChecksumPromo = result.data.substring(0, 32);
            console.log("UPC PROMO VERSION POSWEB ", md5ChecksumPromo);
      
            fs.exists(txtDir + "/UPC_PROMO.DAT", function (exists) {
              if (exists) {
                runUnixCommand('md5sum', ['/equnix/data/UPC_PROMO.DAT'], function(data) {
                  oldUPCpromoVer = data.data.substring(0, 32);
                  console.log("UPC PROMO VERSION TERMINAL " + oldUPCpromoVer);                  
                  if (md5ChecksumPromo != oldUPCpromoVer) {
                    downloadUPCpromo();
                  } else if (md5ChecksumPromo === oldUPCpromoVer) {
                    console.log("UPC PROMO SAMA")
                    updateUPCdataPromo();
                  }
                });
              } else {
                console.log("TIDAK ADA UPC PROMO DI POS TERMINAL");
                downloadUPCpromo();
              }
            });
          } else if (result.error) {
            console.error("TIDAK ADA UPC PROMO DI POSWEB");
          }
        });
      }      

      //DOWNLOAD UPC PRODUCT FROM POSWEB
      function downloadUPCproduct() {
        runUnixCommand('scp', ['-P', '5376', 'equstor@storehost:/equnix/data/UPC_PRODUCT.DAT', '/equnix/data/']);
        updateUPCdataProd();
      }
  
      //DOWNLOAD UPC PROMO FROM POSWEB
      function downloadUPCpromo() {
        runUnixCommand('scp', ['-P', '5376', 'equstor@storehost:/equnix/data/UPC_PROMO.DAT', '/equnix/data/']);
        updateUPCdataPromo();
      }
    
      if (shutFlag) {
        console.log("POSSNODE is shutting down");
        process.exit(3);
      }
            

      isEnabledAgainEmotor = true;
      var onlinestat = fs.existsSync(tmpDir + "/.onlinestat");
      if (onlinestat) {
        //console.log('There is .onlinestat file, checking online status');
        var online = fs.readFileSync(tmpDir + "/.onlinestat");
        console.log("OFFLINE LOGIN? " + offlineLogin);
        if (offlineLogin && online == 1) {
          var data = { relogin: true };
          sendResponse(
            res,
            200,
            "OK",
            "application/json;charset=UTF-8",
            JSON.stringify(data)
          );
          return;
        }
      }

      if (!sid) {
        console.log("NULL_POS_SESSION");
        var resObj = { error: "NULL_POS_SESSION" };
        sendResponse(
          res,
          200,
          "OK",
          "application/json;charset=UTF-8",
          JSON.stringify(resObj)
        );
      } else {
        // CHECK THE .SAVE FILE FIRST
        //var savedTxns = [];

        //fs.readdir(trxDir + '/',
        //	function (err, files)
        //	{
        //		if(err) console.log("ERR READDIR " + JSON.stringify(err));
        //		else
        //		{
        //			var saveRgx = /^T([0-9]+)\.save/;

        //			for (var f in files)
        //			{
        //				var tmpFiles = saveRgx.exec(files[f]);
        //				if(tmpFiles) savedTxns.push(tmpFiles[0]);
        //			}

        // IF THERE IS .save FILE, THEN DO THE RECALL
        if (savedTxns.length > 0) {
          console.log(
            "There are some pending transactions " + JSON.stringify(savedTxns)
          );
          var data = { savedTrxId: savedTxns[savedTxns.length - 1] };
          sendResponse(
            res,
            200,
            "OK",
            "application/json;charset=UTF-8",
            JSON.stringify(data)
          );

          /*fs.readFile(trxDir + '/' + savedTxns[0],
                    	function (err, data)
                    	{
                    		if(err)	console.log("Failed to read saved trx file");
                    		else 
                    	}
                    );*/

          return;
        }

        genTxNumber(function (data) {
          if (data.error) {
            console.log(JSON.stringify(data.error));
            sendResponse(
              res,
              200,
              "OK",
              "application/json;charset=UTF-8",
              JSON.stringify(data)
            );
          } else {
            var posOrder = {
              type: "SALE",
              posTerminalId: configuration.terminalId,
              storeCd: configuration.storeCode,
              posSession: { posSessionId: sid, userId: uid },
              userId: uid,
              userName: uname,
              transactionId: data,
              trialMode: "trial" == req.query.mode,
              status: null,
              totalQuantity: 0,
              totalAmount: 0,
              customerId: null,
              totalAmountPaid: 0,
              totalChange: 0,
              orderItems: [],
            };

            session.currentTrxId = data;
            sendResponse(
              res,
              200,
              "OK",
              "application/json;charset=UTF-8",
              JSON.stringify(posOrder)
            );
          }

          // 20150904 - LUCKY - Move ejournal files to /trx folder
          fs.readFile(resourcesDir + "ej_log", function (err, data) {
            if (err) console.log("Failed to rename ejournal file");
            else {
              if (data == "") return false;

              var ejlines = data.toString().split("\n");
              var trxId = "";
              var rgx = /TR\:\s*([0-9|a-z|A-Z]{1,})/;
              var rgxD = /DIGITAL RECEIPT/;
              var rgxSt = /STORED SALE/;
              var isDigitalReceipt = "N";
              var isStoredSale = "N";

              for (var i in ejlines) {
                var rgxLine = rgx.exec(ejlines[i]);
                var rgxLineD = rgxD.exec(ejlines[i]);
                var rgxLineSt = rgxSt.exec(ejlines[i]);
                if (rgxLine != null) trxId = rgxLine[1];
                if (rgxLineSt != null) isStoredSale = "Y";
                if (rgxLineD != null) isDigitalReceipt = "Y";
              }
              if (isStoredSale == "Y") isDigitalReceipt = "N";
              console.log("EJOURNAL TRX ID: " + trxId);
              console.log("EJOURNAL isStoredSale: " + isStoredSale);
              console.log("EJOURNAL isDigitalReceipt: " + isDigitalReceipt);

              if (
                typeof trxId != "undefined" &&
                trxId != "" &&
                trxId != "N" &&
                trxId.length > 16
              ) {
                var ejFileName = "";
                if (isDigitalReceipt == "Y") {
                  ejFileName = trxDir + "/E" + trxId + "_DR.txt";
                } else {
                  ejFileName = trxDir + "/E" + trxId + ".txt";
                }
                console.log("ejFileName: " + ejFileName);
                fs.writeFile(ejFileName, data, function (err) {
                  if (err)
                    console.log("Failed to rename ejournal file (write)");
                  else fs.truncate(resourcesDir + "ej_log", 0);
                });
              }
            }
          });
        });
        //		}
        //	}
        //);
      }
    }
  );

  app.get("/getMac", function (req, res) {
    sendResponse(
      res,
      200,
      "OK",
      "application/json;charset=UTF-8",
      JSON.stringify(configuration.macAddress)
    );
  });

  // app.get("/getPromo", function (req, res) {
  //   sendResponse(
  //     res,
  //     200,
  //     "OK",
  //     "application/json;charset=UTF-8",
  //     JSON.stringify(prod)
  //   );
  // });

  app.get("/txnKey", function (req, res) {
    if (!configuration.terminalId) {
      console.log("TERMINAL_ID_NULL");
      sendResponse(
        res,
        200,
        "OK",
        "application/json;charset=UTF-8",
        JSON.stringify({ error: "TERMINAL_ID_NULL" })
      );
    } else {
      genTxNumber(function (data) {
        if (data.error) {
          sendResponse(
            res,
            200,
            "OK",
            "application/json;charset=UTF-8",
            JSON.stringify(data.error)
          );
        } else {
          var txnKey = {
            txnId: data,
          };
          sendResponse(
            res,
            200,
            "OK",
            "application/json;charset=UTF-8",
            JSON.stringify(txnKey)
          );
        }
      });
    }
  });

  app.get("/txnData", function (req, res) {
    if (!configuration.terminalId) {
      console.log("TERMINAL_ID_NULL");
      sendResponse(
        res,
        200,
        "OK",
        "application/json;charset=UTF-8",
        JSON.stringify({ error: "TERMINAL_ID_NULL" })
      );
    } else {
      genTxNumber(function (data) {
        if (data.error) {
          sendResponse(
            res,
            200,
            "OK",
            "application/json;charset=UTF-8",
            JSON.stringify(data.error)
          );
        } else {
          var txnData = {
            txnId: data,
            // commented due to #79948
            // txnDate: new Date(),
            tid: configuration.terminalId,
            stcd: configuration.storeCode,
            sid: sid,
            uid: uid,
          };
          sendResponse(
            res,
            200,
            "OK",
            "application/json;charset=UTF-8",
            JSON.stringify(txnData)
          );
        }
      });
    }
  });

  app.post("/saveTxn", function (req, res) {
    var txnData = "";
    req.on("data", function (chunk) {
      txnData += chunk;
    });
    req.on("end", function (chunk) {
      if (chunk) txnData += chunk;
      var txnObj = JSON.parse(txnData);
      if (txnObj) {
        if (!configuration.terminalId) {
          console.log("TERMINAL_ID_NULL");
          sendResponse(
            res,
            200,
            "OK",
            "application/json;charset=UTF-8",
            JSON.stringify({ error: "TERMINAL_ID_NULL" })
          );
        } else {
          if (txnObj.transactionId) saveTxn(res, txnObj);
          else {
            genTxNumber(function (data) {
              if (data.error) {
                sendResponse(
                  res,
                  200,
                  "OK",
                  "application/json;charset=UTF-8",
                  JSON.stringify(data.error)
                );
              } else {
                txnObj.transactionId = data;
                saveTxn(res, txnObj);
              }
            });
          }
        }
      } else {
        console.log("REQ_POST_ERROR");
        sendResponse(
          res,
          200,
          "OK",
          "application/json;charset=UTF-8",
          JSON.stringify({ error: "EMPTY_POST_DATA" })
        );
      }
    });
  });

  // app.get('/checkReturnExist',
  // 	async function(req, res){
  // 		var txnId = req.query.txnId;
  // 		var storeCd = req.query.storeCd;

  // 		var {Pool} = require('pg');
  // 		var pool = new Pool({
  // 			user: 'pgsql',
  // 			host: config.store.url,
  // 			port: 5555,
  // 			database: storeCd,
  // 			password: 'Pg5ql'
  // 		});

  // 		var test = pool.query("select * from pos_transaction p where p.type like '%RETURN%'");
  // 		await pool.end();
  // 		sendResponse(res, 200, 'OK', 'application/json;charset=UTF-8', JSON.stringify(test));
  // 	}
  // )

  app.post("/storeTxn", function (req, res) {
    var txnData = "";
    req.on("data", function (chunk) {
      txnData += chunk;
    });
    req.on("end", function (chunk) {
      if (chunk) txnData += chunk;
      var txnObj = JSON.parse(txnData);
      if (txnObj) {
        if (!configuration.terminalId) {
          console.log("TERMINAL_ID_NULL");
          sendResponse(
            res,
            200,
            "OK",
            "application/json;charset=UTF-8",
            JSON.stringify({ error: "TERMINAL_ID_NULL" })
          );
        } else {
          if (txnObj.transactionId) {
            storeTxn(res, txnObj);
          } else {
            genTxNumber(function (data) {
              if (data.error) {
                sendResponse(
                  res,
                  200,
                  "OK",
                  "application/json;charset=UTF-8",
                  JSON.stringify(data.error)
                );
              } else {
                txnObj.transactionId = data;
                storeTxn(res, txnObj);
              }
            });
          }
        }
      } else {
        console.log("REQ_POST_ERROR");
        sendResponse(
          res,
          200,
          "OK",
          "application/json;charset=UTF-8",
          JSON.stringify({ error: "EMPTY_POST_DATA" })
        );
      }
    });
  });

  // 20150902 - LUCKY - Modify to read from /trx/XXX.tmp
  app.get("/recallTxn", function (req, res) {
    var txnId = req.query.txnId;
    var trialMode = "trial" == req.query.mode;
    var find = req.query.method && req.query.method == "FIND";

    if (txnId) {
      fs.exists(trxDir + "/T" + txnId + ".hld", function (exists) {
        if (exists) {
          console.log("Attempting to recall transaction: " + txnId);
          var trxDet = fs
            .readFileSync(trxDir + "/T" + txnId + ".hld")
            .toString();

          if (!find) {
            console.log("Delete transaction: " + txnId);
            fs.unlinkSync(trxDir + "/T" + txnId + ".hld");
            configuration.lastTrxSeqValue -= 1;
          }

          res.removeHeader("Content-Length");
          res.setHeader("Connection", "keep-alive");
          res.setHeader("Content-Type", "application/json;charset=UTF-8");
          sendResponse(
            res,
            200,
            "OK",
            "application/json;charset=UTF-8",
            JSON.stringify(JSON.parse(trxDet), { error: "TX_READ_ERROR" })
          );
        } else {
          fs.exists(archiveTrxDir + "/T" + txnId + ".hld", function (exists) {
            if (exists) {
              console.log("Attempting to recall transaction: " + txnId);
              var trxDet = fs
                .readFileSync(archiveTrxDir + "/T" + txnId + ".hld")
                .toString();

              if (!find) {
                console.log("Delete transaction: " + txnId);
                fs.unlinkSync(archiveTrxDir + "/T" + txnId + ".hld");
                configuration.lastTrxSeqValue -= 1;
              }

              res.removeHeader("Content-Length");
              res.setHeader("Connection", "keep-alive");
              res.setHeader("Content-Type", "application/json;charset=UTF-8");
              sendResponse(
                res,
                200,
                "OK",
                "application/json;charset=UTF-8",
                JSON.stringify(JSON.parse(trxDet), { error: "TX_READ_ERROR" })
              );
            } else {
              console.log("TX_READ_ERROR:", txnId);
              sendResponse(
                res,
                200,
                "OK",
                "application/json;charset=UTF-8",
                null
              );
            }
          });
        }
      });
    } else {
      console.log("REQ_GET_ERROR");
      res.end(JSON.stringify({ error: "EMPTY_TX_ID" }));
    }
  });

  app.get("/recallSavedTxn", function (req, res) {
    var txnId = req.query.txnId;
    var trialMode = "trial" == req.query.mode;
    var find = req.query.method && req.query.method == "FIND";

    if (txnId) {
      fs.exists(trxDir + "/T" + txnId + ".save", function (exists) {
        if (exists) {
          console.log("Attempting to recall transaction: " + txnId);
          var trxDet = fs
            .readFileSync(trxDir + "/T" + txnId + ".save")
            .toString();

          res.removeHeader("Content-Length");
          res.setHeader("Connection", "keep-alive");
          res.setHeader("Content-Type", "application/json;charset=UTF-8");

          // CHECK THE LOGGED IN USER
          var trxData = "";
          try {
            trxData = JSON.parse(trxDet);
          } catch (e) {
            console.log("Failed to read .save file");
            sendResponse(
              res,
              200,
              "OK",
              "application/json;charset=UTF-8",
              JSON.stringify({
                error:
                  "Recall Transaction Read Error<br>Please contact IT helpdesk",
              })
            );
            return;
          }

          if (trxData["userId"] != session.userId) {
            console.log("Logged In User different from last saved transaction");
            sendResponse(
              res,
              200,
              "OK",
              "application/json;charset=UTF-8",
              JSON.stringify({
                error:
                  "PLEASE LOGIN WITH PREVIOUS CASHIER (" +
                  trxData["userName"] +
                  ")",
              })
            );
            return;
          }

          sendResponse(
            res,
            200,
            "OK",
            "application/json;charset=UTF-8",
            JSON.stringify(JSON.parse(trxDet), { error: "TX_READ_ERROR" })
          );
        } else {
          console.log("TX_READ_ERROR:", txnId);
          sendResponse(
            res,
            200,
            "OK",
            "application/json;charset=UTF-8",
            JSON.stringify({ error: "TX_READ_ERROR" })
          );
        }
      });
    } else {
      console.log("REQ_GET_ERROR");
      res.end(JSON.stringify({ error: "EMPTY_TX_ID" }));
    }
  });

  // 20150904 - LUCKY - Modify to read from /trx/TXXXX.tmp, checking the stored transaction before logging out
  app.get("/getStoredTxns", function (req, res) {
    var storedTxns = [];
    var userIdFilter = req.query.userId;

    fs.readdir(trxDir + "/", function (err, files) {
      if (err) console.log("ERR READDIR " + JSON.stringify(err));
      else {
        var tmpRgx = /^T([0-9]+)\.hld/;

        for (var f in files) {
          var tmpFiles = tmpRgx.exec(files[f]);
          if (tmpFiles) storedTxns.push(tmpFiles[1]);
        }
      }
    });

    if (storedTxns.length < 1) {
      fs.readdir(archiveTrxDir + "/", function (err, files) {
        if (err) console.log("ERR READDIR " + JSON.stringify(err));
        else {
          var tmpRgx = /^T([0-9]+)\.hld/;

          for (var f in files) {
            var tmpFiles = tmpRgx.exec(files[f]);
            if (tmpFiles) storedTxns.push(tmpFiles[1]);
          }
        }
      });
    }

    console.log("Stored TXNs: " + storedTxns);
    sendResponse(
      res,
      200,
      "OK",
      "application/json;charset=UTF-8",
      JSON.stringify(storedTxns)
    );
  });

  // force POS shutdown
  app.get("/forcePOSShutdown", function (req, res) {
    // proxy server must be run using sudo so that shutdown command wont ask
    // for a sudo user.
    runUnixCommand("shutdown", ["-h", "+0"], function (data) {
      sendResponse(
        res,
        200,
        "OK",
        "application/json;charset=UTF-8",
        JSON.stringify(data)
      );
    });
  });

  /* TO BE OBSOLETED - LUCKY - I think this function will be obsoleted, since there is no ONLINE/OFFLINE transaction */
  app.get("/printOfflineTransactionsReport", function (req, res) {
    var offlineTxns = new Array();
    txdb
      .createReadStream({
        start: SALE_PREFIX + "\x00",
        end: SALE_PREFIX + "\xff",
      })
      .on("data", function (data) {
        offlineTxns.push(data);
      })
      .on("end", function () {
        router.printReportDoc(res, "OFFLINE_TRANSACTIONS", offlineTxns);
      })
      .on("error", function () {
        sendResponse(
          res,
          500,
          "DATABASE_READ_ERROR",
          "application/json;charset=UTF-8",
          null
        );
      });
  });

  // topup request to simaptindo server
  app.get("/topupRequest", function (req, res) {
    var topupUrl = req.query.topupUrl;
    var params = "?";

    // construct the parameters of the topup url
    for (var field in req.query.params) {
      params += field + "=" + req.query.params[field] + "&";
    }
    params = params.substring(0, params.length - 1);
    console.log("url : " + topupUrl + params);
    var request = http.request(topupUrl + params, function (response) {});

    request.on("response", function (response) {
      var data = "";
      response.on("data", function (chunk) {
        data += chunk;
        console.log(data);
      });
      response.on("end", function () {
        sendResponse(res, 200, "OK", "application/xml;charset=UTF-8", data);
      });
    });
    request.on("error", function (err) {
      console.log("error code : " + err.code);
      sendResponse(res, 200, "TIMEOUT", "application/json;charset=UTF-8", null);
    });
    request.on("socket", function (socket) {
      socket.setTimeout(1000 * req.query.timeout);
      socket.on("timeout", function () {
        request.abort();
      });
    });
    request.end();
  });

  // topup request to simaptindo server
  app.get("/simpatindoRequest", function (req, res) {
    var topupUrl = req.query.topupUrl;
    var params = "?";

    // construct the parameters of the topup url
    for (var field in req.query.params) {
      params += field + "=" + req.query.params[field] + "&";
    }
    params = params.substring(0, params.length - 1);
    console.log("url : " + topupUrl + params);

    var request = http.request(topupUrl + params, function (response) {});

    request.on("response", function (response) {
      var data = "";
      response.on("data", function (chunk) {
        data += chunk;
        console.log(data);
      });
      response.on("end", function () {
        sendResponse(res, 200, "OK", "application/xml;charset=UTF-8", data);
      });
    });
    request.on("error", function (error) {
      sendResponse(res, 500, "TIMEOUT", "application/json;charset=UTF-8", null);
    });

    request.on("timeout", function (error) {
      sendResponse(res, 500, "TIMEOUT", "application/json;charset=UTF-8", null);
    });
    request.on("socket", function (socket) {
      socket.setTimeout(1000 * req.query.timeout);
      socket.on("timeout", function () {
        request.abort();
      });
    });
    request.end();
  });

  app.post("/printReturnNote", function (req, res) {
    var txnData = "";
    req.on("data", function (chunk) {
      txnData += chunk;
    });
    req.on("end", function (chunk) {
      if (chunk) txnData += chunk;
      var returnNote = JSON.parse(txnData);
      if (returnNote) {
        //	    		printReturnNote(returnNote);
        router.printHypercashDoc("PRINT_RETURN_NOTE", returnNote);
        sendResponse(res, 200, "OK", "text/plain", returnNote.returnNoteNumber);
      } else {
        sendResponse(
          res,
          200,
          "OK",
          "application/json;charset=UTF-8",
          JSON.stringify({ error: "EMPTY_POST_DATA" })
        );
      }
    });
  });

  app.get("/hc/profCustomer", function (req, res) {
    var accountId = req.query.accountId;
    var crmURL = configuration.properties["CRM_FIND_MEMBER_WS_URL"] + accountId;
    console.log("account ID: " + accountId);
    console.log("crmURL: " + crmURL);
    var request = http
      .get(crmURL, function (response) {
        var customerData = "";
        response.on("data", function (chunk) {
          customerData += chunk;
        });
        response.on("end", function (chunk) {
          if (chunk) customerData += chunk;
          console.log(customerData);
          sendResponse(
            res,
            200,
            "OK",
            "application/json;charset=UTF-8",
            customerData
          );
        });
        response.on("error", function (error) {
          sendResponse(res, 500, "ERROR", "application/json;charset=UTF-8");
        });

        response.on("timeout", function (error) {
          sendResponse(res, 500, "ERROR", "application/json;charset=UTF-8");
        });
      })
      .on("error", function (err) {
        console.log(
          "ERROR encountered in accessing CRM Web Service due to error ... " +
            err
        );
        sendResponse(res, 500, "ERROR", "application/json;charset=UTF-8");
      });

    request.setTimeout(200000, function () {
      console.log(
        "ERROR encountered in accessing CRM Web Service due to timeout..."
      );
      request.abort();
    });
  });

  // GET EVENT REWARDS CONFIG
  app.get("/getEventRewardsConfig", function (req, res) {
    sendResponse(
      res,
      200,
      "OK",
      "application/json;charset=UTF-8",
      JSON.stringify(eventRewardsConfig)
    );
  });

  app.get("/reqCategoryDonation", function (req, res) {
    sendResponse(
      res,
      200,
      "OK",
      "application/json;charset=UTF-8",
      JSON.stringify(donation)
    );
  });

  // Allo Top Up 2022-08-12
  app.get("/reqCategoryALLOTopup", function (req, res) {
    sendResponse(
      res,
      200,
      "OK",
      "application/json;charset=UTF-8",
      JSON.stringify(alloTopupItem)
    );
  });

  app.get("/reqCategoryOVOTopup", function (req, res) {
    sendResponse(
      res,
      200,
      "OK",
      "application/json;charset=UTF-8",
      JSON.stringify(ovoTopupItem)
    );
  });

  app.get("/reqCategorySHOPEETopup", function (req, res) {
    sendResponse(
      res,
      200,
      "OK",
      "application/json;charset=UTF-8",
      JSON.stringify(shopeeTopupItem)
    );
  });

  app.get("/reqCategoryOmniTelkomsel", function (req, res) {
    sendResponse(
      res,
      200,
      "OK",
      "application/json;charset=UTF-8",
      JSON.stringify(omniTelkomselItem)
    );
  });

  // INHOUSE VOUCHER 2017-04-13
  /*
   * By ven
   * Desc : Service to handle request event generate rule
   * Input : barcodeList
   * Output : eventRewardsResp --> with filter matching item exclusion and item sponsor
   *
   */
  app.post("/reqEventGenRule", function (req, res) {
    var reqData = "";
    req.on("data", function (chunk) {
      reqData += chunk;
    });

    req.on("end", function (chunk) {
      // Load and parse data
      if (chunk) reqData += chunk;
      var barcodeList = [];
      try {
        barcodeList = JSON.parse(reqData);
      } catch (e) {
        console.log(
          "[reqEventGenRule] Failed to parse barcode list|" + JSON.stringify(e)
        );
        return;
      }

      // Initial declaration variable
      var eventRewardsResp = {};
      var checkEventExists = {};

      var eligibleStampCoupon = [];
      eventRewardsResp.stampCoupon = {};
      var eligibleLucky = null;
      eventRewardsResp.luckyCustomer = {};
      var eligibleMarketingVoucher = [];
      eventRewardsResp.marketingVoucher = {};
      for (var i in eventRewardsConfig) {
        // GET STAMP AND CUOPON
        if (
          (eventRewardsConfig[i].type == "1" ||
            eventRewardsConfig[i].type == "2") &&
          isValidPromoDate(eventRewardsConfig[i]) &&
          isValidPromoDay(eventRewardsConfig[i]) &&
          isValidPromoTime(eventRewardsConfig[i])
        ) {
          /*if(typeof checkEventExists['1'] == 'undefined' && typeof checkEventExists['2'] == 'undefined')
                            {*/
          var tempStampCoupon = JSON.parse(
            JSON.stringify(eventRewardsConfig[i])
          );
          eligibleStampCoupon.push(tempStampCoupon);
          checkEventExists[eventRewardsConfig[i].type] = true;
          /*}
                            else continue;*/
        }

        // GET LUCKY EVENT
        if (
          eventRewardsConfig[i].type == "3" &&
          isValidPromoDate(eventRewardsConfig[i]) &&
          isValidPromoDay(eventRewardsConfig[i]) &&
          isValidPromoTime(eventRewardsConfig[i])
        ) {
          if (typeof checkEventExists["3"] == "undefined") {
            eligibleLucky = JSON.parse(JSON.stringify(eventRewardsConfig[i]));
            checkEventExists[eventRewardsConfig[i].type] = true;
          } else continue;
        }

        // GET MARKETING VOUCHER EVENT
        if (
          eventRewardsConfig[i].type == "4" &&
          isValidPromoDate(eventRewardsConfig[i]) &&
          isValidPromoDay(eventRewardsConfig[i]) &&
          isValidPromoTime(eventRewardsConfig[i])
        ) {
          /*if(checkEventExists['4'] == undefined)
                            {*/
          var tempMarketingVoucher = JSON.parse(
            JSON.stringify(eventRewardsConfig[i])
          );
          eligibleMarketingVoucher.push(tempMarketingVoucher);
          checkEventExists[eventRewardsConfig[i].type] = true;
          //}
          //else continue;
        }
      }

      if (eligibleStampCoupon != null) {
        // Stamp Coupon initiation variable
        eventRewardsResp.stampCoupon = eligibleStampCoupon;
        var tempItemExclusion = [];
        var tempSponsorProduct = [];

        // POPULATE ITEM EXCLUSION
        for (var i in barcodeList) {
          var oItem = barcodeList[i];
          // CHECK ITEM EXCLUSION
          if (
            eligibleStampCoupon.itemExclusion != null &&
            eligibleStampCoupon.itemExclusion.indexOf(oItem) > -1
          )
            tempItemExclusion.push(oItem);

          // CHECK SPONSOR PRODUCT
          if (
            eligibleStampCoupon.sponsorProducts != null &&
            eligibleStampCoupon.sponsorProducts.indexOf(oItem) > -1
          )
            tempSponsorProduct.push(oItem);
        }

        // development testing additional code, please remove later
        /*if(typeof barcodeList[1] != 'undefined')
                        	tempItemExclusion.push(barcodeList[1]);
						
                        if(typeof barcodeList[3] != 'undefined')
                        	tempSponsorProduct.push(barcodeList[3]);*/

        // development testing additional code, please remove later
        eventRewardsResp.stampCoupon.itemExclusion = tempItemExclusion;
        eventRewardsResp.stampCoupon.sponsorProducts = tempSponsorProduct;
      }

      // Must be online to run
      if (eligibleLucky != null && checkOnlineStat()) {
        // Lucky event initiation variable
        eventRewardsResp.luckyCustomer = eligibleLucky;
        var tempItemExclusion = [];
        var tempSponsorProduct = [];

        // POPULATE ITEM EXCLUSION
        for (var i in barcodeList) {
          var oItem = barcodeList[i];
          // CHECK ITEM EXCLUSION
          if (
            eligibleLucky.itemExclusion != null &&
            eligibleLucky.itemExclusion.indexOf(oItem) > -1
          )
            tempItemExclusion.push(oItem);

          // CHECK SPONSOR PRODUCT
          if (
            eligibleLucky.sponsorProducts != null &&
            eligibleLucky.sponsorProducts.indexOf(oItem) > -1
          )
            tempSponsorProduct.push(oItem);
        }

        // development testing additional code, please remove later
        /*if(typeof barcodeList[1] != 'undefined')
                        	tempItemExclusion.push(barcodeList[1]);
						
                        if(typeof barcodeList[3] != 'undefined')
                        	tempSponsorProduct.push(barcodeList[3]);*/
        // development testing additional code, please remove later

        eventRewardsResp.luckyCustomer.itemExclusion = tempItemExclusion;
        eventRewardsResp.luckyCustomer.sponsorProducts = tempSponsorProduct;
      }

      // Must be online to run
      if (eligibleMarketingVoucher != null && checkOnlineStat()) {
        // Marketing voucher initiation variable
        eventRewardsResp.marketingVoucher = eligibleMarketingVoucher;
        for (
          var a = 0;
          a <= eventRewardsResp.marketingVoucher.length - 1;
          a++
        ) {
          var tempItemExclusion = [];
          var tempSponsorProduct = [];

          // POPULATE ITEM EXCLUSION
          for (var i in barcodeList) {
            var oItem = barcodeList[i];
            // CHECK ITEM EXCLUSION
            if (
              eligibleMarketingVoucher[a].itemExclusion != null &&
              eligibleMarketingVoucher[a].itemExclusion.indexOf(oItem) > -1
            )
              tempItemExclusion.push(oItem);

            // CHECK SPONSOR PRODUCT
            if (
              eligibleMarketingVoucher[a].sponsorProducts != null &&
              eligibleMarketingVoucher[a].sponsorProducts.indexOf(oItem) > -1
            )
              tempSponsorProduct.push(oItem);
          }

          // development testing additional code, please remove later
          /*if(typeof barcodeList[1] != 'undefined') 
                            	tempItemExclusion.push(barcodeList[1]);
							
                            if(typeof barcodeList[3] != 'undefined') 
                            	tempSponsorProduct.push(barcodeList[3]);*/

          // development testing additional code, please remove later

          eventRewardsResp.marketingVoucher[a].itemExclusion =
            tempItemExclusion;
          eventRewardsResp.marketingVoucher[a].sponsorProducts =
            tempSponsorProduct;
          eventRewardsResp.marketingVoucher[a].mvConfig.mvRdmItemExc = [];
        }
      }
      sendResponse(
        res,
        200,
        "OK",
        "application/json;charset=UTF-8",
        JSON.stringify(eventRewardsResp)
      );
    });
  });

  /*
   * By ven
   * Desc : Service to handle request event redeem rule
   * Input : {
   *          'promodId' = '999',
   *          'barcodeList' = [barcodeItem1, barcodeItem2, ...]
   *          }
   * Output : eventRewardsResp --> with filter matching item exclusion and item sponsor
   *
   */
  app.post("/reqEventRdmRule", function (req, res) {
    var reqData = "";
    req.on("data", function (chunk) {
      reqData += chunk;
    });
    req.on("end", function (chunk) {
      // Load and parse data
      if (chunk) reqData += chunk;
      var reqObject = {};
      try {
        reqObject = JSON.parse(reqData);
      } catch (e) {
        console.log(
          "[reqEventRdmRule] Failed to parse barcode list|" + JSON.stringify(e)
        );
        return;
      }

      // Initial declaration variable
      var eventRewardsResp = {};
      eventRewardsResp.mvRedeem = {};
      eventRewardsResp.mvRedeem.mvConfig = {};
      eventRewardsResp.mvRedeem.mvConfig.mvRdmItemExc = [];

      for (var i in eventRewardsConfig) {
        // GET MARKETING VOUCHER EVENT
        if (
          eventRewardsConfig[i].id == reqObject.promoId &&
          eventRewardsConfig[i].type == 94 &&
          isValidPromoDate(eventRewardsConfig[i]) &&
          isValidPromoDay(eventRewardsConfig[i]) &&
          isValidPromoTime(eventRewardsConfig[i])
        ) {
          eventRewardsResp.mvRedeem = JSON.parse(
            JSON.stringify(eventRewardsConfig[i])
          );
          var tempRdmExclusion = [];
          for (var b in reqObject.barcodeList) {
            var barcode = reqObject.barcodeList[b];
            // CHECK ITEM EXCLUSION
            if (
              eventRewardsConfig[i]["mvConfig"]["mvRdmItemExc"] != null &&
              eventRewardsConfig[i]["mvConfig"]["mvRdmItemExc"].indexOf(
                barcode
              ) > -1
            ) {
              tempRdmExclusion.push(barcode);
            }
          }

          eventRewardsResp.mvRedeem.itemExclusion = [];
          eventRewardsResp.mvRedeem.sponsorProducts = [];
          eventRewardsResp.mvRedeem.mvConfig.mvRdmItemExc = tempRdmExclusion;
        }
      }

      sendResponse(
        res,
        200,
        "OK",
        "application/json;charset=UTF-8",
        JSON.stringify(eventRewardsResp)
      );
    });
  });

  app.post("/updateSysConfig", function (req, res) {
    var reqData = "";
    req.on("data", function (chunk) {
      reqData += chunk;
    });
    req.on("end", function (chunk) {
      // Load and parse data
      if (chunk) reqData += chunk;
      try {
        configuration.properties = JSON.parse(reqData);
        console.log("[updateSysConfig] Success");
        fs.writeFileSync(
          confDir + "/terminal_update.json",
          JSON.stringify(configuration.properties, null, 4)
        );
      } catch (e) {
        console.log("[updateSysConfig] Failed |" + JSON.stringify(e));
        return;
      }

      sendResponse(
        res,
        200,
        "OK",
        "application/json;charset=UTF-8",
        JSON.stringify({ response: "oke" })
      );
    });
  });
  // INHOUSE VOUCHER 2017-04-13

  // FUNCTION TO CALCULATE EVENT REWARDS
  app.post("/calculateEventRewards", function (req, res) {
    var salesData = "";
    req.on("data", function (chunk) {
      salesData += chunk;
    });
    req.on("end", function (chunk) {
      if (chunk) salesData += chunk;

      var eventRewardsResp = {};
      eventRewardsResp.eventRewardNo = 0;
      eventRewardsResp.eventSponsorProduct = [];
      var salesObj = {};

      try {
        salesObj = JSON.parse(salesData);
      } catch (e) {
        console.log(
          "[calculateEventRewards] Failed to parse sales data|" +
            JSON.stringify(e)
        );
        sendResponse(
          res,
          200,
          "OK",
          "application/json;charset=UTF-8",
          JSON.stringify(eventRewardsResp)
        );
        return;
      }

      if (salesObj.type != "SALE" || salesObj.payments.length < 1) {
        console.log(
          "[calculateEventRewards] Not SALES type or CANCELED|" +
            salesObj.type +
            "|" +
            salesObj.payments.length
        );
        sendResponse(
          res,
          200,
          "OK",
          "application/json;charset=UTF-8",
          JSON.stringify({})
        );
        return;
      }

      // GET ELIGIBLE REWARDS FOR LUCKY CUSTOMER
      var eligibleLuckyEvent = null;

      if (checkOnlineStat()) {
        for (var i in eventRewardsConfig) {
          if (
            eventRewardsConfig[i].type == 3 && // GET NON-LUCKY CUSTOMER EVENT
            isValidPromoDate(eventRewardsConfig[i]) &&
            isValidPromoDay(eventRewardsConfig[i]) &&
            isValidPromoTime(eventRewardsConfig[i])
          ) {
            eligibleLuckyEvent = eventRewardsConfig[i];
            break;
          }
        }

        if (eligibleLuckyEvent != null) {
          eventRewardsResp.luckyEventRewardNo = 0;
          eventRewardsResp.luckyEventPromoId = eligibleLuckyEvent.id;
          eventRewardsResp.luckyEventStartDate = eligibleLuckyEvent.startDate;
          eventRewardsResp.luckyEventEndDate = eligibleLuckyEvent.endDate;
          eventRewardsResp.luckyEventType = eligibleLuckyEvent.type;
          eventRewardsResp.luckyEventMaxReward = eligibleLuckyEvent.maxRewards;

          // CALCULATE ITEM
          var binExcludedPayment = 0;
          var totalTrxAmount = 0;
          var voucherExcludedPayment = 0;
          var isSponsor = false;

          for (var i in salesObj.orderItems) {
            var oItem = salesObj.orderItems[i];

            // CHECK ITEM EXCLUSION
            if (
              eligibleLuckyEvent.itemExclusion != null &&
              eligibleLuckyEvent.itemExclusion.indexOf(oItem.ean13Code) > -1
            )
              continue;

            // CHECK CMC EXCLUSION
            if (
              eligibleLuckyEvent.cmcExclusion != null &&
              eligibleLuckyEvent.cmcExclusion &&
              isItemCMC(oItem.ean13Code, salesObj.promotionsMap) &&
              oItem.memberDiscountAmount > 0
            )
              continue;

            // CHECK SPONSOR PRODUCT
            if (
              eligibleLuckyEvent.sponsorProducts != null &&
              eligibleLuckyEvent.sponsorProducts.indexOf(oItem.ean13Code) >
                -1 &&
              eventRewardsResp.eventSponsorProduct.indexOf(oItem.ean13Code) < 0
            ) {
              eventRewardsResp.eventSponsorProduct.push(oItem.ean13Code);
              isSponsor = true;
            }

            // CALCULATE ITEM PRICE
            var oItemAmount =
              oItem.priceSubtotal -
              oItem.discountAmount -
              oItem.memberDiscountAmount -
              oItem.crmMemberDiscountAmount -
              oItem.discBtnAmount -
              oItem.secondLayerDiscountAmount;
            totalTrxAmount += oItem.isVoided ? -1 * oItemAmount : oItemAmount;
          }

          for (var p in salesObj.payments) {
            var payment = salesObj.payments[p];

            // CHECK BIN EXCLUSION
            if (
              payment.eftData != null &&
              eligibleLuckyEvent.binExclusion != null &&
              eligibleLuckyEvent.binExclusion.indexOf(
                payment.eftData.cardNum.substring(0, 6)
              ) > -1
            )
              binExcludedPayment += payment.amountPaid;

            if (
              eligibleLuckyEvent.voucherExclusion != null &&
              eligibleLuckyEvent.voucherExclusion &&
              (payment.paymentMediaType == "GC" ||
                payment.paymentMediaType == "COUPON" ||
                payment.paymentMediaType == "INSTALLMENT" ||
                payment.paymentMediaType == "SODEXO")
            )
              voucherExcludedPayment += parseInt(payment.amountPaid);
          }
          console.log(
            "[calculateEventRewards|LUCKYCUST] Voucher Excluded Amount = " +
              voucherExcludedPayment +
              "; Bin Excluded Amount = " +
              binExcludedPayment
          );

          // CALCULATE NO OF REWARDS
          totalTrxAmount -= binExcludedPayment + voucherExcludedPayment;
          console.log(
            "[calculateEventRewards|LUCKYCUST] Total Sales Amount = " +
              totalTrxAmount
          );

          // CALCULATE NO OF REWARDS
          if (
            (binExcludedPayment <= 0 &&
              totalTrxAmount >= eligibleLuckyEvent.minimumPayment) ||
            (binExcludedPayment <= 0 &&
              isSponsor &&
              eligibleLuckyEvent.minimumPaymentSponsor != null &&
              eligibleLuckyEvent.minimumPaymentSponsor > 0 &&
              totalTrxAmount >= eligibleLuckyEvent.minimumPaymentSponsor)
          ) {
            eventRewardsResp.luckyEventRewardsObj = {};
            eventRewardsResp.luckyEventRewardsObj.promoHeader =
              eligibleLuckyEvent.promoHeader;
            eventRewardsResp.luckyEventRewardsObj.promoLines =
              eligibleLuckyEvent.promoLines;
            eventRewardsResp.luckyEventRewardsObj.startDate =
              eligibleLuckyEvent.startDate;
            eventRewardsResp.luckyEventRewardsObj.endDate =
              eligibleLuckyEvent.endDate;
            eventRewardsResp.luckyEventRewardsObj.eventTotalAmount =
              totalTrxAmount;
          }
        }
      }

      // GET ELIGIBLE REWARDS FOR NON-LUCKY CUSTOMER
      var eligibleEvent = null;
      for (var i in eventRewardsConfig) {
        if (
          eventRewardsConfig[i].type != 3 && // GET NON-LUCKY CUSTOMER EVENT
          isValidPromoDate(eventRewardsConfig[i]) &&
          isValidPromoDay(eventRewardsConfig[i]) &&
          isValidPromoTime(eventRewardsConfig[i])
        ) {
          eligibleEvent = eventRewardsConfig[i];
          break;
        }
      }

      if (eligibleEvent != null) {
        eventRewardsResp.eventSponsorProduct = [];
        // CALCULATE ITEM
        var totalTrxAmount = 0;
        var isSponsor = false;
        var binExcludedPayment = 0;
        var voucherExcludedPayment = 0;

        for (var i in salesObj.orderItems) {
          var oItem = salesObj.orderItems[i];

          // CHECK ITEM EXCLUSION
          if (
            eligibleEvent.itemExclusion != null &&
            eligibleEvent.itemExclusion.indexOf(oItem.ean13Code) > -1
          )
            continue;

          // CHECK CMC EXCLUSION
          if (
            eligibleEvent.cmcExclusion != null &&
            eligibleEvent.cmcExclusion &&
            isItemCMC(oItem.ean13Code, salesObj.promotionsMap) &&
            oItem.memberDiscountAmount > 0
          )
            continue;

          // CHECK SPONSOR PRODUCT
          if (
            eligibleEvent.sponsorProducts != null &&
            eligibleEvent.sponsorProducts.indexOf(oItem.ean13Code) > -1 &&
            eventRewardsResp.eventSponsorProduct.indexOf(oItem.ean13Code) < 0
          ) {
            eventRewardsResp.eventSponsorProduct.push(oItem.ean13Code);
            isSponsor = true;
          }

          // CALCULATE ITEM PRICE
          var oItemAmount =
            oItem.priceSubtotal -
            oItem.discountAmount -
            oItem.memberDiscountAmount -
            oItem.crmMemberDiscountAmount -
            oItem.discBtnAmount -
            oItem.secondLayerDiscountAmount;
          totalTrxAmount += oItem.isVoided ? -1 * oItemAmount : oItemAmount;
        }

        for (var p in salesObj.payments) {
          var payment = salesObj.payments[p];

          // CHECK BIN EXCLUSION
          if (
            payment.eftData != null &&
            eligibleEvent.binExclusion != null &&
            eligibleEvent.binExclusion.indexOf(
              payment.eftData.cardNum.substring(0, 6)
            ) > -1
          )
            binExcludedPayment += payment.amountPaid;

          // CHECK VOUCHER PAYMENT
          if (
            eligibleEvent.voucherExclusion != null &&
            eligibleEvent.voucherExclusion &&
            (payment.paymentMediaType == "GC" ||
              payment.paymentMediaType == "COUPON" ||
              payment.paymentMediaType == "INSTALLMENT" ||
              payment.paymentMediaType == "SODEXO")
          )
            voucherExcludedPayment += parseInt(payment.amountPaid);
        }

        console.log(
          "[calculateEventRewards] Voucher Excluded Amount = " +
            voucherExcludedPayment +
            "; Bin Excluded Amount = " +
            binExcludedPayment
        );

        // CALCULATE NO OF REWARDS
        totalTrxAmount -= binExcludedPayment + voucherExcludedPayment;

        console.log(
          "[calculateEventRewards] Total Sales Amount = " + totalTrxAmount
        );

        if (
          binExcludedPayment <= 0 &&
          totalTrxAmount >= eligibleEvent.minimumPayment
        ) {
          if (eligibleEvent.isMulti)
            eventRewardsResp.eventRewardNo += parseInt(
              totalTrxAmount / eligibleEvent.minimumPayment
            );
          else eventRewardsResp.eventRewardNo++;

          if (
            (eligibleEvent.minimumPaymentSponsor == null ||
              eligibleEvent.minimumPaymentSponsor == 0) &&
            isSponsor
          )
            eventRewardsResp.eventRewardNo++;
        } else if (
          binExcludedPayment <= 0 &&
          isSponsor &&
          eligibleEvent.minimumPaymentSponsor != null &&
          eligibleEvent.minimumPaymentSponsor > 0 &&
          totalTrxAmount >= eligibleEvent.minimumPaymentSponsor
        )
          eventRewardsResp.eventRewardNo++;

        eventRewardsResp.eventRewardNo =
          eventRewardsResp.eventRewardNo > eligibleEvent.maxRewards &&
          eligibleEvent.maxRewards > 0
            ? eligibleEvent.maxRewards
            : eventRewardsResp.eventRewardNo;
        eventRewardsResp.eventPromoId = eligibleEvent.id;
        eventRewardsResp.eventStartDate = eligibleEvent.startDate;
        eventRewardsResp.eventEndDate = eligibleEvent.endDate;
        eventRewardsResp.eventMaxReward = eligibleEvent.maxRewards;
        eventRewardsResp.eventType = eligibleEvent.type;
        eventRewardsResp.eventTotalAmount = totalTrxAmount;

        // COLLECT THE COUPON NUMBER
        eventRewardsResp.eventCoupons = [];
        if (eligibleEvent.type == 2) {
          for (var seq = 1; seq <= eventRewardsResp.eventRewardNo; seq++)
            eventRewardsResp.eventCoupons.push(
              eligibleEvent.promoPrefix +
                salesObj.transactionId +
                ("000" + seq).slice(-3)
            );
        }

        eventRewardsResp.eventRewardsObj = {};
        eventRewardsResp.eventRewardsObj.promoHeader =
          eligibleEvent.promoHeader;
        eventRewardsResp.eventRewardsObj.promoLines = eligibleEvent.promoLines;
        eventRewardsResp.eventRewardsObj.startDate = eligibleEvent.startDate;
        eventRewardsResp.eventRewardsObj.endDate = eligibleEvent.endDate;
        eventRewardsResp.eventRewardsObj.promoCouponTemplate =
          eligibleEvent.promoCouponTemplate;
        eventRewardsResp.eventRewardsObj.promoPrefix =
          eligibleEvent.promoPrefix;

        console.log(
          "[calculateEventRewards] Event Reward Details|ToAmt:" +
            totalTrxAmount +
            "|MinPay:" +
            eligibleEvent.minimumPayment +
            "|MinPaySpon:" +
            eligibleEvent.minimumPaymentSponsor +
            "|ReNo:" +
            eventRewardsResp.eventRewardNo +
            "|EvTy:" +
            eventRewardsResp.eventType +
            "|EvID:" +
            eventRewardsResp.eventPromoId
        );
      }

      sendResponse(
        res,
        200,
        "OK",
        "application/json;charset=UTF-8",
        JSON.stringify(eventRewardsResp)
      );
    });
  });

  app.get("/getHotSpiceCategoriesWithPagination", function (req, res) {
    if (req.query.page < 0) {
      console.log("INVALID PAGE VALUE.");
      sendResponse(res, 500, "ERROR", "application/json;charset=UTF-8");
    } else {
      var startIndex = (req.query.page - 1) * req.query.pageSize;
      var lastIndex = req.query.page * req.query.pageSize;
      var hsCategories = [];

      loadHotspice();
      if (hsList) {
        hsList.forEach(function (item) {
          if (
            item.category &&
            item.category.trim() != "" &&
            hsCategories.indexOf(item.category) === -1
          ) {
            hsCategories.push(item.category);
          }
        });
      }

      var hsCategoriesArr = hsCategories.slice(startIndex, lastIndex);
      var obj = {
        hotspiceArr: hsCategoriesArr,
        hasPrevious: startIndex != 0,
        hasNext: startIndex + hsCategoriesArr.length < hsCategories.length,
      };

      sendResponse(
        res,
        200,
        "OK",
        "application/json;charset=UTF-8",
        JSON.stringify(obj)
      );
    }
  });

  app.get("/getHotSpiceItemsWithPagination", function (req, res) {
    if (req.query.page < 0) {
      console.log("INVALID PAGE VALUE.");
      sendResponse(res, 500, "ERROR", "application/json;charset=UTF-8");
    } else {
      var startIndex = (req.query.page - 1) * req.query.pageSize;
      var lastIndex = req.query.page * req.query.pageSize;
      var category = req.query.category;
      var tempList = [];

      if (hsList) {
        hsList.forEach(function (item) {
          if (item.category == category) {
            tempList.push(item);
          }
        });
      }

      var hotspiceBarcodesArr = tempList.slice(startIndex, lastIndex);
      var obj = {
        hotspiceArr: hotspiceBarcodesArr,
        hasPrevious: startIndex != 0,
        hasNext: startIndex + hotspiceBarcodesArr.length < tempList.length,
      };

      sendResponse(
        res,
        200,
        "OK",
        "application/json;charset=UTF-8",
        JSON.stringify(obj)
      );
    }
  });

  //bill payment request to Mega Finance server
  app.get("/billPaymentRequest", function (req, res) {
    var bpUrl = req.query.bpUrl;
    var params = "?";

    // construct the parameters of the topup url
    for (var field in req.query.params) {
      params += field + "=" + req.query.params[field] + "&";
    }
    var billPaymentUrl = configuration.properties.BILL_PAY_URL;
    var hosts = billPaymentUrl
      ? billPaymentUrl.substr(7, billPaymentUrl.substr(7).indexOf(":"))
      : "116.197.135.202";

    var options = {
      host: configuration.properties.KEY_BILL_PAYMENT_PROXY_HOST,
      port: configuration.properties.KEY_BILL_PAYMENT_PROXY_PORT,
      auth:
        configuration.properties.KEY_BILL_PAYMENT_PROXY_USERNAME +
        ":" +
        configuration.properties.KEY_BILL_PAYMENT_PROXY_PASSWORD,
      path: bpUrl + params,
      headers: {
        Hosts: hosts,
      },
    };

    //params = params.substring(0,params.length-1);
    config.onDevelopment = true;
    if (config.onDevelopment === true) {
      options = bpUrl + params;
    }
    //console.log("url: " + options.path);
    console.log("url: " + options);
    //console.log("proxy: " + options.host + ":" + options.port);

    var request = http.request(options, function (response) {});

    request.on("response", function (response) {
      var data = "";
      response.on("data", function (chunk) {
        data += chunk;
        console.log(data);
      });
      response.on("end", function () {
        sendResponse(res, 200, "OK", "application/xml;charset=UTF-8", data);
      });
    });
    request.on("error", function (err) {
      console.log("error code : " + err.code);
      sendResponse(res, 200, "TIMEOUT", "application/json;charset=UTF-8", null);
    });
    request.on("socket", function (socket) {
      socket.setTimeout(1000 * req.query.timeout);
      socket.on("timeout", function () {
        request.abort();
      });
    });
    request.end();
  });

  app.post("/uilog", function (req, res) {
    var txnData = "";
    req.on("data", function (chunk) {
      txnData += chunk;
    });

    req.on("end", function (chunk) {
      if (chunk) txnData += chunk;
      var logData = JSON.parse(txnData);
      if (
        typeof configuration.properties.MIN_UI_LOG == "undefined" ||
        logLevel.indexOf(configuration.properties.MIN_UI_LOG) <=
          logLevel.indexOf(logData.lvl)
      )
        console.log(
          "[" +
            logData.lvl +
            "]|" +
            (typeof logData.msg == "string"
              ? logData.msg
              : JSON.stringify(logData.msg))
        );
      sendResponse(
        res,
        200,
        '{"resp":"OK"}',
        "application/json;charset=UTF-8",
        false
      );
    });
  });

  app.all(config.posServer.ctxPath + "/*", function (req, res) {
    if (!online) {
      /***********
       * OFFLINE
       **********/
      if (filterNotSupportOfflineRequest(false, req, res)) {
        // Intended empty, Handling unsupported offline URLs
      } else if (req.url.indexOf("product/getProductByBarcode/") > -1) {
        res.oldWriteHead = res.writeHead;
        console.log("--getProductByBarcode--");
        var barcode = req.url.substring(req.url.lastIndexOf("/") + 1);
        console.log("Get Barcode: " + barcode);
        if (barcode) localSearchProduct(barcode, res);
      } else if (
        req.url.indexOf("product/getProductsByBarcodeStartingWith/") > -1
      ) {
        res.oldWriteHead = res.writeHead;
        console.log("--getProductsByBarcodeStartingWith--");
        var barcode = req.url.substring(
          req.url.lastIndexOf("/") + 1,
          req.url.indexOf("?")
        );
        console.log("Get Barcode: " + barcode);
        if (barcode) localSearchProductArray(barcode, res);
      }
      // 20150917 - LUCKY - Function to check if transaction has customer id
      else if (req.url.indexOf("cashier/transactionHasCustomerId/") > -1) {
        res.oldWriteHead = res.writeHead;
        console.log("--transactionHasCustomerId--");
        var trxid = req.url.substring(req.url.lastIndexOf("/") + 1);
        // FOR NOW IT IS ALWAYS FALSE
        sendResponse(res, 200, "OK", "application/json;charset=UTF-8", false);
        //if(trxid) localTrxHasCustomerId(trxid, res);
      } else if (req.url.indexOf("cashier/getTxn/") > -1) {
        res.oldWriteHead = res.writeHead;
        console.log("--getTxn--");
        var questionMarkIndex = req.url.indexOf("?");
        var hasRequestParam = questionMarkIndex > -1;
        var slashPosition = req.url.lastIndexOf("/") + 1;
        var txnId = hasRequestParam
          ? req.url.substring(slashPosition, questionMarkIndex)
          : req.url.substring(slashPosition);
        localSearchTxn(
          txnId,
          hasRequestParam ? req.url.substring(questionMarkIndex + 1) : "",
          res
        );
      } else if (req.url.indexOf("cashier/getVoidedTransaction/") > -1) {
        res.oldWriteHead = res.writeHead;
        console.log("--getVoidedTransaction--");
        var questionMarkIndex = req.url.indexOf("?");
        var hasRequestParam = questionMarkIndex > -1;
        var slashPosition = req.url.lastIndexOf("/") + 1;
        var txnId = hasRequestParam
          ? req.url.substring(slashPosition, questionMarkIndex)
          : req.url.substring(slashPosition);
        localSearchTxn(txnId, "VOIDED", res);
      } else if (
        req.url.indexOf("cashier/saveOrder") > -1 ||
        req.url.indexOf("cashier/voidOrder") > -1
      ) {
        req.on("data", function (chunk) {
          txnSaveData += chunk;
        });
        req.on("end", function (chunk) {
          if (chunk) txnSaveData += chunk;
          //console.log("--save/void Order--");
          //console.log("txnSaveData : "+JSON.stringify(txnSaveData));
          res.oldWriteHead = res.writeHead;
          localSaveTxn(res);
        });
      } else if (req.url.indexOf("/tvs/saveTVSProductPriceOverrideList") > -1) {
        req.on("data", function (chunk) {
          tvsTrxList += chunk;
        });
        req.on("end", function (chunk) {
          if (chunk) tvsTrxList += chunk;
          console.log("--Save TVS Trx List--");
          res.oldWriteHead = res.writeHead;
          res.removeHeader("Content-Length");
          res.oldWriteHead(200, {
            Connection: "keep-alive",
            "Content-Type": "application/json;charset=UTF-8",
          });
          res.oldEnd = res.end;
          res.end = function (data) {};
          res.oldEnd(tvsTrxList);
        });
      } else if (req.url.indexOf("/tvs/saveTVSTransaction") > -1) {
        req.on("data", function (chunk) {
          tvsTrxData += chunk;
        });
        req.on("end", function (chunk) {
          if (chunk) tvsTrxData += chunk;

          console.log("--Save TVS Trx--");
          res.oldWriteHead = res.writeHead;
          localSaveTVSTransaction(res);
        });
      } else if (req.url.indexOf("cashier/saveTopUpTransaction/") > -1) {
        req.on("data", function (chunk) {
          txnSaveData += chunk;
        });
        req.on("end", function (chunk) {
          if (chunk) txnSaveData += chunk;
          var txnId = req.url.substring(req.url.lastIndexOf("/") + 1);
          console.log("--save TopUp--");
          res.oldWriteHead = res.writeHead;
          localSaveTopUpTxn(txnId, res);
        });
      } else if (req.url.indexOf("cashier/saveIndosmartTransaction/") > -1) {
        req.on("data", function (chunk) {
          txnSaveData += chunk;
        });
        req.on("end", function (chunk) {
          if (chunk) txnSaveData += chunk;
          var txnId = req.url.substring(req.url.lastIndexOf("/") + 1);
          console.log("--save Indosmart--");
          res.oldWriteHead = res.writeHead;
          localSaveIndosmartTxn(txnId, res);
        });
      } else if (req.url.indexOf("cashier/saveMCashTransaction/") > -1) {
        req.on("data", function (chunk) {
          txnSaveData += chunk;
        });
        req.on("end", function (chunk) {
          if (chunk) txnSaveData += chunk;
          var txnId = req.url.substring(req.url.lastIndexOf("/") + 1);
          console.log("--save MCash--");
          res.oldWriteHead = res.writeHead;
          localSaveMCashTxn(txnId, res);
        });
      } else if (req.url.indexOf("cashier/saveAlterraTransaction/") > -1) {
        req.on("data", function (chunk) {
          txnSaveData += chunk;
        });
        req.on("end", function (chunk) {
          if (chunk) txnSaveData += chunk;
          var txnId = req.url.substring(req.url.lastIndexOf("/") + 1);
          console.log("--save Alterra--");
          res.oldWriteHead = res.writeHead;
          localSaveAlterraTxn(txnId, res);
        });
      } else if (req.url.indexOf("user/authUser") > -1) {
        console.log("AUTH USER");
        req.on("data", function (chunk) {
          authReqData += chunk;
        });
        req.on("end", function (chunk) {
          if (chunk) authReqData += chunk;
          console.log("authUser");
          res.oldWriteHead = res.writeHead;
          localAuthUser(res);
        });
      } else if (req.url.indexOf("cashier/saveCustFeedback") > -1) {
        req.on("data", function (chunk) {
          custFeedbackData += chunk;
        });
        req.on("end", function (chunk) {
          if (chunk) custFeedbackData += chunk;
          console.log("--saveCustFeedback--");
          res.oldWriteHead = res.writeHead;
          localSaveFeedback(res);
        });
      } else if (req.url.indexOf("cashier/getEftBankConfig/") > -1) {
        res.oldWriteHead = res.writeHead;
        //console.log("--OFFLINE: getEftBankConfig--");
        var vendor = req.url.substring(req.url.lastIndexOf("/") + 1);
        if (vendor) localSearchBankConfig(vendor, res);
      } else if (req.url.indexOf("cashier/getInstallmentCompany/") > -1) {
        res.oldWriteHead = res.writeHead;
        console.log("--getInstallmentCompany--");
        var icBarcode = req.url.substring(req.url.lastIndexOf("/") + 1);
        if (icBarcode) localSearchInstallmentCompany(icBarcode, res);
      } else if (req.url.indexOf("sys/forceSignOff/") > -1) {
        /*else if(req.url.indexOf('cashier/getConfigCodeEnumeration/') > -1){
                res.oldWriteHead = res.writeHead;
                var enumType =  req.url.substring(req.url.lastIndexOf('/') + 1);
                if(enumType)
            	localSearchEnumerationType(enumType, res);
            }*/
        res.oldWriteHead = res.writeHead;
        console.log("--forceSignOff--");
        var txnId = req.url.substring(req.url.lastIndexOf("/") + 1);
        var forceData = "";
        req.on("data", function (chunk) {
          forceData += chunk;
        });
        req.on("end", function (chunk) {
          if (chunk) forceData += chunk;
          res.oldWriteHead = res.writeHead;

          if (cSession) {
            cSession["supervisorIntervention"] = JSON.parse(forceData);
            endUserSession(cSession, function () {
              cSession = null;
              uid = null;
              emplPic = null;
              sid = null;
              uname = null;
              console.log("Session ended.");
            });
          }
          //res.oldWriteHead(200, headers);

          res.end(
            JSON.stringify(
              { success: true },
              { error: "INVALID_RESPONSE_DATA" }
            )
          );
        });

        // END THE SESSION WITH SUPERVISOR INTERVENTION
        //sendResponse(res, 200, 'OK', 'application/json;charset=UTF-8', true);
      } else if (req.url.indexOf("cashier/getTodayTxn/") > -1) {
        res.oldWriteHead = res.writeHead;
        console.log("--getTodayTxn--");
        var txnId = req.url.substring(req.url.lastIndexOf("/") + 1);
        localSearchTxn(txnId, "", res);
      }
      // 20150917 - LUCKY - Check for GC in transaction
      /*else if(req.url.indexOf('giftcard-mms/getGcTxn/') > -1) 
            {
            	res.oldWriteHead = res.writeHead;
            	console.log("--getGcTxn--");
            	var txnId = req.url.substring(req.url.lastIndexOf('/') + 1);

            	// FOW NOW ALWAYS FALSE
            	sendResponse(res, 200, 'OK', 'application/json;charset=UTF-8', false);
            	//localCheckGC(txnId, res);
            }*/
      // 20150908 - LUCKY - Check the session.lastTrxId to return
      else if (req.url.indexOf("/cashier/isThereLastTransaction") > -1) {
        console.log("--isThereLastTransaction--");
        var isthere = false;
        if (session != null && session.lastTrxId > 0) isthere = "true";
        sendResponse(res, 200, "OK", "application/json;charset=UTF-8", isthere);
      }
      // 20150908 - LUCKY - For CRM POINTS
      else if (req.url.indexOf("/user/isLoggedInCashier/") > -1) {
        console.log("--isLoggedInCashier--");
        var islogged = "false";
        var id = req.url.substring(req.url.lastIndexOf("/") + 1);
        if (id == session.emplPic) islogged = true;
        sendResponse(
          res,
          200,
          "OK",
          "application/json;charset=UTF-8",
          islogged
        );
      }
      // 20150917 - LUCKY - Banana Report
      else if (req.url.indexOf("/bananareport/getBananaDTOByCashier") > -1) {
        console.log("--getBananaDTOByCashier--");
        //var isdiscount = false;
        //var cobrand = req.url.substring(req.url.lastIndexOf('/') + 1);
        // FOR NOW IS HARDCODED
        //if(cobrandcode.indexOf(cobrand) > -1) isdiscount = 'true';
        sendResponse(
          res,
          200,
          "OK",
          "application/json;charset=UTF-8",
          JSON.stringify(bananaReportTemp)
        );
      }
      // 20150917 - LUCKY - Check it inputted code is co-brand valid
      else if (req.url.indexOf("/product/doesCoBrandContainsDiscount") > -1) {
        console.log("--doesCoBrandContainsDiscount--");
        var isdiscount = false;
        var cobrand = req.url.substring(req.url.lastIndexOf("/") + 1);
        console.log("COBRAND NUM CHECK:" + cobrand);
        if (cobrandcode.indexOf(cobrand) > -1) isdiscount = "true";
        sendResponse(
          res,
          200,
          "OK",
          "application/json;charset=UTF-8",
          isdiscount
        );
      } else if (req.url.indexOf("/product/getPWPList") > -1) {
        console.log("--getPWPList--");
        var pwpPromo = {};
        var mixMatchCode = req.url.substring(req.url.lastIndexOf("/") + 1);
        if (typeof pwpPromoList[mixMatchCode] != "undefined")
          pwpPromo = pwpPromoList[mixMatchCode];
        //fix pwp promo start
        var cnt = 0;
        var newQualifiers = {};
        for (var key in pwpPromo.qualifiers) {
          newQualifiers[key] = pwpPromo.qualifiers[key];
          if (cnt > 9) break;
          else cnt++;
        }
        pwpPromo.qualifiers = newQualifiers;
        //fix pwp promo end
        sendResponse(
          res,
          200,
          "OK",
          "application/json;charset=UTF-8",
          JSON.stringify(pwpPromo)
        );
      } else if (req.url.indexOf("cashier/isValidForEmpDisc/") > -1) {
        res.oldWriteHead = res.writeHead;
        console.log("--isValidForEmpDisc--");
        var plu = req.url.substring(req.url.lastIndexOf("/") + 1);
        if (plu) localSearchEmpDiscExItem(plu, res);
      } else if (
        req.url.indexOf("/pos-web/cashier/flashiz/isConfigured") > -1
      ) {
        console.log("--flashiz/isConfigured--");
        sendResponse(res, 200, "OK", "application/json;charset=UTF-8", false);
      } else if (req.url.indexOf("cashier/getOffsiteMDRConfiguration/") > -1) {
        res.oldWriteHead = res.writeHead;
        console.log("--getOffsiteMDRConfiguration--");
        var code = req.url.substring(req.url.lastIndexOf("/") + 1);
        if (code) localSearchMDRConfiguration(code, res);
      } else if (
        req.url.indexOf("cashier/getOffsiteMDRConfigurationByBankName/") > -1
      ) {
        res.oldWriteHead = res.writeHead;
        console.log("--getOffsiteMDRConfigurationByBankName--");
        var code = req.url.substring(req.url.lastIndexOf("/") + 1);
        if (code) localSearchMDRConfiguration(code, res);
      }
      // 20150909 - LUCKY - Modify get x report from local
      /*else if(req.url.indexOf('/cashier/getCashierXReportData/') > -1) 
            {
            	//console.log("--OFFLINE: getCashierXReportData--");
            	//sendResponse(res, 500, 'SERVER_OFFLINE', 'application/json;charset=UTF-8');
            	res.oldWriteHead = res.writeHead;
            	console.log("--OFFLINE: getCashierXReportData--");
            	var uid = req.url.substring(req.url.lastIndexOf('/') + 1);
            	//if(uid) localGetXReport(uid, res);
            	sendResponse(res, 200, 'OK', 'application/json;charset=UTF-8', false);
            }*/
      // 20150909 - LUCKY - Modify get x report from local
      else if (req.url.indexOf("/cashier/saveTempSignOff") > -1) {
        res.oldWriteHead = res.writeHead;
        console.log("--saveTempSignOff--");
        var data = "";
        req.on("data", function (chunk) {
          data += chunk;
        });
        req.on("end", function (chunk) {
          if (session) {
            console.log(data);
            fs.appendFile(
              trxDir + "/S" + session.offsiteId + ".txt",
              data,
              function (err) {
                if (err) {
                  console.log(
                    "Temp Off Session Write error:",
                    session.offsiteId,
                    err
                  );
                  sendResponse(
                    res,
                    200,
                    "OK",
                    "application/xml;charset=UTF-8",
                    false
                  );
                } else {
                  sendResponse(
                    res,
                    200,
                    "OK",
                    "application/xml;charset=UTF-8",
                    "true"
                  );
                }
              }
            );
          }
        });
      }
      // 20150908 - LUCKY - Add local Reprint Receipt functionality
      else if (req.url.indexOf("/cashier/reprintReceipt") > -1) {
        console.log(
          "Reprinting Receipt for Transaction ID: " + session.lastTrxId
        );

        fs.readFile(
          archiveTrxDir + "/T" + session.lastTrxId + ".txt",
          function (err, data) {
            if (err) {
              console.log(
                "Failed to read " +
                  archiveTrxDir +
                  "/T" +
                  session.lastTrxId +
                  ".txt"
              );
              //res.oldEnd(JSON.stringify({error:'TRX_READ_ERROR'}));
              sendResponse(
                res,
                200,
                "OK",
                "text/plain",
                JSON.stringify({
                  error: "Transaction not found/not processed yet",
                })
              );
            } else {
              var trxData = JSON.parse(data);
              sendResponse(
                res,
                200,
                "OK",
                "text/plain",
                JSON.stringify(trxData)
              );
            }
          }
        );
      } else if (req.url.indexOf("/cashier/getChangelog") > -1) {
        fs.readFile(__dirname + "/CHANGELOG.MD", "utf8", function (err, data) {
          if (err) {
            sendResponse(
              res,
              200,
              "OK",
              "text/plain",
              JSON.stringify({ error: "changelog not found yet" })
            );
          } else {
            sendResponse(res, 200, "OK", "text/plain", data);
          }
        });
      }
      // 20150908 - LUCKY - Add local Reprint Receipt functionality
      else if (req.url.indexOf("/cashier/saveSupervisorIntervention") > -1) {
        var supervisoridata = "";

        req.on("data", function (chunk) {
          supervisoridata += chunk;
        });
        req.on("end", function (chunk) {
          if (chunk) supervisoridata += chunk;
          var supIntervention = JSON.parse(supervisoridata);

          var trxId = req.url.substring(req.url.lastIndexOf("/") + 1);
          var fname = trxDir + "/I" + trxId;
          fs.writeFile(
            fname + ".tmp",
            JSON.stringify(supIntervention),
            function (err) {
              if (err)
                console.log(
                  "Failed to write ready file: " + JSON.stringify(err)
                );
              else {
                console.log("Supervisor Intervention written");
                fs.renameSync(fname + ".tmp", fname + ".txt");
              }
            }
          );

          sendResponse(res, 200, "OK", "text/plain", "true");
        });
      } else if (
        req.url.indexOf("/cashier/getQuantityInformationByTxnId/") > -1
      ) {
        console.log(
          "getQuantityInformationByTxnId: attempt to call POSSTORE Service"
        );
        if (!checkOnlineStat()) {
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
          return;
        }

        var options = {
          host: config.store.url,
          port: config.store.port,
          path: req.url,
          method: req.method,
          headers: {
            accept: "application/json;charset=UTF-8",
          },
        };

        var serverReq = http.request(options, function (result) {
          var gcData = "";
          result.on("data", function (data) {
            gcData += data;
          });
          result.on("end", function (data) {
            if (data) gcData += data;

            if (gcData == "null" || gcData == null) gcData = "";

            var cType = "application/json;charset=UTF-8";
            sendResponse(res, 200, "OK", cType, gcData.trim());
          });
          result.on("error", function (data) {
            sendResponse(
              res,
              500,
              "Error when requestion get quantity services",
              "application/json;charset=UTF-8"
            );
            console.log(data);
          });
        });

        serverReq.setTimeout(httpTimeout, function () {
          console.log("getQuantityInformationByTxnId: HTTP Request Timeout");
          isTimeout = true;
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
        });

        serverReq.on("error", function (err) {
          console.log("getQuantityInformationByTxnId: Server Error");
          if (!isTimeout)
            sendResponse(
              res,
              500,
              "SERVER_OFFLINE",
              "application/json;charset=UTF-8"
            );
        });

        if (req.method == "POST") {
          var postdata = "";
          req.on("data", function (chunk) {
            postdata += chunk;
          });

          req.on("end", function (chunk) {
            if (chunk) postdata += chunk;

            serverReq.write(postdata);
            serverReq.end();
          });
        } else serverReq.end();

        //sendResponse(res, 500, 'SERVER_OFFLINE', 'application/json;charset=UTF-8');
      } else if (
        req.url.indexOf("/supervisorIntervention/saveAuthentication") > -1
      ) {
        console.log("saveAuthentication: attempt to call POSSTORE Service");
        if (!checkOnlineStat()) {
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
          return;
        }

        var options = {
          host: config.store.url,
          port: config.store.port,
          path: req.url,
          method: req.method,
          headers: {
            accept: "application/json;charset=UTF-8",
          },
        };

        var serverReq = http.request(options, function (result) {
          var gcData = "";
          result.on("data", function (data) {
            gcData += data;
          });
          result.on("end", function (data) {
            if (data) gcData += data;

            if (gcData == "null" || gcData == null) gcData = "";

            var cType = "application/json;charset=UTF-8";
            sendResponse(res, 200, "OK", cType, gcData.trim());
          });
          result.on("error", function (data) {
            sendResponse(
              res,
              500,
              "Error when requestion supervisor save auth services",
              "application/json;charset=UTF-8"
            );
            console.log(data);
          });
        });

        serverReq.setTimeout(httpTimeout, function () {
          console.log("saveAuthentication: HTTP Request Timeout");
          isTimeout = true;
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
        });

        serverReq.on("error", function (err) {
          console.log("saveAuthentication: Server Error");
          if (!isTimeout)
            sendResponse(
              res,
              500,
              "SERVER_OFFLINE",
              "application/json;charset=UTF-8"
            );
        });

        if (req.method == "POST") {
          var postdata = "";
          req.on("data", function (chunk) {
            postdata += chunk;
          });

          req.on("end", function (chunk) {
            if (chunk) postdata += chunk;

            var jsonData = JSON.parse(postdata);
            jsonData.trxId =
              typeof jsonData.trxId != "undefined"
                ? jsonData.trxId
                : configuration.storeCode +
                  configuration.terminalCode +
                  parseInt(Date.now() / 1000);
            jsonData.version =
              typeof jsonData.version != "undefined" ? jsonData.version : "0";
            jsonData.transactionId = session.currentTrxId;
            serverReq.write(JSON.stringify(jsonData));
            serverReq.end();
          });
        } else serverReq.end();

        //sendResponse(res, 500, 'SERVER_OFFLINE', 'application/json;charset=UTF-8');
      } else if (req.url.indexOf("/cashier/getCashierXReportData") > -1) {
        console.log("getCashierXReportData: attempt to call POSSTORE Service");
        if (!checkOnlineStat()) {
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
          return;
        }

        //var paths = req.url.split('/');
        //var xreportType = paths[4];
        //var cashierId = paths[5];

        var options = {
          host: config.store.url,
          port: config.store.port,
          //path: '/' + paths[1] + '/' + paths[2] + '/' + paths[3] + '?type=' + paths[4] + '&cid=' + paths[5],
          path: req.url + "/" + configuration.terminalId,
          method: req.method,
          headers: {
            accept: "application/json;charset=UTF-8",
          },
        };

        var serverReq = http.request(options, function (result) {
          var gcData = "";
          result.on("data", function (data) {
            gcData += data;
          });
          result.on("end", function (data) {
            if (data) gcData += data;

            if (gcData == "null" || gcData == null) gcData = "";

            var cType = "application/json;charset=UTF-8";
            console.log("X REPORT DATA " + gcData);
            isTimeout = false;
            sendResponse(res, 200, "OK", cType, gcData.trim());
          });
          result.on("error", function (data) {
            sendResponse(
              res,
              500,
              "Error when requestion cashier X report service",
              "application/json;charset=UTF-8"
            );
            console.log(data);
          });
        });

        serverReq.setTimeout(httpTimeout, function (err) {
          console.log("getXReport: HTTP Request Timeout");
          isTimeout = true;
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
        });

        serverReq.on("error", function (err) {
          console.log("getXReport: Server Error");
          if (!isTimeout)
            sendResponse(
              res,
              500,
              "SERVER_OFFLINE",
              "application/json;charset=UTF-8"
            );
        });

        if (req.method == "POST") {
          var postdata = "";
          req.on("data", function (chunk) {
            postdata += chunk;
          });

          req.on("end", function (chunk) {
            if (chunk) postdata += chunk;

            serverReq.write(postdata);
            serverReq.end();
          });
        } else serverReq.end();

        //sendResponse(res, 500, 'SERVER_OFFLINE', 'application/json;charset=UTF-8');
      } else if (
        req.url.indexOf("/cashier/getCashierDeptstoreReportData") > -1
      ) {
        console.log(
          "getCashierDepstoreReportData: attempt to call POSSTORE Service"
        );
        if (!checkOnlineStat()) {
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
          return;
        }

        var options = {
          host: config.store.url,
          port: config.store.port,
          path: req.url + "/" + configuration.terminalId,
          method: req.method,
          headers: {
            accept: "application/json;charset=UTF-8",
          },
        };

        var serverReq = http.request(options, function (result) {
          var respData = "";
          result.on("data", function (data) {
            respData += data;
          });
          result.on("end", function (data) {
            if (data) respData += data;

            if (respData == "null" || respData == null) respData = "";

            var cType = "application/json;charset=UTF-8";
            console.log("DEPSTORE REPORT DATA " + respData);
            isTimeout = false;
            sendResponse(res, 200, "OK", cType, respData.trim());
          });
          result.on("error", function (data) {
            sendResponse(
              res,
              500,
              "Error when requestion cashier depstore report service",
              "application/json;charset=UTF-8"
            );
            console.log(data);
          });
        });

        serverReq.setTimeout(httpTimeout, function (err) {
          console.log("getDepstoreReport: HTTP Request Timeout");
          isTimeout = true;
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
        });

        serverReq.on("error", function (err) {
          console.log("getDepstoreReport: Server Error");
          if (!isTimeout)
            sendResponse(
              res,
              500,
              "SERVER_OFFLINE",
              "application/json;charset=UTF-8"
            );
        });

        if (req.method == "POST") {
          var postdata = "";
          req.on("data", function (chunk) {
            postdata += chunk;
          });

          req.on("end", function (chunk) {
            if (chunk) postdata += chunk;

            serverReq.write(postdata);
            serverReq.end();
          });
        } else serverReq.end();

        //sendResponse(res, 500, 'SERVER_OFFLINE', 'application/json;charset=UTF-8');
      } else if (req.url.indexOf("/sys/pingServer") > -1) {
        sendResponse(res, 200, "OK", "application/json;charset=UTF-8", "true");
      } else if (req.url.indexOf("/cashier/couponReturn") > -1) {
        // Coupon return
        console.log("-- COUPON_RETURN FUNCTION SECTION --");
        if (!checkOnlineStat()) {
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
          return;
        }
        var options = {
          host: config.store.url,
          port: config.store.port,
          path: req.url,
          method: req.method,
          headers: {
            accept: "application/json;charset=UTF-8",
          },
        };

        var serverReq = http.request(options, function (result) {
          var gcData = "";
          result.on("data", function (data) {
            gcData += data;
          });
          result.on("end", function (data) {
            if (data) gcData += data;

            if (gcData == "null" || gcData == null) gcData = "";

            var cType = "application/json;charset=UTF-8";
            isTimeout = false;
            console.log("COUPON RETURN SERVER RESPONSE: " + gcData);
            sendResponse(res, 200, "OK", cType, gcData.trim());
          });

          result.on("error", function (data) {
            sendResponse(
              res,
              500,
              "Error when requestion coupon return services",
              "application/json;charset=UTF-8"
            );
            console.log(data);
          });
        });

        serverReq.setTimeout(httpTimeout, function () {
          console.log(req.url + ": HTTP Request Timeout");
          isTimeout = true;
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
        });

        serverReq.on("error", function (err) {
          console.log(req.url + ": Server Error");
          if (!isTimeout)
            sendResponse(
              res,
              500,
              "SERVER_OFFLINE",
              "application/json;charset=UTF-8"
            );
        });

        if (req.method == "POST") {
          var postdata = "";
          req.on("data", function (chunk) {
            postdata += chunk;
          });

          req.on("end", function (chunk) {
            if (chunk) postdata += chunk;

            var jsonData = JSON.parse(postdata);
            serverReq.write(JSON.stringify(jsonData));
            serverReq.end();
          });
        } else serverReq.end();
      } else if (
        req.url.indexOf("/cashier/simpatindo") > -1 ||
        req.url.indexOf("/cashier/simpatindoDev") > -1
      ) {
        // Simpatindo
        console.log("-- SIMPATINDO FUNCTION SECTION --");
        if (!checkOnlineStat()) {
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
          return;
        }
        var options = {
          host: config.store.url,
          port: config.store.port,
          path: req.url,
          method: req.method,
          headers: {
            accept: "application/json;charset=UTF-8",
          },
        };

        var serverReq = http.request(options, function (result) {
          var gcData = "";
          result.on("data", function (data) {
            gcData += data;
          });
          result.on("end", function (data) {
            if (data) gcData += data;

            if (gcData == "null" || gcData == null) gcData = "";

            var cType = "application/json;charset=UTF-8";
            isTimeout = false;
            console.log("SIMPATINDO SERVER RESPONSE: " + gcData);
            sendResponse(res, 200, "OK", cType, gcData.trim());
          });

          result.on("error", function (data) {
            sendResponse(
              res,
              500,
              "Error when requestion simpatindo services",
              "application/json;charset=UTF-8"
            );
            console.log(data);
          });
        });

        serverReq.setTimeout(httpTimeout, function () {
          console.log(req.url + ": HTTP Request Timeout");
          isTimeout = true;
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
        });

        serverReq.on("error", function (err) {
          console.log(req.url + ": Server Error");
          if (!isTimeout)
            sendResponse(
              res,
              500,
              "SERVER_OFFLINE",
              "application/json;charset=UTF-8"
            );
        });

        if (req.method == "POST") {
          var postdata = "";
          req.on("data", function (chunk) {
            postdata += chunk;
          });

          req.on("end", function (chunk) {
            if (chunk) postdata += chunk;

            var jsonData = JSON.parse(postdata);
            serverReq.write(JSON.stringify(jsonData));
            serverReq.end();
          });
        } else serverReq.end();
      } else if (req.url.indexOf("/cashier/mCash") > -1) {
        // MCash
        console.log("-- MCASH FUNCTION SECTION --");
        if (!checkOnlineStat()) {
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
          return;
        }
        var options = {
          host: config.store.url,
          port: config.store.port,
          path: req.url,
          method: req.method,
          headers: {
            accept: "application/json;charset=UTF-8",
          },
        };

        var serverReq = http.request(options, function (result) {
          var gcData = "";
          result.on("data", function (data) {
            gcData += data;
          });
          result.on("end", function (data) {
            if (data) gcData += data;

            if (gcData == "null" || gcData == null) gcData = "";

            var cType = "application/json;charset=UTF-8";
            isTimeout = false;
            console.log("MCASH SERVER RESPONSE: " + gcData);
            sendResponse(res, 200, "OK", cType, gcData.trim());
          });

          result.on("error", function (data) {
            sendResponse(
              res,
              500,
              "Error when requestion MCASH services",
              "application/json;charset=UTF-8"
            );
            console.log(data);
          });
        });

        serverReq.setTimeout(httpTimeout, function () {
          console.log(req.url + ": HTTP Request Timeout");
          isTimeout = true;
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
        });

        serverReq.on("error", function (err) {
          console.log(req.url + ": Server Error");
          if (!isTimeout)
            sendResponse(
              res,
              500,
              "SERVER_ERROR",
              "application/json;charset=UTF-8"
            );
        });

        if (req.method == "POST") {
          var postdata = "";
          req.on("data", function (chunk) {
            postdata += chunk;
          });

          req.on("end", function (chunk) {
            if (chunk) postdata += chunk;

            var jsonData = JSON.parse(postdata);
            serverReq.write(JSON.stringify(jsonData));
            serverReq.end();
          });
        } else serverReq.end();
      } else if (req.url.indexOf("/cashier/alterra") > -1) {
        // Alterra
        console.log("-- ALTERRA FUNCTION SECTION --");
        if (!checkOnlineStat()) {
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
          return;
        }
        var options = {
          host: config.store.url,
          port: config.store.port,
          path: req.url,
          method: req.method,
          headers: {
            accept: "application/json;charset=UTF-8",
          },
        };

        var serverReq = http.request(options, function (result) {
          var gcData = "";
          result.on("data", function (data) {
            gcData += data;
          });
          result.on("end", function (data) {
            if (data) gcData += data;

            if (gcData == "null" || gcData == null) gcData = "";

            var cType = "application/json;charset=UTF-8";
            isTimeout = false;
            console.log("ALTERRA SERVER RESPONSE: " + gcData);
            sendResponse(res, 200, "OK", cType, gcData.trim());
          });

          result.on("error", function (data) {
            sendResponse(
              res,
              500,
              "Error when requestion ALTERRA services",
              "application/json;charset=UTF-8"
            );
            console.log(data);
          });
        });

        serverReq.setTimeout(httpTimeout, function () {
          console.log(req.url + ": HTTP Request Timeout");
          isTimeout = true;
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
        });

        serverReq.on("error", function (err) {
          console.log(req.url + ": Server Error");
          if (!isTimeout)
            sendResponse(
              res,
              500,
              "SERVER_ERROR",
              "application/json;charset=UTF-8"
            );
        });

        if (req.method == "POST") {
          var postdata = "";
          req.on("data", function (chunk) {
            postdata += chunk;
          });

          req.on("end", function (chunk) {
            if (chunk) postdata += chunk;

            var jsonData = JSON.parse(postdata);
            serverReq.write(JSON.stringify(jsonData));
            serverReq.end();
          });
        } else serverReq.end();
      } else if (req.url.indexOf("/cashier/adaf") > -1) {
        console.log("-- ADAF FUNCTION SECTION --");
        if (!checkOnlineStat()) {
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
          return;
        }
        var options = {
          host: config.store.url,
          port: config.store.port,
          path: req.url,
          method: req.method,
          headers: {
            accept: "application/json;charset=UTF-8",
          },
        };

        var serverReq = http.request(options, function (result) {
          var gcData = "";
          result.on("data", function (data) {
            gcData += data;
          });
          result.on("end", function (data) {
            if (data) gcData += data;

            if (gcData == "null" || gcData == null) gcData = "";

            var cType = "application/json;charset=UTF-8";
            isTimeout = false;
            console.log("ADAF SERVER RESPONSE: " + gcData);
            sendResponse(res, 200, "OK", cType, gcData.trim());
          });

          result.on("error", function (data) {
            sendResponse(
              res,
              500,
              "Error when requestion ADAF services",
              "application/json;charset=UTF-8"
            );
            console.log(data);
          });
        });

        serverReq.setTimeout(httpTimeout, function () {
          console.log(req.url + ": HTTP Request Timeout");
          isTimeout = true;
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
        });

        serverReq.on("error", function (err) {
          console.log(req.url + ": Server Error");
          if (!isTimeout)
            sendResponse(
              res,
              500,
              "SERVER_ERROR",
              "application/json;charset=UTF-8"
            );
        });

        if (req.method == "POST") {
          var postdata = "";
          req.on("data", function (chunk) {
            postdata += chunk;
          });

          req.on("end", function (chunk) {
            if (chunk) postdata += chunk;

            var jsonData = JSON.parse(postdata);
            serverReq.write(JSON.stringify(jsonData));
            serverReq.end();
          });
        } else serverReq.end();
      } else if (req.url.indexOf("/cashier/indosmart") > -1) {
        console.log("-- INDOSMART FUNCTION SECTION --");
        if (!checkOnlineStat()) {
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
          return;
        }
        var options = {
          host: config.store.url,
          port: config.store.port,
          path: req.url,
          method: req.method,
          headers: {
            accept: "application/json;charset=UTF-8",
          },
        };

        var serverReq = http.request(options, function (result) {
          var gcData = "";
          result.on("data", function (data) {
            gcData += data;
          });
          result.on("end", function (data) {
            if (data) gcData += data;

            if (gcData == "null" || gcData == null) gcData = "";

            var cType = "application/json;charset=UTF-8";
            isTimeout = false;
            console.log("INDOSMART SERVER RESPONSE: " + gcData);
            sendResponse(res, 200, "OK", cType, gcData.trim());
          });

          result.on("error", function (data) {
            sendResponse(
              res,
              500,
              "Error when requestion indosmart services",
              "application/json;charset=UTF-8"
            );
            console.log(data);
          });
        });

        serverReq.setTimeout(httpTimeout, function () {
          console.log(req.url + ": HTTP Request Timeout");
          isTimeout = true;
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
        });

        serverReq.on("error", function (err) {
          console.log(req.url + ": Server Error");
          if (!isTimeout)
            sendResponse(
              res,
              500,
              "SERVER_ERROR",
              "application/json;charset=UTF-8"
            );
        });

        if (req.method == "POST") {
          var postdata = "";
          req.on("data", function (chunk) {
            postdata += chunk;
          });

          req.on("end", function (chunk) {
            if (chunk) postdata += chunk;

            var jsonData = JSON.parse(postdata);
            serverReq.write(JSON.stringify(jsonData));
            serverReq.end();
          });
        } else serverReq.end();
      } else if (
        req.url.indexOf("/eft/saveEftTransactionSummaryReport") > -1 ||
        req.url.indexOf("/eft/saveEftSettlementReport") > -1 ||
        req.url.indexOf("/eft/saveEftTransactionDetailReport") > -1 ||
        req.url.indexOf("/cashier/saveVoidEft") > -1 ||
        req.url.indexOf("/cashier/voidEft") > -1 ||
        req.url.indexOf("/cashier/getTotalCashSalesAndPickupAmount") > -1 ||
        req.url.indexOf("/cashier/getMDRConfiguration") > -1 ||
        req.url.indexOf("/cashier/getMDRConfigurationByBankName") > -1 ||
        req.url.indexOf("/crmWsConsumer/findMemberById") > -1 ||
        req.url.indexOf("/crmWsConsumer/earnPoint") > -1 ||
        req.url.indexOf("/crmWsConsumer/redeemPoints") > -1 ||
        req.url.indexOf("/crmWsConsumer/validatePin") > -1 ||
        req.url.indexOf("/crmWsConsumer/renewMembership") > -1 ||
        req.url.indexOf("/crmWsConsumer/voidPoints") > -1 ||
        req.url.indexOf("/hypercash/hypercashsequence") > -1 ||
        req.url.indexOf("/hypercash/taxinvoice") > -1 ||
        req.url.indexOf("/user/updateUserPassword") > -1 ||
        req.url.indexOf("/topUp/getTopUpTxn") > -1 ||
        req.url.indexOf("/cashier/getLuckyCustomer") > -1 ||
        req.url.indexOf("/cashier/taxInvoiceSignatories") > -1 ||
        req.url.indexOf("/cashier/returnNote") > -1 ||
        req.url.indexOf("/cashier/getRefundableTx") > -1 ||
        req.url.indexOf("/cashier/mlc") > -1 || // MLC 2017-04-21
        req.url.indexOf("/cashier/ovo") > -1 ||
        req.url.indexOf("/cashier/grab") > -1 ||
        req.url.indexOf("/cashier/thr") > -1 ||
        req.url.indexOf("/cashier/getIndentInquiry") > -1 || // INDENT
        req.url.indexOf("/cashier/closeIndent") > -1 || // INDENT
        req.url.indexOf("/cashier/voidIndent") > -1 || // INDENT
        req.url.indexOf("/tvs/getLatestOverridePriceOfProduct") > -1 ||
        req.url.indexOf("/cashier/elebox") > -1 || //elebox
        req.url.indexOf("/bpjs/process") > -1 || // BPJS
        req.url.indexOf("/cashier/loyalty") > -1 || // LOYALTY
        req.url.indexOf("/cashier/ebike") > -1 || // E-BIKE
        //req.url.indexOf('/cashier/couponReturn') > -1 || // Coupon return
        req.url.indexOf("/cashier/spo") > -1 || // SPO
        req.url.indexOf("/cashier/altoWC") > -1 || // ALTO WECHAT
        req.url.indexOf("/cashier/allo/qrtts") > -1 || // Allo Top Up 2022-08-12
        req.url.indexOf("/cashier/allo/offlineTopup") > -1 || // Allo Top Up 2022-08-12
        req.url.indexOf("/cashier/kidcity") > -1 ||
        req.url.indexOf("/cashier/getSysConfig") > -1 ||
        req.url.indexOf("/cashier/tiphone/api") > -1
      ) {
        if (req.url.indexOf("/cashier/getTotalCashSalesAndPickupAmount") > -1)
          req.url += "/" + session.userId;

        console.log("Attemp to call POSSTORE Services --> " + req.url);
        if (!checkOnlineStat()) {
          sendResponse(
            res,
            200,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
          return;
        }
        var options = {
          host: config.store.url,
          port: config.store.port,
          path: req.url,
          method: req.method,
          headers: {
            accept: "application/json;charset=UTF-8",
          },
        };

        var serverReq = http.request(options, function (result) {
          var gcData = "";
          result.on("data", function (data) {
            gcData += data;
          });
          result.on("end", function (data) {
            if (data) gcData += data;

            if (gcData == "null" || gcData == null) gcData = "";

            var cType = "application/json;charset=UTF-8";
            console.log("POSSTORE Resp Data: " + gcData);

            // SPECIAL TREATMENT FOR UPDATE USER PASSWORD
            if (req.url.indexOf("/user/updateUserPassword") > -1) {
              var userData = JSON.parse(gcData);
              localUpdateUserData(userData["users"][0], true, true);
            }
            isTimeout = false;
            sendResponse(res, 200, "OK", cType, gcData.trim());
          });
          result.on("error", function (data) {
            sendResponse(
              res,
              500,
              "Error when requesting POSSTORE Services",
              "application/json;charset=UTF-8"
            );
            console.log(data);
          });
        });

        serverReq.setTimeout(httpTimeout, function () {
          console.log(req.url + ": HTTP Request Timeout");
          isTimeout = true;
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE_TIMEOUT",
            "application/json;charset=UTF-8"
          );
        });

        serverReq.on("error", function (err) {
          console.log(req.url + ": Server Error");
          console.log(err);
          if (!isTimeout)
            sendResponse(
              res,
              500,
              "SERVER_OFFLINE_ERROR : " +
                JSON.stringify({ err: "THERE IS AN ERROR ABC" }),
              "application/json;charset=UTF-8"
            );
        });

        if (req.method == "POST") {
          var postdata = "";
          req.on("data", function (chunk) {
            postdata += chunk;
          });

          req.on("end", function (chunk) {
            if (chunk) postdata += chunk;
            console.log(postdata);

            // TRY WHETHER DATA IS JSON OR NOT
            try {
              var jsonData = JSON.parse(postdata);
              if (req.url.indexOf("/cashier/elebox") <= -1) {
                jsonData.trxId =
                  typeof jsonData.trxId != "undefined"
                    ? jsonData.trxId
                    : configuration.storeCode +
                      configuration.terminalCode +
                      parseInt(Date.now() / 1000);
                jsonData.version =
                  typeof jsonData.version != "undefined"
                    ? jsonData.version
                    : "0";
              }
              serverReq.write(JSON.stringify(jsonData));
            } catch (e) {
              console.log("-- POSTDATA IS NOT JSON FORMAT --");
              console.log(e);
              // ADD SESSION ID AND USERID
              postdata +=
                "&userid=" + session.userId + "&sessionid" + session.offsiteId;
              // THEN JUST PASS IT TO BACKEND SERVER
              serverReq.write(postdata);
            }

            serverReq.end();
          });
        } else serverReq.end();
      }
      //Giftcard MMS
      else if (req.url.indexOf("/giftcard-mms/") > -1) {
        //Added by Rizka 2017-10-20
        console.log("--GC MMS--");
        if (!checkOnlineStat()) {
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
          return;
        }

        var options = {
          host: config.store.url,
          port: config.store.port,
          path: req.url,
          method: req.method,
          headers: {
            accept: "application/json;charset=UTF-8",
          },
        };

        var serverReq = http.request(options, function (result) {
          var gcData = "";
          result.on("data", function (data) {
            gcData += data;
          });
          result.on("end", function (data) {
            if (data) gcData += data;

            if (gcData == "null" || gcData == null) gcData = "";
            var cType = "application/json;charset=UTF-8";
            isTimeout = false;
            console.log("GC SERVER RESPONSE: " + gcData);
            sendResponse(res, 200, "OK", cType, gcData.trim());
          });
          result.on("error", function (data) {
            sendResponse(
              res,
              500,
              "Error when requestion giftcard services",
              "application/json;charset=UTF-8"
            );
            console.log(data);
          });
        });

        serverReq.setTimeout(httpTimeout, function () {
          console.log(req.url + ": HTTP Request Timeout");
          isTimeout = true;
          sendResponse(
            res,
            500,
            "SERVER_TIMEOUT",
            "application/json;charset=UTF-8"
          );
        });

        serverReq.on("error", function (err) {
          console.log(req.url + ": Server Error");
          if (!isTimeout)
            sendResponse(
              res,
              500,
              "SERVER_ERROR",
              "application/json;charset=UTF-8"
            );
        });

        if (req.method == "POST") {
          var postdata = "";
          req.on("data", function (chunk) {
            postdata += chunk;
          });

          req.on("end", function (chunk) {
            if (chunk) postdata += chunk;

            var jsonData = JSON.parse(postdata);
            //if(req.url.indexOf('saveGiftCardTransaction') > -1){
            //    jsonData.trxId = (typeof jsonData.trxId != 'undefined') ? jsonData.trxId : configuration.storeCode + configuration.terminalCode + parseInt(Date.now() / 1000);

            //    if(gcSaveId != '') {
            //        jsonData.trxId = gcSaveId; // for activation only
            //        gcSaveId = '';
            //    }

            //    jsonData.version = (typeof jsonData.version != 'undefined') ? jsonData.version : '0';
            //} else if(req.url.indexOf('saveGiftCardInfo') > -1 || req.url.indexOf('saveNewGiftCardInfo') > -1) {
            //    jsonData.gcId = (typeof jsonData.gcId != 'undefined') ? jsonData.gcId : configuration.storeCode + configuration.terminalCode + parseInt(Date.now() / 1000);
            //    jsonData.version = (typeof jsonData.version != 'undefined') ? jsonData.version : '0';
            //    gcSaveId = jsonData.gcId;
            //}
            console.log("GIFT CARD MMS DATA: ");
            console.log(JSON.stringify(jsonData));
            serverReq.write(JSON.stringify(jsonData));
            serverReq.end();
          });
        } else serverReq.end();
      }
      //End Giftcard MMS
      else if (req.url.indexOf("/giftcard/") > -1) {
        console.log("-- GIFTCARD FUNCTION SECTION --");
        if (!checkOnlineStat()) {
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
          return;
        }
        var options = {
          host: config.store.url,
          port: config.store.port,
          path: req.url,
          method: req.method,
          headers: {
            accept: "application/json;charset=UTF-8",
          },
        };

        var serverReq = http.request(options, function (result) {
          var gcData = "";
          result.on("data", function (data) {
            gcData += data;
          });
          result.on("end", function (data) {
            if (data) gcData += data;

            if (gcData == "null" || gcData == null) gcData = "";

            var cType = "application/json;charset=UTF-8";
            if (req.url.indexOf("getNextValue") > -1) cType = "text/plain";
            isTimeout = false;
            console.log("GC SERVER RESPONSE: " + gcData);
            sendResponse(res, 200, "OK", cType, gcData.trim());
          });
          result.on("error", function (data) {
            sendResponse(
              res,
              500,
              "Error when requestion giftcard services",
              "application/json;charset=UTF-8"
            );
            console.log(data);
          });
        });

        serverReq.setTimeout(httpTimeout, function () {
          console.log(req.url + ": HTTP Request Timeout");
          isTimeout = true;
          sendResponse(
            res,
            500,
            "SERVER_OFFLINE",
            "application/json;charset=UTF-8"
          );
        });

        serverReq.on("error", function (err) {
          console.log(req.url + ": Server Error");
          if (!isTimeout)
            sendResponse(
              res,
              500,
              "SERVER_OFFLINE",
              "application/json;charset=UTF-8"
            );
        });

        if (req.method == "POST") {
          var postdata = "";
          req.on("data", function (chunk) {
            postdata += chunk;
          });

          req.on("end", function (chunk) {
            if (chunk) postdata += chunk;

            var jsonData = JSON.parse(postdata);
            if (req.url.indexOf("saveGiftCardTransaction") > -1) {
              jsonData.trxId =
                typeof jsonData.trxId != "undefined"
                  ? jsonData.trxId
                  : configuration.storeCode +
                    configuration.terminalCode +
                    parseInt(Date.now() / 1000);

              if (gcSaveId != "") {
                jsonData.trxId = gcSaveId; // for activation only
                gcSaveId = "";
              }

              jsonData.version =
                typeof jsonData.version != "undefined" ? jsonData.version : "0";
            } else if (
              req.url.indexOf("saveGiftCardInfo") > -1 ||
              req.url.indexOf("saveNewGiftCardInfo") > -1
            ) {
              jsonData.gcId =
                typeof jsonData.gcId != "undefined"
                  ? jsonData.gcId
                  : configuration.storeCode +
                    configuration.terminalCode +
                    parseInt(Date.now() / 1000);
              jsonData.version =
                typeof jsonData.version != "undefined" ? jsonData.version : "0";
              gcSaveId = jsonData.gcId;
            }
            serverReq.write(JSON.stringify(jsonData));
            serverReq.end();
          });
        } else serverReq.end();
      } else if (req.url.indexOf("/cashier/getMarketingAds") > -1) {
        console.log("-- MARKETING ADS FUNCTION SECTION --");

        if (checkOnlineStat()) {
          var options = {
            host: config.store.url,
            port: config.store.port,
            path: req.url,
            headers: {
              accept: "application/json;charset=UTF-8",
            },
          };

          try {
            var serverReq = http.get(options, function (result) {
              var adsData = "";
              result.on("data", function (data) {
                adsData += data;
              });
              result.on("end", function (data) {
                if (data) adsData += data;

                if (adsData == "null" || adsData == null) adsData = "";
                var adsRes = processMarketingAds(adsData);
                fs.writeFile(tmpDir + "/.adsdata", adsData, function (err) {
                  if (err) throw err;
                  console.log("Marketing ads data saved.");
                });
                sendResponse(
                  res,
                  200,
                  "OK",
                  "application/json",
                  JSON.stringify(adsRes)
                );
              });
            });

            serverReq.setTimeout(httpTimeout, function () {
              console.log("getMarketingAds: HTTP Request Timeout");
              isTimeout = true;
              getLocalMarketingAds(res);
            });

            serverReq.on("error", function (data) {
              console.log(
                "Failed to fetch from POS STORE, load from local ads data (" +
                  data +
                  ")"
              );
              if (!isTimeout) getLocalMarketingAds(res);
            });
          } catch (e) {
            console.log("ERROR MARKETING ADS: " + e);
          }
        } else getLocalMarketingAds(res);
      } else if (offsite) {
        /***********
         * OFFSITE
         **********/
        if (
          req.url.indexOf("/sys/getConnstat") < 0 &&
          req.url.indexOf("images") < 0 &&
          req.url.indexOf("resources") < 0
        )
          console.log("o====> " + req.url);

        if (
          req.url == "/pos-web/" ||
          req.url == "/pos-web/cashier" ||
          req.url == "/pos-web/cashier/main" ||
          req.url == "/pos-web/login" ||
          req.url.indexOf("/pos-web/cashier/main?authForm") > -1
        ) {
          res.writeHead(200, { "Content-Type": "text/html" });
          if (
            cSession &&
            req.headers.cookie == "JSESSIONID=" + cSession.offsiteId
          ) {
            var tr = trumpet();
            tr.pipe(res);
            tr.select("span[id=givenName]")
              .createWriteStream()
              .end(cSession.givenName);
            tr.select("span[id=lastName]")
              .createWriteStream()
              .end(cSession.lastName);
            fs.createReadStream(offsiteDir + "cashier.html").pipe(tr);
          } else {
            var tr = trumpet();
            tr.pipe(res);
            tr.select("div[class=error]")
              .createWriteStream()
              .end('<span class="error-message"><span></span></span>');
            tr.select("span[id=possVersion]")
              .createWriteStream()
              .end(possVersion);
            tr.select("span[id=dataVersion]")
              .createWriteStream()
              .end(dataVersion);
            fs.createReadStream(offsiteDir + "login.html").pipe(tr);
          }
        } else if (req.url.indexOf("/customer/main") > -1) {
          if (
            cSession &&
            req.headers.cookie == "JSESSIONID=" + cSession.offsiteId
          ) {
            res.writeHead(200, { "Content-Type": "text/html" });
            var tr = trumpet();
            tr.pipe(res);
            tr.selectAll("span[id=givenName]", function (elem) {
              elem.createWriteStream().end(cSession.givenName);
            });

            tr.selectAll("span[id=lastName]", function (elem) {
              elem.createWriteStream().end(cSession.lastName);
            });

            tr.selectAll("img[id=emplPic]", function (elem) {
              if (emplPic && fs.existsSync(emplPic)) {
                elem.setAttribute(
                  "src",
                  "/pos-web/" +
                    emplPic.substring(
                      emplPic.indexOf(resourcesDir) + resourcesDir.length
                    )
                );
              } else {
                elem.setAttribute(
                  "src",
                  "/pos-web/resources/images/no-image.jpg"
                );
              }
            });

            fs.createReadStream(offsiteDir + "customer.html").pipe(tr);
          }
        } else if (req.url.indexOf("/j_spring_security_check") > -1) {
          var logindata = "";
          req.on("data", function (chunk) {
            logindata += chunk;
          });

          req.on("end", function (chunk) {
            if (chunk) logindata += chunk;

            doOffsiteAuth(logindata, false, function (msg, userAccount) {
              if (userAccount) {
                createUserSession(userAccount, function (session) {
                  if (session) {
                    cSession = session;
                    uid = cSession.userId;
                    if (cSession.emplId) {
                      // GET FROM POS-WEB FIRST
                      if (checkOnlineStat()) {
                        var options = {
                          host: config.store.url,
                          port: config.store.port,
                          path: "/uploads/images/employee/" + cSession.emplId,
                        };

                        var request = http.get(options, function (res) {
                          var imagedata = "";
                          res.setEncoding("binary");

                          res.on("data", function (chunk) {
                            imagedata += chunk;
                          });

                          res.on("end", function () {
                            fs.writeFile(
                              resourcesDir +
                                "images/uploads/employee/" +
                                cSession.emplId,
                              imagedata,
                              "binary",
                              function (err) {
                                if (err) throw err;
                                console.log(
                                  "Employee " +
                                    cSession.emplId +
                                    " pic file saved."
                                );
                              }
                            );
                          });
                        });

                        request.on("error", function (err) {
                          console.log(
                            "Failed to get pictures from POSSTORE (" + err + ")"
                          );
                        });
                      }

                      emplPic =
                        resourcesDir +
                        "images/uploads/employee/" +
                        cSession.emplId;
                    }

                    uroles = cSession.uroles;
                    sid = cSession.offsiteId;
                    tid = configuration.terminalId;
                    uname = cSession.username;

                    console.log(
                      "Login: uid=" +
                        uid +
                        ", roles=" +
                        uroles +
                        ", emplPic=" +
                        emplPic +
                        ", sid=" +
                        sid +
                        ", tid=" +
                        tid +
                        ", username=" +
                        uname
                    );
                    res.writeHead(302, {
                      "set-cookie": [
                        "JSESSIONID=" +
                          session.offsiteId +
                          "; Path=/pos-web/; HttpOnly",
                      ],
                      location:
                        "http://localhost:8089" +
                        config.posServer.ctxPath +
                        "/cashier/main",
                    });
                    res.end();
                  } else {
                    res.writeHead(200, { "Content-Type": "text/html" });
                    var tr = trumpet();
                    tr.pipe(res);
                    var ws = tr.select("div[class=error]").createWriteStream();
                    ws.end(
                      '<span class="error-message"><span>PLEASE RE-ENTER</span></span>'
                    );
                    fs.createReadStream(offsiteDir + "login.html").pipe(tr);
                  }
                });
              } else {
                res.writeHead(200, { "Content-Type": "text/html" });
                var tr = trumpet();
                tr.pipe(res);
                var ws = tr.select("div[class=error]").createWriteStream();
                ws.end(
                  '<span class="error-message"><span>' + msg + "</span></span>"
                );
                fs.createReadStream(offsiteDir + "login.html").pipe(tr);
              }
            });

            logindata = "";
          });
        } else if (req.url.indexOf("/j_spring_security_logout") > -1) {
          req.on("data", function (chunk) {});
          req.on("end", function (chunk) {
            if (cSession) {
              endUserSession(cSession, function () {
                cSession = null;
                uid = null;
                emplPic = null;
                sid = null;
                uname = null;
                console.log("Session ended.");

                res.writeHead(302, {
                  location:
                    "http://localhost:8089" + config.posServer.ctxPath + "/",
                });
                res.end();
              });
            }
          });
        } else if (req.url.indexOf("/display/displayLogo") > -1) {
          res.writeHead(200, { "Content-Type": "image/jpeg;charset=UTF-8" });
          fs.createReadStream(offsiteDir + "displayLogo").pipe(res);
        } else if (req.url.indexOf("/display/displayLoginLogo") > -1) {
          res.writeHead(200, { "Content-Type": "image/jpeg;charset=UTF-8" });
          fs.createReadStream(offsiteDir + "displayLoginLogo").pipe(res);
        } else if (req.url.indexOf("/sys/getMessages") > -1) {
          // 20150828 - LUCKY - Modified get messages from local file
          sendResponse(
            res,
            200,
            "OK",
            "application/json;charset=UTF-8",
            JSON.stringify(configuration["messages"])
          );
        } else if (req.url.indexOf("/sys/getStoreInfo") > -1) {
          // 20150828 - LUCKY - Modify get store info from local file
          //configuration['storeinfo']['connstatus'] = !offlineLogin;
          sendResponse(
            res,
            200,
            "OK",
            "application/json;charset=UTF-8",
            JSON.stringify(configuration["storeinfo"])
          );
        } else if (req.url.indexOf("/sys/getConnstat") > -1) {
          var onlinestat = fs.existsSync(tmpDir + "/.onlinestat");
          if (onlinestat) {
            var online = fs.readFileSync(tmpDir + "/.onlinestat");
            console.log("ONLINESTAT: " + online);
            if (online == "1") onlineStat = true;
            else onlineStat = false;
          }

          sendResponse(
            res,
            200,
            "OK",
            "application/json;charset=UTF-8",
            JSON.stringify({
              connstat: onlineStat,
              possver: possVersion,
              dataver: dataVersion,
            })
          );
        } else if (req.url.indexOf("/user/isUserForPasswordChange") > -1) {
          var data = { isForPasswordChange: false, passwordChangeType: null };

          if (loggedUser["password_change_type"] != null && checkOnlineStat()) {
            data["isForPasswordChange"] = true;
            data["passwordChangeType"] = loggedUser["password_change_type"];
          }
          sendResponse(
            res,
            200,
            "OK",
            "application/json;charset=UTF-8",
            JSON.stringify(data)
          );
        } else if (
          req.url.indexOf("cashier/getConfigCodeEnumeration/CREDIT_CARD_TYPE") >
          -1
        ) {
          // 20150901 - LUCKY - Modify get credit card type from local file
          sendResponse(
            res,
            200,
            "OK",
            "application/json;charset=UTF-8",
            JSON.stringify(configuration["creditcardtype"])
          );
        } else if (
          req.url.indexOf("cashier/getConfigCodeEnumeration/BANK_ID_LOOKUP") >
          -1
        ) {
          // 20150901 - LUCKY - Modify get bank id lookup type from local file
          sendResponse(
            res,
            200,
            "OK",
            "application/json;charset=UTF-8",
            JSON.stringify(configuration["bankidlookup"])
          );
        } else if (
          req.url.indexOf("cashier/getConfigCodeEnumeration/BANK_ID_LOOKUP") >
          -1
        ) {
          // 20150901 - LUCKY - Modify get bank id lookup type from local file
          sendResponse(
            res,
            200,
            "OK",
            "application/json;charset=UTF-8",
            JSON.stringify(configuration["bankidlookup"])
          );
        } else if (req.url.indexOf("cashier/getConfigCodeEnumeration") > -1) {
          console.log(
            "getConfigCodeEnumeration by key: attempt to call POSSTORE Service"
          );
          if (!checkOnlineStat()) {
            sendResponse(
              res,
              500,
              "SERVER_OFFLINE",
              "application/json;charset=UTF-8"
            );
            return;
          }

          var options = {
            host: config.store.url,
            port: config.store.port,
            path: req.url,
            method: req.method,
            headers: {
              accept: "application/json;charset=UTF-8",
            },
          };

          var serverReq = http.request(options, function (result) {
            var gcData = "";
            result.on("data", function (data) {
              gcData += data;
            });
            result.on("end", function (data) {
              if (data) gcData += data;

              if (gcData == "null" || gcData == null) gcData = "";

              var cType = "application/json;charset=UTF-8";
              console.log("ENUM DATA " + gcData);
              sendResponse(res, 200, "OK", cType, gcData.trim());
            });
            result.on("error", function (data) {
              sendResponse(
                res,
                500,
                "Error when requestion cashier X report service",
                "application/json;charset=UTF-8"
              );
              console.log(data);
            });
          });

          serverReq.setTimeout(httpTimeout, function () {
            console.log("getConfigCodeEnumeration: HTTP Request Timeout");
            isTimeout = true;
            sendResponse(
              res,
              500,
              "SERVER_OFFLINE",
              "application/json;charset=UTF-8"
            );
          });

          serverReq.on("error", function (err) {
            console.log("Server Error");
            if (!isTimeout)
              sendResponse(
                res,
                500,
                "SERVER_OFFLINE",
                "application/json;charset=UTF-8"
              );
          });

          if (req.method == "POST") {
            var postdata = "";
            req.on("data", function (chunk) {
              postdata += chunk;
            });

            req.on("end", function (chunk) {
              if (chunk) postdata += chunk;

              serverReq.write(postdata);
              serverReq.end();
            });
          } else serverReq.end();
        } else if (req.url.indexOf("/pos-web/resources/") > -1) {
          if (req.url.indexOf("?") > 0)
            req.url = req.url.substring(0, req.url.indexOf("?"));

          var i = req.url.lastIndexOf(".");
          if (i > -1) {
            var ext = req.url.substring(i + 1);
            if ("js" == ext.toLowerCase()) {
              res.writeHead(200, {
                "Content-Type": "application/javascript;charset=UTF-8",
              });
            } else if ("jpg" == ext.toLowerCase()) {
              res.writeHead(200, {
                "Content-Type": "image/jpeg;charset=UTF-8",
              });
            } else if (
              "png" == ext.toLowerCase() ||
              "gif" == ext.toLowerCase() ||
              req.url.indexOf("/images/") > -1
            ) {
              res.writeHead(200, {
                "Content-Type": "image/" + ext + ";charset=UTF-8",
              });
            } else if ("css" == ext.toLowerCase()) {
              res.writeHead(200, { "Content-Type": "text/css;charset=UTF-8" });
            } else if (req.url.indexOf("/fonts/") > -1) {
              res.writeHead(200, {
                "Content-Type": "application/x-font-" + ext + ";charset=UTF-8",
              });
            }
          }
          fs.createReadStream(
            offsiteDir +
              req.url.substring(req.url.indexOf("pos-web/resources/") + 18)
          ).pipe(res);
        } else if (req.url.indexOf("/pos-web/images/") > -1) {
          var rootDir =
            req.url.indexOf("uploads") > -1 ? resourcesDir : offsiteDir;
          var filePath =
            rootDir + req.url.substring(req.url.indexOf("pos-web/") + 8);
          if (fs.existsSync(filePath)) {
            console.log(filePath);
            res.writeHead(200, { "Content-Type": "image/*;charset=UTF-8" });
            fs.createReadStream(filePath).pipe(res);
          } else {
            console.log("File " + filePath + " does not exist!");
            sendResponse(res, 200);
          }
        }
      }
    }
    /* TO BE OBSOLETED
		else 
		{
			/***********
			 * ONLINE
			 **********
			if(filterNotSupportOfflineRequest(false, req, res))
			{
				// Intended empty, Handling unsupported offline URLs
			}
			else if(req.url.indexOf('product/getProductByBarcode/') > -1) 
			{
				res.oldWriteHead = res.writeHead;
				res.writeHead = function(statusCode, headers) 
				{
					console.log("Server response status code: " + statusCode);
					if(statusCode === 500 || statusCode === 302) 
					{
						var barcode = req.url.substring(req.url.lastIndexOf('/') + 1);
						console.log("--500: getProductByBarcode--");
						if(barcode)
							localSearchProduct(barcode, res);
						if(statusCode === 302) sid = null;
					}
					else
					{
						res.oldWriteHead(statusCode, headers);
					}
				};
			}
			else if(req.url.indexOf('cashier/getTxn/') > -1) 
			{
				res.oldWriteHead = res.writeHead;
				res.writeHead = function(statusCode, headers) 
				{
					console.log("Server response status code: " + statusCode);
					if(statusCode === 500 || statusCode === 302) 
					{
                        var questionMarkIndex = (req.url.indexOf('?'));
                        var hasRequestParam   = (questionMarkIndex > -1);
                        var slashPosition     = (req.url.lastIndexOf('/') + 1);
						var txnId = (hasRequestParam)
                            ? req.url.substring( slashPosition, questionMarkIndex)
                            : req.url.substring( slashPosition);
						console.log("--500: getTxn--");
						localSearchTxn(txnId, res);
						if(statusCode === 302) sid = null;
					}
					else
					{
						res.oldWriteHead(statusCode, headers);
					}
				};
			}
			else if(req.url.indexOf('cashier/saveOrder') > -1 ||
					req.url.indexOf('cashier/voidOrder') > -1) 
			{
			    req.on("data", 
			    	function(chunk) 
				    {
				    	txnSaveData += chunk;
				    }
				);
			    req.on("end", 
			    	function(chunk) 
				    {
				    	if(chunk) txnSaveData += chunk;
				    }
				);
				res.oldWriteHead = res.writeHead;
				res.writeHead = function(statusCode, headers) 
				{
					console.log(new Date() + ": Server response status code: " + statusCode);
					if(statusCode === 500 || statusCode === 302) 
					{
						console.log("--500: save/void Order--");
						localSaveTxn(res);
						if(statusCode === 302) sid = null;
					}
					else 
					{
						res.oldWriteHead(statusCode, headers);
						var txnObj = JSON.parse(txnSaveData);
						if (txnObj && txnObj.taxInvoice && txnObj.taxInvoice.taxId
							&& configuration.properties.HC_USE_SMALL_PRINTER == 'false') 
						{
							console.log("---Printing Tax Invoice");
							router.printHypercashDoc('PRINT_TAX_INVOICE', txnObj);
							txnSaveData = '';
						} 
						else if (txnObj && txnObj.returnNote) 
						{
							console.log("---Printing Return Note");
							//txnObj.returnNote.printInBigPrinter = txnObj.printInBigPrinter;
							router.printHypercashDoc('PRINT_RETURN_NOTE', txnObj.returnNote);
							
							txnSaveData = '';
						} 
						else 
						{
							console.log("---Clearing txnSaveData");
							txnSaveData = '';
						}
					}
				};
			}
			else if(req.url.indexOf('cashier/saveTopUpTransaction/') > -1) 
			{
			    req.on("data", 
			    	function(chunk) 
			    	{
				    	txnSaveData += chunk;
				    }
				);
			    req.on("end", 
			    	function(chunk) 
			    	{
				    	if(chunk) txnSaveData += chunk;
						console.log(txnSaveData);
				    }
				);
				res.oldWriteHead = res.writeHead;
				res.writeHead = function(statusCode, headers) 
				{
					console.log(new Date() + ": Server response status code: " + statusCode);
					if(statusCode === 500 || statusCode === 302) 
					{
						var txnId = req.url.substring(req.url.lastIndexOf('/') + 1);
						console.log("--500: save TopUp--");
						localSaveTopUpTxn(txnId, res);
						if(statusCode === 302) sid = null;
					}
					else 
					{
						res.oldWriteHead(statusCode, headers);
						txnSaveData = '';
					}
				};
			}
			else if(req.url.indexOf('cashier/saveTopUpTransaction/') > -1) 
			{
			    req.on("data", 
			    	function(chunk) 
			    	{
				    	txnSaveData += chunk;
				    }
				);
			    req.on("end", 
			    	function(chunk) 
			    	{
				    	if(chunk) txnSaveData += chunk;
						console.log(txnSaveData);
				    }
				);
				res.oldWriteHead = res.writeHead;
				res.writeHead = function(statusCode, headers) 
				{
					console.log(new Date() + ": Server response status code: " + statusCode);
					if(statusCode === 500 || statusCode === 302) 
					{
						var txnId = req.url.substring(req.url.lastIndexOf('/') + 1);
						console.log("--500: save TopUp--");
						localSaveTopUpTxn(txnId, res);
						if(statusCode === 302) sid = null;
					}
					else 
					{
						res.oldWriteHead(statusCode, headers);
						txnSaveData = '';
					}
				};
			}
			else if(req.url.indexOf('cashier/saveCustFeedback') > -1 ) 
			{
			    req.on("data", 
			    	function(chunk) 
			    	{
				    	custFeedbackData += chunk;
				    }
				);
			    req.on("end", 
			    	function(chunk) 
			    	{
				    	if(chunk) custFeedbackData += chunk;
				    }
				);
				res.oldWriteHead = res.writeHead;
				res.writeHead = function(statusCode, headers) 
				{
					console.log("Server response status code: " + statusCode);
					if(statusCode === 500 || statusCode === 302) 
					{
						console.log("--500: saveCustFeedback--");
						localSaveFeedback(res);
						if(statusCode === 302) sid = null;
					}
					else
					{
						res.oldWriteHead(statusCode, headers);
						custFeedbackData = '';
					}
				};
			}
			else if(req.url.indexOf('cashier/getEftBankConfiguration/') > -1) 
			{
				res.oldWriteHead = res.writeHead;
				res.writeHead = function(statusCode, headers) 
				{
					console.log("Server response status code: " + statusCode);
					if(statusCode === 500 || statusCode === 302) 
					{
						var bankDesc = req.url.substring(req.url.lastIndexOf('/') + 1);
						console.log("--500: getEftBankConfiguration--");
						if(bankDesc)
							localSearchBankConfig(bankDesc, res);
						if(statusCode === 302) sid = null;
					}
					else
					{
						res.oldWriteHead(statusCode, headers);
					}
				};
			}
			else if(req.url.indexOf('cashier/getEftBankConfig/') > -1) 
			{
				res.oldWriteHead = res.writeHead;
				res.writeHead = function(statusCode, headers) 
				{
					console.log("Server response status code: " + statusCode);
					if(statusCode === 500 || statusCode === 302) 
					{
						var vendor = req.url.substring(req.url.lastIndexOf('/') + 1);
						console.log("--500: getEftBankConfiguration--");
						if(vendor)
							localSearchBankConfig(vendor, res);
						if(statusCode === 302) sid = null;
					}
					else
					{
						res.oldWriteHead(statusCode, headers);
					}
				};
			}
			else if(req.url.indexOf('cashier/getInstallmentCompany/') > -1) 
			{
				res.oldWriteHead = res.writeHead;
				res.writeHead = function(statusCode, headers) 
				{
					console.log("Server response status code: " + statusCode);
					if(statusCode === 500 || statusCode === 302) 
					{
						var icBarcode = req.url.substring(req.url.lastIndexOf('/') + 1);
						console.log("--500: getInstallmentCompany--");
						if(icBarcode)
							localSearchInstallmentCompany(icBarcode, res);
						if(statusCode === 302) sid = null;
					}
					else
					{
						res.oldWriteHead(statusCode, headers);
					}
				};
			}
			else if(req.url.indexOf('cashier/printTaxInvoice/') > -1) 
			{
				invoiceData = '';
				res.oldWriteHead = res.writeHead;
				res.writeHead = function(statusCode, headers) 
				{
					console.log("Server response status code: " + statusCode);
					if(statusCode === 500) 
					{
						var txnId = req.url.substring(req.url.lastIndexOf('/') + 1);
						console.log("--500: printTaxInvoice--");
						if(txnId)
							console.log('perform local search for tax invoice data'); // TODO
					}
					else
					{
						res.oldWriteHead(statusCode, headers);
						res.oldWrite = res.write;
						res.write = function(data) 
						{
							invoiceData += data;
							try 
							{
								var invoice = JSON.parse(invoiceData);
								if(invoice && invoice!=null && !invoice.error)
								{
									router.printHypercashDoc('REPRINT_TAX_INVOICE', invoice);
								}
							} 
							catch(error) 
							{

							}
							res.oldWrite(data);
						};
					}
				};
			}
			else if(req.url.indexOf('/j_spring_security_check') > -1) 
			{
				res.oldWriteHead = res.writeHead;
				res.writeHead = function(statusCode, headers) 
				{
					uid = res.getHeader('uid');
					sid = res.getHeader('sid');
					uname = res.getHeader('uname');
					res.removeHeader('uid');
					res.removeHeader('sid');
					res.oldWriteHead(statusCode, headers);
					console.log("Login: uid=" + uid + ", sid=" + sid + ", tid=" + configuration.terminalId+", uname:"+uname);
				};
			}
			else if(req.url.indexOf('cashier/getTodayTxn/') > -1) 
			{
				res.oldWriteHead = res.writeHead;
				res.writeHead = function(statusCode, headers) 
				{
					console.log("Server response status code: " + statusCode);
					if(statusCode === 500 || statusCode === 302) 
					{
						var txnId = req.url.substring(req.url.lastIndexOf('/') + 1);
						console.log("--500: getTodayTxn--");
						localSearchTxn(txnId, res);
						if(statusCode === 302) sid = null;
					}
					else
					{
						res.oldWriteHead(statusCode, headers);
					}
				};
			}
			else if(req.url.indexOf('/cashier/isThereLastTransaction') > -1) 
			{
				res.oldWriteHead = res.writeHead;
				res.writeHead = function(statusCode, headers) 
				{
					console.log("Server response status code: " + statusCode);
					if(statusCode === 500 || statusCode === 302) 
					{
						sendResponse(res, 200, 'OK', 'application/json;charset=UTF-8', false);
						if(statusCode === 302) sid = null;
					}
					else
					{
						res.oldWriteHead(statusCode, headers);
					}
				};
			}
			else if(req.url.indexOf('/product/doesCoBrandContainsDiscount') > -1) 
			{
				res.oldWriteHead = res.writeHead;
				res.writeHead = function(statusCode, headers) 
				{
					console.log("Server response status code: " + statusCode);
					if(statusCode === 500 || statusCode === 302) {
						sendResponse(res, 500, 'SERVER_OFFLINE', 'application/json;charset=UTF-8');
						if(statusCode === 302) sid = null;
					}
					else
					{
						res.oldWriteHead(statusCode, headers);
					}
				};
			}
			else if(req.url.indexOf('cashier/isValidForEmpDisc/') > -1) 
			{
				res.oldWriteHead = res.writeHead;
				res.writeHead = function(statusCode, headers) 
				{
					console.log("Server response status code: " + statusCode);
					var plu = req.url.substring(req.url.lastIndexOf('/') + 1);
					if(plu)
						localSearchEmpDiscExItem(plu, res);
					if(statusCode === 302) sid = null;
				};
			}
			else if(req.url.indexOf('/cashier/getCashierXReportData/') > -1) 
			{
				res.oldWriteHead = res.writeHead;
				res.writeHead = function(statusCode, headers) 
				{
					console.log("Server response status code: " + statusCode);
					if(statusCode === 500 || statusCode === 302) 
					{
						sendResponse(res, 500, 'SERVER_OFFLINE', 'application/json;charset=UTF-8');
						if(statusCode === 302) sid = null;
					}
					else
					{
						res.oldWriteHead(statusCode, headers);
					}
				};
			}

			if(!offsite) 
			{
				proxy.proxyRequest(req, res);
			}
		}*/
    //util.puts('=====> ' + req.url);
  });

  function sendResponse(res, statusCode, statusMsg, contentType, body) {
    try {
      res.writeHead(statusCode, statusMsg, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Content-Type": contentType,
      });
      res.end(body);
    } catch (e) {
      console.log("ERRO|Failed to send response: " + e);
    }
  }

  /* TO BE OBSOLETED - LUCKY - Since transaction always written to local file, no need on this
    function localSaveTxnOnECONNRESET(req, res) {
    	res.oldEnd = res.end;
    	res.end = function(data) {};
    	res.oldWrite = res.write;
    	res.write = function (chunk, encoding) {
    		console.log('-=>' + chunk);
    	};
    	if(txnSaveData && txnSaveData.length > 0) {
            var postObj = JSON.parse(txnSaveData);
            if(postObj) {
    			txdb.get(SALE_PREFIX + postObj.transactionId, function(err, value) {
    				if(err && err.type == 'NotFoundError') {
    					suspendTxnPush = true;
    					console.log(new Date() + ': Handle ECONNRESET for ' + postObj.transactionId);
    					res.removeHeader('Content-Length');
    					res.oldWriteHead(200, {'Content-Type': 'application/json;charset=UTF-8'});
    			        postObj.transactionDate = new Date();
    			        txdb.put(SALE_PREFIX + postObj.transactionId, postObj, function (err) {
    						if (err) {
    							suspendTxnPush = false;
    			  				console.log('TXDB_PUT_ERROR:', postObj.transactionId, err);
    				    		res.oldEnd(JSON.stringify({error:'TXDB_PUT_ERROR'}));
    						}
    						else {
    							console.log("===>", postObj.transactionId);
    							res.oldEnd(JSON.stringify({
    								transactionId  : postObj.transactionId,
    								transactionDate: postObj.transactionDate,
    								status		   : postObj.status
    							}));
    							res.emit('close');
    							// just in case the second econnreset doesn't
    							// come
    							setTimeout(function() {
    								console.log('reset suspendTxnPush flag');
    								suspendTxnPush = false;
    							}, 120000);
    						}
    			    	});
    					txnSaveData = '';
    				}
    				else {
    					console.log(new Date() + ': ECONNRESET reposted from server. Ignore this one. ' + postObj.transactionId);
    					console.log(txnSaveData);
    					txnSaveData = '';
    					suspendTxnPush = false;
    					res.emit('end');
    					res.emit('close');
    				}
    			});
            }
    	}
    	else {
    		console.log(new Date() + ': ECONNRESET reposted from server. Ignore this one.');
    		suspendTxnPush = false;
    		res.emit('end');
    		res.emit('close');
    	}
    }*/

  function localSearchEmpDiscExItem(plu, res) {
    res.removeHeader("Content-Length");
    res.oldWriteHead(200, {
      Connection: "keep-alive",
      "Content-Type": "application/json;charset=UTF-8",
    });
    res.oldEnd = res.end;
    res.end = function (data) {};

    var exDiscFile =
      configuration.properties["EMP_DISC_EX_ITEMS_PATH"] +
      configuration.properties["EMP_DISC_EX_ITEMS_FILE"];
    fs.exists(exDiscFile, function (exists) {
      if (exists) {
        var array = fs.readFileSync(exDiscFile).toString().split("\n");
        for (var i in array) {
          if (array[i] == plu) {
            res.oldEnd(JSON.stringify(false, { error: "TXDB_GET_ERROR" }));
            return;
          }
        }
      }
      res.oldEnd(JSON.stringify(true, { error: "TXDB_GET_ERROR" }));
      return;
    });
  }

  function localSearchMDRConfiguration(code, res) {
    res.removeHeader("Content-Length");
    res.oldWriteHead(200, {
      Connection: "keep-alive",
      "Content-Type": "application/json;charset=UTF-8",
    });
    res.oldEnd = res.end;
    res.end = function (data) {};
    var mdrObj = {
      id: "0000",
      bankName: "",
      binNo: "000000",
      mdrRate: "0",
    };

    for (var mdr in configuration.mdrConfiguration) {
      if (
        configuration.mdrConfiguration[mdr].binNo == code ||
        configuration.mdrConfiguration[mdr].bankName == code
      ) {
        mdrObj = configuration.mdrConfiguration[mdr];
        break;
      } else if (
        configuration.mdrConfiguration[mdr].bankName == "DEFAULT_MDR_BANK_MEGA"
      )
        mdrObj = configuration.mdrConfiguration[mdr];
    }

    res.oldEnd(JSON.stringify(mdrObj, { error: "TXDB_GET_ERROR" }));
  }

  /**
   * Function use for running unix terminal command.
   */
  function runUnixCommand(cmd, args, callBack) {
    var spawn = require("child_process").spawn;
    var child = spawn(cmd, args);

    child.stdout.on("data", function (data) {
      callBack({ data: data.toString() });
    });
    child.stderr.on("data", function (data) {
      callBack({ error: data.toString() });
    });
  }

  /* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
   * START: Unsupported URL implementation
   * <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
   */

  var unsupportedOfflineRequestReturnData = {
    name: "NOT_SUPPORTED_OFFLINE",
    message: "common_operation_not_supported_offline",
  };

  var noPromptReturnData = {
    name: "NO_PROMPT",
    message: null,
  };

  /**
   * Returns true if supported NOT offline,
   * false if supported.
   */
  function filterNotSupportOfflineRequest(isProxyError, req, res) {
    var isFound = false;
    if (typeof configuration.properties["KEY_UNSUPPORTED_URLS"] == "undefined")
      return false;
    var unsupportedURLsArr =
      JSON.parse(configuration.properties["KEY_UNSUPPORTED_URLS"]) || [];
    unsupportedURLsArr.some(function (name) {
      var unsupportedURL = name.trim();
      var hasNoPrompt = unsupportedURL.indexOf("!") > -1;
      unsupportedURL = hasNoPrompt
        ? unsupportedURL.substring(1)
        : unsupportedURL;
      if (req.url.indexOf(unsupportedURL) > -1) {
        if (isProxyError || !online) {
          res.removeHeader("Content-Length");
          sendResponse(
            res,
            500,
            "ERROR",
            "application/json;charset=UTF-8",
            JSON.stringify(
              hasNoPrompt
                ? noPromptReturnData
                : unsupportedOfflineRequestReturnData
            )
          );
        } else {
          handleUnsupportedOfflineRequest(name, res);
        }
        // found the url, break
        isFound = true;
      }
      return isFound;
    });
    return isFound;
  }

  function handleUnsupportedOfflineRequest(reqUrl, res) {
    res.oldWriteHead = res.writeHead;
    res.writeHead = function (statusCode, headers) {
      console.log("Server response status code: " + statusCode);
      if (statusCode === 500 || statusCode === 302) {
        res.removeHeader("Content-Length");
        res.oldWriteHead(500, {
          "Content-Type": "application/json;charset=UTF-8",
        });
        res.oldEnd = res.end;
        res.end = function (data) {};
        res.oldEnd(JSON.stringify(unsupportedOfflineRequestReturnData));

        if (statusCode === 302) sid = null;
      } else {
        res.oldWriteHead(statusCode, headers);
      }
    };

    /* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
     * END: Unsupported URL implementation
     * <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
     */
  }
};

/**
 * Class for configuration polling.
 */
function ConfigurationPoll() {
  var self = this;
  var clientIO = null;
  var startFlag = false;

  ConfigurationPoll.prototype.setClientIO = function (io) {
    clientIO = io;
  };

  ConfigurationPoll.prototype.startPolling = function () {
    if (!startFlag) {
      startFlag = true;
      this.processConfigPoll();
    }
  };

  ConfigurationPoll.prototype.stopPolling = function () {
    startFlag = false;
    console.log("Server Not Reachable. Polling Stops.");
  };

  ConfigurationPoll.prototype.processConfigPoll = function (timeout) {
    if (!timeout) timeout = 0;
    setTimeout(function () {
      if (startFlag) {
        var options = {
          host: config.posServer.url,
          port: config.posServer.port,
          path:
            config.posServer.ctxPath +
            "/sys/conf/getConfig/" +
            (configuration && configuration.lastUpdateMillis
              ? configuration.lastUpdateMillis
              : 0),
          method: "GET",
          headers: {
            accept: "application/json;charset=UTF-8",
          },
        };
        http
          .get(options, function (res) {
            var configData = "";
            res.on("data", function (data) {
              configData += data;
            });
            res.on("end", function (data) {
              if (data) configData += data;

              try {
                var configJson = JSON.parse(configData);
                if (configJson && configJson.lastUpdateMillis) {
                  console.log(JSON.stringify(configJson, undefined, 2));
                  configuration.lastUpdateMillis = configJson.lastUpdateMillis;
                  var propKeys = Object.keys(configJson.properties);
                  for (var i = 0; i < propKeys.length; i++) {
                    configuration.properties[propKeys[i]] =
                      configJson.properties[propKeys[i]];
                    console.log(
                      propKeys[i],
                      " = ",
                      configuration.properties[propKeys[i]]
                    );
                  }
                  if (clientIO)
                    clientIO.sockets.emit("configUpdateData", configData);
                  else console.log("Error must set clientIO!");
                }
              } catch (e) {
                console.log("ERROR: ", e);
              }
              self.processConfigPoll();
            });
            res.on("error", function (error) {
              self.processConfigPoll();
            });
          })
          .on("error", function (err) {
            if (
              err.code == "ECONNREFUSED" ||
              err.code == "ENETUNREACH" ||
              err.code == "EHOSTUNREACH"
            ) {
              console.log("poll again after 30 sec");
              self.processConfigPoll(30000);
            } else {
              self.processConfigPoll();
            }
          });
      }
    }, timeout);
  };
}

function serverStatusPolling() {
  this.clientIOInstance = null;
  this.proxyInstance = null;
  this.statusPoller = null;

  (serverStatusPolling.prototype.addProxyListener = function (clientIO, proxy) {
    this.clientIOInstance = clientIO;
    this.proxyInstance = proxy;

    proxy.on("end", function (req, res) {
      if (!online) {
        online = true;
        clientIO.sockets.emit("connStatus", true);
      }
    });
    proxy.on("proxyError", function (err, req, res) {
      // console.log("-- ProxyListener Error, Error Code: %s--", err.code);
      if (
        err.code == "ECONNREFUSED" ||
        err.code == "ENETUNREACH" ||
        err.code == "EHOSTUNREACH"
      ) {
        if (online) {
          online = false;
          clientIO.sockets.emit("connStatus", false);
        }
      }
    });
  }),
    (serverStatusPolling.prototype.stopPolling = function () {
      var poller = this.statusPoller;
      if (poller) {
        clearInterval(poller);
        poller = null;
      }
    });

  serverStatusPolling.prototype.startPolling = function (interval) {
    var clientIO = this.clientIOInstance;
    this.statusPoller = setInterval(
      function () {
        //console.log("-- Pinging Server --");
        var options = {
          host: config.posServer.url,
          port: config.posServer.port,
          path: config.posServer.ctxPath + "/sys/pingSystem",
          method: "GET",
          headers: {
            accept: "application/json;charset=UTF-8",
          },
        };
        http
          .get(options, function (res) {
            var resData = "";
            res.on("data", function (data) {
              resData += data;
            });
            res.on("end", function (data) {
              if (data) resData += data;

              if (!online) {
                if (clientIO) {
                  online = true;
                  clientIO.sockets.emit("connStatus", true);
                } else {
                  console.log("clientIOInstance not provided");
                }
              }
            });
          })
          .on("error", function (err) {
            //console.log("-- Pinging Server Error, Err Code: %s --", err.code);
            if (
              err.code == "ECONNREFUSED" ||
              err.code == "ENETUNREACH" ||
              err.code == "EHOSTUNREACH"
            ) {
              if (online) {
                online = false;
                if (clientIO) {
                  clientIO.sockets.emit("connStatus", false);
                } else {
                  console.log("clientIOInstance not provided");
                }
              }
            }
          });
      },
      interval ? interval : 30000
    );
  };
}

//error catch on serial ports to allow proxy to continue
serialport.on("error", function () {
  console.log("An error has occured on serial port.");
});

// MISC ADAPTED FUNCTIONS FROM UI
function isValidPromoTime(promotion, time, data) {
  if (!promotion.startTime || !promotion.endTime) {
    return isValidPromoDate(promotion);
  }

  // 24 hour time format can be compared as string as long as HH:MM:SS format

  var currentDate = new Date();
  var hours = currentDate.getHours();
  var minutes = currentDate.getMinutes();

  if (hours < 10) {
    hours = "0" + hours;
  }

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  var scanTime = (time ? time : hours + ":" + minutes) + ":00";
  var startTime = promotion.startTime + ":00";
  var endTime = promotion.endTime + ":00";

  if (startTime < endTime && scanTime >= startTime && scanTime <= endTime) {
    return isValidPromoDate(promotion);
  } else if (startTime > endTime) {
    try {
      var startTimeArray = promotion.startTime.split(":");
      var endTimeArray = promotion.endTime.split(":");
      var scanTimeArray = scanTime.split(":");
      var startDate = new Date(promotion.startDate);
      var endDate = new Date(promotion.endDate);
      var scanDate =
        time && itemScanDatesMap[time + data.id]
          ? itemScanDatesMap[time + data.id]
          : currentDate;

      endDate.setDate(endDate.getDate() + 1);
      startDate.setHours(
        parseInt(startTimeArray[0]),
        parseInt(startTimeArray[1]),
        0,
        0
      );
      endDate.setHours(
        parseInt(endTimeArray[0]),
        parseInt(endTimeArray[1]),
        0,
        0
      );
      scanDate.setHours(
        parseInt(scanTimeArray[0]),
        parseInt(scanTimeArray[1]),
        0,
        0
      );

      //check scan date time is within the date time period
      if (scanDate >= startDate && scanDate <= endDate) {
        if (scanTime < startTime) {
          //time is not null, for void item
          startDate.setDate(scanDate.getDate() - 1);
          endDate.setDate(scanDate.getDate());
        } else if (scanTime >= startTime) {
          startDate.setDate(scanDate.getDate());
          endDate.setDate(scanDate.getDate() + 1);
        }
      } else {
        return false;
      }

      //check against the new filter start date time and end date time
      if (scanDate >= startDate && scanDate <= endDate) {
        return true;
      }
    } catch (e) {
      console.log("Error in validating time");
    }
  }

  return false;
}

function isValidPromoDay(promotion) {
  var promoDays = promotion.promoDay;

  if (promoDays == "All") {
    return true;
  }

  var currentDate = new Date();
  var currentDay = currentDate.getDay();

  if (promoDays.indexOf(currentDay) != -1) {
    return true;
  }

  return false;
}

function isValidPromoDate(promotion) {
  var currentDate = new Date();
  var startDate = new Date(promotion.startDate);
  var endDate = new Date(promotion.endDate);

  currentDate.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  // INHOUSE VOUCHER 2017-05-04
  if (
    currentDate >= startDate &&
    (currentDate <= endDate || promotion.type == "94")
  ) {
    return true;
  }
  // INHOUSE VOUCHER 2017-05-04

  return false;
}

function isItemCMC(barcode, promotionsMap) {
  for (var i in promotionsMap) {
    for (var j in promotionsMap[i]) {
      if (
        promotionsMap[i][j].promotionType == "M" &&
        barcode == promotionsMap[i][j].ean13code
      )
        return true;
    }
  }

  return false;
}
