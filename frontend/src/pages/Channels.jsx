import { useState } from "react";
import { Box, TextField, Typography, Grid, MenuItem, Select, FormControl, InputLabel, Button, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { getChannels } from "../api/channels";
import { getLanguages, getCountries, getCategories } from "../api/filters";
import { getPlaylists, addChannelsToPlaylist, addFilteredChannels } from "../api/playlists";
import { useNavigate } from "react-router-dom";

export default function Channels() {
    const [openPlaylistDialog, setOpenPlaylistDialog] = useState(false);
    const [playlistId, setPlaylistId] = useState("");
    const [addMode, setAddMode] = useState("selected");
    const [language, setLanguage] = useState("");
    const [country, setCountry] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const navigate = useNavigate()

    const { data: languages } = useQuery({ queryKey: ["languages"], queryFn: getLanguages });
    const { data: countries } = useQuery({ queryKey: ["countries"], queryFn: getCountries });
    const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
    const { data: playlists } = useQuery({ queryKey: ["playlists"], queryFn: getPlaylists });

    const { data, isLoading } = useQuery({
        queryKey: ["channels", page, search, language, country, category],
        queryFn: () => getChannels({ page, search, language, country, category })
    });



    const handleSavePlaylist = async () => {

        if (!playlistId) {
            return;
        }


        if (addMode === "filtered") {
            await addFilteredChannels(playlistId, { search, language, country, category });

        } else {
            const channelsToSave = selectedRows;
            // const channelsToSave = selectedRows.length > 0 ? selectedRows : (selectedChannel ? [selectedChannel.id] : []);
            if (!channelsToSave.length) {
                return;
            }
            await addChannelsToPlaylist(
                playlistId,
                channelsToSave
            );

        }


        setOpenPlaylistDialog(false);
        setPlaylistId("");
        setSelectedRows([]);
    };

    const columns = [
        { field: "id", headerName: "ID", width: 80 },
        {
            field: "logo",
            headerName: "Logo",
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <Box
                    component="img"
                    src={
                        params.row.logo ||
                        "https://placehold.co/60x40?text=TV"
                    }
                    alt={params.row.name}
                    sx={{
                        width: 60,
                        height: 40,
                        objectFit: "contain",
                        borderRadius: 1,
                        mt: 0.5
                    }}
                />
            )
        },
        { field: "name", headerName: "Name", flex: 1 },
        { field: "country_code", headerName: "Country", width: 120 },
        { field: "language", headerName: "Language", width: 120 },
        { field: "status", headerName: "Status", width: 80 },
        { field: "category", headerName: "Category", width: 180 },
        {
            field: "actions", headerName: "Actions", width: 120,
            renderCell: (params) => (<Button size="small" onClick={() => {
                console.log(params.row.id)
                navigate(`/channels/${params.row.id}/edit`)
            }}>
                Edit
            </Button>)
        }

    ];

    return (
        <Box sx={{ color: "#ffffff" }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Channels</Typography>


            <TextField
                fullWidth
                label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}

            />

            <Grid container spacing={2} size={{ mb: 2 }}>
                <Grid size={{ xs: 4, md: 6 }}>
                    <FormControl fullWidth>
                        <InputLabel>Language</InputLabel>
                        <Select value={language} label="Language" onChange={(e) => setLanguage(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            {languages?.map(item => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 4, md: 6 }}>
                    <FormControl fullWidth>
                        <InputLabel sx={{ color: "#ffffff" }}
                        >Country</InputLabel>
                        <Select value={country} label="Country" onChange={(e) => setCountry(e.target.value)} sx={{ color: "#ffffff" }}>
                            <MenuItem value="">All</MenuItem>
                            {countries?.map(item => <MenuItem key={item.code} value={item.code}>{item.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 4, md: 6 }}>
                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            {categories?.map(item => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>


            <Box sx={{ height: 700 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography>Selected: {selectedRows.length}</Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <Button
                            variant="contained"
                            disabled={!selectedRows.length}
                            onClick={() => {
                                setAddMode("selected");
                                setOpenPlaylistDialog(true);
                            }}
                        >
                            Add Selected
                        </Button>

                        <Button
                            variant="outlined"
                            onClick={() => {
                                setAddMode("filtered");
                                setOpenPlaylistDialog(true);
                            }}
                        >
                            Add All Filtered
                        </Button>
                    </Box>
                </Box>

                <DataGrid
                    loading={isLoading}
                    rows={data?.channels || []}

                    checkboxSelection
                    disableRowSelectionOnClick
                    onRowSelectionModelChange={(model) => {

                        if (model.type === "include") {

                            setSelectedRows([
                                ...model.ids
                            ]);

                        } else {

                            setSelectedRows(
                                (data?.channels || []).map(
                                    channel => channel.id
                                )
                            );

                        }

                    }}
                    columns={columns}
                    rowCount={data?.total || 0}
                    paginationMode="server"
                    pageSizeOptions={[50]}
                    paginationModel={{ page: page - 1, pageSize: 50 }}
                    onPaginationModelChange={(model) => setPage(model.page + 1)}
                />
            </Box>

            <Dialog open={openPlaylistDialog} onClose={() => setOpenPlaylistDialog(false)}>
                <DialogTitle>Add Channels To Playlist</DialogTitle>
                <DialogContent>
                    <Select fullWidth value={playlistId} onChange={(e) => setPlaylistId(e.target.value)} sx={{ mt: 2 }}>
                        {playlists?.map(playlist => (
                            <MenuItem key={playlist.id} value={playlist.id}>{playlist.name}</MenuItem>
                        ))}
                    </Select>
                    <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleSavePlaylist}>
                        Save
                    </Button>
                </DialogContent>
            </Dialog>
        </Box>
    );
}