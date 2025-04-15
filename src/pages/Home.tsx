import { listingsAPI } from "@/api/listings.api";
import ListingCard from "@/components/listings/details/ListingCard";
import ListingFilters from "@/components/filters/ListingFilters";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { SearchBar } from "@/components/ui/SearchBar";
import { ListingCategory, VehicleType, PropertyType } from "@/types/enums";
import {
  type ExtendedListing
} from "@/types/listings";
import { serverStatus } from "@/utils/serverStatus";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCar, FaHome } from "react-icons/fa";
import { toast } from "react-toastify";
import { MdFilterList } from "react-icons/md";

interface ListingParams {
  category?: {
    mainCategory: ListingCategory;
    subCategory?: VehicleType | PropertyType;
  };
  vehicleDetails?: {
    make?: string;
    model?: string;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  page?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  preview?: boolean;
  forceRefresh?: boolean;
}

interface ListingsState {
  all: ExtendedListing[];
  popular: ExtendedListing[];
  loading: boolean;
  error: string | null;
}

const Home: React.FC = () => {
  const { t } = useTranslation();
  const abortControllerRef = useRef<AbortController>();
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory>(
    (localStorage.getItem("selectedCategory") as ListingCategory) ||
      ListingCategory.VEHICLES
  );
  const [listings, setListings] = useState<ListingsState>({
    all: [],
    popular: [],
    loading: true,
    error: null,
  });
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  // Filter states
  const [selectedAction, setSelectedAction] = useState<"SELL" | "RENT" | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [allSubcategories, setAllSubcategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Cache for storing initial listings data
  const listingsCache = useRef<{
    [key in ListingCategory]?: ExtendedListing[];
  }>({});

  const fetchListings = useCallback(async () => {
    // If we have cached data for this category and it's not initial load, use it
    if (!isInitialLoad && listingsCache.current[selectedCategory]) {
      setListings(prev => ({
        ...prev,
        all: listingsCache.current[selectedCategory] || [],
        loading: false,
        error: null
      }));
      return;
    }

    if (!isServerOnline) {
      setListings((prev) => ({
        ...prev,
        loading: false,
        error: t("errors.server_offline"),
      }));
      return;
    }

    // Abort previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setListings((prev) => ({ ...prev, loading: true }));
      
      const params: ListingParams = {
        category: {
          mainCategory: selectedCategory,
        },
        limit: 100, // Increased limit to get more items for client-side filtering
        page: 1,
        sortBy: "createdAt",
        sortOrder: "desc",
        preview: true
      };

      const response = await listingsAPI.getAll(params, abortControllerRef.current.signal);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch listings");
      }

      const allListings = response.data.listings || [];
      
      // Cache the results
      listingsCache.current[selectedCategory] = allListings;

      const popularListings = [...allListings]
        .sort((a, b) => ((b as ExtendedListing).savedBy?.length ?? 0) - ((a as ExtendedListing).savedBy?.length ?? 0))
        .slice(0, 4);

      setListings({
        all: allListings,
        popular: popularListings,
        loading: false,
        error: null
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (
          error.name === 'AbortError' ||
          error.message.includes('signal is aborted') ||
          error.message.includes('The user aborted a request') ||
          error.message.includes('aborted without reason')
        ) {
          return;
        }
        console.error("Error fetching listings:", error);
        setListings((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      } else {
        setListings((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to fetch listings",
        }));
      }
    }
  }, [selectedCategory, isServerOnline, t, isInitialLoad]);

  // Single effect for fetching listings - only on category change or initial load
  useEffect(() => {
    if (isServerOnline) {
      fetchListings();
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isServerOnline, selectedCategory, fetchListings, isInitialLoad]);

  // Memoized filtered listings
  const filteredListings = useMemo(() => {
    setIsFiltering(true);
    const filtered = listings?.all?.filter((listing) => {
      const matchesCategory = listing.category.mainCategory === selectedCategory;
      const matchesAction = selectedAction ? listing.listingAction === selectedAction : true;
      const matchesSubcategory = selectedSubcategory ? listing.category.subCategory === selectedSubcategory : true;
      const matchesMake = selectedMake ? listing.details.vehicles?.make === selectedMake : true;
      const matchesModel = selectedModel ? listing.details.vehicles?.model === selectedModel : true;
      
      return matchesCategory && matchesAction && matchesSubcategory && matchesMake && matchesModel;
    });
    setIsFiltering(false);
    return filtered;
  }, [listings.all, selectedCategory, selectedAction, selectedSubcategory, selectedMake, selectedModel]);

  // Handle category change
  const handleCategoryChange = useCallback((category: ListingCategory) => {
    localStorage.setItem("selectedCategory", category);
    setSelectedCategory(category);
  }, []);

  // Handle server status changes
  useEffect(() => {
    const unsubscribe = serverStatus.subscribe(setIsServerOnline);
    return () => unsubscribe();
  }, []);

  const handleSearch = useCallback(
    async (query: string) => {
      if (!isServerOnline) {
        toast.error(t("errors.server_offline"));
        return;
      }

      if (!query.trim()) {
        await fetchListings();
        return;
      }

      try {
        setListings((prev) => ({ ...prev, loading: true }));
        const searchResults = await listingsAPI.search(query);

        setListings({
          all: searchResults.data?.listings || [],
          popular: [],
          loading: false,
          error: null,
        });
      } catch (error) {
        setListings((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error ? error.message : t("errors.search_failed"),
        }));
      }
    },
    [isServerOnline, t, fetchListings]
  );

  // Memoize the debounced search function
  const debouncedSearch = useMemo(
    () => debounce(handleSearch, 500),
    [handleSearch]
  );

  useEffect(() => {
    const subcategories = Array.from(
      new Set(
        listings.all
          .filter((l) => l.category.mainCategory === selectedCategory)
          .map((l) => l.category.subCategory)
      )
    );
    setAllSubcategories(subcategories);
  }, [listings.all, selectedCategory]);

  // Reset filters when category changes
  useEffect(() => {
    setSelectedSubcategory(null);
    setSelectedMake(null);
    setSelectedModel(null);
  }, [selectedCategory]);

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const renderContent = useCallback(() => {
    if (listings.loading) {
      return (
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={toggleFilters}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <MdFilterList className="w-5 h-5" />
            <span className="text-sm">{t("Filters")}</span>
          </button>
        </div>

        {isFilterOpen && (
          <ListingFilters
            selectedAction={selectedAction}
            setSelectedAction={setSelectedAction}
            selectedSubcategory={selectedSubcategory}
            setSelectedSubcategory={setSelectedSubcategory}
            allSubcategories={allSubcategories}
            selectedMake={selectedMake}
            setSelectedMake={setSelectedMake}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            isLoading={isFiltering}
          />
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              showActions={false}
              showSaveButton={true}
              showPrice={true}
              showLocation={true}
              showBadges={true}
            />
          ))}
          {listings.all.length === 0 && listings.error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="col-span-full text-center py-8 text-gray-600 dark:text-gray-400"
            >
              {listings.error && (
                <div className="text-red-500 whitespace-pre-wrap">
                  {typeof listings.error === "string"
                    ? listings.error
                    : t("errors.fetch_failed")}
                </div>
              )}
              {isServerOnline && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchListings}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t("common.try_again")}
                </motion.button>
              )}
            </motion.div>
          )}
        </motion.div>

        {listings.popular.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-12"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {t("home.trending_now")}
            </h3>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {listings.popular.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  showActions={false}
                  showSaveButton={true}
                  showPrice={true}
                  showLocation={true}
                  showBadges={true}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </>
    );
  }, [listings, isServerOnline, t, fetchListings, filteredListings, isFilterOpen, isFiltering, selectedAction, selectedSubcategory, selectedMake, selectedModel, allSubcategories]);

  return (
    <div className="min-h-[100svh] bg-gray-50 dark:bg-transparent">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-6 sm:py-10 md:py-12 min-h-[20vh] sm:min-h-[22vh] lg:min-h-[25vh]">


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4">
              {t("home.find_perfect")}{" "}
              {selectedCategory === ListingCategory.VEHICLES
                ? t("home.vehicle")
                : t("home.property")}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-blue-100 mb-8">
              {selectedCategory === ListingCategory.VEHICLES
                ? t("home.discover_vehicle")
                : t("home.discover_property")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <button
                onClick={() => handleCategoryChange(ListingCategory.VEHICLES)}
                className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                  selectedCategory === ListingCategory.VEHICLES
                    ? "bg-white text-blue-600"
                    : "bg-blue-700 text-white hover:bg-blue-600"
                }`}
              >
                <FaCar className="mr-2" />
                {t("navigation.vehicles")}
              </button>
              <button
                onClick={() =>
                  handleCategoryChange(ListingCategory.REAL_ESTATE)
                }
                className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                  selectedCategory === ListingCategory.REAL_ESTATE
                    ? "bg-white text-blue-600"
                    : "bg-blue-700 text-white hover:bg-blue-600"
                }`}
              >
                <FaHome className="mr-2" />
                {t("navigation.real_estate")}
              </button>
            </div>
            <SearchBar onSearch={debouncedSearch} className="mt-4" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {renderContent()}
      </div>
    </div>
  );
};

export default Home;