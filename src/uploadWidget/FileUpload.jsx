import { Button, Modal } from "flowbite-react";
import { useState } from "react";
import { BiSolidFileImport } from "react-icons/bi";
import { FileInput, Label } from "flowbite-react";
import { FileUploadSvg } from "../assets/svg/Svg";
import { IoMdRemoveCircleOutline } from "react-icons/io";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../constants";
import axios from "axios";
import {
  FaFileAlt,
  FaFileCsv,
  FaFileImage,
  FaFilePdf,
  FaFileVideo,
  FaFileWord,
  FaRegCopy,
} from "react-icons/fa";

export const FileUpload = ({
  type,
  page,
  onSetFileUrl,
  btnTitle = "File Upload",
  size = "md",
  btnClassName = "",
}) => {
  if (type === "single-file" && page === "bulk-import") {
    return (
      <SingleFileBulkImport
        onSetFileUrl={onSetFileUrl}
        btnTitle={btnTitle}
        size={size}
        btnClassName={btnClassName}
      />
    );
  }
  if (type === "single-image" && page === "modal-form") {
    return <SingleImageModalForm onSetFileUrl={onSetFileUrl} size={size} />;
  }
  if (type === "single-file" && page === "pdf-upload") {
    return <SingleFilePdfUpload onSetFileUrl={onSetFileUrl} size={size} />;
  }
  if (type === "multi-image" && page === "modal-form") {
    return <MultiImageModalForm onSetFileUrl={onSetFileUrl} size={size} />;
  }
  if (type === "single-file" && page === "modal-form") {
    return <SingleFileModalForm onSetFileUrl={onSetFileUrl} size={size} />;
  }
  return null;
};

const SingleFileBulkImport = ({ onSetFileUrl, btnTitle, size, btnClassName }) => {
  const [modelOpen, setModelOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileUpload = async (e) => {
    try {
      setLoading(true);
      const file = e.target.files[0];
      if (!file) {
        toast.error("No file selected!");
        return;
      }
      const formData = new FormData();
      formData.append("my_file", file);

      const res = await axios.post(
        BACKEND_URL + "/api/v1/cloudinary/upload",
        formData
      );
      setFileUrl(res?.data?.secure_url);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file!");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFileUrl(null);
    document.getElementById("dropzone-file").value = "";
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(fileUrl);
    toast.success("URL copied to clipboard!");
  };

  return (
    <>
      <Button
        size={size}
        color="warning"
        onClick={() => setModelOpen(true)}
        className={`text-xs ${btnClassName} !bg-opacity-100`}
      >
        <span className="flex justify-center items-center gap-2 whitespace-nowrap">
          <BiSolidFileImport size={size === "xs" ? 15 : 20} />
          {btnTitle}
        </span>
      </Button>

      {modelOpen && (
        <Modal
          show={modelOpen}
          onClose={() => {
            resetForm();
            setModelOpen(false);
          }}
        >
          <Modal.Header>File Upload Widget</Modal.Header>
          <Modal.Body>
            <div className="w-full flex justify-center items-center flex-col">
              <div className="flex w-full items-center justify-center">
                <Label
                  htmlFor="dropzone-file"
                  className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                >
                  <div className="flex flex-col items-center justify-center pb-4 pt-3">
                    <FileUploadSvg />
                    {!loading && (
                      <>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          File Type Supported : CSV
                        </p>
                      </>
                    )}
                    {loading && (
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Uploading...</span>
                      </p>
                    )}
                  </div>
                  <FileInput
                    id="dropzone-file"
                    className="hidden"
                    accept=".csv"
                    disabled={loading}
                    onChange={(e) => fileUpload(e)}
                  />
                </Label>
              </div>
              {fileUrl && (
                <div className="flex flex-col justify-center items-center gap-2 mt-4">
                  <div className="flex items-center gap-2 justify-center flex-col">
                    <div>
                      <FaFileCsv
                        className="text-2xl text-green-500"
                        size={30}
                      />
                    </div>
                    <div className="flex justify-center items-center gap-1">
                      <IoMdRemoveCircleOutline
                        size={20}
                        className="cursor-pointer"
                        onClick={resetForm}
                        color="red"
                      />
                      <FaRegCopy
                        size={15}
                        className="cursor-pointer"
                        onClick={copyUrl}
                        color="yellow"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => {
                onSetFileUrl(fileUrl);
                resetForm();
                setModelOpen(false);
              }}
            >
              Save
            </Button>
            <Button
              color="gray"
              onClick={() => {
                resetForm();
                setModelOpen(false);
              }}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

const SingleImageModalForm = ({ onSetFileUrl }) => {
  const [modelOpen, setModelOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fileUpload = async (e) => {
    try {
      setLoading(true);
      const file = e.target.files[0];
      if (!file) {
        toast.error("No file selected!");
        return;
      }
      const formData = new FormData();
      formData.append("my_file", file);

      const res = await axios.post(
        BACKEND_URL + "/api/v1/cloudinary/upload",
        formData
      );

      onSetFileUrl(res?.data?.secure_url);
      setModelOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file!");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    document.getElementById("dropzone-file").value = "";
  };

  return (
    <>
      <button
        type="button"
        className="block outline-none p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        onClick={() => setModelOpen(true)}
      >
        Upload
      </button>

      {modelOpen && (
        <Modal
          show={modelOpen}
          onClose={() => {
            resetForm();
            setModelOpen(false);
          }}
        >
          <Modal.Header>File Upload Widget</Modal.Header>
          <Modal.Body>
            <div className="w-full flex justify-center items-center flex-col">
              <div className="flex w-full items-center justify-center">
                <Label
                  htmlFor="dropzone-file"
                  className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                >
                  <div className="flex flex-col items-center justify-center *:pb-4 pt-3">
                    <FileUploadSvg />
                    {!loading && (
                      <>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          File Type Supported : Image (png, jpg, jpeg)
                        </p>
                      </>
                    )}
                    {loading && (
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Uploading...</span>
                      </p>
                    )}
                  </div>
                  <FileInput
                    id="dropzone-file"
                    className="hidden"
                    accept=".png, .jpg, .jpeg"
                    disabled={loading}
                    onChange={(e) => fileUpload(e)}
                    onClick={(e) => (e.target.value = null)}
                  />
                </Label>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

const MultiImageModalForm = ({ onSetFileUrl }) => {
  const [modelOpen, setModelOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fileUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) {
      toast.error("No files selected!");
      return;
    }

    setLoading(true);

    try {
      const uploadedUrls = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("my_file", file);

        const res = await axios.post(
          BACKEND_URL + "/api/v1/cloudinary/upload",
          formData
        );

        if (res?.data?.secure_url) {
          uploadedUrls.push(res.data.secure_url);
        }
      }

      if (uploadedUrls.length > 0) {
        onSetFileUrl(uploadedUrls); // always pass array
        toast.success("Images uploaded successfully!");
      } else {
        toast.warning("No images uploaded.");
      }

      resetForm();
      setModelOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload images!");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    const input = document.getElementById("dropzone-file");
    if (input) input.value = "";
  };

  return (
    <>
      <button
        type="button"
        className="block outline-none p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        onClick={() => setModelOpen(true)}
      >
        Upload Images
      </button>

      {modelOpen && (
        <Modal
          show={modelOpen}
          onClose={() => {
            resetForm();
            setModelOpen(false);
          }}
        >
          <Modal.Header>Upload Multiple Images</Modal.Header>
          <Modal.Body>
            <div className="w-full flex justify-center items-center flex-col">
              <Label
                htmlFor="dropzone-file"
                className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
              >
                <div className="flex flex-col items-center justify-center *:pb-4 pt-3">
                  <FileUploadSvg />
                  {!loading ? (
                    <>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Supported: PNG, JPG, JPEG
                      </p>
                    </>
                  ) : (
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Uploading...</span>
                    </p>
                  )}
                </div>
                <FileInput
                  id="dropzone-file"
                  className="hidden"
                  accept=".png, .jpg, .jpeg"
                  disabled={loading}
                  onChange={fileUpload}
                  multiple
                />
              </Label>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default MultiImageModalForm;

const SingleFilePdfUpload = ({ onSetFileUrl }) => {
  const [modelOpen, setModelOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileUpload = async (e) => {
    try {
      setLoading(true);
      const file = e.target.files[0];
      if (!file) {
        toast.error("No file selected!");
        return;
      }
      const formData = new FormData();
      formData.append("my_file", file);

      const res = await axios.post(
        BACKEND_URL + "/api/v1/cloudinary/upload",
        formData
      );

      if (res?.data?.resource_type === "raw") {
        setFileUrl(res?.data?.url);
        toast.success("File uploaded successfully!");
      } else {
        toast.error("Failed to upload file!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file!");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFileUrl(null);
    document.getElementById("dropzone-file").value = "";
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(fileUrl);
    toast.success("URL copied to clipboard!");
  };

  return (
    <>
      <button
        type="button"
        className="block outline-none p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        onClick={() => setModelOpen(true)}
      >
        Upload
      </button>

      {modelOpen && (
        <Modal
          show={modelOpen}
          onClose={() => {
            resetForm();
            setModelOpen(false);
          }}
        >
          <Modal.Header>File Upload Widget</Modal.Header>
          <Modal.Body>
            <div className="w-full flex justify-center items-center flex-col">
              <div className="flex w-full items-center justify-center">
                <Label
                  htmlFor="dropzone-file"
                  className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                >
                  <div className="flex flex-col items-center justify-center pb-4 pt-3">
                    <FileUploadSvg />
                    {!loading && (
                      <>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          File Type Supported : PDF
                        </p>
                      </>
                    )}
                    {loading && (
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Uploading...</span>
                      </p>
                    )}
                  </div>
                  <FileInput
                    id="dropzone-file"
                    className="hidden"
                    accept=".pdf"
                    disabled={loading}
                    onChange={(e) => fileUpload(e)}
                  />
                </Label>
              </div>
              {fileUrl && (
                <div className="flex flex-col justify-center items-center gap-2 mt-4">
                  <div className="flex items-center gap-2 justify-center flex-col">
                    <div>
                      <FaFilePdf
                        className="text-2xl text-green-500"
                        size={30}
                      />
                    </div>
                    <div className="flex justify-center items-center gap-1">
                      <IoMdRemoveCircleOutline
                        size={20}
                        className="cursor-pointer"
                        onClick={resetForm}
                        color="red"
                      />
                      <FaRegCopy
                        size={15}
                        className="cursor-pointer"
                        onClick={copyUrl}
                        color="yellow"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => {
                onSetFileUrl(fileUrl);
                resetForm();
                setModelOpen(false);
              }}
            >
              Save
            </Button>
            <Button
              color="gray"
              onClick={() => {
                resetForm();
                setModelOpen(false);
              }}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

const SingleFileModalForm = ({ onSetFileUrl }) => {
  const [modelOpen, setModelOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState(null); // State to hold the uploaded file URL temporarily
  const [loading, setLoading] = useState(false);

  const fileUpload = async (e) => {
    try {
      setLoading(true);
      const file = e.target.files[0];
      if (!file) {
        toast.error("No file selected!");
        return;
      }
      const formData = new FormData();
      formData.append("my_file", file);

      const res = await axios.post(
        BACKEND_URL + "/api/v1/cloudinary/upload",
        formData
      );

      // Check the resource type from Cloudinary response
      if (res?.data?.secure_url) {
        // For image and video, use secure_url
        setFileUrl(res.data.secure_url);
        toast.success("File uploaded successfully!");
      } else if (res?.data?.url && res?.data?.resource_type === "raw") {
        // For raw files like PDF, use the 'url' property
        setFileUrl(res.data.url);
        toast.success("File uploaded successfully!");
      } else {
        toast.error("Failed to upload file!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file!");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFileUrl(null); // Clear the temporary URL state
    const input = document.getElementById("dropzone-file-single-file-modal"); // Use a unique ID
    if (input) input.value = "";
  };

  const copyUrl = () => {
    if (fileUrl) {
      navigator.clipboard.writeText(fileUrl);
      toast.success("URL copied to clipboard!");
    }
  };

  const getFileIcon = (url) => {
    if (!url) return null;
    const lowerCaseUrl = url.toLowerCase();
    if (lowerCaseUrl.includes(".pdf"))
      return <FaFilePdf className="text-2xl text-red-500" size={30} />;
    if (lowerCaseUrl.match(/\.(jpeg|jpg|png|gif|bmp|webp)$/))
      return <FaFileImage className="text-2xl text-blue-500" size={30} />;
    if (lowerCaseUrl.match(/\.(mp4|webm|ogg|avi|mov|flv|wmv)$/))
      return <FaFileVideo className="text-2xl text-green-500" size={30} />;
    if (lowerCaseUrl.match(/\.(doc|docx|txt|xls|xlsx)$/))
      return <FaFileWord className="text-2xl text-blue-700" size={30} />;
    return <FaFileAlt className="text-2xl text-gray-500" size={30} />; // fallback generic file icon
  };

  return (
    <>
      <button
        type="button"
        className="block outline-none p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        onClick={() => setModelOpen(true)}
      >
        Upload
      </button>

      {modelOpen && (
        <Modal
          show={modelOpen}
          onClose={() => {
            resetForm();
            setModelOpen(false);
          }}
        >
          <Modal.Header>File Upload Widget</Modal.Header>
          <Modal.Body>
            <div className="w-full flex justify-center items-center flex-col">
              <div className="flex w-full items-center justify-center">
                <Label
                  htmlFor="dropzone-file-single-file-modal" // Use a unique ID
                  className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                >
                  <div className="flex flex-col items-center justify-center pb-4 pt-3">
                    <FileUploadSvg />
                    {!loading && (
                      <>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          File Type Supported : Image, PDF, Video, Docs
                        </p>
                      </>
                    )}
                    {loading && (
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Uploading...</span>
                      </p>
                    )}
                  </div>
                  <FileInput
                    id="dropzone-file-single-file-modal" // Use a unique ID
                    className="hidden"
                    accept=".pdf, .doc, .docx, .txt, .xls, .xlsx, image/*, video/*" // Accept different file types
                    disabled={loading}
                    onChange={(e) => fileUpload(e)}
                  />
                </Label>
              </div>
              {fileUrl && (
                <div className="flex flex-col justify-center items-center gap-2 mt-4">
                  <div className="flex items-center gap-2 justify-center flex-col">
                    {getFileIcon(fileUrl)} {/* Display file icon */}
                    <div className="flex justify-center items-center gap-1">
                      <IoMdRemoveCircleOutline
                        size={20}
                        className="cursor-pointer"
                        onClick={resetForm}
                        color="red"
                      />
                      <FaRegCopy
                        size={15}
                        className="cursor-pointer"
                        onClick={copyUrl}
                        color="yellow"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => {
                onSetFileUrl(fileUrl); // Pass the temporary URL back to the parent
                resetForm();
                setModelOpen(false);
              }}
              disabled={!fileUrl} // Disable save button if no file is uploaded
            >
              Save
            </Button>
            <Button
              color="gray"
              onClick={() => {
                resetForm();
                setModelOpen(false);
              }}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};
