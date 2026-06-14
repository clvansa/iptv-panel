import api from "./axios";

export const getChannels = async (
    params = {}
) => {

    const response =
        await api.get("/channels", {
            params
        }
        );

    return response.data;



};

export const createChannel = async (data) => {

    const response = await api.post(
        "/channels",
        data
    );

    return response.data;
};

export const getChannel = async (id) => {
    const response = await api.get(`/channels/${id}`);

    return response.data;
}


export const updateChannel = async (id, data) => {
    const response = await api.put(`/channels/${id}`, data);

    return response.data
}

export const importPlaylist =
    async (url) => {

        const response = await api.post("/import/url", { url });

        return response.data;

    };

export const updateChannelCountry = async (id, country_code) => {
    return await api.put(`/channels/${id}/country`, { country_code })
}