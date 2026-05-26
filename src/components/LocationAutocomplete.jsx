import React, { useState, useEffect, useRef } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';

const LocationAutocomplete = ({ onPlaceSelect, label, value }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  const debounceTimeout = useRef(null);

  useEffect(() => {
    if (value?.shortName) {
      setInputValue(value.shortName);
    } else {
      setInputValue('');
    }
  }, [value]);

  const fetchOptions = async (query) => {
    if (!query) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=in`);
      const data = await res.json();
      
      const formattedOptions = data.map((item) => ({
        address: item.display_name,
        shortName: item.name || item.display_name.split(',')[0],
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        place_id: item.place_id,
      }));
      
      setOptions(formattedOptions);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    
    debounceTimeout.current = setTimeout(() => {
      fetchOptions(newInputValue);
    }, 600);
  };

  const handleChange = (event, newValue) => {
    if (newValue) {
      onPlaceSelect({
        address: newValue.address,
        shortName: newValue.shortName,
        lat: newValue.lat,
        lng: newValue.lng,
      });
    } else {
      onPlaceSelect(null);
    }
  };

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={(option, val) => option.shortName === val.shortName}
      getOptionLabel={(option) => option?.shortName || ""}
      options={value && !options.find(o => o.shortName === value.shortName) ? [value, ...options] : options}
      loading={loading}
      value={value || null}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={label}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
            sx: {
              height: '56px',
              borderRadius: '12px',
              bgcolor: 'transparent',
              '& fieldset': { border: 'none' }
            }
          }}
        />
      )}
    />
  );
};

export default LocationAutocomplete;
