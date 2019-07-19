let CustomerModel = require('../models/customer.model')
let express = require('express')
let router = express.Router()
const excelToJson = require('convert-excel-to-json')
const formidable = require('formidable')
var excelData = {};
// Create a new customer
// POST localhost:3000/customer
router.post('/post', (req, res) => {
  // console.log(req.body);
  new formidable.IncomingForm().parse(req)
    .on('field', (name, field) => {
      console.log('Field', name, field)
    })
    .on('file', (name, file) => {
      console.log('Uploaded file', name, file)




      excelData = excelToJson({   //excelData is the required json data 
        sourceFile: file.path,
        header: {
          rows: 1
        },
        // Mapping columns to keys
        columnToKey: {
          '*': '{{columnHeader}}'
        }

      });

      // -> Log Excel Data to Console
      let sheets = Object.keys(excelData);


      //ARRAY OF OBJECTS //this piece of code adds data
      for (dataFromSheets of sheets) {
        for (individualObjects of excelData[dataFromSheets]) {
          if (!(individualObjects["MARKS (100)"])) {  //assigning null when upload so that the MARKS column doesnt disappear 
            individualObjects["MARKS (100)"] = null;
          }
          if (!(individualObjects["SEC"])) {  //assigning null when upload so that the SEC column doesnt disappear 
            individualObjects["SEC"] = null;
          }
          if (!(individualObjects["_id"])) {
            individualObjects["_id"] = individualObjects['SR NO'] + "" + individualObjects['CLASS'];  //adds id to all data pbjects
          }
          // console.log(individualObjects["_id"].substring(0,2));
        }
      }


      for (sheet in excelData){
      for (sheetData of excelData[sheet]){
        let model = new CustomerModel(sheetData)
      model.save()
        .then(doc => {
          if (!doc || doc.length === 0) {
            return res.status(500).send(doc)
          }

          res.status(201).send(doc)
        })
        .catch(err => {
         console.log(err)
        })
      // console.log(sheetData)
      }
    }
      // console.log(excelData);
    })
    .on('aborted', () => {
      console.error('Request aborted by the user')
    })
    .on('error', (err) => {
      console.error('Error', err)
      throw err
    })
    .on('end', () => {
      res.end()
    })
    



})

// // GET
// router.get('/customer', (req, res) => {
//   if (!req.query.email) {
//     return res.status(400).send('Missing URL parameter: email')
//   }

//   CustomerModel.findOne({
//     email: req.query.email
//   })
//     .then(doc => {
//       res.json(doc)
//     })
//     .catch(err => {
//       res.status(500).json(err)
//     })

// })

// UPDATE
router.put('/customer', (req, res) => {
  if (!req.query.email) {
    return res.status(400).send('Missing URL parameter: email')
  }

  CustomerModel.findOneAndUpdate({
    email: req.query.email
  }, req.body, {
      new: true
    })
    .then(doc => {
      res.json(doc)
    })
    .catch(err => {
      res.status(500).json(err)
    })
})

// DELETE
router.delete('/customer', (req, res) => {
  if (!req.query.email) {
    return res.status(400).send('Missing URL parameter: email')
  }

  CustomerModel.findOneAndRemove({
    email: req.query.email
  })
    .then(doc => {
      res.json(doc)
    })
    .catch(err => {
      res.status(500).json(err)
    })
})

module.exports = router