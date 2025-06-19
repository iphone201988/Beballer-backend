import { SUCCESS, TryCatch } from "../utils/helper";
import { Request, Response } from "express";
import Game from "../models/game.model";

const getGames = TryCatch(async (req: Request, res: Response) => {
    const games = await Game.find()
    return SUCCESS(res, 200, "Games Fetched Successfully", {
        games
    })
});


const gameControllers =
{
    getGames
}

export default gameControllers