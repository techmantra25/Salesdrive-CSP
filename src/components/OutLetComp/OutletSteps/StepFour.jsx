import { TextInput, Button, Label } from "flowbite-react";
import { FileUpload } from "../../../uploadWidget/FileUpload";
import { MdOutlineOpenInNew } from "react-icons/md";

const StepFour = ({ formData, setFormData, nextStep, prevStep }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-wrap gap-4 w-full max-w-4/5">
      {/* <h2 className="text-2xl font-semibold mb-4 text-center">4. Legal Information</h2> */}

      <div className="flex-1 min-w-[500px]">
        <Label htmlFor="aadharNumber" value="Aadhar Number" />
        <TextInput
          id="aadharNumber"
          name="aadharNumber"
          placeholder="Enter Aadhar Number"
          value={formData.aadharNumber}
          onChange={handleChange}
        />
      </div>

      <div className="flex-1 min-w-[500px]">
        <Label htmlFor="panNumber" value="PAN Number" />
        <TextInput
          id="panNumber"
          name="panNumber"
          placeholder="Enter PAN Number"
          value={formData.panNumber}
          onChange={handleChange}
        />
      </div>

      <div className="flex-1 min-w-[500px]">
        <Label htmlFor="gstin" value="GSTIN" />
        <TextInput
          id="gstin"
          name="gstin"
          placeholder="Enter GSTIN"
          value={formData.gstin}
          onChange={handleChange}
        />
      </div>

      <div className="flex-1 min-w-[500px]">
        <Label
          className="mb-2"
          htmlFor="poiFrontImage"
          value="POI - Front Image URL"
        />
        <div className="flex gap-2 justify-center items-center p-2 ">
          <a href={formData?.poiFrontImage} target="_blank">
            {formData?.poiFrontImage ? (
              <img
                src={formData?.poiFrontImage}
                alt="poiFrontImage"
                className="object-cover"
                width={200}
                height={200}
              />
            ) : (
              <img
                src={
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmPHzcn5CYAhWa0R61Mg4JMXwrHfv5I87gbBQ-dYiu9Lv9_HT9RRcPFqtHvXYA-2Gw5Ww&usqp=CAU"
                }
                alt="poiFrontImage"
                className="object-cover"
                width={40}
                height={40}
              />
            )}
          </a>
        </div>
      </div>

      <div className="flex-1 min-w-[500px]">
        <Label
          className="mb-2"
          htmlFor="poiBackImage"
          value="POI - Back Image URL"
        />
        <div className="flex gap-2 justify-center items-center p-2">
          <a href={formData?.poiBackImage} target="_blank">
            {formData?.poiBackImage ? (
              <img
                src={formData?.poiBackImage}
                alt="poiBackImage"
                className="object-cover"
                width={200}
                height={200}
              />
            ) : (
              <img
                src={
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmPHzcn5CYAhWa0R61Mg4JMXwrHfv5I87gbBQ-dYiu9Lv9_HT9RRcPFqtHvXYA-2Gw5Ww&usqp=CAU"
                }
                alt="poiBackImage"
                className="object-cover"
                width={200}
                height={200}
              />
            )}
          </a>
        </div>
      </div>

      <div className="flex-1 min-w-[500px]">
        <Label
          className="mb-2"
          htmlFor="outletImage"
          value="Outlet Image URL"
        />

        <div className="flex gap-2 justify-center items-center p-2">
          <a href={formData?.outletImage} target="_blank">
            {formData?.outletImage ? (
              <img
                src={formData?.outletImage}
                alt="outlet-image"
                className="object-cover"
                width={200}
                height={200}
              />
            ) : (
              <img
                src={
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmPHzcn5CYAhWa0R61Mg4JMXwrHfv5I87gbBQ-dYiu9Lv9_HT9RRcPFqtHvXYA-2Gw5Ww&usqp=CAU"
                }
                alt="outlet-image"
                className="object-cover"
                width={200}
                height={200}
              />
            )}
          </a>
        </div>
      </div>

      <div className="flex-1 min-w-[500px]">
        <Label
          className="mb-2"
          htmlFor="poaFrontImage"
          value="POA - Front Image URL"
        />
        <div className="flex gap-2 justify-center items-center p-2">
          <a href={formData?.poaFrontImage} target="_blank">
            {formData?.poaFrontImage ? (
              <img
                src={formData?.poaFrontImage}
                alt="poaFrontImage"
                className="object-cover"
                width={200}
                height={200}
              />
            ) : (
              <img
                src={
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmPHzcn5CYAhWa0R61Mg4JMXwrHfv5I87gbBQ-dYiu9Lv9_HT9RRcPFqtHvXYA-2Gw5Ww&usqp=CAU"
                }
                alt="poaFrontImage"
                className="object-cover"
                width={200}
                height={200}
              />
            )}
          </a>
        </div>
      </div>

      <div className="flex-1 min-w-[500px]">
        <Label
          className="mb-2"
          htmlFor="poaBackImage"
          value="POA - Back Image URL"
        />
        <div className="flex gap-2 justify-center items-center p-2">
          <a href={formData?.poaBackImage} target="_blank">
            {formData?.poaBackImage ? (
              <img
                src={formData?.poaBackImage}
                alt="poaBackImage"
                className="w-14 object-cover"
              />
            ) : (
              <img
                src={
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmPHzcn5CYAhWa0R61Mg4JMXwrHfv5I87gbBQ-dYiu9Lv9_HT9RRcPFqtHvXYA-2Gw5Ww&usqp=CAU"
                }
                alt="poaBackImage"
                className="object-cover"
                width={200}
                height={200}
              />
            )}
          </a>
        </div>
      </div>

      <div className="flex-1 min-w-[500px]">
        <Label
          className="mb-2"
          htmlFor="enrollmentForm"
          value="Enrollment Form URL"
        />
        <div className="flex gap-2 justify-center items-center p-2">
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
      </div>

      <div className="flex justify-between w-full gap-4">
        <Button color="gray" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={nextStep}>Next</Button>
      </div>
    </div>
  );
};

export default StepFour;
