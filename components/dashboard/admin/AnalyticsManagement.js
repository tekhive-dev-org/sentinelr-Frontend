import { useState } from 'react';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import styles from './AnalyticsManagement.module.css';

export default function AnalyticsManagement() {
  const [activeTab, setActiveTab] = useState('Device Usage');

  const barChartData = {
    'Device Usage': [
      { label: 'Group One', value: 100 },
      { label: 'Group Two', value: 65 },
      { label: 'Group Three', value: 65 },
      { label: 'Group Four', value: 65 },
      { label: 'Group Five', value: 85 },
      { label: 'Group Six', value: 85 },
      { label: 'Group Seven', value: 85 }
    ],
    'Active Users': [
      { label: 'Group One', value: 100 },
      { label: 'Group Two', value: 65 },
      { label: 'Group Three', value: 65 },
      { label: 'Group Four', value: 65 },
      { label: 'Group Five', value: 85 },
      { label: 'Group Six', value: 85 },
      { label: 'Group Seven', value: 85 }
    ],
    'Subscription Revenue': [
      { label: 'Group One', value: 100 },
      { label: 'Group Two', value: 65 },
      { label: 'Group Three', value: 65 },
      { label: 'Group Four', value: 65 },
      { label: 'Group Five', value: 85 },
      { label: 'Group Six', value: 85 },
      { label: 'Group Seven', value: 85 }
    ],
    'Churn Rates': [
      { label: 'Group One', value: 100 },
      { label: 'Group Two', value: 65 },
      { label: 'Group Three', value: 65 },
      { label: 'Group Four', value: 65 },
      { label: 'Group Five', value: 85 },
      { label: 'Group Six', value: 85 },
      { label: 'Group Seven', value: 85 }
    ]
  };

  const currentData = barChartData[activeTab] || barChartData['Device Usage'];
  const maxValue = 100;

  const getBarColor = (tab) => {
    switch (tab) {
      case 'Active Users':
        return '#10b981';
      case 'Churn Rates':
        return '#0e7490';
      default:
        return '#10b981';
    }
  };

  return (
    <div className={styles.analyticsManagement}>
      <div className={styles.analyticsCard}>
        <div className={styles.cardHeader}>
          <div className={styles.titleSection}>
            <h2 className={styles.cardTitle}>Website Analytics</h2>
            <button className={styles.weekSelector}>
              This Week
              <CalendarTodayOutlinedIcon className={styles.calendarIcon} />
            </button>
          </div>
          <button className={styles.exportBtn}>
            Export
            <KeyboardArrowDownIcon className={styles.dropdownIcon} />
          </button>
        </div>

        <div className={styles.tabs}>
          {['Device Usage', 'Active Users', 'Subscription Revenue', 'Churn Rates'].map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>
            {activeTab === 'Active Users' ? 'Active Users by Groupings' : 
             activeTab === 'Device Usage' ? 'Device Usage' :
             activeTab === 'Subscription Revenue' ? 'Subscription Revenue' :
             activeTab === 'Churn Rates' ? 'Churn Rates' : activeTab}
          </h3>

          <div className={styles.barChart}>
            <div className={styles.chartArea}>
              <div className={styles.bars}>
                {currentData.map((item, index) => (
                  <div key={index} className={styles.barWrapper}>
                    <div className={styles.barLabelLeft}>{item.label}</div>
                    <div className={styles.barContainer}>
                      <div
                        className={styles.bar}
                        style={{
                          width: `${(item.value / maxValue) * 100}%`,
                          backgroundColor: '#10b981'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.xAxis}>
                <span>0</span>
                <span>20</span>
                <span>40</span>
                <span>60</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
