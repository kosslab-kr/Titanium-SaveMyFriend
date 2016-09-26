/** split을 이용한 문자열 가르기 TEST CODE **/
// 실행시 거꾸로 출력되는 이유는 모르겠다 (중요하진 않음) //

var window = Ti.UI.createWindow({
	backgroundColor : 'white'
});

var text = Ti.UI.createLabel({
	text : 'hi my name is jin jae eon',
	color : 'black',
	top : 60
});
var button = Ti.UI.createButton({
	title : 'split하고 각 원소 띄우기'
});
var a = text.getText();

var result;
var state = 0;
button.addEventListener('click', function(e) {
	result = a.split(" "); //split(" "); 
	
	for(var i=0; i<result.length; i++){
		if(result[i] == "jin12"){
		   alert(result[i]);
		   state = 1;
		  }
		if(i==result.length-1 && (state==0)){
			alert("해당 문자 없음");
		}
	}
	
 });

window.add(text);
window.add(button);
window.open();
