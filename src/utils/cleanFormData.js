export const cleanFormData = (data) => {
  const cleanedData = { ...data };

  Object.keys(cleanedData).forEach((key) => {
    const value = cleanedData[key];
    if (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "")
    ) {
      delete cleanedData[key];
    }
  });

  return cleanedData;
};
