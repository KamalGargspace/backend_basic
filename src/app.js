import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.routes.js';

const app  = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN ,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))// Set a limit for the JSON body size and forms se agr json mai data aayegi to uski limit set karenge
app.use(express.urlencoded({extended: true, limit: "16kb"}));//url se bhi data aata hai to usko encode krna and limit set
app.use(cookieParser());//user ki cookies ko access karna and use set karna 
app.use(express.static("public"));//koi image ya file serve karni ho to public folder se serve karenge

//importing routes



//routes declaration
app.use('/api/v1/users', userRouter);//standard practice otherwise simple /users likh skte h
//http://localhost:5000/api/v1/users/register



export {app};