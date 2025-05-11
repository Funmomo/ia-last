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
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'role' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await register(formData);
      // Store the token, authentication status, and user role
      localStorage.setItem('token', response.token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', formData.role.toString());

      // Redirect based on role
      if (formData.role === 1) {
        navigate("/staff"); // Staff dashboard
      } else if (formData.role === 2) {
        navigate("/adopter"); // Adopter dashboard
      } else {
        setError("Invalid user role");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create account</h1>
      <div className={styles.card}>
        {error && <div className={styles.error}>{error}</div>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className={styles.input}
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={styles.input}
              placeholder="Your email address"
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
            Continue
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
