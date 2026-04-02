import { Modal } from "flowbite-react";

export const BrandListModal = ({
  openBrandsModal,
  setOpenBrandsModal,
  brandList,
}) => {
  return (
    <Modal
      show={openBrandsModal}
      onClose={() => setOpenBrandsModal(false)}
      size="md"
    >
      <Modal.Header>
        <div className="flex justify-between items-center w-full">
          <h1 className="text-2xl font-bold">Brand Mapped</h1>
        </div>
      </Modal.Header>
      <Modal.Body>
        {brandList?.brandId?.length > 0 ? (
          brandList?.brandId.map((brand, index) => (
            <div
              key={brand._id}
              className="flex gap-2 justify-start text-black dark:text-white font-semibold"
            >
              <span className="text-sm">
                {index + 1}. {brand?.name} ({brand?.desc})
              </span>
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-gray-500">No brands found.</p>
        )}
      </Modal.Body>
    </Modal>
  );
};
