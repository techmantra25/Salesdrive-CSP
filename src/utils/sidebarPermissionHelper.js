export const filterSidebarByPermission = (sidebarConfig, permissions) => {

  const permissionMap = {};

  Object.values(permissions || {}).forEach(module => {

    Object.values(module || {}).forEach(page => {

      if (page.pageSlug) {
        permissionMap[page.pageSlug] = page;
      }

    });

  });


  return sidebarConfig
    .map(item => {

      if (item.type === "item") {

        if (!item.slug) return item;

        if (permissionMap[item.slug]?.view === true)
          return item;

        return null;
      }


      if (item.type === "collapse") {

        const allowedChildren =
          item.children.filter(child => {

            if (!child.slug) return true;

            return permissionMap[child.slug]?.view === true;

          });

        if (allowedChildren.length === 0)
          return null;

        // IMPORTANT: preserve full original object
        item.children = allowedChildren;

        return item;
      }

      return item;

    })
    .filter(Boolean);

};
