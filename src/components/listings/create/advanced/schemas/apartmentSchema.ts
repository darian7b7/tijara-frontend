import { ListingFieldSchema } from "@/types/listings";

export const apartmentSchema: ListingFieldSchema[] = [
  // Essential Section
  {
    name: "condition",
    label: "listings.condition",
    type: "select",
    options: ["new", "excellent", "good", "fair", "needsWork"],
    section: "essential",
    required: true,
  },
  {
    name: "floor",
    label: "listings.floor",
    type: "number",
    section: "essential",
    required: true,
  },
  {
    name: "totalFloors",
    label: "listings.totalFloors",
    type: "number",
    section: "essential",
    required: true,
  },
  {
    name: "parking",
    label: "listings.parking",
    type: "select",
    options: ["garage", "underground", "street", "none"],
    section: "essential",
    required: true,
  },
  {
    name: "elevator",
    label: "listings.elevator",
    type: "checkbox",
    section: "essential",
    required: true,
  },

  // Advanced Section
  {
    name: "balcony",
    label: "listings.balcony",
    type: "checkbox",
    section: "advanced",
    required: false,
  },
  {
    name: "storage",
    label: "listings.storage",
    type: "checkbox",
    section: "advanced",
    required: false,
  },
  {
    name: "heating",
    label: "listings.heating",
    type: "select",
    options: ["central", "individual", "district", "none"],
    section: "advanced",
    required: false,
  },
  {
    name: "cooling",
    label: "listings.cooling",
    type: "select",
    options: ["central", "split", "window", "none"],
    section: "advanced",
    required: false,
  },
  {
    name: "buildingAmenities",
    label: "listings.buildingAmenities",
    type: "multiselect",
    options: ["gym", "pool", "sauna", "playground", "security"],
    section: "advanced",
    required: false,
  },
  {
    name: "energyRating",
    label: "listings.energyRating",
    type: "select",
    options: ["A+", "A", "B", "C", "D", "E", "F", "G", "unknown"],
    section: "advanced",
    required: false,
  },
  {
    name: "furnished",
    label: "listings.furnished",
    type: "select",
    options: ["yes", "no", "partially"],
    section: "advanced",
    required: false,
  },
  {
    name: "petPolicy",
    label: "listings.petPolicy",
    type: "select",
    options: ["allowed", "notAllowed", "negotiable"],
    section: "advanced",
    required: false,
  },
  {
    name: "view",
    label: "listings.view",
    type: "select",
    options: ["sea", "city", "garden", "mountain", "none"],
    section: "advanced",
    required: false,
  },
  {
    name: "securityFeatures",
    label: "listings.securityFeatures",
    type: "multiselect",
    options: ["alarm", "cctv", "concierge", "securityDoor", "fireAlarm"],
    section: "advanced",
    required: false,
  },
  {
    name: "fireSafety",
    label: "listings.fireSafety",
    type: "multiselect",
    options: ["sprinklers", "fireExtinguisher", "fireEscape", "fireAlarm"],
    section: "advanced",
    required: false,
  },
  {
    name: "flooringType",
    label: "listings.flooringType",
    type: "select",
    options: ["tile", "wood", "laminate", "carpet", "vinyl", "other"],
    section: "advanced",
    required: false,
  },
  {
    name: "internetIncluded",
    label: "listings.internetIncluded",
    type: "checkbox",
    section: "advanced",
    required: false,
  },
];
