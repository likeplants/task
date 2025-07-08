// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import businessReducer from './BusinessSlice';
import { combineReducers } from 'redux';

import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
const rootReducer = combineReducers({business: businessReducer});
//export const store = configureStore({reducer: rootReducer,});

const persistConfig = {key: 'root',storage,};
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({reducer: persistedReducer,});
export const persistor = persistStore(store);
