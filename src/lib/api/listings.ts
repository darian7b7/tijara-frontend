import { FormState } from "@/types/forms";

export interface ListingCreateInput extends Omit<FormState, "images"> {
  title: string;
  images: File[];
  description: string;
  location: string;
  price: number;
}

export const createListing = async (data: ListingCreateInput) => {
  const formData = new FormData();

  // Add all non-file data
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("location", data.location);
  formData.append("price", data.price.toString());
  formData.append("category", JSON.stringify(data.category));
  formData.append("details", JSON.stringify(data.details));

  // Add images
  data.images.forEach((image, index) => {
    formData.append(`images[${index}]`, image);
  });

  const response = await fetch("/api/listings", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create listing");
  }

  return response.json();
};
