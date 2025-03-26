import { useState, useEffect } from "react";
import {
  VehicleType,
  getMakesForType,
  getModelsForMakeAndType,
  searchMakesForType,
  searchModelsForMakeAndType,
} from "../data/vehicleModels";

interface UseVehicleModelsProps {
  type: VehicleType;
  initialMake?: string;
  initialModel?: string;
}

export const useVehicleModels = ({
  type,
  initialMake,
  initialModel,
}: UseVehicleModelsProps) => {
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [selectedMake, setSelectedMake] = useState(initialMake || "");
  const [selectedModel, setSelectedModel] = useState(initialModel || "");

  // Load makes when type changes
  useEffect(() => {
    const availableMakes = getMakesForType(type);
    setMakes(availableMakes);

    // Reset selection if type changes
    if (!initialMake) {
      setSelectedMake("");
      setSelectedModel("");
      setModels([]);
    }
  }, [type]);

  // Load models when make changes
  useEffect(() => {
    if (selectedMake) {
      const availableModels = getModelsForMakeAndType(type, selectedMake);
      setModels(availableModels);

      // Reset model if make changes and current model isn't available
      if (!initialModel || !availableModels.includes(selectedModel)) {
        setSelectedModel("");
      }
    } else {
      setModels([]);
      setSelectedModel("");
    }
  }, [selectedMake, type]);

  const handleMakeChange = (make: string) => {
    setSelectedMake(make);
    const availableModels = getModelsForMakeAndType(type, make);
    setModels(availableModels);
    setSelectedModel("");
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  const searchMakes = (query: string) => {
    return searchMakesForType(type, query);
  };

  const searchModels = (query: string) => {
    if (!selectedMake) return [];
    return searchModelsForMakeAndType(type, selectedMake, query);
  };

  return {
    makes,
    models,
    selectedMake,
    selectedModel,
    handleMakeChange,
    handleModelChange,
    searchMakes,
    searchModels,
  };
};
