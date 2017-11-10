// select options

// 検索 OpenTime
var openTime = function () {
	var startHour = 7;
	var endHour = 8;
	var options = '<option value="">開園</option>';
	for(var hour = startHour ; hour <=endHour; hour++){
		  options += '<option value="' + hour + ':00">' + hour + ':00以前</option>';
		  options += '<option value="' + hour + ':15">' + hour + ':15以前</option>';
		  options += '<option value="' + hour + ':45">' + hour + ':45以前</option>';
	}
	options += '<option value="9:00">9:00以前</option>';

	document.getElementById("PubNinkaOpenTime").innerHTML = options;
	document.getElementById("PriNinkaOpenTime").innerHTML = options;
	document.getElementById("YhoikuOpenTime").innerHTML = options;
	document.getElementById("ninkagaiOpenTime").innerHTML = options;
}
openTime();

// 検索 OpenTime
var CloseTime = function () {
	var startHour = 18;
	var endHour = 21;
	var options = '<option value="">終園</option>';
	for(var hour = startHour ; hour <=endHour; hour++){
		  options += '<option value="' + hour + ':00">' + hour + ':00以降</option>';
		  options += '<option value="' + hour + ':30">' + hour + ':30以降</option>';
	}
	options += '<option value="22:00">22:00以前</option>';
	options += '<option value="00:00">00:00以前</option>';

	document.getElementById("PubNinkaCloseTime").innerHTML = options;
	document.getElementById("PriNinkaCloseTime").innerHTML = options;
	document.getElementById("YhoikuCloseTime").innerHTML = options;
	document.getElementById("ninkagaiCloseTime").innerHTML = options;
}
CloseTime();
