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
import {
  FiMap,
  FiGlobe,
  FiLayers,
  FiAward,
  FiGrid,
  FiFolder,
  FiPackage,
  FiDollarSign,
  FiUsers,
  FiBriefcase,
  FiUserPlus,
  FiCrosshair,
  FiShoppingBag,
} from "react-icons/fi";

const cardConfig = [
  { label: "Total Zone", key: "ZoneCount", icon: FiMap, color: "from-blue-500 to-blue-600", route: "zone" },
  { label: "Total Region", key: "RegionCount", icon: FiGlobe, color: "from-indigo-500 to-indigo-600", route: "region" },
  { label: "Total State", key: "StateCount", icon: FiLayers, color: "from-purple-500 to-purple-600", route: "state" },
  { label: "Total Brand", key: "BrandCount", icon: FiAward, color: "from-pink-500 to-pink-600", route: "brand" },
  { label: "Total Category", key: "CategoryCount", icon: FiGrid, color: "from-red-500 to-red-600", route: "category" },
  { label: "Total Collection", key: "CollectionCount", icon: FiFolder, color: "from-orange-500 to-orange-600", route: "collection" },
  { label: "Total Products", key: "ProductCount", icon: FiPackage, color: "from-amber-500 to-amber-600", route: "products" },
  { label: "Total Pricing", key: "PriceCount", icon: FiDollarSign, color: "from-emerald-500 to-emerald-600", route: "pricing" },
  { label: "Total Distributors", key: "distributorCount", icon: FiUsers, color: "from-teal-500 to-teal-600", route: "distributer" },
  { label: "Total Designations", key: "DesignationCount", icon: FiBriefcase, color: "from-cyan-500 to-cyan-600", route: "designation" },
  { label: "Total Employees", key: "EmployeeCount", icon: FiUserPlus, color: "from-sky-500 to-sky-600", route: "employee" },
  { label: "Total Mapped Beats", key: "BeatCount", icon: FiCrosshair, color: "from-violet-500 to-violet-600", route: "beat-mapping" },
  { label: "Total Outlets", key: "OutletCount", icon: FiShoppingBag, color: "from-fuchsia-500 to-fuchsia-600", route: "outlet-list" },
];

const StatCard = ({ label, count, icon: Icon, color, onClick, index }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 60);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-lg transition-all duration-500 cursor-pointer transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{count || 0}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${color} transition-all duration-500 group-hover:w-full w-0`}></div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 shadow-sm animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      </div>
      <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
    </div>
  </div>
);

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleNavigate = (route) => {
    navigate(`/${role}/${route}`);
  };

  return (
    <div className="w-full px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{getGreeting()}</p>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
          {getGreetingName()} <span className="inline-block">👋</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Here's what's happening with your sales pipeline today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {loading
          ? Array.from({ length: 13 }).map((_, i) => <SkeletonCard key={i} />)
          : cardConfig.map((card, index) => (
              <StatCard
                key={card.label}
                index={index}
                label={card.label}
                count={dataStats?.[card.key]}
                icon={card.icon}
                color={card.color}
                onClick={() => handleNavigate(card.route)}
              />
            ))}
      </div>
    </div>
  );
};
