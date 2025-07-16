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
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          margin: '20px 0',
          color: 'white',
          textAlign: 'center',
          borderBottom: '3px solid #4CAF50',
          paddingBottom: '10px'
        }}>Yummy Restaurants</h1>
        
        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span> Loading...
          </p>
        ) : error ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#f44336' }}>
            ❌ Error: {error}
          </p>
        ) : businesses.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#666',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            border: '1px dashed #ccc',
            margin: '20px 0'
          }}>
            <p style={{ marginBottom: '10px', fontSize: '16px' }}>No restaurants found.</p>
            <p style={{ fontSize: '14px' }}>Add some from the Map page!</p>
          </div>
        ) : (
          <div className="businesses-list" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginTop: '20px',
            paddingBottom: '20px'
          }}>
            {businesses.map((business, index) => (
              <div key={index} className="business-card" style={{
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                border: '1px solid #eaeaea'
              }}>
                <h2 style={{ 
                  margin: '0 0 12px 0',
                  color: '#333',
                  fontSize: '18px',
                  borderBottom: '2px solid #4CAF50',
                  paddingBottom: '8px'
                }}>{business.business_name}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ margin: '0', fontSize: '14px' }}>
                    <span style={{ 
                      fontWeight: 'bold',
                      color: '#555',
                      display: 'inline-block',
                      width: '80px'
                    }}>Food Type:</span> 
                    <span style={{ color: '#666' }}>{business.food_type}</span>
                  </p>
                  <p style={{ margin: '0', fontSize: '14px' }}>
                    <span style={{ 
                      fontWeight: 'bold',
                      color: '#555',
                      display: 'inline-block',
                      width: '80px'
                    }}>Address:</span> 
                    <span style={{ color: '#666' }}>{business.address}</span>
                  </p>
                  <p style={{ margin: '0', fontSize: '14px' }}>
                    <span style={{ 
                      fontWeight: 'bold',
                      color: '#555',
                      display: 'inline-block',
                      width: '80px'
                    }}>Location:</span> 
                    <span style={{ color: '#666', fontFamily: 'monospace' }}>
                      {Number(business.latitude).toFixed(6)}, {Number(business.longitude).toFixed(6)}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListPage;
