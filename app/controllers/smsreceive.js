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


//-------------------------------------- [ sms 파싱 및 스위치 버튼을 통한 제어 ]----------------------------------------------//
var smsTypeFlag; // 여러개의 스위치로 배열을 선언하려 했으나 일단 변수로 선언했습니다. on/off시 true/false값이 저장됩니다.
function outputState(){ // 버튼이 on<->off로 상태가 바뀌면 smsTypeFlag변수에 true/flase값이 저장됩니다.
	smsTypeFlag = $.basicSwitch.value;
}

// 국민안전처 문자메세지 수신 번호 체크 함수
function searchNum(num){
	var findNum = num.match(/01032290420/ig); // ->>> match(/찾고싶은번호/ig); ig-> i:insensitive, g:globally
	if(findNum != null) { // 해당 번호를 찾으면 true
		return true;
	}
	else { // 찾지 못하면 false
		return false;
	}
 };

// 국민안전처 문자메세지 수신 내용 체크 함수
function searchTxt(txt){
	var findTxt = txt.match(/홍수/ig); // ->>> match(/찾고싶은문자/ig); ig-> i:insensitive, g:globally
	if(findTxt != null){ // 해당 문자를 발견했으면 그 재난을 리턴시킵니다.
		return findTxt;
	}
	else{
		return false; // 해당 문자를 발견하지 못했으면 false
	}
}

// get sms receiver
CTX.registSmsReceiver = function() { //문자를 받으면 알람을 띄워줌
  var txt="";
  if (OS_ANDROID) {
    CTX.isAlertTryCode = false;
    var ASV = require('ti.andsmsverification');
    ASV.addEventListener("onSMSReceive", function(e) { // 메시지를 받아 e 변수에 저장
      APP.log("debug", "onSMSReceive :", e);
      var message = e.message;
      // TODO 문자열 파싱하여 필터링하기
      
     if( smsTypeFlag == true){ // 만일 (홍수)스위치가 on일때 //
     	var flag_num = searchNum(e.from); // 발신자를 추적하여 국민안전처에서 보낸 문자인지 확인하고
     	var flag_txt = searchTxt(e.message); // 메세지 내용 중 스위치 on인 재난 문자 메세지가 포함되어 있을 경우
     	if( flag_num && (flag_txt!=false)){ // 참이면 다음과 같은 알림이 뜨게 됩니다.
     		APP.alert("재난 문자 수신, 재난 문자 종류는 " + flag_txt);
     	}
     }
     
    });
  }
};

//-------------------------------------- [ sms 파싱 및 스위치 버튼을 통한 제어 ]----------------------------------------------//
/**
 * init, fetch, 리스너 등록/해제
 */
CTX.open = function() {
	//등록
	CTX.$observer = CTX.$observer || _.extend({}, Backbone.Events);
	// CTX.$observer.listenTo(CTX.newsCol, 'new:news', redrawAfterRemote);

  CTX.initSMSReceiver();
};
CTX.close = function() {
	CTX.$observer.stopListening();
};

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
