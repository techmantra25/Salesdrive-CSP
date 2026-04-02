import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  useForgotPasswordMutation,
  useLoginMutation,
} from "../redux/userApiSlice";
import { setCredentials } from "../redux/userSlice";
import { useQuery } from "../hooks/useQuery";
import { fetchUserPermissions } from "../redux/permissionSlice";
import { sanitizeInput } from "../utils/sanitize";




export const SignIn = () => {
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const query = useQuery();
  const modeQuery = query.get("mode");
  const emailQuery = query.get("email");
  const passwordQuery = query.get("password");

  const [email, setEmail] = useState(sanitizeInput(emailQuery) ?? "");
  const [password, setPassword] = useState(sanitizeInput(passwordQuery) ?? "");
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading }] = useLoginMutation();
  const [forgotPassword, { isLoading: isLoadingPassword }] =
    useForgotPasswordMutation();

  const validate = () => {
    console.log("Userrrrrrrrrr")
    if (email.trim() === "" || password.trim() === "") {
      toast.error("Invalid email or password");
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!email.match(emailRegex)) {
      toast.error("Invalid email address");
      return false;
    }

    return true;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;

  try {
    const res = await login({ email, password }).unwrap();

    const userData = res.data;
    console.log("USer Data111 " , userData);

    dispatch(setCredentials({ ...userData }));
    dispatch(fetchUserPermissions({ ...userData }));


    toast.success("Login Successful",userData);

    navigate("/");

  } catch (error) {
    toast.error(
      error?.data?.message ||
        error?.message ||
        error?.error ||
        "An error occurred"
    );
  }
};

// console.log("Email",emailQuery)
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const sanitizedEmail = sanitizeInput(email);
    if (sanitizedEmail.trim() === "") {
      toast.error("Please enter your email");
      return;
    }

    try {
      const res = await forgotPassword({ email: sanitizedEmail }).unwrap();
      toast.success(res.message);
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          error?.error ||
          "An error occurred"
      );
    }
  };

  useEffect(() => {
    if (!modeQuery) {
      navigate("/sign-in?mode=admin");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeQuery]);

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="container flex items-center justify-center px-6 mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          ADMIN LOGIN
        </h1>
      </div>
      <div className="container flex items-center justify-center px-6 mx-auto">
        <form className="w-full max-w-md" onSubmit={handleSubmit}>
          <div className="flex items-center justify-center mt-6">
            <Link
              to={"/sign-in"}
              className="w-1/3 pb-4 font-medium text-center text-gray-500 capitalize dark:text-gray-300 border-b-2 border-blue-500 dark:border-blue-400"
            >
              sign in
            </Link>
          </div>

          <div className="relative flex items-center mt-6">
            <span className="absolute left-3">
              <svg
                className="w-6 h-6 text-gray-300 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </span>

            <input
              type="email"
              className="block w-full py-3 px-11 text-gray-700 bg-white border rounded-lg dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:ring-blue-300 focus:outline-none"
              placeholder="Email address"
              value={email}
              onChange={(e) => {setEmail(sanitizeInput(e.target.value)),console.log("E",e.target.value)}}
            />
          </div>

          <div className="relative flex items-center mt-4">
            <span className="absolute left-3">
              <svg
                className="w-6 h-6 text-gray-300 dark:text-gray-500"
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
              className="block w-full py-3 px-10 text-gray-700 bg-white border rounded-lg dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:ring-blue-300 focus:outline-none"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(sanitizeInput(e.target.value))}
            />

            <span
              className="absolute right-3 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FaRegEye className="text-gray-300 dark:text-gray-500 w-6 h-6" />
              ) : (
                <FaRegEyeSlash className="text-gray-300 dark:text-gray-500 w-6 h-6" />
              )}
            </span>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className={`w-full px-6 py-3 text-sm font-medium text-white capitalize bg-blue-500 rounded-lg hover:bg-blue-400 transition duration-300 ${
                isLoading &&
                "opacity-70 cursor-not-allowed"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>

            {/* {modeQuery === "admin" && (
              <div className="mt-6 text-center">
                <button
                  className={`text-sm text-blue-500 dark:text-blue-400 ${
                    isLoadingPassword ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                  onClick={handleForgotPassword}
                  disabled={isLoadingPassword}
                >
                  {isLoadingPassword ? "Sending Email..." : "Forgot Password?"}
                </button>
              </div>
            )} */}
          </div>
        </form>
      </div>
    </section>
  );
};
