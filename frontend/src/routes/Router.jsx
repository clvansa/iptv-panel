import {
    Routes,
    Route
} from "react-router-dom";

import DashboardLayout
    from "../layouts/DashboardLayout";

import Channels
    from "../pages/Channels";

import Playlists
    from "../pages/Playlists";

import PlaylistEditor
    from "../pages/PlaylistEditor";

import AddChannel
    from "../pages/AddChannel";

import EditChannel from "../pages/EditChannel";
import ImportPlaylist from "../pages/ImportPlaylist";

export default function Router() {

    return (

        <Routes>

            <Route
                element={
                    <DashboardLayout />
                }
            >

                <Route
                    path="/"
                    element={
                        <Channels />
                    }
                />

                <Route
                    path="/channel/add"
                    element={<AddChannel />}
                />

                <Route
                    path="/channels/:id/edit"
                    element={<EditChannel />}
                />

                <Route
                    path="/playlists"
                    element={
                        <Playlists />
                    }
                />
                <Route
                    path="/playlists/add"
                    element={
                        <ImportPlaylist />
                    }
                />

                <Route
                    path="/playlist/:id"
                    element={
                        <PlaylistEditor />
                    }
                />

            </Route>

        </Routes>

    );

}