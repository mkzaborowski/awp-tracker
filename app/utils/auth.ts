// utils/auth.js
export const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    return !!token;
};

export const login = (credentials: { email: unknown; password: unknown; }) => {
    // Simulate API call
    if (credentials.email && credentials.password) {
        localStorage.setItem('authToken', 'dummy-token');
        return true;
    }
    return false;
};

export const logout = () => {
    localStorage.removeItem('authToken');
};