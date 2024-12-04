import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import RegisterScreen from "./components/RegisterScreen";
import LoginScreen from "./components/LoginScreen";
import HomeScreen from "./components/HomeScreen";
import AddRecipeScreen from "./components/AddRecipeScreen";
import SearchScreen from "./components/SearchScreen";
import ProfileScreen from "./components/ProfileScreen";
import EditProfileScreen from './components/EditProfileScreen';
import RecipePage from "./components/RecipePage";
import FavoriteRecipes from './components/FavoriteRecipes';
import MealPlanScreen from './components/MealPlanScreen';
import AddToMealPlan from './components/AddToMealPlan';
import CategoryRecipes from './components/CategoryRecipes';
import UserProfile from './components/UserProfile';
import NotificationScreen from './components/NotificationScreen';
import SearchResults from './components/SearchResults';
import AllIngredients from './components/AllIngredients';
import MyRecipesScreen from "./components/MyRecipesScreen";
import EditRecipeScreen from "./components/EditRecipeScreen";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoadingScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/add-recipe" element={<AddRecipeScreen />} />
        <Route path="/search" element={<SearchScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/edit-profile" element={<EditProfileScreen />} />
        <Route path="/recipes/:id" element={<RecipePage />} />
        <Route path="/favorites" element={<FavoriteRecipes />} />
        <Route path="/meal-plan" element={<MealPlanScreen />} />
        <Route path="/add-to-meal-plan" element={<AddToMealPlan />} />
        <Route path="/category-recipes" element={<CategoryRecipes />} />
        <Route path="/user/:userId" element={<UserProfile />} />
        <Route path="/notifications" element={<NotificationScreen />} />
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/all-ingredients" element={<AllIngredients />} />
        <Route path="/my-recipes" element={<MyRecipesScreen />} />
        <Route path="/edit-recipe/:recipeId" element={<EditRecipeScreen />} />
      </Routes>
    </Router>
  );
};

export default App;
