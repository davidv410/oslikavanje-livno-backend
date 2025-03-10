const express = require('express');
const mysql = require('mysql2');
const cors = require('cors')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const dotenv = require('dotenv').config()
const SECRET_KEY = process.env.JWT_KEY;

const app = express()
app.use(express.json())
app.use(cors())


const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "../frontend/oslikavanje-livno/public/proizvodi")
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({ storage: storage });


const db = mysql.createConnection(process.env.MYSQL_URL)

db.connect((err) => {
    if(err){return console.log(err)}
    console.log('Database connected')
})

app.get('/product-types', (req, res) => {
    db.query("SELECT * FROM product_types", (err, data) => {
        res.json(data)
    })
})

app.get('/products', (req, res) => {
    db.query("SELECT * FROM products", (err, data) => {
        res.json(data)
    })
})

app.post('/remove-products', (req, res) => {
    const { id } = req.body;
    db.query("DELETE FROM products WHERE product_id = ?", [id], (err, data) => {
        if(err){
            return (console.log(err))
        }
        res.status(200).json({ message: "Product removed successfully!", data: req.body })
    })
})

app.post('/add-product', upload.single("img"), (req, res) => {
    const { name, desc, type } = req.body
    const filename = req.file.filename

    db.query("INSERT INTO products (product_name, product_desc, product_img, product_type) VALUES (?,?,?,?)", [name, desc, filename, type], (err, data) => {
        if(err){
           return console.log(err)
        }
        res.status(200).json({ message: "Product added successfully!", data: req.body });
    })
})

app.post('/login', (req, res) => {
    const { ime, sifra } = req.body 
    db.query("SELECT * FROM users WHERE name = ?", [ime], (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        if (data.length === 0) {
            return res.status(401).json({ error: "User not found" });
        }
        if (data[0].password === sifra) {
            const token = jwt.sign({ id: data[0].id, name: data[0].name, role: data[0].role }, SECRET_KEY, { expiresIn: "1h" })
            res.json({ token });
            // res.status(200).json({ message: "Login successful" });

        } else { 
            res.status(401).json({ error: "Invalid password" });
        }
    })
})

app.listen(5000, () => {
    console.log('Server started')
})