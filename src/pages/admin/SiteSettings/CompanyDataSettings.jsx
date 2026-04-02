import {
    Label,
    TextInput
} from "flowbite-react";
import { FileUpload } from "../../../uploadWidget/FileUpload";

const CompanyDataSettings = ({ formData, setFormData, handleChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 block">
          <Label htmlFor="companyName" value="Company Name" />
        </div>
        <TextInput
          id="companyName"
          name="commonSettings.companyName"
          value={formData.commonSettings?.companyName || ""}
          onChange={handleChange}
          placeholder="Enter company name"
        />
      </div>{" "}
      <div>
        <div className="mb-2 block">
          <Label htmlFor="companyLogo" value="Company Logo" />
        </div>
        <div className="space-y-2">
          {formData.commonSettings?.companyLogo && (
            <div className="flex flex-col items-start gap-2">
              <img
                src={formData.commonSettings.companyLogo}
                alt="Company Logo"
                className="w-32 h-32 object-contain border rounded p-1"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <TextInput
              id="companyLogo"
              name="commonSettings.companyLogo"
              value={formData.commonSettings?.companyLogo || ""}
              onChange={handleChange}
              placeholder="Enter company logo URL"
              className="flex-1"
            />
            <FileUpload
              onSetFileUrl={(url) => {
                setFormData({
                  ...formData,
                  commonSettings: {
                    ...formData.commonSettings,
                    companyLogo: url,
                  },
                });
              }}
              type="single-image"
              page="modal-form"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDataSettings;
