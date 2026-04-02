import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useUpdateUserProfileMutation } from "../../redux/userApiSlice";
import toast from "react-hot-toast";
import { setCredentials } from "../../redux/userSlice";
import { FileUpload } from "../../uploadWidget/FileUpload";
import { Badge } from "flowbite-react";

const EmployeeProfile = () => {
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state?.user?.userInfo);

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(currentUser ?? {});
  const [avatar, setAvatar] = useState(currentUser?.avatar);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [updateUserProfile, { isLoading: saveProfileLoading }] =
    useUpdateUserProfileMutation();

  const validate = () => {
    if (!profileData?.name) {
      toast.error("Name is required");
      return false;
    }

    return true;
  };

  const handleSaveProfile = async () => {
    if (!validate()) return;

    try {
      const res = await updateUserProfile({
        _id: currentUser?._id,
        name: profileData?.name,
      }).unwrap();
      dispatch(setCredentials({ ...res.data }));
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
    setProfileData(currentUser);
    setAvatar(currentUser?.avatar);
  };

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
        password,
      }).unwrap();
      dispatch(setCredentials({ ...res.data }));
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
              <div className="flex gap-2 justify-center w-full">
                <span className="font-bold min-w-fit">Associated Brands: </span>

                {profileData?.brandId?.map((brand) => (
                  <span
                    key={brand?._id}
                    className="flex gap-2 items-center justify-center min-w-fit"
                  >
                    {brand?.name}
                    {", "}
                  </span>
                ))}
              </div>
              <div className="flex justify-center gap-2 w-full">
                <span className="font-bold">Area: </span>
                {profileData?.area?.map((area) => (
                  <span
                    key={area}
                    className="flex gap-2 items-center justify-center"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-center items-center gap-4 w-full max-w-sm mt-4">
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
                  value={profileData?.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-center items-center gap-4 w-full max-w-sm">
                <input
                  type="text"
                  className="block outline-none w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Employee Id"
                  value={profileData?.empId}
                  disabled
                />
              </div>
              {/* Email */}
              <div className="flex justify-center items-center gap-4 w-full max-w-sm">
                <input
                  type="text"
                  className="block outline-none w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Designation"
                  value={profileData?.desgId?.name}
                  disabled
                />
              </div>
              <div className="flex justify-center items-center gap-4 w-full max-w-sm">
                <input
                  type="text"
                  className="block outline-none w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Region"
                  value={profileData?.regionId?.name}
                  disabled
                />
              </div>
              {/* avatar */}
              {/* <div className="flex justify-center items-center gap-4 w-full max-w-sm">
                <input
                  type="text"
                  className="block outline-none w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Avatar"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                />
                <FileUpload
                  onSetFileUrl={setAvatar}
                  type="single-image"
                  page="modal-form"
                />
              </div> */}
              {/* Save Button */}
              <div className="flex justify-center items-center gap-4 w-full max-w-sm">
                <button
                  className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex justify-center items-center gap-2 w-32 ${
                    saveProfileLoading ? "cursor-not-allowed opacity-50" : ""
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
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {/* Confirm Password */}
              <div className="flex justify-center items-center gap-4 w-full max-w-sm">
                <input
                  type="password"
                  className="block outline-none w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {/* Save Button */}
              <div className="flex justify-center items-center gap-4 w-full max-w-sm">
                <button
                  className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex justify-center items-center gap-2 ${
                    saveProfileLoading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  onClick={handleResetPassword}
                  disabled={saveProfileLoading}
                >
                  Change Password
                </button>
                <button
                  className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex justify-center items-center gap-2 ${
                    saveProfileLoading ? "cursor-not-allowed opacity-50" : ""
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

export default EmployeeProfile;
