import { stringTo2048 } from "aws-sdk/clients/customerprofiles";
import { Interface } from "readline";
import badgeModel from "../../models/badge.model";

export interface PlayerModel {
    id: string;
    _id: string;
    username: string;
    firstName?: string;
    email?: string;
    verified: boolean;
    totalProgression: number;
    subscriptions: any;
    sector?: string;
    score: number;
    reports: string[];
    reported: boolean;
    region?: string;
    referralCode: string;
    rankSector: number;
    rankRegion: number;
    rankCountry: number;
    rank: number;
    progression: number[];
    profileDescription?: string;
    posts: string[];
    location?: {
        type: "Point";
        coordinates: number[];
    } | null;
    likes: string[];
    lastName?: string;
    lastLogon?: Date;
    height?: number;
    role: string;
    godchildren: string[];
    geohash?: string;
    gender?: string;
    games: string[];
    friendList: string[];
    followers: string[];
    feedCountry?: string;
    favoriteEvents: string[];
    favoriteCourts: string[];
    favoriteBars: string[];
    country?: string;
    city?: string;
    blockedUsers: string[];
    blockedBy?: string;
    birthDate?: Date;
    badges: string[];
    badge?: string;
    countryCode: string;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
    deviceToken: string;
    deviceType: number;
    jti: string;
    recutersViewed: string;
    isOnboardAnalyticsDone: boolean;
    profilePicture?: string;
    favoriteProTeam:{
         ref: {
            collectionName: string;
            id: string;
        }
    },
    position: string;
    playPositionId: number,
    isProfileCompleted: boolean,
    setProfilePopup: boolean,
    setSettingsPopup: boolean

}

export interface postModel {
    id: string;
    date: Date;
    reports: string[];
    country: string;
    image: string;
    video: string;
    game: {
        ref: {
            collectionName: string;
            id: string;
        }
    };
    description: string;
    location: {
        type: "Point";
        coordinates: number[];
    };
    likes: string[];
    score: number;
    isFeed: boolean;
    comments: string[];
    shares: any;
    publisher: {
        ref: {
            collectionName: string;
            id: string;
        }
    },
    event: {
        ref: {
            collectionName: string;
            id: string;
        }
    },
    court: {
        ref: {
            collectionName: string;
            id: string;
        }
    }
    contentType: string;
}

export interface fieldsModel {
    id: string,
    _id: string,
    accessibility: string,
    address: string,
    addressString: string,
    boardType: string,
    city: string,
    contributor: {
        ref: {
            collectionName: string,
            id: string,
        },
    },
    country: string,
    description: string,
    expireIn: number,
    floorType: string,
    geohash: string,
    grade: number,
    hoopsCount: number,
    image: string,
    isWomanFriendly: boolean,
    ishandi: boolean,
    isverified: boolean,
    king: string,
    level: string,
    name: string,
    netType: string,
    price: number,
    region: string,
    photos: string[],
    location: {
        type: "Point",
        coordinates: number[],
    }
}

export interface commentModel {
    id: string;
    _id: string;
    likes: string[];
    publisher: {
        ref: {
            collectionName: string;
            id: string;
        }
    },
    comment: string;
    date: Date;
    postId: string;
    createdAt: Date;
    updatedAt: Date;

}


export interface gameModel {
    id: string;
    date: Date;
    team1ScoreTeam1: number;
    team1ScoreTeam2: number;
    team2ScoreTeam1: number;
    team2ScoreTeam2: number;
    isAutoRefereeing: boolean;
    visible: boolean;
    hasAcceptedInvitationReferee: boolean;
    organizer: {
        ref: {
            collectionName: string;
            id: string;
        }
    },
    isVisible: boolean;
    type: string;
    mode: number;
    team2Players: any[];
    hasAcceptedInvitationTeam2: boolean[];
    team1Players: any[];
    hasAcceptedInvitationTeam1: boolean[];
    field: {
        ref: {
            collectionName: string;
            id: string;
        }
    },
    status:stringTo2048,
    teamToValidate: number;
    createdAt: Date;
    updatedAt: Date;
    referee: {
        ref: {
            collectionName: string;
            id: string;
        }
    }

 
}


export interface teamsModel {
    id: string;
    coordinates: number[];
    _id: string;
    name: string;
    type: string;
    url: string;
    geohash: string;
    gender: string;
    location: {
        type: "Point";
        coordinates: number[];
    };
    imageURL: string;
}

export interface proGamesTeamsModel {
    id: string;
    coordinates: number[];
    _id: string;
    name: string;
    type: string;
    url: string;
    geohash: string;
    gender: string;
    location: {
        type: "Point";
        coordinates: number[];
    };
    imageURL: string;
    country: string;
}

export interface badgeModel {
    id: string;
    condition: string;
    count: number;
    image: string;
    name: string;
    category: string;
}

export interface eventModel {
    id: string;
    formats: string;
    hasCategories: boolean;
    type: string;
    geohash: string;
    isVisibleTo: string[];
    paymentStatus: number;
    address: string;
    hasSponsors: boolean;
    discountCode: string;
    name: string;
    referees: string[];
    startDate: Date;
    refereesCode: string;
    organizersCode: string;
    spectatorsCode: string;
    creationDate: Date;
    country: string;
    city: string;
    region: string;
    shareLink: string;
    organizers: string[];
    endDate: Date;
    spectators: string[];
    isVisible: boolean;
    location: {
        type: "Point";
        coordinates: number[];
    };
}