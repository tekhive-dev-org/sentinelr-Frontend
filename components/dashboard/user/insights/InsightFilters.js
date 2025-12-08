import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Select, MenuItem, FormControl, Menu, Button, Box } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { format, parseISO } from 'date-fns';

export default function InsightFilters({ onChartTypeChange, currentChartType, activePeriod, onPeriodChange, onExport }) {
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const handleExportClick = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = (type) => {
    setExportAnchorEl(null);
    if (type) onExport(type);
  };

  const handleDateChange = (newValue) => {
    if (newValue) {
        onPeriodChange(format(newValue, 'yyyy-MM-dd'));
        setDatePickerOpen(false);
    }
  };

  const isDatePeriod = !['this_week', 'last_week', 'today', 'yesterday'].includes(activePeriod);
  const selectedDate = isDatePeriod ? parseISO(activePeriod) : null;

  // Custom Styles
  const pillStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '24px',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
    outline: 'none',
    height: '40px',
    boxSizing: 'border-box' // Ensure padding doesn't affect height if set
  };

  const selectStyle = {
    ...pillStyle,
    padding: '0', // Reset padding for Select input
    '& .MuiSelect-select': {
        padding: '8px 16px',
        paddingRight: '32px !important', // Space for icon
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    '& fieldset': { border: 'none' }, // Remove default MUI border
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0, marginRight: '16px' }}>Usage Analytics</h2>
        
        {/* Period Selector (Week) */}
        <FormControl size="small">
          <Select
            value={['this_week', 'last_week'].includes(activePeriod) ? activePeriod : 'custom'}
            onChange={(e) => {
                const val = e.target.value;
                if (val !== 'custom') onPeriodChange(val);
            }}
            displayEmpty
            sx={selectStyle}
            IconComponent={() => <CalendarTodayOutlinedIcon style={{ fontSize: '16px', color: '#6b7280', position: 'absolute', right: '12px', pointerEvents: 'none' }} />}
            renderValue={(selected) => {
                if (selected === 'this_week') return 'This Week';
                if (selected === 'last_week') return 'Last Week';
                return 'Custom';
            }}
          >
            <MenuItem value="this_week">This Week</MenuItem>
            <MenuItem value="last_week">Last Week</MenuItem>
            {isDatePeriod && <MenuItem value="custom" style={{ display: 'none' }}>Custom</MenuItem>}
          </Select>
        </FormControl>
        
        {/* Day Picker */}
        <div style={{ position: 'relative' }}>
             {/* The visible button */}
            <button 
                style={pillStyle} 
                onClick={() => setDatePickerOpen(true)}
            >
                {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Day'}
                <CalendarTodayOutlinedIcon style={{ fontSize: '16px', color: '#6b7280' }} />
            </button>
            
            {/* Hidden DatePicker controlled by state */}
            <div style={{ display: 'none' }}>
                <DatePicker 
                    open={datePickerOpen}
                    onClose={() => setDatePickerOpen(false)}
                    value={selectedDate}
                    onChange={handleDateChange}
                    slotProps={{
                        textField: {
                            // We don't render the input visibly, but we need it for the picker logic
                        }
                    }}
                />
            </div>
        </div>
        
        {/* Content Type Selector */}
        <FormControl size="small">
            <Select
                value={currentChartType}
                onChange={(e) => onChartTypeChange(e.target.value)}
                displayEmpty
                sx={selectStyle}
                IconComponent={() => <KeyboardArrowDownIcon style={{ fontSize: '18px', color: '#6b7280', position: 'absolute', right: '12px', pointerEvents: 'none' }} />}
                renderValue={(selected) => {
                    if (selected === 'graph') return 'Content Type/trend';
                    return 'View by Bar Chart';
                }}
            >
                <MenuItem value="graph">View by Impr. Graph</MenuItem>
                <MenuItem value="barchart">View by Bar Chart</MenuItem>
            </Select>
        </FormControl>
      </div>
          
      {/* Export Button */}
      <div>
        <button 
            onClick={handleExportClick}
            style={{ 
                backgroundColor: '#0f3c5f', 
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                height: '36px'
            }}
        >
            Export
            <KeyboardArrowDownIcon style={{ fontSize: '18px' }} />
        </button>
        <Menu
            anchorEl={exportAnchorEl}
            open={Boolean(exportAnchorEl)}
            onClose={() => handleExportClose(null)}
        >
            <MenuItem onClick={() => handleExportClose('csv')}>Export as CSV</MenuItem>
            <MenuItem onClick={() => handleExportClose('pdf')}>Export as PDF</MenuItem>
        </Menu>
      </div>
    </div>
  );
}
