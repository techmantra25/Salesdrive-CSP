import { Button, Modal, Spinner, Table } from "flowbite-react";
import { useEffect, useState } from "react";
import { EmployerListByBeat, getBeatDetails } from "../api/api";
import toast from "react-hot-toast";
import UniqueCode from "../assets/common/UniqueCode";

const BeatDetails = ({ beat, openDetailModal, oncloseDetailModal }) => {
  const [employees, setEmployees] = useState();
  const [loading, setLoading] = useState(false);
  const [beatDetails, setBeatDetails] = useState(null);
  const [beatLoading, setBeatLoading] = useState(true);

  const getBeatDetailsApiCall = async (beat) => {
    try {
      setBeatLoading(true);
      const res = await getBeatDetails(beat?._id);
      setBeatDetails(res?.data?.data);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to update beat, try again");
    } finally {
      setBeatLoading(false);
    }
  };

  useEffect(() => {
    getBeatDetailsApiCall(beat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getEmployees() {
    try {
      setLoading(true);
      const response = await EmployerListByBeat(beatDetails?._id);
      setEmployees(response?.data?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal show={openDetailModal} onClose={oncloseDetailModal} size="2xl">
      <Modal.Header>Beat Details</Modal.Header>
      <Modal.Body>
        {beatLoading && (
          <div className="flex justify-center items-center">
            <Spinner size="md" />
          </div>
        )}
        {!beatLoading && (
          <>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-gray-200">
                  Beat Name
                </h3>
                <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                  {beatDetails?.name ? beatDetails?.name : ""}
                </p>
              </div>
              <div>
                <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-gray-200">
                  Beat Code
                </h3>
                <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                  <UniqueCode text={beatDetails?.code} codeName="Beat" />{" "}
                </p>
              </div>
              <div>
                <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-gray-200">
                  Beat Type
                </h3>
                <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                  {beatDetails?.beat_type ? beatDetails.beat_type : ""}
                </p>
              </div>
              <div>
                <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-gray-200">
                  Region
                </h3>
                <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                  {beatDetails?.regionId?.name ? beatDetails.regionId.name : ""}
                </p>
              </div>
              <div>
                <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-gray-200">
                  Region Code
                </h3>
                <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                  <UniqueCode
                    text={beatDetails?.regionId?.code}
                    codeName="Region"
                  />{" "}
                </p>
              </div>
              <div>
                <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-gray-200">
                  Distributor
                </h3>
                <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                  {beatDetails?.distributorId?.name
                    ? beatDetails.distributorId.name
                    : ""}
                </p>
              </div>

              <div>
                <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-gray-200">
                  Status
                </h3>
                <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                  {beatDetails?.status !== undefined
                    ? beatDetails.status
                      ? "Active"
                      : "Inactive"
                    : ""}
                </p>
              </div>
              <div>
                <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-gray-200">
                  Created At
                </h3>
                <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                  {beatDetails?.createdAt
                    ? new Date(beatDetails.createdAt).toLocaleDateString()
                    : ""}
                </p>
              </div>
              <div>
                <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-gray-200">
                  Total Outlets
                </h3>
                <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                  {beatDetails?.beatOutlet ? beatDetails.beatOutlet : "0"}
                </p>
              </div>
            </div>
            <div className="flex justify-center text-center items-center mt-4">
              <h2 className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 ">
                <Button color="dark" size={"sm"} pill onClick={getEmployees}>
                  View Assign Employees
                </Button>
              </h2>
            </div>
          </>
        )}

        <div className="mt-4 mb-2 p-2">
          {loading ? (
            <div className="flex justify-center items-center">
              <Spinner size="md" />
            </div>
          ) : employees?.length > 0 ? (
            <Table striped hoverable>
              <Table.Head>
                <Table.HeadCell className="whitespace-nowrap text-center">
                  Employee Name
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap text-center">
                  Employee Code
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap text-center">
                  Employee Designation
                </Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {employees.map((employee, index) => (
                  <Table.Row key={index} className="bg-white dark:bg-gray-800">
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-center">
                      {employee?.name}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-center">
                      <UniqueCode text={employee?.empId} codeName="Employee" />{" "}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-center">
                      {employee?.desgId?.name}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            employees?.length === 0 && (
              <div className="flex justify-center items-center">
                <h2 className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                  No Assigned Employees
                </h2>
              </div>
            )
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={oncloseDetailModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BeatDetails;
