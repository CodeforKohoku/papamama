window.FacilityFilter = function () {
};

/**
 * 指定したフィルター条件に一致する施設情報のGeoJsonを生成する
 *
 * @param  {[type]} conditions        [description]
 * @param  {[type]} nurseryFacilities [description]
 * @param  {[type]} checkObj [description]
 * @return {[type]}                   [description]
 */
FacilityFilter.prototype.getFilteredFeaturesGeoJson = function (conditions, nurseryFacilities, checkObj)
{
  	'use strict';

    // 絞り込んだ条件に一致する施設を格納するgeoJsonを準備
    var newGeoJson = {
        "type": "FeatureCollection",
        "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
        "features":[]
    };

    // 施設名ごとにフィルターをかけるコールバックを返す
    var filterFunc = function (name) {
          return function (item,idx) {
                  var type = item.properties['種別'] ? item.properties['種別'] : item.properties['Type'];
                  if(type == name) return true;
              };
    }

    // 公立認可保育園の検索元データを取得
    var pubNinkaFeatures = nurseryFacilities.features.filter(filterFunc("公立認可保育所"));

    // 私立認可保育園の検索元データを取得
    var priNinkaFeatures = nurseryFacilities.features.filter(filterFunc("私立認可保育所"));

    // 認可外保育園の検索元データを取得
    var ninkagaiFeatures = nurseryFacilities.features.filter(filterFunc("認可外保育施設"));

    // 横浜保育室の検索元データを取得
    var yhoikuFeatures = nurseryFacilities.features.filter(filterFunc("横浜保育室"));

    // 幼稚園の検索元データを取得
    var kindergartenFeatures = nurseryFacilities.features.filter(filterFunc("幼稚園"));

    // 小規模・事業所内保育事業の検索元データを取得
    var jigyoshoFeatures = nurseryFacilities.features.filter(filterFunc("小規模・事業所内保育事業"));


    // フィルターで渡すコールバック関数を返す
    var getFileterFunc = function (conditionVal, funcType) {

            // 開園時間でフィルターする関数
            if (funcType === 'OpenTime') {
                  return function (item, idx) {
                        var openHour = conditionVal.slice(0, conditionVal.indexOf(":"));
                        var openMin = Number(conditionVal.slice(-2));
                        var _open = new Date(2010, 0, 1, openHour, openMin, 0);
                        var open = item.properties['開園時間'] ? item.properties['開園時間'] : item.properties['Open'];
                        //各保育園の開園時間を変換
                        open = open.replace("：", ":");  //全角だったら半角に変更
                        var hour = open.slice(0, open.indexOf(":"));
                        var min = open.slice(-2);
                        var open_time = new Date(2010, 0, 1, hour, min, 0);
                        if(open !== "" && open_time <= _open) {
                            return true;
                        }
                  };

            // 終園時間でフィルターする関数
            } else if (funcType === 'CloseTime') {
                  return function (item, idx) {
                        var closeHour = conditionVal.slice(0, conditionVal.indexOf(":"));
                        var closeMin = Number(conditionVal.slice(-2));
                        var _close = new Date(2010, 0, 1, closeHour, closeMin, 0);
                        var close = item.properties['終園時間'] ? item.properties['終園時間'] : item.properties['Close'];
                        //各保育園の終園時間を変換
                        close = close.replace("：", ":");  //全角だったら半角に変更
                        var hour = close.slice(0, close.indexOf(":"));
                        if(hour !== "" && hour <= 12) {hour = hour + 24};  //終園時間が24時過ぎの場合翌日扱い
                        var min = close.slice(-2);
                        var close_time = new Date(2010, 0, 1, hour, min, 0);
                        if(close_time >= _close) {
                            return true;
                        }
                  };

            // 24時間対応でフィルターする関数
            } else if (funcType === 'H24') {
                  return function (item, idx) {
                        var h24 = item.properties['H24'] ? item.properties['H24'] : item.properties['H24'];
                        if(h24 === conditionVal) {
                            return true;
                        }
                  };

            // 一時保育でフィルターする関数
            } else if (funcType === 'IchijiHoiku') {
                  return function (item, idx) {
                        var temp = item.properties['一時'] ? item.properties['一時'] : item.properties['Temp'];
                        if(temp === conditionVal) {
                              return true;
                          }
                  };

            // 夜間対応でフィルターする関数
            } else if (funcType === 'Yakan') {
                  return function (item, idx) {
                        var night = item.properties['夜間'] ? item.properties['夜間'] : item.properties['Night'];
                        if(night === conditionVal) {
                              return true;
                          }
                  };

            // 休日対応でフィルターする関数
            } else if (funcType === 'Kyujitu') {
                  return function (item, idx) {
                        var holiday = item.properties['休日'] ? item.properties['休日'] : item.properties['Holiday'];
                        if(holiday === conditionVal) {
                              return true;
                          }
                  };

            // 延長保育でフィルターする関数
            } else if (funcType === 'Encho') {
                  return function (item, idx) {
                        var extra = item.properties['延長保育'] ? item.properties['延長保育'] : item.properties['Extra'];
                        if(extra === conditionVal) {
                              return true;
                          }
                  };

            // 欠員情報でフィルターする関数
            } else if (funcType === 'Vacancy') {
                  return function (item, idx) {
                        var vacancy = item.properties['Vacancy'] ? item.properties['Vacancy'] : item.properties['Vacancy'];
                        if(vacancy === conditionVal) {
                              return true;
                          }
                  };

            }
    };


    // ----------------------------------------------------------------------
    // 公立認可保育所向けフィルター
    // ----------------------------------------------------------------------
    if (conditions['pubNinkaOpenTime']) {
        pubNinkaFeatures = pubNinkaFeatures.filter(getFileterFunc(conditions['pubNinkaOpenTime'], 'OpenTime'));
        checkObj['pubNinka'] = true;
    }
    if (conditions['pubNinkaCloseTime']) {
        pubNinkaFeatures = pubNinkaFeatures.filter(getFileterFunc(conditions['pubNinkaCloseTime'], 'CloseTime'));
        checkObj['pubNinka'] = true;
    }
    if (conditions['pubNinka24H']) {
        pubNinkaFeatures = pubNinkaFeatures.filter(getFileterFunc(conditions['pubNinka24H'], 'H24'));
        checkObj['pubNinka'] = true;
    }
    if (conditions['pubNinkaIchijiHoiku']) {
        pubNinkaFeatures = pubNinkaFeatures.filter(getFileterFunc(conditions['pubNinkaIchijiHoiku'], 'IchijiHoiku'));
        checkObj['pubNinka'] = true;
    }
    if (conditions['pubNinkaYakan']) {
        pubNinkaFeatures = pubNinkaFeatures.filter(getFileterFunc(conditions['pubNinkaYakan'], 'Yakan'));
        checkObj['pubNinka'] = true;
    }
    if (conditions['pubNinkaKyujitu']) {
        pubNinkaFeatures = pubNinkaFeatures.filter(getFileterFunc(conditions['pubNinkaKyujitu'], 'Kyujitu'));
        checkObj['pubNinka'] = true;
    }
    if (conditions['pubNinkaEncho']) {
        pubNinkaFeatures = pubNinkaFeatures.filter(getFileterFunc(conditions['pubNinkaEncho'], 'Encho'));
        checkObj['pubNinka'] = true;
    }
    if (conditions['pubNinkaVacancy']) {
        pubNinkaFeatures = pubNinkaFeatures.filter(getFileterFunc(conditions['pubNinkaVacancy'], 'Vacancy'));
        checkObj['pubNinka'] = true;
    }

    // ----------------------------------------------------------------------
    // 私立認可保育所向けフィルター
    // ----------------------------------------------------------------------
    if (conditions['priNinkaOpenTime']) {
        priNinkaFeatures = priNinkaFeatures.filter(getFileterFunc(conditions['priNinkaOpenTime'], 'OpenTime'));
        checkObj['priNinka']= true;
    }
    if (conditions['priNinkaCloseTime']) {
        priNinkaFeatures = priNinkaFeatures.filter(getFileterFunc(conditions['priNinkaCloseTime'], 'CloseTime'));
        checkObj['priNinka']= true;
    }
    if (conditions['priNinka24H']) {
        priNinkaFeatures = priNinkaFeatures.filter(getFileterFunc(conditions['priNinka24H'], 'H24'));
        checkObj['priNinka']= true;
    }
    if (conditions['priNinkaIchijiHoiku']) {
        priNinkaFeatures = priNinkaFeatures.filter(getFileterFunc(conditions['priNinkaIchijiHoiku'], 'IchijiHoiku'));
        checkObj['priNinka']= true;
    }
    if (conditions['priNinkaYakan']) {
        priNinkaFeatures = priNinkaFeatures.filter(getFileterFunc(conditions['priNinkaYakan'], 'Yakan'));
        checkObj['priNinka']= true;
    }
    if (conditions['priNinkaKyujitu']) {
        priNinkaFeatures = priNinkaFeatures.filter(getFileterFunc(conditions['priNinkaKyujitu'], 'Kyujitu'));
        checkObj['priNinka']= true;
    }
    if (conditions['priNinkaEncho']) {
        priNinkaFeatures = priNinkaFeatures.filter(getFileterFunc(conditions['priNinkaEncho'], 'Encho'));
        checkObj['priNinka']= true;
    }
    if (conditions['priNinkaVacancy']) {
        priNinkaFeatures = priNinkaFeatures.filter(getFileterFunc(conditions['priNinkaVacancy'], 'Vacancy'));
        checkObj['priNinka']= true;
    }


    // ----------------------------------------------------------------------
    // 認可外保育所向けフィルター
    // ----------------------------------------------------------------------
    if (conditions['ninkagaiOpenTime']) {
        ninkagaiFeatures = ninkagaiFeatures.filter(getFileterFunc(conditions['ninkagaiOpenTime'], 'OpenTime'));
        checkObj['ninkagai'] = true;
    }
    if (conditions['ninkagaiCloseTime']) {
        ninkagaiFeatures = ninkagaiFeatures.filter(getFileterFunc(conditions['ninkagaiCloseTime'], 'CloseTime'));
        checkObj['ninkagai'] = true;
    }
    if (conditions['ninkagai24H']) {
        ninkagaiFeatures = ninkagaiFeatures.filter(getFileterFunc(conditions['ninkagai24H'], 'H24'));
        checkObj['ninkagai'] = true;
    }
    if (conditions['ninkagaiIchijiHoiku']) {
        ninkagaiFeatures = ninkagaiFeatures.filter(getFileterFunc(conditions['ninkagaiIchijiHoiku'], 'IchijiHoiku'));
        checkObj['ninkagai'] = true;
    }
    if (conditions['ninkagaiYakan']) {
        ninkagaiFeatures = ninkagaiFeatures.filter(getFileterFunc(conditions['ninkagaiYakan'], 'Yakan'));
        checkObj['ninkagai'] = true;
    }
    if (conditions['ninkagaiKyujitu']) {
        ninkagaiFeatures = ninkagaiFeatures.filter(getFileterFunc(conditions['ninkagaiKyujitu'], 'Kyujitu'));
        checkObj['ninkagai'] = true;
    }
    if (conditions['ninkagaiEncho']) {
        ninkagaiFeatures = ninkagaiFeatures.filter(getFileterFunc(conditions['ninkagaiEncho'], 'Encho'));
        checkObj['ninkagai'] = true;
    }
    if (conditions['ninkagaiVacancy']) {
        ninkagaiFeatures = ninkagaiFeatures.filter(getFileterFunc(conditions['ninkagaiVacancy'], 'Vacancy'));
        checkObj['ninkagai'] = true;
    }

    // ----------------------------------------------------------------------
    // 横浜保育室向けフィルター
    // ----------------------------------------------------------------------
    if (conditions['yhoikuOpenTime']) {
        yhoikuFeatures = yhoikuFeatures.filter(getFileterFunc(conditions['yhoikuOpenTime'], 'OpenTime'));
        checkObj['yhoiku'] = true;
    }
    if (conditions['yhoikuCloseTime']) {
        yhoikuFeatures = yhoikuFeatures.filter(getFileterFunc(conditions['yhoikuCloseTime'], 'CloseTime'));
        checkObj['yhoiku'] = true;
    }
    if (conditions['yhoiku24H']) {
        yhoikuFeatures = yhoikuFeatures.filter(getFileterFunc(conditions['yhoiku24H'], 'H24'));
        checkObj['yhoiku'] = true;
    }
    if (conditions['yhoikuIchijiHoiku']) {
        yhoikuFeatures = yhoikuFeatures.filter(getFileterFunc(conditions['yhoikuIchijiHoiku'], 'IchijiHoiku'));
        checkObj['yhoiku'] = true;
    }
    if (conditions['yhoikuYakan']) {
        yhoikuFeatures = yhoikuFeatures.filter(getFileterFunc(conditions['yhoikuYakan'], 'Yakan'));
        checkObj['yhoiku'] = true;
    }
    if (conditions['yhoikuKyujitu']) {
        yhoikuFeatures = yhoikuFeatures.filter(getFileterFunc(conditions['yhoikuKyujitu'], 'Kyujitu'));
        checkObj['yhoiku'] = true;
    }
    if (conditions['yhoikuEncho']) {
        yhoikuFeatures = yhoikuFeatures.filter(getFileterFunc(conditions['yhoikuEncho'], 'Encho'));
        checkObj['yhoiku'] = true;
    }
    if (conditions['yhoikuVacancy']) {
        yhoikuFeatures = yhoikuFeatures.filter(getFileterFunc(conditions['yhoikuVacancy'], 'Vacancy'));
        checkObj['yhoiku'] = true;
    }

    // ----------------------------------------------------------------------
    // 幼稚園向けフィルター
    // ----------------------------------------------------------------------
    if (conditions['kindergartenOpenTime']) {
        kindergartenFeatures = kindergartenFeatures.filter(getFileterFunc(conditions['kindergartenOpenTime'], 'OpenTime'));
        checkObj['kindergarten'] = true;
    }
    if (conditions['kindergartenCloseTime']) {
        kindergartenFeatures = kindergartenFeatures.filter(getFileterFunc(conditions['kindergartenCloseTime'], 'CloseTime'));
        checkObj['kindergarten'] = true;
    }
    if (conditions['kindergarten24H']) {
        kindergartenFeatures = kindergartenFeatures.filter(getFileterFunc(conditions['kindergarten24H'], 'H24'));
        checkObj['kindergarten'] = true;
    }
    if (conditions['kindergartenIchijiHoiku']) {
        kindergartenFeatures = kindergartenFeatures.filter(getFileterFunc(conditions['kindergartenIchijiHoiku'], 'IchijiHoiku'));
        checkObj['kindergarten'] = true;
    }
    if (conditions['kindergartenYakan']) {
        kindergartenFeatures = kindergartenFeatures.filter(getFileterFunc(conditions['kindergartenYakan'], 'Yakan'));
        checkObj['kindergarten'] = true;
    }
    if (conditions['kindergartenKyujitu']) {
        kindergartenFeatures = kindergartenFeatures.filter(getFileterFunc(conditions['kindergartenKyujitu'], 'Kyujitu'));
        checkObj['kindergarten'] = true;
    }
    if (conditions['kindergartenEncho']) {
        kindergartenFeatures = kindergartenFeatures.filter(getFileterFunc(conditions['kindergartenEncho'], 'Encho'));
        checkObj['kindergarten'] = true;
    }
    if (conditions['kindergartenVacancy']) {
        kindergartenFeatures = kindergartenFeatures.filter(getFileterFunc(conditions['kindergartenVacancy'], 'Vacancy'));
        checkObj['kindergarten'] = true;
    }

    // ----------------------------------------------------------------------
    // 小規模・事業所内保育事業向けフィルター
    // ----------------------------------------------------------------------
    if (conditions['jigyoshoOpenTime']) {
        jigyoshoFeatures = jigyoshoFeatures.filter(getFileterFunc(conditions['jigyoshoOpenTime'], 'OpenTime'));
        checkObj['jigyosho'] = true;
    }
    if (conditions['jigyoshoCloseTime']) {
        jigyoshoFeatures = jigyoshoFeatures.filter(getFileterFunc(conditions['jigyoshoCloseTime'], 'CloseTime'));
        checkObj['jigyosho'] = true;
    }
    if (conditions['jigyosho24H']) {
        jigyoshoFeatures = jigyoshoFeatures.filter(getFileterFunc(conditions['jigyosho24H'], 'H24'));
        checkObj['jigyosho'] = true;
    }
    if (conditions['jigyoshoIchijiHoiku']) {
        jigyoshoFeatures = jigyoshoFeatures.filter(getFileterFunc(conditions['jigyoshoIchijiHoiku'], 'IchijiHoiku'));
        checkObj['jigyosho'] = true;
    }
    if (conditions['jigyoshoYakan']) {
        jigyoshoFeatures = jigyoshoFeatures.filter(getFileterFunc(conditions['jigyoshoYakan'], 'Yakan'));
        checkObj['jigyosho'] = true;
    }
    if (conditions['jigyoshoKyujitu']) {
        jigyoshoFeatures = jigyoshoFeatures.filter(getFileterFunc(conditions['jigyoshoKyujitu'], 'Kyujitu'));
        checkObj['jigyosho'] = true;
    }
    if (conditions['jigyoshoEncho']) {
        jigyoshoFeatures = jigyoshoFeatures.filter(getFileterFunc(conditions['jigyoshoEncho'], 'Encho'));
        checkObj['jigyosho'] = true;
    }
    if (conditions['jigyoshoVacancy']) {
        jigyoshoFeatures = jigyoshoFeatures.filter(getFileterFunc(conditions['jigyoshoVacancy'], 'Vacancy'));
        checkObj['jigyosho'] = true;
    }

    // 戻り値の作成
    var features = [];
    Array.prototype.push.apply(features, pubNinkaFeatures);
    Array.prototype.push.apply(features, priNinkaFeatures);
    Array.prototype.push.apply(features, ninkagaiFeatures);
    Array.prototype.push.apply(features, yhoikuFeatures);
    Array.prototype.push.apply(features, kindergartenFeatures);
    Array.prototype.push.apply(features, jigyoshoFeatures);
    newGeoJson.features = features;
    return newGeoJson;
};
