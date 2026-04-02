import { TextInput, Button, Label } from "flowbite-react";

const StepThree = ({ formData, setFormData, nextStep, prevStep }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-wrap gap-4 w-full max-w-4/5">
      {/* <h2 className="text-2xl font-semibold mb-4 text-center">
       3. Location & Address
      </h2> */}

      <div className="flex-1 min-w-[500px]">
        <Label htmlFor="address1" value="Address1" />
        <TextInput
          id="address1"
          name="address1"
          placeholder="Enter Address"
          value={formData?.address1}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex-1 min-w-[500px]">
        <Label htmlFor="address2" value="Address2" />
        <TextInput
          id="address2"
          name="address2"
          placeholder="Enter Address"
          value={formData?.address2}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex-1 min-w-[500px]">
        <Label htmlFor="landmark" value="Landmark" />
        <TextInput
          id="landmark"
          name="landmark"
          placeholder="Enter Landmark"
          value={formData?.location}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex-1 min-w-[500px]">
        <Label htmlFor="marketCenter" value="Market Center" />
        <TextInput
          id="marketCenter"
          name="marketCenter"
          placeholder="Enter Market Center"
          value={formData?.marketCenter}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex-1 min-w-[500px]">
        <Label htmlFor="city" value="City/Village/Town" />
        <TextInput
          id="city"
          name="city"
          placeholder="Enter City"
          value={formData?.city}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex-1 min-w-[500px]">
        <Label htmlFor="pin" value="PIN Code" />
        <TextInput
          id="pin"
          name="pin"
          placeholder="Enter PIN Code"
          value={formData?.pin}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex-1 min-w-[500px]">
        <Label htmlFor="district" value="District" />
        <TextInput
          id="district"
          name="district"
          placeholder="Enter District"
          value={formData?.district}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex-1 min-w-[500px]">
        <Label htmlFor="gps" value="GPS Location" />
        <TextInput
          id="gps"
          name="gps"
          placeholder="Enter GPS Location"
          value={formData?.gps_loaction}
          onChange={handleChange}
          required
        />
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

export default StepThree;
