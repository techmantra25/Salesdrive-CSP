import { useState } from "react";
import toast from "react-hot-toast";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useResetPasswordMutation } from "../redux/userApiSlice";

export const ResetPass = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { resetToken } = useParams();
  const navigate = useNavigate();

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (confirmPassword !== password) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.trim() === "" && confirmPassword.trim() === "") {
      toast.error("Please enter password");
      return;
    }

    try {
      const res = await resetPassword({ password, resetToken }).unwrap();
      toast.success(res.message);
      navigate("/sign-in");
    } catch (error) {
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
      <section className="bg-white dark:bg-gray-900">
        <div className="container flex items-center justify-center px-6 mx-auto">
          <form className="w-full max-w-md">
            <div className="flex items-center justify-center mt-6">
              <div className="w-1/3 pb-4 font-medium text-center text-gray-500 capitalize  dark:text-gray-300 border-b-2 border-blue-500 dark:border-blue-400">
                Reset Password
              </div>
            </div>

            {/* password */}
            <div className="relative flex items-center mt-4">
              <span className="absolute">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 mx-3 text-gray-300 dark:text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>

              <input
                type={showPassword ? "text" : "password"}
                className="block w-full px-10 py-3 text-gray-700 bg-white border rounded-lg dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <span
                className="absolute right-0 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {!showPassword ? (
                  <FaRegEyeSlash className="text-gray-300 dark:text-gray-500 w-6 h-6 mx-3" />
                ) : (
                  <FaRegEye className="text-gray-300 dark:text-gray-500 w-6 h-6 mx-3" />
                )}
              </span>
            </div>

            {/* confirm password */}
            <div className="relative flex items-center mt-6">
              <span className="absolute">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 mx-3 text-gray-300 dark:text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>

              <input
                type={showConfirmPassword ? "text" : "password"}
                className="block w-full py-3 text-gray-700 bg-white border rounded-lg px-11 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                className="absolute right-0 cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {!showConfirmPassword ? (
                  <FaRegEyeSlash className="text-gray-300 dark:text-gray-500 w-6 h-6 mx-3" />
                ) : (
                  <FaRegEye className="text-gray-300 dark:text-gray-500 w-6 h-6 mx-3" />
                )}
              </span>
            </div>

            <div className="mt-6">
              <button
                className={`w-full px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50 ${
                  isLoading && "opacity-70 cursor-not-allowed"
                }`}
                onClick={handleResetPassword}
                disabled={isLoading}
              >
                Reset Password
              </button>

              <div className="mt-6 text-center ">
                <Link
                  to={"/sign-in"}
                  className="text-sm text-blue-500 hover:underline dark:text-blue-400"
                >
                  Remember Password?
                </Link>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};
