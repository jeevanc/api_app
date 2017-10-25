module.exports = {

  overpass: {
    url : 'http://www.overpass-api.de/api/interpreter?data=',
    timeout: 25,
    dataType: 'json',
    osmElements: ['node', 'way', 'relation']
  },

  amenities:{
    'school':{
      'types': ['private','community','government']
    }
  }




}
