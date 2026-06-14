import {
    AppBar,
    Toolbar,
    Typography
} from "@mui/material";

export default function Header() {

    return (

        <AppBar
            position="static"
            elevation={0}
            sx={{
                bgcolor: "#111827",
                borderBottom:
                    "1px solid #1f2937"
            }}
        >

            <Toolbar>

                <Typography
                    variant="h6"
                >
                    IPTV Manager
                </Typography>

            </Toolbar>

        </AppBar>

    );

}