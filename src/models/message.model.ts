
const mongoose = require('mongoose');


const MessageSchema = new mongoose.Schema({
  chatGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatGroup', required: true },
  senderId: { type: String, required: true },
  senderImage: { type: String, default: null },
  senderUsername: { type: String, default: null },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
}
, { timestamps: true });

const Message = mongoose.model('Message', MessageSchema);

export default Message