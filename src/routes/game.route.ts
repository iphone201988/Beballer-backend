import express from 'express'
import { authenticationMiddleware } from "../middleware/auth.middleware";
import gameControllers from '../controllers/game.controller';
import gameSchema from '../schema/game.schema';
import validate from '../middleware/validate.middleware';
const gameRouter = express.Router()

gameRouter.get(
    "/get-games",
    authenticationMiddleware,
    gameControllers.getGames
)

gameRouter.post(
    "/create-game",
    authenticationMiddleware,
    validate(gameSchema.createGameSchema),
    gameControllers.createGame
)

gameRouter.get(
    "/get-game/:id",
    authenticationMiddleware,
    gameControllers.getGameById
)

gameRouter.post(
    "/add-player-to-game",
    authenticationMiddleware,
    validate(gameSchema.addPlayerToGameSchema),
    gameControllers.addPlayerToGame
)
export default gameRouter