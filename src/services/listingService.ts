import axios from "axios";
import {
  Listing,
  ListingFieldSchema,
} from "../components/listings/types/forms";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface FieldDefinitions {
  attributes: Array<{
    id: string;
    name: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
    section: string;
    order: number;
  }>;
  features: Array<{
    id: string;
    name: string;
    label: string;
  }>;
}

class ListingService {
  async getFieldDefinitions(categoryId: string): Promise<FieldDefinitions> {
    try {
      const response = await axios.get(
        `${API_URL}/listings/fields/${categoryId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching field definitions:", error);
      throw error;
    }
  }

  async createOrUpdateListing(
    listing: Partial<Listing>,
    isDraft: boolean = false,
  ): Promise<Listing> {
    try {
      const formData = new FormData();

      // Add basic listing data
      const listingData = {
        ...listing,
        status: isDraft ? "DRAFT" : "ACTIVE",
        images: undefined, // We'll handle images separately
      };
      formData.append("data", JSON.stringify(listingData));

      // Add images
      if (listing.images) {
        listing.images.forEach((image, index) => {
          if (image instanceof File) {
            formData.append(`images`, image);
          } else if (typeof image === "string") {
            formData.append("existingImages", image);
          }
        });
      }

      const response = await axios.post(`${API_URL}/listings`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error creating/updating listing:", error);
      throw error;
    }
  }

  async getListing(id: string): Promise<Listing> {
    try {
      const response = await axios.get(`${API_URL}/listings/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching listing:", error);
      throw error;
    }
  }

  // Convert backend field definitions to frontend schema
  convertToFieldSchema(
    fieldDefs: FieldDefinitions,
  ): Record<string, ListingFieldSchema[]> {
    const schema: Record<string, ListingFieldSchema[]> = {};

    // Group attributes by section
    const sections = new Set(fieldDefs.attributes.map((attr) => attr.section));

    sections.forEach((section) => {
      schema[section] = fieldDefs.attributes
        .filter((attr) => attr.section === section)
        .map((attr) => ({
          name: attr.name,
          label: attr.label,
          type: attr.type.toLowerCase(),
          required: attr.required,
          options: attr.options,
          section: attr.section,
        }));
    });

    // Add features as checkboxes in a separate section
    if (fieldDefs.features.length > 0) {
      schema.features = fieldDefs.features.map((feature) => ({
        name: feature.name,
        label: feature.label,
        type: "checkbox",
        section: "features",
      }));
    }

    return schema;
  }
}

export const listingService = new ListingService();
