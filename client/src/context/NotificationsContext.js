import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

import { AuthContext } from "./AuthContext";

import socket from "../utils/socket";  // Make sure socket.io-client is correctly initialized here
import Utils from "../shared/Utils";
import apiClient from "../utils/api";

export const NotificationsContext = createContext();

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

export const NotificationsContextProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    const { isLoggedIn } = useContext(AuthContext);  // Use AuthContext to check if user is logged in

    // Fetch notifications from the API
    const fetchNotifications = async () => {
        const access_token = Utils.getItemFromLocalStorage("access_token");
        const reqConfig = {
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${access_token}`,
            },
        };

        try {
            const response = await axios.get(`${apiBaseUrl}/notifications`, reqConfig);
            if (response.data) {
                setNotifications(response.data?.data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications from API:", error);
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            const storedUser = JSON.parse(Utils.getItemFromLocalStorage("current_user"));
            if (storedUser) {
                setCurrentUser(storedUser);
                fetchNotifications();  // Fetch notifications when user logs in
            }
        }
    }, [isLoggedIn]);  // Depend on isLoggedIn, so notifications are fetched when the user logs in

    useEffect(() => {
        if (currentUser) {
            socket.connect(); // Connect to socket when currentUser is available

            socket.on("receiveNotification", (notification) => {
                if (notification.receiver === currentUser.username) {
                    setNotifications((prev) => [...prev, notification]);
                }
            });

            // Clean up socket listeners when the component unmounts
            return () => {
                socket.off("receiveNotification");
                socket.disconnect();
            };
        }
    }, [currentUser]); // This effect will run when currentUser is set

    // Function to add a new notification
    const addNotification = (notification) => {
        setNotifications((prev) => [...prev, notification]);

        // Emit notification event to the server (real-time)
        socket.emit("sendNotification", notification);  // Ensure this event is being emitted correctly from the client
    };

    // Function to fetch notifications for the current user
    const getNotificationsForUser = () => {
        if (!currentUser) return [];
        return notifications.filter(
            (notification) => notification.receiver === currentUser.username
        );
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            await apiClient.patch(`/notifications/${notificationId}/markAsRead`);

            // Update state to reflect the read notification
            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) =>
                    notification._id === notificationId ? { ...notification, isRead: true } : notification
                )
            );
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };


    return (
        <NotificationsContext.Provider
            value={{ notifications, addNotification, getNotificationsForUser, markNotificationAsRead }}
        >
            {children}
        </NotificationsContext.Provider>
    );
};