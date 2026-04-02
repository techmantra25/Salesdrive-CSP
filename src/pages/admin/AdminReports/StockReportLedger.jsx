import { Button, Card, Label } from "flowbite-react";
import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import { RiRefreshFill } from "react-icons/ri";
import Datepicker from "react-tailwindcss-datepicker";
import SearchableSelect from "../../../components/SearchableSelect";
import { fetchDistributors } from "../../../redux/distributorListSlice";
import { BACKEND_URL } from "../../../constants";
import toast from "react-hot-toast";
import { fetchBrands } from "../../../redux/brandSlice";
import { useDispatch, useSelector } from "react-redux";
import { getPagePermission } from "../../../utils/permissionHelper";
import { downloadFile } from "../../../utils/downloadFile";

const StockReportLedger = () => {
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const [selectedDistributors, setSelectedDistributors] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  const dispatch = useDispatch();

  const { distributors } = useSelector((state) => state.distributors);

  const { brands } = useSelector((state) => state.brand);
  const activeBrands = brands.filter((brand) => brand.status === true);

  // ✅ Permission state
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  useEffect(() => {
    if (!permissionState?.data?.data) return;

    const slug = "stock-ledger";

    const permission = getPagePermission(permissionState, slug);

    setPagePermission(permission);
  }, [permissionState]);

  const handleDistributorChange = (e) => {
    setSelectedDistributors(e.target.value);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleResetFilter = () => {
    setDateRange({
      startDate: null,
      endDate: null,
    });
    setSelectedBrands([]);
    setSelectedDistributors([]);
  };

  const downloadLedger = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error("Please select a Date Range");
      return;
    }

    const query = {};

    if (dateRange.startDate && dateRange.endDate) {
      query.startDate = dateRange.startDate;
      query.endDate = dateRange.endDate;
    }

    if (selectedDistributors.length > 0) {
      if (selectedDistributors.includes("all")) {
        query.distributorIds = "all";
      } else {
        query.distributorIds = selectedDistributors.join(",");
      }
    }

    if (selectedBrands.length > 0) {
      if (selectedBrands.includes("all")) {
        query.brandIds = "all";
      } else {
        query.brandIds = selectedBrands.join(",");
      }
    }

    const params = new URLSearchParams(query).toString();

    const url = `${BACKEND_URL}/api/v1/db-transaction/transaction-stock-ledger-report`;

    // window.open(url, "_blank");

    // Use downloadFile utility for CSV export
    downloadFile({
      url: url,
      queryParams: params,
      fileName: "stock-ledger-report.csv",
    });
  };

  useEffect(() => {
    dispatch(fetchDistributors());

    dispatch(fetchBrands());
  }, [dispatch]);

  return (
    <>
      {/* ✅ Page visible only if view permission */}
      {pagePermission?.view && (
        <div className="flex justify-start items-center flex-col w-full ">
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Stock Ledger</h1>
            </div>
          </div>

          <div className="flex justfy-start items-center flex-col gap-4 w-full p-4">
            <Card
              style={{ overflow: "visible" }}
              className="flex justify-center items-center flex-col w-full"
            >
              <div className="flex justify-center w-full items-end gap-2 flex-wrap ">
                {/* Brands Filter */}

                <div className="w-56">
                  <Label value="Select Brands" />

                  <SearchableSelect
                    id="brandId"
                    options={activeBrands}
                    value={selectedBrands}
                    onChange={(e) => setSelectedBrands(e.target.value)}
                    placeholder="Select Brands"
                    displayKey="name"
                    valueKey="_id"
                    descKey="desc"
                    multiple={true}
                  />
                </div>

                {/* Distributor Filter */}

                <div className="w-56">
                  <Label value="Select Distributor" />

                  <SearchableSelect
                    id="distributor-select"
                    options={distributors}
                    value={selectedDistributors}
                    onChange={handleDistributorChange}
                    placeholder="Select Distributor(s)"
                    displayKey="name"
                    descKey="dbCode"
                    valueKey="_id"
                    multiple
                  />
                </div>

                {/* Date Filter */}

                <div className="w-64">
                  <div className="block">
                    <Label htmlFor="dateRangeSelect" value="Filter by Date" />
                  </div>

                  <Datepicker
                    containerClassName="relative"
                    popoverDirection="down"
                    showShortcuts={true}
                    value={dateRange}
                    onChange={handleDateRangeChange}
                  />
                </div>
              </div>

              {/* Buttons */}

              <div className="flex justify-center items-center gap-2 w-full mt-4">
                {/* Reset Button */}

                {pagePermission?.view && (
                  <Button
                    className="text-xs"
                    size="sm"
                    color="success"
                    onClick={handleResetFilter}
                  >
                    <span className="flex justify-center items-center gap-2">
                      <RiRefreshFill size={20} />
                      Reset & Refresh
                    </span>
                  </Button>
                )}

                {/* Download Button */}

                {pagePermission?.view && (
                  <Button
                    className="text-xs"
                    color="blue"
                    size="sm"
                    onClick={downloadLedger}
                  >
                    <FaDownload size={15} className="mx-2" />
                    Download Ledger
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default StockReportLedger;
