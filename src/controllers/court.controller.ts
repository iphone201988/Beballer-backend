import { userType } from "../utils/enum";
import { SUCCESS, TryCatch } from "../utils/helper";
import { Request, Response } from "express";
import Fields from "../models/fields.model";
import { newCourt } from "../type/Api/courtApi.type";
import mongoose from "mongoose";


const newCourt = TryCatch(async (req: Request<{},{},newCourt>, res: Response) => {
  const { user, userType } = req;
  const collectionName = userType === 'player' ? 'players' : 'organizers';
  const {
    name,
    addressString,
    city,
    region,
    country,
    accessibility,
    hoopsCount,
    isWomanFriendly,
    boardType,
    netType,
    floorType,
    description,
    grade,
    lat,
    long,
    photos = req.s3UploadedKeys.photos,
  } = req.body;

  const newFields = await Fields.create({
    id: new mongoose.Types.ObjectId().toString(),
    name,
    addressString,
    city,
    region,
    country,
    accessibility,
    hoopsCount,
    isWomanFriendly,
    boardType,
    netType,
    floorType,
    description,
    grade,
    photos,
    contributor: {
      ref: {
        collectionName,
        id: user.id,
      },
    },
    ...(lat && long && {
      address: {
        type: "Point",
        coordinates: [long, lat],
      },
    }),
  });

  return SUCCESS(res, 200, "Court Created Successfully");
});

export default  {
    newCourt
}