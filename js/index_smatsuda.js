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

	document.getElementById("pubNinkaOpenTime").innerHTML = options;
	document.getElementById("priNinkaOpenTime").innerHTML = options;
	document.getElementById("yhoikuOpenTime").innerHTML = options;
	document.getElementById("ninkagaiOpenTime").innerHTML = options;
	document.getElementById("kindergartenOpenTime").innerHTML = options;
}
openTime();

// 検索 OpenTime
var closeTime = function () {
	var startHour = 18;
	var endHour = 21;
	var options = '<option value="">終園</option>';
	for(var hour = startHour ; hour <=endHour; hour++){
		  options += '<option value="' + hour + ':00">' + hour + ':00以降</option>';
		  options += '<option value="' + hour + ':30">' + hour + ':30以降</option>';
	}
	options += '<option value="22:00">22:00以前</option>';
	options += '<option value="00:00">00:00以前</option>';

	document.getElementById("pubNinkaCloseTime").innerHTML = options;
	document.getElementById("priNinkaCloseTime").innerHTML = options;
	document.getElementById("yhoikuCloseTime").innerHTML = options;
	document.getElementById("ninkagaiCloseTime").innerHTML = options;
	document.getElementById("kindergartenCloseTime").innerHTML = options;
}
closeTime();
