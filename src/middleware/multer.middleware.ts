import multer from "multer";
import fs from "fs";
import path from "path";

const baseDir = path.resolve(path.join(__dirname, "../../src/uploads"));
const profileDir = path.join(baseDir, "profiles");
const photosDir = path.join(baseDir, "courtPhotos");


if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir);
}
if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir);
}
if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    let uploadDir;
    if (file.fieldname === "profilePicture") {
      uploadDir = profileDir;
    } else if (file.fieldname === "photos") {
      uploadDir = photosDir;
    } else {
      return cb(new Error(`Invalid fieldname: ${file.fieldname}`), null);
    }
    if (
      !file.mimetype.includes("image") &&
      !file.mimetype.includes("octet-stream")
    ) {
      return cb(
        new Error(`Only images are allowed for ${file.fieldname}`),
        null
      );
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname).toLowerCase();
    const fileName = `${file.fieldname}-${uniqueSuffix}${extension}`;
  
    const relativePath = `/uploads/${
      file.fieldname === "profilePicture" ? "profiles" : "courtphotos"
    }/${fileName}`;
    cb(null, fileName);
    
    file.relativePath = relativePath;
  },
});

const upload = multer({ storage: storage });
export default upload;