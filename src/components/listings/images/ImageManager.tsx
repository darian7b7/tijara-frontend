import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import Cropper from "react-easy-crop";

interface ImageManagerProps {
  images: File[];
  onChange: (images: File[]) => void;
  maxImages?: number;
  error?: string;
}

const ImageManager: React.FC<ImageManagerProps> = ({
  images,
  onChange,
  maxImages = 10,
  error,
}) => {
  const { t } = useTranslation();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    // Create preview URLs for images
    const urls = images.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    // Cleanup function to revoke object URLs
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleImageUpload = async (files: File[]) => {
    if (images.length + files.length > maxImages) {
      toast.error(t("errors.maxImagesExceeded", { count: maxImages }));
      return;
    }

    try {
      setIsUploading(true);
      const newImages = [...images, ...files];
      onChange(newImages);
      toast.success(t("success.imagesUploaded"));
    } catch (error) {
      toast.error(t("errors.uploadFailed"));
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageDelete = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    setSelectedImage(null);
  };

  const handleImageEdit = (index: number) => {
    setSelectedImage(index);
  };

  const handleCropComplete = async (
    croppedArea: any,
    croppedAreaPixels: any,
  ) => {
    if (selectedImage === null) return;

    try {
      const image = images[selectedImage];
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.src = previewUrls[selectedImage];
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      if (ctx) {
        ctx.drawImage(
          img,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
        );

        canvas.toBlob((blob) => {
          if (blob) {
            const croppedFile = new File([blob], image.name, {
              type: image.type,
            });
            const newImages = [...images];
            newImages[selectedImage] = croppedFile;
            onChange(newImages);
          }
        }, image.type);
      }
    } catch (error) {
      console.error("Error cropping image:", error);
      toast.error(t("errors.cropFailed"));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    multiple: true,
    disabled: isUploading,
    onDrop: handleImageUpload,
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">{t("upload_images")}</h3>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-2xl">
              <div className="relative h-96">
                <Cropper
                  image={previewUrls[selectedImage]}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {previewUrls.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {previewUrls.map((url, index) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square"
              >
                <img
                  src={url}
                  alt={t("imagePreview", { number: index + 1 })}
                  className="w-full h-full object-cover rounded-lg shadow-sm transition-transform group-hover:scale-[1.02]"
                />
                <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleImageEdit(index)}
                    className="bg-blue-500 text-white p-2 rounded-full shadow-lg"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleImageDelete(index)}
                    className="bg-red-500 text-white p-2 rounded-full shadow-lg"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}
          ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-blue-400 hover:bg-blue-50"}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          {isUploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : (
            <>
              <div className="text-blue-500">
                <svg
                  className="mx-auto h-12 w-12"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="text-gray-600">
                {isDragActive ? (
                  <p>{t("dropFilesHere")}</p>
                ) : (
                  <>
                    <p className="text-sm">{t("dragAndDrop")}</p>
                    <p className="text-xs text-gray-500 mt-1">{t("or")}</p>
                    <p className="text-sm font-medium text-blue-500 mt-1">
                      {t("browseFiles")}
                    </p>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {t("supportedFormats")}: JPG, PNG, WebP • {t("maxSize")}: 5MB
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <p>
          {images.length} {t("of")} {maxImages} {t("imagesUploaded")}
        </p>
        {images.length > 0 && (
          <p className="text-blue-500">{t("dragToReorder")}</p>
        )}
      </div>
    </div>
  );
};

export default ImageManager;
