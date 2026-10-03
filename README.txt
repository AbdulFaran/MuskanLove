FARHAN & MUSKAN LOVE APP v3

Features:
- Welcome screen with Farhan/Muskan JPG photos in public/
- Registration and login
- Automatic private Search Code (FM-XXXXXX)
- Search another registered user by code
- Real-time chat through Socket.IO
- Real-time WebRTC voice/video calling with signaling server
- AI Assistant chat; AI response is broadcast to both connected phones and each phone reads it aloud with browser speech synthesis
- Mic/camera controls during calls

Run:
1. Install Node.js 18+.
2. In this folder run: npm install
3. Run: npm start
4. Open http://localhost:3000

For two phones on the same Wi-Fi, run the server on a computer and open the computer's LAN IP on both phones. Camera/microphone access may require HTTPS on non-localhost addresses.

For internet-wide calls, deploy the Node server to a HTTPS host and use a TURN server for networks where STUN alone cannot connect.

AI voice uses the phone/browser speech engine. It does not require an API key and the response is delivered to both logged-in call/chat participants.
