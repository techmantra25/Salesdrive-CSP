import { Link } from "react-router-dom";

export const NotFound = () => {
  return (
    <>
      <div className="flex justify-start items-center flex-col gap-4 w-full min-h-screen pt-20 pb-10 dark:bg-slate-900">
        <div className="flex justify-start items-center flex-col gap-8 w-full max-w-6xl p-4">
          <h1 className="text-3xl font-bold dark:text-white">Page Not Found</h1>
          <div className="flex justify-center items-center gap-4">
            <Link
              to={"/"}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:bg-blue-400"
            >
              Go Home
            </Link>
            <Link
              onClick={() => window.history.back()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:bg-blue-400"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
