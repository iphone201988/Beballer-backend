import express from 'express'
import { authenticationMiddleware } from "../middleware/auth.middleware";
import gameControllers from '../controllers/game.controller';
const gameRouter = express.Router()

gameRouter.get(
    "/get-games",
    authenticationMiddleware,
    gameControllers.getGames
)
export default gameRouter