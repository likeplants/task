// ListPage.js
import React, { useState, useEffect } from 'react';
import Api from '../api.js';

const ListPage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const capi = new Api('console', 'console');
        const data = await capi.get('/businesses/load');
        if (data) {
          setBusinesses(data);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch businesses');
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  return (
    <div className="scroll-container">
      <div className="scroll-content">
        <h1 className="text-2xl font-bold mb-4">Restaurants List</h1>
        
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : businesses.length === 0 ? (
          <p>No restaurants found. Add some from the Map page!</p>
        ) : (
          <div className="businesses-list">
            {businesses.map((business, index) => (
              <div key={index} className="business-card">
                <h2>{business.business_name}</h2>
                <p><strong>Food Type:</strong> {business.food_type}</p>
                <p><strong>Address:</strong> {business.address}</p>
                <p>
                  <strong>Location:</strong> {Number(business.latitude).toFixed(6)}, {Number(business.longitude).toFixed(6)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListPage;
