import { useState } from 'react';
import { api } from '../src/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = isSignup
        ? await api.post('/auth/signup', { name, email, password })
        : await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message || 'Failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center">TaskFlow {isSignup ? 'Sign up' : 'Login'}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {isSignup && (
              <input className="input input-bordered w-full" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
            )}
            <input className="input input-bordered w-full" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <input className="input input-bordered w-full" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            {error && <div className="text-error text-sm">{error}</div>}
            <div className="card-actions mt-2">
              <button type="submit" className="btn btn-primary w-full">{isSignup ? 'Create account' : 'Login'}</button>
            </div>
          </form>
          <button type="button" className="btn btn-ghost btn-sm" onClick={()=>setIsSignup(!isSignup)}>
            {isSignup ? 'Have an account? Login' : 'New here? Create account'}
          </button>
        </div>
      </div>
    </div>
  );
}
