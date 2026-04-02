import { Badge, Button, Card, Label, Select, Spinner, Table, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrands } from "../../redux/brandSlice";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { RiRefreshFill } from "react-icons/ri";

const BrandView = () => {
  const dispatch = useDispatch();
  const { brands, loading: brandsLoading } = useSelector((state) => state.brand);

  let filteredBrands = [...brands];
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");

  if (selectedStatus !== "default") {
    filteredBrands = filteredBrands.filter(
      (brand) => brand.status === (selectedStatus === "active")
    );
  }

  if (searchTerm.trim() !== "") {
    const lower = searchTerm.toLowerCase();
    filteredBrands = filteredBrands.filter(
      (b) =>
        b?.name?.toLowerCase().includes(lower) ||
        b?.code?.toLowerCase().includes(lower) ||
        b?.desc?.toLowerCase().includes(lower)
    );
  }

  const handleReset = () => {
    setSearchTerm("");
    setSelectedStatus("active");
    dispatch(fetchBrands());
  };

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center border-b-2 py-4">
        <h1 className="text-2xl font-bold">Brand Master</h1>
      </div>

      {/* filters */}
      <div className="p-4 w-full flex flex-col items-center">
        <Card className="w-full flex flex-col items-center">
          <div className="w-full flex flex-wrap justify-center gap-2">
            <Badge color="warning">Total Count: {brands?.length}</Badge>
            <Badge color="warning">Filtered Count: {filteredBrands?.length}</Badge>
          </div>
          <div className="flex flex-wrap gap-4 p-2 w-full justify-center">
            <div className="w-44">
              <Label value="Search" />
              <TextInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search" />
            </div>
            <div className="w-56">
              <Label value="Select Status" />
              <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="default">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
          <Button color="success" size="sm" onClick={handleReset}>
            <span className="flex items-center gap-2">
              <RiRefreshFill size={18}/> Reset & Refresh
            </span>
          </Button>
        </Card>
      </div>

      {/* table */}
      <div className="w-full p-4">
        {brandsLoading ? (
          <div className="flex justify-center">
            <Spinner size="xl"/>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table striped>
              <Table.Head className="text-center">
                <Table.HeadCell>Brand Code</Table.HeadCell>
                <Table.HeadCell>Brand Name</Table.HeadCell>
                <Table.HeadCell>Brand Description</Table.HeadCell>
                <Table.HeadCell>Image</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {filteredBrands?.map((brand, idx) => (
                  <Table.Row key={idx} className="text-center">
                    <Table.Cell><UniqueCode text={brand?.code} codeName="Brand"/></Table.Cell>
                    <Table.Cell>{brand.name}</Table.Cell>
                    <Table.Cell>{brand?.desc}</Table.Cell>
                    <Table.Cell>
                      {brand.image_path && (
                        <img src={brand.image_path} alt={brand.name} className="h-12 object-cover mx-auto"/>
                      )}
                    </Table.Cell>
                    <Table.Cell><StatusIndicator status={brand.status}/></Table.Cell>
                  </Table.Row>
                ))}
                {filteredBrands.length === 0 && (
                  <Table.Row>
                    <Table.Cell colSpan={5}>No data found</Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandView;