import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Label,
  TextInput,
  Checkbox,
  Table,
  Select,
  Spinner,
} from "flowbite-react";
import { FaPlus } from "react-icons/fa";
import { RiRefreshFill } from "react-icons/ri";

import {
  appBannerList,
  createAppBanner,
  updateAppBanner,
} from "../../api/rewardsApi";
import { FileUpload } from "../../uploadWidget/FileUpload";
import { useSelector } from "react-redux";
import { getPagePermission } from "../../utils/permissionHelper";

const RbpBanner = () => {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentBanner, setCurrentBanner] = useState({
    title: "",
    image: null,
    order_no: 0,
    status: true,
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  useEffect(() => {
    if (!permissionState?.data?.data) return;

    const permission = getPagePermission(
      permissionState,
      "rbp-banner"
    );

    setPagePermission(permission);
  }, [permissionState]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await appBannerList();
      const sorted = res?.data?.data.sort((a, b) => a.order_no - b.order_no);
      setBanners(sorted);
    } catch (error) {
      console.error("Error fetching banners", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        // For editing, we only send the fields that can be updated
        const updateData = {
          title: currentBanner.title,
          image: currentBanner.image,
          status: currentBanner.status,
        };
        await updateAppBanner(currentBanner._id, updateData);
      } else {
        await createAppBanner(currentBanner);
      }
      setShowModal(false);
      fetchBanners();
    } catch (error) {
      console.error("Error saving banner", error);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setLoading(true);
    try {
      await updateAppBanner(id, { status });
      fetchBanners();
    } catch (error) {
      console.error("Error updating banner status", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrdering = async (id, order_no, oldOrder_no) => {
    const swap = banners.find((item) => item?.order_no === parseInt(order_no));
    if (!swap || !id) return;

    setLoading(true);
    try {
      await Promise.all([
        updateAppBanner(id, { order_no: parseInt(order_no) }),
        updateAppBanner(swap._id, { order_no: parseInt(oldOrder_no) }),
      ]);
      fetchBanners();
    } catch (error) {
      console.error("Error updating banner order", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentBanner({
      title: banners.length ? `Banner ${banners.length + 1}` : "Banner 1",
      order_no: banners.length + 1,
      image: null,
      status: true,
    });
    setEditing(false);
    setShowModal(true);
  };

  const handleEditClick = (banner) => {
    setCurrentBanner({
      _id: banner._id,
      title: banner.title,
      image: banner.image,
      order_no: banner.order_no,
      status: banner.status,
    });
    setEditing(true);
    setShowModal(true);
  };

  return (
    <div>
      {pagePermission?.view ? (
        <div className="flex flex-col w-full p-4">
          <div className="flex justify-between items-center mb-4 mt-4">
            <h2 className="text-2xl font-semibold">Banner Management</h2>
            <div className="flex gap-2">
              <Button
                onClick={fetchBanners}
                size="sm"
                color="green"
                className="text-xs"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RiRefreshFill className="mr-2" /> Refresh
                  </>
                )}
              </Button>

              {pagePermission?.create && (
                <Button onClick={handleAddClick} size="sm" color="blue" className="text-xs">
                  <FaPlus className="mr-2" /> Add Banner
                </Button>
              )}
            </div>
          </div>

          <Table striped hoverable>
            <Table.Head>
              <Table.HeadCell>Title</Table.HeadCell>
              <Table.HeadCell>Order No</Table.HeadCell>
              <Table.HeadCell>Image</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              {pagePermission?.update && (
                <Table.HeadCell>Change Order</Table.HeadCell>
              )}
              {(pagePermission?.update) && (
                <Table.HeadCell>Actions</Table.HeadCell>
              )}
            </Table.Head>
            <Table.Body>
              {!loading &&
                banners.map((banner) => (
                  <Table.Row key={banner._id}>
                    <Table.Cell className="font-bold">{banner.title}</Table.Cell>
                    <Table.Cell>{banner.order_no}</Table.Cell>
                    <Table.Cell>
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-24 rounded"
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`font-semibold ${
                          banner.status ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {banner.status ? "Active" : "Inactive"}
                      </span>
                    </Table.Cell>
                    {pagePermission?.update && (
                      <Table.Cell>
                        <Select
                          value={banner.order_no}
                          onChange={(e) =>
                            updateOrdering(
                              banner._id,
                              e.target.value,
                              banner.order_no
                            )
                          }
                        >
                          {[...Array(banners.length)].map((_, index) => (
                            <option key={index} value={index + 1}>
                              {index + 1}
                            </option>
                          ))}
                        </Select>
                      </Table.Cell>
                    )}
                    {pagePermission?.update && (
                      <Table.Cell>
                        <div className="flex gap-2">
                          <Button
                            color="blue"
                            size="xs"
                            onClick={() => handleEditClick(banner)}
                            disabled={loading}
                          >
                            Edit
                          </Button>
                          <Button
                            color={banner.status ? "failure" : "success"}
                            size="xs"
                            onClick={() =>
                              handleStatusChange(banner._id, !banner.status)
                            }
                            disabled={loading}
                          >
                            {banner.status ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </Table.Cell>
                    )}
                  </Table.Row>
                ))}
            </Table.Body>
          </Table>

          <Modal show={showModal} dismissible onClose={() => setShowModal(false)}>
            <Modal.Header>{editing ? "Edit Banner" : "Add Banner"}</Modal.Header>
            <Modal.Body>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" value="Title" />
                  <TextInput
                    id="title"
                    value={currentBanner.title}
                    onChange={(e) =>
                      setCurrentBanner({ ...currentBanner, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="image" value="Upload Banner Image" />
                  <div className="flex items-center gap-2">
                    <TextInput
                      id="image"
                      value={currentBanner.image || ""}
                      onChange={(e) =>
                        setCurrentBanner({
                          ...currentBanner,
                          image: e.target.value,
                        })
                      }
                      placeholder="Image URL"
                      className="flex-1"
                    />
                    <FileUpload
                      onSetFileUrl={(url) =>
                        setCurrentBanner({ ...currentBanner, image: url })
                      }
                      type="single-image"
                      page="modal-form"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={currentBanner.status}
                    onChange={(e) =>
                      setCurrentBanner({
                        ...currentBanner,
                        status: e.target.checked,
                      })
                    }
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button color="gray" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : editing ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </Button>
            </Modal.Footer>
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

export default RbpBanner;