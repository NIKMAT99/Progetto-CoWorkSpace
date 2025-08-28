const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
        cb(null, `${Date.now()}_${base}${ext}`);
    }
});

const upload = multer({ storage });

// field name DEVE essere "image" (coerente con il JS)
router.post('/', upload.single('image_url'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Nessun file caricato' });
    const url = `http://localhost:${process.env.PORT || 3000}/uploads/${req.file.filename}`;
    res.json({ url });
});

module.exports = router;
