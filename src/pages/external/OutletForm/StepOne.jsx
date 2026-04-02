import { TextInput, Button, Label, Select, Spinner } from "flowbite-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchZones } from "../../../redux/zoneSlice";
import { fetchRegions } from "../../../redux/regionSlice";
import { fetchStates } from "../../../redux/stateSlice";
import { getRegionBeats } from "../../../api/api";
import { fetchDistributors } from "../../../redux/distributorListSlice";

const StepOne = ({ formData, setFormData, nextStep, prevStep }) => {
  // const dispatch = useDispatch();

  // const { zones, loading: zonesLoading } = useSelector((state) => state.zone);
  // const activeZones = [...zones].filter((zone) => zone.status === true);

  // const { regions, loading: regionsLoading } = useSelector(
  //   (state) => state.region
  // );
  // const activeRegions = [...regions].filter((region) => region.status === true);

  // const { states, loading: statesLoading } = useSelector(
  //   (state) => state.state
  // );
  // const activeStates = [...states].filter((state) => state.status === true);

  // const [beats, setBeats] = useState([]);
  // const activeBeats = [...beats].filter((beat) => beat.status === true) || [];
  // const [beatsLoading, setBeatsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // useEffect(() => {
  //   dispatch(fetchZones());
  //   dispatch(fetchRegions());
  //   dispatch(fetchStates());
  //   dispatch(fetchDistributors());
  // }, [dispatch]);

  // useEffect(() => {
  //   let ignore = false;

  //   const getBeatsApi = async () => {
  //     try {
  //       setBeatsLoading(true);
  //       const res = await getRegionBeats(formData.region);
  //       if (!ignore) {
  //         setBeats(res?.data?.data);
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     } finally {
  //       setBeatsLoading(false);
  //     }
  //   };

  //   if (formData.region !== "default") {
  //     getBeatsApi();
  //   }

  //   return () => {
  //     ignore = true;
  //   };
  // }, [formData.region]);

  return (
    <>
      <div className="flex flex-col gap-4 w-1/2 max-w-4/5">
        {/* <h2 className="text-2xl font-semibold mb-4 text-center">
          1. Outlet Details
        </h2> */}

        {/* <div className="flex-1 min-w-[500px]">
          <Label htmlFor="outletCode" value="Outlet Code" />
          <TextInput
            id="outletCode"
            name="outletCode"
            placeholder="Enter Outlet Code"
            value={formData.outletCode}
            onChange={handleChange}
            required
          />
        </div> */}

        <div>
          <Label htmlFor="outletName" value="Outlet Name" />
          <TextInput
            id="outletName"
            name="outletName"
            placeholder="Enter Outlet Name"
            value={formData?.outletName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="ownerName" value="Owner Name" />
          <TextInput
            id="ownerName"
            name="ownerName"
            placeholder="Enter Owner Name"
            value={formData.ownerName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="address1" value="Address 1" />
          <TextInput
            id="address1"
            name="address1"
            placeholder="Enter Address Line 1"
            value={formData.address1}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="address2" value="Address 2" />
          <TextInput
            id="address2"
            name="address2"
            placeholder="Enter Address Line 2"
            value={formData.address2}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="location" value="Landmark (Coordinates)" />
          <TextInput
            id="location"
            name="location"
            placeholder="Enter Location Coordinates"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="marketCenter" value="Market Center" />
          <TextInput
            id="marketCenter"
            name="marketCenter"
            placeholder="Enter Market Center"
            value={formData.marketCenter}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="city" value="City/Village" />
          <TextInput
            id="city"
            name="city"
            placeholder="Enter City/Village"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="pin" value="PIN Code" />
          <TextInput
            id="pin"
            name="pin"
            placeholder="Enter PIN Code"
            value={formData.pin}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="district" value="District" />
          <TextInput
            id="district"
            name="district"
            placeholder="Enter District"
            value={formData.district}
            onChange={handleChange}
            required
          />
        </div>

        {/* <div className="flex-1 min-w-[500px]">
          <Label htmlFor="outletUID" value="Outlet UID" />
          <TextInput
            id="outletUID"
            name="outletUID"
            placeholder="Enter Outlet UID"
            value={formData.outletUID}
            onChange={handleChange}
          />
        </div>

        <div className="flex-1 min-w-[500px]">
          <Label htmlFor="ownerName" value="Owner Name" />
          <TextInput
            id="ownerName"
            name="ownerName"
            placeholder="Enter Owner Name"
            value={formData.ownerName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex-1 min-w-[500px]">
          <Label htmlFor="pin" value="PIN Code" />
          <TextInput
            id="pin"
            name="pin"
            placeholder="Enter PIN Code"
            value={formData.pin}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex-1 min-w-[500px]">
          <Label htmlFor="district" value="District" />
          <TextInput
            id="district"
            name="district"
            placeholder="Enter District"
            value={formData.district}
            onChange={handleChange}
            required
          />
        </div>

        <div className="max-w-[500px] flex-1 min-w-[500px]">
          <Label htmlFor="zone" value="Zone" />
          <div className="flex-1 min-w-[500px]">
            <Select
              id="zone"
              name="zone"
              value={formData.zone}
              onChange={handleChange}
              required
              className="flex-1 min-w-[500px]"
            >
              <option value="default">Select Zone</option>
              {activeZones.map((zone) => (
                <option key={zone._id} value={zone._id}>
                  {zone.name} ({zone.code})
                </option>
              ))}
            </Select>
          </div>
        </div>

        {formData.zone !== "default" && (
          <div className="flex-1 min-w-[500px]">
            <Label htmlFor="state">
              State
              <span className="text-red-500 ml-2">
                {activeStates.filter(
                  (state) => state.zoneId._id === formData.zone
                ).length === 0 && "[ No States found for this zone ]"}
              </span>
            </Label>
            <Select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="flex-1 min-w-[500px]"
            >
              <option value="default">Select State</option>
              {activeStates
                .filter((state) => state.zoneId._id === formData.zone)
                .map((state) => (
                  <option key={state._id} value={state._id}>
                    {state.name} ({state.code})
                  </option>
                ))}
            </Select>
          </div>
        )}

        {formData.state !== "default" && (
          <div className="flex-1 min-w-[500px]">
            <Label htmlFor="region">
              Region
              <span className="text-red-500 ml-2">
                {activeRegions.filter(
                  (region) => region.stateId._id === formData.state
                ).length === 0 && "[ No Regions found for this State ]"}
              </span>
            </Label>
            <div className="flex-1 min-w-[500px]">
              <Select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                required
              >
                <option value="default">Select Region</option>
                {activeRegions
                  .filter((region) => region.stateId._id === formData.state)
                  .map((region) => (
                    <option key={region._id} value={region._id}>
                      {region.name} ({region.code})
                    </option>
                  ))}
              </Select>
            </div>
          </div>
        )}

        {formData.region !== "default" && (
          <div className="flex-1 min-w-[500px]">
            <Label htmlFor="beat">
              Beat
              <span className="text-blue-500 ml-2">
                {beatsLoading && "[ Loading Beats ... ]"}
              </span>
              <span className="text-red-500 ml-2">
                {!beatsLoading &&
                  activeBeats.length === 0 &&
                  "[ No Beats found for this region ]"}
              </span>
            </Label>
            <Select
              id="beat"
              name="beat"
              value={formData.beat}
              onChange={handleChange}
              required
              disabled={beatsLoading}
            >
              <option value="default">Select Beat</option>
              {!beatsLoading &&
                activeBeats.map((beat) => (
                  <option key={beat._id} value={beat._id}>
                    {beat.name} ({beat.code})
                  </option>
                ))}
            </Select>
          </div>
        )} */}
      </div>
      <div className="flex justify-center items-center mt-4 gap-4">
        <Button onClick={prevStep}>Back</Button>
        <Button onClick={nextStep}>Next</Button>
      </div>
    </>
  );
};

export default StepOne;
