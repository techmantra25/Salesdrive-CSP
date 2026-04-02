import { Label, TextInput, Textarea, Button, Card } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { FileUpload } from "../../../uploadWidget/FileUpload";
import { IoMdRemoveCircleOutline } from "react-icons/io";
import { FaRegCopy } from "react-icons/fa";
import toast from "react-hot-toast";
import {
  getGiftProductDetail,
  updateGiftProductDetail,
} from "../../../api/rewardsApi";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";



const EditGift = () => {
  const role = useSelector((state) => state.permission?.data?.role);

  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    // searchTerm: "",
    image: [],
    point: 0,
    specifications: [
      {
        title: "",
        value: "",
      },
    ],
    status: "active",
  });

  console.log("id", id);

  const [pageLoading, setPageLoading] = useState(true);

  async function fetchGiftProductDetail(id) {
    try {
      setPageLoading(true);
      const res = await getGiftProductDetail(id);
      console.log("res", res);
      setFormData(res?.data?.data);
    } catch (error) {
      console.error(error);
    } finally {
      setPageLoading(false);
    }
  }

  useEffect(() => {
    fetchGiftProductDetail(id);
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSpecificationChange = (index, field, value) => {
    const updatedSpecs = [...formData.specifications];
    updatedSpecs[index][field] = value;
    setFormData((prevState) => ({
      ...prevState,
      specifications: updatedSpecs,
    }));
  };

  const addSpecification = () => {
    setFormData((prevState) => ({
      ...prevState,
      specifications: [...prevState.specifications, { title: "", value: "" }],
    }));
  };

  const removeSpecification = (index) => {
    setFormData((prevState) => ({
      ...prevState,
      specifications: prevState.specifications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Filter out empty specifications
      const filteredFormData = {
        ...formData,
        specifications: formData.specifications.filter(
          (spec) => spec.title.trim() !== "" || spec.value.trim() !== ""
        ),
      };

      // If no valid specifications, don't send the specifications field
      if (filteredFormData.specifications.length === 0) {
        delete filteredFormData.specifications;
      }

      let res = await updateGiftProductDetail(id, filteredFormData);
      if (res?.data?.status == 200) {
        toast.success("Product updated successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to update Product, try again");
    } finally {
     navigate(`/${role}/rbp-reward-products`);

    }
  };

  console.log("formData", formData);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {!pageLoading ? (
        <Card>
          <h1 className="text-2xl font-bold text-gray-800 mb-6 dark:text-white">
            Update New Gift
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <Label htmlFor="name" value="Gift Name" />
              <TextInput
                id="name"
                name="name"
                placeholder="Enter Gift Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description Field */}
            <div>
              <Label htmlFor="description" value="Description" />
              <Textarea
                id="description"
                name="description"
                placeholder="Enter Gift Description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2">
              <TextInput
                id="image"
                name="image"
                value={formData?.image || ""}
                onChange={handleChange}
                placeholder="Upload product images"
                className="flex-1"
              />
              <FileUpload
                onSetFileUrl={(urls) => {
                  setFormData((prev) => ({
                    ...prev,
                    image: Array.isArray(urls) ? urls : [urls], // Always an array
                  }));
                }}
                type="multi-image"
                page="modal-form"
              />
            </div>

            <div className="flex items-center gap-2">
              {formData.image?.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 justify-center flex-col"
                >
                  <div>
                    <img
                      src={url}
                      alt="Product Image"
                      className="w-36 h-36 object-contain border rounded p-1"
                    />
                  </div>
                  <div className="flex justify-center items-center gap-4">
                    <IoMdRemoveCircleOutline
                      size={20}
                      className="cursor-pointer"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          image: prev.image.filter((_, i) => i !== index),
                        }));
                      }}
                      title="Remove"
                    />
                    <FaRegCopy
                      size={20}
                      className="cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(url);
                        toast.success("URL copied to clipboard!");
                      }}
                      title="Copy URL"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Points Field */}
            <div>
              <Label htmlFor="point" value="Points" />
              <TextInput
                id="point"
                name="point"
                type="number"
                placeholder="Enter Points"
                value={formData.point}
                onClick={(e) => {
                  e.target.select();
                }}
                onChange={handleChange}
                required
              />
            </div>

            {/* Specifications */}
            <div>
              <Label value="Specifications" />
              <div className="space-y-4">
                {formData.specifications.map((spec, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <div className="col-span-5">
                      <TextInput
                        placeholder="Title"
                        value={spec.title}
                        onChange={(e) =>
                          handleSpecificationChange(
                            index,
                            "title",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-span-5">
                      <TextInput
                        placeholder="Value"
                        value={spec.value}
                        onChange={(e) =>
                          handleSpecificationChange(
                            index,
                            "value",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-span-2 text-right">
                      <Button
                        type="button"
                        color="failure"
                        size="xs"
                        onClick={() => removeSpecification(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <div>
                  <Button
                    type="button"
                    color="gray"
                    size="sm"
                    onClick={addSpecification}
                  >
                    + Add Specification
                  </Button>
                </div>
              </div>
            </div>

            {/* Status Field */}
            <div>
              <Label htmlFor="status" value="Status" />
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full p-2 border border-gray-300 rounded-md text-black"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Submit Button */}
            <div>
              <Button type="submit" className="w-full">
                Update Gift
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <svg
            className="animate-spin h-10 w-10 text-gray-800 dark:text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              strokeWidth="4"
              stroke="currentColor"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4.22 4.22a10 10 0 0115.56 15.56A10 10 0 014.22 4.22z"
            ></path>
          </svg>
        </div>
      )}
    </div>
  );
};

export default EditGift;
