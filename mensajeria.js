const axios = require('axios');

// Reemplaza estos valores con tus credenciales y número de teléfono
const accessToken = 'EAAG05yRobDQBO7GmJ6SYAyMvw6Dr6Na9bJ6FfGBsc6iOcAo8n7nZCQoM6bSG2pvJ18Q20ZABdwWbIyU7r6qpyqasQ9O5J1zOszYEn9gfGGHqWXN2dp1wyOE7jgmIDsS4uuVeY5qUqC2TbZCJhAeKSR9jdaZCa4nuZA4yl0b26jNqR6tds1Jf9QYG6oXnMq70D0ZCqiIZAPHNGojopAAr3YZD';
const phoneNumberId = '293856593820867';

const userToken = 'EAAG05yRobDQBOycmBp4ZB9D0E9ZCt6ZBdKUNzqElowcVE4a7e24l0jrGGvuecOIQnSGbtYDx9s1PcoX4B7ktEE2iP6M1RE4Bjvm47cAZCoW9yK4QfwZBM34d72wKIpQqUQQnvaNOSxZAfBatPQddYHin2DEJsyPO04gEFtaMsdQD9w8Uc1CxZAPnKXFJnWFaNYPAQZDZD'


const sendMessage = async (recipientPhoneNumber, message) => {
    try {
      const url = `https://graph.facebook.com/v13.0/${phoneNumberId}/messages`;
      const headers = {
        'Authorization': `Bearer ${userToken}`,
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
