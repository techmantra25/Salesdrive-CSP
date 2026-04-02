import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Breadcrumb,
  Button,
  Card,
  Modal,
  Spinner,
  Table,
  TableCell,
  TextInput,
} from "flowbite-react";
import { RiRefreshFill } from "react-icons/ri";
import { IoMdAddCircle } from "react-icons/io";
import {
  getTermsAndConditions,
  updateTermsAndConditions,
} from "../../api/rewardsApi";
import EditButton from "../../assets/common/EditButton";
import { useSelector } from "react-redux";
import { getPagePermission } from "../../utils/permissionHelper";

const TermsAndCondition = () => {
  const [tncData, setTncData] = useState(null); // single object now
  const [formData, setFormData] = useState([""]);
  const [modalMode, setModalMode] = useState("add");
  const [openModal, setOpenModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  useEffect(() => {
    if (!permissionState?.data?.data) return;

    const permission = getPagePermission(
      permissionState,
      "terms-and-conditions"
    );

    setPagePermission(permission);
  }, [permissionState]);

  useEffect(() => {
    fetchRetailerTnC();
  }, []);

  const fetchRetailerTnC = async () => {
    setPageLoading(true);
    try {
      const res = await getTermsAndConditions();
      const data = res?.data?.data;
      if (data && Array.isArray(data.tnc)) {
        setTncData(data);
      } else {
        setTncData(null);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch Retailer T&C"
      );
    } finally {
      setPageLoading(false);
    }
  };

  const handleAddTncField = () => {
    setFormData([...formData, ""]);
  };

  const handleRuleChange = (index, value) => {
    const updated = [...formData];
    updated[index] = value;
    setFormData(updated);
  };

  const onCloseModal = () => {
    setOpenModal(false);
    setModalMode("add");
    setFormData([""]);
  };

  const validate = () => {
    if (formData.some((rule) => rule.trim() === "")) {
      toast.error("All rules must be filled");
      return false;
    }
    return true;
  };

  const handleSaveOrUpdate = async () => {
    if (!validate()) return;
    try {
      await updateTermsAndConditions({ tnc: formData });
      toast.success(`T&C ${modalMode === "edit" ? "updated" : "saved"}`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          `Error ${modalMode === "edit" ? "updating" : "saving"} T&C`
      );
    } finally {
      fetchRetailerTnC();
      onCloseModal();
    }
  };

  const handleEdit = () => {
    setFormData(tncData?.tnc || [""]);
    setModalMode("edit");
    setOpenModal(true);
  };

  const handleView = () => {
    setViewModalOpen(true);
  };

  return (
    <div>
      {pagePermission?.view ? (
        <div className="flex justify-center items-center flex-col w-full">
          <div className="flex justify-between w-full items-center py-2">
            <Breadcrumb aria-label="Solid background breadcrumb example">
              <Breadcrumb.Item>RVP App</Breadcrumb.Item>
              <Breadcrumb.Item href="">Terms & Conditions</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <div className="w-full p-2 flex justify-center items-center">
            <Button color="success" onClick={fetchRetailerTnC} size="sm">
              <RiRefreshFill size={20} className="mr-2" /> Refresh
            </Button>
            {!pageLoading && !tncData && pagePermission?.create && (
              <Button size="sm" onClick={() => setOpenModal(true)}>
                <IoMdAddCircle size={20} className="mr-2" />
                Create Retailer T&C
              </Button>
            )}
          </div>

          <div className="w-full p-2">
            {pageLoading ? (
              <div className="flex justify-center items-center w-full">
                <Spinner size="xl" />
              </div>
            ) : (
              <Card className="overflow-x-auto w-full">
                <Table striped>
                  <Table.Head>
                    <Table.HeadCell>Terms & Conditions</Table.HeadCell>
                    <Table.HeadCell>Show</Table.HeadCell>
                    {pagePermission?.update && (
                      <Table.HeadCell>Actions</Table.HeadCell>
                    )}
                  </Table.Head>
                  <Table.Body>
                    {tncData ? (
                      <Table.Row>
                        <TableCell>Terms and Conditions</TableCell>
                        <Table.Cell>
                          <Button size="xs" onClick={handleView}>
                            View
                          </Button>
                        </Table.Cell>
                        {pagePermission?.update && (
                          <Table.Cell>
                            <EditButton onClick={handleEdit} />
                          </Table.Cell>
                        )}
                      </Table.Row>
                    ) : (
                      <Table.Row>
                        <Table.Cell colSpan={2}>No data found</Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table>
              </Card>
            )}
          </div>

          <Modal show={openModal} onClose={onCloseModal}>
            <Modal.Header>
              {modalMode === "edit" ? "Edit Retailer T&C" : "Add Retailer T&C"}
            </Modal.Header>
            <Modal.Body>
              <div className="space-y-4">
                {formData?.map((rule, index) => (
                  <TextInput
                    key={index}
                    value={rule}
                    onChange={(e) => handleRuleChange(index, e.target.value)}
                    className="mb-2"
                  />
                ))}
                <Button onClick={handleAddTncField} size="sm">
                  <IoMdAddCircle className="mr-2" />
                  Add New T&C Rule
                </Button>
                <Button onClick={handleSaveOrUpdate}>Save</Button>
              </div>
            </Modal.Body>
          </Modal>

          <Modal show={viewModalOpen} onClose={() => setViewModalOpen(false)}>
            <Modal.Header>Retailer Terms & Conditions</Modal.Header>
            <Modal.Body className="dark:text-white">
              {tncData?.tnc?.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {tncData?.tnc.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>No Terms & Conditions available.</p>
              )}
            </Modal.Body>
          </Modal>
        </div>
      ) : (
        <div className="flex justify-center items-center h-[70vh] w-full">
          <div className="text-center">
            <div className="text-red-600 text-4xl font-bold mb-2">
              NO Access
            </div>
            <div className="text-gray-500 text-lg">
              You do not have permission to view this page.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermsAndCondition;