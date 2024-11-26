import axios from 'axios'

export class Gpt{
  constructor(request){
    this.prompt = request
  }
  
  async callGptApi() {
    const options = {
      method: 'POST',
      url: 'https://chatgpt-42.p.rapidapi.com/chatgpt',
      headers: {
        'x-rapidapi-key': '4a3a076ba9mshd30fa331b167819p19adadjsn7565b7f8f67f',
        'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
        'Content-Type': 'application/json',
      },
      data: {
        messages: [
          {
            role: 'user',
            content: this.prompt,
          },
        ],
        web_access: false,
      },
    }

    try {
      const response = await axios.request(options)
      
      return response.data
    } catch (error) {
      console.error('Error calling GPT API:', error)
    }
  }
}
