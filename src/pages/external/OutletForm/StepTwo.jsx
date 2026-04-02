import { TextInput, Button, Label } from "flowbite-react";

const StepTwo = ({ formData, setFormData, nextStep, prevStep }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col gap-4 w-1/2 max-w-4/5">
      {/* <h2 className="text-2xl font-semibold mb-4 text-center">
        2. Contact Information
      </h2> */}

      <div>
        <Label htmlFor="mobile1" value="Mobile 1" />
        <TextInput
          id="mobile1"
          name="mobile1"
          placeholder="Enter Primary Mobile Number"
          value={formData.mobile1}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="mobile2" value="Mobile 2" />
        <TextInput
          id="mobile2"
          name="mobile2"
          placeholder="Enter Secondary Mobile Number"
          value={formData.mobile2}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label htmlFor="whatsappNumber" value="WhatsApp Number" />
        <TextInput
          id="whatsappNumber"
          name="whatsappNumber"
          placeholder="Enter WhatsApp Number"
          value={formData.whatsappNumber}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label htmlFor="teleCallingSlot" value="Tele Calling Slot" />
        <TextInput
          id="teleCallingSlot"
          name="teleCallingSlot"
          placeholder="Enter Preferred Tele Calling Slot"
          value={formData.teleCallingSlot}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label htmlFor="preferredLanguage" value="Preferred Language" />
        <TextInput
          id="preferredLanguage"
          name="preferredLanguage"
          placeholder="Enter Preferred Language"
          value={formData.preferredLanguage}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label htmlFor="teleCallDay" value="Tele Call Day" />
        <TextInput
          id="teleCallDay"
          name="teleCallDay"
          placeholder="Enter Preferred Tele Call Day"
          value={formData.teleCallDay}
          onChange={handleChange}
        />
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

export default StepTwo;
