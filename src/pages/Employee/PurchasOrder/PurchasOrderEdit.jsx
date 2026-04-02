import {
  Breadcrumb,
  Button,
  Card,
  Label,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaSearch, FaTimesCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import Datepicker from "react-tailwindcss-datepicker";

import UniqueCode from "../../../assets/common/UniqueCode";
import { useDebounce } from "../../../hooks/useDebounce";

import { useNavigate, useParams } from "react-router-dom";

import {
  getProductByProductCodeOutside,
  getPurchaseOrderDetails,
  getSuppliersList,
  updatePurchaseOrderByEmp,
} from "../../../api/api";
import PurchasProductModal from "./PurchasProductModal";

export const PurchasOrderEdit = () => {
  const { userInfo } = useSelector((state) => state.user);

  const { id } = useParams();

  // const [SalesmanList, setSalesmanList] = useState([]);
  const [PONumber, setPONumber] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [supperlierList, setSupperlierList] = useState([1, 2]);
  const [expectDeliveryDate, setExpectDeliveryDate] = useState();

  const [dataLoading, setDataLoading] = useState(true);

  const [orderProductList, setOrderProductList] = useState([]);
  const [orderApiLoading, setOrderApiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [productCodeSearchTerm, setProductCodeSearchTerm] = useState("");
  const [productCodeSearchLoading, setProductCodeSearchLoading] =
    useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [isIGST, setIsIGST] = useState(false);
  const [currentDistributor, setCurrentDistributor] = useState(null);

  const navigate = useNavigate();

  const onCloseModal = () => {
    setSearchTerm("");
    setOpenModal(false);
  };

  const onConfirmSearch = () => {
    setOpenModal(true);
  };

  const fetchDetails = async () => {
    console.log("res->Order");
    try {
      const res = await getPurchaseOrderDetails(id);
      console.log("res->Order", res);
      setSelectedSupplier(res?.data?.data?.supplierId?._id);
      setExpectDeliveryDate(
        getExpectDeliveryDate(res?.data?.data?.expectedDeliveryDate)
      );
      setPONumber(res?.data?.data?.purchaseOrderNo);
      setCurrentDistributor(res?.data?.data?.distributorId);
      let newOrderProductList = res?.data?.data?.lineItems?.map((item) => {
        return {
          ...item,
          _id: item?.product?._id,
          product_code: item?.product?.product_code,
          sku_group_id: item?.product?.sku_group_id,
          sku_group__name: item?.product?.sku_group__name,
          cat_id: item?.product?.cat_id,
          collection_id: item?.product?.collection_id,
          brand: item?.product?.brand,
          size: item?.product?.size,
          no_of_pieces_in_a_box: item?.product?.no_of_pieces_in_a_box,
          name: item?.product?.name,
          img_path: item?.product?.img_path,
          slug: item?.product?.slug,
          product_type: item?.product?.product_type,
          product_hsn_code: item?.product?.product_hsn_code,
          cgst: item?.product?.cgst,
          sgst: item?.product?.sgst,
          igst: item?.product?.igst,
          sbu: item?.product?.sbu,
          uom: item?.product?.uom,
          base_point: item?.product?.base_point,
          status: item?.product?.status,
          createdAt: item?.product?.createdAt,
          updatedAt: item?.product?.updatedAt,
          __v: item?.product?.__v,
          price: item?.price,
          inventory: item?.inventoryId,
          salableQtyNorm: item?.inventoryId?.availableQty || 0,
          orderQty: item?.oderQty || 0,
          distributorDiscUnit: item?.distributorDiscUnit,
          distributorDisc: item?.distributorDisc,
          lineItemUOM: item?.lineItemUOM,
          boxOrderQty: item?.boxOrderQty || 0,
        };
      });
      setOrderProductList(newOrderProductList);
    } catch (err) {
      console.log("Error fetching purchase order details:", err);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  let fetchSuppliersPaginatedWithOutDebounce = async () => {
    try {
      setDataLoading(true);
      const query = {
        page: 1,
        limit: 100,
        distributorId: currentDistributor?._id,
      };

      const response = await getSuppliersList(query);
      console.log("response", response);
      setSupperlierList(
        response?.data?.data?.filter((supllier) => supllier.status === "active")
      );
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch suppliers"
      );
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliersPaginated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDistributor?._id]);

  let fetchSuppliersPaginated = useDebounce(
    fetchSuppliersPaginatedWithOutDebounce,
    500
  );

  const MIN_DATE = new Date();
  MIN_DATE.setDate(MIN_DATE.getDate());

  function getExpectDeliveryDate(dateInput) {
    const date = new Date(dateInput);
    return {
      startDate: date,
      endDate: date,
    };
  }

  const customSetOrderProductList = (productList) => {
    let newOrderProductList = [...productList];
    newOrderProductList = newOrderProductList.map((ele) => {
      if (ele?.distributorDiscUnit) {
        return ele;
      } else {
        return {
          ...ele,
          distributorDiscUnit: "percent",
        };
      }
    });
    newOrderProductList = newOrderProductList.map((ele) => {
      if (ele?.distributorDisc) {
        return ele;
      } else {
        return {
          ...ele,
          distributorDisc: 0,
        };
      }
    });

    newOrderProductList = newOrderProductList.map((ele) => {
      if (ele?.lineItemUOM) {
        return ele;
      } else {
        return {
          ...ele,
          lineItemUOM: "pcs",
        };
      }
    });
    newOrderProductList = newOrderProductList.map((ele) => {
      if (ele?.boxOrderQty) {
        return ele;
      } else {
        return {
          ...ele,
          boxOrderQty: 0,
        };
      }
    });
    setOrderProductList(newOrderProductList);
  };

  const getOrderQty = (product) => {
    return orderProductList.find((ele) => ele?._id === product?._id)?.orderQty;
  };

  const getBoxOrderQty = (product) => {
    return orderProductList.find((ele) => ele?._id === product?._id)
      ?.boxOrderQty;
  };

  const getGrossAmt = (product) => {
    let grossAmt = 0;
    if (product?.price?.dlp_price) {
      grossAmt = product?.orderQty * product?.price?.dlp_price;
    }

    return Number(grossAmt.toFixed(2));
  };

  const getTaxableAmt = (product) => {
    let taxableAmt = 0;

    taxableAmt = getGrossAmt(product);

    if (
      product?.distributorDiscUnit === "percent" &&
      product?.distributorDisc > 0
    ) {
      taxableAmt = taxableAmt * (1 - product?.distributorDisc / 100);
    }

    if (
      product?.distributorDiscUnit === "amount" &&
      product?.distributorDisc > 0
    ) {
      taxableAmt = taxableAmt - product?.distributorDisc;
    }

    return Number(taxableAmt.toFixed(2));
  };

  const getCGST = (product) => {
    let cgst = 0;
    const taxableAmt = getTaxableAmt(product);
    if (taxableAmt > 0 && product?.cgst > 0) {
      cgst = (taxableAmt * product?.cgst) / 100;
    }

    return Number(cgst.toFixed(2));
  };

  const getSGST = (product) => {
    let sgst = 0;
    const taxableAmt = getTaxableAmt(product);
    if (taxableAmt > 0 && product?.sgst > 0) {
      sgst = (taxableAmt * product?.sgst) / 100;
    }

    return Number(sgst.toFixed(2));
  };

  const getIGST = (product) => {
    let igst = 0;
    const taxableAmt = getTaxableAmt(product);
    if (taxableAmt > 0 && product?.igst > 0) {
      igst = (taxableAmt * product?.igst) / 100;
    }

    return Number(igst.toFixed(2));
  };

  const getNetAmt = (product) => {
    let netAmt = 0;
    const taxableAmt = getTaxableAmt(product);
    netAmt = taxableAmt;
    if (taxableAmt > 0) {
      if (!isIGST) {
        netAmt = taxableAmt + getCGST(product) + getSGST(product);
      } else {
        netAmt = taxableAmt + getIGST(product);
      }
    }

    return Number(netAmt.toFixed(2));
  };

  const removeFromOrderProductList = (product) => {
    customSetOrderProductList(
      orderProductList.filter((ele) => ele?._id !== product?._id)
    );
  };

  const getTotalTotalItems = () => {
    return orderProductList.length;
  };

  const getTotalGrossAmount = () => {
    return orderProductList.reduce((acc, ele) => {
      return acc + getGrossAmt(ele);
    }, 0);
  };

  const getTotalTaxableAmount = () => {
    return orderProductList.reduce((acc, ele) => {
      return acc + getTaxableAmt(ele);
    }, 0);
  };

  const getTotalCGST = () => {
    return Number(
      orderProductList.reduce((acc, ele) => {
        return acc + getCGST(ele);
      }, 0)
    ).toFixed(2);
  };

  const getTotalSGST = () => {
    return Number(
      orderProductList.reduce((acc, ele) => {
        return acc + getSGST(ele);
      }, 0)
    ).toFixed(2);
  };

  const getTotalIGST = () => {
    return Number(
      orderProductList.reduce((acc, ele) => {
        return acc + getIGST(ele);
      }, 0)
    ).toFixed(2);
  };

  const getTotalGst = (isIGST) => {
    const total = (fn) =>
      Number(orderProductList.reduce((acc, ele) => acc + fn(ele), 0));

    return isIGST
      ? total(getIGST)?.toFixed(2)
      : (total(getCGST) + total(getSGST))?.toFixed(2);
  };

  const getInvoiceAmount = () => {
    return Number(
      orderProductList.reduce((acc, ele) => {
        return acc + getNetAmt(ele);
      }, 0)
    ).toFixed(2);
  };

  const getRoundOffAmount = () => {
    return Math.ceil(getInvoiceAmount());
  };

  const getTotalNetAmount = () => {
    return Math.round(getRoundOffAmount());
  };

  const getSuggestedOrderQty = (ele) => {
    const Noms = Number(ele?.productNorm?.salableQtyNorm) || 0;
    // const ordered = Number(ele?.orderQty) || 0;
    const available = Number(ele?.inventory?.availableQty) || 0;
    const inTransit = Number(ele?.inventory?.intransitQty) || 0;

    return Noms - (inTransit + available) <= 0
      ? 0
      : Noms - (inTransit + available);
  };

  const handleConfirm = async () => {
    if (selectedSupplier === "default") {
      toast.error("Please select a supplier");
      return;
    }

    if (!expectDeliveryDate?.startDate) {
      toast.error("Please select expected delivery date");
      return;
    }

    const payload = {
      distributorId: currentDistributor?._id,
      supplierId: selectedSupplier,
      expectedDeliveryDate: expectDeliveryDate?.startDate
        ?.toISOString()
        ?.split("T")[0],
      lineItems: orderProductList.map((item) => ({
        product: item?._id,
        price: item?.price?._id,
        uom: "pcs",
        inventoryId: item?.inventory ? item?.inventory?._id : null,
        oderQty: item.orderQty,
        intransitQty: 0,
        suggestedQty: getSuggestedOrderQty(item),
        grossAmt: getGrossAmt(item),
        taxableAmt: getTaxableAmt(item),
        totalCGST: !isIGST && getCGST(item),
        totalSGST: !isIGST && getSGST(item),
        totalIGST: isIGST && getIGST(item),
        netAmt: getNetAmt(item),
        lineItemUOM: item?.lineItemUOM,
        boxOrderQty: item?.boxOrderQty,
      })),
      totalLines: orderProductList.length,
      grossAmount: getTotalGrossAmount(),
      taxableAmount: getTotalTaxableAmount(),
      cgst: !isIGST && getTotalCGST(),
      sgst: !isIGST && getTotalSGST(),
      igst: isIGST && getTotalIGST(),
      totalGSTAmount: getTotalGst(isIGST),
      netAmount: getTotalNetAmount(),
      status: "Draft",
    };

    setOrderApiLoading(true);
    try {
      await toast.promise(updatePurchaseOrderByEmp(id, payload), {
        loading: "Saving purchase order...",
        success: "Purchase order saved successfully",
        error: (error) =>
          error?.response?.data?.message ||
          error?.message ||
          "Failed to save purchase order",
      });
    } catch (error) {
      console.error("Error saving purchase order:", error);
    } finally {
      setOrderApiLoading(false);
      setSelectedSupplier("default");
      setExpectDeliveryDate("");
      navigate(`/${userInfo?.role}/purchase-order-detail/` + id, {
        replace: true,
      });
    }
    console.log("orderProductList", orderProductList);
  };

  const onProductCodeSearch = async (e) => {
    e.preventDefault();
    if (productCodeSearchTerm.trim() === "") {
      toast.error("Please enter a valid product code");
      return;
    }

    if (
      orderProductList.find(
        (item) => item?.product_code === productCodeSearchTerm.trim()
      )
    ) {
      toast.error("Product already in the order list");
      return;
    }

    try {
      setProductCodeSearchLoading(true);

      const res = await getProductByProductCodeOutside(
        productCodeSearchTerm,
        currentDistributor?._id
      );

      if (res?.data?.data?.price) {
        const suggestedQty = getSuggestedOrderQty(res?.data?.data);
        const productUOM = res?.data?.data?.uom ?? "pcs";
        const pcsInBox = res?.data?.data?.no_of_pieces_in_a_box ?? 0;
        const newData = {
          ...res?.data?.data,
          distributorDisc: 0,
          distributorDiscUnit: "percent",
          orderQty:
            productUOM === "pcs"
              ? suggestedQty
              : Math.floor(suggestedQty / pcsInBox) * pcsInBox,
          boxOrderQty:
            productUOM === "pcs" ? 0 : Math.floor(suggestedQty / pcsInBox),
          lineItemUOM: productUOM,
          suggestedQty: suggestedQty,
        };
        setOrderProductList([...orderProductList, newData]);
        setProductCodeSearchTerm("");
      } else {
        throw new Error("Product's Price not found");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message);
    } finally {
      setProductCodeSearchLoading(false);
    }
  };

  const onChangeOrderQty = async (item, orderQty) => {
    if (orderQty > 0) {
      let newOrderProductList = [...orderProductList];
      newOrderProductList = newOrderProductList.map((ele) => {
        if (ele?._id === item?._id) {
          return {
            ...ele,
            orderQty: orderQty,
          };
        }
        return ele;
      });
      setOrderProductList(newOrderProductList);
    } else if (orderQty <= 0) {
      let newOrderProductList = [...orderProductList];
      newOrderProductList = newOrderProductList.map((ele) => {
        if (ele?._id === item?._id) {
          return {
            ...ele,
            orderQty: 0,
          };
        }
        return ele;
      });
      setOrderProductList(newOrderProductList);
    }
  };

  const onChangeBoxOrderQty = async (item, boxOrderQty) => {
    if (boxOrderQty > 0) {
      let newOrderProductList = [...orderProductList];
      newOrderProductList = newOrderProductList.map((ele) => {
        if (ele?._id === item?._id) {
          const pcsPerBox = item?.no_of_pieces_in_a_box ?? 0;
          return {
            ...ele,
            boxOrderQty: boxOrderQty,
            orderQty: boxOrderQty * pcsPerBox,
          };
        }
        return ele;
      });
      setOrderProductList(newOrderProductList);
    } else if (boxOrderQty <= 0) {
      let newOrderProductList = [...orderProductList];
      newOrderProductList = newOrderProductList.map((ele) => {
        if (ele?._id === item?._id) {
          return {
            ...ele,
            boxOrderQty: 0,
            orderQty: 0,
          };
        }
        return ele;
      });
      setOrderProductList(newOrderProductList);
    }
  };

  const onLineItemUOMChange = async (e, item) => {
    const newUOM = e.target.value;
    let newOrderProductList = [...orderProductList];
    newOrderProductList = newOrderProductList.map((ele) => {
      if (ele?._id === item?._id) {
        const pcsPerBox = item?.no_of_pieces_in_a_box ?? 0;
        let newData = {
          ...ele,
          lineItemUOM: newUOM,
          boxOrderQty: 0,
          orderQty: 0,
        };

        if (newUOM === "box" && item?.orderQty > 0) {
          const boxOrderQty = Math.floor(item?.orderQty / pcsPerBox);
          const orderQty = boxOrderQty * pcsPerBox;

          newData = {
            ...newData,
            boxOrderQty: boxOrderQty,
            orderQty: orderQty,
          };
        }

        if (newUOM === "pcs" && item?.boxOrderQty > 0) {
          const orderQty = item?.boxOrderQty * pcsPerBox;
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
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "F4") {
        event.preventDefault();
        onConfirmSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isEditing) {
        setIsEditing(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isEditing]);

  console.log({
    orderProductList,
  });

  return (
    <>
      <div className="flex justify-start items-center flex-col w-full">
        <div className="flex justify-between w-full items-center py-2">
          <div className="flex justify-start items-center w-full">
            <Breadcrumb aria-label="Solid background breadcrumb example">
              <Breadcrumb.Item href={`/${userInfo?.role}/purchase-browser`}>
                Purchase Browser
              </Breadcrumb.Item>

              <Breadcrumb.Item href="">Purchase Order</Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
        <div className="flex justify-start items-center flex-col gap-2 w-full p-2">
          <Card className="w-full flex justify-start items-start flex-col">
            <div className="flex justify-start w-full items-center gap-2 flex-wrap">
              {/* select PO No */}
              <div className="w-56">
                <div className="mb-2 block">
                  <Label value="PO No" />
                </div>
                <TextInput
                  value={PONumber}
                  onChange={(e) => setPONumber(e.target.value)}
                  required
                  placeholder="Auto generated"
                  readOnly
                  sizing="sm"
                />
              </div>
              {/* select Supplier name */}
              <div className="w-56">
                <div className="mb-2 block">
                  <Label value="Supplier Name" />
                </div>
                <Select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  required
                  sizing="sm"
                  disabled={dataLoading}
                >
                  <option value="default">All</option>
                  {supperlierList?.map((ele, index) => (
                    <option key={index} value={ele?._id}>
                      {ele?.supplierName}({ele?.supplierCode})
                    </option>
                  ))}
                </Select>
              </div>
              {/* select retailer name */}
              <div className="w-56">
                <div className="mb-2 block">
                  <Label value="Expected Delivery  date" />
                </div>

                <Datepicker
                  inputClassName="relative py-1.5 pl-4 pr-14 w-full border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white/80 rounded-xs tracking-wide text-sm placeholder-gray-400 focus:ring-1 focus:border-cyan-500 focus:outline-none dark:placeholder-gray-400 dark:focus:border-cyan-500"
                  showShortcuts={true}
                  value={expectDeliveryDate}
                  useRange={false}
                  asSingle={true}
                  onChange={(newValue) => setExpectDeliveryDate(newValue)}
                  size="sm"
                  minDate={MIN_DATE}
                />
              </div>
              <div className="w-56">
                <div className="mb-2 block">
                  <Label value="Distributor" />
                </div>
                <TextInput
                  value={
                    currentDistributor
                      ? `${currentDistributor.name} (${currentDistributor.dbCode})`
                      : ""
                  }
                  required
                  placeholder="Auto generated"
                  readOnly
                  sizing="sm"
                />
              </div>
            </div>
          </Card>
        </div>

        {selectedSupplier !== "" ? (
          <div className="flex justify-center w-full items-center gap-2 flex-wrap p-2">
            <div className="overflow-x-auto w-full text-xs font-bold">
              <table className="w-full border-collapse border border-lavender-800 dark:border-gray-300 overflow-x-auto max-h-64">
                <thead className="bg-lavender-800 text-oWhite-100 dark:bg-lavender-300 dark:text-lavender-900">
                  <tr>
                    <th className="border border-lavender-800 b dark:border-gray-300 p-2 whitespace-nowrap">
                      Action
                    </th>
                    <th className="border border-lavender-800 dark:border-gray-300 p-2 whitespace-nowrap">
                      Product Code
                    </th>
                    <th className="border border-lavender-800 dark:border-gray-300 p-2 whitespace-nowrap">
                      Product Name
                    </th>
                    <th className="border border-lavender-800 dark:border-gray-300 p-2 whitespace-nowrap">
                      UOM
                    </th>
                    <th className="border border-lavender-800 dark:border-gray-300 p-2 whitespace-nowrap">
                      Order Qty (box)
                    </th>
                    <th className="border border-lavender-800 dark:border-gray-300 p-2 whitespace-nowrap">
                      Order Qty (pcs)
                    </th>
                    {/* <th className="border border-lavender-800 dark:border-gray-300 p-2 whitespace-nowrap">
                      Noms Qty
                    </th> */}
                    <th className="border border-lavender-800 dark:border-gray-300 p-2 whitespace-nowrap">
                      Stock Qty
                    </th>
                    <th className="border border-lavender-800 dark:border-gray-300 p-2 whitespace-nowrap">
                      Noms Qty
                    </th>
                    {/* <th className="border border-lavender-800 dark:border-gray-300 p-2 whitespace-nowrap">
                      Stock Qty
                    </th> */}
                    <th className="border border-lavender-800 dark:border-gray-300 p-2 whitespace-nowrap">
                      In Transit Qty
                    </th>
                    <th className="border border-lavender-800 dark:border-gray-300 p-2 whitespace-nowrap">
                      Suggested Qty
                    </th>

                    <th className="border border-lavender-800 dark:border-gray-300 p-2 whitespace-nowrap">
                      Price
                    </th>
                    <th className="border border-lavender-800 dark:border-gray-300 p-2 whitespace-nowrap">
                      Gross Amt
                    </th>

                    <th className="border border-lavender-800 dark:border-gray-300 p-2 whitespace-nowrap">
                      Taxable Amt
                    </th>
                    <th className="border border-lavender-800 dark:border-gray-300 p-2 whitespace-nowrap">
                      Net Amt
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orderProductList.length > 0 &&
                    orderProductList.map((ele) => (
                      <tr key={ele?._id}>
                        <td className="border border-lavender-800 dark:border-gray-300 p-1 text-center whitespace-nowrap">
                          <span className="flex justify-center items-center gap-2 flex-wrap">
                            <button
                              onClick={() => {
                                removeFromOrderProductList(ele);
                              }}
                              className="font-bold text-red-500 cursor-pointer disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                              <FaTimesCircle color="red" size={20} />
                            </button>
                          </span>
                        </td>
                        <td className="border border-lavender-800 dark:border-gray-300 p-1 text-center whitespace-nowrap">
                          <UniqueCode
                            text={ele?.product_code}
                            codeName="Product"
                          />
                        </td>
                        <td className="border border-lavender-800 dark:border-gray-300 p-1 text-center whitespace-nowrap">
                          {ele?.name}
                        </td>
                        <td className="border border-lavender-800 dark:border-gray-300 p-1 text-center whitespace-nowrap">
                          <Select
                            className="w-20"
                            sizing="sm"
                            value={ele?.lineItemUOM || "pcs"}
                            onChange={(e) => {
                              onLineItemUOMChange(e, ele);
                            }}
                          >
                            <option value="pcs">pcs</option>
                            <option value="box">box</option>
                          </Select>
                        </td>
                        <td className="border border-lavender-800 dark:border-gray-300 p-1 text-center whitespace-nowrap">
                          <span className="flex justify-center items-center gap-2">
                            {ele?.lineItemUOM === "box" && (
                              <TextInput
                                type="number"
                                placeholder="Order Qty"
                                className="w-24"
                                value={getBoxOrderQty(ele)}
                                onFocus={(e) => {
                                  e.target.select();
                                }}
                                onChange={(e) => {
                                  onChangeBoxOrderQty(ele, e.target.value);
                                }}
                                onWheel={(e) => {
                                  e.target.blur();
                                }}
                                sizing="sm"
                              />
                            )}
                          </span>
                        </td>
                        <td className="border border-lavender-800 dark:border-gray-300 p-1 text-center whitespace-nowrap">
                          <span className="flex justify-center items-center gap-2">
                            {ele?.lineItemUOM === "pcs" && (
                              <TextInput
                                type="number"
                                placeholder="Order Qty"
                                className="w-24"
                                value={getOrderQty(ele)}
                                onFocus={(e) => {
                                  e.target.select();
                                }}
                                onChange={(e) => {
                                  onChangeOrderQty(ele, e.target.value);
                                }}
                                onWheel={(e) => {
                                  e.target.blur();
                                }}
                                sizing="sm"
                              />
                            )}
                            {ele?.lineItemUOM === "box" && (
                              <span>{getOrderQty(ele)}</span>
                            )}
                          </span>
                        </td>
                        <td className="border border-lavender-800 dark:border-gray-300 p-1 text-center whitespace-nowrap">
                          {ele?.inventory?.availableQty ?? 0}
                        </td>
                        <td className="border border-lavender-800 dark:border-gray-300 p-1 text-center whitespace-nowrap">
                          {ele?.productNorm?.salableQtyNorm ?? 0}
                        </td>
                        <td className="border border-lavender-800 dark:border-gray-300 p-1 text-center whitespace-nowrap">
                          {ele?.inventory?.intransitQty ?? 0}
                        </td>
                        <td className="border border-lavender-800 dark:border-gray-300 p-1 text-center whitespace-nowrap">
                          {getSuggestedOrderQty(ele) ?? 0}
                        </td>
                        <td className="border border-lavender-800 dark:border-gray-300 p-1 text-center whitespace-nowrap font-bold">{`₹ ${ele?.price?.dlp_price}`}</td>

                        <td className="border border-lavender-800 dark:border-gray-300 p-1 text-center whitespace-nowrap font-bold">{`₹ ${getGrossAmt(
                          ele
                        )}`}</td>

                        <td className="border border-lavender-800 dark:border-gray-300 p-1 text-center whitespace-nowrap">
                          {`₹ ${getTaxableAmt(ele)}`}
                        </td>

                        <td className="border border-lavender-800 dark:border-gray-300 p-1 text-center whitespace-nowrap">
                          {`₹ ${getNetAmt(ele)}`}
                        </td>
                      </tr>
                    ))}

                  <tr>
                    <td className="border-lavender-800 dark:border-gray-300 p-1 text-center whitespace-nowrap">
                      {""}
                    </td>
                    <td className="border border-lavender-800 dark:border-gray-300 p-1 text-center whitespace-nowrap">
                      <span className="flex justify-center items-center gap-2 flex-wrap p-2">
                        <TextInput
                          placeholder="Product Code + tab"
                          className="min-w-20"
                          value={productCodeSearchTerm}
                          onChange={(e) =>
                            setProductCodeSearchTerm(e.target.value)
                          }
                          disabled={productCodeSearchLoading}
                          sizing="sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === "Tab") {
                              onProductCodeSearch(e);
                            }
                          }}
                        />
                      </span>
                    </td>
                    <td className="border border-lavender-800 dark:border-gray-300 p-1 text-center whitespace-nowrap">
                      <span className="flex justify-center items-center gap-2 p-2">
                        <TextInput
                          placeholder="Product Name/Code + F4"
                          className="min-w-20"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          sizing="sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === "F4") {
                              onConfirmSearch();
                            }
                          }}
                        />
                        <button
                          onClick={onConfirmSearch}
                          disabled={productCodeSearchLoading}
                          className="bg-lavender-800 border text-nowrap p-[8px] rounded-lg"
                        >
                          <span className="flex justify-center items-center gap-2 font-bold">
                            {productCodeSearchLoading ? (
                              <Spinner size="sm" />
                            ) : (
                              <FaSearch size={15} />
                            )}
                          </span>
                        </button>
                      </span>
                    </td>
                    <td
                      className="border border-lavender-800 dark:border-gray-300 p-1 text-center whitespace-nowrap"
                      colSpan={"100%"}
                    >
                      {""}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center gap-2 flex-wrap p-4">
            <h1 className="text-2xl font-bold">
              Please Select Supplier To Place an Order
            </h1>
          </div>
        )}

        {getTotalTotalItems() > 0 && (
          <div className="flex justify-center w-full items-center gap-2 flex-wrap p-4">
            <div className="flex justify-between items-center w-full p-4 rounded-lg">
              <div className="flex justify-between items-start gap-4 w-full flex-wrap">
                <div className="flex flex-col justify-start items-start gap-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="totalItems"
                      value="Total Items:"
                      className="font-bold w-40"
                    />
                    <TextInput
                      id="totalItems"
                      type="number"
                      sizing="sm"
                      className="w-32"
                      readOnly
                      value={getTotalTotalItems()}
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-start items-start gap-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="grossAmount"
                      value="Gross Amount:"
                      className="font-bold w-40"
                    />
                    <TextInput
                      id="grossAmount"
                      className="w-32"
                      type="number"
                      sizing="sm"
                      readOnly
                      value={getTotalGrossAmount()}
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="taxableAmount"
                      value="Taxable Amount:"
                      className="font-bold w-40"
                    />
                    <TextInput
                      id="taxableAmount"
                      type="number"
                      sizing="sm"
                      className="w-32"
                      readOnly
                      value={getTotalTaxableAmount()}
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="taxableAmount"
                      value="Total Tax Amount:"
                      className="font-bold w-40"
                    />
                    <TextInput
                      id="taxableAmount"
                      type="number"
                      sizing="sm"
                      className="w-32"
                      readOnly
                      value={getTotalGst(isIGST)}
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="netAmount"
                      value="Net Amount:"
                      className="font-bold w-40"
                    />
                    <TextInput
                      id="netAmount"
                      type="text"
                      sizing="sm"
                      className="w-32"
                      readOnly
                      value={getTotalNetAmount()}
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4 gap-4 w-full">
              <Button
                className="text-xs"
                size="sm"
                color="success"
                onClick={handleConfirm}
                disabled={orderApiLoading}
              >
                <span className="flex justify-center items-center gap-2 font-bold">
                  {orderApiLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    <FaCheck size={20} />
                  )}
                  Confirm & Update
                </span>
              </Button>
              <Button
                className="text-xs"
                size="sm"
                color="failure"
                onClick={() =>
                  navigate(`/${userInfo?.role}/purchase-order-detail/${id}`, {
                    replace: true,
                  })
                }
                disabled={orderApiLoading}
              >
                <span className="flex justify-center items-center gap-2 font-bold">
                  <FaTimesCircle size={20} />
                  Cancel Editting
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {openModal && (
        <PurchasProductModal
          openModal={openModal}
          onCloseModal={onCloseModal}
          searchTerm={searchTerm}
          orderProductList={orderProductList}
          setOrderProductList={customSetOrderProductList}
          currentDistributor={currentDistributor}
        />
      )}
    </>
  );
};
