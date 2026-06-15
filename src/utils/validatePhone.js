const validatePhone = (value) => {
  if (!value || value.trim() === "") return { valid: true, message: "" };
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length !== 10) {
    return { valid: false, message: "Enter valid 10 digit mobile number" };
  }
  if (!/^[6-9]/.test(cleaned)) {
    return { valid: false, message: "Enter valid 10 digit mobile number" };
  }
  return { valid: true, message: "" };
};

export const validateRequiredPhone = (value, fieldName = "Mobile Number") => {
  if (!value || value.trim() === "") {
    return { valid: false, message: `${fieldName} is required` };
  }
  return validatePhone(value);
};

export default validatePhone;
