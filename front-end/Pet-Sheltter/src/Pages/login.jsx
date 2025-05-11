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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await login(formData);
      
      // Validate response
      if (!response || !response.token) {
        throw new Error("Invalid response from server");
      }

      // Store the token
      localStorage.setItem('token', response.token);
      localStorage.setItem('isAuthenticated', 'true');
      
      // Safely handle role
      const userRole = response.role || 2; // Default to Adopter if role is not provided
      localStorage.setItem('userRole', userRole.toString());

      // Redirect based on role
      if (userRole === 1) {
        navigate("/staff"); // Staff dashboard
      } else {
        navigate("/adopter"); // Adopter dashboard
      }
    } catch (err) {
      console.error('Login error:', err);
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
