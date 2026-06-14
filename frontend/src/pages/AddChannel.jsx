import { useState } from "react";
import { Box, Button, TextField, Typography, Grid, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createChannel } from "../api/channels";
import { useQuery } from "@tanstack/react-query";
import { getLanguages, getCountries, getCategories } from '../api/filters'


export default function AddChannel() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [streamStatus, setStreamStatus] = useState(null);
    const [checking, setChecking] = useState(false);
    const [form, setForm] = useState({
        name: "",
        stream_url: "",
        logo: "",
        tvg_id: "",
        country_code: "",
        language: "",
        category: ""
    });

    const handleChange = (e) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async () => {
        if (!form.name || !form.stream_url) return;

        try {
            setLoading(true);
            await createChannel(form);
            navigate("/");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const { data: languages } = useQuery({
        queryKey: ["languages"],
        queryFn: getLanguages
    })
    const { data: countries } = useQuery({
        queryKey: ["countries"],
        queryFn: getCountries
    });

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories
    });

    const handleCheckStream = async () => {

        if (!form.stream_url) {
            return;
        }

        try {

            setChecking(true);

            const response = await fetch(
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
        <Box sx={{ maxWidth: 1000, mx: "auto" }}>
            <Typography variant="h4" sx={{ mb: 3, color: "#ffffff" }}>
                Add Channel
            </Typography>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        fullWidth
                        label="Channel Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        fullWidth
                        label="TVG ID"
                        name="tvg_id"
                        value={form.tvg_id}
                        onChange={handleChange}
                    />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Stream URL"
                        name="stream_url"
                        value={form.stream_url}
                        onChange={handleChange}
                    />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <TextField
                        fullWidth
                        label="Logo URL"
                        name="logo"
                        value={form.logo}
                        onChange={handleChange}
                    />
                </Grid>

                {form.logo && (
                    <Grid size={{ xs: 12 }}>
                        <Box
                            component="img"
                            src={form.logo}
                            alt="logo"
                            sx={{
                                width: 150,
                                height: 100,
                                objectFit: "contain",
                                border: "1px solid #333",
                                borderRadius: 2,
                                p: 1
                            }}
                        />
                    </Grid>
                )}

                <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth>
                        <InputLabel>Country</InputLabel>
                        <Select
                            name="country_code"
                            value={form.country_code}
                            label="Country"
                            onChange={handleChange}
                        >
                            <MenuItem value="">Select Country</MenuItem>
                            {countries?.map(country => (
                                <MenuItem key={country.code} value={country.code}>
                                    {country.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth>
                        <InputLabel>Language</InputLabel>
                        <Select
                            name="language"
                            value={form.language}
                            label="Language"
                            onChange={handleChange}
                        >
                            <MenuItem value="">
                                Select Language
                            </MenuItem>

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
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                            name="category"
                            value={form.category}
                            label="Category"
                            onChange={handleChange}
                        >
                            <MenuItem value="">
                                Select Category
                            </MenuItem>

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
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            mt: 3
                        }}
                    >

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
                                {
                                    streamStatus === "online"
                                        ? "🟢 Online"
                                        : "🔴 Offline"
                                }
                            </Typography>
                        )}

                        <Button
                            variant="outlined"
                            onClick={handleCheckStream}
                            disabled={checking}
                        >
                            {checking
                                ? "Checking..."
                                : "Check Stream"}
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                        >
                            Save Channel
                        </Button>

                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}