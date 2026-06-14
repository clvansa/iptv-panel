import api from "./axios";

export const getLanguages =
async () => {

    const response =
        await api.get(
            "/languages"
        );

    return response.data;

};

export const getCountries =
async () => {

    const response =
        await api.get(
            "/countries"
        );

    return response.data;

};

export const getCategories =
async () => {

    const response =
        await api.get(
            "/categories"
        );

    return response.data;

};