import Game from "../models/game.model";

const updatePlayerAcceptance = async () => {
  const games = await Game.find();
  for (const game of games) {
    const team2AcceptedInvitations = game.hasAcceptedInvitationTeam2;
    game.team2Players = game.team2Players.map((player, index) => ({
      ...player,
      accepted: team2AcceptedInvitations[index] || false
    }));
    game.markModified('team1Players');
    await game.save();
    console.log(`Player acceptance updated for game ${game._id}`);
    // break; 
  }
};

export default updatePlayerAcceptance;