# 🤖 ChatBot

This is a simple ChatBot application built using Python. It integrates with external APIs (like OpenAI) to generate intelligent responses. The application is designed for ease of use, modularity, and future scalability.

## Features

- Command-line chatbot interface  
- Uses external API (e.g., OpenAI GPT)  
- Secure API key management with `.env` file  
- Easily extendable and modular  

## Installation

1. Clone the repository  
   Open your terminal or CMD and run:  
   git clone https://github.com/Mandadapu-Kinnera/ChatBot.git  
   cd ChatBot

3. Create a virtual environment (optional but recommended)  
   python -m venv venv  
   venv\Scripts\activate   (for Windows)  

4. Install the required dependencies  
   pip install -r requirements.txt  

## Setup Environment Variables

Create a file named `.env` in the root directory and paste your API keys:  
OPENAI_API_KEY=your_openai_api_key_here 
FLASK_API_KEY=your_flask_api_key_here

> Never share your `.env` file publicly. It is already included in `.gitignore`.

## Running the Bot

Once installed, start the chatbot using:  
python app.py  

Interact with the chatbot directly in the terminal.

## Files Included

- app.py – Main chatbot logic  
- requirements.txt – All dependencies  
- .env – Add your API key here (not uploaded to GitHub)  
- .gitignore – Files to ignore in version control  
- README.md – You're reading it!  

## Notes

- Ensure internet access is available.  
- API responses depend on key and plan (free/premium).  
- Edit `app.py` to modify chatbot behavior.  

## Author

Made by Mandadapu Kinnera (https://github.com/Mandadapu-Kinnera)

