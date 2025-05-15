import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import styles from '../Styles/PetDetails.module.css';

const API_BASE_URL = 'https://localhost:5001';

const PetDetails = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adoptionStatus, setAdoptionStatus] = useState({
    isSubmitting: false,
    isSubmitted: false,
    error: null
  });

  // Status mapping to match backend enum
  const statusMap = {
    0: 'Pending',
    1: 'Interview Scheduled',
    2: 'Approved',
    3: 'Rejected',
    4: 'Cancelled'
  };

  useEffect(() => {
    const fetchPetDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Pet/${petId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch pet details: ${response.status}`);
        }

        const data = await response.json();
        console.log("Pet details:", data); // Log data to inspect the structure
        setPet(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching pet details:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    // Check if user has already submitted an adoption request for this pet
    const checkExistingAdoptionRequest = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        console.log('User not authenticated, skipping adoption request check');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/Adoption/user/${userId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.warn(`Could not check existing adoption requests: ${response.status}`);
          return;
        }

        const data = await response.json();
        console.log("User adoption requests:", data);
        
        // Check if there's already a request for this pet
        const existingRequest = data.find(request => request.petId == petId);
        if (existingRequest) {
          setAdoptionStatus({
            isSubmitting: false,
            isSubmitted: true,
            error: null,
            requestStatus: existingRequest.status,
            requestId: existingRequest.id
          });
        }
      } catch (err) {
        console.error('Error checking adoption requests:', err);
      }
    };

    fetchPetDetails();
    checkExistingAdoptionRequest();
  }, [petId]);

  // Helper function to get the pet's type (category)
  const getPetType = () => {
    if (pet?.category && pet.category.name) {
      return pet.category.name;
    } else if (pet?.categoryId) {
      return `Category ${pet.categoryId}`;
    } else {
      return 'Unknown';
    }
  };

  // Helper function to get the pet's gender
  const getPetGender = () => {
    switch (pet?.gender) {
      case 0: return 'Male';
      case 1: return 'Female';
      default: return 'Unknown';
    }
  };

  // Helper function to get the shelter name
  const getShelterName = () => {
    if (pet?.shelter) {
      if (pet.shelter.name) {
        return pet.shelter.name;
      }
      if (typeof pet.shelter === 'string') {
        return pet.shelter;
      }
    }
    if (pet?.shelterId) {
      return `Shelter #${pet.shelterId}`;
    }
    return 'Unknown Shelter';
  };

  // Get adoption request status text
  const getAdoptionStatusText = () => {
    if (!adoptionStatus.requestStatus && adoptionStatus.requestStatus !== 0) {
      return null;
    }
    
    return statusMap[adoptionStatus.requestStatus] || 'Unknown';
  };

  const handleAdopt = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      // Redirect to login if user is not authenticated
      navigate('/login', { state: { from: `/adopter/pet/${petId}` } });
      return;
    }
    
    if (!pet || !pet.id) {
      setAdoptionStatus({
        ...adoptionStatus,
        error: 'Pet information is missing. Please try again.'
      });
      return;
    }
    
    setAdoptionStatus({
      ...adoptionStatus,
      isSubmitting: true,
      error: null
    });
    
    try {
      // Simplified adoption request only needs petId
      const adoptionRequest = {
        petId: pet.id
      };
      
      const response = await fetch(`${API_BASE_URL}/api/Adoption/simple`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(adoptionRequest)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to submit adoption request: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Adoption request submitted:", data);
      
      setAdoptionStatus({
        isSubmitting: false,
        isSubmitted: true,
        error: null,
        requestStatus: 0, // Pending
        requestId: data.id
      });
      
    } catch (err) {
      console.error('Error submitting adoption request:', err);
      setAdoptionStatus({
        isSubmitting: false,
        isSubmitted: false,
        error: err.message || 'An error occurred while submitting your adoption request. Please try again.'
      });
    }
  };

  const cancelAdoptionRequest = async () => {
    if (!window.confirm('Are you sure you want to cancel your adoption request?')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token || !adoptionStatus.requestId) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/Adoption/${adoptionStatus.requestId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel adoption request: ${response.status}`);
      }

      setAdoptionStatus({
        isSubmitting: false,
        isSubmitted: false,
        error: null
      });

    } catch (err) {
      console.error('Error cancelling adoption request:', err);
      setAdoptionStatus({
        ...adoptionStatus,
        error: err.message || 'Failed to cancel your request. Please try again.'
      });
    }
  };

  const handleBackToDashboard = () => {
    navigate('/adopter/pets');
  };

  const getAdoptionStatusBadgeClass = (status) => {
    switch (status) {
      case 0: return styles.statusPending;
      case 1: return styles.statusInterview;
      case 2: return styles.statusApproved;
      case 3: return styles.statusRejected;
      case 4: return styles.statusCancelled;
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.content}>
          <div className={styles.loading}>Loading pet details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.content}>
          <div className={styles.error}>
            <h3>Error Loading Pet Details</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navigation />
      <div className={styles.content}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleBackToDashboard}>
            Back to Dashboard
          </button>
        </div>

        <div className={styles.petDetails}>
          <div className={styles.imageSection}>
            <img 
              src={pet?.imageUrl || 'https://www.rescuedogvillage.com/wp-content/uploads/2023/02/image-placeholder-500x500-1.jpg'} 
              alt={pet?.name} 
              className={styles.mainImage}
            />
          </div>

          <div className={styles.infoSection}>
            <h1 className={styles.name}>{pet?.name}</h1>
            
            <div className={styles.mainInfo}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Type:</span>
                <span className={styles.value}>{getPetType()}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Breed:</span>
                <span className={styles.value}>{pet?.breed || 'Unknown'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Age:</span>
                <span className={styles.value}>{pet?.age ? `${pet.age} years` : 'Unknown'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Gender:</span>
                <span className={styles.value}>{getPetGender()}</span>
              </div>
            </div>

            <div className={styles.description}>
              <h2>About {pet?.name}</h2>
              <p>{pet?.description || 'No description available.'}</p>
            </div>

            <div className={styles.shelterInfo}>
              <h2>Shelter Information</h2>
              <div className={styles.infoItem}>
                <span className={styles.label}>Shelter:</span>
                <span className={styles.value}>{getShelterName()}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Location:</span>
                <span className={styles.value}>{pet?.shelter?.location || 'Unknown'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Contact:</span>
                <span className={styles.value}>{pet?.shelter?.phone || 'Not available'}</span>
              </div>
            </div>

            {adoptionStatus.error && (
              <div className={styles.error}>
                <p>{adoptionStatus.error}</p>
              </div>
            )}

            {adoptionStatus.isSubmitted ? (
              <div className={styles.adoptionStatus}>
                <h3>Adoption Request Submitted</h3>
                <div className={styles.statusContainer}>
                  <p>Status: <span className={`${styles.statusBadge} ${getAdoptionStatusBadgeClass(adoptionStatus.requestStatus)}`}>
                    {getAdoptionStatusText()}
                  </span></p>
                </div>
                
                {adoptionStatus.requestStatus === 0 && (
                  <div className={styles.pendingInfo}>
                    <p>Your request is being reviewed by the shelter staff. This may take 1-3 business days.</p>
                    <div className={styles.waitingIndicator}>
                      <div className={styles.waitingDot}></div>
                      <div className={styles.waitingDot}></div>
                      <div className={styles.waitingDot}></div>
                    </div>
                  </div>
                )}
                
                {adoptionStatus.requestStatus === 1 && (
                  <div className={styles.interviewInfo}>
                    <p>The shelter would like to schedule an interview with you. They will contact you shortly.</p>
                  </div>
                )}
                
                {adoptionStatus.requestStatus === 2 && (
                  <div className={styles.approvedInfo}>
                    <p>Congratulations! Your adoption request has been approved. Please contact the shelter to arrange pick-up.</p>
                  </div>
                )}
                
                {adoptionStatus.requestStatus === 3 && (
                  <div className={styles.rejectedInfo}>
                    <p>We're sorry, but your adoption request was not approved at this time. The shelter may contact you with more details.</p>
                  </div>
                )}
                
                {(adoptionStatus.requestStatus === 0 || adoptionStatus.requestStatus === 1) && (
                  <button 
                    className={`${styles.actionButton} ${styles.cancelButton}`} 
                    onClick={cancelAdoptionRequest}
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            ) : (
              <button 
                className={styles.adoptButton} 
                onClick={handleAdopt}
                disabled={adoptionStatus.isSubmitting || pet?.status !== 0} // Disable if submitting or pet is not available
              >
                {adoptionStatus.isSubmitting ? 'Submitting...' : 'Adopt Me'}
              </button>
            )}

            {pet?.status !== 0 && !adoptionStatus.isSubmitted && (
              <p className={styles.petStatusNotice}>
                This pet is {pet?.status === 1 ? 'pending adoption' : pet?.status === 2 ? 'already adopted' : 'not available for adoption'}.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetails; 