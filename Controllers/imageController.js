const imageModel = require('../Models/imageModel');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const { processImages } = require('./SharpAPI');
const addData = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        const readableStream = new Readable({
            read() {
                this.push(req.file.buffer);
                this.push(null); 
            }
        });

        
        const productImages = []
        readableStream
            .pipe(csv()).on('data', (row) => {
                const uuid = uuidv4();
                const parsedRow = {};
                for (const key in row) {
                    const cleanKey = key.replace(/^'|'$/g, '').trim();
                    parsedRow[cleanKey] = row[key];
                }
                const productImage = {
                    serialNumber: parsedRow.serialNumber,
                    productName: row.productName,
                    request_Id: uuid,
                    imageInputUrls: row.imageInputUrls ? row.imageInputUrls.split(',') : [],
                    imageStatus: "COMPRESSING"
                };
                productImages.push(productImage);
            })
            .on('end', async () => {
                const result = await imageModel.insertMany(productImages);
                const requestIds = productImages.map(doc => doc.request_Id);
                res.status(201).send({ request_Ids: requestIds, addedRecords: result.length });
            })
            .on('error', (err) => {
                res.status(400).send(err);
            })
    }
    catch (err) {
        res.status(500).send(err);
    }
};


// Get a document by request ID
const getCompressedImageByRequestID = async (req, res) => {
    try {
        const result = await imageModel.findOne({ request_Id: req.params.requestId });
        if (!result) {
            return res.status(404).send({ message: "Document not found" });
        }

        const id = result._id;
        const outputImages = await processImages(result.imageInputUrls);
        if (!outputImages) {
            const status = await imageModel.findByIdAndUpdate(id, { imageStatus: "FAILED" })
            return res.status(500).send({ message: "Failed to process images" }, status);
        }
        else {
            const update = await imageModel.findByIdAndUpdate(id, { imageOutputUrls: outputImages, imageStatus: "COMPLETED" }, { new: true });
            res.status(200).send(update);
        }
    } catch (err) {
        res.status(500).send(err);
    }
};

const checkStatus = async (req, res) => {
    try {
        const result = await imageModel.findOne({ request_Id: req.params.requestId });
        if (!result) {
            return res.status(404).send({ message: "No such data found" });
        }
        else{
            return res.status(200).send({ message: "The Images status is ",
                status: result.imageStatus})
        }
    }catch(err){
        res.status(500).send(err);
    }
}

module.exports = {
    addData,
    checkStatus,
    getCompressedImageByRequestID
}