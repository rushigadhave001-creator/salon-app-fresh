
export const sendNotification = async (
  name: string,
  mobile: string,
  type: "15min_alert" | "booking_confirmation" | "turn_now",
  token: string
) => {
  const message = {
    "15min_alert": `Hi ${name}, your turn for token #${token} is approximately 15 minutes away! Please reach the salon.`,
    "booking_confirmation": `Hi ${name}, your booking for token #${token} is confirmed.`,
    "turn_now": `Hi ${name}, it's your turn now (Token #${token})! Please proceed to the chair.`
  }[type];

  // Mock implementation for local testing
  console.log(`[NOTIFICATION MOCK] To: ${mobile} | Message: ${message}`);

  // Future implementation:
  // if (process.env.WHATSAPP_API_URL) {
  //   await fetch(process.env.WHATSAPP_API_URL, { ... })
  // }

  return true;
};
