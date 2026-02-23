import React from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import styles from './Settings.module.css';

export default function GeneralSection({ 
  formik, 
  previewImage, 
  onProfileClick 
}) {
  // Check if profile picture has been changed
  const profilePictureChanged = !!formik.values.profilePicture;

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>General</h3>
      <p className={styles.sectionDescription}>Update your account settings.</p>

      <div className={styles.profileHeader}>
        <div className={styles.profileAvatarWrapper}>
          <img 
            src={previewImage} 
            alt="Profile" 
            className={styles.profileAvatar}
            onClick={onProfileClick}
            style={{ cursor: 'pointer' }}
          />
          <div className={styles.cameraIcon} onClick={onProfileClick} style={{ cursor: 'pointer' }}>
            <CameraAltOutlinedIcon style={{ fontSize: '14px' }} />
          </div>
          {profilePictureChanged && (
            <div style={{
              position: 'absolute',
              top: '0',
              right: '0',
              backgroundColor: '#10b981',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              ✓
            </div>
          )}
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.profileLabel}>Profile Photo</div>
          <div className={styles.profileSubtext}>PNG, JPEG, SVG (less than 5MB)</div>
          {profilePictureChanged && (
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', fontWeight: '500' }}>
              📷 New picture selected
            </div>
          )}
        </div>
      </div>

      <div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Full Name</label>
          <input
            type="text"
            name="fullName"
            className={`${styles.input} ${formik.touched.fullName && formik.errors.fullName ? styles.inputError : ''}`}
            value={formik.values.fullName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.fullName && formik.errors.fullName && (
            <div className={styles.errorText}>
              <ErrorOutlineIcon style={{ fontSize: '14px' }} />
              {formik.errors.fullName}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Contact phone number</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <img src="https://flagcdn.com/w20/ng.png" alt="Nigeria" style={{ width: '20px', borderRadius: '2px' }} />
            </div>
            <input
              type="text"
              name="phoneNumber"
              className={`${styles.input} ${formik.touched.phoneNumber && formik.errors.phoneNumber ? styles.inputError : ''}`}
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          {formik.touched.phoneNumber && formik.errors.phoneNumber && (
            <div className={styles.errorText}>
              <ErrorOutlineIcon style={{ fontSize: '14px' }} />
              {formik.errors.phoneNumber}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Username</label>
          <input
            type="text"
            name="username"
            className={`${styles.input} ${formik.touched.username && formik.errors.username ? styles.inputError : ''}`}
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.username && formik.errors.username && (
            <div className={styles.errorText}>
              <ErrorOutlineIcon style={{ fontSize: '14px' }} />
              {formik.errors.username}
            </div>
          )}
          <div className={styles.infoText}>
            <InfoOutlinedIcon style={{ fontSize: '14px' }} />
            Your SENTINELR profile is https://app.sentinelr.com/profile/{formik.values.username.toLowerCase()}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            className={`${styles.input} ${formik.touched.email && formik.errors.email ? styles.inputError : ''}`}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && (
            <div className={styles.errorText}>
              <ErrorOutlineIcon style={{ fontSize: '14px' }} />
              {formik.errors.email}
            </div>
          )}
          <div className={styles.infoText}>
            To change your email, please <a href="#" style={{ color: '#0f4c75', textDecoration: 'none' }}>contact us</a>
          </div>
        </div>
      </div>
    </div>
  );
}
