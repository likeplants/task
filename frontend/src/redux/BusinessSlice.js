import { createSlice } from '@reduxjs/toolkit';

// Initial state for BusinessSlice
const initialState = {
  business_name: '',
  address: '',
  food_type: '',
  longitude: 0,
  latitude: 0,
};

const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    setBusinessAttr: (state, action) => {
      const payload = action.payload;

      Object.keys(payload).forEach((key) => {
        if (key in state) {
          state[key] = payload[key];
        }
      });
      // alert(JSON.stringify(state))
    },
  },
});

export const { setBusinessAttr } = businessSlice.actions;

export default businessSlice.reducer;
