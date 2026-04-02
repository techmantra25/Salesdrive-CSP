import { Button, Modal, Spinner, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaMinus, FaPlus, FaChevronDown, FaChevronRight, FaSearch } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { EmployeeBeatMapping, getRegionBeats } from "../api/api";
import UniqueCode from "../assets/common/UniqueCode";
import BeatDetails from "./BeatDetails";

const EditBeatMapping = ({
  showBeatsModal,
  onCloseBeatsModal,
  selectedEmployee,
  fetchEmployeesPaginated,
}) => {
  const [beatList, setBeatList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedBeats, setAddedBeats] = useState(new Set());
  const [error, setError] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedBeatDetails, setSelectedBeatDetails] = useState(null);
  
  // New states for dropdown and search
  const [openRegionDropdown, setOpenRegionDropdown] = useState(null);
  const [searchTerms, setSearchTerms] = useState({});

  const distributors = selectedEmployee?.distributorId?.map(
    (distributor) => distributor?._id
  );
  const beatIds = selectedEmployee?.beatId?.map((beatId) => beatId?._id);

  const regionIds = Array.isArray(selectedEmployee?.regionId)
    ? selectedEmployee.regionId.map((region) => region._id)
    : selectedEmployee?.regionId?._id
      ? [selectedEmployee.regionId._id]
      : [];

  const isOccupiedByMe = (beatId) => {
    if (beatIds.includes(beatId)) {
      return true;
    }
    return false;
  };

  // Group beats by region
  const beatsByRegion = regionIds.reduce((acc, regionId) => {
    const regionBeats = beatList.filter(beat => {
      // Check if beat belongs to this region
      const beatRegionId = beat?.regionId?._id || beat?.regionId;
      if (beatRegionId !== regionId) return false;
      
      // Check if beat's distributors match employee's distributors
      return beat?.distributorId?.some((beatDistributor) =>
        distributors.includes(beatDistributor?._id)
      );
    });
    
    acc[regionId] = regionBeats;
    return acc;
  }, {});

  // Get filtered beats for a region based on search term
  const getFilteredBeatsForRegion = (regionId) => {
    const searchTerm = searchTerms[regionId]?.toLowerCase() || '';
    const regionBeats = beatsByRegion[regionId] || [];
    
    if (!searchTerm) return regionBeats;
    
    return regionBeats.filter(beat => 
      beat?.name?.toLowerCase().includes(searchTerm) ||
      beat?.code?.toLowerCase().includes(searchTerm) ||
      beat?.distributorId?.some(d => 
        d?.name?.toLowerCase().includes(searchTerm) ||
        d?.dbCode?.toLowerCase().includes(searchTerm)
      )
    );
  };

  // Get region name by ID
  const getRegionNameById = (regionId) => {
    if (Array.isArray(selectedEmployee?.regionId)) {
      const region = selectedEmployee.regionId.find(r => r._id === regionId);
      return region?.name || 'Unknown Region';
    }
    return selectedEmployee?.regionId?.name || 'Unknown Region';
  };

  useEffect(() => {
    setAddedBeats(
      new Set(selectedEmployee?.beatId?.map((beatId) => beatId?._id))
    );
  }, [selectedEmployee?.beatId]);

  useEffect(() => {
    const fetchBeatsForMultipleRegions = async () => {
      try {
        const regionIds = Array.isArray(selectedEmployee?.regionId)
          ? selectedEmployee.regionId.map((region) => region._id)
          : selectedEmployee?.regionId?._id
            ? [selectedEmployee.regionId._id]
            : [];

        if (regionIds.length === 0) {
          setBeatList([]);
          setError("No region added for this employee");
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        const promises = regionIds.map((regionId) => getRegionBeats(regionId));
        const responses = await Promise.all(promises);

        const allBeats = responses.flatMap((res) => res?.data?.data || []);

        const uniqueBeats = allBeats.reduce((acc, beat) => {
          if (!acc.find((b) => b._id === beat._id)) {
            acc.push(beat);
          }
          return acc;
        }, []);

        setBeatList(uniqueBeats);
        
        // Auto-open first region dropdown
        if (regionIds.length > 0) {
          setOpenRegionDropdown(regionIds[0]);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch beats");
        setBeatList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBeatsForMultipleRegions();
  }, [selectedEmployee?.regionId]);

  const handleAddBeat = (beatId) => {
    setAddedBeats((prev) => new Set(prev).add(beatId));
  };

  const handleRemoveBeat = (beatId) => {
    setAddedBeats((prev) => {
      const updatedSet = new Set(prev);
      updatedSet.delete(beatId);
      return updatedSet;
    });
  };

  const HandleSaveBeats = async () => {
    try {
      const payload = {
        beatIds: Array.from(addedBeats),
      };
      let res = await EmployeeBeatMapping(selectedEmployee._id, payload);
      if (res?.data?.statusUpdateError) {
        toast.error("Something went wrong");
      } else {
        toast.success("Employee Beat Mapping updated successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to add beat, try again");
    } finally {
      fetchEmployeesPaginated();
      onCloseBeatsModal(false);
    }
  };

  const handleBeatDetails = async (beat) => {
    setSelectedBeatDetails(beat);
    setOpenDetailModal(true);
  };

  const oncloseDetailModal = () => {
    setOpenDetailModal(false);
    setSelectedBeatDetails(null);
  };

  const toggleRegionDropdown = (regionId) => {
    setOpenRegionDropdown(openRegionDropdown === regionId ? null : regionId);
  };

  const handleSearchChange = (regionId, value) => {
    setSearchTerms(prev => ({
      ...prev,
      [regionId]: value
    }));
  };

  // Get all beats across all regions for "Map All" functionality
  const allFilteredBeats = Object.values(beatsByRegion).flat();

  return (
    <div>
      <Modal size={"4xl"} show={showBeatsModal} onClose={onCloseBeatsModal}>
        <Modal.Header>
          {regionIds.length > 0
            ? `Map Beat For ${Array.isArray(selectedEmployee?.regionId)
              ? selectedEmployee.regionId.map((r) => r.name).join(", ")
              : selectedEmployee?.regionId?.name
            } Region${regionIds.length > 1 ? "s" : ""}`
            : "Map Beat"}
        </Modal.Header>
        <Modal.Body>
          {loading && (
            <div
              className="w-full flex justify-center items-center"
              role="status"
            >
              <Spinner aria-label="Default status example" size="xl" />
            </div>
          )}
          {error && <p className="text-red-500">{error}</p>}
          
          {!loading && !error && (
            <div className="space-y-3">
              {regionIds.map((regionId) => {
                const regionName = getRegionNameById(regionId);
                const isOpen = openRegionDropdown === regionId;
                const filteredBeats = getFilteredBeatsForRegion(regionId);
                const totalBeats = beatsByRegion[regionId]?.length || 0;
                const mappedBeatsCount = beatsByRegion[regionId]?.filter(b => addedBeats.has(b._id)).length || 0;

                return (
                  <div key={regionId} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    {/* Region Header */}
                    <div
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                      onClick={() => toggleRegionDropdown(regionId)}
                    >
                      <div className="flex items-center gap-2">
                        {isOpen ? (
                          <FaChevronDown className="text-gray-600 dark:text-gray-400" />
                        ) : (
                          <FaChevronRight className="text-gray-600 dark:text-gray-400" />
                        )}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {regionName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({mappedBeatsCount}/{totalBeats} beats mapped)
                        </span>
                      </div>
                    </div>

                    {/* Region Content */}
                    {isOpen && (
                      <div className="p-3">
                        {/* Search Bar */}
                        <div className="mb-3">
                          <TextInput
                            icon={FaSearch}
                            placeholder="Search beats by name, code, or distributor..."
                            value={searchTerms[regionId] || ''}
                            onChange={(e) => handleSearchChange(regionId, e.target.value)}
                            sizing="sm"
                          />
                        </div>

                        {/* Beats Table */}
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs border border-gray-200 dark:border-gray-700">
                            <thead>
                              <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                                <th className="px-2 py-1 font-semibold text-center whitespace-nowrap">
                                  Beat Name & Code
                                </th>
                                <th className="px-2 py-1 font-semibold text-center whitespace-nowrap">
                                  Distributors
                                </th>
                                <th className="px-2 py-1 font-semibold text-center whitespace-nowrap">
                                  Beat Type
                                </th>
                                <th className="px-2 py-1 font-semibold text-center whitespace-nowrap">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredBeats?.length > 0 ? (
                                filteredBeats.map((beat) => (
                                  <tr
                                    key={beat._id}
                                    className="border-t border-gray-200 dark:border-gray-700 text-center bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  >
                                    <td className="px-2 py-1 whitespace-nowrap text-gray-900 dark:text-gray-200">
                                      <span className="inline-flex items-center gap-1">
                                        {beat?.name} (
                                        <UniqueCode text={beat?.code} codeName="Beat" />)
                                        <span
                                          className="cursor-pointer ml-1"
                                          onClick={() => handleBeatDetails(beat)}
                                        >
                                          <FiExternalLink size={14} color="#3795BD" />
                                        </span>
                                      </span>
                                    </td>
                                    <td className="px-2 py-1 text-gray-900 dark:text-gray-200">
                                      <div className="flex flex-wrap gap-1 justify-center">
                                        {beat?.distributorId?.length > 0
                                          ? beat.distributorId.map((distributor, idx) => (
                                            <span
                                              key={distributor._id || idx}
                                              className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900 px-1.5 py-0.5 rounded"
                                              title={distributor?.name || "No Name"}
                                            >
                                              <UniqueCode
                                                text={distributor?.dbCode}
                                                codeName="Distributor"
                                              />
                                            </span>
                                          ))
                                          : "No distributors"}
                                      </div>
                                    </td>
                                    <td className="px-2 py-1 whitespace-nowrap text-gray-900 dark:text-gray-200">
                                      {beat?.beat_type}
                                    </td>
                                    <td className="px-2 py-1 whitespace-nowrap text-gray-900 dark:text-gray-200">
                                      {addedBeats.has(beat._id) ? (
                                        <button
                                          className="inline-flex items-center px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                          onClick={() => handleRemoveBeat(beat._id)}
                                        >
                                          <FaMinus className="mr-1" size={12} /> Remove
                                        </button>
                                      ) : (
                                        <button
                                          className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${beat?.beat_type === "normal" &&
                                              beat?.isOccupied &&
                                              !isOccupiedByMe(beat._id)
                                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                              : "bg-green-100 text-green-700 hover:bg-green-200"
                                            }`}
                                          onClick={() => handleAddBeat(beat._id)}
                                          disabled={
                                            beat?.beat_type === "normal" &&
                                            beat?.isOccupied &&
                                            !isOccupiedByMe(beat._id)
                                          }
                                        >
                                          <FaPlus className="mr-1" size={12} /> Add
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={4}
                                    className="px-2 py-2 text-center font-bold uppercase text-gray-500"
                                  >
                                    {searchTerms[regionId] ? 'No beats found matching search' : 'No beats found for this region'}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {regionIds.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No regions assigned to this employee
                </p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="w-full flex justify-between items-center">
            <div className="flex gap-2">
              {allFilteredBeats?.length > 0 && (
                <Button
                  color="blue"
                  onClick={() =>
                    setAddedBeats(
                      new Set(allFilteredBeats.map((beat) => beat._id))
                    )
                  }
                >
                  Map All Beats
                </Button>
              )}

              {addedBeats.size > 0 && (
                <Button
                  color="failure"
                  onClick={() => setAddedBeats(new Set())}
                >
                  Remove All
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button color="success" onClick={() => HandleSaveBeats()}>
                Save Mappings
              </Button>
              <Button color="gray" onClick={() => onCloseBeatsModal()}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>

      {openDetailModal && (
        <BeatDetails
          beat={selectedBeatDetails}
          openDetailModal={openDetailModal}
          oncloseDetailModal={oncloseDetailModal}
        />
      )}
    </div>
  );
};

export default EditBeatMapping;