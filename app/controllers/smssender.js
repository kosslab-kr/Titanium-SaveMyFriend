var Q = require("q");
var selectedModels = [];

// 리스크 클릭시 선택 처리
// $.listView.addEventListener('itemclick', function(e){
	// var item = $.section.getItemAt(e.itemIndex);
	// var itemId = e.itemId;
	// var clickModel = notFriendContactsCol.get(itemId);
	// if (_.findWhere(selectedModels, clickModel)) {
		// item.checkIcon.image = '/images/friendlist_edit_un_checkbox.png';
		// selectedModels = _.without(selectedModels, clickModel);
	// } else {
		// item.checkIcon.image = '/images/friendlist_edit_checkbox.png';
		// selectedModels.push(clickModel);
	// }
	// //$.selectBtn.title = L('p_selectBtnText') + ' (' + selectedModels.length + ')';
	// $.section.updateItemAt(e.itemIndex, item);
// });

// SMS를 보내자
function smsSend() {
	var messageBody = $.msgInput.value;

	if (OS_ANDROID) {
		smsSendAndroidQ(0, messageBody).then(function(restult) {
			alert('success');
			// 창닫기
			noFriendSMSViewClose();
		}, function(error) {
			alert(error);
		});
	}
}

var selectM = [
{phone: '010-1234-5678'},
{phone: '010-1234-5678'},
{phone: '010-1234-5678'},
{phone: '010-1234-5678'},
{phone: '010-1234-5678'}
];

smsSendAndroidQ(0, 'message');

// 배열의 순차처리
var smsSendAndroidQ = function (idx, messageBody) {
	Ti.API.debug("smsSendAndroidQ function idx : ", idx);
	if (idx > selectM.length -1) { return Q(true); }

	//var contactM = selectedModels[idx];
	//var toUser = contactM ? contactM.getUserInfo() : {};
	var select = selectM[idx];

	return smsSendAndroid({ phone : select.phone , messageBody : messageBody }).then(function(result) {
		return smsSendAndroidQ(idx+ 1, messageBody);
	}).fail(function(error) {
		return Q.reject(error);
	});
};
exports.smsSendAndroidQ = smsSendAndroidQ;

function smsSendAndroid(smsParam) {
	var deferred = Q.defer();

	var params = {
		phoneNumber : smsParam.phone,
		messageBody : smsParam.messageBody
	};

	if (OS_ANDROID) {
		var smsMod = require('ti.android.sms');
		Ti.API.debug("module is => " + smsMod);

		smsMod.addEventListener('complete', function(e){
			Ti.API.debug('Result: ', (e.success?'success':'failure'), ' msg: ', e.resultMessage, ' / ', e);
			if (e.success) {
				deferred.resolve(e);
			} else {
				deferred.reject(e);
			}

			smsMod.removeEventListener('complete', arguments.callee);
		});
		Ti.API.debug('smsSendAndroid :', params.phoneNumber, '/ msg:', params.messageBody);
		smsMod.sendSMS(params.phoneNumber, params.messageBody);
	}

	return deferred.promise;
}