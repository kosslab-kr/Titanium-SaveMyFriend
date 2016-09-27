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
  if (OS_ANDROID) {
    var ASV = require('ti.andsmsverification'); // 문자 모듈 불러옴
    // check permission
    if (!ASV.hasPhonePermission() || !ASV.hasSMSPermission()) { // 문자 permission(권한)이 없다면
      APP.alertCancel('need permission').then(function() { // 권한이 필요하다는 알람을 띄운 후
        // request permission
        ASV.requestPhonePermissions(function (e) { // 권한 요청
          if (e.success) { // 수락하면 권한을 얻는다
            // success
            Ti.API.info('requestPhonePermissions : success');
            CTX.registSmsReceiver();
            CTX.getMobileNumber();
          } else { // 거절
            // nothing
          }
        });
      }, function(err) {
        // nothing
      });
    } else {  //권한이 있다면
      // already have
      Ti.API.info('requestPhonePermissions : already have');
      CTX.registSmsReceiver();
      CTX.getMobileNumber();
    }
  }
};

// android get mobile number
CTX.getMobileNumber = function() { // 내 번호를 가져와 알람을 띄워줌
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
CTX.registSmsReceiver = function() { //문자를 받으면 알람을 띄워줌
  if (OS_ANDROID) {
    CTX.isAlertTryCode = false;
    var ASV = require('ti.andsmsverification');
    ASV.addEventListener("onSMSReceive", function(e) { // 메시지를 받아 e 변수에 저장
      APP.log("debug", "onSMSReceive :", e);
      var message = e.message;
      // TODO 문자열 파싱하여 필터링하기
      // APP.alert(e); // e를 그냥 띄우는 부분
     APP.alert(JSON.stringify(e)); // e를 JSON으로 변환시켜 띄우는 부분
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
