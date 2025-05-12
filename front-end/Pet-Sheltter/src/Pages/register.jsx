import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Styles/register.module.css";
import { register } from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: 2 // Default to Adopter
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters long";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'role' ? parseInt(value) : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await register(formData);

      localStorage.setItem('token', response.token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', formData.role.toString());

      if (formData.role === 1) {
        navigate("/staff");
      } else if (formData.role === 2) {
        navigate("/adopter");
      }
    } catch (err) {
      console.error('Registration error:', err);

      let errorMessage = 'Registration failed';

      if (err.response?.data?.message) {
        if (err.response.data.message.includes('User exists')) {
          errorMessage = 'User already exists with this username or email';
        } else {
          errorMessage = err.response.data.message;
        }
      }

      const fullError = typeof err === "object"
        ? JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
        : String(err);

      // In development, show the full error, in production show the simple message
      const displayError = process.env.NODE_ENV === 'development'
        ? fullError
        : errorMessage;

      setErrors(prev => ({
        ...prev,
        general: displayError
      }));
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create account</h1>
      <div className={styles.card}>
        {errors.general && (
          <div className={`${styles.error} ${styles.generalError}`}>
            {errors.general}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && <span className={styles.errorMessage}>{errors.username}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="Your email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={styles.input}
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role" className={styles.label}>
              Role
            </label>
            <select
              id="role"
              name="role"
              className={styles.select}
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value={2}>Adopter</option>
              <option value={1}>Shelter Staff</option>
            </select>
          </div>

          <button type="submit" className={styles.submitButton}>
            Create Account
          </button>
        </form>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <div className={styles.switchContainer}>
          Already have an account?
          <a href="/login" className={styles.switchButton}>
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
