const axios = require('axios');

// Reemplaza estos valores con tus credenciales y número de teléfono
const accessToken = 'EAAG05yRobDQBO5h018ZCn8qtFtAXv6qee4A5C7xtGw8JhGes8HRiRxhytp7dkKGXZC3nQV24BSotbjwahDf5cvO1WdhZAn6Jsh496BB1Wp9SEfvVB808GXDZBuVylZCUZC0dnJDnZBeYPTkcde9HIaAZA6ydUYMnvuWZAne7427R3IXZC46VXKmQDmCR7aL76yUaLtUExuUndL0VoX5opiuwZDZD';
const phoneNumberId = '372011522654298';


const sendMessage = async (recipientPhoneNumber, message) => {
    try {
      const url = `https://graph.facebook.com/v13.0/${phoneNumberId}/messages`;
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };
      const data = {
        messaging_product: 'whatsapp',
        to: recipientPhoneNumber,
        type: 'text',
        text: { body: message },
      };
  
      const response = await axios.post(url, data, { headers });
      console.log('Message sent:', response.data);
    } catch (error) {
      console.error('Error sending message:', error.response ? error.response.data : error.message);
    }
  };
  
  module.exports = { sendMessage };

// Ejemplo de uso
//sendMessage('Hola, tu cita ha sido confirmada para mañana a las 10:00 AM.');
