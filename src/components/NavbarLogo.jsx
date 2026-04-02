import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export const NavbarLogo = () => {
    const { config } = useSelector((state) => state.config);
    const { commonSettings } = config || {};
    const { companyLogo } = commonSettings || {};
  return (
    <>
      <Link
        to={"/"}
        className="flex justify-center items-center gap-4 dark:text-white"
      >
        <img
          className="w-auto h-10 sm:h-8 rounded-lg"
          src={companyLogo}
          alt="logo"
        />
        <p className="text-2xl font-bold">CSP</p>
      </Link>
    </>
  );
};
