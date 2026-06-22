//

document.addEventListener("DOMContentLoaded", function () {
    const chatToggle = document.getElementById("chatbot-toggle");
    const chatWindow = document.getElementById("chat-window");
    const closeChat = document.getElementById("close-chat");
    const sendBtn = document.getElementById("send-btn");
    const userInput = document.getElementById("user-input");
    const chatBody = document.getElementById("chat-body");

    // Toggle Chatbot
    chatToggle.addEventListener("click", () => {
        chatWindow.classList.toggle("active");
    });

    // Close Chatbot
    closeChat.addEventListener("click", () => {
        chatWindow.classList.remove("active");
    });

    // Send Message
    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    function sendMessage() {
        const message = userInput.value.trim().toLowerCase();
        if (message === "") return;

        appendMessage("You", userInput.value);
        userInput.value = "";

        setTimeout(() => {
            const reply = getResponse(message);
            appendMessage("AI", reply);
        }, 1000); // Simulate AI processing delay
    }

    function getResponse(message) {
        const responses = {
            //Small Talk
            "hi": "Hello! How can I assist you today?",
            "hello": "Hi there! 😊",
            "hey": "Hey! How can I help you?",
            "how are you?": "I'm just a chatbot, but I'm here to help!",
            "what's up?": "Not much, just waiting to assist you!",
            "bye": "Goodbye! Take care. 😊",
            "goodbye": "See you soon! Have a great day!",
            "thanks": "You're welcome! 😊",
            "thank you": "Happy to help! Let me know if you need anything else.",
            "who are you?": "I'm an AI assistant here to help you with your queries.",
            "what can you do?": "I can answer general questions, provide health insights, and more!",
            
            //General Knowledge Queries
            "what is ai?": "AI stands for Artificial Intelligence. It enables machines to learn and make decisions.",
            "who invented ai?": "AI has been developed over decades, but pioneers like Alan Turing and John McCarthy played major roles.",
            "what is the capital of india?": "The capital of India is New Delhi.",
            "who is the prime minister of india?": "As of now, the Prime Minister of India is Narendra Modi.",
            "how many continents are there?": "There are 7 continents: Asia, Africa, North America, South America, Antarctica, Europe, and Australia.",
            "tell me a joke": "Why don't skeletons fight each other? Because they don’t have the guts! 😂",
            "what is the weather today?": "I can't check real-time weather yet, but you can check a weather website like weather.com!",
            
            //Regular / Everyday Queries
            "what is the time?": "I don't have a clock, but you can check your device for the time! ⏰",
            "set an alarm": "I can't set alarms yet, but you can use your phone's clock app!",
            "open google": "You can open Google by typing 'www.google.com' in your browser.",
            "how to make coffee?": "To make coffee: 1) Boil water, 2) Add coffee powder, 3) Pour hot water, 4) Stir and enjoy!",
            
            //Healthcare / Medical Queries
            "how does healthlink ai work?": "HealthLink AI analyzes health reports and symptoms using advanced AI algorithms.",
            "analyze my health report": "Sure! Upload your health report, and I will process it.",
            "how to stay healthy?": "Eat a balanced diet, exercise regularly, sleep well, and stay hydrated! 💪",
            "what are symptoms of covid?": "Common symptoms include fever, cough, sore throat, and difficulty breathing.",
            "how to reduce fever?": "Rest, stay hydrated, take paracetamol if needed, and consult a doctor if it persists.",
            "what are home remedies for cough?": "Try honey with warm water, ginger tea, or steam inhalation.",
            "how much water should I drink daily?": "It’s recommended to drink around 8 glasses (2 liters) of water daily.",
            "what is blood pressure?": "Blood pressure is the force of blood pushing against your artery walls. Normal BP is around 120/80 mmHg.",
            "what is normal body temperature?": "The average body temperature is around 98.6°F (37°C).",
            "what is diabetes?": "Diabetes is a condition where blood sugar levels are too high due to insulin issues.",
            "how to control diabetes?": "Maintain a healthy diet, exercise regularly, monitor blood sugar levels, and take prescribed medication.",
            "what is bmi?": "BMI (Body Mass Index) is a measure of body fat based on height and weight.",
            "how to calculate bmi?": "BMI = weight (kg) / height² (m²). A BMI between 18.5 and 24.9 is considered normal.",
            
            //Emergency / First Aid Queries
            "what to do in a heart attack?": "Call emergency services immediately, chew aspirin if advised, and stay calm.",
            "how to do cpr?": "Place hands on the chest, push hard and fast, and give rescue breaths if trained.",
            "what to do for a burn?": "Cool the burn under running water for 10-15 minutes, avoid ice, and cover it with a clean cloth.",
            "how to treat a cut?": "Clean with water, apply pressure to stop bleeding, and cover with a bandage.",
            "what to do for a sprain?": "Rest, apply ice, compress with a bandage, and keep the affected area elevated.",

            // 🔹 General Health Talk
    "i am feeling sick": "I'm sorry to hear that. Could you tell me your symptoms?",
    "i am not feeling well": "That sounds tough. What's bothering you?",
    "i have a headache": "Try drinking water, resting, and avoiding bright screens. If it persists, consult a doctor.",
    "i have a fever": "Make sure to stay hydrated, rest well, and take paracetamol if needed. Seek medical attention if the fever is high.",
    "i feel tired all the time": "Fatigue can be due to lack of sleep, stress, or poor diet. Make sure to rest and eat nutritious food.",
    "why do i feel dizzy?": "Dizziness can be due to dehydration, low blood pressure, or lack of sleep. Try drinking water and resting.",
    "i am feeling stressed": "I'm here for you. Try deep breathing, meditation, or listening to calming music.",
    "how can i sleep better?": "Try maintaining a regular sleep schedule, avoiding screens before bed, and drinking warm milk or herbal tea.",
    "i am feeling anxious": "You're not alone. Try deep breathing, meditation, or talking to a friend about it.",
    
    // 🔹 Diet & Nutrition
    "what should i eat for a balanced diet?": "A balanced diet includes protein, healthy fats, fiber, and vitamins. Include fruits, vegetables, and whole grains.",
    "is drinking coffee healthy?": "Coffee in moderation can be good for alertness, but too much caffeine may cause anxiety or sleep issues.",
    "how much protein do i need daily?": "It depends on your activity level, but generally, 0.8-1.2 grams per kg of body weight is recommended.",
    "what are some healthy snacks?": "Try nuts, yogurt, fruits, hummus with veggies, or dark chocolate for a healthy snack.",
    "can i lose weight fast?": "Healthy weight loss takes time. Focus on a balanced diet and regular exercise rather than quick fixes.",
    "is skipping breakfast bad?": "Skipping breakfast isn't ideal. A nutritious breakfast fuels your body for the day.",
    
    // 🔹 Medical & Symptoms Discussion
    "i have a cough for a week": "Persistent coughs may need medical attention. Try warm water, honey, and steam inhalation.",
    "my stomach hurts": "It could be due to gas, indigestion, or an infection. Try drinking warm water or lying down comfortably.",
    "my throat is sore": "Gargle with warm salt water, drink warm tea with honey, and avoid cold drinks.",
    "i feel nauseous": "Try sipping on ginger tea, staying hydrated, and resting. If it persists, consult a doctor.",
    "i have body pain": "It might be due to stress, dehydration, or overexertion. Try resting and hydrating.",
    "i have a cold": "Stay warm, drink lots of fluids, and get enough rest. A hot shower may also help relieve congestion.",
    "how can i boost my immunity?": "Eat more fruits, get enough sleep, exercise regularly, and manage stress.",
    
    // 🔹 Chronic Illnesses & Precautions
    "i have diabetes, what should i do?": "Monitor your blood sugar levels, eat a balanced diet, exercise, and follow your doctor's advice.",
    "how to lower cholesterol?": "Eat fiber-rich foods, exercise regularly, avoid processed foods, and stay hydrated.",
    "i have high blood pressure": "Reduce salt intake, exercise regularly, and manage stress. Avoid smoking and excessive caffeine.",
    "what are early signs of heart problems?": "Chest pain, shortness of breath, fatigue, and dizziness can be early signs. Consult a doctor if you experience these.",
    
    // 🔹 Women's Health
    "i have period cramps": "Try a heating pad, drink warm herbal tea, and do light stretching.",
    "how can i reduce pms symptoms?": "Exercise, reduce caffeine intake, and eat a balanced diet with plenty of water.",
    "is it normal to have irregular periods?": "Occasional irregularities are common, but if it's frequent, consult a doctor.",
    
    // 🔹 Mental Health & Well-being
    "i feel lonely": "I'm here to talk! Try reaching out to friends or engaging in hobbies that make you happy.",
    "how to deal with depression?": "It's important to talk to someone you trust, practice self-care, and seek professional help if needed.",
    "how can i stay positive?": "Focus on gratitude, surround yourself with positivity, and practice mindfulness daily.",
    
    // 🔹 First Aid & Emergency
    "i got a small cut, what should i do?": "Clean the cut with water, apply antiseptic, and cover it with a bandage.",
    "i burned my hand, what now?": "Run cool water over the burn for 10-15 minutes and apply aloe vera or burn cream.",
    "what to do if someone faints?": "Lay them down, elevate their legs, and check their breathing. If they don’t wake up, seek medical help immediately.",
    
    // 🔹 Fallback Response
    "default": "I'm here to help! Could you describe your health concern in more detail?"

        
        };
    
        return responses[message] || responses["default"];
    }
    

    function appendMessage(sender, message) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message", sender.toLowerCase());
        msgDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
});




//menu
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

menuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("active");

    // Toggle between hamburger (☰) and close (✖)
    if (navLinks.classList.contains("active")) {
        menuToggle.innerHTML = "&times;"; // Cross icon
    } else {
        menuToggle.innerHTML = "&#9776;"; // Hamburger icon
    }
});

// Close menu when a link is clicked
document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", function () {
        navLinks.classList.remove("active");
        menuToggle.innerHTML = "&#9776;"; // Reset to hamburger
    });
});
