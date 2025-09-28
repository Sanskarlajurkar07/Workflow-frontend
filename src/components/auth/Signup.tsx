import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, User, Mail, Lock, ArrowRight, Github, Chrome } from 'lucide-react';

export const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add signup logic here
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#17252A] via-[#2B7A78] to-[#17252A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-[#3AAFA9]/20">
          <div className="flex items-center justify-center mb-8">
            <Brain className="w-10 h-10 text-[#3AAFA9]" />
            <span className="text-2xl font-bold bg-gradient-to-r from-[#3AAFA9] to-[#DEF2F1] bg-clip-text text-transparent ml-2">
              FlowMind AI
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-6 text-center">Create your account</h2>

          {/* OAuth2 Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => window.location.href = 'http://localhost:8000/api/auth/google/login'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
            >
              <Chrome className="w-5 h-5" />
              Sign up with Google
            </button>

            <button
              onClick={() => window.location.href = 'http://localhost:8000/api/auth/github/login'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
            >
              <Github className="w-5 h-5" />
              Sign up with GitHub
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#3AAFA9]/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#17252A] text-[#DEF2F1]">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#DEF2F1] mb-2">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#DEF2F1]/70" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-[#3AAFA9]/30 rounded-lg py-2 pl-10 pr-4 text-black placeholder-[#DEF2F1]/50 focus:outline-none focus:ring-2 focus:ring-[#3AAFA9] focus:border-transparent"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#DEF2F1] mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#DEF2F1]/70" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-[#3AAFA9]/30 rounded-lg py-2 pl-10 pr-4 text-black placeholder-[#DEF2F1]/50 focus:outline-none focus:ring-2 focus:ring-[#3AAFA9] focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#DEF2F1] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#DEF2F1]/70" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-[#3AAFA9]/30 rounded-lg py-2 pl-10 pr-4 text-black placeholder-[#DEF2F1]/50 focus:outline-none focus:ring-2 focus:ring-[#3AAFA9] focus:border-transparent"
                  placeholder="Choose a strong password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#3AAFA9]/30 text-[#3AAFA9] focus:ring-[#3AAFA9]"
                required
              />
              <label className="ml-2 block text-sm text-[#DEF2F1]">
                I agree to the{' '}
                <a href="#" className="text-[#3AAFA9] hover:text-[#DEF2F1]">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#3AAFA9] hover:text-[#DEF2F1]">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            >
              Create account
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#DEF2F1]/70">
            Already have an account?{' '}
            <Link to="/login" className="text-[#3AAFA9] hover:text-[#DEF2F1] font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};