// src/components/LocationAutocomplete.jsx

import React, { useState, useEffect } from 'react';
import { Autocomplete } from '@react-google-maps/api';

const LocationAutocomplete = ({ onPlaceSelect, label, value }) => {
  const [autocomplete, setAutocomplete] = useState(null);
  const [inputValue, setInputValue] = useState('');

  // Sync input text when parent sets a value (e.g. via quick search)
  useEffect(() => {
    if (value?.shortName) {
      setInputValue(value.shortName);
    } else {
      setInputValue('');
    }
  }, [value]);

  const onLoad = (ac) => {
    setAutocomplete(ac);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (!place || !place.geometry) return;

      const shortName =
        place.name?.length < 35
          ? place.name
          : place.formatted_address.split(',')[0];

      const details = {
        address: place.formatted_address,
        shortName,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      onPlaceSelect(details);
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  };

  const inputStyle = {
    boxSizing: `border-box`,
    border: `1px solid #c4c4c4`,
    width: `100%`,
    height: `56px`,
    padding: `0 12px`,
    borderRadius: `4px`,
    fontSize: `1rem`,
    outline: `none`,
    textOverflow: `ellipses`,
  };

  return (
    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
      <input
        type="text"
        placeholder={label}
        style={inputStyle}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
    </Autocomplete>
  );
};

export default LocationAutocomplete;
