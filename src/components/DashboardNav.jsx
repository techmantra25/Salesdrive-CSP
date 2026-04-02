import { useContext, useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { GoMoon, GoSun } from "react-icons/go";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ContextProvider";
import { DashboardSidebar } from "./DashboardSidebar";
import { NavbarLogo } from "./NavbarLogo";
import { NotificationBell } from "./common/NotificationBell";

export const DashboardNav = () => {
  const currentUser = useSelector((state) => state?.user?.userInfo);
  const role = currentUser?.role?.toLowerCase();

  const { theme, toggleTheme } = useContext(ThemeContext);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sidebarClose = () => {
    window.innerWidth < 640 && setSidebarOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start gap-2">
              <button
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>
              <NavbarLogo />
            </div>

            <div className="flex items-center gap-4">
              <span
                onClick={toggleTheme}
                className={`cursor-pointer p-2 rounded-full shadow-lg ${
                  theme === "dark" ? "bg-yellow-500" : "bg-blue-500"
                }`}
              >
                {theme === "dark" ? (
                  <GoSun color="white" size={22} />
                ) : (
                  <GoMoon color="white" size={22} />
                )}
              </span>

              {role === "admin" && <NotificationBell />}

              {/* Profile Link */}

              {role === "admin" && (
                <Link to="/admin/profile" className="w-10">
                  <img
                    className="rounded-full"
                    src={currentUser?.avatar}
                    alt="profile"
                  />
                </Link>
              )}
              {role === "admine" && (
                <Link to="/admine/profile" className="w-10">
                  <img
                    className="rounded-full"
                    src={currentUser?.avatar}
                    alt="profile"
                  />
                </Link>
              )}

              {role === "sub-admins" && (
                <Link to="/sub-admins/profile" className="w-10">
                  <img
                    className="rounded-full"
                    src={currentUser?.avatar}
                    alt="profile"
                  />
                </Link>
              )}

              {role === "user" && (
                <Link to="/user/profile" className="w-10">
                  <img
                    className="rounded-full"
                    src={currentUser?.avatar}
                    alt="profile"
                  />
                </Link>
              )}

              {role === "sales" && (
                <Link to="/sales/profile" className="w-10">
                  <img
                    className="rounded-full"
                    src={currentUser?.avatar}
                    alt="profile"
                  />
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebars — All Separate */}

      {role === "admin" && (
        <DashboardSidebar
          sidebarOpen={sidebarOpen}
          onSidebarClose={sidebarClose}
        />
      )}

      {role === "admine" && (
        <DashboardSidebar
          sidebarOpen={sidebarOpen}
          onSidebarClose={sidebarClose}
        />
      )}
      {role === "sub-admins" && (
        <DashboardSidebar
          sidebarOpen={sidebarOpen}
          onSidebarClose={sidebarClose}
        />
      )}

      {role === "user" && (
        <DashboardSidebar
          sidebarOpen={sidebarOpen}
          onSidebarClose={sidebarClose}
        />
      )}

      {role === "sales" && (
        <DashboardSidebar
          sidebarOpen={sidebarOpen}
          onSidebarClose={sidebarClose}
        />
      )}
    </>
  );
};
