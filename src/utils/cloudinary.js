import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
        cloud_name:process.env.CLOUDINARY_CLOUD_NAME, // Click 'View API Keys' above to copy your cloud name, 
        api_key: process.env.CLOUDINARY_API_KEY, // Click 'View API Keys' above to copy your API key
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });


const uploadOnCloudinary = async (filePath) => {
    try{
           if(!filePath) {
               return null;
           }
           const response = await cloudinary.uploader.upload(filePath,{
            resource_type: "auto"
           })
           //file has been uploaded to cloudinary
           console.log("File uploaded successfully to Cloudinary",response.url);

           return response;
    }
    catch(error)
    {
        fs.unlinkSync(filePath); // delete the file from local storage as upload failed
        return null;
    }
}    


export {uploadOnCloudinary};