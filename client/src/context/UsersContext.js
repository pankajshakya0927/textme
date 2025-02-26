import React, { createContext, useState, useCallback } from "react";
import axios from "axios";
import Utils from "../shared/Utils";  // Ensure Utils is imported

export const UsersContext = createContext();

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

export const UsersContextProvider = ({ children }) => {
    const [users, setUsers] = useState([]);

    const fetchAllUsers = useCallback(async () => {
        try {
            const access_token = Utils.getItemFromLocalStorage("access_token");
            const reqConfig = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${access_token}`,
                },
            };

            const response = await axios.get(`${apiBaseUrl}/user/fetchAllUsers`, reqConfig);
            if (response?.data?.data) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }, []);

    return (
        <UsersContext.Provider value={{ users, setUsers, fetchAllUsers }}>
            {children}
        </UsersContext.Provider>
    );
};