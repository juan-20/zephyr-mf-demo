import { useSession } from '@repo/store';

export default function UserMenu() {
  const user = useSession((s) => s.user);
  const logout = useSession((s) => s.logout);
  if (!user) return null;
  return (
    <span style={{ display: 'inline-flex', gap: 12, alignItems: 'center' }}>
      Signed in as <strong>{user.username}</strong>
      <button onClick={() => void logout()}>Log out</button>
    </span>
  );
}
