const express = require('express');
const mysql = require('mysql2');
const cors = require('cors')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv').config()
const app = express()
app.use(express.json())
app.use(cors())

app.use(cors({
    origin: process.env.FRONTEND_DOMAIN,
    credentials: true,
  }));

const admin = require('firebase-admin')
const { getStorage } = require('firebase-admin/storage')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const serviceAccount = require('./firebase-admin.json')

admin.initializeApp({
    credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Fix newline issue
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    }),
    storageBucket: "gs://oslikavanje-livno-img-folder.firebasestorage.app"
})

const bucket = getStorage().bucket()

const upload = multer({ dest: 'uploads/' });

const uploadToFirebase = async (filePath, fileName) => {
    const file = bucket.file(fileName);
    await bucket.upload(filePath, {
        destination: fileName,
        metadata: { contentType: 'image/png' }
    })

    await file.makePublic(); // Makes the file accessible via URL

    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}


// RAILWAY BAZA
const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER, 
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE
})

db.connect((err) => {
    if(err){return console.log(err)}
    console.log('Database connected')
})

app.get('/product-types', (req, res) => {
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

app.post('/add-product', upload.single('img'), async (req, res) => {
    const { name, desc, type } = req.body
    // const filename = req.file.filename

    try {
        const filePath = req.file.path;
        const fileName = Date.now() + path.extname(req.file.originalname);
        const imageUrl = await uploadToFirebase(filePath, fileName);

        fs.unlinkSync(filePath); // Delete the temporary file

        db.query("INSERT INTO products (product_name, product_desc, product_img, product_type) VALUES (?,?,?,?)", [name, desc, imageUrl, type], (err, data) => {
            if(err){
                return res.status(500).json({ error: "Database error", details: err });
            }
            res.status(200).json({ message: "Product added successfully!", data: req.body });
        })

    } catch (error) {
        res.status(500).json({ error: 'Failed to upload image', details: error });
    }

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
            const token = jwt.sign({ id: data[0].id, name: data[0].name, role: data[0].role }, process.env.JWT_KEY , { expiresIn: "1h" })
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