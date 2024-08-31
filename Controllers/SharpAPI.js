const axios = require('axios');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');
const { PassThrough } = require('stream');
const serviceAccount = require('../Utils/firebase-service.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.storageBucket
});

const bucket = admin.storage().bucket();

// Function to download and compress a single image
async function downloadAndCompressImage(url) {
    const response = await axios({
        url,
        responseType: 'arraybuffer'
    });

    const compressedImage = await sharp(response.data)
        .jpeg({ quality: 50 }) //this will compress the image quality to 50% 
        .toBuffer();

    return compressedImage;
}

// Function to save the compressed image directly to Firebase Storage
async function saveCompressedImage(compressedImage, index) {
    const filename = `_compressed_${index}.jpg`;
    const destination = `compressed_images/${filename}`; 

    const passThroughStream = new PassThrough();

    // Pipe the compressed image to Firebase Storage
    const file = bucket.file(destination);
    const writeStream = file.createWriteStream({
        metadata: {
            metadata: {
                firebaseStorageDownloadTokens: uuidv4()
            }
        }
    });

    // Write the compressed image buffer to the pass-through stream
    passThroughStream.end(compressedImage);

    // Pipe the pass-through stream to Firebase write stream
    passThroughStream.pipe(writeStream);

    // Wait for the stream to finish
    await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });

    // Get the public URL
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media&token=${file.metadata.metadata.firebaseStorageDownloadTokens}`;

    return publicUrl;
}

// Entry Function to process the images
async function processImages(imageInputUrls) {

    const compressedImageUrls = [];

    for (let i = 0; i < imageInputUrls.length; i++) {
        const compressedImage = await downloadAndCompressImage(imageInputUrls[i]);
        const compressedImageUrl = await saveCompressedImage(compressedImage,i);
        compressedImageUrls.push(compressedImageUrl);
    }
    return compressedImageUrls;
}

module.exports = { processImages };

// Example usage
// processImages(["http://example.com/image1.jpg", "http://example.com/image2.jpg"])
//     .then(urls => console.log("Compressed images saved:", urls))
//     .catch(err => console.error("Error processing images:", err));
