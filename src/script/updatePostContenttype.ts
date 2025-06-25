import Posts from "../models/post.model";

const updateContentTypeBulk = async () => {
  try {
    const posts = await Posts.find().sort({ date: -1 });
    const bulkOperations = [];

    for (const post of posts) {
      console.log("Post:", post.id); 
 

      let newContentType = post.contentType;

      if (post.game.ref.collectionName === "games" && post.game !== undefined) {
        console.log("Condition triggered: game",post.game);
        newContentType = "game";
      } else if (post.court.ref.collectionName === "fields" && post.court !== undefined) {
        console.log("Condition triggered: court");
        newContentType = "court";
      } else if (post.event.ref.collectionName === "events" && post.event !== undefined) {
        console.log("Condition triggered: event");
        newContentType = "event";
      } else {
        console.log("No condition triggered");
      }

      console.log("New contentType:", newContentType);

      if (newContentType !== post.contentType) {
        bulkOperations.push({
          updateOne: {
            filter: { _id: post._id },
            update: { $set: { contentType: newContentType } }
          }
        });
        console.log("Update prepared for _id:", post._id);
      } else {
        console.log("No update needed for _id:", post._id);
      }

      // Execute bulk operation every 500 updates to avoid memory issues
      if (bulkOperations.length === 500) {
        await Posts.bulkWrite(bulkOperations);
        bulkOperations.length = 0; // Clear the array
      }
    //   break; // Keep for testing one post
    }

    // Execute remaining operations
    if (bulkOperations.length > 0) {
      await Posts.bulkWrite(bulkOperations);
    }

    console.log("Bulk update completed");
  } catch (error) {
    console.error("Error updating posts:", error);
  }
};

export default updateContentTypeBulk;