import { useState } from "react";
import StepOne from "./OutletSteps/StepOne";
import StepTwo from "./OutletSteps/StepTwo";
import StepThree from "./OutletSteps/StepThree";
import StepFour from "./OutletSteps/StepFour";
import StepFive from "./OutletSteps/StepFive";
import StepSix from "./OutletSteps/StepSix";
import { useLocation } from "react-router-dom";
import { MdOutlineDone } from "react-icons/md";

export const OutletComp = ({ formData, setFormData, gotoFirstStep }) => {
  const location = useLocation();
  const externalForm = location.pathname === "/form/outlet-form";

  const [step, setStep] = useState(1);

  //     outletCode: "",
  //     outletName: "",
  //     outletUID: "",
  //     ownerName: "",
  //     pin: "",
  //     district: "",
  //     zone: "default",
  //     region: "default",
  //     state: "default",
  //     mobile1: "",
  //     mobile2: "",
  //     whatsappNumber: "",
  //     teleCallingSlot: "",
  //     preferredLanguage: "",
  //     teleCallDay: "",
  //     address1: "",
  //     address2: "",
  //     marketCenter: "",
  //     city: "",
  //     location: "",
  //     aadharNumber: "",
  //     panNumber: "",
  //     gstin: "",
  //     categoryOfOutlet: "",
  //     productCategory: "",
  //     sellingBrands: [],
  //     competitorBrands: "",
  //     existingRetailer: false,
  //     outletStatus: "",
  //     approvedDate: "",
  //     enrolledByUser: "",
  //     leadStatus: "",
  //     outletSource: "",
  //     poaFrontImage: "",
  //     poaBackImage: "",
  //     enrollmentForm: "",
  //     poiFrontImage: "",
  //     poiBackImage: "",
  //     outletImage: "",
  //   });

  const nextStep = () => setStep((prevStep) => prevStep + 1);
  const prevStep = () => setStep((prevStep) => prevStep - 1);

  const handleSubmit = () => {
    const payload = {
      ...formData,
      competitorBrands: formData.competitorBrands
        .split(",")
        .filter((brand) => brand.trim() !== "")
        .map((brand) => brand.trim()),
    };
    console.log("Form submitted with the following data:", payload);
  };
  const totalSteps = [
    { title: "Lead Details", component: <StepOne /> },
    { title: "Outlet Details", component: <StepTwo /> },
    { title: "Location & Address", component: <StepThree /> },
    { title: "Legal Information", component: <StepFour /> },
    { title: "Outlet Categorization", component: <StepFive /> },
    // { title: "Final Details", component: <StepSix /> },
  ]; // Total number of steps



  return (
    <div
      className={`flex justify-start items-center flex-col gap-2 w-full dark:bg-gray-900 dark:text-white ${
        externalForm ? "min-h-screen" : ""
      }`}
    >
      {/* Progress Bar */}
      <div className="w-4/5 px-4 mt-4 mb-2">
        <ProgressBar currentStep={step} totalSteps={totalSteps} setStep={setStep} />
      </div>

      {/* Form content */}
      <div className="flex justify-start items-center flex-col gap-2 w-full p-4 mt-4">
        {step === 1 && (
          <StepOne
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
          />
        )}
        {step === 2 && (
          <StepTwo
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}
        {step === 3 && (
          <StepThree
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}
        {step === 4 && (
          <StepFour
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}
        {step === 5 && (
          <StepFive
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}
        {step === 6 && (
          <StepSix
            formData={formData}
            setFormData={setFormData}
            prevStep={prevStep}
            handleSubmit={handleSubmit}
            setStep={setStep}
          />
        )}
      </div>
    </div>
  );
};

export default OutletComp;

const ProgressBar = ({ currentStep, totalSteps , setStep }) => {
  const percentage = (currentStep / totalSteps?.length) * 100;

  return (
    <div className="w-full">
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between  mt-3">
        {totalSteps?.map((step, index) => (
          <span
            key={index}
            className={`${
              index + 1 === currentStep
                ? "font-bold text-blue-600 text-md hover:text-yellow-400 cursor-pointer"
                : "text-gray-400 text-sm hover:text-yellow-400 cursor-pointer"
            }`}
            onClick={() => setStep(index + 1)}
          >
            {step.title}{" "}
          </span>
        ))}
      </div>
    </div>
  );
};
