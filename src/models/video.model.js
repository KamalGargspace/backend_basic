import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";//to apply the aggregate queries with pagination

const videoSchema = new Schema({
    videFile:{
        type:String, //cloudinary url
        required:true

    },
    Thumbnail:{
        type:String, //cloudinary url
        required:true
    },
    title:{
        type:String,
        required:true,
       
    },
    description:{
        type:String,
        required:true,
       
    },
    duration:{
        type:Number,
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true});

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video",videoSchema);