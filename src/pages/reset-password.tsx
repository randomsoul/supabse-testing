import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/supabaseClient';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setConfirmed(true);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setError(error.message);
    } else {
      alert('Password updated! You can now log in.');
      window.location.href = '/login';
    }
  };

  return (
    <div>
      <h2>Reset Your Password</h2>
      {confirmed ? (
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit">Update Password</button>
          {error && <p>{error}</p>}
        </form>
      ) : (
        <p>Loading reset form...</p>
      )}
    </div>
  );
};

export default ResetPassword;
