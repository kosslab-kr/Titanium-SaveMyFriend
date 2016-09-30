/**
 * global
 */
var APP = require("core");
var UTIL = require("utilities");
var STRING = require("alloy/string");
var SMSSEND = require("smssender");

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
var mobileNumber;
// android get mobile number
CTX.getMobileNumber = function() { // 내 번호를 가져와 알람을 띄워줌
  if (OS_ANDROID) {
    var ASV = require('ti.andsmsverification');
    mobileNumber = ASV.getMobileNumber();
    APP.log("debug", "CTX.getMobileNumber :", mobileNumber);

    if (mobileNumber) {
      mobileNumber = mobileNumber.replace(CTX.localNm, "");
      // TODO
      //APP.alert(mobileNumber);
    }
  }
};


//-------------------------------------- [ sms 파싱 및 스위치 버튼을 통한 제어 ]----------------------------------------------//
var smsTypeFlag = new Array(); // 배열에 스위치 저장, on/off시 true/false값이 저장됩니다.
var smsTypeLabel = new Array(); // 배열에 스위치의 라벨 텍스트값(홍수, 태풍, 지진)이 저장됩니다.
const DISASTER_NUM = 3; // 재난의 개수 3개 임의설정.

for(var i=0; i<DISASTER_NUM;  i++){
	smsTypeLabel[i] = $["label"+i].text; // 라벨의 텍스트값을 smsTypeLabel배열에 저장
	smsTypeFlag[i] = $["basicSwitch"+i].value; // smsTypeFlag 초기화
}

// 버튼이 on<->off로 상태가 바뀌면 smsTypeFlag변수에 true/flase값이 저장됩니다.


function outputState(){
	for(var i=0; i<DISASTER_NUM; i++){
		smsTypeFlag[i] = $["basicSwitch"+i].value; 
	}
	var selectM = list.createContactRow();
// for(var i =0; i<selectM.length;i++){
	// alert(selectM(i).name);
// }

};

// 국민안전처 문자메세지 수신 번호 체크 함수
function searchNum(num){ // 
	var findNum = num.match(/01026059941/ig); /** 수정해야할 부분 : 국민안전처 번호로 수정해야함 **/
	if(findNum != null) { // 해당 번호를 찾으면 true
		return true;
	}
	else { // 찾지 못하면 false
		return false;
	}
 };

// 국민안전처 문자메세지 수신 내용 체크 함수
function searchTxt(txt){
	var findTxt = new Array();
	for(var i=0; i<DISASTER_NUM; i++){
		findTxt[i] = txt.match(smsTypeLabel[i]); // match함수를 이용한 재난 문자 파싱
	}
	
	for(var i=0;i<3;i++){
		// 각 배열의 원소가 재난 문자 요소(홍수, 지진, 태풍)를 가지고 있는지 판별하고
		// 해당 값이 존재하면 해당 값을 return, 존재하지 않으면 false
		if(findTxt[i] != null)  
			return findTxt[i];
		else
			continue;
	}
	return false;
}

// -------------


// -------------




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
      // 1. 먼저 국민안전처에서 보낸 문자 인지 확인.
      var flag_num = searchNum(e.from);
      if(flag_num){
      	//2. 재난의 종류 파악
      	var flag_txt = searchTxt(e.message);
      	if(flag_txt!=false){ // 찾은 재난 문자 요소가 있다면
      		//3. 재난의 종류와 일치하는 라벨의 스위치가 켜져있는지 검사
      		for(var i=0;i<DISASTER_NUM;i++){
      			if(smsTypeLabel[i]==flag_txt && (smsTypeFlag[i])){ // sms에서 파싱된 재난 종류와 라벨이 일치하고      			
   					alert("[SUCCESS] 재난 문자 수신, 재난의 종류는 " + flag_txt); //
   					SMSSEND.smsSend(message);
   					break; // 하나의 재난 문자에 재난의 종류는 1개뿐이므로 break (임의로 정함)
      			}
      		}
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
