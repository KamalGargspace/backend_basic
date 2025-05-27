import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
        const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\nMongoDB connected successfully to DB HOST: ${connectionInstance.connection.host}`);
    }catch(err){
        console.error('Error connecting to the database:', err);
        process.exit(1) // rethrow the error to stop the execution
    }
}

export default connectDB;