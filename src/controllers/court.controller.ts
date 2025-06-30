import { userType } from "../utils/enum";
import { SUCCESS, TryCatch } from "../utils/helper";
import { Request, Response } from "express";
import Fields from "../models/fields.model";
import { newCourt } from "../type/Api/courtApi.type";
import mongoose from "mongoose";


const newCourt = TryCatch(async (req: Request<{}, {}, newCourt>, res: Response) => {
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
    photos = req.s3UploadedKeys?.photos,
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

const getCourts = TryCatch(async (req: Request, res: Response) => {
  const { user, userType } = req;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const [lng, lat] = user.location.coordinates;

  const totalCount = await Fields.estimatedDocumentCount();
  const totalPages = Math.ceil(totalCount / limit);

  const courts = await Fields.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng, lat],
        },
        distanceField: "distance",
        maxDistance: 20000,
        spherical: true,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $addFields: {
          long: { $arrayElemAt: ["$location.coordinates", 0] },
          lat: { $arrayElemAt: ["$location.coordinates", 1] },
      }
    },
    {
      $project: {
        // Include desired fields
        photos: 1,
        name: 1,
        createdAt: 1,
        id: 1,
        distance: { $divide: [{ $round: ["$distance", 2] }, 1000] },
        hoopsCount: 1,
        long: 1,
        lat: 1
      },
    },
  ]);

  console.log(courts);
  return SUCCESS(res, 200, "Courts fetched successfully", {
    data: courts,
    pagination: {
      currentPage: page,
      totalPages,
    },
  });
});






export const getCourtById = TryCatch(async (req: Request, res: Response) => {
  const courtId = req.params.id;

  const courts = await Fields.aggregate([
    {
      $match: { id: courtId }
    },
    {
      $addFields: {
        long: { $arrayElemAt: ["$location.coordinates", 0] },
        lat: { $arrayElemAt: ["$location.coordinates", 1] }
      }
    },
    {
      $lookup: {
        from: "players",
        let: { contributorId: "$contributor.ref.id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$id", "$$contributorId"]
              }
            }
          },
          {
            $project: {
              id: 1,
              firstName: 1,
              lastName: 1,
              profileImage: 1
            }
          }
        ],
        as: "userInformation"
      }
    },
    {
      $addFields: {
        userInformation: { $first: "$userInformation" }
      }
    },
    {
      $project: {
        name: 1,
        id: 1,
        city: 1,
        country: 1,
        addressString: 1,
        photos: 1,
        hoopsCount: 1,
        long: 1,
        lat: 1,
        createdAt: 1,
        king: 1,
        boardType: 1,
        netType: 1,
        floorType: 1,
        description: 1,
        userInformation: 1
      }
    }
  ]);

  const court = courts[0];

  if (!court) {
    return res.status(404).json({ success: false, message: "Court not found" });
  }

  return SUCCESS(res, 200, "Court fetched successfully", court);
});
export default {
  newCourt,
  getCourts,
  getCourtById
}