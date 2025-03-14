const express = require('express');
const dbImport = require('../routes/dbConnection')
const router = express.Router();

const db = dbImport.db

router.get('/', (req, res) => {
    db.query("SELECT * FROM product_types", (err, data) => {
        if (err) {
            return res.status(500).json(err);
          }
          if (data.length === 0) {
            return res.status(404).json({ error: 'No product types found' });
          }
          res.json(data); 
    })
})

module.exports = router;