const express = require('express')
const dbImport = require('../routes/dbConnection')
const { uploadToFirebase, deleteFromFirebase } = require('../routes/firebaseStorage');
const path = require('path');
const fs = require('fs');
const router = express.Router()

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const db = dbImport.db

router.post('/', upload.single('img'), async (req, res) => {

    const {id, img, name, desc } = req.body
    try {
        let imageUrl = req.body.img;

        if (req.file) {
            const filePath = req.file.path;
            const fileName = Date.now() + path.extname(req.file.originalname);
            imageUrl = await uploadToFirebase(filePath, fileName);
            fs.unlinkSync(filePath); 

            
            const oldImageUrl = req.body.img;
            if (oldImageUrl) {
                const oldImageName = oldImageUrl.split('/').pop().split('#')[0].split('?')[0];
                await deleteFromFirebase(oldImageName);
            }
        }

        db.query("UPDATE products SET product_name = ?, product_desc = ?, product_img = ? WHERE product_id = ?", [name, desc, imageUrl, id], (err, data) => {
            if (err) {
                return res.status(500).json({ error: "Database error", details: err });
            }
            res.status(200).json({ message: "Product updated successfully!", data: req.body });
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to upload image', details: error });
    }
})

module.exports = router