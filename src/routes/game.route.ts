import express from 'express'
import { authenticationMiddleware } from "../middleware/auth.middleware";
import gameControllers from '../controllers/game.controller';
const gameRouter = express.Router()

gameRouter.get(
    "/get-games",
    authenticationMiddleware,
    gameControllers.getGames
)

gameRouter.post(
    "/create-game",
    authenticationMiddleware,
    gameControllers.createGame
)
gameRouter.get(
    "/get-games/:id",
    authenticationMiddleware,
    gameControllers.getGameById
)
export default gameRouter