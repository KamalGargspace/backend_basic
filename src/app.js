import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app  = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN ,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))// Set a limit for the JSON body size and forms se agr json mai data aayegi to uski limit set karenge
app.use(express.urlencoded({extended: true, limit: "16kb"}));//url se bhi data aata hai to usko encode krna and limit set
app.use(cookieParser());//user ki cookies ko access karna and use set karna 
app.use(express.static("public"));//koi image ya file serve karni ho to public folder se serve karenge



export {app};