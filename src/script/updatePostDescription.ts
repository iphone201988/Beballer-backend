// import mongoose from "mongoose";
// import Posts from "../models/post.model.js"; // Adjust path as needed

// const updatePostDescription = async () => {
//   try {
//     // Connect to DB if needed
   

//     // Fetch raw documents (as plain JS objects, not Mongoose Documents)
//     const posts = await Posts.find({ description: { $type: 'object' } }).lean();

//     console.log(`Found ${posts.length} posts with object descriptions.`);

//     for (const rawPost of posts) {
//       const ref = rawPost?.description?.ref;

//       if (ref?.collectionName && ref?.id) {
//         const mergedDescription = `${ref.collectionName}\n\n${ref.id}`;

//         // Now update the document directly
//         await Posts.updateOne(
//           { _id: rawPost._id },
//           { $set: { description: mergedDescription } }
//         );

//         console.log(`Updated post: ${rawPost._id}`);
//       } else {
//         console.warn(`Skipped post ${rawPost._id} — ref missing`);
//       }
//     }

//     console.log("All matching posts updated.");
//     process.exit(0);
//   } catch (err) {
//     console.error("Error updating posts:", err);
//     process.exit(1);
//   }
// };

// export default updatePostDescription;
