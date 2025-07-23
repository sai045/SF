import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { Input, Button } from "../common/Styled";
import { searchIngredients, logCustomMeal } from "../../api/meal.api.js";

// Custom debounce hook to prevent API calls on every keystroke
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;

  h2 {
    text-align: center;
    margin-bottom: 2rem;
  }
`;

const SearchResultsContainer = styled.div`
  border: 1px solid ${theme.colors.textMuted};
  border-radius: 4px;
  margin-top: -1rem;
  margin-bottom: 1rem;
  max-height: 200px;
  overflow-y: auto;
`;

const SearchResult = styled.div`
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid ${theme.colors.cardBackgroundSolid};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${theme.colors.cardBackground};
  }
`;

const SelectedItemsContainer = styled.div`
  flex-grow: 1;
`;

const SelectedItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid ${theme.colors.cardBackgroundSolid};

  span {
    flex-basis: 50%;
    word-break: break-word;
  }
`;

function MealLoggerModal({ mealType, onClose, onMealLogged }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchIngredients(debouncedSearchTerm).then(setSearchResults);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  const handleSelectIngredient = (ingredient) => {
    if (!selectedItems.find((item) => item.ingredientId === ingredient._id)) {
      setSelectedItems([
        ...selectedItems,
        {
          ingredientId: ingredient._id,
          name: ingredient.name,
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
      loggedIngredients: selectedItems.map(
        ({ ingredientId, weightInGrams }) => ({ ingredientId, weightInGrams })
      ),
    };
    try {
      const response = await logCustomMeal(payload);
      onMealLogged(response);
      onClose();
    } catch (err) {
      alert("Failed to log meal.");
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h2>Log {mealType}</h2>
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

        <SelectedItemsContainer>
          <h3>Your Meal</h3>
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
        </SelectedItemsContainer>

        <Button
          onClick={handleLog}
          disabled={loading || selectedItems.length === 0}
          style={{ marginTop: "2rem", width: "100%" }}
        >
          {loading ? "LOGGING..." : `LOG MEAL`}
        </Button>
      </ModalContent>
    </ModalOverlay>
  );
}

export default MealLoggerModal;
