import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './styles/global.css';
import RegisterScreen from "./components/RegisterScreen";
import LoginScreen from "./components/LoginScreen";
import HomeScreen from "./components/HomeScreen";
import AddRecipeScreen from "./components/AddRecipeScreen";
import SearchScreen from "./components/SearchScreen";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegisterScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/add-recipe" element={<AddRecipeScreen />} />
        <Route path="/search" element={<SearchScreen />} />
      </Routes>
    </Router>
  );
};

export default App;
