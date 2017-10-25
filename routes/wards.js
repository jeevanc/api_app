var wards = require('../geojson/wards.json');
module.exports = {
  getWards: function(req, res, next) {
    var wardList = wards.features.map(feature => {
        return  {
          sn : Number(feature.properties.name.split('Nilkantha Municipality Ward No. ')[1]),
          name : feature.properties.name,
          id : feature.properties['@id'],
        };
    });
    wardList.sort(function(a,b){
      return a.sn-b.sn;
    })
    res.json({
      success : 1,
      message: "Wards fetched successfully",
      wards : wardList
    })
  }

}
