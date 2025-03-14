const express = require('express')
const dbImport = require('../routes/dbConnection')
const router = express.Router()

const db = dbImport.db

router.get('/', (req, res) => {
    db.query("SELECT * FROM products", (err, data) => {
        res.json(data)
    })
})

module.exports = router