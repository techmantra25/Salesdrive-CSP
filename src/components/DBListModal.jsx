import { Modal } from "flowbite-react";

export const DBListModal = ({
  openDBListModal,
  setOpenDBListModal,
  DBList,
}) => {
  return (
    <Modal
      show={openDBListModal}
      onClose={() => setOpenDBListModal(false)}
      size="md"
    >
      <Modal.Header>
        <div className="flex justify-between items-center w-full">
          <h1 className="text-2xl font-bold">Distributor Mapped</h1>
        </div>
      </Modal.Header>
      <Modal.Body>
        {DBList?.distributorId?.length > 0 ? (
          DBList?.distributorId.map((dist, index) => (
            <div
              key={dist._id}
              className="flex gap-2 justify-start text-black dark:text-white font-semibold"
            >
              <span className="text-sm">
                {index + 1}. {dist.name} ({dist.dbCode})
              </span>
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-gray-500">
            No distributors found.
          </p>
        )}
      </Modal.Body>
    </Modal>
  );
};
