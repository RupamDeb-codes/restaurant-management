import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GetStartedPage from '../pages/GetStartedPage';
import SelectTypePage from '../pages/SelectTypePage';
import PreferencesPage from '../pages/PreferencesPage';
import MenuPage from '../pages/MenuPage';
import ReviewOrderPage from '../pages/ReviewOrderPage';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GetStartedPage />} />
        <Route path="/select-type" element={<SelectTypePage />} />
        <Route path="/preferences" element={<PreferencesPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/review-order" element={<ReviewOrderPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;