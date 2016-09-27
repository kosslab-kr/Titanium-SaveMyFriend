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


CTX.createContactRow = function (){
	var people = Titanium.Contacts.getAllPeople(); // 연락처 데이터 목록들
	var totalContacts = people.length;
	
	for( var index = 0; index < totalContacts; index++ ){
         var person = people[index]; // 연락처 항목
         var phone = "";
         Titanium.API.info(person.fullName); // 로그
        try{
        	 phone = person.phone.mobile[0];
			Titanium.API.info(phone);
        }catch(e){Titanium.API.info("pulltorefresh : 번호 예외 발생");}
        /*
        var contactRows = _.map(person,function(person){
        	 if(person.fullName != null){
        		return{
    				template : 'ContactTemplate',
						name : { text: person.fullName },
						 num : { text: phone },
    				properties : {
        				itemId : ContactModel.id
    				}
  				};
  			}
        });
        */
        //TODO 위의 contactRows 를 밑의 코드를 참고하여 수정한 후 ContactsSection에 추가해야한다.
         // Titanium.API.info(contactRows); // 로그
       // $.ContactsSection.setItems(contactRows);
    }
};
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
	CTX.createContactRow();
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
