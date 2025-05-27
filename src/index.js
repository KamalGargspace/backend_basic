// require('dotenv').config({path: './env'}); // Load environment variables from .env file
import dotenv from 'dotenv';
// import mongoose from 'mongoose';
// import { DB_NAME } from './constants'; 
import connectDB from './db/index.js'; // Import the connectDB function

dotenv.config({ path: './env' }); // Load environment variables from .env file





connectDB() // Call the connectDB function to establish a connection to the database







// one of the approaches to connect to the database using the function but can be improved
// function connectDB(){}

// connectDB()

// iify
// method 2 iify wala

// import express from 'express';
// const app = express();
// (async()=>{
//     try{
//          await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
//          app.on("errror",(err)=>{
//             console.error('Error connecting to the database',err);
//             throw err; // rethrow the error to stop the execution

//          })
//          app.listen(process.env.PORT, () => {
//             console.log(`Server is running on port ${process.env.PORT}`);
//          });
//     }
//     catch(err){
//         console.error('Error connecting to the database:', err);
//         throw err; // rethrow the error to stop the execution
//     }
