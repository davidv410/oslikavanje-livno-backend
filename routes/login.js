const express = require('express')
const dbImport = require('../routes/dbConnection')
const jwt = require('jsonwebtoken')
const router = express.Router()

const db = dbImport.db

router.post('/', (req, res) => {
    const { ime, sifra } = req.body 

    db.query("SELECT * FROM users WHERE name = ?", [ime], (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        if (data.length === 0) {
            return res.status(401).json({ error: "User not found" });
        }
        if (data[0].password === sifra) {
            const token = jwt.sign({ id: data[0].id, name: data[0].name, role: data[0].role }, process.env.JWT_KEY , { expiresIn: "1h" })
            res.json({ token });
            // res.status(200).json({ message: "Login successful" });

        } else { 
            res.status(401).json({ error: "Invalid password" });
        }
    })
})

module.exports = router