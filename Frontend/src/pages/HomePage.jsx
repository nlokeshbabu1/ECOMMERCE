import React, { lazy } from 'react';

// We can lazy load the grid itself for a small performance boost
const ProductGrid = lazy(() => import('../components/ProductGrid'));

const HomePage = (props) => {
  // All props are passed down from App.jsx to here
  return <ProductGrid {...props} />;
};

export default HomePage;