const request = require('request');
const osmtogeojson = require('osmtogeojson');
const centroid = require('@turf/centroid');
const feature = require('feature');
const turf = require('@turf/turf');
const turfinside = require('@turf/inside');
const _ = require('underscore');
const config = require('../config');
var jsondata = require('../geojson/nilkantha-geojson.json');
var wards = require('../geojson/wards.json');
var bbox = turf.bbox(jsondata);


function apiQuery(type) {
  var url = `http://www.overpass-api.de/api/interpreter?data=
    [out:json][timeout:25];
    (node["amenity"="${type}"]
    (${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]});
    way["amenity"="${type}"]
    (${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]});
    relation["amenity"="${type}"]
    (${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]});
    );
    out body;
    >;
    out skel qt;`
  return url;
}


module.exports = {

  apiQuery: function(req, res, next) {
    request(apiQuery(req.params.type), function(error, response, body) {
      if (response.statusCode == 200) {
        var response = JSON.parse(response.body);
        var data = osmtogeojson(response);
        let filteredData = [];
        data.features.forEach(function(feature) {
          if (feature.geometry.type == 'Polygon') {
            feature.geometry = centroid(feature).geometry;
          }
          if (turf.inside(feature, jsondata.features[0])) {
            filteredData.push(feature);
          }
        });
        req.data = data;
        return next();
        //res.json(filteredData);
      }
    });
  },
  filterWards: function(req, res, next) {
    var wholeGeojson = req.data;
    var filter = [];

    var wardGeojson = _.findWhere(wards.features, {
      id: req.query.wardId
    });

    filter = wholeGeojson.features.filter(function(feature) {
      return turf.inside(feature, wardGeojson);
    })

    req.stat = filter;
    next();
    // res.json({
    //   success: 1,
    //   features: filter
    // })
  },
  totalStats: function(req, res, next) {
    var total = req.data;
    var studentCount = 0;
    var govSchool = 0;
    var pvtSchool = 0;
    var comSchool = 0;
    var remSchool = 0;
    var counter = 0;

    var count = total.features.map(feature => {
      if (feature.properties.amenity === req.params.type) {
        counter++;
      }
      return counter;
    });

    var schoolType = total.features.map(feature => {
      if (feature.properties['operator:type'] === config.amenities.type) {
        govSchool++;
      } else if (feature.properties['operator:type'] === 'private') {
        pvtSchool++;
      } else if (feature.properties['operator:type'] === 'community') {
        comSchool++;
      } else {
        remSchool++;
      }
    });


    var stats = total.features.map(feature => {
      return parseInt(feature.properties['student:count']);
    });
    for (var i = 0; i < stats.length; i++) {
      if (!isNaN(stats[i])) {
        studentCount += stats[i];
      }
    }
    req.totalStats = counter;
    req.stdStats = studentCount;
    next();
  },
  filterStats: function(req, res, next) {
    var filterTotal = req.stat;
    var stdCount = 0;
    var goverSchool = 0;
    var commSchool = 0;
    var priSchool = 0;
    var resSchool = 0;
    var counts = 0;

    var filterCount = filterTotal.map(feature => {
      if (feature.properties.amenity === req.params.type) {
        counts++;
      }
      return counts;
    });

    var schoolCount = filterTotal.map(feature => {
      if (feature.properties['operator:type'] === 'government') {
        goverSchool++;
      } else if (feature.properties['operator:type'] === 'private') {
        priSchool++;
      } else if (feature.properties['operator:type'] === 'community') {
        commSchool++;
      } else {
        resSchool++;
      }
    });

    var totalSchool = goverSchool + priSchool + commSchool + resSchool;


    var filterStats = filterTotal.map(feature => {
      return parseInt(feature.properties['student:count']);
    });

    for (var i = 0; i < filterStats.length; i++) {
      if (!isNaN(filterStats[i])) {
        stdCount += filterStats[i];
      }
    }
  }

}
