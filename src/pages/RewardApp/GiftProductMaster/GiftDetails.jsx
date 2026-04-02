import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Button,
  Badge,
} from "flowbite-react";
import { useState, useEffect } from "react";

const GiftDetails = ({ openModal, setOpenModal, product }) => {
  const [activeImage, setActiveImage] = useState(product.image?.[0]);

  useEffect(() => {
    setActiveImage(product.image?.[0]);
  }, [product]);

  console.log("product", product);

  return (
    <Modal
      show={openModal}
      size="5xl"
      onClose={() => setOpenModal(false)}
      popup
    >
      <ModalHeader className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
      <ModalBody>
        <div className="space-y-4 p-4 bg-white dark:bg-gray-900">
          {/* Badge + Points */}
          <div className="flex items-center justify-between mt-0 mb-2 p-2">
            <Badge color={product.status === "active" ? "success" : "failure"}>
              {product.status?.toUpperCase()}
            </Badge>
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Points:{" "}
              <span className="text-blue-600 dark:text-blue-400">
                {product.point}
              </span>
            </div>
          </div>

          {/* Image & Description */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Images */}
            <div className="flex-1">
              <img
                src={activeImage}
                alt="Main"
                className="rounded-lg w-full h-auto object-cover shadow-md"
              />
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {product.image.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Thumb ${i}`}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                      activeImage === img
                        ? "border-blue-600"
                        : "border-transparent"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right: Description */}
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {product.name}
              </h1>
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">
                Description
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {product.description}
              </p>
            </div>
          </div>

          {/* Specifications Table */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Specifications
            </h3>
            <Table hoverable striped>
              <Table.Head className="bg-gray-100 dark:bg-gray-700">
                <Table.HeadCell className="text-gray-900 dark:text-white">
                  Title
                </Table.HeadCell>
                <Table.HeadCell className="text-gray-900 dark:text-white">
                  Value
                </Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {product.specifications.map((spec) => (
                  <Table.Row
                    key={spec._id}
                    className="bg-white dark:bg-gray-800"
                  >
                    <Table.Cell className="font-medium text-gray-900 dark:text-white">
                      {spec.title}
                    </Table.Cell>
                    <Table.Cell className="text-gray-700 dark:text-gray-300">
                      {spec.value}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </div>
      </ModalBody>
      <ModalFooter className="bg-white dark:bg-gray-800">
        <Button onClick={() => setOpenModal(false)}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

export default GiftDetails;
