import React, { useEffect, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Loading from "./components/Loading";
import { getCurrentUser } from "./services/api";

const App: React.FC = () => {
    const [authenticated, setAuthenticated] =
        useState<boolean>(false);

    const [loading, setLoading] =
        useState<boolean>(true);

    const checkAuthentication = async () => {
        try {
            await getCurrentUser();
            setAuthenticated(true);
        } catch {
            setAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuthentication();
    }, []);

    if (loading) {
        return (
            <Loading
                message="Checking authentication..."
                fullScreen
            />
        );
    }

    if (!authenticated) {
        return <Login />;
    }

    return <Dashboard />;
};

export default App;
