import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    Box,
    Button,
    TextField,
    Typography,
    FormControl,
    MenuItem,
    InputLabel,
    Select
} from "@mui/material";

import {
    getChannel,
    updateChannel
} from "../api/channels";


import { useQuery } from "@tanstack/react-query";

import {
    getLanguages,
    getCountries,
    getCategories
} from "../api/filters";

export default function EditChannel() {

    const { id } =
        useParams();

    const navigate =
        useNavigate();

    const [form, setForm] =
        useState(null);

    useEffect(() => {

        getChannel(id)
            .then(setForm);

    }, [id]);

    const { data: languages } = useQuery({
        queryKey: ["languages"],
        queryFn: getLanguages
    });

    const { data: countries } = useQuery({
        queryKey: ["countries"],
        queryFn: getCountries
    });

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories
    });

    const handleChange =
        (e) => {

            setForm(prev => ({
                ...prev,
                [e.target.name]:
                    e.target.value
            }));

        };


    const [streamStatus, setStreamStatus] = useState(null);

    const [checking, setChecking] = useState(false);

    const handleSave =
        async () => {

            await updateChannel(
                id,
                form
            );

            navigate(
                "/"
            );

        };

    if (!form) {

        return (
            <Typography>
                Loading...
            </Typography>
        );

    }

    const handleCheckStream =
        async () => {

            if (!form.stream_url) {
                return;
            }

            try {

                setChecking(true);

                const response =
                    await fetch(
                        form.stream_url,
                        {
                            method: "HEAD"
                        }
                    );

                setStreamStatus(
                    response.ok
                        ? "online"
                        : "offline"
                );

            } catch {

                setStreamStatus(
                    "offline"
                );

            } finally {

                setChecking(false);

            }

        };

    return (
        <Box>

            <Typography
                variant="h4"
                sx={{ mb: 3 }}
            >
                Edit Channel
            </Typography>

            <TextField
                fullWidth
                sx={{ mb: 2 }}
                name="name"
                label="Name"
                value={form.name}
                onChange={handleChange}
            />

            <TextField
                fullWidth
                multiline
                rows={3}
                sx={{ mb: 2 }}
                name="stream_url"
                label="Stream URL"
                value={form.stream_url}
                onChange={handleChange}
            />

            <TextField
                fullWidth
                sx={{ mb: 2 }}
                name="logo"
                label="Logo"
                value={form.logo}
                onChange={handleChange}
            />

            {form.logo && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        mb: 2
                    }}
                >
                    <Box
                        component="img"
                        src={form.logo}
                        alt="logo"
                        sx={{
                            width: 200,
                            height: 120,
                            objectFit: "contain",
                            border: "1px solid #333",
                            borderRadius: 2,
                            p: 1
                        }}
                    />
                </Box>
            )}

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Country</InputLabel>

                <Select
                    name="country_code"
                    value={form.country_code || ""}
                    label="Country"
                    onChange={handleChange}
                >
                    {countries?.map(country => (
                        <MenuItem
                            key={country.code}
                            value={country.code}
                        >
                            {country.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Language</InputLabel>

                <Select
                    name="language"
                    value={form.language || ""}
                    label="Language"
                    onChange={handleChange}
                >
                    {languages?.map(language => (
                        <MenuItem
                            key={language}
                            value={language}
                        >
                            {language}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>

                <Select
                    name="category"
                    value={form.category || ""}
                    label="Category"
                    onChange={handleChange}
                >
                    {categories?.map(category => (
                        <MenuItem
                            key={category}
                            value={category}
                        >
                            {category}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    mt: 2
                }}
            >

                <Button
                    variant="outlined"
                    onClick={handleCheckStream}
                    disabled={checking}
                >
                    {checking
                        ? "Checking..."
                        : "Check Stream"}
                </Button>



            </Box>

            {streamStatus && (
                <Typography
                    sx={{
                        mt: 2,
                        fontWeight: "bold"
                    }}
                    color={
                        streamStatus === "online"
                            ? "success.main"
                            : "error.main"
                    }
                >
                    {streamStatus === "online"
                        ? "🟢 Online"
                        : "🔴 Offline"}
                </Typography>
            )}


            <Button
                variant="text"
                onClick={() =>
                    navigate("/")
                }
            >
                Back
            </Button>
            <Button
                variant="contained"
                onClick={handleSave}
            >
                Save
            </Button>

        </Box>
    );

}