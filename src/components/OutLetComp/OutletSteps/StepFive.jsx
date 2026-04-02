import { TextInput, Button, Label, Spinner, Select } from "flowbite-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrands } from "../../../redux/brandSlice";

const StepFive = ({ formData, setFormData, nextStep, prevStep }) => {
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { brands, loading: brandLoading } = useSelector((state) => state.brand);
  const activeBrands = brands.filter((brand) => brand.status === true);

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  return (
    <div className="flex flex-wrap gap-4 w-full max-w-4/5">
      {/* <h2 className="text-2xl font-semibold mb-4 text-center">
        5. Outlet Categorization
      </h2> */}

      {brandLoading && (
        <div className="w-full flex justify-center items-center">
          <Spinner aria-label="Default status example" size="xl" />
        </div>
      )}

      {!brandLoading && (
        <>
          <div className="flex-1 min-w-[500px]">
            <Label htmlFor="categoryOfOutlet" value="Category of Outlet" />
            <TextInput
              id="categoryOfOutlet"
              name="categoryOfOutlet"
              placeholder="Enter Category of Outlet"
              value={formData.categoryOfOutlet}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex-1 min-w-[500px]">
            <Label htmlFor="productCategory" value="Product Category" />
            <TextInput
              id="productCategory"
              name="productCategory"
              placeholder="Enter Product Category"
              value={formData.productCategory}
              onChange={handleChange}
            />
          </div>

          <div className="flex-1 min-w-[500px]">
            <Label htmlFor="sellingBrands" value="Selling Brands" />
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
              {/*  brands checkbox */}
              {activeBrands.map((brand) => (
                <div key={brand._id} className="flex items-center gap-2 pl-4">
                  <input
                    type="checkbox"
                    id={brand._id}
                    name="sellingBrands"
                    value={brand._id}
                    checked={formData.sellingBrands?.includes(brand._id)}
                    onChange={() => {
                      const newSellingBrands = [...formData?.sellingBrands];
                      if (newSellingBrands?.includes(brand._id)) {
                        newSellingBrands.splice(
                          newSellingBrands.indexOf(brand._id),
                          1
                        );
                      } else {
                        newSellingBrands.push(brand._id);
                      }
                      setFormData({
                        ...formData,
                        sellingBrands: newSellingBrands,
                      });
                    }}
                  />
                  <label htmlFor={brand._id} className="text-sm">
                    {brand.name} ({brand.code})
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-[500px]">
            <Label
              htmlFor="competitorBrands"
              value="Competitor Brands (Comma separated)"
            />
            <TextInput
              id="competitorBrands"
              name="competitorBrands"
              placeholder="Enter Competitor Brands"
              value={formData?.competitorBrands}
              onChange={handleChange}
            />
          </div>

          <div className="flex-1 min-w-[500px]">
            <Label
              className="mb-2"
              htmlFor="existingRetailer"
              value="Existing Retailer (Yes/No)"
            />
            <Select
              id="existingRetailer"
              name="existingRetailer"
              value={formData?.existingRetailer}
              onChange={handleChange}
            >
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </Select>
          </div>

          <div className="flex justify-between w-full gap-4">
            <Button color="gray" onClick={prevStep}>
              Back
            </Button>
            <Button onClick={() => setStep(1)}>Go to Home</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default StepFive;
