import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChange,
    placeholder = 'Search...',
}) => {
    return (
        <TextField
            size="small"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                    </InputAdornment>
                ),
            }}
            sx={{
                minWidth: 280,
                '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#fff',
                    '&.Mui-focused': {
                        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
                    },
                },
            }}
        />
    );
};

export default SearchBar;
