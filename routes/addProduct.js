const uploadToFirebase = require('../routes/firebaseStorage')
const dbImport = require('../routes/dbConnection')
const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')

const multer = require('multer')
const upload = multer({ dest: 'uploads/' });

const db = dbImport.db


router.post('/', upload.single('img'), async (req, res) => {
    const { name, desc, type } = req.body
    
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

module.exports = router