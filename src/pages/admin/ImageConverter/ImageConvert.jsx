import { useState } from "react";
import { Card, Badge } from "flowbite-react";
import { FileUpload } from "../../../uploadWidget/FileUpload";
import { IoMdRemoveCircleOutline } from "react-icons/io";
import { FaRegCopy, FaImage } from "react-icons/fa";
import toast from "react-hot-toast";

const ImageConvert = () => {
  const [images, setImages] = useState([]);

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FaImage className="text-2xl text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Image Converter
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Upload multiple images to convert them to links
        </p>
      </div>

      {/* Images Section */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <FaImage className="text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Upload Images
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <FileUpload
                onSetFileUrl={(urls) => {
                  setImages(Array.isArray(urls) ? urls : [urls]);
                }}
                type="multi-image"
                page="modal-form"
              />
            </div>
          </div>

          {images && images.length > 0 && (
            <>
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  Uploaded Images ({images.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((url, index) => (
                    <div
                      key={index}
                      className="relative group bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border"
                    >
                      <img
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-32 object-contain rounded-md"
                      />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(url)}
                          className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                          title="Copy URL"
                        >
                          <FaRegCopy size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          title="Remove Image"
                        >
                          <IoMdRemoveCircleOutline size={12} />
                        </button>
                      </div>
                      <div className="mt-2 text-center">
                        <Badge color="gray" size="sm">
                          Image {index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* List of Links */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  Image Links
                </h3>
                <div className="space-y-2">
                  {images.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">
                        {url}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(url)}
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        title="Copy Link"
                      >
                        <FaRegCopy size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ImageConvert;