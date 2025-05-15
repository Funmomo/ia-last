import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Styles/Login.module.css";
import { login } from "../services/api";
import { validateRole } from '../utils/auth';

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

      // Store user data
      if (response.userId) {
        console.log('Storing user ID from response:', response.userId);
        localStorage.setItem('userId', response.userId);
      }
      if (response.username) localStorage.setItem('username', response.username);
      if (response.email) localStorage.setItem('userEmail', response.email);

      // Extract and validate role
      console.log('=== Role Processing ===');
      console.log('Raw role from response:', response.role);
      
      const validatedRole = validateRole(response.role);
      if (validatedRole === null) {
        console.error('Unrecognized role from backend:', response.role);
        setError('Unrecognized user role. Please contact support.');
        return;
      }
      
      // Store the validated role
      localStorage.setItem('userRole', validatedRole.toString());
      
      // Verify storage
      const storedRole = localStorage.getItem('userRole');
      console.log('=== Storage Verification ===');
      console.log('Stored role:', storedRole);
      console.log('Parsed stored role:', Number(storedRole));

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
        case 2:
          targetPath = '/adopter';
          break;
        default:
          setError('Unrecognized user role. Please contact support.');
          return;
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
