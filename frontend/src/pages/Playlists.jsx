import { useState } from "react";
import { Box, Typography, Button, TextField, Card, CardContent, Grid, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlaylists, createPlaylist, deletePlaylist } from "../api/playlists";
import { useNavigate } from "react-router-dom";

export default function Playlists() {
    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const navigate = useNavigate();

    const { data: playlists = [] } = useQuery({
        queryKey: ["playlists"],
        queryFn: getPlaylists
    });

    const createMutation = useMutation({
        mutationFn: createPlaylist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["playlists"] });
            setName("");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deletePlaylist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["playlists"] });
        }
    });

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3,color:"#ffffff" }}>Playlists</Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
                <TextField
                    fullWidth
                    label="Playlist Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <Button variant="contained" onClick={() => createMutation.mutate({ name })}>
                    Create
                </Button>
            </Box>

            <Grid container spacing={2}>
                {playlists.map(playlist => (
                    <Grid size={{ xs: 12, md: 4 }} key={playlist.id}>
                        <Card 
                            sx={{ cursor: "pointer" }}
                            onClick={() => navigate(`/playlist/${playlist.id}`)}>
                            <CardContent>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="h6">{playlist.name}</Typography>
                                    <IconButton color="error" onClick={() => deleteMutation.mutate(playlist.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}