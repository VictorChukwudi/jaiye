export const generateSecret = () => {
  const secret = (100000 + Math.floor(Math.random() * 900000)).toString();
  return secret;
};
// generateSecret();
