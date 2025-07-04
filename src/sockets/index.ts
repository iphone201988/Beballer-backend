import { Socket, DefaultEventsMap, Server } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import players from '../models/players.model';
import { userType } from '../utils/enum';
import ChatGroup from '../models/chatGroup.model';
import Message from '../models/message.model';

interface CustomSocket extends Socket {
    playerId: string
}


const useSocket = (
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
    const users = new Map<string, string>();

    const addUser = (playerId: string, socketId: string) => {
        users.set(playerId, socketId);
    }

    const removeUser = (socketId: string) => {
        users.forEach((value, key) => {
            if (value === socketId) {
                users.delete(key);
            }
        })
    }

    const getUser = (playerId: string) => {
        return users.get(playerId);
    }

    io.use(async (socket: CustomSocket, next) => {
        const token: any = socket.handshake.headers.token;

        if (!token) {
            return next(new Error("Authentication error"));
        }

        try {
            const decode = (await jwt.verify(
                token,
                process.env.JWT_SECRET!
            )) as JwtPayload;

            if (!decode) return next(new Error("Authentication error"));

            socket.playerId = decode.userId;
            next();
        } catch (error) {
            return next(new Error("Authentication error. Invalid token"));
        }
    });

    io.on('connection', (socket: CustomSocket) => {
        addUser(socket.playerId, socket.id);

        socket.on("join_game_chat", async ({ gameId }) => {    //Game id =  = _id
            console.log("join_game_chat-game-id", gameId);
            const chatGroup = await ChatGroup.findOne({ gameId });
            const player = await players.findById({ _id: socket.playerId });
            if(!chatGroup.members.includes(player.id)) return socket.emit("error", "You are not a member of this chat group");
            console.log("chatGroup", chatGroup);
            if (!chatGroup) return socket.emit("error", "Chat group not found");
            socket.join(chatGroup.id);
        })

        socket.on("send_group_message", async ({ gameId, message }) => {
            if(!message && !gameId) return socket.emit("error", "Message is required");
            const chatGroup = await ChatGroup.findOne({ gameId });
            if (!chatGroup) return socket.emit("error", "Chat group not found");
            const player = await players.findById({ _id: socket.playerId });
            const newMessage = new Message({
                chatGroupId: chatGroup._id,
                senderId: player.id,
                senderImage: player.profilePicture || null,
                senderUsername: player.username || null,
                message
            });
            await newMessage.save();

            io.to(chatGroup.id).emit("receive_group_message", {
                senderId: player.id,
                senderImage: player.profilePicture || null,
                senderUsername: player.username || null,
                message,
                createdAt: newMessage.createdAt
            });
        })

        socket.on("disconnect", () => removeUser(socket.id));
    })
}

export default useSocket