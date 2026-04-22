export const generateOtp = (length = 6) => {
  let otp = "";
  for (let i = 0; i < length; i += 1) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
};
