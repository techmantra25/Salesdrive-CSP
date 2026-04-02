import { Button, Label, Select, Spinner, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getEmployeeList } from "../../../api/api";

const StepInitiate = ({ formData, setFormData, nextStep }) => {
  const [employeeList, setEmployeeList] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [geoData, setGeoData] = useState([]);
  const [distributorList, setDistributorList] = useState([]);

  console.log(geoData, "geoData");

  const fetchEmployee = async (isMounted) => {
    let payload = {
      limit: 100,
    };
    try {
      const response = await getEmployeeList(payload);
      if (isMounted) {
        setEmployeeList(response?.data?.data);
      }
    } catch (error) {
      if (isMounted) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to fetch employee list"
        );
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    fetchEmployee(isMounted);

    return () => {
      isMounted = false;
    };
  }, [formData?.employeeId]);

  //   useEffect(() => {
  //     if (formData?.employeeId) {
  //       findReportingManagers(formData?.employeeId);
  //     }
  //   }, [formData?.employeeId]);

  // useEffect(() => {
  //   if (formData?.employeeId) {
  //     setGeoData({
  //       region: formData?.region,
  //       zone: formData?.zone,
  //       state: formData?.state,
  //     });
  //     findReportingManagers(formData?.employeeId);
  //     setLoading(false);

  //     //   setManagers()
  //   }
  // }, [formData]);

  const findReportingManagers = (employeeId) => {
    const employee = employeeList.find((emp) => emp?._id === employeeId);

    console.log({ employee });

    if (employee && employee.reporting_manager) {
      console.log("goes here");
      const manager = employeeList.find(
        (emp) => emp._id === employee.reporting_manager?._id
      );

      console.log(manager, "manager");

      if (manager) {
        const managerDetails = {
          id: manager._id,
          name: manager.name,
          designation: manager.desgId?.name,
        };

        setManagers((prev) => [...prev, managerDetails]);
        findReportingManagers(manager._id);
      }
    }
  };

  const OnEmployeeChange = (e) => {
    setLoading(true);
    setFormData({
      ...formData,
      employeeId: e.target.value,
      createdBy: e.target.value,
    });
    const selectedEmployeeId = e.target.value;
    if (selectedEmployeeId) {
      let filter = employeeList.find((emp) => emp?._id === selectedEmployeeId);
      console.log(filter, "filter");
      setGeoData({
        region: filter?.regionId?.name,
        zone: filter?.zoneId?.name,
        state: filter?.regionId?.stateId?.name,
      });
      setDistributorList(filter?.distributorId);
    }
    setManagers([]);
    findReportingManagers(selectedEmployeeId);
    setLoading(false);
  };

  console.log({ formData });

  console.log({ distributorList });

  return (
    <>
      <div className="flex flex-col  justify-center gap-4 w-1/2 max-w-1/2">
        <div>
          <Label htmlFor="state">Choose Employee</Label>
          <Select
            id="state"
            name="state"
            value={formData?.employeeId || ""}
            onChange={OnEmployeeChange}
            required
          >
            <option value="default">Select Employee</option>
            {employeeList.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.name} - {employee?.desgId?.name}
              </option>
            ))}
          </Select>
        </div>

        {loading && formData?.employeeId && (
          <div className="w-full flex justify-center items-center">
            <Spinner aria-label="Loading status" size="xl" />
          </div>
        )}

        {formData?.employeeId && (
          <>
            <div>
              <Label htmlFor="managers" value="Zone" />
              <TextInput
                id="managers"
                name="managers"
                placeholder="Enter Zone"
                value={geoData?.zone}
                required
              />
            </div>
            <div>
              <Label htmlFor="managers" value="State" />
              <TextInput
                id="managers"
                name="managers"
                placeholder="Enter State"
                value={geoData?.state}
                required
              />
            </div>
            <div>
              <Label htmlFor="managers" value="Region" />
              <TextInput
                id="managers"
                name="managers"
                placeholder="Enter Region"
                value={geoData?.region}
                required
              />
            </div>
          </>
        )}

        {managers.length > 0 &&
          managers.map((manager) => (
            <div>
              <Label
                htmlFor="managers"
                value={`Reporting - ${manager?.designation}`}
              />
              <TextInput
                id="managers"
                name="managers"
                placeholder="Enter Managers"
                value={manager?.name}
                required
              />
            </div>
          ))}

        <div>
          <Label htmlFor="state">Choose Distributer</Label>
          <Select
            id="state"
            name="state"
            value={formData?.distributorId || ""}
            onChange={(e) =>
              setFormData({ ...formData, distributorId: e.target.value })
            }
            required
          >
            <option value="default">Select Employee</option>
            {distributorList.map((distributor) => (
              <option key={distributor._id} value={distributor._id}>
                {distributor.name} - {distributor?.dbCode}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex justify-center items-center mt-4">
          <Button onClick={nextStep}>Next</Button>
        </div>
      </div>
    </>
  );
};

export default StepInitiate;
