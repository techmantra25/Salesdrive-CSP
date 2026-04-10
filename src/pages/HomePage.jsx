import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export const HomePage = () => {
  const { config } = useSelector((state) => state.config);
  const { commonSettings, functionalSettings } = config || {};
  const { companyName, companyLogo } = commonSettings || {};

  const approval_stage =
    functionalSettings?.need_employee_approval_for_po || "admin approval";

  return (
    <div className="container px-4 py-16 mx-auto">
      <div className="items-center lg:flex">
        {/* Left Section */}
        <div className="w-full lg:w-1/2">
          <div className="lg:max-w-lg">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-6">
              Welcome to{" "}
              <span className="text-blue-500">{companyName} CENTRAL SALES PORTAL</span>
            </h1>

            {/* Login Buttons with enhanced styling */}
            <div className="flex flex-col mt-6 space-y-3 lg:space-y-0 lg:flex-row gap-4">
              <Link
                to="/sign-in?mode=admin"
                className="w-full lg:w-auto px-8 py-3 text-sm font-semibold tracking-wide uppercase transition duration-300 ease-in-out text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
              >
                Admin Login
              </Link>
              {approval_stage === "agent approval" && (
                <Link
                  to="/sign-in?mode=employee"
                  className="w-full lg:w-auto px-8 py-3 text-sm font-semibold tracking-wide uppercase transition duration-300 ease-in-out text-white bg-blue-600 hover:bg-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-xl shadow-lg flex items-center justify-center"
                >
                  Employee Login
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Logo with modern styling */}
        <div className="flex items-center justify-end w-full mt-6 lg:mt-0 lg:w-1/2">
          <div className="max-w-md rounded-2xl shadow-xl overflow-hidden">
            <img
              className="w-full h-auto object-cover"
              src={companyLogo}
              alt="Company Logo"
              width={300}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
