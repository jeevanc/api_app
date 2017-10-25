const express = require('express');
const router = express.Router();

var features = require('./features');
var ward = require('./wards');

// /* enabling CORS(Cross origin resource sharing)*/
// router.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Nilakantha ',
    body: 'api of Nilkantha'
  });
});



router.get('/api/v1/:type', features.apiQuery,features.filterWards,features.totalStats,features.filterStats);

router.get('/api/v2/wards',ward.getWards);




module.exports = router;
