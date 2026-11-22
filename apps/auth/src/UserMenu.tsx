import { useSession } from '@repo/store';

export default function UserMenu() {
  const user = useSession((s) => s.user);
  const logout = useSession((s) => s.logout);
  if (!user) return null;
  return (
    <span className="user-menu">
      <span>
        <span className="user-menu__label">Signed in as </span>
        <strong>{user.username}</strong>
      </span>
      <button className="btn btn--ghost" onClick={() => void logout()}>
        Log out
      </button>
    </span>
  );
}
