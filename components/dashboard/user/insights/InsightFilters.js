import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Menu, MenuItem } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { format, parseISO } from 'date-fns';
import styles from './InsightFilters.module.css';
import CustomSelect from '../../../ui/CustomSelect';

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

  // Options for Period CustomSelect
  const periodOptions = [
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' }
  ];

  if (isDatePeriod) {
    periodOptions.push({ value: 'custom', label: 'Custom' });
  }

  // Options for Chart Type CustomSelect
  const chartTypeOptions = [
    { value: 'graph', label: 'View by Impr. Graph' },
    { value: 'barchart', label: 'View by Bar Chart' }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.leftGroup}>
        <h2 className={styles.title}>Usage Analytics</h2>
        
        {/* Period Selector (Week) */}
        <CustomSelect
            value={['this_week', 'last_week'].includes(activePeriod) ? activePeriod : 'custom'}
            onChange={(val) => {
                if (val !== 'custom') onPeriodChange(val);
            }}
            options={periodOptions}
            icon={<CalendarTodayOutlinedIcon style={{ fontSize: 16 }} />}
            className={styles.periodSelect}
        />
        
        {/* Day Picker */}
        <div className={styles.datePickerWrapper}>
             {/* The visible button */}
            <button 
                className={styles.pillTrigger} 
                onClick={() => setDatePickerOpen(true)}
            >
                {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Day'}
                <CalendarTodayOutlinedIcon className={styles.icon} />
            </button>
            
            {/* Hidden DatePicker controlled by state */}
            <div className={styles.hiddenPicker}>
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
        <CustomSelect
            value={currentChartType}
            onChange={(val) => onChartTypeChange(val)}
            options={chartTypeOptions}
            className={styles.typeSelect}
        />
      </div>
          
      {/* Export Button */}
      <div>
        <button 
            onClick={handleExportClick}
            className={styles.exportBtn}
        >
            Export
            <KeyboardArrowDownIcon className={styles.exportIcon} />
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
