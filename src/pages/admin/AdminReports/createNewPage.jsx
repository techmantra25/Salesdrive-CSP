import { useState } from "react";
import { Button, Label, TextInput } from "flowbite-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { handleCreatePage } from "../../../api/api";

const CreateNewPage = () => {
  const { userInfo } = useSelector((state) => state.user);

  const emptyPage = {
    module: "",
    page: "",
    slug: "",
  };

  const [formData, setFormData] = useState(emptyPage);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.module || !formData.page || !formData.slug) {
      toast.error("Module, Page & Slug are required");
      return;
    }

    try {
      setLoading(true);

      // ❌ NO ORDER HERE
      const payload = {
        module: formData.module,
        page: formData.page,
        slug: formData.slug,
      };

      const res = await handleCreatePage(payload, userInfo?.token);

      toast.success(res?.message || "Page created");
      setFormData(emptyPage);

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create page"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-[#0f172a] p-6 rounded-xl border border-gray-700 shadow-lg">

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Create New Page
          </h2>
          <p className="text-sm text-gray-400">
            Configure a new system page
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5">

          <div className="col-span-2">
            <Label className="text-gray-300 mb-1 block">Module</Label>
            <TextInput
              placeholder="e.g. Reports"
              value={formData.module}
              onChange={(e) => handleChange("module", e.target.value)}
            />
          </div>

          <div>
            <Label className="text-gray-300 mb-1 block">Page Name</Label>
            <TextInput
              placeholder="Stock Report"
              value={formData.page}
              onChange={(e) => handleChange("page", e.target.value)}
            />
          </div>

          <div>
            <Label className="text-gray-300 mb-1 block">Slug</Label>
            <TextInput
              placeholder="stock-report"
              value={formData.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
            />
          </div>

        </div>

        <div className="flex justify-center mt-6">
          <Button onClick={handleSubmit} isProcessing={loading}>
            Create Page
          </Button>
        </div>

      </div>
    </div>
  );
};

export default CreateNewPage;