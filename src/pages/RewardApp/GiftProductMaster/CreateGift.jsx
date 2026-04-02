import { Label, TextInput, Textarea, Button, Card, Select, Badge } from "flowbite-react";
import React from "react";
import { FileUpload } from "../../../uploadWidget/FileUpload";
import { IoMdRemoveCircleOutline, IoMdAddCircleOutline } from "react-icons/io";
import { FaRegCopy, FaBox, FaListUl, FaImage, FaInfoCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import { createGiftProduct } from "../../../api/rewardsApi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const CreateGift = () => {
  const role = useSelector((state) => state.permission?.data?.role);
  const navigate = useNavigate();
  // const [formData, setFormData] = React.useState({
  //   name: "",
  //   description: "",
  //   searchTerm: "",
  //   image: [],
  //   point: 0,
  //   specifications: [
  //     {
  //       title: "",
  //       value: "",
  //     },
  //   ],
  //   status: "active",
  // });

  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    searchTerm: "",
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

      let res = await createGiftProduct(filteredFormData);
      if (res?.data?.statusUpdateError) {
        toast.error("Something went wrong");
      } else {
        toast.success("Product created successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to create Product, try again");
    } finally {
      navigate(`/${role}/rbp-reward-products`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FaBox className="text-2xl text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Create New Product
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Add a new product to your rewards catalog
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <FaInfoCircle className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <Label htmlFor="name" value="Product Name *" />
              <TextInput
                id="name"
                name="name"
                placeholder="Enter an attractive product name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div className="lg:col-span-2">
              <Label htmlFor="description" value="Description *" />
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the product in detail"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="lg:col-span-2">
              <Label htmlFor="searchTerm" value="Search Terms" />
              <TextInput
                id="searchTerm"
                name="searchTerm"
                placeholder="Enter keywords for better search visibility (optional)"
                value={formData.searchTerm}
                onChange={handleChange}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add comma-separated keywords to help customers find this product
              </p>
            </div>

            <div>
              <Label htmlFor="point" value="Required Points *" />
              <TextInput
                id="point"
                name="point"
                type="number"
                placeholder="Points needed to redeem"
                value={formData.point}
                onClick={(e) => {
                  e.target.select();
                }}
                onChange={handleChange}
                required
                className="mt-1"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="status" value="Status *" />
              <Select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Images Section */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <FaImage className="text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Product Images
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label value="Image URLs" />
                <TextInput
                  value={formData?.image?.join(', ') || ""}
                  readOnly
                  placeholder="Images will appear here after upload"
                  className="mt-1"
                />
              </div>
              <FileUpload
                onSetFileUrl={(urls) => {
                  setFormData((prev) => ({
                    ...prev,
                    image: Array.isArray(urls) ? urls : [urls],
                  }));
                }}
                type="multi-image"
                page="modal-form"
              />
            </div>

            {formData.image && formData.image.length > 0 && (
              <div className="border-t pt-4">
                <Label value={`Uploaded Images (${formData.image.length})`} />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-3">
                  {formData.image.map((url, index) => (
                    <div
                      key={index}
                      className="relative group bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border"
                    >
                      <img
                        src={url}
                        alt={`Product Image ${index + 1}`}
                        className="w-full h-32 object-contain rounded-md"
                      />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(url);
                            toast.success("URL copied to clipboard!");
                          }}
                          className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                          title="Copy URL"
                        >
                          <FaRegCopy size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              image: prev.image.filter((_, i) => i !== index),
                            }));
                          }}
                          className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          title="Remove Image"
                        >
                          <IoMdRemoveCircleOutline size={12} />
                        </button>
                      </div>
                      <div className="mt-2 text-center">
                        <Badge color="gray" size="sm">
                          Image {index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Specifications Section */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <FaListUl className="text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Product Specifications
            </h2>
          </div>

          <div className="space-y-4">
            {formData.specifications.map((spec, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge color="purple" size="sm">
                    Specification {index + 1}
                  </Badge>
                  {formData.specifications.length > 1 && (
                    <Button
                      type="button"
                      color="failure"
                      size="xs"
                      onClick={() => removeSpecification(index)}
                    >
                      <IoMdRemoveCircleOutline className="mr-1" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label value="Specification Title" />
                    <TextInput
                      placeholder="e.g., Weight, Color, Size"
                      value={spec.title}
                      onChange={(e) =>
                        handleSpecificationChange(index, "title", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label value="Specification Value" />
                    <TextInput
                      placeholder="e.g., 500g, Red, Large"
                      value={spec.value}
                      onChange={(e) =>
                        handleSpecificationChange(index, "value", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-center pt-4">
              <Button
                type="button"
                color="gray"
                size="sm"
                onClick={addSpecification}
                className="flex items-center gap-2"
              >
                <IoMdAddCircleOutline />
                Add Specification
              </Button>
            </div>
          </div>
        </Card>

        {/* Submit Section */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              color="gray"
              onClick={() => navigate("/admin/rbp-reward-products")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              <FaBox className="mr-2" />
              Create Product
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateGift;
