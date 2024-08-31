const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
    { 
      serialNumber: {type: Number,required: true},
      productName: {type: String,required: true},
      request_Id: { type: String},
      imageInputUrls: {type: [String],required: true},
      imageStatus: { type: String, enum: ["STARTED_COMPRESSION", "COMPRESSING","STORING_COMPRESSED","COMPLETED","FAILED"], default: "STARTED_COMPRESSION" },
      imageOutputUrls: {type: [String],default: null},
      createdAt: {type: Number, default: Date.now},
      updatedAt: {type: Number, default: Date.now},
    },
    { timestamps: true }
  );
  const imageModel = mongoose.model("imagesCSV",imageSchema);
  module.exports = imageModel;