// import multer from "multer";
// import fs from "fs/promises";
// import path from "path";
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { exec } from "child_process";
// import util from "util";


// const execPromise = util.promisify(exec);


// export const s3 = new S3Client({
//     region: process.env.AWS_REGION,
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     },
// });

// const bucketName = process.env.S3_BUCKET_NAME;


// const baseDir = path.resolve(path.join(__dirname, "../../src/uploads"));
// const videosDir = path.join(baseDir, "videos");


// const ensureDirectories = async () => {
//     try {
//         await fs.mkdir(baseDir, { recursive: true });
//         await fs.mkdir(videosDir, { recursive: true });
//     } catch (err) {
//         console.error("Error creating directories:", err);
//         throw err;
//     }
// };
// ensureDirectories();

// const videoStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         if (file.fieldname !== "postVideo") {
//             return cb(new Error(`Invalid fieldname: ${file.fieldname}`), null);
//         }
//         cb(null, videosDir);
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//         const extension = path.extname(file.originalname).toLowerCase();
//         const fileName = `${file.fieldname}-${uniqueSuffix}${extension}`;
//         const relativePath = `/uploads/videos/${fileName}`;


//         if (!req.uploadedVideoPaths) {
//             req.uploadedVideoPaths = [];
//         }
//         req.uploadedVideoPaths.push({ fileName, relativePath });

//         cb(null, fileName);
//     },
// });

// // Multer instance for video uploads
// export const uploadVideos = multer({
//     storage: videoStorage,
//     fileFilter: (req, file, cb) => {
//         if (file.fieldname === "postVideo") {
//             const isVideo = file.mimetype.includes("video");
//             if (!isVideo) {
//                 return cb(
//                     new Error(`Only video files are allowed for ${file.fieldname}`),
//                     false
//                 );
//             }
//             cb(null, true);
//         } else {
//             cb(new Error(`Invalid fieldname: ${file.fieldname}`), false);
//         }
//     },
//     // limits: { fileSize: 100 * 1024 * 1024 }, // Example: 100MB limit, adjust as needed
// });

// // Function to process videos with FFmpeg and upload to S3
// export const processAndUploadVideos = async (req, res, next) => {
//     try {
//         if (req.files && req.files.postVideo) {
//             const videoFiles = req.files.postVideo; // Array of videos
//             if (!req.s3UploadedKeys) {
//                 req.s3UploadedKeys = { postVideo: [] };
//             }

//             // Process each video sequentially
//             for (const videoFile of videoFiles) {
//                 const inputPath = videoFile.path;
//                 const outputFileName = `processed-${Date.now()}-${videoFile.filename}`;
//                 const outputPath = path.join(videosDir, outputFileName);

               
//                 const ffmpegCommand = `ffmpeg -i "${inputPath}" -vf "scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2" -r 30 -c:v libx264 -profile:v high -b:v 3M -pix_fmt yuv420p -preset slow -movflags +faststart -c:a aac -b:a 128k "${outputPath}"`;

//                 // Execute FFmpeg command
//                 await execPromise(ffmpegCommand);

//                 // Read the processed file
//                 const fileContent = await fs.readFile(outputPath);

//                 // Upload to S3
//                 const s3Path = `Post Videos/${outputFileName}`;
//                 const params = {
//                     Bucket: bucketName,
//                     Key: s3Path,
//                     Body: fileContent,
//                     ContentType: "video/mp4",
//                 };

//                 await s3.send(new PutObjectCommand(params));

//                 // Store the S3 path
//                 req.s3UploadedKeys.postVideo.push(s3Path);

//                 // Clean up local files
//                 // await fs.unlink(inputPath).catch((err) =>
//                 //     console.error(`Error deleting input file: ${err}`)
//                 // );
//                 // await fs.unlink(outputPath).catch((err) =>
//                 //     console.error(`Error deleting output file: ${err}`)
//                 // );
//             }
//         }
//         next();
//     } catch (err) {
//         console.error("Error processing videos:", err);
//         next(err);
//     }
// };