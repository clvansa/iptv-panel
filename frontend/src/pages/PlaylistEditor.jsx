import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Button, Paper, TextField } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Checkbox, Switch, FormControlLabel } from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCountries } from "../api/filters";
import { getPlaylist, removeChannelFromPlaylist, reorderPlaylist, exportPlaylist, updateCountryOrder, removeChannelsFromPlaylist, updatePlaylistChannelCountry, updatePlaylistChannelFavorite } from "../api/playlists";
import { Drawer, Chip, Divider } from "@mui/material";
import LivePlayer from "../components/player/LivePlayer";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import IconButton from "@mui/material/IconButton";

export default function PlaylistEditor() {
    let draggableIndex = 0;
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [countryDialog, setCountryDialog] = useState(false);
    const [countryOrder, setCountryOrder] = useState([]);
    const [channels, setChannels] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const selectedSet = new Set(selectedRows);
    const [collapsedCountries, setCollapsedCountries] = useState({});
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [favoritesDialog, setFavoritesDialog] = useState(false);
    const favoriteChannels = channels.filter(channel => channel.favorite);
    const [useProxy, setUseProxy] = useState(() => {
        return localStorage.getItem("useProxy") === "true";
    });

    const { data } = useQuery({
        queryKey: ["playlist", id],
        queryFn: () => getPlaylist(id)
    });

    const { data: countries } = useQuery({
        queryKey: ["countries"],
        queryFn: getCountries
    });

    useEffect(() => {
        if (data?.Channels) {
            const mapped = data.Channels.map(channel => ({
                ...channel,
                playlist_country_code: channel.PlaylistChannel?.country_code || channel.country_code,
                favorite: channel.PlaylistChannel?.favorite || false
            }))
            setChannels(mapped);
        }
        if (data?.country_order) {
            setCountryOrder(data.country_order);
        }
    }, [data]);

    useEffect(() => {
        localStorage.setItem("useProxy", useProxy);
    }, [useProxy]);

    const removeMutation = useMutation({
        mutationFn: ({ channelId }) => removeChannelFromPlaylist(id, channelId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["playlist", id] });
        }
    });

    const reorderMutation = useMutation({
        mutationFn: (channelIds) => reorderPlaylist(id, channelIds)
    });

    const countryOrderMutation = useMutation({
        mutationFn: (order) => updateCountryOrder(id, order),
    });

    const bulkRemoveMutation = useMutation({
        mutationFn: (channelIds) => removeChannelsFromPlaylist(id, channelIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["playlist", id] });
            setSelectedRows([]);
        }
    });

    const updateCountryMutation = useMutation({
        mutationFn: ({ channelId, country_code }) => updatePlaylistChannelCountry(id, channelId, country_code),
        // onSuccess: () => {
        //     queryClient.invalidateQueries({
        //         queryKey: ["playlist", id]
        //     })
        // }
    })

    const favoriteMutation = useMutation({
        mutationFn: ({ channelId, favorite }) => updatePlaylistChannelFavorite(id, channelId, favorite),
        onSuccess: (data, variables) => {
            setChannels(prev => prev.map(channel => channel.id === variables.channelId ? {
                ...channel, favorite: variables.favorite
            } : channel
            ))
        }
    })

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(channels);
        const sourceChannel = items[result.source.index];
        const targetChannel = items[result.destination.index];
        const oldCountry = sourceChannel.playlist_country_code;
        const newCountry = targetChannel?.playlist_country_code;

        if (newCountry && oldCountry !== newCountry) {
            sourceChannel.playlist_country_code = newCountry;
            updateCountryMutation.mutate({ channelId: sourceChannel.id, country_code: newCountry });
        }
        const [moved] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, moved);

        // const sorted = [...items].sort((a,b) => a.playlist_country_code.localeCompare(b.playlist_country_code))
        const sorted = [...items].sort((a, b) => {

            const aOrder =
                getCountryPosition(
                    a.playlist_country_code
                );

            const bOrder =
                getCountryPosition(
                    b.playlist_country_code
                );

            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }

            return 0;
        });
        setChannels(sorted);
        reorderMutation.mutate(sorted.map(item => item.id));
    };

    const handleCountryDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(countryOrder);
        const [moved] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, moved);
        setCountryOrder(items);
    };



    const filteredChannels = channels.filter(channel =>
        channel.name.toLowerCase().includes(search.toLowerCase())
    );

    const getCountryPosition = (countryCode) => {
        const index = countryOrder.indexOf(countryCode);

        if (index !== -1) {
            return index;
        }

        const otherIndex = countryOrder.indexOf("OTHER");

        return otherIndex === -1 ? 999 : otherIndex;
    };

    const autoSortChannels = () => {
        const sorted = [...channels].sort((a, b) => {
            const aOrder = getCountryPosition(a.playlist_country_code);
            const bOrder = getCountryPosition(b.playlist_country_code);

            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }

            return a.name.localeCompare(b.name);
        });

        setChannels(sorted);
        reorderMutation.mutate(sorted.map(item => item.id));
    };

    const getCountryName = (code) => {
        return countries?.find(c => c.code === code)?.name || code;
    };

    const shouldShowCountryHeader = (index, channels) => {
        if (index === 0) {
            return true;
        }

        return channels[index - 1].playlist_country_code !== channels[index].playlist_country_code;
    };

    const getFlagEmoji = (countryCode) => {
        if (!countryCode) {
            return "🌍";
        }

        return countryCode.toUpperCase().replace(/./g, char =>
            String.fromCodePoint(127397 + char.charCodeAt())
        );
    };

    const countryCounts = filteredChannels.reduce((acc, channel) => {
        acc[channel.playlist_country_code] = (acc[channel.playlist_country_code] || 0) + 1;
        return acc;
    }, {});

    const toggleCountry = (countryCode) => {
        setCollapsedCountries(prev => ({
            ...prev,
            [countryCode]: !prev[countryCode]
        }));
    };

    return (
        <Box sx={{ color: "#ffffff" }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
                {data?.name}
            </Typography>

            <Typography sx={{ mb: 3 }}>
                Channels: {channels.length}
            </Typography>

            <TextField
                fullWidth
                label="Search Channel"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 3 }}
            />

            <FormControlLabel
                sx={{ color: "wheat" }}
                control={
                    <Switch
                        checked={useProxy}
                        onChange={(e) => setUseProxy(e.target.checked)}
                    />
                }
                label="Use Proxy"
            />

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Button variant="contained" onClick={() => exportPlaylist(data?.id)}>
                    Export M3U
                </Button>

                <Button variant="outlined" onClick={() => setCountryDialog(true)}>
                    Country Order
                </Button>
                <Button
                    variant="outlined"
                    onClick={() =>
                        setFavoritesDialog(true)
                    }
                >
                    ⭐ Favorites
                </Button>
            </Box>

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Button
                    color="error"
                    variant="contained"
                    disabled={!selectedRows.length}
                    onClick={() => bulkRemoveMutation.mutate(selectedRows)}
                >
                    Delete Selected ({selectedRows.length})
                </Button>
            </Box>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="channels">
                    {(provided) => (
                        <Box ref={provided.innerRef} {...provided.droppableProps}>
                            {filteredChannels.map((channel, index) => (
                                <React.Fragment key={channel.id}>
                                    {shouldShowCountryHeader(index, filteredChannels) && (
                                        <Paper
                                            sx={{
                                                p: 2,
                                                mb: 2,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                backgroundColor: "#ccf7ea",
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Button
                                                    size="small"
                                                    onClick={() => toggleCountry(channel.playlist_country_code)}
                                                >
                                                    {collapsedCountries[channel.playlist_country_code] ? "▶" : "▼"}
                                                </Button>
                                            </Box>

                                            <Checkbox
                                                checked={
                                                    filteredChannels
                                                        .filter(c => c.playlist_country_code === channel.playlist_country_code)
                                                        .every(c => selectedRows.includes(c.id))
                                                }
                                                onChange={(e) => {
                                                    const countryIds = filteredChannels
                                                        .filter(c => c.playlist_country_code === channel.playlist_country_code)
                                                        .map(c => c.id);

                                                    if (e.target.checked) {
                                                        setSelectedRows(prev => [
                                                            ...new Set([...prev, ...countryIds])
                                                        ]);
                                                    } else {
                                                        setSelectedRows(prev =>
                                                            prev.filter(id => !countryIds.includes(id))
                                                        );
                                                    }
                                                }}
                                            />

                                            <Typography variant="h6" fontWeight="bold">
                                                {" "}
                                                {getCountryName(channel.playlist_country_code)}
                                                {" ("}
                                                {countryCounts[channel.playlist_country_code]}
                                                {" Channels)"}
                                            </Typography>
                                        </Paper>
                                    )}

                                    {!collapsedCountries[channel.playlist_country_code] && (
                                        <Draggable
                                            draggableId={String(channel.id)}
                                            index={draggableIndex++}
                                            isDragDisabled={
                                                search.trim().length > 0 ||
                                                Object.values(collapsedCountries).some(Boolean)
                                            }
                                        >
                                            {(provided) => (
                                                <Paper
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    sx={{
                                                        p: 2,
                                                        mb: 2,
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center"
                                                    }}
                                                    onClick={() => setSelectedChannel(channel)}
                                                >
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                        <Checkbox
                                                            onClick={(e) => e.stopPropagation()}
                                                            checked={selectedSet.has(channel.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedRows(prev => [...prev, channel.id]);
                                                                } else {
                                                                    setSelectedRows(prev => prev.filter(id => id !== channel.id));
                                                                }
                                                            }}
                                                        />

                                                        <Box component="img" src={channel.logo || "https://placehold.co/60x40?text=TV"} alt={channel.name} sx={{ width: 60, height: 40, objectFit: "contain", borderRadius: 1, bgcolor: "#fff" }} />

                                                        <Box>
                                                            <Typography>{channel.name}</Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {getCountryName(channel.playlist_country_code)} {" • "} {channel.language?.includes("ara") ? "Arabic" : channel.language} {" • "} {channel.category?.includes("Undefined") ? "" : channel.category}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

                                                        <IconButton onClick={(e) => { e.stopPropagation(); favoriteMutation.mutate({ channelId: channel.id, favorite: !channel.favorite }); }}>
                                                            {channel.favorite ? (<StarIcon color="warning" />) : (<StarBorderIcon />)}
                                                        </IconButton>

                                                        <Button
                                                            color="error"
                                                            variant="contained"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeMutation.mutate({ channelId: channel.id });
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </Box>
                                                </Paper>
                                            )}
                                        </Draggable>
                                    )}
                                </React.Fragment>
                            ))}
                            {provided.placeholder}
                        </Box>
                    )}
                </Droppable>
            </DragDropContext>

            <Dialog
                open={countryDialog}
                onClose={() => setCountryDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Country Order</DialogTitle>

                <DialogContent>
                    <List>
                        <DragDropContext onDragEnd={handleCountryDragEnd}>
                            <Droppable droppableId="countries">
                                {(provided) => (
                                    <List ref={provided.innerRef} {...provided.droppableProps}>
                                        {countryOrder.map((country, index) => (
                                            <Draggable key={country} draggableId={country} index={index}>
                                                {(provided) => (
                                                    <ListItem
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <ListItemText primary={`${index + 1}. ${country}`} />
                                                    </ListItem>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </List>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </List>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setCountryDialog(false)}>
                        Close
                    </Button>

                    <Button variant="outlined" onClick={async () => {
                        await countryOrderMutation.mutateAsync(countryOrder);
                        autoSortChannels();
                        setCountryDialog(false);
                    }}>
                        Applay To Channels
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() => {
                            countryOrderMutation.mutate(countryOrder);
                            setCountryDialog(false);
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Drawer
                anchor="right"
                open={!!selectedChannel}
                onClose={() => setSelectedChannel(null)}
            >
                <Box sx={{ width: 500, p: 3 }}>
                    {selectedChannel && (
                        <>
                            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                                <img
                                    src={selectedChannel.logo || "https://placehold.co/60x40?text=TV"}
                                    alt={selectedChannel.name}
                                    width="80"
                                    style={{ maxHeight: "40px" }}
                                />

                                <Box>
                                    <Typography variant="h6">
                                        {selectedChannel.name}
                                    </Typography>

                                    <Chip
                                        label={selectedChannel.playlist_country_code}
                                        size="small"
                                    />
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            <LivePlayer
                                url={selectedChannel.stream_url}
                                channelId={selectedChannel.id}
                                useProxy={useProxy}
                            />

                            <Box sx={{ mt: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
                                <Chip
                                    label={selectedChannel.language?.includes("ara") ? "Arabic" : selectedChannel.language}
                                />

                                <Chip
                                    label={selectedChannel.category}
                                />

                                <Chip
                                    color={selectedChannel.status === "online" ? "success" : "error"}
                                    label={selectedChannel.status}
                                />
                            </Box>
                        </>
                    )}
                </Box>
            </Drawer>

            <Dialog
                open={favoritesDialog}
                onClose={() =>
                    setFavoritesDialog(false)
                }
                maxWidth="md"
                fullWidth
            >

                <DialogTitle>
                    Favorite Channels
                </DialogTitle>

                <DialogContent>

                    {favoriteChannels.map(
                        channel => (

                            <Paper
                                key={channel.id}
                                sx={{
                                    p: 2,
                                    mb: 2,
                                }}
                            >



                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}
                                >

                                    <Box sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 2
                                    }}>
                                        <Box component="img" src={channel.logo || "https://placehold.co/60x40?text=TV"} alt={channel.name} sx={{ width: 60, height: 40, objectFit: "contain", borderRadius: 1, bgcolor: "#fff" }} />
                                        <Box>
                                            <Typography>
                                                {channel.name}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                            >
                                                {
                                                    getCountryName(
                                                        channel.playlist_country_code
                                                    )
                                                }
                                            </Typography>
                                        </Box>

                                    </Box>





                                    <IconButton
                                        onClick={() =>
                                            favoriteMutation.mutate({
                                                channelId:
                                                    channel.id,
                                                favorite:
                                                    false

                                            })
                                        }
                                    >
                                        <StarIcon
                                            color="warning"
                                        />
                                    </IconButton>

                                </Box>

                            </Paper>

                        )
                    )}

                </DialogContent>

                <DialogActions>

                    <Button
                        onClick={() =>
                            setFavoritesDialog(false)
                        }
                    >
                        Close
                    </Button>

                </DialogActions>

            </Dialog>
        </Box>
    );
}