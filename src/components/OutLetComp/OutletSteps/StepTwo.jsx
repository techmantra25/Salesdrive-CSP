import { TextInput, Button, Label } from "flowbite-react";

const StepTwo = ({ formData, setFormData, nextStep, prevStep }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-wrap gap-4 w-full max-w-4/5">
      {/* <h2 className="text-2xl font-semibold mb-4 text-center">
        2. Contact Information
      </h2> */}

      <div className="flex-1 min-w-[500px]">
        <Label htmlFor="outletName" value="Outlet Name" />
        <TextInput
          id="outletName"
          name="outletName"
          placeholder="Enter Outlet Name"
          value={formData?.outletName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex-1 min-w-[500px]">
        <Label htmlFor="" value="Owner Name" />
        <TextInput
          id="ownerName"
          name="ownerName"
          placeholder="Enter Owner Name"
          value={formData?.ownerName}
          onChange={handleChange}
          required
        />
      </div>

      {formData?.outletCode && (
        <div className="flex-1 min-w-[500px]">
          <Label htmlFor="" value="Outlet Code" />
          <TextInput
            id="outletCode"
            name="outletCode"
            placeholder="Enter Outlet Code"
            value={formData?.outletCode}
            onChange={handleChange}
            required
          />
        </div>
      )}

      {formData?.outletUID && (
        <div className="flex-1 min-w-[500px]">
          <Label htmlFor="" value="Outlet UID" />
          <TextInput
            id="outletUUID"
            name="outletUUID"
            placeholder="Enter Outlet uuid"
            value={formData?.outletUID}
            onChange={handleChange}
            required
          />
        </div>
      )}

      {/* <div className="flex-1 min-w-[500px]">
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
      </div> */}

      <div className="flex-1 min-w-[500px]">
        <Label htmlFor="mobile1" value="Mobile Number" />
        <TextInput
          id="mobile1"
          name="mobile1"
          placeholder="Enter Primary Mobile Number"
          value={formData.mobile1}
        />
      </div>

      <div className="flex-1 min-w-[500px]">
        <Label htmlFor="mobile2" value="Alternative Mobile Number/WhatsApp" />
        <TextInput
          id="mobile2"
          name="mobile2"
          placeholder="Enter Secondary Mobile Number"
          value={formData.mobile2}
          onChange={handleChange}
        />
      </div>

    
      <div className="flex-1 min-w-[500px]">
        <Label htmlFor="teleCallingSlot" value="Tele Calling Slot" />
        <TextInput
          id="teleCallingSlot"
          name="teleCallingSlot"
          placeholder="Enter Preferred Tele Calling Slot"
          value={formData?.teleCallingSlot}
          readOnly
          onChange={handleChange}
        />
      </div>

      <div className="flex-1 min-w-[500px]">
        <Label htmlFor="preferredLanguage" value="Preferred Language" />
        <TextInput
          id="preferredLanguage"
          name="preferredLanguage"
          placeholder="Enter Preferred Language"
          value={formData?.preferredLanguage}
          readOnly
          onChange={handleChange}
        />
      </div>

      <div className="flex-1 min-w-[500px]">
        <Label htmlFor="teleCallDay" value="Tele Call Day" />
        <TextInput
          id="teleCallDay"
          name="teleCallDay"
          placeholder="Enter Preferred Tele Call Day"
          value={formData?.teleCallDay}
          readOnly
          onChange={handleChange}
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

export default StepTwo;
