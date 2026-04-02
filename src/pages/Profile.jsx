import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  useUpdateUserProfileMutation,
  useGetMeQuery,
  useGetMeEmployeeQuery,
} from "../redux/userApiSlice";
import { setCredentials } from "../redux/userSlice";
import { FileUpload } from "../uploadWidget/FileUpload";
import { fetchUserPermissions } from "../redux/permissionSlice";
import { sanitizeInput, validateAvatarUrl } from "../utils/sanitize";


export const Profile = () => {
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state?.user?.userInfo);
  const permissionLoading = useSelector((state) => state.permission.loading);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(sanitizeInput(currentUser?.name));
  const [email, setEmail] = useState(sanitizeInput(currentUser?.email));
  const [avatar, setAvatar] = useState(currentUser?.avatar);

  const [updateUserProfile, { isLoading: saveProfileLoading }] =
    useUpdateUserProfileMutation();

  // Auto-fetch profile data when component mounts (page opens)
  const { data: adminProfile, isLoading: adminLoading } = useGetMeQuery(
    undefined,
    { skip: currentUser?.role !== "admin" }
  );

  const { data: employeeProfile, isLoading: employeeLoading } = useGetMeEmployeeQuery(
    undefined,
    { skip: currentUser?.role !== "employee" }
  );

  useEffect(() => {
    // Sync profile data from API response when page loads
    // IMPORTANT: Preserve the token from existing currentUser
    if (adminProfile?.data) {
      dispatch(setCredentials({
        ...adminProfile.data,
        token: currentUser?.token
      }));
    }
    if (employeeProfile?.data) {
      dispatch(setCredentials({
        ...employeeProfile.data,
        token: currentUser?.token
      }));
    }
  }, [adminProfile, employeeProfile, dispatch, currentUser?.token]);

  useEffect(() => {
    // Sync permissions when profile page opens
    if (currentUser?._id) {
      dispatch(fetchUserPermissions(currentUser._id));
    }
  }, [currentUser?._id, dispatch]);

  // Update local state when currentUser changes (after sync)
  useEffect(() => {
    setName(currentUser?.name);
    setEmail(currentUser?.email);
    setAvatar(currentUser?.avatar);
  }, [currentUser]);

  const validate = () => {
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedAvatar = sanitizeInput(avatar);

    if (!sanitizedName || !sanitizedEmail || !sanitizedAvatar) {
      toast.error("All fields are required");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      toast.error("Invalid email");
      return false;
    }

    // avatar should be a valid URL
    if (!/^(ftp|http|https):\/\/[^ "]+$/.test(sanitizedAvatar)) {
      toast.error("Invalid avatar URL");
      return false;
    }

    // Block SVG avatar URLs (XSS prevention)
    if (!validateAvatarUrl(sanitizedAvatar)) {
      toast.error("SVG avatars are not allowed");
      return false;
    }

    return true;
  };

  const handleSaveProfile = async () => {
    if (!validate()) return;

    try {
      const res = await updateUserProfile({
        _id: currentUser?._id,
        name: sanitizeInput(name),
        email: sanitizeInput(email),
        avatar: sanitizeInput(avatar),
      }).unwrap();
      // Preserve the token when updating user data
      dispatch(setCredentials({
        ...res.data,
        token: currentUser?.token
      }));
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.data?.message ||
        error?.message ||
        error?.error ||
        "An error occurred"
      );
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setName(currentUser?.name);
    setEmail(currentUser?.email);
    setAvatar(currentUser?.avatar);
  };

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChangeCancel = () => {
    setIsChangingPassword(false);
    setPassword("");
    setConfirmPassword("");
  };

  const passwordValidate = () => {
    if (!password || !confirmPassword) {
      toast.error("All fields are required");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!passwordValidate()) return;

    try {
      const res = await updateUserProfile({
        _id: currentUser?._id,
        password: sanitizeInput(password),
      }).unwrap();
      // Preserve the token when updating user data
      dispatch(setCredentials({
        ...res.data,
        token: currentUser?.token
      }));
      toast.success("Password updated successfully");
      setIsChangingPassword(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.data?.message ||
        error?.message ||
        error?.error ||
        "An error occurred"
      );
    }
  };

  const handleSyncPermission = async () => {
    try {
      if (!currentUser?._id) {
        toast.error("User ID not found");
        return;
      }

      await dispatch(fetchUserPermissions(currentUser._id)).unwrap();

      toast.success("Permissions synced successfully");
    } catch (error) {
      toast.error(error || "Failed to sync permissions");
    }
  };


  return (
    <>
      <div className="flex justify-start items-center flex-col gap-4 w-full">
        <div className="flex justify-start items-center flex-col gap-4 w-full">
          {/* page header */}
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">User Profile</h1>
            </div>
          </div>
          {/* current user profile */}
          <div className="flex justify-center w-full items-center py-4 gap-4 flex-wrap flex-col">
            {/* Avatar */}
            <div className="flex justify-center items-center gap-4 w-full max-w-sm ">
              <img
                src={avatar}
                alt="Avatar"
                className="w-32 h-32 rounded-full border-2"
              />
            </div>
            <div className="flex flex-col w-full max-w-sm gap-2">
              <div className="flex justify-center gap-2 w-full">
                <span className="font-bold">Name: </span>
                <span>{currentUser?.name}</span>
              </div>
              <div className="flex justify-center gap-2 w-full">
                <span className="font-bold">Email: </span>
                <span>{currentUser?.email}</span>
              </div>
            </div>
            <div className="flex justify-center items-center gap-4 w-full max-w-sm mt-4">

              <button
                className={`bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded ${permissionLoading || adminLoading || employeeLoading
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                  }`}
                onClick={handleSyncPermission}
                disabled={permissionLoading || adminLoading || employeeLoading}
              >
                {permissionLoading || adminLoading || employeeLoading
                  ? "Syncing..."
                  : "Sync Permission"}
              </button>

              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex justify-center items-center gap-2 w-32"
                onClick={() => {
                  setIsEditing(true);
                  handlePasswordChangeCancel();
                }}
              >
                Edit Profile
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded flex justify-center items-center gap-2"
                onClick={() => {
                  setIsChangingPassword(true);
                  handleEditCancel();
                }}
              >
                Change Password
              </button>
            </div>
          </div>
          {/* user profile edit */}
          {isEditing && (
            <div className="flex justify-center w-full items-center py-4 gap-4 flex-wrap flex-col">
              {/* Name */}
              <div className="flex justify-center items-center gap-4 w-full max-w-sm">
                <input
                  type="text"
                  className="block outline-none w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(sanitizeInput(e.target.value))}
                />
              </div>
              {/* Email */}
              <div className="flex justify-center items-center gap-4 w-full max-w-sm">
                <input
                  type="email"
                  className="block outline-none w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(sanitizeInput(e.target.value))}
                />
              </div>
              {/* avatar */}
              <div className="flex justify-center items-center gap-4 w-full max-w-sm">
                <input
                  type="text"
                  className="block outline-none w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Avatar"
                  value={avatar}
                  onChange={(e) => setAvatar(sanitizeInput(e.target.value))}
                  onPaste={(e) => {
                    const pastedValue = e.clipboardData.getData("text");
                    if (!validateAvatarUrl(pastedValue)) {
                      e.preventDefault();
                      toast.error("SVG avatars are not allowed");
                    }
                  }}
                />
                <FileUpload
                  onSetFileUrl={setAvatar}
                  type="single-image"
                  page="modal-form"
                />
              </div>
              {/* Save Button */}
              <div className="flex justify-center items-center gap-4 w-full max-w-sm">
                <button
                  className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex justify-center items-center gap-2 w-32 ${saveProfileLoading ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  onClick={handleSaveProfile}
                  disabled={saveProfileLoading}
                >
                  Save
                </button>
                <button
                  className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex justify-center items-center gap-2 w-32`}
                  onClick={handleEditCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {/* password change */}
          {isChangingPassword && (
            <div className="flex justify-center w-full items-center py-4 gap-4 flex-wrap flex-col">
              {/* Password */}
              <div className="flex justify-center items-center gap-4 w-full max-w-sm">
                <input
                  type="password"
                  className="block outline-none w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(sanitizeInput(e.target.value))}
                />
              </div>
              {/* Confirm Password */}
              <div className="flex justify-center items-center gap-4 w-full max-w-sm">
                <input
                  type="password"
                  className="block outline-none w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(sanitizeInput(e.target.value))}
                />
              </div>
              {/* Save Button */}
              <div className="flex justify-center items-center gap-4 w-full max-w-sm">
                <button
                  className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex justify-center items-center gap-2 ${saveProfileLoading ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  onClick={handleResetPassword}
                  disabled={saveProfileLoading}
                >
                  Change Password
                </button>
                <button
                  className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex justify-center items-center gap-2 ${saveProfileLoading ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  onClick={handlePasswordChangeCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
