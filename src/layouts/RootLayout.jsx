import { Outlet, useLocation } from "react-router-dom";
import { ScrollToTop } from "../components/ScrollToTop";
import { MainNav } from "../components/MainNav";

export const RootLayout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/sign-in" || location.pathname === "/";

  return (
    <ScrollToTop>
      {/* Navbar only for non-auth pages */}
      {!isAuthPage && <MainNav />}

      {/* Full-width for auth, constrained for app */}
      <div className={isAuthPage ? "" : "max-w-6xl mx-auto"}>
        <Outlet />
      </div>
    </ScrollToTop>
  );
};
