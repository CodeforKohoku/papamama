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

    // 保育施設名称ごとにGeoJsonのデータを取得する
    var getFilteredType = function (typeFeatures, typeName) {
      var _features = nurseryFacilities.features.filter(function (item,idx) {
              var type = item.properties['種別'] ? item.properties['種別'] : item.properties['Type'];
              if(type == typeName) return true;
          });
      Array.prototype.push.apply(typeFeatures, _features);
    }

    // 公立認可保育園の検索元データを取得
    var pubNinkaFeatures = [];
    getFilteredType(pubNinkaFeatures, "公立認可保育所")

    // 私立認可保育園の検索元データを取得
    var priNinkaFeatures = [];
    getFilteredType(priNinkaFeatures, "私立認可保育所")

    // 認可外保育園の検索元データを取得
    var ninkagaiFeatures = [];
    getFilteredType(ninkagaiFeatures, "認可外保育施設")

    // 横浜保育室の検索元データを取得
    var yhoikuFeatures = [];
    getFilteredType(yhoikuFeatures, "横浜保育室")

    // 幼稚園の検索元データを取得
    var kindergartenFeatures = [];
    getFilteredType(kindergartenFeatures, "幼稚園")

    // 小規模・事業所内保育事業の検索元データを取得
    var jigyoshoFeatures = [];
    getFilteredType(jigyoshoFeatures, "小規模・事業所内保育事業")


    // 開園時間でフィルターする関数
    var ifOpenTime = function (typeFeatures,conditionVal) {
      var filterfunc = function (item, idx) {
          var f = function (item,idx) {
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
          return f(item,idx);
      };
      return typeFeatures.filter(filterfunc);
    };

    // 終園時間でフィルターする関数
    var ifCloseTime = function (typeFeatures,conditionVal) {
      var filterfunc = function (item, idx) {
          var f = function (item,idx) {
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
          return f(item,idx);
      };
      return typeFeatures.filter(filterfunc);
    };

    // 24時間対応でフィルターする関数
    var if24H = function (typeFeatures,conditionVal) {
      var filterfunc = function (item, idx) {
          var f = function (item,idx) {
              var h24 = item.properties['H24'] ? item.properties['H24'] : item.properties['H24'];
              if(h24 === conditionVal) {
                  return true;
              }
          };
          return f(item,idx);
      };
      return typeFeatures.filter(filterfunc);
    };

    // 一時保育でフィルターする関数
    var ifIchijiHoiku = function (typeFeatures,conditionVal) {
      var filterfunc = function (item, idx) {
          var f = function (item,idx) {
              var temp = item.properties['一時'] ? item.properties['一時'] : item.properties['Temp'];
              if(temp === conditionVal) {
                    return true;
                }
          };
          return f(item,idx);
      };
      return typeFeatures.filter(filterfunc);
    };

    // 夜間対応でフィルターする関数
    var ifYakan = function (typeFeatures,conditionVal) {
      var filterfunc = function (item, idx) {
          var f = function (item,idx) {
              var night = item.properties['夜間'] ? item.properties['夜間'] : item.properties['Night'];
              if(night === conditionVal) {
                    return true;
                }
          };
          return f(item,idx);
      };
      return typeFeatures.filter(filterfunc);
    };

    // 休日対応でフィルターする関数
    var ifKyujitu = function (typeFeatures,conditionVal) {
      var filterfunc = function (item, idx) {
          var f = function (item,idx) {
              var holiday = item.properties['休日'] ? item.properties['休日'] : item.properties['Holiday'];
              if(holiday === conditionVal) {
                    return true;
                }
          };
          return f(item,idx);
      };
      return typeFeatures.filter(filterfunc);
    };

    // 延長保育でフィルターする関数
    var ifEncho = function (typeFeatures,conditionVal) {
      var filterfunc = function (item, idx) {
          var f = function (item,idx) {
              var extra = item.properties['延長保育'] ? item.properties['延長保育'] : item.properties['Extra'];
              if(extra === conditionVal) {
                    return true;
                }
          };
          return f(item,idx);
      };
      return typeFeatures.filter(filterfunc);
    };

    // 欠員情報でフィルターする関数
    var ifVacancy = function (typeFeatures,conditionVal) {
      var filterfunc = function (item, idx) {
          var f = function (item,idx) {
              var vacancy = item.properties['Vacancy'] ? item.properties['Vacancy'] : item.properties['Vacancy'];
              if(vacancy === conditionVal) {
                    return true;
                }
          };
          return f(item,idx);
      };
      return typeFeatures.filter(filterfunc);
    };


    // ----------------------------------------------------------------------
    // 公立認可保育所向けフィルター
    // ----------------------------------------------------------------------
    if (conditions['pubNinkaOpenTime']) {
        pubNinkaFeatures = ifOpenTime(pubNinkaFeatures, conditions['pubNinkaOpenTime']);
        checkObj['pubNinka'] = true;
    }
    if (conditions['pubNinkaCloseTime']) {
        pubNinkaFeatures = ifCloseTime(pubNinkaFeatures, conditions['pubNinkaCloseTime']);
        checkObj['pubNinka'] = true;
    }
    if (conditions['pubNinka24H']) {
        pubNinkaFeatures = if24H(pubNinkaFeatures, conditions['pubNinka24H']);
        checkObj['pubNinka'] = true;
    }
    if (conditions['pubNinkaIchijiHoiku']) {
        pubNinkaFeatures = ifIchijiHoiku(pubNinkaFeatures, conditions['pubNinkaIchijiHoiku']);
        checkObj['pubNinka'] = true;
    }
    if (conditions['pubNinkaYakan']) {
        pubNinkaFeatures = ifYakan(pubNinkaFeatures, conditions['pubNinkaYakan']);
        checkObj['pubNinka'] = true;
    }
    if (conditions['pubNinkaKyujitu']) {
        pubNinkaFeatures = ifKyujitu(pubNinkaFeatures, conditions['pubNinkaKyujitu']);
        checkObj['pubNinka'] = true;
    }
    if (conditions['pubNinkaEncho']) {
        pubNinkaFeatures = ifEncho(pubNinkaFeatures, conditions['pubNinkaEncho']);
        checkObj['pubNinka'] = true;
    }
    if (conditions['pubNinkaVacancy']) {
        pubNinkaFeatures = ifVacancy(pubNinkaFeatures, conditions['pubNinkaVacancy']);
        checkObj['pubNinka'] = true;
    }

    // ----------------------------------------------------------------------
    // 私立認可保育所向けフィルター
    // ----------------------------------------------------------------------
    if (conditions['priNinkaOpenTime']) {
        priNinkaFeatures = ifOpenTime(priNinkaFeatures, conditions['priNinkaOpenTime']);
        checkObj['priNinka']= true;
    }
    if (conditions['priNinkaCloseTime']) {
        priNinkaFeatures = ifCloseTime(priNinkaFeatures, conditions['priNinkaCloseTime']);
        checkObj['priNinka']= true;
    }
    if (conditions['priNinka24H']) {
        priNinkaFeatures = if24H(priNinkaFeatures, conditions['priNinka24H']);
        checkObj['priNinka']= true;
    }
    if (conditions['priNinkaIchijiHoiku']) {
        priNinkaFeatures = ifIchijiHoiku(priNinkaFeatures, conditions['priNinkaIchijiHoiku']);
        checkObj['priNinka']= true;
    }
    if (conditions['priNinkaYakan']) {
        priNinkaFeatures = ifYakan(priNinkaFeatures, conditions['priNinkaYakan']);
        checkObj['priNinka']= true;
    }
    if (conditions['priNinkaKyujitu']) {
        priNinkaFeatures = ifKyujitu(priNinkaFeatures, conditions['priNinkaKyujitu']);
        checkObj['priNinka']= true;
    }
    if (conditions['priNinkaEncho']) {
        priNinkaFeatures = ifEncho(priNinkaFeatures, conditions['priNinkaEncho']);
        checkObj['priNinka']= true;
    }
    if (conditions['priNinkaVacancy']) {
        priNinkaFeatures = ifVacancy(priNinkaFeatures, conditions['priNinkaVacancy']);
        checkObj['priNinka']= true;
    }


    // ----------------------------------------------------------------------
    // 認可外保育所向けフィルター
    // ----------------------------------------------------------------------
    if (conditions['ninkagaiOpenTime']) {
        ninkagaiFeatures = ifOpenTime(ninkagaiFeatures, conditions['ninkagaiOpenTime']);
        checkObj['ninkagai'] = true;
    }
    if (conditions['ninkagaiCloseTime']) {
        ninkagaiFeatures = ifCloseTime(ninkagaiFeatures, conditions['ninkagaiCloseTime']);
        checkObj['ninkagai'] = true;
    }
    if (conditions['ninkagai24H']) {
        ninkagaiFeatures = if24H(ninkagaiFeatures, conditions['ninkagai24H']);
        checkObj['ninkagai'] = true;
    }
    if (conditions['ninkagaiIchijiHoiku']) {
        ninkagaiFeatures = ifIchijiHoiku(ninkagaiFeatures, conditions['ninkagaiIchijiHoiku']);
        checkObj['ninkagai'] = true;
    }
    if (conditions['ninkagaiYakan']) {
        ninkagaiFeatures = ifYakan(ninkagaiFeatures, conditions['ninkagaiYakan']);
        checkObj['ninkagai'] = true;
    }
    if (conditions['ninkagaiKyujitu']) {
        ninkagaiFeatures = ifKyujitu(ninkagaiFeatures, conditions['ninkagaiKyujitu']);
        checkObj['ninkagai'] = true;
    }
    if (conditions['ninkagaiEncho']) {
        ninkagaiFeatures = ifEncho(ninkagaiFeatures, conditions['ninkagaiEncho']);
        checkObj['ninkagai'] = true;
    }
    if (conditions['ninkagaiVacancy']) {
        ninkagaiFeatures = ifVacancy(ninkagaiFeatures, conditions['ninkagaiVacancy']);
        checkObj['ninkagai'] = true;
    }

    // ----------------------------------------------------------------------
    // 横浜保育室向けフィルター
    // ----------------------------------------------------------------------
    if (conditions['yhoikuOpenTime']) {
        yhoikuFeatures = ifOpenTime(yhoikuFeatures, conditions['yhoikuOpenTime']);
        checkObj['yhoiku'] = true;
    }
    if (conditions['yhoikuCloseTime']) {
        yhoikuFeatures = ifCloseTime(yhoikuFeatures, conditions['yhoikuCloseTime']);
        checkObj['yhoiku'] = true;
    }
    if (conditions['yhoiku24H']) {
        yhoikuFeatures = if24H(yhoikuFeatures, conditions['yhoiku24H']);
        checkObj['yhoiku'] = true;
    }
    if (conditions['yhoikuIchijiHoiku']) {
        yhoikuFeatures = ifIchijiHoiku(yhoikuFeatures, conditions['yhoikuIchijiHoiku']);
        checkObj['yhoiku'] = true;
    }
    if (conditions['yhoikuYakan']) {
        yhoikuFeatures = ifYakan(yhoikuFeatures, conditions['yhoikuYakan']);
        checkObj['yhoiku'] = true;
    }
    if (conditions['yhoikuKyujitu']) {
        yhoikuFeatures = ifKyujitu(yhoikuFeatures, conditions['yhoikuKyujitu']);
        checkObj['yhoiku'] = true;
    }
    if (conditions['yhoikuEncho']) {
        yhoikuFeatures = ifEncho(yhoikuFeatures, conditions['yhoikuEncho']);
        checkObj['yhoiku'] = true;
    }
    if (conditions['yhoikuVacancy']) {
        yhoikuFeatures = ifVacancy(yhoikuFeatures, conditions['yhoikuVacancy']);
        checkObj['yhoiku'] = true;
    }

    // ----------------------------------------------------------------------
    // 幼稚園向けフィルター
    // ----------------------------------------------------------------------
    if (conditions['kindergartenOpenTime']) {
        kindergartenFeatures = ifOpenTime(kindergartenFeatures, conditions['kindergartenOpenTime']);
        checkObj['kindergarten'] = true;
    }
    if (conditions['kindergartenCloseTime']) {
        kindergartenFeatures = ifCloseTime(kindergartenFeatures, conditions['kindergartenCloseTime']);
        checkObj['kindergarten'] = true;
    }
    if (conditions['kindergarten24H']) {
        kindergartenFeatures = if24H(kindergartenFeatures, conditions['kindergarten24H']);
        checkObj['kindergarten'] = true;
    }
    if (conditions['kindergartenIchijiHoiku']) {
        kindergartenFeatures = ifIchijiHoiku(kindergartenFeatures, conditions['kindergartenIchijiHoiku']);
        checkObj['kindergarten'] = true;
    }
    if (conditions['kindergartenYakan']) {
        kindergartenFeatures = ifYakan(kindergartenFeatures, conditions['kindergartenYakan']);
        checkObj['kindergarten'] = true;
    }
    if (conditions['kindergartenKyujitu']) {
        kindergartenFeatures = ifKyujitu(kindergartenFeatures, conditions['kindergartenKyujitu']);
        checkObj['kindergarten'] = true;
    }
    if (conditions['kindergartenEncho']) {
        kindergartenFeatures = ifEncho(kindergartenFeatures, conditions['kindergartenEncho']);
        checkObj['kindergarten'] = true;
    }
    if (conditions['kindergartenVacancy']) {
        kindergartenFeatures = ifVacancy(kindergartenFeatures, conditions['kindergartenVacancy']);
        checkObj['kindergarten'] = true;
    }

    // ----------------------------------------------------------------------
    // 小規模・事業所内保育事業向けフィルター
    // ----------------------------------------------------------------------
    if (conditions['jigyoshoOpenTime']) {
        jigyoshoFeatures = ifOpenTime(jigyoshoFeatures, conditions['jigyoshoOpenTime']);
        checkObj['jigyosho'] = true;
    }
    if (conditions['jigyoshoCloseTime']) {
        jigyoshoFeatures = ifCloseTime(jigyoshoFeatures, conditions['jigyoshoCloseTime']);
        checkObj['jigyosho'] = true;
    }
    if (conditions['jigyosho24H']) {
        jigyoshoFeatures = if24H(jigyoshoFeatures, conditions['jigyosho24H']);
        checkObj['jigyosho'] = true;
    }
    if (conditions['jigyoshoIchijiHoiku']) {
        jigyoshoFeatures = ifIchijiHoiku(jigyoshoFeatures, conditions['jigyoshoIchijiHoiku']);
        checkObj['jigyosho'] = true;
    }
    if (conditions['jigyoshoYakan']) {
        jigyoshoFeatures = ifYakan(jigyoshoFeatures, conditions['jigyoshoYakan']);
        checkObj['jigyosho'] = true;
    }
    if (conditions['jigyoshoKyujitu']) {
        jigyoshoFeatures = ifKyujitu(jigyoshoFeatures, conditions['jigyoshoKyujitu']);
        checkObj['jigyosho'] = true;
    }
    if (conditions['jigyoshoEncho']) {
        jigyoshoFeatures = ifEncho(jigyoshoFeatures, conditions['jigyoshoEncho']);
        checkObj['jigyosho'] = true;
    }
    if (conditions['jigyoshoVacancy']) {
        jigyoshoFeatures = ifVacancy(jigyoshoFeatures, conditions['jigyoshoVacancy']);
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
