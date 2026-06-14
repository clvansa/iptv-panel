const Channel = require("./Channel");
const Category = require("./Category");
const Country = require("./Country");
const Playlist = require("./Playlist");
const PlaylistChannel =require("./PlaylistChannel");

// Channel.hasMany(ChannelStream, {
//     foreignKey: "channel_id",
//     onDelete: "CASCADE"
// });

// ChannelStream.belongsTo(Channel, {
//     foreignKey: "channel_id"
// });

Channel.belongsToMany(Category, {
    through: "channel_categories"
});

Category.belongsToMany(Channel, {
    through: "channel_categories"
});

Playlist.belongsToMany(Channel, {
    through: PlaylistChannel
});

Channel.belongsToMany(Playlist, {
    through: PlaylistChannel
});



module.exports = {
    Channel,
    // ChannelStream,
    Category,
    Country,
    Playlist
};