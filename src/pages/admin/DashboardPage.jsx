import { Button, Card } from "flowbite-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DashBoardStats, pricingStatusBulkUpdate } from "../../api/api";
import { fetchCategories } from "../../redux/categorySlice";
import { fetchCollections } from "../../redux/collectionSlice";
import { fetchDistributors } from "../../redux/distributorListSlice";
import { fetchProducts } from "../../redux/productSlice";
import { fetchRegions } from "../../redux/regionSlice";
import { fetchStates } from "../../redux/stateSlice";
import { fetchZones } from "../../redux/zoneSlice";
import { fetchDesignations } from "../../redux/designationSlice";
import { fetchBeats } from "../../redux/beatSlice";
import { fetchBrands } from "../../redux/brandSlice";
import { LuDatabaseBackup } from "react-icons/lu";

export const DashboardPage = () => {
  const { userInfo } = useSelector((state) => state.user);
  const role = userInfo?.role;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [dataStats, setDataStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pricingStatusBulkUpdate();
    getDashboardData();
    dispatch(fetchCategories());
    dispatch(fetchCollections());
    // dispatch(fetchProducts());
    dispatch(fetchRegions());
    dispatch(fetchZones());
    dispatch(fetchStates());
    dispatch(fetchDistributors());
    dispatch(fetchDesignations());
    dispatch(fetchBeats());
    dispatch(fetchBrands());
  }, [dispatch]);

  async function getDashboardData() {
    try {
      setLoading(true);
      let res = await DashBoardStats();
      setDataStats(res?.data?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  const getGreetingName = () => {
    
    if (role === "admin") return "Super Admin";
    
    if (role === "admine") return "Admin";

    if (role.includes("sub-admins")) return "Sub Admin";

    if (role === "user") return "User";

    if (role === "sales") return "Sales";

    return "User";
  };


  return (
    <>
      <div className="flex justify-start items-center flex-col gap-4 w-full">
        <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
          <h1 className="text-3xl font-bold">
            Hi {getGreetingName()} 👋
          </h1>


        </div>
        <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
          <div className="flex gap-4 justify-center items-center flex-wrap">
            {loading && (
              <>
                {Array(11)
                  .fill(0)
                  .map((_, index) => (
                    <div className="animate-pulse" key={index}>
                      <Card className="w-64">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </Card>
                    </div>
                  ))}
              </>
            )}
            {!loading && (
              <>
                <Card
                  className="w-64 cursor-pointer"
                  onClick={() => {
                    navigate(`/${role}/zone`);
                  }}
                >
                  <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Total Zone
                  </h5>
                  <p className="font-bold text-xl text-gray-700 dark:text-gray-400">
                    {dataStats?.ZoneCount}
                  </p>
                </Card>
                <Card
                  className="w-64 cursor-pointer"
                  onClick={() => {
                    navigate(`/${role}/region`);
                  }}
                >
                  <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Total Region
                  </h5>
                  <p className="font-bold text-xl text-gray-700 dark:text-gray-400">
                    {dataStats?.RegionCount}
                  </p>
                </Card>
                <Card
                  className="w-64 cursor-pointer"
                  onClick={() => {
                    navigate(`/${role}/state`);
                  }}
                >
                  <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Total State
                  </h5>
                  <p className="font-bold text-xl text-gray-700 dark:text-gray-400">
                    {dataStats?.StateCount}
                  </p>
                </Card>
                <Card
                  className="w-64 cursor-pointer"
                  onClick={() => {
                    navigate(`/${role}/brand`);
                  }}
                >
                  <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Total Brand
                  </h5>
                  <p className="font-bold text-xl text-gray-700 dark:text-gray-400">
                    {dataStats?.BrandCount}
                  </p>
                </Card>
                <Card
                  className="w-64 cursor-pointer"
                  onClick={() => {
                    navigate(`/${role}/category`);
                  }}
                >
                  <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Total Category
                  </h5>
                  <p className="font-bold text-xl text-gray-700 dark:text-gray-400">
                    {dataStats?.CategoryCount}
                  </p>
                </Card>
                <Card
                  className="w-64 cursor-pointer"
                  onClick={() => {
                    navigate(`/${role}/collection`);
                  }}
                >
                  <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Total Collection
                  </h5>
                  <p className="font-bold text-xl text-gray-700 dark:text-gray-400">
                    {dataStats?.CollectionCount}
                  </p>
                </Card>
                <Card
                  className="w-64 cursor-pointer"
                  onClick={() => {
                    navigate(`/${role}/products`);
                  }}
                >
                  <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Total Products
                  </h5>
                  <p className="font-bold text-xl text-gray-700 dark:text-gray-400">
                    {dataStats?.ProductCount}
                  </p>
                </Card>
                <Card
                  className="w-64 cursor-pointer"
                  onClick={() => {
                    navigate(`/${role}/pricing`);
                  }}
                >
                  <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Total Pricing
                  </h5>
                  <p className="font-bold text-xl text-gray-700 dark:text-gray-400">
                    {dataStats?.PriceCount}
                  </p>
                </Card>
                <Card
                  className="w-64 cursor-pointer"
                  onClick={() => {
                    navigate(`/${role}/distributer`);
                  }}
                >
                  <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Total Distributors
                  </h5>
                  <p className="font-bold text-xl text-gray-700 dark:text-gray-400">
                    {dataStats?.distributorCount}
                  </p>
                </Card>
                <Card
                  className="w-64 cursor-pointer"
                  onClick={() => {
                    navigate(`/${role}/designation`);
                  }}
                >
                  <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Total Designations
                  </h5>
                  <p className="font-bold text-xl text-gray-700 dark:text-gray-400">
                    {dataStats?.DesignationCount}
                  </p>
                </Card>
                <Card
                  className="w-64 cursor-pointer"
                  onClick={() => {
                    navigate(`/${role}/employee`);
                  }}
                >
                  <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Total Employees
                  </h5>
                  <p className="font-bold text-xl text-gray-700 dark:text-gray-400">
                    {dataStats?.EmployeeCount}
                  </p>
                </Card>
                <Card
                  className="w-64 cursor-pointer"
                  onClick={() => {
                    navigate(`/${role}/beat-mapping`);
                  }}
                >
                  <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Total Mapped Beats
                  </h5>
                  <p className="font-bold text-xl text-gray-700 dark:text-gray-400">
                    {dataStats?.BeatCount}
                  </p>
                </Card>
                <Card
                  className="w-64 cursor-pointer"
                  onClick={() => {
                    navigate(`/${role}/outlet-list`);
                  }}
                >
                  <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Total Outlets
                  </h5>
                  <p className="font-bold text-xl text-gray-700 dark:text-gray-400">
                    {dataStats?.OutletCount}
                  </p>
                </Card>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
};
