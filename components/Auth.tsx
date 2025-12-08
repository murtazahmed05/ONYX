import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Card } from './UIComponents';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // Auto-login happens on success, but we can show a message briefly or let App.tsx handle the state change
        setSuccessMsg("Account created successfully!");
      }
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);
      let msg = "An error occurred.";
      
      // Handle specific Firebase errors
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = isLogin 
          ? "Incorrect email or password. If you are new, please Create an Account first." 
          : "Could not create account with these credentials.";
      } else if (err.code === 'auth/email-already-in-use') {
        msg = "This email is already registered. Please Sign In instead.";
      } else if (err.code === 'auth/weak-password') {
        msg = "Password should be at least 6 characters.";
      } else if (err.code === 'auth/invalid-email') {
        msg = "Please enter a valid email address.";
      } else if (err.code === 'auth/network-request-failed') {
        msg = "Network error. Please check your internet connection.";
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccessMsg(null);
    // Optional: Clear fields or keep them
  };

  return (
    <div className="min-h-screen bg-onyx-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-onyx-900 border-onyx-800 p-8 shadow-2xl relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neutral-800 via-white to-neutral-800 opacity-20"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tighter mb-2">ONYX.</h1>
          <p className="text-neutral-500 text-sm">Synchronized Productivity</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-200 p-3 rounded-lg flex items-start gap-2 text-sm mb-6 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-900/20 border border-green-900/50 text-green-200 p-3 rounded-lg flex items-center gap-2 text-sm mb-6 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={16} />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-onyx-950 border border-onyx-800 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-onyx-950 border border-onyx-800 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center pt-4 border-t border-onyx-800">
          <p className="text-neutral-500 text-sm mb-2">
            {isLogin ? "New to Onyx?" : "Have an account?"}
          </p>
          <button 
            onClick={toggleMode}
            className="text-sm font-medium text-white hover:underline transition-all"
          >
            {isLogin ? "Create an Account" : "Sign In to existing account"}
          </button>
        </div>
      </Card>
    </div>
  );
};