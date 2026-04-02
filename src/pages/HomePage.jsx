import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export const HomePage = () => {
  const { config } = useSelector((state) => state.config);
  const { commonSettings, functionalSettings } = config || {};
  const { companyName, companyLogo } = commonSettings || {};

  const approval_stage =
    functionalSettings?.need_employee_approval_for_po || "admin approval";

  return (
    <div className="container px-6 py-16 mx-auto">
      <div className="items-center lg:flex">
        {/* Left Section */}
        <div className="w-full lg:w-1/2">
          <div className="lg:max-w-lg">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-800 dark:text-white">
              Welcome to{" "}
              <span className="text-blue-500">
                {companyName} CENTRAL SALES PORTAL
              </span>
            </h1>

            {/* Login Buttons */}
            <div className="flex flex-col mt-6 space-y-3 lg:space-y-0 lg:flex-row gap-4">
              <Link
                to="/sign-in?mode=admin"
                className="w-full lg:w-auto px-6 py-2.5 text-sm font-medium tracking-wide uppercase transition duration-300 ease-in-out 
                  text-gray-900 dark:text-white bg-white dark:bg-gray-800 
                  rounded-lg shadow hover:bg-gray-100 dark:hover:bg-gray-700 
                  flex items-center justify-center"
              >
                Admin Login
              </Link>
              {approval_stage === "agent approval" && (
                <Link
                  to="/sign-in?mode=employee"
                  className="w-full lg:w-auto px-6 py-2.5 text-sm font-medium tracking-wide uppercase transition duration-300 ease-in-out 
                  text-white bg-blue-600 hover:bg-blue-500 
                  dark:bg-blue-700 dark:hover:bg-blue-600 
                  rounded-lg shadow flex items-center justify-center"
                >
                  Employee Login
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Logo */}
        <div className="flex items-center justify-end w-full mt-6 lg:mt-0 lg:w-1/2">
          <img
            className="max-w-md rounded-lg"
            src={companyLogo}
            alt="Company Logo"
            width={300}
          />
        </div>
      </div>
    </div>
  );
};
