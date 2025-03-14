const express = require('express')
const dbImport = require('../routes/dbConnection')
const router = express.Router()

const db = dbImport.db

router.post('/', (req, res) => {
        const { id } = req.body;
        db.query("DELETE FROM products WHERE product_id = ?", [id], (err, data) => {
            if(err){
                return (console.log(err))
            }
            res.status(200).json({ message: "Product removed successfully!", data: req.body })
        })
})

module.exports = router