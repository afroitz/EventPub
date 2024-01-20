// AuthContext.tsx
import { createContext, useState, useEffect, FC, ReactNode } from 'react';

type AuthContextType = {
    loggedIn: boolean,
    loading: boolean,
    logIn: (credentials: LoginCredentials) => Promise<void>,
    logOut: () => Promise<void>
}

type LoginCredentials = {
    username: string,
    password: string
}

export const AuthContext = createContext<AuthContextType>(null!);

type AuthProviderProps = {
    children: ReactNode
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(process.env.REACT_APP_API_URL + "/check-session", {
          credentials: 'include',
        })
            .then(response => response.json())
            .then(data => {
                if (data.loggedIn) {
                    setLoggedIn(true);
                }
                setLoading(false);
            });
    }, []);

    const logIn = async (credentials: LoginCredentials) => {
        const response = await fetch(process.env.REACT_APP_API_URL + "/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
            credentials: 'include',
        });
        if (response.ok) {
            setLoggedIn(true);
        } else {
            throw new Error('Login failed');
        }
    };

    const logOut = async () => {
        const response = await fetch(process.env.REACT_APP_API_URL + "/logout", {
            method: 'POST',
        });
        if (response.ok) {
            setLoggedIn(false);
        } else {
          throw new Error('Logout failed');
        }
    };

    return (
        <AuthContext.Provider value={{ loggedIn, loading, logIn, logOut }}>
            {children}
        </AuthContext.Provider>
    );
};
