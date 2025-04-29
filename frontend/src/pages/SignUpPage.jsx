import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { User, Lock, MessageSquare, Loader } from 'lucide-react'; // Assuming you need these icons
import { Link } from 'react-router-dom';
import AuthImagePattern from '../Components/AuthImagePattern';
import toast from 'react-hot-toast';


const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const { signup, isSigningUp } = useAuthStore();

  // Validate form fields
  const validateForm = () => {
    if(!formData.fullName.trim()) return toast.error("Full name is required");
    if(!formData.email.trim()) return toast.error("Email is required");
    if(!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if(!formData.password) return toast.error("Password is required");
    if(formData.password.length<6) return toast.error("Password must be at least 6 characters");

    if (!formData.fullName || !formData.email || !formData.password) {
      return "All fields are required";
    }
    if (formData.password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return true; // No validation errors
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success==true) {
     signup(formData);
    }

   // Call signup from the store
  };

  return (
    <div className='min-h-screen grid lg:grid-cols-2'>
      <div className='flex flex-col justify-center items-center p-6 sm:p-12'>
        <div className='w-full max-w-md space-y-8'>
          <div className='text-center mb-8'>
            <div className='flex flex-col items-center gap-2 group'>
              <div className='size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                <MessageSquare className="size-6 text-primary"/>
              </div>
              <h1 className='text-2xl font-bold mt-2'>Create Account</h1>
              <p className='text-base-content/60'>Get Started with your free account</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='form-control'>
              <label className='label'>
                <span className='label-text font-medium'>Full Name</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <User className="size-5 text-base-content/40"/>
                </div>
                <input 
                  type="text"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div className='form-control'>
              <label className='label'>
                <span className='label-text font-medium'>Email</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <User className="size-5 text-base-content/40"/>
                </div>
                <input 
                  type="email"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className='form-control'>
              <label className='label'>
                <span className='label-text font-medium'>Password</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className="size-5 text-base-content/40"/>
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <div
                  className="absolute right-2 top-2 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className='form-control'>
              <button 
                type="submit" 
                className="btn btn-primary w-full"
                disabled={isSigningUp}
              >
                {isSigningUp ?(<><Loader2 className="size-5 animate-spin"/>Loading...</>):("create Account") }
              </button>
            </div>
          </form>
          <div className='text-center'>
            <p className='text-base-content/60'>
            Already have an account?{" "}
            <Link to="/login" className="link link-primary">
            Sign in
            </Link>

            </p>

          </div>
        </div>
      </div>
      <AuthImagePattern title="Join our community"
      subtitle="Connect with friends, share moments, and stay in touch"/>
    </div>
  );
};

export default SignUpPage;
