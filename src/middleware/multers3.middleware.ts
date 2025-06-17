import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import path from "path";

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
        contentType: multerS3.AUTO_CONTENT_TYPE,
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
            } else {
                return cb(new Error(`Invalid fieldname: ${file.fieldname}`), null);
            }

            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const extension = path.extname(file.originalname).toLowerCase();
            const fileName = `${file.fieldname}-${uniqueSuffix}${extension}`;
            const s3Path = `${folderPath}/${fileName}`;

            // Store s3Key in an array on req for multiple uploads
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
    },
});

export default uploads3;
