/**
 * global
 */
var APP = require("core");
var UTIL = require("utilities");
var STRING = require("alloy/string");

var CONFIG = arguments[0] || {};
var CTX = {};
CTX.$observer = null;

// 추가 부분
// var userOnOff = APP.SettingsM.get("userOnOff");
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

CTX.checkPermissions = function (){
	if(Ti.Contacts.hasContactsPermissions()){  // 전화번호부 권한이 있으면
		CTX.createContactRow(); // 권한요청없이 전화번호부 리스트 생성
	}
	else { // 권한이 없으면 권한 요청
		Ti.Contacts.requestContactsPermissions(function (e) { // 
			if(e.success) // 권한 수락시 연락처 생성
				CTX.createContactRow();
			else{
				//nothing
			}
		});	
	}
	 
};

CTX.createContactRow = function (){
	var data = [];
	var people = Titanium.Contacts.getAllPeople(); // 연락처 데이터 목록들
	var totalContacts = people.length;
	
	for( var index = 0; index < totalContacts; index++ ){
         var person = people[index]; // 연락처 항목
         var phone = "";
        try{
        	 phone = person.phone.mobile[0];
        }catch(e){Titanium.API.info("pulltorefresh : 번호 예외 발생");}
        
        var switchValue = Ti.App.Properties.getBool(person.fullName); // 스위치값
        if(switchValue == null) switchValue = false; // 스위치값이 null이라면 false
        Titanium.API.error(person.fullName); 
        Titanium.API.error(switchValue); // 로그
        
        var contactRows = {template : 'ContactTemplate', // view 폴더의 pulltorefresh.xml 참조
						   		name : { text: person.fullName },
						   		num : { text: phone },
						   		test_switch : { value : switchValue },					   			 
    							properties : {
        							itemId : index.id, searchableText: person.fullName //검색과 관련
    							}
    						};
          data.push(contactRows); //data 배열에 템플릿 push
    }
    //섹션에 데이터 set
    $.ContactsSection.setItems(data);
    //return data;
};

// 연락처 검색과 관련된 함수들
function contactSearch(e){
	$.ContactsSection.searchText = e.value;
};
function cancelSearch(){
	$.ContactSearch.blur();
};
// 스위치 클릭시 switchClickListener 와 addEventListener 가 같이 호출된다.
var switchValue; // 스위치값
// 리스트 내 버튼 클릭 시 함수
function switchClickListener(e){ // 스위치 클릭 리스너
	Ti.API.info('target: ' + JSON.stringify(this));
	Ti.API.info('Switch value: ' + e.value); // 현재 값
	switchValue = e.value; // 스위치 클릭 시 저장
	// APP.SettingsM.set(this.target, e.value).save();
};

$.listView.addEventListener('itemclick',function(e){ //리스트뷰 클릭 리스너
    var currentRow = e.section.getItemAt(e.itemIndex); // 현재 열의 정보를 가져옴
    Ti.API.error('listview click: ' + JSON.stringify(currentRow));
    var name = currentRow.name.text; // 현재 열의 이름을 name에 저장
    var phoneNum = JSON.stringify(currentRow.num.text); // 현재 열의 이름을 name에 저장
    Ti.API.error('name: ' + name);
    Ti.API.error('switchValue: ' + switchValue);
    
    var phoneArr = APP.SettingsM.get("phoneArr2"); // 번호 배열 불러옴
       if(phoneArr == null) phoneArr = {}; // 번호 배열이 null이라면 초기화
    Ti.API.error('phoneArr-: ' + JSON.stringify(phoneArr));
    
    if(switchValue == true){
        Ti.App.Properties.setBool(name, true); //id값 = 이름, switchvalue 으로 저장
        phoneArr[name] = phoneNum; 
        // Ti.App.Properties.setString("contactArr2", phoneArr); //id값 = 이름, switchvalue 으로 저장        Ti.App.Properties.setBool(name, false); 
        APP.SettingsM.set("phoneArr2", phoneArr).save();
    }else{
    	Ti.App.Properties.setBool(name, false); 
    }
    Ti.API.error('getsaveValue : ' + Ti.App.Properties.getBool(name));
    
});

// 밑의 부분은 사용하지 않는다.
// fetch from parse
// STUDY : http://parseplatform.github.io/docs/js/guide/#queries
// {e} is pulltorefresh event
CTX.fetchGameScore = function(e) {
	var GameScore = Parse.Object.extend("GameScore");
	var query = new Parse.Query(GameScore);
	// query.equalTo("playerName", "Dan Stemkoski");
	query.find({
	  success: function(results) {
			APP.log("debug", "Successfully retrieved " + results.length + " scores.");
	    // Do something with the returned Parse.Object values
	    CTX.drawGameScore(results);

			if (e) e.hide();
	  },
	  error: function(error) {
			APP.log("error", "Error: " + error.code + " " + error.message);

			if (e) e.hide();
	  }
	});
};


// drawGameScore
CTX.drawGameScore = function(GameScoreCollection) {
	// using undersocre.js _.map function
	// STUDY : http://underscorejs.org/
	var GameScoreRows = _.map(GameScoreCollection, function (GameScoreModel){
    return CTX.createGameSCoreRow(GameScoreModel);
  });
  //값넣기.
  $.GameScoreSection.setItems(GameScoreRows);
};

// create listitem row
// STUDY : http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.ListItem
CTX.createGameSCoreRow = function (GameScoreModel) {
  var _playerName = GameScoreModel.get('playerName');
  var _score = GameScoreModel.get('score');
	var _cheatMode = GameScoreModel.get('cheatMode') ? "TRUE" : "FALSE";
  return  {
    template : 'GameScoreTemplate',
    playerName : { text: _playerName },
		score : { text: _score },
		cheatMode : { text: _cheatMode },
    properties : {
        itemId : GameScoreModel.id
    }
  };
};

/**
* scroll end for position save
*/
CTX.listViewScrollend = function (e) {
  if (OS_IOS) {
    CTX.scrollItemIndex = e.firstVisibleItemIndex + e.visibleItemCount;
  } else {
    CTX.scrollItemIndex = e.firstVisibleItemIndex;
  }
  CTX.lastVisibleItemIndex = e.firstVisibleItemIndex + e.visibleItemCount;
};

/**
 * init, fetch, 리스너 등록/해제
 */
CTX.open = function() {

	CTX.$observer = CTX.$observer || _.extend({}, Backbone.Events);
	// CTX.$observer.listenTo(CTX.newsCol, 'new:news', redrawAfterRemote);
	//이곳에서 화면의 띄워질 때 실행되는 함수를 입력한다.
	CTX.checkPermissions();
};
CTX.close = function() {
	CTX.$observer.stopListening();
};

/**
* handleNavigation event
*/
CTX.handleNavigation = function (e) {
  if (e.name == "listview/pulltorefresh") {
    handleNavigation(e);
  } else if (APP.previousType == "listview/pulltorefresh") {
    _.defer(handleNavigation, e);
  }

  function handleNavigation(e) {
    if (e.name == "listview/pulltorefresh") {
      CTX.open();
    }

    // pullToRefresh
    if (OS_ANDROID || (OS_IOS && !CTX.pullToRefresh)) {
      $.mainView.removeAllChildren();
      if (CTX.ptr) {
        CTX.ptr.removeView($.listView);
        CTX.ptr.destroy();
        CTX.ptr = null;
      }
      if (e.name == "listview/pulltorefresh") {
        CTX.pullToRefresh = true;

        CTX.ptr = Alloy.createWidget("nl.fokkezb.pullToRefresh", "widget", {
          id: "ptr",
          children: [ $.listView ]
        });
        CTX.ptr.setParent($.mainView);
        CTX.ptr.on("release", CTX.fetchGameScore);

        // restore position
        if (CTX.scrollItemIndex) {
          $.listView.scrollToItem(1, CTX.scrollItemIndex, {animated:false});
        }
      }
    }
  }
};

/**
* open event
*/
Ti.App.addEventListener('handleNavigation', CTX.handleNavigation);

/**
* code implementation
*/
var define = "listview_pulltorefresh";
APP.Settings.evalCode && APP.Settings.evalCode[define] && APP.Settings.evalCode[define].version >= APP.VERSION && eval(APP.Settings.evalCode[define].code);


// Kick off the init
$.init();

//! required exports.open, exports.close
exports.open = CTX.open;
exports.close = CTX.close;
