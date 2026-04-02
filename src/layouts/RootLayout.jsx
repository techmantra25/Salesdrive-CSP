import { Outlet } from "react-router-dom";
import { ScrollToTop } from "../components/ScrollToTop";
import { MainNav } from "../components/MainNav";

export const RootLayout = () => {
  return (
    <>
      <ScrollToTop>
        <div className="bg-white dark:bg-gray-900 min-h-screen">
          <div className="max-w-6xl m-auto">
            <MainNav />
            <Outlet />
          </div>
        </div>
      </ScrollToTop>
    </>
  );
};
