import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Styles/Login.module.css";
import { login } from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateRole = (roleValue) => {
    console.log('=== Role Validation ===');
    console.log('Input role value:', roleValue);
    console.log('Input role type:', typeof roleValue);

    // Handle string roles
    if (typeof roleValue === 'string') {
      // Convert "Admin" to 0
      if (roleValue.toLowerCase() === 'admin') {
        console.log('Converting "Admin" string to role 0');
        return 0;
      }
      // Convert "Staff" to 1
      if (roleValue.toLowerCase() === 'staff') {
        return 1;
      }
      // Try converting to number if it's a numeric string
      const numericRole = Number(roleValue);
      if (!isNaN(numericRole)) {
        return validateRole(numericRole);
      }
    }

    // Handle numeric roles
    if (typeof roleValue === 'number' && !isNaN(roleValue)) {
      if (roleValue === 0 || roleValue === 1 || roleValue === 2) {
        return roleValue;
      }
    }

    // Default to adopter (2) for any invalid values
    console.warn('Invalid role value, defaulting to 2');
    return 2;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      console.log('=== Login Attempt ===');
      console.log('Email:', formData.email);
      
      const response = await login(formData);
      console.log('Server Response:', response);

      if (!response || !response.token) {
        throw new Error("Invalid response from server");
      }

      // Store token
      localStorage.setItem('token', response.token);
      localStorage.setItem('isAuthenticated', 'true');

      // Extract and validate role
      console.log('=== Role Processing ===');
      console.log('Raw role from response:', response.role);
      
      const validatedRole = validateRole(response.role);
      console.log('Validated role:', validatedRole);
      
      // Store the validated role
      localStorage.setItem('userRole', validatedRole.toString());
      
      // Verify storage
      const storedRole = localStorage.getItem('userRole');
      console.log('=== Storage Verification ===');
      console.log('Stored role:', storedRole);
      console.log('Parsed stored role:', Number(storedRole));

      // Store user data
      if (response.userId) localStorage.setItem('userId', response.userId);
      if (response.username) localStorage.setItem('username', response.username);
      if (response.email) localStorage.setItem('userEmail', response.email);

      // Navigation
      console.log('=== Navigation ===');
      console.log('Role for navigation:', validatedRole);
      
      let targetPath;
      switch (validatedRole) {
        case 0:
          targetPath = '/admin';
          break;
        case 1:
          targetPath = '/staff';
          break;
        default:
          targetPath = '/adopter';
      }

      console.log('Navigating to:', targetPath);
      navigate(targetPath);
      
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Log in</h1>
      <div className={styles.card}>
        {error && <div className={styles.error}>{error}</div>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={styles.input}
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
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
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Continue
          </button>
        </form>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <div className={styles.switchContainer}>
          Don't have an account?
          <a href="/register" className={styles.switchButton}>
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
