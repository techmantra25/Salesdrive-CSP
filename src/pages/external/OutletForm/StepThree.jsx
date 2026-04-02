import { TextInput, Button, Label, Select } from "flowbite-react";
import { FileUpload } from "../../../uploadWidget/FileUpload";

const StepThree = ({ formData, setFormData, nextStep, prevStep }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col justify-center gap-4 w-1/2 max-w-4/5">
      {/* <h2 className="text-2xl font-semibold mb-4 text-center">
       3. Location & Address
      </h2> */}

      <div>
        <Label htmlFor="aadharNumber" value="Aadhar Number" />
        <TextInput
          id="aadharNumber"
          name="aadharNumber"
          placeholder="Enter Aadhar Number"
          value={formData.aadharNumber}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label htmlFor="panNumber" value="PAN Number" />
        <TextInput
          id="panNumber"
          name="panNumber"
          placeholder="Enter PAN Number"
          value={formData.panNumber}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label htmlFor="gstin" value="GSTIN" />
        <TextInput
          id="gstin"
          name="gstin"
          placeholder="Enter GSTIN"
          value={formData.gstin}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label
          className="mb-2"
          htmlFor="existingRetailer"
          value="Existing Retailer (Yes/No)"
        />
        <Select
          id="existingRetailer"
          name="existingRetailer"
          value={formData.existingRetailer}
          onChange={handleChange}
        >
          <option value={true}>Yes</option>
          <option value={false}>No</option>
        </Select>
      </div>

      <div>
        <Label
          className="mb-2"
          htmlFor="poiFrontImage"
          value="POI - Front Image URL"
        />
        <div className="flex gap-2">
          <TextInput
            id="poiFrontImage"
            name="poiFrontImage"
            className="w-full"
            placeholder="Enter POI - Front Image URL"
            value={formData.poiFrontImage}
            onChange={handleChange}
          />
          <FileUpload
            type={"single-image"}
            page={"modal-form"}
            onSetFileUrl={(url) =>
              setFormData({ ...formData, poiFrontImage: url })
            }
          />
        </div>
      </div>

      <div>
        <Label
          className="mb-2"
          htmlFor="poiBackImage"
          value="POI - Back Image URL"
        />
        <div className="flex gap-2">
          <TextInput
            id="poiBackImage"
            name="poiBackImage"
            className="w-full"
            placeholder="Enter POI - Back Image URL"
            value={formData.poiBackImage}
            onChange={handleChange}
          />
          <FileUpload
            type={"single-image"}
            page={"modal-form"}
            onSetFileUrl={(url) =>
              setFormData({ ...formData, poiBackImage: url })
            }
          />
        </div>
      </div>

      <div>
        <Label
          className="mb-2"
          htmlFor="outletImage"
          value="Outlet Image URL"
        />

        <div className="flex gap-2">
          <TextInput
            id="outletImage"
            name="outletImage"
            className="w-full"
            placeholder="Enter Outlet Image URL"
            value={formData.outletImage}
            onChange={handleChange}
          />
          <FileUpload
            type={"single-image"}
            page={"modal-form"}
            onSetFileUrl={(url) =>
              setFormData({ ...formData, outletImage: url })
            }
          />
        </div>
      </div>

      <div>
        <Label
          className="mb-2"
          htmlFor="poaFrontImage"
          value="POA - Front Image URL"
        />
        <div className="flex gap-2">
          <TextInput
            id="poaFrontImage"
            name="poaFrontImage"
            className="w-full"
            placeholder="Enter POA - Front Image URL"
            value={formData.poaFrontImage}
            onChange={handleChange}
          />
          <FileUpload
            type={"single-image"}
            page={"modal-form"}
            onSetFileUrl={(url) =>
              setFormData({ ...formData, poaFrontImage: url })
            }
          />
        </div>
      </div>

      <div>
        <Label
          className="mb-2"
          htmlFor="poaBackImage"
          value="POA - Back Image URL"
        />
        <div className="flex gap-2">
          <TextInput
            id="poaBackImage"
            name="poaBackImage"
            placeholder="Enter POA - Back Image URL"
            className="w-full"
            value={formData.poaBackImage}
            onChange={handleChange}
          />
          <FileUpload
            type={"single-image"}
            page={"modal-form"}
            onSetFileUrl={(url) =>
              setFormData({ ...formData, poaBackImage: url })
            }
          />
        </div>
      </div>

      <div>
        <Label
          className="mb-2"
          htmlFor="enrollmentForm"
          value="Enrollment Form URL"
        />
        <div className="flex gap-2">
          <TextInput
            id="enrollmentForm"
            name="enrollmentForm"
            placeholder="Enter Enrollment Form URL"
            className="w-full"
            value={formData.enrollmentForm}
            onChange={handleChange}
          />
          <FileUpload
            type={"single-file"}
            page={"pdf-upload"}
            onSetFileUrl={(url) =>
              setFormData({ ...formData, enrollmentForm: url })
            }
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button color="gray" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={nextStep}>Next</Button>
      </div>
    </div>
  );
};

export default StepThree;
