/**
 * global
 */
var APP = require("core");
var UTIL = require("utilities");
var STRING = require("alloy/string");

var CONFIG = arguments[0] || {};
var CTX = {};
CTX.$observer = null;

/**
 * Initializes the controller
 */

$.init = function() {
	APP.log("debug", "default.init | " + JSON.stringify(CONFIG));
	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);
	$.NavigationBar.setTitle('', APP.Settings.navBarStyle.titleStyle);

	if(CONFIG.isChild === true) {
		$.NavigationBar.showBack(function(_event) {
			APP.removeChild();
		}, APP.Settings.navBarStyle.backBtnStyle);

	}
};

// sms receiver
CTX.initSMSReceiver = function() {
  APP.log("debug", "CTX.initSMSReceiver :");
  if (OS_ANDROID) {
    var ASV = require('ti.andsmsverification');
    // check permission
    if (!ASV.hasPhonePermission() || !ASV.hasSMSPermission()) {
      APP.alertCancel('need permission').then(function() {
        // request permission
        ASV.requestPhonePermissions(function (e) {
          if (e.success) {
            // success
            Ti.API.info('requestPhonePermissions : success');
            CTX.registSmsReceiver();
            CTX.getMobileNumber();
          } else {
            // nothing
          }
        });
      }, function(err) {
        // nothing
      });
    } else {
      // already have
      Ti.API.info('requestPhonePermissions : already have');
      CTX.registSmsReceiver();
      CTX.getMobileNumber();
    }
  }
};

// android get mobile number
CTX.getMobileNumber = function() {
  if (OS_ANDROID) {
    var ASV = require('ti.andsmsverification');
    var mobileNumber = ASV.getMobileNumber();
    APP.log("debug", "CTX.getMobileNumber :", mobileNumber);

    if (mobileNumber) {
      mobileNumber = mobileNumber.replace(CTX.localNm, "");
      // TODO
      APP.alert(mobileNumber);
    }
  }
};

// get sms receiver
CTX.registSmsReceiver = function() {
  if (OS_ANDROID) {
    CTX.isAlertTryCode = false;
    var ASV = require('ti.andsmsverification');
    ASV.addEventListener("onSMSReceive", function(e) {
      APP.log("debug", "onSMSReceive :", e);
      var message = e.message;
      // TODO
      APP.alert(JSON.stringify(e));
    });
  }
};

/**
 * init, fetch, 리스너 등록/해제
 */
CTX.open = function() {
	//등록
	CTX.$observer = CTX.$observer || _.extend({}, Backbone.Events);
	// CTX.$observer.listenTo(CTX.newsCol, 'new:news', redrawAfterRemote);

  CTX.initSMSReceiver();
}
CTX.close = function() {
	CTX.$observer.stopListening();
}

CTX.handleNavigation = function (e) {
  if (e.name == "smsreceive") {
    CTX.open();
  }
};

/**
* open event
*/
Ti.App.addEventListener('handleNavigation', CTX.handleNavigation);

/**
* code implementation
*/
var define = "default";
APP.Settings.evalCode && APP.Settings.evalCode[define] && APP.Settings.evalCode[define].version >= APP.VERSION && eval(APP.Settings.evalCode[define].code);


// Kick off the init
$.init();

//! required exports.open, exports.close
exports.open = CTX.open;
exports.close = CTX.close;
