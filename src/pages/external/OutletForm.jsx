import { useState } from "react";
import StepOne from "./OutletForm/StepOne";
import StepTwo from "./OutletForm/StepTwo";
import StepThree from "./OutletForm/StepThree";
import StepFour from "./OutletForm/StepFour";
import StepFive from "./OutletForm/StepFive";
import StepSix from "./OutletForm/StepSix";
import { useLocation } from "react-router-dom";
import { MdOutlineDone } from "react-icons/md";
import StepInitiate from "./OutletForm/StepInitiate";
import { createOutlet } from "../../api/api";
import { fromJSON } from "postcss";
import toast from "react-hot-toast";

export const OutletForm = () => {
  const location = useLocation();
  const externalForm = location.pathname === "/form/outlet-form";

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // createdBy: "",
    // employeeId: "",
    // distributorId: "",
    // outletCode: "",
    // outletName: "",
    // outletUID: "",
    // ownerName: "",
    // pin: "",
    // district: "",
    // zone: "default",
    // region: "default",
    // state: "default",
    // mobile1: "",
    // mobile2: "",
    // whatsappNumber: "",
    // teleCallingSlot: "",
    // preferredLanguage: "",
    // teleCallDay: "",
    // address1: "",
    // address2: "",
    // marketCenter: "",
    // city: "",
    // location: "",
    // aadharNumber: "",
    // panNumber: "",
    // gstin: "",
    // categoryOfOutlet: "",
    // productCategory: "",
    // sellingBrands: [],
    // competitorBrands: "",
    // existingRetailer: false,
    // outletStatus: "",
    // approvedDate: "",
    // enrolledByUser: "",
    // leadStatus: "",
    // outletSource: "",
    // poaFrontImage: "",
    // poaBackImage: "",
    // enrollmentForm: "",
    // poiFrontImage: "",
    // poiBackImage: "",
    // outletImage: "",
  });

  const nextStep = () => setStep((prevStep) => prevStep + 1);
  const prevStep = () => setStep((prevStep) => prevStep - 1);

  const handleSubmit = async () => {
    console.log(formData, "formData");

    let DummyformData = {
      employeeId: "66c720f3c716ee06cfef3b42",
      createdBy: "66c720f3c716ee06cfef3b42",
      distributorId: "66b215e76709f22fbcca3624",
      outletName: "SuperMart-KOlKATA",
      ownerName: "SuperMart-KOlKATA",
      address1: "Address",
      address2: "Address",
      location: "Address",
      marketCenter: "Address",
      city: "Address",
      pin: "700091",
      district: "Address",
      mobile1: "7431860572",
      mobile2: "7431860572",
      whatsappNumber: "7431860572",
      teleCallingSlot: "7431860572",
      preferredLanguage: "TEST",
      teleCallDay: "TEST",
      aadharNumber: "TESTTEST",
      panNumber: "TESTTESTTESTTEST",
      gstin: "TESTTESTTESTTEST",
      existingRetailer: "false",
      poiFrontImage: "",
      poiBackImage: "",
      outletImage: "",
      categoryOfOutlet: "Economy",
      productCategory: "Outerwear",
      competitorBrands: "TESTTESTTESTTEST,TESTTESTTESTTEST,TESTTESTTEST",
      sellingBrands: ["66b215e76709f22fbcca3624"],
    };

    // console.log(formData, "formData");

    //Remove keys with empty string values
    for (const key in DummyformData) {
      if (DummyformData[key] === "") {
        delete DummyformData[key];
      }
    }

    let res = await createOutlet(DummyformData);
    console.log(res?.data?.data, "res");

    if (res?.data?.statusUpdateError) {
      toast.error("Status Not Updated dependency exist!");
    } else {
      toast.success("Status updated successfully");
    }
  };
  const totalSteps = [
    { title: "Lead Details", component: <StepInitiate /> },
    { title: "Outlet Details", component: <StepOne /> },
    { title: "Contact Information", component: <StepTwo /> },
    { title: "Legal Information ", component: <StepFour /> },
    { title: "Outlet Categorization", component: <StepFive /> },
    // { title: "Outlet Details", component: <StepOne /> },
    // { title: "Contact Information", component: <StepTwo /> },
    // { title: "Location & Address", component: <StepThree /> },
    // { title: "Legal Information", component: <StepFour /> },
    // { title: "Outlet Categorization", component: <StepFive /> },
    // { title: "Final Details", component: <StepSix /> },
  ]; // Total number of steps

  return (
    <div
      className={`flex justify-start items-center flex-col gap-2 w-full dark:bg-gray-900 dark:text-white ${
        externalForm ? "min-h-screen" : ""
      }`}
    >
      {/* Page header */}
      <div className="flex justify-between w-full items-center border-b-2 py-4">
        <div className="flex justify-center items-center">
          <h1 className="text-2xl font-bold">Outlet Form</h1>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-4/5 px-4 mt-4 mb-2">
        <ProgressBar currentStep={step} totalSteps={totalSteps} />
      </div>

      {/* Form content */}
      <div className="flex justify-start items-center flex-col gap-2 w-full p-4 mt-4">
        {step === 1 && (
          <StepInitiate
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
          />
        )}
        {step === 2 && (
          <StepOne
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}
        {step === 3 && (
          <StepTwo
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {step === 4 && (
          <StepThree
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {step === 5 && (
          <StepFour
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
            prevStep={prevStep}
            handleSubmit={handleSubmit}
          />
        )}
        {/*
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
          />
        )} */}
      </div>
    </div>
  );
};

export default OutletForm;

const ProgressBar = ({ currentStep, totalSteps }) => {
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
                ? "font-bold text-blue-600 text-lg"
                : "text-gray-400 text-sm"
            }`}
          >
            {step.title}{" "}
            <span className="text-blue-600">
              {index + 1 < currentStep && (
                <MdOutlineDone className="inline-block text-white" size={20} />
              )}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};
