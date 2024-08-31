const express = require('express');
const app = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const {addData,checkStatus,getCompressedImageByRequestID} = require('../Controllers/imageController');

app.post('/product_image',upload.single('file'),addData);
app.get('/product_image/status/:requestId',checkStatus);
app.get('/product_image/:requestId',getCompressedImageByRequestID);

module.exports = app;