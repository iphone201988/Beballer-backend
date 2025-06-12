import Players from "../models/players.model";
import Fields from "../models/fields.model";
import AWS from 'aws-sdk';
import pLimit from 'p-limit';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const profileImageScript = async () => {
  try {
  
    const players = await Players.find({}).select('id profilePicture');

  
    const extensions = ['.jpeg', '.jpg', '.png', '.gif'];

    let count = 0
    for (const player of players) {
      let foundImage = null;

     
      for (const ext of extensions) {
        const key = `Users/Players/${player.id}${ext}`;
        
        try {
         
          await s3.headObject({
            Bucket: 'beballer-bucket',
            Key: key
          }).promise();
          
          foundImage = `/${key}`;
          break;
        } catch (error) {
          if (error.code !== 'NotFound') {
            console.error(`Error checking ${key} for player ${player.id}:`, error);
          }
        
        }
      }
      console.log('=========foundImage',foundImage)
      if (foundImage && foundImage !== player.profilePicture) {
        await Players.updateOne(
          { id: player.id },
          { $set: { profilePicture: foundImage } }
        );
        console.log(`Updated profile picture for player ${player.id}: ${foundImage}`);
        count ++;
      } else if (!foundImage) {
        console.log(`No image found for player ${player.id}`);
      }
    }
    console.log('=========count',count)
    console.log('Profile image update process completed');
  } catch (error) {
    console.error('Error in profileImageScript:', error);
    throw error;
  }
};

// const updateFieldsPhotos = async () => {
//   try {
   
//     const fields = await Fields.find({}).select('id photos');
//     console.log(fields.length)
//     let count = 0; 

//     for (const field of fields) {
//       const fieldId = field.id;
//       let foundImages = [];

     
//       for (let i = 1; i <= 3; i++) {
//         const key = `Fields/${fieldId}_${i}.jpeg`;

//         try {
        
//           await s3.headObject({
//             Bucket: 'beballer-bucket',
//             Key: key
//           }).promise();

         
//           foundImages.push(`/${key}`);
//         } catch (error) {
//           if (error.code !== 'NotFound') {
//             console.error(`Error checking ${key} for field ${fieldId}:`, error);
//           }
         
//         }
//       }

//       console.log(`Found images for field ${fieldId}:`, foundImages);

   
//       if (foundImages.length > 0 && JSON.stringify(foundImages) !== JSON.stringify(field.photos)) {
//         await Fields.updateOne(
//           { id: fieldId },
//           { $set: { photos: foundImages } }
//         );
//         console.log(`Updated photos for field ${fieldId}: ${foundImages.join(', ')}`);
//         count++;
//         console.log('=========count',count)
//       } else if (foundImages.length === 0) {
//         console.log(`No images found for field ${fieldId}`);
//       }
//     }

//     console.log(`=========Updated ${count} fields`);
//     console.log('Field photos update process completed');
//   } catch (error) {
//     console.error('Error in updateFieldsPhotos:', error);
//     throw error;
//   }
// };
const updateFieldsPhotos = async () => {
  try {
    const fields = await Fields.find({}).select('id'); // Skip `photos` since it's always empty
    console.log(`Total fields: ${fields.length}`);

    const s3Check = async (fieldId: string, i: number) => {
      const key = `Fields/${fieldId}_${i}.jpeg`;
      try {
        await s3.headObject({ Bucket: 'beballer-bucket', Key: key }).promise();
        return `/${key}`;
      } catch (error) {
        if (error.code !== 'NotFound') {
          console.error(`S3 error for ${key}:`, error);
        }
        return null;
      }
    };

    const limit = pLimit(10); // Max 10 fields in parallel
    const updateOps = [];

    const tasks = fields.map(field =>
      limit(async () => {
        const fieldId = field.id;
        const checkPromises = [1, 2, 3].map(i => s3Check(fieldId, i));
        const results = await Promise.all(checkPromises);
        const foundImages = results.filter(Boolean); // remove nulls

        if (foundImages.length > 0) {
          console.log(`Images for ${fieldId}: ${foundImages.join(', ')}`);
          updateOps.push({
            updateOne: {
              filter: { id: fieldId },
              update: { $set: { photos: foundImages } }
            }
          });
        } else {
          console.log(`No images found for field ${fieldId}`);
        }
      })
    );

    await Promise.all(tasks);

    if (updateOps.length > 0) {
      const result = await Fields.bulkWrite(updateOps);
      console.log(`Updated ${result.modifiedCount} fields.`);
    } else {
      console.log(`No updates needed.`);
    }

    console.log('Field photos update process completed');
  } catch (error) {
    console.error('Error in updateFieldsPhotos:', error);
    throw error;
  }
};
const main = async () => {
    try {
    // await profileImageScript();
    await updateFieldsPhotos();
    console.log('Script execution completed successfully');
  } catch (error) {
    console.error('Script execution failed:', error);
    process.exit(1);
  } 
}   

export default main