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
      typeFeatures = typeFeatures.filter(filterfunc);
    };

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
      typeFeatures = typeFeatures.filter(filterfunc);
    };

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

    var pubNinka, priNinka, ninkagai, yhoiku, kindergarten, jigyosho;
    pubNinka = priNinka = ninkagai = yhoiku = kindergarten = jigyosho = false;

    if (conditions.pubNinkaOpenTime) {
        pubNinkaFeatures = ifOpenTime(pubNinkaFeatures, conditions.pubNinkaOpenTime);
        pubNinka = true;
    }
    if (conditions.pubNinkaCloseTime) {
        pubNinkaFeatures = ifCloseTime(pubNinkaFeatures, conditions.pubNinkaCloseTime);
        pubNinka = true;
    }
    if (conditions.pubNinka24H) {
        pubNinkaFeatures = if24H(pubNinkaFeatures, conditions.pubNinka24H);
        pubNinka = true;
    }
    if (conditions.pubNinkaIchijiHoiku) {
        pubNinkaFeatures = ifIchijiHoiku(pubNinkaFeatures, conditions.pubNinkaIchijiHoiku);
        pubNinka = true;
    }
    if (conditions.pubNinkaYakan) {
        pubNinkaFeatures = ifYakan(pubNinkaFeatures, conditions.pubNinkaYakan);
        pubNinka = true;
    }
    if (conditions.pubNinkaKyujitu) {
        pubNinkaFeatures = ifKyujitu(pubNinkaFeatures, conditions.pubNinkaKyujitu);
        pubNinka = true;
    }
    if (conditions.pubNinkaEncho) {
        pubNinkaFeatures = ifEncho(pubNinkaFeatures, conditions.pubNinkaEncho);
        pubNinka = true;
    }
    if (conditions.pubNinkaVacancy) {
        pubNinkaFeatures = ifVacancy(pubNinkaFeatures, conditions.pubNinkaVacancy);
        pubNinka = true;
    }


    if (conditions.priNinkaOpenTime) {
        priNinkaFeatures = ifOpenTime(priNinkaFeatures, conditions.priNinkaOpenTime);
        priNinka = true;
    }
    if (conditions.priNinkaCloseTime) {
        priNinkaFeatures = ifCloseTime(priNinkaFeatures, conditions.priNinkaCloseTime);
        priNinka = true;
    }
    if (conditions.priNinka24H) {
        priNinkaFeatures = if24H(priNinkaFeatures, conditions.priNinka24H);
        priNinka = true;
    }
    if (conditions.priNinkaIchijiHoiku) {
        priNinkaFeatures = ifIchijiHoiku(priNinkaFeatures, conditions.priNinkaIchijiHoiku);
        priNinka = true;
    }
    if (conditions.priNinkaYakan) {
        priNinkaFeatures = ifYakan(priNinkaFeatures, conditions.priNinkaYakan);
        priNinka = true;
    }
    if (conditions.priNinkaKyujitu) {
        priNinkaFeatures = ifKyujitu(priNinkaFeatures, conditions.priNinkaKyujitu);
        priNinka = true;
    }
    if (conditions.priNinkaEncho) {
        priNinkaFeatures = ifEncho(priNinkaFeatures, conditions.priNinkaEncho);
        priNinka = true;
    }
    if (conditions.priNinkaVacancy) {
        priNinkaFeatures = ifVacancy(priNinkaFeatures, conditions.priNinkaVacancy);
        priNinka = true;
    }



    if (conditions.ninkagaiOpenTime) {
        ninkagaiFeatures = ifOpenTime(ninkagaiFeatures, conditions.ninkagaiOpenTime);
        ninkagai = true;
    }
    if (conditions.ninkagaiCloseTime) {
        ninkagaiFeatures = ifCloseTime(ninkagaiFeatures, conditions.ninkagaiCloseTime);
        ninkagai = true;
    }
    if (conditions.ninkagai24H) {
        ninkagaiFeatures = if24H(ninkagaiFeatures, conditions.ninkagai24H);
        ninkagai = true;
    }
    if (conditions.ninkagaiIchijiHoiku) {
        ninkagaiFeatures = ifIchijiHoiku(ninkagaiFeatures, conditions.ninkagaiIchijiHoiku);
        ninkagai = true;
    }
    if (conditions.ninkagaiYakan) {
        ninkagaiFeatures = ifYakan(ninkagaiFeatures, conditions.ninkagaiYakan);
        ninkagai = true;
    }
    if (conditions.ninkagaiKyujitu) {
        ninkagaiFeatures = ifKyujitu(ninkagaiFeatures, conditions.ninkagaiKyujitu);
        ninkagai = true;
    }
    if (conditions.ninkagaiEncho) {
        ninkagaiFeatures = ifEncho(ninkagaiFeatures, conditions.ninkagaiEncho);
        ninkagai = true;
    }
    if (conditions.ninkagaiVacancy) {
        ninkagaiFeatures = ifVacancy(ninkagaiFeatures, conditions.ninkagaiVacancy);
        ninkagai = true;
    }


    if (conditions.yhoikuOpenTime) {
        yhoikuFeatures = ifOpenTime(yhoikuFeatures, conditions.yhoikuOpenTime);
        yhoiku = true;
    }
    if (conditions.yhoikuCloseTime) {
        yhoikuFeatures = ifCloseTime(yhoikuFeatures, conditions.yhoikuCloseTime);
        yhoiku = true;
    }
    if (conditions.yhoiku24H) {
        yhoikuFeatures = if24H(yhoikuFeatures, conditions.yhoiku24H);
        yhoiku = true;
    }
    if (conditions.yhoikuIchijiHoiku) {
        yhoikuFeatures = ifIchijiHoiku(yhoikuFeatures, conditions.yhoikuIchijiHoiku);
        yhoiku = true;
    }
    if (conditions.yhoikuYakan) {
        yhoikuFeatures = ifYakan(yhoikuFeatures, conditions.yhoikuYakan);
        yhoiku = true;
    }
    if (conditions.yhoikuKyujitu) {
        yhoikuFeatures = ifKyujitu(yhoikuFeatures, conditions.yhoikuKyujitu);
        yhoiku = true;
    }
    if (conditions.yhoikuEncho) {
        yhoikuFeatures = ifEncho(yhoikuFeatures, conditions.yhoikuEncho);
        yhoiku = true;
    }
    if (conditions.yhoikuVacancy) {
        yhoikuFeatures = ifVacancy(yhoikuFeatures, conditions.yhoikuVacancy);
        yhoiku = true;
    }


    if (conditions.kindergartenOpenTime) {
        kindergartenFeatures = ifOpenTime(kindergartenFeatures, conditions.kindergartenOpenTime);
        kindergarten = true;
    }
    if (conditions.kindergartenCloseTime) {
        kindergartenFeatures = ifCloseTime(kindergartenFeatures, conditions.kindergartenCloseTime);
        kindergarten = true;
    }
    if (conditions.kindergarten24H) {
        kindergartenFeatures = if24H(kindergartenFeatures, conditions.kindergarten24H);
        kindergarten = true;
    }
    if (conditions.kindergartenIchijiHoiku) {
        kindergartenFeatures = ifIchijiHoiku(kindergartenFeatures, conditions.kindergartenIchijiHoiku);
        kindergarten = true;
    }
    if (conditions.kindergartenYakan) {
        kindergartenFeatures = ifYakan(kindergartenFeatures, conditions.kindergartenYakan);
        kindergarten = true;
    }
    if (conditions.kindergartenKyujitu) {
        kindergartenFeatures = ifKyujitu(kindergartenFeatures, conditions.kindergartenKyujitu);
        kindergarten = true;
    }
    if (conditions.kindergartenEncho) {
        kindergartenFeatures = ifEncho(kindergartenFeatures, conditions.kindergartenEncho);
        kindergarten = true;
    }
    if (conditions.kindergartenVacancy) {
        kindergartenFeatures = ifVacancy(kindergartenFeatures, conditions.kindergartenVacancy);
        kindergarten = true;
    }

    // 戻り値の作成
    var features = [];
    Array.prototype.push.apply(features, pubNinkaFeatures);
    Array.prototype.push.apply(features, priNinkaFeatures);
    Array.prototype.push.apply(features, ninkagaiFeatures);
    Array.prototype.push.apply(features, kindergartenFeatures);
    Array.prototype.push.apply(features, yhoikuFeatures);
    newGeoJson.features = features;
    return newGeoJson;
};
