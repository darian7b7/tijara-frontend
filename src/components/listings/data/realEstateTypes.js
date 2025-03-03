export const realEstateTypes = {
    // 🏡 **Residential Properties (Living Spaces)**
    "Residential": [
      "House / Villa",
      "Apartment / Flat",
      "Townhouse",
      "Duplex / Triplex",
      "Studio",
      "Penthouse",
      "Farmhouse",
      "Bungalow",
      "Loft",
      "Mobile Home",
      "Prefabricated Home",
      "Senior Living / Retirement Home",
      "Student Housing",
      "Gated Community"
    ],
  
    // 🏢 **Commercial Properties (Business Spaces)**
    "Commercial": [
      "Office Space",
      "Retail Shop",
      "Warehouse",
      "Industrial Building",
      "Co-Working Space",
      "Restaurant / Café",
      "Hotel / Guesthouse",
      "Shopping Center / Mall",
      "Showroom",
      "Medical Office / Clinic",
      "Bank / Financial Institution",
      "Car Dealership",
      "Factory / Manufacturing Facility",
      "Data Center"
    ],
  
    // 🌱 **Land & Plots (Development & Investment)**
    "Land & Plots": [
      "Residential Plot",
      "Commercial Plot",
      "Agricultural Land",
      "Industrial Land",
      "Mixed-Use Plot",
      "Beachfront Land",
      "Mountain / Forest Land",
      "Lakefront / Riverfront Land",
      "Urban Development Land",
      "Subdivided Land"
    ],
  
    // 🏗️ **Investment & Special Use Properties**
    "Investment & Special Use": [
      "Event Venue",
      "Parking Space",
      "Storage Facility",
      "Educational Property (School, University)",
      "Healthcare Facility (Hospital, Clinic, Lab)",
      "Sports Facility (Gym, Stadium, Arena)",
      "Religious Property (Mosque, Church, Temple)",
      "Historic Property / Landmark",
      "Government Building",
      "Military / Defense Facility",
      "Transit Hub (Bus / Train Station, Airport)"
    ]
  };
  
  // **Helper Functions**
  export const getAllCategories = () => Object.keys(realEstateTypes);
  
  export const getTypesForCategory = (category) => realEstateTypes[category] || [];
  
  export const searchCategories = (query) => {
    const normalizedQuery = query.toLowerCase();
    return getAllCategories().filter(category => 
      category.toLowerCase().includes(normalizedQuery)
    );
  };
  
  export const searchTypes = (category, query) => {
    const normalizedQuery = query.toLowerCase();
    return getTypesForCategory(category).filter(type => 
      type.toLowerCase().includes(normalizedQuery)
    );
  };
  