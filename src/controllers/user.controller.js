import { asyncHandler } from '../utils/asynchandler.js';
import {ApiError} from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const generateAccessTokenandRefreshToken = async (userID) =>{
   try{
     const user = await User.findById(userID)
    const accessToken =  user.generateAccessToken() 
     const refreshToken = user.generateRefreshToken()
     user.refreshToken = refreshToken;
     await user.save({validateBeforeSave: false})

     return {
        accessToken,
        refreshToken
     }

   }
   catch(error) {
      throw new ApiError(500, "Something went wrong while generating tokens");
   }
}

const registerUser = asyncHandler(async (req, res) => {
   //get user details from the frontend
   //validation-not empty
   //check if user already exists:username or email
   //check for images ,check for avatar
   //upload image to cloudinary,avatar
   //create user object - create entry in db
   //remove password and refresh token field from response
   //check for user creation success
   //return res
   
const {fullName,email,username,password} = req.body
console.log("email:", email);
// console.log("req.body:", req.body);

if([fullName,email,username,password].some(field => field.trim() === "")) {
   throw new ApiError(400, "All fields are required");
}

const existedUser =await User.findOne({
   $or: [{ email }, { username }]
})

if(existedUser){
   throw new ApiError(409, "User already exists with this email or username");
}

const avatarLocalPath = req.files?.avatar[0]?.path;
// const converImgaeLocalPath = req.files?.coverImage[0]?.path;
let converImgaeLocalPath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
   converImgaeLocalPath = req.files.coverImage[0].path;
}

// console.log("req.files:", req.files);

if(!avatarLocalPath){
   throw new ApiError(400, "Avatar image is required");
}

const avatar = await uploadOnCloudinary(avatarLocalPath);
const coverImage = converImgaeLocalPath ? await uploadOnCloudinary(converImgaeLocalPath) : null;

if(!avatar) {
   throw new ApiError(400, "Avatar image is required");
}

const user = await User.create({
   fullName,
   avatar: avatar.url,
   coverImage: coverImage ? coverImage.url : "",
   email,
   password,
   username:username.toLowerCase()


})

const createdUser = await User.findById(user._id).select(
   "-refreshToken"
)

if(!createdUser) {
   throw new ApiError(500, "something went wrong, user not created");
}


return res.status(201).json(
   new ApiResponse(200,createdUser, "User registered successfully")
)



});

const loginUser = asyncHandler(async (req, res) => {
   //req body->data
   //username or email
   //find the user
   //check password
   //if password matches, generate access token and refresh token
   //send cookies
   const {email, username, password} = req.body;
   if(!email && !username){
      throw new ApiError(400, "Email or username is required");
   }

   const user = await User.findOne({
      $or: [{email},{username}]
   })
   //here findOne is method of mongoose and thats why we use User as the whole

   if(!user) {
      throw new ApiError(404, "User does not exist");
   }
  //here isPasswordCorrect is a method of the user schema which we defined in user.model.js therefore it is applicabel on our user
  //instead of User therefore we use user
  const isPasswordValid = await user.isPasswordCorrect(password);

  if(!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials");
  }


  const {accessToken,refreshToken} = await generateAccessTokenandRefreshToken(user._id)

  const loggedInUser = await User.findById(user._id).select(
     "-refreshToken -password"
  )
  const options = {
   httponly : true, //to prevent client side js from accessing the cookie
   secure : true //to ensure the cookie is sent only over HTTPS
  }

  return res.status(200)
  .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(new ApiResponse(200, {
      user: loggedInUser,
      accessToken,
      refreshToken
   }, "User logged in successfully"));





})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, 
     { 
      $unset :{
         refreshToken: 1
      }
   },
      {
         new:true
      }
   )

const options = {
   httponly : true, //to prevent client side js from accessing the cookie
   secure : true //to ensure the cookie is sent only over HTTPS
  }

  return res.status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
   .json(new ApiResponse(200, {}, "User logged out successfully"));


})


const refreshAccessToken = asyncHandler(async (req, res) => {
   const incomingRefreshToken = req.cookies.refreshToken|| req.body.refreshToken

   if(!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request");

   }
   try {
      const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
   
      const user = await User.findById(decodedToken._id)
   
      if(!user) {
         throw new ApiError(401, "Invalid refresh token");
   
      }
   
      if(incomingRefreshToken !== user?.refreshToken) {
         throw new ApiError(401, "Invalid refresh token");
      }
   
      const {accessToken, newrefreshToken} = await generateAccessTokenandRefreshToken(user._id);
      const options = {
         httponly : true, //to prevent client side js from accessing the cookie
         secure : true //to ensure the cookie is sent only over HTTPS
        }
   
        return res.status(200)
        .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", newrefreshToken, options)
         .json(new ApiResponse(200, {
            accessToken,
            refreshToken:newrefreshToken},
            "Access token refreshed successfully")
         )
   } catch (error) {
      throw new ApiError(401, error.message || "Unauthorized request");
   }

})
const changeCurrentPasswword = asyncHandler(async(req,res)=>{
   const {oldPassword, newPassword} = req.body;

   const user = await User.findById(req.user?._id)

   const isPasswordValid = await user.isPasswordCorrect(oldPassword);
   if(!isPasswordValid) {
      throw new ApiError(401, "Invalid old password");
   }

   user.password = newPassword;
   await user.save({validateBeforeSave: false})

   return res.
   status(200)
   .json(new ApiResponse(200, {}, "Password changed successfully"));
})


const getCurrentUser = asyncHandler(async (req, res) => {
   return res.status(200)
   .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName,email} = req.body;

    if(!fullName || !email){
      throw new ApiError(400, "all fileds are required");
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{
            fullName,
            email
         }
      },
      {new:true}

    ).select("-refreshToken -password");



    return res
    .status(200)
    .json(new ApiResponse(200,user, "User details updated successfully"));
})


const updateUserAvatar = asyncHandler(async (req, res) => {

   const avatarLocalPath = req.file?.path;
   if(!avatarLocalPath) {
      throw new ApiError(400, "Avatar image is missing");
   }
  const avatar = await uploadOnCloudinary(avatarLocalPath)

//   const ImageToDelete = req.user?.avatar;

  
   if(!avatar.url) {
      throw new ApiError(400, "error while uploading avatar image");
   }


   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            avatar: avatar.url
         }
      },
      {new:true}
   ).select("-refreshToken -password");

   return res.status(200)
   .json(new ApiResponse(200, user, "Avatar updated successfully"));

})
const updateUserCoverImage = asyncHandler(async (req, res) => {

   const coverImageLocalPath = req.file?.path;
   if(!coverImageLocalPath) {
      throw new ApiError(400, "Cover image file is missing");
   }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
   if(!coverImage.url) {
      throw new ApiError(400, "error while uploading the cover image");
   }


   const user = await User.findByIdAndUpdate(
      req.user._id,
      {
         $set: {
            coverImage: coverImage.url
         }
      },
      {new:true}
   ).select("-refreshToken -password");

   return res.status(200)
   .json(new ApiResponse(200, user, "Cover Image updated successfully"));

})
const getUserChannelProfile = asyncHandler(async (req, res) => {
   const { username } = req.params

   if((!username?.trim())){
      throw new ApiError(400, "Username is missing");
   }

   const channel = await User.aggregate([
      {
       $match:{
         username: username?.toLowerCase()
       }   
      },
      {
         $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
         }
      },
      {
         $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribedTo"
         }
      },
      {
         $addFields:{
            subscribersCount: { $size: "$subscribers" },
            channelsSubscribedToCount: { $size: "$subscribedTo" },
            isSubscribed: {
               if:{$in:[req.user?._id, "$subscribers.subscriber"]},
               then: true,
               else: false
            }
         }
      },
      {
         $project:{
            fullName:1,
            username:1,
            subscribersCount:1,
            channelsSubscribedToCount:1,
            isSubscribed:1,
            avatar:1,
            coverImage:1,
            email:1
         }
      }
   ])
   console.log("channel:", channel);
   if(!channel?.length){
      throw new ApiError(404, "Channel not found");
   }

   return res.status(200)
   .json(new ApiResponse(200, channel[0], "Channel profile fetched successfully"));
})

const getWatchHistory = asyncHandler(async (req, res) => {
   const user = await User.aggregate([
      {
         $match:{
            _id: new mongoose.Types.ObjectId(req.user._id)
         }
      },
      {
         $lookup:{
            from:"videos",
            localField:"watchHistory",
            foreignField:"_id",
            as:"watchHistory",
            pipeline:[
               {
                  $lookup:{
                     from:"users",
                     localField:"owner",
                     foreignField:"_id",
                     as:"owner",
                     pipeline:[
                        {
                           $project:{
                              fullName:1,
                              username:1,
                              avatar:1
                           }
                        }
                     ]
                  }
               },
               {
                  $addFields:{
                     owner:{
                        $first:"$owner"
                     }
                  }
               }
            ]
         }
      }
   ])
   return res.status(200)
   .json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully"));
})




export { registerUser,
loginUser,
logoutUser,
refreshAccessToken,
changeCurrentPasswword,
getCurrentUser,
updateAccountDetails,
updateUserAvatar,
updateUserCoverImage,
getUserChannelProfile,
getWatchHistory
 };