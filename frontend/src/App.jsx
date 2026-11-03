import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Board from './pages/Board';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <TenantProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/board"
                            element={
                                <ProtectedRoute>
                                    <Board />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/" element={<Navigate to="/board" replace />} />
                        <Route path="*" element={<Navigate to="/board" replace />} />
                    </Routes>
                </TenantProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;