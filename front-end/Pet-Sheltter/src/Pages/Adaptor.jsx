import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate, useParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import AdopterNavigation from '../components/AdopterNavigation';
import PetCard from '../components/PetCard';
import styles from '../Styles/Adaptor.module.css';

const API_BASE_URL = 'https://localhost:5001';

// Utility function for API calls with authentication
const fetchApi = async (endpoint) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Call Failed (${endpoint}):`, error);
    throw error;
  }
};

// Loading Component
const LoadingSpinner = () => (
  <div className={styles.loading}>Loading...</div>
);

// Error Component
const ErrorDisplay = ({ message, onRetry }) => (
      <div className={styles.error}>
    <h3>Error</h3>
    <p>{message}</p>
    {onRetry && (
        <button className={styles.retryButton} onClick={onRetry}>
          Try Again
      </button>
    )}
  </div>
);

// Pet Details Component
const PetDetails = () => {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchPetDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApi(`/api/Pet/${id}`);
      setPet(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPetDetails();
  }, [fetchPetDetails]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchPetDetails} />;
  if (!pet) return <Navigate to="../pets" replace />;

  return (
    <div className={styles.petDetailsPage}>
      <div className={styles.petDetailsHeader}>
        <button 
          className={styles.backButton}
          onClick={() => navigate('..')}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className={styles.petDetailsContent}>
        <div className={styles.petMainInfo}>
          <div className={styles.petImageSection}>
            <img 
              src={pet.imageUrl || 'https://via.placeholder.com/500x400?text=Pet+Image'} 
              alt={pet.name} 
              className={styles.petDetailImage}
            />
          </div>

          <div className={styles.petInfo}>
            <h1 className={styles.petName}>{pet.name}</h1>
            
            <div className={styles.petAttributes}>
              <div className={styles.attributeItem}>
                <span className={styles.attributeLabel}>Type:</span>
                <span className={styles.attributeValue}>{pet.type || 'Unknown'}</span>
              </div>
              <div className={styles.attributeItem}>
                <span className={styles.attributeLabel}>Breed:</span>
                <span className={styles.attributeValue}>{pet.breed || 'Unknown'}</span>
              </div>
              <div className={styles.attributeItem}>
                <span className={styles.attributeLabel}>Age:</span>
                <span className={styles.attributeValue}>{pet.age ? `${pet.age} years` : 'Unknown'}</span>
              </div>
              <div className={styles.attributeItem}>
                <span className={styles.attributeLabel}>Gender:</span>
                <span className={styles.attributeValue}>{pet.gender || 'Unknown'}</span>
              </div>
            </div>

            <div className={styles.petDescription}>
              <h2>About {pet.name}</h2>
              <p>{pet.description || 'No description available.'}</p>
            </div>

            <div className={styles.shelterSection}>
              <h2>Shelter Information</h2>
              <div className={styles.shelterInfo}>
                <h3>{pet.shelter?.name || 'Unknown Shelter'}</h3>
                <p>{pet.shelter?.address || 'Address not available'}</p>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <button 
                className={styles.adoptButton}
                onClick={() => navigate(`/adopter/adopt/${pet.id}`)}
              >
                Adopt Me
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    );
};

// Basic Adoption Form Component
const AdoptionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [existingRequest, setExistingRequest] = useState(false);

  // Function to check if pet was already requested
  const checkExistingRequest = () => {
    const adoptionRequests = document.cookie
      .split('; ')
      .find(row => row.startsWith('adoptionRequests='));
    
    if (adoptionRequests) {
      const requestedPets = JSON.parse(decodeURIComponent(adoptionRequests.split('=')[1]));
      return requestedPets.includes(parseInt(id));
    }
    return false;
  };

  // Function to save pet ID to cookies
  const saveRequestToCookies = () => {
    const existingCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('adoptionRequests='));
    
    let requestedPets = [];
    if (existingCookie) {
      requestedPets = JSON.parse(decodeURIComponent(existingCookie.split('=')[1]));
    }
    
    requestedPets.push(parseInt(id));
    
    // Set cookie to expire in 365 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 365);
    
    document.cookie = `adoptionRequests=${encodeURIComponent(JSON.stringify(requestedPets))}; expires=${expiryDate.toUTCString()}; path=/`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check cookies first
        const hasExistingRequest = checkExistingRequest();
        if (hasExistingRequest) {
          setExistingRequest(true);
          setLoading(false);
          return;
        }

        // If no cookie found, fetch pet data
        const data = await fetchApi(`/api/Pet/${id}`);
        setPet(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAdoptionSubmit = async () => {
    try {
      // If there's already a request in cookies, don't submit
      if (existingRequest || checkExistingRequest()) {
        return;
      }

      setSubmitting(true);
      setSubmitError(null);
      
      const token = localStorage.getItem('token');
      
      // Create the adoption request
      const adoptionResponse = await fetch(`${API_BASE_URL}/api/Adoption/simple`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          petId: id
        })
      });

      if (!adoptionResponse.ok) {
        throw new Error('Failed to submit adoption request');
      }

      // Save to cookies after successful submission
      saveRequestToCookies();
      setExistingRequest(true);

    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;
  if (!pet && !existingRequest) return <Navigate to="../pets" replace />;

  return (
    <div className={styles.adoptionPage}>
      <div className={styles.adoptionHeader}>
        <button 
          className={styles.backButton}
          onClick={() => navigate(`../pet/${id}`)}
        >
          ← Back to Pet Profile
        </button>
        <h1>Adopt {pet?.name}</h1>
      </div>

      <div className={styles.adoptionContent}>
        {pet && (
          <div className={styles.petSummary}>
            <img 
              src={pet.imageUrl || 'https://via.placeholder.com/300x200?text=Pet+Image'} 
              alt={pet.name} 
              className={styles.petImage}
            />
            <div className={styles.petInfo}>
              <h2>{pet.name}</h2>
              <p>{pet.breed} • {pet.age} years old</p>
              <p>From: {pet.shelter?.name || 'Unknown Shelter'}</p>
            </div>
          </div>
        )}

        <div className={styles.adoptionMessage}>
          <h2>{existingRequest ? 'Adoption Request Pending' : 'Confirm Adoption Request'}</h2>
          {existingRequest ? (
            <>
              <p>You have already submitted an adoption request for this pet.</p>
              <p>Please wait for the shelter to review your request.</p>
              <p>Request Status: Pending</p>
            </>
          ) : (
            <>
              <p>You are about to submit an adoption request for this pet.</p>
              <p>By confirming, you agree to:</p>
              <ul>
                <li>Provide a loving home for the pet</li>
                <li>Complete any required follow-up interviews</li>
                <li>Submit necessary documentation if requested</li>
                <li>Follow the shelter's adoption guidelines</li>
              </ul>
            </>
          )}
        </div>

        {submitError && (
          <div className={styles.error}>
            <p>{submitError}</p>
          </div>
        )}

        <div className={styles.actionButtons}>
          <button 
            className={`${styles.confirmButton} ${submitting ? styles.submitting : ''} ${existingRequest ? styles.pending : ''}`}
            onClick={handleAdoptionSubmit}
            disabled={submitting || existingRequest}
          >
            {existingRequest ? 'Request Pending' : submitting ? 'Submitting...' : 'Confirm Adoption'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Simplified Pet Card for Shelter View
const SimplePetCard = ({ pet }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.petCardContainer}>
      <img 
        src={pet.imageUrl || 'https://via.placeholder.com/300x200?text=Pet+Image'} 
        alt={pet.name}
        className={styles.petImage}
      />
      <div className={styles.petCardContent}>
        <h3 className={styles.petName}>{pet.name}</h3>
        <p className={styles.petBreed}>{pet.breed || 'Unknown Breed'}</p>
        <button 
          className={styles.adoptButton}
          onClick={() => navigate(`../adopt/${pet.id}`)}
        >
          Adopt
        </button>
      </div>
    </div>
  );
};

// Shelter Details Component
const ShelterDetails = () => {
  const { id } = useParams();
  const [shelter, setShelter] = useState(null);
  const [shelterPets, setShelterPets] = useState([]);
  const [suggestedShelters, setSuggestedShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchShelterData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch shelter details
      const shelterData = await fetchApi(`/api/Shelter/${id}`);
      setShelter(shelterData);

      // Fetch shelter's pets
      const petsData = await fetchApi(`/api/Pet/shelter/${id}`);
      setShelterPets(petsData);

      // Fetch suggested shelters (excluding current shelter)
      const allShelters = await fetchApi('/api/Shelter');
      setSuggestedShelters(
        allShelters
          .filter(s => s.id !== id)
          .slice(0, 3) // Get only 3 suggestions
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchShelterData();
  }, [fetchShelterData]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchShelterData} />;
  if (!shelter) return <Navigate to="/adopter/shelters" replace />;

  return (
    <div className={styles.shelterDetailsPage}>
      <div className={styles.shelterDetailsHeader}>
        <button 
          className={styles.backButton}
          onClick={() => navigate('..')}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className={styles.shelterDetailsContent}>
        <div className={styles.shelterMainInfo}>
          <h1 className={styles.shelterName}>{shelter.name}</h1>
          <div className={styles.shelterAttributes}>
            <div className={styles.attributeItem}>
              <span className={styles.attributeLabel}>Address:</span>
              <span className={styles.attributeValue}>{shelter.address || 'Not available'}</span>
            </div>
            <div className={styles.attributeItem}>
              <span className={styles.attributeLabel}>Phone:</span>
              <span className={styles.attributeValue}>{shelter.phone || 'Not available'}</span>
            </div>
            <div className={styles.attributeItem}>
              <span className={styles.attributeLabel}>Email:</span>
              <span className={styles.attributeValue}>{shelter.email || 'Not available'}</span>
            </div>
          </div>
        </div>

        <div className={styles.shelterPetsSection}>
          <h2>Available Pets</h2>
          <div className={styles.petGrid}>
            {shelterPets.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No pets available at this shelter currently.</p>
              </div>
            ) : (
              shelterPets.map(pet => (
                <SimplePetCard key={pet.id} pet={pet} />
              ))
            )}
          </div>
        </div>

        <div className={styles.suggestedShelters}>
          <h2>Other Shelters You Might Like</h2>
          <div className={styles.shelterGrid}>
            {suggestedShelters.map(shelter => (
              <div key={shelter.id} className={styles.shelterCard}>
                <div className={styles.shelterContent}>
                  <h3 className={styles.shelterName}>{shelter.name}</h3>
                  <p className={styles.shelterAddress}>{shelter.address}</p>
                  <button
                    className={styles.knowMoreButton}
                    onClick={() => navigate(`/adopter/shelter/${shelter.id}`)}
                  >
                    View Shelter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Pets View Component
const PetsView = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Use the available pets endpoint instead of getting all pets
      const data = await fetchApi('/api/Pet/available');
      setPets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchPets} />;

  return (
    <div className={styles.petsSection}>
      <div className={styles.petGrid}>
        {pets.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No Pets Available</h2>
            <p>Check back later for new additions to our pet family!</p>
          </div>
        ) : (
          pets.map(pet => (
            <PetCard
              key={pet.id}
              pet={{
                ...pet,
                shelter: pet.shelter?.shelterName || pet.shelter?.name || 'Unknown Shelter'
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Shelters View Component
const SheltersView = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchShelters = useCallback(async () => {
      try {
      setLoading(true);
      setError(null);
      const data = await fetchApi('/api/Shelter');
        setShelters(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchShelters();
  }, [fetchShelters]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchShelters} />;

  return (
      <div className={styles.shelterGrid}>
        {shelters.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>No Shelters Available</h2>
          <p>Please check back later for partner shelters.</p>
        </div>
        ) : (
          shelters.map(shelter => (
            <div key={shelter.id} className={styles.shelterCard}>
            <div className={styles.shelterContent}>
              <h3 className={styles.shelterName}>
                {shelter.shelterName || shelter.name || 'Unnamed Shelter'}
              </h3>
              <p className={styles.shelterAddress}>
                {shelter.address || 'Address not available'}
              </p>
              <button
                className={styles.knowMoreButton}
                onClick={() => navigate(`/adopter/shelter/${shelter.id}`)}
              >
                Know More
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Combined Home View
const HomeView = () => {
  const navigate = useNavigate();

  return (
    <>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Our Shelters</h2>
          <button 
            className={styles.viewAllButton}
            onClick={() => navigate('shelters')}
          >
            View All Shelters
          </button>
        </div>
        <SheltersViewLimited />
      </section>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Available Pets</h2>
          <button 
            className={styles.viewAllButton}
            onClick={() => navigate('pets')}
          >
            View All Pets
          </button>
        </div>
        <PetsViewLimited />
      </section>
    </>
  );
};

// Limited Views for Homepage
const PetsViewLimited = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApi('/api/Pet');
      setPets(data.slice(0, 3)); // Only take first 3 pets
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchPets} />;

  return (
    <div className={styles.petsSection}>
      <div className={styles.petGrid}>
        {pets.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No Pets Available</h2>
            <p>Check back later for new additions to our pet family!</p>
          </div>
        ) : (
          pets.map(pet => (
            <PetCard
              key={pet.id}
              pet={{
                ...pet,
                shelter: pet.shelter?.shelterName || pet.shelter?.name || 'Unknown Shelter'
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

const SheltersViewLimited = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchShelters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApi('/api/Shelter');
      setShelters(data.slice(0, 3)); // Only take first 3 shelters
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShelters();
  }, [fetchShelters]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchShelters} />;

  return (
    <div className={styles.shelterGrid}>
      {shelters.length === 0 ? (
        <div className={styles.emptyState}>
        <h2>No Shelters Available</h2>
          <p>Please check back later for partner shelters.</p>
        </div>
      ) : (
        shelters.map(shelter => (
          <div key={shelter.id} className={styles.shelterCard}>
            <div className={styles.shelterContent}>
              <h3 className={styles.shelterName}>
                {shelter.shelterName || shelter.name || 'Unnamed Shelter'}
              </h3>
              <p className={styles.shelterAddress}>
                {shelter.address || 'Address not available'}
              </p>
              <button
                className={styles.knowMoreButton}
                onClick={() => navigate(`/adopter/shelter/${shelter.id}`)}
              >
                View Shelter
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Auth Check Component
const AuthCheck = () => {
  const userRole = parseInt(localStorage.getItem('userRole'));
  
  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }
  
  if (userRole !== 2) {
    return <Navigate to="/" replace />;
  }
  
  return null;
};

// Main Adaptor Component
const Adaptor = () => {
  return (
    <div className={styles.container}>
      <AuthCheck />
      <Navigation />
      <div className={styles.content}>
        <AdopterNavigation />
        <div className={styles.mainContent}>
        <Routes>
            <Route index element={<HomeView />} />
            <Route path="pets" element={<PetsView />} />
            <Route path="shelters" element={<SheltersView />} />
            <Route path="pet/:id" element={<PetDetails />} />
            <Route path="adopt/:id" element={<AdoptionForm />} />
            <Route path="shelter/:id" element={<ShelterDetails />} />
            <Route path="*" element={<Navigate to="/adopter" replace />} />
        </Routes>
        </div>
      </div>
    </div>
  );
};

export default Adaptor;
