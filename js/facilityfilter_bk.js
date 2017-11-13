window.FacilityFilter = function () {
};

/**
 * 指定したフィルター条件に一致する施設情報のGeoJsonを生成する
 *
 * @param  {[type]} conditions        [description]
 * @param  {[type]} nurseryFacilities [description]
 * @return {[type]}                   [description]
 */
FacilityFilter.prototype.getFilteredFeaturesGeoJson = function (conditions, nurseryFacilities)
{
  	'use strict';

    // 絞り込んだ条件に一致する施設を格納するgeoJsonを準備
    var newGeoJson = {
        "type": "FeatureCollection",
        "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
        "features":[]
    };

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


    var ifOpenTime = function (typeFeatures,conditionName) {
      var filterfunc = function (item, idx) {
          var f = function (item,idx) {
              var openHour = conditionName.slice(0, conditionName.indexOf(":"));
              var openMin = Number(conditionName.slice(-2));
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

    var ifCloseTime = function (typeFeatures,conditionName) {
      var filterfunc = function (item, idx) {
          var f = function (item,idx) {
              var closeHour = conditionName.slice(0, conditionName.indexOf(":"));
              var closeMin = Number(conditionName.slice(-2));
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

    var if24H = function (typeFeatures,conditionName) {
      var filterfunc = function (item, idx) {
          var f = function (item,idx) {
              var h24 = item.properties['H24'] ? item.properties['H24'] : item.properties['H24'];
              if(h24 === conditionName) {
                  return true;
              }
          };
          return f(item,idx);
      };
      return typeFeatures.filter(filterfunc);
    };

    var ifIchijiHoiku = function (typeFeatures,conditionName) {
      var filterfunc = function (item, idx) {
          var f = function (item,idx) {
              var temp = item.properties['一時'] ? item.properties['一時'] : item.properties['Temp'];
              if(temp === conditionName) {
                    return true;
                }
          };
          return f(item,idx);
      };
      return typeFeatures.filter(filterfunc);
    };

    var ifYakan = function (typeFeatures,conditionName) {
      var filterfunc = function (item, idx) {
          var f = function (item,idx) {
              var night = item.properties['夜間'] ? item.properties['夜間'] : item.properties['Night'];
              if(night === conditionName) {
                    return true;
                }
          };
          return f(item,idx);
      };
      return typeFeatures.filter(filterfunc);
    };

    var ifKyujitu = function (typeFeatures,conditionName) {
      var filterfunc = function (item, idx) {
          var f = function (item,idx) {
              var holiday = item.properties['休日'] ? item.properties['休日'] : item.properties['Holiday'];
              if(holiday === conditionName) {
                    return true;
                }
          };
          return f(item,idx);
      };
      return typeFeatures.filter(filterfunc);
    };

    var ifEncho = function (typeFeatures,conditionName) {
      var filterfunc = function (item, idx) {
          var f = function (item,idx) {
              var extra = item.properties['延長保育'] ? item.properties['延長保育'] : item.properties['Extra'];
              if(extra === conditionName) {
                    return true;
                }
          };
          return f(item,idx);
      };
      return typeFeatures.filter(filterfunc);
    };

    var ifVacancy = function (typeFeatures,conditionName) {
      var filterfunc = function (item, idx) {
          var f = function (item,idx) {
              var vacancy = item.properties['Vacancy'] ? item.properties['Vacancy'] : item.properties['Vacancy'];
              if(vacancy === conditionName) {
                    return true;
                }
          };
          return f(item,idx);
      };
      return typeFeatures.filter(filterfunc);
    };

    var ifConditions = function (typeFeatures,
      openTime,
      closeTime,
      twentyFour,
      ichijiHoiku,
      yakan,
      kyujitu,
      encho,
      vacancy,
    )
    {
        // 開園時間
        if(openTime) typeFeatures = ifOpenTime(typeFeatures, openTime);
        // 終園時間
        if(closeTime) typeFeatures = ifCloseTime(typeFeatures, closeTime);
        // 24時間
        if(twentyFour) typeFeatures = if24H(typeFeatures, twentyFour);
        // 一時
        if(ichijiHoiku) typeFeatures = ifIchijiHoiku(typeFeatures, ichijiHoiku);
        // 夜間
        if(yakan) typeFeatures = ifYakan(typeFeatures, yakan);
        // 休日
        if(kyujitu) typeFeatures = ifKyujitu(typeFeatures, kyujitu);
        // 延長保育
        if(encho) typeFeatures = ifEncho(typeFeatures, encho);
        // 空きあり
        if(vacancy) typeFeatures = ifVacancy(typeFeatures, vacancy);
        return typeFeatures;
    };


    // ----------------------------------------------------------------------
    // 公立認可保育所向けフィルター(2017-02 kakiki 公立/認可対応)
    // ----------------------------------------------------------------------
    pubNinkaFeatures = ifConditions(pubNinkaFeatures,
      conditions['PubNinkaOpenTime'],
      conditions['PubNinkaCloseTime'],
      conditions['PubNinka24H'],
      conditions['PubNinkaIchijiHoiku'],
      conditions['PubNinkaYakan'],
      conditions['PubNinkaKyujitu'],
      conditions['PubNinkaEncho'],
      conditions['PubNinkaVacancy']
    );
    // ----------------------------------------------------------------------
    // 私立認可保育所向けフィルター(2017-02 kakiki 公立/私立認可対応)
    // ----------------------------------------------------------------------
    priNinkaFeatures = ifConditions(priNinkaFeatures,
      conditions['PriNinkaOpenTime'],
      conditions['PriNinkaCloseTime'],
      conditions['PriNinka24H'],
      conditions['PriNinkaIchijiHoiku'],
      conditions['PriNinkaYakan'],
      conditions['PriNinkaKyujitu'],
      conditions['PriNinkaEncho'],
      conditions['PriNinkaVacancy']
    );
    // ----------------------------------------------------------------------
    // 認可外保育所向けフィルター
    // ----------------------------------------------------------------------
    ninkagaiFeatures = ifConditions(ninkagaiFeatures,
      conditions['ninkagaiOpenTime'],
      conditions['ninkagaiCloseTime'],
      conditions['ninkagai24H'],
      conditions['ninkagaiIchijiHoiku'],
      conditions['ninkagaiYakan'],
      conditions['ninkagaiKyujitu'],
      conditions['ninkagaiEncho'],
      conditions['ninkagaiVacancy']
    );
    // ----------------------------------------------------------------------
    // 横浜保育室向けフィルター
    // ----------------------------------------------------------------------
    yhoikuFeatures = ifConditions(yhoikuFeatures,
      conditions['YhoikuOpenTime'],
      conditions['YhoikuCloseTime'],
      conditions['Yhoiku24H'],
      conditions['YhoikuIchijiHoiku'],
      conditions['YhoikuYakan'],
      conditions['YhoikuKyujitu'],
      conditions['YhoikuEncho'],
      conditions['YhoikuVacancy']
    );
    // ----------------------------------------------------------------------
    // 幼稚園向けフィルター
    // ----------------------------------------------------------------------
    kindergartenFeatures = ifConditions(kindergartenFeatures,
      conditions['KindergartenOpenTime'],
      conditions['KindergartenCloseTime'],
      conditions['Kindergarten24H'],
      conditions['KindergartenIchijiHoiku'],
      conditions['KindergartenYakan'],
      conditions['KindergartenKyujitu'],
      conditions['KindergartenEncho'],
      conditions['KindergartenVacancy']
    );

    // 戻り値の作成
    var features = [];
    Array.prototype.push.apply(features, priNinkaFeatures);
    Array.prototype.push.apply(features, pubNinkaFeatures);
    Array.prototype.push.apply(features, ninkagaiFeatures);
    Array.prototype.push.apply(features, kindergartenFeatures);
    Array.prototype.push.apply(features, yhoikuFeatures);
    newGeoJson.features = features;
    return newGeoJson;
};
