import {
  Button,
  Card,
  Modal,
  Select,
  Spinner,
  Table,
  TextInput,
} from "flowbite-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineArrowRight } from "react-icons/hi";
import { MdOutlineCancel } from "react-icons/md";
import { RiRefreshFill } from "react-icons/ri";
// import { getPurchasProductList } from "../../api/purchaseOrder";
import UniqueCode from "../../../assets/common/UniqueCode";
import { useDebounce } from "../../../hooks/useDebounce";
import { getPurchasProductList } from "../../../api/api";

export default function AdminPurchasProductModal({
  openModal,
  onCloseModal,
  searchTerm,
  orderProductList,
  setOrderProductList,
  currentDistributor,
}) {
  const [productList, setProductList] = useState([]);
  const [productLoading, setProductLoading] = useState(true);
  const [productSearch, setProductSearch] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  let filteredProductList = [...productList];

  const fetchProducts = async () => {
    try {
      setProductLoading(true);

      const payload = {
        page: currentPage,
        limit: 5,
        distributorId: currentDistributor?._id,
      };

      if (productSearch.trim() !== "") {
        payload.search = productSearch;
      }
      const res = await getPurchasProductList(payload);
      const productListData = res?.data?.data;
      console.log("productListData", productListData);
      setProductList([...productList, ...productListData]);
      setTotalPages(res?.data?.pagination?.totalPages);
    } catch {
      toast.error("Error fetching products");
      console.error("error");
    } finally {
      setProductLoading(false);
    }
  };

  const handleSearch = (e) => {
    handleResetFilter();
    setProductSearch(e.target.value);
  };

  const handleResetFilter = () => {
    setProductLoading(true);
    setProductList([]);
    setProductSearch("");
    debouncedFetchProducts();
    setCurrentPage(1);
    setTotalPages(0);
  };

  const debouncedFetchProducts = useDebounce(fetchProducts, 500);

  const isPresentInOrderProductList = (product) => {
    return orderProductList.find((ele) => ele?._id === product?._id);
  };

  const removeFromOrderProductList = (product) => {
    setOrderProductList(
      orderProductList.filter((ele) => ele?._id !== product?._id)
    );
  };

  const getBoxOrderQty = (product) => {
    return (
      orderProductList.find((ele) => ele?._id === product?._id)?.boxOrderQty ??
      ""
    );
  };

  const getInputValue = (product) => {
    const item = orderProductList.find((ele) => ele?._id === product?._id);
    if (!item) return "";

    return item.orderQty ?? "";
  };

  const getUOMValue = (product) => {
    return (
      orderProductList.find((ele) => ele?._id === product?._id)?.lineItemUOM ??
      "pcs"
    );
  };

  const getSuggestedOrderQty = (product) => {
    const Noms = Number(product?.productNorm?.salableQtyNorm) || 0;
    const available = Number(product?.inventory?.availableQty) || 0;
    const inTransit = Number(product?.inventory?.intransitQty) || 0;

    return Noms - (available + inTransit) <= 0
      ? 0
      : Noms - (available + inTransit);
  };

  const onLineItemUOMChange = (e, product) => {
    const newUOM = e.target.value;

    if (orderProductList.find((ele) => ele?._id === product?._id)) {
      let newOrderProductList = [...orderProductList];
      newOrderProductList = newOrderProductList.map((ele) => {
        if (ele?._id === product?._id) {
          const pcsPerBox = product?.no_of_pieces_in_a_box ?? 0;
          let newData = {
            ...ele,
            lineItemUOM: newUOM,
          };

          // If changing to box and orderQty exists, convert to boxes
          if (newUOM === "box" && ele?.orderQty > 0) {
            const boxOrderQty = Math.floor(ele?.orderQty / pcsPerBox);
            const orderQty = boxOrderQty * pcsPerBox;

            newData = {
              ...newData,
              boxOrderQty: boxOrderQty,
              orderQty: orderQty,
            };
          }

          // If changing to pcs and boxOrderQty exists, convert to pieces
          if (newUOM === "pcs" && ele?.boxOrderQty > 0) {
            const orderQty = ele?.boxOrderQty * pcsPerBox;
            newData = {
              ...newData,
              boxOrderQty: 0,
              orderQty: orderQty,
            };
          }

          return newData;
        }
        return ele;
      });
      setOrderProductList(newOrderProductList);
    }
  };

  const handleNext = () => {
    onCloseModal();
  };

  // const onPageChange = (page) => setCurrentPage(page);

  useEffect(() => {
    debouncedFetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSearch, currentPage]);

  useEffect(() => {
    setProductList([]);
    setCurrentPage(1);
  }, [productSearch]);

  return (
    <div>
      {/* modal  */}
      <Modal show={openModal} size={"7xl"} onClose={onCloseModal} popup>
        <Modal.Header className="bg-oWhite-100"></Modal.Header>
        <Modal.Body className="bg-oWhite-100">
          <div className="flex justify-center w-full items-center gap-2 flex-wrap p-4">
            <Card className="w-full flex justify-center items-center flex-col">
              <span className="flex justify-center items-center gap-2 flex-wrap">
                <TextInput
                  placeholder="Search Products by code or name"
                  className="p-1"
                  value={productSearch}
                  onChange={(e) => handleSearch(e)}
                />
                <Button
                  className="text-xs"
                  size="sm"
                  color="success"
                  onClick={handleResetFilter}
                >
                  <span className="flex justify-center items-center gap-2">
                    <RiRefreshFill size={20} />
                    Reset & Refresh
                  </span>
                </Button>
              </span>
            </Card>
          </div>
          {/* product list */}
          <div className="flex justify-start items-center flex-col gap-2 w-full p-4">
            <div className="overflow-x-auto w-full max-h-64">
              <Table striped>
                {" "}
                <Table.Head className="text-center">
                  <Table.HeadCell className="bg-gray-200 dark:bg-gray-800">
                    Product Code
                  </Table.HeadCell>
                  <Table.HeadCell className="bg-gray-200 dark:bg-gray-800">
                    Product Name
                  </Table.HeadCell>
                  <Table.HeadCell className="bg-gray-200 dark:bg-gray-800">
                    DLP
                  </Table.HeadCell>
                  <Table.HeadCell className="bg-gray-200 dark:bg-gray-800">
                    Inventory Qty (Salable)
                  </Table.HeadCell>
                  <Table.HeadCell className="bg-gray-200 dark:bg-gray-800">
                    Noms Qty
                  </Table.HeadCell>
                  <Table.HeadCell className="bg-gray-200 dark:bg-gray-800">
                    In Transit Qty
                  </Table.HeadCell>
                  <Table.HeadCell className="bg-gray-200 dark:bg-gray-800">
                    Suggested Order Qty
                  </Table.HeadCell>
                  <Table.HeadCell className="bg-gray-200 dark:bg-gray-800">
                    Action
                  </Table.HeadCell>
                  <Table.HeadCell className="bg-gray-200 dark:bg-gray-800">
                    UOM
                  </Table.HeadCell>
                  <Table.HeadCell className="bg-gray-200 dark:bg-gray-800">
                    Box Qty
                  </Table.HeadCell>
                  <Table.HeadCell className="bg-gray-200 dark:bg-gray-800">
                    Pcs Qty
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {filteredProductList.length > 0 &&
                    filteredProductList.map((product) => (
                      <Table.Row key={product?._id} className="text-center">
                        <Table.Cell className="text-gray-900 dark:text-gray-200 whitespace-nowrap p-2">
                          <UniqueCode
                            text={product?.product_code}
                            codeName="Product"
                          />
                        </Table.Cell>
                        <Table.Cell className="text-gray-900 dark:text-gray-200 whitespace-nowrap p-2">
                          {product?.name}
                        </Table.Cell>
                        <Table.Cell className="text-gray-900 dark:text-gray-200 whitespace-nowrap p-2">
                          {product?.price?.dlp_price ?? ""}
                        </Table.Cell>
                        <Table.Cell className="text-gray-900 dark:text-gray-200 whitespace-nowrap p-2">
                          {product?.inventory?.availableQty ?? 0}
                        </Table.Cell>
                        <Table.Cell className="text-gray-900 dark:text-gray-200 whitespace-nowrap p-2">
                          {product?.productNorm?.salableQtyNorm ?? 0}
                        </Table.Cell>
                        <Table.Cell className="text-gray-900 dark:text-gray-200 whitespace-nowrap p-2">
                          {product?.inventory?.intransitQty ?? 0}
                        </Table.Cell>
                        {/* <Table.Cell className="text-gray-900 dark:text-gray-200 whitespace-nowrap p-2">
                          {product?.inventory?.availableQty ?? 0}
                        </Table.Cell>{" "} */}
                        {/* <Table.Cell className="text-gray-900 dark:text-gray-200 whitespace-nowrap p-2">
                          {product?.productNorm?.salableQtyNorm ?? 0}
                        </Table.Cell> */}
                        <Table.Cell className="text-gray-900 dark:text-gray-200 whitespace-nowrap p-2">
                          {getSuggestedOrderQty(product)}
                        </Table.Cell>
                        <Table.Cell className="text-gray-900 dark:text-gray-200 whitespace-nowrap p-2">
                          <span className="flex justify-center items-center gap-2 flex-wrap">
                            {!isPresentInOrderProductList(product) ? (
                              <button
                                className="from-neutral-400 text-green-500 font-bold dark:from-neutral-700 dark:text-white cursor-pointer disabled:text-gray-500 disabled:cursor-not-allowed"
                                disabled={!product?.price?.rlp_price}
                                onClick={() => {
                                  // Calculate suggested order quantity
                                  const productUOM = product?.uom ?? "pcs";
                                  const pcsInBox =
                                    product?.no_of_pieces_in_a_box ?? 0;
                                  const suggestedQty =
                                    getSuggestedOrderQty(product);
                                  setOrderProductList([
                                    ...orderProductList,
                                    {
                                      ...product,
                                      orderQty:
                                        productUOM === "pcs"
                                          ? suggestedQty
                                          : Math.floor(
                                              suggestedQty / pcsInBox
                                            ) * pcsInBox,
                                      boxOrderQty:
                                        productUOM === "pcs"
                                          ? 0
                                          : Math.floor(suggestedQty / pcsInBox),
                                      lineItemUOM: productUOM,
                                      suggestedQty: suggestedQty,
                                    },
                                  ]);
                                }}
                              >
                                Add to Order
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  removeFromOrderProductList(product);
                                }}
                                className="font-bold text-red-500 cursor-pointer disabled:text-gray-500 disabled:cursor-not-allowed"
                              >
                                Remove
                              </button>
                            )}
                          </span>
                        </Table.Cell>
                        <Table.Cell className="text-gray-900 dark:text-gray-200 whitespace-nowrap p-2">
                          {isPresentInOrderProductList(product) ? (
                            <Select
                              className="w-20"
                              sizing="sm"
                              value={getUOMValue(product)}
                              onChange={(e) => onLineItemUOMChange(e, product)}
                            >
                              <option value="pcs">pcs</option>
                              <option value="box">box</option>
                            </Select>
                          ) : (
                            ""
                          )}
                        </Table.Cell>
                        <Table.Cell className="text-gray-900 dark:text-gray-200 whitespace-nowrap p-2">
                          {" "}
                          <span className="flex justify-center items-center gap-2 flex-wrap">
                            {getUOMValue(product) === "box" &&
                            isPresentInOrderProductList(product) ? (
                              <div className="flex flex-col gap-1">
                                <TextInput
                                  sizing="sm"
                                  type="number"
                                  placeholder="Enter quantity (box)"
                                  className="p-1"
                                  value={getBoxOrderQty(product) ?? ""}
                                  disabled={!product?.price?.rlp_price}
                                  onClick={(e) => {
                                    e.target.select();
                                  }}
                                  onChange={(e) => {
                                    const pcsPerBox =
                                      product?.no_of_pieces_in_a_box ?? 0;
                                    const boxQty =
                                      parseInt(e.target.value) || 0;
                                    const pcsQty = boxQty * pcsPerBox;

                                    // Update the order list with new box quantity and calculated pieces
                                    setOrderProductList(
                                      orderProductList.map((ele) => {
                                        if (ele?._id === product?._id) {
                                          return {
                                            ...ele,
                                            boxOrderQty: boxQty,
                                            orderQty: pcsQty,
                                          };
                                        }
                                        return ele;
                                      })
                                    );
                                  }}
                                  onWheel={(e) => {
                                    e.target.blur();
                                  }}
                                  size="sm"
                                />
                              </div>
                            ) : (
                              ""
                            )}
                          </span>
                        </Table.Cell>
                        <Table.Cell className="text-gray-900 dark:text-gray-200 whitespace-nowrap p-2">
                          <span className="flex justify-center items-center gap-2 flex-wrap">
                            {getUOMValue(product) === "pcs" &&
                            isPresentInOrderProductList(product) ? (
                              <div className="flex flex-col gap-1">
                                <TextInput
                                  sizing="sm"
                                  type="number"
                                  placeholder="Enter quantity (pcs)"
                                  className="p-1"
                                  onClick={(e) => {
                                    e.target.select();
                                  }}
                                  value={getInputValue(product) ?? ""}
                                  disabled={!product?.price?.rlp_price}
                                  onChange={(e) => {
                                    const pcsQty =
                                      parseInt(e.target.value) || 0;

                                    // Update the order list with new pieces quantity
                                    setOrderProductList(
                                      orderProductList.map((ele) => {
                                        if (ele?._id === product?._id) {
                                          return {
                                            ...ele,
                                            orderQty: pcsQty,
                                          };
                                        }
                                        return ele;
                                      })
                                    );
                                  }}
                                  onWheel={(e) => {
                                    e.target.blur();
                                  }}
                                  size="sm"
                                />
                              </div>
                            ) : getUOMValue(product) === "box" &&
                              isPresentInOrderProductList(product) ? (
                              <span>
                                {orderProductList.find(
                                  (p) => p._id === product._id
                                )?.orderQty || 0}
                              </span>
                            ) : (
                              ""
                            )}
                          </span>
                        </Table.Cell>
                      </Table.Row>
                    ))}

                  {!productLoading && filteredProductList.length === 0 && (
                    <Table.Row>
                      <Table.Cell colSpan={"100%"} className="text-center">
                        No products found
                      </Table.Cell>
                    </Table.Row>
                  )}

                  {productLoading && (
                    <Table.Row>
                      <Table.Cell colSpan={"100%"} className="text-center">
                        <span className="flex justify-center items-center gap-2 flex-wrap">
                          <Spinner
                            aria-label="Default status example"
                            size="sm"
                          />
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  )}

                  {!productLoading && currentPage < totalPages && (
                    <Table.Row className="text-center">
                      <Table.Cell
                        colSpan={"100%"}
                        className="text-gray-900 dark:text-gray-200 whitespace-nowrap p-2"
                      >
                        <span className="flex justify-center items-center gap-2 flex-wrap">
                          <Button
                            onClick={() => {
                              setCurrentPage(currentPage + 1);
                            }}
                            color="dark"
                            size={"sm"}
                          >
                            Load More
                          </Button>
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>
            {/* </>
            )} */}
          </div>
        </Modal.Body>
        <Modal.Footer>
          {orderProductList.length > 0 && (
            <>
              <div className="flex justify-end items-center gap-4 w-full flex-wrap">
                <Button
                  color="failure"
                  onClick={() => {
                    setOrderProductList([]);
                  }}
                >
                  <MdOutlineCancel size={20} className="mr-3" />
                  Remove {orderProductList.length} Items
                </Button>
                <Button onClick={handleNext} color={"purple"}>
                  Complete
                  <HiOutlineArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
