import api from "./axios";

export const getPlaylists = async () => {

    const response =
        await api.get(
            "/playlists"
        );

    return response.data;

};

export const createPlaylist = async (data) => {

    const response =
        await api.post(
            "/playlists",
            data
        );

    return response.data;

};

export const deletePlaylist = async (id) => {

    const response =
        await api.delete(
            `/playlists/${id}`
        );

    return response.data;

};

export const addChannelsToPlaylist = async (
    playlistId,
    channelIds
) => {

    const response =
        await api.post(

            `/playlists/${playlistId}/channels`,

            {
                channelIds
            }

        );

    return response.data;

};


export const getPlaylist = async (id) => {

    const response =
        await api.get(
            `/playlists/${id}`
        );

    return response.data;

};

export const removeChannelFromPlaylist =
    async (
        playlistId,
        channelId
    ) => {

        const response =
            await api.delete(
                `/playlists/${playlistId}/channels/${channelId}`
            );

        return response.data;

    };


export const reorderPlaylist = async (playlistId, channelIds) => {

    const response =
        await api.put(`/playlists/${playlistId}/reorder`, {
            channelIds
        }

        );

    return response.data;

};


export const exportPlaylist = (id) => {
    window.open(`${import.meta.env.VITE_API_URL}/export/playlist/${id}`, "_blank");

};


export const updateCountryOrder = async (playlistId, countryOrder) => {
    const response = await api.put(`/playlists/${playlistId}/country-order`, { countryOrder });
    return response.data;
};

export const addFilteredChannels = async (playlistId, filters) => {
    const response = await api.post(`/playlists/${playlistId}/add-filtered`, filters);
    return response.data;
}


export const removeChannelsFromPlaylist = async (playlistId, channelIds) => {
    const response = await api.delete(`/playlists/${playlistId}/channels`, { data: { channelIds } });
    return response.data;
};

export const updatePlaylistChannelCountry = async (playlistId, channelId, country_code) => {
    console.log({ playlistId, channelId, country_code })
    return await api.put(`/playlists/${playlistId}/channels/${channelId}/country`, {
        country_code
    })
}


export const updatePlaylistChannelFavorite = async (playlistId, channelId, favorite) => {
    return await api.put(`/playlists/${playlistId}/channels/${channelId}/favorite`, { favorite });
}