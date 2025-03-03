import React, { useState } from "react";
import ImageManager from "../../images/ImageManager";

const ReviewSection = ({ formData, updateFormData, errors, touched }) => {
  const [isEditing, setIsEditing] = useState(null);

  const handleEdit = (field) => {
    setIsEditing(field);
  };

  const handleChange = (field, value) => {
    updateFormData(field, value);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Review & Edit Your Listing</h2>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
        {isEditing === "title" ? (
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            onBlur={() => setIsEditing(null)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        ) : (
          <p onClick={() => handleEdit("title")} className="cursor-pointer p-2 border rounded-lg">
            {formData.title || "Click to add a title"}
          </p>
        )}
      </div>

      {/* Image Upload & Preview Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Uploaded Images</h3>
        <ImageManager
          images={formData.images}
          onImagesChange={(updatedImages) => updateFormData("images", updatedImages)}
        />
      </div>
    </div>
  );
};

export default ReviewSection;
