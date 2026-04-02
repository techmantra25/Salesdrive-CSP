import { Outlet } from "react-router-dom";
import { ScrollToTop } from "../components/ScrollToTop";
import { DashboardNav } from "../components/DashboardNav";

export const DashboardLayout = () => {
  console.log("DashboardLayout rendered");
  return (
    <>
      <ScrollToTop>
        <DashboardNav />
        <div className="p-4 sm:ml-64 dark:bg-gray-900 dark:text-white min-h-screen">
          <div className="mt-14 mb-14 m-auto">
            <Outlet />
          </div>
        </div>
      </ScrollToTop>
    </>
  );
};
