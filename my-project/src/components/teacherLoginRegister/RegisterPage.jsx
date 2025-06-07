// pages/RegisterPage.jsx 
import React, { useState, useContext } from "react";
import { Link, useNavigate ,useLocation} from "react-router-dom";
import { ThemeContext } from '../../DarkLightMood/ThemeContext';
import ThemeToggle from '../../DarkLightMood/ThemeToggle';
import FormInput from '../FormInput';
import Button from '../Button';
import Alert from '../Alert';
import Footer from "../../layout/Footer";
import SharedHeader from "../../layoutForEducatorsAndStudents/SharedHeader";
import { ThemeProvider } from "../../DarkLightMood/ThemeContext";
import { UserProvider } from "../../context/UserContext";
// This component implements a two-step registration page for students and teachers,
const RegisterPage = () => {
  const { theme } = useContext(ThemeContext);
   // Get current theme (dark/light) from context
  const isDark = theme === 'dark';
  const location = useLocation();
  const navigate = useNavigate();
  // Determine user role from URL query string (default: student)
   const searchParams = new URLSearchParams(location.search);
  const role = searchParams.get("role") || "student";
   // Form state for user input fields
  const [form, setForm] = useState({
    username: '',
    id: '',
    email: '',
    password: ''
  });
  // State for profile picture (Base64), skip flag, loading, error, and step
  const [profilePicBase64, setProfilePicBase64] = useState("");
  const [skipProfilePic, setSkipProfilePic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1 = basic info, 2 = profile pic


 // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError(""); // Clear error when user starts typing
  };
   // Handle profile picture file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setError("Image is too large. Please upload an image under 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicBase64(reader.result);
        setSkipProfilePic(false); // Disable skip if image uploaded
      };
      reader.readAsDataURL(file);
    }
  };
   // Handle skip profile picture
  const handleSkipProfilePic = () => {
    setSkipProfilePic(true);
    setProfilePicBase64("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    
    // Internal function for email validation
    const isValidEmail = (email) => /^[^\s@]+@gmail\.com$/.test(email);
      // Step 1: Validate basic info
    if (step === 1) {
      // Validate all fields
      if (!form.username || !form.id || !form.email || !form.password) {
        setError("Please fill in all required fields.");
        return;
      }
      if (!isValidEmail(form.email)) {
        setError("Please enter a valid Gmail address (@gmail.com).");
        return;
      }
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (!/^\d{9}$/.test(form.id)) {
        setError("ID must be exactly 9 digits.");
        return;
      }
      
      // Move to next step
      setStep(2);// Move to profile picture step
      return;
    }
    
    // Step 2: Require profile picture or skip
    if (!profilePicBase64 && !skipProfilePic) {
      setError("Please select a profile picture or choose to skip");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
       // Use default placeholder if skipping profile picture
      const profilePicToSend = skipProfilePic ? 
        "default_empty_profile_pic" : 
        profilePicBase64;
      // Send registration request 
      const response = await fetch(
        role === "teacher"
          ? "http://localhost:5000/api/teachers/register"
          : "http://localhost:5000/api/students/register",
        {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...form, 
          profilePic: profilePicToSend,
          useDefaultProfilePic: skipProfilePic 
        }),
      });

      if (response.ok) {
         // Registration successful, redirect to login page
        const savedStudent = await response.json();
        setError("");
        const loginPage = role === "teacher" ? "/login" : "/student-login";
        setTimeout(() => navigate(loginPage), 2500);
      } else {
        // Show error message from server
        const errorData = await response.json();
        setError(errorData.message || "Registration failed");
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
      setError("Registration error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
   // Go back to previous step (basic info)
  const goBack = () => {
    setStep(1);
    setError(""); // Clear any errors when going back
  };

  return (
  <div className={`min-h-screen w-screen flex flex-col ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-900'}`}>
    
      {/* Header */}
      <div className="px-4 mt-4">
        <SharedHeader />
      </div>

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 w-full">
        <div className={`max-w-md w-full space-y-8 ${isDark ? 'bg-slate-800' : 'bg-white'} p-10 rounded-xl shadow-lg`}>
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold">Create your account</h2>
            <p className="mt-2 text-center text-sm">
              Already have an account?{' '}
              <Link to="/student-login" className="font-medium text-blue-500 hover:text-blue-600">
                Sign in
              </Link>
            </p>
          </div>
             {/* Error Alert */}
          {error && <Alert type="error" message={error} />}
            {/* Stepper Progress Indicator */}
          <div className="flex justify-center">
            <div className="w-full">
              <div className="flex items-center w-full mb-6">
                <div className={`flex-1 border-t-2 ${step >= 1 ? 'border-blue-500' : 'border-gray-300'}`}></div>
                <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 mx-2 font-bold text-sm
                  ${step >= 1 ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 text-gray-500'}`}>
                  1
                </div>
                <div className={`flex-1 border-t-2 ${step >= 2 ? 'border-blue-500' : 'border-gray-300'}`}></div>
                <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 mx-2 font-bold text-sm
                  ${step >= 2 ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 text-gray-500'}`}>
                  2
                </div>
                <div className={`flex-1 border-t-2 ${step >= 3 ? 'border-blue-500' : 'border-gray-300'}`}></div>
              </div>
              
              <h3 className="text-center font-medium text-xl mb-6">
                {step === 1 ? 'Basic Information' : 'Profile Picture'}
              </h3>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {step === 1 ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium mb-1">
                        Username
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Enter username"
                        value={form.username}
                        onChange={handleChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="id" className="block text-sm font-medium mb-1">
                        ID
                      </label>
                      <input
                        id="id"
                        name="id"
                        type="text"
                        placeholder="Enter your 9-digit ID"
                        value={form.id}
                        onChange={handleChange}
                        maxLength="9"
                        pattern="[0-9]{9}"
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium mb-1">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Create a password (min 6 characters, include letters)"
                        value={form.password}
                        onChange={handleChange}
                        minLength="6"
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                    
                  </div>
                ) : (
                   // Step 2: Profile Picture Upload/Skip
                  <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center">
                      <label className="block text-sm font-medium mb-4">Profile Picture</label>
                          {/* If skipped, show placeholder and change option */}
                      {skipProfilePic ? (
                        <div className="mb-4 relative">
                          <div className={`w-40 h-40 rounded-full border-4 ${isDark ? 'border-slate-600 bg-slate-700' : 'border-gray-300 bg-gray-200'} flex items-center justify-center overflow-hidden`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-24 w-24 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="absolute top-0 right-0 bg-yellow-500 text-white rounded-full p-1 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSkipProfilePic(false)}
                            className="mt-2 text-sm text-blue-500 hover:text-blue-700"
                          >
                            Change
                          </button>
                        </div>
                      ) : profilePicBase64 ? (
                         // If picture uploaded, show preview and remove option
                        <div className="mb-4 relative">
                          <img
                            src={profilePicBase64}
                            alt="Profile preview"
                            className="w-40 h-40 object-cover rounded-full border-4 border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setProfilePicBase64("")}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-lg"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                            // No picture yet: show upload area
                        <div className={`mb-4 w-40 h-40 flex items-center justify-center rounded-full border-4 border-dashed ${isDark ? 'border-slate-600' : 'border-gray-300'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-20 w-20 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                       
                      <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <label className={`cursor-pointer px-4 py-2 rounded-md ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition`}>
                          <span>Select image</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        
                        <button
                          type="button"
                          onClick={handleSkipProfilePic}
                          className={`px-4 py-2 rounded-md ${isDark ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-300 hover:bg-gray-400'} transition`}
                        >
                          Skip for now
                        </button>
                      </div>
                      
                      {skipProfilePic && (
                        <p className={`mt-3 text-sm text-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          A default blank profile picture will be used. You can add your photo later.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4">
                  {step > 1 ? (
                    <Button
                      type="button"
                      onClick={goBack}
                      variant="secondary"
                    >
                      Back
                    </Button>
                  ) : (
                    <div></div>
                  )}
                  
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    variant="primary"
                    className={`${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={isLoading}
                    >
                  
                    {step === 1 ? 'Continue' : 'Register'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const RegisterWrapper = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <RegisterPage />
      </UserProvider>
    </ThemeProvider>
  );
};

export default RegisterWrapper;
