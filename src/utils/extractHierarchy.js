export const extractHierarchy = (salesmanData) => {
  const hierarchy = [];
  let current = salesmanData.empMappingId;

  while (current && current.rmEmpId) {
    hierarchy.push({
      name: current.rmEmpId.name,
      empId: current.rmEmpId.empId,
      designation: current.rmEmpId.desgId.name,
    });
    current = current.rmEmpId.empMappingId;
  }

  return hierarchy.reverse(); // Reverse to show top-down hierarchy
};
