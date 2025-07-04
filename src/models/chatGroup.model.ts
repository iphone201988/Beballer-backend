const mongoose = require('mongoose');

const ChatGroupSchema = new mongoose.Schema({
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  members: [{ type:String }],
//   blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null }
},
 { timestamps: true }
);
const ChatGroup = mongoose.model('chatGroup', ChatGroupSchema);

export default ChatGroup