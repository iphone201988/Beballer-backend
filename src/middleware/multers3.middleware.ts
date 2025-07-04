import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import path from "path";
import fs from "fs";

import { PutObjectCommand } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});


const bucketName = process.env.S3_BUCKET_NAME;

const uploads3 = multer({
    storage: multerS3({
        s3,
        bucket: bucketName,
        contentType:(req, file, cb) => {
            if (file.fieldname === "postVideo") {
                cb(null, "video/mp4"); 
            } else {
                cb(null, file.mimetype);;
            }
        },
        key: function (req, file, cb) {
            let folderPath;
            if (file.fieldname === "profilePicture") {
                const { userType } = req;
                if (userType === "player") {
                    folderPath = "Users/Players";
                } else if (userType === "organizer") {
                    folderPath = "Users/Organizers";
                } else {
                    return cb(new Error("Invalid type for profilePicture field"), null);
                }
            } else if (file.fieldname === "photos") {
                folderPath = "Fields";
            } else if (file.fieldname === "postImage") {
                folderPath = "Post Pictures";
            } else if (file.fieldname === "postVideo") {
                folderPath = "Post Videos";
            } else {
                return cb(new Error(`Invalid fieldname: ${file.fieldname}`), null);
            }

            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const extension = path.extname(file.originalname).toLowerCase();
            const fileName = `${file.fieldname}-${uniqueSuffix}${extension}`;
            const s3Path = `${folderPath}/${fileName}`;

            if (!req.s3UploadedKeys) {
                req.s3UploadedKeys = {};
            }
            if (!req.s3UploadedKeys[file.fieldname]) {
                req.s3UploadedKeys[file.fieldname] = [];
            }

            req.s3UploadedKeys[file.fieldname].push(s3Path);
            cb(null, s3Path);
        },
    }),
    fileFilter: function (req, file, cb) {
        if (file.fieldname === "postImage" || file.fieldname === "profilePicture" || file.fieldname === "photos") {
            const isImage =
                file.mimetype.includes("image") ||
                file.mimetype.includes("octet-stream");
            if (!isImage) {
                return cb(
                    new Error(`Only image files are allowed for ${file.fieldname}`),
                    false
                );
            }
            cb(null, true);
        } else if (file.fieldname === "postVideo") {
            const isVideo = file.mimetype.includes("video");
            if (!isVideo) {
                return cb(
                    new Error(`Only video files are allowed for ${file.fieldname}`),
                    false
                );
            }
            cb(null, true);
        } else {
            cb(new Error(`Invalid fieldname: ${file.fieldname}`), false);
        }
    },
    //limits: { fileSize: 10 * 1024 * 1024 },
});


export default uploads3;


// export async function uploadTestVideo() {
//     try {
//         const videoFilePath = "/Users/michaelmac/Desktop/Abhishek-thakur/beballer/Beballer-backend/src/middleware/0AH3Lhs9DLfRe4DHwKJj.mov";
//         const fileContent = fs.readFileSync(videoFilePath);

//         const s3Key = `Testvideo/0AH3Lhs9DLfRe4DHwKJj.mov`;

//         const command = new PutObjectCommand({
//             Bucket: bucketName,
//             Key: s3Key,
//             Body: fileContent,
//             ContentType: "video/mp4",
//         });

//         await s3.send(command);

//         console.log("Video uploaded successfully at:", s3Key);
//     } catch (error) {
//         console.error("Error uploading video:", error);
//     }
// }

// uploadTestVideo();