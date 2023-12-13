var os = require('os');
var networkInterfaces = os.networkInterfaces();
const axios = require('axios');

module.exports.register = async function() {
    try {
      //! não mandar o ip o master é que vai buscar o ip ao request
      const response = await axios.post(process.env.MAIN_SERVER+'api/slave/register', {
        pass:process.env.MAIN_SERVER_PASSWORD
      });
      // If the status is not 200, call register again after a delay

      if (response.status !== 200) {
        console.log('Retrying registration...');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
        await module.exports.register()
      }
      console.log("Registered to main server successfully: "+ response.status);
    } catch (error) {
        if(error.response.status == 409){
            console.error('Server already registration');
            return;
        }
        if(error.response)
            console.error('Error during registered', error.response.data.msg);
        console.error('Retrying registration...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await module.exports.register();
    }
  }
