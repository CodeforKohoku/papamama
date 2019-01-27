
///// mapとpapamamap.mapのインスタンスが異なる副作用懸念
$('#mainPage').on('pageshow', function() {
	resizeMapDiv();

	// 地図レイヤー初期化
	var papamamap = new Papamamap(
		init_center_coords,
		mapServerList[initialMapServer]
	);
	map = papamamap.map;

	// 保育施設の読み込みとレイヤーの追加
	papamamap.loadNurseryFacilitiesJson(function(data){
		nurseryFacilities = data;
	}).then(function(){
		papamamap.addNurseryFacilitiesLayer(nurseryFacilities);
	});

	// ポップアップ定義
	papamamap.popup = new ol.Overlay({
		element: $('#popup')
	});
	map.addOverlay(papamamap.popup);

	// 背景地図一覧リストを設定する
	for(var item in mapServerList) {
		$('#changeBaseMap').append(
			$('<option>').html(mapServerList[item].label).val(item)
		);
	}

	// 最寄駅セレクトボックスの生成
	MoveToList.prototype.loadStationJson().then(function() {
		MoveToList.prototype.appendToMoveToListBox(moveToList)
	});

	// 保育施設クリック時の挙動を定義
	map.on('click', function(evt) {

		var coord = map.getCoordinateFromPixel(evt.pixel);
		var feature;
		var layer;

		// ポップアップを消す
		if($('#popup').is(':visible')) {
			$('#popup').hide();
		}

		// クリック位置の施設情報を取得
		var featureLayerSet = map.forEachFeatureAtPixel(
			evt.pixel,
			function(feature, layer) {
				return {feature: feature, layer: layer};
			}
		);

		if(featureLayerSet) {
			feature = featureLayerSet.feature;
			layer   = featureLayerSet.layer;
		}

		if (feature) {
			// クリックした場所に既に描いた同心円がある場合、円を消す
			if (layer.get('name') === 'layerCircle') {
				$('#cbDisplayCircle').attr('checked', false).checkboxradio('refresh');
				clearCenterCircle();
				return;
			}

			if("Point" == feature.getGeometry().getType() && feature.get('Type')){
				coord = feature.getGeometry().getCoordinates();
				papamamap.popup.setPosition(coord);

				// タイトル部
				$("#popup-title").html(
					papamamap.getPopupTitle(feature)
				);

				// 内容部
				$("#popup-content").html(
					papamamap.getPopupContent(feature)
				);

				$('#popup').show();
			}
		}
		papamamap.animatedMove(coord[0], coord[1], false);
	});

	// 中心座標変更セレクトボックス操作イベント定義
	$('#moveTo').change(function(){

		//最寄駅をクリックで駅マーカーを非表示にする
		if ($('#moveTo option:selected').text() == "最寄駅"){
			clearMarker();
		} else {
			// 指定した最寄り駅に移動
			papamamap.moveToSelectItem(moveToList[$(this).val()]);

			// 地図上にマーカーを設定する
			var pos = ol.proj.transform(
				[
					moveToList[$(this).val()].lon,
					moveToList[$(this).val()].lat
				],
				'EPSG:4326', 'EPSG:3857'
			);

			// Vienna marker
			var label = moveToList[$(this).val()].name;
			drawMarker(pos, label);
		}
	});

	// 各施設のチェックボックスのイベント定義
	Object.keys(facilityObj).forEach(function(elem){
		$(facilityObj[elem]['cb']).click(function() {
			papamamap.switchLayer(this.id, $(this).prop('checked'));
		});		
	});

	// 中学校区と小学校区の各チェックボックスのイベント定義
	cdSchoolArray.forEach(function(elem, idx){
		$(elem).click(function() {
			layer = map.getLayers().item(idx + 1);
			layer.setVisible($(this).prop('checked'));
		});
	});

	// 現在地に移動するボタンのイベント定義
	$('#moveCurrentLocation').click(function(evt){

		MoveCurrentLocationControl.prototype.getCurrentPosition(
			function(pos) {
				var coordinate = ol.proj.transform(
					[pos.coords.longitude, pos.coords.latitude], 'EPSG:4326', 'EPSG:3857');
				map.getView().setCenter(coordinate);
				drawMarker(coordinate, "現在地");
			},
			function(err) {
				alert('位置情報が取得できませんでした。');
			}
		);
	});

	// 半径セレクトボックスのイベント定義
	$('#changeCircleRadius').change(function(evt){
		radius = $(this).val();
		if(radius === "") {
			clearCenterCircle();
			$('#cbDisplayCircle').prop('checked', false).checkboxradio('refresh');
		} else {
			$('#cbDisplayCircle').prop('checked', true).checkboxradio('refresh');
			drawCenterCircle(radius);
		}
	});

	// 円表示ボタンのイベント定義
	$('#cbDisplayCircle').click(function(evt){
		radius = $('#changeCircleRadius').val();
		$('#cbDisplayCircle').prop('checked')
		? drawCenterCircle(radius)
		: clearCenterCircle();
	});

	// 地図変更選択ボックス操作時のイベント
	$('#changeBaseMap').change(function(evt){
		if($(this).val() === "背景") {
			$(this).val($(this).prop("selectedIndex", 1).val());
		}
		papamamap.changeMapServer(
			mapServerList[$(this).val()],
			$('#changeOpacity option:selected').val()
		);
	});

	// ポップアップを閉じるイベント
	$('#popup-closer').click(function(evt){
		$('#popup').hide();
	});

	// ポップアップを閉じる
	$('.ol-popup').parent('div').click(function(evt){
		$('#popup').hide();
	});

	// 親要素へのイベント伝播を停止する
	$('.ol-popup').click(function(evt){
		evt.stopPropagation();
	});

    // 検索フィルターを有効にする
	$('#filterApply').click(function(evt){
	'use strict';

		// 条件作成処理
		var conditions = {};
		var checkObj = {};
		Object.keys(facilityObj).forEach(function(elem){
			checkObj[elem] = false;
		});

		// 検索フィルターのセレクト(filtersbクラス)で選択されたもののみ抽出
		$('select.filtersb option:selected').each(function(index,item) {
			if (item.value) conditions[item.parentNode.id] = item.value;
		});

		// 検索フィルターのチェックボックス(filtercbクラス)で選択されたもののみ抽出
		$('.filtercb').each(function(index,item ) {
			if (item.checked) conditions[item .id] = 'Y';
		});

		// フィルター適用時
		if(Object.keys(conditions).length > 0) {
			var filter = new FacilityFilter();
			checkObj.filterPattern = 0; // Google Analyticsのイベントトラッキングで送信する値
			var newGeoJson = filter.getFilteredFeaturesGeoJson(conditions, nurseryFacilities, checkObj); // checkObjを参照渡しで表示レイヤーを取得する
			papamamap.addNurseryFacilitiesLayer(newGeoJson);
			$('#btnFilter').css('background-color', '#3388cc');
			// 検索結果の一覧のhtmlを新規タブで表示される。クエリで検索条件を新規Windowへ渡す
			if (document.getElementById("filteredList").checked) {
				var urlQuery = '?';
				Object.keys(conditions).forEach(function(item) {
					urlQuery += item + '=' + conditions[item] + '&';
				});
				urlQuery = urlQuery.slice(0, -1);
				window.open('filteredList.html'+urlQuery);
			}
		} else {
			papamamap.addNurseryFacilitiesLayer(nurseryFacilities);
			$('#btnFilter').css('background-color', '#f6f6f6');
			Object.keys(checkObj).forEach(function(item) {
				checkObj[item] = true;
			});
			checkObj.filterPattern = 0; // Google Analyticsのイベントトラッキングで送信する値
		}

		// ga('send', 'event', 'カテゴリ', 'アクション', 'ラベル', '値', { nonInteraction: 真偽値 } )
 		// *nonInteraction: trueはイベントが発生しても直帰率に影響せず、falseはイベントの呼び出しで直帰とみなされなくなる
 		ga('send', 'event', 'filter', this.id, checkObj.filterPattern) ;
 		// 本イベントを直帰率へ反映させたくない場合は以下を使用すること。
 		// ga('send', 'event', 'nurseryFacilities', 'filter', this.id, checkObj.filterPattern, { nonInteraction: true });

		// レイヤー表示状態によって施設の表示を切り替える
		delete checkObj.filterPattern;
		updateLayerStatus(checkObj);
	});

	// 絞込条件のリセット
	$('#filterReset').click(function(evt){

		// チェックボックスをリセット
		$(".filtercb").each(function(){
			$(this).prop('checked', false).checkboxradio('refresh');
		});

		// セレクトボックスをリセット
		$('.filtersb').each(function(){
			$(this).selectmenu(); // これを実行しないと次の行でエラー発生
			$(this).val('').selectmenu('refresh');
		});

		// 施設情報をリセット
		papamamap.addNurseryFacilitiesLayer(nurseryFacilities);
		$('#btnFilter').css('background-color', '#f6f6f6');

		// すべての施設を表示する
		var checkObj = {};
		Object.keys(facilityObj).forEach(function(elem){
			checkObj[elem] = true;
		});
		updateLayerStatus(checkObj);
	});

	/**
	 * レイヤー状態を切り替える
	 *
	 * @param  {object} checkObj チェックボックス名: 真偽値の組み合わせ
	 */
	function updateLayerStatus(checkObj) {
		Object.keys(checkObj).forEach(function(elem){
			var cbName = facilityObj[elem]['cb'];
			var bool = checkObj[elem];
			papamamap.switchLayer($(cbName).prop('id'), bool);
			$(cbName).prop('checked', bool).checkboxradio('refresh');
		});
	}

	/**
	 * 円を描画する 関数内関数
	 *
	 * @param  {[type]} radius    [description]
	 */
	function drawCenterCircle(radius) {
		if($('#cbDisplayCircle').prop('checked')) {
			papamamap.drawCenterCircle(radius);

			$('#center_markerTitle').hide();
			$('#center_marker').hide();

			var marker = new ol.Overlay({
				position: map.getView().getCenter(),
				positioning: 'center-center',
				element: $('#center_marker'),
				stopEvent: false
			});
			map.addOverlay(marker);

			// 地図マーカーラベル設定
			$('#center_markerTitle').html("");
			var markerTitle = new ol.Overlay({
				position: coordinate,
				element: $('#center_markerTitle')
			});
			map.addOverlay(markerTitle);
			$('#center_markerTitle').show();
			$('#center_marker').show();
		}
	}

	// 円を消す
	function clearCenterCircle() {
		papamamap.clearCenterCircle();
		$('#center_markerTitle').hide();
		$('#center_marker').hide();
		$('#changeCircleRadius').val('').selectmenu('refresh');
	}

	/**
	 * 指定座標にマーカーを設定する
	 * @param  {[type]} coordinate [description]
	 * @param  {[type]} label [description]
	 */
	function drawMarker(coordinate, label) {
		clearMarker();
		var marker = new ol.Overlay({
			position: coordinate,
			positioning: 'center-center',
			element: $('#marker'),
			stopEvent: false
		});
		map.addOverlay(marker);

		// 地図マーカーラベル設定
		$('#markerTitle').html(label);
		var markerTitle = new ol.Overlay({
			position: coordinate,
			element: $('#markerTitle')
		});
		map.addOverlay(markerTitle);
		$('#markerTitle').show();
		$('#marker').show();
	}

	// 指定座標のマーカーを非表示にする
	function clearMarker() {
		 $('#markerTitle').hide();
		 $('#marker').hide();
	}

	// メニューボタンをクリックした時のイベントの登録
	document.getElementById('nav1-btn').addEventListener('click', function(evt){
		var elem = document.getElementsByClassName("nav1-li");
		if (elem[0].style.display === "none") {
			elem[0].style.display ="inline-block";
			elem[1].style.display ="inline-block";
		} else {
			elem[0].style.display ="none";
			elem[1].style.display ="none";
		}

	});

	// メニューバーとロゴをWindowサイズに合わせて配置を変更する
	function toggleNavbar() {

		// // マップのサイズを画面サイズに調整
		// resizeMapDiv();

		var elem = document.getElementsByClassName("nav1-li");
		document.getElementById("nav1").style.top = "0px";
		document.getElementById("nav1").style.left = "50px";

		Object.keys(elem[0].children).forEach(function(item){
			elem[0].children[item].style.width = "";
		});
		["btnFilter", "changeBaseMap-button", "moveTo-button", "changeCircleRadius-button", "btnHelp"].forEach(function(e) {
			document.getElementById(e).style.width = "";
		});

		elem[0].style.display ="inline-block";
		elem[1].style.display ="inline-block";
		var btn = document.getElementById("nav1-btn-div");
		btn.style.display = "none";

		var logo = document.getElementById("map-logo");
		logo.style.left = window.innerWidth / 2 - 115 + "px";

		// Windowサイズがメニューの幅より小さい場合(つまりメニューが複数行となる場合)
		if (elem[0].clientHeight > 50) {
			elem[0].style.display ="none";
			elem[1].style.display ="none";
			btn.style.display = "block";
			logo.style.top = "0";
			logo.style.height = "0";
			logo.style.bottom = "";
			Object.keys(elem[0].children).forEach(function(i){
				elem[0].children[i].style.width =  (window.innerWidth / 3 * 1) + "px";
			});
			["btnFilter", "changeBaseMap-button", "moveTo-button", "changeCircleRadius-button", "btnHelp"].forEach(function(e) {
				document.getElementById(e).style.width = (window.innerWidth / 3 * 1) + "px";
			});

			document.getElementById("nav1").style.top = (btn.clientHeight - 5) + "px";
			if (window.innerHeight > 580) {
					document.getElementById("nav1").style.left = (window.innerWidth / 3 * 2 - 5) + "px";
			} else {
					document.getElementById("nav1").style.left = (window.innerWidth / 3 * 1 - 5) + "px";
			}

		// Windowサイズがメニューの幅より大きい場合
		} else {
			elem[0].style.display ="inline-block";
			elem[1].style.display ="inline-block";
			btn.style.display = "none";
			logo.style.top = "";
			logo.style.bottom = "30px";
		}
	};
	// ページのロード時に一度実行する
	toggleNavbar();

	// Windowsサイズの変更時のイベントを登録
	var resizeTimer;
	window.addEventListener('resize', function(event){
	if (resizeTimer !== false) {
		clearTimeout(resizeTimer);
	}
	///// cb渡し方あってる？
	resizeTimer = setTimeout(toggleNavbar(), 100);
	});

});

// デバイス回転時、地図の大きさを画面全体に広げる
$(window).on("orientationchange", function(){
	resizeMapDiv();
	map.setTarget('null');
	map.setTarget('map');
});

// 地図の大きさを画面全体に広げる
function resizeMapDiv() {
	var screenHeight = $.mobile.getScreenHeight();
	$(".ui-content").height(screenHeight);
	$("#map").height(screenHeight);
}


// 保育施設絞り込みの開園時間のselectタグのoptionの生成
if (document.getElementById("filterdialog")) {
	(function(){
		var startHour = 7;
		var endHour = 9;
		var options = '<option value="">開園</option>';

		for(var hour = startHour ; hour <=endHour; hour++){
			  options += '<option value="' + hour + ':00">' + hour + ':00以前</option>';
			  options += '<option value="' + hour + ':15">' + hour + ':15以前</option>';
			  options += '<option value="' + hour + ':45">' + hour + ':45以前</option>';
		}
		options += '<option value="10:00">10:00以前</option>';

		Object.keys(facilityObj).map(function(elem){
			return elem + 'OpenTime';
		}).forEach(function(item){
			document.getElementById(item).innerHTML = options;
		});
	})();

	// 保育施設絞り込みの終園時間のselectタグのoptionの生成
	(function(){
		var startHour = 17;
		var endHour = 21;
		var options = '<option value="">終園</option>';

		for(var hour = startHour ; hour <=endHour; hour++){
			  options += '<option value="' + hour + ':00">' + hour + ':00以降</option>';
			  options += '<option value="' + hour + ':30">' + hour + ':30以降</option>';
		}
		options += '<option value="22:00">22:00以降</option>';

		Object.keys(facilityObj).map(function(elem){
			return elem + 'CloseTime';
		}).forEach(function(item){
			document.getElementById(item).innerHTML = options;
		});
	})();
}
