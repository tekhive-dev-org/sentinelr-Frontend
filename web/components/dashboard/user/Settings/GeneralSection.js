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
          />
          <div className={styles.cameraIcon} onClick={onProfileClick}>
            <CameraAltOutlinedIcon className={styles.smallIcon} />
          </div>
          {profilePictureChanged && (
            <div className={styles.profileChangedMark}>
              ✓
            </div>
          )}
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.profileLabel}>Profile Photo</div>
          <div className={styles.profileSubtext}>PNG, JPEG, SVG (less than 5MB)</div>
          {profilePictureChanged && (
            <div className={styles.profileSelectedText}>
              New picture selected
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
              <ErrorOutlineIcon className={styles.errorIcon} />
              {formik.errors.fullName}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Contact phone number</label>
          <div className={styles.phoneInputWrapper}>
            <div className={styles.phonePrefix}>
              <img src="https://flagcdn.com/w20/ng.png" alt="Nigeria" />
            </div>
            <input
              type="text"
              name="phoneNumber"
              className={`${styles.input} ${styles.phoneInput} ${formik.touched.phoneNumber && formik.errors.phoneNumber ? styles.inputError : ''}`}
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          {formik.touched.phoneNumber && formik.errors.phoneNumber && (
            <div className={styles.errorText}>
              <ErrorOutlineIcon className={styles.errorIcon} />
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
              <ErrorOutlineIcon className={styles.errorIcon} />
              {formik.errors.username}
            </div>
          )}
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
              <ErrorOutlineIcon className={styles.errorIcon} />
              {formik.errors.email}
            </div>
          )}
          <div className={styles.infoText}>
            To change your email, please <a href="#">contact us</a>
          </div>
        </div>
      </div>
    </div>
  );
}
