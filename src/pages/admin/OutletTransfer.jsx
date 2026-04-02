import {
  Button,
  Card,
  Label,
  List,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft, FaArrowRight, FaRegEye } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  ApprovedOutletPaginated,
  getDistributorsBeats,
  TransferOutlets,
} from "../../api/api";
import OutLetDetails from "../../components/OutLetDetails";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchDistributors } from "../../redux/distributorListSlice";
import { fetchRegions } from "../../redux/regionSlice";

const OutletTransfer = () => {
  const [transferType, setTransferType] = useState("Transfer");
  const [selectedRegion, setSelectedRegion] = useState("default");
  const [allBeats, setBeats] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState("default");
  const [beatsLoading, setBeatLoading] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState("default");
  const [outlets, setOutlets] = useState([]);
  const [outletsLoading, setOutletsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [rightSelectedOutlets, setRightSelectedOutlets] = useState([]);
  const [rightSelectedIds, setRightSelectedIds] = useState([]);
  const [transferDistributor, setTransferDistributor] = useState("default");
  const [transferBeat, setTransferBeat] = useState("default");
  const [transferBeatOptions, setTransferBeatOptions] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedOutletDetails, setSelectedOutletDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const onCloseModal = () => {
    fetchOutletsPaginated();
    setOpenModal(false);
    setSelectedOutletDetails(null);
  };

  useEffect(() => {
    fetchOutletsPaginated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegion, selectedDistributor, selectedBeat, searchTerm]);

  const { regions, loading: regionsLoading } = useSelector(
    (state) => state.region
  );

  const { distributors, loading: distributorsLoading } = useSelector(
    (state) => state.distributors
  );

  const filteredRegions = regions?.filter(
    (regions) => regions?.status === true
  );

  const filteredDistributors = distributors?.filter(
    (distributors) => distributors?.status === true
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchRegions());
    dispatch(fetchDistributors());
  }, [dispatch, selectedRegion]);

  useEffect(() => {
    let isMount = true;
    if (selectedDistributor !== "default") {
      getBeats(selectedDistributor, isMount, "left");
    }
    return () => {
      isMount = false;
    };
  }, [selectedDistributor]);

  useEffect(() => {
    let isMount = true;
    if (transferDistributor !== "default") {
      getBeats(transferDistributor, isMount, "right");
    }
    return () => {
      isMount = false;
    };
  }, [transferDistributor]);

  const getBeats = async (distributor, isMount, side) => {
    setBeatLoading(true);
    try {
      const res = await getDistributorsBeats(distributor);
      if (isMount) {
        if (side === "left") {
          setBeats(res?.data?.data);
        } else {
          setTransferBeatOptions(res?.data?.data);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setBeatLoading(false);
    }
  };

  let fetchOutletsPaginatedWithOutDebounce = async () => {
    try {
      setOutletsLoading(true);
      const query = {
        page: 1,
        limit: 50,
      };

      if (searchTerm.trim() !== "") {
        query.search = searchTerm;
      }

      if (selectedRegion !== "default") {
        query.regionId = selectedRegion;
      }

      if (selectedDistributor !== "default") {
        query.distributorId = selectedDistributor;
      }

      if (selectedBeat !== "default") {
        query.beatId = selectedBeat;
      }

      const response = await ApprovedOutletPaginated({ ...query });

      let activeOutlets = response?.data?.data?.filter(
        (outlet) => outlet?.status == true
      );

      setOutlets(activeOutlets);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch Outlets"
      );
    } finally {
      setOutletsLoading(false);
    }
  };

  let fetchOutletsPaginated = useDebounce(
    fetchOutletsPaginatedWithOutDebounce,
    500
  );

  const handleCheckboxChange = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRightCheckboxChange = (id) => {
    if (rightSelectedIds.includes(id)) {
      setRightSelectedIds(
        rightSelectedIds.filter((selectedId) => selectedId !== id)
      );
    } else {
      setRightSelectedIds([...rightSelectedIds, id]);
    }
  };

  const handleRightOutlets = () => {
    const selectedOutlets = outlets.filter((outlet) =>
      selectedIds.includes(outlet._id)
    );
    setRightSelectedOutlets([...rightSelectedOutlets, ...selectedOutlets]);
    setOutlets(outlets.filter((outlet) => !selectedIds.includes(outlet._id)));
    setSelectedIds([]);
  };

  const handleLeftOutlets = () => {
    const leftOutlets = rightSelectedOutlets.filter((outlet) =>
      rightSelectedIds.includes(outlet._id)
    );
    setOutlets([...outlets, ...leftOutlets]);
    setRightSelectedOutlets(
      rightSelectedOutlets.filter(
        (outlet) => !rightSelectedIds.includes(outlet._id)
      )
    );
    setRightSelectedIds([]);
  };

  async function handleTransfer() {
    let type = "";

    if (selectedDistributor === transferDistributor) {
      type = "BEAT_To_BEAT";
    }

    if (selectedDistributor !== transferDistributor) {
      type = "DB_TO_DB";
    }

    if (transferDistributor === "default" || transferBeat === "default") {
      toast.error("Please select a transfer distributor or beat");
      return;
    }

    if (selectedDistributor === transferDistributor) {
      if (selectedBeat === transferBeat) {
        toast.error("Please select different beat");
        return;
      }
    }

    let payload = {
      outletType: transferType == "Transfer" ? "transfer" : "copy",
      distributorId: transferDistributor,
      beatId: transferBeat,
      referenceId: rightSelectedOutlets?.map((item) => item?._id),
      transfertype: type,
    };
    try {
      const res = await TransferOutlets(payload);
      if (res?.data?.statusUpdateError) {
        toast.error("Outlets Transfer Failed");
      } else {
        toast.success("Outlets Transferred Successfully");
        setSelectedIds([]);
        setRightSelectedIds([]);
        fetchOutletsPaginated();
        onCloseModal();
      }
    } catch (error) {
      console.error(error);
      toast.error("Outlets Transfer Failed");
    }
  }

  const handleOutletDetails = (outlet) => {
    setSelectedOutletDetails(outlet);
    setOpenModal(true);
  };

  const handleClear = () => {
    setSelectedRegion("default");
    setSelectedDistributor("default");
    setSelectedBeat("default");
  };

  const handleClearRight = () => {
    setTransferDistributor("default");
    setTransferBeat("default");
  };

  const handleCancel = () => {
    setSelectedIds([]);
    setRightSelectedIds([]);
    dispatch(fetchRegions());
    dispatch(fetchDistributors());
    fetchOutletsPaginated();
    setTransferType("Transfer");
    setSelectedBeat("default");
    setSelectedDistributor("default");
    setSelectedRegion("default");
    setRightSelectedOutlets([]);
    setTransferBeat("default");
    setTransferDistributor("default");
    setTransferBeatOptions([]);
  };

  return (
    <div className="flex justify-center items-center flex-col gap-4 w-full">
      <div className="flex justify-between w-full items-center border-b-2 py-4">
        <h1 className="text-2xl font-bold">Outlet Transfer/Copy</h1>
      </div>
      <div>
        <Button.Group>
          <Button
            color={transferType === "Transfer" ? "blue" : "gray"}
            onClick={() => setTransferType("Transfer")}
          >
            Transfer Outlets
          </Button>
          <Button
            color={transferType === "Copy" ? "blue" : "gray"}
            onClick={() => setTransferType("Copy")}
          >
            Copy Outlets
          </Button>
        </Button.Group>
      </div>

      <div className="flex flex-col lg:flex-row justify-center items-center gap-4 w-full p-4">
        <SelectOutLetBox
          selectedIds={selectedIds}
          outlets={outlets}
          outletsLoading={outletsLoading}
          handleCheckboxChange={handleCheckboxChange}
          rightSelectedOutlets={rightSelectedOutlets}
          allBeats={allBeats}
          beatsLoading={beatsLoading}
          selectedBeat={selectedBeat}
          setSelectedBeat={setSelectedBeat}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          regionsLoading={regionsLoading}
          filteredRegions={filteredRegions}
          filteredDistributors={filteredDistributors}
          distributorsLoading={distributorsLoading}
          selectedDistributor={selectedDistributor}
          setSelectedDistributor={setSelectedDistributor}
          handleClear={handleClear}
          handleOutletDetails={handleOutletDetails}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        <div className="flex justify-center flex-col items-center py-4 gap-4">
          <Button
            size={"sm"}
            disabled={selectedIds?.length === 0}
            onClick={handleRightOutlets}
            pill
          >
            <FaArrowRight className="w-5" size={20} />
          </Button>

          <Button
            size={"sm"}
            disabled={rightSelectedIds?.length === 0}
            onClick={handleLeftOutlets}
            pill
          >
            <FaArrowLeft className="w-5" size={20} />
          </Button>
        </div>

        <TransferOutLetBox
          rightSelectedOutlets={rightSelectedOutlets}
          outletsLoading={outletsLoading}
          rightSelectedIds={rightSelectedIds}
          handleRightCheckboxChange={handleRightCheckboxChange}
          allBeats={allBeats}
          beatsLoading={beatsLoading}
          selectedBeat={selectedBeat}
          setSelectedBeat={setSelectedBeat}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          regionsLoading={regionsLoading}
          filteredRegions={filteredRegions}
          filteredDistributors={filteredDistributors}
          distributorsLoading={distributorsLoading}
          selectedDistributor={selectedDistributor}
          setSelectedDistributor={setSelectedDistributor}
          transferDistributor={transferDistributor}
          setTransferDistributor={setTransferDistributor}
          setTransferBeat={setTransferBeat}
          transferBeat={transferBeat}
          transferBeatOptions={transferBeatOptions}
          setTransferBeatOptions={setTransferBeatOptions}
          handleClearRight={handleClearRight}
          handleOutletDetails={handleOutletDetails}
          transferType={transferType}
        />
      </div>

      {rightSelectedOutlets?.length > 0 && (
        <div className="flex justify-center gap-4 w-full p-4 ">
          <div>
            <Button
              color={transferType === "Transfer" ? "blue" : "green"}
              className="text-lg w-48"
              onClick={handleTransfer}
            >
              Complete {transferType === "Transfer" ? "Transfer" : "Copy"}
            </Button>
          </div>
          <div>
            <Button color="red" className="text-lg w-48" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {openModal && (
        <OutLetDetails
          openModal={openModal}
          onCloseModal={onCloseModal}
          selectedOutletDetails={selectedOutletDetails}
          PageType="Outlet"
        />
      )}
    </div>
  );
};

const SelectOutLetBox = ({
  selectedIds,
  outlets,
  outletsLoading,
  handleCheckboxChange,
  rightSelectedOutlets,
  allBeats,
  beatsLoading,
  selectedBeat,
  setSelectedBeat,
  selectedRegion,
  setSelectedRegion,
  regionsLoading,
  filteredRegions,
  filteredDistributors,
  distributorsLoading,
  selectedDistributor,
  setSelectedDistributor,
  handleClear,
  handleOutletDetails,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="flex justify-center flex-col items-center py-4">
      <Card className="flex border-b-2 py-4">
        <div className="flex justify-center items-center gap-2 w-full flex-wrap">
          <div>
            <div className="mb-2 block">
              <Label
                htmlFor="regionSelect"
                className="text-sm"
                value="Select Region"
              />
            </div>
            <Select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              id="regionSelect"
              className="w-40"
              required
            >
              <option value="default">All</option>
              {regionsLoading ? (
                <option value="default">Loading...</option>
              ) : (
                filteredRegions.map((option, index) => (
                  <option key={index} value={option?._id}>
                    {option?.name}
                  </option>
                ))
              )}
            </Select>
          </div>
          <div>
            <div className="mb-2 block">
              <Label
                htmlFor="distributorSelect"
                className="text-sm"
                value="Select Distributor"
              />
            </div>
            <Select
              value={selectedDistributor}
              onChange={(e) => setSelectedDistributor(e.target.value)}
              id="distributorSelect"
              required
              disabled={selectedRegion === "default"}
              className="w-40"
            >
              <option value="default">All</option>
              {distributorsLoading ? (
                <option value="default">Loading...</option>
              ) : (
                filteredDistributors
                  ?.filter((ele) => ele?.regionId?._id === selectedRegion)
                  ?.map((option, index) => (
                    <option key={index} value={option?._id}>
                      {option?.name}
                    </option>
                  ))
              )}
            </Select>
          </div>
          <div>
            <div className="mb-2 block">
              <Label
                htmlFor="beatSelect"
                className="text-sm"
                value="Select Beats"
              />
            </div>
            <Select
              value={selectedBeat}
              onChange={(e) => setSelectedBeat(e.target.value)}
              id="beatSelect"
              required
              disabled={
                selectedRegion === "default" &&
                selectedDistributor === "default"
              }
              className="w-40"
            >
              <option value="default">All</option>
              {beatsLoading ? (
                <option value="default">Loading...</option>
              ) : (
                allBeats?.length > 0 &&
                allBeats?.map((option, index) => (
                  <option key={index} value={option?._id}>
                    {option?.name}
                  </option>
                ))
              )}
            </Select>
          </div>
        </div>
        <div className="flex justify-center">
          <Button color="dark" onClick={() => handleClear()}>
            Reset
          </Button>
        </div>
      </Card>
      <div className="flex flex-col justify-center items-center mt-4 w-full py-4">
        <div className="bg-slate-400 text-black font-bold text-center w-full p-2 rounded">
          <h4 className="font-bold text-black ">
            Selected Outlets <span>({selectedIds?.length})</span>
          </h4>
        </div>
        <div className="w-full flex justify-between items-center mt-2">
          {/* search */}
          <div className="w-full flex gap-2 items-center">
            <TextInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              className="w-full"
            />
            <Button
              color="dark"
              onClick={() => setSearchTerm("")}
              className="text-sm"
            >
              Reset
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 border w-full h-[20.5rem] mt-2 p-4 overflow-x-auto">
          <List className="text-left w-full">
            {outletsLoading ? (
              <div className="flex justify-center items-center w-full">
                <Spinner />
              </div>
            ) : outlets?.length > 0 ? (
              outlets
                .filter(
                  (outlet) =>
                    !rightSelectedOutlets.some(
                      (selected) => selected._id === outlet._id
                    )
                )
                .map((outlet, index) => (
                  <List.Item
                    key={index}
                    className="flex gap-4 text-sm tracking-wider justify-between font-medium items-center"
                  >
                    <div className="w-5">{index + 1}.</div>
                    {selectedDistributor !== "default" &&
                      selectedBeat !== "default" && (
                        <div>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(outlet._id)}
                            onChange={() => handleCheckboxChange(outlet._id)}
                            disabled={selectedDistributor == "default"}
                          />
                        </div>
                      )}
                    <div className="flex-1 text-left">
                      {outlet?.outletName} ({outlet?.outletUID})
                    </div>
                    <div className="w-5">
                      <FaRegEye
                        size={20}
                        className="cursor-pointer"
                        onClick={() => handleOutletDetails(outlet)}
                      />
                    </div>
                  </List.Item>
                ))
            ) : (
              <p className="text-lg text-center mt-4 text-gray-500 list-none  w-full">
                No Outlets Found
              </p>
            )}
          </List>
        </div>
      </div>
    </div>
  );
};

const TransferOutLetBox = ({
  rightSelectedOutlets,
  outletsLoading,
  rightSelectedIds,
  handleRightCheckboxChange,
  beatsLoading,
  selectedRegion,
  setSelectedRegion,
  regionsLoading,
  filteredRegions,
  filteredDistributors,
  distributorsLoading,
  transferDistributor,
  setTransferDistributor,
  setTransferBeat,
  transferBeat,
  transferBeatOptions,
  handleClearRight,
  handleOutletDetails,
  transferType,
}) => {
  return (
    <div className="flex justify-center flex-col items-center  py-4 ">
      <Card className="flex w-full border-b-2 py-4">
        <div className="flex justify-center items-center gap-2 w-full flex-wrap">
          <div>
            <div className="mb-2 block">
              <Label
                htmlFor="regionSelect"
                className="text-sm"
                value="Select Region"
              />
            </div>
            <Select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              id="regionSelect"
              className="w-40"
              required
              disabled
            >
              <option value="default">All</option>
              {regionsLoading ? (
                <option value="default">Loading...</option>
              ) : (
                filteredRegions.map((option, index) => (
                  <option key={index} value={option?._id}>
                    {option?.name}
                  </option>
                ))
              )}
            </Select>
          </div>
          <div>
            <div className="mb-2 block">
              <Label
                htmlFor="distributorSelect"
                className="text-sm"
                value="Select Distributor"
              />
            </div>
            <Select
              value={transferDistributor}
              onChange={(e) => setTransferDistributor(e.target.value)}
              id="distributorSelect"
              required
              disabled={selectedRegion === "default"}
              className="w-40"
            >
              <option value="default">All</option>
              {distributorsLoading ? (
                <option value="default">Loading...</option>
              ) : (
                filteredDistributors
                  ?.filter((ele) => ele?.regionId?._id === selectedRegion)
                  ?.map((option, index) => (
                    <option key={index} value={option?._id}>
                      {option?.name}
                    </option>
                  ))
              )}
            </Select>
          </div>
          <div>
            <div className="mb-2 block">
              <Label
                htmlFor="beatSelect"
                className="text-sm"
                value="Select Beats"
              />
            </div>
            <Select
              value={transferBeat}
              onChange={(e) => setTransferBeat(e.target.value)}
              id="beatSelect"
              required
              disabled={
                selectedRegion === "default" &&
                transferDistributor === "default"
              }
              className="w-40"
            >
              <option value="default">All</option>
              {beatsLoading ? (
                <option value="default">Loading...</option>
              ) : (
                transferBeatOptions?.length > 0 &&
                transferBeatOptions?.map((option, index) => (
                  <option key={index} value={option?._id}>
                    {option?.name}
                  </option>
                ))
              )}
            </Select>
          </div>
        </div>
        <div className="flex justify-center">
          <Button color="dark" onClick={() => handleClearRight()}>
            Reset
          </Button>
        </div>
      </Card>
      <div className="flex flex-col justify-center items-center mt-4 w-full py-4">
        <div className="bg-slate-400 text-black font-bold text-center w-full p-2 rounded">
          <h4 className="font-bold text-black ">
            {transferType === "Transfer"
              ? "Transferred Outlets"
              : "Copied Outlets"}{" "}
            <span>({rightSelectedOutlets?.length})</span>
          </h4>
        </div>
        <div className="flex gap-2 text-center border w-full h-96 mt-2 p-4 overflow-x-auto">
          <List className="text-left w-full">
            {outletsLoading ? (
              <div className="flex justify-center items-center w-full">
                <Spinner />
              </div>
            ) : rightSelectedOutlets && rightSelectedOutlets.length > 0 ? (
              rightSelectedOutlets.map((outlet, index) => (
                <List.Item
                  key={index}
                  className="flex gap-2 text-sm tracking-wider justify-between font-medium items-center"
                >
                  <div className="w-5">{index + 1}.</div>
                  <div>
                    <input
                      type="checkbox"
                      checked={rightSelectedIds.includes(outlet._id)}
                      onChange={() => handleRightCheckboxChange(outlet._id)}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    {outlet?.outletName} ({outlet?.outletUID})
                  </div>
                  <div className="w-5">
                    <FaRegEye
                      size={15}
                      className="cursor-pointer"
                      onClick={() => handleOutletDetails(outlet)}
                    />
                  </div>
                </List.Item>
              ))
            ) : (
              <p className="text-lg text-center mt-4 text-gray-500 list-none  w-full">
                No Transfer Outlets
              </p>
            )}
          </List>
        </div>
      </div>
    </div>
  );
};

export default OutletTransfer;
