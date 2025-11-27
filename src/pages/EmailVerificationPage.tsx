import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const token = searchParams.get('token');

  const verifyEmailMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      setVerificationStatus('success');
      toast.success('Email verified successfully!');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    },
    onError: (error: any) => {
      setVerificationStatus('error');
      toast.error(error.response?.data?.message || 'Email verification failed');
    }
  });

  useEffect(() => {
    if (!token) {
      setVerificationStatus('error');
      return;
    }

    // Auto-verify email when component mounts
    verifyEmailMutation.mutate(token);
  }, [token]);

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
              <LoadingSpinner size="md" className="text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-secondary-900">
              Verifying Your Email
            </h2>
            <p className="mt-2 text-sm text-secondary-600">
              Please wait while we verify your email address...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-secondary-900">
              Email Verified!
            </h2>
            <p className="mt-2 text-sm text-secondary-600">
              Your email has been successfully verified. You can now access all features of your account.
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Account Activated</span>
              </div>
              
              <p className="text-sm text-secondary-600">
                Welcome to OpusLab! You will be redirected to your dashboard in a few seconds.
              </p>
              
              <div className="border-t pt-4">
                <Link
                  to="/dashboard"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-secondary-900">
            Verification Failed
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            {!token 
              ? 'No verification token found in the URL.'
              : 'This verification link is invalid or has expired.'
            }
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Verification Failed</span>
            </div>
            
            <p className="text-sm text-secondary-600">
              Email verification links are only valid for 24 hours for security reasons.
              {user ? ' You can request a new verification email from your profile.' : ' Please try signing up again or contact support if the problem persists.'}
            </p>
            
            <div className="space-y-2">
              {user ? (
                <Link
                  to="/profile"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Go to Profile
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Sign Up Again
                  </Link>
                  
                  <Link
                    to="/login"
                    className="w-full flex justify-center py-2 px-4 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Back to Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;