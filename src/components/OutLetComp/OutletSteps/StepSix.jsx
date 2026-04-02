import { TextInput, Button, Label, Select } from "flowbite-react";
import { FileUpload } from "../../../uploadWidget/FileUpload";
import { MdOutlineOpenInNew } from "react-icons/md";

const StepSix = ({ formData, setFormData, prevStep, handleSubmit, setStep }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-wrap gap-4 w-full max-w-4/5">
      {/* <h2 className="text-2xl font-semibold mb-4 text-center">
        6. Final Details
      </h2> */}

      <div className="flex-1 min-w-[500px]">
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

      {/* <div className="flex-1 min-w-[500px]">
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
            value={formData?.poiFrontImage}
            onChange={handleChange}
          />
          <FileUpload
            type={"single-image"}
            page={"modal-form"}
            onSetFileUrl={(url) =>
              setFormData({ ...formData, poiFrontImage: url })
            }
          />
          <Button color="dark">
            <a href={formData?.poiFrontImage} target="_blank">
              <MdOutlineOpenInNew
                className="inline-block text-white"
                size={20}
              />
            </a>
          </Button>
        </div>
      </div>

      <div className="flex-1 min-w-[500px]">
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
            value={formData?.poiBackImage}
            onChange={handleChange}
          />
          <FileUpload
            type={"single-image"}
            page={"modal-form"}
            onSetFileUrl={(url) =>
              setFormData({ ...formData, poiBackImage: url })
            }
          />
          <Button color="dark">
            <a href={formData?.poiBackImage} target="_blank">
              <MdOutlineOpenInNew
                className="inline-block text-white"
                size={20}
              />
            </a>
          </Button>
        </div>
      </div>

      <div className="flex-1 min-w-[500px]">
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
            value={formData?.outletImage}
            onChange={handleChange}
          />
          <FileUpload
            type={"single-image"}
            page={"modal-form"}
            onSetFileUrl={(url) =>
              setFormData({ ...formData, outletImage: url })
            }
          />
          <Button color="dark">
            <a href={formData?.outletImage} target="_blank">
              <MdOutlineOpenInNew
                className="inline-block text-white"
                size={20}
              />
            </a>
          </Button>
        </div>
      </div>

      <div className="flex-1 min-w-[500px]">
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
            value={formData?.poaFrontImage}
            onChange={handleChange}
          />
          <FileUpload
            type={"single-image"}
            page={"modal-form"}
            onSetFileUrl={(url) =>
              setFormData({ ...formData, poaFrontImage: url })
            }
          />
          <Button color="dark">
            <a href={formData?.poaFrontImage} target="_blank">
              <MdOutlineOpenInNew
                className="inline-block text-white"
                size={20}
              />
            </a>
          </Button>
        </div>
      </div>

      <div className="flex-1 min-w-[500px]">
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
          <Button color="dark">
            <a href={formData?.poaBackImage} target="_blank">
              <MdOutlineOpenInNew
                className="inline-block text-white"
                size={20}
              />
            </a>
          </Button>
        </div>
      </div>

      <div className="flex-1 min-w-[500px]">
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
          <Button color="dark">
            <a href={formData?.enrollmentForm} target="_blank">
              <MdOutlineOpenInNew
                className="inline-block text-white"
                size={20}
              />
            </a>
          </Button>
        </div>
      </div> */}

      <div className="flex justify-between w-full gap-4">
        <Button color="gray" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={() => setStep(1)}>Go to Home</Button>
      </div>
    </div>
  );
};

export default StepSix;
