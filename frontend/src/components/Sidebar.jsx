import {
    Box,
    List,
    ListItemButton,
    ListItemText,
    Typography
} from "@mui/material";

import {
    Tv,
    PlaylistPlay
} from "@mui/icons-material";

import {
    Link,
    useLocation
} from "react-router-dom";

export default function Sidebar() {

    const location =
        useLocation();

    return (

        <Box
            sx={{
                width: 260,
                bgcolor: "#111827",
                borderRight:
                    "1px solid #1f2937",
                    color: "#ffffff"
            }}
        >

            <Typography
                variant="h6"
                sx={{
                    p: 3,
                    fontWeight: 700,
                    
                }}
            >
                IPTV Panel
            </Typography>

            <List>

                <ListItemButton
                    component={Link}
                    to="/"
                    selected={
                        location.pathname === "/"
                    }
                >

                    <Tv sx={{ mr: 1 }} />

                    <ListItemText
                        primary="Channels"
                    />

                </ListItemButton>

                <ListItemButton
                    component={Link}
                    to="/playlists"
                    selected={
                        location.pathname ===
                        "/playlists"
                    }
                >

                    <PlaylistPlay
                        sx={{ mr: 1 }}
                    />

                    <ListItemText
                        primary="Playlists"
                    />

                </ListItemButton>
                <ListItemButton
                    component={Link}
                    to="/channel/add"
                    selected={
                        location.pathname ===
                        "/channel/add"
                    }
                >

                    <PlaylistPlay
                        sx={{ mr: 1 }}
                    />

                    <ListItemText
                        primary="Add Channel"
                    />

                </ListItemButton>
                <ListItemButton
                    component={Link}
                    to="/playlists/add"
                    selected={
                        location.pathname ===
                        "/playlists/add"
                    }
                >

                    <PlaylistPlay
                        sx={{ mr: 1 }}
                    />

                    <ListItemText
                        primary="Add URL"
                    />

                </ListItemButton>

            </List>

        </Box>

    );

}