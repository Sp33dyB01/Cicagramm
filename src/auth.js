const USERS_KEY = "users";

export function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

export function registerUser(email, username, password) {
  const users = getUsers();

  if (users.find(u => u.email === email)) {
    return false;
  }

  users.push({ email, username, password });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
}

export function loginUser(email, username, password) {
  const users = getUsers();
  return users.find(
    u => u.email === email && u.username === username && u.password === password
  );
}
