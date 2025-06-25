import eventModel from "../models/event.model";
import Fields from "../models/fields.model";
import Game from "../models/game.model";
const  updateEventDates = async ()=> {
  try {
  const result = await Game.updateMany(
      {},
      [
        {
          $set: {
            createdAt: "$creationDate",
            updatedAt: "$creationDate"
          }
        }
      ],
      { runValidators: true }
    );
    console.log(`${result.modifiedCount} events updated successfully`);
  } catch (error) {
    console.error("Error updating events:", error);
  }
}
export default updateEventDates

