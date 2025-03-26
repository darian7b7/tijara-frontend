import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { Listing } from "@/types";
import { ListingsAPI } from "@/api";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

interface SavedListingsState {
  savedListings: Listing[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface SavedListingsContextValue extends SavedListingsState {
  addToSaved: (listing: Listing) => Promise<void>;
  removeFromSaved: (listingId: string) => Promise<void>;
  clearSaved: () => void;
  isSaved: (listingId: string) => boolean;
  refreshSaved: () => Promise<void>;
  toggleSaved: (listing: Listing) => Promise<void>;
  getSavedCount: () => number;
}

const SavedListingsContext = createContext<
  SavedListingsContextValue | undefined
>(undefined);

interface SavedListingsProviderProps {
  children: React.ReactNode;
  maxSavedListings?: number;
}

const STORAGE_KEY = "saved_listings";
const DEFAULT_MAX_SAVED = 50;

export const SavedListingsProvider: React.FC<SavedListingsProviderProps> = ({
  children,
  maxSavedListings = DEFAULT_MAX_SAVED,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<SavedListingsState>({
    savedListings: [],
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const setListingsState = useCallback(
    (updates: Partial<SavedListingsState>) => {
      setState((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const persistToStorage = useCallback((listings: Listing[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
    } catch (err) {
      console.error("Failed to persist saved listings to storage:", err);
    }
  }, []);

  const loadFromStorage = useCallback((): Listing[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("Failed to load saved listings from storage:", err);
      return [];
    }
  }, []);

  const syncWithServer = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setListingsState({ isLoading: true, error: null });
      const response = await ListingsAPI.getSavedListings();

      if (response.success && response.data) {
        setListingsState({
          savedListings: response.data.items,
          lastUpdated: new Date(),
          isLoading: false,
        });
        persistToStorage(response.data.items);
      } else {
        throw new Error(response.message || "Failed to sync saved listings");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sync saved listings";
      setListingsState({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  }, [isAuthenticated, setListingsState, persistToStorage]);

  const addToSaved = useCallback(
    async (listing: Listing) => {
      if (state.savedListings.length >= maxSavedListings) {
        toast.warning(`You can only save up to ${maxSavedListings} listings`);
        return;
      }

      try {
        let newListings = [...state.savedListings];

        if (!newListings.some((l) => l.id === listing.id)) {
          if (isAuthenticated) {
            const response = await ListingsAPI.addToSaved(listing.id);
            if (!response.success) {
              throw new Error(response.message || "Failed to save listing");
            }
          }

          newListings = [listing, ...newListings];
          setListingsState({
            savedListings: newListings,
            lastUpdated: new Date(),
          });
          persistToStorage(newListings);
          toast.success("Listing saved successfully");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to save listing";
        toast.error(errorMessage);
      }
    },
    [
      state.savedListings,
      maxSavedListings,
      isAuthenticated,
      setListingsState,
      persistToStorage,
    ],
  );

  const removeFromSaved = useCallback(
    async (listingId: string) => {
      try {
        if (isAuthenticated) {
          const response = await ListingsAPI.removeFromSaved(listingId);
          if (!response.success) {
            throw new Error(response.message || "Failed to remove listing");
          }
        }

        const newListings = state.savedListings.filter(
          (l) => l.id !== listingId,
        );
        setListingsState({
          savedListings: newListings,
          lastUpdated: new Date(),
        });
        persistToStorage(newListings);
        toast.success("Listing removed from saved");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to remove listing";
        toast.error(errorMessage);
      }
    },
    [isAuthenticated, state.savedListings, setListingsState, persistToStorage],
  );

  const clearSaved = useCallback(() => {
    setListingsState({
      savedListings: [],
      lastUpdated: new Date(),
    });
    localStorage.removeItem(STORAGE_KEY);
    toast.success("All saved listings cleared");
  }, [setListingsState]);

  const isSaved = useCallback(
    (listingId: string): boolean => {
      return state.savedListings.some((listing) => listing.id === listingId);
    },
    [state.savedListings],
  );

  const toggleSaved = useCallback(
    async (listing: Listing) => {
      if (isSaved(listing.id)) {
        await removeFromSaved(listing.id);
      } else {
        await addToSaved(listing);
      }
    },
    [isSaved, removeFromSaved, addToSaved],
  );

  const getSavedCount = useCallback((): number => {
    return state.savedListings.length;
  }, [state.savedListings]);

  const refreshSaved = useCallback(async () => {
    if (isAuthenticated) {
      await syncWithServer();
    } else {
      const localListings = loadFromStorage();
      setListingsState({
        savedListings: localListings,
        lastUpdated: new Date(),
        isLoading: false,
      });
    }
  }, [isAuthenticated, syncWithServer, loadFromStorage, setListingsState]);

  useEffect(() => {
    refreshSaved();
  }, [refreshSaved]);

  useEffect(() => {
    // Sync with server when user logs in
    if (isAuthenticated && user?.id) {
      syncWithServer();
    }
  }, [isAuthenticated, user?.id, syncWithServer]);

  const value: SavedListingsContextValue = {
    ...state,
    addToSaved,
    removeFromSaved,
    clearSaved,
    isSaved,
    refreshSaved,
    toggleSaved,
    getSavedCount,
  };

  return (
    <SavedListingsContext.Provider value={value}>
      {children}
    </SavedListingsContext.Provider>
  );
};

export const useSavedListings = (): SavedListingsContextValue => {
  const context = useContext(SavedListingsContext);
  if (context === undefined) {
    throw new Error(
      "useSavedListings must be used within a SavedListingsProvider",
    );
  }
  return context;
};

export default SavedListingsContext;
