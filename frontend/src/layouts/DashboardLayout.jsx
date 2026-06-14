import {
    Box
} from "@mui/material";

import Sidebar
from "../components/Sidebar";

import Header
from "../components/Header";

import {
    Outlet
} from "react-router-dom";

export default function DashboardLayout() {

    return (

        <Box
            sx={{
                display: "flex",
                minHeight: "100vh",
                bgcolor: "#0f172a"
            }}
        >

            <Sidebar />

            <Box
                sx={{
                    flex: 1
                }}
            >

                <Header />

                <Box
                    sx={{
                        p: 3
                    }}
                >

                    <Outlet />

                </Box>

            </Box>

        </Box>

    );

}