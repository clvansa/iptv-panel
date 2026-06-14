import { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert
} from "@mui/material";

import { importPlaylist } from "../api/channels";

export default function ImportPlaylist() {

    const [url, setUrl] = useState("");

    const [result, setResult] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const handleImport =
        async () => {

            if (!url) return;

            try {

                setLoading(true);

                const response =
                    await importPlaylist(url);

                setResult(response);

            } catch (error) {

                console.log(error);

            } finally {

                setLoading(false);

            }

        };

    return (
        <Box>

            <Typography
                variant="h4"
                sx={{ mb: 3, color: "#ffffff" }}
            >
                Import Playlist
            </Typography>

            <TextField
                fullWidth
                label="Playlist URL"
                value={url}
                onChange={(e) =>
                    setUrl(
                        e.target.value
                    )
                }
            />

            <Button
                sx={{ mt: 2 }}
                variant="contained"
                onClick={handleImport}
                disabled={loading}
            >
                {
                    loading
                        ? "Importing..."
                        : "Import"
                }
            </Button>

            {
                result && (

                    <Alert
                        severity="success"
                        sx={{ mt: 2 }}
                    >

                        Total:
                        {" "}
                        {result.total}

                        <br />

                        Inserted:
                        {" "}
                        {result.inserted}

                    </Alert>

                )
            }

        </Box>
    );

}