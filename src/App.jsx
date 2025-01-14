import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ClaimDashboard from "./pages/ClaimDashboard";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                />
                <Route path="/dashboard" element={<ClaimDashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
