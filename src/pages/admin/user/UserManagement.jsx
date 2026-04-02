import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  Table,
  TextInput,
  Spinner,
  Button,
  Badge,
} from "flowbite-react";
import { BACKEND_URL } from "../../../constants";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";


const UserManagement = () => {
  const { userInfo } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [allPages, setAllPages] = useState([]);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [selectedAccessUser, setSelectedAccessUser] = useState(null);
  const [openModule, setOpenModule] = useState(null);
  const [permissionState, setPermissionState] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteUser, setSelectedDeleteUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("all");



  const userRoles = [
    "admin",
    "admine",
    "sub-admins",
    "sales",
    "user",
  ];

  const emptyUser = {
    name: "",
    email: "",
    password: "",
    contact: "",
    role: "",
  };

  const [newUser, setNewUser] = useState(emptyUser);
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        BACKEND_URL + "/api/v1/users/all-users",
        {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        }
      );

      setUsers(res?.data?.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch users:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (userInfo) {
      fetchUsers();
    }
  }, [userInfo]);

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const res = await axios.post(
        BACKEND_URL + "/api/v1/users/create-user",
        newUser,
        {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        }
      );

      toast.success(res.data.message || "User created successfully");

      fetchUsers();
      closeModal();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Something went wrong";

      toast.error(message);
    }
  };

  const closeModal = () => {
    setOpenModal(false);
    setNewUser(emptyUser);
    setIsEditMode(false);
    setSelectedUserId(null);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openEditModal = (user) => {
    setIsEditMode(true);
    setSelectedUserId(user._id);

    setNewUser({
      name: user.name || "",
      email: user.email || "",
      contact: user.contact || "",
      role: user.role || "",
      password: "", // keep empty
    });

    setOpenModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      const payload = { ...newUser };
      if (!payload.password) delete payload.password;

      const res = await axios.put(
        `${BACKEND_URL}/api/v1/users/${selectedUserId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        }
      );

      toast.success(res.data.message || "User updated successfully");
      fetchUsers();
      closeModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update user"
      );
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedDeleteUser?._id) return;

    try {
      const res = await axios.delete(
        `${BACKEND_URL}/api/v1/users/${selectedDeleteUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        }
      );

      toast.success(res.data.message || "User deleted");
      fetchUsers();

      setDeleteModalOpen(false);
      setSelectedDeleteUser(null);

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete user"
      );
    }
  };


  const fetchAllPages = async () => {
    try {
      const res = await axios.get(
        BACKEND_URL + "/api/v1/users/all-pages",
        {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        }
      );

      setAllPages(res.data.data || []);
    } catch (error) {
      console.log("Failed to fetch pages:", error);
    }
  };

  const openAccessModal = async (user) => {
    setSelectedAccessUser(user);
    setAccessModalOpen(true);
    setOpenModule(null);
    setPermissionState({});


    await fetchAllPages();

    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/users/get-permissions/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        }
      );

      setPermissionState(res.data.data || {});
    } catch (error) {
      setPermissionState({});
    }
  };

  const handlePermissionChange = (moduleName, pageId, action, value) => {
    setPermissionState((prev) => {
      const updated = { ...prev };

      if (!updated[moduleName]) {
        updated[moduleName] = {};
      }

      if (!updated[moduleName][pageId]) {
        updated[moduleName][pageId] = {
          view: false,
          create: false,
          update: false,
          delete: false,
        };
      }

      const permissions = updated[moduleName][pageId];
      permissions[action] = value;
      if (action === "create" && value === true) {
        permissions.view = true;
        permissions.update = true;
      }

      if (action === "update" && value === true) {
        permissions.view = true;
        permissions.create = true;
      }

      if (action === "view" && value === false) {
        permissions.create = false;
        permissions.update = false;
        permissions.delete = false;
      }

      // If CREATE unchecked → uncheck update (optional rule)
      // if (action === "create" && value === false) {
      //   permissions.update = false;
      // }

      //  if (action === "update" && value === false) {
      //   permissions.create = false;
      // }

      return { ...updated };
    });
  };

  const handleSavePermissions = async () => {
    try {


      await axios.post(
        `${BACKEND_URL}/api/v1/users/save-permissions`,
        {
          userId: selectedAccessUser._id,
          permissions: permissionState,
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        }
      );


      toast.success("Permissions saved successfully");
      setAccessModalOpen(false);
    } catch (error) {
      toast.error("Failed to save permissions");
    }
  };

  const roleMap = {
    admin: "Super Admin",
    admine: "Admin",
    "sub-admins": "Sub Admin",
    sales: "Sales",
    user: "User",
  };



  return (
    <div className="p-6">
      <Card>
        <h1 className="text-2xl font-bold mb-6">
          User Management
        </h1>

        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-wrap gap-3">

            {userRoles.map((role) => (
              <Badge
                key={role}
                color={selectedRole === role ? "info" : "gray"}
                className="cursor-pointer px-4 py-1 text-sm hover:bg-blue-700 transition"
                onClick={() => setSelectedRole(role)}
              >
                {roleMap[role]}
              </Badge>
            ))}

          </div>

          <Button
            onClick={() => {
              setNewUser(emptyUser);
              setOpenModal(true);
            }}
          >
            + Create User
          </Button>
        </div>

        {/* SEARCH */}
        <div className="mb-4 w-80">
          <TextInput
            placeholder="Search by Name or Email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner size="xl" />
          </div>
        ) : (
          <Table striped>
            <Table.Head>
              <Table.HeadCell>#</Table.HeadCell>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Role</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Created At</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
              <Table.HeadCell>Access Management</Table.HeadCell>


            </Table.Head>

            <Table.Body>
              {filteredUsers.length ? (
                filteredUsers.map((user, index) => (
                  <Table.Row key={user._id}>
                    <Table.Cell>{index + 1}</Table.Cell>
                    <Table.Cell>{user.name}</Table.Cell>
                    <Table.Cell>{user.email}</Table.Cell>
                    <Table.Cell>
                      {roleMap[user.role] || user.role}
                    </Table.Cell>

                    <Table.Cell>
                      {user.status ? "Active" : "Inactive"}
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell className="flex gap-2">
                      {/* Hide actions for Super Admin */}
                      {user.role !== "admin" && (
                        <>
                          <Button
                            size="xs"
                            color="info"
                            onClick={() => openEditModal(user)}
                          >
                            Edit
                          </Button>

                          <Button
                            size="xs"
                            color="failure"
                            onClick={() => {
                              setSelectedDeleteUser(user);
                              setDeleteModalOpen(true);
                            }}
                          >
                            Delete
                          </Button>
                        </>
                      )}

                      {/* Optional: show label instead */}
                      {user.role === "admin" && (
                        <span className="text-gray-400 text-xs">
                          Protected
                        </span>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        size="xs"
                        color="warning"
                        onClick={() => openAccessModal(user)}
                      >
                        Access
                      </Button>
                    </Table.Cell>


                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={6} className="text-center">
                    No users found
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}
      </Card>


      {/* ================= User Access Model ================= */}
      {/* ================= User Access Modal ================= */}
      {accessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[85vh] flex flex-col rounded-xl bg-[#1b2638] text-white shadow-xl">

            {/* HEADER */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold">
                Access Management - {selectedAccessUser?.name}
              </h2>

              <button
                onClick={() => setAccessModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* BODY (SCROLLABLE) */}
            <div className="flex-1 overflow-y-auto p-6">

              {allPages.map((module) => (
                <div key={module.module} className="mb-4">

                  <div
                    onClick={() =>
                      setOpenModule(
                        openModule === module.module ? null : module.module
                      )
                    }
                    className="cursor-pointer bg-[#111827] px-4 py-3 rounded-md flex justify-between items-center hover:bg-[#1f2937]"
                  >
                    <h3 className="text-blue-400 font-semibold">
                      {module.module}
                    </h3>

                    <span className="text-gray-400 text-sm">
                      {openModule === module.module ? "▲" : "▼"}
                    </span>
                  </div>

                  {openModule === module.module && (
                    <div className="mt-3 space-y-3">
                      {module.pages.map((page) => (
                        <div
                          key={page._id}
                          className="flex items-center justify-between bg-[#0f172a] p-3 rounded-md"
                        >
                          <span>{page.page}</span>

                          <div className="flex gap-4 text-sm">
                            {["view", "create", "update", "delete"].map((action) => (
                              <label key={action} className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  className="accent-blue-500"
                                  checked={
                                    permissionState?.[module.module]?.[page._id]?.[action] || false
                                  }
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      module.module,
                                      page._id,
                                      action,
                                      e.target.checked
                                    )
                                  }
                                />
                                {action}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

            </div>

            {/* FOOTER (ALWAYS VISIBLE) */}
            <div className="sticky bottom-0 bg-[#1b2638] border-t border-gray-700 p-4 flex justify-end">
              <button
                onClick={handleSavePermissions}
                className="rounded-md bg-blue-600 px-5 py-2 hover:bg-blue-700 font-medium"
              >
                Save Access
              </button>
            </div>

          </div>
        </div>
      )}





      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-[#1b2638] p-6 text-white shadow-xl">

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-red-400">
                Confirm Delete
              </h2>
              <p className="mt-2 text-gray-300 text-sm">
                Are you sure you want to delete user{" "}
                <span className="font-semibold text-white">
                  {selectedDeleteUser?.name}
                </span>
                ?
                <br />
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedDeleteUser(null);
                }}
                className="rounded-md border border-gray-600 px-4 py-2 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteUser}
                className="rounded-md bg-red-600 px-4 py-2 font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>

          </div>
        </div>
      )}


      {/* ================= CREATE USER MODAL ================= */}


      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl bg-[#1b2638] p-6 text-white shadow-xl">
            {/* Header */}
            <div className="flex justify-between mb-6">
              <h2 className="text-lg font-semibold">
                {isEditMode ? "Edit User" : "Create New User"}
              </h2>

              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* FORM (AUTOFILL BLOCKED) */}
            <form autoComplete="off">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="text-sm text-gray-400">
                    Username
                  </label>
                  <input
                    type="text"
                    name="app-username"
                    autoComplete="off"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        name: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md bg-[#111827] border border-gray-600 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm text-gray-400">
                    Email
                  </label>
                  <input
                    type="email"
                    name="app-email"
                    autoComplete="off"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        email: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md bg-[#111827] border border-gray-600 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="text-sm text-gray-400">
                    Password
                  </label>
                  <input
                    type="password"
                    name="app-new-password"
                    autoComplete="new-password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        password: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md bg-[#111827] border border-gray-600 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Contact */}
                <div>
                  <label className="text-sm text-gray-400">
                    Contact
                  </label>
                  <input
                    type="text"
                    name="app-contact"
                    autoComplete="off"
                    value={newUser.contact}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        contact: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md bg-[#111827] border border-gray-600 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Role */}
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-400">
                    User Type
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        role: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md bg-[#111827] border border-gray-600 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select User Type</option>

                    {userRoles.map((role) => (
                      <option key={role} value={role}>
                        {roleMap[role]}
                      </option>
                    ))}
                  </select>

                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="rounded-md border border-gray-600 px-4 py-2 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={isEditMode ? handleUpdateUser : handleCreateUser}
                className="rounded-md bg-blue-600 px-4 py-2 font-medium hover:bg-blue-700"
              >
                {isEditMode ? "Update User" : "Create User"}
              </button>


            </div>

          </div>
        </div>

      )}
    </div>
  );
};

export default UserManagement;
