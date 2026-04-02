import { useContext } from "react";
import { ConfirmationModelContext } from "../context/ContextProvider";

export const ConfirmationModal = () => {
  const { confirmationModel, confirmationModelData, closeConfirmationModel } =
    useContext(ConfirmationModelContext);

  return (
    <>
      {confirmationModel && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-70 z-[60]"></div>
          <div
            id="close-model"
            className="fixed inset-0 flex justify-center items-center sm:m-4 overflow-auto z-[70]"
          >
            <div className="bg-white dark:bg-gray-900 dark:text-white w-full p-4 m-4 rounded-lg shadow-lg max-w-sm">
              <div className="flex justify-center items-center flex-col gap-4">
                <div className="flex justify-center items-center gap-4">
                  <h1 className="text-xl font-bold text-center">
                    {confirmationModelData?.question ?? "Are you sure ?"}
                  </h1>
                </div>

                <div className="flex justify-center items-center gap-4 mt-4">
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex justify-center items-center gap-2 w-24"
                    onClick={() => {
                      confirmationModelData?.onClose(false);
                      closeConfirmationModel();
                    }}
                  >
                    {confirmationModelData?.answer[1] ?? "No"}
                  </button>
                  <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex justify-center items-center gap-2 w-24"
                    onClick={() => {
                      confirmationModelData?.onClose(true);
                      closeConfirmationModel();
                    }}
                  >
                    {confirmationModelData?.answer[0] ?? "Yes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
