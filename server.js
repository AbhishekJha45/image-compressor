const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
//app.use(cors({origin: 'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser())
app.get('/',(req,res)=>{
    res.send('Hello server running')
})
const connectToMongoDB = async () => {
    try{
        //createSuperAdmin()
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas');
    }
    catch(err){
        console.error('Error connecting to MongoDB Atlas',err)
    }
}
connectToMongoDB();
const mainRoute = require('./Routes/imageRoute');
app.use('/api',mainRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`)
});
