import { useEffect, useState } from "react";
import { FaCar, FaHome } from "react-icons/fa";
import {
  type Listing,
  type ListingParams,
  ListingCategory,
  type ListingWithRelations,
} from "@/types/shared";
import ListingCard from "@/components/listings/details/ListingCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { listingsAPI } from "@/api/listings.api";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { serverStatus } from "@/utils/serverStatus";
import { debounce } from "lodash";

const Home = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory>(
    (localStorage.getItem("selectedCategory") as ListingCategory) ||
      ListingCategory.VEHICLES,
  );
  const [listings, setListings] = useState<ListingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendingListings, setTrendingListings] = useState<
    ListingWithRelations[]
  >([]);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  useEffect(() => {
    const unsubscribe = serverStatus.subscribe(setIsServerOnline);
    return () => unsubscribe();
  }, []);

  const fetchListings = async () => {
    if (!isServerOnline) {
      setListingsError(t("errors.server_offline"));
      setLoading(false);
      return;
    }

    if (!hasAttemptedFetch) {
      setHasAttemptedFetch(true);
    }

    setListingsError(null);
    setLoading(true);

    try {
      const response = await listingsAPI.getAll({
        category: selectedCategory,
        limit: 8,
      });

      if (response.success && response.data) {
        setListings(response.data.items);
      } else {
        if (response.error) {
          setListingsError(response.error);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.fetch_failed");
      setListingsError(errorMessage);
      if (!(error instanceof Error) || !error.message.includes("No listings")) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: ListingCategory) => {
    setSelectedCategory(category);
    localStorage.setItem("selectedCategory", category);
  };

  const debouncedSearch = debounce(async (query: string) => {
    if (!isServerOnline) {
      toast.error(t("errors.server_offline"));
      return;
    }

    if (!query.trim()) {
      await fetchListings();
      return;
    }

    try {
      setLoading(true);
      const response = await listingsAPI.search(query);

      if (response.success && response.data) {
        setListings(response.data.items || []);

        if (!response.data.items || response.data.items.length === 0) {
          setListingsError(t("errors.no_search_results"));
        } else {
          setListingsError(null);
        }
      } else {
        setListingsError(response.error || t("errors.search_failed"));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("errors.search_failed");
      setListingsError(errorMessage);
      if (!(err instanceof Error) || !err.message.includes("No listings")) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, 500);

  const handleSearch = (query: string) => {
    debouncedSearch(query);
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCategory]);

  const renderContent = () => {
    if (loading && !hasAttemptedFetch) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              showActions={false}
              showSaveButton={false}
            />
          ))}
          {listings.length === 0 && listingsError && (
            <div className="col-span-full text-center py-8 text-gray-600 dark:text-gray-400">
              {listingsError}
              {isServerOnline && (
                <button
                  onClick={fetchListings}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t("common.try_again")}
                </button>
              )}
            </div>
          )}
        </div>

        {trendingListings.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {t("home.trending_now")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  showActions={false}
                  showSaveButton={false}
                />
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">
              {t("home.find_perfect")}{" "}
              {selectedCategory === ListingCategory.VEHICLES
                ? t("home.vehicle")
                : t("home.property")}
            </h1>
            <p className="text-blue-100 text-xl mb-8">
              {selectedCategory === ListingCategory.VEHICLES
                ? t("home.discover_vehicle")
                : t("home.discover_property")}
            </p>
            <div className="flex justify-center space-x-4 mb-8">
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
            <SearchBar onSearch={handleSearch} />
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
