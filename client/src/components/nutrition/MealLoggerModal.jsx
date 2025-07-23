import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { Input, Button } from "../common/Styled";
import {
  searchIngredients,
  getMealTemplates,
  prepareTemplateForLogging,
} from "../../api/meal.api.js";
import { updateMealInLog } from "../../api/activity.api.js";
import useDebounce from "../../hooks/useDebounce";
import { useAuth } from "../../context/AuthContext";
import toast from 'react-hot-toast';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.primary};
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${theme.colors.cardBackgroundSolid};
  h2 {
    text-align: center;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid ${theme.colors.cardBackgroundSolid};
`;

const SearchResultsContainer = styled.div`
  border: 1px solid ${theme.colors.textMuted};
  border-radius: 4px;
  margin-top: -1rem;
  margin-bottom: 1rem;
  max-height: 200px;
  overflow-y: auto;
  background: ${theme.colors.cardBackgroundSolid};
`;

const SearchResult = styled.div`
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid ${theme.colors.background};
  &:hover {
    background-color: ${theme.colors.cardBackground};
  }
`;

const SelectedItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${theme.colors.cardBackgroundSolid};
  span {
    flex-basis: 50%;
    word-break: break-word;
  }
`;

const TemplateSelect = styled.select`
  width: 100%;
  padding: 0.5rem;
  margin-top: 1rem;
  background: ${theme.colors.cardBackground};
  color: ${theme.colors.text};
  border: 1px solid ${theme.colors.textMuted};
  border-radius: 4px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-around;
  text-align: center;
  padding: 1rem;
  background-color: ${theme.colors.cardBackground};
  border-radius: 4px;
  margin-top: 1rem;
`;

const SummaryItem = styled.div`
  h4 {
    color: ${theme.colors.accent};
    font-size: 1.5rem;
    margin: 0;
  }
  p {
    font-size: 0.8rem;
    color: ${theme.colors.textMuted};
    margin: 0;
  }
`;

function MealLoggerModal({ mealType, initialIngredients = [], onClose }) {
  const { refreshDashboardSummary } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [mealTemplates, setMealTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    getMealTemplates().then(setMealTemplates);
  }, []);

  useEffect(() => {
    const initialItems = initialIngredients.map((ing) => ({
      ingredientId: ing.ingredientId._id,
      name: ing.ingredientId.name,
      weightInGrams: ing.weightInGrams,
      ...ing.ingredientId,
    }));
    setSelectedItems(initialItems);
  }, [initialIngredients]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchIngredients(debouncedSearchTerm).then(setSearchResults);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  const handleQuickAddTemplate = async (templateId) => {
    if (!templateId) return;
    setLoading(true);
    try {
      const preparedIngredients = await prepareTemplateForLogging(templateId);
      const newItems = [...selectedItems];
      preparedIngredients.forEach((prepIng) => {
        if (
          !newItems.find((item) => item.ingredientId === prepIng.ingredientId)
        ) {
          newItems.push(prepIng);
        }
      });
      setSelectedItems(newItems);
    } catch (error) {
      toast(
        "Error adding template. Some ingredients may not exist in the master list."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIngredient = (ingredient) => {
    if (!selectedItems.find((item) => item.ingredientId === ingredient._id)) {
      setSelectedItems([
        ...selectedItems,
        {
          ...ingredient,
          ingredientId: ingredient._id,
          weightInGrams: 100,
        },
      ]);
    }
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleWeightChange = (index, weight) => {
    const newItems = [...selectedItems];
    newItems[index].weightInGrams = Number(weight);
    setSelectedItems(newItems);
  };

  const handleRemoveItem = (ingredientId) => {
    setSelectedItems(
      selectedItems.filter((item) => item.ingredientId !== ingredientId)
    );
  };

  const handleLog = async () => {
    setLoading(true);
    const payload = {
      mealType,
      ingredients: selectedItems.map(({ ingredientId, weightInGrams }) => ({
        ingredientId,
        weightInGrams,
      })),
    };
    try {
      await updateMealInLog(payload);
      await refreshDashboardSummary();
      onClose();
    } catch (err) {
      toast("Failed to log meal.");
      setLoading(false);
    }
  };

  const mealSummary = useMemo(() => {
    return selectedItems.reduce(
      (acc, item) => {
        const multiplier = item.weightInGrams / 100;
        acc.calories += (item.calories_per_100g || 0) * multiplier;
        acc.protein += (item.protein_per_100g || 0) * multiplier;
        acc.carbs += (item.carbs_per_100g || 0) * multiplier;
        acc.fats += (item.fats_per_100g || 0) * multiplier;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  }, [selectedItems]);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Log {mealType}</h2>
        </ModalHeader>
        <ModalBody>
          <div>
            <h4>Quick Add</h4>
            <TemplateSelect
              onChange={(e) => handleQuickAddTemplate(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a template...</option>
              {mealTemplates
                .filter(
                  (t) =>
                    t.templateType === mealType || t.templateType === "Snacks"
                )
                .map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
            </TemplateSelect>
          </div>
          <hr
            style={{
              margin: "1.5rem 0",
              border: `1px solid ${theme.colors.cardBackgroundSolid}`,
            }}
          />
          <div>
            <h4>Add Ingredients Manually</h4>
            <Input
              type="text"
              placeholder="Search for a food..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchResults.length > 0 && (
              <SearchResultsContainer>
                {searchResults.map((ing) => (
                  <SearchResult
                    key={ing._id}
                    onClick={() => handleSelectIngredient(ing)}
                  >
                    {ing.name}
                  </SearchResult>
                ))}
              </SearchResultsContainer>
            )}
          </div>

          <div>
            <h3>Your Meal Items</h3>
            {selectedItems.length === 0 && (
              <p style={{ color: theme.colors.textMuted, textAlign: "center" }}>
                Add ingredients from the search bar above.
              </p>
            )}
            {selectedItems.map((item, index) => (
              <SelectedItem key={item.ingredientId}>
                <span>{item.name}</span>
                <div>
                  <Input
                    type="number"
                    value={item.weightInGrams}
                    onChange={(e) => handleWeightChange(index, e.target.value)}
                    style={{
                      width: "80px",
                      margin: "0 0.5rem",
                      padding: "0.5rem",
                    }}
                  />
                  <span>g</span>
                </div>
                <Button
                  onClick={() => handleRemoveItem(item.ingredientId)}
                  style={{
                    width: "auto",
                    padding: "0.5rem",
                    fontSize: "0.8rem",
                    background: theme.colors.danger,
                  }}
                >
                  X
                </Button>
              </SelectedItem>
            ))}
          </div>

          <SummaryRow>
            <SummaryItem>
              <h4>{Math.round(mealSummary.calories)}</h4>
              <p>KCAL</p>
            </SummaryItem>
            <SummaryItem>
              <h4>{Math.round(mealSummary.protein)}g</h4>
              <p>PROTEIN</p>
            </SummaryItem>
            <SummaryItem>
              <h4>{Math.round(mealSummary.carbs)}g</h4>
              <p>CARBS</p>
            </SummaryItem>
            <SummaryItem>
              <h4>{Math.round(mealSummary.fats)}g</h4>
              <p>FATS</p>
            </SummaryItem>
          </SummaryRow>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={handleLog}
            disabled={loading || selectedItems.length === 0}
            style={{ width: "100%" }}
          >
            {loading ? "SAVING..." : `SAVE ${mealType.toUpperCase()}`}
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
}

export default MealLoggerModal;
