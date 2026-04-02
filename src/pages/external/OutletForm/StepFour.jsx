import { TextInput, Button, Label } from "flowbite-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrands } from "../../../redux/brandSlice";

const StepFour = ({
  formData,
  setFormData,
  nextStep,
  prevStep,
  handleSubmit,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { brands, loading: brandLoading } = useSelector((state) => state.brand);
  const activeBrands = brands.filter((brand) => brand.status === true);

  console.log(activeBrands, "activeBrands");

  return (
    <div className="flex flex-col gap-4 w-full max-w-xl">
      {/* <h2 className="text-2xl font-semibold mb-4 text-center">4. Legal Information</h2> */}

      <>
        <div>
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

        <div>
          <Label htmlFor="productCategory" value="Product Category" />
          <TextInput
            id="productCategory"
            name="productCategory"
            placeholder="Enter Product Category"
            value={formData.productCategory}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="sellingBrands" value="Selling Brands" />
          <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
            {/*  brands checkbox */}
            {activeBrands.map((brand) => (
              <div key={brand?._id} className="flex items-center gap-2 pl-4">
                <input
                  type="checkbox"
                  id={brand?._id}
                  name="sellingBrands"
                  value={brand?._id}
                  checked={formData?.sellingBrands?.includes(brand?._id)}
                  onChange={() => {
                    const newSellingBrands = [...formData?.sellingBrands];
                    if (newSellingBrands.includes(brand?._id)) {
                      newSellingBrands.splice(
                        newSellingBrands.indexOf(brand?._id),
                        1
                      );
                    } else {
                      newSellingBrands.push(brand?._id);
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

        <div>
          <Label
            htmlFor="competitorBrands"
            value="Competitor Brands (Comma separated)"
          />
          <TextInput
            id="competitorBrands"
            name="competitorBrands"
            placeholder="Enter Competitor Brands"
            value={formData.competitorBrands}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-between">
          <Button color="gray" onClick={prevStep}>
            Back
          </Button>
          <Button onClick={nextStep}>Next</Button>
          <Button onClick={handleSubmit}>Complete</Button>
        </div>
      </>
    </div>
  );
};

export default StepFour;
