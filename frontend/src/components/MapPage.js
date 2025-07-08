// MapPage.tsx
import React, { useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
//import Form from '@rjsf/mui';
import validator from "@rjsf/validator-ajv8";
import Api from "../api.js"
import Form from '@rjsf/core';

import { MapContainer } from './MapContainer';
import { setBusinessAttr } from '../redux/BusinessSlice';
import crosshairIcon from '../icons/crosshair.svg';

const capi = new Api("console", "console");

const PositionPicker = (props) => {
  const { formContext = {}, onChange } = props;
  const { onSelectPosition, onResetPosition, isSelecting } = formContext;

  const handleSelect = () => {
    console.log('🔹 select clicked');
    if (onSelectPosition) onSelectPosition();
  };

  const handleReset = () => {
    console.log('🔹 reset clicked');
    if (onResetPosition) onResetPosition();
  };

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <button
        type="button"
        onClick={handleSelect}
        className="green-button"
        style={{ height: "30px", background:isSelecting?"green":"orange" }}
      >
        <img src={crosshairIcon} alt="Select Position" style={{ width: '16px', marginRight: '5px' }} />
        Auswählen
      </button>

      <button
        type="button"
        onClick={handleReset}
        className="green-button"
        style={{ height: "30px" }}
      >
        Zurücksetzen
      </button>
    </div>
  );
};

const MapPage = () => {
  const mapRef = useRef(null);
  const [addr, setAddr] = useState("");
  const [isSelecting, setIsSelecting] = useState("")
  const search = () => addr.trim() && mapRef?.current?.goToAddress(addr.trim());
  const dispatch = useDispatch();
  const { latitude, longitude, business_name, address, food_type } = useSelector(state => state.business);

  const schema = {
    title: 'Business Info',
    type: 'object',
    required: ['business_name', 'address', 'food_type'],
    properties: {
      business_name: { type: 'string', title: 'Business Name' },
      address: { type: 'string', title: 'Address' },
      food_type: { type: 'string', title: 'Food Type' },
      latitude: { type: 'number', title: 'Latitude' },
      longitude: { type: 'number', title: 'Longitude' },
      PositionPicker: {type:"string", title:"Position Picker"}
    },
  };

  const uiSchema = {
      "ui:submitButtonOptions": { norender: true },//Custom submit button (german)
      latitude: {"ui:widget": "hidden",},//Filled by position picker
      longitude: {"ui:widget": "hidden",},//Filled by position picker
      PositionPicker: {"ui:field": "PositionPicker",},//Buttons that trigger map selection mode via formContext callback 
  }

  const fields = {
      PositionPicker: PositionPicker,
  }

  const formContext = {//For position picker
        onSelectPosition: () => {
            setIsSelecting(prev => !prev);
        },
        onResetPosition: () => {
            dispatch(setBusinessAttr({latitude:null, longitude:null}));
            setIsSelecting(false);
        },
        isSelecting: isSelecting,
  };
  
  const formData = { business_name, address, food_type, latitude, longitude };

  
  return (
    <div className="scroll-container">
      <div className="scroll-content">
        <MapContainer
          ref={mapRef}
          markerEndpoint="/"
          polygonEndpoint={null}
          markerSelectionPossible={isSelecting}
          polygonSelectionPossible={false}
          newMarkers={[[longitude, latitude]]}
          newPolygons={null}
          onNewMarkersChanged={(newMarkers) => {
            if (!newMarkers || !newMarkers[0]) return;

            const lon = newMarkers[0][0];
            const lat = newMarkers[0][1];

            dispatch(setBusinessAttr({ longitude: lon, latitude: lat }));
          }}
          onNewPolygonsChanged={() => {}}
          onSelectedMarkerChange={() => alert('marker selection changed')}
          onSelectedPolygonChange={() => {}}
        />

      <div className="form-section">
        <br/>
        <label className="input_label">Search for a place:</label>
            <div style={{ display: "flex", alignItems: "left", gap: "8px" }}>
              <input
                className="input"
                value={addr}
                onChange={e => setAddr(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), search())}
                placeholder="Adresse eingeben"
                style={{ flexGrow: 1 }}
              />
              <button onClick={search} className="map-green-button">Suchen</button>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Edit Business Info</h2>

        <Form schema={schema} uiSchema={uiSchema} formData={formData} validator={validator}
         fields={fields} formContext={formContext} 
         onChange={()=>{
          alert("TODO: Dispatch to redux");
         }}
         onSubmit={()=>{
          alert("TODO: Use capi.post() to post data to endpoint /businesses/add");
         }}
         >
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="blue-button">
                    Save
                </button>
            </div>

        </Form>
      </div>
    </div>
</div>

  );
};

export default MapPage;
