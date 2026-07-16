/**
 * ============================================
 * HEALTHLINK - DASHBOARD INTERACTIONS
 * ============================================
 * Handles chatbot functionality, menu toggle,
 * and other interactive elements.
 * ============================================
 */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // ============================================
    // DOM ELEMENTS
    // ============================================

    const chatToggle = document.getElementById("chatbot-toggle");
    const chatWindow = document.getElementById("chat-window");
    const closeChat = document.getElementById("close-chat");
    const sendBtn = document.getElementById("send-btn");
    const userInput = document.getElementById("user-input");
    const chatBody = document.getElementById("chat-body");
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    // ============================================
    // CHATBOT FUNCTIONALITY
    // ============================================

    /**
     * Toggle chat window visibility
     */
    chatToggle.addEventListener("click", function () {
        const isActive = chatWindow.classList.toggle("active");
        chatToggle.setAttribute("aria-expanded", isActive);
        if (isActive) {
            userInput.focus();
        }
    });

    /**
     * Close chat window
     */
    closeChat.addEventListener("click", function () {
        chatWindow.classList.remove("active");
        chatToggle.setAttribute("aria-expanded", "false");
    });

    /**
     * Send message on button click
     */
    sendBtn.addEventListener("click", sendMessage);

    /**
     * Send message on Enter key
     */
    userInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    });

    /**
     * Send user message and get AI response
     */
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === "") return;

        // Display user message
        appendMessage("You", message);
        userInput.value = "";
        userInput.focus();

        // Show typing indicator
        const typingIndicator = showTypingIndicator();

        // Simulate AI response delay
        setTimeout(() => {
            // Remove typing indicator
            typingIndicator.remove();

            // Get AI response
            const reply = getResponse(message.toLowerCase());
            appendMessage("AI", reply);
        }, 800 + Math.random() * 600);
    }

    /**
     * Show typing indicator in chat
     * @returns {HTMLElement} The typing indicator element
     */
    function showTypingIndicator() {
        const typingDiv = document.createElement("div");
        typingDiv.classList.add("message", "ai", "typing-indicator");
        typingDiv.innerHTML = `<strong>AI:</strong> <span class="dots">...</span>`;
        chatBody.appendChild(typingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        return typingDiv;
    }

    /**
     * Get AI response based on user message
     * @param {string} message - User message
     * @returns {string} AI response
     */
    function getResponse(message) {
        const responses = {
            // ===== GREETINGS =====
            "hi": "Hello! 👋 How can I assist you with your health today?",
            "hello": "Hi there! 😊 I'm here to help with any health questions.",
            "hey": "Hey! 🙌 What health concern can I help with?",
            "good morning": "Good morning! 🌅 Hope you're feeling well today.",
            "good evening": "Good evening! 🌙 How can I help you?",
            "how are you?": "I'm functioning perfectly! 💻 How are you feeling today?",
            "what's up?": "Just waiting to help you with your health questions! 🏥",
            "bye": "Goodbye! Take care of yourself. 🌟",
            "goodbye": "See you soon! Have a healthy day! 😊",
            "thanks": "You're welcome! 🤗 Stay healthy!",
            "thank you": "Happy to help! 💚 Remember, I'm here anytime.",
            
            // ===== ABOUT =====
            "who are you?": "I'm HealthLink AI 🤖 - your digital health assistant. I can answer health questions, provide wellness tips, and more!",
            "what can you do?": "I can:\n• Answer health questions\n• Provide wellness tips\n• Help with symptoms\n• Give diet advice\n• Share health information\nWhat would you like to know? 🤔",
            "what is healthlink?": "HealthLink is an AI-powered healthcare platform that connects patients with doctors, provides health insights, and helps manage appointments. 🏥",
            
            // ===== HEALTH & WELLNESS =====
            "how to stay healthy": "Great question! 🌿 Stay healthy with:\n• Eat a balanced diet 🥗\n• Exercise 30 mins daily 🏃\n• Sleep 7-8 hours 😴\n• Stay hydrated 💧\n• Manage stress 🧘\n• Regular check-ups 🏥",
            "healthy tips": "Here are some health tips: 🌟\n• Eat more fruits & vegetables\n• Limit processed foods\n• Stay physically active\n• Practice mindfulness\n• Get enough rest",
            
            // ===== SYMPTOMS =====
            "fever": "For fever: 🌡️\n• Rest and stay hydrated\n• Take paracetamol if needed\n• Monitor temperature\n• See a doctor if it persists above 102°F",
            "headache": "For headaches: 🤕\n• Rest in a quiet room\n• Stay hydrated\n• Use cold compress\n• Limit screen time\n• Consider OTC pain relief if needed",
            "cold": "For colds: 🤧\n• Stay warm\n• Drink warm fluids\n• Get plenty of rest\n• Use steam inhalation\n• Honey and lemon helps!",
            "cough": "For coughs: 😷\n• Drink warm water\n• Honey with tea\n• Steam inhalation\n• Avoid cold foods\n• Consult doctor if persistent",
            
            // ===== DIET & NUTRITION =====
            "diet": "A balanced diet includes: 🍽️\n• Protein (meat, beans, nuts)\n• Fruits & vegetables\n• Whole grains\n• Healthy fats\n• Stay hydrated 💧",
            "water": "Stay hydrated! 💧 Drink 8 glasses (2L) of water daily. More if you exercise or in hot weather!",
            "protein": "Good protein sources: 🥩\n• Lean meat\n• Fish\n• Eggs\n• Beans\n• Nuts\n• Tofu\nAim for 0.8-1.2g per kg body weight!",
            
            // ===== EMERGENCIES =====
            "heart attack": "🚨 EMERGENCY! Call emergency services immediately. While waiting:\n• Keep person calm\n• Sit them down\n• Give aspirin if prescribed\n• Don't leave them alone",
            "cpr": "CPR steps: 🫀\n1. Call emergency services\n2. Place hands on chest center\n3. Push hard and fast (100-120/min)\n4. Give rescue breaths if trained",
            "burn": "For burns: 🔥\n• Cool under running water (10-15 min)\n• Don't use ice\n• Cover with clean cloth\n• Seek medical help for severe burns",
            
            // ===== MENTAL HEALTH =====
            "stress": "For stress: 😌\n• Deep breathing exercises\n• Meditation or mindfulness\n• Take breaks\n• Talk to someone\n• Regular exercise helps! 🧘",
            "anxiety": "For anxiety: 🌸\n• Practice deep breathing\n• Grounding techniques\n• Talk to a friend\n• Get professional help if needed\nYou're not alone! 💚",
            "depression": "💚 Depression is serious. Please:\n• Talk to someone you trust\n• Seek professional help\n• Call a helpline\n• Practice self-care\n• You matter! 🌟",
            
            // ===== FALLBACK =====
            "default": "I'm here to help! 🤗 Could you tell me more about your health concern? Feel free to ask about symptoms, diet, wellness, or any health topic!"
        };

        // Check for exact match
        if (responses[message]) {
            return responses[message];
        }

        // Check for keyword matches
        const keywords = {
            "symptom": "I'd love to help with symptoms! 🤔 Could you describe your symptoms in more detail?",
            "pain": "I understand you're in pain. 😔 Can you tell me more about the location and intensity?",
            "doctor": "When in doubt, always consult a doctor! 🏥 Would you like help finding one?",
            "medicine": "Always consult a doctor before taking medicine! 💊 I can provide general information though.",
            "sleep": "Good sleep is essential! 😴 Try: regular schedule, no screens before bed, and a calm environment.",
            "exercise": "Exercise is great! 🏋️ Aim for 30 minutes daily. Start slow and build up gradually.",
            "covid": "For COVID concerns: 🦠\n• Monitor symptoms\n• Get tested\n• Follow health guidelines\n• Consult a doctor if symptoms persist",
            "blood pressure": "Normal BP is around 120/80 mmHg. 💉 Monitor regularly and consult your doctor for concerns.",
            "diabetes": "Diabetes management: 🩸\n• Monitor blood sugar\n• Healthy diet\n• Regular exercise\n• Take prescribed medication\n• Regular check-ups",
        };

        for (const [key, value] of Object.entries(keywords)) {
            if (message.includes(key)) {
                return value;
            }
        }

        return responses.default;
    }

    /**
     * Append a message to the chat
     * @param {string} sender - 'You' or 'AI'
     * @param {string} message - Message content
     */
    function appendMessage(sender, message) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message", sender.toLowerCase());
        
        // Handle line breaks in message
        const formattedMessage = message.replace(/\n/g, '<br>');
        msgDiv.innerHTML = `<strong>${sender}:</strong> ${formattedMessage}`;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // ============================================
    // MOBILE MENU TOGGLE
    // ============================================

    /**
     * Toggle mobile navigation menu
     */
    menuToggle.addEventListener("click", function () {
        const isActive = navLinks.classList.toggle("active");
        this.setAttribute("aria-expanded", isActive);
        
        // Toggle icon between hamburger and close
        const icon = this.querySelector("i");
        if (isActive) {
            icon.className = "fas fa-times";
        } else {
            icon.className = "fas fa-bars";
        }
    });

    /**
     * Close menu when a link is clicked
     */
    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", function () {
            navLinks.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
            const icon = menuToggle.querySelector("i");
            icon.className = "fas fa-bars";
        });
    });

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================

    /**
     * Ctrl+Shift+C to toggle chat
     */
    document.addEventListener("keydown", function (e) {
        if (e.ctrlKey && e.shiftKey && e.key === "C") {
            e.preventDefault();
            chatToggle.click();
        }
    });

    /**
     * Escape key to close chat
     */
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && chatWindow.classList.contains("active")) {
            chatWindow.classList.remove("active");
            chatToggle.setAttribute("aria-expanded", "false");
        }
    });

    console.log("🏥 HealthLink Dashboard initialized successfully!");
});