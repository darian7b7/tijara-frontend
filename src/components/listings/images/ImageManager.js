// Updated ImageManager.js - Now Uses Cloudflare R2
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import api from "../../../config/axios.config";

const ImageManager = ({ images = [], onImagesChange, maxImages = 5, category = "listing" }) => {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    setPreviews(images);
  }, [images]);

  const validateFileType = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    return validTypes.includes(file.type);
  };

  const handleUpload = async (file) => {
    if (!validateFileType(file)) {
      alert("Invalid file type. Only JPEG, PNG, and WEBP allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", category); // Pass category to backend

    try {
      const response = await api.post("/api/uploads/upload", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data) {
        onImagesChange([...images, response.data.imageUrl]);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleDelete = async (imageUrl) => {
    try {
      await api.delete("/api/uploads/delete", { data: { imageUrl } });
      onImagesChange(images.filter((img) => img !== imageUrl));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    multiple: true,
    maxFiles: maxImages,
    onDrop: (acceptedFiles) => {
      if (images.length + acceptedFiles.length > maxImages) {
        alert(`You can upload up to ${maxImages} images only.`);
        return;
      }
      acceptedFiles.forEach((file) => handleUpload(file));
    },
  });

  return (
    <div className="space-y-4">
      {previews.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="object-cover w-full h-24 rounded-lg cursor-pointer"
              />
              <button
                onClick={() => handleDelete(preview)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
              >×</button>
            </div>
          ))}
        </div>
      )}
      <div {...getRootProps()} className="border-2 border-dashed p-6 text-center bg-gray-50">
        <input {...getInputProps()} />
        <p>Drag & Drop images here or click to upload</p>
        <p>{`${images.length}/${maxImages} images uploaded`}</p>
      </div>
    </div>
  );
};

export default ImageManager;
