export const getPagePermission = (permissionState, slug) => {

  // STEP 1: Check if permission data exists
  if (!permissionState?.data?.data) {
    return null;
  }

  // STEP 2: Extract all modules/groups
  const allModules = permissionState.data.data;

  // STEP 3: Loop through each group (example: "Cancel Reason Master")
  for (const groupKey in allModules) {

    const group = allModules[groupKey];

    // STEP 4: Loop through each module inside the group (example: objectId)
    for (const moduleId in group) {

      const module = group[moduleId];

      // STEP 5: Match slug
      if (module.pageSlug === slug) {

        // STEP 6: Return permission object
        return {
          pageName: module.pageName || "",
          pageSlug: module.pageSlug || "",
          view: module.view === true,
          create: module.create === true,
          update: module.update === true,
          delete: module.delete === true,
        };

      }
    }
  }

  // STEP 7: If no match found
  return null;
};
