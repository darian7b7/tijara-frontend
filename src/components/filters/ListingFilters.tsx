import React, { Fragment, useMemo, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { MdFilterList, MdCheck } from "react-icons/md";
import { FaCar, FaMotorcycle, FaTruck, FaHome, FaShuttleVan, FaBus, FaTractor } from "react-icons/fa";
import { ListingCategory } from "@/types/enums";
import { VehicleType } from "@/types/enums";
import { getMakesForType, getModelsForMakeAndType } from "@/components/listings/data/vehicleModels";

interface ListingFiltersProps {
  selectedAction: "SELL" | "RENT" | null;
  setSelectedAction: (value: "SELL" | "RENT" | null) => void;
  selectedSubcategory: string | null;
  setSelectedSubcategory: (value: string | null) => void;
  allSubcategories: string[];
  selectedMake: string | null;
  setSelectedMake: (value: string | null) => void;
  selectedModel: string | null;
  setSelectedModel: (value: string | null) => void;
  isLoading?: boolean;
}

// Mapping of subcategories to icons
const SubcategoryIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  CAR: FaCar,
  TRUCK: FaTruck,
  MOTORCYCLE: FaMotorcycle,
  VAN: FaShuttleVan,
  BUS: FaBus,
  TRACTOR: FaTractor,
  HOUSE: FaHome,
  APARTMENT: FaHome,
  CONDO: FaHome,
  // Add more mappings as needed
  OTHER: MdFilterList
};

const SubcategoryLabels: { [key: string]: string } = {
  // Vehicle Types
  CAR: "Cars",
  TRUCK: "Trucks",
  MOTORCYCLE: "Motorcycles",
  VAN: "Vans",
  BUS: "Buses",
  TRACTOR: "Tractors",
  RV: "RVs",
  BOAT: "Boats",
  
  // Property Types
  HOUSE: "Houses",
  APARTMENT: "Apartments",
  CONDO: "Condos",
  LAND: "Land",
  COMMERCIAL: "Commercial",
  
  // Fallback
  OTHER: "Other"
};

const ListingFilters: React.FC<ListingFiltersProps> = ({
  selectedAction,
  setSelectedAction,
  selectedSubcategory,
  setSelectedSubcategory,
  allSubcategories,
  selectedMake,
  setSelectedMake,
  selectedModel,
  setSelectedModel,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [localLoading, setLocalLoading] = useState(false);

  // Get available makes for the selected subcategory
  const availableMakes = useMemo(() => {
    if (!selectedSubcategory) return [];
    return getMakesForType(selectedSubcategory as VehicleType);
  }, [selectedSubcategory]);

  // Get available models for the selected make
  const availableModels = useMemo(() => {
    if (!selectedSubcategory || !selectedMake) return [];
    return getModelsForMakeAndType(selectedMake, selectedSubcategory as VehicleType);
  }, [selectedSubcategory, selectedMake]);

  // Reset model when make changes
  const handleMakeChange = async (make: string | null) => {
    setLocalLoading(true);
    try {
      setSelectedMake(make);
      setSelectedModel(null);
    } finally {
      setLocalLoading(false);
    }
  };

  // Reset make and model when subcategory changes
  const handleSubcategoryChange = async (subcategory: string | null) => {
    setLocalLoading(true);
    try {
      setSelectedSubcategory(subcategory);
      setSelectedMake(null);
      setSelectedModel(null);
    } finally {
      setLocalLoading(false);
    }
  };

  const isVehicleCategory = (subcategory: string | null): boolean => {
    return Object.values(VehicleType).includes(subcategory as VehicleType);
  };

  const handleActionChange = async (action: "SELL" | "RENT" | null) => {
    setLocalLoading(true);
    try {
      setSelectedAction(action);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Action Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("filters.action")}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleActionChange(selectedAction === "SELL" ? null : "SELL")}
              disabled={localLoading}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                selectedAction === "SELL"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              } ${localLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {t("forSale")}
            </button>
            <button
              onClick={() => handleActionChange(selectedAction === "RENT" ? null : "RENT")}
              disabled={localLoading}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                selectedAction === "RENT"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              } ${localLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {t("forRent")}
            </button>
          </div>
        </div>

        {/* Subcategory Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("filters.subcategory")}
          </label>
          <Listbox 
            value={selectedSubcategory || ""} 
            onChange={handleSubcategoryChange}
            disabled={localLoading}
          >
            <div className="relative">
              <Listbox.Button className={`w-full appearance-none px-4 py-2 text-sm rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 shadow-sm flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                localLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}>
                {selectedSubcategory && SubcategoryIcons[selectedSubcategory] && (
                  React.createElement(SubcategoryIcons[selectedSubcategory], { className: "w-5 h-5 mr-2" })
                )}
                <span className="truncate">
                  {selectedSubcategory
                    ? SubcategoryLabels[selectedSubcategory] || selectedSubcategory.replace(/_/g, " ").toLowerCase().replace(/(^\w|\s\w)/g, c => c.toUpperCase())
                    : t("filters.all_subcategories")}
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  <Listbox.Option key="all" value="" className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900 dark:text-white'}`
                  }>
                    {({ selected, active }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{t("filters.all_subcategories")}</span>
                        {selected ? (
                          <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-blue-600' : 'text-blue-600'}`}>
                            <MdCheck className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                  {allSubcategories?.map((subcategory) => (
                    <Listbox.Option
                      key={subcategory}
                      value={subcategory}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900 dark:text-white'}`
                      }
                    >
                      {({ selected, active }) => (
                        <>
                          <span className={`block truncate flex items-center ${selected ? 'font-medium' : 'font-normal'}`}>
                            {SubcategoryIcons[subcategory] && React.createElement(SubcategoryIcons[subcategory], { className: "w-5 h-5 mr-2 inline" })}
                            {SubcategoryLabels[subcategory] || subcategory.replace(/_/g, " ").toLowerCase().replace(/(^\w|\s\w)/g, c => c.toUpperCase())}
                          </span>
                          {selected ? (
                            <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-blue-600' : 'text-blue-600'}`}>
                              <MdCheck className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>

        {/* Make Filter - Only show for vehicle categories */}
        {isVehicleCategory(selectedSubcategory) && availableMakes.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("filters.make")}
            </label>
            <select
              value={selectedMake || ""}
              onChange={(e) => handleMakeChange(e.target.value || null)}
              disabled={localLoading}
              className={`w-full appearance-none px-4 py-2 text-sm rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                localLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <option value="">{t("filters.all_makes")}</option>
              {availableMakes.map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Model Filter - Only show when make is selected */}
        {selectedMake && availableModels.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("filters.model")}
            </label>
            <select
              value={selectedModel || ""}
              onChange={(e) => setSelectedModel(e.target.value || null)}
              disabled={localLoading}
              className={`w-full appearance-none px-4 py-2 text-sm rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                localLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <option value="">{t("filters.all_models")}</option>
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingFilters;
