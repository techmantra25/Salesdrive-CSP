import axios from "axios";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { BACKEND_URL, EMP_URL, USERS_URL } from "../constants";
import { logout as logoutAction, setCredentials } from "../redux/userSlice";
import { useLogoutMutation } from "../redux/userApiSlice";
import { pricingStatusBulkUpdate, setAuthHeader, getUserPermission } from "../api/api";
import { getConfig } from "../api/configApi";
import { setConfig } from "../redux/configSlice";
import { fetchUserPermissions } from "../redux/permissionSlice";

export const AutoLogout = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  const { userInfo } = useSelector((state) => state.user);
  const { config } = useSelector((state) => state.config);

  console.log({
    config,
  });


  useEffect(() => {
  if (!userInfo?._id) return;

  dispatch(fetchUserPermissions(userInfo._id));

  
}, [userInfo?._id]);
  useEffect(() => {
    let ignore = false;
    let hasSynced = false;

    const getMe = async () => {
      try {
        const { data } = await axios.get(BACKEND_URL + USERS_URL + "/me", {
          headers: setAuthHeader(),
        });
        // Update user data if response is valid
        // IMPORTANT: Preserve the token from existing userInfo
        if (data?.data && !ignore) {
          const existingToken = userInfo?.token;
          dispatch(setCredentials({
            ...data.data,
            token: existingToken // Keep the existing token
          }));
        }
      } catch (error) {
        // Only logout if we get a 401/403 error (unauthorized/forbidden)
        const status = error?.response?.status;
        if (!ignore && (status === 401 || status === 403)) {
          console.error("Authentication failed:", error);
          try {
            await logout().unwrap();
          } catch (e) {
            // Ignore API errors, proceed with local logout
          }
          dispatch(logoutAction());
          navigate("/sign-in");
          toast.error("Session expired. Please login again.");
        }
      }
    };

    const getConfigData = async () => {
      try {
        const config = await getConfig();

        if (config.data.status === 200) {
          dispatch(setConfig(config?.data?.data));
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load config & settings");
      }
    };

    const getMeEmployee = async () => {
      try {
        const { data } = await axios.get(BACKEND_URL + EMP_URL + "/profile", {
          headers: setAuthHeader(),
        });
        // Update user data if response is valid
        // IMPORTANT: Preserve the token from existing userInfo
        if (data?.data && !ignore) {
          const existingToken = userInfo?.token;
          dispatch(setCredentials({
            ...data.data,
            token: existingToken // Keep the existing token
          }));
        }
      } catch (error) {
        // Only logout if we get a 401/403 error (unauthorized/forbidden)
        const status = error?.response?.status;
        if (!ignore && (status === 401 || status === 403)) {
          console.error("Authentication failed:", error);
          try {
            await logout().unwrap();
          } catch (e) {
            // Ignore API errors, proceed with local logout
          }
          dispatch(logoutAction());
          navigate("/sign-in");
          toast.error("Session expired. Please login again.");
        }
      }
    };

    const pricingStatusBulkUpdateApi = async () => {
      try {
        await pricingStatusBulkUpdate();
      } catch (error) {
        console.error(error);
      }
    };

    const syncProfileAndPermissions = async () => {
      // Prevent multiple syncs
      if (hasSynced) {
        return;
      }
      hasSynced = true;

      try {
        // Check if token exists before making API calls
        const storedData = localStorage.getItem("DMS_USERINFO");
        if (!storedData) {
          console.warn("No user data in localStorage");
          return;
        }

        const parsedData = JSON.parse(storedData);

        // Check for token in multiple possible locations
        const token = parsedData?.token || parsedData?.data?.token;

        if (!token) {
          console.warn("No token found in user data:", parsedData);
          return;
        }

        // Sync user profile based on role
        if (userInfo?.role === "admin") {
          const { data } = await axios.get(BACKEND_URL + USERS_URL + "/me", {
            headers: setAuthHeader(),
          });
          if (data?.data && !ignore) {
            // Preserve the token when updating user data
            dispatch(setCredentials({
              ...data.data,
              token: userInfo?.token
            }));
          }
        } else if (userInfo?.role === "employee") {
          const { data } = await axios.get(BACKEND_URL + EMP_URL + "/profile", {
            headers: setAuthHeader(),
          });
          if (data?.data && !ignore) {
            // Preserve the token when updating user data
            dispatch(setCredentials({
              ...data.data,
              token: userInfo?.token
            }));
          }
        }

        // Sync permissions
        if (userInfo?._id && !ignore) {
          await dispatch(fetchUserPermissions(userInfo._id)).unwrap();
        }
      } catch (error) {
        console.error("Profile sync error:", error);
        // Don't logout on sync error - only logout if the main auth check fails
      }
    };

    if (userInfo) {
      if (userInfo?.role === "admin") {
        getMe();
        pricingStatusBulkUpdateApi();
      }

      if (userInfo?.role === "employee") {
        getMeEmployee();
        pricingStatusBulkUpdateApi();
      }

      // Sync profile and permissions on page reload (only once)
      syncProfileAndPermissions();
    }

    getConfigData();

    return () => {
      ignore = true;
    };
  }, [dispatch, navigate, pathname]);

  return null;
};
