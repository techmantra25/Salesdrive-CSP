import toast from "react-hot-toast";

export const downloadFile = async ({
  url,
  method = "GET",
  queryParams = {},
  body = null,
  fileName = "download",
  showToast = true,
}) => {
  const downloadPromise = (async () => {
    try {
      // Build query string
      const params = new URLSearchParams(queryParams).toString();
      const finalUrl = params ? `${url}?${params}` : url;

      const userInfo = JSON.parse(localStorage.getItem("DMS_USERINFO"));
      const token = userInfo?.token || userInfo?.data?.token;

      const response = await fetch(finalUrl, {
        method,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body && { "Content-Type": "application/json" }),
        },
        ...(body && { body: JSON.stringify(body) }),
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();

      // Extract filename from header (if backend sends it)
      const contentDisposition = response.headers.get("content-disposition");
      let extractedFileName = fileName;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match?.[1]) extractedFileName = match[1];
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = extractedFileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      return extractedFileName;
    } catch (error) {
      console.error("File download error:", error);
      throw error;
    }
  })();

  if (showToast) {
    toast.promise(downloadPromise, {
      loading: "Downloading CSV...",
      success: (fileName) => `${fileName} downloaded successfully`,
      error: "Failed to download CSV",
    });
  }

  return downloadPromise;
};
