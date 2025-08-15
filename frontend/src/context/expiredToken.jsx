import { jwtDecode } from 'jwt-decode';

export function isTokenExpired(token) {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch (err) {
    return true;
  }
}